/**
 * Writing model picker — a transparent weighted-scoring rubric.
 *
 * Pure module: no React, no DOM, no network, no clock.
 *
 * Each option is a way of getting writing done, rated 0-5 per criterion on
 * structural properties that hold across model releases: whether it can draft
 * at all, whether it can look facts up at answer time, whether the weights are
 * yours, whether it runs offline, and how it is billed. These are not benchmark
 * scores and no ranking of named products is implied.
 */

export const CRITERIA = [
  { id: "longForm", label: "Coherence over long pieces" },
  { id: "grounding", label: "Current facts and citations" },
  { id: "voice", label: "Matching a style guide or your voice" },
  { id: "ideation", label: "Generating angles and ideas" },
  { id: "editing", label: "Precise line editing" },
  { id: "multilingual", label: "Working in several languages" },
  { id: "privacy", label: "Keeping drafts off third-party servers" },
  { id: "offline", label: "Working without a network" },
  { id: "cost", label: "Low running cost" },
  { id: "throughput", label: "Volume and speed" },
  { id: "controls", label: "Review, audit and brand controls" },
];

export const MAX_CRITERION_SCORE = 5;

export const OPTIONS = [
  {
    id: "frontier",
    name: "Frontier hosted model",
    examples: "A top-tier assistant used through its app or API",
    canDraft: true,
    requiresNetwork: true,
    openWeights: false,
    liveGrounding: false,
    summary:
      "The strongest long-form writing and the best instruction-following, billed per token, with no setup.",
    scores: {
      longForm: 5,
      grounding: 2,
      voice: 4,
      ideation: 5,
      editing: 4,
      multilingual: 5,
      privacy: 2,
      offline: 0,
      cost: 2,
      throughput: 3,
      controls: 3,
    },
  },
  {
    id: "grounded",
    name: "Frontier model with search or retrieval",
    examples: "The same class of model wired to web search or your document store",
    canDraft: true,
    requiresNetwork: true,
    openWeights: false,
    liveGrounding: true,
    summary:
      "Looks facts up at answer time and can cite them, at the cost of some speed and a longer prompt.",
    scores: {
      longForm: 4,
      grounding: 5,
      voice: 4,
      ideation: 4,
      editing: 3,
      multilingual: 5,
      privacy: 2,
      offline: 0,
      cost: 2,
      throughput: 2,
      controls: 3,
    },
  },
  {
    id: "fast-midtier",
    name: "Fast mid-tier hosted model",
    examples: "A smaller, cheaper hosted model used for high-volume rewriting",
    canDraft: true,
    requiresNetwork: true,
    openWeights: false,
    liveGrounding: false,
    summary:
      "Several times cheaper per token and noticeably faster — good for bulk edits, product copy and summaries.",
    scores: {
      longForm: 3,
      grounding: 2,
      voice: 3,
      ideation: 3,
      editing: 4,
      multilingual: 4,
      privacy: 2,
      offline: 0,
      cost: 4,
      throughput: 5,
      controls: 3,
    },
  },
  {
    id: "open-selfhost",
    name: "Open-weight model you host",
    examples: "Downloadable weights served on your own hardware or private cloud",
    canDraft: true,
    requiresNetwork: false,
    openWeights: true,
    liveGrounding: false,
    summary:
      "Manuscripts never leave your network and the model can be fine-tuned on your back catalogue to hold a house voice.",
    scores: {
      longForm: 3,
      grounding: 2,
      voice: 4,
      ideation: 3,
      editing: 3,
      multilingual: 3,
      privacy: 5,
      offline: 5,
      cost: 3,
      throughput: 3,
      controls: 5,
    },
  },
  {
    id: "local-small",
    name: "Small model on your own device",
    examples: "A quantised model in a local runner on a laptop",
    canDraft: true,
    requiresNetwork: false,
    openWeights: true,
    liveGrounding: false,
    summary:
      "Free at the margin and completely private, but it loses the thread on anything longer than a few hundred words.",
    scores: {
      longForm: 1,
      grounding: 1,
      voice: 2,
      ideation: 2,
      editing: 3,
      multilingual: 2,
      privacy: 5,
      offline: 5,
      cost: 5,
      throughput: 2,
      controls: 4,
    },
  },
  {
    id: "style-checker",
    name: "Dedicated grammar and style checker",
    examples: "A rule-and-model editing tool that flags issues instead of rewriting the piece",
    canDraft: false,
    requiresNetwork: true,
    openWeights: false,
    liveGrounding: false,
    summary:
      "Applies a style guide consistently and leaves your sentences yours — but it cannot draft or ideate.",
    scores: {
      longForm: 1,
      grounding: 1,
      voice: 3,
      ideation: 0,
      editing: 5,
      multilingual: 2,
      privacy: 3,
      offline: 2,
      cost: 4,
      throughput: 4,
      controls: 4,
    },
  },
];

