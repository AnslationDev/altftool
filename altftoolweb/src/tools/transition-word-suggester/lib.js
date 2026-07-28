/**
 * Transition Word Suggester — pure logic.
 *
 * Holds a classified list of English transitions, generates the correct
 * example sentence for each from its grammatical type, and scans a passage
 * to report which transitions it already uses and how densely.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------- grammatical categories ------------------------- */

/**
 * Punctuation rules below are standard English usage:
 *  - A conjunctive adverb joining two independent clauses takes a semicolon
 *    before it and a comma after it.
 *  - A coordinating conjunction (the FANBOYS: for, and, nor, but, or, yet, so)
 *    takes a comma before it when it joins two independent clauses.
 *  - A subordinating conjunction takes a comma after its clause when that
 *    clause comes first, and normally no comma when it comes second.
 *  - A transitional phrase opening a sentence is followed by a comma.
 *  - A preposition introduces a noun phrase, never a full clause.
 */
export const TRANSITION_TYPES = {
  "conjunctive-adverb": {
    id: "conjunctive-adverb",
    label: "Conjunctive adverb",
    punctuation: "Semicolon before it, comma after it, when joining two independent clauses.",
    shortRule: "; word,",
  },
  coordinating: {
    id: "coordinating",
    label: "Coordinating conjunction",
    punctuation: "Comma before it when it joins two independent clauses; no comma when it joins two words or phrases.",
    shortRule: ", word",
  },
  subordinating: {
    id: "subordinating",
    label: "Subordinating conjunction",
    punctuation: "Comma after the subordinate clause when it comes first; usually no comma when it comes second.",
    shortRule: "Word …, main clause",
  },
  phrase: {
    id: "phrase",
    label: "Transitional phrase",
    punctuation: "Followed by a comma when it opens a sentence. Starts a new sentence — do not splice it onto the previous one with a comma.",
    shortRule: "Word, …",
  },
  preposition: {
    id: "preposition",
    label: "Preposition",
    punctuation: "Introduces a noun phrase, not a clause. Comma after the phrase when it opens the sentence.",
    shortRule: "Word + noun phrase",
  },
};

export const REGISTERS = {
  formal: { id: "formal", label: "Formal / academic" },
  neutral: { id: "neutral", label: "Neutral" },
  informal: { id: "informal", label: "Conversational" },
};

/* ------------------------------- the data -------------------------------- */

/**
 * Each relationship supplies a clause pair used to build example sentences,
 * so every example is generated from the same grammar rule rather than being
 * hand-written inconsistently. An entry may override the example where the
 * generated version would be semantically odd.
 */
