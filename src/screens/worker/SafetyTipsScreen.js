import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../styles/colors';
import { SupervisorBackButton } from '../../components/supervisor/SupervisorNavigationChrome';

const { width } = Dimensions.get('window');

// Static production safety regulations data array matching mining compliance standards
const SAFETY_DATA = [
  {
    id: 'cat1',
    category: 'PERSONAL PROTECTIVE EQUIPMENT (PPE)',
    iconColor: colors.warning,
    tips: [
      { title: 'Class 3 High-Visibility Gear', detail: 'Always wear reflective apparel to remain visible to heavy machine operators in low-light shafts.' },
      { title: 'Hard Hat Inspection Check', detail: 'Verify daily that shell casings are free of cracks and suspension linings are taut.' },
      { title: 'Respiratory Protection Systems', detail: 'Equip particulate filters or self-contained respirators when entering areas containing ambient silica dust or gases.' },
    ]
  },
  {
    id: 'cat2',
    category: 'UNDERGROUND OPERATIONS',
    iconColor: colors.danger,
    tips: [
      { title: 'Barring Down Protocol', detail: 'Inspect overhead rock walls for loose scaling structures before deploying operational machinery.' },
      { title: 'Gas Monitor Verification', detail: 'Confirm digital toxic gas sniffer metrics are calibrated for oxygen level baselines prior to shaft descents.' },
      { title: 'Communication Check-Ins', detail: 'Maintain active radio link alignment loops with surface telemetry trackers every 30 minutes.' },
    ]
  },
  {
    id: 'cat3',
    category: 'HEAVY MACHINERY & TOOLS',
    iconColor: colors.success,
    tips: [
      { title: 'Lockout / Tagout (LOTO)', detail: 'Isolate power lines and lock mechanical breakers before initiating internal clearing adjustments on conveyor systems.' },
      { title: 'Blind Spot Awareness Fields', detail: 'Never stand within a 15-meter radius of active excavators or articulation joints while engines run.' },
    ]
  },
];

export default function SafetyTipsScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Filter selection evaluation rule
  const displayedCategories = activeCategory === 'ALL' 
    ? SAFETY_DATA 
    : SAFETY_DATA.filter(cat => cat.id === activeCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      {/* TOP HEADER COLUMN BLOCK */}
      <View style={styles.headerBlock}>
        <SupervisorBackButton onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.headerTitle}>Safety Directives Feed</Text>
        <Text style={styles.headerSubtitle}>Operational compliance rules for preventing deep-level site hazards.</Text>
      </View>

      {/* FILTER BUTTONS ROW SELECTOR */}
      <View style={styles.filterOuterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'ALL' && styles.activeFilterChip]}
            onPress={() => setActiveCategory('ALL')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'ALL' && styles.activeFilterChipText]}>ALL MANUALS</Text>
          </TouchableOpacity>

          {SAFETY_DATA.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, activeCategory === cat.id && styles.activeFilterChip]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.filterChipText, activeCategory === cat.id && styles.activeFilterChipText]} numberOfLines={1}>
                {cat.category.split(' ')[0]} REGULATES
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SCROLLABLE TIPS LAYOUT LIST */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {displayedCategories.map((group) => (
          <View key={group.id} style={styles.categoryBlockCard}>
            <View style={styles.categoryHeaderRow}>
              <View style={[styles.indicatorBarLabel, { backgroundColor: group.iconColor }]} />
              <Text style={styles.categoryTitleText}>{group.category}</Text>
            </View>

            {group.tips.map((tip, index) => (
              <View key={index} style={styles.tipItemDataContainer}>
                <View style={styles.tipTitleHeaderRow}>
                  <Text style={styles.tipNumberBullet}>0{index + 1}.</Text>
                  <Text style={styles.tipTitleTextString}>{tip.title}</Text>
                </View>
                <Text style={styles.tipBodyPayloadText}>{tip.detail}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBlock: { paddingHorizontal: 22, marginVertical: 15 },
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: colors.textSoft, fontSize: 13, lineHeight: 18 },
  
  filterOuterContainer: { height: 50, marginBottom: 10 },
  filterBarScroll: { paddingHorizontal: 22, alignItems: 'center' },
  filterChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 },
  activeFilterChip: { backgroundColor: colors.primaryDeep, borderColor: colors.primary },
  filterChipText: { color: colors.textSoft, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  activeFilterChipText: { color: colors.surface },

  mainScrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 30 },
  categoryBlockCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1.1, borderColor: colors.border, padding: 18, marginBottom: 18, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4 },
  categoryHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 },
  indicatorBarLabel: { width: 4, height: 16, borderRadius: 2, marginRight: 10 },
  categoryTitleText: { color: colors.text, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, flex: 1 },
  
  tipItemDataContainer: { marginBottom: 18 },
  tipTitleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tipNumberBullet: { color: colors.primaryDeep, fontSize: 13, fontWeight: 'bold', marginRight: 8 },
  tipTitleTextString: { color: colors.text, fontSize: 14, fontWeight: '700' },
  tipBodyPayloadText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, paddingLeft: 28 },
});
