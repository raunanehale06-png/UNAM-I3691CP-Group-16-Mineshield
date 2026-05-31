import { isPermissionGranted, normalizePermissionStatus } from './permissions';

export const canAskAgain = (permission) => permission?.canAskAgain !== false;

export const isPermissionBlocked = (permission) =>
  normalizePermissionStatus(permission) === 'blocked' || canAskAgain(permission) === false;

export const requiresPermissionRationale = (permission) =>
  !isPermissionGranted(permission) && canAskAgain(permission);

export const resolvePermissionLabel = (permission, fallback = 'Permission unavailable') => {
  const status = normalizePermissionStatus(permission);

  if (status === 'granted') {
    return 'Granted';
  }

  if (status === 'blocked') {
    return 'Blocked';
  }

  if (status === 'denied') {
    return 'Denied';
  }

  return fallback;
};

export default {
  canAskAgain,
  isPermissionBlocked,
  requiresPermissionRationale,
  resolvePermissionLabel,
};
