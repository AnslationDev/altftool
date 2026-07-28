/**
 * Topic Sentence Generator — pure logic.
 *
 * A topic sentence has exactly two obligatory parts: a SUBJECT (what the
 * paragraph is about) and a CONTROLLING IDEA (the arguable claim the rest of
 * the paragraph will prove about it). This module builds sentences from those
 * two parts using standard composition patterns, and scores a sentence you
 * have already written against the checks a marker applies.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------------ style rules ------------------------------ */

/**
 * Length band. Under 8 words a topic sentence rarely carries both a subject
 * and a controlling idea; over 30 it has started doing the body's work.
 * These are the bounds this tool applies, in line with the 15-20 word average
 * sentence length recommended by plain-language and academic style guides.
 */
export const MIN_WORDS = 8;
export const MAX_WORDS = 30;

/** Announcing the paragraph instead of making a claim. */
export const ANNOUNCEMENT_PATTERNS = [
  /\bin this (paragraph|essay|section|report)\b/i,
  /\bthis (paragraph|essay|section) (will|is going to|aims to)\b/i,
  /\b(i|we) (will|shall|am going to|are going to) (discuss|talk about|explain|look at|cover)\b/i,
  /\bthe (purpose|aim) of this (paragraph|essay|section)\b/i,
  /\bnow (i|we) (will|shall)\b/i,
];

/** First-person markers most academic rubrics still discourage in body prose. */
export const FIRST_PERSON_PATTERNS = [/\bI\b/, /\bmy\b/i, /\bwe\b/i, /\bour\b/i, /\bme\b/i];

/**
 * Vague filler that leaves the controlling idea unspecified. A topic sentence
 * built on "things" or "very important" gives the paragraph nothing to prove.
 */
export const VAGUE_TERMS = [
  "things",
  "stuff",
  "a lot of",
  "lots of",
  "very important",
  "really important",
  "interesting",
  "good and bad",
  "many aspects",
  "various factors",
];

/**
 * Evidence markers. Quotations, page references, years in brackets and
 * "according to" belong in the body of the paragraph, not in the sentence
 * that states its claim.
 */
export const EVIDENCE_PATTERNS = [
  /\((?:[^)]*\b(19|20)\d{2}\b[^)]*)\)/,
  /\baccording to\b/i,
  /\bp\.\s?\d+/i,
  /["“”].{6,}["“”]/,
  /\bstates that\b/i,
];

/* --------------------------- sentence patterns --------------------------- */

/**
 * Recommended pattern by paragraph position. First body paragraphs usually
 * lead with the claim; middle paragraphs need an explicit link back; the last
 * body paragraph normally carries the strongest reason.
 */
export const POSITIONS = {
  first: { id: "first", label: "First body paragraph", transition: "First" },
  middle: { id: "middle", label: "Middle body paragraph", transition: "Beyond that" },
  last: { id: "last", label: "Last body paragraph", transition: "Most significantly" },
};

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];

/* -------------------------------- helpers -------------------------------- */

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const stripTerminal = (value) => clean(value).replace(/[.!?;,]+$/, "");

