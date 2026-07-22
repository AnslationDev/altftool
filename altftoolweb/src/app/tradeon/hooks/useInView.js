// src/app/tradeon/hooks/useInView.js
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, inView] — inView flips true once the element scrolls near the
 * viewport, and stays true (once=true). Used to lazily mount heavy chart panels
 * on the landing page so they don't all spin up on first paint.
 */
export function useInView({ rootMargin = "300px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once, inView]);
  return [ref, inView];
}
