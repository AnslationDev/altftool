/**
 * Design critique planner + vague-feedback checker.
 *
 * The structures below are the established critique formats:
 *  - "I like / I wish / What if" comes from the Stanford d.school feedback format.
 *  - "Rose, Thorn, Bud" is the standard workshop variant separating what works, what hurts and
 *    what has potential.
 *  - "Plus / Delta" is the two-column retrospective format applied to an artefact.
 *  - Objective-based critique follows the discipline described in Discussing Design (Connor and
 *    Irizarry): a critique analyses a design against its stated objectives, which is what makes
 *    it different from a reaction or a preference.
 * Prompts about interface behaviour lean on Nielsen's usability heuristics (visibility of system
 * status, error prevention, recognition over recall) and on WCAG 2.x contrast minimums of 4.5:1
 * for normal text and 3:1 for large text and UI components.
 *
 * Pure module: no DOM, no React, no clock.
 */

/** WCAG 2.x AA minimums quoted in the accessibility prompts. */
export const AA_NORMAL_TEXT_RATIO = 4.5;
export const AA_LARGE_TEXT_RATIO = 3;

/** Each round carries a weight; weights within a framework sum to 1. */
export const FRAMEWORKS = {
  objective: {
    label: "Objective-based critique",
    summary: "Analyse the work against the goals it was made to meet, not against personal taste.",
    rounds: [
      { title: "Restate the objective and the constraints", weight: 0.15, detail: "The designer states who this is for, what it must achieve, and what was fixed for them. Nobody critiques before this is on the wall." },
      { title: "Silent review", weight: 0.2, detail: "Everyone reviews alone and writes notes. Silent-first stops the loudest voice from framing the whole session." },
      { title: "Round one: does it meet the objective?", weight: 0.3, detail: "Each observation names the element, the effect it has, and the objective it supports or undermines." },
      { title: "Round two: open questions and trade-offs", weight: 0.25, detail: "Ask about the decisions you cannot see: what was tried, what was rejected, what is still uncertain." },
      { title: "Designer summarises and owns next steps", weight: 0.1, detail: "The designer reads back what they heard and says what they will act on. Not everything has to be acted on." },
    ],
  },
  likeWishWhatIf: {
    label: "I like / I wish / What if",
    summary: "Fast, low-threat structure that still separates observation from suggestion.",
    rounds: [
      { title: "Set-up and objective", weight: 0.15, detail: "Designer gives context and says what kind of feedback is useful right now." },
      { title: "Silent review", weight: 0.15, detail: "Everyone writes their own notes before anyone speaks." },
      { title: "I like…", weight: 0.2, detail: "What is working, and specifically why it works. Naming strengths stops the team accidentally deleting them in the next round." },
      { title: "I wish…", weight: 0.3, detail: "What is not working, phrased as an effect rather than a verdict." },
      { title: "What if…", weight: 0.2, detail: "Speculative alternatives, held loosely. These are prompts for the designer, not instructions." },
    ],
  },
  roseThornBud: {
    label: "Rose / Thorn / Bud",
    summary: "Separates what works, what actively hurts, and what has potential but is not there yet.",
    rounds: [
      { title: "Set-up and objective", weight: 0.15, detail: "State the goal, the audience and the stage of the work." },
      { title: "Silent review", weight: 0.15, detail: "Individual notes first, in writing." },
      { title: "Rose — what is working", weight: 0.2, detail: "Strengths worth protecting through the next round of changes." },
      { title: "Thorn — what is getting in the way", weight: 0.3, detail: "Problems, each tied to who it affects and how." },
      { title: "Bud — what has potential", weight: 0.2, detail: "Ideas that are half-formed but worth developing rather than cutting." },
    ],
  },
  plusDelta: {
    label: "Plus / Delta",
    summary: "Two columns, minimum ceremony — good for short recurring reviews.",
    rounds: [
      { title: "Objective and stage", weight: 0.2, detail: "One minute: what this is and what feedback helps." },
      { title: "Plus — keep doing this", weight: 0.3, detail: "Specific things that work and why." },
      { title: "Delta — change this", weight: 0.35, detail: "Specific changes, each with the reason attached." },
      { title: "Agree the next step", weight: 0.15, detail: "One or two changes the designer commits to trying." },
    ],
  },
};

