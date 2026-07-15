"use client";

import { ArrowRight, BarChart3, CircleCheckBig, ScanFace, Upload } from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD, SectionHeading } from "./ui.jsx";

const STEPS = [
  {
    icon: Upload,
    tone: "primary",
    title: "1. Upload Image",
    description: "Upload or capture a clear photo of a face.",
  },
  {
    icon: ScanFace,
    tone: "info",
    title: "2. AI Detection",
    description: "Our AI detects and analyzes the face in the image.",
  },
  {
    icon: BarChart3,
    tone: "warning",
    title: "3. Analyze",
    description: "AI estimates age and predicts gender.",
  },
  {
    icon: CircleCheckBig,
    tone: "success",
    title: "4. Get Results",
    description: "View results with confidence score instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-label="How it works">
      <SectionHeading eyebrow="Simple by design" title="How It Works" />
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            <div className={`${CARD} flex h-full flex-col items-center gap-2 p-5 text-center`}>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={toneStyle(step.tone)}
              >
                <step.icon size={21} aria-hidden="true" />
              </span>
              <p className="text-sm font-bold text-(--foreground)">{step.title}</p>
              <p className="text-xs leading-5 text-(--muted-foreground)">{step.description}</p>
            </div>
            {index < STEPS.length - 1 && (
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="absolute -right-[15px] top-1/2 z-10 hidden -translate-y-1/2 text-(--muted-foreground) xl:block"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
