import React, { useEffect, useState } from "react";
import { getUnreadCount } from "../services/notificationService";

export default function NotificationBell({ onClick }) {
  const [count, setCount] = useState(getUnreadCount());

  useEffect(() => {
    const refresh = () => setCount(getUnreadCount());

    refresh();
    window.addEventListener("app:notification-added", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("app:notification-added", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <button className="notification-bell" onClick={onClick} type="button">
      🔔
      {count > 0 && <span className="notification-badge">{count}</span>}
    </button>
  );
}
