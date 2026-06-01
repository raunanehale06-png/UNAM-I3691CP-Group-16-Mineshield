import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebase';
import { buildHazardReportCode, createHazardReportCode } from '../utils/hazardReportCode';
import { sanitizeLocationLabel } from './locationService';

const hazardsCollection = collection(db, 'hazards');
const alertsCollection = collection(db, 'alerts');
const zonesCollection = collection(db, 'zones');

const normalizeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const getSortableTime = (value) => {
  if (!value) {
    return 0;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsedValue = Date.parse(value);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const getHazardEventTimestamp = (data) => data.createdAt ?? data.timestamp ?? data.updatedAt ?? null;

const resolveLocationLabel = (data) => {
  const candidate =
    data.locationLabel ||
    (typeof data.location === 'string' && data.location.trim() ? data.location : '') ||
    data.location?.label ||
    data.location?.area ||
    data.zone ||
    data.zoneId ||
    'GPS location';

  return sanitizeLocationLabel(candidate, 'GPS location');
};

const mapHazardDocument = (snapshot) => {
  const data = snapshot.data();
  const eventTimestamp = getHazardEventTimestamp(data);
  const normalizedImageUrl = data.imageUrl ?? data.imageURL ?? '';
  const normalizedLocationLabel = resolveLocationLabel(data);
  const reportCode = buildHazardReportCode({
    id: snapshot.id,
    reportCode: data.reportCode,
    createdAt: eventTimestamp,
    timestamp: data.timestamp,
    updatedAt: data.updatedAt,
  });

  return {
    id: snapshot.id,
    ...data,
    createdAt: normalizeTimestamp(eventTimestamp),
    imageURL: normalizedImageUrl,
    imageUrl: normalizedImageUrl,
    locationLabel: normalizedLocationLabel,
    reportCode,
    reportedBy: data.reportedBy ?? 'Worker',
    timestamp: normalizeTimestamp(eventTimestamp),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
};

const sortHazardsByNewest = (hazards) =>
  [...hazards].sort(
    (leftHazard, rightHazard) =>
      getSortableTime(rightHazard.createdAt) - getSortableTime(leftHazard.createdAt)
  );

export const addHazard = async (hazardData) => {
  const hazardRef = doc(hazardsCollection);
  const createdAtDate = new Date();
  const reportCode = createHazardReportCode({
    id: hazardRef.id,
    date: createdAtDate,
  });
  const normalizedImageUrl = hazardData.imageUrl ?? hazardData.imageURL ?? '';
  const normalizedLocationLabel = resolveLocationLabel(hazardData);
  const payload = {
    ...hazardData,
    imageURL: normalizedImageUrl,
    imageUrl: normalizedImageUrl,
    locationLabel: normalizedLocationLabel,
    reportCode,
    status: hazardData.status ?? 'reported',
    resolved: Boolean(hazardData.resolved),
    isResolved: Boolean(hazardData.isResolved),
    closed: Boolean(hazardData.closed),
    completed: Boolean(hazardData.completed),
    createdAt: serverTimestamp(),
    timestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(hazardRef, payload);
  const localTimestamp = createdAtDate.toISOString();

  return {
    id: hazardRef.id,
    ...hazardData,
    imageURL: normalizedImageUrl,
    imageUrl: normalizedImageUrl,
    locationLabel: normalizedLocationLabel,
    reportCode,
    status: payload.status,
    createdAt: localTimestamp,
    timestamp: localTimestamp,
    updatedAt: localTimestamp,
  };
};

export const getHazardsByUser = async (userId) => {
  if (!userId) {
    return [];
  }

  const snapshot = await getDocs(query(hazardsCollection, where('userId', '==', userId)));
  const hazards = snapshot.docs.map(mapHazardDocument);

  return sortHazardsByNewest(hazards);
};

export const getHazardsByClientReportId = async (clientReportId) => {
  if (!clientReportId) {
    return [];
  }

  const snapshot = await getDocs(
    query(hazardsCollection, where('clientReportId', '==', clientReportId))
  );
  const hazards = snapshot.docs.map(mapHazardDocument);

  return sortHazardsByNewest(hazards);
};

export const updateHazardStatus = async (hazardId, status) => {
  const hazardRef = doc(db, 'hazards', hazardId);
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const isResolvedStatus = ['resolved', 'closed', 'completed', 'done'].includes(normalizedStatus);
  const isClosedStatus = ['closed', 'completed', 'done'].includes(normalizedStatus);

  await updateDoc(hazardRef, {
    status,
    resolved: isResolvedStatus,
    isResolved: isResolvedStatus,
    closed: isClosedStatus,
    completed: normalizedStatus === 'completed' || normalizedStatus === 'done',
    updatedAt: serverTimestamp(),
  });

  return {
    id: hazardId,
    status,
  };
};

export const updateHazard = async (hazardId, updates) => {
  const hazardRef = doc(db, 'hazards', hazardId);

  await updateDoc(hazardRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  return {
    id: hazardId,
    ...updates,
  };
};

export const addAlert = (data) => addDoc(alertsCollection, data);

export const getAlertsByClientReportId = async (clientReportId) => {
  if (!clientReportId) {
    return [];
  }

  const snapshot = await getDocs(
    query(alertsCollection, where('clientReportId', '==', clientReportId))
  );

  return snapshot.docs.map((alertSnapshot) => ({
    id: alertSnapshot.id,
    ...alertSnapshot.data(),
  }));
};

export const addZone = (data) => addDoc(zonesCollection, data);
