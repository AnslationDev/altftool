"use client";

import { Activity, BarChart3, Target, TrendingUp } from "lucide-react";
import { formatNumber } from "../utils/stepStore";
import { toneStyle } from "../utils/tones";
import { CARD, SectionHeading } from "./ui.jsx";

function Stat({ icon: Icon, tone, label, value, className = "" }) {
  return (
    <div className={`flex items-center gap-3 border-(--border) p-4 ${className}`}>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
        style={toneStyle(tone)}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-(--muted-foreground)">{label}</p>
        <p className="text-xl font-extrabold leading-tight tabular-nums text-(--foreground)">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function QuickStats({ lifetime }) {
  return (
    <section aria-label="Quick stats">
      <SectionHeading eyebrow="All time" title="Quick Stats" />
      <div className={`${CARD} grid grid-cols-2 xl:grid-cols-4`}>
        <Stat
          icon={Activity}
          tone="primary"
          label="Avg Daily Steps"
          value={formatNumber(lifetime.avgSteps)}
          className="border-b border-r xl:border-b-0"
        />
        <Stat
          icon={TrendingUp}
          tone="success"
          label="Best Day"
          value={formatNumber(lifetime.bestDay.steps)}
          className="border-b xl:border-b-0 xl:border-r"
        />
        <Stat
          icon={BarChart3}
          tone="info"
          label="Total Steps"
          value={formatNumber(lifetime.totalSteps)}
          className="border-r"
        />
        <Stat
          icon={Target}
          tone="warning"
          label="Days Active"
          value={formatNumber(lifetime.daysActive)}
        />
      </div>
    </section>
  );
}
