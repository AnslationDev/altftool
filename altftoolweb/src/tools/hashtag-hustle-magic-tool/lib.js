/**
 * Hashtag builder — pure logic.
 *
 * Everything here is derived from the words the user pasted plus each platform's
 * published posting limits. There is NO trend feed, NO search-volume data and NO
 * network call anywhere in this file: a hashtag's "reach band" is decided by how
 * it was built (a phrase lifted from your copy is narrow, a one-word community
 * tag is broad), never by a popularity figure we do not have.
 *
 * Pure: same input -> same output. No Date, no Math.random.
 */

/* ------------------------------------------------------------------ *
 * Platform limits
 *
 * maxHashtags  — a hard, documented cap (null = the platform publishes none,
 *                so the caption character budget is the only real limit).
 * suggested    — [min, max] of the range normally advised. `suggestedSource`
 *                says whether that range comes from the platform's own help
 *                pages ("platform") or is just common editorial practice
 *                ("convention"). It is guidance, not a rule.
 * captionLimit — default character budget for the post body. Platforms change
 *                these, so the UI lets the user override the number.
 * ------------------------------------------------------------------ */
export const PLATFORMS = {
  instagram: {
    id: "instagram",
    label: "Instagram",
    maxHashtags: 30, // Instagram Help Centre: at most 30 hashtags on a post, and 30 more on a comment
    suggested: [3, 5], // Instagram's @creators guidance
    suggestedSource: "platform",
    captionLimit: 2200,
    commentHashtags: 30, // a first comment carries its own allowance of 30
    notes: [
      "A post accepts 30 hashtags; a comment accepts 30 of its own, which is why the tag block is often moved to the first comment.",
      "Going over 30 does not truncate the list — Instagram rejects the caption or comment outright.",
    ],
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    maxHashtags: null,
    suggested: [3, 5],
    suggestedSource: "convention",
    captionLimit: 2200,
    commentHashtags: null,
    notes: [
      "TikTok publishes no hashtag count limit — the caption character budget is the real ceiling, and it has been raised more than once, so check the field and adjust it if your app allows more.",
    ],
  },
  x: {
    id: "x",
    label: "X (Twitter)",
    maxHashtags: null,
    suggested: [1, 2], // X's own hashtag help page advises no more than two per post
    suggestedSource: "platform",
    captionLimit: 280,
    commentHashtags: null,
    notes: [
      "A hashtag made only of digits is not turned into a link on X, so #2026 on its own does nothing.",
      "X measures some entities (links, media) differently from plain characters, so treat the character count here as the text-only figure.",
    ],
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    maxHashtags: null,
    suggested: [3, 5],
    suggestedSource: "convention",
    captionLimit: 3000,
    commentHashtags: null,
    notes: [
      "LinkedIn publishes no cap. The post body is 3,000 characters, and only the first ~140 show before the See more fold.",
    ],
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    maxHashtags: 15, // YouTube Help: if a video carries more than 15 hashtags, ALL hashtags on it are ignored
    suggested: [2, 3],
    suggestedSource: "convention",
    captionLimit: 5000,
    commentHashtags: null,
    notes: [
      "More than 15 hashtags on a video does not just drop the extras — YouTube ignores every hashtag on that video.",
      "The first three hashtags of the description are the ones shown above the title.",
    ],
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    maxHashtags: null,
    suggested: [1, 2],
    suggestedSource: "convention",
    captionLimit: 63206,
    commentHashtags: null,
    notes: ["No published cap; long tag blocks read as spam in a feed built around text posts."],
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    maxHashtags: 20, // Pinterest Help: up to 20 hashtags in a Pin description
    suggested: [3, 5],
    suggestedSource: "convention",
    captionLimit: 500,
    commentHashtags: null,
    notes: ["Hashtags belong in the Pin description, which is 500 characters."],
  },
  threads: {
    id: "threads",
    label: "Threads",
    maxHashtags: 1, // Threads attaches a single topic tag per post
    suggested: [1, 1],
    suggestedSource: "platform",
    captionLimit: 500,
    commentHashtags: null,
    notes: [
      "Threads attaches one topic tag per post, and it may contain spaces — extra # words are typed as plain text.",
    ],
  },
};

