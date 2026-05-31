# RISK LEVELS DOCUMENTATION

**Author:** Hafeni Hilokuah (Risk Zones Management)  
**FR Reference:** FR-005, FR-006, FR-013  
**Last Updated:** May 31, 2026  
**Role:** Risk Zones Management

---

## 1. Overview

MineShield implements a comprehensive three-tier risk classification system for all mine operational zones. This system enables supervisors and safety officers to quickly identify hazardous areas, assess threat levels, and take appropriate action. The risk levels are dynamically calculated based on real-time sensor data, hazard frequency, and historical incident patterns.

---

## 2. Risk Level Definitions

### 2.1 Safe Zone (Green)

| Property | Value |
|----------|-------|
| **Color Code** | `#4CAF50` |
| **Threat Index Range** | 0 - 34 |
| **Icon** | 🟢 |

**Description:** Normal operational area with no immediate hazards. Standard safety protocols apply. Workers can perform regular duties without additional restrictions.

**Criteria for Safe Classification (ALL must be met):**
- Methane (CH₄) levels < 0.5%
- Oxygen (O₂) levels between 19.5% - 22.0%
- Temperature between 15°C - 30°C
- No unresolved active hazards in zone
- No recent incidents (last 24 hours)
- Threat index < 35

**Actions Required:**
- Routine monitoring only
- Standard safety checks
- Regular hazard reporting encouraged

**Worker Access:** ✅ Full access permitted

---

### 2.2 Warning Zone (Yellow)

| Property | Value |
|----------|-------|
| **Color Code** | `#FFA500` |
| **Threat Index Range** | 35 - 69 |
| **Icon** | 🟡 |

**Description:** Area with elevated risk factors requiring heightened caution. Supervisors should increase monitoring frequency. Workers must use appropriate Personal Protective Equipment (PPE).

**Criteria for Warning Classification (ANY of the following):**
- Methane (CH₄) levels between 0.5% - 1.0%
- Oxygen (O₂) levels between 18.0% - 19.5%
- Temperature between 30°C - 35°C OR 5°C - 15°C
- Active hazards present but under control (1-3 unresolved)
- Recent incident within last 24-48 hours
- Threat index between 35-69

**Actions Required:**
- Increased monitoring frequency (every 30 minutes)
- Caution advised for all personnel
- Mandatory PPE enforcement
- Supervisor notification required

**Worker Access:** ⚠️ Access with PPE and heightened caution

---

### 2.3 Danger Zone (Red)

| Property | Value |
|----------|-------|
| **Color Code** | `#FF4444` |
| **Threat Index Range** | 70 - 100 |
| **Icon** | 🔴 |

**Description:** High-risk area requiring immediate intervention. Zone entry is restricted to emergency response personnel only. Immediate evacuation may be required.

**Criteria for Danger Classification (ANY of the following):**
- Methane (CH₄) levels > 1.0% (immediate critical)
- Oxygen (O₂) levels < 18.0% (immediate critical)
- Temperature > 35°C OR < 5°C
- 4+ active unresolved hazards in zone
- Critical incident within last 24 hours
- Threat index ≥ 70

**Actions Required:**
- Immediate supervisor alert
- Consider zone evacuation
- Safety officer notification
- Incident response team dispatch
- Document all activities

**Worker Access:** 🚫 Restricted / No access until resolved

---

## 3. Risk Calculation Formula

### 3.1 Threat Index Calculation

The threat index is calculated using weighted sensor data and hazard metrics:


### 3.2 Individual Component Scoring Tables

#### Methane Score (CH₄)

| Methane Level | Score | Classification |
|---------------|-------|----------------|
| > 1.5% | 100 | Critical - Immediate evacuation |
| 1.0% - 1.5% | 70 | High - Danger zone activation |
| 0.5% - 1.0% | 40 | Elevated - Warning zone |
| 0.1% - 0.5% | 20 | Low - Safe zone |
| < 0.1% | 0 | Normal |

#### Oxygen Score (O₂)

| Oxygen Level | Score | Classification |
|--------------|-------|----------------|
| < 18.0% | 100 | Critical - Immediate evacuation |
| 18.0% - 19.5% | 70 | High - Danger zone activation |
| 19.5% - 20.5% | 30 | Elevated - Warning zone |
| 20.5% - 22.0% | 10 | Normal - Safe zone |
| > 22.0% | 20 | Elevated (oxygen enrichment) |

