import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

import ReactNativePersistenceStorage from './reactNativePersistenceStorage';

const firebaseConfig = {
  apiKey: 'AIzaSyC2Ul5E41gLy3-VKOzUJh8aQnxPhsvbmgo',
  authDomain: 'mineshield-967fc.firebaseapp.com',
  projectId: 'mineshield-967fc',
  storageBucket: 'mineshield-967fc.firebasestorage.app',
  messagingSenderId: '336606336690',
  appId: '1:336606336690:android:d0ab9044101a87918adbab',
};

export const FIREBASE_STORAGE_BUCKET = firebaseConfig.storageBucket;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const initializeFirebaseAuth = () => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativePersistenceStorage),
    });
  } catch (error) {
    return getAuth(app);
  }
};

const initializeFirebaseFirestore = () => {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }

  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch (error) {
    return getFirestore(app);
  }
};

export const auth = initializeFirebaseAuth();
export const db = initializeFirebaseFirestore();
export const storage = getStorage(app, `gs://${FIREBASE_STORAGE_BUCKET}`);

export default app;
