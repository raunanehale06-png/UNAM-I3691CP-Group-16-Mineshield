import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverTimestamp } from 'firebase/firestore';

import {
  addAlert,
  addHazard,
  getAlertsByClientReportId,
  getHazardsByClientReportId,
  updateHazard,
} from './firestoreService';
import { geocodeLocationLabel } from './locationService';
import {
  buildInlineImageDataUriFromAsset,
  getStringByteSize,
  uploadImage,
} from './storageService';

const HAZARD_QUEUE_KEY = '@mineshield_hazard_queue';
const CONNECTIVITY_TEST_URL = 'https://clients3.google.com/generate_204';
const MAX_INLINE_HAZARD_IMAGE_BYTES = 500 * 1024;

let activeSyncPromise = null;

const buildQueueId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const parseQueue = (queueStr) => {
  if (!queueStr) {
    return [];
  }

  try {
    const parsedQueue = JSON.parse(queueStr);
    return Array.isArray(parsedQueue) ? parsedQueue : [];
  } catch (error) {
    console.error('Error parsing offline queue:', error);
    return [];
  }
};

const readOfflineQueue = async () => {
  const queueStr = await AsyncStorage.getItem(HAZARD_QUEUE_KEY);
  return parseQueue(queueStr);
};

const writeOfflineQueue = async (queue) => {
  if (!queue.length) {
    await AsyncStorage.removeItem(HAZARD_QUEUE_KEY);
    return;
  }

  await AsyncStorage.setItem(HAZARD_QUEUE_KEY, JSON.stringify(queue));
};

const normalizeLocation = (location) => {
  if (!location) {
    return null;
  }

  if (typeof location === 'string') {
    return {
      label: location,
    };
  }

  return {
    ...location,
    label:
      location.label ||
      location.area ||
      location.landmark ||
      location.zone ||
      'General Site',
  };
};

const buildAlertBody = (description) => {
  const trimmedDescription = String(description || '').trim();

  if (!trimmedDescription) {
    return 'Hazard report queued from the field.';
  }

  if (trimmedDescription.length <= 90) {
    return trimmedDescription;
  }

  return `${trimmedDescription.slice(0, 87)}...`;
};

const buildQueuedHazardPayload = async (report) => {
  const location = normalizeLocation(report?.location);
  let resolvedLocation = location;

  if (
    resolvedLocation?.label &&
    (typeof resolvedLocation.latitude !== 'number' || typeof resolvedLocation.longitude !== 'number')
  ) {
    const geocodedCoordinates = await geocodeLocationLabel(resolvedLocation.label);

    if (geocodedCoordinates) {
      resolvedLocation = {
        ...resolvedLocation,
        ...geocodedCoordinates,
      };
    }
  }

  const normalizedZone =
    String(report?.zone || '').trim() ||
    resolvedLocation?.area ||
    resolvedLocation?.label ||
    report?.zoneId ||
    'General Site';
  const normalizedStatus =
    String(report?.status || '').trim().toLowerCase() === 'pending_sync'
      ? 'reported'
      : report?.status || 'reported';
  return {
    clientReportId: report?.localId,
    description: report?.description || '',
    latitude:
      typeof resolvedLocation?.latitude === 'number'
        ? resolvedLocation.latitude
        : report?.latitude ?? null,
    location: resolvedLocation || null,
    locationLabel: resolvedLocation?.label || report?.locationLabel || normalizedZone,
    longitude:
      typeof resolvedLocation?.longitude === 'number'
        ? resolvedLocation.longitude
        : report?.longitude ?? null,
    reportedBy: report?.reportedBy || 'Worker',
    severity: report?.severity || 'MEDIUM',
    status: normalizedStatus,
    userId: report?.userId ?? null,
    zone: normalizedZone,
    zoneId: normalizedZone,
  };
};

const syncQueuedHazardImage = async (report, hazard) => {
  if (!report?.imageAsset || hazard?.imageUrl || hazard?.imageURL) {
    return hazard;
  }

  const storedImageAsset = report.imageAsset;

  if (storedImageAsset.uri) {
    try {
      const uploadedImageUrl = await uploadImage(storedImageAsset, hazard.id);

      if (uploadedImageUrl) {
        await updateHazard(hazard.id, {
          imageURL: uploadedImageUrl,
          imageUrl: uploadedImageUrl,
          imageMode: 'storage',
        });

        return {
          ...hazard,
          imageURL: uploadedImageUrl,
          imageUrl: uploadedImageUrl,
        };
      }
    } catch (error) {
      const inlineHazardImage = await buildInlineImageDataUriFromAsset(storedImageAsset, {
        maxBytes: MAX_INLINE_HAZARD_IMAGE_BYTES,
      });
      const inlineHazardImageSize = getStringByteSize(inlineHazardImage);

      if (
        inlineHazardImage &&
        inlineHazardImageSize > 0 &&
        inlineHazardImageSize <= MAX_INLINE_HAZARD_IMAGE_BYTES
      ) {
        await updateHazard(hazard.id, {
          imageURL: inlineHazardImage,
          imageUrl: inlineHazardImage,
          imageMode: 'inline',
        });

        return {
          ...hazard,
          imageURL: inlineHazardImage,
          imageUrl: inlineHazardImage,
        };
      }

      console.error('Queued hazard image upload failed:', {
        code: error?.code,
        message: error?.message,
        inlineHazardImageSize,
      });
    }
  }

  const inlineHazardImage = await buildInlineImageDataUriFromAsset(storedImageAsset, {
    maxBytes: MAX_INLINE_HAZARD_IMAGE_BYTES,
  });
  const inlineHazardImageSize = getStringByteSize(inlineHazardImage);

  if (
    inlineHazardImage &&
    inlineHazardImageSize > 0 &&
    inlineHazardImageSize <= MAX_INLINE_HAZARD_IMAGE_BYTES
  ) {
    await updateHazard(hazard.id, {
      imageURL: inlineHazardImage,
      imageUrl: inlineHazardImage,
      imageMode: 'inline',
    });

    return {
      ...hazard,
      imageURL: inlineHazardImage,
      imageUrl: inlineHazardImage,
    };
  }

  return hazard;
};

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

