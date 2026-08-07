"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";
import { PRESETS, FIT_MODES, EXPORT_FORMATS, simplifyRatio, feedFit, planExport, weightCheck } from "../lib";

const defaults = {
  type: "standard",
  fitMode: "cover",
  scale: "1",
  safeInset: "64",
  sourceWidth: "",
  sourceHeight: "",
  exportedKb: "",
};

const fields = [
  {
    key: "type",
    label: "Pin type",
    type: "select",
    options: PRESETS.map((preset) => ({
      value: preset.id,
      label: `${preset.label} — ${preset.width}×${preset.height}`,
    })),
  },
  { key: "scale", label: "Export scale", inputMode: "decimal" },
  { key: "safeInset", label: "Safe inset px", inputMode: "numeric" },
  {
    key: "fitMode",
    label: "Fit mode (for crop estimate)",
    type: "select",
    options: FIT_MODES.map((mode) => ({ value: mode.id, label: mode.label })),
  },
  { key: "sourceWidth", label: "Source image width px (optional)", inputMode: "decimal", placeholder: "e.g. 1600" },
  { key: "sourceHeight", label: "Source image height px (optional)", inputMode: "decimal", placeholder: "e.g. 1200" },
  { key: "exportedKb", label: "Exported file size KB (optional)", inputMode: "decimal", placeholder: "e.g. 850" },
];

function buildOutput(values) {
  const preset = PRESETS.find((item) => item.id === values.type) || PRESETS[0];
  // Clamp scale/inset so a blank, zero or negative entry can't produce a
  // negative canvas or an oversized safe area (finding: correctness).
  const scale = Number(values.scale) > 0 ? Number(values.scale) : 1;
  const inset = Math.max(0, Number(values.safeInset) || 0);
  const width = Math.round(preset.width * scale);
  const height = Math.round(preset.height * scale);

  const lines = [
    "Pinterest Pin Size",
    "",
    `Preset: ${preset.label} (${preset.note})`,
    `Canvas: ${width} × ${height}px — ratio ${simplifyRatio(width, height)}`,
    `Safe area: ${Math.max(0, width - inset * 2)} × ${Math.max(0, height - inset * 2)}px`,
  ];

  const feed = feedFit({ width, height });
  if (!feed.error) {
    lines.push(`Feed check: ${feed.verdict.message}`);
  }

  lines.push(
    "",
    "CSS:",
    `.pin-artboard { width: ${width}px; height: ${height}px; aspect-ratio: ${preset.width} / ${preset.height}; }`,
    `.pin-safe-area { inset: ${inset}px; }`
  );

  const sourceWidth = Number(values.sourceWidth);
  const sourceHeight = Number(values.sourceHeight);
  if (values.sourceWidth && values.sourceHeight && Number.isFinite(sourceWidth) && Number.isFinite(sourceHeight)) {
    const plan = planExport({ sourceWidth, sourceHeight, targetWidth: width, targetHeight: height, fit: values.fitMode });
    if (plan.error) {
      lines.push("", `Crop estimate: ${plan.error}`);
    } else {
      lines.push(
        "",
        `Crop estimate (${plan.fit} fit, source ${plan.source.ratio}): ${plan.croppedPercent.toFixed(0)}% of the source is cropped away, drawn at ${plan.scalePercent.toFixed(0)}% scale.`,
        plan.quality.message
      );
    }
  }

  const exportedKb = Number(values.exportedKb);
  if (values.exportedKb && Number.isFinite(exportedKb)) {
    const weight = weightCheck({ bytes: exportedKb * 1024 });
    if (!weight.error) {
      lines.push("", `File size: ${weight.label}${weight.ok ? " — within Pinterest's upload limit." : " — over Pinterest's upload limit."}`);
    }
  }

  lines.push("", `Export locally as ${EXPORT_FORMATS.map((format) => format.label).join(", ")}, then upload to Pinterest.`);

  return lines.join("\n");
}

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Pinterest creative"
      title="Pinterest Pin Size Generator"
      description="Calculate Pinterest pin canvas sizes from six official presets, check feed truncation, and estimate the crop against your source image's dimensions."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Pin dimensions"
    />
  );
}
