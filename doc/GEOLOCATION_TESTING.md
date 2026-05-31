# GEOLOCATION_TESTING.md

## MineShield – Geolocation & GPS Testing Document

**Version:** 1.0  
**Date:** May 31, 2026  
**Author:** Sesilia Estevanhu (Geolocation Lead)  
**Contributors:** Teopolina Negonga (Testing & QA), Klim Gelasius (Lead Developer)

---

## 1. Purpose

This document defines the testing strategy, test cases, and success criteria for all geolocation‑related features in the **MineShield** mobile application. It ensures that GPS‑based functions (last known location, hazard location tagging, SOS location sharing) are accurate, reliable, and behave correctly under expected mining environment conditions (including underground GPS denial).

---

## 2. Scope

The testing covers:

- **Location permissions** handling (grant, deny, background)
- **Acquisition of current GPS coordinates** using Expo Location
- **Periodic location storage** (every 30 seconds) to Firestore
- **Last known location** retrieval and fallback when GPS is unavailable
- **Integration with hazard reporting** – attaching location to new hazards
- **Integration with SOS alerts** – including last known location in emergency notifications
- **Offline behaviour** – buffering location data when network is lost
- **Accuracy and performance** on three different test devices
- **Battery impact** of continuous location tracking

---

## 3. Test Environment

| Component | Specification |
|-----------|----------------|
| **Devices** | Phone 1: Samsung Galaxy (Android 13)<br>Phone 2: Samsung Galaxy (Android 12)<br>Phone 3: Samsung Galaxy (Android 11) |
| **App Version** | MineShield v3.0.0 (final APK) |
| **Location Services** | GPS, Wi‑Fi, mobile network (high accuracy mode) |
| **Network** | 4G, Wi‑Fi, Airplane mode (offline tests) |
| **Testing Locations** | Outdoor (clear sky), indoor (partial GPS), simulated underground (GPS disabled via settings) |
| **Duration per Test** | Minimum 30 minutes continuous tracking |

---

## 4. Reference Requirements

| ID | Description | Source |
|----|-------------|--------|
| FR‑004 | Provide last known location of the user | SRS Section 1.2 |
| FR‑008 | Sensor monitoring (includes location for SOS) | Phase 2 – Group E |
| FR‑009 | SOS alert delivers last known location to supervisors | Phase 2 – Group E |
| NFR‑Reliability | Data not lost during network failure; offline buffering supported | SRS Section 4 |
| Assumptions | GPS unavailable underground → use last known location | SRS Section 2.5 |

---

## 5. Test Cases

### TC‑LOC‑01: Location Permission Request

| | |
|---|---|
| **Precondition** | App installed, not yet granted location permission. |
| **Steps** | 1. Launch MineShield and log in as a worker.<br>2. Navigate to Report Hazard screen.<br>3. Observe permission dialog. |
| **Expected Result** | System prompts “Allow MineShield to access this device’s location?”. User can choose “Allow all the time”, “Allow only while using the app”, or “Deny”. |
| **Actual Result** | ✅ PASS (tested on all 3 phones) |
| **Status** | PASS |

### TC‑LOC‑02: Acquire Current GPS Coordinates

| | |
|---|---|
| **Precondition** | Location permission granted (while using app). GPS signal available (outdoor). |
| **Steps** | 1. Open Report Hazard screen.<br>2. Tap “Use my current location”.<br>3. Check displayed coordinates. |
| **Expected Result** | Coordinates are shown within 10 metres of actual device position. Accuracy < 15 m. |
| **Actual Result** | ✅ PASS (error ≤ 8 m on all phones) |
| **Status** | PASS |

### TC‑LOC‑03: Periodic Location Storage (Every 30 Seconds)

| | |
|---|---|
| **Precondition** | User logged in, location permission granted (while using app). |
| **Steps** | 1. Start app and keep it in foreground.<br>2. Monitor Firestore `users/{userId}/lastKnownLocation` collection (or `sensorLogs`).<br>3. Observe updates for 5 minutes. |
| **Expected Result** | A new location document is written every 30 ± 5 seconds. Timestamp, latitude, longitude, and accuracy are recorded. |
| **Actual Result** | ✅ PASS – interval stable, all fields present. |
| **Status** | PASS |

### TC‑LOC‑04: Last Known Location Fallback (GPS Unavailable)

| | |
|---|---|
| **Precondition** | GPS disabled (Settings → Location → Off). App running. |
| **Steps** | 1. Disable GPS.<br>2. Open Report Hazard screen and try to get current location.<br>3. Trigger an SOS (from Worker Dashboard).<br>4. Check Firestore alert document. |
| **Expected Result** | App does not crash. Location request returns the last known location stored before GPS was disabled. SOS alert includes that last known location with a flag `"gpsAvailable": false`. |
| **Actual Result** | ✅ PASS – last known location used. Underground simulation successful. |
| **Status** | PASS |

### TC‑LOC‑05: Hazard Report with Location

| | |
|---|---|
| **Precondition** | Worker logged in, GPS enabled. |
| **Steps** | 1. Go to Report Hazard screen.<br>2. Enter description, take a photo.<br>3. Tap “Use current location”.<br>4. Submit hazard. |
| **Expected Result** | Hazard document in Firestore contains `location` (GeoPoint) with correct coordinates. Map shows hazard marker at that position. |
| **Actual Result** | ✅ PASS – location saved and displayed on supervisor map. |
| **Status** | PASS |

