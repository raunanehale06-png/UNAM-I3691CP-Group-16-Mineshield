import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const createLocationStatus = (value, hint, extras = {}) => ({
  value,
  hint,
  label: extras.label || value,
  latitude: extras.latitude ?? null,
  longitude: extras.longitude ?? null,
});

const formatCoordinates = (latitude, longitude) =>
  `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

export default function useLocation() {
  const [locationStatus, setLocationStatus] = useState(
    createLocationStatus('Starting...', 'GPS live')
  );

  useEffect(() => {
    let isMounted = true;
    let locationSubscription = null;

    const applyCoordinates = ({ latitude, longitude }) => {
      if (!isMounted) {
        return;
      }

      const label = formatCoordinates(latitude, longitude);
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
        applyCoordinates(currentPosition.coords);

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
