import { useCallback, useState } from 'react';

import { broadcastWorkerSOS } from '../services/workerEmergencyService';

export default function useSOS() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const sendSOS = useCallback(async (options = {}) => {
    setSending(true);
    setError(null);

    try {
      return await broadcastWorkerSOS(options);
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    } finally {
      setSending(false);
    }
  }, []);

  return {
    error,
    sendSOS,
    sending,
    clearError: () => setError(null),
  };
}
