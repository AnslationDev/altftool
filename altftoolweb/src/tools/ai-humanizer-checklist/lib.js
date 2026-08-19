/**
 * AI Humanizer Checklist — text diagnostics plus a weighted edit checklist.
 *
 * Nothing here claims to detect whether text was written by a model. It
 * measures the specific surface habits that make a draft read mechanically —
 * over-used connector phrases, uniform sentence length, dash and adverb
 * density, repeated sentence openers — and maps each finding to the edit that
 * fixes it.
 */

/**
 * Connector and filler phrases that appear far more often in generic model
 * output than in edited human prose. Compiled from common editorial "banned
 * phrase" lists; each is a phrase an editor would cut on sight, not proof of
 * machine authorship.
 */
export const OVERUSED_PHRASES = [
  "in today's fast-paced",
  "in today's digital age",
  "in the ever-evolving",
  "ever-evolving landscape",
  "it is important to note",
  "it's important to note",
  "it is worth noting",
  "delve into",
  "dive deep into",
  "navigate the complexities",
  "a testament to",
  "rich tapestry",
  "unlock the potential",
  "unlock the power",
  "game-changer",
  "game changer",
  "in conclusion",
  "at the end of the day",
  "when it comes to",
  "the realm of",
  "a myriad of",
  "a plethora of",
  "cutting-edge",
  "state-of-the-art",
  "seamlessly integrate",
  "robust solution",
  "leverage the power",
  "take your",
  "embark on a journey",
  "pivotal role",
  "underscores the importance",
  "foster a culture",
  "harness the power",
  "elevate your",
  "look no further",
  "buckle up",
  "let's face it",
  "the bottom line is",
  "moreover",
  "furthermore",
  "additionally",
  "overall",
];

/** Hedging words that soften a sentence until it says nothing. */
export const HEDGE_WORDS = [
  "arguably",
  "essentially",
  "basically",
  "generally",
  "typically",
  "often",
  "somewhat",
  "fairly",
  "quite",
  "rather",
  "perhaps",
  "potentially",
  "relatively",
];

/**
 * Editorial heuristics used to raise a flag. These are thresholds this tool
 * applies to guide editing, not published statistics about authorship.
 */
export const THRESHOLDS = {
  /** Sentence-length standard deviation below this reads metronomic. */
  lowBurstinessStdDev: 5,
  /** Mean sentence length above this is hard work for a general reader. */
  longMeanSentenceWords: 22,
  /** Em/en dashes per 1,000 words above this is a visible tic. */
  dashPerThousandWords: 8,
  /** Overused phrases per 1,000 words above this reads templated. */
  phrasePerThousandWords: 4,
  /** -ly adverbs per 1,000 words above this dilutes the verbs. */
  adverbPerThousandWords: 25,
  /** Same opening word starting this many sentences is a pattern. */
  repeatedOpenerCount: 3,
  /** Hedges per 1,000 words above this drains the argument. */
  hedgePerThousandWords: 12,
};

const PER_THOUSAND = 1000;

