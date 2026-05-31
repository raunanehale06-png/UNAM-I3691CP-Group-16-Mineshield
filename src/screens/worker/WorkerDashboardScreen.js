import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { deleteField, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';

import AlertBanner from '../../components/alerts/AlertBanner';
import FallConfirmationModal from '../../components/alerts/FallConfirmationModal';
import NotificationCard from '../../components/alerts/NotificationCard';
import AppMenuModal from '../../components/navigation/AppMenuModal';
import Button from '../../components/common/Button';
import FloatingOrb from '../../components/common/FloatingOrb';
import InputField from '../../components/common/InputField';
import ScreenScrollView from '../../components/common/ScreenScrollView';
import {
  SupervisorIconBadge,
  SupervisorMenuButton,
  SupervisorNavBadge,
} from '../../components/supervisor/SupervisorNavigationChrome';
import { useAppSettings, useI18n } from '../../contexts/AppSettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import useAlerts from '../../hooks/useAlerts';
import useLocation from '../../hooks/useLocation';
import useNoiseMonitoring from '../../hooks/useNoiseMonitoring';
import useSensors from '../../hooks/useSensors';
import { useOfflineQueueStatus } from '../../hooks/useOfflineQueueStatus';
import useWorkerHazards from '../../hooks/useWorkerHazards';
import { auth, db } from '../../services/firebase';
import { broadcastWorkerSOS } from '../../services/workerEmergencyService';
import { clearSessionRouteState } from '../../services/sessionRouteService';
import {
  buildInlineImageDataUriFromAsset,
  canUseInlineStorageFallback,
  getStorageServerResponse,
  getStorageUserMessage,
  getStringByteSize,
  uploadProfileImage,
} from '../../services/storageService';
import { normalizeFullName } from '../../utils/accountDisplay';

const LIVE_LOCATION_SYNC_INTERVAL_MS = 15000;
const LIVE_LOCATION_CHANGE_THRESHOLD = 0.00005;
const MAX_INLINE_PROFILE_IMAGE_BYTES = 500 * 1024;

const hasLiveCoordinates = (locationStatus) =>
  typeof locationStatus?.latitude === 'number' && typeof locationStatus?.longitude === 'number';

const hasMovedEnough = (previousLocation, nextLocation) => {
  if (!previousLocation) {
    return true;
  }

  return (
    Math.abs(previousLocation.latitude - nextLocation.latitude) >= LIVE_LOCATION_CHANGE_THRESHOLD ||
    Math.abs(previousLocation.longitude - nextLocation.longitude) >= LIVE_LOCATION_CHANGE_THRESHOLD
  );
};

const isInlineImageUri = (value) =>
  typeof value === 'string' && value.startsWith('data:image/');

const formatAccountDate = (value, locale, fallbackLabel) => {
  if (!value) {
    return fallbackLabel;
  }

  const date =
    typeof value?.toDate === 'function'
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallbackLabel;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
};

export default function WorkerDashboardScreen({ navigation }) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const { liveLocationEnabled, maskEmail } = useAppSettings();
  const { width: screenWidth } = useWindowDimensions();
  const compactLayout = screenWidth < 390;
  const styles = useMemo(() => createStyles(theme, compactLayout), [theme, compactLayout]);
  const { alerts, loading: alertsLoading } = useAlerts({ limit: 3 });
  const latestAlert = alerts[0] || null;
  const { hazards: liveHazards, loading: hazardsLoading } = useWorkerHazards({ limit: 3 });
  const { pendingCount } = useOfflineQueueStatus();
  const locationStatus = useLocation();
  const handleTriggerSOS = useCallback(() => {
    navigation.navigate('SOSAlertScreen');
  }, [navigation]);
  const isLoggingOutRef = useRef(false);
  const handleAutomaticNoiseSOS = useCallback(
    async ({ levelDb, percent, label } = {}) => {
      if (isLoggingOutRef.current) {
        return null;
      }

      try {
        const locationData = hasLiveCoordinates(locationStatus)
          ? {
              source: 'gps-live',
              latitude: locationStatus.latitude,
              longitude: locationStatus.longitude,
              label: locationStatus.label || locationStatus.value || 'GPS live',
              area: locationStatus.label || locationStatus.value || 'GPS live',
            }
          : null;

        const result = await broadcastWorkerSOS({
          source: 'noise',
          locationData,
          noiseLevelDb: levelDb,
          noiseLevelPercent: percent,
        });

        Alert.alert(
          'Automatic SOS sent',
          `Unsafe noise reached ${typeof percent === 'number' ? `${percent}%` : label || 'an unsafe level'} and the alert was sent to supervisors and on-duty workers.`
        );

        return result;
      } catch (error) {
        console.error('Automatic noise SOS failed:', error);
        Alert.alert(
          'Automatic SOS failed',
          error?.message || 'We could not send the automatic SOS right now.'
        );
        throw error;
      }
    },
    [
      locationStatus.latitude,
      locationStatus.label,
      locationStatus.longitude,
      locationStatus.value,
    ]
  );
  const handleCriticalFallSOS = useCallback(
    async () => {
      if (isLoggingOutRef.current) {
        return null;
      }

      try {
        const locationData = hasLiveCoordinates(locationStatus)
          ? {
              source: 'gps-live',
              latitude: locationStatus.latitude,
              longitude: locationStatus.longitude,
              label: locationStatus.label || locationStatus.value || 'GPS live',
              area: locationStatus.label || locationStatus.value || 'GPS live',
            }
          : null;

        const result = await broadcastWorkerSOS({
          source: 'critical-fall',
          locationData,
        });

        Alert.alert(
          'Emergency SOS sent',
          'A critical fall was detected and supervisors plus on-duty workers were notified immediately.'
        );

        return result;
      } catch (error) {
        console.error('Critical fall SOS failed:', error);
        Alert.alert(
          'Emergency SOS failed',
          error?.message || 'We could not send the emergency SOS right now.'
        );
        throw error;
      }
    },
    [
      locationStatus.latitude,
      locationStatus.label,
      locationStatus.longitude,
      locationStatus.value,
    ]
  );
  const {
    stepsStatus,
    batteryStatus,
    fallDetected,
    fallCountdown,
    confirmOkay,
    escalateNow,
  } = useSensors({
    onCriticalFallDetected: handleCriticalFallSOS,
    triggerSOS: handleTriggerSOS,
  });

  const [displayName, setDisplayName] = useState(t('common.worker'));
  const [fullNameInput, setFullNameInput] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [workerRole, setWorkerRole] = useState(t('common.worker'));
  const [joinedAtLabel, setJoinedAtLabel] = useState(t('common.notAvailable'));
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [profileMediaImage, setProfileMediaImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [accountSaving, setAccountSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(t('workerDashboard.info.help'));
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [noiseMonitoringEnabled, setNoiseMonitoringEnabled] = useState(true);
  const [noiseMonitoringSaving, setNoiseMonitoringSaving] = useState(false);
  const profileImage = profileMediaImage || userProfileImage || null;
  const { noiseStatus } = useNoiseMonitoring({
    enabled: !profileLoading && noiseMonitoringEnabled,
    autoSOSThreshold: 70,
    onAutomaticSOS: handleAutomaticNoiseSOS,
  });
  const lastLocationSyncRef = useRef({
    latitude: null,
    longitude: null,
    at: 0,
  });

  useEffect(() => {
    setActiveInfoModal(t('workerDashboard.info.help'));
  }, [t]);

  useEffect(() => {
    if (!fallDetected) {
      return undefined;
    }

    const countdownValue = Math.max(0, Number(fallCountdown) || 0);

    if (countdownValue <= 0) {
      return undefined;
    }

    const countdownText =
      countdownValue === 1
        ? t('workerDashboard.sensorAlert.voiceCountdownOne', {}, '1 second remaining.')
        : t(
            'workerDashboard.sensorAlert.voiceCountdown',
            { seconds: countdownValue },
            `${countdownValue} seconds remaining.`
          );
    const introText = t(
      'workerDashboard.sensorAlert.voiceIntro',
      {},
      'Possible fall detected.'
    );
    const announcementText = `${introText} ${countdownText}`;

    AccessibilityInfo.announceForAccessibility(announcementText);

    return undefined;
  }, [fallCountdown, fallDetected, locale, t]);

  const renderStatusIcon = (routeKey, color, backgroundColor = `${color}22`) => (
    <SupervisorIconBadge
      backgroundColor={backgroundColor}
      borderColor={color}
      color={color}
      routeKey={routeKey}
      style={styles.statusIconBadge}
    />
  );

  const persistSelectedProfileImage = async (selectedAsset) => {
    try {
      setAccountSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('You need to be signed in to update your profile picture.');
      }

      const uploadedProfileUrl = await uploadProfileImage(selectedAsset, currentUser.uid);
      const userMediaDocRef = doc(db, 'user_media', currentUser.uid);
      await setDoc(
        userMediaDocRef,
        {
          profilePicture: uploadedProfileUrl,
          profilePictureMode: 'storage',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await updateProfile(currentUser, {
        photoURL: uploadedProfileUrl,
      });

      setUserProfileImage(uploadedProfileUrl);
      setProfileMediaImage(uploadedProfileUrl);
      Alert.alert('Profile Updated', t('workerDashboard.profile.photoSaved'));
    } catch (error) {
      const currentUser = auth.currentUser;
      const inlineProfileImage = await buildInlineImageDataUriFromAsset(selectedAsset, {
        maxBytes: MAX_INLINE_PROFILE_IMAGE_BYTES,
      });
      const inlineProfileImageSize = getStringByteSize(inlineProfileImage);
      const canFallbackInline =
        currentUser &&
        canUseInlineStorageFallback(error, inlineProfileImage) &&
        inlineProfileImageSize > 0 &&
        inlineProfileImageSize <= MAX_INLINE_PROFILE_IMAGE_BYTES;

      if (canFallbackInline) {
        try {
          const userMediaDocRef = doc(db, 'user_media', currentUser.uid);
          await setDoc(
            userMediaDocRef,
            {
              profilePicture: inlineProfileImage,
              profilePictureMode: 'inline',
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          setProfileMediaImage(inlineProfileImage);
          Alert.alert('Profile Updated', t('workerDashboard.profile.photoSavedCompat'));
          return;
        } catch (fallbackError) {
          console.error('Inline profile image fallback failed:', fallbackError);
        }
      }

      console.error('Profile image save failed:', {
        code: error?.code,
        message: error?.message,
        serverResponse: getStorageServerResponse(error),
        inlineProfileImageSize,
      });

      Alert.alert(
        'Profile Update Failed',
        getStorageUserMessage(error, 'We could not save your profile picture right now.')
      );
    } finally {
      setAccountSaving(false);
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (
      isLoggingOutRef.current ||
      !liveLocationEnabled ||
      !currentUser?.uid ||
      !hasLiveCoordinates(locationStatus)
    ) {
      return;
    }

    const nextLocation = {
      latitude: locationStatus.latitude,
      longitude: locationStatus.longitude,
    };
    const lastLocationSync = lastLocationSyncRef.current;
    const waitedLongEnough = Date.now() - lastLocationSync.at >= LIVE_LOCATION_SYNC_INTERVAL_MS;

    if (
      !hasMovedEnough(lastLocationSync.latitude !== null ? lastLocationSync : null, nextLocation) &&
      !waitedLongEnough
    ) {
      return;
    }

    lastLocationSyncRef.current = {
      ...nextLocation,
      at: Date.now(),
    };

    const workerName =
      fullNameInput.trim() ||
      currentUser.displayName ||
      currentUser.email?.split('@')[0] ||
      t('common.worker');
    const liveLocationLabel = locationStatus.label || locationStatus.value;

    setDoc(
      doc(db, 'users', currentUser.uid),
      {
        uid: currentUser.uid,
        email: currentUser.email || profileEmail || '',
        fullName: workerName,
        role: workerRole || t('common.worker'),
        roleKey: 'worker',
        latitude: nextLocation.latitude,
        longitude: nextLocation.longitude,
        locationLabel: liveLocationLabel,
        location: {
          source: 'gps-live',
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
          label: liveLocationLabel,
        },
        locationUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        workerStatus: 'On-Duty',
      },
      { merge: true }
    ).catch((error) => {
      console.error('Unable to sync worker live location:', error);
    });
  }, [
    fullNameInput,
    liveLocationEnabled,
    locationStatus.label,
    locationStatus.latitude,
    locationStatus.longitude,
    locationStatus.value,
    profileEmail,
    t,
    workerRole,
  ]);

  useEffect(() => {
    let unsubscribeUser = () => {};
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);

      unsubscribeUser = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const inlineProfileImage = isInlineImageUri(userData.profilePicture)
              ? userData.profilePicture
              : null;
            const resolvedFullName =
              userData.fullName ||
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              t('common.worker');

            if (userData.fullName) {
              setDisplayName(userData.fullName.split(' ')[0]);
            } else {
              setDisplayName(resolvedFullName.split(' ')[0]);
            }

            setFullNameInput(resolvedFullName);
            setProfileEmail(userData.email || currentUser.email || t('common.notAvailable'));
            setWorkerRole(userData.role || t('common.worker'));
            setNoiseMonitoringEnabled(
              typeof userData.noiseMonitoringEnabled === 'boolean'
                ? userData.noiseMonitoringEnabled
                : true
            );
            setJoinedAtLabel(formatAccountDate(userData.createdAt, locale, t('common.notAvailable')));

            if (inlineProfileImage) {
              const profileMediaDocRef = doc(db, 'user_media', currentUser.uid);

              setUserProfileImage(currentUser.photoURL || null);
              setProfileMediaImage((currentImage) => currentImage || inlineProfileImage);

              setDoc(
                profileMediaDocRef,
                {
                  profilePicture: inlineProfileImage,
                  profilePictureMode: 'inline',
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              )
                .then(() =>
                  setDoc(
                    userDocRef,
                    {
                      profilePicture: deleteField(),
                      profilePictureMode: deleteField(),
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  )
                )
                .catch((error) => {
                  console.error('Failed migrating inline profile image out of users document:', error);
                });
            } else {
              setUserProfileImage(userData.profilePicture || currentUser.photoURL || null);
            }
          } else if (currentUser.email) {
            const resolvedFullName = currentUser.displayName || currentUser.email.split('@')[0];

            setDisplayName(currentUser.email.split('@')[0]);
            setFullNameInput(resolvedFullName);
            setProfileEmail(currentUser.email);
            setWorkerRole(t('common.worker'));
            setNoiseMonitoringEnabled(true);
            setJoinedAtLabel(t('common.notAvailable'));
            setUserProfileImage(currentUser.photoURL || null);
          }

          setProfileLoading(false);
        },
        (error) => {
          console.error('Error streaming user snapshot profile:', error);
          setProfileLoading(false);
        }
      );
    }

    return () => unsubscribeUser();
  }, [locale, t]);

  useEffect(() => {
    let unsubscribeMedia = () => {};
    const currentUser = auth.currentUser;

    if (currentUser) {
      const profileMediaDocRef = doc(db, 'user_media', currentUser.uid);

      unsubscribeMedia = onSnapshot(
        profileMediaDocRef,
        (docSnap) => {
          const mediaData = docSnap.data() ?? {};
          setProfileMediaImage(mediaData.profilePicture || null);
        },
        (error) => {
          console.error('Error streaming user profile media snapshot:', error);
        }
      );
    }

    return () => unsubscribeMedia();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restorePendingImageSelection = async () => {
      try {
        const pendingResult = await ImagePicker.getPendingResultAsync();
        const pendingAsset = pendingResult?.canceled ? null : pendingResult?.assets?.[0];

        if (isMounted && pendingAsset?.uri) {
          await persistSelectedProfileImage(pendingAsset);
        }
      } catch (error) {
        console.error('Unable to restore pending profile image selection:', error);
      }
    };

    restorePendingImageSelection();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('common.permissionRequired'), t('workerDashboard.profile.photoPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      quality: 0.4,
    });

    const selectedAsset = result.assets?.[0];

    if (!result.canceled && selectedAsset?.uri) {
      await persistSelectedProfileImage(selectedAsset);
    }
  };

  const handleSaveAccountSettings = async () => {
    const normalizedName = normalizeFullName(fullNameInput);

    if (!normalizedName) {
      Alert.alert('Name Required', t('workerDashboard.profile.nameRequired'));
      return;
    }

    try {
      setAccountSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error(t('workerDashboard.profile.notSignedIn'));
      }

      const userDocRef = doc(db, 'users', currentUser.uid);

      await setDoc(
        userDocRef,
        {
          email: currentUser.email || profileEmail || '',
          fullName: normalizedName,
          role: workerRole || t('common.worker'),
          roleKey: 'worker',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await updateProfile(currentUser, {
        displayName: normalizedName,
      });

      setDisplayName(normalizedName.split(' ')[0]);
      Alert.alert('Settings Updated', t('workerDashboard.profile.saveSuccess'));
    } catch (error) {
      Alert.alert(
        t('common.updateFailed'),
        error?.message || t('workerDashboard.profile.saveError')
      );
    } finally {
      setAccountSaving(false);
    }
  };

  const handleToggleNoiseMonitoring = async (nextEnabled) => {
    if (noiseMonitoringSaving) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser?.uid) {
      Alert.alert(t('common.updateFailed'), 'You need to be signed in to change this setting.');
      return;
    }

    const previousValue = noiseMonitoringEnabled;
    setNoiseMonitoringEnabled(nextEnabled);
    setNoiseMonitoringSaving(true);

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          noiseMonitoringEnabled: nextEnabled,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Unable to persist noise monitoring preference:', error);
      setNoiseMonitoringEnabled(previousValue);
      Alert.alert(
        t('common.updateFailed'),
        'We could not update the noise detector setting right now.'
      );
    } finally {
      setNoiseMonitoringSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      isLoggingOutRef.current = true;
      setMenuVisible(false);
      setProfileModalVisible(false);

      const currentUser = auth.currentUser;

      if (currentUser?.uid) {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid),
            {
              workerStatus: 'Off-Duty',
              offDuty: true,
              signal: 'Offline',
              updatedAt: serverTimestamp(),
              locationUpdatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (statusError) {
          console.warn('Unable to persist worker off-duty status during logout:', statusError);
        }
      }

      clearSessionRouteState();
      await signOut(auth);
    } catch (error) {
      Alert.alert('Logout Error', t('workerDashboard.profile.logoutError'));
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  const handleOpenHelp = () => {
    setMenuVisible(false);
    setActiveInfoModal({
      ...t('workerDashboard.info.help'),
      sections: [
        ...t('workerDashboard.info.help.sections'),
        {
          heading: t('workerDashboard.myStatus'),
          body: [
            `${t('workerDashboard.status.fallDetection')}: ${fallDetected ? t('workerDashboard.status.fallDetected') : t('workerDashboard.status.fallMonitoring')} (${fallDetected ? `${t('workerDashboard.sensorAlert.countdownLabel')} ${fallCountdown}s` : t('workerDashboard.status.accelerometer')})`,
            `${t('workerDashboard.status.steps')}: ${stepsStatus.value} (${stepsStatus.hint})`,
            `${t('workerDashboard.status.battery')}: ${batteryStatus.value} (${batteryStatus.hint})`,
            `${t('workerDashboard.status.noise')}: ${noiseStatus.value} (${noiseStatus.hint})`,
            `${t('workerDashboard.status.location')}: ${locationStatus.value} (${locationStatus.hint})`,
          ].join('\n'),
        },
      ],
    });
    setInfoModalVisible(true);
  };

  const handleOpenAbout = () => {
    setMenuVisible(false);
    setActiveInfoModal(t('workerDashboard.info.about'));
    setInfoModalVisible(true);
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return { bg: theme.colors.warningSoft, badge: theme.colors.warning };
      case 'MEDIUM':
        return { bg: theme.colors.warningSoft, badge: theme.colors.warningStrong };
      case 'LOW':
      default:
        return { bg: theme.colors.primarySoft, badge: theme.colors.primaryDeep };
    }
  };

  const getReportStatusTheme = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'resolved':
        return { bg: theme.colors.successSoft, badge: theme.colors.success, label: t('workerDashboard.status.resolved').toUpperCase() };
      case 'critical':
        return { bg: theme.colors.dangerSoft, badge: theme.colors.danger, label: t('workerDashboard.status.critical').toUpperCase() };
      case 'active':
        return { bg: theme.colors.warningSoft, badge: theme.colors.warningStrong, label: t('workerDashboard.status.active').toUpperCase() };
      case 'reported':
      default:
        return { bg: theme.colors.primarySoft, badge: theme.colors.primaryDeep, label: t('workerDashboard.status.reported').toUpperCase() };
    }
  };

  const getNoiseTheme = (noiseValue, noiseHint) => {
    if (String(noiseValue || '').toLowerCase() === 'off') {
      return { bg: theme.colors.surfaceAlt, badge: theme.colors.textSoft };
    }

    switch (String(noiseHint || '').toLowerCase()) {
      case 'loud':
        return { bg: theme.colors.dangerSoft, badge: theme.colors.danger };
      case 'moderate':
        return { bg: theme.colors.warningSoft, badge: theme.colors.warningStrong };
      case 'quiet':
        return { bg: theme.colors.successSoft, badge: theme.colors.success };
      default:
        return { bg: theme.colors.surfaceAlt, badge: theme.colors.textSoft };
    }
  };
  const noiseTheme = getNoiseTheme(noiseStatus.value, noiseStatus.hint);
  const fallTheme = fallDetected
    ? { bg: theme.colors.dangerSoft, badge: theme.colors.danger }
    : { bg: theme.colors.warningSoft, badge: theme.colors.warningStrong };

  const statusCards = [
    {
      key: 'fall',
      label: t('workerDashboard.status.fallDetection'),
      value: fallDetected
        ? t('workerDashboard.status.fallDetected')
        : t('workerDashboard.status.fallMonitoring'),
      hint: fallDetected
        ? `${t('workerDashboard.sensorAlert.countdownLabel')} ${fallCountdown}s`
        : t('workerDashboard.status.fallHint'),
      icon: renderStatusIcon('fall', fallTheme.badge, fallTheme.bg),
    },
    {
      key: 'steps',
      label: t('workerDashboard.status.steps'),
      value: stepsStatus.value,
      hint: stepsStatus.hint,
      icon: renderStatusIcon('steps', theme.colors.warningStrong, theme.colors.warningSoft),
    },
    {
      key: 'battery',
      label: t('workerDashboard.status.battery'),
      value: batteryStatus.value,
      hint: batteryStatus.hint,
      icon: renderStatusIcon('battery', theme.colors.success, theme.colors.successSoft),
    },
    {
      key: 'noise',
      label: t('workerDashboard.status.noise'),
      value: noiseStatus.value,
      hint: noiseStatus.hint,
      icon: renderStatusIcon('noise', noiseTheme.badge, noiseTheme.bg),
    },
    {
      key: 'location',
      label: t('workerDashboard.status.location'),
      value: locationStatus.value,
      hint: liveLocationEnabled ? locationStatus.hint : t('settings.general.liveLocation.description'),
      icon: renderStatusIcon('workerTracking', theme.colors.primaryDeep, theme.colors.primarySoft),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.colors.mode === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View style={styles.headerRow}>
        <SupervisorMenuButton onPress={() => setMenuVisible(true)} />
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.mainScrollView}
      >
        <FloatingOrb delay={350} driftX={10} driftY={10} duration={9000} style={styles.dashboardOrbOne} />
        <FloatingOrb delay={1250} driftX={8} driftY={12} duration={7600} style={styles.dashboardOrbTwo} />
        <FloatingOrb delay={1950} driftX={6} driftY={7} duration={7000} style={styles.dashboardOrbThree} />

        <View style={styles.welcomeBanner}>
          <View style={styles.avatarPlaceholder}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarActualImage} />
            ) : (
              <Text style={styles.avatarFallbackText}>W</Text>
            )}
          </View>
          <View style={styles.welcomeTextContainer}>
            {profileLoading ? (
              <ActivityIndicator
                color={theme.colors.primaryDeep}
                size="small"
                style={{ alignSelf: 'flex-start' }}
              />
            ) : (
              <Text style={styles.welcomeTitle}>
                {t('workerDashboard.greeting', { name: displayName })}
              </Text>
            )}
            <Text style={styles.welcomeSubtitle}>{t('workerDashboard.subtitle')}</Text>
          </View>
        </View>

        {pendingCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.84}
            onPress={() => navigation.navigate('MyReportsScreen')}
            style={styles.pendingSyncCard}
          >
            <SupervisorIconBadge
              backgroundColor={theme.colors.warningSoft}
              borderColor={theme.colors.warning}
              color={theme.colors.warningStrong}
              routeKey="hazardReports"
              style={styles.pendingSyncBadge}
            />
            <View style={styles.pendingSyncCopy}>
              <Text style={styles.pendingSyncTitle}>
                {pendingCount === 1
                  ? '1 hazard report waiting to sync'
                  : `${pendingCount} hazard reports waiting to sync`}
              </Text>
              <Text style={styles.pendingSyncSubtitle}>
                They will upload automatically when the connection returns.
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {latestAlert ? (
          <AlertBanner
            alert={latestAlert}
            onPress={() => navigation.navigate('NotificationScreen')}
            style={styles.alertBanner}
          />
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('workerDashboard.quickActions')}</Text>
          <View style={styles.gridRow}>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => navigation.navigate('MyReportsScreen')}
              style={[
                styles.gridButton,
                compactLayout && styles.gridButtonCompact,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              <SupervisorIconBadge
                backgroundColor={theme.colors.surface}
                borderColor={theme.colors.borderStrong}
                color={theme.colors.primaryDeep}
                routeKey="reports"
              />
              <Text style={styles.gridButtonText}>{t('workerDashboard.siteReports')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => navigation.navigate('SafetyTipsScreen')}
              style={[
                styles.gridButton,
                compactLayout && styles.gridButtonCompact,
                {
                  backgroundColor: theme.colors.warningSoft,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              <SupervisorIconBadge
                backgroundColor={theme.colors.surface}
                borderColor={theme.colors.borderStrong}
                color={theme.colors.warningStrong}
                routeKey="riskZones"
              />
              <Text style={styles.gridButtonText}>{t('workerDashboard.safetyTips')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{t('workerDashboard.liveReports')}</Text>
            <TouchableOpacity activeOpacity={0.84} onPress={() => navigation.navigate('MyReportsScreen')}>
              <Text style={styles.viewAllText}>{t('workerDashboard.openLogs')}</Text>
            </TouchableOpacity>
          </View>

          {hazardsLoading ? (
            <ActivityIndicator size="small" color={theme.colors.warning} style={styles.inlineLoader} />
          ) : liveHazards.length === 0 ? (
            <Text style={styles.emptyAlertsText}>{t('workerDashboard.liveReportsEmpty')}</Text>
          ) : (
            liveHazards.map((hazard) => {
              const palette = getReportStatusTheme(hazard.status);

              return (
                <View key={hazard.id} style={[styles.alertRow, { backgroundColor: palette.bg }]}>
                  <SupervisorIconBadge
                    backgroundColor={theme.colors.surface}
                    borderColor={theme.colors.border}
                    color={palette.badge}
                    routeKey="hazardReports"
                    style={styles.feedIconBadge}
                  />
                  <View style={styles.alertMeta}>
                    <Text numberOfLines={1} style={styles.alertTitle}>
                      {hazard.description || t('workerDashboard.status.hazardSubmitted')}
                    </Text>
                    <Text style={styles.alertSubtitle}>
                      {hazard.locationLabel || hazard.zone || t('workerDashboard.status.generalSite')} •{' '}
                      {hazard.relativeTime}
                    </Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: palette.badge }]}>
                    <Text style={styles.severityText}>{palette.label}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{t('workerDashboard.nearbyAlerts')}</Text>
            <Text style={styles.sectionMetaLabel}>{t('workerDashboard.liveFeed')}</Text>
          </View>

          {alertsLoading ? (
            <ActivityIndicator size="small" color={theme.colors.warning} style={styles.inlineLoader} />
          ) : alerts.length === 0 ? (
            <Text style={styles.emptyAlertsText}>{t('workerDashboard.nearbyAlertsEmpty')}</Text>
          ) : (
            alerts.map((item) => (
              <NotificationCard key={item.id} alert={item} compact />
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('workerDashboard.myStatus')}</Text>
          <View style={styles.statusGrid}>
            {statusCards.map((card) => {
              const isNoiseCard = card.key === 'noise';

              return (
                <View
                  key={card.key}
                  style={[
                    styles.statusCard,
                    isNoiseCard && !noiseMonitoringEnabled && styles.statusCardMuted,
                  ]}
                >
                  {isNoiseCard ? (
                    <>
                      <View style={styles.noiseCardHeader}>
                        {card.icon}
                        <View style={styles.noiseToggleBlock}>
                          <Text style={styles.noiseToggleLabel}>
                            {noiseMonitoringEnabled ? t('common.on') : t('common.off')}
                          </Text>
                          <Switch
                            disabled={noiseMonitoringSaving}
                            onValueChange={handleToggleNoiseMonitoring}
                            thumbColor={
                              noiseMonitoringEnabled
                                ? theme.colors.surface
                                : theme.colors.textSoft
                            }
                            trackColor={{
                              false: theme.colors.border,
                              true: theme.colors.primary,
                            }}
                            value={noiseMonitoringEnabled}
                          />
                        </View>
                      </View>
                      <Text style={styles.statusLabel}>{card.label}</Text>
                      <Text numberOfLines={2} style={styles.statusValue}>
                        {card.value}
                      </Text>
                      <Text numberOfLines={2} style={styles.statusHint}>
                        {card.hint}
                      </Text>
                    </>
                  ) : (
                    <>
                      {card.icon}
                      <Text style={styles.statusLabel}>{card.label}</Text>
                      <Text numberOfLines={2} style={styles.statusValue}>
                        {card.value}
                      </Text>
                      <Text numberOfLines={2} style={styles.statusHint}>
                        {card.hint}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScreenScrollView>

      <View style={styles.bottomTabBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.tabItem}>
          <SupervisorNavBadge routeKey="logout" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportHazard')}
          style={styles.tabItem}
        >
          <SupervisorNavBadge routeKey="hazardReports" />
        </TouchableOpacity>

        <View style={styles.sosContainer}>
          <TouchableOpacity
            activeOpacity={0.84}
            onPress={() => navigation.navigate('SOSAlertScreen')}
            style={styles.sosGiantButton}
          >
            <Text style={styles.sosGiantText}>SOS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('NotificationScreen')}
          style={styles.tabItem}
        >
          <SupervisorNavBadge routeKey="notifications" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setProfileModalVisible(true)}
          style={styles.tabItem}
        >
          {profileImage ? (
            <View style={styles.profileBadgeShell}>
              <Image source={{ uri: profileImage }} style={styles.profileIconMiniAvatar} />
            </View>
          ) : (
            <SupervisorNavBadge routeKey="profile" />
          )}
        </TouchableOpacity>
      </View>

      <AppMenuModal
        actions={[
          {
            key: 'help',
            onPress: handleOpenHelp,
            routeKey: 'notifications',
            title: t('menu.worker.helpTitle'),
            subtitle: t('menu.worker.helpSubtitle'),
          },
          {
            key: 'about',
            onPress: handleOpenAbout,
            routeKey: 'riskZones',
            title: t('menu.worker.aboutTitle'),
            subtitle: t('menu.worker.aboutSubtitle'),
          },
        ]}
        includeAccountActions
        includeGeneralSettings
        onClose={() => setMenuVisible(false)}
        onManageAccount={() => {
          setMenuVisible(false);
          setProfileModalVisible(true);
        }}
        onSignOut={handleLogout}
        subtitle={t('menu.worker.subtitle')}
        title={t('menu.worker.title')}
        visible={menuVisible}
      />

      <Modal
        animationType="fade"
        transparent
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.infoOverlay}>
          <Pressable style={styles.infoDismissLayer} onPress={() => setInfoModalVisible(false)} />
          <View style={styles.infoCard}>
            <Text style={styles.infoEyebrow}>{activeInfoModal.eyebrow}</Text>
            <Text style={styles.infoTitle}>{activeInfoModal.title}</Text>
            <Text style={styles.infoIntro}>{activeInfoModal.intro}</Text>

            <ScrollView
              contentContainerStyle={styles.infoContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.infoScrollView}
            >
              {activeInfoModal.sections.map((section) => (
                <View key={section.heading} style={styles.infoSection}>
                  <Text style={styles.infoSectionHeading}>{section.heading}</Text>
                  <Text style={styles.infoSectionBody}>{section.body}</Text>
                </View>
              ))}
            </ScrollView>

            <Button label={t('common.close')} onPress={() => setInfoModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.modalScrollView}
          >
            <View style={styles.modalContentCard}>
              <Text style={styles.modalHeaderTitle}>{t('workerDashboard.profile.title')}</Text>

              <TouchableOpacity
                activeOpacity={0.84}
                onPress={accountSaving ? undefined : handlePickImage}
                style={styles.modalAvatarFrame}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.modalAvatarImage} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <Text style={styles.avatarFallbackText}>W</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.modalWorkerName}>{fullNameInput || displayName}</Text>
              <Text style={styles.modalHelperText}>{t('workerDashboard.profile.helper')}</Text>

              <InputField
                editable={!accountSaving}
                label={t('workerDashboard.profile.fullName')}
                onChangeText={setFullNameInput}
                placeholder={t('auth.register.fullNamePlaceholder')}
                style={styles.fieldInput}
                value={fullNameInput}
              />

              <View style={styles.accountInfoPill}>
                <Text style={styles.accountFieldLabel}>{t('workerDashboard.profile.email')}</Text>
                <Text style={styles.accountInfoText}>
                  {maskEmail(profileEmail || t('common.notAvailable'))}
                </Text>
              </View>

              <View style={styles.accountInfoPill}>
                <Text style={styles.accountFieldLabel}>{t('workerDashboard.profile.role')}</Text>
                <Text style={styles.accountInfoText}>{workerRole}</Text>
              </View>

              <View style={styles.accountInfoPill}>
                <Text style={styles.accountFieldLabel}>{t('workerDashboard.profile.memberSince')}</Text>
                <Text style={styles.accountInfoText}>{joinedAtLabel}</Text>
              </View>

              <Button
                disabled={accountSaving}
                label={t('workerDashboard.profile.save')}
                loading={accountSaving}
                onPress={handleSaveAccountSettings}
                style={styles.modalButton}
              />
              <Button
                disabled={accountSaving}
                label={t('workerDashboard.profile.changePhoto')}
                onPress={handlePickImage}
                style={styles.modalButton}
                variant="secondary"
              />
              <Button
                disabled={accountSaving}
                label={t('workerDashboard.profile.logout')}
                onPress={handleLogout}
                style={styles.modalButton}
                variant="danger"
              />
              <Button
                disabled={accountSaving}
                label={t('workerDashboard.profile.return')}
                onPress={() => setProfileModalVisible(false)}
                style={styles.modalButtonLast}
                variant="ghost"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <FallConfirmationModal
        body={t('workerDashboard.sensorAlert.body')}
        confirmLabel={t('workerDashboard.sensorAlert.confirm')}
        countdown={fallCountdown}
        countdownHint={t(
          'workerDashboard.sensorAlert.countdownHint',
          {},
          'Auto SOS will send when the timer reaches zero.'
        )}
        countdownLabel={t('workerDashboard.sensorAlert.countdownTitle', {}, '10-second countdown')}
        escalateLabel={t('workerDashboard.sensorAlert.escalate')}
        eyebrow={t('workerDashboard.sensorAlert.eyebrow')}
        onConfirm={confirmOkay}
        onEscalate={escalateNow}
        onRequestClose={confirmOkay}
        title={t('workerDashboard.sensorAlert.title')}
        visible={fallDetected}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme, compactLayout) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.screen,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    headerSpacer: {
      width: 42,
      height: 42,
    },
    mainScrollView: {
      flex: 1,
    },
    scrollContainer: {
      position: 'relative',
      overflow: 'hidden',
      paddingHorizontal: theme.spacing.screen,
      paddingTop: theme.spacing.xs,
      paddingBottom: 42,
    },
    dashboardOrbOne: {
      position: 'absolute',
      top: 22,
      right: -20,
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: theme.colors.brandBlueSoft,
    },
    dashboardOrbTwo: {
      position: 'absolute',
      top: 238,
      left: -18,
      width: 66,
      height: 66,
      borderRadius: 33,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.12),
    },
    dashboardOrbThree: {
      position: 'absolute',
      top: 118,
      right: 92,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.16),
    },
    welcomeBanner: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 5,
    },
    avatarPlaceholder: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      backgroundColor: theme.colors.brandBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarActualImage: {
      width: '100%',
      height: '100%',
      borderRadius: 32.5,
    },
    avatarFallbackText: {
      color: theme.colors.brandBlueDeep,
      fontSize: 24,
      fontWeight: '800',
    },
    welcomeTextContainer: {
      flex: 1,
      marginLeft: theme.spacing.lg,
    },
    welcomeTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    welcomeSubtitle: {
      color: theme.colors.textSoft,
      fontSize: 14,
      marginTop: 2,
    },
    pendingSyncCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.warningSoft,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 4,
    },
    pendingSyncBadge: {
      marginRight: theme.spacing.md,
    },
    pendingSyncCopy: {
      flex: 1,
    },
    pendingSyncTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 4,
    },
    pendingSyncSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    alertBanner: {
      marginBottom: theme.spacing.lg,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 5,
    },
    sectionHeader: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    viewAllText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    sectionMetaLabel: {
      color: theme.colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    emptyAlertsText: {
      color: theme.colors.textSoft,
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 10,
      lineHeight: 20,
    },
    gridRow: {
      flexDirection: compactLayout ? 'column' : 'row',
      justifyContent: 'space-between',
    },
    gridButton: {
      flex: compactLayout ? 0 : 0.485,
      borderRadius: theme.radii.lg,
      minHeight: 86,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },
    gridButtonCompact: {
      marginBottom: theme.spacing.sm,
      width: '100%',
    },
    gridButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginLeft: theme.spacing.sm,
      flex: 1,
      lineHeight: 20,
      textTransform: 'uppercase',
    },
    inlineLoader: {
      paddingVertical: 10,
    },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    alertMeta: {
      flex: 1,
    },
    alertTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    alertSubtitle: {
      color: theme.colors.textSoft,
      fontSize: 12,
      marginTop: 2,
    },
    feedIconBadge: {
      marginRight: theme.spacing.md,
    },
    severityBadge: {
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minWidth: 70,
      alignItems: 'center',
    },
    severityText: {
      color: theme.colors.surface,
      fontSize: 11,
      fontWeight: '800',
    },
    statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: compactLayout ? 'flex-start' : 'space-between',
    },
    statusCard: {
      width: compactLayout ? '100%' : '48.2%',
      minHeight: compactLayout ? 120 : 136,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceAlt,
    },
    statusCardMuted: {
      opacity: 0.88,
    },
    statusIconBadge: {
      minWidth: 48,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    noiseCardHeader: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    noiseToggleBlock: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginLeft: 12,
    },
    noiseToggleLabel: {
      color: theme.colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    statusLabel: {
      color: theme.colors.textSoft,
      fontSize: 10,
      marginBottom: 4,
      textAlign: 'center',
    },
    statusValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 16,
    },
    statusHint: {
      color: theme.colors.textFaint,
      fontSize: 10,
      marginTop: 4,
      textAlign: 'center',
      lineHeight: 14,
    },
    bottomTabBar: {
      minHeight: 88,
      backgroundColor: theme.colors.backgroundAlt,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 12,
    },
    tabItem: {
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileBadgeShell: {
      minWidth: 46,
      height: 36,
      paddingHorizontal: 10,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileIconMiniAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    sosContainer: {
      top: -25,
      height: 90,
      width: 90,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sosGiantButton: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.backgroundAlt,
    },
    sosGiantText: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    infoOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.screen,
      paddingVertical: 24,
    },
    infoDismissLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    infoCard: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '82%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      overflow: 'hidden',
    },
    infoEyebrow: {
      color: theme.colors.warning,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    infoTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 10,
    },
    infoIntro: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      marginBottom: theme.spacing.md,
    },
    infoScrollView: {
      flexGrow: 0,
      flexShrink: 1,
      minHeight: 0,
      marginBottom: 8,
    },
    infoContent: {
      paddingBottom: 8,
      flexGrow: 1,
    },
    infoSection: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    infoSectionHeading: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 6,
    },
    infoSectionBody: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
    },
    modalScrollView: {
      flex: 1,
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.screen,
      paddingVertical: 24,
    },
    modalContentCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    modalHeaderTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: theme.spacing.md,
    },
    modalAvatarFrame: {
      marginBottom: theme.spacing.md,
    },
    modalAvatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    modalAvatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: theme.colors.brandBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalWorkerName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalHelperText: {
      color: theme.colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    fieldInput: {
      marginBottom: theme.spacing.sm,
      width: '100%',
    },
    accountInfoPill: {
      width: '100%',
      backgroundColor: theme.colors.surfaceAlt,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    accountFieldLabel: {
      color: theme.colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    accountInfoText: {
      color: theme.colors.text,
      fontSize: 13,
    },
    modalButton: {
      width: '100%',
      marginTop: theme.spacing.xs,
    },
    modalButtonLast: {
      width: '100%',
      marginTop: theme.spacing.xs,
      marginBottom: 0,
    },
  });
