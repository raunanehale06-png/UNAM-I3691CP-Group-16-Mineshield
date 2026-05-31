import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { sanitizeLocationLabel } from '../services/locationService';

const joinAddressParts = (parts) => parts.filter(Boolean).join(', ');

const createLocationStatus = (value, hint, extras = {}) => ({
  value,
  hint,
  label: extras.label || value,
  latitude: extras.latitude ?? null,
  longitude: extras.longitude ?? null,
});

const buildAddressLabel = (place) =>
  joinAddressParts([
    place?.name,
    place?.street,
    place?.district,
    place?.city,
    place?.region,
  ]);

export default function useLocation() {
  const [locationStatus, setLocationStatus] = useState(
    createLocationStatus('Starting...', 'GPS live')
  );
  const lookupIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let locationSubscription = null;

    const applyCoordinates = async ({ latitude, longitude }) => {
      const lookupId = lookupIdRef.current + 1;
      lookupIdRef.current = lookupId;

      let label = 'Current GPS location';

      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        label = sanitizeLocationLabel(buildAddressLabel(place), label);
      } catch (error) {
        console.log('Live GPS reverse geocoding failed:', error);
      }

      if (!isMounted || lookupId !== lookupIdRef.current) {
        return;
      }

      setLocationStatus(
        createLocationStatus(label, 'GPS live', {
          label,
          latitude,
          longitude,
        })
      );
    };

    const startTracking = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!isMounted) {
          return;
        }

        if (permission.status !== 'granted') {
          setLocationStatus(createLocationStatus('Denied', 'Allow GPS'));
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await applyCoordinates(currentPosition.coords);

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 5000,
            mayShowUserSettingsDialog: true,
          },
          (position) => {
            applyCoordinates(position.coords);
          }
        );
      } catch (error) {
        if (isMounted) {
          setLocationStatus(createLocationStatus('Unavailable', 'GPS error'));
        }
      }
    };

    startTracking();

    return () => {
      isMounted = false;
      locationSubscription?.remove?.();
    };
  }, []);

  return locationStatus;
}
