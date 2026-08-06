/**
 * Product-manager assistant system prompt composer.
 *
 * Pure string assembly: identical configuration always yields an identical
 * prompt. Section order — identity, product context, deliverables,
 * prioritisation, working rules — follows the instruction-prompt layout used
 * across this tool family.
 *
 * Framework sources encoded in the option text:
 * - User-story template "As a …, I want …, so that …" is the Connextra
 *   format; quality bar is Bill Wake's INVEST checklist; acceptance criteria
 *   use Gherkin's Given/When/Then.
 * - RICE (Reach × Impact × Confidence ÷ Effort) is Intercom's prioritisation
 *   framework; ICE is Sean Ellis's variant; MoSCoW comes from DSDM; WSJF
 *   (Cost of Delay ÷ job size) comes from SAFe/Reinertsen.
 */

/** OpenAI's rule of thumb: roughly 4 characters per token for English prose. */
export const CHARS_PER_TOKEN = 4;

/** Warn-only budget: the system prompt is prepended to every request. */
export const DEFAULT_TOKEN_BUDGET = 900;

export const DELIVERABLE_OPTIONS = {
  prd: "Product specs / PRDs with fixed sections: problem, evidence, goals and non-goals, success metrics, user flows, open questions and out-of-scope list.",
  userStories:
    "User stories in the Connextra format ('As a <user>, I want <capability>, so that <benefit>'), each meeting the INVEST checklist, with Given/When/Then acceptance criteria.",
  tradeoffs:
    "Tradeoff analyses: lay out 2-4 real options against explicit criteria, state the costs of each, then make one recommendation and say what would change it.",
  prioritisation:
    "Prioritisation passes over a backlog using the chosen scoring framework, showing the score arithmetic for every item.",
  okrs: "OKRs: qualitative objectives with 2-4 measurable key results each, scored 0.0-1.0, never a task list dressed as key results.",
  releaseNotes:
    "Release notes and stakeholder updates that lead with user impact, not implementation detail.",
};

export const PRIORITISATION_FRAMEWORKS = {
  rice: {
    label: "RICE (Intercom)",
    line: "Prioritise with RICE: score = (Reach × Impact × Confidence) ÷ Effort. Reach in users per period, Impact on a 0.25/0.5/1/2/3 scale, Confidence as 50/80/100%, Effort in person-months. Show the arithmetic for every item.",
  },
  ice: {
    label: "ICE (Sean Ellis)",
    line: "Prioritise with ICE: score = Impact × Confidence × Ease, each rated 1-10. Show the three ratings and the product for every item.",
  },
  moscow: {
    label: "MoSCoW (DSDM)",
    line: "Prioritise with MoSCoW: sort items into Must have, Should have, Could have and Won't have (this time), and justify every Must in one sentence.",
  },
  wsjf: {
    label: "WSJF (SAFe)",
    line: "Prioritise with WSJF: score = Cost of Delay ÷ job size, where Cost of Delay = user-business value + time criticality + risk reduction (relative Fibonacci estimates). Show the components.",
  },
};

export const RIGOR_RULES = {
  evidenceFirst:
    "Every claim about users or the market is either backed by data the user provided or labelled 'Assumption:'. Never present an assumption as a fact.",
  askDontInvent:
    "Never invent user research, metrics, quotes or competitor facts. If context is missing, ask for it or leave an explicit open question.",
  problemFirst:
    "State and size the problem before proposing any solution. If the request starts from a solution, first write the problem it implies and ask if that is right.",
  nonGoals:
    "Every spec names what is out of scope. A spec with no non-goals section is unfinished.",
  measurableSuccess:
    "Every spec and OKR defines success as a measurable number with a baseline and a target date, not 'improve' or 'increase'.",
  smallestSlice:
    "Always propose the smallest slice that tests the riskiest assumption before the full build.",
  oneRecommendation:
    "Analyses end with one recommendation and its main risk — never an unranked list of options.",
};

const clean = (value) => String(value ?? "").trim();

/** Rough token estimate from the 4-characters-per-token rule of thumb. */
export function estimateTokens(text) {
  const chars = String(text ?? "").length;
  return { chars, tokens: Math.ceil(chars / CHARS_PER_TOKEN) };
}

/**
 * Build the PM-assistant system prompt.
 *
 * @param {object} config
 * @returns {{prompt: string, sections: Array, tokens: object, warnings: string[], completeness: number}|{error: string}}
 */
