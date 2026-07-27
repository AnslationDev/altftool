"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "bannerType", label: "Banner type", type: "select", options: [
    { label: "Server banner", value: "server banner" },
    { label: "Profile banner", value: "profile banner" },
    { label: "Event cover", value: "event cover" },
  ] },
  { key: "headline", label: "Headline/text", placeholder: "New community season" },
  { key: "brand", label: "Server/brand name", placeholder: "ALTFTool Labs" },
  { key: "notes", label: "Design notes", placeholder: "Keep logo readable on mobile", multiline: true, full: true },
];

const defaults = {
  bannerType: "server banner",
  headline: "New community season",
  brand: "ALTFTool Labs",
  notes: "Use a clean focal point and avoid tiny text near the edges.",
};

function buildOutput(values) {
  return [
    "Discord banner size spec",
    `Type: ${values.bannerType || "banner"}`,
    "Recommended canvas: 960 × 540 px",
    "Aspect ratio: 16:9",
    "Safe zone: keep key text and logos centered with at least 80 px edge padding.",
    "",
    "Layout brief:",
    `Headline: ${values.headline || "Add headline"}`,
    `Brand: ${values.brand || "Add brand"}`,
    `Notes: ${values.notes || "Add design notes"}`,
    "",
    "Export tip: use PNG for graphics or JPG for photo-heavy banners.",
  ].join("\n");
}

export default function DiscordBannerSizeGeneratorPage() {
  return (
    <QuickToolPage
      title="Discord Banner Size Generator"
      description="Plan Discord banner dimensions, safe areas, and export notes."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Discord banner spec"
    />
  );
}
