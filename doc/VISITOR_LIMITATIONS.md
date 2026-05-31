# Visitor Limitations - MineShield

**Document Author:** Tulikeni QL Hanghome (Queen)
**SRS Reference:** FR-014 (Visitor receive alerts only)
**Last Updated:** May 31, 2026

---

## Overview

This document outlines the functional limitations of the **Visitor Mode** in MineShield. These limitations are defined in SRS **FR-014** and ensure that visitors have appropriate access levels based on their role.

Visitors are defined as: Guests, contractors, inspectors, or any non-worker personnel on the mine site. Visitors are typically escorted by workers or supervisors.

---

## Core Principle: Read-Only Access

According to FR-014, **Visitors receive alerts only**. This means:

| Capability | Visitor Access |
|------------|----------------|
| View hazards | ✅ READ-ONLY |
| View alerts | ✅ READ-ONLY |
| View safe zones | ✅ READ-ONLY |
| Receive push notifications | ✅ YES |
| Report hazards | ❌ NO |
| Send SOS alerts | ❌ NO |
| Track personnel | ❌ NO |
| View analytics | ❌ NO |
| Modify settings | ❌ NO |
| Respond to alerts | ❌ NO |

---

## Detailed Limitations

### 1. No Hazard Reporting

**FR-003** (Hazard Reporting) applies only to Workers and Supervisors.

**Visitor Restriction:** Visitors CANNOT:
- Create new hazard reports
- Upload images of hazards
- Submit hazard location
- Edit or update existing hazards

**What Visitors CAN do:**
- View all hazards (active and resolved)
- Filter hazards by status
- See hazard details including location, severity, and description

**Rationale:** Visitors lack site-specific training required to properly assess and report hazards.

---

### 2. No SOS Alerts

**FR-009** (SOS Button) and **FR-010** (Emergency Dispatch) apply only to Workers and Supervisors.

**Visitor Restriction:** Visitors CANNOT:
- Trigger SOS alerts
- Send emergency notifications
- Access the SOS button in the app

**What Visitors CAN do:**
- Receive SOS alerts from Workers/Supervisors
- View SOS instructions when an alert is received
- Call emergency contact number (external to app)

**Rationale:** Visitors are always accompanied by escorts who have SOS capability. The visitor's role is to follow instructions, not initiate emergency protocols.

---

### 3. No Personnel Tracking

**FR-011** (Personnel Tracking) is reserved for Supervisors only.

**Visitor Restriction:** Visitors CANNOT:
- See worker locations
- Track personnel status
- Access HUD ping functionality
- View worker check-ins

**What Visitors CAN do:**
- See their own dashboard
- View safe zone locations

**Rationale:** Personnel tracking is an operational safety feature for supervisors managing the workforce.

---

### 4. No Analytics Access

**FR-013** (Analytics Dashboard) is reserved for Supervisors only.

**Visitor Restriction:** Visitors CANNOT:
- View safety scores
- See hazard statistics
- Access charts or data visualizations
- Filter historical data

**What Visitors CAN do:**
- View current safety status (Safe/Caution/Danger)

**Rationale:** Analytics contain operational data not relevant to visitor safety awareness.

---

### 5. No System Modifications

**Visitor Restriction:** Visitors CANNOT:
- Change app settings
- Modify notification preferences (receiving is mandatory)
- Update profile information
- Change role or permissions

**What Visitors CAN do:**
- Log out of the application
- View their own visitor profile

---

### 6. Alert Reception (Read-Only)

**FR-014** requires that visitors "receive alerts only."

| Alert Type | Visitor Receives? | Visitor Can Respond? |
|------------|-------------------|---------------------|
| SOS Alerts | ✅ Yes | ❌ No |
| Hazard Alerts | ✅ Yes | ❌ No |
| Evacuation Alerts | ✅ Yes | ❌ No |
| Informational Alerts | ✅ Yes | ❌ No |

**Visitor Actions on Alerts:**
- Read alert message
- View alert details
- Follow instructions in alert
- Acknowledge (dismiss) alert on device

**Visitor CANNOT:**
- Send acknowledgment back to supervisors
- Escalate alerts
- Mark alerts as "resolved"
- Comment on alerts

---

## Comparison Table: Visitor vs. Worker vs. Supervisor

| Feature | Visitor | Worker | Supervisor |
|---------|---------|--------|------------|
| View hazards | ✅ | ✅ | ✅ |
| Report hazards | ❌ | ✅ | ✅ |
| Upload images | ❌ | ✅ | ✅ |
| View alerts | ✅ | ✅ | ✅ |
| Send SOS | ❌ | ✅ | ✅ |
| Receive push notifications | ✅ | ✅ | ✅ |
| View safe zones | ✅ | ✅ | ✅ |
| View live map | ✅ | ✅ | ✅ |
| Personnel tracking | ❌ | ❌ | ✅ |
| Analytics dashboard | ❌ | ❌ | ✅ |
| Risk zones management | ❌ | ❌ | ✅ |
| Edit hazard status | ❌ | ❌ | ✅ |
| Security rules write access | ❌ | ✅ | ✅ |

---

## UI/UX Limitations (Visible to Visitor)

To ensure clarity, the Visitor Interface explicitly shows limitations:

1. **"Read-only" badges** on navigation buttons
2. **No "Report Hazard" button** anywhere in the app
3. **No SOS button** on any screen
4. **Visitor limitations notice** at the bottom of each screen
5. **Disabled form inputs** (where applicable)

---

## Security Rules Enforcement

Firebase Security Rules enforce visitor limitations at the database level:

```javascript
// Firestore Security Rules for Visitors
function isVisitor() {
  return getUserRole() == 'visitor';
}

// Visitors can READ hazards, but cannot WRITE
match /hazards/{hazardId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && !isVisitor();  // Visitors cannot create
  allow update: if isSupervisor();  // Only supervisors can update
}

// Visitors can READ alerts, but cannot CREATE or UPDATE
match /alerts/{alertId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && !isVisitor();  // Visitors cannot create
  allow update: if false;
}
