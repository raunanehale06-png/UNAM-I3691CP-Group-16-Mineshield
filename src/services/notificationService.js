import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import { filterAlertsForUser, mapAlertSnapshot } from './alertService';

const notificationsCollection = collection(db, 'alerts');

const normalizeAudienceRoles = (value) => {
  if (!value) {
    return [];
  }

  const entries = Array.isArray(value) ? value : [value];

  return entries
    .map((entry) => String(entry || '').trim().toLowerCase())
    .filter(Boolean);
};

const normalizeNotificationPayload = (data = {}) => {
  const audienceRoles = normalizeAudienceRoles(
    data.audienceRoles ?? data.audience ?? data.targetAudience ?? data.targetRole
  );
  const timestamp = data.timestamp ?? data.createdAt ?? serverTimestamp();

  return {
    ...data,
    audienceRoles,
    createdAt: data.createdAt ?? timestamp,
    read: Boolean(data.read),
    acknowledged: Boolean(data.acknowledged),
    timestamp,
    updatedAt: serverTimestamp(),
  };
};

const sortNotificationsByNewest = (notifications) =>
  [...notifications].sort((leftNotification, rightNotification) => {
    return (rightNotification.sortTime || 0) - (leftNotification.sortTime || 0);
  });

export const getNotifications = async (options = {}) => {
  const snapshot = await getDocs(notificationsCollection);
  const mappedNotifications = sortNotificationsByNewest(
    snapshot.docs.map((notificationSnapshot) => mapAlertSnapshot(notificationSnapshot))
  );

  if (options.visibleOnly) {
    return filterAlertsForUser(
      mappedNotifications,
      options.currentUserId ?? auth.currentUser?.uid ?? null,
      options.currentUserRoleKey ?? ''
    );
  }

  return typeof options.limit === 'number'
    ? mappedNotifications.slice(0, options.limit)
    : mappedNotifications;
};

export const subscribeNotifications = (onNotifications, onError, options = {}) => {
  if (typeof onNotifications !== 'function') {
    return () => {};
  }

  return onSnapshot(
    notificationsCollection,
    (snapshot) => {
      const mappedNotifications = sortNotificationsByNewest(
        snapshot.docs.map((notificationSnapshot) => mapAlertSnapshot(notificationSnapshot))
      );
      const visibleNotifications = options.visibleOnly
        ? filterAlertsForUser(
            mappedNotifications,
            options.currentUserId ?? auth.currentUser?.uid ?? null,
            options.currentUserRoleKey ?? ''
          )
        : mappedNotifications;

      onNotifications(
        typeof options.limit === 'number'
          ? visibleNotifications.slice(0, options.limit)
          : visibleNotifications
      );
    },
    onError
  );
};

export const createNotification = async (notification = {}) => {
  const payload = normalizeNotificationPayload(notification);
  const docRef = await addDoc(notificationsCollection, payload);

  return {
    id: docRef.id,
    ...payload,
  };
};

export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) {
    return null;
  }

  await updateDoc(doc(db, 'alerts', notificationId), {
    acknowledged: true,
    read: true,
    readAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: notificationId,
    acknowledged: true,
    read: true,
  };
};

export const markNotificationsAsRead = async (notificationIds = []) =>
  Promise.all(notificationIds.filter(Boolean).map((notificationId) => markNotificationAsRead(notificationId)));

export const sendNotification = createNotification;
