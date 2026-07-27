/**
 * Glossary Prompt Builder.
 *
 * Scans a body of documentation for glossary candidates — acronyms, multi-word
 * proper-noun phrases and repeated domain nouns — then writes a prompt that
 * defines each one under the terminology rules of ISO 704: intensional
 * definitions built as genus plus distinguishing characteristics, definitions
 * that can be substituted for the term, and no circular wording.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * ISO 704 describes intensional definitions (superordinate concept plus
 * delimiting characteristics) and extensional definitions (an exhaustive list
 * of subordinate concepts). Intensional is the default for a glossary.
 */
export const DEFINITION_STYLES = [
  {
    id: "intensional",
    label: "Intensional — genus plus differentia",
    directive:
      "Define each term as its nearest broader class followed by the characteristics that separate it from siblings: \"a <broader class> that <distinguishing characteristic>\". Start with a noun phrase, never with \"is\" or \"refers to\".",
  },
  {
    id: "extensional",
    label: "Extensional — list the members",
    directive:
      "Define each term by exhaustively listing the concepts it covers at the same level, then state the shared characteristic. Use this only where the members are finite and stable.",
  },
  {
    id: "plain",
    label: "Plain language — for customers",
    directive:
      "Define each term in one sentence a non-specialist can read aloud, then add a second sentence giving a concrete example. Avoid other glossary terms in the first sentence.",
  },
];

/** Who the glossary is written for, which changes the vocabulary allowed. */
export const AUDIENCES = [
  { id: "internal", label: "Internal team", directive: "Assume product context. Name systems and owners directly." },
  { id: "customer", label: "Customers and users", directive: "No internal jargon, no team names, no ticket references." },
  { id: "developer", label: "Developers and integrators", directive: "Give the exact field, header or parameter name the term maps to in the API." },
  { id: "regulator", label: "Auditors and regulators", directive: "Cite the source of each definition — contract, policy or standard — or mark it TODO(verify)." },
];

/** Optional parts of each glossary entry. */
export const ENTRY_PARTS = [
  { id: "example", label: "One concrete example", directive: "an example sentence showing the term used correctly in context" },
  { id: "notThis", label: "Commonly confused with", directive: "the nearest term it gets confused with, and the one characteristic that separates them" },
  { id: "deprecated", label: "Deprecated synonyms", directive: "any older or informal names for the same concept, marked as deprecated" },
  { id: "owner", label: "Owning team", directive: "the team accountable for the definition, or TODO(verify)" },
  { id: "seeAlso", label: "See also links", directive: "cross-references to related terms in the same glossary" },
];

/** Practical bounds. */
export const LIMITS = {
  terms: { min: 1, max: 120 },
  /** Below this the source text rarely contains enough repetition to rank terms. */
  sourceWords: { min: 25 },
};

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/** Acronyms are 2-6 capitals; longer runs are usually shouting, not terms. */
const ACRONYM_PATTERN = /\b[A-Z]{2,6}\b/g;

/** Two to four capitalised words in a row: "Gross Merchandise Value". */
const PROPER_PHRASE_PATTERN = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g;

/** Capitalised strings that are English words, not domain terms. */
const ACRONYM_STOPLIST = new Set(["THE", "AND", "FOR", "BUT", "NOT", "YOU", "ALL", "ANY", "OUR", "WITH", "THIS", "THAT", "FROM"]);

const PHRASE_STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "your", "our", "you", "are", "was",
  "were", "will", "can", "not", "but", "all", "any", "has", "have", "had", "its", "it", "they",
  "them", "their", "when", "where", "which", "while", "each", "also", "than", "then", "there",
  "these", "those", "such", "some", "only", "over", "more", "most", "very", "just", "like", "use",
  "used", "using", "one", "two", "per", "how", "why", "what", "who", "does", "did", "may", "must",
]);

const MIN_TERM_LENGTH = 4;
/** A lowercase word must appear at least this often to count as a domain term. */
const MIN_REPEATS = 3;

export function getDefinitionStyle(id) {
  return DEFINITION_STYLES.find((item) => item.id === id) || null;
}

