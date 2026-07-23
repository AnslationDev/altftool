"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-edge tracking for a horizontally-scrolling row, shared by the combo
 * pack chooser and the workflow step strip. Exposes `recompute` so callers
 * can re-check edges after their own content changes (new items, a step
 * revealing, etc.) instead of this hook guessing at their dependencies.
 */
export default function useHorizontalScroll() {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const recompute = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    recompute();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      el.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  const scrollByAmount = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return { trackRef, atStart, atEnd, scrollByAmount, recompute };
}