export const CHECKLIST = [
  {
    id: "cut-openers",
    phase: "Cut",
    action: "Delete every sentence that only announces what the next sentence will say.",
    why: "Models front-load throat-clearing. The draft usually starts one paragraph later than it thinks.",
    weight: 3,
    signal: "phrases",
  },
  {
    id: "cut-connectors",
    phase: "Cut",
    action: "Remove 'moreover', 'furthermore', 'additionally' and 'overall' — reorder instead.",
    why: "These carry no meaning; a human writer signals sequence with the content itself.",
    weight: 3,
    signal: "phrases",
  },
  {
    id: "cut-hedges",
    phase: "Cut",
    action: "Strike hedges — arguably, essentially, generally, potentially — or commit to the claim.",
    why: "A hedge on every claim makes the whole piece unfalsifiable and forgettable.",
    weight: 2,
    signal: "hedges",
  },
  {
    id: "cut-summary",
    phase: "Cut",
    action: "Delete the closing paragraph that restates the piece, and end on the last real point.",
    why: "'In conclusion' summaries are a template artefact; readers who got that far do not need them.",
    weight: 2,
    signal: "phrases",
  },
  {
    id: "vary-length",
    phase: "Vary",
    action: "Break the three longest sentences in two, and merge two short ones somewhere else.",
    why: "Uniform sentence length is the single loudest tell. Real prose swings between 4 and 35 words.",
    weight: 4,
    signal: "burstiness",
  },
  {
    id: "vary-openers",
    phase: "Vary",
    action: "Rewrite any sentence opener that repeats within a paragraph.",
    why: "Repeated openers ('This…', 'The…', 'It…') give a paragraph a machine rhythm.",
    weight: 3,
    signal: "openers",
  },
  {
    id: "vary-dashes",
    phase: "Vary",
    action: "Replace most em dashes with a full stop, a comma or a colon.",
    why: "Heavy dash use flattens the punctuation profile of the whole draft.",
    weight: 2,
    signal: "dashes",
  },
  {
    id: "vary-paragraphs",
    phase: "Vary",
    action: "Make at least one paragraph a single sentence.",
    why: "Equal-length paragraphs look generated even before the words are read.",
    weight: 2,
    signal: "paragraphs",
  },
  {
    id: "specify-numbers",
    phase: "Specify",
    action: "Replace every vague quantity with a number, a date or a name you can source.",
    why: "'Significant improvement' costs nothing to write. '11 minutes down from 40' cannot be faked.",
    weight: 4,
    signal: null,
  },
  {
    id: "specify-example",
    phase: "Specify",
    action: "Add one concrete example from your own experience that no model could have produced.",
    why: "A specific incident is the fastest route from generic to unmistakably yours.",
    weight: 4,
    signal: null,
  },
  {
    id: "specify-verify",
    phase: "Specify",
    action: "Check every factual claim, statistic and quotation against a primary source.",
    why: "Fluent wrong facts are the most expensive failure mode of an AI draft.",
    weight: 5,
    signal: null,
  },
  {
    id: "voice-read-aloud",
    phase: "Voice",
    action: "Read the draft aloud and rewrite every sentence you stumble on.",
    why: "The ear catches rhythm problems the eye scrolls past.",
    weight: 3,
    signal: null,
  },
  {
    id: "voice-contractions",
    phase: "Voice",
    action: "Use the contractions you actually use, and keep the ones you never use out.",
    why: "Contraction habits are personal and consistent; models default to a neutral middle.",
    weight: 2,
    signal: null,
  },
  {
    id: "voice-opinion",
    phase: "Voice",
    action: "State one opinion the piece is willing to be wrong about.",
    why: "Balanced-on-every-side writing is the house style of a model, not of a person.",
    weight: 3,
    signal: null,
  },
  {
    id: "voice-final-pass",
    phase: "Voice",
    action: "Do a last pass cutting 10% of the words without removing any fact.",
    why: "Compression is where the draft stops sounding assembled and starts sounding written.",
    weight: 3,
    signal: null,
  },
];

export const CHECKLIST_PHASES = ["Cut", "Vary", "Specify", "Voice"];

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /[A-Za-z0-9]/.test(sentence));
}

