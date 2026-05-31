const EARTH_RADIUS_METERS = 6371000;

export const normalizeCoordinate = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const hasCoordinates = (value) =>
  typeof normalizeCoordinate(value?.latitude) === 'number' &&
  typeof normalizeCoordinate(value?.longitude) === 'number';

export const formatCoordinatePair = (latitude, longitude, precision = 5) => {
  const lat = normalizeCoordinate(latitude);
  const lng = normalizeCoordinate(longitude);

  if (lat === null || lng === null) {
    return '';
  }

  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

export const buildTrackingLabel = (item = {}) =>
  item.locationLabel ||
  item.label ||
  item.zone ||
  item.zoneId ||
  item.location?.label ||
  item.location?.area ||
  item.area ||
  item.place ||
  item.site ||
  'General Site';

export const calculateDistanceMeters = (from, to) => {
  if (!hasCoordinates(from) || !hasCoordinates(to)) {
    return null;
  }

  const fromLat = (normalizeCoordinate(from.latitude) * Math.PI) / 180;
  const fromLng = (normalizeCoordinate(from.longitude) * Math.PI) / 180;
  const toLat = (normalizeCoordinate(to.latitude) * Math.PI) / 180;
  const toLng = (normalizeCoordinate(to.longitude) * Math.PI) / 180;

  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

export default {
  buildTrackingLabel,
  calculateDistanceMeters,
  formatCoordinatePair,
  hasCoordinates,
  normalizeCoordinate,
};
