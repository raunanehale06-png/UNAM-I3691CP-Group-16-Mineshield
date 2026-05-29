# MINESHIELD PHASE 3 MANAGEMENT REPORT

## Project Overview

| Field | Details |
|-------|---------|
| **Project Name** | MineShield - Mining Safety & Hazard Management System |
| **Group** | Computer Programming I - Group 16 |
| **Project Manager** | Simon Shitana |
| **Report Date** | May 29, 2026 |
| **Phase** | Phase 3 - Final Deliverables |
| **Submission Deadline** | Sunday, May 31, 2026 |

---

## Executive Summary

MineShield is a mobile application developed to improve workplace safety in mining environments through real-time hazard reporting, sensor-based fall detection, GPS location tracking, and emergency alert management. The system transforms standard mobile devices into intelligent safety tools that connect workers, supervisors, and visitors on a single real-time platform.

After completing Phase 1 (project setup and navigation structure) and Phase 2 (core feature implementation), the team has now entered Phase 3, which represents the final delivery phase. All functional requirements from the SRS (FR-001 through FR-015) have been implemented with the exception of FR-007 (accelerometer fall detection), which is currently in progress and scheduled for completion by Friday, May 29, 2026 at 8:00 PM.

This report documents the management activities, team coordination, task assignments, GitHub workflow, testing status, and presentation preparation for Phase 3.

---

## Team Composition

The project consists of 19 team members divided into leadership roles and functional assignments. Each member has specific responsibilities for Phase 3 completion.

**Leadership Team:**
- Project Manager: Overall coordination, timeline management, Q&A moderation
- Lead Developer: System architecture, code integration, APK build
- Firebase Lead: Backend services, security rules, data management
- UI/UX Lead: Design consistency, theme management, supervisor demo
- Documentation Lead: Traceability, final report, presentation slides
- GitHub Manager: Version control, PR review, branch protection

**Feature Implementation Team:**
- Accelerometer sensor development
- Geolocation and GPS tracking
- Hazard reporting and image upload
- Notifications and alert broadcasting
- Offline support and local caching
- Analytics dashboard development
- Risk zones management
- SOS integration
- Personnel tracking

**Testing and Quality Assurance Team:**
- Test case creation and execution
- Bug reporting and regression testing
- Cross-device compatibility testing

**Demonstration Team:**
- Supervisor dashboard presenter
- Worker dashboard presenter
- Visitor dashboard presenter

**Documentation Team:**
- User manual and installation guide
- README and final submission package

---

## Phase 3 Timeline and Milestones

| Date | Milestone | Status |
|------|-----------|--------|
| May 26, 2026 | Phase 3 kickoff and task assignment | Completed |
| May 27, 2026 | Feature development continues | Completed |
| May 28, 2026 | Code review and internal testing | Completed |
| May 29, 2026 | Code freeze at 8:00 PM | In Progress |
| May 30, 2026 | Integration and merge to develop | Pending |
| May 31, 2026 | APK build and Q&A session | Pending |

---

## Functional Requirements Status

| ID | Requirement Statement | Status | Responsible |
|----|---------------------|--------|-------------|
| FR-001 | User registration using email and password | Completed | Firebase Lead |
| FR-002 | Secure login and logout | Completed | Firebase Lead |
| FR-003 | Report hazards with description and image | Completed | Reporting Lead |
| FR-004 | Store hazard reports in real time | Completed | Firebase Lead |
| FR-005 | Display hazards on a live map | Completed | UI/UX Lead |
| FR-006 | Classify zones by risk level | Completed | Risk Zones Lead |
| FR-007 | Detect falls using accelerometer data | In Progress | Accelerometer Lead |
| FR-008 | Monitor noise levels | Completed | Accelerometer Lead |
| FR-009 | Send alerts when thresholds are exceeded | Completed | Notifications Lead |
| FR-010 | Send SOS alerts with last known location | Completed | SOS Lead |
| FR-011 | Display supervisor dashboard | Completed | UI/UX Lead |
| FR-012 | Allow viewing of past hazards | Completed | Lead Developer |
| FR-013 | Generate analytics reports | Completed | Analytics Lead |
| FR-014 | Allow visitors to receive alerts | Completed | Visitor Demo Lead |
| FR-015 | Support image uploads | Completed | Reporting Lead |

**Completion Rate: 14 out of 15 requirements (93.3%)**

---

## GitHub Management Summary

### Branch Structure

The repository follows a structured branching strategy to ensure code quality and prevent conflicts:

- **main branch**: Production-ready code, protected from direct pushes
- **develop branch**: Integration branch for all feature work
- **feature branches**: Individual branches for each task and team member

### Branch Protection Rules

The following rules have been enforced by the GitHub Manager:
- Direct pushes to main are prohibited
- All changes require a Pull Request with at least one reviewer
- PRs must pass status checks before merging
- Linear history is required

### Pull Request Workflow

All team members follow this workflow:
1. Create feature branch from develop
2. Commit changes with proper message format
3. Push branch to remote repository
4. Open Pull Request to develop with description
5. Assign reviewer for approval
6. Merge after approval and passing checks
7. Delete feature branch after merge

### Commit Statistics

| Metric | Value |
|--------|-------|
| Total commits (Phase 3 to date) | 47 |
| Open Pull Requests | 12 |
| Merged Pull Requests | 8 |
| Active feature branches | 11 |
| Team members with commits | 16 |

---

## Firebase Implementation Summary

### Authentication

Firebase Authentication has been configured with email/password provider. User roles are stored in Firestore and synchronized with authentication state.

### Firestore Collections

The following collections have been created and populated:

| Collection | Purpose | Documents |
|------------|---------|-----------|
| users | User profiles and roles | 6 |
| hazards | Hazard reports | 26 |
| alerts | Emergency alerts | 4 |
| zones | Mine zone risk levels | 3 |
| sensorLogs | Accelerometer and noise data | 0 (ready) |
| analytics | Safety statistics | Generated |

### Security Rules

Firestore security rules have been written and deployed. Key rules include:
- Only authenticated users can read data
- Only workers and supervisors can create hazards
- Only supervisors can update hazard status
- Visitors have read-only access to hazards and alerts
- Sensor logs are immutable once created

### Storage Configuration

Firebase Storage has been configured for:
- Hazard report images (path: /hazard-images/)
- Profile pictures (path: /profile-pictures/)

---

## Expo and Build Configuration

### Development Environment

| Component | Version |
|-----------|---------|
| React Native | 0.72.x |
| Expo SDK | 49.x |
| Node.js | 18.x or 20.x |
| Android Target | API Level 31+ |

### Dependencies Installed

The following packages have been installed and configured:
- @react-navigation/native for navigation
- firebase for backend services
- expo-location for GPS tracking
- expo-sensors for accelerometer access
- expo-image-picker for camera/gallery access
- react-native-maps for live map display
- async-storage for offline caching

### APK Build Process

The final APK will be built using Expo Application Services (EAS) on Sunday, May 31, 2026 at 9:00 AM. The build command is:
