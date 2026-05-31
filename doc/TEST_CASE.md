# MineShield App — Test Cases Document

| Field | Details |
|-------|---------|
| **Document Version** | 1.0 |
| **Last Updated** | 31 May 2026 |
| **Prepared By** | Teopolina Negonga |
| **Role** | Testing & QA Lead |
| **Project** | MineShield — Group 16 |
| **Submission Date** | 31 May 2026 |

---

## 1. Test Environment

| Environment | Configuration |
|-------------|---------------|
| **Test Devices** | Android 13, Android 15, Android 16 |
| **Network** | WiFi (50 Mbps), 4G LTE, Airplane mode (offline testing) |
| **App Version** | v3.0.0-final (Build #20260531) |
| **Backend** | Firebase (Firestore, Auth, Storage, FCM) |
| **Test Data** | Test accounts: worker@test.com, supervisor@test.com, visitor@test.com |

---

## 2. Test Case Overview (FR-001 to FR-015)

| Test ID | FR Reference | Description | Priority | Status |
|---------|-------------|-------------|----------|--------|
| TC-001 | FR-001 | User Registration | High | Pass |
| TC-002 | FR-002 | Secure Login and Logout | High | Pass |
| TC-003 | FR-003 | Hazard Reporting with Description and Image | High | Pass |
| TC-004 | FR-004 | Real-Time Hazard Storage | High | Pass |
| TC-005 | FR-005 | Hazards Displayed on Live Map | Medium | Pass |
| TC-006 | FR-006 | Zone Classification by Risk Level | Medium | Pass |
| TC-007 | FR-007 | Fall Detection Using Accelerometer | High | Pass |
| TC-008 | FR-008 | Noise Level Monitoring | Medium | Pass |
| TC-009 | FR-009 | Alerts Sent When Thresholds Are Exceeded | High | Pass |
| TC-010 | FR-010 | SOS Alert with Last Known Location | High | Pass |
| TC-011 | FR-011 | Supervisor Dashboard Display | High | Pass |
| TC-012 | FR-012 | Viewing Past Hazard Reports | Low | Pass |
| TC-013 | FR-013 | Analytics Report Generation | Medium | Pass |
| TC-014 | FR-014 | Visitor Alert Reception | Medium | Pass |
| TC-015 | FR-015 | Image Upload Support | High | Pass |

---

## 3. Detailed Test Cases

---

### TC-001: User Registration

| Field | Details |
|-------|---------|
| **Test ID** | TC-001 |
| **FR Reference** | FR-001 |
| **Priority** | High |
| **Preconditions** | App is installed. User has valid email address. Internet connection active. |
| **Test Data** | Email adress and password |
| **Test Steps** | 1. Open MineShield app. 2. Navigate to Register screen. 3. Enter valid email address. 4. Enter valid password (min 6 characters). 5. Select role (Worker/Supervisor/Visitor). 6. Tap Register button. |
| **Expected Result** | Account created successfully. User redirected to role-specific dashboard. Welcome message displayed. |
| **Actual Result** | Account created. User redirected to Worker dashboard. Toast message: "Registration successful". Firebase Auth confirmed new UID. |
| **Post-conditions** | User document created in Firestore `/users/{uid}`. User can log in. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-002: Secure Login and Logout

| Field | Details |
|-------|---------|
| **Test ID** | TC-002 |
| **FR Reference** | FR-002 |
| **Priority** | High |
| **Preconditions** | User has registered account. Valid credentials exist. |
| **Test Data** | Email: klimakiesha@gmail.com Password:  klim2005 |
| **Test Steps** | 1. Open app. 2. Enter registered email and password. 3. Tap Login. 4. Verify dashboard loads. 5. Tap Logout button. 6. Verify return to login screen. 7. Attempt to access dashboard via back button. |
| **Expected Result** | Login successful. Dashboard loads within 3 seconds. Logout clears session. Back button cannot access dashboard after logout. |
| **Actual Result** | Login successful (2 seconds). Dashboard displayed correctly. Logout returned to login screen. Back button did not bypass logout. |
| **Post-conditions** | Auth token invalidated. AsyncStorage cleared. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-003: Hazard Reporting with Description and Image

| Field | Details |
|-------|---------|
| **Test ID** | TC-003 |
| **FR Reference** | FR-003, FR-015 |
| **Priority** | High |
| **Preconditions** | User logged in as Worker. Camera/gallery permissions granted. Internet active. |
| **Test Data** | Description: "Loose rock on tunnel wall section B", Image: test-hazard.jpg |
| **Test Steps** | 1. Navigate to Report Hazard screen. 2. Enter hazard description. 3. Tap image upload button. 4. Select image from gallery OR capture new photo. 5. Select zone from dropdown. 6. Select severity level (Low/Medium/High/Critical). 7. Tap Submit Report. |
| **Expected Result** | Report submitted. Confirmation message shown. Hazard appears in Firestore `/hazards` collection. Image uploaded to Firebase Storage. |
| **Actual Result** | Confirmation: "Hazard reported successfully. Response team notified." Hazard documented in Firestore. Image URL stored. |
| **Post-conditions** | Hazard visible on Supervisor dashboard and Live Map. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-004: Real-Time Hazard Storage

| Field | Details |
|-------|---------|
| **Test ID** | TC-004 |
| **FR Reference** | FR-004 |
| **Priority** | High |
| **Preconditions** | Worker and Supervisor logged in on separate devices. Active internet connection. |
| **Test Steps** | 1. Worker submits hazard report. 2. Supervisor observes dashboard. 3. Measure time from submission to display. |
| **Expected Result** | Hazard appears on Supervisor dashboard within 2 seconds of submission. |
| **Actual Result** | Hazard appeared within 1.5 seconds. Firestore `onSnapshot()` listener triggered correctly. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-005: Hazards Displayed on Live Map

| Field | Details |
|-------|---------|
| **Test ID** | TC-005 |
| **FR Reference** | FR-005 |
| **Priority** | Medium |
| **Preconditions** | At least one hazard exists. User logged in. Location permission granted. |
| **Test Steps** | 1. Navigate to Map screen. 2. Observe hazard markers. 3. Submit new hazard. 4. Verify new marker appears within 5 seconds. |
| **Expected Result** | Hazard markers visible. New hazard appears within 5 seconds. Markers colour-coded by status (Red = pending, Green = resolved). |
| **Actual Result** | Red markers for pending hazards. New marker appeared within 4 seconds. Map zoom and pan functional. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-006: Zone Classification by Risk Level

| Field | Details |
|-------|---------|
| **Test ID** | TC-006 |
| **FR Reference** | FR-006 |
| **Priority** | Medium |
| **Preconditions** | User logged in as Supervisor. Zones configured in Firestore `/zones`. |
| **Test Steps** | 1. Navigate to Risk Zones screen. 2. Verify zone colours: Green (Safe), Yellow (Warning), Red (Danger). 3. Update zone risk level in Firestore. 4. Verify colour updates in real time. |
| **Expected Result** | Zones display correct colours. Changes reflect immediately. |
| **Actual Result** | Green/Yellow/Red zones visible. Colour updated within 2 seconds of risk level change. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-007: Fall Detection Using Accelerometer

| Field | Details |
|-------|---------|
| **Test ID** | TC-007 |
| **FR Reference** | FR-007 |
| **Priority** | High |
| **Preconditions** | User logged in as Worker. App in foreground. Accelerometer functional. |
| **Test Steps** | 1. Keep app open. 2. Simulate fall: shake phone sharply, then remain still. 3. Observe confirmation modal. 4. Test scenario A: Wait 10 seconds without response. 5. Test scenario B: Tap "I'M OKAY" immediately. |
| **Expected Result** | Modal appears within 1 second. Scenario A: SOS triggered after 10 seconds. Scenario B: Alert cancelled, modal closes. |
| **Actual Result** | Modal appeared with "Are you okay?" and vibration feedback. Scenario A: SOS sent. Scenario B: Alert cancelled. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-008: Noise Level Monitoring

| Field | Details |
|-------|---------|
| **Test ID** | TC-008 |
| **FR Reference** | FR-008 |
| **Priority** | Medium |
| **Preconditions** | User logged in. Microphone permission granted. |
| **Test Steps** | 1. Expose phone to loud noise (70%+ threshold). 2. Observe alert. 3. Check Firestore `/sensorLogs` collection. |
| **Expected Result** | Noise levels logged. Alert triggered at configured threshold (70%). Notification sent to supervisors. |
| **Actual Result** | Alert: "Unsafe noise reached 70% — alert sent to supervisors." Logs stored in Firestore. |
| **Status** | Pass |
| **Notes** | Team retained 70% threshold instead of 85dB per design decision. |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-009: Alerts Sent When Thresholds Are Exceeded

| Field | Details |
|-------|---------|
| **Test ID** | TC-009 |
| **FR Reference** | FR-009 |
| **Priority** | High |
| **Preconditions** | FCM configured. Supervisor logged in on separate device. |
| **Test Steps** | 1. Trigger threshold breach (fall detection or noise). 2. Check Supervisor device for push notification. 3. Verify notification content. |
| **Expected Result** | Push notification received. Contains worker name, timestamp, zone, and alert type. |
| **Actual Result** | Notification received: "Threshold breach: High noise level detected — worker@zoneB, 14:32:05". Single notification per alert (no duplicates after fix). |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-010: SOS Alert with Last Known Location

| Field | Details |
|-------|---------|
| **Test ID** | TC-010 |
| **FR Reference** | FR-010 |
| **Priority** | High |
| **Preconditions** | Worker logged in. Location permission granted. GPS active. |
| **Test Steps** | 1. Tap SOS button. 2. Observe 3-second countdown. 3. Confirm SOS. 4. Check Supervisor dashboard for location. |
| **Expected Result** | SOS sent with accurate GPS coordinates and street address. Supervisor notified immediately. |
| **Actual Result** | Countdown completed. Notification: "Emergency SOS signal broadcast." Location displayed correctly (actual GPS address, not hardcoded). |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-011: Supervisor Dashboard Display

| Field | Details |
|-------|---------|
| **Test ID** | TC-011 |
| **FR Reference** | FR-011 |
| **Priority** | High |
| **Preconditions** | User logged in as Supervisor. Hazards and workers exist. |
| **Test Steps** | 1. Navigate to Dashboard. 2. Verify metrics: active hazards, resolved today, live SOS, safe zones, latest activity. 3. Submit new hazard. 4. Verify dashboard updates. |
| **Expected Result** | Dashboard loads within 3 seconds. Real-time updates appear. All metrics accurate. |
| **Actual Result** | Loaded in 2.5 seconds after optimisation. Displayed: 26 active hazards, 2 live SOS, activity feed updated. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-012: Viewing Past Hazard Reports

| Field | Details |
|-------|---------|
| **Test ID** | TC-012 |
| **FR Reference** | FR-012 |
| **Priority** | Low |
| **Preconditions** | At least 3 hazard reports exist in Firestore. |
| **Test Steps** | 1. Navigate to Hazard History screen. 2. Verify list displays description, image thumbnail, date, location, status. 3. Tap any report to view details. |
| **Expected Result** | Past reports displayed correctly. Details view shows full information. |
| **Actual Result** | List loaded with 3 reports. Thumbnails visible. Detail view showed full description and image. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-013: Analytics Report Generation

| Field | Details |
|-------|---------|
| **Test ID** | TC-013 |
| **FR Reference** | FR-013 |
| **Priority** | Medium |
| **Preconditions** | User logged in as Supervisor. Hazard data exists. |
| **Test Steps** | 1. Navigate to Analytics Dashboard. 2. Verify Bar/Line/Pie charts display. 3. Apply date filters (24h, 7d, 30d, all time). 4. Verify safety score and average resolution time. |
| **Expected Result** | Charts accurate. Filters update data correctly. Percentages sum to 100%. PDF export option available. |
| **Actual Result** | All charts displayed. Safety score: 83%. Resolution time: 21.2 hours. Filters worked. Percentages corrected after bug fix. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-014: Visitor Alert Reception

| Field | Details |
|-------|---------|
| **Test ID** | TC-014 |
| **FR Reference** | FR-014 |
| **Priority** | Medium |
| **Preconditions** | Visitor account approved by admin. |
| **Test Steps** | 1. Log in as Visitor. 2. Verify visible features: safe zones, active alerts, safety guidelines, emergency contact. 3. Attempt to access hazard reporting. |
| **Expected Result** | Hazard reporting NOT visible. Visitor cannot submit reports. Read-only access. |
| **Actual Result** | Report Hazard button hidden. Navigation to report screen blocked. Message: "Zones are not currently being tracked in live feed" (expected behaviour). |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-015: Image Upload Support

| Field | Details |
|-------|---------|
| **Test ID** | TC-015 |
| **FR Reference** | FR-015 |
| **Priority** | High |
| **Preconditions** | Worker logged in. Camera and storage permissions granted. |
| **Test Steps** | 1. Navigate to Report Hazard. 2. Tap image upload. 3. Select from gallery. 4. Submit report. 5. Repeat using camera capture. |
| **Expected Result** | Both gallery and camera uploads succeed. Image appears with report on dashboard. |
| **Actual Result** | Gallery upload successful. Camera capture successful. Images stored in Firebase Storage `/hazard-images/{hazardId}/`. Download URL saved to Firestore. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

## 4. Test Execution Summary

| Android Version | Role | Tests Passed | Tests Failed | Pass Rate |
|-----------------|------|--------------|--------------|-----------|
| Android 16 | Supervisor | 15 | 0 | 100% |
| Android 15 | Worker | 15 | 0 | 100% |
| Android 13 | Visitor | 15 | 0 | 100% |

---

## 5. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Testing & QA Lead | Teopolina Negonga | *Electronically signed* | 31 May 2026 |
| Project Manager | Simon Shitana | *Electronically signed* | 31 May 2026 |

---

*End of Test Cases Document — MineShield App — 31 May 2026*
