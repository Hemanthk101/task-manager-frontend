import { triggerNotification } from "./notificationService";
import { loadFiredLog, saveFiredLog } from "./notificationStorage";

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function getCurrentTimeHM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function buildFireKey(reminderId, dateKey) {
  return `${reminderId}__${dateKey}`;
}

export function shouldFireReminder(reminder) {
  if (!reminder?.enabled) return false;

  const nowHM = getCurrentTimeHM();
  const todayKey = getTodayKey();
  const firedLog = loadFiredLog();
  const fireKey = buildFireKey(reminder.id, todayKey);

  if (firedLog[fireKey]) return false;

  if (reminder.snoozedUntil) {
    const snoozeTime = new Date(reminder.snoozedUntil).getTime();
    if (Date.now() < snoozeTime) return false;
  }

  return reminder.time === nowHM;
}

export function markReminderFired(reminderId) {
  const todayKey = getTodayKey();
  const firedLog = loadFiredLog();
  firedLog[buildFireKey(reminderId, todayKey)] = new Date().toISOString();
  saveFiredLog(firedLog);
}

export function runReminderChecks(reminders = []) {
  reminders.forEach((reminder) => {
    if (shouldFireReminder(reminder)) {
      triggerNotification({
        id: `${reminder.id}-${Date.now()}`,
        type: reminder.type,
        title: reminder.title,
        message: reminder.message,
        sourceReminderId: reminder.id,
        time: reminder.time,
        meta: reminder.meta || {},
      });

      markReminderFired(reminder.id);
    }
  });
}
