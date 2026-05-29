MineShield — Traceability Matrix

    Project: MineShield: Smart Mine Safety & Monitoring System
    Document Lead: Andre Cavota
    Project Manager: Simon Shitana
    Last Updated: 2026-05-29
    Update NO: 2

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

____________________________________________________________________________________

Phase 1
Status: Completed

Phase Goal: Team Division, project and name selection and SRS document construction.

____________________________________________________________________________________

|1|  Selection of group and project name:       MineShield
|2|  Assigning leadership roles:                SHITANA, S (Project Manager) | CAVOTA, AJPG (Documentation Lead) | KLIM, GK (Lead Developer) | ANGULA, FT (Firebase Lead) | NEHALE, RN (GitHub Manager) | IYAMBO, T (UI/UX Lead)
|3|  Selection of Engineering Domain:           Mining Engineering and Occupational Safety Engineering
|4|  Target Users:                              Mine Workers | Supervisors | Safety Officers | Engineers | Visitors
|5|  Core features identified:                  Real-time hazard reporting | Worker wellbeing monitoring via smartphone sensors | Live supervisor dashboard | Emergency alerts | Safety data storage and analysis | Last known location | Live map with safe and risk zones
|6|  Firebase Data Plan:                        (SRS Document, Page 4)
|7|  Preparation for pitch session with Mr. Abisai

Phase 1 Group Division

| Group | Focus Area | Lead | Members |
|-------|-----------|------|---------|
| Group 1 | Lead Management | Klim Gelasius | Logic Josephath, Simon Shitana, Anotida Chiramba |
| Group 2 | Firebase & Backend | Frieda Angula | Pombili Abraham, Teopolina Negonga, Tulikeni Hanghome |
| Group 3 | UI/UX Design | Tegameno Iyambo | Sesilia Estevanhu, Ernesto Bussel, Eric Petruttis, Cypriaan Andreas |
| Group 4 | Documentation | Andre Cavota | Hafeni Hilokuah, Elia Gabriel, Annaliah Simasiku |
| Group 5 | GitHub & Version Control | Rauna Nehale | Messias Haimbondi |

Additional Info: An excessive amount of time was used to select a group name and idea. A minor power struggle occurred and a lack of seriousness was observed.

********************************************************

Phase 1 Deliverables

| Deliverable | Lead | Assigned To | Date Completed | Additional Info |
|-------------|------|-------------|----------------|-----------------|
| SRS Document | Andre Cavota | Andre Cavota, Secilia, Messias | 23/04/2026 | No difficulties faced during the compilation of the SRS document. |
| Shareable Figma / Adobe XD Prototype Link | Tegameno Iyambo | — | — | — |
| Live Expo progress demonstration to Mr. Abisai | Simon Shitana | — | — | — |

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

____________________________________________________________________________________

Phase 2
Status: Completed

Phase Goal: Workload division and building of the proposed project.

____________________________________________________________________________________

Phase 2 Group Division

| Group | FR Coverage | Lead | Members |
|-------|------------|------|---------|
| Group A | FR-001, FR-002 | Frieda Angula | Teopolina Negonga, Hafeni Hilokuah |
| Group B | FR-003, FR-004, FR-015 | Klim Gelasius | Pombili Abraham, Tulikeni Hanghome |
| Group C | FR-005, FR-006 | Tegameno Iyambo | Sesilia Estevanhu, Ernesto Bussel |
| Group D | FR-007 | Logic Josephath | Anotida Chiramba |
| Group E | FR-009, FR-010 | Pombili Abraham | Tulikeni Hanghome |
| Group F | FR-011, FR-012, FR-013 | Andre Cavota (doc), Klim (code) | — |
| Group G | FR-014 | Sesilia Estevanhu | Ernesto Bussel |

----

FR-001 and FR-002 — User Registration and Secure Login/Logout                          Priority: High

|8|  Firebase Service:       Firebase Authentication
|9|  Source File:            src/services/authService.js → registerUser(), loginUser(), logoutUser(), getCurrentUser()
|10| Test Case ID:           TC-001, TC-002
|11| Test Description:       Register with valid email and password; verify account and role created in Firebase Auth. Test login with valid credentials; verify session created. Test logout and confirm session is cleared.
|12| Assigned To:            Frieda Angula (Lead), Teopolina Negonga, Hafeni Hilokuah
|13| Date Completed:         18/05/2026
|14| Additional Info:        Role-based navigation implemented. After login, user is directed to correct dashboard based on role (Worker, Supervisor, Visitor).

********************************************************

FR-003, FR-004 and FR-015 — Hazard Reporting, Real-Time Storage and Image Upload       Priority: High

