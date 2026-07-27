/**
 * SEO Article Prompt Builder.
 *
 * Converts a target search query, intent and heading structure into an article
 * prompt with an explicit word budget and the on-page limits (title tag, meta
 * description, query-usage cap) written into the instructions.
 */

/**
 * Google truncates title tags at roughly 600 device pixels, which works out to
 * about 60 characters of ordinary mixed-case text. Practitioner consensus
 * (Moz, Google Search Central guidance on descriptive titles).
 */
export const TITLE_TAG_MAX_CHARS = 60;

/**
 * Meta descriptions are typically truncated around 155–160 characters on
 * desktop results; below ~70 they look thin and get rewritten more often.
 */
export const META_DESCRIPTION_MIN_CHARS = 70;
export const META_DESCRIPTION_MAX_CHARS = 160;

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WORDS_PER_MINUTE = 238;

/**
 * Keep primary-query mentions at or below ~1% of the word count — a common
 * practitioner ceiling to stay clear of keyword stuffing (Google spam policy
 * names "keyword stuffing" as a violation without a numeric limit).
 */
export const QUERY_DENSITY_CAP = 0.01;
export const MIN_QUERY_MENTIONS = 3;

/**
 * Answer-first structure: the direct answer to the query belongs in the
 * opening block so featured-snippet extraction has something to lift.
 * Shares are practical editorial rules of thumb, with floors.
 */
export const INTRO_SHARE = 0.08;
export const MIN_INTRO_WORDS = 60;
export const CONCLUSION_SHARE = 0.06;
export const MIN_CONCLUSION_WORDS = 50;

/** A useful FAQ answer for PAA-style questions runs about three sentences. */
export const FAQ_WORDS_PER_QUESTION = 60;

/** Share of an H2's budget kept for its lead-in when it carries H3s. */
export const SECTION_LEAD_SHARE = 0.15;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  totalWords: { min: 300, max: 8000 },
  h2: { min: 2, max: 12 },
  h3PerH2: { min: 0, max: 5 },
  faqs: { min: 0, max: 10 },
  secondaryKeywords: { max: 8 },
};

/**
 * Search-intent classes: Broder's (2002) informational / navigational /
 * transactional taxonomy plus "commercial investigation", the comparison
 * stage SEO practice added between informational and transactional.
 */
export const SEARCH_INTENTS = [
  {
    id: "informational",
    label: "Informational — wants to understand",
    directive:
      "Answer the query directly in the first paragraph, then expand. Define terms on first use and structure H2s as the sub-questions a searcher would ask next.",
  },
  {
    id: "commercial",
    label: "Commercial — comparing before buying",
    directive:
      "Give each option a like-for-like H2 and one shared comparison table. End every option with one sentence on who it suits and who should skip it.",
  },
  {
    id: "transactional",
    label: "Transactional — ready to act",
    directive:
      "Lead with what the reader gets and the exact steps to get it. Remove background theory; put requirements, pricing factors and next steps high on the page.",
  },
  {
    id: "navigational",
    label: "Navigational — looking for a specific thing",
    directive:
      "Put the thing being sought (link, address, feature, page) in the first 100 words, then cover the tasks people do once they find it.",
  },
];

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Split a whole-number budget into `parts` pieces that sum exactly to it.
 * The first (budget mod parts) pieces get one extra word.
 */
export function splitEvenly(budget, parts) {
  if (!(parts > 0)) return [];
  const base = Math.floor(budget / parts);
  const remainder = budget - base * parts;
  return Array.from({ length: parts }, (unused, index) => base + (index < remainder ? 1 : 0));
}

/** Parse a comma-separated keyword list into up to LIMITS.secondaryKeywords.max clean terms. */
export function parseKeywordList(value) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, LIMITS.secondaryKeywords.max);
}

export function getIntent(intentId) {
  return SEARCH_INTENTS.find((intent) => intent.id === intentId) || null;
}

/**
 * Allocate the word budget across the article blocks and derive on-page caps.
 * @returns {{error:string}|object}
 */