const capitalise = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const lowerFirst = (value) => {
  const text = String(value ?? "");
  if (!text) return text;
  // Leave acronyms and proper-noun-looking words alone.
  if (/^[A-Z]{2,}/.test(text)) return text;
  if (/^[A-Z][a-z]+\s+[A-Z]/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
};

const finish = (value) => {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? capitalise(text) : `${capitalise(text)}.`;
};

/** Words separated by whitespace. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Number of sentence-final punctuation marks that actually close a sentence. */
export function countSentences(text) {
  const trimmed = clean(text);
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : 1;
}

/* ------------------------------- generator ------------------------------- */

/**
 * Build topic sentence options.
 *
 * @param {object} input
 * @param {string} input.subject   What the paragraph is about, e.g. "school uniforms".
 * @param {string} input.claim     The controlling idea, e.g. "hide income differences without removing them".
 * @param {string} input.reason    Optional supporting reason for the because-pattern.
 * @param {string} input.counter   Optional concession for the although-pattern.
 * @param {string} input.position  Key of POSITIONS.
 * @param {number} input.index     1-based position among the body paragraphs.
 * @returns {object} { options, ... } or { error }.
 */
export function generateTopicSentences(input = {}) {
  const { subject, claim, reason = "", counter = "", position = "first", index = 1 } = input;

  const subj = stripTerminal(subject);
  if (!subj) return { error: "Enter what the paragraph is about — its subject." };

  const controlling = stripTerminal(claim);
  if (!controlling) {
    return { error: "Enter the controlling idea: the arguable claim this paragraph will prove." };
  }
  if (countWords(controlling) < 2) {
    return { error: "The controlling idea needs to be a claim, not a single word — say what is true of the subject." };
  }

  const positionSpec = POSITIONS[position] || POSITIONS.first;
  const ordinalIndex = Math.max(1, Math.min(ORDINALS.length, Math.round(Number(index) || 1)));
  const ordinal = ORDINALS[ordinalIndex - 1];

  const subjLower = lowerFirst(subj);
  const claimLower = lowerFirst(controlling);
  const reasonText = lowerFirst(stripTerminal(reason));
  const counterText = lowerFirst(stripTerminal(counter));

  const options = [
    {
      id: "claim-first",
      label: "Claim first",
      when: "The default. Works anywhere, and is the clearest shape under exam pressure.",
      sentence: finish(`${subj} ${claimLower}`),
    },
    {
      id: "transition",
      label: "Linked to the previous paragraph",
      when: `Best for a ${positionSpec.label.toLowerCase()}, where the reader needs the thread.`,
      sentence: finish(`${positionSpec.transition}, ${subjLower} ${claimLower}`),
    },
    {
      id: "enumerative",
      label: "Enumerated reason",
      when: "Use when the essay promised a numbered list of reasons in the introduction.",
      sentence: finish(`The ${ordinal} reason is that ${subjLower} ${claimLower}`),
    },
  ];

  if (reasonText) {
    options.push({
      id: "because",
      label: "Reason built in",
      when: "Use when the claim only makes sense once the reason is on the table.",
      sentence: finish(`Because ${reasonText}, ${subjLower} ${claimLower}`),
    });
  }

  if (counterText) {
    options.push({
      id: "concessive",
      label: "Concession then pivot",
      when: "Use when the marker will be thinking of the obvious objection.",
      sentence: finish(`Although ${counterText}, ${subjLower} ${claimLower}`),
    });
    options.push({
      id: "conceded",
      label: "Concede in full, then pivot",
      when: "Use for the objection you cannot dismiss and have to argue past instead.",
      sentence: finish(`It is true that ${counterText}, but ${subjLower} ${claimLower}`),
    });
  }

  options.push({
    id: "emphatic",
    label: "Emphatic",
    when: "Use for the strongest reason, usually the last body paragraph.",
    sentence: finish(`What matters more is that ${subjLower} ${claimLower}`),
  });

  return {
    options,
    subject: subj,
    claim: controlling,
    position: positionSpec.id,
    positionLabel: positionSpec.label,
    ordinal,
    count: options.length,
  };
}

/* -------------------------------- assessor -------------------------------- */

/**
 * Score a topic sentence against seven checks.
 * @param {string} text
 * @returns {object} { checks, passed, total, score, words } or { error }.
 */
export function assessTopicSentence(text) {
  const sentence = clean(text);
  if (!sentence) return { error: "Paste the topic sentence you want checked." };

  const words = countWords(sentence);
  const sentences = countSentences(sentence);

  const checks = [
    {
      id: "length",
      label: `Between ${MIN_WORDS} and ${MAX_WORDS} words`,
      pass: words >= MIN_WORDS && words <= MAX_WORDS,
      detail:
        words < MIN_WORDS
          ? `${words} words — too short to carry a subject and a claim.`
          : words > MAX_WORDS
            ? `${words} words — this is already doing the body's work.`
            : `${words} words.`,
    },
    {
      id: "single",
      label: "One sentence only",
      pass: sentences === 1,
      detail: sentences === 1 ? "A single sentence." : `${sentences} sentences — a topic sentence is one.`,
    },
    {
      id: "statement",
      label: "A statement, not a question",
      pass: !/\?\s*$/.test(sentence),
      detail: /\?\s*$/.test(sentence)
        ? "Questions raise an idea instead of committing to one."
        : "Makes a commitment the paragraph can defend.",
    },
    {
      id: "announcement",
      label: "Makes a claim rather than announcing one",
      pass: !ANNOUNCEMENT_PATTERNS.some((pattern) => pattern.test(sentence)),
      detail: ANNOUNCEMENT_PATTERNS.some((pattern) => pattern.test(sentence))
        ? "Delete the announcement and start with the claim itself."
        : "No 'in this paragraph I will…' scaffolding.",
    },
    {
      id: "vague",
      label: "No vague filler",
      pass: !VAGUE_TERMS.some((term) => sentence.toLowerCase().includes(term)),
      detail: (() => {
        const hits = VAGUE_TERMS.filter((term) => sentence.toLowerCase().includes(term));
        return hits.length > 0
          ? `Replace: ${hits.join(", ")}.`
          : "The controlling idea is specific enough to argue with.";
      })(),
    },
    {
      id: "evidence",
      label: "Evidence held back for the body",
      pass: !EVIDENCE_PATTERNS.some((pattern) => pattern.test(sentence)),
      detail: EVIDENCE_PATTERNS.some((pattern) => pattern.test(sentence))
        ? "Move the quotation, citation or source into the sentences that follow."
        : "No quotation or citation crowding the claim.",
    },
    {
      id: "person",
      label: "Third person",
      pass: !FIRST_PERSON_PATTERNS.some((pattern) => pattern.test(sentence)),
      detail: FIRST_PERSON_PATTERNS.some((pattern) => pattern.test(sentence))
        ? "First person is fine in reflective writing; most academic rubrics still ask for third person here."
        : "Written in third person.",
      advisory: true,
    },
  ];

  const total = checks.length;
  const passed = checks.filter((check) => check.pass).length;

  return {
    sentence,
    words,
    sentences,
    checks,
    passed,
    total,
    score: Math.round((passed / total) * 100),
    failed: checks.filter((check) => !check.pass),
  };
}

/** Render the generated options as plain text. */
export function optionsToText(result) {
  if (!result || result.error || !Array.isArray(result.options)) return "";
  const lines = [`Topic sentence options — ${result.positionLabel}`, ""];
  result.options.forEach((option) => {
    lines.push(`${option.label}: ${option.sentence}`);
    lines.push(`  ${option.when}`);
  });
  return lines.join("\n").trim();
}