|15| Firebase Service:       Firestore + Firebase Storage
|16| Source File:            src/screens/worker/ReportHazardScreen.js | src/services/firestoreService.js | src/services/storageService.js | src/components/common/ImageUploader.js
|17| Test Case ID:           TC-003, TC-004
|18| Test Description:       Worker submits hazard report with description and image. Verify record is saved in Firestore within 2 seconds and image URL is stored in Firebase Storage. Confirm hazard appears on supervisor dashboard.
|19| Assigned To:            Klim Gelasius (Lead), Messias Haimbondi, Pombili Abraham, Tulikeni Hanghome
|20| Date Completed:         18/05/2026
|21| Additional Info:        Image picker supports both camera and gallery. Form validation requires a description before submission.

********************************************************

FR-005 and FR-006 — Live Hazard Map and Zone Classification                            Priority: High

|22| Firebase Service:       Firestore
|23| Source File:            src/screens/supervisor/LiveMapScreen.js | src/components/maps/ZoneOverlay.js
|24| Test Case ID:           TC-005, TC-006
|25| Test Description:       Submitted hazard appears on map within 5 seconds as a marker. Zones display correct colour coding. Risk level updates when a new hazard is submitted within a zone boundary.
|26| Assigned To:            Tegameno Iyambo (Lead), Sesilia Estevanhu, Ernesto Bussel
|27| Date Completed:         18/05/2026
|28| Additional Info:        GPS unavailable underground. Surface testing only. Marker colours: red = pending, green = resolved. Zone colours: green = safe, yellow = warning, red = danger.

********************************************************

FR-007 — Fall Detection Using Smartphone Accelerometer                                 Priority: High

|29| Firebase Service:       Firestore
|30| Source File:            src/services/sensorService.js | src/hooks/useSensors.js | src/components/alerts/FallConfirmationModal.js
|31| Test Case ID:           TC-007, TC-008
|32| Test Description:       Simulate fall on physical device. Verify fall is detected using the accelerometer threshold (2.5g impact, 2.0 magnitude change, stationary reading below 1.2). Confirm wellbeing modal appears with 10-second countdown. If not dismissed, SOS is auto-triggered and supervisor is notified.
|33| Assigned To:            Logic Josephath, Anotida Chiramba
|34| Date Completed:         18/05/2026
|35| Additional Info:        Requires physical device. Cannot be emulated. Fall confirmation timer set to 10 seconds. Tested with 20 simulated falls; accuracy rate to be recorded by Logic.

********************************************************

FR-009 and FR-010 — Threshold Alerts and SOS with Last Known Location                  Priority: Medium

|36| Firebase Service:       Firebase Cloud Messaging (FCM) | Firestore
|37| Source File:            src/services/notificationService.js | src/services/locationService.js | src/services/alertService.js | src/components/alerts/SOSModal.js | src/components/alerts/AlertBanner.js
|38| Test Case ID:           TC-009, TC-010
|39| Test Description:       Trigger threshold breach and verify push notification is received by supervisor within 2 seconds. Press SOS button; verify 3-second countdown appears, last known location is captured, and all supervisors receive FCM notification with location. Test auto-escalation from unanswered fall alert.
|40| Assigned To:            Pombili Abraham (Lead), Tulikeni Hanghome, Anotida Chiramba
|41| Date Completed:         18/05/2026
|42| Additional Info:        Location stored every 30 seconds via locationService.js. SOS broadcasts to all supervisors. SOS history added to supervisor dashboard.

********************************************************

FR-011 — Supervisor Dashboard (Real-Time)                                              Priority: High

|43| Firebase Service:       Firestore
|44| Source File:            src/screens/supervisor/AnalyticsDashboardScreen.js | src/screens/supervisor/PastHazardsScreen.js | src/screens/supervisor/PersonnelTrackingScreen.js
|45| Test Case ID:           TC-011
|46| Test Description:       Log in as Supervisor. Verify dashboard loads within 3 seconds and displays: active hazard count, resolved hazards, live SOS alerts, risk zone status, and latest hazard activity.
|47| Assigned To:            Andre Cavota (Documentation), Klim Gelasius (Code), Tegameno Iyambo (UI)
|48| Date Completed:         18/05/2026
|49| Additional Info:        Dashboard includes live map, analytics, hazard logs, SOS panel, risk zones, and personnel tracking.

********************************************************

FR-012 and FR-013 — Past Hazard Reports and Analytics                                  Priority: Medium

|50| Firebase Service:       Firestore
|51| Source File:            src/screens/supervisor/PastHazardsScreen.js | src/screens/supervisor/AnalyticsDashboardScreen.js | src/components/charts/BarChart.js | src/components/charts/LineChart.js | src/components/charts/PieChart.js
|52| Test Case ID:           TC-012, TC-013
|53| Test Description:       Navigate to hazard history; verify past reports display user ID, date, and location. Open analytics view and confirm report shows total hazard count, incidents by type and zone, safety score, and date range filters (24h, 7d, 30d, all time).
|54| Assigned To:            Annaliah Simasiku (Analytics), Klim Gelasius (Code)
|55| Date Completed:         18/05/2026
|56| Additional Info:        Analytics visible in supervisor view only. Safety score calculated as hazards resolved divided by total hazards.

