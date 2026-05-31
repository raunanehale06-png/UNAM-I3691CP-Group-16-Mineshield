import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Vibration } from 'react-native';
import { Accelerometer, Barometer, Pedometer } from 'expo-sensors';

import { addFallListener, startSensorMonitoring, stopSensorMonitoring } from '../services/sensorService';

let Battery = null;

try {
  Battery = require('expo-battery');
} catch (error) {
  Battery = null;
}

const PRESSURE_UNAVAILABLE = {
  value: 'Not available',
  hint: 'No barometer',
};

const createStatus = (value, hint) => ({
  value,
  hint,
});

const FALLBACK_STEP_THRESHOLD = 0.14;
const FALLBACK_STEP_DEBOUNCE_MS = 450;
const FALL_RESPONSE_TIMEOUT_MS = 10_000;
const BAROMETER_UPDATE_INTERVAL_MS = 1000;

const formatBatteryLevel = (level) => {
  if (typeof level !== 'number' || level < 0) {
    return 'Unknown';
  }

  return `${Math.round(level * 100)}%`;
};

const formatPressureLevel = (level) => {
  if (typeof level !== 'number' || !Number.isFinite(level)) {
    return 'Unavailable';
  }

  return `${level.toFixed(1)} hPa`;
};

export default function useSensors(options = {}) {
  const {
    enableFallDetection = true,
    onFallDetected,
    onCriticalFallDetected,
    triggerSOS,
  } = options || {};

  const [pressureStatus, setPressureStatus] = useState(PRESSURE_UNAVAILABLE);
  const [stepsStatus, setStepsStatus] = useState(createStatus('Starting...', 'Motion sensor'));
  const [batteryStatus, setBatteryStatus] = useState(createStatus('Starting...', 'Phone battery'));
  const [fallDetected, setFallDetected] = useState(false);
  const [fallCountdown, setFallCountdown] = useState(FALL_RESPONSE_TIMEOUT_MS / 1000);

  const countdownIntervalRef = useRef(null);
  const autoEscalateTimeoutRef = useRef(null);
  const fallAlertActiveRef = useRef(false);
  const isMountedRef = useRef(true);
  const onFallDetectedRef = useRef(onFallDetected);
  const onCriticalFallDetectedRef = useRef(onCriticalFallDetected);
  const triggerSOSRef = useRef(triggerSOS);

  useEffect(() => {
    onFallDetectedRef.current = onFallDetected;
  }, [onFallDetected]);

  useEffect(() => {
    onCriticalFallDetectedRef.current = onCriticalFallDetected;
  }, [onCriticalFallDetected]);

  useEffect(() => {
    triggerSOSRef.current = triggerSOS;
  }, [triggerSOS]);

  const clearFallTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (autoEscalateTimeoutRef.current) {
      clearTimeout(autoEscalateTimeoutRef.current);
      autoEscalateTimeoutRef.current = null;
    }
  }, []);

  const dismissFallAlert = useCallback(() => {
    clearFallTimers();
    fallAlertActiveRef.current = false;

    if (isMountedRef.current) {
      setFallDetected(false);
      setFallCountdown(FALL_RESPONSE_TIMEOUT_MS / 1000);
    }
  }, [clearFallTimers]);

  const triggerEmergencyResponse = useCallback(() => {
    const triggerSOSCallback = triggerSOSRef.current;

    if (typeof triggerSOSCallback === 'function') {
      triggerSOSCallback();
      return;
    }

    Alert.alert('SOS', 'Emergency response is unavailable on this screen.');
  }, []);

  const escalateNow = useCallback(() => {
    dismissFallAlert();
    triggerEmergencyResponse();
  }, [dismissFallAlert, triggerEmergencyResponse]);

  const startFallCountdown = useCallback(() => {
    clearFallTimers();
    fallAlertActiveRef.current = true;

    if (isMountedRef.current) {
      setFallCountdown(FALL_RESPONSE_TIMEOUT_MS / 1000);
      setFallDetected(true);
    }

    Vibration.vibrate([0, 220, 100, 220]);

    countdownIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        return;
      }

      setFallCountdown((previous) => {
        if (previous <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    autoEscalateTimeoutRef.current = setTimeout(() => {
      dismissFallAlert();
      triggerEmergencyResponse();
    }, FALL_RESPONSE_TIMEOUT_MS);
  }, [clearFallTimers, dismissFallAlert, triggerEmergencyResponse]);

  const onFall = useCallback(() => {
    if (!isMountedRef.current || fallAlertActiveRef.current) {
      return;
    }

    onFallDetectedRef.current?.();
    const maybeCriticalResponse = onCriticalFallDetectedRef.current?.();

    if (maybeCriticalResponse && typeof maybeCriticalResponse.then === 'function') {
      void maybeCriticalResponse.catch((error) => {
        console.warn('[useSensors] Critical fall SOS callback failed:', error);
      });
    }

    startFallCountdown();
  }, [startFallCountdown]);

  const confirmOkay = useCallback(() => {
    dismissFallAlert();
  }, [dismissFallAlert]);

  useEffect(() => {
    if (!enableFallDetection) {
      return undefined;
    }

    isMountedRef.current = true;

    startSensorMonitoring();
    const unsubscribe = addFallListener({ onFall });

    return () => {
      isMountedRef.current = false;
      fallAlertActiveRef.current = false;
      unsubscribe();
      stopSensorMonitoring();
      clearFallTimers();
    };
  }, [clearFallTimers, enableFallDetection, onFall]);

  useEffect(() => {
    let isMounted = true;
    let stepSubscription = null;
    let accelerometerSubscription = null;
    let baseSteps = 0;
    let estimatedSteps = 0;
    let baselineMagnitude = 1;
    let lastStepTimestamp = 0;

    const startEstimatedTracking = async (fallbackHint = 'Estimated session') => {
      try {
        const accelerometerAvailable = await Accelerometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        if (!accelerometerAvailable) {
          setStepsStatus(createStatus('Permission needed', 'Open motion settings'));
          return;
        }

        Accelerometer.setUpdateInterval(enableFallDetection ? 50 : 350);
        setStepsStatus(createStatus('0', fallbackHint));

        accelerometerSubscription = Accelerometer.addListener(({ x = 0, y = 0, z = 0 }) => {
          if (!isMounted) {
            return;
          }

          const magnitude = Math.sqrt(x * x + y * y + z * z);
          baselineMagnitude = baselineMagnitude * 0.82 + magnitude * 0.18;
          const movementDelta = magnitude - baselineMagnitude;
          const now = Date.now();

          if (
            movementDelta > FALLBACK_STEP_THRESHOLD &&
            now - lastStepTimestamp > FALLBACK_STEP_DEBOUNCE_MS
          ) {
            estimatedSteps += 1;
            lastStepTimestamp = now;
            setStepsStatus(createStatus(estimatedSteps.toLocaleString(), fallbackHint));
          }
        });
      } catch (error) {
        if (isMounted) {
          setStepsStatus(createStatus('Unavailable', 'Motion sensor'));
        }
      }
    };

    const startPedometerTracking = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        if (!isAvailable) {
          await startEstimatedTracking('Estimated session');
          return;
        }

        let permission = await Pedometer.getPermissionsAsync();

        if (!permission.granted && permission.canAskAgain) {
          permission = await Pedometer.requestPermissionsAsync();
        }

        if (!isMounted) {
          return;
        }

        if (!permission.granted) {
          await startEstimatedTracking(
            permission.canAskAgain ? 'Estimated session' : 'Open motion settings'
          );
          return;
        }

        if (Platform.OS === 'ios') {
          try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
            baseSteps = Math.max(0, Math.round(result?.steps ?? 0));

            if (isMounted) {
              setStepsStatus(createStatus(baseSteps.toLocaleString(), 'Today'));
            }
          } catch (error) {
            if (isMounted) {
              setStepsStatus(createStatus('0', 'Live'));
            }
          }
        } else {
          setStepsStatus(createStatus('0', 'Session'));
        }

        stepSubscription = Pedometer.watchStepCount((result) => {
          if (!isMounted) {
            return;
          }

          const nextSteps = Math.max(0, Math.round(baseSteps + (result?.steps ?? 0)));
          setStepsStatus(
            createStatus(nextSteps.toLocaleString(), Platform.OS === 'ios' ? 'Today' : 'Session')
          );
        });
      } catch (error) {
        await startEstimatedTracking('Estimated session');
      }
    };

    startPedometerTracking();

    return () => {
      isMounted = false;
      stepSubscription?.remove?.();
      accelerometerSubscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let batterySubscription = null;

    const applyBatteryLevel = (level) => {
      if (!isMounted) {
        return;
      }

      setBatteryStatus(createStatus(formatBatteryLevel(level), 'Phone battery'));
    };

    const startBatteryTracking = async () => {
      if (!Battery) {
        setBatteryStatus(createStatus('Unavailable', 'Battery module'));
        return;
      }

      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        applyBatteryLevel(batteryLevel);

        batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel: nextLevel }) => {
          applyBatteryLevel(nextLevel);
        });
      } catch (error) {
        if (isMounted) {
          setBatteryStatus(createStatus('Unavailable', 'Battery API'));
        }
      }
    };

    startBatteryTracking();

    return () => {
      isMounted = false;
      batterySubscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pressureSubscription = null;

    const applyPressureLevel = (level) => {
      if (!isMounted) {
        return;
      }

      setPressureStatus(
        createStatus(formatPressureLevel(level), 'Atmospheric pressure')
      );
    };

    const startPressureTracking = async () => {
      if (Platform.OS === 'web') {
        setPressureStatus(createStatus('Unavailable', 'Web sensor limited'));
        return;
      }

      try {
        let permission = await Barometer.getPermissionsAsync();

        if (!isMounted) {
          return;
        }

        if (!permission.granted && permission.canAskAgain) {
          permission = await Barometer.requestPermissionsAsync();
        }

        if (!isMounted) {
          return;
        }

        if (!permission.granted) {
          setPressureStatus(
            createStatus(
              'Permission needed',
              permission.canAskAgain ? 'Allow sensor access' : 'Open settings'
            )
          );
          return;
        }

        const available = await Barometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        if (!available) {
          setPressureStatus(PRESSURE_UNAVAILABLE);
          return;
        }

        Barometer.setUpdateInterval(BAROMETER_UPDATE_INTERVAL_MS);
        setPressureStatus(createStatus('Listening...', 'Barometer'));

        pressureSubscription = Barometer.addListener(({ pressure }) => {
          applyPressureLevel(pressure);
        });
      } catch (error) {
        if (isMounted) {
          setPressureStatus(createStatus('Unavailable', 'Barometer'));
        }
      }
    };

    startPressureTracking();

    return () => {
      isMounted = false;
      pressureSubscription?.remove?.();
    };
  }, []);

  return {
    pressureStatus,
    stepsStatus,
    batteryStatus,
    fallDetected,
    fallCountdown,
    confirmOkay,
    escalateNow,
  };
}
