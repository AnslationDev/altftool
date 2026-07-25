"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated count-up for hero stats. Counts from 0 to `value` over ~900ms
 * (ease-out) the first time it scrolls into view. Reduced-motion users and
 * pre-hydration render see the final value immediately — no CLS, no jitter.
 */
export default function CountUpNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      return undefined;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) frame = window.requestAnimationFrame(tick);
        };
        setDisplay(0);
        frame = window.requestAnimationFrame(tick);
        // rAF pauses in hidden tabs — guarantee the final value regardless.
        window.setTimeout(() => setDisplay(value), duration + 300);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
