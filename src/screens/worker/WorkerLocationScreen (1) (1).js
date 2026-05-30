import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors, { withAlpha } from '../../styles/colors';

import {
  sendWorkerHelmetCommunication,
  subscribeSupervisorWorkers,
} from '../../services/supervisorService';
import { getSupervisorRouteKey } from './supervisorNavigation';
import {
  SupervisorBottomNav,
  SupervisorIconBadge,
  SupervisorMenuButton,
  SupervisorNavIcon,
  SupervisorSidebar,
} from '../../components/supervisor/SupervisorNavigationChrome';

const { width } = Dimensions.get('window');

export default function WorkerLocationScreen({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [sendingWorkerId, setSendingWorkerId] = useState(null);
  const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const activeRouteKey = getSupervisorRouteKey('WorkerLocationScreen');

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -width * 0.75,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setIsSidebarOpen(false));
      return;
    }

    setIsSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  React.useEffect(() => {
    const unsubscribe = subscribeSupervisorWorkers(
      (nextWorkers) => setWorkers(nextWorkers),
      (error) => console.error('Unable to sync supervisor workers:', error)
    );

    return () => unsubscribe();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const query = searchQuery.toLowerCase();
    const matchesFilter = statusFilter === 'All' || worker.status === statusFilter;
    const matchesSearch =
      worker.name.toLowerCase().includes(query) ||
      worker.role.toLowerCase().includes(query) ||
      worker.location.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const alertWorkerHUD = async (worker) => {
    setSendingWorkerId(worker.id);

    try {
      await sendWorkerHelmetCommunication(worker);
      Alert.alert(
        'Broadcast sent',
        `A direct text message has been delivered to ${worker.name}'s worker alert feed.`
      );
    } catch (error) {
      Alert.alert(
        'Worker not reachable',
        error?.message || 'We could not deliver the helmet communication right now.'
      );
    } finally {
      setSendingWorkerId(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <SupervisorMenuButton onPress={toggleSidebar} />

          <View style={styles.screenHeaderTitleFrame}>
            <Text style={styles.screenHeaderTitle}>PERSONNEL TRACKING</Text>
            <Text style={styles.screenHeaderSubtitle}>Real-time beacon matrix</Text>
          </View>

          <View style={{ width: 34 }} />
        </View>

        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search personnel by name, role, or station..."
            placeholderTextColor={colors.textSoft}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchIconFrame}>
            <SupervisorNavIcon color={colors.textSoft} routeKey="search" />
          </View>
        </View>

        <View style={styles.chipContainer}>
          {['All', 'On-Duty', 'Signal Loss', 'Off-Duty'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setStatusFilter(filter)}
              style={[styles.chip, statusFilter === filter && styles.activeChip]}
            >
              <Text style={[styles.chipText, statusFilter === filter && styles.activeChipText]}>
                {filter === 'Signal Loss' ? 'Lost Signal' : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.workerFeedSection}>
          <Text style={styles.feedCountText}>
            MAPPED TRACKING SIGNALS ({filteredWorkers.length})
          </Text>

          {filteredWorkers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {workers.length === 0
                  ? 'No live workers are connected yet.'
                  : 'No personnel match the active filter.'}
              </Text>
            </View>
          ) : (
            filteredWorkers.map((item) => {
              const isLost = item.status === 'Signal Loss';
              const isOffDuty = item.status === 'Off-Duty';
              const accentColor = isLost ? colors.danger : isOffDuty ? colors.textSoft : colors.success;
              const backgroundTone = isLost
                ? colors.dangerSoft
                : isOffDuty
                  ? colors.surfaceAlt
                  : colors.successSoft;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.workerCard,
                    { borderColor: accentColor, backgroundColor: backgroundTone },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.workerIdentity}>
                      <SupervisorIconBadge
                        routeKey="profile"
                        color={accentColor}
                        backgroundColor={colors.surface}
                        borderColor={withAlpha(accentColor, 0.24)}
                        style={styles.workerIconBadge}
                      />
                      <View style={styles.workerMeta}>
                        <Text style={styles.workerName}>{item.name}</Text>
                        <Text style={styles.workerRole}>{item.role}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: accentColor }]}>
                      <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.locationRow}>
                    <SupervisorIconBadge
                      routeKey="workerTracking"
                      color={colors.textSoft}
                      backgroundColor={colors.surface}
                      borderColor={colors.border}
                      style={styles.locationBadge}
                    />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>Battery</Text>
                      <Text style={[styles.metricValue, { color: accentColor }]}>
                        {item.battery}
                      </Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>Signal</Text>
                      <Text style={styles.metricValue}>{item.signal}</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>Cap Lamp</Text>
                      <Text style={styles.metricValue}>{item.capLamp}</Text>
                    </View>
                  </View>

                  {!isOffDuty && (
                    <TouchableOpacity
                      disabled={sendingWorkerId === item.id}
                      style={[styles.actionButton, { borderColor: accentColor }]}
                      onPress={() => alertWorkerHUD(item)}
                    >
                      {sendingWorkerId === item.id ? (
                        <View style={styles.actionButtonLoadingRow}>
                          <ActivityIndicator color={accentColor} size="small" />
                          <Text style={[styles.actionButtonText, { color: accentColor }]}>
                            SENDING...
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.actionButtonText, { color: accentColor }]}>
                          SEND DIRECT HUD PING
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <SupervisorBottomNav activeKey={activeRouteKey} navigation={navigation} />
      <SupervisorSidebar
        activeKey={activeRouteKey}
        animatedLeft={sidebarAnim}
        isVisible={isSidebarOpen}
        navigation={navigation}
        onClose={toggleSidebar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    padding: 6,
  },
  burgerIcon: {
    color: '#F7FAFC',
    fontSize: 26,
  },
  screenHeaderTitleFrame: {
    alignItems: 'center',
    flex: 0.85,
  },
  screenHeaderTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  screenHeaderSubtitle: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  searchSection: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: colors.text,
    fontSize: 13,
  },
  searchIconFrame: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  activeChipText: {
    color: colors.surface,
  },
  workerFeedSection: {
    width: '100%',
  },
  feedCountText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
  },
  workerCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  workerIconBadge: {
    marginRight: 12,
  },
  workerMeta: {
    flex: 1,
  },
  workerName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  workerRole: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 8,
  },
  locationText: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricPill: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  metricLabel: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  actionButton: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  actionButtonLoadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#0D1014',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#192d3d',
    elevation: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.4,
  },
  activeTabIcon: {
    opacity: 1,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#0D1014',
    borderRightWidth: 1,
    borderColor: '#192e3d',
    zIndex: 15,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarBrand: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#1D252E',
    backgroundColor: '#131920',
  },
  brandTitle: {
    color: '#F7FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarScroll: {
    padding: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#1D252E',
  },
  menuIcon: {
    fontSize: 18,
    width: 30,
  },
  menuText: {
    color: '#B0BCC8',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  menuTextActive: {
    color: '#F7FAFC',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#1D252E',
    marginVertical: 10,
  },
});


