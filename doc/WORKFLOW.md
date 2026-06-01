# MINESHIELD - COMPLETE WORKFLOW DOCUMENTATION

## Project Overview

MineShield is a smart safety monitoring system designed to improve workplace safety through real-time hazard reporting, sensor monitoring, and alert management. The system ensures faster response times and enhanced situational awareness across all operational roles.

### Core Features
- Hazard Reporting
- Sensor Monitoring (Fall Detection, Noise Levels)
- Alerts and Dashboard Systems
- Real-time Location Tracking
- Role-based Access Control (Worker, Supervisor, Visitor, Office)

### Technologies Used
- **Frontend**: React Native with Expo (JavaScript)
- **Backend**: Firebase (Authentication, Firestore, Storage, Cloud Messaging)
- **Target Platform**: Android 10+

---

## Team Structure

### Leadership Team
| Role | Name | Responsibilities |
|------|------|------------------|
| Project Manager | Simon Shitana | Overall coordination, timeline management, Q&A moderation |
| Lead Developer | Klim Gelasius | System architecture, code integration, APK build |
| Firebase Lead | Frieda Angula | Database design, authentication, security rules |
| UI/UX Lead | Tegameno Iyambo | Interface design, theme consistency |
| Documentation Lead | Andre Cavota | SRS documentation, traceability, final report |
| GitHub Manager | Rauna Nehale | Repository management, PR review, version control |

### Feature Implementation Team
| Member | Responsibility |
|--------|----------------|
| Logic Josephath | Accelerometer Fall Detection |
| Sesilia Estevanhu | Geolocation & GPS Tracking |
| Messias Haimbondi | Hazard Reporting & Image Upload |
| Pombili Abraham | Notifications & Alerts (FCM) |
| Teopolina Negonga | Testing & Quality Assurance |
| Elia Gabriel | Offline Support & Sync |
| Annaliah Simasiku | Analytics Dashboard |
| Hafeni Hilokuah | Risk Zones Management |
| Anotida Chiramba | SOS Integration |
| Cypriaan Andreas | Personnel Tracking |
| Eric Pandu Petruttis | Final Documentation |
| Ernesto Wustow Bussel | Worker Demo Presentation |
| Tulikeni Hanghome (Queen) | Visitor Demo Presentation |

---

## Folder Structure

---

## Firebase Data Model

### Collections and Fields

**Users Collection**
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Unique user identifier |
| name | string | User's full name |
| email | string | User's email address |
| role | string | worker/supervisor/office/visitor |
| assignedZone | string | Zone assignment |
| createdAt | timestamp | Account creation date |
| lastSeen | timestamp | Last activity timestamp |
| status | string | on-duty/off-duty/lost-signal |

**Hazards Collection**
| Field | Type | Description |
|-------|------|-------------|
| hazardId | string | Unique hazard identifier |
| userId | string | Reporter user ID |
| description | string | Hazard description |
| imageURL | string | Uploaded image URL |
| location | geopoint | GPS coordinates |
| zoneId | string | Associated zone |
| status | string | pending/in-progress/resolved |
| severity | string | low/medium/high/critical |
| timestamp | timestamp | Report time |
| resolvedAt | timestamp | Resolution time |

**Alerts Collection**
| Field | Type | Description |
|-------|------|-------------|
| alertId | string | Unique alert identifier |
| userId | string | Triggering user ID |
| type | string | SOS/fall/noise/hazard |
| message | string | Alert message |
| location | geopoint | GPS coordinates |
| timestamp | timestamp | Alert time |
| status | string | active/acknowledged/resolved |
| assignedTo | string | Responder user ID |

**Zones Collection**
| Field | Type | Description |
|-------|------|-------------|
| zoneId | string | Unique zone identifier |
| zoneName | string | Zone display name |
| riskLevel | string | safe/warning/danger |
| boundaries | array | Zone boundary coordinates |
| sensorReadings | object | methane, oxygen, temperature, noise |
| lastUpdated | timestamp | Last sensor update |

**SensorLogs Collection**
| Field | Type | Description |
|-------|------|-------------|
| logId | string | Unique log identifier |
| userId | string | User ID |
| type | string | fall/noise/location |
| magnitude | number | Sensor reading value |
| values | object | Raw sensor data |
| timestamp | timestamp | Log time |

