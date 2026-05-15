"use client";

import {
  Archive,
  Crop,
  Download,
  FileImage,
  ImagePlus,
  Lock,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    icon: Maximize2,
    title: "Custom Dimensions",
    description:
      "Set exact width and height, lock aspect ratio, use percentage scaling, or export retina sizes.",
  },
  {
    icon: ImagePlus,
    title: "Social Presets",
    description:
      "Resize for Instagram, TikTok, YouTube, LinkedIn, X, Facebook, Pinterest, and ecommerce.",
  },
  {
    icon: Crop,
    title: "Fit, Fill, Stretch",
    description:
      "Choose contain, cover crop, or stretch modes depending on whether layout or full image matters.",
  },
  {
    icon: FileImage,
    title: "Format Export",
    description:
      "Export as JPEG, PNG, WebP, or keep the closest source-friendly format with quality control.",
  },
  {
    icon: Archive,
    title: "Batch ZIP",
    description:
      "Upload multiple images and download resized outputs as a single organized ZIP.",
  },
  {
    icon: SlidersHorizontal,
    title: "Live Preview",
    description:
      "Preview the selected image, output size, file size estimate, and exact resize mode.",
  },
  {
    icon: Download,
    title: "Smart Filenames",
    description:
      "Generated files include preset or dimension labels, making exports easy to sort.",
  },
  {
    icon: Lock,
    title: "Browser-Side",
    description:
      "Images are resized locally using canvas, so uploads are not required.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Image Resizer?</h2>
        <p className="description mt-3">
          Resize images for social platforms, websites, thumbnails, and product
          listings with exact dimensions, presets, previews, and batch export.
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
