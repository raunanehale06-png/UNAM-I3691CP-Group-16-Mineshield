const SEVERITY_SCORES = {
  low: 25,
  medium: 55,
  high: 85,
  critical: 95,
};

const normalizeSeverity = (severity) => String(severity || 'medium').trim().toLowerCase();

const toNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const numericOrFallback = (value, fallback) => {
  const numeric = toNumeric(value);
  return numeric === null ? fallback : numeric;
};

export const resolveRiskLevel = (score) => {
  if (score >= 85) {
    return 'Critical';
  }

  if (score >= 60) {
    return 'High';
  }

  if (score >= 35) {
    return 'Moderate';
  }

  return 'Low';
};

export const calculateRiskScore = (input = {}) => {
  const severityScore = SEVERITY_SCORES[normalizeSeverity(input.severity)] || SEVERITY_SCORES.medium;
  const methaneLevel = numericOrFallback(input.ch4, 0);
  const oxygenLevel = numericOrFallback(input.o2, 20);
  const temperature = numericOrFallback(input.temp, 24);
  const structuralConfidence = numericOrFallback(
    input.structuralConfidence ?? input.structural,
    20
  );
  const gasScore = Math.min(25, Math.max(0, methaneLevel * 10));
  const oxygenScore = Math.max(0, 20 - oxygenLevel) * 2;
  const temperatureScore = Math.max(0, temperature - 24) * 1.5;
  const structuralScore = Math.min(
    20,
    Math.max(0, 20 - structuralConfidence)
  );

  return Math.round(
    Math.max(0, Math.min(100, severityScore * 0.45 + gasScore + oxygenScore + temperatureScore + structuralScore))
  );
};

export const describeRiskScore = (score) => `${resolveRiskLevel(score)} risk`;

export default {
  calculateRiskScore,
  describeRiskScore,
  resolveRiskLevel,
};
