"use client";

import { Smile } from "lucide-react";

// Generic cycle/select group for a single facial feature.
function FeatureGroup({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize transition active:scale-95 ${
                active
                  ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                  : "border-(--border) bg-(--background) text-(--muted-foreground) hover:bg-(--muted)"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Facial feature customization.
export default function FeatureControls({ features, onChange }) {
  const groups = [
    { label: "Face shape", key: "faceShape", options: ["round", "oval", "square"] },
    { label: "Eyes", key: "eyes", options: ["round", "happy", "wink", "closed"] },
    { label: "Eyebrows", key: "eyebrows", options: ["straight", "curved", "raised"] },
    { label: "Mouth", key: "mouth", options: ["smile", "neutral", "open", "smirk"] },
    { label: "Hair", key: "hair", options: ["short", "long", "bun", "mohawk", "bald"] },
    { label: "Facial hair", key: "facialHair", options: ["none", "stubble", "beard"] },
    { label: "Accessory", key: "accessory", options: ["none", "glasses", "sunglasses", "hat"] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-(--card-foreground)">
        <Smile size={16} className="text-(--primary)" />
        Facial Features
      </div>
      {groups.map((g) => (
        <FeatureGroup
          key={g.key}
          label={g.label}
          value={features[g.key]}
          options={g.options}
          onChange={(v) => onChange(g.key, v)}
        />
      ))}
    </div>
  );
}
