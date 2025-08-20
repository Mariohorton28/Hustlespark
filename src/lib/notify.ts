import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ReminderPreset = 'off' | 'morning' | 'noon' | 'evening';

export async function ensureNotifPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export function getPresetTime(preset: ReminderPreset): { hour: number; minute: number } | null {
  switch (preset) {
    case 'morning': return { hour: 8, minute: 0 };
    case 'noon': return { hour: 12, minute: 0 };
    case 'evening': return { hour: 18, minute: 0 };
    default: return null;
  }
}

export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function scheduleDailyReminder(preset: ReminderPreset) {
  if (preset === 'off') {
    await cancelAllReminders();
    return;
  }
  const granted = await ensureNotifPermissions();
  if (!granted) return;

  const t = getPresetTime(preset);
  if (!t) return;

  await cancelAllReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'HustleSpark reminder',
      body: 'Plan or post something today. Keep the momentum going! 💪',
      sound: Platform.OS === 'ios' ? 'default' : undefined,
    },
    trigger: {
      hour: t.hour,
      minute: t.minute,
      repeats: true,
    },
  });
}

/** Fire a notification now (for testing) */
export async function sendTestNotification() {
  const granted = await ensureNotifPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'HustleSpark test',
      body: 'This is a test notification — looking good! ✨',
      sound: Platform.OS === 'ios' ? 'default' : undefined,
    },
    trigger: { seconds: 1 },
  });
}

/** One-time success ping for important actions */
export async function sendSuccessNotification(message: string) {
  const granted = await ensureNotifPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Success',
      body: message,
      sound: Platform.OS === 'ios' ? 'default' : undefined,
    },
    trigger: { seconds: 1 },
  });
}