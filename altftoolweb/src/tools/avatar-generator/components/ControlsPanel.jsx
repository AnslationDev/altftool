"use client";

import { useState } from "react";
import StylePicker from "./StylePicker";
import ColorControls from "./ColorControls";
import FeatureControls from "./FeatureControls";

const BG_OPTIONS = [
  { id: "solid", name: "Solid" },
  { id: "gradient-sunset", name: "Sunset" },
  { id: "gradient-ocean", name: "Ocean" },
  { id: "gradient-aurora", name: "Aurora" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
];

// Composes the control groups behind a simple tabbed interface (no external deps).
export default function ControlsPanel({
  config,
  onStyle,
  onColor,
  onBackground,
  onFeature,
}) {
  const [tab, setTab] = useState("features");

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
        tab === id
          ? "bg-(--background) text-(--foreground) shadow-sm"
          : "text-(--muted-foreground) hover:text-(--foreground)"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
      <StylePicker value={config.style} onChange={onStyle} />

      <div className="mt-6">
        <div className="flex gap-2 rounded-xl bg-(--muted) p-1">
          {tabBtn("features", "Features")}
          {tabBtn("colors", "Colors")}
        </div>

        <div className="mt-5">
          {tab === "features" ? (
            <FeatureControls features={config.features} onChange={onFeature} />
          ) : (
            <ColorControls
              colors={config.colors}
              backgrounds={BG_OPTIONS}
              onColor={onColor}
              onBackground={onBackground}
            />
          )}
        </div>
      </div>
    </div>
  );
}
