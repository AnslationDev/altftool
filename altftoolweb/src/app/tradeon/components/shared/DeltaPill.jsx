// src/app/tradeon/components/shared/DeltaPill.jsx
"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPct } from "../../lib/format";

export default function DeltaPill({ value, size = 13, showIcon = true, className = "" }) {
  const up = value >= 0;
  return (
    <span className={`tdn-pill-delta ${up ? "tdn-up-bg" : "tdn-down-bg"} ${className}`}>
      {showIcon && (up ? <ArrowUpRight size={size} /> : <ArrowDownRight size={size} />)}
      {formatPct(value)}
    </span>
  );
}