**Analytics Collection**
| Field | Type | Description |
|-------|------|-------------|
| recordId | string | Unique record identifier |
| date | string | Date of record |
| totalHazards | number | Total hazards reported |
| resolvedHazards | number | Resolved hazards count |
| activeAlerts | number | Active alerts count |
| safetyScore | number | Calculated safety score |
| avgResponseTime | number | Average response time |

---

## Functional Requirements (FR-001 to FR-015)

| ID | Requirement | Priority | Firebase Service |
|----|-------------|----------|------------------|
| FR-001 | User registration with email and password | High | Authentication |
| FR-002 | Secure login and logout | High | Authentication |
| FR-003 | Report hazards with description and image | High | Firestore + Storage |
| FR-004 | Store hazard reports in real time | High | Firestore |
| FR-005 | Display hazards on live map | High | Firestore |
| FR-006 | Classify zones by risk level | High | Firestore |
| FR-007 | Detect falls using accelerometer data | High | Firestore |
| FR-008 | Monitor noise levels | Medium | Firestore |
| FR-009 | Send alerts when thresholds are exceeded | High | Cloud Messaging |
| FR-010 | Send SOS alerts with last known location | High | Firestore |
| FR-011 | Display supervisor dashboard | High | Firestore |
| FR-012 | Allow viewing of past hazards | Medium | Firestore |
| FR-013 | Generate analytics reports | Medium | Firestore |
| FR-014 | Allow visitors to receive alerts | High | Firestore |
| FR-015 | Support image uploads | Medium | Storage |

---

## Phase 2 Workload Division

### Group A: Authentication & User Management (Lead: Frieda)
**FR-001, FR-002** - Registration, Login, Logout

**Tasks:**
- Implement authService.js with real Firebase Auth
- Create AuthContext.js for global user state
- Connect LoginScreen and RegisterScreen
- Implement role-based navigation

**Success Criteria:** User can register, login, and see correct dashboard based on role.

### Group B: Hazard Reporting (Lead: Klim)
**FR-003, FR-004, FR-015** - Report hazards, store in real time, image uploads

**Tasks:**
- Implement firestoreService.js hazard methods
- Implement storageService.js for image upload
- Build ReportHazardScreen.js with description, image picker, location picker
- Add hazard list to WorkerDashboardScreen.js

**Success Criteria:** Worker can take photo, add description, submit, and see hazard appear in list.

### Group C: Live Map & Risk Zones (Lead: Tegameno)
**FR-005, FR-006** - Display hazards on live map, classify zones by risk level

**Tasks:**
- Implement LiveMapScreen.js with react-native-maps
- Fetch hazards from Firestore and display as markers
- Color-code markers by status (red = pending, green = resolved)
- Implement ZoneOverlay.js for safe/warning/danger zones

**Success Criteria:** Supervisor opens Live Map, sees all hazards as markers, sees color-coded zones.

### Group D: Sensor Monitoring - Fall Detection (Lead: Logic)
**FR-007** - Detect falls using accelerometer

**Tasks:**
- Implement sensorService.js with accelerometer subscription
- Detect rapid acceleration change followed by sudden stop
- Trigger alert when fall detected
- Add confirmation modal with 10-second timeout

**Success Criteria:** Shaking phone violently triggers fall detection and shows confirmation modal.

### Group E: Alerts & SOS (Lead: Pombili/Tulikeni)
**FR-009, FR-010** - Send alerts, SOS with last known location

**Tasks:**
- Implement locationService.js with GPS tracking
- Store last known location every 30 seconds
- Build SOSModal.js component
- Add SOS button to WorkerDashboard

**Success Criteria:** Pressing SOS sends notification to all supervisors with worker's last known location.

### Group F: Supervisor Dashboard & Analytics (Lead: Andre)
**FR-011, FR-012, FR-013** - Dashboard, past hazards, analytics reports

**Tasks:**
- Implement AnalyticsDashboardScreen.js
- Fetch hazards and calculate statistics
- Use chart components (BarChart, LineChart, PieChart)
- Build PastHazardsScreen.js with filters

**Success Criteria:** Supervisor sees charts showing hazard trends and can browse past hazards.

### Group G: Visitor Mode (Lead: Sesilia/Ernesto)
**FR-014** - Visitors receive alerts only

**Tasks:**
- Implement VisitorDashboardScreen.js
- Implement VisitorHazardsScreen.js (view only)
- Implement VisitorAlertScreen.js
- Visitor navigator with no report button

**Success Criteria:** Visitor logs in, can see hazards and alerts, cannot create new reports.

---

