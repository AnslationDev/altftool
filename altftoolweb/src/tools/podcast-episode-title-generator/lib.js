/**
 * Podcast episode title generation and scoring.
 *
 * The constraints below are platform rules and directory guidance, not taste:
 *
 *  - Apple Podcasts asks that <itunes:title> contain the episode title only.
 *    The show name, episode number and season belong in their own tags, and
 *    repeating them wastes the characters an app can actually display.
 *  - Episode lists in Apple Podcasts and Spotify on a phone show roughly the
 *    first 40 characters of a title before truncating, so the distinguishing
 *    words have to come early.
 *  - A YouTube video title is hard-capped at 100 characters and is usually
 *    truncated in search results after about 70.
 *  - A page title shown in Google search results is cut at roughly 60
 *    characters, which is the practical ceiling if the episode page is meant
 *    to rank.
 */

/** Practical ceiling for a title that must survive a search result. */
export const SEARCH_TITLE_LIMIT = 60;
/** Roughly what a phone episode list shows before truncating. */
export const LIST_TRUNCATION = 40;
/** Hard cap on a YouTube video title. */
export const YOUTUBE_TITLE_MAX = 100;
/** Keyword should appear inside this many characters to count as front-loaded. */
export const FRONT_LOAD_WINDOW = 30;
/** Below this length a title carries too little information to be searchable. */
export const MIN_USEFUL_LENGTH = 15;
/** Above this many words a spoken title stops being scannable. */
export const MAX_COMFORTABLE_WORDS = 12;

/** Words left lowercase in title case unless they start or end the title. */
export const MINOR_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "if", "in", "nor", "of",
  "on", "or", "per", "so", "the", "to", "up", "via", "vs", "with", "from",
]);

const collapse = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

const REGEXP_SPECIAL = /[.*+?^${}()|[\]\\]/g;

/**
 * Find where `key` appears in `value` as a whole word (or phrase), not merely as a
 * substring — a naive indexOf would report a short keyword like "art" as present and
 * well-placed just because it occurs inside an unrelated word like "started".
 * Falls back to -1 (not found) rather than a misleading interior match.
 */
function findKeywordIndex(value, key) {
  if (!key) return -1;
  const escaped = key.replace(REGEXP_SPECIAL, "\\$&");
  const match = new RegExp(`\\b${escaped}\\b`, "i").exec(value);
  return match ? match.index : -1;
}