/** Primary job, and the criteria weights it sets. */
export const TASKS = [
  {
    id: "draft",
    label: "Draft new pieces from a brief",
    needsGeneration: true,
    weights: { longForm: 3, ideation: 2, editing: 1, voice: 1 },
  },
  {
    id: "edit",
    label: "Edit and tighten existing drafts",
    needsGeneration: false,
    weights: { editing: 3, voice: 2, longForm: 1 },
  },
  {
    id: "ideate",
    label: "Generate angles, outlines and headlines",
    needsGeneration: true,
    weights: { ideation: 3, longForm: 1 },
  },
  {
    id: "research",
    label: "Write pieces that hinge on current facts",
    needsGeneration: true,
    weights: { grounding: 3, longForm: 2, editing: 1 },
  },
  {
    id: "localise",
    label: "Translate and localise existing copy",
    needsGeneration: true,
    weights: { multilingual: 3, editing: 2, voice: 1 },
  },
];

/** Typical piece length, added on top of the task's long-form weight. */
export const LENGTHS = [
  { id: "short", label: "Short — posts, emails, product copy", longFormBonus: 0 },
  { id: "medium", label: "Medium — articles of 800-2,000 words", longFormBonus: 1 },
  { id: "long", label: "Long — reports, chapters, whitepapers", longFormBonus: 2 },
];

/** How much the piece depends on facts that must be right and current. */
export const FACT_LEVELS = [
  { id: "none", label: "Opinion or creative work", grounding: 0 },
  { id: "some", label: "Some checkable claims", grounding: 1 },
  { id: "high", label: "Cited facts, figures or news", grounding: 3 },
];

/** Confidentiality posture. The strictest level is a hard constraint. */
export const PRIVACY_LEVELS = [
  { id: "public", label: "Public or marketing copy", privacy: 0, controls: 0, offline: 0 },
  { id: "internal", label: "Internal or client-confidential", privacy: 2, controls: 1, offline: 0 },
  { id: "no-egress", label: "Must stay inside our own systems", privacy: 3, controls: 2, offline: 0 },
  { id: "offline", label: "Offline only — nothing leaves the device", privacy: 3, controls: 2, offline: 3 },
];

/** How much you produce. Sets throughput weight. */
export const VOLUMES = [
  { id: "occasional", label: "A few pieces a week", throughput: 0 },
  { id: "daily", label: "Something most days", throughput: 1 },
  { id: "pipeline", label: "A publishing pipeline — dozens a day", throughput: 3 },
];

export const MAX_SLIDER = 3;

const byId = (list, id) => list.find((item) => item.id === id);
const round1 = (value) => Math.round(value * 10) / 10;

/** Importance weight (0-3) per criterion, derived from the answers. */
export function weightsFromInput(input) {
  const task = byId(TASKS, input.task);
  const length = byId(LENGTHS, input.length);
  const facts = byId(FACT_LEVELS, input.factLevel);
  const privacy = byId(PRIVACY_LEVELS, input.privacy);
  const volume = byId(VOLUMES, input.volume);
  const clampSlider = (value) => Math.min(MAX_SLIDER, Math.max(0, Math.round(Number(value))));

  const base = CRITERIA.reduce((map, criterion) => {
    map[criterion.id] = 0;
    return map;
  }, {});

  Object.entries(task.weights).forEach(([key, value]) => {
    base[key] = value;
  });

  base.longForm = Math.min(MAX_SLIDER, base.longForm + length.longFormBonus);
  base.grounding = Math.max(base.grounding, facts.grounding);
  base.voice = Math.max(base.voice, clampSlider(input.voiceImportance));
  base.privacy = privacy.privacy;
  base.offline = privacy.offline;
  base.controls = privacy.controls;
  base.throughput = volume.throughput;
  base.cost = clampSlider(input.costSensitivity);
  if (input.multilingual) base.multilingual = Math.max(base.multilingual, 3);

  return base;
}

