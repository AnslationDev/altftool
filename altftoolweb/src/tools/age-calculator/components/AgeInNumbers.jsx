"use client";

import { HeartPulse, Wind, Sunrise, Coffee, MoonStar, Orbit } from "lucide-react";
import { SectionCard, StatTile, fmt, fmtCompact } from "./ui";

export default function AgeInNumbers({ body }) {
  const items = [
    { icon: HeartPulse, value: fmtCompact(body.heartbeats), label: "Heartbeats", tone: "var(--primary)" },
    { icon: Wind, value: fmtCompact(body.breaths), label: "Breaths Taken", tone: "var(--secondary)" },
    { icon: Sunrise, value: fmt(body.sunrises), label: "Sunrises Seen", tone: "var(--primary)" },
    { icon: Coffee, value: fmt(body.weekends), label: "Weekends Enjoyed", tone: "var(--secondary)" },
    { icon: MoonStar, value: fmt(body.moonCycles), label: "Moon Cycles", tone: "var(--primary)" },
    { icon: Orbit, value: fmt(body.earthRevolutions), label: "Earth Revolutions", tone: "var(--secondary)" },
  ];
  return (
    <SectionCard title="Your Age in Numbers" icon={HeartPulse}>
      <div className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {items.map((i) => (
          <StatTile key={i.label} icon={i.icon} value={i.value} label={i.label} tone={i.tone} />
        ))}
      </div>
    </SectionCard>
  );
}
