import { alertsList } from '@/data/alerts';
import { Alert } from '@/types/alert';

export async function getAlerts(): Promise<Alert[]> {
  return Promise.resolve([...alertsList]);
}

export async function markAlertAsRead(id: string): Promise<Alert | undefined> {
  const alert = alertsList.find((a) => a.id === id);
  if (alert) {
    alert.read = true;
    return Promise.resolve({ ...alert });
  }
  return Promise.resolve(undefined);
}

export async function markAllAlertsAsRead(): Promise<boolean> {
  alertsList.forEach((a) => {
    a.read = true;
  });
  return Promise.resolve(true);
}
