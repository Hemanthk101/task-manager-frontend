import React, { useEffect, useState } from "react";
import {
  getNotifications,
  dismissNotification,
  completeNotification,
  snoozeNotification,
  markNotificationRead,
} from "../services/notificationService";

export default function NotificationCenter({ open, onClose }) {
  const [items, setItems] = useState([]);

  const refresh = () => setItems(getNotifications());

  useEffect(() => {
    refresh();
    window.addEventListener("app:notification-added", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("app:notification-added", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-center-header">
          <h3>Notifications</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="notification-center-list">
          {items.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${item.read ? "read" : "unread"}`}
                onClick={() => {
                  if (!item.read) {
                    markNotificationRead(item.id);
                    refresh();
                  }
                }}
              >
                <div className="notification-item-title">{item.title}</div>
                <div className="notification-item-message">{item.message}</div>

                <div className="notification-item-actions">
                  <button
                    onClick={() => {
                      snoozeNotification(item.id, 10);
                      refresh();
                    }}
                  >
                    Snooze 10m
                  </button>
                  <button
                    onClick={() => {
                      completeNotification(item.id);
                      refresh();
                    }}
                  >
                    Done
                  </button>
                  <button
                    onClick={() => {
                      dismissNotification(item.id);
                      refresh();
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
