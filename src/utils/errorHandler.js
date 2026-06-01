export const getErrorMessage = (error, fallback = 'Something went wrong.') =>
  error?.message || fallback;

export const normalizeError = (error, fallback = 'Unknown error') => {
  if (error instanceof Error) {
    return error;
  }

  const message = typeof error === 'string' && error.trim() ? error : fallback;
  return new Error(message);
};

export const isRetryableError = (error) => {
  const normalizedCode = String(error?.code || '').toLowerCase();
  const normalizedMessage = String(error?.message || '').toLowerCase();

  return (
    normalizedCode.includes('unavailable') ||
    normalizedCode.includes('timeout') ||
    normalizedCode.includes('network') ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('timeout') ||
    normalizedMessage.includes('temporarily')
  );
};

export const logError = (context, error, extra = {}) => {
  console.error(`[${context}]`, {
    message: getErrorMessage(error),
    code: error?.code || 'unknown',
    ...extra,
    error,
  });
};

export default {
  getErrorMessage,
  isRetryableError,
  logError,
  normalizeError,
};
