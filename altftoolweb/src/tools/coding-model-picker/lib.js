/**
 * Coding model picker — a transparent weighted-scoring rubric.
 *
 * Pure module: no React, no DOM, no network, no clock.
 *
 * The options below are deployment archetypes, not brand rankings. Each one is
 * rated 0-5 per criterion on *structural* properties that are verifiable and
 * stable — whether the weights are downloadable, whether it runs without a
 * network, how it is billed, how much setup it needs — rather than on benchmark
 * scores, which change with every release. Nothing here is a benchmark claim.
 */

/** Criteria the rubric scores against. */
export const CRITERIA = [
  { id: "reasoning", label: "Multi-file reasoning and refactors" },
  { id: "longContext", label: "Holding a large codebase in context" },
  { id: "privacy", label: "Keeping source code off third-party servers" },
  { id: "offline", label: "Working without a network" },
  { id: "cost", label: "Low running cost" },
  { id: "setup", label: "Low setup and maintenance effort" },
  { id: "latency", label: "Fast inline responses" },
  { id: "languageBreadth", label: "Coverage of less common languages" },
  { id: "customisation", label: "Ability to fine-tune or adapt the model" },
  { id: "compliance", label: "Audit trail and enterprise controls" },
];

export const MAX_CRITERION_SCORE = 5;

/**
 * Deployment options.
 * `requiresNetwork` and `openWeights` drive the hard constraints; the numbers
 * are the 0-5 ratings described above.
 */
export const OPTIONS = [
  {
    id: "frontier-api",
    name: "Frontier hosted model",
    examples: "Claude, GPT or Gemini through an API key, IDE extension or agent CLI",
    requiresNetwork: true,
    openWeights: false,
    summary:
      "The strongest general coding models, billed per token, with the largest context windows and the least setup.",
    scores: {
      reasoning: 5,
      longContext: 5,
      privacy: 2,
      offline: 0,
      cost: 2,
      setup: 5,
      latency: 3,
      languageBreadth: 5,
      customisation: 2,
      compliance: 3,
    },
  },
  {
    id: "frontier-tenant",
    name: "Frontier model in your cloud tenant",
    examples: "The same class of model via Bedrock, Vertex AI or Azure AI Foundry in your own account",
    requiresNetwork: true,
    openWeights: false,
    summary:
      "Frontier capability inside your cloud account, with contractual no-training terms, private networking and existing audit tooling.",
    scores: {
      reasoning: 5,
      longContext: 5,
      privacy: 4,
      offline: 0,
      cost: 2,
      setup: 2,
      latency: 3,
      languageBreadth: 5,
      customisation: 3,
      compliance: 5,
    },
  },
  {
    id: "open-selfhost",
    name: "Open-weight model on your own GPUs",
    examples: "Llama, Qwen, DeepSeek, Mistral or gpt-oss weights served from your own hardware",
    requiresNetwork: false,
    openWeights: true,
    summary:
      "Weights you control on hardware you own: no code leaves the network, and you can fine-tune, but you own the ops.",
    scores: {
      reasoning: 3,
      longContext: 3,
      privacy: 5,
      offline: 5,
      cost: 3,
      setup: 1,
      latency: 4,
      languageBreadth: 3,
      customisation: 5,
      compliance: 5,
    },
  },
  {
    id: "open-hosted",
    name: "Open-weight model on an inference provider",
    examples: "The same open weights served per token by a managed inference platform",
    requiresNetwork: true,
    openWeights: true,
    summary:
      "Cheaper per token than frontier models and portable — you can move the same weights in-house later without rewriting prompts.",
    scores: {
      reasoning: 3,
      longContext: 3,
      privacy: 3,
      offline: 0,
      cost: 4,
      setup: 4,
      latency: 3,
      languageBreadth: 3,
      customisation: 4,
      compliance: 3,
    },
  },
  {
    id: "local-small",
    name: "Small quantised model on your laptop",
    examples: "A 7B-14B quantised model in a local runner such as Ollama or LM Studio",
    requiresNetwork: false,
    openWeights: true,
    summary:
      "Free at the margin, fully offline and instant for completions, but weak on long files and multi-step refactors.",
    scores: {
      reasoning: 1,
      longContext: 1,
      privacy: 5,
      offline: 5,
      cost: 5,
      setup: 3,
      latency: 5,
      languageBreadth: 2,
      customisation: 3,
      compliance: 4,
    },
  },
];

