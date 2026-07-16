"use client";

import { Info } from "lucide-react";
import { SectionCard } from "./ui";
import { Calculator3D } from "./illustrations";

export default function HowItWorks({ example }) {
  return (
    <SectionCard title="How Age Calculation Works" icon={Info}>
      <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div
          className="hidden shrink-0 rounded-2xl border border-(--border) p-3 sm:block"
          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--card)), color-mix(in srgb, #3B82F6 16%, var(--card)))" }}
        >
          <Calculator3D size={96} />
        </div>
        <div>
          <p className="text-sm leading-relaxed text-(--muted-foreground)">
            We calculate your age by comparing your date of birth with today&apos;s date. The calculation
            considers years, months, days, hours, minutes and seconds for the most accurate result. Our
            algorithm adjusts for leap years, different month lengths and time zones to give you a precise
            age down to the second.
          </p>
          {example && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-xs font-semibold">
              <span className="text-(--muted-foreground)">Born:</span>
              <span className="text-(--foreground)">{example.born}</span>
              <span className="text-(--primary)">→</span>
              <span className="text-(--muted-foreground)">Age:</span>
              <span className="text-(--foreground)">{example.age}</span>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
