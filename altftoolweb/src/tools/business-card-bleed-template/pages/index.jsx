"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "width", label: "Card width", placeholder: "90", inputMode: "decimal" },
  { key: "height", label: "Card height", placeholder: "54", inputMode: "decimal" },
  { key: "bleed", label: "Bleed each side", placeholder: "3", inputMode: "decimal" },
  { key: "unit", label: "Unit", type: "select", options: [
    { label: "mm", value: "mm" },
    { label: "inches", value: "in" },
  ] },
];

const defaults = {
  width: "90",
  height: "54",
  bleed: "3",
  unit: "mm",
};

function buildOutput(values) {
  const width = Math.max(0, Number(values.width) || 90);
  const height = Math.max(0, Number(values.height) || 54);
  const bleed = Math.max(0, Number(values.bleed) || 3);
  const unit = values.unit || "mm";
  return [
    "Business card bleed template",
    `Trim size: ${width} × ${height} ${unit}`,
    `Artwork size: ${width + bleed * 2} × ${height + bleed * 2} ${unit}`,
    `Bleed: ${bleed} ${unit}`,
    `Safe text area: keep text at least ${bleed * 2} ${unit} inside trim.`,
    "",
    "Layer checklist:",
    "- Background extends to artwork edge.",
    "- Logo and text remain inside safe area.",
    "- Export PDF using CMYK/profile requested by printer.",
  ].join("\n");
}

export default function BusinessCardBleedTemplatePage() {
  return (
    <QuickToolPage
      title="Business Card Bleed Template"
      description="Calculate business card trim, bleed, and safe text areas before print export."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Business card template"
    />
  );
}
