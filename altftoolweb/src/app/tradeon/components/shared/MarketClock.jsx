// src/app/tradeon/components/shared/MarketClock.jsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Rough regular-session windows in UTC hours (Mon–Fri). Enough to drive a
// credible "open / closed" indicator without a market-calendar dependency.
const SESSIONS = [
  { code: "NYSE", open: 13.5, close: 20 },
  { code: "LON", open: 8, close: 16.5 },
  { code: "TKY", open: 0, close: 6 },
];

function sessionOpen(now, s) {
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  return h >= s.open && h < s.close;
}

export default function MarketClock({ compact = false }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "--:--:--";

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs tdn-mono" style={{ color: "var(--tdn-muted)" }}>
        <Clock size={13} />
        {time}
        {!compact && <span className="opacity-60">{now ? gmtLabel(now) : ""}</span>}
      </span>
      {!compact && (
        <div className="flex items-center gap-2">
          {SESSIONS.map((s) => {
            const open = now ? sessionOpen(now, s) : false;
            return (
              <span key={s.code} className="inline-flex items-center gap-1 text-[0.68rem] font-semibold" title={`${s.code} ${open ? "open" : "closed"}`}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: open ? "var(--tdn-up)" : "var(--tdn-faint)", boxShadow: open ? "0 0 6px var(--tdn-up)" : "none" }}
                />
                <span style={{ color: open ? "var(--tdn-fg)" : "var(--tdn-faint)" }}>{s.code}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function gmtLabel(d) {
  // Local time is displayed; label it with the correct GMT offset (the market
  // session dots below are computed independently in UTC).
  const mins = -d.getTimezoneOffset();
  const sign = mins >= 0 ? "+" : "-";
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `GMT${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}
