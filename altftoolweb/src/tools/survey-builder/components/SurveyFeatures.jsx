"use client";
import React, { useState } from "react";

/* ---------------------------
   ICONS (Solid Primary Color)
----------------------------*/
const CreateIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </svg>
);

const ChartIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <path d="M3 3v18h18" />
    <rect x="7" y="12" width="2" height="6" rx="1" />
    <rect x="12" y="9" width="2" height="9" rx="1" />
    <rect x="17" y="6" width="2" height="12" rx="1" />
  </svg>
);

const CsvIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <path d="M4 4h14l4 4v12H4z" />
    <path d="M14 4v5h5" />
    <text x="7" y="17" fontSize="6" fill="var(--primary)">
      CSV
    </text>
  </svg>
);

const SpeedIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <path d="M12 3a9 9 0 0 0-9 9h2a7 7 0 1 1 7 7v2a9 9 0 0 0 0-18z" />
    <path d="M12 12l4-2" />
  </svg>
);

const StorageIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
  </svg>
);

const ResponsiveIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary)"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="10" height="16" rx="2" />
    <rect x="15" y="8" width="6" height="10" rx="1" />
  </svg>
);

/* ---------------------------
        MAIN COMPONENT
----------------------------*/
export default function SurveyFeatures() {
  const [clickedCard, setClickedCard] = useState(null);

  const features = [
    {
      icon: CreateIcon,
      title: "Easy Survey Builder",
      description: "Create surveys quickly with drag-and-drop simplicity.",
    },
    {
      icon: ChartIcon,
      title: "Live Analytics",
      description: "Visualize results instantly with charts.",
    },
    {
      icon: CsvIcon,
      title: "CSV / JSON Export",
      description: "Download responses for detailed offline analysis.",
    },
    {
      icon: SpeedIcon,
      title: "Fast & Lightweight",
      description: "Optimized for instant rendering with no lag.",
    },
    {
      icon: StorageIcon,
      title: "Auto Save",
      description: "Your work saves automatically with LocalStorage.",
    },
    {
      icon: ResponsiveIcon,
      title: "Fully Responsive",
      description: "Works beautifully on mobile, tablet, and desktop.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 text-(--foreground)">
      {/* Header Badge */}
      <div className="text-center mb-10 md:mb-16">
        <div
          className="
            inline-flex items-center px-3 py-1 
            rounded-full text-sm font-semibold
            text-(--primary)
            bg-(--muted)
            border border-(--border)
            mb-2
          "
        >
          📊 Survey Features
        </div>

        <h2
          className="
            text-3xl md:text-4xl font-extrabold 
            text-(--)
            mb-3
          "
        >
          Everything You Need to Build Smart Surveys
        </h2>

        <p className="text-(--muted-foreground) max-w-2xl mx-auto text-lg leading-relaxed">
          Build, customize, and analyze surveys — all inside your browser.
        </p>
      </div>

      {/* Features Grid */}
      <div
        className="
          grid grid-cols-1 md:grid-cols-3 
          gap-6 max-w-6xl mx-auto px-4
        "
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={i}
              onClick={() => {
                setClickedCard(i);
                setTimeout(() => setClickedCard(null), 500);
              }}
              className="
                bg-(--card)
                border border-(--border)
                rounded-2xl p-6 
                transition-all cursor-pointer
                hover:-translate-y-2
                hover:shadow-lg
              "
            >
              <div className="w-16 h-16 rounded-xl bg-(--muted) flex items-center justify-center mb-4">
                <Icon />
              </div>

              <h3 className="text-xl font-semibold text-(--foreground) mb-2">
                {feature.title}
              </h3>

              <p className="text-(--muted-foreground)">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
