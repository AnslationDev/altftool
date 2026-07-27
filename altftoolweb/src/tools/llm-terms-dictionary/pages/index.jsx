"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "terms", label: "LLM terms", placeholder: "temperature, top-p, embeddings, context window", multiline: true, full: true },
  { key: "audience", label: "Audience", placeholder: "marketers, founders, support team" },
  { key: "depth", label: "Depth", type: "select", options: [
    { label: "Plain beginner", value: "plain beginner" },
    { label: "Practical operator", value: "practical operator" },
    { label: "Technical concise", value: "technical concise" },
  ] },
];

const defaults = {
  terms: "temperature\ncontext window\nRAG\nembeddings",
  audience: "AI product team",
  depth: "practical operator",
};

function buildOutput(values) {
  const terms = String(values.terms || "")
    .split(/[\n,]+/)
    .map((term) => term.trim())
    .filter(Boolean);
  return [
    "LLM terms dictionary plan",
    `Audience: ${values.audience || "general readers"}`,
    `Depth: ${values.depth || "plain beginner"}`,
    "",
    ...(terms.length ? terms : ["LLM term"]).map(
      (term) =>
        `• ${term}: define in one sentence, explain why it matters, then add one “when to change it” example.`,
    ),
  ].join("\n");
}

export default function LlmTermsDictionaryPage() {
  return (
    <QuickToolPage
      title="LLM Terms Dictionary"
      description="Turn LLM vocabulary into compact definitions for a chosen audience and depth."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Dictionary brief"
    />
  );
}
