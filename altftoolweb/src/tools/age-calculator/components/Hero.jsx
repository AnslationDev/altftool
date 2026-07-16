"use client";

import { CalendarClock, Hourglass, ShieldCheck, Sparkles, UserRoundCheck, Lock } from "lucide-react";
import { Chip } from "./ui";

export default function Hero() {
  return (
    <header className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-(--primary)"
          style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
        >
          <Sparkles className="h-3.5 w-3.5" /> Free Tool
        </span>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-(--foreground) sm:text-5xl">
          Calculate Your <span className="text-(--primary)">Exact Age</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-(--muted-foreground)">
          Get accurate age in years, months, weeks, days, hours, minutes and seconds instantly.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip icon={ShieldCheck}>100% Free</Chip>
          <Chip icon={UserRoundCheck}>No Sign Up</Chip>
          <Chip icon={Lock}>Privacy Focused</Chip>
        </div>
      </div>

      {/* Decorative illustration — gradient panel with calendar + hourglass. */}
      <div
        className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl border border-(--border) lg:block"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 16%, var(--card)), color-mix(in srgb, var(--secondary) 18%, var(--card)))" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex items-end gap-6">
            <span
              className="grid h-28 w-28 place-items-center rounded-3xl text-(--primary) shadow-sm"
              style={{ background: "color-mix(in srgb, var(--card) 80%, transparent)" }}
            >
              <CalendarClock className="h-14 w-14" strokeWidth={1.5} />
            </span>
            <span
              className="grid h-20 w-20 place-items-center rounded-2xl text-(--secondary) shadow-sm"
              style={{ background: "color-mix(in srgb, var(--card) 80%, transparent)" }}
            >
              <Hourglass className="h-10 w-10" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
