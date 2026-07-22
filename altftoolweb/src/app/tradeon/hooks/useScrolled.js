// src/app/tradeon/hooks/useScrolled.js
"use client";

import { useEffect, useState } from "react";

/** True once the window has scrolled past `threshold` px — used to shrink the nav. */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
