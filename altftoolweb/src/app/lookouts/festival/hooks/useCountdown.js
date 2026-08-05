"use client";

import { useEffect, useState } from "react";
import { getCountdownParts } from "../lib/dateMath";

/** Ticks a countdown to `targetIso` (an ISO date string) once per second. */
export default function useCountdown(targetIso) {
  const [parts, setParts] = useState(() => getCountdownParts(targetIso));

  useEffect(() => {
    setParts(getCountdownParts(targetIso));
    const interval = setInterval(() => {
      setParts(getCountdownParts(targetIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return parts;
}
