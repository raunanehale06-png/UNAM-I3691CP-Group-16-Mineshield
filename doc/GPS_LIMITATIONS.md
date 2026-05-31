# GPS_LIMITATIONS.md

## MineShield – GPS & Location Limitations Document

**Version:** 1.0  
**Date:** May 31, 2026  
**Author:** Sesilia Estevanhu (Geolocation Lead)  
**Reviewed by:** Klim Gelasius (Lead Developer), Simon Shitana (Project Manager)

---

## 1. Purpose

This document clearly outlines the **GPS and location‑tracking limitations** of the MineShield mobile application. It is intended for mine operators, safety officers, and end‑users (workers, supervisors, visitors) to set realistic expectations and ensure safe usage of the system.

> ⚠️ **Important:** MineShield is a **safety assistance tool**, not a certified replacement for professional mining safety equipment or personnel tracking systems.

---

## 2. Core GPS Limitations (as per SRS Section 2.5)

The following limitations are stated in the System Requirements Specification and are **by design**:

| Limitation | Description | Impact |
|------------|-------------|--------|
| **GPS unavailable underground** | Global Positioning System signals cannot penetrate rock, soil, or deep mine shafts. | The app cannot provide real‑time location once the user enters an underground area. |
| **Internet required for real‑time sync** | Live hazard updates, alerts, and dashboard changes require an active data connection. | Off‑line mode only buffers data; full functionality is restored when connectivity returns. |
| **Smartphone sensors must function** | The app relies on the phone’s built‑in accelerometer, GPS chip, and camera. | Older or damaged phones may produce inaccurate readings. |
| **Worker must possess device at all times** | Location and safety monitoring assume the user carries the phone. | If the phone is left behind, last known location becomes invalid. |
| **Sufficient battery capacity required** | Continuous location tracking (every 30 seconds) consumes power. | Low battery may cause location updates to stop. |

---

## 3. How MineShield Handles GPS Unavailability Underground

Because GPS **does not work** below ground, the app implements a **Last Known Location (LKL)** strategy:

1. **Before entering the mine**  
   The app records the user’s GPS position every 30 seconds while above ground or in areas with signal.

2. **Upon losing GPS signal**  
   - The app detects the loss and continues using the **most recent valid location**.
   - A persistent warning banner appears: *“GPS signal lost – showing last known location from [time]”*.

3. **During the underground shift**  
   - Hazard reports can still be submitted, but they will be tagged with the last known surface/above‑ground location (or a manually selected zone).
   - SOS alerts include the last known location with a flag `"gpsAvailable": false`.
   - Personnel tracking shows “Last seen at [time]” rather than live position.

4. **When returning to surface / signal area**  
   - GPS re‑acquires automatically (typically within 10–30 seconds).
   - All buffered location updates are synchronised to Firestore.

---

## 4. Functional Limitations (What the App Does NOT Do)

| Feature | Not Supported | Reason / SRS Reference |
|---------|---------------|------------------------|
| **Real‑time underground GPS tracking** | ❌ | Physical limitation – GPS signals do not penetrate rock/soil. |
| **Replace certified mining safety equipment** | ❌ | MineShield is a software tool; it does not meet mining safety certifications (e.g., MSHA, IS). See SRS Section 1.2. |
| **Operate fully offline** | ❌ | Real‑time sync requires internet. Offline mode only buffers (SRS Section 1.2). |
| **Background location when app is killed** | ❌ | To preserve battery, location tracking stops if the user force‑closes the app. |
| **Indoor positioning without GPS** | ❌ | No Wi‑Fi or Bluetooth‑based indoor triangulation is implemented in v1.0. |

---

## 5. Accuracy & Environmental Factors

Even when GPS is available, accuracy varies:

| Environment | Expected Accuracy | Notes |
|-------------|-------------------|-------|
| Open pit / surface mine (clear sky) | ±5–10 metres | Best case |
| Near tall equipment / rock walls | ±10–25 metres | Multipath effects reduce precision |
| Inside buildings (above ground) | ±25–100 metres | Uses network location fallback |
| Deep underground | **No GPS** | Last known location only |
| Urban canyon (surface) | ±15–30 metres | Signal reflection from structures |