function splitWords(text) {
  const matches = text.match(/[A-Za-z0-9'’-]+/g);
  return matches || [];
}

function standardDeviation(numbers) {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  const variance =
    numbers.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / numbers.length;
  return Math.sqrt(variance);
}

function countPhrase(haystack, phrase) {
  let count = 0;
  let index = haystack.indexOf(phrase);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(phrase, index + phrase.length);
  }
  return count;
}

/**
 * Count phrase occurrences. Single-word entries (e.g. "overall") use a
 * \b-bounded regex like HEDGE_WORDS so they don't false-match inside a
 * longer word (e.g. "overalls"); genuinely multi-word phrases keep the
 * plain substring search since word boundaries do not apply the same way.
 */
function countPhraseOccurrences(haystack, phrase) {
  if (!phrase.includes(" ")) {
    const matches = haystack.match(new RegExp(`\\b${phrase}\\b`, "g"));
    return matches ? matches.length : 0;
  }
  return countPhrase(haystack, phrase);
}

function perThousand(count, words) {
  if (!(words > 0)) return 0;
  return (count / words) * PER_THOUSAND;
}

/**
 * Measure the surface habits of a draft.
 * @returns {{error:string}|object}
 */
export function scanDraft(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Paste a draft to scan." };
  }
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (words.length < 20 || sentences.length < 2) {
    return { error: "Paste at least a couple of full sentences — around 20 words — to scan." };
  }

  const lower = text.toLowerCase();
  const wordCount = words.length;

  const sentenceLengths = sentences.map((sentence) => splitWords(sentence).length);
  const meanSentenceWords =
    sentenceLengths.reduce((sum, value) => sum + value, 0) / sentenceLengths.length;
  const sentenceStdDev = standardDeviation(sentenceLengths);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  const paragraphSentenceCounts = paragraphs.map((block) => splitSentences(block).length);
  const paragraphStdDev = standardDeviation(paragraphSentenceCounts);

  const phraseHits = [];
  let phraseCount = 0;
  for (const phrase of OVERUSED_PHRASES) {
    const hits = countPhraseOccurrences(lower, phrase);
    if (hits > 0) {
      phraseHits.push({ phrase, hits });
      phraseCount += hits;
    }
  }
  phraseHits.sort((a, b) => b.hits - a.hits || a.phrase.localeCompare(b.phrase));

  const hedgeHits = [];
  let hedgeCount = 0;
  for (const word of HEDGE_WORDS) {
    const matches = lower.match(new RegExp(`\\b${word}\\b`, "g"));
    if (matches) {
      hedgeHits.push({ phrase: word, hits: matches.length });
      hedgeCount += matches.length;
    }
  }
  hedgeHits.sort((a, b) => b.hits - a.hits || a.phrase.localeCompare(b.phrase));

  const dashCount = (text.match(/[—–]/g) || []).length;
  const adverbCount = words.filter((word) => /ly$/i.test(word) && word.length > 4).length;

  // Tally openers per paragraph (not across the whole draft) so a repeat
  // only counts when the same opener actually recurs within one paragraph,
  // matching the "vary-openers" checklist item's own "within a paragraph"
  // wording.
  const openerTally = new Map();
  for (const paragraph of paragraphs) {
    const paragraphTally = new Map();
    for (const sentence of splitSentences(paragraph)) {
      const first = splitWords(sentence)[0];
      if (!first) continue;
      const key = first.toLowerCase();
      paragraphTally.set(key, (paragraphTally.get(key) || 0) + 1);
    }
    for (const [key, count] of paragraphTally.entries()) {
      if (count >= THRESHOLDS.repeatedOpenerCount) {
        openerTally.set(key, (openerTally.get(key) || 0) + count);
      }
    }
  }
  const repeatedOpeners = [...openerTally.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const rates = {
    phrasePerThousand: perThousand(phraseCount, wordCount),
    hedgePerThousand: perThousand(hedgeCount, wordCount),
    dashPerThousand: perThousand(dashCount, wordCount),
    adverbPerThousand: perThousand(adverbCount, wordCount),
  };

  // Every key here must correspond to a CHECKLIST item's `signal`, so a
  // raised flag always pins a matching edit to the top of the checklist.
  // adverbPerThousandWords and longMeanSentenceWords remain useful
  // reference thresholds (still surfaced as raw stats below) but are not
  // flagged here because no checklist item targets them specifically.
  const flags = {
    phrases: rates.phrasePerThousand > THRESHOLDS.phrasePerThousandWords,
    hedges: rates.hedgePerThousand > THRESHOLDS.hedgePerThousandWords,
    dashes: rates.dashPerThousand > THRESHOLDS.dashPerThousandWords,
    burstiness: sentenceStdDev < THRESHOLDS.lowBurstinessStdDev,
    openers: repeatedOpeners.length > 0,
    paragraphs: paragraphs.length >= 3 && paragraphStdDev < 1,
  };

  const flagCount = Object.values(flags).filter(Boolean).length;

  return {
    words: wordCount,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    meanSentenceWords,
    sentenceStdDev,
    paragraphStdDev,
    shortestSentenceWords: sentenceLengths.reduce((min, value) => Math.min(min, value), sentenceLengths[0]),
    longestSentenceWords: sentenceLengths.reduce((max, value) => Math.max(max, value), sentenceLengths[0]),
    phraseCount,
    phraseHits,
    hedgeCount,
    hedgeHits,
    dashCount,
    adverbCount,
    repeatedOpeners,
    rates,
    flags,
    flagCount,
    flagTotal: Object.keys(flags).length,
  };
}

/** Weighted completion of the edit checklist. */
export function scoreChecklist(checkedIds) {
  const checked = Array.isArray(checkedIds) ? checkedIds : [];
  const totalWeight = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);
  const doneWeight = CHECKLIST.filter((item) => checked.includes(item.id)).reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  const doneCount = CHECKLIST.filter((item) => checked.includes(item.id)).length;
  if (!(totalWeight > 0)) return { error: "The checklist is empty." };
  return {
    doneCount,
    totalCount: CHECKLIST.length,
    doneWeight,
    totalWeight,
    percent: (doneWeight / totalWeight) * 100,
    remaining: CHECKLIST.filter((item) => !checked.includes(item.id)).map((item) => item.id),
  };
}

