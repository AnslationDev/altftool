// src/app/tradeon/components/shared/LiveValue.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "../../lib/format";

/**
 * A price that flashes green/red for a beat whenever it moves — the signature
 * "live tape" feel. Uses tabular-nums so digits don't jitter.
 */
export default function LiveValue({ value, currency = "$", forceDecimals, className = "" }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (value == null) return;
    if (value > prev.current) setFlash("tdn-flash-up");
    else if (value < prev.current) setFlash("tdn-flash-down");
    prev.current = value;
    const t = setTimeout(() => setFlash(""), 700);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span className={`tdn-mono px-1 -mx-1 ${flash} ${className}`}>
      {formatPrice(value, { currency, forceDecimals })}
    </span>
  );
}
