"use client";

import { Download, Settings, CheckCircle2 } from "lucide-react";

const DEFAULT_ICONS = [Download, Settings, CheckCircle2];

function getStepText(step) {
  if (!step) return "";
  if (typeof step === "string" || typeof step === "number") return String(step);
  if (typeof step === "object") {
    const val = step.title || step.name || step.label || step.text || step.heading;
    if (typeof val === "string" || typeof val === "number") return String(val);
  }
  return "";
}

function getStepDesc(step) {
  if (typeof step === "object" && step !== null) {
    const val = step.description || step.desc || step.details;
    if (typeof val === "string" || typeof val === "number") return String(val);
  }
  return "";
}

const defaultSteps = [
  {
    title: "Install Extension",
    description: "Add this extension to your Chrome browser in just a few clicks.",
  },
  {
    title: "Set Your Preferences",
    description: "Configure the options to match how you work.",
  },
  {
    title: "Start Using It",
    description: "Access the extension right from your browser toolbar whenever you need it.",
  },
];

export default function HowItWorksSection({ howItWorksData }) {
  const parsedSteps = Array.isArray(howItWorksData)
    ? howItWorksData
        .map((step) => ({ title: getStepText(step), description: getStepDesc(step) }))
        .filter((step) => step.title)
    : [];

  const steps = (parsedSteps.length > 0 ? parsedSteps : defaultSteps).map((step, idx) => ({
    ...step,
    number: String(idx + 1),
    icon: DEFAULT_ICONS[idx % DEFAULT_ICONS.length],
  }));

  return (
    <section id="how-it-works" className="py-8 space-y-8 scroll-mt-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
          SIMPLE • FAST • EASY
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-[var(--foreground)] tracking-tight">
          How It Works
        </h2>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative max-w-4xl mx-auto items-center">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div key={idx} className="relative">
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm text-center space-y-3 relative hover:border-[var(--primary)]/40 hover:shadow-md transition-all">
                {/* Step Number Circle */}
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold flex items-center justify-center mx-auto -mt-9 shadow-sm border-2 border-[var(--card)]">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary)]/20">
                  <IconComp className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-medium">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Dashed Connector Arrow between steps on Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-[var(--muted-foreground)] items-center">
                  <span className="text-xs font-mono tracking-tighter">-----›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
