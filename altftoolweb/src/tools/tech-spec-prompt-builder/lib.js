/**
 * Tech Spec Prompt Builder — design-doc outline maths + prompt composition.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/**
 * Average adult silent reading rate for English non-fiction, from Brysbaert's
 * 2019 meta-analysis of 190 studies: about 238 words per minute.
 */
export const SILENT_READING_WPM = 238;

/**
 * Reviewing a design doc is slower than reading it: reviewers re-read, follow
 * links and leave comments. This tool assumes a review pass takes 2.5x the
 * straight reading time.
 */
export const REVIEW_TIME_MULTIPLIER = 2.5;

/**
 * Canonical design-doc sections.
 *  - `weight` is how much the section contributes to the completeness score
 *    (3 = a doc without it will be sent back, 2 = expected, 1 = nice to have).
 *  - `words` is a typical length for that section in a standard-depth doc.
 *  - `required` sections must be present for the prompt to build.
 */
export const SPEC_SECTIONS = [
  {
    id: "context",
    label: "Context and problem",
    weight: 3,
    words: 250,
    required: false,
    instruction: "State the current behaviour, who is affected and what it costs today. No solution language in this section.",
  },
  {
    id: "goals",
    label: "Goals",
    weight: 3,
    words: 120,
    required: true,
    instruction: "List the goals as testable outcomes. Each one must be something a reviewer could later mark as met or not met.",
  },
  {
    id: "nongoals",
    label: "Non-goals",
    weight: 3,
    words: 90,
    required: true,
    instruction: "List what this work deliberately does not do, and for each say why it is out of scope now rather than never.",
  },
  {
    id: "proposal",
    label: "Proposed design",
    weight: 3,
    words: 600,
    required: true,
    instruction: "Describe the design in enough detail that a second engineer could implement it. Cover data flow, ownership and the failure behaviour of each new component.",
  },
  {
    id: "alternatives",
    label: "Alternatives considered",
    weight: 3,
    words: 350,
    required: false,
    instruction: "Give at least two alternatives including doing nothing. For each, state what it would cost and the specific reason it was rejected.",
  },
  {
    id: "api",
    label: "API and schema changes",
    weight: 1,
    words: 300,
    required: false,
    instruction: "Show the new or changed interfaces and schemas, and mark every one as additive, backward-compatible or breaking.",
  },
  {
    id: "risks",
    label: "Risks and mitigations",
    weight: 2,
    words: 200,
    required: false,
    instruction: "List concrete failure modes, not generic risk language. For each, give the mitigation and who owns it.",
  },
  {
    id: "rollout",
    label: "Rollout and migration",
    weight: 2,
    words: 250,
    required: false,
    instruction: "Describe the rollout order, the flag or gate controlling it, the backfill or migration if any, and the rollback procedure.",
  },
  {
    id: "observability",
    label: "Observability",
    weight: 2,
    words: 150,
    required: false,
    instruction: "Name the metrics, logs and alerts that will exist on day one, and the specific signal that would tell you to roll back.",
  },
  {
    id: "security",
    label: "Security and privacy",
    weight: 2,
    words: 200,
    required: false,
    instruction: "Cover the trust boundaries crossed, what personal data is touched, how it is retained and who can read it.",
  },
  {
    id: "testing",
    label: "Testing strategy",
    weight: 2,
    words: 180,
    required: false,
    instruction: "State what is covered by unit, integration and end-to-end tests, and name the cases that are deliberately not automated.",
  },
  {
    id: "openquestions",
    label: "Open questions",
    weight: 1,
    words: 120,
    required: false,
    instruction: "List the decisions still open, who needs to make each one and by when the answer blocks work.",
  },
  {
    id: "timeline",
    label: "Milestones",
    weight: 1,
    words: 120,
    required: false,
    instruction: "Break the work into milestones that each end in something shippable. No dates unless I supplied them.",
  },
];

/** Total weight of every section — the denominator of the completeness score. */
export const TOTAL_SECTION_WEIGHT = SPEC_SECTIONS.reduce((sum, section) => sum + section.weight, 0);

/** How much detail the doc goes into; multiplies every section's word target. */
export const DEPTHS = [
  { id: "brief", label: "Brief (one-pager)", multiplier: 0.6 },
  { id: "standard", label: "Standard design doc", multiplier: 1 },
  { id: "thorough", label: "Thorough (cross-team review)", multiplier: 1.6 },
];

export const AUDIENCES = [
  { id: "team", label: "My own team", instruction: "Assume the reader knows this service. Skip background on internal systems, but still define any new term." },
  { id: "crossteam", label: "Another team / cross-org review", instruction: "Assume the reader knows the company but not this service. Define every internal name on first use." },
  { id: "senior", label: "Staff / principal review", instruction: "Lead with the decision and its trade-off. Keep the narrative tight; put detail in appendices." },
  { id: "external", label: "External or open-source RFC", instruction: "Assume no internal context at all. No internal service names, no links to private documents." },
];

export function getSection(sectionId) {
  return SPEC_SECTIONS.find((item) => item.id === sectionId) || null;
}
export function getDepth(depthId) {
  return DEPTHS.find((item) => item.id === depthId) || null;
}
export function getAudience(audienceId) {
  return AUDIENCES.find((item) => item.id === audienceId) || null;
}

/** Ids of the sections that must always be present. */
export const REQUIRED_SECTION_IDS = SPEC_SECTIONS.filter((section) => section.required).map(
  (section) => section.id,
);

