"use client";

import { CalendarRange, Sunrise, Clock3, TimerReset, Hourglass } from "lucide-react";
import { StatTile, fmt } from "./ui";
import { Cake3D } from "./illustrations";

// Dark "hero" result card + totals grid, mirroring the reference layout:
// three headline units on a deep navy→teal panel, five total tiles beside it.
export default function ResultBanner({ age, totals }) {
  const big = [
    { value: age.years, label: "Years" },
    { value: age.months, label: "Months" },
    { value: age.days, label: "Days" },
  ];
  const stats = [
    { icon: CalendarRange, value: fmt(totals.weeks), label: "Weeks", tone: "var(--primary)", span: "sm:col-span-2" },
    { icon: Sunrise, value: fmt(totals.days), label: "Days", tone: "var(--secondary)", span: "sm:col-span-2" },
    { icon: Clock3, value: fmt(totals.hours), label: "Hours", tone: "var(--primary)", span: "sm:col-span-2" },
    { icon: TimerReset, value: fmt(totals.minutes), label: "Minutes", tone: "var(--secondary)", span: "sm:col-span-3" },
    { icon: Hourglass, value: fmt(totals.seconds), label: "Seconds", tone: "var(--primary)", span: "sm:col-span-3" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]" aria-live="polite">
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md sm:p-7"
        style={{
          background:
            "linear-gradient(140deg, var(--anslation-ds-footer, #0F172A) 30%, color-mix(in srgb, var(--primary) 45%, var(--anslation-ds-footer, #0F172A)))",
        }}
      >
        {/* confetti accents */}
        <span className="absolute left-[58%] top-5 h-2 w-2 rounded-full bg-white/30" aria-hidden="true" />
        <span className="absolute bottom-6 left-8 h-1.5 w-1.5 rounded-full" style={{ background: "var(--secondary)", opacity: 0.7 }} aria-hidden="true" />
        <span className="absolute right-6 top-8 h-2.5 w-2.5 rounded-full" style={{ background: "#8B5CF6", opacity: 0.55 }} aria-hidden="true" />

        <p className="text-lg font-bold tracking-tight text-white/90">Your Age is</p>
        <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3">
          {big.map((b) => (
            <div key={b.label} className="min-w-[64px]">
              <span className="block text-5xl font-black leading-none [font-variant-numeric:tabular-nums] sm:text-6xl">
                {b.value}
              </span>
              <span className="mt-2 block text-sm font-semibold text-white/70">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute -bottom-2 right-3 opacity-95 sm:right-5">
          <Cake3D size={118} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {stats.map((s) => (
          <StatTile key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} className={s.span} />
        ))}
      </div>
    </div>
  );
}
