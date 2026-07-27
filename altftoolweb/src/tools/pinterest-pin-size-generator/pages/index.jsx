"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

const defaults = {
  type: "standard",
  scale: "1",
  safeInset: "64",
};

const fields = [
  {
    key: "type",
    label: "Pin type",
    type: "select",
    options: [
      { value: "standard", label: "Standard 2:3 pin — 1000×1500" },
      { value: "square", label: "Square pin — 1000×1000" },
      { value: "story", label: "Idea/story pin — 1080×1920" },
    ],
  },
  { key: "scale", label: "Export scale", inputMode: "decimal" },
  { key: "safeInset", label: "Safe inset px", inputMode: "numeric" },
];

const sizes = {
  standard: { label: "Standard 2:3 pin", width: 1000, height: 1500 },
  square: { label: "Square pin", width: 1000, height: 1000 },
  story: { label: "Idea/story pin", width: 1080, height: 1920 },
};

function buildOutput(values) {
  const size = sizes[values.type] || sizes.standard;
  const scale = Number(values.scale) || 1;
  const inset = Number(values.safeInset) || 0;
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  return [
    "Pinterest Pin Size",
    "",
    `Preset: ${size.label}`,
    `Canvas: ${width} × ${height}px`,
    `Safe area: ${Math.max(0, width - inset * 2)} × ${Math.max(0, height - inset * 2)}px`,
    "",
    "CSS:",
    `.pin-artboard { width: ${width}px; height: ${height}px; aspect-ratio: ${size.width} / ${size.height}; }`,
    `.pin-safe-area { inset: ${inset}px; }`,
  ].join("\n");
}

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Pinterest creative"
      title="Pinterest Pin Size Generator"
      description="Calculate standard, square and story pin dimensions with scaled exports and safe-area CSS."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Pin dimensions"
    />
  );
}
