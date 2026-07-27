/**
 * AI social caption signal scanner.
 *
 * Pure, deterministic heuristics. This measures *stylistic tells* that are common
 * in unedited LLM output for social posts. It is not a classifier and it cannot
 * prove authorship — a human writer using the same conventions will also score high.
 */

/** Instagram's documented hard limit is 30 hashtags per post (3 per Reels comment aside). */
export const INSTAGRAM_HASHTAG_LIMIT = 30;
/** LinkedIn's own creator guidance recommends about three relevant hashtags per post. */
export const LINKEDIN_HASHTAG_GUIDANCE = 3;
/** X (Twitter) standard post limit in characters. */
export const X_CHARACTER_LIMIT = 280;
/** Hashtag count at which a caption reads as keyword padding rather than topical tagging. */
export const HASHTAG_PADDING_THRESHOLD = 10;
/** Sentence-length coefficient of variation below this reads as machine-uniform rhythm. */
export const UNIFORM_RHYTHM_CV = 0.35;

/** Vocabulary heavily over-represented in unedited LLM social copy. */
export const AI_VOCABULARY = [
  "delve",
  "tapestry",
  "testament",
  "elevate",
  "unlock",
  "harness",
  "landscape",
  "realm",
  "game-changer",
  "game changer",
  "seamless",
  "robust",
  "leverage",
  "embark",
  "navigate",
  "foster",
  "pivotal",
  "underscore",
  "unwavering",
  "meticulous",
  "resonate",
  "synergy",
  "paradigm",
  "holistic",
  "transformative",
  "empower",
  "curated",
  "bespoke",
  "cutting-edge",
  "supercharge",
  "supercharged",
  "unparalleled",
  "myriad",
  "plethora",
];

/** Formulaic opening lines used to bait the "more" tap. */
export const HOOK_OPENERS = [
  "stop scrolling",
  "let's be honest",
  "let me be honest",
  "here's the thing",
  "here's what nobody",
  "nobody talks about",
  "unpopular opinion",
  "hot take",
  "ever wondered",
  "let that sink in",
  "read that again",
  "i'll say it louder",
  "buckle up",
  "picture this",
  "imagine this",
  "in today's",
  "in a world where",
  "the truth is",
  "plot twist",
  "spoiler alert",
  "true story",
  "swipe to find out",
];

/** Filler tags that add reach-chasing bulk rather than topic signal. */
export const GENERIC_HASHTAGS = [
  "love",
  "instagood",
  "photooftheday",
  "instadaily",
  "follow",
  "followme",
  "likeforlikes",
  "viral",
  "trending",
  "explore",
  "explorepage",
  "fyp",
  "foryou",
  "foryoupage",
  "motivation",
  "motivational",
  "inspiration",
  "inspirational",
  "success",
  "mindset",
  "growthmindset",
  "hustle",
  "grind",
  "goals",
  "life",
  "lifestyle",
  "vibes",
  "blessed",
  "reels",
  "reelsinstagram",
  "trendingreels",
  "contentcreator",
  "digitalmarketing",
  "business",
  "entrepreneur",
];

/** Bullet glyphs LLMs reach for when asked for a "scannable" caption. */
const BULLET_GLYPHS = ["✅", "✔️", "➡️", "→", "↳", "•", "🔹", "🔸", "👉", "💡", "✨", "🚀", "🔥", "📌"];