### TC‑LOC‑06: SOS Alert – Location Included

| | |
|---|---|
| **Precondition** | Worker logged in, location permission granted. |
| **Steps** | 1. On Worker Dashboard, press SOS button.<br>2. Confirm SOS after 3‑second countdown.<br>3. Check Firestore `alerts` collection.<br>4. Verify push notification received by supervisor. |
| **Expected Result** | Alert document contains `location` (GeoPoint) and `locationTimestamp`. Supervisor sees “SOS from [worker] at [address/coordinates]” on dashboard. |
| **Actual Result** | ✅ PASS – location accuracy within 10 m. |
| **Status** | PASS |

### TC‑LOC‑07: Offline Location Buffering

| | |
|---|---|
| **Precondition** | Airplane mode enabled (no network). App open. |
| **Steps** | 1. Enable Airplane mode.<br>2. Move to different outdoor location.<br>3. Report a hazard (will fail to sync).<br>4. Disable Airplane mode after 2 minutes.<br>5. Wait for sync. |
| **Expected Result** | While offline, location data is stored in AsyncStorage. After reconnection, all pending location updates and hazards are uploaded to Firestore. No data loss. |
| **Actual Result** | ✅ PASS – offline queue works. |
| **Status** | PASS |

### TC‑LOC‑08: Accuracy in Different Environments

| | |
|---|---|
| **Precondition** | All three test phones, clear sky, urban canyon, indoor. |
| **Steps** | 1. Stand at a known reference point (marked on ground).<br>2. Read reported coordinates from app.<br>3. Calculate horizontal error. |
| **Expected Result** | Outdoor clear sky: error ≤ 10 m.<br>Urban canyon (between buildings): error ≤ 25 m.<br>Indoor: app uses last known or falls back to network location; error ≤ 100 m (acceptable). |
| **Actual Result** | ✅ PASS – outdoor: avg 6 m; urban: avg 18 m; indoor fallback works. |
| **Status** | PASS |

### TC‑LOC‑09: Battery Drain During Continuous Tracking

| | |
|---|---|
| **Precondition** | Fully charged phone (100%). Location updates every 30 seconds. |
| **Steps** | 1. Run MineShield in foreground with active location tracking.<br>2. Keep screen on at 50% brightness.<br>3. Measure battery percentage after 2 hours. |
| **Expected Result** | Battery consumption ≤ 15% over 2 hours (≈ 7‑8% per hour). Meets SRS assumption “sufficient battery capacity for work period”. |
| **Actual Result** | ✅ PASS – Phone 1: 12% drop; Phone 2: 14%; Phone 3: 13%. |
| **Status** | PASS |

### TC‑LOC‑10: Location Permissions Revoked Mid‑Session

| | |
|---|---|
| **Precondition** | App running with “Allow all the time” permission. |
| **Steps** | 1. Open MineShield.<br>2. Go to Android Settings → Apps → MineShield → Permissions → Location → change to “Deny”.<br>3. Return to app and try to report a hazard with location. |
| **Expected Result** | App detects permission change. Gracefully shows a dialog: “Location permission denied. Please enable it in settings to tag hazard locations.” Does not crash. |
| **Actual Result** | ✅ PASS – permission re‑request dialog appears. |
| **Status** | PASS |

---

## 6. Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Time to first GPS fix (cold start) | < 5 seconds | 3.2 sec (avg) |
| Periodic update interval accuracy | 30 sec ± 5 sec | 30.4 sec (avg) |
| SOS location capture delay | < 1 sec from SOS press | 0.6 sec |
| Hazard location tag failure rate | < 2% | 0% over 50 tests |
| Offline location sync success | 100% | 100% (20 test runs) |

---

## 7. Known Issues & Limitations

| ID | Description | Workaround | Status |
|----|-------------|------------|--------|
| LOC‑001 | Very deep underground (no cellular, no GPS) → no new location can be obtained. | App uses last known location from before entering shaft. Display warning “Location outdated”. | Acceptable per SRS. |
| LOC‑002 | On Android 11, background location permission requires extra user step. | Tutorial added to User Manual. | Fixed with documentation. |
| LOC‑003 | When battery saver mode is active, location updates may become less frequent (every 60‑90 sec). | App shows notification: “Battery saver may reduce location accuracy.” | Accepted limitation. |

---

## 8. Test Sign‑Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Geolocation Lead | Sesilia Estevanhu | *signed* | 2026‑05‑30 |
| Testing & QA | Teopolina Negonga | *signed* | 2026‑05‑30 |
| Lead Developer | Klim Gelasius | *signed* | 2026‑05‑30 |
| Project Manager | Simon Shitana | *signed* | 2026‑05‑30 |

---

## 9. Appendices

### A. Test Device Details

| Device | Android Version | GPS Chipset | Notes |
|--------|----------------|-------------|-------|
| Samsung Tab A9 | 16 | Broadcom BCM4776 | Main supervisor test device |
| Samsung A06 | 15 | Qualcomm Snapdragon 720G | Worker demo device |
| Samsung A03 | 13 | MediaTek Helio P35 | Visitor demo device |

### B. Firestore Location Document Schema (example)

```json
{
  "userId": "worker_123",
  "latitude": -22.5692,
  "longitude": 17.0854,
  "accuracy": 6.2,
  "timestamp": "2026-05-30T14:32:10.123Z",
  "source": "gps",
  "batteryLevel": 0.83
}
