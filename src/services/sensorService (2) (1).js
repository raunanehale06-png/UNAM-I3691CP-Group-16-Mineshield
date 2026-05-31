import { Accelerometer } from 'expo-sensors';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { auth, db } from './firebase';

const SAMPLE_INTERVAL_MS = 40;
const FREEFALL_THRESHOLD = 0.68;
const IMPACT_THRESHOLD = 1.95;
// Expo's accelerometer readings include gravity, so a stationary device sits near 1g.
const STILLNESS_VARIANCE = 0.34;
const FREEFALL_WINDOW_MS = 1800;
const IMPACT_WINDOW_MS = 4200;
const INACTIVITY_DURATION_MS = 1200;
const DEBOUNCE_MS = 3000;

let subscription = null;
let listeners = [];
let lastFallTime = 0;
let state = 'IDLE';
let freefallTimer = null;
let impactTimer = null;
let stillnessTimer = null;
let activeUserId = null;

const magnitude = ({ x = 0, y = 0, z = 0 }) => Math.sqrt(x * x + y * y + z * z);

const isStationaryAcceleration = (g) => Math.abs(g - 1) <= STILLNESS_VARIANCE;

const clearTimer = (timerRef) => {
  if (timerRef) {
    clearTimeout(timerRef);
  }

  return null;
};

const resetState = () => {
  freefallTimer = clearTimer(freefallTimer);
  impactTimer = clearTimer(impactTimer);
  stillnessTimer = clearTimer(stillnessTimer);
  state = 'IDLE';
};

const getCurrentUserId = () => auth.currentUser?.uid || activeUserId || null;

const logFallToFirestore = async ({ userId = getCurrentUserId(), confidence = 0.9 } = {}) => {
  try {
    await addDoc(collection(db, 'sensorLogs'), {
      type: 'fall_detected',
      timestamp: serverTimestamp(),
      resolved: false,
      userId,
      confidence,
    });
  } catch (error) {
    console.warn('[sensorService] Firestore log failed:', error);
  }
};

const emitFall = (userId = getCurrentUserId()) => {
  const now = Date.now();

  if (now - lastFallTime < DEBOUNCE_MS) {
    return;
  }

  lastFallTime = now;
  logFallToFirestore({ userId, confidence: 0.93 });

  listeners.forEach(({ onFall }) => {
    try {
      onFall?.();
    } catch (error) {
      console.warn('[sensorService] onFall listener error:', error);
    }
  });
};

const handleAccelerometerData = (data) => {
  const g = magnitude(data);

  if (state === 'IDLE' && g < FREEFALL_THRESHOLD) {
    state = 'FREEFALL_DETECTED';
    freefallTimer = clearTimer(freefallTimer);
    freefallTimer = setTimeout(() => {
      resetState();
    }, FREEFALL_WINDOW_MS);
    return;
  }

  if (state === 'IDLE' && g > IMPACT_THRESHOLD) {
    state = 'IMPACT_DETECTED';
    impactTimer = clearTimer(impactTimer);
    impactTimer = setTimeout(() => {
      resetState();
    }, IMPACT_WINDOW_MS);
    return;
  }

  if (state === 'FREEFALL_DETECTED' && g > IMPACT_THRESHOLD) {
    state = 'IMPACT_DETECTED';
    freefallTimer = clearTimer(freefallTimer);
    impactTimer = clearTimer(impactTimer);
    impactTimer = setTimeout(() => {
      resetState();
    }, IMPACT_WINDOW_MS);
    return;
  }

  if (state === 'IMPACT_DETECTED') {
    if (isStationaryAcceleration(g)) {
      if (stillnessTimer) {
        return;
      }

      stillnessTimer = setTimeout(() => {
        emitFall();
        resetState();
      }, INACTIVITY_DURATION_MS);
    } else {
      stillnessTimer = clearTimer(stillnessTimer);
    }
  }
};

export const startSensorMonitoring = async ({ userId = null } = {}) => {
  if (subscription) {
    if (userId) {
      activeUserId = userId;
    }

    return;
  }

  try {
    activeUserId = userId || activeUserId;

    const available =
      typeof Accelerometer.isAvailableAsync === 'function'
        ? await Accelerometer.isAvailableAsync()
        : true;

    if (!available) {
      console.warn('[sensorService] Accelerometer unavailable');
      return;
    }

    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
    subscription = Accelerometer.addListener(handleAccelerometerData);
  } catch (error) {
    console.warn('[sensorService] Failed to start:', error);
  }
};

export const stopSensorMonitoring = () => {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }

  activeUserId = null;
  resetState();
};

export const addFallListener = (listener) => {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((current) => current !== listener);
  };
};
