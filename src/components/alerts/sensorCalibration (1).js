export const DEFAULT_ACCELEROMETER_BASELINE = 1;
export const DEFAULT_FALL_THRESHOLD = 0.14;

export const normalizeSensorValue = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const calibrateAccelerometerReading = (
  reading = {},
  baseline = DEFAULT_ACCELEROMETER_BASELINE
) => {
  const x = normalizeSensorValue(reading.x);
  const y = normalizeSensorValue(reading.y);
  const z = normalizeSensorValue(reading.z);
  const magnitude = Math.sqrt(x * x + y * y + z * z);

  return {
    magnitude,
    delta: magnitude - baseline,
  };
};

export const deriveStepThreshold = (baseline = DEFAULT_ACCELEROMETER_BASELINE) =>
  Math.max(DEFAULT_FALL_THRESHOLD, Math.min(0.35, Math.abs(baseline - 1) * 0.5 + DEFAULT_FALL_THRESHOLD));

export default {
  DEFAULT_ACCELEROMETER_BASELINE,
  DEFAULT_FALL_THRESHOLD,
  calibrateAccelerometerReading,
  deriveStepThreshold,
  normalizeSensorValue,
};
