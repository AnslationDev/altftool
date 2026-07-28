/**
 * Formal ↔ Informal Word Swapper — pair data and a pure text converter.
 *
 * Each pair records a casual form and the formal register equivalent, plus the
 * category it belongs to and how safe the swap is:
 *
 *   strength: "safe"    — the swap works in essentially any sentence
 *   strength: "context" — the swap is often right but depends on the sentence
 *                         ("about" → "regarding" is wrong in "about ten kilos"),
 *                         so it is applied only when contextual swaps are asked for
 *
 * Longer phrases are replaced before shorter ones, matching is whole-word and
 * case-insensitive, and the original capitalisation is carried across. The
 * formal→informal direction is deliberately narrower: turning "utilise" back
 * into "use" is safe, but no automatic tool can rewrite a sentence's tone.
 */

export const CATEGORIES = [
  { id: "phrasal", label: "Phrasal verbs" },
  { id: "vocabulary", label: "Everyday vocabulary" },
  { id: "connectives", label: "Connectives & linking" },
  { id: "contractions", label: "Contractions" },
  { id: "email", label: "Email openings & sign-offs" },
  { id: "hedges", label: "Hedges & intensifiers" },
];

export const DIRECTIONS = [
  { id: "toFormal", label: "Informal → formal" },
  { id: "toInformal", label: "Formal → informal" },
];

