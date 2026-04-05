import {
  loadNotifications,
  saveNotifications,
  loadNotificationPrefs,
} from "./notificationStorage";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export function addNotification(notification) {
  const items = loadNotifications();
  const newItem = {
    id: notification.id || generateId(),
    type: notification.type || "system",
    title: notification.title || "Reminder",
    message: notification.message || "",
    createdAt: new Date().toISOString(),
    read: false,
    dismissedAt: null,
    completedAt: null,
    ...notification,
  };
  const next = [newItem, ...items];
  saveNotifications(next);
  return newItem;
}

export function markNotificationRead(id) {
  const items = loadNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(items);
}

export function dismissNotification(id) {
  const items = loadNotifications().map((n) =>
    n.id === id ? { ...n, dismissedAt: new Date().toISOString(), read: true } : n
  );
  saveNotifications(items);
}

export function completeNotification(id) {
  const items = loadNotifications().map((n) =>
    n.id === id ? { ...n, completedAt: new Date().toISOString(), read: true } : n
  );
  saveNotifications(items);
}

export function snoozeNotification(id, minutes = 10) {
  const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  const items = loadNotifications().map((n) =>
    n.id === id ? { ...n, snoozedUntil: until, read: true } : n
  );
  saveNotifications(items);
}

export function getNotifications() {
  return loadNotifications();
}

export function getUnreadCount() {
  return loadNotifications().filter(
    (n) => !n.read && !n.dismissedAt && !n.completedAt
  ).length;
}

export function playNotificationSound() {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {}
}

export function vibrateDevice() {
  if ("vibrate" in navigator) {
    navigator.vibrate([150, 80, 150]);
  }
}

export function showBrowserNotification(title, body) {
  const prefs = loadNotificationPrefs();
  if (!prefs.browserNotifications) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `${title}-${body}`,
    renotify: false,
  });
}

export function triggerNotification(payload) {
  const prefs = loadNotificationPrefs();
  const newItem = addNotification(payload);

  if (prefs.browserNotifications) {
    showBrowserNotification(newItem.title, newItem.message);
  }

  if (prefs.sound) {
    playNotificationSound();
  }

  if (prefs.vibration) {
    vibrateDevice();
  }

  window.dispatchEvent(new CustomEvent("app:notification-added", { detail: newItem }));
  return newItem;
}
