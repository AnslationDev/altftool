// src/app/tradeon/hooks/useClickOutside.js
"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `handler` when a pointer/touch/Escape event occurs outside `ref`.
 * The handler is kept in a ref so the document listeners are attached ONCE per
 * open state (deps = [active]) instead of being torn down and re-added on every
 * render — important on charts that re-render ~twice a second (live price/clock),
 * where listener churn was making dropdown clicks unreliable.
 */
export function useClickOutside(handler, active = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    if (!active) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handlerRef.current(e);
    };
    const onKey = (e) => {
      if (e.key === "Escape") handlerRef.current(e);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);
  return ref;
}
