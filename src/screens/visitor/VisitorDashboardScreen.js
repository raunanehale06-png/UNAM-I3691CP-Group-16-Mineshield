import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

import AppMenuModal from '../../components/navigation/AppMenuModal';
import FloatingOrb from '../../components/common/FloatingOrb';
import LiveHazardMapSection from '../../components/maps/LiveHazardMapSection';
import ScreenScrollView from '../../components/common/ScreenScrollView';
import {
  SupervisorIconBadge,
  SupervisorNavBadge,
} from '../../components/supervisor/SupervisorNavigationChrome';
import { useI18n } from '../../contexts/AppSettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { filterPublicAlerts, mapAlertSnapshot } from '../../services/alertService';
import { auth, db } from '../../services/firebase';
import {
  DEFAULT_ZONE_DOCUMENTS,
  subscribeSupervisorHazards,
  subscribeSupervisorZones,
} from '../../services/supervisorService';
import { clearSessionRouteState } from '../../services/sessionRouteService';
import {
  checkOutVisitorSession,
  clearStoredVisitorSessionId,
  getStoredVisitorSessionId,
  heartbeatVisitorSession,
  isVisitorSessionLive,
  normalizeVisitorSessionStatus,
  subscribeVisitorSession,
} from '../../services/visitorSessionService';

const getDashboardRouteKey = (type) => {
  switch (type) {
    case 'menu':
      return 'menu';
    case 'zones':
      return 'workerTracking';
    case 'alerts':
      return 'notifications';
    case 'safety':
      return 'riskZones';
    case 'phone':
      return 'phone';
    case 'logout':
      return 'logout';
    default:
      return 'menu';
  }
};

