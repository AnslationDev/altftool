/**
 * Notion AI Prompt Builder — pure logic.
 *
 *  1. Real budgeting against Notion's documented limits: a rich text property
 *     value caps at 2,000 characters, so a target word count is converted to an
 *     estimated character count and checked against that ceiling.
 *  2. Real workload arithmetic for a database autofill: rows x AI properties
 *     gives the number of generations one run will trigger.
 *  3. Deterministic assembly of the prompt, shaped by the scope and action.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Notion's API caps a single rich text content value at 2,000 characters.
 * A text, title or AI-filled property that exceeds this is truncated.
 */
export const NOTION_RICH_TEXT_LIMIT = 2000;

/**
 * The standard "word" used for typing and length estimates is five characters
 * plus one space. Used to convert a target word count into characters.
 */
export const CHARS_PER_WORD = 6;

/** Above this many generations, an autofill run is worth doing in batches. */
export const LARGE_RUN_THRESHOLD = 500;

export const MAX_ROWS = 100000;
export const MIN_TARGET_WORDS = 5;
export const MAX_TARGET_WORDS = 2000;

/** Where the prompt will be run. */
export const SCOPES = {
  page: {
    label: "A single page",
    note: "Run from the page body with the AI writer. The whole page is the context.",
  },
  selection: {
    label: "A selected block or two",
    note: "Highlight the blocks first — only the selection is in context, so restate anything the AI needs.",
  },
  database: {
    label: "A database property (AI autofill)",
    note: "Runs once per row and writes into a property, so the output must be short and consistently shaped.",
  },
  "database-view": {
    label: "A whole database view",
    note: "The AI sees the rows in the current view, so filter and sort the view before running it.",
  },
};

/** Actions available in Notion AI, described by what they actually do. */
export const ACTIONS = {
  summarize: { label: "Summarise", verb: "Summarise", databaseFriendly: true },
  "action-items": { label: "Find action items", verb: "Extract every action item from", databaseFriendly: true },
  "key-info": { label: "Extract key info", verb: "Extract the key facts from", databaseFriendly: true },
  classify: { label: "Classify into a Select property", verb: "Classify", databaseFriendly: true },
  "improve-writing": { label: "Improve writing", verb: "Rewrite for clarity", databaseFriendly: false },
  outline: { label: "Draft an outline", verb: "Produce an outline for", databaseFriendly: false },
  "meeting-notes": { label: "Turn notes into meeting minutes", verb: "Turn into meeting minutes", databaseFriendly: false },
  brainstorm: { label: "Brainstorm", verb: "Brainstorm options for", databaseFriendly: false },
  translate: { label: "Translate", verb: "Translate", databaseFriendly: true },
};

/** Output shapes a Notion block or property can hold. */
export const OUTPUT_FORMATS = {
  "one-line": "A single line of plain text, no punctuation at the end.",
  sentences: "Two or three complete sentences.",
  bullets: "A bulleted list, one idea per bullet.",
  "todo": "A to-do list using checkbox blocks, one task per line.",
  table: "A markdown table with a fixed set of columns.",
  "select-value": "Exactly one value chosen from a fixed list, and nothing else.",
  headings: "Headings with a short paragraph under each.",
};

/** Notion property types an AI-filled value has to be valid for. */
export const PROPERTY_TYPES = [
  "Text",
  "Number",
  "Select",
  "Multi-select",
  "Status",
  "Date",
  "Checkbox",
  "URL",
  "Email",
  "Phone",
];

function clean(text) {
  return String(text ?? "").trim();
}

/**
 * Convert a target word count into an estimated character count and check it
 * against the Notion rich text ceiling.
 */
export function lengthBudget(targetWords, limit = NOTION_RICH_TEXT_LIMIT) {
  const chars = Math.round(targetWords * CHARS_PER_WORD);
  return {
    estimatedChars: chars,
    limit,
    fits: chars <= limit,
    maxWords: Math.floor(limit / CHARS_PER_WORD),
    headroom: limit - chars,
  };
}

/** Generations triggered by one autofill run. */
export function autofillRuns(rowCount, aiPropertyCount) {
  if (!(rowCount >= 0) || !(aiPropertyCount >= 0)) return null;
  return Math.round(rowCount) * Math.round(aiPropertyCount);
}

/**
 * @returns {{error: string} | object}
 */
