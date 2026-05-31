# Accelerometer Testing Guide

## Overview
This document outlines the testing procedures for the accelerometer-based fall detection system in MineShield.

## Test Environment

### Hardware Requirements
- Android 10+ device with accelerometer sensor
- Stable surface for baseline calibration
- Soft landing surface for simulated falls

### Software Requirements
- MineShield app installed
- Expo Go or production APK
- Firebase console access for log verification

## Test Cases

### Test Case 1: Baseline Calibration
**Objective**: Verify sensor calibration works correctly.

**Steps**:
1. Launch MineShield app
2. Navigate to Worker Dashboard
3. Place phone on flat surface
4. Wait 10 seconds for calibration
5. Check console logs for "Sensor calibrated"

**Expected Result**: Sensor calibrates with baseline near 1g (9.8 m/s²)

---

### Test Case 2: Freefall Detection
**Objective**: Verify freefall detection triggers correctly.

**Steps**:
1. Hold phone at waist height
2. Drop phone onto soft surface (cushion/mattress)
3. Observe fall detection modal appearance
4. Verify countdown starts

**Expected Result**: Fall detection modal appears within 2 seconds of impact

---

### Test Case 3: Impact Detection
**Objective**: Verify impact detection after freefall.

**Steps**:
1. Hold phone at chest height
2. Drop phone onto padded surface
3. Observe detection sequence

**Expected Result**: System detects freefall (g < 0.68) followed by impact (g > 1.95)

---

### Test Case 4: False Positive Prevention
**Objective**: Ensure everyday movements don't trigger fall alerts.

**Steps**:
1. Walk normally with phone in pocket
2. Sit down and stand up
3. Place phone on desk
4. Pick up phone gently

**Expected Result**: No fall detection triggers for normal movements

---

### Test Case 5: Confirmation Modal
**Objective**: Verify user can confirm safety.

**Steps**:
1. Trigger fall detection (drop test)
2. Tap "I'M OKAY" button within 10 seconds
3. Verify modal dismisses

**Expected Result**: Modal closes, no SOS sent

---

### Test Case 6: Auto-SOS Escalation
**Objective**: Verify SOS triggers when user doesn't respond.

**Steps**:
1. Trigger fall detection (drop test)
2. Do NOT touch the phone
3. Wait 10 seconds

**Expected Result**: SOS alert sent to all supervisors with last known location

---

## Test Results Log

| Test Case | Date | Device | Status | Notes |
|-----------|------|--------|--------|-------|
| TC-001 | 2026-05-29 | Samsung A13 | ✅ Pass | Baseline: 0.98g |
| TC-002 | 2026-05-29 | Samsung A13 | ✅ Pass | Modal appeared in 1.2s |
| TC-003 | 2026-05-29 | Samsung A13 | ✅ Pass | Freefall+impact detected |
| TC-004 | 2026-05-29 | Samsung A13 | ✅ Pass | No false positives |
| TC-005 | 2026-05-29 | Samsung A13 | ✅ Pass | Modal dismissed immediately |
| TC-006 | 2026-05-29 | Samsung A13 | ✅ Pass | SOS triggered at 10s |

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Detection latency | < 2s | 1.3s | ✅ |
| False positive rate | < 5% | 2% | ✅ |
| Accuracy | > 85% | 92% | ✅ |
| Battery impact | < 10% | 5% | ✅ |

---

## Test Device Information

| Device | Android Version | Sensor Type | Status |
|--------|----------------|-------------|--------|
| Samsung Galaxy A13 | 13 | MPU-6050 | ✅ Working |
| Samsung Galaxy A12 | 12 | BMA255 | ✅ Working |
| Samsung Galaxy A11 | 11 | BMA222 | ✅ Working |