********************************************************

FR-014 — Limited Features for Visitors                                                 Priority: Low

|57| Firebase Service:       Firestore
|58| Source File:            src/screens/visitor/VisitorDashboardScreen.js | src/screens/visitor/VisitorHazardsScreen.js | src/screens/visitor/VisitorAlertScreen.js
|59| Test Case ID:           TC-014, TC-015
|60| Test Description:       Log in as Visitor. Verify only permitted features are accessible: view safe zones, view alerts, view safety guidelines, and access emergency contact. Confirm visitor cannot create hazard reports. Verify admin approval flow is enforced before visitor access is granted.
|61| Assigned To:            Sesilia Estevanhu, Ernesto Bussel, Tulikeni Hanghome (Visitor Demo)
|62| Date Completed:         18/05/2026
|63| Additional Info:        Visitors operate in read-only mode. Visitor navigator has no report button. Visitors must be registered under a staff member account with admin approval.

********************************************************

FR-008 — Noise Monitoring Using Smartphone Microphone                                  Priority: Medium

|64| Firebase Service:       Firestore
|65| Source File:            src/services/sensorService.js
|66| Test Case ID:           TC-016
|67| Test Description:       Expose device to noise above 85dB threshold. Verify sensor log entry is created in Firestore and alert is triggered. Confirm noise data appears in supervisor analytics view.
|68| Assigned To:            Logic Josephath
|69| Date Completed:         —
|70| Additional Info:        Uses Expo Audio to measure decibels. Noise logs stored in sensorLogs Firestore collection. Readable by supervisors only.

********************************************************

Phase 2 Deliverables

| Deliverable | Lead | Assigned To | Date Completed | Additional Info |
|-------------|------|-------------|----------------|-----------------|
| Working app with core features implemented | Klim Gelasius | All Phase 2 groups | 18/05/2026 | All FR-001 to FR-015 assigned and built across 7 groups. |
| Shareable Figma / Adobe XD Prototype Link | Tegameno Iyambo | — | — | — |
| Live Expo progress demonstration to Mr. Abisai | Simon Shitana | — | — | — |

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

____________________________________________________________________________________

Phase 3
Status: Ongoing

Phase Goal: Final integration, testing, APK build and submission.

Deadline: Sunday, 31 May 2026

____________________________________________________________________________________

Phase 3 Team Assignments

| Name | Phase 3 Role | Key Deliverable |
|------|-------------|-----------------|
| Simon Shitana | Project Manager | Daily stand-ups, Q&A moderation, PHASE3 MANAGEMENT REPORT.md |
| Klim Gelasius | Lead Developer | PR merges, APK build via EAS, DEPLOYMENT.md |
| Frieda Angula | Firebase Lead | Security rules, Firestore backup, FIREBASE RULES.md |
| Tegameno Iyambo | UI/UX Lead | Orange theme consistency, supervisor demo (Phone 1), DESIGN SYSTEM.md |
| Andre Cavota | Documentation Lead | Traceability matrix, presentation slides, FINAL SUBMISSION.md |
| Rauna Nehale | GitHub Manager | PR review, branch protection, release tag v3.0.0-final, CONTRIBUTORS.md |
| Logic Josephath | Accelerometer | Fall detection implementation and testing, sensorService.js |
| Sesilia Estevanhu | Geolocation | Location tracking, last known location, locationService.js |
| Messias Haimbondi | Hazard Reporting | Report screen, image upload, Firestore integration |
| Ernesto Bussel | Worker Demo | Worker dashboard presentation on Phone 2 |
| Tulikeni Hanghome | Visitor Demo | Visitor mode presentation on Phone 3 |
| Pombili Abraham | Notifications | FCM setup, push notifications, alert service |
| Teopolina Negonga | Testing and QA | Bug reporting, test case creation, TEST CASES.md, BUG REPORT.md |
| Elia Gabriel | Offline Support | AsyncStorage, local caching, sync logic |
| Annaliah Simasiku | Analytics Dashboard | Charts, statistics, data visualization |
| Hafeni Hilokuah | Risk Zones | Zone colours, risk levels, zone updates |
| Anotida Chiramba | SOS Integration | SOS modal, emergency dispatch, alert coordination |
| Cypriaan Andreas | Personnel Tracking | Worker list, status badges, last seen |
| Eric Petruttis | Final Documentation | README, user manual, installation guide |

----