export function getAudience(id) {
  return AUDIENCES.find((item) => item.id === id) || null;
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function tally(matches, filter) {
  const counts = new Map();
  const order = new Map();
  (matches || []).forEach((raw, index) => {
    const value = raw.trim();
    if (!value || (filter && !filter(value))) return;
    counts.set(value, (counts.get(value) || 0) + 1);
    if (!order.has(value)) order.set(value, index);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || order.get(a[0]) - order.get(b[0]))
    .map(([term, count]) => ({ term, count }));
}

/** Acronyms of 2-6 capitals, excluding shouted English words. */
export function extractAcronyms(text) {
  if (typeof text !== "string") return [];
  return tally(text.match(ACRONYM_PATTERN), (value) => !ACRONYM_STOPLIST.has(value));
}

/**
 * Sentence-initial determiners and pronouns get swept into a capitalised
 * phrase ("Our Net Promoter Score"); trim them off the front.
 */
const LEADING_TRIM = new Set([
  "The", "This", "That", "These", "Those", "Our", "Your", "Their", "Its", "His", "Her",
  "A", "An", "Every", "Each", "Some", "Any", "All", "Both", "In", "On", "For", "And", "But",
  "When", "Where", "While", "If", "It", "We", "They", "You",
]);

function trimLeadingDeterminers(phrase) {
  let words = phrase.split(/\s+/);
  while (words.length > 2 && LEADING_TRIM.has(words[0])) {
    words = words.slice(1);
  }
  if (words.length >= 2 && LEADING_TRIM.has(words[0])) return null;
  return words.join(" ");
}

/** Multi-word capitalised phrases, which are usually named concepts. */
export function extractProperPhrases(text) {
  if (typeof text !== "string") return [];
  const trimmed = (text.match(PROPER_PHRASE_PATTERN) || [])
    .map(trimLeadingDeterminers)
    .filter((value) => typeof value === "string" && value.split(/\s+/).length >= 2);
  return tally(trimmed);
}

/** Lowercase nouns repeated at least MIN_REPEATS times. */
export function extractRepeatedTerms(text) {
  if (typeof text !== "string") return [];
  const words = text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];
  return tally(words, (value) => !PHRASE_STOPWORDS.has(value) && value.length >= MIN_TERM_LENGTH)
    .filter((item) => item.count >= MIN_REPEATS);
}

function cleanLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/[\n,]/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Merge manually listed terms with everything found in the source text.
 * Manual terms come first; duplicates are matched case-insensitively.
 * @returns {{error:string}|{terms:Array<{term:string,source:string,count:number}>,found:object}}
 */
export function collectTerms({ sourceText, manualText, maxTerms = 40 } = {}) {
  const manual = cleanLines(manualText);
  const source = typeof sourceText === "string" ? sourceText : "";
  const sourceWords = countWords(source);

  if (manual.length === 0 && sourceWords < LIMITS.sourceWords.min) {
    return {
      error: `Paste at least ${LIMITS.sourceWords.min} words of source text, or list the terms yourself.`,
    };
  }

  const acronyms = extractAcronyms(source);
  const phrases = extractProperPhrases(source);
  const repeated = extractRepeatedTerms(source);

  const seen = new Set();
  const terms = [];
  const push = (term, sourceLabel, count) => {
    const key = term.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    terms.push({ term, source: sourceLabel, count });
  };

  manual.forEach((term) => push(term, "listed by you", 0));
  acronyms.forEach((item) => push(item.term, "acronym", item.count));
  phrases.forEach((item) => push(item.term, "named phrase", item.count));
  repeated.forEach((item) => push(item.term, `repeated ${item.count}×`, item.count));

  if (terms.length < LIMITS.terms.min) {
    return { error: "No glossary candidates found — paste more source text or list the terms yourself." };
  }

  const cap = Math.min(Math.max(1, maxTerms), LIMITS.terms.max);
  return {
    terms: terms.slice(0, cap),
    totalFound: terms.length,
    found: {
      manual: manual.length,
      acronyms: acronyms.length,
      phrases: phrases.length,
      repeated: repeated.length,
    },
    sourceWords,
  };
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
 * Build the glossary prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildGlossaryPrompt({
  domain,
  sourceText,
  manualText,
  maxTerms,
  styleId,
  audienceId,
  partIds,
  notes,
} = {}) {
  const subject = typeof domain === "string" ? domain.trim() : "";
  if (!subject) return { error: "Name the domain or product this glossary covers." };

  const style = getDefinitionStyle(styleId);
  if (!style) return { error: "Choose a definition style." };
  const audience = getAudience(audienceId);
  if (!audience) return { error: "Choose the glossary's audience." };

  const collected = collectTerms({ sourceText, manualText, maxTerms });
  if (collected.error) return { error: collected.error };

  const selectedParts = ENTRY_PARTS.filter((part) => (partIds || []).includes(part.id));
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Build a glossary for ${subject}.`,
    "",
    `AUDIENCE: ${audience.label}. ${audience.directive}`,
    `DEFINITION STYLE: ${style.label}`,
    style.directive,
    "",
    `TERMS TO DEFINE (${collected.terms.length}) — keep this exact spelling and capitalisation:`,
    ...collected.terms.map((item) => `- ${item.term} (${item.source})`),
    "",
    "EVERY ENTRY MUST CONTAIN:",
    "1. The term, in its canonical form.",
    "2. The definition, one sentence, written so it could replace the term in a sentence without changing the meaning.",
  ];

  selectedParts.forEach((part, index) => {
    lines.push(`${index + 3}. ${part.label}: ${part.directive}.`);
  });

  lines.push(
    "",
    "TERMINOLOGY RULES:",
    "- No circular definitions: the term itself, and words built from it, may not appear inside its own definition.",
    "- No definitions that begin \"is when\", \"is where\", \"refers to\" or \"is a term for\". Start with the broader class.",
    "- Define one concept per entry. If a term has two meanings in this domain, split it into two numbered senses.",
    "- Use a term consistently — one concept, one preferred term. List other names as deprecated rather than as equals.",
    "- Do not define a term using another undefined term unless that term is also in the list above.",
    "- Where the correct definition depends on internal policy you were not given, write TODO(verify) and say what is missing.",
    "",
    "OUTPUT: alphabetical by term, one entry per term, as a Markdown definition list.",
  );

  if (collected.found.acronyms > 0) {
    lines.push(
      "- For every acronym, expand it in full on first use, then give the definition of the expanded form.",
    );
  }
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    terms: collected.terms,
    termCount: collected.terms.length,
    totalFound: collected.totalFound,
    found: collected.found,
    sourceWords: collected.sourceWords,
    style,
    audience,
    parts: selectedParts,
    ...measureText(text),
  };
}
