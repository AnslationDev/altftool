"use client";

import { Upload, ScanSearch, FileBarChart } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Upload Image",
    description: "Drag and drop or select an image file (JPG, PNG, WebP, TIFF) from your device.",
    icon: Upload,
  },
  {
    number: 2,
    title: "AI Analysis",
    description: "Multiple forensic checks analyze noise, compression, metadata, lighting, texture, edges, colors, and faces.",
    icon: ScanSearch,
  },
  {
    number: 3,
    title: "View Report",
    description: "Review a comprehensive report with confidence scores, detailed breakdowns, and actionable recommendations.",
    icon: FileBarChart,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <h2 className="text-center text-3xl font-extrabold text-[var(--foreground)]">
        How It Works
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--muted-foreground)]">
        Three simple steps to analyze any image for signs of AI generation.
      </p>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[var(--anslation-ds-shadow-sm)] transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/10 text-xl font-bold text-[var(--primary)]">
                {step.number}
              </div>
              <Icon className="mb-3 h-8 w-8 text-[var(--primary)]" />
              <h3 className="text-base font-semibold text-[var(--foreground)]">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
