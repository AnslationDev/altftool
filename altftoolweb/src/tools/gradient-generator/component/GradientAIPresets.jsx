"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Camera,
  Rocket,
  Moon,
  Gem,
  Sunset,
  Waves,
  Zap,
  Leaf,
  Crown,
  Flame,
  Candy,
  Sparkles,
} from "lucide-react";

const PRESETS = [
  {
    label: "Instagram Style",
     icon: Camera,
    tag: "Trending",
    colors: ["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"],
  },
  {
    label: "Startup Landing",
    icon: Rocket,
    tag: "Popular",
    colors: ["#6a11cb", "#2575fc"],
  },
  {
    label: "Dark Mode UI",
     icon: Moon,
    tag: "Dark",
    colors: ["#0f0c29", "#302b63", "#24243e"],
  },
  {
    label: "Luxury Gradient",
    icon: Gem,
    tag: "Premium",
    colors: ["#b8860b", "#f5e27a", "#b8860b"],
  },
  {
    label: "Sunset Vibes",
    icon: Sunset,
    tag: "Trending",
    colors: ["#ff7e5f", "#feb47b"],
  },
  {
    label: "Ocean Breeze",
    icon: Waves,
    tag: "Chill",
    colors: ["#1a6b8a", "#2af598", "#009efd"],
  },
  {
    label: "Neon Cyberpunk",
    icon: Zap,
    tag: "Bold",
    colors: ["#ff0099", "#493240"],
  },
  {
    label: "Mint Fresh",
    icon: Leaf,
    tag: "Clean",
    colors: ["#00b09b", "#96c93d"],
  },
  {
    label: "Royal Purple",
    icon: Crown,
    tag: "Premium",
    colors: ["#4776e6", "#8e54e9"],
  },
  {
    label: "Fire & Flame",
    icon: Flame,
    tag: "Bold",
    colors: ["#f12711", "#f5af19"],
  },
  {
    label: "Cotton Candy",
    icon: Candy,
    tag: "Soft",
    colors: ["#fccb90", "#d57eeb"],
  },
  {
    label: "Aurora Borealis",
    icon: Sparkles,
    tag: "Dark",
    colors: ["#085078", "#85d8ce"],
  },
];

const TAG_STYLES = {
  Trending: "bg-orange-100 text-orange-700",
  Popular:  "bg-blue-100 text-blue-700",
  Dark:     "bg-gray-800 text-gray-100",
  Premium:  "bg-yellow-100 text-yellow-700",
  Chill:    "bg-teal-100 text-teal-700",
  Bold:     "bg-red-100 text-red-700",
  Clean:    "bg-green-100 text-green-700",
  Soft:     "bg-pink-100 text-pink-700",
};

export default function GradientAIPresets({ onApply }) {
  const [loading, setLoading] = useState(null);
  const [applied, setApplied] = useState(null);
  const [filterTag, setFilterTag] = useState("All");

  const allTags = ["All", ...new Set(PRESETS.map((p) => p.tag))];

  const filtered =
    filterTag === "All" ? PRESETS : PRESETS.filter((p) => p.tag === filterTag);

  const handleApply = (preset) => {
    setLoading(preset.label);

    // fake AI "thinking" delay
    setTimeout(() => {
      onApply(preset.colors);
      setApplied(preset.label);
      setLoading(null);
      toast.success(`"${preset.label}" applied!`);
      setTimeout(() => setApplied(null), 2000);
    }, 600);
  };

  const handleSurpriseMe = () => {
    const random = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    handleApply(random);
  };

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">✨ AI Gradient Presets</h3>
          <p className="text-sm text-(--foreground) mt-1">
            Curated styles — click any to apply instantly
          </p>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="cursor-pointer hidden sm:inline-flex sm:px-4 sm:py-2 bg-blue-600 text-white sm:text-sm text-xs rounded-lg hover:bg-blue-700 transition"
        >
          Surprise Me
        </button>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-5 mt-4">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
              filterTag === tag
                ? "bg-blue-600 text-white border-blue-600"
                : "border-(--border) hover:bg-(--card)"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((preset) => {
          const gradientStyle = `linear-gradient(135deg, ${preset.colors.join(", ")})`;
          const isLoading = loading === preset.label;
          const isApplied = applied === preset.label;
          const Icon = preset.icon;

          return (
            <div
              key={preset.label}
              onClick={() => handleApply(preset)}
              className="group rounded-lg border border-(--border) overflow-hidden cursor-pointer hover:shadow-md transition"
            >
              {/* Gradient swatch */}
              <div
                className="h-20 w-full rounded-md transition-transform group-hover:scale-105"
                style={{ background: gradientStyle }}
              />

              {/* Info */}
              <div className="p-3 bg-(--card) space-y-1">
                <div className="flex items-center justify-between">
<span className="text-sm font-medium hidden sm:flex items-center gap-1">
  <Icon size={14} />
  {preset.label}
</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      TAG_STYLES[preset.tag] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {preset.tag}
                  </span>

                  <span className="text-xs text-(--foreground)">
                    {isLoading
                      ? "Applying..."
                      : isApplied
                      ? "✓ Applied"
                      : "Apply"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}