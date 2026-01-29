// MobileApp.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppBase from "./AppBase.jsx";

const DESKTOP_W = 1920;
const DESKTOP_H = 1080;
const SCALE_BOOST = 1.08;

export default function MobileApp() {
  const shellRef = useRef(null);
  const [scale, setScale] = useState(1);

  const applyDesktopSizeToAppBase = () => {
    // AppBase root <div> is the first child inside shellRef
    const root = shellRef.current?.firstElementChild;
    if (!root) return;

    root.style.width = `${DESKTOP_W}px`;
    root.style.height = `${DESKTOP_H}px`;
    root.style.margin = "0";
  };

  const calcScale = () => {
    const vw = window.visualViewport?.width ?? window.innerWidth;

    // ✅ scale by width => bigger “desktop-like” boxes
    let s = (vw / DESKTOP_W) * SCALE_BOOST;
    s = Math.max(0.25, Math.min(s, 1));
    setScale(s);
  };

  useLayoutEffect(() => {
    applyDesktopSizeToAppBase();
    calcScale();
    const t = setTimeout(() => {
      applyDesktopSizeToAppBase();
      calcScale();
    }, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onResize = () => {
      applyDesktopSizeToAppBase();
      calcScale();
    };

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
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div ref={shellRef}>
          <AppBase />
        </div>
      </div>
    </div>
  );
}
