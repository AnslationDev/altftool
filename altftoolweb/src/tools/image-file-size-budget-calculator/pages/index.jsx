"use client";

import QuickToolPage from "../../_shared/QuickToolPage";
import { BUDGET_PRESETS, FORMATS, computeImageBudget, formatBytes } from "../lib";

const fields = [
  { key: "width", label: "Image display width (px)", placeholder: "800", inputMode: "decimal" },
  { key: "height", label: "Image display height (px)", placeholder: "600", inputMode: "decimal" },
  {
    key: "dpr",
    label: "Device pixel ratio",
    type: "select",
    options: [
      { label: "1x", value: "1" },
      { label: "2x (retina)", value: "2" },
      { label: "3x", value: "3" },
    ],
  },
  {
    key: "format",
    label: "Format to ship",
    type: "select",
    options: FORMATS.map((format) => ({ label: format.label, value: format.id })),
  },
  {
    key: "pageBudgetKb",
    label: "Total page weight budget",
    type: "select",
    options: BUDGET_PRESETS.map((preset) => ({ label: preset.label, value: String(preset.kb) })),
  },
  {
    key: "overheadKb",
    label: "Code + font weight already spent (KB)",
    placeholder: "200",
    inputMode: "decimal",
  },
  { key: "plannedCount", label: "Planned image count", placeholder: "12", inputMode: "decimal" },
  {
    key: "jpegBpp",
    label: "Reference JPEG bits per pixel",
    placeholder: "1.0",
    inputMode: "decimal",
    hint: "0.5 for flat/simple images, 1.5 for dense texture — 1.0 is a fair default.",
  },
];

const defaults = {
  width: "800",
  height: "600",
  dpr: "1",
  format: "webp",
  pageBudgetKb: "1000",
  overheadKb: "200",
  plannedCount: "12",
  jpegBpp: "1.0",
};

function buildOutput(values) {
  const result = computeImageBudget({
    pageBudgetKb: Number(values.pageBudgetKb),
    overheadKb: Number(values.overheadKb),
    width: Number(values.width),
    height: Number(values.height),
    dpr: Number(values.dpr),
    jpegBpp: Number(values.jpegBpp),
    formatId: values.format,
    plannedCount: Number(values.plannedCount),
  });

  if (result.error) {
    return `Unable to compute budget: ${result.error}`;
  }

  const lines = [
    "Image file-size budget",
    `Page weight budget: ${formatBytes(result.budgetBytes)}, minus ${formatBytes(result.overheadBytes)} of code/fonts = ${formatBytes(result.imageBudgetBytes)} left for images.`,
    `${result.format.label} at ${values.width}x${values.height}px, DPR ${values.dpr}, ${values.jpegBpp} bpp reference: ~${formatBytes(result.perImageBytes)} per image.`,
    `Planned ${result.plannedCount} images: ${formatBytes(result.plannedBytes)} total — ${
      result.overBudget
        ? `over budget by ${formatBytes(Math.abs(result.remainingBytes))}`
        : `${formatBytes(result.remainingBytes)} left over`
    }.`,
    `Images that fit in the remaining budget at this size/format: ${result.fitsInBudget}.`,
    "",
    "How many fit per format (same size and DPR):",
    ...result.formatComparison.map(
      (entry) => `  ${entry.label}: ~${formatBytes(entry.bytes)} each, ${entry.fits} fit`
    ),
    "",
    "Transfer time for the planned set (images + code/fonts):",
    ...result.transfers.map(
      (transfer) => `  ${transfer.label} (${transfer.kbps} kbps): ${transfer.secondsForPlanned.toFixed(1)}s`
    ),
  ];

  return lines.join("\n");
}

export default function ImageFileSizeBudgetCalculatorPage() {
  return (
    <QuickToolPage
      title="Image File Size Budget Calculator"
      description="Work out how many images of a given size, DPR and format fit inside a page weight budget, and how long the set takes to transfer."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Image budget"
    />
  );
}