/**
 * Saves a hazard report to the local offline queue.
 * @param {Object} report - The hazard report data.
 */
export const saveToOfflineQueue = async (report) => {
  try {
    const existingQueue = await readOfflineQueue();
    const queuedReport = {
      ...report,
      localId: report?.localId || buildQueueId(),
      queuedAt: report?.queuedAt || new Date().toISOString(),
      status: report?.status || 'pending_sync',
    };

    await writeOfflineQueue([...existingQueue, queuedReport]);
    console.log('Hazard report queued for offline sync.');

    return queuedReport;
  } catch (error) {
    console.error('Error saving to offline queue:', error);
    return null;
  }
};

/**
 * Retrieves all pending hazard reports from the offline queue.
 * @returns {Promise<Array>} Array of queued reports.
 */
export const getOfflineQueue = async () => {
  try {
    return await readOfflineQueue();
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
};

/**
 * Clears the offline queue after a successful sync.
 */
export const clearOfflineQueue = async () => {
  try {
    await AsyncStorage.removeItem(HAZARD_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
};

const syncQueuedHazardReport = async (report) => {
  if (!report?.localId) {
    throw new Error('Queued hazard report is missing a local ID.');
  }

  const hazardPayload = await buildQueuedHazardPayload(report);
  const existingHazards = await getHazardsByClientReportId(report.localId);
  let hazard = existingHazards[0] || null;

  if (!hazard) {
    hazard = await addHazard(hazardPayload);
  } else {
    const hazardUpdates = {};

    if (hazardPayload.imageUrl && !hazard.imageUrl) {
      hazardUpdates.imageURL = hazardPayload.imageUrl;
      hazardUpdates.imageUrl = hazardPayload.imageUrl;
    }

    if (!hazard.location && hazardPayload.location) {
      hazardUpdates.location = hazardPayload.location;
      hazardUpdates.locationLabel = hazardPayload.locationLabel;
      hazardUpdates.latitude = hazardPayload.latitude;
      hazardUpdates.longitude = hazardPayload.longitude;
    }

    if (hazardPayload.zone && hazard.zone !== hazardPayload.zone) {
      hazardUpdates.zone = hazardPayload.zone;
      hazardUpdates.zoneId = hazardPayload.zoneId;
    }

    if (hazard.status === 'pending_sync' && hazardPayload.status !== 'pending_sync') {
      hazardUpdates.status = hazardPayload.status;
    }

    if (Object.keys(hazardUpdates).length > 0) {
      await updateHazard(hazard.id, hazardUpdates);
      hazard = {
        ...hazard,
        ...hazardUpdates,
      };
    }
  }

  hazard = await syncQueuedHazardImage(report, hazard);

  const existingAlerts = await getAlertsByClientReportId(report.localId);

  if (existingAlerts.length === 0) {
    const hazardSeverity = String(hazardPayload.severity || 'MEDIUM').toUpperCase();

    await addAlert({
      body: buildAlertBody(hazardPayload.description),
      clientReportId: report.localId,
      createdAt: serverTimestamp(),
      hazardId: hazard.id,
      read: false,
      severity: hazardSeverity,
      timestamp: serverTimestamp(),
      title: `Hazard Level: ${hazardSeverity}`,
      type: hazardSeverity === 'HIGH' ? 'HIGH_HAZARD' : 'HAZARD_REPORTED',
      userId: hazardPayload.userId,
      zone: hazardPayload.zone,
      zoneId: hazardPayload.zoneId,
    });
  }

  return {
    hazard,
    report,
  };
};

/**
 * Processes the queued hazard reports and leaves failed items in the queue.
 */
export const syncOfflineHazardQueue = async () => {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    const queue = await readOfflineQueue();

    if (queue.length === 0) {
      return {
        remainingCount: 0,
        syncedCount: 0,
        syncedReports: [],
      };
    }

    const remainingQueue = [];
    const syncedReports = [];

    for (const report of queue) {
      try {
        const syncedReport = await syncQueuedHazardReport(report);
        syncedReports.push(syncedReport);
      } catch (error) {
        remainingQueue.push(report);
        console.error('Sync failed for queued hazard report:', {
          error,
          localId: report?.localId,
        });
      }
    }

    await writeOfflineQueue(remainingQueue);

    if (remainingQueue.length === 0) {
      console.log(`Offline sync completed successfully for ${syncedReports.length} hazard reports.`);
    } else {
      console.log(
        `Offline sync processed ${syncedReports.length} hazard reports; ${remainingQueue.length} remain queued.`
      );
    }

    return {
      remainingCount: remainingQueue.length,
      syncedCount: syncedReports.length,
      syncedReports,
    };
  })();

  try {
    return await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
};
