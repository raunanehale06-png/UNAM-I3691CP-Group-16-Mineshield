# HUD Ping

MineShield detects abnormal movements using the smartphone's built-in accelerometer. When abnormal motion is detected, a modal window is displayed to confirm user wellbeing. If the user does not respond, an SOS alert is triggered with the user's last known location.

## Functional Requirements

| FR ID  | Requirement                                              | Priority | Firebase Service |
|--------|----------------------------------------------------------|----------|------------------|
| FR-007 | The system shall detect falls using accelerometer data   | High     | Firestore        |
| FR-008 | The system shall monitor noise levels                    | Medium   | Firestore        |
| FR-009 | The system shall send alerts when thresholds are exceeded | High    | FCM              |
| FR-010 | The system shall send SOS alerts with last known location | High    | Firestore        |

## Firebase Data Model

**Sensor Logs**

| Field       | Description                              |
|-------------|------------------------------------------|
| Log ID      | Unique log identifier                    |
| User ID     | Reference to the user                    |
| Noise level | Ambient noise level recorded             |
| Motion Data | Accelerometer data captured from device  |

**Alerts**

| Field     | Description                               |
|-----------|-------------------------------------------|
| alert ID  | Unique alert identifier                   |
| user ID   | Reference to the user                     |
| type      | Type of alert triggered                   |
| location  | Location associated with the alert        |
| timestamp | Time the alert was created                |

## Assumptions and Constraints

- Smartphone sensors must be functional.
- Workers must carry their mobile device at all times.
- Internet required for real-time sync of sensor data and alert dispatch.
- GPS unavailable underground — last known location is used in SOS alerts.
- Supervisors must have a stable internet connection and remain logged in.

## Non-Functional Requirements

- Real-time updates within 2 seconds.
- Dashboard loads within 3 seconds of an alert being triggered.
- Abnormal movements result in the display of a modal window confirming user wellbeing.
- Data is not lost during network failure. Offline buffering supported.
- Authentication required for all access. Role-based access control enforced.

## Use Case: Fall Detection Alert

**Actor:** System  
**Description:** System detects abnormal motion, triggers alert, and sends notification with last known location.  
**Outcome:** Supervisor is notified immediately.