export const PAIRS = [
  // Phrasal verbs — the single biggest register marker in English
  { id: "ask-for", informal: "ask for", formal: "request", category: "phrasal", strength: "safe", note: "" },
  { id: "bring-about", informal: "bring about", formal: "cause", category: "phrasal", strength: "safe", note: "" },
  { id: "carry-out", informal: "carry out", formal: "conduct", category: "phrasal", strength: "safe", note: "" },
  { id: "come-up-with", informal: "come up with", formal: "devise", category: "phrasal", strength: "safe", note: "" },
  { id: "cut-down-on", informal: "cut down on", formal: "reduce", category: "phrasal", strength: "safe", note: "" },
  { id: "deal-with", informal: "deal with", formal: "address", category: "phrasal", strength: "safe", note: "" },
  { id: "find-out", informal: "find out", formal: "determine", category: "phrasal", strength: "safe", note: "" },
  { id: "get-rid-of", informal: "get rid of", formal: "eliminate", category: "phrasal", strength: "safe", note: "" },
  { id: "give-up", informal: "give up", formal: "abandon", category: "phrasal", strength: "safe", note: "" },
  { id: "go-on", informal: "go on", formal: "continue", category: "phrasal", strength: "safe", note: "" },
  { id: "go-up", informal: "go up", formal: "increase", category: "phrasal", strength: "safe", note: "" },
  { id: "go-down", informal: "go down", formal: "decrease", category: "phrasal", strength: "safe", note: "" },
  { id: "leave-out", informal: "leave out", formal: "omit", category: "phrasal", strength: "safe", note: "" },
  { id: "look-into", informal: "look into", formal: "investigate", category: "phrasal", strength: "safe", note: "" },
  { id: "make-sure", informal: "make sure", formal: "ensure", category: "phrasal", strength: "safe", note: "" },
  { id: "make-up", informal: "make up", formal: "constitute", category: "phrasal", strength: "context", note: "Only when it means 'form the whole' — not 'make up a story'." },
  { id: "point-out", informal: "point out", formal: "indicate", category: "phrasal", strength: "safe", note: "" },
  { id: "put-off", informal: "put off", formal: "postpone", category: "phrasal", strength: "safe", note: "" },
  { id: "put-up-with", informal: "put up with", formal: "tolerate", category: "phrasal", strength: "safe", note: "" },
  { id: "set-up", informal: "set up", formal: "establish", category: "phrasal", strength: "safe", note: "" },
  { id: "show-up", informal: "show up", formal: "attend", category: "phrasal", strength: "context", note: "Use 'appear' where nobody was invited." },
  { id: "sort-out", informal: "sort out", formal: "resolve", category: "phrasal", strength: "safe", note: "" },
  { id: "speed-up", informal: "speed up", formal: "accelerate", category: "phrasal", strength: "safe", note: "" },
  { id: "talk-about", informal: "talk about", formal: "discuss", category: "phrasal", strength: "safe", note: "" },
  { id: "think-about", informal: "think about", formal: "consider", category: "phrasal", strength: "safe", note: "" },
  { id: "throw-away", informal: "throw away", formal: "discard", category: "phrasal", strength: "safe", note: "" },
  { id: "turn-down", informal: "turn down", formal: "reject", category: "phrasal", strength: "context", note: "Not when it means lowering a volume or a thermostat." },
  { id: "use-up", informal: "use up", formal: "exhaust", category: "phrasal", strength: "safe", note: "" },
  { id: "work-out", informal: "work out", formal: "calculate", category: "phrasal", strength: "context", note: "Not in the exercise sense." },
  { id: "get-in-touch-with", informal: "get in touch with", formal: "contact", category: "phrasal", strength: "safe", note: "" },
  { id: "take-away", informal: "take away", formal: "remove", category: "phrasal", strength: "safe", note: "" },
  { id: "hand-in", informal: "hand in", formal: "submit", category: "phrasal", strength: "safe", note: "" },
  { id: "put-in-place", informal: "put in place", formal: "implement", category: "phrasal", strength: "safe", note: "" },
  { id: "try-out", informal: "try out", formal: "test", category: "phrasal", strength: "safe", note: "" },
  { id: "wrap-up", informal: "wrap up", formal: "finalise", category: "phrasal", strength: "safe", note: "" },
  { id: "build-up", informal: "build up", formal: "accumulate", category: "phrasal", strength: "safe", note: "" },
  { id: "get-across", informal: "get across", formal: "convey", category: "phrasal", strength: "safe", note: "" },
  { id: "look-forward-to", informal: "look forward to", formal: "anticipate", category: "phrasal", strength: "context", note: "In a sign-off, 'I look forward to' is already correct formal English — leave it." },

  // Everyday vocabulary
  { id: "a-lot-of", informal: "a lot of", formal: "a considerable amount of", category: "vocabulary", strength: "safe", note: "" },
  { id: "lots-of", informal: "lots of", formal: "numerous", category: "vocabulary", strength: "safe", note: "" },
  { id: "loads-of", informal: "loads of", formal: "a large number of", category: "vocabulary", strength: "safe", note: "" },
  { id: "big", informal: "big", formal: "substantial", category: "vocabulary", strength: "context", note: "Only for size or scale, never for a physically large object." },
  { id: "huge", informal: "huge", formal: "extensive", category: "vocabulary", strength: "context", note: "" },
  { id: "small", informal: "small", formal: "minor", category: "vocabulary", strength: "context", note: "Only for importance, not physical size." },
  { id: "tiny", informal: "tiny", formal: "negligible", category: "vocabulary", strength: "context", note: "" },
  { id: "good", informal: "good", formal: "satisfactory", category: "vocabulary", strength: "context", note: "'Satisfactory' is noticeably cooler than 'good' — check that is what you mean." },
  { id: "bad", informal: "bad", formal: "unsatisfactory", category: "vocabulary", strength: "context", note: "" },
  { id: "get", informal: "get", formal: "obtain", category: "vocabulary", strength: "context", note: "'Get' has dozens of senses; check each replacement." },
  { id: "buy", informal: "buy", formal: "purchase", category: "vocabulary", strength: "safe", note: "" },
  { id: "need", informal: "need", formal: "require", category: "vocabulary", strength: "safe", note: "" },
  { id: "help", informal: "help", formal: "assist", category: "vocabulary", strength: "safe", note: "" },
  { id: "show", informal: "show", formal: "demonstrate", category: "vocabulary", strength: "safe", note: "" },
  { id: "tell", informal: "tell", formal: "inform", category: "vocabulary", strength: "context", note: "'Inform' takes an object: inform the client, not inform that." },
  { id: "start", informal: "start", formal: "commence", category: "vocabulary", strength: "safe", note: "'Begin' is a lighter alternative if 'commence' feels stiff." },
  { id: "end", informal: "end", formal: "conclude", category: "vocabulary", strength: "safe", note: "" },
  { id: "keep", informal: "keep", formal: "retain", category: "vocabulary", strength: "safe", note: "" },
  { id: "give", informal: "give", formal: "provide", category: "vocabulary", strength: "safe", note: "" },
  { id: "want", informal: "want", formal: "wish", category: "vocabulary", strength: "safe", note: "" },
  { id: "let", informal: "let", formal: "permit", category: "vocabulary", strength: "context", note: "Not in 'let us know' or 'let's'." },
  { id: "fix", informal: "fix", formal: "repair", category: "vocabulary", strength: "safe", note: "" },
  { id: "ask", informal: "ask", formal: "enquire", category: "vocabulary", strength: "context", note: "'Enquire' fits questions; use 'request' for things." },
  { id: "try", informal: "try", formal: "attempt", category: "vocabulary", strength: "safe", note: "" },
  { id: "use", informal: "use", formal: "utilise", category: "vocabulary", strength: "context", note: "'Utilise' is widely criticised as padding. 'Use' is correct in formal writing too." },
  { id: "tough", informal: "tough", formal: "difficult", category: "vocabulary", strength: "safe", note: "" },
  { id: "cheap", informal: "cheap", formal: "inexpensive", category: "vocabulary", strength: "safe", note: "" },
  { id: "rich", informal: "rich", formal: "affluent", category: "vocabulary", strength: "context", note: "" },

  // Connectives
  { id: "so", informal: "so", formal: "therefore", category: "connectives", strength: "context", note: "Only where 'so' means 'as a result'." },
  { id: "but", informal: "but", formal: "however", category: "connectives", strength: "context", note: "'However' needs different punctuation — usually a semicolon or a new sentence." },
  { id: "also", informal: "also", formal: "in addition", category: "connectives", strength: "context", note: "" },
  { id: "plus", informal: "plus", formal: "furthermore", category: "connectives", strength: "safe", note: "" },
  { id: "anyway", informal: "anyway", formal: "nevertheless", category: "connectives", strength: "safe", note: "" },
  { id: "before", informal: "before", formal: "prior to", category: "connectives", strength: "context", note: "Only as a preposition, never as a conjunction." },
  { id: "after", informal: "after", formal: "following", category: "connectives", strength: "context", note: "" },
  { id: "about", informal: "about", formal: "regarding", category: "connectives", strength: "context", note: "Wrong when 'about' means approximately." },
  { id: "till", informal: "till", formal: "until", category: "connectives", strength: "safe", note: "" },

  // Hedges and intensifiers
  { id: "maybe", informal: "maybe", formal: "perhaps", category: "hedges", strength: "safe", note: "" },
  { id: "kind-of", informal: "kind of", formal: "somewhat", category: "hedges", strength: "safe", note: "" },
  { id: "sort-of", informal: "sort of", formal: "rather", category: "hedges", strength: "safe", note: "" },
  { id: "a-bit", informal: "a bit", formal: "slightly", category: "hedges", strength: "safe", note: "" },
  { id: "really", informal: "really", formal: "particularly", category: "hedges", strength: "context", note: "" },
  { id: "very", informal: "very", formal: "highly", category: "hedges", strength: "context", note: "Deleting the intensifier is usually better than upgrading it." },
  { id: "right-now", informal: "right now", formal: "currently", category: "hedges", strength: "safe", note: "" },
  { id: "these-days", informal: "these days", formal: "at present", category: "hedges", strength: "safe", note: "" },
  { id: "soon", informal: "soon", formal: "shortly", category: "hedges", strength: "safe", note: "" },
  { id: "later", informal: "later", formal: "subsequently", category: "hedges", strength: "context", note: "" },

  // Contractions
  { id: "cant", informal: "can't", formal: "cannot", category: "contractions", strength: "safe", note: "" },
  { id: "dont", informal: "don't", formal: "do not", category: "contractions", strength: "safe", note: "" },
  { id: "doesnt", informal: "doesn't", formal: "does not", category: "contractions", strength: "safe", note: "" },
  { id: "didnt", informal: "didn't", formal: "did not", category: "contractions", strength: "safe", note: "" },
  { id: "wont", informal: "won't", formal: "will not", category: "contractions", strength: "safe", note: "" },
  { id: "isnt", informal: "isn't", formal: "is not", category: "contractions", strength: "safe", note: "" },
  { id: "wasnt", informal: "wasn't", formal: "was not", category: "contractions", strength: "safe", note: "" },
  { id: "havent", informal: "haven't", formal: "have not", category: "contractions", strength: "safe", note: "" },
  { id: "wouldnt", informal: "wouldn't", formal: "would not", category: "contractions", strength: "safe", note: "" },
  { id: "couldnt", informal: "couldn't", formal: "could not", category: "contractions", strength: "safe", note: "" },
  { id: "shouldnt", informal: "shouldn't", formal: "should not", category: "contractions", strength: "safe", note: "" },
  { id: "im", informal: "i'm", formal: "I am", category: "contractions", strength: "safe", note: "" },
  { id: "were-contraction", informal: "we're", formal: "we are", category: "contractions", strength: "safe", note: "" },
  { id: "youre", informal: "you're", formal: "you are", category: "contractions", strength: "safe", note: "" },
  { id: "thats", informal: "that's", formal: "that is", category: "contractions", strength: "safe", note: "" },
  { id: "theres", informal: "there's", formal: "there is", category: "contractions", strength: "safe", note: "" },
  { id: "lets", informal: "let's", formal: "let us", category: "contractions", strength: "safe", note: "" },
  { id: "its-contraction", informal: "it's", formal: "it is", category: "contractions", strength: "context", note: "Only correct where it's stands for 'it is', not 'it has'." },

  // Email openings and sign-offs
  { id: "hi", informal: "hi", formal: "Dear", category: "email", strength: "context", note: "Follow with a name and a comma." },
  { id: "hey", informal: "hey", formal: "Dear", category: "email", strength: "context", note: "" },
  { id: "thanks", informal: "thanks", formal: "thank you", category: "email", strength: "safe", note: "" },
  { id: "thanks-a-lot", informal: "thanks a lot", formal: "thank you very much", category: "email", strength: "safe", note: "" },
  { id: "cheers", informal: "cheers", formal: "kind regards", category: "email", strength: "context", note: "As a sign-off only, not the drinking sense." },
  { id: "bye", informal: "bye", formal: "regards", category: "email", strength: "context", note: "" },
  { id: "asap", informal: "asap", formal: "as soon as possible", category: "email", strength: "safe", note: "" },
  { id: "fyi", informal: "fyi", formal: "for your information", category: "email", strength: "safe", note: "" },
  { id: "sorry", informal: "sorry", formal: "I apologise", category: "email", strength: "context", note: "Rewrite the sentence around it rather than swapping the word alone." },
];

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const DIRECTION_IDS = new Set(DIRECTIONS.map((d) => d.id));

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Normalise curly apostrophes so "don’t" and "don't" behave identically. */
function normaliseApostrophes(value) {
  return String(value).replace(/[‘’ʼ]/g, "'");
}

