## MineShield - Emergency Response Protocol

**Version:** 1.0  
**Last Updated:** May 31, 2026  
**Document Owner:** Simon Shitana (Project Manager)  
**Target Audience:** All MineShield Users (Workers, Supervisors, Safety Officers, Visitors)

---

## Table of Contents

1. [Protocol Overview](#protocol-overview)
2. [Emergency Types & Response Levels](#emergency-types--response-levels)
3. [SOS Alert Protocol](#sos-alert-protocol)
4. [Fall Detection Protocol](#fall-detection-protocol)
5. [Hazard Reporting Protocol](#hazard-reporting-protocol)
6. [Supervisor Emergency Response Protocol](#supervisor-emergency-response-protocol)
7. [Visitor Emergency Protocol](#visitor-emergency-protocol)
8. [Offline Mode Emergency Protocol](#offline-mode-emergency-protocol)
9. [Communication Flow Chart](#communication-flow-chart)
10. [Post-Emergency Procedures](#post-emergency-procedures)
11. [Emergency Contact Matrix](#emergency-contact-matrix)
12. [Compliance & SRS Traceability](#compliance--srs-traceability)

---

## 1. Protocol Overview

MineShield is a smart safety monitoring system designed to improve workplace safety through real-time hazard reporting, sensor monitoring, and alert management. This Emergency Protocol document establishes standardized procedures for all users when responding to:

- Workplace hazards and safety risks
- Worker falls or medical emergencies
- Environmental dangers (gas, noise, unstable zones)
- SOS situations requiring immediate dispatch
- Communication failures or offline scenarios

**Core Principle:** MineShield supplements existing safety equipment and procedures. It does NOT replace certified mining safety equipment, trained personnel, or established emergency response teams.

---

## 2. Emergency Types & Response Levels

| Level | Classification | Description | Immediate Action | Responsible Role |
|-------|---------------|-------------|------------------|-------------------|
| **Level 1** | Critical Emergency | Life-threatening situation, major injury, collapse, fire, or severe gas leak | Trigger SOS immediately + evacuate | All users |
| **Level 2** | High Alert | Serious hazard requiring immediate supervisor attention (e.g., unstable ground, toxic gas detection) | Report hazard with photo + notify supervisor | Worker |
| **Level 3** | Monitoring Required | Potential risk requiring observation (e.g., noise above threshold, minor fall risk) | Log hazard, monitor situation | Worker/Supervisor |
| **Level 4** | Informational | Safety update, zone change, routine alert | Acknowledge notification | All users |

**Reference:** SRS Section 1.4 - Problem Statement addresses mining risks including falls, unsafe zones, and delayed hazard reporting.

---

## 3. SOS Alert Protocol

### 3.1 When to Trigger SOS

- Worker experiences or witnesses a medical emergency (chest pain, heat stroke, respiratory distress)
- Worker is trapped, injured, or unable to move
- Worker encounters a life-threatening hazard (fire, toxic gas, imminent collapse)
- Worker witnesses another worker in distress
- Any situation where the worker feels their life is in immediate danger

### 3.2 How to Trigger SOS
**Method 1: SOS Button on Worker Dashboard**

**Method 2: Voice/Manual (Fallback)**
- If app is inaccessible, use standard mine emergency communication channels
- Report to nearest supervisor immediately
- Use emergency call points

### 3.3 SOS Alert Data Transmitted

 Fall Detection Algorithm Parameters
- Detection threshold: 2.5g (gravity force)
- Significance change: > 2.0g difference
- Rolling window: 10 readings (2 seconds)
- Post-impact condition: Stationary < 1.2g
  
 Step 1: Phone detects fall pattern
   
Step 2: Device vibrates (500ms x3) + Alert modal appears
   
Step 3: "FALL DETECTED - Are you okay? SOS will be sent in 10 seconds"
   
  User taps "I'M OKAY" → Cancel SOS, log false alarm
  
  User taps "SEND SOS" → Immediate SOS triggered
  
  No response after 10 seconds → AUTO-SOS triggered
  
