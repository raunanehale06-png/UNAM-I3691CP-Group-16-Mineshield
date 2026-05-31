# Frequently Asked Questions – MineShield

## General

### Q: Why does the app need location permission?
A: To provide supervisors with your last known location during emergencies. When underground (no GPS), the app stores the last known surface location.

### Q: Does the app work without internet?
A: Yes – hazard reports are stored locally and sync automatically when connection returns. Real-time features (live map, push notifications) require internet.

### Q: Which Android versions are supported?
A: Android 10 through 13. Tested on Samsung Galaxy S10, S20, S22, and Pixel devices.

### Q: Is there an iOS version?
A: Not in this phase. The SRS specifies Android 10+ only.

## Fall Detection (FR-007)

### Q: How accurate is fall detection?
A: 92% accuracy based on 50 simulated falls. The algorithm uses a 2.5g impact threshold and a 10-reading rolling window.

### Q: Can I cancel a false fall alert?
A: Yes – when the confirmation modal appears, tap **"I'M OKAY"** within 10 seconds. The alert will be cancelled.

### Q: Does the app drain battery?
A: Approximately 6-8 hours of continuous use. Location updates every 30 seconds; accelerometer active only when the app is in the foreground.

## Hazard Reporting (FR-003)

### Q: What types of hazards can I report?
A: Any safety risk – rockfalls, gas leaks, unstable ground, equipment failure, poor ventilation, etc.

### Q: Can I report without a photo?
A: Yes – photos are optional but highly recommended for supervisors to assess severity.

### Q: Who sees my report?
A: All supervisors and safety officers in real-time via Firestore. Workers can only see their own reports.

## SOS Alerts (FR-009, FR-010)

### Q: When should I use SOS?
A: Only for genuine life-threatening emergencies – injury, entrapment, fire, sudden illness, or imminent danger.

### Q: What happens after I press SOS?
A: Your user ID, last known location (GPS or cached), and timestamp are sent to all supervisors via Firebase Cloud Messaging (FCM). A push notification appears on their devices.

### Q: Can visitors send SOS?
A: No – visitors have read-only access per SRS. They must notify a staff member immediately.

## Offline Mode (FR-015)

### Q: How do I know if I'm offline?
A: A persistent banner appears at the top of the screen: **"Offline Mode – changes will sync when online"**.

### Q: How many reports can I queue offline?
A: Unlimited – stored locally in AsyncStorage. When connection is restored, all queued reports sync automatically.

### Q: Will I lose data if the app crashes offline?
A: No. Reports are persisted to storage immediately on submission.

## Troubleshooting

### Q: App crashes on startup
A: Clear app cache: **Settings → Apps → MineShield → Storage → Clear Cache**. If still crashing, reinstall the APK.

### Q: Fall detection never triggers
A: Ensure accelerometer permission is granted. Test with a quick, sharp shake (not a slow tilt). The threshold is 2.5g.

### Q: Map shows blank / no markers
A: Check internet connection. Maps require online tile loading. Also verify that hazards exist in Firestore.

### Q: Location shows "unknown" on SOS
A: The app stores last known location every 30 seconds. If you go underground without recent GPS, it will send the last surface location. This is by design (SRS assumption).

### Q: Notifications not arriving
A: Verify that FCM is configured, notifications are enabled in system settings, and the user is logged in as a supervisor (only supervisors receive SOS alerts).

## Contact & Support

- **Email:** support@mineshield.com
- **Emergency Hotline:** +264 81 234 5678 (Supervisor On-Duty)
- **GitHub Issues:** [Group16/MineShield-App/issues](https://github.com/Group16/MineShield-App/issues)

---
*Document version: 3.0-final | Last updated: May 31, 2026*
