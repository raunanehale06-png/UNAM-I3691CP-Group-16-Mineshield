# Personnel Tracking

MineShield provides a live dashboard for supervisors and stores the last known location of each user. The live map illustrates safe and risk zones, and emergency alerts are sent when a hazard is detected. Worker safety is monitored using smartphone sensors.

The system does not support real-time underground GPS tracking, as GPS is unavailable underground. The last known location is used instead.

## Target Users

| User Type       | Description                       | Technical Level | Environment              |
|-----------------|-----------------------------------|-----------------|--------------------------|
| Mine Workers    | Report hazards, receive alerts    | Low             | Underground / Surface    |
| Supervisors     | Monitor safety dashboards         | Medium          | Control rooms            |
| Safety Officers | Analyze compliance data           | Medium–High     | Offices                  |
| Engineers       | Monitor operational risks         | High            | Technical Environments   |
| Visitors        | Receive alerts                    | Low             | Temporary mine access    |

## Functional Requirements

| FR ID  | Requirement                                              | Priority | Firebase Service |
|--------|----------------------------------------------------------|----------|------------------|
| FR-005 | The system shall display hazards on a live map           | High     | Firestore        |
| FR-006 | The system shall classify zones by risk level            | High     | Firestore        |
| FR-009 | The system shall send alerts when thresholds are exceeded | High    | FCM              |
| FR-010 | The system shall send SOS alerts with last known location | High    | Firestore        |
| FR-011 | The system shall display a supervisor dashboard          | High     | Firestore        |
| FR-014 | The system shall allow visitors to receive alerts        | High     | Firestore        |

## Firebase Data Model

**Users**

| Field        | Description                  |
|--------------|------------------------------|
| userID       | Unique user identifier       |
| name         | Name of the user             |
| email        | User email address           |
| role         | Role assigned to the user    |
| assignedZone | Zone the user is assigned to |

**Zones**

| Field      | Description                     |
|------------|---------------------------------|
| zone ID    | Unique zone identifier          |
| zone name  | Name of the zone                |
| risk level | Risk classification of the zone |
| Hazard type| Type of hazard in the zone      |

## Assumptions and Constraints

- Android 10+ required.
- Internet required for real-time sync.
- GPS unavailable underground — last known location is used.
- Workers must be in possession of their mobile device at all times.
- Supervisors must have a stable internet connection and remain logged in.
- Mobile device must have sufficient battery for the intended work period.

## Non-Functional Requirements

- Dashboard loads within 3 seconds.
- Real-time updates within 2 seconds.
- Map updates 5 seconds after a report is made.
- Authentication required for all access.
- Role-based access control enforced.
- Visitors can only use the app under supervision of an employee after admin approval.
- Data is not lost during network failure. Offline buffering supported.

## Use Case: Supervisor Monitoring

**Actor:** Supervisor  
**Description:** Supervisor logs in and monitors real-time hazards and alerts via the dashboard.  
**Outcome:** Quick decision-making, reducing response time.