export function buildNotionPrompt({
  scope = "page",
  action = "summarize",
  subject = "",
  outputFormat = "bullets",
  targetWords = 60,
  propertyName = "",
  propertyType = "Text",
  allowedValues = "",
  rowCount = 0,
  aiPropertyCount = 1,
  language = "",
  audience = "",
  mustInclude = "",
  mustAvoid = "",
} = {}) {
  const subjectText = clean(subject);
  const words = Math.round(Number(targetWords));
  const rows = Math.round(Number(rowCount));
  const aiProps = Math.round(Number(aiPropertyCount));

  if (!SCOPES[scope]) return { error: "Pick where the prompt will run." };
  if (!ACTIONS[action]) return { error: "Pick a Notion AI action." };
  if (!subjectText) return { error: "Say what the content is — 'my meeting notes', 'each customer interview', and so on." };
  if (![words, rows, aiProps].every(Number.isFinite)) {
    return { error: "Target length, row count and AI property count must be numbers." };
  }
  if (words < MIN_TARGET_WORDS || words > MAX_TARGET_WORDS) {
    return { error: `Target length should be between ${MIN_TARGET_WORDS} and ${MAX_TARGET_WORDS} words.` };
  }
  if (rows < 0 || rows > MAX_ROWS) {
    return { error: `Row count should be between 0 and ${MAX_ROWS.toLocaleString("en-US")}.` };
  }
  if (aiProps < 0 || aiProps > 50) {
    return { error: "AI property count should be between 0 and 50." };
  }

  const isDatabase = scope === "database" || scope === "database-view";
  const actionSpec = ACTIONS[action];

  if (scope === "database" && !clean(propertyName)) {
    return { error: "Name the property the AI will write into." };
  }
  if (scope === "database" && !actionSpec.databaseFriendly) {
    return {
      error: `"${actionSpec.label}" produces long, variable output — it does not fit inside a database property. Use a page instead.`,
    };
  }

  const allowed = clean(allowedValues)
    .split(/[,\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if ((propertyType === "Select" || propertyType === "Status") && scope === "database" && allowed.length < 2) {
    return { error: "A Select or Status property needs at least two allowed values, comma separated." };
  }

  const budget = lengthBudget(words);
  const runs = isDatabase ? autofillRuns(rows, aiProps) : null;
  const largeRun = runs !== null && runs > LARGE_RUN_THRESHOLD;

  const formatText = OUTPUT_FORMATS[outputFormat] ?? OUTPUT_FORMATS.bullets;
  const scopeSpec = SCOPES[scope];

  const lines = [];
  lines.push(`${actionSpec.verb} ${subjectText}.`);
  lines.push("");
  lines.push("CONTEXT");
  lines.push(`- Where this runs: ${scopeSpec.label}. ${scopeSpec.note}`);
  if (clean(audience)) lines.push(`- Written for: ${clean(audience)}`);
  if (clean(language)) lines.push(`- Output language: ${clean(language)}`);
  if (scope === "database") {
    lines.push(`- Writes into the "${clean(propertyName)}" property, type ${propertyType}`);
    if (allowed.length) lines.push(`- Allowed values: ${allowed.join(", ")}`);
  }
  lines.push("");
  lines.push("OUTPUT");
  lines.push(`- Format: ${formatText}`);
  lines.push(`- Length: about ${words} words (roughly ${budget.estimatedChars} characters).`);
  if (isDatabase) {
    lines.push(
      budget.fits
        ? `- That is inside Notion's ${NOTION_RICH_TEXT_LIMIT.toLocaleString("en-US")}-character property limit, with ${budget.headroom.toLocaleString("en-US")} characters spare.`
        : `- WARNING: this exceeds Notion's ${NOTION_RICH_TEXT_LIMIT.toLocaleString("en-US")}-character property limit and will be truncated. Keep it under ${budget.maxWords} words.`,
    );
  }
  if (propertyType === "Select" || propertyType === "Status") {
    lines.push("- Return exactly one of the allowed values, with no explanation, no punctuation and no quotation marks.");
  }
  if (propertyType === "Multi-select") {
    lines.push("- Return allowed values only, comma separated, with no other text.");
  }
  if (propertyType === "Date") lines.push("- Return a single date in YYYY-MM-DD form and nothing else.");
  if (propertyType === "Checkbox") lines.push("- Return only the word true or the word false.");
  if (propertyType === "Number") lines.push("- Return a bare number with no units, currency symbol or thousands separator.");
  if (propertyType === "URL") lines.push("- Return one absolute URL beginning with https:// and nothing else.");
  lines.push("");
  lines.push("RULES");
  lines.push("- Use only what is in the page or row. If the source does not say, write \"Not stated\" rather than guessing.");
  lines.push("- Keep names, figures, dates and product terms exactly as they appear in the source.");
  lines.push("- No preamble, no sign-off, no restating the instruction.");
  if (isDatabase) {
    lines.push("- Every row must come out in the same shape so the column stays sortable and filterable.");
  }
  if (clean(mustInclude)) lines.push(`- Always include: ${clean(mustInclude)}`);
  if (clean(mustAvoid)) lines.push(`- Never include: ${clean(mustAvoid)}`);
  if (largeRun) {
    lines.push(
      `- This run covers ${runs.toLocaleString("en-US")} generations (${rows.toLocaleString("en-US")} rows x ${aiProps} AI ${aiProps === 1 ? "property" : "properties"}). Test on a filtered view of 10 rows before running the whole database.`,
    );
  }

  const prompt = lines.join("\n");

  return {
    prompt,
    estimatedChars: budget.estimatedChars,
    fitsProperty: budget.fits,
    maxWordsForProperty: budget.maxWords,
    headroom: budget.headroom,
    runs,
    largeRun,
    isDatabase,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