const EMOJI_RE = /\p{Extended_Pictographic}/gu;
const HASHTAG_RE = /(?:^|\s)#([\p{L}\p{N}_]+)/gu;

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits text into sentences, treating line breaks as boundaries too. */
export function splitSentences(text) {
  return String(text)
    .split(/\n+|(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export function countWords(text) {
  const matches = String(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

/**
 * Scores a caption on stylistic AI tells.
 *
 * @param {string} text the caption
 * @param {{platform?: "instagram"|"linkedin"|"x"|"generic"}} options
 * @returns {object} report, or { error } for unusable input
 */
export function scanCaption(text, options = {}) {
  const platform = options.platform || "generic";
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a caption to scan." };
  }

  const raw = text;
  const lower = raw.toLowerCase();
  const charCount = Array.from(raw).length;
  const wordCount = countWords(raw);
  if (wordCount < 3) {
    return { error: "The caption is too short to score — paste at least a full sentence." };
  }

  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const contentLines = lines.filter((line) => line !== "");
  const sentences = splitSentences(raw);
  const emojiMatches = raw.match(EMOJI_RE) || [];
  const emojiCount = emojiMatches.length;

  const hashtags = [];
  for (const match of raw.matchAll(HASHTAG_RE)) hashtags.push(match[1]);
  const hashtagCount = hashtags.length;
  const genericHits = hashtags.filter((tag) => GENERIC_HASHTAGS.includes(tag.toLowerCase()));

  const emDashCount = (raw.match(/—/g) || []).length;

  const vocabHits = AI_VOCABULARY.filter((word) =>
    new RegExp(`(^|[^\\p{L}])${escapeRe(word)}([^\\p{L}]|$)`, "iu").test(lower),
  );

  const firstLine = (contentLines[0] || "").toLowerCase();
  const openerHits = HOOK_OPENERS.filter((hook) => firstLine.includes(hook));
  const anywhereHookHits = HOOK_OPENERS.filter((hook) => lower.includes(hook));

  const notJustPattern = /\bnot just\b[^.!?\n]{0,80}\b(but|it['’]s|it is)\b/iu;
  const itsNotAboutPattern = /\bit['’]?s not (?:just )?(?:about )?[^.!?\n]{1,60}[.,]\s*it['’]?s\b/iu;
  const contrastHits = [];
  if (notJustPattern.test(raw)) contrastHits.push('"not just X, but Y"');
  if (itsNotAboutPattern.test(raw)) contrastHits.push('"it\'s not X. It\'s Y."');

  const emojiStartLines = contentLines.filter((line) =>
    new RegExp(`^(${BULLET_GLYPHS.map(escapeRe).join("|")}|\\p{Extended_Pictographic})`, "u").test(
      line,
    ),
  );

  const tripleLists = sentences.filter(
    (sentence) => (sentence.match(/,/g) || []).length >= 2 && /,\s*(and|or)\s/iu.test(sentence),
  );

  const sentenceWordCounts = sentences.map((sentence) => countWords(sentence)).filter((n) => n > 0);
  let rhythmCv = null;
  if (sentenceWordCounts.length >= 4) {
    const mean =
      sentenceWordCounts.reduce((sum, n) => sum + n, 0) / sentenceWordCounts.length;
    if (mean > 0) {
      const variance =
        sentenceWordCounts.reduce((sum, n) => sum + (n - mean) * (n - mean), 0) /
        sentenceWordCounts.length;
      rhythmCv = Math.sqrt(variance) / mean;
    }
  }

  const signals = [
    {
      id: "em-dash",
      label: "Em dashes",
      hit: emDashCount > 0,
      points: Math.min(12, emDashCount * 6),
      max: 12,
      detail:
        emDashCount > 0
          ? `${emDashCount} em dash${emDashCount === 1 ? "" : "es"} (—). Most people type a hyphen or a comma on a phone keyboard.`
          : "No em dashes — good, phone keyboards rarely produce them.",
      evidence: emDashCount > 0 ? ["—"] : [],
    },
    {
      id: "vocabulary",
      label: "Model-favourite vocabulary",
      hit: vocabHits.length > 0,
      points: Math.min(24, vocabHits.length * 6),
      max: 24,
      detail:
        vocabHits.length > 0
          ? `${vocabHits.length} word${vocabHits.length === 1 ? "" : "s"} from the list LLMs over-use.`
          : "No words from the over-used LLM vocabulary list.",
      evidence: vocabHits,
    },
    {
      id: "hook-opener",
      label: "Formulaic hook opener",
      hit: openerHits.length > 0,
      points: openerHits.length > 0 ? 12 : anywhereHookHits.length > 0 ? 5 : 0,
      max: 12,
      detail:
        openerHits.length > 0
          ? "The first line is a stock attention hook."
          : anywhereHookHits.length > 0
            ? "A stock hook phrase appears later in the caption."
            : "The opening line is not one of the stock hooks.",
      evidence: openerHits.length > 0 ? openerHits : anywhereHookHits,
    },
    {
      id: "contrast-frame",
      label: "Negation-contrast framing",
      hit: contrastHits.length > 0,
      points: contrastHits.length > 0 ? 12 : 0,
      max: 12,
      detail:
        contrastHits.length > 0
          ? "Uses the \"not just X, it's Y\" construction that models fall back on for punchlines."
          : "No negation-contrast punchline.",
      evidence: contrastHits,
    },
    {
      id: "emoji-bullets",
      label: "Emoji bullet list",
      hit: emojiStartLines.length >= 3,
      points: emojiStartLines.length >= 3 ? 12 : emojiStartLines.length === 2 ? 5 : 0,
      max: 12,
      detail:
        emojiStartLines.length >= 3
          ? `${emojiStartLines.length} lines open with an emoji or bullet glyph — the classic generated "scannable" layout.`
          : "Lines are not laid out as an emoji bullet list.",
      evidence: emojiStartLines.slice(0, 4),
    },
    {
      id: "emoji-density",
      label: "Emoji density",
      hit: emojiCount >= 6,
      points: emojiCount >= 12 ? 10 : emojiCount >= 6 ? 6 : 0,
      max: 10,
      detail: `${emojiCount} emoji in ${wordCount} words (${(wordCount > 0 ? (emojiCount / wordCount) * 100 : 0).toFixed(1)} per 100 words).`,
      evidence: [],
    },
    {
      id: "hashtag-padding",
      label: "Hashtag padding",
      hit: hashtagCount > HASHTAG_PADDING_THRESHOLD || genericHits.length >= 3,
      points:
        (hashtagCount > HASHTAG_PADDING_THRESHOLD ? 10 : 0) + (genericHits.length >= 3 ? 6 : 0),
      max: 16,
      detail: `${hashtagCount} hashtag${hashtagCount === 1 ? "" : "s"}, of which ${genericHits.length} are generic reach tags.`,
      evidence: genericHits.slice(0, 8).map((tag) => `#${tag}`),
    },
    {
      id: "rule-of-three",
      label: "Rule-of-three lists",
      hit: tripleLists.length >= 2,
      points: tripleLists.length >= 2 ? 8 : 0,
      max: 8,
      detail:
        tripleLists.length >= 2
          ? `${tripleLists.length} sentences built as "A, B, and C" triads.`
          : "No repeated triadic lists.",
      evidence: tripleLists.slice(0, 2),
    },
    {
      id: "rhythm",
      label: "Uniform sentence rhythm",
      hit: rhythmCv !== null && rhythmCv < UNIFORM_RHYTHM_CV,
      points: rhythmCv !== null && rhythmCv < UNIFORM_RHYTHM_CV ? 10 : 0,
      max: 10,
      detail:
        rhythmCv === null
          ? "Too few sentences to measure rhythm (needs 4 or more)."
          : `Sentence-length variation ${rhythmCv.toFixed(2)} (below ${UNIFORM_RHYTHM_CV} reads as machine-even).`,
      evidence: [],
    },
  ];

  const rawScore = signals.reduce((sum, signal) => sum + signal.points, 0);
  const maxScore = signals.reduce((sum, signal) => sum + signal.max, 0);
  const score = Math.max(0, Math.min(100, Math.round((rawScore / maxScore) * 100)));

  let band = "Reads human";
  let bandNote = "Very few machine tells. Nothing here suggests unedited model output.";
  if (score >= 70) {
    band = "Heavy AI tells";
    bandNote = "Reads like unedited model output. Rewrite the hook and cut the padding.";
  } else if (score >= 45) {
    band = "Strong AI tells";
    bandNote = "Several tells stack up. A pass in your own voice would change how this lands.";
  } else if (score >= 20) {
    band = "Some AI tells";
    bandNote = "A couple of habits stand out, but the caption still sounds like a person.";
  }

  const platformNotes = [];
  if (platform === "instagram" && hashtagCount > INSTAGRAM_HASHTAG_LIMIT) {
    platformNotes.push(
      `Instagram accepts at most ${INSTAGRAM_HASHTAG_LIMIT} hashtags per post — this caption has ${hashtagCount}.`,
    );
  }
  if (platform === "linkedin" && hashtagCount > LINKEDIN_HASHTAG_GUIDANCE + 2) {
    platformNotes.push(
      `LinkedIn's own guidance is around ${LINKEDIN_HASHTAG_GUIDANCE} relevant hashtags — this caption has ${hashtagCount}.`,
    );
  }
  if (platform === "x" && charCount > X_CHARACTER_LIMIT) {
    platformNotes.push(
      `${charCount} characters exceeds the ${X_CHARACTER_LIMIT}-character standard post limit on X.`,
    );
  }

  return {
    score,
    rawScore,
    maxScore,
    band,
    bandNote,
    platform,
    charCount,
    wordCount,
    sentenceCount: sentences.length,
    lineCount: contentLines.length,
    emojiCount,
    hashtagCount,
    genericHashtagCount: genericHits.length,
    emDashCount,
    rhythmCv,
    signals,
    triggered: signals.filter((signal) => signal.points > 0),
    platformNotes,
  };
}
