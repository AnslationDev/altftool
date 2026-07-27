/**
 * FAQ Generator Prompt Builder.
 *
 * Reads a product or service description, pulls out its most-repeated content
 * terms, spreads a requested number of questions across the buyer-intent
 * categories you select, and writes a prompt that returns answers at a chosen
 * length plus optional schema.org FAQPage JSON-LD.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Buyer-intent buckets. Real FAQ sets fail by covering only "what is it";
 * these categories force the objection-handling questions to appear too.
 */
export const INTENT_CATEGORIES = [
  {
    id: "basics",
    label: "What it is / who it is for",
    directive: "Definition and fit questions: what the product does and who it suits.",
  },
  {
    id: "pricing",
    label: "Pricing and billing",
    directive: "Cost, plan differences, trials, taxes, refunds and cancellation.",
  },
  {
    id: "setup",
    label: "Getting started and setup",
    directive: "Time to first value, prerequisites, migration and onboarding help.",
  },
  {
    id: "comparison",
    label: "Comparison and alternatives",
    directive: "How it differs from the obvious alternative, including doing nothing.",
  },
  {
    id: "trust",
    label: "Security, privacy and data",
    directive: "Where data lives, who can see it, deletion, and any compliance claims.",
  },
  {
    id: "support",
    label: "Support and troubleshooting",
    directive: "Response times, channels, common failure modes and their fixes.",
  },
  {
    id: "policy",
    label: "Policies — delivery, returns, terms",
    directive: "Shipping, returns, guarantees, contract length and fair-use limits.",
  },
];

/**
 * Answer length targets. The short target matches the length Google's
 * featured snippets typically display — roughly 40-60 words, or about
 * 300 characters before truncation.
 */
export const ANSWER_LENGTHS = [
  { id: "snippet", label: "Snippet — 40 to 60 words", min: 40, max: 60 },
  { id: "standard", label: "Standard — 60 to 120 words", min: 60, max: 120 },
  { id: "detailed", label: "Detailed — 120 to 200 words", min: 120, max: 200 },
];

export const TONES = [
  { id: "plain", label: "Plain and factual", directive: "Neutral, factual, no adjectives that cannot be measured." },
  { id: "friendly", label: "Friendly and reassuring", directive: "Warm second person, short sentences, still concrete." },
  { id: "technical", label: "Technical", directive: "Precise terminology, exact limits and version numbers, no simplification." },
];

/** Practical bounds. */
export const LIMITS = {
  questions: { min: 3, max: 30 },
  /** Below this the description carries too little detail to derive real questions. */
  descriptionWords: { min: 15 },
};

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/**
 * Function words removed before term counting, so the ranked terms describe
 * the product rather than the grammar.
 */
const STOPWORDS = new Set([
  "a", "about", "all", "also", "an", "and", "any", "are", "as", "at", "be", "been", "but", "by",
  "can", "do", "does", "each", "for", "from", "get", "has", "have", "how", "if", "in", "into",
  "is", "it", "its", "just", "like", "make", "more", "most", "no", "not", "of", "on", "one",
  "only", "or", "other", "our", "out", "over", "own", "same", "so", "some", "such", "than",
  "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "to", "up",
  "use", "used", "using", "very", "was", "we", "were", "what", "when", "where", "which", "while",
  "who", "will", "with", "you", "your",
]);

const MIN_TERM_LENGTH = 3;

export function getAnswerLength(id) {
  return ANSWER_LENGTHS.find((item) => item.id === id) || null;
}

export function getTone(id) {
  return TONES.find((item) => item.id === id) || null;
}