/**
 * Completeness score: the share of total section weight that the selected
 * sections account for, as a percentage from 0 to 100.
 */
export function scoreCompleteness(selectedIds) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) return 0;
  const unique = new Set(selectedIds);
  const earned = SPEC_SECTIONS.filter((section) => unique.has(section.id)).reduce(
    (sum, section) => sum + section.weight,
    0,
  );
  if (TOTAL_SECTION_WEIGHT <= 0) return 0;
  return (earned / TOTAL_SECTION_WEIGHT) * 100;
}

/** Straight reading time in minutes at SILENT_READING_WPM. Never NaN. */
export function readingMinutes(words, wpm = SILENT_READING_WPM) {
  const n = Number(words);
  const rate = Number(wpm);
  if (!Number.isFinite(n) || !Number.isFinite(rate) || rate <= 0 || n <= 0) return 0;
  return n / rate;
}

/** One trimmed item per non-empty line. */
export function parseLines(text, limit = 20) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Compose the design-doc prompt.
 * @returns {object} { prompt, totalWords, completeness, ... } or { error }
 */
export function buildSpecPrompt({
  title = "",
  problem = "",
  goals = "",
  nonGoals = "",
  alternatives = "",
  constraints = "",
  selectedSections = [],
  depthId = "standard",
  audienceId = "team",
} = {}) {
  const depth = getDepth(depthId);
  if (!depth) return { error: "Pick how detailed the document should be." };

  const audience = getAudience(audienceId);
  if (!audience) return { error: "Pick who will review the document." };

  const docTitle = String(title || "").trim();
  if (!docTitle) return { error: "Give the design document a title." };

  const problemText = String(problem || "").trim();
  if (!problemText) return { error: "Describe the problem this design solves." };

  const chosen = SPEC_SECTIONS.filter((section) =>
    Array.isArray(selectedSections) ? selectedSections.includes(section.id) : false,
  );
  if (chosen.length === 0) return { error: "Select at least one section to include." };

  const missingRequired = REQUIRED_SECTION_IDS.filter(
    (id) => !chosen.some((section) => section.id === id),
  ).map((id) => getSection(id).label);
  if (missingRequired.length > 0) {
    return { error: `A design doc needs ${missingRequired.join(", ")}. Turn those sections back on.` };
  }

  const goalList = parseLines(goals);
  if (goalList.length === 0) return { error: "List at least one goal, one per line." };

  const nonGoalList = parseLines(nonGoals);
  const altList = parseLines(alternatives);

  const outline = chosen.map((section) => ({
    id: section.id,
    label: section.label,
    words: Math.max(1, Math.round(section.words * depth.multiplier)),
    instruction: section.instruction,
  }));

  const totalWords = outline.reduce((sum, section) => sum + section.words, 0);
  const readMinutes = readingMinutes(totalWords);
  const reviewMinutes = readMinutes * REVIEW_TIME_MULTIPLIER;
  const completeness = scoreCompleteness(chosen.map((section) => section.id));

  const constraintsText = String(constraints || "").trim();

  const sections = [
    {
      title: "Role",
      body: `You are a staff engineer writing a design document. You write decisions, not options. You never invent a benchmark, a latency figure, a cost or an incident that was not given to you.`,
    },
    {
      title: "Document",
      body: [
        `Title: ${docTitle}`,
        `Audience: ${audience.label}. ${audience.instruction}`,
        `Problem: ${problemText}`,
        "",
        "Goals (rewrite these as testable outcomes, do not add new ones):",
        ...goalList.map((goal, index) => `G${index + 1}. ${goal}`),
        ...(nonGoalList.length > 0
          ? ["", "Non-goals:", ...nonGoalList.map((item, index) => `N${index + 1}. ${item}`)]
          : ["", "Non-goals: I have not written any. Propose three, clearly marked as proposals for me to confirm."]),
        ...(altList.length > 0
          ? ["", "Alternatives I have already considered:", ...altList.map((item, index) => `A${index + 1}. ${item}`)]
          : []),
        ...(constraintsText ? ["", `Constraints and existing systems: ${constraintsText}`] : []),
      ].join("\n"),
    },
    {
      title: "Sections to write",
      body: outline
        .map((section, index) => `${index + 1}. ${section.label} (~${section.words} words)\n   ${section.instruction}`)
        .join("\n"),
    },
    {
      title: "Constraints",
      body: [
        `Target about ${totalWords} words in total — roughly ${Math.max(1, Math.round(readMinutes))} minutes to read.`,
        "Every claim about current behaviour must be traceable to something I told you. Mark anything you inferred with [ASSUMPTION].",
        "No numbers you were not given: no latencies, throughput, cost, error rates or team sizes. Write [MEASURE] where a number is needed.",
        "Prose over bullet soup: bullets only for lists that are genuinely enumerable.",
        "If a section cannot be written from what I gave you, write the heading and list the exact questions you need answered.",
      ].join("\n"),
    },
    {
      title: "Output format",
      body: "Markdown with one H2 per section in the order listed. End with a 'Questions for the author' list. No preamble before the title.",
    },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");

  return {
    prompt,
    sections,
    outline,
    totalWords,
    readMinutes,
    reviewMinutes,
    completeness,
    sectionCount: outline.length,
    goalCount: goalList.length,
    nonGoalCount: nonGoalList.length,
    alternativeCount: altList.length,
    depthLabel: depth.label,
    audienceLabel: audience.label,
    promptChars: prompt.length,
  };
}
