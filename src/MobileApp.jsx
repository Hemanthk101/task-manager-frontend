import React, { useEffect } from "react";
import AppBase from "./AppBase";

export default function MobileApp() {
  useEffect(() => {
    document.body.classList.remove("mode-desktop");
    document.body.classList.add("mode-mobile");
    return () => {
      document.body.classList.remove("mode-mobile");
    };
  }, []);

  return <AppBase />;
}