export default function VisitorDashboardScreen({ navigation }) {
  const theme = useTheme();
  const { t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();
  const compactLayout = screenWidth < 390;
  const styles = useMemo(() => createStyles(theme, compactLayout), [theme, compactLayout]);

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [zones, setZones] = useState(DEFAULT_ZONE_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [visitorSession, setVisitorSession] = useState(null);
  const [visitorSessionLoading, setVisitorSessionLoading] = useState(true);
  const [visitorSessionId, setVisitorSessionId] = useState(null);
  const [visitorSessionIdLoaded, setVisitorSessionIdLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(
    t('visitorDashboard.info.help')
  );
  const visitorHeartbeatRef = useRef(null);
  const visitorLoggingOutRef = useRef(false);
  const visitorSessionStatus = normalizeVisitorSessionStatus(visitorSession?.status);
  const visitorSessionLive = isVisitorSessionLive(visitorSession);

  useEffect(() => {
    let isMounted = true;

    const loadVisitorSessionId = async () => {
      try {
        const storedSessionId = await getStoredVisitorSessionId();

        if (isMounted) {
          setVisitorSessionId(storedSessionId || null);
        }
      } catch (error) {
        console.error('Unable to read the stored visitor session id:', error);

        if (isMounted) {
          setVisitorSessionId(null);
        }
      } finally {
        if (isMounted) {
          setVisitorSessionIdLoaded(true);
        }
      }
    };

    loadVisitorSessionId();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribeSession = () => {};

    if (!visitorSessionIdLoaded) {
      return () => unsubscribeSession();
    }

    if (!visitorSessionId) {
      setVisitorSession(null);
      setVisitorSessionLoading(false);
      return () => unsubscribeSession();
    }

    setVisitorSessionLoading(true);
    unsubscribeSession = subscribeVisitorSession(
      visitorSessionId,
      (nextSession) => {
        setVisitorSession(nextSession);
        setVisitorSessionLoading(false);
      },
      (error) => {
        console.error('Error streaming visitor session state:', error);
        setVisitorSession(null);
        setVisitorSessionLoading(false);
      }
    );

    return () => unsubscribeSession();
  }, [visitorSessionId, visitorSessionIdLoaded]);

  useEffect(() => {
    if (visitorHeartbeatRef.current) {
      clearInterval(visitorHeartbeatRef.current);
      visitorHeartbeatRef.current = null;
    }

    if (
      visitorLoggingOutRef.current ||
      !visitorSessionIdLoaded ||
      !visitorSessionId ||
      visitorSessionStatus !== 'active'
    ) {
      return undefined;
    }

    const sendHeartbeat = () => {
      heartbeatVisitorSession(visitorSessionId).catch((error) => {
        console.error('Unable to refresh visitor presence:', error);
      });
    };

    sendHeartbeat();
    visitorHeartbeatRef.current = setInterval(sendHeartbeat, 20_000);

    return () => {
      if (visitorHeartbeatRef.current) {
        clearInterval(visitorHeartbeatRef.current);
        visitorHeartbeatRef.current = null;
      }
    };
  }, [visitorSessionId, visitorSessionIdLoaded, visitorSessionStatus]);

  useEffect(() => {
    const alertsRef = collection(db, 'alerts');

    const unsubscribe = onSnapshot(
      alertsRef,
      (snapshot) => {
        const alertsList = filterPublicAlerts(snapshot.docs.map(mapAlertSnapshot));
        const sortedAlerts = alertsList
          .sort((leftAlert, rightAlert) => (rightAlert.sortTime || 0) - (leftAlert.sortTime || 0))
          .slice(0, 3);

        setActiveAlerts(sortedAlerts);
        setLoading(false);
      },
      (error) => {
        console.error('Error streaming dynamic visitor alerts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribeZones = subscribeSupervisorZones(
      (nextZones) => {
        setZones(nextZones);
      },
      (error) => {
        console.error('Error streaming visitor zone map:', error);
        setZones(DEFAULT_ZONE_DOCUMENTS);
      }
    );

    return () => unsubscribeZones();
  }, []);

  useEffect(() => {
    const unsubscribeHazards = subscribeSupervisorHazards(
      (nextHazards) => {
        setHazards(nextHazards);
      },
      (error) => {
        console.error('Error streaming visitor hazard map:', error);
        setHazards([]);
      }
    );

    return () => unsubscribeHazards();
  }, []);

  useEffect(() => {
    setActiveInfoModal(t('visitorDashboard.info.help'));
  }, [t]);

  const getSeverityStyles = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return { cardBg: theme.colors.dangerSoft, badgeBg: theme.colors.danger };
      case 'MEDIUM':
        return { cardBg: theme.colors.warningSoft, badgeBg: theme.colors.warningStrong };
      case 'LOW':
      default:
        return { cardBg: theme.colors.primarySoft, badgeBg: theme.colors.primaryDeep };
    }
  };

  const handleEmergencyHelp = () => {
    Alert.alert(t('visitorDashboard.emergencyHelp'), t('visitorDashboard.emergencyPrompt'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('visitorDashboard.emergencyHelp'),
        style: 'destructive',
        onPress: () => {
          Linking.openURL('tel:112').catch(() => {
            Alert.alert(t('common.updateFailed'), t('visitorDashboard.emergencyUnsupported'));
          });
        },
      },
    ]);
  };

  const handleOpenHelp = () => {
    setMenuVisible(false);
    setActiveInfoModal(t('visitorDashboard.info.help'));
    setInfoModalVisible(true);
  };

  const handleOpenAbout = () => {
    setMenuVisible(false);
    setActiveInfoModal(t('visitorDashboard.info.about'));
    setInfoModalVisible(true);
  };

  const handleVisitorLogout = () => {
    Alert.alert(t('visitorDashboard.logoutPrompt'), t('visitorDashboard.logoutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logOut'),
        style: 'destructive',
        onPress: async () => {
          try {
            visitorLoggingOutRef.current = true;

            if (visitorHeartbeatRef.current) {
              clearInterval(visitorHeartbeatRef.current);
              visitorHeartbeatRef.current = null;
            }

            try {
              if (visitorSessionId) {
                await checkOutVisitorSession(visitorSessionId);
              }
            } catch (checkoutError) {
              console.error('Error checking out visitor session:', checkoutError);
            } finally {
              await clearStoredVisitorSessionId();
              setVisitorSession(null);
              setVisitorSessionId(null);
              setVisitorSessionLoading(false);
              clearSessionRouteState();

              if (auth.currentUser) {
                await signOut(auth);
              }
            }
          } catch (error) {
            console.error('Error signing out visitor session:', error);
          }
        },
      },
    ]);
  };

  const visitorModules = [
    {
      id: 'zones',
      title: t('visitorDashboard.modules.zonesTitle'),
      subtitle: t('visitorDashboard.modules.zonesSubtitle'),
      icon: 'zones',
      onPress: () => navigation.navigate('HazardListScreen'),
    },
    {
      id: 'alerts',
      title: t('visitorDashboard.modules.alertsTitle'),
      subtitle: t('visitorDashboard.modules.alertsSubtitle'),
      icon: 'alerts',
      onPress: () => navigation.navigate('NotificationScreen'),
    },
    {
      id: 'safety',
      title: t('visitorDashboard.modules.safetyTitle'),
      subtitle: t('visitorDashboard.modules.safetySubtitle'),
      icon: 'safety',
      onPress: () => navigation.navigate('SafetyTipsScreen'),
    },
    {
      id: 'phone',
      title: t('visitorDashboard.modules.phoneTitle'),
      subtitle: t('visitorDashboard.modules.phoneSubtitle'),
      icon: 'phone',
      onPress: handleEmergencyHelp,
    },
  ];

  const footerActions = [
    {
      id: 'menu',
      icon: 'menu',
      label: t('visitorDashboard.labels.menu'),
      onPress: () => setMenuVisible(true),
    },
    {
      id: 'zones',
      icon: 'zones',
      label: t('visitorDashboard.labels.zones'),
      onPress: () => navigation.navigate('HazardListScreen'),
    },
    {
      id: 'alerts',
      icon: 'alerts',
      label: t('visitorDashboard.labels.alerts'),
      onPress: () => navigation.navigate('NotificationScreen'),
    },
    {
      id: 'safety',
      icon: 'safety',
      label: t('visitorDashboard.labels.safety'),
      onPress: () => navigation.navigate('SafetyTipsScreen'),
    },
    {
      id: 'logout',
      icon: 'logout',
      label: t('visitorDashboard.labels.exit'),
      onPress: handleVisitorLogout,
    },
  ];

  const visitorAccessTone = (() => {
    switch (visitorSessionStatus) {
      case 'active':
        return {
          badgeBg: theme.colors.successSoft,
          badgeBorder: theme.colors.success,
          badgeText: theme.colors.success,
          value: t('visitorDashboard.status.active', {}, 'Active'),
          hint: visitorSessionLive
            ? 'Live visitor access is active right now.'
            : 'The visitor session is active and waiting for a fresh heartbeat.',
        };
      case 'checked_out':
        return {
          badgeBg: theme.colors.surfaceAlt,
          badgeBorder: theme.colors.border,
          badgeText: theme.colors.textSoft,
          value: t('visitorDashboard.status.checkedOut', {}, 'Checked out'),
          hint: 'This visitor session has already ended.',
        };
      case 'rejected':
        return {
          badgeBg: theme.colors.surfaceAlt,
          badgeBorder: theme.colors.border,
          badgeText: theme.colors.textSoft,
          value: t('visitorDashboard.status.ended', {}, 'Ended'),
          hint: 'This visitor session is no longer active.',
        };
      default:
        return {
          badgeBg: theme.colors.warningSoft,
          badgeBorder: theme.colors.warning,
          badgeText: theme.colors.warning,
          value: t('visitorDashboard.status.starting', {}, 'Starting'),
          hint: 'Preparing your visitor session now.',
        };
    }
  })();

  const visitorStatusCards = [
    {
      key: 'sessionState',
      label: t('visitorDashboard.status.access', {}, 'Access'),
      value: visitorSessionLoading ? t('common.loading', {}, 'Loading...') : visitorAccessTone.value,
      hint: visitorSessionLoading
        ? 'Checking your visitor session.'
        : visitorAccessTone.hint,
      icon: (
        <SupervisorIconBadge
          backgroundColor={visitorAccessTone.badgeBg}
          borderColor={visitorAccessTone.badgeBorder}
          color={visitorAccessTone.badgeText}
          routeKey="notifications"
          style={styles.statusIconBadge}
        />
      ),
    },
    {
      key: 'session',
      label: t('visitorDashboard.status.session', {}, 'Session'),
      value: visitorSessionLoading
        ? t('common.loading', {}, 'Loading...')
        : visitorSessionLive
          ? t('visitorDashboard.status.live', {}, 'Live')
          : t('visitorDashboard.status.starting', {}, 'Starting'),
      hint: visitorSessionLoading
        ? 'Loading live visitor status.'
        : visitorSessionLive
          ? 'Heartbeat updates are flowing in real time.'
          : 'The session is starting up or waiting for a fresh update.',
      icon: (
        <SupervisorIconBadge
          backgroundColor={visitorSessionLive ? theme.colors.successSoft : theme.colors.surfaceAlt}
          borderColor={visitorSessionLive ? theme.colors.success : theme.colors.border}
          color={visitorSessionLive ? theme.colors.success : theme.colors.textSoft}
          routeKey="workerTracking"
          style={styles.statusIconBadge}
        />
      ),
    },
    {
      key: 'lastSeen',
      label: t('visitorDashboard.status.lastSeen', {}, 'Last Check-In'),
      value: visitorSessionLoading
        ? t('common.loading', {}, 'Loading...')
        : visitorSession?.lastSeenAtLabel ||
          visitorSession?.startedAtLabel ||
          visitorSession?.requestedAtLabel ||
          t('common.notAvailable'),
      hint: visitorSessionLoading
        ? 'Loading the most recent checkpoint.'
        : visitorSession?.startedAtLabel
          ? `Started ${visitorSession.startedAtLabel}`
          : 'Waiting for a recorded checkpoint.',
      icon: (
        <SupervisorIconBadge
          backgroundColor={theme.colors.primarySoft}
          borderColor={theme.colors.primary}
          color={theme.colors.primaryDeep}
          routeKey="riskZones"
          style={styles.statusIconBadge}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.colors.mode === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View style={styles.topHeaderRow}>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>{t('visitorDashboard.headerTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('visitorDashboard.headerSubtitle')}</Text>
        </View>
      </View>

      <ScreenScrollView
        contentContainerStyle={styles.scrollContentLayout}
        style={styles.scrollCanvas}
      >
        <FloatingOrb delay={500} driftX={11} driftY={12} duration={8600} style={styles.pageOrbPrimary} />
        <FloatingOrb delay={1300} driftX={10} driftY={8} duration={9800} style={styles.pageOrbSecondary} />
        <FloatingOrb delay={1800} driftX={7} driftY={7} duration={7200} style={styles.pageOrbMini} />

        <View style={styles.welcomeCard}>
          <View style={styles.avatarMockFrame}>
            <Text style={styles.avatarMockText}>V</Text>
          </View>
          <View style={styles.welcomeTextBlock}>
            <Text style={styles.welcomeTitleText}>
              {t('visitorDashboard.welcomeTitle', {
                name:
                  visitorSession?.fullName?.split(' ')[0] ||
                  visitorSession?.displayName?.split(' ')[0] ||
                  t('common.visitor'),
              })}
            </Text>
            <Text style={styles.welcomeSubtitleText}>{t('visitorDashboard.welcomeSubtitle')}</Text>
          </View>
        </View>

        <View style={styles.outerSectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderLabelText}>{t('visitorDashboard.myStatus')}</Text>
            <View
              style={[
                styles.statusPill,
                visitorSessionLive && styles.statusPillLive,
              ]}
            >
              <Text style={styles.statusPillText}>
                {visitorSessionLive
                  ? t('visitorDashboard.status.live', {}, 'LIVE')
                  : visitorAccessTone.value}
              </Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            {visitorStatusCards.map((card) => (
              <View key={card.key} style={styles.statusCard}>
                {card.icon}
                <Text style={styles.statusLabel}>{card.label}</Text>
                <Text numberOfLines={2} style={styles.statusValue}>
                  {card.value}
                </Text>
                <Text numberOfLines={2} style={styles.statusHint}>
                  {card.hint}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <LiveHazardMapSection
          hazards={hazards}
          loading={false}
          showWorkers={false}
          subtitle="Monitoring safe and critical zones in real time."
          title="Live Zone Map"
          zones={zones}
        />

        <View style={styles.outerSectionCard}>
          <Text style={styles.sectionHeaderLabelText}>{t('visitorDashboard.activeAlerts')}</Text>

          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.warning} style={styles.loadingSpinner} />
          ) : activeAlerts.length === 0 ? (
            <View style={styles.emptyAlertsCard}>
              <Text style={styles.emptyAlertsTitle}>{t('visitorDashboard.emptyTitle')}</Text>
              <Text style={styles.emptyAlertsText}>{t('visitorDashboard.emptyBody')}</Text>
            </View>
          ) : (
            activeAlerts.map((alert) => {
              const palette = getSeverityStyles(alert.severity);

              return (
                <TouchableOpacity
                  activeOpacity={0.84}
                  key={alert.id}
                  onPress={() =>
                    navigation.navigate('HazardDetailScreen', {
                      hazardId: alert.hazardId || alert.id,
                    })
                  }
                  style={[styles.alertCard, { backgroundColor: palette.cardBg }]}
                >
                  <SupervisorIconBadge
                    backgroundColor={theme.colors.surface}
                    borderColor={theme.colors.border}
                    color={theme.colors.brandBlueDeep}
                    routeKey={getDashboardRouteKey('alerts')}
                    style={styles.alertIconBadge}
                  />
                  <View style={styles.alertMetaColumn}>
                    <Text style={styles.alertTitle}>{alert.title || t('common.alerts')}</Text>
                    <Text style={styles.alertDetail}>
                      {alert.location || alert.body || t('workerDashboard.status.generalZone')}
                    </Text>
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: palette.badgeBg }]}>
                    <Text style={styles.alertBadgeText}>
                      {alert.severity?.toUpperCase() || 'LOW'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.outerSectionCard}>
          <Text style={styles.sectionHeaderLabelText}>{t('visitorDashboard.tools')}</Text>

          {visitorModules.map((module) => (
            <TouchableOpacity
              activeOpacity={0.84}
              key={module.id}
              onPress={module.onPress}
              style={styles.infoListItemRow}
            >
              <SupervisorIconBadge
                backgroundColor={
                  module.icon === 'phone' ? theme.colors.dangerSoft : theme.colors.brandBlueSoft
                }
                borderColor={theme.colors.border}
                color={module.icon === 'phone' ? theme.colors.danger : theme.colors.brandBlueDeep}
                routeKey={getDashboardRouteKey(module.icon)}
                style={styles.moduleIconBadge}
              />
              <View style={styles.infoMetaColumn}>
                <Text style={styles.infoMainHeading}>{module.title}</Text>
                <Text style={styles.infoSubHeading}>{module.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.84}
            onPress={handleEmergencyHelp}
            style={styles.giantEmergencyCTAButton}
          >
            <Text style={styles.giantEmergencyCTAText}>{t('visitorDashboard.emergencyHelp')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenScrollView>

      <View style={styles.footerTabBar}>
        {footerActions.map((action) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={action.id}
            onPress={action.onPress}
            style={styles.tabBarItemButton}
          >
            <SupervisorNavBadge routeKey={getDashboardRouteKey(action.icon)} />
            <Text style={styles.footerLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppMenuModal
        actions={[
          {
            key: 'help',
            onPress: handleOpenHelp,
            routeKey: 'notifications',
            title: t('menu.visitor.helpTitle'),
            subtitle: t('menu.visitor.helpSubtitle'),
          },
          {
            key: 'about',
            onPress: handleOpenAbout,
            routeKey: 'riskZones',
            title: t('menu.visitor.aboutTitle'),
            subtitle: t('menu.visitor.aboutSubtitle'),
          },
        ]}
        includeAccountActions={false}
        includeGeneralSettings
        onClose={() => setMenuVisible(false)}
        subtitle={t('menu.visitor.subtitle')}
        title={t('menu.visitor.title')}
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

            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => setInfoModalVisible(false)}
              style={styles.infoCloseButton}
            >
              <Text style={styles.infoCloseButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme, compactLayout) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topHeaderRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.screen,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    headerTitleBlock: {
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.9,
      textTransform: 'uppercase',
    },
    headerSubtitle: {
      color: theme.colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    scrollCanvas: {
      flex: 1,
    },
    scrollContentLayout: {
      paddingHorizontal: theme.spacing.screen,
      paddingTop: theme.spacing.xs,
      paddingBottom: 32,
      position: 'relative',
      overflow: 'hidden',
    },
    pageOrbPrimary: {
      position: 'absolute',
      top: 24,
      right: -14,
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.14),
    },
    pageOrbSecondary: {
      position: 'absolute',
      top: 206,
      left: -20,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.1),
    },
    pageOrbMini: {
      position: 'absolute',
      top: 468,
      right: 18,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.13),
    },
    welcomeCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 4,
    },
    avatarMockFrame: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.brandBlueSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarMockText: {
      color: theme.colors.brandBlueDeep,
      fontSize: 22,
      fontWeight: '800',
    },
    welcomeTextBlock: {
      flex: 1,
      marginLeft: theme.spacing.lg,
    },
    welcomeTitleText: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    welcomeSubtitleText: {
      color: theme.colors.textSoft,
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18,
    },
    outerSectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 4,
    },
    zoneMapCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
      elevation: 4,
    },
    zoneMapHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      gap: 12,
    },
    zoneMapHeadingBlock: {
      flex: 1,
      paddingRight: theme.spacing.sm,
    },
    zoneMapTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginTop: 2,
    },
    zoneMapSubtitle: {
      color: theme.colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    zoneOnlyBadge: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 7,
      alignSelf: 'flex-start',
    },
    zoneOnlyBadgeText: {
      color: theme.colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    zoneMapViewport: {
      minHeight: 220,
      borderRadius: theme.radii.xl,
      backgroundColor: theme.withAlpha(theme.colors.brandBlue, 0.06),
      borderWidth: 1,
      borderColor: theme.withAlpha(theme.colors.brandBlue, 0.12),
      overflow: 'hidden',
    },
    zoneMapBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.withAlpha(theme.colors.brandBlueDeep, 0.03),
    },
    zoneMapKeyPanel: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    zoneMapStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: theme.spacing.md,
    },
    zoneMapStatText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    zoneKeyTitle: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    zoneKeySubtitle: {
      color: theme.colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    zoneKeyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    zoneKeyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    zoneKeyDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    zoneKeyLabel: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    zoneKeyNote: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    sectionHeaderLabelText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: compactLayout ? 'flex-start' : 'space-between',
      marginTop: theme.spacing.sm,
    },
    statusCard: {
      width: compactLayout ? '100%' : '48.2%',
      minHeight: compactLayout ? 124 : 136,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceAlt,
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
    statusLabel: {
      color: theme.colors.textSoft,
      fontSize: 10,
      marginBottom: 4,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
    statusPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusPillLive: {
      backgroundColor: theme.colors.successSoft,
      borderColor: theme.colors.success,
    },
    statusPillText: {
      color: theme.colors.text,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    loadingSpinner: {
      marginVertical: 20,
    },
    emptyAlertsCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    emptyAlertsTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 6,
    },
    emptyAlertsText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.withAlpha(theme.colors.brandBlue, 0.12),
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    alertIconBadge: {
      marginRight: theme.spacing.md,
    },
    alertMetaColumn: {
      flex: 1,
    },
    alertTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    alertDetail: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 3,
      lineHeight: 16,
    },
    alertBadge: {
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      minWidth: 65,
      alignItems: 'center',
    },
    alertBadgeText: {
      color: theme.colors.text,
      fontSize: 10,
      fontWeight: '800',
    },
    infoListItemRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      minHeight: compactLayout ? 82 : 74,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    moduleIconBadge: {
      marginRight: theme.spacing.md,
    },
    infoMetaColumn: {
      flex: 1,
    },
    infoMainHeading: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    infoSubHeading: {
      color: theme.colors.textSoft,
      fontSize: 12,
      marginTop: 2,
      lineHeight: 18,
    },
    giantEmergencyCTAButton: {
      width: '100%',
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.xl,
      minHeight: 56,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xs,
    },
    giantEmergencyCTAText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    footerTabBar: {
      minHeight: 88,
      backgroundColor: theme.colors.backgroundAlt,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 12,
    },
    tabBarItemButton: {
      width: compactLayout ? 58 : 62,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLabel: {
      color: theme.colors.textSoft,
      fontSize: 10,
      fontWeight: '700',
      marginTop: 6,
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
    infoCloseButton: {
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: 14,
    },
    infoCloseButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
  });
