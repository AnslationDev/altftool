"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function AnimatedStat({ value, label, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1300;
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(update);
    };
    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="border-t border-white/20 pt-5">
      <p className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}
