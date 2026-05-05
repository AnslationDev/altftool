"use client";

import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

export default function HealthScore({ score }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const start = animated;
    const end = Math.max(0, Math.min(100, Math.round(score)));
    const duration = 600;
    const startTime = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(start + (end - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  const color = animated > 30 ? "#3b82f6" : "#ef4444";

  return (
    <div className="soft-card p-5">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-badge">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              API Health Score
            </h3>
            <p className="text-xs text-muted-foreground">
              Overall reliability rating
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative h-44 w-44">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="14"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono-display text-4xl font-extrabold text-foreground">
              {animated}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">/ 100</p>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {animated > 30
          ? "Stable — small optimizations possible"
          : "Critical — likely to fail under load"}
      </p>
    </div>
  );
}
