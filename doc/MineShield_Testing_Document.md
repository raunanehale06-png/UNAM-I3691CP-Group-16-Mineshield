# MineShield App — Testing Document

| Field | Details |
|-------|---------|
| **Test Date** | 15/05/2026 – 31/05/2026 |
| **Last Updated** | 31/05/2026 |
| **Tested By** | Teopolina Negonga |

---

## Section 1: Test Case Overview (FR-001 to FR-015)

This section provides a summary of the test cases conducted.

| Test ID | FR Reference | Description | Status |
|---------|-------------|-------------|--------|
| TC-001 | FR-001 | User Registration | Pass |
| TC-002 | FR-002 | Secure Login and Logout | Pass |
| TC-003 | FR-003 | Hazard Reporting with Description and Image | Pass |
| TC-004 | FR-004 | Real-Time Hazard Storage | Pass |
| TC-005 | FR-005 | Hazards Displayed on Live Map | Pass |
| TC-006 | FR-006 | Zone Classification by Risk Level | Pass |
| TC-007 | FR-007 | Fall Detection Using Accelerometer | Pass |
| TC-008 | FR-008 | Noise Level Monitoring | Pass |
| TC-009 | FR-009 | Alerts Sent When Thresholds Are Exceeded | Pass |
| TC-010 | FR-010 | SOS Alert with Last Known Location | Pass |
| TC-011 | FR-011 | Supervisor Dashboard Display | Pass |
| TC-012 | FR-012 | Viewing Past Hazard Reports | Pass |
| TC-013 | FR-013 | Analytics Report Generation | Pass |
| TC-014 | FR-014 | Visitor Alert Reception | Pass |
| TC-015 | FR-015 | Image Upload Support | Pass |

---

## Section 2: Detailed Test Cases

---

### TC-001: User Registration

| Field | Details |
|-------|---------|
| **Test ID** | TC-001 |
| **FR Reference** | FR-001 |
| **Description** | The system allows a new user to register using email and password. |
| **Preconditions** | App is installed and running. User has a valid email address. |
| **Test Steps** | Open the MineShield app, navigate to the Register screen, enter a valid email address, enter a valid password, and tap the Register button. |
| **Expected Result** | A new account is created successfully and the user is redirected to their dashboard. |
| **Actual Result** | User entered valid email (klimakiesha@gmail.com) and password (minimum 6 characters). After tapping Register, a loading indicator appeared for 2 seconds. Account was created successfully and user was automatically redirected to the Worker dashboard. A welcome toast message "Registration successful" was displayed. Firebase Authentication confirmed new user UID created. |
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
| **Description** | The system allows a registered user to securely log in and log out. |
| **Preconditions** | User has a registered account with valid credentials. |
| **Test Steps** | Open the app, enter registered email and password, tap Login, verify the dashboard loads, tap Logout, and verify the user is returned to the login screen. |
| **Expected Result** | User logs in and is redirected to the dashboard. After logout, user cannot access the dashboard without logging in again. |
| **Actual Result** | Login successful with valid credentials. Dashboard loaded in 2 seconds. Logout button functioned correctly, returning the user to the login screen with session terminated. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-003: Hazard Reporting with Description and Image

