import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../services/firebase';
import {
  isSessionRouteHydrated,
  getSessionRouteSnapshot,
  subscribeSessionRoute,
} from '../services/sessionRouteService';

const normalizeRole = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeAppRoute = (value) => {
  switch (normalizeRole(value)) {
    case 'workerapp':
      return 'WorkerApp';
    case 'supervisorapp':
      return 'SupervisorApp';
    case 'visitorapp':
      return 'VisitorApp';
    case 'officeapp':
      return 'OfficeApp';
    default:
      return '';
  }
};

const getAppRouteForRoleHint = (roleHint) => {
  switch (normalizeRole(roleHint)) {
    case 'supervisor':
      return 'SupervisorApp';
    case 'visitor':
      return 'VisitorApp';
    case 'office':
    case 'officer':
    case 'safety officer':
    case 'safety_officer':
      return 'OfficeApp';
    case 'worker':
      return 'WorkerApp';
    default:
      return '';
  }
};

const getNavigatorComponent = (route) => {
  switch (route) {
    case 'WorkerApp':
      return require('./WorkerNavigator').default;
    case 'SupervisorApp':
      return require('./SupervisorNavigator').default;
    case 'VisitorApp':
      return require('./VisitorNavigator').default;
    case 'OfficeApp':
      return require('./OfficeNavigator').default;
    case 'Auth':
    default:
      return require('./AuthNavigator').default;
  }
};

const resolveAppRoute = ({
  user,
  userData,
  guestAccessRequested,
  preferredAppRoute,
  roleRouteHint,
}) => {
  const hintedRoute = normalizeAppRoute(preferredAppRoute) || getAppRouteForRoleHint(roleRouteHint);

  if (!user) {
    return guestAccessRequested ? 'VisitorApp' : 'Auth';
  }

  if (user.isAnonymous) {
    return 'VisitorApp';
  }

  if (hintedRoute) {
    return hintedRoute;
  }

  const normalizedUserRole =
    normalizeRole(userData?.roleKey) || normalizeRole(userData?.role);

  if (normalizedUserRole === 'supervisor') {
    return 'SupervisorApp';
  }

  if (normalizedUserRole === 'visitor') {
    return 'VisitorApp';
  }

  if (['office', 'officer', 'safety officer', 'safety_officer'].includes(normalizedUserRole)) {
    return 'OfficeApp';
  }

  if (normalizedUserRole === 'worker') {
    return 'WorkerApp';
  }

  return 'WorkerApp';
};

export default function RootNavigator() {
  const theme = useTheme();
  const [sessionRoute, setSessionRoute] = useState(getSessionRouteSnapshot);
  const [sessionRouteReady, setSessionRouteReady] = useState(isSessionRouteHydrated());
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    userData: null,
  });

  useEffect(() => {
    const syncSessionRoute = () => {
      setSessionRoute(getSessionRouteSnapshot());
      setSessionRouteReady(isSessionRouteHydrated());
    };

    syncSessionRoute();

    return subscribeSessionRoute(syncSessionRoute);
  }, []);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile();

      if (!user) {
        setAuthState({
          loading: false,
          user: null,
          userData: null,
        });
        return;
      }

      if (user.isAnonymous) {
        setAuthState({
          loading: false,
          user,
          userData: null,
        });
        return;
      }

      setAuthState({
        loading: true,
        user,
        userData: null,
      });

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            console.warn(
              'Signed-in user profile is missing. Continuing with the stored session route.'
            );
            setAuthState({
              loading: false,
              user,
              userData: null,
            });
            return;
          }

          setAuthState({
            loading: false,
            user,
            userData: snapshot.data() ?? null,
          });
        },
        (error) => {
          console.error('Unable to resolve signed-in user role from Firestore:', error);
          setAuthState({
            loading: false,
            user,
            userData: null,
          });
        }
      );
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  if (authState.loading || !sessionRouteReady) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const activeRoute = resolveAppRoute({
    ...authState,
    ...sessionRoute,
  });

  const ActiveNavigator = getNavigatorComponent(activeRoute);

  return <ActiveNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
