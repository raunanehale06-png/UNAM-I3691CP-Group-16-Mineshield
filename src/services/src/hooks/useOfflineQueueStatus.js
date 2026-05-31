import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getOfflineQueue } from '../services/offlineService';

const QUEUE_REFRESH_INTERVAL_MS = 30000;

export const useOfflineQueueStatus = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    try {
      const queue = await getOfflineQueue();
      setPendingCount(Array.isArray(queue) ? queue.length : 0);
    } catch (error) {
      console.error('Unable to read pending offline hazard queue:', error);
      setPendingCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPendingCount();
      return undefined;
    }, [refreshPendingCount])
  );

  useEffect(() => {
    refreshPendingCount();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshPendingCount();
      }
    });

    const intervalId = setInterval(refreshPendingCount, QUEUE_REFRESH_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [refreshPendingCount]);

  return {
    hasPendingReports: pendingCount > 0,
    pendingCount,
    refreshPendingCount,
  };
};
