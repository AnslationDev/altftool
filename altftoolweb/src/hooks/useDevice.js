"use client";

import { useEffect, useState } from "react";

export default function useDevice() {
  const [device, setDevice] = useState("desktop");

  useEffect(() => {
    const detect = () => {
      const isMobile = window.innerWidth < 1024;
      setDevice(isMobile ? "mobile" : "desktop");
    };

    detect(); // initial run
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  return device;
}
