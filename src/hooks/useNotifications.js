import useAlerts from './useAlerts';

export default function useNotifications(options = {}) {
  const alertsState = useAlerts(options);

  return {
    ...alertsState,
    alerts: alertsState.alerts,
    clearAllNotifications: alertsState.clearAllAlerts,
    markNotificationAsRead: alertsState.markAsRead,
    notifications: alertsState.alerts,
  };
}