export const PLATFORM_IDS = Object.keys(PLATFORMS);

/** Practical ceiling used for the count control when a platform publishes no cap. */
export const OPEN_PLATFORM_CEILING = 30;

/** Reach bands. Decided by how the tag was built, not by any popularity figure. */
export const BANDS = {
  yours: {
    id: "yours",
    label: "Already in your copy",
    blurb: "Hashtags you typed yourself. Kept as written, only cleaned of characters the platforms drop.",
  },
  specific: {
    id: "specific",
    label: "Specific",
    blurb: "Two-word phrases taken straight from your post. Smallest audience, closest match to what you actually wrote.",
  },
  topical: {
    id: "topical",
    label: "Topical",
    blurb: "The single content words your copy repeats most. Mid-sized audience, still your subject.",
  },
  broad: {
    id: "broad",
    label: "Broad",
    blurb: "Your top keyword joined to a community word. Widest audience, loosest match — and the most crowded.",
  },
};

/**
 * Community suffixes/prefixes used to widen a keyword. Fixed and ordered, so the
 * same keyword always produces the same broad tags in the same sequence.
 */
export const COMMUNITY_TEMPLATES = [
  { pattern: "{k}tips", label: "tips" },
  { pattern: "{k}daily", label: "daily" },
  { pattern: "{k}lovers", label: "lovers" },
  { pattern: "{k}community", label: "community" },
  { pattern: "{k}ideas", label: "ideas" },
  { pattern: "{k}inspiration", label: "inspiration" },
  { pattern: "{k}life", label: "life" },
  { pattern: "everyday{k}", label: "everyday" },
  { pattern: "{k}guide", label: "guide" },
  { pattern: "{k}routine", label: "routine" },
];

/** Closed-class words that never make a useful hashtag on their own. */
export const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are aren as at be because been before being below between both but by " +
    "can cant cannot could couldnt did didnt do does doesnt doing dont down during each few for from further had hadnt has hasnt " +
    "have havent having he her here hers herself him himself his how i if in into is isnt it its itself just let me more most " +
    "must my myself no nor not now of off on once only or other ought our ours ourselves out over own same shant she should " +
    "shouldnt so some such than that thats the their theirs them themselves then there these they this those through to too " +
    "under until up very was wasnt we were werent what when where which while who whom why will with wont would wouldnt you " +
    "your yours yourself yourselves got get gets getting really quite even also thing things one two three new make makes made " +
    "way ways lot lots today day days like need want going go goes back still much many"
  ).split(" "),
);

const MIN_KEYWORD_LENGTH = 3;
const SEPARATOR = "\n"; // one newline between the post body and the tag block
const MAX_KEYWORDS = 12;
const MAX_PHRASES = 12;

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const DISALLOWED = /[^\p{L}\p{N}_]/gu;
const DIGITS_ONLY = /^[\p{N}_]+$/u;

/**
 * Strip everything the platforms do not accept inside a hashtag.
 * Returns null when nothing usable is left.
 */
