"use client";

import { ShieldCheck, Sparkles, UserRoundCheck, Lock } from "lucide-react";
import { Chip } from "./ui";
import { Calendar3D, Hourglass3D, Clock3D, Podium3D } from "./illustrations";

export default function Hero() {
  return (
    <header className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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

      <div
        className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl border border-(--border) lg:block"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 14%, var(--card)), color-mix(in srgb, #3B82F6 20%, var(--card)))" }}
        aria-hidden="true"
      >
        <span className="absolute right-8 top-8 h-4 w-4 rounded-full" style={{ background: "#8B5CF6", opacity: 0.5 }} />
        <span className="absolute left-10 top-16 h-3 w-3 rounded-full" style={{ background: "var(--secondary)", opacity: 0.6 }} />
        <span className="absolute bottom-10 right-16 h-2.5 w-2.5 rounded-full" style={{ background: "#3B82F6", opacity: 0.6 }} />
        <span className="absolute left-1/2 top-6 h-2 w-2 rotate-45" style={{ background: "#FBBF24", opacity: 0.7 }} />
        <span className="absolute bottom-16 left-6 h-2 w-2 rotate-12" style={{ background: "var(--primary)", opacity: 0.55 }} />
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <Podium3D width={280} height={52} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <Clock3D size={78} className="mt-16 drop-shadow-md" />
          <Calendar3D size={150} className="drop-shadow-md" />
          <Hourglass3D size={104} className="mt-6 drop-shadow-md" />
        </div>
      </div>
    </header>
  );
}
