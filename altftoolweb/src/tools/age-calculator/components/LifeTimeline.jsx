"use client";

import { Baby, Bike, GraduationCap, Briefcase, UserRound, Route } from "lucide-react";
import { SectionCard } from "./ui";

const ICONS = [Baby, Bike, GraduationCap, Briefcase, UserRound];

export default function LifeTimeline({ timeline }) {
  return (
    <SectionCard title="Life Timeline" icon={Route}>
      <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
        {timeline.map((node, i) => {
          const Icon = ICONS[i] || UserRound;
          const active = node.stage === "Today";
          return (
            <div key={node.stage} className="relative flex min-w-[84px] flex-1 flex-col items-center text-center">
              {i < timeline.length - 1 && (
                <span
                  className="absolute left-1/2 top-6 h-0.5 w-full"
                  style={{ background: node.reached ? "var(--primary)" : "var(--border)" }}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border-2 ${
                  active ? "border-(--primary) text-(--primary-foreground)" : node.reached ? "border-(--primary) text-(--primary)" : "border-(--border) text-(--muted-foreground)"
                }`}
                style={active ? { background: "var(--primary)" } : { background: "var(--card)" }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <p className="mt-2 text-xs font-bold text-(--foreground)">{node.stage}</p>
              <p className="text-[11px] font-medium text-(--muted-foreground)">{node.range}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