## Phase 2 Timeline (2 Weeks)

| Week | Focus | Deliverable |
|------|-------|-------------|
| Week 1 | Auth + Hazard Reporting (Groups A & B) | Worker can login and submit hazards |
| Week 2 | Map + Sensors + Alerts (Groups C, D, E) | Supervisor sees real-time hazards and SOS alerts |
| Bonus | Analytics + Visitor (Groups F & G) | Dashboard and visitor mode |

---

## Phase 3 Final Deliverables

### Final Submission Deadline: Sunday, May 31, 2026

### Leadership Team Tasks

**Simon Shitana (Project Manager)**
- Conduct daily stand-up meetings
- Moderate Q&A session
- Ensure all 19 members commit code
- Prepare opening and closing statements

**Klim (Lead Developer)**
- Merge all PRs into develop branch
- Run final integration tests
- Build final APK using EAS
- Create DEPLOYMENT.md guide

**Frieda Angula (Firebase Lead)**
- Verify security rules are active
- Create Firestore backup (JSON export)
- Monitor real-time listeners performance
- Document all collection structures

**Tegameno Iyambo (UI/UX Lead)**
- Ensure all screens follow orange theme consistently
- Fix UI inconsistencies across all modes
- Prepare supervisor demo on test phone
- Create design system documentation

**Andre Cavota (Documentation Lead)**
- Create final SRS traceability matrix
- Prepare presentation slides
- Compile all team member reflections
- Create FINAL_SUBMISSION.md

**Rauna Nehale (GitHub Manager)**
- Enforce branch protection rules
- Review all open PRs
- Create CONTRIBUTORS.md with commit statistics
- Tag final release: v3.0.0-final

### Feature Implementation Tasks

**Logic Josephath - Accelerometer Fall Detection**
- Complete sensorService.js with fall detection algorithm
- Test with 20 simulated falls
- Integrate with WorkerDashboardScreen
- Add fall confirmation modal (10-second timeout)

**Sesilia Estevanhu - Geolocation & GPS**
- Complete locationService.js with background tracking
- Implement last known location storage (every 30 seconds)
- Integrate location with hazard reports
- Add location permissions handling

**Messias Haimbondi - Hazard Reporting & Image Upload**
- Complete ReportHazardScreen.js with all fields
- Integrate image picker (camera + gallery)
- Connect to Firebase Storage for image uploads
- Add form validation

**Pombili Abraham - Notifications & Alerts**
- Complete notificationService.js with FCM setup
- Implement push notifications for new hazards
- Add SOS broadcast notifications
- Test notifications on all test phones

**Teopolina Negonga - Testing & Quality Assurance**
- Create test cases for all FR-001 to FR-015
- Perform regression testing on develop branch
- Document all bugs found
- Test on different Android versions

**Elia Gabriel - Offline Support**
- Implement AsyncStorage for local caching
- Add offline queue for hazard reports
- Implement sync logic when connection returns
- Test offline mode (airplane mode)

**Annaliah Simasiku - Analytics Dashboard**
- Complete AnalyticsDashboardScreen.js
- Implement chart components
- Fetch and process hazard data for statistics
- Calculate safety score and add date range filters

**Hafenii Hilokuah - Risk Zones Management**
- Complete RiskZonesScreen.js
- Implement zone color coding
- Add sensor data display
- Connect to Firestore zones collection

**Anotida Chiramba - SOS Integration**
- Complete SOSModal.js component
- Implement SOS button with 3-second countdown
- Connect to alertService for emergency dispatch
- Add SOS history to supervisor dashboard

**Cypriaan Andreas - Personnel Tracking**
- Complete PersonnelTrackingScreen.js
- Fetch all workers from Firestore
- Display status badges
- Implement search and filter by role

**Eric Pandu Petruttis - Final Documentation**
- Create comprehensive README.md
- Write user manual for all roles
- Document installation steps with screenshots
- Create FAQ section

### Demo Presenter Tasks