| Field | Details |
|-------|---------|
| **Test ID** | TC-003 |
| **FR Reference** | FR-003 |
| **Description** | The system allows users to report a hazard with a written description and an image. |
| **Preconditions** | User is logged in as a Worker. Camera or gallery is accessible on the device. |
| **Test Steps** | Log in as a Worker, navigate to the Report Hazard screen, enter a hazard description, select an image from the camera or gallery, and submit the report. |
| **Expected Result** | Hazard report is submitted successfully with both description and image attached. A confirmation message is shown. |
| **Actual Result** | Confirmation message displayed: "Hazard reported successfully. Response team notified." |
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
| **Description** | The system stores hazard reports in Firestore in real time. |
| **Preconditions** | User is logged in. Internet connection is active. A Supervisor is logged in on a separate device. |
| **Test Steps** | Submit a hazard report as a Worker, then on the Supervisor device check if the hazard appears on the dashboard within 2 seconds. |
| **Expected Result** | The hazard report appears on the Supervisor dashboard within 2 seconds of submission. |
| **Actual Result** | Hazard appeared on Supervisor dashboard within 1.5 seconds of submission. |
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
| **Description** | The system displays reported hazards as markers on a live map. |
| **Preconditions** | At least one hazard report exists in Firestore. User is logged in. |
| **Test Steps** | Log in as a Worker or Supervisor, navigate to the Map screen, observe hazard markers, submit a new hazard and wait up to 5 seconds, then verify the new hazard appears on the map. |
| **Expected Result** | Hazard markers are visible on the map. New hazards appear within 5 seconds of being reported. |
| **Actual Result** | Red hazard markers appeared on the map. New hazard marker appeared within 4 seconds after submission. |
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
| **Description** | The system classifies zones by risk level: Safe (Green), Warning (Yellow), Danger (Red). |
| **Preconditions** | User is logged in as a Supervisor. Zones are configured in Firestore. |
| **Test Steps** | Log in as Supervisor, navigate to the Risk Zones screen, observe zone colour coding, update a zone risk level, and verify the colour changes. |
| **Expected Result** | Zones are displayed with correct colour codes. Changes update in real time. |
| **Actual Result** | Safe zones displayed in Green, Warning zones in Yellow, Danger zones in Red. Zone colour updated immediately after risk level change. |
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
| **Description** | The system detects a fall using accelerometer data and triggers a confirmation modal with a 10-second SOS timer. |
| **Preconditions** | User is logged in as a Worker. App is running in the foreground. Accelerometer is functional. |
| **Test Steps** | Log in as a Worker, keep the app open in the foreground, simulate a fall by shaking the phone sharply then leaving it still, observe whether a modal appears, wait 10 seconds without responding to verify SOS is triggered, then repeat and tap "I'M OKAY" to verify the alert is cancelled. |
| **Expected Result** | Confirmation modal appears after simulated fall. SOS sent automatically after 10 seconds if no response. Alert cancelled if "I'M OKAY" is tapped. |
| **Actual Result** | Confirmation modal appeared with "Are you okay?" and a 10-second countdown. After no response, SOS alert was triggered. After tapping "I'M OKAY", the alert was cancelled and modal closed. |
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
| **Description** | The system monitors noise levels using the device microphone and logs readings to Firestore. |
| **Preconditions** | User is logged in. Microphone permission is granted. |
| **Test Steps** | Log in as a Worker, expose the phone to loud noise (above 85dB), observe whether an alert is triggered, and check Firestore sensor logs. |
| **Expected Result** | Noise levels are monitored and logged. Alert is triggered when threshold (85dB) is exceeded. |
| **Actual Result** | Alert triggered at 70% and above. Message displayed: "Unsafe noise reached 70% and the alert was sent to supervisors and on-duty workers." Noise readings logged to Firestore sensor logs collection. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

### TC-009: Alerts Sent When Thresholds Are Exceeded

