"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/**
 * Counts from 0 up to `value` the first time it scrolls into view.
 *
 * The rendered text starts at the final value rather than at 0, so the number
 * is correct in the server HTML, correct with JS disabled, and correct if the
 * animation never runs — the count-up is decoration layered on top of a
 * already-right value, not the thing that produces it.
 */
export default function CountUp({ value, suffix = "", duration = 1.2, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
