# Worker Features – MineShield

## Overview
The MineShield Worker application transforms a standard Android smartphone into a personal safety device. All features comply with SRS FR-001 through FR-015.

## 1. Authentication (FR-001, FR-002)
- **Login/Register**: Email/password authentication via Firebase Auth
- **Role-based redirection**: Workers automatically land on `WorkerDashboardScreen`
- **Session persistence**: User stays logged in until explicit logout

## 2. Hazard Reporting (FR-003)
| Field | Type | Required |
|-------|------|----------|
| Description | Text (10-500 chars) | Yes |
| Zone | Dropdown (from Firestore) | Yes |
| Severity | Low/Medium/High | Yes |
| Photo | Image (camera/gallery) | No |
| Location | GPS or manual | Yes |

**Flow:**
1. Worker fills form
2. Image uploaded to Firebase Storage (if provided)
3. Document created in `hazards` collection
4. Supervisor dashboard updates in real-time via `onSnapshot()`

## 3. Fall Detection (FR-007)
**Algorithm (sensorService.js):**
- Accelerometer update interval: 200ms
- Impact threshold: >2.5g
- Inactivity window: <1.2g for 2 seconds after impact
- Confirmation timeout: 10 seconds

**User Flow:**
1. Fall detected → Vibration + modal
2. If "I'M OKAY" → Cancel alert
3. If no response → Auto-trigger SOS with location

## 4. SOS Alerts (FR-009, FR-010)
- Manual SOS button on dashboard
- Automatic SOS from unconfirmed fall detection
- Payload includes: `{ userId, location, timestamp, type: 'fall'|'manual' }`
- Broadcast to all supervisors via FCM

## 5. My Reports
- Filterable list (All/Pending/Resolved)
- Each hazard shows: description, zone, status, timestamp
- Tap to view full details including uploaded image

## 6. Safety Tips
- Mining-specific safety guidelines
- Emergency contact numbers (one-tap dial)
- Offline-accessible content

## 7. Help & Support
- FAQ section (expanding cards)
- Email support link
- App version display

## 8. Offline Support (FR-015)
- Hazard reports queued in AsyncStorage when offline
- Automatic sync when connection returns
- Local cache of recent hazards

## SRS Traceability
| FR# | Description | Implementation File |
|-----|-------------|---------------------|
| FR-001 | User Registration | `authService.js` |
| FR-002 | User Login | `authService.js` |
| FR-003 | Hazard Reporting | `ReportHazardScreen.js` |
| FR-007 | Fall Detection | `sensorService.js`, `useSensors.js` |
| FR-009 | SOS Alerts | `SOSModal.js`, `alertService.js` |
| FR-010 | Location on SOS | `locationService.js` |
| FR-015 | Offline Buffering | `offlineService.js` |

## Demo Preparation Checklist
- [ ] APK installed on Phone #2 (Android 12)
- [ ] Worker test account created (`worker@test.com` / `password123`)
- [ ] Camera and microphone permissions granted
- [ ] Location permission set to "Allow all the time"
- [ ] Fall detection tested (shake phone)
- [ ] SOS notification verified on supervisor phone

---
*Document prepared for Phase 3 submission – May 31, 2026*
