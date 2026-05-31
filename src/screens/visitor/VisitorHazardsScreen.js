import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SupervisorBackButton,
  SupervisorIconBadge,
} from '../../components/supervisor/SupervisorNavigationChrome';
// Firebase configuration modules aligned with services/firebase.js
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore'; // Removed query and orderBy imports
import { filterPublicAlerts, mapAlertSnapshot } from '../../services/alertService';
import colors, { withAlpha } from '../../styles/colors';

export default function VisitorHazardsScreen({ navigation }) {
  const [siteAlerts, setSiteAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Point directly to the collection without server-side sorting parameters
    const alertsRef = collection(db, 'alerts');
    
    // Establish dynamic sync pipeline stream listener on the raw collection
    const unsubscribe = onSnapshot(alertsRef, (snapshot) => {
      const alertsList = filterPublicAlerts(snapshot.docs.map(mapAlertSnapshot));

      // 2. Perform Client-Side Sorting to safely bypass server authentication checks
      const sortedAlerts = alertsList.sort((a, b) => {
        const timeA = a.sortTime || 0;
        const timeB = b.sortTime || 0;
        return timeB - timeA; // Descending order (Newest first)
      });

      setSiteAlerts(sortedAlerts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching site alert streams for visitor feed: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper mapping to establish consistent severity color codes
  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return colors.warning;
      case 'MEDIUM':
        return colors.warningStrong;
      case 'LOW':
      default:
        return colors.primary;
    }
  };

  const renderAlertItem = ({ item }) => {
    const badgeColor = getSeverityColor(item.severity);

    return (
      <TouchableOpacity 
        style={styles.alertCard}
        activeOpacity={0.85}
        onPress={() => {
          if (item.hazardId || item.id) {
            navigation.navigate('HazardDetailScreen', { hazardId: item.hazardId || item.id });
          }
        }}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconHeadingGroup}>
            <SupervisorIconBadge
              routeKey="hazardReports"
              color={badgeColor}
              backgroundColor={withAlpha(badgeColor, 0.16)}
              borderColor={withAlpha(badgeColor, 0.28)}
              style={styles.cardIconShell}
            />
            <Text style={styles.alertTitleText} numberOfLines={1}>
              {item.type || item.title || 'Hazard Alert'}
            </Text>
          </View>

          <View style={[styles.severityBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.severityBadgeText}>
              {item.severity?.toUpperCase() || 'LOW'}
            </Text>
          </View>
        </View>

        <Text style={styles.alertBodyText} numberOfLines={3}>
          {item.body || 'No description logs provided for this alert parameter.'}
        </Text>

        <View style={styles.cardFooterRow}>
          <View style={styles.locationRow}>
            <SupervisorIconBadge
              routeKey="workerTracking"
              color={colors.textSoft}
              backgroundColor={withAlpha(colors.primary, 0.12)}
              borderColor={colors.border}
              style={styles.locationIconShell}
            />
            <Text style={styles.locationText}>{item.location || 'Mining Perimeter Area'}</Text>
          </View>
          <Text style={styles.timeText}>
            {item.timestamp || 'Syncing...'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      {/* NAVIGATION PANEL HEADER BANNER */}
      <View style={styles.headerBlock}>
        <SupervisorBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Site Hazards Feed</Text>
        <Text style={styles.headerSubtitle}>Real-time active alerts and perimeter warnings for current visitors.</Text>
      </View>

      {/* DYNAMIC SCREEN ROUTER PANEL */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.warning} />
        </View>
      ) : siteAlerts.length === 0 ? (
        <View style={styles.centerContainer}>
          <SupervisorIconBadge
            routeKey="hazardReports"
            color={colors.success}
            backgroundColor={withAlpha(colors.success, 0.14)}
            borderColor={withAlpha(colors.success, 0.28)}
            style={styles.emptyIconShell}
          />
          <Text style={styles.emptyHeader}>Perimeter Clear</Text>
          <Text style={styles.emptySubtitle}>There are currently no active emergency alerts broadcast for this quadrant.</Text>
        </View>
      ) : (
        <FlatList
          data={siteAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
          contentContainerStyle={styles.listContainerWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// Keeping your existing layout styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBlock: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 6, elevation: 3 },
  backArrowShaft: { width: 12, height: 2.4, borderRadius: 999, backgroundColor: colors.text, transform: [{ translateX: 2 }] },
  backArrowHead: { width: 8, height: 8, borderLeftWidth: 2.4, borderBottomWidth: 2.4, borderColor: colors.text, transform: [{ rotate: '45deg' }], marginLeft: -10, marginRight: 8 },
  backButtonText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: colors.textSoft, fontSize: 14, marginTop: 5, lineHeight: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyIconShell: { width: 72, height: 72, borderRadius: 24, backgroundColor: withAlpha(colors.success, 0.14), borderWidth: 1, borderColor: withAlpha(colors.success, 0.28), alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyHeader: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptySubtitle: { color: colors.textSoft, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  listContainerWrapper: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20 },
  alertCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.borderStrong, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconHeadingGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  cardIconShell: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  alertTitleText: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  severityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  severityBadgeText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  alertBodyText: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 },
  locationIconShell: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: withAlpha(colors.primary, 0.12), alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  locationText: { color: colors.textSoft, fontSize: 12, flexShrink: 1 },
  timeText: { color: colors.textSoft, fontSize: 12 },
});
