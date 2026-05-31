# MineShield: Alert Types & Notification Payload Specification

| **Document Version** | 1.0 |
| :--- | :--- |
| **Project** | MineShield Mobile Safety System |
| **Phase** | Phase 3 |
| Alerts & SOS |
| **Lead** | Pombili |
| **Project Manager** | Simon Shitana |
| **Engineering Domain** | Mining Engineering & Occupational Safety |

---

## 1. Purpose

This document defines all alert types used in the MineShield system, their trigger conditions, target recipients, and the structure of notification payloads. This ensures consistent implementation across notificationService.js (FCM delivery), locationService.js (last known location for SOS), AlertBanner.js (in-app display), and SOSModal.js (emergency confirmation). All specifications comply with SRS Section 2.3 (FCM), Section 2.4 (Firebase Data Model), Section 4 (Performance and Security), and Use Case 2 (Fall Detection Alert).

## 2. Alert Types Overview

MineShield supports four primary alert types, each with specific behavior and urgency levels.

| Alert Type | Priority | Trigger | Recipients | SRS Reference |
|------------|----------|---------|------------|---------------|
| HAZARD | HIGH | Worker/Visitor submits hazard report | Supervisors, Safety Officers | Use Case 1 |
| SOS | CRITICAL | Manual button press or fall detection | ALL Supervisors (broadcast) | Use Case 2, FR-009, FR-010 |
| FALL_DETECTED | CRITICAL | Smartphone sensor detects abnormal motion | Supervisors + Safety Officers | Section 2.1, Section 4 (Reliability) |
| SYSTEM | MEDIUM | Admin action or system event | Relevant user role | Section 3 |

## 3. HAZARD Alert

Triggered when a worker or visitor reports a new hazard with description and image. Source file: src/services/firestoreService.js (on Firestore write to Hazards collection).

**Payload Structure:**

```json
{
  "type": "HAZARD",
  "priority": "HIGH",
  "title": "New Hazard Reported",
  "body": "Rockfall detected in Zone B - Level 3",
  "data": {
    "hazardId": "hz_abc123",
    "reporterId": "usr_5d9e...",
    "reporterName": "John Doe",
    "zoneId": "zone_B3",
    "zoneName": "Zone B - Level 3",
    "imageUrl": "https://firebasestorage.com/hazard_image.jpg",
    "description": "Large rockfall blocking main tunnel",
    "timestamp": "2025-04-03T14:32:00Z"
  }
}