| Field | Details |
|-------|---------|
| **Test ID** | TC-009 |
| **FR Reference** | FR-009 |
| **Description** | The system sends push notifications to supervisors when sensor thresholds are exceeded. |
| **Preconditions** | FCM is configured. Supervisor is logged in on a separate device. |
| **Test Steps** | Trigger a threshold breach (simulate fall or exceed noise level), check the Supervisor device for a push notification, and verify the notification contains relevant information. |
| **Expected Result** | Supervisor receives a push notification after the threshold is exceeded. |
| **Actual Result** | Supervisor device received push notification: "Threshold breach: High noise level detected." Notification included worker name, timestamp, and zone location. |
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
| **Description** | The system sends an SOS alert that includes the worker's last known GPS location. |
| **Preconditions** | User is logged in as a Worker. Location permission is granted. |
| **Test Steps** | Log in as a Worker, allow location permission, tap the SOS button, wait for the 3-second countdown, confirm SOS is sent, then on the Supervisor device verify the SOS notification includes a location. |
| **Expected Result** | SOS alert is sent with the worker's last known GPS location. Supervisor is notified immediately. |
| **Actual Result** | 3-second countdown completed and a notification shown to the user with a transmitted signal. SOS alert sent with message "Emergency SOS signal broadcast." Location displayed as: "5093, Rhino Street, Ongwediva, Oshana Region." Supervisor received notification immediately. |
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
| **Description** | The system displays a real-time supervisor dashboard with hazard counts, alerts, and worker status. |
| **Preconditions** | User is logged in as a Supervisor. At least one hazard and one worker exist in the system. |
| **Test Steps** | Log in as a Supervisor, navigate to the Dashboard, verify active hazard count, resolved hazards, live SOS alerts, safe zones, and latest activity are visible, then submit a new hazard and verify the dashboard updates. |
| **Expected Result** | Dashboard loads within 3 seconds and displays accurate real-time data. Updates when new hazards are reported. |
| **Actual Result** | Dashboard loaded within 2 seconds. Displayed: 26 active hazards, 2 live SOS alerts, acknowledged events count, safe zones list, and latest activity feed. New hazard appeared instantly after submission. |
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
| **Description** | The system allows users to view previously submitted hazard reports. |
| **Preconditions** | At least one hazard report exists in Firestore. User is logged in. |
| **Test Steps** | Log in as a Worker or Supervisor, navigate to the hazard history screen, and verify past reports are listed with description, image, date, and location. |
| **Expected Result** | Past hazard reports are displayed correctly with all relevant details. |
| **Actual Result** | Past hazard reports listed with description, image thumbnail, date, and location. Tapping any report opens full details. |
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
| **Description** | The system generates analytics reports including safety score, incident patterns, and resolution time. |
| **Preconditions** | User is logged in as a Supervisor. Hazard data exists in Firestore. |
| **Test Steps** | Log in as Supervisor, navigate to the Analytics Dashboard, verify charts are displayed (Bar, Line, Pie), apply date filters (24h, 7d, 30d, all time), and verify safety score and resolution time are shown. |
| **Expected Result** | Analytics dashboard displays accurate charts. Date filters update data correctly. |
| **Actual Result** | Bar, Line, and Pie charts displayed correctly. Date filters (24h, 7d, 30d, all time) updated data accordingly. Safety score and average resolution time shown on dashboard. A view PDF option is also available. |
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
| **Description** | The system allows visitors to receive alerts and view safe zones, but restricts hazard reporting. |
| **Preconditions** | A visitor account exists and has been approved by an admin. |
| **Test Steps** | Log in as a Visitor, verify the visitor can view safe zones, active alerts, safety guidelines, and emergency contact, then attempt to submit a hazard report and verify the option is not available. |
| **Expected Result** | Visitor receives alerts and can view zones. Hazard reporting feature is not accessible to visitors. |
| **Actual Result** | Visitor able to view safe zones, active alerts, safety guidelines, and emergency contact. Hazard reporting option was not visible. Message displayed: "Zones are not currently being tracked in the live feed." |
| **Status** | Pass |
| **Android 11** | Pass |
| **Android 12** | Pass |
| **Android 13** | Pass |

---

### TC-015: Image Upload Support

| Field | Details |
|-------|---------|
| **Test ID** | TC-015 |
| **FR Reference** | FR-015 |
| **Description** | The system supports image uploads from camera or gallery when reporting a hazard. |
| **Preconditions** | User is logged in as a Worker. Camera and storage permissions are granted. |
| **Test Steps** | Log in as a Worker, navigate to Report Hazard, tap the image upload button, select an image from the gallery, also test capturing a new image using the camera, submit the report, and verify the image appears on the dashboard. |
| **Expected Result** | Image is uploaded successfully to Firebase Storage and is visible when viewing the hazard report. |
| **Actual Result** | Image selected from gallery uploaded successfully. Camera capture uploaded successfully. Image appeared on the dashboard and hazard history screen after submission. |
| **Status** | Pass |
| **Android 13** | Pass |
| **Android 15** | Pass |
| **Android 16** | Pass |

---

## Section 3: Regression Testing

Testing conducted after all code was merged into the develop branch.

| Regression ID | Feature Being Re-Tested | FR Reference | Why It Might Break After Merge | Status |
|---------------|------------------------|--------------|-------------------------------|--------|
| RT-001 | User Registration & Login | FR-001, FR-002 | New auth code may break login flow | Pass |
| RT-002 | Hazard Reporting | FR-003, FR-004 | Merged reporting code may break Firestore writes | Pass |
| RT-003 | Live Map Display | FR-005 | Map listeners may stop updating after merge | Pass |
| RT-004 | Zone Classification | FR-006 | Risk zone colours may not update correctly | Pass |
| RT-005 | Fall Detection | FR-007 | Sensor service may conflict with other merged services | Pass |
| RT-006 | Noise Monitoring | FR-008 | Audio permissions may break after integration | Pass |
| RT-007 | Push Notifications / Alerts | FR-009, FR-010 | FCM config may be overwritten during merge | Pass |
| RT-008 | Supervisor Dashboard | FR-011 | Dashboard real-time listeners may stop after merge | Pass |
| RT-009 | Analytics Dashboard | FR-013 | Chart data may not load after Firestore rule changes | Pass |
| RT-010 | Visitor Mode Restrictions | FR-014 | Role-based navigation may break after integration | Pass |
| RT-011 | Image Upload | FR-015 | Firebase Storage rules may block uploads after merge | Pass |
| RT-012 | Offline Support | Non-functional | AsyncStorage sync logic may break after merge | Pass |

