// MobileApp.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppBase from "./AppBase.jsx";

/**
 * MOBILE SHOULD LOOK EXACTLY LIKE DESKTOP (scaled to fit)
 * - Force AppBase root to a fixed desktop canvas size
 * - Scale the entire canvas down to fit phone viewport
 * - Center it so left/right cards both show
 */

// ✅ Set this to match your DESKTOP design canvas
// Use the size where your UI looks perfect on desktop.
// Common good options: 1920x1080, 1600x900, 1440x900
const DESKTOP_W = 1920;
const DESKTOP_H = 1080;

export default function MobileApp() {
  const wrapRef = useRef(null);
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });

  const calc = () => {
    // visualViewport is best on mobile (accounts for browser UI)
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    // Fit desktop canvas fully inside the phone viewport
    const scale = Math.min(vw / DESKTOP_W, vh / DESKTOP_H);

    // Center the scaled canvas
    const scaledW = DESKTOP_W * scale;
    const scaledH = DESKTOP_H * scale;

    const tx = Math.max(0, (vw - scaledW) / 2);
    const ty = Math.max(0, (vh - scaledH) / 2);

    setView({ scale, tx, ty });
  };

  useLayoutEffect(() => {
    calc();
    // run again after first paint (fonts/images)
    const t = setTimeout(calc, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    calc();

    const onResize = () => calc();
    window.addEventListener("resize", onResize);

    // visualViewport fires when address bar shows/hides
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, []);

  return (
    <div className="mode-mobile-desktop" ref={wrapRef}>
      <div
        className="desktop-canvas-wrap"
        style={{
          width: DESKTOP_W,
          height: DESKTOP_H,
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* shell lets CSS override AppBase root size WITHOUT editing base */}
        <div className="appbase-shell">
          <AppBase />
        </div>
      </div>
    </div>
  );
}