export const STAGES = {
  concept: {
    label: "Early concept / wireframe",
    focus: ["structure", "content", "flow"],
    caution: "Do not critique typography, colour or polish at this stage — none of it is decided yet, and doing so buries the structural questions.",
  },
  midFidelity: {
    label: "Mid-fidelity / visual direction",
    focus: ["structure", "hierarchy", "typography", "colour", "content"],
    caution: "Interaction detail and edge cases are fair game, but pixel-level polish is still premature.",
  },
  preLaunch: {
    label: "High fidelity / pre-launch",
    focus: ["hierarchy", "typography", "colour", "states", "accessibility", "content", "responsive"],
    caution: "Structural rework is expensive now — flag it, but be honest about whether it is a this-release change or a next-release one.",
  },
};

/** Prompt bank, tagged by focus area so the stage filters what gets asked. */
export const PROMPTS = {
  structure: [
    "What is the single most important thing on this screen, and does the layout actually say so?",
    "If you removed the largest element, would the page still make sense? If yes, why is it the largest?",
    "Where does the eye land first, second and third — and is that the order the objective needs?",
  ],
  hierarchy: [
    "Which two elements are competing for the same level of attention, and which one should lose?",
    "Is spacing doing the grouping work, or are borders and boxes covering for spacing that is wrong?",
    "Does anything look clickable that is not, or look static when it is interactive?",
  ],
  typography: [
    "How many type sizes and weights are in use, and can any pair be merged without losing meaning?",
    "Does body copy sit in a comfortable measure — roughly 45 to 75 characters a line?",
    "Is line height loose enough for the longest paragraph, not just for the shortest label?",
  ],
  colour: [
    `Does body text clear the WCAG AA contrast minimum of ${AA_NORMAL_TEXT_RATIO}:1, and do large text and UI components clear ${AA_LARGE_TEXT_RATIO}:1?`,
    "Is any meaning carried by colour alone — status, errors, chart series — with no text or shape backing it up?",
    "Does this hold up in dark mode, and did anyone actually look?",
  ],
  states: [
    "What does this look like empty, with one item, and with an unrealistic amount of content?",
    "Where is the loading state, the error state and the success state — and has anyone designed them?",
    "What happens when the user's name is 40 characters long, or the price has no decimals?",
  ],
  accessibility: [
    "Can this be operated by keyboard alone, and is the focus order the same as the reading order?",
    "Does every control have a name a screen reader can announce, not just an icon?",
    "Does anything move, autoplay or flash, and is there a reduced-motion path?",
  ],
  content: [
    "Read the buttons out loud: does each label say what happens next, or does it say 'Submit'?",
    "Which sentence here is doing the persuading, and could a first-time reader repeat it back?",
    "What question does a sceptical user have at this point that the page does not answer?",
  ],
  flow: [
    "What did the user do immediately before this screen, and does it acknowledge that?",
    "What is the exit path if this is not what they wanted?",
    "How many steps are between intent and outcome, and which one could be removed?",
  ],
  responsive: [
    "How does this behave at 375 px wide, and does anything scroll sideways that should not?",
    "Are tap targets at least 44 px, and is anything important under the thumb-blocked area?",
    "Does the table, chart or wide element degrade gracefully or just overflow?",
  ],
};

