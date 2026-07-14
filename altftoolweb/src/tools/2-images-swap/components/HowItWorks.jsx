"use client";

import React from "react";
import { Upload, ArrowRightLeft, Download } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: 1,
    title: "Upload Images",
    description: "Drag and drop or click to upload two images into the swap slots.",
  },
  {
    icon: ArrowRightLeft,
    step: 2,
    title: "Swap Positions",
    description: "Click the swap button to instantly exchange the positions of both images.",
  },
  {
    icon: Download,
    step: 3,
    title: "Download Results",
    description: "Export either image from its new position with a single click.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-8">
      <h2 className="tool-heading-accent text-2xl font-semibold text-center mb-6">
        How It Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className="flex flex-col items-center text-center rounded-lg border border-(--border) bg-(--card) p-5"
          >
            <div className="w-10 h-10 rounded-full bg-(--primary) text-(--primary-foreground) flex items-center justify-center font-bold text-sm mb-3">
              {s.step}
            </div>
            <s.icon size={20} className="text-(--primary) mb-2" />
            <h3 className="text-sm font-semibold text-(--foreground) mb-1">{s.title}</h3>
            <p className="text-xs leading-relaxed text-(--muted-foreground)">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
