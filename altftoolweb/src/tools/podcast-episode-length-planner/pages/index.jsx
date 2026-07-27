"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "targetMinutes", label: "Target length", placeholder: "35", inputMode: "decimal" },
  { key: "segments", label: "Segments", placeholder: "intro, story, interview, takeaways", multiline: true, full: true },
  { key: "adSlots", label: "Ad/sponsor slots", placeholder: "2", inputMode: "decimal" },
  { key: "pace", label: "Pace", type: "select", options: [
    { label: "Tight and edited", value: "tight and edited" },
    { label: "Conversational", value: "conversational" },
    { label: "Deep-dive", value: "deep-dive" },
  ] },
];

const defaults = {
  targetMinutes: "35",
  segments: "Intro\nContext/story\nGuest interview\nTakeaways\nOutro",
  adSlots: "2",
  pace: "conversational",
};

function buildOutput(values) {
  const target = Math.max(5, Number(values.targetMinutes) || 30);
  const adSlots = Math.max(0, Number(values.adSlots) || 0);
  const segments = String(values.segments || "")
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const contentMinutes = Math.max(1, target - adSlots);
  const perSegment = contentMinutes / Math.max(1, segments.length);

  return [
    "Podcast episode length plan",
    `Target: ${target} minutes`,
    `Pace: ${values.pace || "conversational"}`,
    `Sponsor/ad buffer: ${adSlots} minutes`,
    "",
    ...(segments.length ? segments : ["Intro", "Main segment", "Outro"]).map(
      (segment) => `• ${segment}: ~${perSegment.toFixed(1)} minutes`,
    ),
    "",
    "Editing tip: keep a 10% buffer so the final cut can breathe without running long.",
  ].join("\n");
}

export default function PodcastEpisodeLengthPlannerPage() {
  return (
    <QuickToolPage
      title="Podcast Episode Length Planner"
      description="Split podcast runtime across segments, sponsor slots, and pacing style."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Episode timing plan"
    />
  );
}
