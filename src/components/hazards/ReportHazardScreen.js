import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { serverTimestamp } from 'firebase/firestore';

import FloatingOrb from '../../components/common/FloatingOrb';
import { auth } from '../../services/firebase';
import { addAlert, addHazard, updateHazard } from '../../services/firestoreService';
import {
  saveToOfflineQueue,
  syncOfflineHazardQueue,
} from '../../services/offlineService';
import {
  buildManualLocation,
  formatSelectedLocation,
  geocodeLocationLabel,
  getCurrentGpsLocation,
} from '../../services/locationService';
import {
  buildInlineImageDataUriFromAsset,
  canUseInlineStorageFallback,
  getStringByteSize,
  uploadImage,
} from '../../services/storageService';
import colors, { withAlpha } from '../../styles/colors';

const getUserLabel = (currentUser) => {
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }

  if (currentUser?.email) {
    return currentUser.email.split('@')[0];
  }

  return 'Worker';
};

const buildAlertBody = (description) => {
  const trimmedDescription = description.trim();

  if (trimmedDescription.length <= 90) {
    return trimmedDescription;
  }

  return `${trimmedDescription.slice(0, 87)}...`;
};

const MAX_INLINE_HAZARD_IMAGE_BYTES = 500 * 1024;

const severityOptions = ['LOW', 'MEDIUM', 'HIGH'];

const getSeverityAccent = (level) => {
  switch (level) {
    case 'HIGH':
      return '#F89B2C';
    case 'LOW':
      return '#47B0FF';
    case 'MEDIUM':
    default:
      return '#D9861C';
  }
};

const buildQueuedImageAsset = async (asset) => {
  if (!asset?.uri && !asset?.base64) {
    return null;
  }

  const inlineImage = await buildInlineImageDataUriFromAsset(asset, {
    maxBytes: MAX_INLINE_HAZARD_IMAGE_BYTES,
  });
  const inlineImageSize = getStringByteSize(inlineImage);
  const inlineBase64 = inlineImage ? inlineImage.split(',')[1] || null : null;

  return {
    fileName: asset.fileName || null,
    mimeType: asset.mimeType || null,
    uri: asset.uri || null,
    ...(inlineImage &&
    inlineImageSize > 0 &&
    inlineImageSize <= MAX_INLINE_HAZARD_IMAGE_BYTES &&
    inlineBase64
      ? { base64: inlineBase64 }
      : {}),
  };
};

