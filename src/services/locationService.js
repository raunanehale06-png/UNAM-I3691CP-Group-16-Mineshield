import * as Location from 'expo-location';

const joinAddressParts = (parts) => parts.filter(Boolean).join(', ');

const COORDINATE_LABEL_PATTERN = /^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/;

export const sanitizeLocationLabel = (value, fallback = 'GPS location') => {
  const label = String(value || '').trim();

  if (!label || COORDINATE_LABEL_PATTERN.test(label)) {
    return fallback;
  }

  return label;
};

const buildAddressLabel = (place) =>
  joinAddressParts([
    place?.name,
    place?.street,
    place?.district,
    place?.city,
    place?.region,
  ]);

export const getCurrentGpsLocation = async () => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error('Location permission was denied.');
  }

  const currentPosition = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = currentPosition.coords;
  let addressLabel = '';

  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    addressLabel = buildAddressLabel(place);
  } catch (error) {
    console.log('Reverse geocoding failed:', error);
  }

  const resolvedLabel = sanitizeLocationLabel(addressLabel, 'Current GPS location');

  return {
    source: 'gps',
    latitude,
    longitude,
    area: resolvedLabel,
    label: resolvedLabel,
  };
};

export const geocodeLocationLabel = async (label) => {
  const normalizedLabel = String(label || '').trim();

  if (!normalizedLabel) {
    return null;
  }

  try {
    const results = await Location.geocodeAsync(normalizedLabel);
    const firstResult = results?.[0];

    if (
      typeof firstResult?.latitude !== 'number' ||
      typeof firstResult?.longitude !== 'number'
    ) {
      return null;
    }

    return {
      latitude: firstResult.latitude,
      longitude: firstResult.longitude,
    };
  } catch (error) {
    console.log('Geocoding failed:', error);
    return null;
  }
};

export const buildManualLocation = ({ area, landmark }) => {
  const normalizedArea = area.trim();
  const normalizedLandmark = landmark.trim();

  if (!normalizedArea && !normalizedLandmark) {
    return null;
  }

  return {
    source: 'manual',
    area: normalizedArea || 'Manual location',
    landmark: normalizedLandmark || null,
    label: joinAddressParts([normalizedArea || 'Manual location', normalizedLandmark]),
  };
};

export const formatSelectedLocation = (location) => {
  if (!location) {
    return 'No location selected yet.';
  }

  return sanitizeLocationLabel(location.label || location.area, 'Current GPS location');
};
