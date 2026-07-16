"use client";

import { Upload, Eye, Download } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: 1,
    title: "Upload Image",
    description:
      "Drag and drop or click to upload any image file. Supports JPEG, PNG, WebP, GIF, TIFF, and BMP formats.",
  },
  {
    icon: Eye,
    step: 2,
    title: "View Metadata",
    description:
      "Instantly see extracted EXIF data, camera details, GPS coordinates, color palette, and privacy analysis.",
  },
  {
    icon: Download,
    step: 3,
    title: "Export & Share",
    description:
      "Download metadata as JSON, TXT, or CSV, or copy it directly to your clipboard for easy sharing.",
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
            className="flex flex-col items-center text-center rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-sm mb-3">
              {s.step}
            </div>
            <s.icon size={20} className="text-[var(--primary)] mb-2" />
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
              {s.title}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
