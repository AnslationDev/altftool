"use client";

import { useEffect, useState } from "react";

// Featured shelves rotate weekly — count down to the next Sunday midnight
// (local time). Computed only after mount so SSR/ISR HTML never carries a
// stale clock (same reason the exclusivedeals FlashSales timer is client-only).
export function getNextRotation() {
  const now = new Date();
  const target = new Date(now);
  target.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  target.setHours(0, 0, 0, 0);
  return target;
}

const pad = (value) => String(Math.max(0, value)).padStart(2, "0");

export function useRotationCountdown() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => {
      const diff = getNextRotation().getTime() - Date.now();
      setTime({
        days: pad(Math.floor(diff / 86400000)),
        hours: pad(Math.floor((diff % 86400000) / 3600000)),
        minutes: pad(Math.floor((diff % 3600000) / 60000)),
        seconds: pad(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export default function CountdownTimer({ label = "Featured deals rotate in:" }) {
  const time = useRotationCountdown();

  const tiles = [
    { value: time?.days, label: "Days" },
    { value: time?.hours, label: "Hours" },
    { value: time?.minutes, label: "Mins" },
    { value: time?.seconds, label: "Secs" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
      <p className="text-sm font-semibold text-(--muted-foreground)">{label}</p>
      <div className="flex items-center gap-2" role="timer" aria-live="off">
        {tiles.map((tile) => (
          <div key={tile.label} className="afd-count-tile">
            <span className="afd-count-number" suppressHydrationWarning>
              {tile.value ?? "--"}
            </span>
            <span className="afd-count-label">{tile.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UrgencyBadge({ prefix = "Featured ends in" }) {
  const time = useRotationCountdown();
  if (!time) return null;

  const days = Number(time.days);
  const text = days > 0 ? `${prefix} ${days + 1} day${days ? "s" : ""}` : `${prefix} ${Number(time.hours)}h`;

  return <span className="afd-badge afd-badge-urgency">{text}</span>;
}