#### Temperature Score

| Temperature Range | Score | Classification |
|-------------------|-------|----------------|
| > 45°C | 100 | Critical heat hazard |
| 40°C - 45°C | 80 | Severe heat hazard |
| 35°C - 40°C | 60 | Heat stress risk |
| 30°C - 35°C | 30 | Elevated temperature |
| 15°C - 30°C | 0 | Normal range |
| 5°C - 15°C | 20 | Cool conditions |
| 0°C - 5°C | 40 | Cold stress risk |
| < 0°C | 100 | Critical cold hazard |

#### Hazard Score

| Active Hazards | Score | Classification |
|----------------|-------|----------------|
| 5+ | 100 | Critical - Multiple hazards |
| 4 | 80 | Severe - Active danger zone |
| 3 | 60 | Elevated - Warning zone |
| 2 | 40 | Moderate - Monitor closely |
| 1 | 20 | Low - Safe with caution |
| 0 | 0 | Normal - Safe zone |

---

## 4. Zone Status Transitions

### 4.1 Transition Rules

Risk levels can transition based on sensor readings, hazard resolution, and time-based decay:


**Escalation Rules:**
- Threat index increases by ≥15 points in a single reading → escalate to higher risk level
- Two consecutive readings in higher risk range → confirm escalation
- Critical sensor reading (methane > 1.5% OR oxygen < 18%) → immediate Danger classification

**De-escalation Rules:**
- Threat index remains in lower range for ≥30 consecutive minutes → de-escalate
- All critical hazards resolved in zone → reconsider risk level
- Supervisor override with justification required for manual de-escalation

### 4.2 Transition Example

| Time | Methane | O₂ | Temp | Threat Index | Status |
|------|---------|----|------|--------------|--------|
| 08:00 | 0.3% | 20.5% | 22°C | 12 | 🟢 Safe |
| 08:15 | 0.6% | 20.1% | 23°C | 38 | 🟡 Warning |
| 08:30 | 1.1% | 19.2% | 24°C | 68 | 🟡 Warning |
| 08:45 | 1.3% | 18.5% | 25°C | 82 | 🔴 Danger |

---

## 5. Emergency Response Triggers

### 5.1 Automatic Triggers

| Trigger Condition | Threshold | Response Action | Notification Recipients |
|-------------------|-----------|-----------------|------------------------|
| Immediate Evacuation | Threat index ≥ 85 | Alert all workers in zone, force notification | All workers, All supervisors |
| Critical Methane | > 1.5% | Zone lockdown, escalate to safety officer | Supervisors, Safety Officer, PM |
| Critical Oxygen | < 18.0% | Immediate evacuation alert | Supervisors, Emergency Response |
| Supervisor Alert | Threat index ≥ 70 | Send push notification to all supervisors | All supervisors |
| Zone Lockdown | Methane > 1.5% OR O₂ < 18% | Restrict access via digital system | Security, Supervisors |

### 5.2 Response Priority Levels

| Priority | Threat Index | Response Time | Required Action |
|----------|--------------|---------------|-----------------|
| P0 (Critical) | 90-100 | Immediate (0-2 min) | Full evacuation, emergency services |
| P1 (High) | 75-89 | Urgent (2-5 min) | Zone lockdown, supervisor dispatch |
| P2 (Medium) | 50-74 | Within 15 min | Supervisor investigation |
| P3 (Low) | 35-49 | Within 1 hour | Monitoring increase |
| P4 (Monitor) | 0-34 | Routine | Standard monitoring |

---

## 6. Historical Risk Tracking

### 6.1 Data Storage

All risk level changes are automatically logged in Firestore's `sensorLogs` collection with:

```javascript
{
  zoneId: "string",
  zoneName: "string",
  previousRiskLevel: "Safe|Warning|Danger",
  newRiskLevel: "Safe|Warning|Danger",
  previousThreatIndex: number,
  newThreatIndex: number,
  triggeringSensorValues: {
    methane: number,
    oxygen: number,
    temperature: number,
    activeHazards: number
  },
  timestamp: "ISO timestamp",
  triggeredBy: "system|supervisor",
  supervisorId: "string (if manual override)",
  notes: "string"
}