export const RELATIONSHIPS = [
  {
    id: "addition",
    label: "Addition",
    description: "Stacking another point of the same kind on top of the last one.",
    clauseA: "the scheme cut waiting times",
    clauseB: "it reduced staff overtime",
    nounPhrase: "the shorter waiting times",
    entries: [
      { word: "moreover", type: "conjunctive-adverb", register: "formal" },
      { word: "furthermore", type: "conjunctive-adverb", register: "formal" },
      { word: "additionally", type: "conjunctive-adverb", register: "neutral" },
      {
        word: "also",
        type: "conjunctive-adverb",
        register: "neutral",
        ambiguous: true,
        example: "The scheme cut waiting times. It also reduced staff overtime.",
        note: "Reads better mid-clause than at the head of a sentence.",
      },
      { word: "in addition", type: "phrase", register: "formal" },
      { word: "what is more", type: "phrase", register: "neutral" },
      { word: "besides", type: "phrase", register: "informal" },
      { word: "and", type: "coordinating", register: "neutral", ambiguous: true },
    ],
  },
  {
    id: "contrast",
    label: "Contrast",
    description: "Setting one idea against another that pulls the other way.",
    clauseA: "the trial failed",
    clauseB: "the data were still useful",
    nounPhrase: "the failed trial",
    entries: [
      { word: "however", type: "conjunctive-adverb", register: "neutral" },
      { word: "nevertheless", type: "conjunctive-adverb", register: "formal" },
      { word: "nonetheless", type: "conjunctive-adverb", register: "formal" },
      {
        word: "conversely",
        type: "conjunctive-adverb",
        register: "formal",
        example: "Small clinics reported gains; conversely, the largest hospitals reported none.",
        note: "Only for a genuine reversal, not any old contrast.",
      },
      { word: "on the other hand", type: "phrase", register: "neutral" },
      {
        word: "in contrast",
        type: "phrase",
        register: "formal",
        example: "The 2023 trial failed. In contrast, the 2024 replication met every endpoint.",
      },
      { word: "but", type: "coordinating", register: "neutral" },
      { word: "yet", type: "coordinating", register: "neutral" },
      { word: "whereas", type: "subordinating", register: "formal" },
      {
        word: "while",
        type: "subordinating",
        register: "neutral",
        ambiguous: true,
        note: "Ambiguous — it also means 'at the same time'. Use 'whereas' if the contrast must be unmistakable.",
      },
    ],
  },
  {
    id: "cause",
    label: "Cause / reason",
    description: "Naming why something happened.",
    clauseA: "rainfall stopped in June",
    clauseB: "the crop failed",
    nounPhrase: "three dry months",
    entries: [
      { word: "because", type: "subordinating", register: "neutral" },
      {
        word: "since",
        type: "subordinating",
        register: "neutral",
        ambiguous: true,
        note: "Can also mean 'from that time', so avoid it where a date is nearby.",
      },
      { word: "as", type: "subordinating", register: "neutral", ambiguous: true },
      { word: "given that", type: "subordinating", register: "formal" },
      { word: "for", type: "coordinating", register: "formal", reverse: true, ambiguous: true },
      { word: "because of", type: "preposition", register: "neutral" },
      { word: "owing to", type: "preposition", register: "formal" },
      {
        word: "due to",
        type: "preposition",
        register: "neutral",
        note: "Traditionally follows a linking verb ('the delay was due to rain'). 'Owing to' is safer at the head of a sentence in formal writing.",
      },
      { word: "on account of", type: "preposition", register: "formal" },
    ],
  },
  {
    id: "effect",
    label: "Effect / result",
    description: "Naming what followed from something.",
    clauseA: "the monsoon failed",
    clauseB: "food prices rose sharply",
    nounPhrase: "the failed monsoon",
    entries: [
      { word: "therefore", type: "conjunctive-adverb", register: "formal" },
      { word: "consequently", type: "conjunctive-adverb", register: "formal" },
      { word: "thus", type: "conjunctive-adverb", register: "formal" },
      { word: "hence", type: "conjunctive-adverb", register: "formal" },
      { word: "accordingly", type: "conjunctive-adverb", register: "formal" },
      { word: "as a result", type: "phrase", register: "neutral" },
      { word: "for this reason", type: "phrase", register: "neutral" },
      { word: "so", type: "coordinating", register: "neutral", ambiguous: true },
    ],
  },
  {
    id: "sequence",
    label: "Sequence / order",
    description: "Putting steps or events in order.",
    clauseA: "the sample was weighed",
    clauseB: "it was heated for ten minutes",
    nounPhrase: "the weighing step",
    entries: [
      { word: "first", type: "phrase", register: "neutral", ambiguous: true, example: "First, weigh the dry sample." },
      { word: "next", type: "phrase", register: "neutral", ambiguous: true, example: "Next, transfer it to the crucible." },
      { word: "then", type: "conjunctive-adverb", register: "neutral", ambiguous: true },
      { word: "subsequently", type: "conjunctive-adverb", register: "formal" },
      {
        word: "afterwards",
        type: "conjunctive-adverb",
        register: "neutral",
        example: "The sample was weighed; afterwards, it was cooled in a desiccator.",
      },
      {
        word: "meanwhile",
        type: "conjunctive-adverb",
        register: "neutral",
        example: "The sample was weighed; meanwhile, the furnace was brought up to temperature.",
      },
      { word: "finally", type: "phrase", register: "neutral", example: "Finally, record the mass to three decimal places." },
      { word: "to begin with", type: "phrase", register: "neutral", example: "To begin with, calibrate the balance." },
    ],
  },
  {
    id: "example",
    label: "Example / illustration",
    description: "Giving an instance of a general claim.",
    clauseA: "several crops failed that year",
    clauseB: "millet and groundnut lost half their yield",
    nounPhrase: "millet and groundnut",
    entries: [
      { word: "for example", type: "phrase", register: "neutral" },
      { word: "for instance", type: "phrase", register: "neutral" },
      { word: "to illustrate", type: "phrase", register: "formal" },
      { word: "in particular", type: "phrase", register: "neutral" },
      {
        word: "namely",
        type: "conjunctive-adverb",
        register: "formal",
        example: "Two crops failed outright: namely, millet and groundnut.",
        note: "Introduces the complete list, not a sample from it.",
      },
      { word: "specifically", type: "conjunctive-adverb", register: "neutral" },
      {
        word: "such as",
        type: "preposition",
        register: "neutral",
        example: "Several crops, such as millet and groundnut, lost half their yield.",
      },
      {
        word: "including",
        type: "preposition",
        register: "neutral",
        example: "Several crops, including millet and groundnut, lost half their yield.",
      },
    ],
  },
  {
    id: "emphasis",
    label: "Emphasis",
    description: "Turning the volume up on the point you just made.",
    clauseA: "the delay was costly",
    clauseB: "it wiped out the year's margin",
    nounPhrase: "the cost of the delay",
    entries: [
      { word: "indeed", type: "conjunctive-adverb", register: "formal" },
      { word: "in fact", type: "phrase", register: "neutral" },
      { word: "notably", type: "conjunctive-adverb", register: "formal" },
      { word: "above all", type: "phrase", register: "neutral", example: "Above all, the delay wiped out the year's margin." },
      {
        word: "most importantly",
        type: "phrase",
        register: "neutral",
        example: "Most importantly, the delay wiped out the year's margin.",
      },
      { word: "more than that", type: "phrase", register: "informal" },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    description: "Showing that two things behave alike.",
    clauseA: "Kerala reported a fall in cases",
    clauseB: "Tamil Nadu recorded its lowest figure in a decade",
    nounPhrase: "the Kerala figures",
    entries: [
      { word: "similarly", type: "conjunctive-adverb", register: "neutral" },
      { word: "likewise", type: "conjunctive-adverb", register: "formal" },
      { word: "equally", type: "conjunctive-adverb", register: "formal" },
      { word: "correspondingly", type: "conjunctive-adverb", register: "formal" },
      { word: "in the same way", type: "phrase", register: "neutral" },
      { word: "just as", type: "subordinating", register: "neutral" },
      { word: "compared with", type: "preposition", register: "formal" },
    ],
  },
  {
    id: "concession",
    label: "Concession",
    description: "Admitting a point before pushing past it.",
    clauseA: "the sample was small",
    clauseB: "the effect was unmistakable",
    nounPhrase: "the small sample",
    entries: [
      { word: "although", type: "subordinating", register: "neutral" },
      { word: "though", type: "subordinating", register: "neutral" },
      { word: "even though", type: "subordinating", register: "neutral" },
      { word: "even so", type: "conjunctive-adverb", register: "neutral" },
      { word: "regardless", type: "conjunctive-adverb", register: "neutral" },
      {
        word: "admittedly",
        type: "phrase",
        register: "formal",
        example: "Admittedly, the sample was small, but the effect was unmistakable.",
      },
      {
        word: "granted",
        type: "phrase",
        register: "neutral",
        example: "Granted, the sample was small — the effect was still unmistakable.",
      },
      { word: "despite", type: "preposition", register: "neutral" },
      { word: "in spite of", type: "preposition", register: "neutral" },
    ],
  },
  {
    id: "condition",
    label: "Condition",
    description: "Making one thing depend on another.",
    clauseA: "the monsoon arrives on time",
    clauseB: "the crop will recover",
    nounPhrase: "an on-time monsoon",
    entries: [
      { word: "if", type: "subordinating", register: "neutral", ambiguous: true },
      { word: "provided that", type: "subordinating", register: "formal" },
      { word: "as long as", type: "subordinating", register: "neutral" },
      { word: "assuming that", type: "subordinating", register: "neutral" },
      {
        word: "unless",
        type: "subordinating",
        register: "neutral",
        example: "Unless the monsoon arrives on time, the crop will fail.",
        note: "Means 'if not' — do not add another negative after it.",
      },
      {
        word: "in the event that",
        type: "subordinating",
        register: "formal",
        example: "In the event that the monsoon fails, the state will release buffer stock.",
      },
      {
        word: "otherwise",
        type: "conjunctive-adverb",
        register: "neutral",
        example: "Sow before the rains arrive; otherwise, the seedlings will not survive.",
      },
      { word: "in that case", type: "phrase", register: "neutral" },
    ],
  },
  {
    id: "clarification",
    label: "Clarification",
    description: "Saying the same thing again in plainer or tighter words.",
    clauseA: "the policy is revenue-neutral",
    clauseB: "it raises and refunds the same amount",
    nounPhrase: "revenue neutrality",
    entries: [
      { word: "that is", type: "phrase", register: "formal" },
      { word: "in other words", type: "phrase", register: "neutral" },
      { word: "to put it another way", type: "phrase", register: "neutral" },
      { word: "more precisely", type: "phrase", register: "formal" },
      { word: "simply put", type: "phrase", register: "informal" },
    ],
  },
  {
    id: "summary",
    label: "Summary / conclusion",
    description: "Pulling everything into one closing judgement.",
    clauseA: "the pilot missed two of its three targets",
    clauseB: "the approach is not ready to scale",
    nounPhrase: "the pilot results",
    entries: [
      { word: "in conclusion", type: "phrase", register: "neutral" },
      { word: "to summarise", type: "phrase", register: "neutral" },
      { word: "to sum up", type: "phrase", register: "neutral" },
      { word: "in short", type: "phrase", register: "neutral" },
      { word: "on balance", type: "phrase", register: "formal" },
      { word: "all in all", type: "phrase", register: "informal" },
      { word: "overall", type: "conjunctive-adverb", register: "neutral" },
      { word: "ultimately", type: "conjunctive-adverb", register: "neutral" },
    ],
  },
];

/* ---------------------------- editorial limits ---------------------------- */

/**
 * Editorial thresholds used by this tool — judgement calls for flagging a
 * passage, not published standards.
 * A transition every twelve words or so means roughly one per sentence, which
 * reads as machine-written; three uses of the same connective in one passage
 * is where repetition becomes audible.
 */
export const HEAVY_DENSITY_PER_100_WORDS = 8;
export const REPEAT_FLAG_COUNT = 3;

/* -------------------------------- helpers -------------------------------- */

const capitalise = (text) => {
  const value = String(text ?? "");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
};

const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build the example sentence for an entry from its grammatical type, unless
 * the entry supplies its own.
 */
export function exampleFor(entry, relationship) {
  if (!entry || !relationship) return "";
  if (entry.example) return entry.example;

  const a = entry.reverse ? relationship.clauseB : relationship.clauseA;
  const b = entry.reverse ? relationship.clauseA : relationship.clauseB;
  const word = entry.word;

  switch (entry.type) {
    case "conjunctive-adverb":
      return `${capitalise(a)}; ${word}, ${b}.`;
    case "coordinating":
      return `${capitalise(a)}, ${word} ${b}.`;
    case "subordinating":
      return `${capitalise(word)} ${a}, ${b}.`;
    case "preposition":
      return `${capitalise(word)} ${relationship.nounPhrase}, ${b}.`;
    case "phrase":
    default:
      return `${capitalise(a)}. ${capitalise(word)}, ${b}.`;
  }
}

/** Flattened list of every entry, each carrying its relationship and example. */
export const ALL_TRANSITIONS = RELATIONSHIPS.flatMap((relationship) =>
  relationship.entries.map((entry) => ({
    ...entry,
    relationship: relationship.id,
    relationshipLabel: relationship.label,
    typeLabel: TRANSITION_TYPES[entry.type].label,
    punctuation: TRANSITION_TYPES[entry.type].punctuation,
    example: exampleFor(entry, relationship),
  })),
);

/**
 * Filter the transition list.
 *
 * @param {object} query
 * @param {string} query.relationship  Relationship id, or "all".
 * @param {string} query.register      Register id, or "all".
 * @param {string} query.type          Grammatical type id, or "all".
 * @param {string} query.search        Free-text filter on the word.
 * @returns {object} { items, count } or { error }.
 */
export function suggestTransitions(query = {}) {
  const { relationship = "all", register = "all", type = "all", search = "" } = query;

  if (relationship !== "all" && !RELATIONSHIPS.some((item) => item.id === relationship)) {
    return { error: "Unknown relationship — choose one from the list." };
  }
  if (register !== "all" && !REGISTERS[register]) {
    return { error: "Unknown register — choose formal, neutral or conversational." };
  }
  if (type !== "all" && !TRANSITION_TYPES[type]) {
    return { error: "Unknown grammatical type." };
  }

  const needle = String(search ?? "").trim().toLowerCase();

  const items = ALL_TRANSITIONS.filter((entry) => {
    if (relationship !== "all" && entry.relationship !== relationship) return false;
    if (register !== "all" && entry.register !== register) return false;
    if (type !== "all" && entry.type !== type) return false;
    if (needle && !entry.word.toLowerCase().includes(needle)) return false;
    return true;
  });

  return {
    items,
    count: items.length,
    relationship,
    register,
    type,
  };
}

/** Word count on whitespace tokens. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Scan a passage for the transitions in the list.
 *
 * Longer phrases are matched first and then blanked out, so "in addition" is
 * never recounted as a shorter transition hiding inside it.
 *
 * Entries flagged `ambiguous` (and, as, for, if, so, since, while, then, also,
 * first, next) are everyday function words that usually appear in a
 * non-transitional sense. They are reported separately and kept out of the
 * density figure unless `includeAmbiguous` is set, so ordinary prose does not
 * look like it is drowning in connectives.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {boolean} [options.includeAmbiguous=false]
 */
export function analyseText(text, options = {}) {
  const { includeAmbiguous = false } = options;
  const source = String(text ?? "");
  const words = countWords(source);
  if (words === 0) {
    return { error: "Paste a paragraph to scan it for transitions." };
  }

  const ordered = [...ALL_TRANSITIONS].sort((a, b) => b.word.length - a.word.length);
  let remaining = source.toLowerCase();
  const matched = [];

  ordered.forEach((entry) => {
    const pattern = new RegExp(`(?<![\\p{L}'-])${escapeRegExp(entry.word.toLowerCase())}(?![\\p{L}'-])`, "gu");
    const matches = remaining.match(pattern);
    if (!matches || matches.length === 0) return;
    matched.push({ ...entry, count: matches.length });
    // Blank the matched text so shorter transitions inside it are not recounted.
    remaining = remaining.replace(pattern, (match) => "\0".repeat(match.length));
  });

  const byCount = (a, b) => b.count - a.count || a.word.localeCompare(b.word);
  const ambiguousUses = matched.filter((item) => item.ambiguous).sort(byCount);
  const found = (includeAmbiguous ? matched : matched.filter((item) => !item.ambiguous)).sort(byCount);

  const totalUses = found.reduce((sum, item) => sum + item.count, 0);
  const densityPer100 = (totalUses / words) * 100;
  const overused = found.filter((item) => item.count >= REPEAT_FLAG_COUNT).sort(byCount);
  const relationshipsUsed = Array.from(new Set(found.map((item) => item.relationshipLabel))).sort();

  return {
    words,
    totalUses,
    uniqueTransitions: found.length,
    densityPer100: Math.round(densityPer100 * 10) / 10,
    heavy: densityPer100 > HEAVY_DENSITY_PER_100_WORDS,
    overused,
    found,
    ambiguousUses,
    ambiguousTotal: ambiguousUses.reduce((sum, item) => sum + item.count, 0),
    includeAmbiguous,
    relationshipsUsed,
  };
}

/** Render a filtered result as copyable plain text. */
export function resultToText(result) {
  if (!result || result.error || !Array.isArray(result.items)) return "";
  return result.items
    .map((entry) => `${entry.word} (${entry.relationshipLabel}, ${entry.typeLabel})\n  ${entry.example}`)
    .join("\n");
}
