"use client";

import React from "react";
import { Shuffle, ArrowRightLeft, Download, RotateCcw, Zap, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: ArrowRightLeft,
    title: "Instant Swap",
    description: "Swap two images with a single click and see the result immediately.",
  },
  {
    icon: Download,
    title: "Export Results",
    description: "Download either image in its swapped position for your projects.",
  },
  {
    icon: Shuffle,
    title: "Drag & Drop",
    description: "Upload images by dragging them directly onto the upload zones.",
  },
  {
    icon: RotateCcw,
    title: "Easy Reset",
    description: "Clear both images and start fresh with the reset button.",
  },
  {
    icon: Zap,
    title: "Real-Time Preview",
    description: "See side-by-side comparisons of original and swapped positions.",
  },
  {
    icon: Layers,
    title: "Image Details",
    description: "View file name, type, size, and dimensions for each uploaded image.",
  },
];

export default function Features() {
  return (
    <section className="py-8">
      <h2 className="tool-heading-accent text-2xl font-semibold text-center mb-6">
        Why Use 2 Images Swap?
      </h2>
      <div className="tool-card-grid">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm
                       hover:shadow-md transition-shadow duration-150"
          >
            <div className="w-10 h-10 rounded-lg bg-(--muted) flex items-center justify-center mb-3">
              <f.icon size={20} className="text-(--primary)" />
            </div>
            <h3 className="text-sm font-semibold text-(--foreground) mb-1">{f.title}</h3>
            <p className="text-xs leading-relaxed text-(--muted-foreground)">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
