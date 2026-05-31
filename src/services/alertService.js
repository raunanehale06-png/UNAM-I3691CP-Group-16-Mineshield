import { sanitizeLocationLabel } from './locationService';

const normalizeAlertDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatAlertTimestamp = (value) => {
  const date = normalizeAlertDate(value);

  if (!date) {
    return 'Just now';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getAlertSortTime = (value) => {
  const date = normalizeAlertDate(value);
  return date ? date.getTime() : 0;
};

const getAlertTimestampSource = (data) =>
  data.timestamp ?? data.createdAt ?? data.updatedAt ?? data.acknowledgedAt ?? null;

const normalizeAudienceRoles = (value) => {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .map((entry) => String(entry || '').trim().toLowerCase())
    .filter(Boolean);
};

const getAlertAudienceRoles = (alert) =>
  normalizeAudienceRoles(
    alert?.audienceRoles ??
      alert?.raw?.audienceRoles ??
      alert?.raw?.audience ??
      alert?.raw?.targetAudience ??
      alert?.raw?.targetRole
  );

const resolveAlertSeverity = (data) => {
  if (typeof data.severity === 'string' && data.severity.trim()) {
    return data.severity.toUpperCase();
  }

  const normalizedType = String(data.type || '').toLowerCase();

  if (normalizedType.includes('sos') || normalizedType.includes('broadcast')) {
    return 'HIGH';
  }

  return 'LOW';
};

const resolveAlertLocation = (data) => {
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

export const mapAlertSnapshot = (snapshot) => {
  const data = typeof snapshot?.data === 'function' ? snapshot.data() ?? {} : snapshot ?? {};
  const rawTimestamp = getAlertTimestampSource(data);

  return {
    id: snapshot?.id ?? data.id ?? '',
    raw: data,
    title: data.title ?? 'Safety update',
    body: data.body ?? data.message ?? 'A new site alert has been posted.',
    type: data.type ?? 'SYSTEM_ALERT',
    severity: resolveAlertSeverity(data),
    zone: data.zone ?? data.zoneId ?? 'General Site',
    location: resolveAlertLocation(data),
    read: Boolean(data.read),
    acknowledged: Boolean(data.acknowledged || data.read),
    hazardId: data.hazardId ?? null,
    recipientUserId: data.recipientUserId ?? null,
    audienceRoles: normalizeAudienceRoles(
      data.audienceRoles ?? data.audience ?? data.targetAudience ?? data.targetRole
    ),
    userId: data.userId ?? null,
    sortTime: getAlertSortTime(rawTimestamp),
    timestamp: formatAlertTimestamp(rawTimestamp),
    timestampDate: normalizeAlertDate(rawTimestamp),
  };
};

export const isAlertVisibleToUser = (alert, currentUserId = null, currentUserRoleKey = '') => {
  const recipientUserId = alert?.recipientUserId ?? alert?.raw?.recipientUserId ?? null;

  if (!recipientUserId) {
    const audienceRoles = getAlertAudienceRoles(alert);

    if (audienceRoles.length === 0) {
      return true;
    }

    const normalizedRoleKey = String(currentUserRoleKey || '').trim().toLowerCase();

    if (!normalizedRoleKey) {
      return false;
    }

    if (audienceRoles.includes(normalizedRoleKey)) {
      return true;
    }

    if (audienceRoles.includes('staff') && ['worker', 'supervisor'].includes(normalizedRoleKey)) {
      return true;
    }

    if (audienceRoles.includes('all')) {
      return true;
    }

    return false;
  }

  return recipientUserId === currentUserId;
};

export const filterAlertsForUser = (alerts, currentUserId = null, currentUserRoleKey = '') =>
  alerts.filter((alert) => isAlertVisibleToUser(alert, currentUserId, currentUserRoleKey));

export const filterPublicAlerts = (alerts) =>
  alerts.filter(
    (alert) =>
      !alert?.recipientUserId &&
      !alert?.raw?.recipientUserId &&
      getAlertAudienceRoles(alert).length === 0
  );

export const isSosAlert = (alert) => {
  const normalizedType = String(alert?.type || alert?.raw?.type || '').toLowerCase();
  const normalizedTitle = String(alert?.title || alert?.raw?.title || '').toLowerCase();
  const normalizedBody = String(alert?.body || alert?.raw?.body || '').toLowerCase();

  return (
    normalizedType.includes('sos') ||
    normalizedType.includes('broadcast') ||
    normalizedType.includes('evacuation') ||
    normalizedTitle.includes('sos') ||
    normalizedTitle.includes('broadcast') ||
    normalizedTitle.includes('evacuation') ||
    normalizedBody.includes('distress') ||
    normalizedBody.includes('evacuation')
  );
};