export function getIntentCategory(id) {
  return INTENT_CATEGORIES.find((item) => item.id === id) || null;
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Rank the most-repeated content words in the description.
 * Ties break by first appearance, so the result is deterministic.
 * @returns {Array<{term:string,count:number}>}
 */
export function extractKeyTerms(text, max = 8) {
  if (typeof text !== "string" || !text.trim()) return [];
  const counts = new Map();
  const order = new Map();
  const words = text.toLowerCase().match(/[a-z][a-z'-]*/g) || [];
  words.forEach((raw, index) => {
    const word = raw.replace(/^[''-]+|[''-]+$/g, "");
    if (word.length < MIN_TERM_LENGTH) return;
    if (STOPWORDS.has(word)) return;
    counts.set(word, (counts.get(word) || 0) + 1);
    if (!order.has(word)) order.set(word, index);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || order.get(a[0]) - order.get(b[0]))
    .slice(0, Math.max(0, max))
    .map(([term, count]) => ({ term, count }));
}

/**
 * Spread a question count evenly across the chosen categories.
 * The remainder goes to the earliest categories, so the total always matches.
 * @returns {{error:string}|{plan:Array<{id:string,label:string,directive:string,count:number}>}}
 */
export function planQuestions(total, categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return { error: "Select at least one question category." };
  }
  if (!Number.isFinite(total) || !Number.isInteger(total)) {
    return { error: "Enter a whole number of questions." };
  }
  if (total < LIMITS.questions.min || total > LIMITS.questions.max) {
    return {
      error: `Ask for between ${LIMITS.questions.min} and ${LIMITS.questions.max} questions.`,
    };
  }
  const categories = categoryIds.map(getIntentCategory).filter(Boolean);
  if (categories.length === 0) return { error: "Select at least one question category." };
  if (total < categories.length) {
    return {
      error: `You picked ${categories.length} categories but only ${total} questions — raise the count or drop a category.`,
    };
  }
  const base = Math.floor(total / categories.length);
  const remainder = total % categories.length;
  const plan = categories.map((category, index) => ({
    ...category,
    count: base + (index < remainder ? 1 : 0),
  }));
  return { plan };
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
 * Build the FAQ generation prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildFaqPrompt({
  productName,
  description,
  audience,
  questionCount,
  categoryIds,
  lengthId,
  toneId,
  includeSchema,
  notes,
} = {}) {
  const name = typeof productName === "string" ? productName.trim() : "";
  if (!name) return { error: "Enter the product or service name." };

  const desc = typeof description === "string" ? description.trim() : "";
  const descWords = countWords(desc);
  if (descWords < LIMITS.descriptionWords.min) {
    return {
      error: `Describe the product in at least ${LIMITS.descriptionWords.min} words — ${descWords} is not enough to derive real questions.`,
    };
  }

  const length = getAnswerLength(lengthId);
  if (!length) return { error: "Choose an answer length." };
  const tone = getTone(toneId);
  if (!tone) return { error: "Choose a tone." };

  const planned = planQuestions(questionCount, categoryIds);
  if (planned.error) return { error: planned.error };

  const readers = typeof audience === "string" && audience.trim() ? audience.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const terms = extractKeyTerms(desc, 8);
  const midpoint = Math.round((length.min + length.max) / 2);
  const estimatedWords = midpoint * questionCount;

  const lines = [
    `Write a frequently asked questions section for "${name}".`,
    "",
    "PRODUCT DESCRIPTION (the only source of facts you may use):",
    desc,
  ];

  if (readers) lines.push("", `AUDIENCE: ${readers}. Write every question in that reader's own words.`);

  lines.push(
    "",
    `QUESTION PLAN — ${questionCount} questions in total:`,
    ...planned.plan.map(
      (item) => `- ${item.count} on ${item.label}: ${item.directive}`,
    ),
    "",
    `ANSWER LENGTH: ${length.min} to ${length.max} words each. Lead with the direct answer in the first sentence, then support it.`,
    `TONE: ${tone.label}. ${tone.directive}`,
  );

  if (terms.length > 0) {
    lines.push(
      "",
      `RECURRING TERMS in the description — keep the wording consistent with these: ${terms
        .map((item) => item.term)
        .join(", ")}.`,
    );
  }

  lines.push(
    "",
    "RULES:",
    "- Phrase each question the way a customer types it into search or support chat, not the way marketing would write it. Prefer \"How much does it cost?\" over \"Pricing information\".",
    "- One question per distinct concern. No two questions may have the same answer.",
    "- Answer the awkward ones honestly — price, limits, what it does not do — rather than deflecting.",
    "- Every number, limit, rate, time frame or guarantee must come from the description above. Anything else is TODO(verify).",
    "- No rhetorical questions, no \"great question\", no repeating the product name in every answer.",
    "- Order the questions the way a buyer would ask them: what it is, then whether it fits, then cost, then objections.",
  );

  if (includeSchema) {
    lines.push(
      "",
      "ALSO OUTPUT: a schema.org FAQPage JSON-LD block with one Question per FAQ and an acceptedAnswer for each. The visible text on the page and the text inside the JSON-LD must match exactly.",
    );
  }
  if (extra) lines.push("", `EXTRA INSTRUCTION: ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    plan: planned.plan,
    terms,
    questionCount,
    length,
    tone,
    descriptionWords: descWords,
    estimatedWords,
    ...measureText(text),
  };
}
