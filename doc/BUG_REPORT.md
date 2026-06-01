# MineShield App — Bug Report

**Report Date:** 31 May 2026
# MineShield App — Bug Report

| Field | Details |
|-------|---------|
| **Document Version** | 1.0 |
| **Last Updated** | 31 May 2026 |
| **Prepared By** | Teopolina Negonga |
| **Role** | Testing & QA Lead |
| **Project** | MineShield — Group 16 |
| **Submission Date** | 31 May 2026 |

---

## Table of Contents

1. [Report Overview](#report-overview)
   - [Severity & Status Guide](#severity--status-guide)
   - [Status Definitions](#status-definitions)
   - [Bug Summary Table](#bug-summary-table)
2. [Detailed Bug Reports](#detailed-bug-reports)
   - [BUG-001: Session remains active after logout](#bug-001-session-remains-active-after-logout)
   - [BUG-002: Image upload crashes app on Android 16](#bug-002-image-upload-crashes-app-on-android-16)
   - [BUG-003: Zone classification shows hazard markers instead of zone colours](#bug-003-zone-classification-shows-hazard-markers-instead-of-zone-colours)
   - [BUG-004: Fall detection never triggers after shaking phone](#bug-004-fall-detection-never-triggers-after-shaking-phone)
   - [BUG-005: Noise level alert triggers at 70% instead of 85dB](#bug-005-noise-level-alert-triggers-at-70-instead-of-85db)
   - [BUG-006: Supervisor receives duplicate push notifications](#bug-006-supervisor-receives-duplicate-push-notifications)
   - [BUG-007: SOS alert shows incorrect last known location address](#bug-007-sos-alert-shows-incorrect-last-known-location-address)
   - [BUG-008: Supervisor dashboard loads beyond 3 seconds](#bug-008-supervisor-dashboard-loads-beyond-3-seconds)
   - [BUG-009: Pie chart displays incorrect hazard type percentages](#bug-009-pie-chart-displays-incorrect-hazard-type-percentages)
   - [BUG-010: Visitor can see and access hazard reporting screen](#bug-010-visitor-can-see-and-access-hazard-reporting-screen)

---

## Report Overview

### Severity & Status Guide

| Severity Level | Meaning | Status Options | Priority |
|----------------|---------|----------------|----------|
| **Critical** | App crashes or feature completely broken | Open / In Progress / Fixed / Closed | Must fix before submission |
| **Major** | Feature works but with serious issues | Open / In Progress / Fixed / Closed | Should fix before submission |
| **Minor** | Small issue, does not break functionality | Open / In Progress / Fixed / Closed | Fix if time allows |

### Status Definitions

| Status | Meaning | Next Action |
|--------|---------|-------------|
| **Open** | Bug has been found, not yet assigned | Assign to developer |
| **In Progress** | Developer is currently fixing the bug | Wait for fix |
| **Fixed** | Developer has applied a fix | Tester verifies |
| **Closed** | Fix verified, bug is resolved | No action needed |

### Bug Summary Table

| Bug ID | TC Ref | Short Description | Severity | Status | Assigned To | Fixed? |
|--------|--------|-------------------|----------|--------|-------------|--------|
| BUG-001 | TC-002 | Session remains active after logout | Major | Fixed | Frieda | Yes |
| BUG-002 | TC-003 | Image upload fails on Android 16 | Critical | Fixed | Messias | Yes |
| BUG-003 | TC-006 | Zones display only hazards, not zone colours | Major | Fixed | Klim | Yes |
| BUG-004 | TC-007 | Motion never detected for fall detection | Major | Fixed | Logic | Yes |
| BUG-005 | TC-008 | Noise alert triggers at 70% (kept as percentage) | Minor | Fixed | Logic | Yes |
| BUG-006 | TC-009 | Supervisor receives duplicate notifications | Minor | Fixed | Pombili | Yes |
| BUG-007 | TC-010 | SOS location shows wrong street address | Major | Fixed | Sesilia | Yes |
| BUG-008 | TC-011 | Dashboard loads beyond 3 seconds | Major | Fixed | Klim | Yes |
| BUG-009 | TC-013 | Pie chart displays incorrect percentages | Minor | Fixed | Annaliah | Yes |
| BUG-010 | TC-014 | Visitor can see hazard report button | Major | Fixed | Queen | Yes |

---

## Detailed Bug Reports

---

### BUG-001: Session remains active after logout

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-001 |
| **Test Case Reference** | TC-002 |
| **FR Reference** | FR-002 |
| **Date Found** | 28/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A03 Core / Android 13 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Frieda Angula |
| **Date Fixed** | 30/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as any user, tap the Logout button, press the back button immediately, and observe if the dashboard reappears. |
| **Expected Result** | User cannot access the dashboard after logout without logging in again. |
| **Actual Result** | Pressing the back button within 2 seconds after logout brought the user back to the dashboard. Auth token was not cleared instantly. |
| **Fix Applied** | Added immediate token invalidation. Cleared `AsyncStorage` before navigation. Added auth state listener to prevent back navigation. |
| **Notes** | Retested on Samsung A03 Core (Android 13), Samsung A06 (Android 15), Samsung Tab A9 (Android 16). Session now terminates correctly. |

---

### BUG-002: Image upload crashes app on Android 16

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-002 |
| **Test Case Reference** | TC-003 |
| **FR Reference** | FR-003, FR-015 |
| **Date Found** | 26/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung Tab A9 / Android 16 |
| **Severity** | Critical |
| **Status** | Fixed |
| **Assigned To** | Messias Haibondi |
| **Date Fixed** | 29/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Worker on an Android 16 device, navigate to the Report Hazard screen, tap the image upload button, select an image from the gallery, then tap Submit Report. |
| **Expected Result** | Image uploads to Firebase Storage and appears with the report. |
| **Actual Result** | App crashed immediately after selecting an image. White screen appeared with error: `"Permission denied for MediaStore"` on Android 16. |
| **Fix Applied** | Added new Android 16 storage permission handling. Updated the manifest with `READ_MEDIA_IMAGES`. Added `try-catch` for `MediaStore` exceptions. |
| **Notes** | Works on Samsung A03 Core (Android 13), Samsung A06 (Android 15), and Samsung Tab A9 (Android 16) after fix. |

---

### BUG-003: Zone classification shows hazard markers instead of zone colours

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-003 |
| **Test Case Reference** | TC-006 |
| **FR Reference** | FR-006 |
| **Date Found** | 24/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A03 Core / Android 13 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Klim Gelasius |
| **Date Fixed** | 26/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Supervisor on Android 13, navigate to the Risk Zones screen, and observe the zone display. |
| **Expected Result** | Safe zones displayed in Green, Warning zones in Yellow, Danger zones in Red. |
| **Actual Result** | Only hazard markers appeared on the map. No zone colour coding was visible. Risk level labels were missing. |
| **Fix Applied** | Added zone overlay component with colour polygons. Fixed Firestore query to fetch zone data correctly. |
| **Notes** | — |

---

### BUG-004: Fall detection never triggers after shaking phone

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-004 |
| **Test Case Reference** | TC-007 |
| **FR Reference** | FR-007 |
| **Date Found** | 24/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A06 / Android 15 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Logic Josephath |
| **Date Fixed** | 27/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Worker, keep the app open in the foreground, shake the phone sharply multiple times, and wait for the confirmation modal. |
| **Expected Result** | A confirmation modal appears within 1 second after a sharp shake, followed by vibration feedback. |
| **Actual Result** | No modal appeared. No vibration feedback. No SOS triggered. Sensor service was not detecting motion. |
| **Fix Applied** | Fixed accelerometer subscription logic. Adjusted detection threshold from `2.5g` to `2.0g`. Added permission check before starting the sensor listener. |
| **Notes** | Retested on Samsung A03 Core (Android 13), Samsung A06 (Android 15), Samsung Tab A9 (Android 16). Modal now appears within 1 second after a sharp shake. |

---

### BUG-005: Noise level alert triggers at 70% instead of 85dB

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-005 |
| **Test Case Reference** | TC-008 |
| **FR Reference** | FR-008 |
| **Date Found** | 25/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung Tab A9 / Android 16 |
| **Severity** | Minor |
| **Status** | Fixed |
| **Assigned To** | Logic Josephath |
| **Date Fixed** | 28/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Worker, expose the phone to a 70% noise level, and observe the alert trigger. |
| **Expected Result** | Alert triggers at the 85dB threshold. |
| **Actual Result** | "High noise level detected" message displayed at 70% volume. Team decided to retain percentage-based tracking instead of changing to 85dB. |
| **Fix Applied** | No code change made. Percentage threshold kept as designed. Documentation updated to reflect 70% as the alert trigger level. |
| **Notes** | Alert triggers correctly at 70% on Android 13, 15, and 16. Team chose to retain the percentage-based system. |

---

### BUG-006: Supervisor receives duplicate push notifications

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-006 |
| **Test Case Reference** | TC-009 |
| **FR Reference** | FR-009 |
| **Date Found** | 27/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A03 Core / Android 13 |
| **Severity** | Minor |
| **Status** | Fixed |
| **Assigned To** | Pombili Abraham |
| **Date Fixed** | 30/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Trigger a threshold breach such as fall detection, check the Supervisor device for notifications, and observe the notification count. |
| **Expected Result** | Supervisor receives one push notification per alert. |
| **Actual Result** | Supervisor received 3 identical notifications for the same alert. Duplicate FCM messages were being sent. |
| **Fix Applied** | Added deduplication logic in the notification service. Fixed a race condition causing multiple triggers. |
| **Notes** | After fix, only one notification appears. Tested on Android 15 and 16 as well. |

---

### BUG-007: SOS alert shows incorrect last known location address

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-007 |
| **Test Case Reference** | TC-010 |
| **FR Reference** | FR-010 |
| **Date Found** | 25/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A03 Core / Android 13 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Sesilia Estevanhu |
| **Date Fixed** | 28/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Worker with location permission granted, tap the SOS button, wait for the 3-second countdown, and check the Supervisor dashboard for the reported location. |
| **Expected Result** | SOS alert includes accurate GPS coordinates and the correct street address. |
| **Actual Result** | Location displayed as `"5093, Rhino Street, Ongwediva"` regardless of the actual test location. A hardcoded address was being used. |
| **Fix Applied** | Removed the hardcoded test address. Connected actual GPS coordinates to the reverse geocoding API. |
| **Notes** | Now displays the correct current address on Samsung A03 Core (Android 13), Samsung A06 (Android 15), and Samsung Tab A9 (Android 16). |

---

### BUG-008: Supervisor dashboard loads beyond 3 seconds

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-008 |
| **Test Case Reference** | TC-011 |
| **FR Reference** | FR-011 |
| **Date Found** | 26/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A06 / Android 15 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Klim Gelasius |
| **Date Fixed** | 29/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Supervisor, navigate to the Dashboard, and measure the time from navigation to full data display. |
| **Expected Result** | Dashboard loads within 3 seconds. |
| **Actual Result** | Loading spinner displayed for 5 seconds. Real-time data appeared after 5.2 seconds due to a slow Firestore query. |
| **Fix Applied** | Optimised Firestore queries. Added caching for static data. Reduced the number of listeners from 5 to 3. |
| **Notes** | After fix, dashboard loads within 2.5 seconds on Samsung A03 Core (Android 13), Samsung A06 (Android 15), and Samsung Tab A9 (Android 16). |

---

### BUG-009: Pie chart displays incorrect hazard type percentages

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-009 |
| **Test Case Reference** | TC-013 |
| **FR Reference** | FR-013 |
| **Date Found** | 28/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A06 / Android 15 |
| **Severity** | Minor |
| **Status** | Fixed |
| **Assigned To** | Annaliah Simasiku |
| **Date Fixed** | 30/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Supervisor, navigate to the Analytics Dashboard, and observe the Pie Chart for hazard distribution. |
| **Expected Result** | Percentages sum to 100% and match actual hazard counts. |
| **Actual Result** | Percentages totalled 120%. The data aggregation formula was incorrect. |
| **Fix Applied** | Fixed percentage calculation formula. Changed from `(count/total)*100` to a properly rounded calculation. Added a validation check. |
| **Notes** | Percentages now sum correctly to 100% on Samsung A03 Core (Android 13), Samsung A06 (Android 15), and Samsung Tab A9 (Android 16). |

---

### BUG-010: Visitor can see and access hazard reporting screen

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-010 |
| **Test Case Reference** | TC-014 |
| **FR Reference** | FR-014 |
| **Date Found** | 27/05/2026 |
| **Found By** | Teopolina Negonga |
| **Device / Android Version** | Samsung A06 / Android 16 |
| **Severity** | Major |
| **Status** | Fixed |
| **Assigned To** | Queen Tulikeni Hanghome |
| **Date Fixed** | 29/05/2026 |
| **Verified By** | Teopolina Negonga |
| **Steps to Reproduce** | Log in as Visitor on Android 16, check the bottom navigation bar, and attempt to navigate to the hazard reporting screen. |
| **Expected Result** | The hazard reporting option is not visible to Visitor role users. |
| **Actual Result** | The "Report Hazard" button was visible to Visitors. When tapped, the app showed an error but did not block navigation properly. |
| **Fix Applied** | Removed the Report Hazard button from `VisitorNavigator`. Added role-based route protection. |
| **Notes** | Visitor users now only see: safe zones, active alerts, safety guidelines, and emergency contact. Tested on Samsung A03 Core (Android 13), Samsung A06 (Android 15), and Samsung Tab A9 (Android 16). |

---

*End of Bug Report — MineShield App — 31 May 2026*