export const ARTEFACTS = {
  landingPage: { label: "Landing / marketing page", extraFocus: ["content", "colour"], specific: ["Does the fold answer what this is, who it is for, and what to do next?", "Is the primary call to action repeated at the natural decision points, not just once?"] },
  appScreen: { label: "Product / app screen", extraFocus: ["states", "flow"], specific: ["Does the screen tell the user what the system is doing at every point?", "Can a user recover from their most likely mistake without support?"] },
  dashboard: { label: "Dashboard or report", extraFocus: ["states", "colour"], specific: ["Can someone answer the one question this dashboard exists for within five seconds?", "Is every chart the right form for its comparison, or is it a bar chart out of habit?"] },
  logo: { label: "Logo or wordmark", extraFocus: [], specific: ["Does it survive at 16 px and in one colour?", "Is it distinguishable from the three closest competitors when both are shrunk?"] },
  brand: { label: "Brand system", extraFocus: ["typography", "colour"], specific: ["Could a different designer apply this system correctly from the documentation alone?", "Which rule in the system will be the first one broken under deadline, and can it be made easier to follow?"] },
  email: { label: "Email template", extraFocus: ["content", "responsive"], specific: ["Does it still communicate with images blocked?", "Is the subject line and preview text designed, or left to whatever gets typed in?"] },
  illustration: { label: "Illustration or graphic", extraFocus: ["colour"], specific: ["Does the illustration carry meaning, or is it decoration occupying prime space?", "Does the style match the rest of the system, or is it a one-off nobody can extend?"] },
  deck: { label: "Presentation deck", extraFocus: ["content", "typography"], specific: ["Can each slide be understood in the six seconds before the speaker explains it?", "Is the smallest text on the slide readable from the back of the room?"] },
};

/** Filler adjectives and verdicts that carry no actionable information. */
export const VAGUE_TERMS = [
  "clean", "modern", "sleek", "pop", "fresh", "cool", "nice", "pretty", "ugly", "boring",
  "busy", "cluttered", "off", "weird", "meh", "elegant", "premium feel", "not feeling it",
  "make it better", "just simplify", "more engaging", "more professional", "wow factor",
  "i don't like", "i dont like", "i love", "i hate", "looks cheap", "needs more",
];

/** Words that show the feedback is anchored to a user, a goal or an observed effect. */
export const ANCHOR_TERMS = [
  "because", "so that", "user", "users", "reader", "customer", "objective", "goal",
  "task", "scan", "expect", "contrast", "hierarchy", "spacing", "label", "state",
  "mobile", "keyboard", "screen reader", "step", "compare", "first-time", "new user",
];

const MIN_DURATION_MINUTES = 10;
const MAX_DURATION_MINUTES = 240;
const MAX_PARTICIPANTS = 12;

/**
 * Split a duration across weighted rounds using the largest-remainder method so the
 * allocations always add up to exactly the duration.
 * Pure function.
 */
export function allocateMinutes(totalMinutes, weights) {
  if (!Array.isArray(weights) || weights.length === 0) return [];
  const raw = weights.map((weight) => totalMinutes * weight);
  const base = raw.map((value) => Math.floor(value));
  let remaining = totalMinutes - base.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  let cursor = 0;
  while (remaining > 0 && order.length > 0) {
    base[order[cursor % order.length].index] += 1;
    remaining -= 1;
    cursor += 1;
  }
  return base;
}

/**
 * Build a timed critique agenda plus the prompt set for the artefact and stage.
 * Pure function.
 *
 * @returns {{error: string} | {agenda: object[], prompts: object[], groundRules: string[],
 *   frameworkLabel: string, stageCaution: string, totalMinutes: number, promptCount: number}}
 */
