import React, { useEffect } from "react";
import AppBase from "./AppBase";
import LightRays from "./components/LightRays/LightRays";
import myphoto from "./assets/1.jpg";

export default function DesktopApp() {
  useEffect(() => {
    document.body.classList.remove("mode-mobile");
    document.body.classList.add("mode-desktop");
    return () => {
      document.body.classList.remove("mode-desktop");
    };
  }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      backgroundColor: "#00093eff",
      backgroundImage: `url(${myphoto})`,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={2.1}
          lightSpread={1.3}
          rayLength={3}
          pulsating={false}
          fadeDistance={3}
          saturation={1.2}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0}
          distortion={0}
        />
      </div>
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
        <AppBase />
      </div>
    </div>
  );
}
