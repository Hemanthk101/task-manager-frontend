import React, { useEffect, useState } from "react";
import "./App.css";
import myphoto from "./assets/1.jpg";

import DesktopApp from "./DesktopApp";
import MobileApp from "./MobileApp";

const MODE_KEY = "uiMode"; // "desktop" | "mobile"

function ModeGate({ onPick }) {
  const [remember, setRemember] = useState(true);

  const containerStyle = {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    position: "relative",
    backgroundColor: "#00093eff",
    backgroundImage: `url(${myphoto})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    width: "min(92vw, 520px)",
    borderRadius: 22,
    border: "1px solid rgba(0,255,255,0.25)",
    background: "rgba(0, 20, 50, 0.35)",
    boxShadow: "0 0 18px rgba(0, 191, 255, 0.22)",
    padding: 22,
    backdropFilter: "blur(6px)",
  };

  const titleStyle = {
    color: "#bffcff",
    fontSize: 22,
    fontWeight: 900,
    textAlign: "center",
    marginBottom: 12,
  };

  const subStyle = {
    color: "rgba(191,252,255,0.85)",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 1.4,
  };

  const btnRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 10,
  };

  const btnStyle = (activeGlow) => ({
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(0,255,255,0.28)",
    cursor: "pointer",
    background: activeGlow
      ? "linear-gradient(90deg, rgba(0,255,255,0.92), rgba(0,180,255,0.92))"
      : "rgba(0, 30, 60, 0.35)",
    color: activeGlow ? "#001327" : "#bffcff",
    boxShadow: activeGlow ? "0 0 18px rgba(0,255,255,0.55)" : "none",
    fontWeight: 900,
    letterSpacing: 0.3,
  });

  const footStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
    color: "#bffcff",
    fontSize: 12,
    opacity: 0.9,
  };

  const pick = (mode) => {
    if (remember) localStorage.setItem(MODE_KEY, mode);
    onPick(mode);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>Choose your mode</div>
        <div style={subStyle}>
          Desktop keeps your wide 2-card layout. Mobile stacks panels cleanly and adds scroll so it doesn’t look shabby.
        </div>

        <div style={btnRowStyle}>
          <button type="button" style={btnStyle(true)} onClick={() => pick("desktop")}>
            🖥️ Desktop Mode
          </button>
          <button type="button" style={btnStyle(true)} onClick={() => pick("mobile")}>
            📱 Mobile Mode
          </button>
        </div>

        <div style={footStyle}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember my choice
          </label>

          <span style={{ opacity: 0.8 }}>You can switch later</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || "");

  useEffect(() => {
    // If you want auto-pick based on width (ONLY when no saved mode), uncomment:
    // if (!mode) setMode(window.innerWidth < 768 ? "mobile" : "desktop");
  }, [mode]);

  if (!mode) return <ModeGate onPick={setMode} />;

  return (
    <div style={{ position: "relative" }}>
      {mode === "mobile" ? <MobileApp /> : <DesktopApp />}

      {/* Always-available Switch button */}
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem(MODE_KEY);
          setMode("");
        }}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 99999,
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(0,255,255,0.25)",
          background: "rgba(0, 20, 50, 0.55)",
          color: "#bffcff",
          cursor: "pointer",
          boxShadow: "0 0 14px rgba(0, 191, 255, 0.2)",
          backdropFilter: "blur(6px)",
          fontWeight: 800,
        }}
        title="Switch Desktop/Mobile"
      >
        Switch Mode
      </button>
    </div>
  );
}