/** The kind of work you mostly do. Sets reasoning / latency importance. */
export const TASK_TYPES = [
  { id: "boilerplate", label: "Boilerplate and inline completion", reasoning: 1, latency: 3 },
  { id: "tests", label: "Tests and small functions", reasoning: 2, latency: 2 },
  { id: "feature", label: "Whole features across a few files", reasoning: 3, latency: 1 },
  { id: "refactor", label: "Large refactors and debugging", reasoning: 3, latency: 1 },
];

/** Repository scale. Sets long-context importance. */
export const REPO_SIZES = [
  { id: "small", label: "Small (a few thousand lines)", longContext: 1 },
  { id: "medium", label: "Medium service or app", longContext: 2 },
  { id: "monorepo", label: "Large monorepo", longContext: 3 },
];

/** Language mix. Sets breadth importance. */
export const LANGUAGE_TIERS = [
  { id: "mainstream", label: "Mainstream (Python, JS/TS, Java, Go)", languageBreadth: 1 },
  { id: "modern", label: "Less common (Rust, Kotlin, Swift, Scala, Elixir)", languageBreadth: 2 },
  { id: "niche", label: "Niche or legacy (COBOL, ABAP, Verilog, Delphi)", languageBreadth: 3 },
];

/** Privacy posture. The strictest level is a hard constraint, not a weight. */
export const PRIVACY_LEVELS = [
  { id: "open", label: "Public or sample code", privacy: 0, compliance: 0, offline: 0 },
  { id: "no-training", label: "Company code, must not be trained on", privacy: 2, compliance: 1, offline: 0 },
  { id: "no-egress", label: "Code must stay in our own cloud account", privacy: 3, compliance: 2, offline: 0 },
  { id: "air-gapped", label: "Air-gapped — nothing leaves the network", privacy: 3, compliance: 3, offline: 3 },
];

/** How much setup and operations work you are willing to take on. */
export const SETUP_TOLERANCES = [
  { id: "none", label: "Needs to work today", setup: 3 },
  { id: "some", label: "Can spend a day wiring it up", setup: 2 },
  { id: "high", label: "Happy to run our own inference stack", setup: 0 },
];

export const MAX_COST_SENSITIVITY = 3;

const byId = (list, id) => list.find((item) => item.id === id);

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Turn the answers into an importance weight (0-3) per criterion.
 * Exported so the UI can show exactly what drove the score.
 */
export function weightsFromInput(input) {
  const task = byId(TASK_TYPES, input.taskType);
  const repo = byId(REPO_SIZES, input.repoSize);
  const language = byId(LANGUAGE_TIERS, input.language);
  const privacy = byId(PRIVACY_LEVELS, input.privacy);
  const setup = byId(SETUP_TOLERANCES, input.setupTolerance);
  const cost = Math.min(MAX_COST_SENSITIVITY, Math.max(0, Math.round(Number(input.costSensitivity))));

  return {
    reasoning: task.reasoning,
    longContext: repo.longContext,
    privacy: privacy.privacy,
    offline: Math.max(privacy.offline, input.offlineWork ? 2 : 0),
    cost,
    setup: setup.setup,
    latency: task.latency,
    languageBreadth: language.languageBreadth,
    customisation: input.needFineTune ? 3 : 0,
    compliance: Math.max(privacy.compliance, input.regulated ? 3 : 0),
  };
}

/**
 * Rank the options.
 *
 * Score = sum(weight x optionScore) / sum(weight x 5) x 100, so a 100 means the
 * option is rated 5 on every criterion you said mattered.
 *
 * @returns {{ranked: Array, top: object, weights: object, disqualified: Array}|{error: string}}
 */
