"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "project", label: "Project", placeholder: "Example: indie dev launch" },
  { key: "heading", label: "Heading font", placeholder: "Space Grotesk, Archivo Black" },
  { key: "body", label: "Body font", placeholder: "Inter, IBM Plex Sans" },
  { key: "density", label: "Layout density", type: "select", options: [
    { label: "Editorial brutalist", value: "editorial brutalist" },
    { label: "SaaS brutalist", value: "SaaS brutalist" },
    { label: "Poster brutalist", value: "poster brutalist" },
  ] },
];

const defaults = {
  project: "indie dev launch",
  heading: "Archivo Black",
  body: "IBM Plex Sans",
  density: "SaaS brutalist",
};

function buildOutput(values) {
  return [
    "Brutalist font pairing",
    `Project: ${values.project || "Your project"}`,
    `Style: ${values.density || "brutalist"}`,
    `Heading: ${values.heading || "Bold geometric display"}`,
    `Body: ${values.body || "Readable sans-serif"}`,
    "",
    "Usage rules:",
    "- Keep heading text short and high contrast.",
    "- Use strong grid alignment instead of decorative effects.",
    "- Pair heavy headings with calm body text.",
    "- Test uppercase labels for readability before launch.",
  ].join("\n");
}

export default function FontPairingBrutalistVibePage() {
  return (
    <QuickToolPage
      title="Font Pairing Brutalist Vibe"
      description="Create a bold brutalist typography pairing with simple usage rules."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Brutalist type spec"
    />
  );
}
