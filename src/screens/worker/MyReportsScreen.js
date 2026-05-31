import React from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HazardCard from '../../components/hazards/HazardCard';
import useWorkerHazards from '../../hooks/useWorkerHazards';
import colors from '../../styles/colors';
import { SupervisorBackButton } from '../../components/supervisor/SupervisorNavigationChrome';
import FloatingOrb from '../../components/common/FloatingOrb';

const resolveReportLocation = (report) =>
  report.locationLabel ||
  report.zone ||
  report.zoneId ||
  report.location?.label ||
  report.location?.area ||
  (typeof report.location === 'string' ? report.location : '') ||
  'Site Floor Grid';

const formatReportDate = (value) => {
  if (!value) {
    return 'Syncing...';
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString();
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Syncing...' : date.toLocaleDateString();
};

export default function MyReportsScreen({ navigation }) {
  const { hazards: myReports, loading, clearReportLogs } = useWorkerHazards();

  const handleClearLogs = () => {
    if (myReports.length === 0) {
      return;
    }

    Alert.alert(
      'Clear resolved logs?',
      'Older resolved report entries will be hidden so your dashboard focuses on active items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Logs',
          style: 'destructive',
          onPress: () => clearReportLogs(),
        },
      ]
    );
  };

  const renderReportItem = ({ item }) => {
    return (
      <HazardCard
        description={item.description || 'No descriptive technical logs specified.'}
        imageUrl={item.imageURL || item.imageUrl}
        meta={[
          { label: 'Location', value: resolveReportLocation(item) },
          { label: 'Date', value: formatReportDate(item.timestamp || item.createdAt) },
        ]}
        onPress={() => navigation.navigate('HazardDetailScreen', { hazardId: item.id })}
        severity={item.severity}
        status={item.status}
        title={item.reportCode || 'Hazard report'}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <FloatingOrb delay={500} driftX={9} driftY={10} duration={8600} style={styles.pageOrbTop} />
      <FloatingOrb delay={1650} driftX={6} driftY={8} duration={7000} style={styles.pageOrbMini} />

      {/* TOP COMPONENT NAVIGATION HEADER BLOCK */}
      <View style={styles.headerBlock}>
        <SupervisorBackButton onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.headerTitle}>My Submissions</Text>
        <Text style={styles.headerSubtitle}>Personal historical tracking log for hazards you reported.</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClearLogs}
          style={[styles.clearButton, myReports.length === 0 && styles.disabledClearButton]}
          disabled={myReports.length === 0}
        >
          <Text style={[styles.clearButtonText, myReports.length === 0 && styles.disabledClearButtonText]}>
            Clear Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* RENDER BODY STATE ROUTER HOOKS */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.warning} />
        </View>
      ) : myReports.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyClipboardGraphic} />
          <Text style={styles.emptyHeaderTitle}>No History Tracked</Text>
          <Text style={styles.emptySubtitleBody}>You have not cataloged or submitted any live hazards yet.</Text>
        </View>
      ) : (
        <FlatList
          data={myReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listScrollWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageOrbTop: { position: 'absolute', top: 36, right: -16, width: 92, height: 92, borderRadius: 46, backgroundColor: colors.brandBlueSoft },
  pageOrbMini: { position: 'absolute', top: 144, left: -10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46, 146, 255, 0.14)' },
  headerBlock: { paddingHorizontal: 22, marginVertical: 15 },
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: colors.textSoft, fontSize: 13, lineHeight: 18 },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  disabledClearButton: {
    opacity: 0.55,
  },
  clearButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  disabledClearButtonText: {
    color: colors.textFaint,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  
  // Empty space state styles
  emptyClipboardGraphic: { width: 45, height: 55, borderWidth: 2, borderColor: colors.borderStrong, borderRadius: 6, marginBottom: 15, position: 'relative' },
  emptyHeaderTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  emptySubtitleBody: { color: colors.textSoft, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  
  // Flatlist tracking elements layout
  listScrollWrapper: { paddingHorizontal: 22, paddingBottom: 25 },
  reportCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1.1, borderColor: colors.border, padding: 16, marginBottom: 14, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 5 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  severityLabelChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  severityChipText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeBg: { backgroundColor: colors.warningSoft },
  resolvedBg: { backgroundColor: colors.successSoft },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  activeText: { color: colors.warningStrong },
  resolvedText: { color: colors.success },
  reportDescription: { color: colors.text, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  reportCodeText: { color: colors.textSoft, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 12 },
  cardImagePreview: { width: '100%', height: 130, borderRadius: 12, marginBottom: 12, backgroundColor: colors.surfaceAlt },
  cardFooterRow: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  locationMetaBlock: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', marginRight: 12 },
  locationBadge: { width: 24, height: 24, borderRadius: 8, marginRight: 8 },
  locationTextString: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  timestampText: { color: colors.textSoft, fontSize: 11, flexShrink: 0, marginTop: 2, textAlign: 'right' },
});
