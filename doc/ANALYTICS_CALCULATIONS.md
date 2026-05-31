# MINESHIELD PHASE 3 - ANALYTICS CALCULATIONS

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | MineShield - Mining Safety & Hazard Management System |
| **Document Title** | Analytics Dashboard Calculations Specification |
| **Version** | 1.0 |
| **Last Updated** | May 31, 2026 |
| **Responsible** | Annaliah Simasiku (Analytics Dashboard Lead) |
| **Reviewed By** | Klim Gelasius (Lead Developer), Andre Cavota (Documentation Lead) |
| **Phase** | Phase 3 - Final Deliverables |

---

## 1. Executive Summary

This document defines all analytical calculations used in the MineShield Supervisor Analytics Dashboard. These metrics are derived from Firestore hazard and alert data and are displayed using BarChart, LineChart, and PieChart components. All calculations are performed in `src/screens/supervisor/AnalyticsDashboardScreen.js` and helper functions in `src/services/analyticsService.js`. This document serves as the technical specification for FR-013 implementation.

---

## 2. Core Metrics Calculations

### 2.1 Safety Score

**Formula:**

Safety Score = (Resolved Hazards / Total Hazards) x 100

**Example Calculation:**

- Total Hazards = 45
- Resolved Hazards = 37
- Safety Score = (37 / 45) x 100 = 82.22% = 82%

**Display Format:** Percentage with circular progress indicator

---

### 2.2 Active Hazards Count

**Definition:** Number of hazards with status = 'pending'

**Update Frequency:** Real-time (Firestore onSnapshot listener)

---

### 2.3 Hazards Resolved Today

**Definition:** Number of hazards with status = 'resolved' and resolvedAt date = today

---

### 2.4 Average Resolution Time

**Formula:**

Avg Resolution Time = Sum(ResolvedAt - CreatedAt) / Number of Resolved Hazards

**Display Format:** Hours with 1 decimal place (e.g., "21.2 hours")

---

### 2.5 Hazards by Zone

**Definition:** Count of hazards grouped by mine zone

**Display Format:** Pie Chart with zone names and percentages

---

### 2.6 Hazards by Type

**Definition:** Count of hazards grouped by hazard category

**Firestore Field:** hazardType

**Display Format:** Pie Chart or Horizontal Bar Chart

---

### 2.7 Hazards by Weekday

**Definition:** Count of hazards created on each day of the week (Sunday-Saturday)

**Display Format:** Line Chart showing weekly pattern

---

### 2.8 Hazards by Time of Day

**Definition:** Count of hazards created in each 4-hour block

**Time Blocks:**
- Midnight (00:00-03:59)
- Early Morning (04:00-07:59)
- Morning (08:00-11:59)
- Afternoon (12:00-15:59)
- Evening (16:00-19:59)
- Night (20:00-23:59)

---

### 2.9 Weekly Hazard Trend

**Definition:** Number of hazards created per day for the last 7 days

**Display Format:** Line Chart with date labels

---

### 2.10 Open vs Resolved Comparison

**Definition:** Comparison between pending and resolved hazards

**Display Format:** Pie Chart or Stacked Bar Chart

---

### 2.11 Alert Frequency (Last 30 Days)

**Definition:** Number of alerts triggered per day over last 30 days

**Alert Types:**
- SOS - User-initiated emergency
- FALL_DETECTED - Automatic fall detection
- HAZARD_REPORTED - New hazard notification

---

### 2.12 Responded vs Unresponded Alerts

**Definition:** Alert response rate tracking

**Response Rate Color Coding:**

| Response Rate | Color | Status |
|---------------|-------|--------|
| Greater than 90% | Green | Good |
| 70% to 90% | Yellow | Warning |
| Less than 70% | Red | Critical |

---

### 2.13 Sensor Data Summary

**Definition:** Aggregated sensor readings from accelerometer

**Metrics Tracked:**
- Total fall events detected
- Average impact magnitude
- Most active time period for falls

---

## 3. Date Range Filters

| Filter | Description | Query Condition |
|--------|-------------|-----------------|
| 24h | Last 24 hours | createdAt >= (now - 24h) |
| 7d | Last 7 days | createdAt >= (now - 7d) |
| 30d | Last 30 days | createdAt >= (now - 30d) |
| All Time | No date filter | None |

---

## 4. Helper Functions
function getDateRangeFilter(range) {
const now = new Date();
switch(range) {
case '24h':
return new Date(now.getTime() - 24 * 60 * 60 * 1000);
case '7d':
return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
case '30d':
return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
case 'all':
default:
return null;
}
}

function calculateSafetyScore(resolved, total) {
if (total === 0) return 100;
return Math.round((resolved / total) * 100);
}

function formatHours(hours) {
const rounded = Math.round(hours * 10) / 10;
return rounded + ' hours';
}

text

---

## 5. Example Response Data Structure
{
safetyScore: 82,
activeHazards: 8,
resolvedToday: 3,
avgResolutionHours: 21.2,
totalHazards: 45,
hazardsByZone: {
'North Tunnel': 12,
'South Shaft': 18,
'Processing Plant': 15
},
hazardsByType: {
'Rockfall': 10,
'Gas Leak': 8,
'Equipment': 20,
'Other': 7
},
weeklyTrend: [5, 7, 4, 6, 8, 9, 6],
responseRate: 94,
totalAlerts: 32,
respondedAlerts: 30
}

text

---

## 6. Traceability Matrix

| Metric | SRS Reference | FR Reference |
|--------|---------------|--------------|
| Safety Score | Section 4 - Analytics | FR-013 |
| Active Hazards | Section 3 - Functional | FR-011 |
| Hazards Resolved Today | Section 3 - Functional | FR-011, FR-013 |
| Average Resolution Time | Section 3 - Functional | FR-013 |
| Hazards by Zone | Section 3 - Functional | FR-006, FR-013 |
| Hazards by Type | Section 3 - Functional | FR-013 |
| Weekly Trend | Section 3 - Functional | FR-013 |
| Open vs Resolved | Section 3 - Functional | FR-011, FR-013 |
| Alert Statistics | Section 3 - Functional | FR-010, FR-013 |
| Sensor Data Summary | Section 3 - Functional | FR-007, FR-013 |

---

## 7. Testing Validation

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| TC-AN-01 | Safety Score with 0 hazards | 100% | Pass |
| TC-AN-02 | Safety Score with 10/10 resolved | 100% | Pass |
| TC-AN-03 | Safety Score with 5/10 resolved | 50% | Pass |
| TC-AN-04 | Avg resolution time with no resolved | N/A | Pass |
| TC-AN-05 | Date filter changes chart data | Charts update | Pass |
| TC-AN-06 | Real-time active hazard increment | Count updates live | Pass |

---

## 8. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| May 31, 2026 | 1.0 | Annaliah Simasiku | Initial document creation |

---

## 9. Document Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Analytics Lead | Annaliah Simasiku | AS | May 31, 2026 |
| Documentation Lead | Andre Cavota | AC | May 31, 2026 |
| Lead Developer | Klim Gelasius | KG | May 31, 2026 |
| Project Manager | Simon Shitana | SS | May 31, 2026 |
