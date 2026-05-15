"use client";

import {
  Archive,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Lock,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: RotateCw,
    title: "Precise Rotation",
    description:
      "Rotate left, right, 180 degrees, or dial a custom straighten angle for scanned and tilted images.",
  },
  {
    icon: FlipHorizontal2,
    title: "Mirror Horizontally",
    description:
      "Flip selfies, product shots, thumbnails, documents, and artwork without uploading files.",
  },
  {
    icon: FlipVertical2,
    title: "Vertical Flip",
    description:
      "Invert images vertically and combine it with rotation for orientation fixes and creative variants.",
  },
  {
    icon: SlidersHorizontal,
    title: "Canvas Controls",
    description:
      "Choose expanded canvas, crop-to-original output, transparent background, background color, and quality.",
  },
  {
    icon: ImagePlus,
    title: "Batch Queue",
    description:
      "Load multiple images, select any item for preview, and apply the same transform to the entire batch.",
  },
  {
    icon: Archive,
    title: "ZIP Export",
    description:
      "Download one transformed image directly or package many JPG, PNG, or WebP outputs in a ZIP.",
  },
  {
    icon: Sparkles,
    title: "Before / After Preview",
    description:
      "Inspect original dimensions, transformed dimensions, estimated file size, and canvas behavior before export.",
  },
  {
    icon: Lock,
    title: "Browser-Side",
    description:
      "All edits run locally through canvas, so images do not leave the browser during processing.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Image Flip & Rotate Tool?</h2>
        <p className="description mt-3">
          Fix image orientation, mirror photos, straighten scans, preview output,
          and export polished files without server uploads.
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
