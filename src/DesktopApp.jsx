import React, { useEffect } from "react";
import AppBase from "./AppBase";

export default function DesktopApp() {
  useEffect(() => {
    document.body.classList.remove("mode-mobile");
    document.body.classList.add("mode-desktop");
    return () => {
      document.body.classList.remove("mode-desktop");
    };
  }, []);

  return <AppBase />;
}
