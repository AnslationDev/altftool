// src/app/tradeon/components/shared/MarketStatusBadge.jsx
"use client";

const MAP = {
  connecting: { label: "Connecting", color: "var(--tdn-amber)" },
  live: { label: "Live", color: "var(--tdn-up)" },
  reconnecting: { label: "Reconnecting", color: "var(--tdn-amber)" },
  offline: { label: "Simulated", color: "var(--tdn-muted)" },
};

export default function MarketStatusBadge({ status = "connecting", className = "" }) {
  const s = MAP[status] || MAP.connecting;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        color: s.color,
        background: "color-mix(in srgb, currentColor 12%, transparent)",
        border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
      }}
    >
      <span className="tdn-dot" style={{ color: s.color }} />
      {s.label}
    </span>
  );
}