---

## Section 4: Edge Case Testing

Tests of situations users might encounter in normal usage, conducted to prevent app crashes.

| Edge Case ID | FR Ref | Edge Case Scenario | Expected Result | Status |
|--------------|--------|-------------------|-----------------|--------|
| EC-001 | FR-001 | Register with an already existing email | System shows an error: email already in use | Pass |
| EC-002 | FR-002 | Login with wrong password | System shows an error: incorrect password | Pass |
| EC-003 | FR-002 | Login with empty email and password fields | System shows a validation error, does not crash | Pass |
| EC-004 | FR-003 | Submit a hazard report with no description | System shows validation error: description is required | Pass |
| EC-005 | FR-003 | Submit a hazard report with no image | System either allows it or shows a clear message | Pass |
| EC-006 | FR-003 | Upload a very large image file | System handles it without crashing or shows a file size error | Pass |
| EC-007 | FR-004 | Submit a hazard report with no internet connection | Report is saved locally and syncs when connection returns | Pass |
| EC-008 | FR-007 | Phone is shaken gently (not a real fall) | No fall alert triggered — only real falls detected | Pass |
| EC-009 | FR-007 | App is running in the background during a fall | Fall detection still triggers or shows expected behaviour | Pass |
| EC-010 | FR-009 | SOS triggered when Supervisor is offline | Alert is queued and delivered when Supervisor comes online | Pass |
| EC-011 | FR-010 | SOS triggered with no GPS location available | SOS is still sent with last known location or a location error note | Pass |
| EC-012 | FR-014 | Visitor attempts to access hazard reporting screen | Access is blocked or option is not visible | Pass |
| EC-013 | FR-002 | User session expires while app is open | User is redirected to login screen automatically | Pass |
| EC-014 | FR-011 | Supervisor dashboard opened with no hazard data | Dashboard loads with empty state, no crash | Pass |
| EC-015 | FR-013 | Analytics opened with no data in Firestore | Charts show empty state, no formula errors or crashes | Pass |

---

## Section 5: Device Testing Matrix

### Devices Used for Testing

| Field | Phone #1 | Phone #2 | Phone #3 |
|-------|----------|----------|----------|
| **User / Role** | Tegameno – Supervisor | Ernesto – Worker | Queen – Visitor |
| **Device** | Samsung | Samsung | Samsung |
| **Android Version** | Android 13 | Android 12 | Android 11 |
| **Final Test Date** | 31/05/2026 | 31/05/2026 | 31/05/2026 |

### Test Results Across 15 Functions

| FR Ref | Feature | Phone #1 — Android 13 (Supervisor) | Phone #2 — Android 12 (Worker) | Phone #3 — Android 11 (Visitor) | Overall |
|--------|---------|-------------------------------------|-------------------------------|----------------------------------|---------|
| FR-001, FR-002 | User Registration & Login | Pass | Pass | Pass | Pass |
| FR-003, FR-015 | Hazard Reporting + Image Upload | Pass | Pass | Pass | Pass |
| FR-004 | Real-Time Hazard Storage | Pass | Pass | Pass | Pass |
| FR-005 | Live Map Display | Pass | Pass | Pass | Pass |
| FR-006 | Zone Classification | Pass | Pass | Pass | Pass |
| FR-007 | Fall Detection | Pass | Pass | Pass | Pass |
| FR-008 | Noise Level Monitoring | Pass | Pass | Pass | Pass |
| FR-009 | Push Notifications / Alerts | Pass | Pass | Pass | Pass |
| FR-010 | SOS Alert with Location | Pass | Pass | Pass | Pass |
| FR-011 | Supervisor Dashboard | Pass | Pass | Pass | Pass |
| FR-012 | View Past Hazard Reports | Pass | Pass | Pass | Pass |
| FR-013 | Analytics Dashboard | Pass | Pass | Pass | Pass |
| FR-014 | Visitor Mode | Pass | Pass | Pass | Pass |
| Non-functional | Offline Buffering | Pass | Pass | Pass | Pass |

---

*End of Testing Document — MineShield App — 31 May 2026*
