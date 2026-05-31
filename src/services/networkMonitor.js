export const CONNECTIVITY_TEST_URL = 'https://clients3.google.com/generate_204';

export const probeConnectivity = async () => {
  if (typeof fetch !== 'function') {
    return false;
  }

  try {
    const response = await fetch(CONNECTIVITY_TEST_URL, {
      cache: 'no-store',
      method: 'GET',
      mode: 'no-cors',
    });

    return Boolean(response);
  } catch (error) {
    return false;
  }
};

export const createConnectivityStatus = (isOnline, extra = {}) => ({
  isOnline: Boolean(isOnline),
  label: isOnline ? 'Online' : 'Offline',
  ...extra,
});

export const isLikelyOffline = async () => !(await probeConnectivity());

export default {
  CONNECTIVITY_TEST_URL,
  createConnectivityStatus,
  isLikelyOffline,
  probeConnectivity,
};
