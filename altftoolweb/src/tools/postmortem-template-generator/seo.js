const seo = {
  title: "Blameless Postmortem Template Generator in Markdown",
  metaDescription:
    "Enter incident title, date, severity and duration for a Markdown postmortem: metadata, timeline, root cause, optional 5 Whys and an action-item table.",
  steps: [
    "Fill in the Incident title, Date of incident, Severity (SEV-1 to SEV-4) and Impact duration (minutes), with an optional Incident commander and customer impact summary.",
    "Set 'Empty action-item rows (1–10)' and tick the Optional sections you want — 5 Whys analysis scaffold, what went well / poorly, and supporting data.",
    "Press Copy Markdown to grab the generated template, shown with a live word count, and paste it into Confluence, Notion, Google Docs or a Git repository.",
  ],
  intro:
    "This generator produces a complete blameless postmortem document in Markdown — incident metadata, customer impact, timeline, root cause and contributing factors, optional 5 Whys and lessons-learned sections, and an action-item table with owners and due dates. The structure follows the postmortem practice described in the Google SRE Book and the Atlassian and PagerDuty incident handbooks. Enter the incident basics once and paste the result into Confluence, Notion, Google Docs or a Git repository.",
  useCases: [
    "An incident commander creating the postmortem doc minutes after resolution, while the timeline is still fresh in everyone's memory",
    "An engineering team standardising every outage review on one blameless format instead of ad-hoc documents per team",
    "A new SRE running their first incident review and wanting the sections — detection, resolution, 5 Whys, action items — laid out correctly",
  ],
  benefits: [
    ["Blameless by construction", "Prompts examine systems and processes, with a built-in reminder that people are not the root cause."],
    ["Complete SRE structure", "Metadata, timeline, root cause, detection, resolution, lessons and tracked action items in one document."],
    ["Configurable sections", "Toggle 5 Whys, lessons-learned and supporting-data sections and choose how many action-item rows you need."],
  ],
  faqs: [
    [
      "What should a postmortem include?",
      "A complete postmortem includes incident metadata (date, severity, duration, commander), a short summary, customer impact, a timestamped timeline, root cause with contributing factors, how the incident was detected and resolved, lessons learned, and action items each with a single owner and a due date. This generator scaffolds all of those sections.",
    ],
    [
      "What does blameless postmortem mean?",
      "It means the analysis targets systems and processes rather than individuals, on the assumption that people acted reasonably given the information they had. The practice, popularised by Google's SRE organisation, exists because blame suppresses the honest detail needed to prevent the next incident.",
    ],
    [
      "When should a postmortem be written?",
      "Start it within a day or two of resolution, while logs and memories are fresh, and review it with the team within about a week. Many organisations require a postmortem for every incident above a severity threshold — commonly SEV-1 and SEV-2 — regardless of how quickly it was fixed.",
    ],
    [
      "What is the 5 Whys technique in incident analysis?",
      "You ask why the failure happened, then ask why again about each answer, typically five times, until you reach process-level causes rather than surface symptoms. It is a useful scaffold but not a full method — most real incidents have several contributing factors, so this template keeps a separate contributing-factors section alongside the optional 5 Whys.",
    ],
  ],
};

export default seo;
