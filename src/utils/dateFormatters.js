const toDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const isValidDate = (value) => Boolean(toDate(value));

export const formatDate = (value, locale = [], options = {}) => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

export const formatDateTime = (value, locale = [], options = {}) => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  });
};

export const formatRelativeTime = (value, fallback = 'Just now') => {
  const date = toDate(value);

  if (!date) {
    return fallback;
  }

  const differenceInMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (differenceInMinutes < 1) {
    return 'Just now';
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} min${differenceInMinutes === 1 ? '' : 's'} ago`;
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `${differenceInHours} hour${differenceInHours === 1 ? '' : 's'} ago`;
  }

  const differenceInDays = Math.round(differenceInHours / 24);
  return `${differenceInDays} day${differenceInDays === 1 ? '' : 's'} ago`;
};

export const toIsoString = (value) => {
  const date = toDate(value);
  return date ? date.toISOString() : '';
};

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  isValidDate,
  toIsoString,
};
