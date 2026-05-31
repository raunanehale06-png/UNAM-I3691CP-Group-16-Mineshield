import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import {
  SupervisorBackButton,
  SupervisorIconBadge,
  SupervisorNavIcon,
} from '../../components/supervisor/SupervisorNavigationChrome';
import { filterPublicAlerts, mapAlertSnapshot } from '../../services/alertService';
import { db } from '../../services/firebase';
import colors, { withAlpha } from '../../styles/colors';

const getNotificationPresentation = (item) => {
  const severity = String(item.severity || '').toUpperCase();

  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return {
      accent: colors.danger,
      iconKey: 'hazardReports',
    };
  }

  if (String(item.type || '').toUpperCase().includes('SOS')) {
    return {
      accent: colors.warning,
      iconKey: 'sosAlerts',
    };
  }

  return {
    accent: colors.primary,
    iconKey: 'notifications',
  };
};

export default function VisitorAlertScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = collection(db, 'alerts');
    const alertsQuery = query(alertsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      alertsQuery,
      (snapshot) => {
        const logsList = filterPublicAlerts(snapshot.docs.map(mapAlertSnapshot));
        setNotifications(logsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error streaming visitor safety updates:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderNotificationItem = ({ item }) => {
    const { accent, iconKey } = getNotificationPresentation(item);
    const isHighSeverity =
      item.severity?.toUpperCase() === 'HIGH' || item.severity?.toUpperCase() === 'CRITICAL';

    return (
      <View
        style={[
          styles.notificationCard,
          {
            borderColor: withAlpha(accent, isHighSeverity ? 0.52 : 0.26),
          },
        ]}
      >
        <SupervisorIconBadge
          routeKey={iconKey}
          color={accent}
          backgroundColor={withAlpha(accent, 0.16)}
          borderColor={withAlpha(accent, 0.28)}
          style={styles.iconShell}
        />

        <View style={styles.cardBody}>
          <View style={styles.cardTopMetaRow}>
            <Text style={[styles.alertTypeTitle, { color: accent }]}>
              {item.type || 'SYSTEM UPDATE'}
            </Text>
            <Text style={styles.timestampLabel}>
              {item.timestamp || 'Syncing'}
            </Text>
          </View>

          <Text style={styles.alertHeadlineText}>{item.title || 'On-Site Notice'}</Text>
          <Text style={styles.alertBodyPayloadText}>
            {item.body || 'Please remain alert and follow standard safety routing protocols.'}
          </Text>

          <View style={styles.locationRow}>
            <SupervisorIconBadge
              routeKey="workerTracking"
              color={colors.textSoft}
              backgroundColor={colors.surfaceAlt}
              borderColor={colors.border}
              style={styles.locationIconShell}
            />
            <Text style={styles.locationTagMarker}>{item.location || 'All Sectors'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <View style={styles.headerBlock}>
        <SupervisorBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>
          Broadcast history of site alerts and general security guidelines.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.warning} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <SupervisorIconBadge
            routeKey="notifications"
            color={colors.success}
            backgroundColor={withAlpha(colors.success, 0.14)}
            borderColor={withAlpha(colors.success, 0.28)}
            style={styles.emptyIconShell}
          />
          <Text style={styles.emptyFeedTitle}>Inbox Clear</Text>
          <Text style={styles.emptyFeedSubtitle}>
            There are no new safety broadcast files or alerts logged today.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listWrapperScroll}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  backArrowShaft: {
    width: 12,
    height: 2.4,
    borderRadius: 999,
    backgroundColor: colors.text,
    transform: [{ translateX: 2 }],
  },
  backArrowHead: {
    width: 8,
    height: 8,
    borderLeftWidth: 2.4,
    borderBottomWidth: 2.4,
    borderColor: colors.text,
    transform: [{ rotate: '45deg' }],
    marginLeft: -10,
    marginRight: 8,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconShell: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: withAlpha(colors.success, 0.14),
    borderWidth: 1,
    borderColor: withAlpha(colors.success, 0.28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyFeedTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyFeedSubtitle: {
    color: colors.textSoft,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  listWrapperScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.1,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 4,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTypeTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    flexShrink: 1,
    marginRight: 10,
  },
  timestampLabel: {
    color: colors.textSoft,
    fontSize: 11,
  },
  alertHeadlineText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertBodyPayloadText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconShell: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationTagMarker: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
});
