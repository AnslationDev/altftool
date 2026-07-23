"use client";

import { useState } from "react";
import { CheckCircle2, Crown, LineChart } from "lucide-react";

const PRO_FEATURES = [
  "AI-powered endpoint analysis",
  "Real-time monitoring",
  "Team collaboration",
  "Scheduled scans & alerts",
];

export default function ProBanner() {
  const [clicked, setClicked] = useState(false);

  return (
    <section
      aria-label="Pro upgrade"
      className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 lg:flex-row lg:items-center"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <LineChart aria-hidden="true" size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-foreground">Unlock deeper insights with Pro</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CheckCircle2 aria-hidden="true" size={13} className="shrink-0 text-success" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setClicked(true)}
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Crown aria-hidden="true" size={15} />
        {clicked ? "Pro is coming soon" : "Upgrade to Pro"}
      </button>
    </section>
  );
}
