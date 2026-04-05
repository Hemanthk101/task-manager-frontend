import React, { useEffect, useState } from "react";

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const toast = e.detail;
      setToasts((prev) => [toast, ...prev].slice(0, 4));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
    };

    window.addEventListener("app:notification-added", handler);
    return () => window.removeEventListener("app:notification-added", handler);
  }, []);

  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-card">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
