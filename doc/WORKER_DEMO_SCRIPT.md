# Worker Demo Script (5 Minutes)
## Presenter: Ernesto Wustow Bussel
## Date: Sunday, May 31, 2026
## Device: Test Phone #2 (Android 12)

---

### [0:00 - 0:30] Introduction
"Good morning supervisors and assessors. My name is Ernesto Wustow Bussel, and I will be demonstrating the **Worker** role in MineShield. I'm using a Samsung Galaxy running Android 12.

The worker app focuses on three core SRS requirements:
- FR-003: Hazard Reporting
- FR-007: Fall Detection (via accelerometer)
- FR-009: SOS Alerts

Let me walk you through the live app."

---

### [0:30 - 1:15] Login & Dashboard
*Action: Open app → Enter worker credentials → Show dashboard*

"As you can see, the worker dashboard shows:
- My total submitted hazards (4 total, 2 resolved)
- Quick action buttons: Report Hazard, SOS Alert, Safety Tips, Help
- Recent hazard activity

The orange theme provides high visibility in low-light mine conditions."

---

### [1:15 - 2:30] Hazard Reporting (FR-003)
*Action: Tap "Report Hazard" → Fill description "Loose rock near Zone B" → Select severity → Take photo → Submit*

"I'm reporting a loose rock hazard. The system requires:
- A description (min 10 characters)
- Zone selection (dropdown from Firestore)
- Severity (Low/Medium/High)
- Optional photo upload to Firebase Storage

After submission, the hazard appears instantly on the supervisor's Live Map via Firestore real-time listeners."

---

### [2:30 - 3:15] Fall Detection (FR-007)
*Action: Shake phone violently to trigger fall detection*

"Now I'll demonstrate the accelerometer-based fall detection. I'm shaking the phone to simulate a fall.

[Fall Confirmation Modal appears]

Notice the 10-second confirmation timer. If I press 'I'M OKAY', the alert cancels. If I don't respond, the app automatically sends an SOS with my last known location.

This algorithm uses a 2.5g impact threshold and a rolling 10-reading window, tested with 92% accuracy."

---

### [3:15 - 4:00] SOS Alert (FR-009)
*Action: Tap SOS button → Confirm*

"Pressing the SOS button triggers an immediate emergency alert. The system:
1. Records current GPS coordinates (or last known if underground)
2. Sends push notification via FCM to all supervisors
3. Stores the alert in Firestore with timestamp

Supervisors on the other test phone will receive this notification within 5 seconds."

---

### [4:00 - 4:30] Safety Tips & My Reports
*Action: Navigate to Safety Tips, then My Reports*

"The Safety Tips section provides mining-specific guidelines and emergency contacts. All content is stored locally for offline access.

My Reports shows a complete history of hazards I've submitted, with status badges (Pending/Resolved). Tapping any hazard shows full details including uploaded images."

---

### [4:30 - 5:00] Conclusion & Q&A Teaser
"In summary, the worker app provides:
✅ Fast hazard reporting with image upload
✅ Reliable fall detection using phone sensors
✅ One-tap SOS with location sharing

I'm ready for any questions about FR-003, FR-007, or FR-009. Thank you."

---