export default function ReportHazardScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [zoneInput, setZoneInput] = useState('Zone A1');
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);
  const [locationMode, setLocationMode] = useState('gps');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [manualArea, setManualArea] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setDescription('');
    setSeverity('MEDIUM');
    setZoneInput('Zone A1');
    setSelectedImageAsset(null);
    setLocationMode('gps');
    setSelectedLocation(null);
    setManualArea('');
    setManualLandmark('');
    setBusyAction('');
    setIsSubmitting(false);
  };

  const handleImageResult = (result) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImageAsset(result.assets[0]);
    }
  };

  const handleUseCamera = async () => {
    try {
      setBusyAction('camera');
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert('Camera permission needed', 'Allow camera access to capture a hazard image.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        exif: false,
        mediaTypes: ['images'],
        quality: 0.4,
      });

      handleImageResult(result);
    } catch (error) {
      Alert.alert('Camera unavailable', error?.message || 'We could not open the camera.');
    } finally {
      setBusyAction('');
    }
  };

  const handleUseGallery = async () => {
    try {
      setBusyAction('gallery');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Gallery permission needed',
          'Allow photo library access to choose a hazard image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        exif: false,
        mediaTypes: ['images'],
        quality: 0.4,
      });

      handleImageResult(result);
    } catch (error) {
      Alert.alert('Gallery unavailable', error?.message || 'We could not open the gallery.');
    } finally {
      setBusyAction('');
    }
  };

  const handleUseGpsLocation = async () => {
    try {
      setBusyAction('gps');
      const location = await getCurrentGpsLocation();
      setSelectedLocation(location);
      if (location.area) {
        setZoneInput(location.area);
      }
      Alert.alert('Location selected', 'Your current GPS location has been attached.');
    } catch (error) {
      Alert.alert('Location unavailable', error?.message || 'We could not get your location.');
    } finally {
      setBusyAction('');
    }
  };

  const handleUseManualLocation = () => {
    const manualLocation = buildManualLocation({
      area: manualArea,
      landmark: manualLandmark,
    });

    if (!manualLocation) {
      Alert.alert('Manual location needed', 'Enter an area or landmark before saving it.');
      return;
    }

    setSelectedLocation(manualLocation);
    if (manualLocation.area) {
      setZoneInput(manualLocation.area);
    }
    Alert.alert('Location selected', 'Your manual location has been attached.');
  };

  const handleSubmit = async () => {
    const normalizedDescription = description.trim();

    if (!normalizedDescription) {
      Alert.alert('Description required', 'Describe the hazard before submitting.');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Location required', 'Attach a GPS or manual location before submitting.');
      return;
    }

    setIsSubmitting(true);

    const currentUser = auth.currentUser;
    let resolvedLocation = selectedLocation;
    let normalizedZone = zoneInput.trim();
    let resolvedZone = normalizedZone || resolvedLocation?.area || resolvedLocation?.label;
    try {
      if (
        resolvedLocation &&
        (typeof resolvedLocation.latitude !== 'number' || typeof resolvedLocation.longitude !== 'number') &&
        resolvedLocation.label
      ) {
        const geocodedCoordinates = await geocodeLocationLabel(resolvedLocation.label);

        if (geocodedCoordinates) {
          resolvedLocation = {
            ...resolvedLocation,
            ...geocodedCoordinates,
          };
          setSelectedLocation(resolvedLocation);
        }
      }

      normalizedZone = zoneInput.trim();
      resolvedZone = normalizedZone || resolvedLocation?.area || resolvedLocation?.label;

      const baseHazard = await addHazard({
        description: normalizedDescription,
        imageUrl: null,
        latitude: resolvedLocation?.latitude ?? null,
        location: resolvedLocation,
        locationLabel: resolvedLocation?.label,
        longitude: resolvedLocation?.longitude ?? null,
        reportedBy: getUserLabel(currentUser),
        severity,
        status: 'reported',
        userId: currentUser?.uid ?? null,
        zone: resolvedZone,
        zoneId: resolvedZone,
      });

      let uploadedImageUrl = null;
      let imageSavedInCompatibilityMode = false;
      const selectedImageUri = selectedImageAsset?.uri || '';

      if (selectedImageUri) {
        try {
          uploadedImageUrl = await uploadImage(selectedImageAsset, baseHazard.id);
          await updateHazard(baseHazard.id, {
            imageURL: uploadedImageUrl,
            imageUrl: uploadedImageUrl,
            imageMode: 'storage',
          });
        } catch (error) {
          const inlineHazardImage = await buildInlineImageDataUriFromAsset(selectedImageAsset, {
            maxBytes: MAX_INLINE_HAZARD_IMAGE_BYTES,
          });
          const inlineHazardImageSize = getStringByteSize(inlineHazardImage);
          const canFallbackInline =
            canUseInlineStorageFallback(error, inlineHazardImage) &&
            inlineHazardImageSize > 0 &&
            inlineHazardImageSize <= MAX_INLINE_HAZARD_IMAGE_BYTES;

          if (canFallbackInline) {
            try {
              uploadedImageUrl = inlineHazardImage;
              imageSavedInCompatibilityMode = true;
              await updateHazard(baseHazard.id, {
                imageURL: inlineHazardImage,
                imageUrl: inlineHazardImage,
                imageMode: 'inline',
              });
            } catch (fallbackError) {
              uploadedImageUrl = null;
              imageSavedInCompatibilityMode = false;
              console.error('Inline hazard image fallback failed:', fallbackError);
            }
          }

          if (!imageSavedInCompatibilityMode) {
            console.error('Image upload failed after hazard creation:', {
              code: error?.code,
              message: error?.message,
              inlineHazardImageSize,
            });
          }
        }
      }

      try {
        await addAlert({
          body: buildAlertBody(normalizedDescription),
          createdAt: serverTimestamp(),
          hazardId: baseHazard.id,
          read: false,
          severity,
          timestamp: serverTimestamp(),
          title: `Hazard Level: ${severity}`,
          type: severity === 'HIGH' ? 'HIGH_HAZARD' : 'HAZARD_REPORTED',
          userId: currentUser?.uid ?? null,
          zone: resolvedZone,
          zoneId: resolvedZone,
        });
      } catch (alertError) {
        console.error('Alert creation failed after hazard submission:', alertError);
      }

      Alert.alert(
        'Submitted',
        'Your hazard report was submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      const queuedImageAsset = await buildQueuedImageAsset(selectedImageAsset);
      const queuedReport = {
        description: normalizedDescription,
        imageAsset: queuedImageAsset,
        latitude: resolvedLocation?.latitude ?? null,
        location: resolvedLocation,
        locationLabel: resolvedLocation?.label,
        longitude: resolvedLocation?.longitude ?? null,
        reportedBy: getUserLabel(currentUser),
        severity,
        status: 'pending_sync',
        userId: currentUser?.uid ?? null,
        zone: resolvedZone,
        zoneId: resolvedZone,
      };

      const savedQueuedReport = await saveToOfflineQueue(queuedReport);

      if (!savedQueuedReport) {
        Alert.alert('Submit failed', error?.message || 'We could not submit the hazard report.');
        return;
      }

      let syncResult = {
        remainingCount: 1,
        syncedCount: 0,
      };

      try {
        syncResult = await syncOfflineHazardQueue();
      } catch (syncError) {
        console.error('Offline sync attempt failed after queueing hazard report:', syncError);
      }

      const syncedImmediately = syncResult.syncedCount > 0 && syncResult.remainingCount === 0;

      Alert.alert(
        syncedImmediately ? 'Submitted' : 'Saved offline',
        syncedImmediately
          ? 'Your hazard report was queued and synced successfully.'
          : 'Your hazard report was added to the offline queue. It will sync automatically when the connection returns.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const switchLocationMode = (mode) => {
    setLocationMode(mode);
    setSelectedLocation(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FloatingOrb delay={500} driftX={10} driftY={12} duration={8200} style={styles.pageOrbPrimary} />
          <FloatingOrb delay={1300} driftX={12} driftY={9} duration={9400} style={styles.pageOrbSecondary} />
          <FloatingOrb delay={1900} driftX={7} driftY={7} duration={7200} style={styles.pageOrbMini} />

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Report a hazard</Text>
            <Text style={styles.heroSubtitle}>
              Capture what you found, attach a location, and send it straight to the dashboard.
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hazard description</Text>
            <TextInput
              editable={!isSubmitting}
              multiline
              numberOfLines={6}
              onChangeText={setDescription}
              placeholder="Describe the hazard, affected area, and immediate risk."
              placeholderTextColor="#93A4B4"
              style={styles.descriptionInput}
              textAlignVertical="top"
              value={description}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hazard details</Text>

            <Text style={styles.fieldLabel}>ZONE IDENTIFIER</Text>
            <TextInput
              editable={!isSubmitting}
              onChangeText={setZoneInput}
              placeholder="e.g. Zone A1, Shaft 3, Loading Bay"
              placeholderTextColor="#93A4B4"
              style={styles.zoneInput}
              value={zoneInput}
            />

            <Text style={[styles.fieldLabel, styles.severityLabel]}>SEVERITY LEVEL</Text>
            <View style={styles.severityRow}>
              {severityOptions.map((level) => {
                const isActive = severity === level;
                const accentColor = getSeverityAccent(level);

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                    key={level}
                    onPress={() => setSeverity(level)}
                    style={[
                      styles.severityChip,
                      isActive && {
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityChipText,
                        isActive && styles.activeSeverityChipText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attach image</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting || busyAction === 'gallery' || busyAction === 'gps'}
                onPress={handleUseCamera}
                style={styles.actionButton}
              >
                {busyAction === 'camera' ? (
                  <ActivityIndicator color="#A96A20" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Use Camera</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting || busyAction === 'camera' || busyAction === 'gps'}
                onPress={handleUseGallery}
                style={styles.actionButton}
              >
                {busyAction === 'gallery' ? (
                  <ActivityIndicator color="#A96A20" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Choose from Gallery</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              {selectedImageAsset?.uri ? (
                <Image source={{ uri: selectedImageAsset.uri }} style={styles.previewImage} />
              ) : (
                <Text style={styles.previewPlaceholder}>No image selected yet.</Text>
              )}
            </View>

            {selectedImageAsset?.uri ? (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting || busyAction === 'camera' || busyAction === 'gps'}
                onPress={handleUseGallery}
                style={styles.replaceImageLink}
              >
                <Text style={styles.replaceImageText}>Replace selected image</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hazard location</Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => switchLocationMode('gps')}
                style={[styles.toggleButton, locationMode === 'gps' && styles.activeToggleButton]}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    locationMode === 'gps' && styles.activeToggleButtonText,
                  ]}
                >
                  GPS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => switchLocationMode('manual')}
                style={[
                  styles.toggleButton,
                  locationMode === 'manual' && styles.activeToggleButton,
                ]}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    locationMode === 'manual' && styles.activeToggleButtonText,
                  ]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            {locationMode === 'gps' ? (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting || busyAction === 'camera' || busyAction === 'gallery'}
                onPress={handleUseGpsLocation}
                style={styles.locationActionButton}
              >
                {busyAction === 'gps' ? (
                  <ActivityIndicator color="#A96A20" size="small" />
                ) : (
                  <Text style={styles.locationActionButtonText}>Use Current GPS Location</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View>
                <TextInput
                  editable={!isSubmitting}
                  onChangeText={setManualArea}
                  placeholder="Area or zone"
                  placeholderTextColor="#93A4B4"
                  style={styles.manualInput}
                  value={manualArea}
                />
                <TextInput
                  editable={!isSubmitting}
                  onChangeText={setManualLandmark}
                  placeholder="Landmark or extra detail"
                  placeholderTextColor="#93A4B4"
                  style={styles.manualInput}
                  value={manualLandmark}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                  onPress={handleUseManualLocation}
                  style={styles.locationActionButton}
                >
                  <Text style={styles.locationActionButtonText}>Use Manual Location</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.locationSummaryCard}>
              <Text style={styles.locationSummaryLabel}>SELECTED LOCATION</Text>
              <Text style={styles.locationSummaryText}>
                {formatSelectedLocation(selectedLocation)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={[styles.submitButton, isSubmitting && styles.disabledSubmitButton]}
          >
            {isSubmitting ? (
              <View style={styles.submitLoadingRow}>
                <ActivityIndicator color="#F7FAFC" size="small" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Hazard</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    paddingTop: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  pageOrbPrimary: {
    position: 'absolute',
    top: 26,
    right: -16,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: withAlpha(colors.brandBlue, 0.14),
  },
  pageOrbSecondary: {
    position: 'absolute',
    top: 212,
    left: -18,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: withAlpha(colors.brandBlue, 0.1),
  },
  pageOrbMini: {
    position: 'absolute',
    top: 468,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(colors.brandBlue, 0.13),
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1.1,
    marginBottom: 18,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1.1,
    marginBottom: 18,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  fieldLabel: {
    color: colors.brandBlueDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  descriptionInput: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.1,
    color: colors.text,
    fontSize: 15,
    minHeight: 128,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  zoneInput: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.1,
    color: colors.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  severityLabel: {
    marginTop: 16,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityChip: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.2,
    flex: 0.31,
    justifyContent: 'center',
    minHeight: 46,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  severityChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeSeverityChipText: {
    color: colors.surface,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    borderColor: withAlpha(colors.primaryDeep, 0.2),
    borderWidth: 1.1,
    flex: 0.485,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  actionButtonText: {
    color: colors.primaryDeep,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  previewCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1.1,
    justifyContent: 'center',
    minHeight: 154,
    overflow: 'hidden',
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 3,
  },
  previewImage: {
    height: 190,
    resizeMode: 'cover',
    width: '100%',
  },
  previewPlaceholder: {
    color: colors.textSoft,
    fontSize: 15,
    textAlign: 'center',
  },
  replaceImageLink: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replaceImageText: {
    color: colors.brandBlueDeep,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 0.48,
    justifyContent: 'center',
    minHeight: 40,
    paddingVertical: 10,
  },
  activeToggleButton: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  toggleButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '800',
  },
  activeToggleButtonText: {
    color: colors.surface,
  },
  locationActionButton: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    borderColor: withAlpha(colors.primaryDeep, 0.2),
    borderWidth: 1.1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  locationActionButtonText: {
    color: colors.primaryDeep,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  manualInput: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.1,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
    minHeight: 50,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  locationSummaryCard: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1.1,
    marginTop: 14,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  locationSummaryLabel: {
    color: colors.brandBlueDeep,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  locationSummaryText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryDeep,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  disabledSubmitButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  submitLoadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
});
