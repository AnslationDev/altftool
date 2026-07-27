"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "images", label: "Number of images", placeholder: "12", inputMode: "decimal" },
  { key: "pageBudget", label: "Total image budget KB", placeholder: "1200", inputMode: "decimal" },
  { key: "heroCount", label: "Hero/large images", placeholder: "2", inputMode: "decimal" },
  { key: "format", label: "Target format", type: "select", options: [
    { label: "WebP/AVIF", value: "WebP/AVIF" },
    { label: "JPEG", value: "JPEG" },
    { label: "PNG", value: "PNG" },
  ] },
];

const defaults = {
  images: "12",
  pageBudget: "1200",
  heroCount: "2",
  format: "WebP/AVIF",
};

function buildOutput(values) {
  const images = Math.max(1, Number(values.images) || 1);
  const budget = Math.max(1, Number(values.pageBudget) || 1000);
  const hero = Math.min(images, Math.max(0, Number(values.heroCount) || 0));
  const heroBudget = budget * 0.5;
  const restBudget = budget - heroBudget;
  const regular = Math.max(1, images - hero);

  return [
    "Image file-size budget",
    `Format target: ${values.format || "WebP/AVIF"}`,
    `Total image budget: ${budget.toFixed(0)} KB`,
    `Hero images: ${hero} × ~${hero ? (heroBudget / hero).toFixed(0) : 0} KB`,
    `Other images: ${images - hero} × ~${(restBudget / regular).toFixed(0)} KB`,
    "",
    "Performance tip: lazy-load non-hero images and provide explicit width/height to reduce layout shift.",
  ].join("\n");
}

export default function ImageFileSizeBudgetCalculatorPage() {
  return (
    <QuickToolPage
      title="Image File Size Budget Calculator"
      description="Split a page image-weight budget across hero and supporting images."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Image budget"
    />
  );
}
