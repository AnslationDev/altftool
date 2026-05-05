"use client";

import { useEffect, useState } from "react";

export default function useDevice() {
  const [device, setDevice] = useState("desktop"); // ⬅️ default

  useEffect(() => {
    const update = () => {
      setDevice(window.innerWidth < 1024 ? "mobile" : "desktop");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return device;
}