export function planSeoArticle({ totalWords, h2Count, h3PerH2, faqCount } = {}) {
  const total = toInt(totalWords);
  const h2 = toInt(h2Count);
  const h3 = toInt(h3PerH2 ?? 0);
  const faqs = toInt(faqCount ?? 0);

  if ([total, h2, h3, faqs].some((value) => Number.isNaN(value))) {
    return { error: "Enter whole numbers for the length, H2s, H3s and FAQ count." };
  }
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Target length must be between ${LIMITS.totalWords.min} and ${LIMITS.totalWords.max} words.`,
    };
  }
  if (h2 < LIMITS.h2.min || h2 > LIMITS.h2.max) {
    return { error: `Use between ${LIMITS.h2.min} and ${LIMITS.h2.max} H2 sections.` };
  }
  if (h3 < LIMITS.h3PerH2.min || h3 > LIMITS.h3PerH2.max) {
    return { error: `H3s per H2 must be between ${LIMITS.h3PerH2.min} and ${LIMITS.h3PerH2.max}.` };
  }
  if (faqs < LIMITS.faqs.min || faqs > LIMITS.faqs.max) {
    return { error: `FAQ count must be between ${LIMITS.faqs.min} and ${LIMITS.faqs.max}.` };
  }

  const intro = Math.max(MIN_INTRO_WORDS, Math.round(total * INTRO_SHARE));
  const conclusion = Math.max(MIN_CONCLUSION_WORDS, Math.round(total * CONCLUSION_SHARE));
  const faqBlock = faqs * FAQ_WORDS_PER_QUESTION;
  const body = total - intro - conclusion - faqBlock;

  if (body < h2 * 40) {
    return {
      error: `Only ${Math.max(0, body)} words remain for ${h2} H2 sections after the intro, conclusion and FAQ. Raise the length or cut blocks.`,
    };
  }

  const h2Words = splitEvenly(body, h2);
  const h2Plan = h2Words.map((words, index) => {
    const lead = h3 > 0 ? Math.max(30, Math.round(words * SECTION_LEAD_SHARE)) : words;
    return {
      index: index + 1,
      words,
      leadWords: lead,
      h3Words: h3 > 0 ? splitEvenly(words - lead, h3) : [],
    };
  });

  const maxQueryMentions = Math.max(MIN_QUERY_MENTIONS, Math.round(total * QUERY_DENSITY_CAP));

  const warnings = [];
  const perH2 = body / h2;
  if (perH2 < 100) {
    warnings.push(
      `Each H2 gets only ${Math.round(perH2)} words — too thin to rank for a subtopic. Use fewer H2s or a longer article.`,
    );
  }
  if (h3 > 0 && (perH2 * (1 - SECTION_LEAD_SHARE)) / h3 < 50) {
    warnings.push(`${h3} H3s per H2 leave under 50 words each. Reduce H3s or lengthen the article.`);
  }

  return {
    total,
    intro,
    conclusion,
    faqBlock,
    faqs,
    body,
    h2Count: h2,
    h3PerH2: h3,
    perH2,
    h2Plan,
    maxQueryMentions,
    readingMinutes: total / READING_WORDS_PER_MINUTE,
    headingCount: 1 + h2 + h2 * h3 + (faqs > 0 ? 1 : 0),
    warnings,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the article prompt, embedding the plan and the on-page limits.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildSeoArticlePrompt({
  query,
  audience,
  intentId,
  secondaryKeywords,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  const intent = getIntent(intentId);
  if (!intent) return { error: "Choose the search intent behind the query." };
  const target = typeof query === "string" && query.trim() ? query.trim() : "";
  if (!target) return { error: "Enter the target search query." };
  const reader = typeof audience === "string" && audience.trim() ? audience.trim() : "a general searcher";
  const secondary = parseKeywordList(secondaryKeywords);
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    "Write a complete SEO article. Follow every limit below exactly.",
    "",
    `TARGET QUERY: ${target}`,
    `READER: ${reader}`,
    `SEARCH INTENT: ${intent.label.split("—")[0].trim()} — ${intent.directive}`,
  ];
  if (secondary.length > 0) {
    lines.push(
      `SECONDARY TERMS (each used once or twice where natural, never forced): ${secondary.join("; ")}`,
    );
  }
  lines.push(
    "",
    "ON-PAGE ELEMENTS:",
    `- Title tag: at most ${TITLE_TAG_MAX_CHARS} characters, containing the target query, written as a reason to click rather than a keyword list.`,
    `- Meta description: ${META_DESCRIPTION_MIN_CHARS}-${META_DESCRIPTION_MAX_CHARS} characters, stating the concrete answer or outcome the page delivers.`,
    "- Exactly one H1. The target query appears in the H1, in the first 100 words, and in at least one H2.",
    `- Use the exact target query at most ${plan.maxQueryMentions} times in the whole article (about 1% of the word count); use natural variants elsewhere.`,
    "",
    `STRUCTURE AND WORD BUDGET — total ${plan.total} words, about ${plan.readingMinutes.toFixed(0)} minutes at ${READING_WORDS_PER_MINUTE} words per minute:`,
    `- Opening block: ${plan.intro} words. Give the direct answer to the query in the first two sentences, then say what the rest of the page adds.`,
  );
  for (const section of plan.h2Plan) {
    if (plan.h3PerH2 > 0) {
      lines.push(
        `- H2 section ${section.index}: ${section.words} words (${section.leadWords}-word lead-in, then ${plan.h3PerH2} H3s of about ${section.h3Words[0]} words each)`,
      );
    } else {
      lines.push(`- H2 section ${section.index}: ${section.words} words`);
    }
  }
  if (plan.faqBlock > 0) {
    lines.push(
      `- FAQ (H2 with one H3 per question): ${plan.faqs} real questions searchers ask, about ${FAQ_WORDS_PER_QUESTION} words each, answer first sentence.`,
    );
  }
  lines.push(
    `- Conclusion: ${plan.conclusion} words ending in one clear next step.`,
    "",
    "RULES:",
    "- Every H2 is phrased as something a person would search or ask, not a label.",
    "- One point per section; if two sections overlap, merge them and say so.",
    "- Do not invent statistics, studies or quotations — write [source needed] where evidence belongs.",
    "- No filler openers ('In today's world…'); start every section with its point.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, intent, secondary, ...measureText(text) };
}
