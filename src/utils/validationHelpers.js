const normalizeString = (value) => String(value || '').trim();

export const isNonEmptyString = (value) => normalizeString(value).length > 0;

export const hasMinLength = (value, minLength = 1) => normalizeString(value).length >= minLength;

export const hasMaxLength = (value, maxLength = Number.MAX_SAFE_INTEGER) =>
  normalizeString(value).length <= maxLength;

export const matchesPattern = (value, pattern) => {
  if (!(pattern instanceof RegExp)) {
    return false;
  }

  return pattern.test(normalizeString(value));
};

export const isEmail = (value) =>
  matchesPattern(
    value,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  );

export const isPhoneNumber = (value) =>
  matchesPattern(
    value,
    /^[+()0-9\s-]{7,}$/
  );

export const isPositiveNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const validateRequiredFields = (valueMap = {}) =>
  Object.entries(valueMap).every(([, value]) => isNonEmptyString(value));

export default {
  hasMaxLength,
  hasMinLength,
  isEmail,
  isNonEmptyString,
  isPhoneNumber,
  isPositiveNumber,
  matchesPattern,
  normalizeString,
  validateRequiredFields,
};