export function sanitizeHashtag(raw) {
  if (typeof raw !== "string") return null;
  const stripped = raw.trim().replace(/^#+/, "").replace(DISALLOWED, "");
  if (!stripped) return null;
  if (!LETTER_OR_DIGIT.test(stripped)) return null;
  return stripped;
}

/** #Travel -> travel, used only for de-duplication (hashtags are case-insensitive). */
export function hashtagKey(tag) {
  return String(tag).toLocaleLowerCase();
}

function toCamel(words) {
  return words
    .map((w) => w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase())
    .join("");
}

function applyCasing(words, casing) {
  if (casing === "camel") return toCamel(words);
  return words.join("").toLocaleLowerCase();
}

/**
 * Split the copy into an ordered token stream.
 * `boundary` marks a token that breaks a phrase (stopword or punctuation).
 */
function tokenize(text) {
  const tokens = [];
  const parts = String(text).split(/[^\p{L}\p{N}']+/u);
  for (const part of parts) {
    const word = part.replace(/'/g, "").toLocaleLowerCase();
    if (!word) {
      tokens.push({ word: "", boundary: true });
      continue;
    }
    const isStop = STOPWORDS.has(word) || word.length < MIN_KEYWORD_LENGTH;
    tokens.push({ word, boundary: isStop });
  }
  return tokens;
}

/**
 * Content words ranked by how often the copy uses them, ties broken by which
 * appeared first — so the ranking never depends on object key order.
 */
export function extractKeywords(text) {
  const tokens = tokenize(text);
  const seen = new Map();
  tokens.forEach((token, index) => {
    if (token.boundary || !token.word) return;
    const existing = seen.get(token.word);
    if (existing) existing.uses += 1;
    else seen.set(token.word, { word: token.word, uses: 1, firstAt: index });
  });
  return [...seen.values()].sort((a, b) => b.uses - a.uses || a.firstAt - b.firstAt);
}

/** Adjacent content-word pairs, e.g. "morning routine" from "my morning routine". */
export function extractPhrases(text) {
  const tokens = tokenize(text);
  const seen = new Map();
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.boundary || b.boundary || !a.word || !b.word) continue;
    if (a.word === b.word) continue;
    const key = `${a.word} ${b.word}`;
    const existing = seen.get(key);
    if (existing) existing.uses += 1;
    else seen.set(key, { words: [a.word, b.word], phrase: key, uses: 1, firstAt: i });
  }
  return [...seen.values()].sort((a, b) => b.uses - a.uses || a.firstAt - b.firstAt);
}

/** Hashtags the user already typed, in the order they appear. */
export function extractExistingHashtags(text) {
  const found = [];
  const matches = String(text).match(/#[^\s#]+/gu) || [];
  for (const match of matches) {
    const tag = sanitizeHashtag(match);
    if (tag) found.push(tag);
  }
  return found;
}

function makeTag({ tag, band, uses, note }) {
  return {
    tag,
    text: `#${tag}`,
    band,
    uses,
    chars: tag.length + 1,
    note,
    digitsOnly: DIGITS_ONLY.test(tag),
  };
}

function parseExtraKeywords(extra) {
  return String(extra || "")
    .split(/[,\n]/)
    .map((piece) => piece.trim())
    .filter(Boolean);
}

/**
 * Build the candidate pool, in band order.
 * Every entry is traceable to the input: a phrase, a keyword, or a keyword
 * joined to one of the fixed community words.
 */
export function buildCandidates({ text = "", extraKeywords = "", casing = "lower" } = {}) {
  const existing = extractExistingHashtags(text);
  const extras = parseExtraKeywords(extraKeywords);

  // The user's own words come first and outrank anything generated.
  const extraKeywordTokens = extras
    .map((piece) => piece.split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => w.toLocaleLowerCase()))
    .filter((words) => words.length > 0);

  const keywords = extractKeywords(text).slice(0, MAX_KEYWORDS);
  const phrases = extractPhrases(text).slice(0, MAX_PHRASES);

  const pool = [];
  const used = new Set();

  const push = (candidate) => {
    if (!candidate) return;
    const key = hashtagKey(candidate.tag);
    if (used.has(key)) return;
    used.add(key);
    pool.push(candidate);
  };

  for (const tag of existing) {
    push(makeTag({ tag, band: "yours", uses: 1, note: "typed in your copy" }));
  }

  for (const words of extraKeywordTokens) {
    const tag = sanitizeHashtag(applyCasing(words, casing));
    if (!tag) continue;
    const band = words.length > 1 ? "specific" : "topical";
    push(makeTag({ tag, band, uses: 0, note: "from your keyword list" }));
  }

  for (const phrase of phrases) {
    const tag = sanitizeHashtag(applyCasing(phrase.words, casing));
    if (!tag) continue;
    push(
      makeTag({
        tag,
        band: "specific",
        uses: phrase.uses,
        note: `phrase "${phrase.phrase}" in your copy`,
      }),
    );
  }

  for (const keyword of keywords) {
    const tag = sanitizeHashtag(applyCasing([keyword.word], casing));
    if (!tag) continue;
    push(
      makeTag({
        tag,
        band: "topical",
        uses: keyword.uses,
        note: keyword.uses === 1 ? "used once in your copy" : `used ${keyword.uses}x in your copy`,
      }),
    );
  }

  // Broad tags: top keywords widened with the fixed community words.
  const broadBases = [
    ...extraKeywordTokens.filter((w) => w.length === 1).map((w) => w[0]),
    ...keywords.map((k) => k.word),
  ];
  const seenBase = new Set();
  const orderedBases = broadBases.filter((base) => {
    if (seenBase.has(base)) return false;
    seenBase.add(base);
    return true;
  });

  for (const template of COMMUNITY_TEMPLATES) {
    for (const base of orderedBases.slice(0, 3)) {
      const words = template.pattern.startsWith("{k}")
        ? [base, template.pattern.replace("{k}", "")]
        : [template.pattern.replace("{k}", ""), base];
      const tag = sanitizeHashtag(applyCasing(words, casing));
      if (!tag) continue;
      push(
        makeTag({
          tag,
          band: "broad",
          uses: 0,
          note: `"${base}" + community word "${template.label}"`,
        }),
      );
    }
  }

  return pool;
}

/**
 * Round-robin across the bands so a set of any size spans the whole range
 * instead of being all phrases or all community tags.
 */
function selectMix(pool, count) {
  const order = ["yours", "specific", "topical", "broad"];
  const queues = new Map(order.map((band) => [band, pool.filter((c) => c.band === band)]));
  const picked = [];

  // Everything the user typed themselves is committed already.
  const yours = queues.get("yours");
  while (yours.length && picked.length < count) picked.push(yours.shift());

  let guard = 0;
  while (picked.length < count && guard < pool.length * 4) {
    guard += 1;
    let movedAny = false;
    for (const band of ["specific", "topical", "broad"]) {
      const queue = queues.get(band);
      if (!queue.length) continue;
      picked.push(queue.shift());
      movedAny = true;
      if (picked.length >= count) break;
    }
    if (!movedAny) break;
  }
  return picked;
}

export function formatHashtagBlock(tags) {
  return tags.map((t) => t.text).join(" ");
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {string} input.text        the post copy (or just a topic)
 * @param {string} input.platform    a key of PLATFORMS
 * @param {number} input.count       how many hashtags to select
 * @param {string} input.extraKeywords  comma/newline separated extra terms
 * @param {"lower"|"camel"} input.casing
 * @param {number} [input.captionLimit] override for the platform default
 * @param {boolean} [input.tagsInFirstComment] treat the block as a separate comment
 */
export function generateHashtags({
  text = "",
  platform = "instagram",
  count = 5,
  extraKeywords = "",
  casing = "lower",
  captionLimit,
  tagsInFirstComment = false,
} = {}) {
  const platformDef = PLATFORMS[platform];
  if (!platformDef) {
    return { error: `Unknown platform "${platform}". Pick one of: ${PLATFORM_IDS.join(", ")}.` };
  }

  const body = typeof text === "string" ? text : "";
  if (!body.trim() && !String(extraKeywords || "").trim()) {
    return {
      error:
        "Paste the post copy, or at least a topic, first — every hashtag here is built from your own words.",
    };
  }

  const hardCap = platformDef.maxHashtags ?? OPEN_PLATFORM_CEILING;
  const requested = Number(count);
  if (!Number.isFinite(requested) || requested < 1) {
    return { error: "Choose how many hashtags you want — it has to be a whole number of 1 or more." };
  }
  const wanted = Math.min(Math.floor(requested), hardCap);

  const pool = buildCandidates({ text: body, extraKeywords, casing });
  if (pool.length === 0) {
    return {
      error:
        "No usable words found. The copy is all stopwords, punctuation or emoji — add a keyword such as the product, place or topic.",
    };
  }

  const selected = selectMix(pool, wanted);
  const block = formatHashtagBlock(selected);

  const bodyChars = [...body].length;
  const blockChars = [...block].length;
  const captionBudget = Number.isFinite(Number(captionLimit)) && Number(captionLimit) > 0
    ? Math.floor(Number(captionLimit))
    : platformDef.captionLimit;

  const captionChars = tagsInFirstComment
    ? bodyChars
    : bodyChars + (blockChars ? blockChars + SEPARATOR.length : 0);
  const remaining = captionBudget - captionChars;

  const counts = { yours: 0, specific: 0, topical: 0, broad: 0 };
  for (const tag of selected) counts[tag.band] += 1;

  const warnings = [];
  if (platformDef.maxHashtags && requested > platformDef.maxHashtags) {
    warnings.push(
      `${platformDef.label} accepts at most ${platformDef.maxHashtags} ${
        platformDef.maxHashtags === 1 ? "hashtag" : "hashtags"
      }, so the set was cut to ${wanted}.`,
    );
  }
  if (!platformDef.maxHashtags && requested > OPEN_PLATFORM_CEILING) {
    warnings.push(
      `${platformDef.label} publishes no hashtag cap, but this tool stops at ${OPEN_PLATFORM_CEILING} per post.`,
    );
  }
  if (selected.length < wanted) {
    warnings.push(
      `Only ${selected.length} distinct hashtags could be built from this copy. Add more detail or list extra keywords.`,
    );
  }
  if (remaining < 0) {
    warnings.push(
      `The caption is ${Math.abs(remaining)} characters over the ${captionBudget}-character budget for ${platformDef.label}.`,
    );
  }
  if (platformDef.id === "x" && selected.some((t) => t.digitsOnly)) {
    warnings.push("A hashtag made only of digits is not linked on X — rename or drop it.");
  }
  if (platformDef.id === "youtube" && selected.length > 15) {
    warnings.push("Over 15 hashtags makes YouTube ignore every hashtag on the video.");
  }
  if (platformDef.id === "threads" && selected.length > 1) {
    warnings.push("Threads attaches one topic tag per post; the rest post as plain text.");
  }
  if (tagsInFirstComment && !platformDef.commentHashtags) {
    warnings.push(
      `${platformDef.label} does not give comments their own hashtag allowance, so moving the block there mainly hides it from the caption.`,
    );
  }

  return {
    platform: {
      id: platformDef.id,
      label: platformDef.label,
      maxHashtags: platformDef.maxHashtags,
      suggested: platformDef.suggested,
      suggestedSource: platformDef.suggestedSource,
      captionLimit: platformDef.captionLimit,
      commentHashtags: platformDef.commentHashtags,
      notes: platformDef.notes,
    },
    requested: Math.floor(requested),
    selectedCount: selected.length,
    tags: selected,
    pool,
    block,
    counts,
    chars: {
      body: bodyChars,
      block: blockChars,
      caption: captionChars,
      budget: captionBudget,
      remaining,
      separator: tagsInFirstComment ? 0 : blockChars ? SEPARATOR.length : 0,
    },
    tagsInFirstComment,
    keywords: extractKeywords(body).slice(0, MAX_KEYWORDS),
    existing: extractExistingHashtags(body),
    warnings,
  };
}

/** Copy-ready text: the caption as it would be pasted, plus the block. */
export function buildCopyOutput(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(result.block);
  lines.push("");
  lines.push(
    `${result.selectedCount} hashtags for ${result.platform.label} — ` +
      `${result.counts.yours} yours, ${result.counts.specific} specific, ` +
      `${result.counts.topical} topical, ${result.counts.broad} broad`,
  );
  lines.push(
    `Caption ${result.chars.caption} / ${result.chars.budget} characters` +
      (result.tagsInFirstComment ? " (tags posted as the first comment)" : " (tags inside the caption)"),
  );
  return lines.join("\n");
}
