"use client";

import { useEffect, useRef, useState } from "react";

function parseValue(raw) {
  const match = String(raw).match(/^(\d+)(.*)$/);
  if (!match) return { number: 0, suffix: String(raw) };
  return { number: parseInt(match[1], 10), suffix: match[2] };
}

/** Animates a stat like "129+" counting up from 0 on mount, eased out. */
export default function CountUp({ value, duration = 1200 }) {
  const { number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frame;
    startRef.current = null;
    const step = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * number));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [number, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}
