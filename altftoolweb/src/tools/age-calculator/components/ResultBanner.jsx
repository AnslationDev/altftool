"use client";

import { CalendarDays, Sun, Clock, Timer, Hourglass, Cake } from "lucide-react";
import { StatTile, fmt } from "./ui";

export default function ResultBanner({ age, totals }) {
  const big = [
    { value: age.years, label: "Years" },
    { value: age.months, label: "Months" },
    { value: age.days, label: "Days" },
  ];
  const stats = [
    { icon: CalendarDays, value: fmt(totals.weeks), label: "Weeks", tone: "var(--primary)" },
    { icon: Sun, value: fmt(totals.days), label: "Days", tone: "var(--secondary)" },
    { icon: Clock, value: fmt(totals.hours), label: "Hours", tone: "var(--primary)" },
    { icon: Timer, value: fmt(totals.minutes), label: "Minutes", tone: "var(--secondary)" },
    { icon: Hourglass, value: fmt(totals.seconds), label: "Seconds", tone: "var(--primary)" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <div
        className="relative overflow-hidden rounded-2xl border border-(--border) p-6 text-white"
        style={{ background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--secondary) 70%, var(--primary)))" }}
      >
        <p className="text-sm font-bold uppercase tracking-wider text-white/80">Your Age is</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
          {big.map((b) => (
            <div key={b.label}>
              <span className="text-5xl font-black leading-none">{b.value}</span>
              <span className="ml-1 block text-sm font-semibold text-white/80">{b.label}</span>
            </div>
          ))}
        </div>
        <Cake className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 text-white/20" strokeWidth={1.2} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <StatTile key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} />
        ))}
      </div>
    </div>
  );
}
