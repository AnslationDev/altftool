"use client";

import {
  Monitor,
  Lock,
  Layers,
  BarChart3,
  FileText,
  Download,
  ShieldOff,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Client-Side Analysis",
    description: "All processing runs directly in your browser. No server uploads, no data leaving your device.",
    icon: Monitor,
  },
  {
    title: "Privacy First",
    description: "Your images are never stored, transmitted, or analyzed on external servers. Complete privacy guaranteed.",
    icon: Lock,
  },
  {
    title: "Multi-Check Analysis",
    description: "Eight independent forensic checks examine different aspects: noise, compression, metadata, lighting, texture, edges, colors, and faces.",
    icon: Layers,
  },
  {
    title: "Confidence Scoring",
    description: "Each analysis check provides a confidence level so you understand the reliability of each finding.",
    icon: BarChart3,
  },
  {
    title: "Detailed Report",
    description: "Get a comprehensive breakdown with expandable details for each analysis check and actionable recommendations.",
    icon: FileText,
  },
  {
    title: "Export Options",
    description: "Download your report as JSON, print a formatted PDF, or copy a text summary to your clipboard.",
    icon: Download,
  },
  {
    title: "No Data Upload",
    description: "Unlike other tools, your images never leave your device. Processing happens entirely within your browser.",
    icon: ShieldOff,
  },
  {
    title: "Real-Time Processing",
    description: "See analysis progress in real-time with a visual progress indicator. Most images analyze in under 5 seconds.",
    icon: Zap,
  },
];

export default function Features() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-[var(--foreground)]">
            Why Use Our AI Fake Image Detector?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
            Powerful forensic analysis with complete privacy — everything runs in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Icon className="mb-3 h-6 w-6 text-[var(--primary)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
