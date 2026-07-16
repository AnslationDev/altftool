"use client";

import {
  Upload,
  Shield,
  Download,
  Palette,
  Camera,
  MapPin,
} from "lucide-react";

const FEATURES = [
  {
    icon: Upload,
    title: "Drag & Drop",
    description:
      "Upload images instantly by dragging them onto the tool or clicking to browse your files.",
  },
  {
    icon: Shield,
    title: "Privacy Analysis",
    description:
      "Detect embedded GPS, author names, and other personal information that could compromise your privacy.",
  },
  {
    icon: Download,
    title: "Export Options",
    description:
      "Export metadata in JSON, TXT, or CSV formats, or copy it directly to your clipboard.",
  },
  {
    icon: Palette,
    title: "Color Palette",
    description:
      "Extract dominant colors, average color, and detect transparency in your images automatically.",
  },
  {
    icon: Camera,
    title: "EXIF Data",
    description:
      "View complete camera settings including exposure, ISO, focal length, aperture, and lens information.",
  },
  {
    icon: MapPin,
    title: "GPS Detection",
    description:
      "Identify embedded GPS coordinates and understand the exact location where a photo was taken.",
  },
];

export default function Features() {
  return (
    <section className="py-8">
      <h2 className="tool-heading-accent text-2xl font-semibold text-center mb-6">
        Features
      </h2>
      <div className="tool-card-grid">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] hover:shadow-md transition-shadow duration-150"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center mb-3">
              <f.icon size={20} className="text-[var(--primary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
