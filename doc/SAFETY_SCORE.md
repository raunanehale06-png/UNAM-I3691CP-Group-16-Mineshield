markdown
# MINESHIELD PHASE 3 - SAFETY SCORE CALCULATION

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | MineShield - Mining Safety & Hazard Management System |
| **Document Title** | Safety Score Calculation Specification |
| **Version** | 1.0 |
| **Last Updated** | May 31, 2026 |
| **Responsible** | Annaliah Simasiku (Analytics Dashboard Lead) |
| **Reviewed By** | Klim Gelasius (Lead Developer), Andre Cavota (Documentation Lead) |
| **Phase** | Phase 3 - Final Deliverables |

--

## 1. Executive Summary

The Safety Score is a key performance indicator (KPI) displayed on the MineShield Supervisor Analytics Dashboard. It provides an at-a-glance assessment of mine safety performance based on hazard resolution rates. This document defines the calculation methodology, formula, implementation details, and interpretation guidelines for the Safety Score metric as required by FR-013.

---

## 2. Safety Score Definition

### 2.1 Purpose

The Safety Score measures the effectiveness of hazard management within the mining operation. A higher score indicates better safety performance, meaning more reported hazards have been successfully resolved.

### 2.2 Formula
Safety Score = (Number of Resolved Hazards / Total Number of Hazards) x 100

text

### 2.3 Variables

| Variable | Description | Data Source |
|----------|-------------|-------------|
| Resolved Hazards | Hazards with status = 'resolved' | Firestore hazards collection |
| Total Hazards | Sum of 'pending' and 'resolved' hazards | Firestore hazards collection |

---

## 3. Calculation Logic

### 3.1 Firestore Query
const hazardsRef = collection(db, 'hazards');
const q = query(hazardsRef, where('status', 'in', ['pending', 'resolved']));
const querySnapshot = await getDocs(q);
const hazards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

text

### 3.2 Counting Logic
const totalHazards = hazards.length;
const resolvedHazards = hazards.filter(h => h.status === 'resolved').length;

text

### 3.3 Score Calculation
function calculateSafetyScore(resolved, total) {
if (total === 0) {
return 100; // No hazards means perfect safety score
}
return Math.round((resolved / total) * 100);
}

text

---

## 4. Example Calculations

### Example 1: Normal Operation

| Metric | Value |
|--------|-------|
| Total Hazards | 45 |
| Resolved Hazards | 37 |
| Pending Hazards | 8 |

**Calculation:**
Safety Score = (37 / 45) x 100 = 82.22% = 82%

text

### Example 2: Perfect Safety

| Metric | Value |
|--------|-------|
| Total Hazards | 10 |
| Resolved Hazards | 10 |
| Pending Hazards | 0 |

**Calculation:**
Safety Score = (10 / 10) x 100 = 100%

text

### Example 3: Poor Safety Performance

| Metric | Value |
|--------|-------|
| Total Hazards | 20 |
| Resolved Hazards | 5 |
| Pending Hazards | 15 |

**Calculation:**
Safety Score = (5 / 20) x 100 = 25%

text

### Example 4: No Hazards Reported

| Metric | Value |
|--------|-------|
| Total Hazards | 0 |
| Resolved Hazards | 0 |
| Pending Hazards | 0 |

**Calculation:**
Safety Score = 100% (by definition, no hazards means safe)

text

---

## 5. Score Interpretation Guide

| Score Range | Color Code | Interpretation | Recommended Action |
|-------------|------------|----------------|-------------------|
| 90% - 100% | Green | Excellent | Maintain current protocols |
| 75% - 89% | Light Green | Good | Monitor trends |
| 60% - 74% | Yellow | Fair | Review hazard resolution process |
| 40% - 59% | Orange | Poor | Immediate process improvement needed |
| 0% - 39% | Red | Critical | Urgent management intervention required |

### 5.1 Color Hex Codes

| Status | Color | Hex Code |
|--------|-------|----------|
| Excellent | Green | #4CAF50 |
| Good | Light Green | #8BC34A |
| Fair | Yellow | #FFC107 |
| Poor | Orange | #FF9800 |
| Critical | Red | #F44336 |

---

## 6. Implementation in Analytics Dashboard

### 6.1 Component Integration
const SafetyScoreCard = ({ hazards }) => {
const total = hazards.length;
const resolved = hazards.filter(h => h.status === 'resolved').length;
const score = calculateSafetyScore(resolved, total);
const color = getScoreColor(score);

return (
<View style={styles.card}>
<Text style={styles.label}>Safety Score</Text>
<View style={[styles.progressCircle, { borderColor: color }]}>
<Text style={[styles.score, { color: color }]}>{score}%</Text>
</View>
<Text style={styles.subtext}>
{resolved} of {total} hazards resolved
</Text>
</View>
);
};

text

