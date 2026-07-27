"use client";

import { Zap, ShieldCheck, Feather, Code2, Sparkles } from "lucide-react";

export default function WhyChooseSection({ benefitsData }) {
  const defaultBenefits = [
    {
      icon: Zap,
      title: "Lightning Fast Speed",
      description: "Optimized algorithm guarantees near-zero RAM footprint and sub-millisecond execution times.",
    },
    {
      icon: ShieldCheck,
      title: "100% Privacy Focused",
      description: "Processes data entirely on your device. Zero telemetry, zero ad tracking, and no external calls.",
    },
    {
      icon: Feather,
      title: "Zero Bloatware",
      description: "Clean minimal design engineered specifically for peak focus without annoying popups or banners.",
    },
    {
      icon: Code2,
      title: "Clean & Reliable",
      description: "Built strictly following Manifest V3 guidelines for modern security, reliability, and battery life.",
    },
  ];

  const benefits = (benefitsData && benefitsData.length > 0) ? benefitsData : defaultBenefits;

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0D9488] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Engineered For Quality
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Why Choose This Extension
          </h2>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          Built with uncompromising standards for user privacy, speed, and clean user experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {benefits.map((item, idx) => {
          const IconComp = item.icon || Sparkles;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all duration-200 hover:border-[var(--primary)]/40 hover:shadow-lg hover:-translate-y-1 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