export function pickCodingModel(input = {}) {
  if (!byId(TASK_TYPES, input.taskType)) return { error: "Choose the kind of work you do." };
  if (!byId(REPO_SIZES, input.repoSize)) return { error: "Choose your repository size." };
  if (!byId(LANGUAGE_TIERS, input.language)) return { error: "Choose your language mix." };
  if (!byId(PRIVACY_LEVELS, input.privacy)) return { error: "Choose a privacy requirement." };
  if (!byId(SETUP_TOLERANCES, input.setupTolerance)) return { error: "Choose a setup tolerance." };

  const rawCost = Number(input.costSensitivity);
  if (!Number.isFinite(rawCost) || rawCost < 0 || rawCost > MAX_COST_SENSITIVITY) {
    return { error: `Cost sensitivity must be between 0 and ${MAX_COST_SENSITIVITY}.` };
  }

  const weights = weightsFromInput(input);
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (weightTotal <= 0) {
    return {
      error: "Every priority is set to zero — raise at least one so the options can be compared.",
    };
  }

  const airGapped = input.privacy === "air-gapped";
  const disqualified = [];
  const eligible = [];

  for (const option of OPTIONS) {
    const reasons = [];
    if (airGapped && option.requiresNetwork) {
      reasons.push("needs a network connection, which an air-gapped policy rules out");
    }
    if (input.needFineTune && !option.openWeights) {
      reasons.push("does not give you weights you can fine-tune yourself");
    }
    if (reasons.length > 0) {
      disqualified.push({ ...option, reasons });
    } else {
      eligible.push(option);
    }
  }

  if (eligible.length === 0) {
    return {
      error:
        "No option survives those constraints. Air-gapped work with fine-tuning needs open weights on your own hardware — relax one requirement.",
    };
  }

  const maxPossible = weightTotal * MAX_CRITERION_SCORE;

  const ranked = eligible
    .map((option) => {
      const contributions = CRITERIA.map((criterion) => {
        const weight = weights[criterion.id];
        const rating = option.scores[criterion.id];
        return {
          id: criterion.id,
          label: criterion.label,
          weight,
          rating,
          points: weight * rating,
        };
      });
      const points = contributions.reduce((sum, row) => sum + row.points, 0);
      const strengths = contributions
        .filter((row) => row.weight > 0 && row.rating >= 4)
        .sort((a, b) => b.points - a.points)
        .slice(0, 2)
        .map((row) => row.label);
      const weaknesses = contributions
        .filter((row) => row.weight >= 2 && row.rating <= 2)
        .sort((a, b) => b.weight - a.weight || a.rating - b.rating)
        .slice(0, 2)
        .map((row) => row.label);
      return {
        ...option,
        points,
        score: round1((points / maxPossible) * 100),
        contributions,
        strengths,
        weaknesses,
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  const top = ranked[0];
  const runnerUp = ranked[1] ?? null;
  const margin = runnerUp ? round1(top.score - runnerUp.score) : null;

  return {
    weights,
    weightTotal,
    ranked,
    top,
    runnerUp,
    margin,
    close: margin !== null && margin < 5,
    disqualified,
  };
}

/** Plain-text export of a recommendation. Pure string builder. */
export function resultToText(result) {
  if (!result || result.error) return "";
  const lines = [
    "Coding Model Picker",
    `Best fit: ${result.top.name} — ${result.top.score}/100`,
    `Examples: ${result.top.examples}`,
    "",
    "Ranking:",
    ...result.ranked.map((option, index) => `${index + 1}. ${option.name} — ${option.score}/100`),
  ];
  if (result.disqualified.length > 0) {
    lines.push("", "Ruled out:");
    result.disqualified.forEach((option) => {
      lines.push(`- ${option.name}: ${option.reasons.join("; ")}`);
    });
  }
  return lines.join("\n");
}
