"use client";

import {
  Download,
  FileAudio,
  Gauge,
  Music,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Waves,
} from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Precise Audio Cutting",
    description:
      "Trim exact start and end points with sliders, second inputs, and current playback markers.",
  },
  {
    icon: Waves,
    title: "Waveform Timeline",
    description:
      "See loud and quiet sections visually before choosing the clip range.",
  },
  {
    icon: FileAudio,
    title: "MP3, WAV, M4A & OGG",
    description:
      "Export audio clips in popular formats with bitrate and quality options.",
  },
  {
    icon: SlidersHorizontal,
    title: "Fade & Volume Tools",
    description:
      "Add fade-in, fade-out, volume gain, or loudness normalization while trimming.",
  },
  {
    icon: Gauge,
    title: "Fast or Processed Export",
    description:
      "Use stream-copy for quick cuts or re-encode when you need filters and format conversion.",
  },
  {
    icon: Download,
    title: "Preview and Download",
    description:
      "Listen to the final clip in the browser before downloading it.",
  },
  {
    icon: Music,
    title: "Ringtone Friendly",
    description:
      "Create short clips, loops, ringtone samples, podcasts cuts, and social audio bites.",
  },
  {
    icon: ShieldCheck,
    title: "Private Browser Processing",
    description:
      "Audio is processed locally through FFmpeg in the browser; no upload queue is required.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This Audio Trimmer?</h2>
        <p className="description mt-3">
          Cut audio cleanly with waveform guidance and production-style export controls.
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
