/**
 * Title A/B comparison for video titles.
 *
 * Nothing here predicts click-through rate — no browser tool can. What it does is
 * measure the mechanical properties that decide whether a title is even readable
 * in the places it appears, and score them against a fixed, published rubric so
 * two variants can be compared on the same terms.
 */

/** YouTube's hard limit on a video title. Longer titles are rejected outright. */
export const TITLE_MAX_CHARS = 100;

/** Below this a title rarely carries a subject and a promise. */
export const TITLE_MIN_CHARS = 20;

/**
 * Approximate number of characters visible before the title is clipped on each
 * surface. These vary with device width, font and language, so treat them as
 * working approximations rather than exact cut-off points.
 */
export const SURFACES = [
  { id: "suggested", label: "Suggested / sidebar", visible: 40 },
  { id: "mobile", label: "Mobile home feed", visible: 55 },
  { id: "search", label: "Desktop search results", visible: 70 },
  { id: "watch", label: "Watch page", visible: TITLE_MAX_CHARS },
];

/** The surface the score treats as the one that must not clip. */
export const PRIMARY_SURFACE_ID = "mobile";

/** Keyword should appear inside this many leading characters to survive clipping. */
export const KEYWORD_WINDOW = 40;

/** Scoring rubric. Weights sum to 100. */
export const RUBRIC = [
  { id: "fits", label: "Fits the mobile feed without clipping", weight: 30 },
  { id: "keyword", label: `Focus keyword inside the first ${KEYWORD_WINDOW} characters`, weight: 25 },
  { id: "specific", label: "Carries a concrete number or year", weight: 15 },
  { id: "calm", label: "No shouting: caps words and repeated punctuation", weight: 15 },
  { id: "length", label: `Length between ${TITLE_MIN_CHARS} and ${TITLE_MAX_CHARS} characters`, weight: 15 },
];

const EMOJI = /\p{Extended_Pictographic}/gu;

const collapse = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

export function countWords(text) {
  const clean = collapse(text);
  if (!clean) return 0;
  return clean.split(" ").filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

/** Words written entirely in capitals, ignoring one- and two-letter words and numbers. */
export function countShoutedWords(text) {
  const clean = collapse(text);
  if (!clean) return 0;
  return clean
    .split(" ")
    .filter((word) => /^[A-Z]{3,}$/.test(word.replace(/[^A-Za-z]/g, "")) && word.length >= 3).length;
}

export function countEmoji(text) {
  if (typeof text !== "string") return 0;
  return (text.match(EMOJI) || []).length;
}

/** Clip a title at a character budget on a word boundary, the way a feed does. */
export function clipTitle(text, visible) {
  const clean = collapse(text);
  const budget = Number(visible);
  if (!Number.isFinite(budget) || budget <= 0) return { text: "", clipped: clean.length > 0 };
  if (clean.length <= budget) return { text: clean, clipped: false };
  const slice = clean.slice(0, budget);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > budget * 0.6 ? slice.slice(0, lastSpace) : slice;
  return { text: cut, clipped: true };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Measure and score a single title.
 * @param {string} title
 * @param {{keyword?: string}} [options]
 */
export function analyseTitle(title, options) {
  const clean = collapse(title);
  if (!clean) return { error: "Enter a title to analyse." };

  const opts = options && typeof options === "object" ? options : {};
  const keyword = collapse(opts.keyword);

  const characters = clean.length;
  const words = countWords(clean);
  const shouted = countShoutedWords(clean);
  const emoji = countEmoji(clean);
  const repeatedPunctuation = /([!?])\1/.test(clean) || /[!?]{2,}/.test(clean);
  const hasNumber = /\d/.test(clean);

  let keywordIndex = -1;
  if (keyword) {
    keywordIndex = clean.toLowerCase().indexOf(keyword.toLowerCase());
  }
  const keywordEarly = keywordIndex >= 0 && keywordIndex < KEYWORD_WINDOW;

  const previews = SURFACES.map((surface) => ({
    ...surface,
    ...clipTitle(clean, surface.visible),
  }));
  const primary = previews.find((surface) => surface.id === PRIMARY_SURFACE_ID);

  const scores = {
    fits: primary && !primary.clipped ? 1 : 0,
    keyword: keyword ? (keywordEarly ? 1 : keywordIndex >= 0 ? 0.4 : 0) : 0.5,
    specific: hasNumber ? 1 : 0,
    calm: shouted === 0 && !repeatedPunctuation ? 1 : shouted <= 1 && !repeatedPunctuation ? 0.5 : 0,
    length: characters >= TITLE_MIN_CHARS && characters <= TITLE_MAX_CHARS ? 1 : 0,
  };

  const breakdown = RUBRIC.map((item) => ({
    id: item.id,
    label: item.label,
    weight: item.weight,
    earned: Math.round(scores[item.id] * item.weight * 10) / 10,
  }));
  const score = Math.round(breakdown.reduce((sum, item) => sum + item.earned, 0));

  const notes = [];
  if (characters > TITLE_MAX_CHARS) {
    notes.push(`${characters - TITLE_MAX_CHARS} characters over YouTube's ${TITLE_MAX_CHARS}-character limit.`);
  } else if (characters < TITLE_MIN_CHARS) {
    notes.push(`Only ${characters} characters — usually too short to carry a subject and a promise.`);
  }
  if (primary && primary.clipped) {
    notes.push(`Clipped in the mobile feed after roughly ${primary.visible} characters.`);
  }
  if (keyword && keywordIndex < 0) {
    notes.push(`The focus keyword "${keyword}" does not appear in this title.`);
  } else if (keyword && !keywordEarly) {
    notes.push(`The keyword starts at character ${keywordIndex + 1}, past the ${KEYWORD_WINDOW}-character window.`);
  }
  if (shouted > 0) notes.push(`${shouted} word${shouted === 1 ? "" : "s"} in full capitals.`);
  if (repeatedPunctuation) notes.push("Repeated exclamation or question marks.");
  if (!hasNumber) notes.push("No number or year — specifics usually make a title easier to choose.");
  if (emoji > 2) notes.push(`${emoji} emoji — more than two crowds the visible text.`);

  return {
    title: clean,
    characters,
    words,
    shouted,
    emoji,
    repeatedPunctuation,
    hasNumber,
    keyword,
    keywordIndex,
    keywordEarly,
    previews,
    breakdown,
    score,
    notes,
    overLimit: characters > TITLE_MAX_CHARS,
  };
}

/**
 * Compare several title variants.
 * @param {string} text  one title per line
 * @param {{keyword?: string}} [options]
 */
export function compareTitles(text, options) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Add at least one title, one per line." };
  }
  const lines = text
    .split(/\r?\n/)
    .map((line) => collapse(line))
    .filter(Boolean);
  if (lines.length === 0) return { error: "Add at least one title, one per line." };
  if (lines.length > 12) return { error: "Compare up to 12 titles at a time." };

  const variants = lines.map((line, index) => {
    const analysis = analyseTitle(line, options);
    return { label: String.fromCharCode(65 + index), ...analysis };
  });

  const ranked = [...variants].sort((a, b) => b.score - a.score || a.characters - b.characters);
  const best = ranked[0];
  const spread = ranked.length > 1 ? ranked[0].score - ranked[ranked.length - 1].score : 0;
  const averageScore =
    Math.round((variants.reduce((sum, item) => sum + item.score, 0) / variants.length) * 10) / 10;

  return {
    variants,
    ranked,
    best,
    spread,
    averageScore,
    count: variants.length,
    tie: ranked.length > 1 && ranked[0].score === ranked[1].score,
  };
}