export function buildCritiquePlan(input = {}) {
  const framework = FRAMEWORKS[String(input.framework ?? "").trim()];
  if (!framework) return { error: "Pick a critique framework." };

  const stage = STAGES[String(input.stage ?? "").trim()];
  if (!stage) return { error: "Pick the stage the work is at." };

  const artefact = ARTEFACTS[String(input.artefact ?? "").trim()];
  if (!artefact) return { error: "Pick what is being reviewed." };

  const totalMinutes = Number(input.durationMinutes);
  if (!Number.isFinite(totalMinutes) || totalMinutes < MIN_DURATION_MINUTES) {
    return { error: `A critique needs at least ${MIN_DURATION_MINUTES} minutes to be worth running.` };
  }
  if (totalMinutes > MAX_DURATION_MINUTES) {
    return { error: `Sessions over ${MAX_DURATION_MINUTES} minutes stop being useful — split it into two.` };
  }

  const participants = Number(input.participants);
  if (!Number.isFinite(participants) || participants < 2) {
    return { error: "A critique needs at least two people: the designer and one reviewer." };
  }
  if (participants > MAX_PARTICIPANTS) {
    return { error: `Above ${MAX_PARTICIPANTS} people a critique turns into a presentation. Run two smaller sessions.` };
  }

  const minutes = allocateMinutes(Math.round(totalMinutes), framework.rounds.map((round) => round.weight));
  const agenda = framework.rounds.map((round, index) => ({
    title: round.title,
    detail: round.detail,
    minutes: minutes[index],
  }));

  const focusAreas = Array.from(new Set([...stage.focus, ...artefact.extraFocus])).filter((area) => PROMPTS[area]);
  const prompts = focusAreas.map((area) => ({ area, questions: PROMPTS[area] }));
  prompts.push({ area: artefact.label, questions: artefact.specific });

  const speakingMinutes = Math.max(1, Math.floor((totalMinutes * 0.6) / participants));
  const groundRules = [
    "Critique the work against its objectives, not against your own taste. 'I would have done it differently' is not a finding.",
    "Name the element, describe the effect, then name the objective it helps or hurts. Three parts, every time.",
    "Ask before prescribing: understand the constraint the designer was working inside before you suggest the fix.",
    `Keep to roughly ${speakingMinutes} minute${speakingMinutes === 1 ? "" : "s"} of speaking each per round so ${participants} people all get heard.`,
    "The designer takes notes and does not defend during the feedback rounds; questions get answered at the end.",
    stage.caution,
  ];

  return {
    frameworkLabel: framework.label,
    frameworkSummary: framework.summary,
    stageCaution: stage.caution,
    agenda,
    prompts,
    groundRules,
    totalMinutes: minutes.reduce((sum, value) => sum + value, 0),
    promptCount: prompts.reduce((sum, group) => sum + group.questions.length, 0),
    participants,
  };
}

/**
 * Score a piece of written feedback for specificity.
 * Pure function.
 *
 * @returns {{error: string} | {score: number, band: object, vagueFound: string[],
 *   anchorsFound: string[], suggestions: string[], wordCount: number}}
 */
export function assessFeedback(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return { error: "Paste a piece of feedback to check it." };

  const lower = raw.toLowerCase();
  const words = raw.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const vagueFound = VAGUE_TERMS.filter((term) =>
    term.includes(" ") ? lower.includes(term) : new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, "i").test(lower),
  );
  const anchorsFound = ANCHOR_TERMS.filter((term) =>
    term.includes(" ") ? lower.includes(term) : new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, "i").test(lower),
  );

  let score = 50;
  score -= vagueFound.length * 15;
  score += Math.min(3, anchorsFound.length) * 12;
  if (wordCount < 6) score -= 15;
  if (wordCount >= 20) score += 8;
  score = Math.max(0, Math.min(100, score));

  const suggestions = [];
  if (vagueFound.length > 0) {
    suggestions.push(
      `Replace the vague wording (${vagueFound.join(", ")}) with the element you mean and the effect it has. "Cluttered" becomes "six items compete at the same weight, so nothing reads first".`,
    );
  }
  if (!/\bbecause\b|\bso that\b/i.test(raw)) {
    suggestions.push("Add the reason. Feedback with 'because' attached can be argued with; feedback without it can only be obeyed or ignored.");
  }
  if (!anchorsFound.some((term) => ["user", "users", "reader", "customer", "new user", "first-time"].includes(term))) {
    suggestions.push("Say who is affected. A problem for a first-time user and a problem for a power user get different fixes.");
  }
  if (wordCount < 6) {
    suggestions.push("Too short to act on. One sentence naming the element, one naming the consequence.");
  }
  if (/^(you should|just|simply)\b/i.test(raw)) {
    suggestions.push("This leads with a prescription. Describe the problem first — the designer may know a better fix than yours.");
  }

  let band;
  if (score >= 75) band = { key: "specific", label: "Specific and actionable", tone: "success" };
  else if (score >= 45) band = { key: "partial", label: "Half-way — the reason is missing", tone: "warning" };
  else band = { key: "vague", label: "Too vague to act on", tone: "danger" };

  return { score, band, vagueFound, anchorsFound, suggestions, wordCount };
}
