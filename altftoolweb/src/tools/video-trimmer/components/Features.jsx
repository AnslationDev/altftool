"use client";

import {
  AudioLines,
  Download,
  Film,
  Gauge,
  Scissors,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Start & End Trimming",
    description:
      "Pick exact clip boundaries with sliders, second inputs, or current playback time.",
  },
  {
    icon: Gauge,
    title: "Fast or Precise Mode",
    description:
      "Use quick stream-copy trimming or re-encode for frame-accurate clips.",
  },
  {
    icon: Film,
    title: "MP4, WebM or Original",
    description:
      "Export to common browser-friendly formats or keep the source container.",
  },
  {
    icon: AudioLines,
    title: "Audio Control",
    description:
      "Keep the original audio track or remove sound for clean silent clips.",
  },
  {
    icon: Download,
    title: "Preview Before Download",
    description:
      "Watch the trimmed result in the browser before saving it to your device.",
  },
  {
    icon: ShieldCheck,
    title: "Local Processing",
    description:
      "Your video is processed in the browser with FFmpeg; no upload pipeline needed.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This Video Trimmer?</h2>
        <p className="description mt-3">
          Cut videos quickly with browser-side controls built for real editing work.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-(--card) border border-(--border) rounded-lg p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
