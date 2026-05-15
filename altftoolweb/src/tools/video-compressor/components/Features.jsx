"use client";

import {
  AudioLines,
  Download,
  FileVideo,
  Gauge,
  MonitorDown,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "CRF Quality Control",
    description:
      "Balance file size and quality with CRF presets or custom compression strength.",
  },
  {
    icon: MonitorDown,
    title: "Resolution Caps",
    description:
      "Keep original size or downscale large videos to 1080p, 720p, 480p, or 360p.",
  },
  {
    icon: Zap,
    title: "MP4 and WebM",
    description:
      "Export browser-friendly H.264 MP4 or VP9 WebM files depending on the target use case.",
  },
  {
    icon: AudioLines,
    title: "Audio Bitrate",
    description:
      "Keep audio, mute clips, or reduce audio bitrate for smaller social and web uploads.",
  },
  {
    icon: SlidersHorizontal,
    title: "Advanced Presets",
    description:
      "Choose high quality, balanced, small file, or custom settings with metadata stripping.",
  },
  {
    icon: FileVideo,
    title: "Result Preview",
    description:
      "Check output size, savings percentage, dimensions, and playback before downloading.",
  },
  {
    icon: Download,
    title: "Direct Download",
    description:
      "Save the compressed output immediately from the browser without extra conversion steps.",
  },
  {
    icon: ShieldCheck,
    title: "Local Processing",
    description:
      "Compression runs with FFmpeg in the browser, so the source video is not uploaded.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Video Compressor?</h2>
        <p className="description mt-3">
          Reduce video size for websites, email, social platforms, product
          demos, and mobile sharing with local FFmpeg-powered controls.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-(--border) bg-(--card) p-5"
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