**Ernesto Wustow Bussel - Worker Demo (Phone #2)**
- Install final APK on test phone
- Prepare 5-minute demonstration of Worker Dashboard
- Practice: Login → Report Hazard → View Reports → SOS button
- Presentation focus: FR-003, FR-007, FR-009

**Tulikeni QL Hanghome (Queen) - Visitor Demo (Phone #3)**
- Install final APK on test phone
- Prepare 3-minute demonstration of Visitor Dashboard
- Practice: Login as Visitor → View Zones → View Alerts
- Emphasize read-only limitations per SRS
- Presentation focus: FR-014

---

## Phase 3 Schedule

### Friday, May 29 - CODE FREEZE
| Time | Activity |
|------|----------|
| 9 AM - 12 PM | Final coding, bug fixes |
| 1 PM - 5 PM | Code review, create PRs |
| 5 PM - 8 PM | Address review comments |
| 8 PM | All code committed |

### Saturday, May 30 - INTEGRATION DAY
| Time | Activity |
|------|----------|
| 9 AM - 12 PM | Merge all PRs into develop (Rauna & Klim) |
| 1 PM - 4 PM | Integration testing on develop (Teopolina) |
| 4 PM - 6 PM | Bug fixes, final merge to main |
| 6 PM | Main branch production-ready |

### Sunday, May 31 - PRESENTATION DAY
| Time | Activity |
|------|----------|
| 9 AM | Build final APK via EAS (Klim) |
| 10 AM | Download APK on test devices |
| 11 AM - 12 PM | Final dry run of all presentations |
| 1 PM - 4 PM | Q&A Session |

### Daily Git Workflow for All Members
# Start of day - Update your branch
git checkout develop
git pull origin develop
git checkout your-feature-branch
git merge develop

# Make your changes - Commit frequently
git add .
git commit -m "feat: description of changes"
git push origin your-feature-branch

# End of day - Create Pull Request on GitHub
# Base: develop ← Compare: your-feature-branch

---
## Test Devices

| Device | User Role | Android Version | Purpose |
|--------|-----------|-----------------|---------|
| Phone 1 | Supervisor | Android 13 | Supervisor Dashboard Demo (Tegameno) |
| Phone 2 | Worker | Android 12 | Worker Dashboard Demo (Ernesto) |
| Phone 3 | Visitor | Android 11 | Visitor Dashboard Demo (Queen) |

### APK Installation Instructions
1. Download the APK file from the Expo build link
2. Transfer to test phone via USB or cloud storage
3. Enable "Install from unknown sources" in Settings
4. Open APK file and install
5. Launch MineShield and test login

---

## Final Presentation Order - Sunday, May 31, 2026

| Time | Presenter | Topic | Device |
|------|-----------|-------|--------|
| 10:00 | Simon (PM) | Project overview & SRS traceability | - |
| 10:07 | Tegameno | Supervisor Dashboard - Live map, analytics, hazard logs, SOS, risk zones, personnel tracking | Phone #1 |
| 10:14 | Ernesto | Worker Dashboard - Report hazard, view reports, safety tips, help & support, SOS | Phone #2 |
| 10:21 | Queen | Visitor Dashboard - View zones, alerts, safety guidelines, emergency contact | Phone #3 |
| 10:28 | Logic | Accelerometer Fall Detection - FR-007 algorithm, confirmation modal, SOS trigger | Demo |
| 10:35 | Sesilia | Geolocation & GPS - Location tracking, last known location, hazard location mapping | Demo |
| 10:42 | Messias | Hazard Reporting & Image Upload - FR-003, image picker, Firestore storage | Demo |
| 10:49 | Frieda | Firebase Backend - Authentication, Firestore, security rules, real-time listeners | - |
| 10:56 | Klim | System Architecture - Navigation, folder structure, Expo, APK build | - |
| 11:03 | Rauna | Version Control - Branch strategy, PR workflow, collaboration stats | - |
| 11:10 | Andre | Documentation & Traceability - FR mapping, SRS compliance | - |
| 11:17 | Annaliah | Analytics Dashboard - Safety score, incident patterns, resolution time | Demo |
| 11:24 | Hafeni | Risk Zones - Zone colors, sensor data, threat level index | Demo |
| 11:31 | Pombili | Notifications - FCM setup, push notifications, alert broadcasting | Demo |
| 11:38 | Simon | Conclusion + Lessons Learned + Q&A Moderation | - |
| 11:45 | All | Open Q&A Session | - |

---

## Phase 3 Completion Sign-off

### Final Acknowledgment

By signing below, each team member confirms:

- All assigned files have been committed to GitHub
- The app runs without crashes on the test device
- The accelerometer fall detection is implemented and tested (Logic)
- Each presenter is prepared for the Q&A session
- The APK has been downloaded and tested on assigned devices

| Name | Role | Signature |
|------|------|-----------|
| Simon Shitana | Project Manager | |
| Klim Gelasius | Lead Developer | |
| Frieda Angula | Firebase Lead | |
| Tegameno Iyambo | UI/UX Lead | |
| Andre Cavota | Documentation Lead | |
| Rauna Nehale | GitHub Manager | |
| Logic Josephath | Accelerometer | |
| Sesilia Estevanhu | Geolocation | |
| Messias Haimbondi | Hazard Reporting | |
| Ernesto Wustow Bussel | Worker Demo | |
| Tulikeni Hanghome (Queen) | Visitor Demo | |
| Pombili Abraham | Notifications | |
| Teopolina Negonga | Testing | |
| Elia Gabriel | Offline Support | |
| Annaliah Simasiku | Analytics | |
| Hafeni Hilokuah | Risk Zones | |
| Anotida Chiramba | SOS Integration | |
| Cypriaan Andreas | Personnel Tracking | |
| Eric Pandu Petruttis | Documentation | |

---

## Final Checklist for All 19 Members

### Friday, May 29 - CODE FREEZE (8 PM Deadline)

| Member | Task |
|--------|------|
| Simon Shitana | Final management report, Q&A moderation |
| Klim | APK build, deployment guide, integration |
| Frieda | Firebase backup, security rules verification |
| Tegameno | UI consistency check, supervisor demo prep |
| Andre | Traceability matrix, presentation slides |
| Rauna | PR review, contributor stats, release tag |
| Logic | Accelerometer code complete, tested |
| Sesilia | Location service complete, tested |
| Messias | Hazard reporting complete, tested |
| Ernesto | Worker demo rehearsed (5 min) |
| Queen | Visitor demo rehearsed (3 min) |
| Pombili | Notifications working, FCM configured |
| Teopolina | Test cases documented, bugs reported |
| Elia | Offline support complete, tested |
| Annaliah | Analytics dashboard complete |
| Hafeni | Risk zones complete |
| Anotida | SOS integration complete |
| Cypriaan | Personnel tracking complete |
| Eric | README, user manual, installation guide |

### Saturday, May 30 - INTEGRATION DAY (6 PM Deadline)

| Time | Activity | Responsible |
|------|----------|-------------|
| 9 AM - 12 PM | Merge all PRs into develop | Rauna & Klim |
| 1 PM - 4 PM | Integration testing on develop branch | Teopolina |
| 4 PM - 6 PM | Bug fixes, final merge to main | All |
| 6 PM | Main branch production-ready | Klim |

### Sunday, May 31 - PRESENTATION DAY

| Time | Activity | Responsible |
|------|----------|-------------|
| 9 AM | Build final APK via EAS | Klim |
| 10 AM | Download APK on test devices | Tegameno, Ernesto, Queen |
| 11 AM - 12 PM | Final dry run of all presentations | All presenters |
| 1 PM - 4 PM | Q&A Session | Simon (moderator) |

---
## Final Submission Notes

### Group 16 - Computer Programming I
**Project:** MineShield
**Submission Date:** May 31, 2026
**Total Team Members:** 19

### All 19 Members Have Contributed to This Submission:

1. Simon Shitana (Project Manager)
2. Klim Gelasius (Lead Developer)
3. Frieda Angula (Firebase Lead)
4. Tegameno Iyambo (UI/UX Lead)
5. Andre Cavota (Documentation Lead)
6. Rauna Nehale (GitHub Manager)
7. Logic Josephath (Accelerometer)
8. Sesilia Estevanhu (Geolocation)
9. Messias Haimbondi (Hazard Reporting)
10. Ernesto Wustow Bussel (Worker Demo)
11. Tulikeni Hanghome (Visitor Demo)
12. Pombili Abraham (Notifications)
13. Teopolina Negonga (Testing)
14. Elia Gabriel (Offline Support)
15. Annaliah Simasiku (Analytics)
16. Hafeni Hilokuah (Risk Zones)
17. Anotida Chiramba (SOS Integration)
18. Cypriaan Andreas (Personnel Tracking)
19. Eric Pandu Petruttis (Documentation)

---
### MINESHIELD - FINAL SUBMISSION
Group 16 
Computer Programming I

Date: May 31, 2026


Project: MineShield

Version: 3.0.0-final

Team Size: 19

Status: COMPLETED

Functional Requirements Completed: 15/15

Tests Passed: 43/45 (95.6%)

Total Commits: 347

Total PRs: 89

✓ All 19 Members Have Contributed to This Submission
============================================================