---

## 6. User Best Practices

To maximise the effectiveness of MineShield’s location features, users should:

- ✅ **Ensure GPS is enabled** before entering the mine (Android Location → High accuracy mode).
- ✅ **Keep the phone charged** – use a portable power bank or charging station at the mine entrance.
- ✅ **Carry the phone on your person** at all times (pocket, belt clip, or armband).
- ✅ **Check the app periodically** – if the “GPS lost” banner appears, note the time and last known location.
- ✅ **Use zone selection when reporting hazards underground** – manually select the appropriate risk zone (Green/Yellow/Red) instead of relying on GPS.
- ✅ **Connect to Wi‑Fi or cellular** at the surface to sync data after returning.

---

## 7. Frequently Asked Questions

### Q1: Can I use MineShield to track workers deep underground in real time?

**A:** No. GPS does not work underground. MineShield stores the last known location from before the worker descended. For real‑time underground tracking, certified systems (e.g., RFID, UWB, leaky feeder) are required.

### Q2: What happens if a worker has no internet connection?

**A:** Hazard reports and SOS alerts are saved locally (AsyncStorage) and automatically uploaded when connectivity is restored. Supervisors will see the hazard with a delay.

### Q3: How accurate is the fall detection if GPS is lost?

**A:** Fall detection uses the accelerometer (motion sensor) – it works completely independently of GPS. The SOS alert will still be sent, but the location attached will be the last known location before signal loss.

### Q4: Can a supervisor see a worker’s location if the app is in the background?

**A:** Yes, if the app is in the background (but not force‑closed) and location permission is set to “Allow all the time”, periodic updates continue. For battery reasons, updates may reduce to once per minute.

### Q5: Does the app work on airplane mode?

**A:** Partial functionality. You can still use the accelerometer and take photos, but real‑time sync, live map updates, and push notifications are suspended. Once airplane mode is disabled, all pending data synchronises.

---

## 8. Comparison with Certified Mining Safety Systems

| Feature | MineShield | Certified Mining System (e.g., VDV, PED) |
|---------|------------|------------------------------------------|
| Cost | Low (uses existing smartphones) | High (dedicated hardware) |
| Underground GPS | ❌ No | ❌ No (same physical limitation) |
| Real‑time tracking underground | ❌ No (last known only) | ✅ Yes (via RFID/UWB tags) |
| Fall detection | ✅ Yes (accelerometer) | ✅ Yes (specialised sensors) |
| Hazard reporting | ✅ Yes (photo + description) | Rarely available |
| Certification | None (consumer grade) | MSHA, ATEX, IECEx |
| Battery life | 6–8 hours | Days to weeks |

---

## 9. Acceptance of Limitations

By using MineShield, the mining company and end‑users acknowledge that:

- The system **cannot prevent accidents** – it only improves awareness and response.
- Underground location is **not real‑time** – last known location is an approximation.
- MineShield **does not replace** any mandated safety equipment (gas detectors, refuge chambers, two‑way communication systems).
- The user is responsible for maintaining device battery and connectivity.

This is consistent with the SRS Section 2.5 (Assumptions and Constraints) and the Conclusion in Section 6 of the SRS.

---

## 10. Document Sign‑Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Geolocation Lead | Sesilia Estevanhu | *signed* | 2026‑05‑31 |
| Lead Developer | Klim Gelasius | *signed* | 2026‑05‑31 |
| Project Manager | Simon Shitana | *signed* | 2026‑05‑31 |

---

## 11. References

- **MineShield SRS** – Section 1.2 (Product Scope – features NOT possessed), Section 2.5 (Assumptions and Constraints)
- **Phase 3 Q&A Preparation Guide** – Question 3 & 27 (GPS underground, battery life)
- **GEOLOCATION_TESTING.md** – TC‑LOC‑04 (last known location fallback)
- **Phase 2 Implementation Plan** – Group E (Geolocation & SOS)

---

**End of GPS Limitations Document**
