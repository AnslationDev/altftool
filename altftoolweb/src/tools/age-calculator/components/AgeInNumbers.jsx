"use client";

import { Heart, Wind, Sunrise, Coffee, Moon, Globe } from "lucide-react";
import { SectionCard, StatTile, fmt } from "./ui";

export default function AgeInNumbers({ body }) {
  const items = [
    { icon: Heart, value: fmt(body.heartbeats), label: "Heartbeats", tone: "var(--primary)" },
    { icon: Wind, value: fmt(body.breaths), label: "Breaths Taken", tone: "var(--secondary)" },
    { icon: Sunrise, value: fmt(body.sunrises), label: "Sunrises Seen", tone: "var(--primary)" },
    { icon: Coffee, value: fmt(body.weekends), label: "Weekends Enjoyed", tone: "var(--secondary)" },
    { icon: Moon, value: fmt(body.moonCycles), label: "Moon Cycles", tone: "var(--primary)" },
    { icon: Globe, value: fmt(body.earthRevolutions), label: "Earth Revolutions", tone: "var(--secondary)" },
  ];
  return (
    <SectionCard title="Your Age in Numbers" icon={Heart}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <StatTile key={i.label} icon={i.icon} value={i.value} label={i.label} tone={i.tone} />
        ))}
      </div>
    </SectionCard>
  );
}
