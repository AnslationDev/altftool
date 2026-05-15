"use client";

import { Archive, FileImage, Images, Layers, ShieldCheck, SlidersHorizontal } from "lucide-react";

const features = [
  {
    icon: Images,
    title: "PNG, JPG & WebP Output",
    description:
      "Export PDF pages as sharp images with format-specific quality controls.",
  },
  {
    icon: Layers,
    title: "Page Range Selection",
    description:
      "Convert the full PDF or exact pages like 1-3, 5, 9 without extra work.",
  },
  {
    icon: SlidersHorizontal,
    title: "Resolution Control",
    description:
      "Choose from compact previews to high-resolution image exports for documents and designs.",
  },
  {
    icon: FileImage,
    title: "Live Image Previews",
    description:
      "Review converted pages with dimensions and file size before downloading.",
  },
  {
    icon: Archive,
    title: "Download as ZIP",
    description:
      "Grab every converted page in one clean ZIP, or download images individually.",
  },
  {
    icon: ShieldCheck,
    title: "Private Browser Processing",
    description:
      "Your PDF is rendered locally in the browser and does not need a server upload.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This PDF to Image Converter?</h2>
        <p className="description mt-3">
          Fast, private PDF page rendering with flexible image export options.
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
