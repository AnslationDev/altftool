/**
 * Feed headlines are written for a page, not for a SERP: the ten live items on
 * /news run 50–100 characters, and appending the publication suffix pushed every
 * one of them past the ~60 characters a mobile result renders. Mobile is where
 * this site earns its clicks, so the headline gets clamped to what is left of
 * the budget after the suffix.
 *
 * A hard character cut reads as broken ("Federal agents placed on leave after
 * fatal"), so the clamp cuts on the headline's own phrase structure: at its
 * punctuation first, then immediately BEFORE a word that opens a new clause or
 * phrase, and only as a last resort at a plain word boundary with any dangling
 * preposition or article removed.
 *
 * The suffix is part of the title, not appended by the root layout: it matches
 * the trailing-brand test in createPageMetadata's resolveDocumentTitle, which
 * makes the title absolute and suppresses the layout's " | AltFTool" template.
 */
export const NEWS_TITLE_SUFFIX = " | AltFTool News";
export const NEWS_TITLE_MAX_LENGTH = 60;
export const NEWS_HEADLINE_BUDGET = NEWS_TITLE_MAX_LENGTH - NEWS_TITLE_SUFFIX.length;

// Cutting before one of these leaves a finished thought behind it.
const CLAUSE_OPENERS = new Set([
  "after", "although", "amid", "and", "as", "because", "before", "besides",
  "but", "despite", "during", "following", "however", "if", "meanwhile", "nor",
  "once", "or", "say", "says", "said", "since", "so", "than", "that", "though",
  "unless", "until", "when", "whether", "which", "while", "who", "whom",
  "whose", "why", "yet",
]);

// Phrase heads. Still a legitimate cut, just a weaker one than a clause break.
const PHRASE_OPENERS = new Set([
  "about", "above", "across", "against", "along", "among", "around", "at",
  "behind", "below", "beneath", "beside", "between", "beyond", "by", "for",
  "from", "in", "inside", "into", "near", "of", "off", "on", "onto", "out",
  "outside", "over", "per", "through", "to", "toward", "towards", "under",
  "underneath", "up", "upon", "via", "with", "within", "without",
]);

// A clamped headline may never end on one of these — the phrase would dangle.
const DANGLING_TAIL = new Set([
  ...CLAUSE_OPENERS,
  ...PHRASE_OPENERS,
  "a", "an", "the", "its", "his", "her", "their", "our", "your", "this",
  "these", "those", "is", "are", "was", "were", "be", "been", "being", "has",
  "have", "had", "will", "would", "can", "could", "may", "might", "not", "no",
]);

// A clause break is worth roughly this many characters of extra headline: it
// buys a title that reads as a finished phrase instead of a longer fragment.
const CLAUSE_BONUS = 14;

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function bareWord(word = "") {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9'’-]/g, "")
    .replace(/^[-'’]+|[-'’]+$/g, "");
}

function tidyEnd(text = "") {
  return text.replace(/[\s,;:.–—-]+$/g, "").trim();
}

/**
 * Trim a headline to `budget` characters on a phrase boundary. Returns the
 * headline unchanged when it already fits.
 */
export function clampHeadline(headline, budget = NEWS_HEADLINE_BUDGET) {
  const text = normalizeWhitespace(headline);
  if (!text || text.length <= budget) return text;

  const words = text.split(" ");
  const candidates = [];
  let prefix = "";

  for (const word of words) {
    const next = prefix ? `${prefix} ${word}` : word;
    if (next.length > budget) break;

    if (prefix) {
      const opener = bareWord(word);
      if (CLAUSE_OPENERS.has(opener)) {
        candidates.push({ text: prefix, score: prefix.length + CLAUSE_BONUS });
      } else if (PHRASE_OPENERS.has(opener)) {
        candidates.push({ text: prefix, score: prefix.length });
      }
    }

    prefix = next;

    // The headline's own punctuation is the strongest boundary available.
    if (/[,;:–—]$/.test(word)) {
      const clause = tidyEnd(prefix);
      if (clause) candidates.push({ text: clause, score: clause.length + CLAUSE_BONUS });
    }
  }

  // Last resort: the longest word-boundary prefix, with any dangling
  // preposition, conjunction, article or auxiliary peeled off the end.
  //
  // Peeling only the LAST word was not enough, because the fallback competes on
  // raw length and routinely outscored a clean phrase boundary. Measured on
  // production: "Buttler breaks T20 runs record in Super Giants win" shipped as
  // "Buttler breaks T20 runs record in Super" (the phrase-boundary candidate
  // "…runs record" scored 29 and lost to the 39-character fragment), and
  // "PSA: Apple's Private Relay can leak your real IP address" shipped as
  // "PSA: Apple's Private Relay can leak". Neither final word is itself a
  // dangling one — "Super" and "leak" are ordinary words — but each sits alone
  // inside a phrase its opener just started, so the title stops mid-thought.
  //
  // So the peel also drops a trailing PAIR when the second-to-last word opens a
  // phrase: a preposition or auxiliary followed by a single word is an opened
  // phrase with one item in it. The 3-word floor keeps a short headline like
  // "Report on Gaza" from being peeled down to "Report".
  const MIN_FALLBACK_WORDS = 3;
  let fallback = prefix;
  while (fallback.includes(" ")) {
    const words = fallback.split(" ");
    if (DANGLING_TAIL.has(bareWord(words[words.length - 1]))) {
      fallback = tidyEnd(words.slice(0, -1).join(" "));
      continue;
    }
    if (
      words.length > MIN_FALLBACK_WORDS &&
      DANGLING_TAIL.has(bareWord(words[words.length - 2]))
    ) {
      fallback = tidyEnd(words.slice(0, -2).join(" "));
      continue;
    }
    break;
  }
  fallback = tidyEnd(fallback);
  if (fallback) candidates.push({ text: fallback, score: fallback.length });

  let best = null;
  for (const candidate of candidates) {
    if (candidate.text && (!best || candidate.score > best.score)) best = candidate;
  }

  return best ? best.text : tidyEnd(text.slice(0, budget));
}

/** Full document title for a news article, clamped to the mobile SERP budget. */
export function buildNewsArticleTitle(headline) {
  const clamped = clampHeadline(headline);
  return clamped ? `${clamped}${NEWS_TITLE_SUFFIX}` : "AltFTool News";
}