### 6.2 Progress Circle Component
const ProgressCircle = ({ percentage, color }) => {
return (
<View style={styles.circleContainer}>
<Svg height="120" width="120" viewBox="0 0 120 120">
<Circle cx="60" cy="60" r="54" stroke="#E0E0E0" strokeWidth="8" fill="none" />
<Circle
cx="60"
cy="60"
r="54"
stroke={color}
strokeWidth="8"
fill="none"
strokeDasharray={${2 * Math.PI * 54 * (percentage / 100)} ${2 * Math.PI * 54}}
strokeLinecap="round"
/>
</Svg>
<Text style={[styles.percentage, { color: color }]}>{percentage}%</Text>
</View>
);
};

text

---

## 7. Real-time Updates

### 7.1 Listener Implementation
useEffect(() => {
const hazardsRef = collection(db, 'hazards');
const q = query(hazardsRef, where('status', 'in', ['pending', 'resolved']));

const unsubscribe = onSnapshot(q, (snapshot) => {
const hazards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
setHazards(hazards);
const resolved = hazards.filter(h => h.status === 'resolved').length;
const total = hazards.length;
setSafetyScore(calculateSafetyScore(resolved, total));
});

return () => unsubscribe();
}, []);

text

### 7.2 Update Frequency

The Safety Score updates in real-time whenever:
- A new hazard is reported
- A hazard status changes from 'pending' to 'resolved'
- A hazard is deleted (if applicable)

---

## 8. Date Range Filters

The Safety Score can be filtered by date range:

| Filter | Query Condition |
|--------|-----------------|
| 24h | createdAt >= (now - 24 hours) |
| 7d | createdAt >= (now - 7 days) |
| 30d | createdAt >= (now - 30 days) |
| All Time | No date filter |

### 8.1 Filtered Calculation
function getFilteredSafetyScore(filter) {
const dateFilter = getDateRangeFilter(filter);
let queryConstraints = [where('status', 'in', ['pending', 'resolved'])];

if (dateFilter) {
queryConstraints.push(where('createdAt', '>=', dateFilter));
}

const q = query(collection(db, 'hazards'), ...queryConstraints);
// ... calculate score
}

text

---

## 9. Testing Validation

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| TC-SS-01 | 0 total, 0 resolved | 100% | Pass |
| TC-SS-02 | 10 total, 10 resolved | 100% | Pass |
| TC-SS-03 | 10 total, 5 resolved | 50% | Pass |
| TC-SS-04 | 10 total, 0 resolved | 0% | Pass |
| TC-SS-05 | 1 total, 1 resolved | 100% | Pass |
| TC-SS-06 | 100 total, 75 resolved | 75% | Pass |
| TC-SS-07 | 100 total, 90 resolved | 90% | Pass |
| TC-SS-08 | 100 total, 25 resolved | 25% | Pass |

---

## 10. Error Handling

### 10.1 Edge Cases

| Scenario | Handling |
|----------|----------|
| No hazards in database | Return 100% |
| Firestore connection fails | Display last known score + retry button |
| Missing status field | Treat as 'pending' |
| Negative numbers (impossible) | Return 0% |

### 10.2 Fallback Logic
function calculateSafetyScoreSafe(resolved, total) {
// Validate inputs
if (typeof resolved !== 'number' || typeof total !== 'number') {
console.error('Invalid inputs to calculateSafetyScore');
return 0;
}

// Handle edge cases
if (total <= 0) return 100;
if (resolved < 0) resolved = 0;
if (resolved > total) resolved = total;

// Calculate and round
return Math.round((resolved / total) * 100);
}

text

---

## 11. Performance Considerations

### 11.1 Optimization Strategies

| Strategy | Description |
|----------|-------------|
| Caching | Cache score for 30 seconds when filter unchanged |
| Indexing | Firestore composite index on status + createdAt |
| Batch reads | Use limit() for large datasets |
| Memoization | Use useMemo to prevent recalculation |

### 11.2 Caching Implementation
const cacheKey = safety_score_${filter};
const cached = await AsyncStorage.getItem(cacheKey);
if (cached && Date.now() - JSON.parse(cached).timestamp < 30000) {
return JSON.parse(cached).score;
}
// Calculate fresh score
// Store in cache
await AsyncStorage.setItem(cacheKey, JSON.stringify({
score: safetyScore,
timestamp: Date.now()
}));

text

---

## 12. Traceability Matrix

| Requirement | Description | Implementation Location |
|-------------|-------------|------------------------|
| FR-011 | Display supervisor dashboard | AnalyticsDashboardScreen.js |
| FR-013 | Generate analytics reports | analyticsService.js |
| NFR-001 | Dashboard loads within 3 seconds | Optimized queries |
| NFR-002 | Real-time updates within 2 seconds | Firestore onSnapshot |

---

## 13. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| May 31, 2026 | 1.0 | Annaliah Simasiku | Initial document creation |
| May 31, 2026 | 1.0 | Andre Cavota | Reviewed and formatted |

---

## 14. Document Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Analytics Lead | Annaliah Simasiku | AS | May 31, 2026 |
| Documentation Lead | Andre Cavota | AC | May 31, 2026 |
| Lead Developer | Klim Gelasius | KG | May 31, 2026 |
| Project Manager | Simon Shitana | SS | May 31, 2026 |
