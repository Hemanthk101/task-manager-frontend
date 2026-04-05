const STORAGE_KEYS = {
  notifications: "appNotifications",
  firedLog: "appNotificationFiredLog",
  prefs: "appNotificationPrefs",
};

export function loadNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || "[]");
  } catch {
    return [];
  }
}

export function saveNotifications(items) {
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(items));
}

export function loadFiredLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.firedLog) || "{}");
  } catch {
    return {};
  }
}

export function saveFiredLog(log) {
  localStorage.setItem(STORAGE_KEYS.firedLog, JSON.stringify(log));
}

export function loadNotificationPrefs() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.prefs) ||
        JSON.stringify({
          sound: true,
          vibration: true,
          browserNotifications: true,
          inAppToasts: true,
        })
    );
  } catch {
    return {
      sound: true,
      vibration: true,
      browserNotifications: true,
      inAppToasts: true,
    };
  }
}

export function saveNotificationPrefs(prefs) {
  localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
}
