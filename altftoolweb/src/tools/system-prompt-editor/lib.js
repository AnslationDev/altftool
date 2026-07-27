/**
 * Copy-editor system prompt composer.
 *
 * Pure string assembly: identical configuration always yields an identical
 * prompt. Section order — identity, style rules, edit depth, change tracking,
 * hard rules — follows the instruction-prompt layout used across this tool
 * family.
 *
 * Editing-level definitions follow the industry ladder used by the Chicago
 * Manual of Style (17th ed., ch. 2) and the Editorial Freelancers Association:
 * proofreading < copyediting < line editing. Style-guide notes cite the
 * distinguishing conventions of each guide (e.g. AP omits the serial comma;
 * Chicago requires it).
 */

/** OpenAI's rule of thumb: roughly 4 characters per token for English prose. */
export const CHARS_PER_TOKEN = 4;

/** Warn-only budget: the system prompt is prepended to every request. */
export const DEFAULT_TOKEN_BUDGET = 800;

export const STYLE_GUIDES = {
  ap: {
    label: "AP Stylebook",
    line: "Follow the AP Stylebook: no serial (Oxford) comma unless needed for clarity, numerals for 10 and above, per cent as '%', titles capitalised only before a name.",
  },
  chicago: {
    label: "Chicago Manual of Style",
    line: "Follow the Chicago Manual of Style: use the serial (Oxford) comma, spell out numbers below 101 in running text, use headline-style capitalisation for titles.",
  },
  apa: {
    label: "APA Style (7th ed.)",
    line: "Follow APA Style, 7th edition: serial comma, numerals for 10 and above, bias-free language guidelines, and sentence-case headings.",
  },
  house: {
    label: "House style (describe below)",
    line: "Follow the house style rules provided in the context section. Where the house style is silent, fall back to standard usage for the chosen English variant.",
  },
};

export const ENGLISH_VARIANTS = {
  us: { label: "US English", line: "Use US English spelling and punctuation (color, -ize, double quotation marks first)." },
  uk: { label: "UK English", line: "Use UK English spelling and punctuation (colour, -ise, single quotation marks first where the house allows)." },
  au: { label: "Australian English", line: "Use Australian English spelling (colour, -ise), following the Macquarie Dictionary where dictionaries disagree." },
  ca: { label: "Canadian English", line: "Use Canadian English spelling (colour, but -ize), following the Canadian Oxford Dictionary where dictionaries disagree." },
};

/**
 * Edit depths, lightest to heaviest, per the Chicago/EFA ladder.
 * Each level includes everything above it.
 */
export const EDIT_LEVELS = {
  proofread: {
    label: "Proofread",
    line: "Proofread only: fix typos, spelling, punctuation and obvious grammatical errors. Do not rephrase, reorder or tighten sentences.",
  },
  copyedit: {
    label: "Copyedit",
    line: "Copyedit: fix grammar, usage, punctuation and consistency (spelling of names, hyphenation, capitalisation, number style), and untangle clearly faulty sentences — without changing the author's structure or arguments.",
  },
  lineEdit: {
    label: "Line edit",
    line: "Line edit: in addition to copyediting, improve clarity, rhythm and concision sentence by sentence — cut redundancy, break up overlong sentences, strengthen weak verbs — while preserving the author's meaning and voice.",
  },
};

export const TRACKING_MODES = {
  inlineMarkup: {
    label: "Inline markup",
    line: "Show every change inline: wrap deletions in ~~strikethrough~~ and insertions in **bold**, so the author can see exactly what changed where.",
  },
  changeLog: {
    label: "Clean text + change log",
    line: "Return the clean edited text first, then a numbered change log: each entry quotes the original wording, the revision, and a one-clause reason.",
  },
  both: {
    label: "Marked-up text + change log",
    line: "Return the text with inline markup (deletions in ~~strikethrough~~, insertions in **bold**) followed by a numbered change log with a one-clause reason per change.",
  },
  cleanOnly: {
    label: "Clean text only",
    line: "Return only the clean edited text, with no markup or change list.",
  },
};

export const HARD_RULES = {
  preserveVoice:
    "Preserve the author's voice. Do not swap their word choices for synonyms of equal merit, and never impose your own tone.",
  noFactChanges:
    "Never alter facts, figures, names, dates or claims. If one looks wrong, flag it in a query instead of changing it.",
  preserveQuotes:
    "Never edit inside quoted material or block quotes; if a quote contains an apparent error, query it and suggest '[sic]' where appropriate.",
  queryDontGuess:
    "When meaning is ambiguous, do not guess. Insert a bracketed query in the form [AU: question?] and leave the original text standing.",
  noRewrites:
    "Do not restructure paragraphs, reorder sections or rewrite passages wholesale. That is developmental editing and out of scope.",
  keepLength:
    "Keep the piece within about 5% of its original word count unless the brief says to cut.",
};

