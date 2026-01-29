// MobileApp.jsx
import React, { useEffect, useState } from "react";
import AppBase from "./AppBase.jsx";

/**
 * ✅ Mobile should look EXACTLY like desktop
 * Strategy:
 * - Force AppBase root container to a fixed "desktop canvas" size
 * - Scale the entire canvas down to fit the phone viewport
 * - Keep all absolute positioning identical
 */

const DESKTOP_W = 1440; // change if your desktop design is based on another size
const DESKTOP_H = 900;  // change if your desktop design is based on another size

export default function MobileApp() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // fit whole desktop canvas inside mobile viewport
      const nextScale = Math.min(vw / DESKTOP_W, vh / DESKTOP_H);

      // optional: avoid too tiny scaling
      setScale(nextScale);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="mode-mobile-desktop">
      <div
        className="desktop-canvas-wrap"
        style={{
          width: DESKTOP_W,
          height: DESKTOP_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <AppBase />
      </div>
    </div>
  );
}