/**
 * Carry the source's capitalisation onto the replacement:
 * ALL CAPS stays all caps, Leading Capital stays capitalised, otherwise the
 * replacement's own casing is kept (so "I am" and "Dear" survive).
 */
function applyCase(source, target) {
  const letters = source.replace(/[^A-Za-z]/g, "");
  if (letters.length > 1 && letters === letters.toUpperCase()) {
    // An all-caps acronym expands to a normal phrase, not a shouted one:
    // ASAP becomes "As soon as possible", but CAN'T still becomes CANNOT.
    return target.includes(" ")
      ? target.charAt(0).toUpperCase() + target.slice(1)
      : target.toUpperCase();
  }
  const first = source.match(/[A-Za-z]/)?.[0] ?? "";
  if (first && first === first.toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

/** Build a lowercase source-phrase → { target, pair } map for one direction. */
function buildLookup(direction, includeContextual, category) {
  const map = new Map();
  for (const pair of PAIRS) {
    if (category !== "all" && pair.category !== category) continue;
    if (!includeContextual && pair.strength !== "safe") continue;
    const source = direction === "toFormal" ? pair.informal : pair.formal;
    const target = direction === "toFormal" ? pair.formal : pair.informal;
    const key = normaliseApostrophes(source).toLowerCase();
    if (!map.has(key)) map.set(key, { target, pair });
  }
  return map;
}

/**
 * Convert a block of text between registers.
 *
 * Options:
 *   direction          "toFormal" (default) or "toInformal"
 *   includeContextual  also apply swaps that depend on the sentence (default false)
 *   category           limit to one category id, or "all" (default)
 *
 * Returns { error } for empty text or an unknown direction. Otherwise
 * { output, changes, changeCount, wordCount, direction, ... }. Longest phrases
 * are matched first and each stretch of text is rewritten only once.
 */
export function convertText(input, options = {}) {
  const {
    direction = "toFormal",
    includeContextual = false,
    category = "all",
  } = options ?? {};

  if (!DIRECTION_IDS.has(direction)) {
    return { error: "Choose a direction: informal to formal, or formal to informal." };
  }
  const safeCategory = category === "all" || CATEGORY_IDS.has(category) ? category : "all";

  const text = normaliseApostrophes(typeof input === "string" ? input : String(input ?? ""));
  if (text.trim().length === 0) {
    return { error: "Type or paste some text to convert." };
  }

  const lookup = buildLookup(direction, includeContextual, safeCategory);
  const keys = Array.from(lookup.keys()).sort((a, b) => b.length - a.length);

  if (keys.length === 0) {
    return { error: "No swaps are available for that combination of category and settings." };
  }

  const pattern = new RegExp(`\\b(?:${keys.map(escapeRegExp).join("|")})\\b`, "gi");
  const changes = [];

  const output = text.replace(pattern, (matched, offset) => {
    const entry = lookup.get(matched.toLowerCase());
    if (!entry) return matched;
    const replacement = applyCase(matched, entry.target);
    changes.push({
      id: `${entry.pair.id}-${offset}`,
      from: matched,
      to: replacement,
      index: offset,
      category: entry.pair.category,
      strength: entry.pair.strength,
      note: entry.pair.note,
    });
    return replacement;
  });

  const wordCount = (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? []).length;

  return {
    output,
    changes,
    changeCount: changes.length,
    wordCount,
    direction,
    category: safeCategory,
    includeContextual: Boolean(includeContextual),
    swapsAvailable: keys.length,
  };
}

export function categoryCounts() {
  const counts = {};
  for (const { id } of CATEGORIES) counts[id] = 0;
  for (const pair of PAIRS) {
    if (counts[pair.category] === undefined) counts[pair.category] = 0;
    counts[pair.category] += 1;
  }
  return counts;
}

export function pairStats() {
  return {
    total: PAIRS.length,
    safe: PAIRS.filter((pair) => pair.strength === "safe").length,
    contextual: PAIRS.filter((pair) => pair.strength === "context").length,
  };
}

/** Browse the pair list, optionally filtered by category and free text. */
export function searchPairs({ query = "", category = "all" } = {}) {
  const safeCategory = category === "all" || CATEGORY_IDS.has(category) ? category : "all";
  const needle = String(query ?? "").toLowerCase().trim();
  const results = PAIRS.filter((pair) => {
    if (safeCategory !== "all" && pair.category !== safeCategory) return false;
    if (!needle) return true;
    return (
      pair.informal.toLowerCase().includes(needle) ||
      pair.formal.toLowerCase().includes(needle)
    );
  });
  return { results, matched: results.length, total: PAIRS.length, category: safeCategory };
}