const clean = (value) => String(value ?? "").trim();

/** Rough token estimate from the 4-characters-per-token rule of thumb. */
export function estimateTokens(text) {
  const chars = String(text ?? "").length;
  return { chars, tokens: Math.ceil(chars / CHARS_PER_TOKEN) };
}

/**
 * Build the copy-editor system prompt.
 *
 * @param {object} config
 * @returns {{prompt: string, sections: Array, tokens: object, warnings: string[], completeness: number}|{error: string}}
 */
export function buildEditorPrompt(config = {}) {
  const contentType = clean(config.contentType);
  if (contentType === "") {
    return { error: "Say what kind of text the editor works on — articles, docs, fiction, marketing copy." };
  }

  const audience = clean(config.audience);
  const houseNotes = clean(config.houseNotes);
  const terminology = clean(config.terminology);

  const styleKey = STYLE_GUIDES[config.styleGuide] ? config.styleGuide : "chicago";
  const variantKey = ENGLISH_VARIANTS[config.englishVariant] ? config.englishVariant : "us";
  const levelKey = EDIT_LEVELS[config.editLevel] ? config.editLevel : "copyedit";
  const trackingKey = TRACKING_MODES[config.tracking] ? config.tracking : "changeLog";

  const rules = Array.isArray(config.hardRules)
    ? config.hardRules.filter((key) => HARD_RULES[key])
    : [];

  const budget = Number(config.tokenBudget ?? DEFAULT_TOKEN_BUDGET);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "The token budget must be a positive number." };
  }

  if (styleKey === "house" && houseNotes === "") {
    return { error: "House style is selected but no house rules are given — describe them, or pick a published guide." };
  }

  const sections = [];

  const identity = [
    `You are a professional copy editor working on ${contentType}.`,
    audience ? `The audience is ${audience}.` : "",
    "You edit with a light, disciplined hand: the author's meaning and voice come first, correctness second, polish third.",
  ]
    .filter(Boolean)
    .join(" ");
  sections.push({ id: "identity", title: "Role", body: identity });

  const style = [
    `- ${STYLE_GUIDES[styleKey].line}`,
    `- ${ENGLISH_VARIANTS[variantKey].line}`,
  ];
  if (terminology) style.push(`- Enforce this terminology consistently: ${terminology}.`);
  sections.push({ id: "style", title: "Style rules", body: style.join("\n") });

  if (houseNotes) {
    sections.push({ id: "house", title: "House style notes", body: houseNotes });
  }

  sections.push({ id: "depth", title: "Depth of edit", body: `- ${EDIT_LEVELS[levelKey].line}` });

  sections.push({
    id: "tracking",
    title: "Change tracking",
    body: `- ${TRACKING_MODES[trackingKey].line}`,
  });

  if (rules.length > 0) {
    sections.push({
      id: "rules",
      title: "Hard rules",
      body: rules.map((key) => `- ${HARD_RULES[key]}`).join("\n"),
    });
  }

  const prompt = sections
    .map((section) => (section.id === "identity" ? section.body : `## ${section.title}\n${section.body}`))
    .join("\n\n");

  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (rules.length === 0) {
    warnings.push("No hard rules selected. At minimum, protect facts and quoted material from silent changes.");
  } else {
    if (!rules.includes("noFactChanges")) {
      warnings.push("The facts rule is off — the editor may silently 'correct' numbers and names.");
    }
    if (!rules.includes("preserveQuotes")) {
      warnings.push("The quotes rule is off — quoted material can be silently reworded.");
    }
  }
  if (trackingKey === "cleanOnly" && levelKey !== "proofread") {
    warnings.push(
      "Clean-text-only tracking with an edit deeper than proofreading means you cannot see what changed — consider a change log.",
    );
  }
  if (tokens.tokens > budget) {
    warnings.push(`The prompt is about ${tokens.tokens} tokens, above your ${budget}-token budget.`);
  }

  const filled = [
    contentType,
    audience,
    terminology || houseNotes,
    rules.length > 0 ? "y" : "",
  ].filter((value) => clean(value) !== "").length;
  const completeness = Math.round((filled / 4) * 100);

  return {
    prompt,
    sections,
    tokens,
    warnings,
    completeness,
    styleKey,
    variantKey,
    levelKey,
    trackingKey,
  };
}
