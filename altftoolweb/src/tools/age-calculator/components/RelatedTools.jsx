"use client";

import Link from "next/link";
import { Cake, CalendarClock, Clock, Timer, ArrowRight, LayoutGrid } from "lucide-react";
import { SectionCard, ACCENT } from "./ui";

const TOOLS = [
  { slug: "birthday-analyzer", label: "Birthday Analyzer", desc: "Find upcoming birthdays", icon: Cake, tone: ACCENT.teal },
  { slug: "date-time-conversions", label: "Date Difference", desc: "Calculate time between dates", icon: CalendarClock, tone: ACCENT.cyan },
  { slug: "unix-timestamp-converter", label: "Timestamp Converter", desc: "Convert dates & timestamps", icon: Clock, tone: ACCENT.blue },
  { slug: "focus-timer", label: "Countdown Timer", desc: "Create beautiful countdowns", icon: Timer, tone: ACCENT.violet },
];

export default function RelatedTools() {
  return (
    <SectionCard title="More Date & Time Tools" icon={LayoutGrid}>
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            href={`/tools/all/${t.slug}`}
            prefetch={false}
            className="group flex flex-col rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm transition hover:border-(--primary) hover:shadow-md"
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${t.tone} 16%, transparent)`, color: t.tone }}
            >
              <t.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="mt-3 text-sm font-bold text-(--foreground)">{t.label}</p>
            <p className="text-xs text-(--muted-foreground)">{t.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-(--primary)">
              Try it <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
