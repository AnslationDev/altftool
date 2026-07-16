import React from "react";
import { Lightbulb, Zap, Brain, Shield } from "lucide-react";

const steps = [
  { icon: <Zap className="h-6 w-6 text-[var(--primary)]" />, title: "Capture a Memory", description: "Write about any moment, feeling, or experience. Add mood, intensity, tags, and category to organize it." },
  { icon: <Brain className="h-6 w-6 text-[var(--primary)]" />, title: "AI Analyzes It", description: "Instant sentiment analysis, topic detection, word frequency insights, and mood tracking all running in your browser." },
  { icon: <Shield className="h-6 w-6 text-[var(--primary)]" />, title: "Preserve & Reflect", description: "Seal capsules for future opening, track your emotional journey, and discover patterns in your memories over time." },
];

export default function HowItWorks() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-6 flex items-center gap-2">
        <Lightbulb size={20} className="text-[var(--primary)]" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">How It Works</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">{step.icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">{step.title}</h3>
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