export function buildPmPrompt(config = {}) {
  const product = clean(config.product);
  if (product === "") {
    return { error: "Describe the product — without it every spec and story will be generic." };
  }

  const users = clean(config.users);
  const businessContext = clean(config.businessContext);
  const metricsNotes = clean(config.metricsNotes);
  const styleNotes = clean(config.styleNotes);

  const deliverables = Array.isArray(config.deliverables)
    ? config.deliverables.filter((key) => DELIVERABLE_OPTIONS[key])
    : [];
  if (deliverables.length === 0) {
    return { error: "Pick at least one deliverable — the assistant needs a job to do." };
  }

  const frameworkKey = PRIORITISATION_FRAMEWORKS[config.framework] ? config.framework : "rice";

  const rules = Array.isArray(config.rigorRules)
    ? config.rigorRules.filter((key) => RIGOR_RULES[key])
    : [];

  // Warn-only budget (see header comment): an empty, zero or otherwise invalid
  // budget must never hard-fail the whole prompt — it should silently fall
  // back to the default and only surface as a warning below.
  const budgetInput = Number(config.tokenBudget);
  const budgetProvided = config.tokenBudget !== undefined && config.tokenBudget !== null && config.tokenBudget !== "";
  const budgetIsValid = Number.isFinite(budgetInput) && budgetInput > 0;
  const budget = budgetIsValid ? budgetInput : DEFAULT_TOKEN_BUDGET;

  const sections = [];

  const identity = [
    `You are a product manager's assistant for ${product}.`,
    users ? `The users are ${users}.` : "",
    "You think in problems, evidence and tradeoffs. You are concrete, sceptical of your own ideas, and you write documents a busy engineer will actually read.",
  ]
    .filter(Boolean)
    .join(" ");
  sections.push({ id: "identity", title: "Role", body: identity });

  const context = [];
  if (businessContext) context.push(`- Business context: ${businessContext}`);
  if (metricsNotes) context.push(`- Metrics that matter: ${metricsNotes}`);
  if (context.length > 0) {
    sections.push({ id: "context", title: "Product context", body: context.join("\n") });
  }

  sections.push({
    id: "deliverables",
    title: "What you produce",
    body: deliverables.map((key) => `- ${DELIVERABLE_OPTIONS[key]}`).join("\n"),
  });

  if (deliverables.includes("prioritisation")) {
    sections.push({
      id: "framework",
      title: "Prioritisation framework",
      body: `- ${PRIORITISATION_FRAMEWORKS[frameworkKey].line}`,
    });
  }

  const working = rules.map((key) => `- ${RIGOR_RULES[key]}`);
  if (styleNotes) working.push(`- ${styleNotes}`);
  if (working.length > 0) {
    sections.push({ id: "rules", title: "Working rules", body: working.join("\n") });
  }

  const prompt = sections
    .map((section) => (section.id === "identity" ? section.body : `## ${section.title}\n${section.body}`))
    .join("\n\n");

  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (budgetProvided && !budgetIsValid) {
    warnings.push(
      `The token budget must be a positive number, so ${DEFAULT_TOKEN_BUDGET} tokens (the default) was used instead.`,
    );
  }
  if (rules.length === 0) {
    warnings.push("No working rules selected. At minimum, forbid invented user data and require assumptions to be labelled.");
  } else if (!rules.includes("askDontInvent")) {
    warnings.push("The no-invented-data rule is off — PM assistants readily fabricate plausible metrics and quotes.");
  }
  if (!users) warnings.push("No users described — stories and specs will guess who they are for.");
  if (!metricsNotes && (deliverables.includes("prd") || deliverables.includes("okrs"))) {
    warnings.push("Specs or OKRs are enabled but no metrics are named — success criteria will be invented.");
  }
  if (tokens.tokens > budget) {
    warnings.push(`The prompt is about ${tokens.tokens} tokens, above your ${budget}-token budget.`);
  }

  const filled = [
    product,
    users,
    businessContext,
    metricsNotes,
    deliverables.length > 0 ? "y" : "",
    rules.length > 0 ? "y" : "",
  ].filter((value) => clean(value) !== "").length;
  const completeness = Math.round((filled / 6) * 100);

  return { prompt, sections, tokens, warnings, completeness, frameworkKey };
}
