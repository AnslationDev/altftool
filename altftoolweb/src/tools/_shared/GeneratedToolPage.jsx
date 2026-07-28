"use client";

import QuickToolPage from "./QuickToolPage";

const titleFromSlug = (slug = "tool") =>
  String(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function GeneratedToolPage({ toolConfig = {} }) {
  const title = toolConfig.name || titleFromSlug(toolConfig.slug);
  const description =
    toolConfig.description ||
    "Create a structured, copy-ready working note for this ALTFTool utility.";

  return (
    <QuickToolPage
      eyebrow="ALTFTool utility"
      title={title}
      description={description}
      defaults={{
        input: "",
        goal: "quick-check",
        detail: "standard",
      }}
      fields={[
        {
          key: "input",
          label: "Paste details, text, URL, file notes, or checklist items",
          placeholder: "Add the information you want this tool to organize...",
          multiline: true,
          full: true,
        },
        {
          key: "goal",
          label: "Output goal",
          type: "select",
          options: [
            { value: "quick-check", label: "Quick check" },
            { value: "step-plan", label: "Step plan" },
            { value: "risk-review", label: "Risk review" },
            { value: "copy-ready", label: "Copy-ready summary" },
          ],
        },
        {
          key: "detail",
          label: "Detail level",
          type: "select",
          options: [
            { value: "standard", label: "Standard" },
            { value: "compact", label: "Compact" },
            { value: "expanded", label: "Expanded" },
          ],
        },
      ]}
      outputLabel="Generated working note"
      buildOutput={(values) => {
        const input = String(values.input || "").trim();
        const modeLabel = {
          "quick-check": "Quick check",
          "step-plan": "Step plan",
          "risk-review": "Risk review",
          "copy-ready": "Copy-ready summary",
        }[values.goal] || "Quick check";

        const detailLabel = {
          compact: "Compact",
          standard: "Standard",
          expanded: "Expanded",
        }[values.detail] || "Standard";

        return [
          title,
          description,
          "",
          `Mode: ${modeLabel}`,
          `Detail: ${detailLabel}`,
          "",
          "Input captured:",
          input || "No input added yet.",
          "",
          "Working checklist:",
          "- Identify the main item, file, URL, media, or claim.",
          "- Extract the useful facts without exposing unnecessary private data.",
          "- Highlight anything that needs manual verification.",
          "- Produce a clean next-step summary the user can copy.",
          "",
          "Copy-ready result:",
          input
            ? `${title}: ${modeLabel.toLowerCase()} prepared from the supplied details. Review the checklist above before sharing or acting on it.`
            : `Add details on the left, then copy this ${title} working note.`,
        ].join("\n");
      }}
    />
  );
}
