/**
 * Knowledge Base Article Prompt Builder.
 *
 * Takes a task title, prerequisites, numbered steps and screenshot policy and
 * writes an AI prompt that produces a help-centre article shaped by the OASIS
 * DITA 1.3 information types (concept, task, reference, troubleshooting), with
 * accessible screenshot captions per WCAG 2.2 SC 1.1.1 (Non-text Content).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * OASIS DITA 1.3 defines three base topic types — concept, task and reference —
 * plus troubleshooting, added as a topic type in DITA 1.3. Each type answers a
 * different reader question, so each gets a different required section list.
 */
export const ARTICLE_TYPES = [
  {
    id: "task",
    label: "Task — how do I do it?",
    directive:
      "Write a DITA task topic: a short context paragraph, a prerequisites list, numbered steps in the imperative mood (one action per step), and a result statement telling the reader how to confirm success.",
    sections: ["Context", "Prerequisites", "Steps", "Result", "Next steps"],
  },
  {
    id: "concept",
    label: "Concept — what is it?",
    directive:
      "Write a DITA concept topic: define the thing in the first sentence, explain why it exists and when it applies, then give one worked example. Do not turn it into a procedure.",
    sections: ["Definition", "Why it matters", "How it works", "Example", "Related tasks"],
  },
  {
    id: "reference",
    label: "Reference — what are the values?",
    directive:
      "Write a DITA reference topic: a one-line scope statement, then tables of fields, settings, limits or codes with type, default, allowed values and description. Facts only, no narration.",
    sections: ["Scope", "Field or setting table", "Limits and defaults", "Related tasks"],
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting — why is it broken?",
    directive:
      "Write a DITA troubleshooting topic: state the observable symptom exactly as the user sees it, list probable causes ordered by likelihood, and give a diagnosis-plus-remedy pair for each cause.",
    sections: ["Symptom", "Probable causes", "Diagnosis", "Remedy", "Prevention"],
  },
];

/** Reader expertise, which controls how much is explained versus assumed. */
export const AUDIENCE_LEVELS = [
  {
    id: "new",
    label: "First-time user",
    directive:
      "Assume no product vocabulary. Expand every term on first use and name the exact on-screen label the reader must click.",
  },
  {
    id: "regular",
    label: "Regular user",
    directive:
      "Assume the reader knows the product's main screens. Skip basic navigation, but still name each control exactly.",
  },
  {
    id: "admin",
    label: "Admin or power user",
    directive:
      "Assume administrator permissions and product fluency. Mention permission scopes, defaults and the blast radius of each change.",
  },
  {
    id: "developer",
    label: "Developer / integrator",
    directive:
      "Assume API and CLI literacy. Show request and response shapes, and name environment variables and config keys precisely.",
  },
];

/**
 * Screenshot policy. Every option that keeps images requires alt text, because
 * WCAG 2.2 Success Criterion 1.1.1 requires a text alternative for non-text
 * content that serves an equivalent purpose.
 */
export const SCREENSHOT_MODES = [
  {
    id: "none",
    label: "No screenshots",
    directive:
      "Do not request screenshots. Describe the UI in words, naming each control by its visible label.",
  },
  {
    id: "key",
    label: "Screenshot at key steps only",
    directive:
      "Mark [SCREENSHOT] only at steps where the control is hard to find or the screen changes shape. For each one give a caption and alt text describing what the reader should see (WCAG 2.2 SC 1.1.1).",
  },
  {
    id: "every",
    label: "Screenshot at every step",
    directive:
      "Mark [SCREENSHOT] on every step, each with a caption, alt text (WCAG 2.2 SC 1.1.1) and a note on what to highlight or redact.",
  },
];

/** Practical bounds. */
export const LIMITS = {
  steps: { min: 1, max: 40 },
  prerequisites: { max: 15 },
  /** Search results truncate long titles; ~60 characters is the safe display width. */
  titleChars: { max: 60 },
};

/** A procedure longer than this reads better split into named stages. */
export const STEP_SPLIT_THRESHOLD = 12;

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/**
 * Openings that break imperative mood in a procedure step. Imperative steps
 * begin with a bare verb ("Select…", "Open…"), so a leading pronoun, article
 * or gerund is a reliable signal that the step needs rewriting.
 */
const NON_IMPERATIVE_OPENERS = [
  "you",
  "we",
  "the",
  "a",
  "an",
  "it",
  "there",
  "this",
  "your",
  "users",
  "user",
  "i",
];

const GERUND_PATTERN = /^[a-z]+ing$/;

function cleanLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/** True when a step opens with something other than a bare imperative verb. */
export function isNonImperative(step) {
  if (typeof step !== "string") return false;
  const first = step.trim().split(/\s+/)[0];
  if (!first) return false;
  const word = first.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return false;
  return NON_IMPERATIVE_OPENERS.includes(word) || GERUND_PATTERN.test(word);
}

/**
 * Parse the numbered-step box. Strips "1.", "-" and bullet prefixes.
 * @returns {{error:string}|{steps:Array<{number:number,text:string,imperative:boolean}>,nonImperative:number}}
 */