/**
 * Order the checklist so items whose signal fired in the scan come first.
 */
export function prioritiseChecklist(scan) {
  const flags = scan && !scan.error && scan.flags ? scan.flags : {};
  return [...CHECKLIST]
    .map((item) => ({ ...item, flagged: Boolean(item.signal && flags[item.signal]) }))
    .sort((a, b) => {
      if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
      return b.weight - a.weight;
    });
}

/** Plain-text summary of the scan plus checklist state, for copying. */
export function buildReport({ scan, score } = {}) {
  if (!scan || scan.error) return { error: scan?.error || "Nothing to report yet." };
  if (!score || score.error) return { error: score?.error || "Nothing to report yet." };
  const lines = [
    "AI Humanizer Checklist",
    `Words: ${scan.words} · Sentences: ${scan.sentences} · Paragraphs: ${scan.paragraphs}`,
    `Mean sentence length: ${scan.meanSentenceWords.toFixed(1)} words (shortest ${scan.shortestSentenceWords}, longest ${scan.longestSentenceWords})`,
    `Sentence-length variation (std dev): ${scan.sentenceStdDev.toFixed(1)} words`,
    `Overused phrases: ${scan.phraseCount} (${scan.rates.phrasePerThousand.toFixed(1)} per 1,000 words)`,
    `Hedge words: ${scan.hedgeCount} · Em/en dashes: ${scan.dashCount} · -ly adverbs: ${scan.adverbCount}`,
    `Signals raised: ${scan.flagCount} of ${scan.flagTotal}`,
    `Checklist: ${score.doneCount}/${score.totalCount} items, ${score.percent.toFixed(0)}% by weight`,
  ];
  if (scan.phraseHits.length > 0) {
    lines.push(`Phrases found: ${scan.phraseHits.map((hit) => `${hit.phrase} (${hit.hits})`).join(", ")}`);
  }
  if (scan.repeatedOpeners.length > 0) {
    lines.push(
      `Repeated sentence openers: ${scan.repeatedOpeners.map((item) => `${item.word} (${item.count})`).join(", ")}`,
    );
  }
  return { text: lines.join("\n") };
}
