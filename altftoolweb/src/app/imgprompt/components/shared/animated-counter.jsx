"use client";

import * as React from "react";
import { useInView } from "framer-motion";
import { formatCompact } from "../../lib/utils";

export function AnimatedCounter({ value, duration = 1400, compact = false, suffix = "", prefix = "" }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const shown = compact ? formatCompact(Math.round(display)) : Math.round(display).toLocaleString();
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{shown}{suffix}
    </span>
  );
}
