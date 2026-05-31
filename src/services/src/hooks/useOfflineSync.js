import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { probeConnectivity, syncOfflineHazardQueue } from '../services/offlineService';

const SYNC_RETRY_INTERVAL_MS = 60000;

/**
 * Custom hook to monitor network status and automatically sync
 * offline hazard reports when the connection is restored.
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncInProgressRef = useRef(false);
  const isMountedRef = useRef(true);

  const syncOfflineData = async () => {
    if (isSyncInProgressRef.current) {
      return {
        remainingCount: 0,
        skipped: true,
        syncedCount: 0,
      };
    }

    isSyncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      const online = await probeConnectivity();
      if (isMountedRef.current) {
        setIsOnline(online);
      }

      if (!online) {
        return {
          remainingCount: 0,
          skipped: true,
          syncedCount: 0,
        };
      }

      return await syncOfflineHazardQueue();
    } catch (error) {
      console.error('Error syncing offline hazard queue:', error);
      return {
        error,
        remainingCount: 0,
        syncedCount: 0,
      };
    } finally {
      isSyncInProgressRef.current = false;

      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    let intervalId = null;

    const triggerSync = () => {
      syncOfflineData();
    };

    triggerSync();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        triggerSync();
      }
    });

    intervalId = setInterval(triggerSync, SYNC_RETRY_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      subscription.remove();

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Expose state and manual sync trigger for the UI
  return { isOnline, isSyncing, syncOfflineData };
};
