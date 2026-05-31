# Visitor Demo Script - MineShield

**Presenter:** Tulikeni QL Hanghome (Queen)
**Role:** Visitor Demo Presenter
**Phone:** Phone #3 (Samsung / Android 11)
**Duration:** 3 minutes
**SRS Reference:** FR-014 (Visitor receive alerts only - read-only access)

---

## Demo Overview

This demonstration shows the Visitor Mode of MineShield. According to SRS FR-014, visitors have **read-only access** to the app. They can view safe zones, hazards, and receive alerts, but **cannot report hazards or send SOS alerts**.

---

## Demo Flow (3 Minutes)

### 0:00 - 0:15 | Introduction

**Speaker:** "Good morning/afternoon. I am Queen Hanghome, and I will demonstrate the Visitor Mode of MineShield."

**Key points to mention:**
- Visitors are guests, contractors, or inspectors on site
- MineShield provides visitors with safety awareness without reporting capabilities
- Per SRS FR-014, visitors receive alerts only

---

### 0:15 - 0:45 | Login & Dashboard (30 seconds)

**Action:** Open the app and log in as a visitor.

**Speaker:** "When a visitor logs into MineShield, they see the Visitor Dashboard."

**On screen (Phone #3):**
- Orange-themed header showing "MineShield Visitor"
- Safety Status Card showing current safety level
- Two main navigation buttons: "View Hazards" and "View Alerts" (both marked "Read-only")
- Safe Zones section showing designated safe areas
- Emergency Contact information

**Speaker:** "The dashboard shows:
1. Current safety status of the mine
2. Designated safe zones for visitors
3. Recent alerts that have been issued
4. Emergency contact information

Note that visitors cannot see reporting buttons - only read-only information per SRS requirements."

**Point to emphasize:** The "Read-only" badges on navigation buttons.

---

### 0:45 - 1:15 | Viewing Hazards (30 seconds)

**Action:** Tap "View Hazards" button.

**Speaker:** "Now I will show how visitors can view hazards on site."

**On screen:**
- Hazards list with filter options (All / Active / Resolved)
- Each hazard card shows: type, severity, status, description, location, and time
- Red badge for Active hazards
- "Read-Only Mode" notice at top

**Action:** Tap on an active hazard card to open details.

**Speaker:** "Visitors can tap on any hazard to see full details including:
- Hazard type and severity
- Current status
- Exact location
- Description
- When it was reported

**Point to emphasize:** "Notice there is NO 'Report Hazard' button. Visitors cannot create new hazard reports. This is FR-014 compliance - read-only access."

**Action:** Close modal and return to hazards list.

---

### 1:15 - 1:45 | Receiving Alerts (30 seconds)

**Action:** Navigate to Alerts tab.

**Speaker:** "Now let me show you the alert system for visitors."

**On screen:**
- Alerts list showing real-time alerts
- Unread alerts have orange dot indicator
- Red alerts for SOS/Evacuation, orange for hazards, blue for info

**Speaker:** "Per FR-014, visitors RECEIVE alerts in real-time. This is critical for visitor safety."

**Action:** Tap on an SOS alert.

**Speaker:** "When an SOS alert is issued, visitors see detailed instructions:
- Remain calm and follow evacuation procedures
- Proceed to nearest safe zone
- Await further instructions
- Do not use elevators

Important: Visitors CANNOT send SOS alerts or respond to them. They can only receive and follow instructions."

**Point to emphasize:** "The disclaimer at the bottom clearly states: 'Visitor Mode: You cannot respond to alerts. Please contact a supervisor for assistance.'"

---

### 1:45 - 2:15 | Visitor Limitations (30 seconds)

**Speaker:** "Let me summarize the key limitations of Visitor Mode as defined in SRS FR-014:"

**Show on screen (scroll to bottom of any screen):**

| Permission | Visitor | Worker | Supervisor |
|------------|---------|--------|------------|
| View hazards | ✅ | ✅ | ✅ |
| Report hazards | ❌ | ✅ | ✅ |
| View alerts | ✅ | ✅ | ✅ |
| Send SOS | ❌ | ✅ | ✅ |
| View safe zones | ✅ | ✅ | ✅ |
| Track personnel | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ |

**Speaker:** "As you can see, visitors have a focused, read-only experience designed for safety awareness without operational responsibilities."

---

### 2:15 - 2:45 | Q&A Preparation Points (30 seconds)

**Speaker:** "I am prepared to answer questions about visitor functionality, including:"

**Expected Q&A and answers:**

**Q: Why can't visitors report hazards?**
A: "Per SRS FR-014, visitors are not trained mine personnel. Hazard reporting requires site familiarity. If a visitor sees a hazard, they should notify their escort or a supervisor immediately."

**Q: Do visitors get the same alerts as workers?**
A: "Yes. For safety, visitors receive ALL alerts in real-time, including SOS, hazard, and evacuation alerts. This ensures visitors are aware of dangerous situations."

**Q: Can a visitor upgrade to worker mode?**
A: "No. Role is assigned during account creation by supervisors. Visitors cannot change their role within the app."

**Q: What should a visitor do in an emergency?**
A: "Follow the instructions in the alert, proceed to the nearest designated safe zone, and call the emergency contact number displayed on the dashboard."

**Q: Is visitor location tracked?**
A: "No. Per SRS, only workers are location-tracked. Visitors are always escorted by workers or supervisors."

---

### 2:45 - 3:00 | Conclusion

**Speaker:** "In conclusion, MineShield's Visitor Mode provides:

1. **Situational awareness** - Visitors see all hazards and safe zones
2. **Real-time alerts** - Critical for emergency response
3. **Emergency information** - Contact numbers and instructions
4. **SRS FR-014 compliance** - Read-only access as specified

Thank you. I am ready for questions about Visitor Mode."

---

## Demo Checklist

- [ ] APK installed on Phone #3 (Samsung/Android 11)
- [ ] Test login with visitor credentials
- [ ] Dashboard displays correctly with orange theme
- [ ] Hazards list loads and filters work
- [ ] Alert list shows real-time updates
- [ ] No Report Hazard button anywhere
- [ ] No SOS button anywhere
- [ ] Emergency contact number visible
- [ ] Visitor limitations notice visible on all screens

---

## Key Phrases to Remember

| Situation | Phrase |
|-----------|--------|
| Opening | "I am Queen Hanghome demonstrating Visitor Mode." |
| FR-014 | "Per SRS FR-014, visitors have read-only access and receive alerts only." |
| No reporting | "Visitors cannot report hazards - this requires worker/supervisor role." |
| Real-time alerts | "Visitors receive ALL alerts in real-time for safety." |
| Emergency | "In an emergency, visitors should follow alert instructions and proceed to safe zones." |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Verify Firebase Auth has visitor test account |
| Hazards not loading | Check Firestore connection and security rules |
| Alerts not showing | Verify Firestore alerts collection has data |
| App crashes | Check phone's Android version (should be 11) |

---

**Demo Duration:** 3 minutes
**SRS Compliance:** FR-014 verified
**Presentation Focus:** Visitor limitations, read-only access, real-time alerts

*Prepared for Phase 3 Q&A Session - Sunday, May 31, 2026*
