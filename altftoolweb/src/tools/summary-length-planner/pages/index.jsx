"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "sourceWords", label: "Source words", placeholder: "2400", inputMode: "decimal" },
  { key: "target", label: "Target summary", type: "select", options: [
    { label: "Executive brief", value: "Executive brief" },
    { label: "Bullet summary", value: "Bullet summary" },
    { label: "Social caption", value: "Social caption" },
    { label: "Study notes", value: "Study notes" },
  ] },
  { key: "compression", label: "Compression target %", placeholder: "15", inputMode: "decimal" },
  { key: "notes", label: "Must preserve", placeholder: "numbers, dates, decisions, owners", multiline: true, full: true },
];

const defaults = {
  sourceWords: "2400",
  target: "Executive brief",
  compression: "15",
  notes: "numbers, dates, decisions, owners",
};

function buildOutput(values) {
  const source = Math.max(1, Number(values.sourceWords) || 1000);
  const pct = Math.max(1, Math.min(90, Number(values.compression) || 15));
  const targetWords = Math.round((source * pct) / 100);
  return [
    "Summary length plan",
    `Format: ${values.target || "summary"}`,
    `Source length: ${source.toLocaleString()} words`,
    `Target compression: ${pct}%`,
    `Recommended summary length: ~${targetWords.toLocaleString()} words`,
    "",
    `Must preserve: ${values.notes || "key facts"}`,
    "Prompt note: ask the model to mark uncertainty and avoid adding facts not present in the source.",
  ].join("\n");
}

export default function SummaryLengthPlannerPage() {
  return (
    <QuickToolPage
      title="Summary Length Planner"
      description="Estimate summary word count from source length, format, and compression target."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Summary plan"
    />
  );
}
