"use client";

import { BrainCircuit, MonitorSmartphone, ShieldCheck, Target, Zap } from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD } from "./ui.jsx";

const FEATURES = [
  {
    icon: BrainCircuit,
    tone: "primary",
    title: "AI-Powered",
    description: "Advanced AI model for high accuracy results",
    className: "border-b sm:border-r xl:border-b-0",
  },
  {
    icon: ShieldCheck,
    tone: "success",
    title: "Private & Secure",
    description: "Images stay on your device. 100% private",
    className: "border-b xl:border-b-0 xl:border-r",
  },
  {
    icon: Zap,
    tone: "warning",
    title: "Instant Results",
    description: "Get age & gender in just seconds",
    className: "border-b sm:border-r xl:border-b-0",
  },
  {
    icon: Target,
    tone: "danger",
    title: "High Accuracy",
    description: "Trained on millions of faces for better results",
    className: "border-b sm:border-b-0 xl:border-r",
  },
  {
    icon: MonitorSmartphone,
    tone: "info",
    title: "Works Everywhere",
    description: "Works on all devices and modern browsers",
    className: "sm:col-span-2 xl:col-span-1",
  },
];

export default function FeatureStrip() {
  return (
    <section
      aria-label="Why use this tool"
      className={`${CARD} grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5`}
    >
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className={`flex flex-col items-center gap-2 border-(--border) p-5 text-center ${feature.className}`}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-[10px]"
            style={toneStyle(feature.tone)}
          >
            <feature.icon size={20} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-(--foreground)">{feature.title}</p>
          <p className="text-xs leading-5 text-(--muted-foreground)">{feature.description}</p>
        </div>
      ))}
    </section>
  );
}
