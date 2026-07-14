"use client";

import React from "react";
import { Shuffle, Search, Heart, Download } from "lucide-react";

const FEATURES = [
  {
    icon: Shuffle,
    title: "Random Jokes",
    description: "Generate jokes from a curated collection with support for multiple categories.",
  },
  {
    icon: Search,
    title: "Category Filter",
    description: "Filter jokes by Programming, Dad Jokes, Science, Animals, and more.",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Mark your favorite jokes and access them anytime from the favorites panel.",
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Copy, share, or download jokes as text files for offline enjoyment.",
  },
];

export default function Features() {
  return (
    <section className="py-8">
      <h2 className="tool-heading-accent text-2xl font-semibold text-center mb-6">
        Why Use Joke Generator?
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