|71| Final integration testing of all FR-001 to FR-015 on develop branch
|72| APK build using EAS — Sunday 31 May 2026, 9 AM (Assigned to: Klim)
|73| APK installation on 3 test devices (Phone 1: Tegameno — Supervisor, Android 13 | Phone 2: Ernesto — Worker, Android 12 | Phone 3: Tulikeni — Visitor, Android 11)
|74| Final regression tests across Android 11, 12 and 13 (Assigned to: Teopolina)
|75| GitHub release tagged v3.0.0-final (Assigned to: Rauna)
|76| Q&A session with supervisor and assessor — Sunday 31 May 2026, 1 PM (Moderated by: Simon)

Phase 3 Presentation Order

| Time | Presenter | Topic | Device |
|------|-----------|-------|--------|
| 10:00 | Simon Shitana | Project overview and SRS traceability | — |
| 10:07 | Tegameno Iyambo | Supervisor Dashboard: live map, analytics, hazard logs, SOS, risk zones, personnel tracking | Phone 1 |
| 10:14 | Ernesto Bussel | Worker Dashboard: report hazard, view reports, safety tips, SOS | Phone 2 |
| 10:21 | Tulikeni Hanghome | Visitor Dashboard: view zones, alerts, safety guidelines, emergency contact | Phone 3 |
| 10:28 | Logic Josephath | Accelerometer Fall Detection: FR-007 algorithm, confirmation modal, SOS trigger | Demo |
| 10:35 | Sesilia Estevanhu | Geolocation and GPS: location tracking, last known location, hazard location mapping | Demo |
| 10:42 | Messias Haimbondi | Hazard Reporting and Image Upload: FR-003, image picker, Firestore storage | Demo |
| 10:49 | Frieda Angula | Firebase Backend: authentication, Firestore, security rules, real-time listeners | — |
| 10:56 | Klim Gelasius | System Architecture: navigation, folder structure, Expo, APK build | — |
| 11:03 | Rauna Nehale | Version Control: branch strategy, PR workflow, collaboration stats | — |
| 11:10 | Andre Cavota | Documentation and Traceability: FR mapping, SRS compliance | — |
| 11:17 | Annaliah Simasiku | Analytics Dashboard: safety score, incident patterns, resolution time | Demo |
| 11:24 | Hafeni Hilokuah | Risk Zones: zone colours, sensor data, threat level index | Demo |
| 11:31 | Pombili Abraham | Notifications: FCM setup, push notifications, alert broadcasting | Demo |
| 11:38 | Simon Shitana | Conclusion, lessons learned, Q&A moderation | — |
| 11:45 | All members | Open Q&A session with supervisors and assessors | — |

Phase 3 Final Checklist

| Name | Task | Status |
|------|------|--------|
| Simon Shitana | Final management report, Q&A moderation | — |
| Klim Gelasius | APK build, deployment guide, integration | — |
| Frieda Angula | Firebase backup, security rules verification | — |
| Tegameno Iyambo | UI consistency check, supervisor demo prep | — |
| Andre Cavota | Traceability matrix, presentation slides | — |
| Rauna Nehale | PR review, contributor stats, release tag | — |
| Logic Josephath | Accelerometer code complete and tested | — |
| Sesilia Estevanhu | Location service complete and tested | — |
| Messias Haimbondi | Hazard reporting complete and tested | — |
| Ernesto Bussel | Worker demo rehearsed (5 minutes) | — |
| Tulikeni Hanghome | Visitor demo rehearsed (3 minutes) | — |
| Pombili Abraham | Notifications working, FCM configured | — |
| Teopolina Negonga | Test cases documented, bugs reported | — |
| Elia Gabriel | Offline support complete and tested | — |
| Annaliah Simasiku | Analytics dashboard complete | — |
| Hafeni Hilokuah | Risk zones complete | — |
| Anotida Chiramba | SOS integration complete | — |
| Cypriaan Andreas | Personnel tracking complete | — |
| Eric Petruttis | README, user manual, installation guide | — |

Phase 3 Deliverables

| Deliverable | Lead | Assigned To | Date Completed | Additional Info |
|-------------|------|-------------|----------------|-----------------|
| Final APK build | Klim Gelasius | Klim Gelasius | — | Built via EAS. Distributed to 3 test phones. |
| Traceability matrix and presentation slides | Andre Cavota | Andre Cavota | — | All FR-001 to FR-015 must be documented with file paths. |
| Final SRS documentation | Andre Cavota | Andre Cavota, Eric Petruttis | — | Includes README, user manual and installation guide. |
| Firebase security rules and backup | Frieda Angula | Frieda Angula | — | Firestore rules deployed and verified. JSON backup exported. |
| GitHub release v3.0.0-final | Rauna Nehale | Rauna Nehale | — | Branch protection enforced. All PRs reviewed and merged. |
| Live Q&A demonstration to Mr. Abisai | Simon Shitana | All 19 members | — | Sunday 31 May 2026. |