/** Title case using the minor-word list, always capitalising first and last word. */
export function toTitleCase(text) {
  const words = collapse(text).split(" ");
  if (words.length === 0 || words[0] === "") return "";
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      const isEdge = index === 0 || index === words.length - 1;
      const afterColon = index > 0 && /[:?—-]$/.test(words[index - 1]);
      if (!isEdge && !afterColon && MINOR_WORDS.has(lower.replace(/[^a-z]/g, ""))) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** Sentence case: first letter up, the rest left as typed. */
export function toSentenceCase(text) {
  const value = collapse(text);
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Score a single title.
 * @param {string} title
 * @param {string} keyword
 * @returns {{score:number, chars:number, words:number, keywordAt:number, notes:string[]}}
 */
export function scoreTitle(title, keyword = "") {
  const value = collapse(title);
  const chars = value.length;
  const words = value ? value.split(" ").length : 0;
  const key = collapse(keyword).toLowerCase();
  const keywordAt = findKeywordIndex(value.toLowerCase(), key);
  const notes = [];
  let score = 100;

  if (chars === 0) {
    return { score: 0, chars: 0, words: 0, keywordAt: -1, notes: ["Empty title."] };
  }
  if (chars > YOUTUBE_TITLE_MAX) {
    score -= 35;
    notes.push(`${chars} characters is over the ${YOUTUBE_TITLE_MAX}-character YouTube limit.`);
  } else if (chars > SEARCH_TITLE_LIMIT) {
    score -= 20;
    notes.push(`${chars} characters will be cut in search results after about ${SEARCH_TITLE_LIMIT}.`);
  }
  if (chars > LIST_TRUNCATION) {
    score -= 5;
    notes.push(`Only the first ~${LIST_TRUNCATION} characters show in a phone episode list.`);
  }
  if (chars < MIN_USEFUL_LENGTH) {
    score -= 15;
    notes.push("Too short to say what the episode is about.");
  }
  if (key) {
    if (keywordAt < 0) {
      score -= 25;
      notes.push(`The keyword "${keyword}" does not appear in the title.`);
    } else if (keywordAt >= FRONT_LOAD_WINDOW) {
      score -= 12;
      notes.push(`The keyword starts at character ${keywordAt + 1} — move it into the first ${FRONT_LOAD_WINDOW}.`);
    } else if (keywordAt + key.length > LIST_TRUNCATION) {
      score -= 8;
      notes.push("The keyword is cut off in a truncated episode list.");
    }
  }
  if (words > MAX_COMFORTABLE_WORDS) {
    score -= 10;
    notes.push(`${words} words is long for a title read aloud in an app.`);
  }
  if (/\d/.test(value)) score += 4;
  if (/^(how|why|what|when|should|can)\b/i.test(value) || value.endsWith("?")) score += 4;
  if (/^(episode|ep\.?|#)\s*\d+/i.test(value)) {
    score -= 15;
    notes.push("Apple Podcasts stores the episode number in its own tag — drop it from the title.");
  }
  if (/\|\s*[a-z]/i.test(value)) {
    score -= 8;
    notes.push("A show name after a pipe repeats data the app already has.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    chars,
    words,
    keywordAt,
    notes,
  };
}

/** Editorial title patterns, each with the situation it suits. */
export const TITLE_PATTERNS = [
  {
    key: "colon",
    label: "Keyword, then the angle",
    hint: "The safest structure — the searchable term comes first.",
    build: ({ keyword, angle }) => (keyword && angle ? `${keyword}: ${angle}` : ""),
  },
  {
    key: "guestOn",
    label: "Guest on the topic",
    hint: "Works when the guest's name is itself the draw.",
    build: ({ guest, keyword }) => (guest && keyword ? `${guest} on ${keyword}` : ""),
  },
  {
    key: "how",
    label: "How someone did it",
    hint: "Promises a method, which is what most listeners search for.",
    build: ({ guest, achievement }) =>
      guest && achievement ? `How ${guest} ${achievement}` : achievement ? `How to ${achievement}` : "",
  },
  {
    key: "listicle",
    label: "Numbered lessons",
    hint: "A number sets expectations and survives truncation well.",
    build: ({ number, keyword, audience }) =>
      number && keyword
        ? `${number} ${keyword} lessons${audience ? ` for ${audience}` : ""}`
        : "",
  },
  {
    key: "mistake",
    label: "What people get wrong",
    hint: "Curiosity plus the keyword, without becoming clickbait.",
    build: ({ audience, keyword }) =>
      keyword ? `What ${audience || "most teams"} get wrong about ${keyword}` : "",
  },
  {
    key: "question",
    label: "The listener's own question",
    hint: "Matches the phrasing people type into a search box.",
    build: ({ keyword, audience }) =>
      audience ? `Should ${audience} care about ${keyword}?` : `Is ${keyword} worth it?`,
  },
  {
    key: "guide",
    label: "Practical guide",
    hint: "Signals an evergreen episode worth linking to.",
    build: ({ keyword, audience }) =>
      keyword ? `A practical guide to ${keyword}${audience ? ` for ${audience}` : ""}` : "",
  },
  {
    key: "contrarian",
    label: "Contrarian claim",
    hint: "Use sparingly, and only when the episode really argues it.",
    build: ({ keyword, claim }) => (keyword && claim ? `Why ${keyword} ${claim}` : ""),
  },
];

/**
 * Generate and score title candidates.
 *
 * @param {object} input
 * @param {string} input.keyword - the searchable topic
 * @param {string} [input.angle] - completes "Keyword: <angle>"
 * @param {string} [input.claim] - completes "Why <keyword> <claim>"
 * @param {string} [input.guest]
 * @param {string} [input.achievement] - completes "How <guest> <achievement>"
 * @param {string} [input.audience]
 * @param {number|string} [input.number]
 * @param {string} [input.caseStyle] - "title" or "sentence"
 * @returns {object} result or { error }
 */
export function generateTitles({
  keyword = "",
  angle = "",
  claim = "",
  guest = "",
  achievement = "",
  audience = "",
  number = 5,
  caseStyle = "sentence",
} = {}) {
  const key = collapse(keyword);
  if (!key) return { error: "Enter the topic or keyword the episode should be found by." };
  if (key.length > 60) return { error: "Keep the keyword short — under 60 characters." };

  const countValue = Math.trunc(Number(number));
  const count = Number.isFinite(countValue) && countValue > 0 && countValue <= 99 ? countValue : null;

  const parts = {
    keyword: key,
    angle: collapse(angle),
    claim: collapse(claim),
    guest: collapse(guest),
    achievement: collapse(achievement),
    audience: collapse(audience),
    number: count,
  };

  const format = caseStyle === "title" ? toTitleCase : toSentenceCase;

  // Every candidate is dropped only when its pattern.build() returns "". The
  // "listicle", "guestOn", "how", "colon" and "contrarian" patterns need extra
  // fields, but "mistake", "question" and "guide" each build successfully from
  // `keyword` alone (with optional fields as fallbacks), and `keyword` is guaranteed
  // non-empty by the `!key` check above — so at least those three always survive and
  // `candidates` can never come out empty here.
  const candidates = TITLE_PATTERNS.map((pattern) => {
    const raw = pattern.build(parts);
    if (!raw) return null;
    const title = format(raw);
    return { pattern: pattern.key, patternLabel: pattern.label, hint: pattern.hint, title, ...scoreTitle(title, key) };
  }).filter(Boolean);

  candidates.sort((a, b) => b.score - a.score || a.chars - b.chars);

  const best = candidates[0];
  const withinList = candidates.filter((item) => item.chars <= LIST_TRUNCATION).length;

  return {
    keyword: key,
    candidates,
    best,
    withinList,
    total: candidates.length,
    summary: `${withinList} of ${candidates.length} titles fit inside the ~${LIST_TRUNCATION} characters a phone episode list shows.`,
  };
}
