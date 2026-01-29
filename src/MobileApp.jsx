// MobileApp.jsx
import React, { useEffect, useLayoutEffect, useState } from "react";
import AppBase from "./AppBase.jsx";

/**
 * ✅ MOBILE LOOKS LIKE DESKTOP (BIGGER BOXES)
 * Fix: scale by WIDTH (not min(width,height))
 * - This makes the UI bigger like desktop
 * - If height doesn't fit, user can scroll vertically (normal mobile behavior)
 */

// Match your desktop design canvas
const DESKTOP_W = 1920;
const DESKTOP_H = 1080;

// Optional: a tiny boost so it feels “desktop big” (keep 1.0–1.12)
const SCALE_BOOST = 1.06;

export default function MobileApp() {
  const [view, setView] = useState({ scale: 1, tx: 0 });

  const calc = () => {
    const vw = window.visualViewport?.width ?? window.innerWidth;

    // ✅ Width-based scale (this makes boxes larger than your current approach)
    let scale = (vw / DESKTOP_W) * SCALE_BOOST;

    // Safety clamps (avoid extreme sizes)
    scale = Math.max(0.25, Math.min(scale, 1));

    const scaledW = DESKTOP_W * scale;

    // Center horizontally
    const tx = Math.max(0, (vw - scaledW) / 2);

    setView({ scale, tx });
  };

  useLayoutEffect(() => {
    calc();
    const t = setTimeout(calc, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onResize = () => calc();

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, []);

  return (
    <div className="mode-mobile-desktop">
      <div
        className="desktop-canvas-wrap"
        style={{
          width: DESKTOP_W,
          height: DESKTOP_H,
          transform: `translateX(${view.tx}px) scale(${view.scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="appbase-shell">
          <AppBase />
        </div>
      </div>
    </div>
  );
}
