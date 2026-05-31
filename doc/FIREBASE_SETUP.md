# FIREBASE SETUP GUIDE - MINESHIELD

## Document Information

| Field | Details |
|-------|---------|
| **Author** | Frieda Angula |
| **Role** | Firebase Lead |
| **Date** | May 29, 2026 |
| **Version** | 1.0 |
| **Project** | MineShield - Group 16 |

---

## Table of Contents

1. [Overview](#overview)
2. [Firebase Project Creation](#firebase-project-creation)
3. [Authentication Setup](#authentication-setup)
4. [Firestore Database Setup](#firestore-database-setup)
5. [Storage Setup](#storage-setup)
6. [Cloud Messaging Setup](#cloud-messaging-setup)
7. [Security Rules](#security-rules)
8. [Environment Configuration](#environment-configuration)
9. [Installation Commands](#installation-commands)
10. [Verification Steps](#verification-steps)
11. [Troubleshooting](#troubleshooting)

---

## Overview

MineShield uses Firebase as its backend platform, providing:

- **Authentication**: Email/password user management with role-based access
- **Firestore**: Real-time NoSQL database for hazards, alerts, users, and zones
- **Storage**: Cloud storage for hazard images and profile pictures
- **Cloud Messaging**: Push notifications for alerts and SOS broadcasts

This document provides step-by-step instructions for setting up the Firebase backend for the MineShield application.

---

## Firebase Project Creation

### Step 1: Create a Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: **MineShield**
4. (Optional) Enable Google Analytics for the project
5. Click **"Create project"** and wait for provisioning
6. Click **"Continue"** to proceed to project dashboard

### Step 2: Register the App

1. In the Firebase project dashboard, click the **Web** icon (`</>`) to add a web app
2. Register app with nickname: **MineShield-App**
3. Click **"Register app"**
4. Copy the Firebase configuration object for later use
5. Click **"Continue to console"**

### Step 3: Enable Android App (for APK Build)

1. Click **"Add app"** and select the **Android** icon
2. Register Android package name: `com.mineshield.app`
3. (Optional) Add SHA-1 and SHA-256 fingerprints for Google Sign-In
4. Download `google-services.json` for Android build
5. Click **"Continue to console"**

---

## Authentication Setup

### Step 1: Enable Email/Password Sign-In

1. In the Firebase Console, navigate to **Build → Authentication**
2. Click **"Get started"** (if not already enabled)
3. Go to the **"Sign-in methods"** tab
4. Locate **"Email/Password"** in the providers list
5. Click the pencil icon (Edit) or toggle to enable
6. Set **"Email/Password"** to **Enabled**
7. (Optional) Enable **"Email link sign-in"** if passwordless is desired
8. Click **"Save"**

### Step 2: Configure User Roles

User roles are stored in Firestore, not in Auth claims. The following roles are defined:

| Role | Description | Permissions |
|------|-------------|-------------|
| `worker` | Mine worker | Report hazards, view own reports, SOS |
| `supervisor` | Safety supervisor | Full access: dashboard, analytics, manage hazards |
| `visitor` | Temporary visitor | Read-only: view zones and alerts only |

### Step 3: Test Users

For testing purposes, create the following test users:

| Email | Password | Role |
|-------|----------|------|
| worker@mineshield.com | Test123! | worker |
| supervisor@mineshield.com | Test123! | supervisor |
| visitor@mineshield.com | Test123! | visitor |

---

## Firestore Database Setup

### Step 1: Create Firestore Database

1. Navigate to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (or test mode for initial setup)
4. Select database location (choose region closest to users)
5. Click **"Enable"**

### Step 2: Create Collections

Create the following collections in Firestore:

#### Users Collection (`users`)

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | User ID (matches Auth UID) |
| `name` | string | User's full name |
| `email` | string | User's email address |
| `role` | string | worker/supervisor/visitor |
| `isActive` | boolean | Account active status |
| `isOnline` | boolean | Current online status |
| `lastSeen` | timestamp | Last activity timestamp |
| `lastLogin` | timestamp | Last login timestamp |
| `notificationToken` | string | FCM token for push notifications |
| `createdAt` | timestamp | Account creation date |

#### Hazards Collection (`hazards`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reporting user ID |
| `description` | string | Hazard description |
| `imageUrl` | string | Uploaded image URL |
| `zoneId` | string | Affected zone ID |
| `location` | geopoint | GPS coordinates |
| `severity` | string | low/medium/high/critical |
| `status` | string | pending/in-progress/resolved/rejected |
| `reportedAt` | timestamp | Report creation time |
| `updatedAt` | timestamp | Last update time |
| `resolvedAt` | timestamp | Resolution time |
| `assignedTo` | string | Supervisor assigned to hazard |
| `comments` | array | Resolution comments |

#### Alerts Collection (`alerts`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User who triggered alert |
| `type` | string | sos/fall/hazard/system |
| `message` | string | Alert message |
| `location` | geopoint | User's GPS location |
| `status` | string | active/acknowledged/resolved |
| `readBy` | array | User IDs who have read the alert |
| `createdAt` | timestamp | Alert creation time |
| `acknowledgedAt` | timestamp | Time alert was acknowledged |
| `resolvedAt` | timestamp | Time alert was resolved |

#### Zones Collection (`zones`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Zone name (e.g., "North Tunnel") |
| `riskLevel` | string | green/yellow/red |
| `color` | string | Hex color code |
| `boundaries` | array | GeoJSON polygon coordinates |
| `sensorData` | object | Methane, oxygen, temperature readings |
| `updatedAt` | timestamp | Last zone update |

#### Analytics Collection (`analytics`)

| Field | Type | Description |
|-------|------|-------------|
| `totalHazards` | number | Total reported hazards |
| `pendingHazards` | number | Currently pending hazards |
| `resolvedHazards` | number | Resolved hazards |
| `safetyScore` | number | Current safety score (0-100) |
| `lastUpdated` | timestamp | Last analytics update |

#### Sensor Logs Collection (`sensorLogs`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User ID |
| `type` | string | fall/noise |
| `magnitude` | number | Acceleration magnitude (for falls) |
| `decibels` | number | Noise level (for noise monitoring) |
| `timestamp` | timestamp | Event timestamp |
| `values` | object | Raw sensor values (x,y,z) |

### Step 3: Add Sample Data (Optional)

For testing, add sample zone documents:

```json
// Zone 1 - North Tunnel
{
  "name": "North Tunnel",
  "riskLevel": "green",
  "color": "#4CAF50",
  "sensorData": {
    "methane": 0.2,
    "oxygen": 20.5,
    "temperature": 22
  }
}

// Zone 2 - East Shaft
{
  "name": "East Shaft",
  "riskLevel": "yellow",
  "color": "#FFC107",
  "sensorData": {
    "methane": 0.8,
    "oxygen": 19.2,
    "temperature": 28
  }
}

// Zone 3 - Deep Section
{
  "name": "Deep Section",
  "riskLevel": "red",
  "color": "#F44336",
  "sensorData": {
    "methane": 1.5,
    "oxygen": 18.0,
    "temperature": 35
  }
}
