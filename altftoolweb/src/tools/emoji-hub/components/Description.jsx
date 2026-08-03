import React from "react";
import {
  Search,
  MousePointerClick,
  Copy,
  Star,
  Share2,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for Emojis",
    description:
      "Use the smart search bar to quickly find emojis by typing keywords or phrases.",
  },
  {
    icon: MousePointerClick,
    title: "Browse Categories",
    description:
      "Explore emojis through organized categories like Smileys, Animals, Food, and Symbols.",
  },
  {
    icon: Copy,
    title: "Copy Instantly",
    description:
      "Click any emoji to copy it immediately. Your latest picks stay in a Recently used row for quick access.",
  },
  {
    icon: Star,
    title: "Save Favorites & Recents",
    description:
      "Star the emojis you use most. Favorites and up to 20 recent picks stay only in this browser's local storage.",
  },
  {
    icon: Share2,
    title: "Search GIFs Too",
    description:
      "Browse Giphy's current trends or search by keyword. Results come through AltFTool's server, so no API key reaches your browser.",
  },
  {
    icon: Smartphone,
    title: "Consistent on Every Device",
    description:
      "Responsive controls work across phone, tablet, and desktop, while 64px Apple-style emoji artwork stays visually consistent.",
  },
];

export default function Description() {
  return (
    <section className="bg-surface-soft px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          How Emoji Hub Works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-150 motion-reduce:transition-none hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors duration-150 motion-reduce:transition-none group-hover:text-primary-text">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
