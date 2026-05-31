# MineShield: FCM Setup & Implementation Guide

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

This document outlines the setup and implementation of **Firebase Cloud Messaging (FCM)** for the MineShield application. As specified in the SRS (Section 2.3), FCM enables real-time push notifications for hazard alerts, SOS broadcasts, and supervisor monitoring. This guide ensures compliance with:

- **FR-009 & FR-010** — Send alerts and SOS with last known location
- **Performance requirements** — Real-time updates within 2 seconds (SRS Section 4)
- **Security protocols** — Authentication and role-based access control

---

## 2. Prerequisites

Before proceeding, verify the following assumptions and constraints from the SRS (Section 2.5):

| Requirement | Status |
| :--- | :--- |
| Android 10+ devices available for testing | ☐ |
| Stable internet connection for real-time sync | ☐ |
| Firebase services configured within limits | ☐ |
| Three test phones designated for validation | ☐ |
| Worker possesses mobile device at all times | ☐ |

---

## 3. File Structure

Per the MineShield Guide Document, the following files will be created or modified: src/services/notificationService.js (FCM setup), src/services/locationService.js (GPS and last known location tracking), src/components/alerts/AlertBanner.js (in-app alert display), src/components/alerts/SOSModal.js (SOS confirmation modal), and src/screens/worker/WorkerDashboard.js (add SOS button).

## 4. Firebase Console Configuration

Step 1: Navigate to Firebase Console and open the MineShield project (Responsible: Firebase Lead Angula). Step 2: Go to Project Settings → Cloud Messaging. Step 3: Copy the Firebase Cloud Messaging API (V1) key. Step 4: Ensure FCM is enabled for the Android package (e.g., com.mineshield.app). Step 5: Add google-services.json to the Android project (Responsible: GitHub Manager).

## 5. Installation

Run the following commands in the project root: npm install @react-native-firebase/app, npm install @react-native-firebase/messaging, npm install @react-native-firebase/firestore, npm install @react-native-firebase/auth, npm install expo-location. For Expo managed workflow: expo install @react-native-firebase/app @react-native-firebase/messaging expo-location.