/**
 * Rank the options.
 *
 * Score = sum(weight x rating) / sum(weight x 5) x 100.
 *
 * @returns {object|{error: string}}
 */
export function pickWritingModel(input = {}) {
  const task = byId(TASKS, input.task);
  if (!task) return { error: "Choose what you mostly need help with." };
  if (!byId(LENGTHS, input.length)) return { error: "Choose a typical piece length." };
  if (!byId(FACT_LEVELS, input.factLevel)) return { error: "Choose how fact-dependent the writing is." };
  if (!byId(PRIVACY_LEVELS, input.privacy)) return { error: "Choose a confidentiality level." };
  if (!byId(VOLUMES, input.volume)) return { error: "Choose how much you publish." };

  for (const [key, label] of [
    ["voiceImportance", "Voice importance"],
    ["costSensitivity", "Cost sensitivity"],
  ]) {
    const value = Number(input[key]);
    if (!Number.isFinite(value) || value < 0 || value > MAX_SLIDER) {
      return { error: `${label} must be between 0 and ${MAX_SLIDER}.` };
    }
  }

  const weights = weightsFromInput(input);
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (weightTotal <= 0) {
    return { error: "Every priority is zero — raise at least one so the options can be compared." };
  }

  const offlineOnly = input.privacy === "offline";
  const disqualified = [];
  const eligible = [];

  for (const option of OPTIONS) {
    const reasons = [];
    if (task.needsGeneration && !option.canDraft) {
      reasons.push("cannot write new text, only correct text you already have");
    }
    if (offlineOnly && option.requiresNetwork) {
      reasons.push("needs a network connection, which an offline-only rule excludes");
    }
    if (reasons.length > 0) disqualified.push({ ...option, reasons });
    else eligible.push(option);
  }

  if (eligible.length === 0) {
    return { error: "No option matches those constraints — relax the offline or drafting requirement." };
  }

  const maxPossible = weightTotal * MAX_CRITERION_SCORE;

  const ranked = eligible
    .map((option) => {
      const contributions = CRITERIA.map((criterion) => {
        const weight = weights[criterion.id];
        const rating = option.scores[criterion.id];
        return { id: criterion.id, label: criterion.label, weight, rating, points: weight * rating };
      });
      const points = contributions.reduce((sum, row) => sum + row.points, 0);
      return {
        ...option,
        points,
        score: round1((points / maxPossible) * 100),
        contributions,
        strengths: contributions
          .filter((row) => row.weight > 0 && row.rating >= 4)
          .sort((a, b) => b.points - a.points)
          .slice(0, 2)
          .map((row) => row.label),
        weaknesses: contributions
          .filter((row) => row.weight >= 2 && row.rating <= 2)
          .sort((a, b) => b.weight - a.weight || a.rating - b.rating)
          .slice(0, 2)
          .map((row) => row.label),
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  const top = ranked[0];
  const runnerUp = ranked[1] ?? null;
  const margin = runnerUp ? round1(top.score - runnerUp.score) : null;

  // A specific, checkable warning rather than generic advice.
  const notes = [];
  if (weights.grounding >= 2 && !top.liveGrounding) {
    notes.push(
      "This option answers from training data alone, so verify every date, figure and quotation against a source."
    );
  }
  if (weights.voice >= 2 && top.scores.voice <= 3) {
    notes.push("Give it two or three samples of the target voice — it will not match a house style unprompted.");
  }

  return {
    weights,
    weightTotal,
    ranked,
    top,
    runnerUp,
    margin,
    close: margin !== null && margin < 5,
    disqualified,
    notes,
  };
}

/** Plain-text export. Pure string builder. */
export function resultToText(result) {
  if (!result || result.error) return "";
  const lines = [
    "Writing Model Picker",
    `Best fit: ${result.top.name} — ${result.top.score}/100`,
    `Examples: ${result.top.examples}`,
    "",
    "Ranking:",
    ...result.ranked.map((option, index) => `${index + 1}. ${option.name} — ${option.score}/100`),
  ];
  if (result.notes.length > 0) lines.push("", "Notes:", ...result.notes.map((note) => `- ${note}`));
  if (result.disqualified.length > 0) {
    lines.push("", "Ruled out:");
    result.disqualified.forEach((option) => lines.push(`- ${option.name}: ${option.reasons.join("; ")}`));
  }
  return lines.join("\n");
}