export function parseSteps(text) {
  const lines = cleanLines(text);
  if (lines.length < LIMITS.steps.min) {
    return { error: "Add at least one step — one action per line." };
  }
  if (lines.length > LIMITS.steps.max) {
    return {
      error: `Keep it to ${LIMITS.steps.max} steps per article — split a longer procedure into separate articles.`,
    };
  }
  let nonImperative = 0;
  const steps = lines.map((line, index) => {
    const imperative = !isNonImperative(line);
    if (!imperative) nonImperative += 1;
    return { number: index + 1, text: line, imperative };
  });
  return { steps, nonImperative };
}

/** Parse a free-form bullet list (prerequisites). Empty input is valid. */
export function parseList(text, max = LIMITS.prerequisites.max) {
  const items = cleanLines(text);
  if (items.length > max) {
    return { error: `Keep the list to ${max} items — move the rest into the article body.` };
  }
  return { items };
}

export function getArticleType(id) {
  return ARTICLE_TYPES.find((type) => type.id === id) || null;
}

export function getAudience(id) {
  return AUDIENCE_LEVELS.find((level) => level.id === id) || null;
}

export function getScreenshotMode(id) {
  return SCREENSHOT_MODES.find((mode) => mode.id === id) || null;
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the knowledge base article prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildKbPrompt({
  title,
  product,
  typeId,
  audienceId,
  screenshotId,
  prerequisitesText,
  stepsText,
  notes,
} = {}) {
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  if (!cleanTitle) return { error: "Enter the article title — write it the way a user would search for it." };

  const type = getArticleType(typeId);
  if (!type) return { error: "Choose an article type." };
  const audience = getAudience(audienceId);
  if (!audience) return { error: "Choose the reader's expertise level." };
  const shots = getScreenshotMode(screenshotId);
  if (!shots) return { error: "Choose a screenshot policy." };

  const prereq = parseList(prerequisitesText);
  if (prereq.error) return { error: prereq.error };

  const parsed = parseSteps(stepsText);
  if (parsed.error) return { error: parsed.error };

  const productName = typeof product === "string" && product.trim() ? product.trim() : "the product";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const titleTooLong = cleanTitle.length > LIMITS.titleChars.max;
  const needsStages = parsed.steps.length > STEP_SPLIT_THRESHOLD;

  const lines = [
    `Write a knowledge base article for ${productName}, titled "${cleanTitle}".`,
    "",
    `TOPIC TYPE: ${type.label}`,
    type.directive,
    `REQUIRED SECTIONS, in this order: ${type.sections.join(" → ")}.`,
    `AUDIENCE: ${audience.label}. ${audience.directive}`,
    `SCREENSHOTS: ${shots.directive}`,
  ];

  if (prereq.items.length > 0) {
    lines.push("", `PREREQUISITES the reader must already have (${prereq.items.length}):`);
    for (const item of prereq.items) lines.push(`- ${item}`);
  } else {
    lines.push("", "PREREQUISITES: none supplied — state explicitly that no setup is required, or ask for the missing prerequisite instead of guessing.");
  }

  lines.push("", `STEPS TO EXPAND (${parsed.steps.length}), in this order:`);
  for (const step of parsed.steps) {
    lines.push(`${step.number}. ${step.text}`);
  }

  lines.push(
    "",
    "HOW TO WRITE IT:",
    "- Open with one sentence saying what the reader will be able to do once finished.",
    "- One action per numbered step, in the imperative mood: \"Select Settings\", not \"You should select Settings\".",
    "- Put the location before the action so the reader can scan: \"In the top-right menu, select Billing\".",
    "- Name every control with its exact on-screen label, in bold, matching capitalisation.",
    "- Where a step can fail, add a short \"If this does not work\" note directly under it.",
    "- Second person, present tense, active voice. No marketing language.",
  );

  if (needsStages) {
    lines.push(
      `- This procedure has ${parsed.steps.length} steps, more than ${STEP_SPLIT_THRESHOLD}. Group them under 2-4 named stage headings so the reader can resume mid-way.`,
    );
  }
  if (parsed.nonImperative > 0) {
    lines.push(
      `- ${parsed.nonImperative} of the supplied steps do not start with a verb. Rewrite those into imperative mood before expanding them.`,
    );
  }
  if (titleTooLong) {
    lines.push(
      `- Also propose a shorter title: the supplied one is ${cleanTitle.length} characters and search results truncate near ${LIMITS.titleChars.max}.`,
    );
  }

  lines.push(
    "",
    "RULES:",
    "- Use only the facts supplied above. Where a detail is missing (a menu name, a limit, an error code), write TODO(verify): rather than inventing it.",
    "- Do not invent screenshots, version numbers, prices or support hours.",
    "- Finish with a \"Still stuck?\" line pointing to the support channel, left as TODO(verify) if not supplied.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    type,
    audience,
    shots,
    steps: parsed.steps,
    stepCount: parsed.steps.length,
    nonImperative: parsed.nonImperative,
    prerequisiteCount: prereq.items.length,
    titleLength: cleanTitle.length,
    titleTooLong,
    needsStages,
    ...measureText(text),
  };
}
