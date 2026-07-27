/**
 * YouTube tag organising: dedupe, classify, budget against the 500-character
 * tags field, and compare the resulting mix against a per-video-type target.
 */

/**
 * The whole tags field on a YouTube video is limited to 500 characters.
 * The YouTube Data API counts the separating commas toward that limit, and
 * wraps any tag containing a space in double quotes — those quotes count too.
 */
export const TAGS_FIELD_MAX_CHARS = 500;

/** Characters added by the quotes the API puts around a multi-word tag. */
export const QUOTE_COST = 2;

/** One character per separating comma between tags. */
export const SEPARATOR_COST = 1;

/**
 * Practical ceiling for a single tag. Not a documented platform limit, but
 * long single tags eat the shared 500-character budget for little return.
 */
export const RECOMMENDED_MAX_TAG_CHARS = 30;

/** Below this many usable tags the field is generally under-used. */
export const MIN_USEFUL_TAGS = 5;

export const TAG_CLASSES = {
  brand: { id: "brand", label: "Brand" },
  broad: { id: "broad", label: "Broad (1 word)" },
  specific: { id: "specific", label: "Specific (2 words)" },
  longTail: { id: "longTail", label: "Long-tail (3+ words)" },
};

/**
 * Target share of non-brand tags by video type.
 * Planning heuristic for coverage, not a YouTube ranking rule: a tutorial
 * benefits from precise phrase tags, a vlog from broader topical ones.
 */
export const VIDEO_TYPE_TARGETS = [
  {
    id: "tutorial",
    label: "Tutorial / how-to",
    broad: 0.2,
    specific: 0.35,
    longTail: 0.45,
    note: "People search tutorials as full questions, so most tags should be phrases.",
  },
  {
    id: "review",
    label: "Product review",
    broad: 0.25,
    specific: 0.45,
    longTail: 0.3,
    note: "Model names and \"<product> review\" pairs carry most of the intent.",
  },
  {
    id: "vlog",
    label: "Vlog / lifestyle",
    broad: 0.45,
    specific: 0.35,
    longTail: 0.2,
    note: "Discovery is topical rather than query-driven, so broader tags earn their place.",
  },
  {
    id: "shorts",
    label: "Shorts",
    broad: 0.5,
    specific: 0.35,
    longTail: 0.15,
    note: "Shorts surface through the feed, so keep the set short and broad.",
  },
  {
    id: "podcast",
    label: "Podcast / interview",
    broad: 0.3,
    specific: 0.4,
    longTail: 0.3,
    note: "Guest names and episode topics do the work; the show name is your brand tag.",
  },
];

export function getVideoType(typeId) {
  return VIDEO_TYPE_TARGETS.find((type) => type.id === typeId) || VIDEO_TYPE_TARGETS[0];
}

/** Characters one tag costs inside the field, quotes included. */
export function tagCharCost(tag) {
  const text = String(tag ?? "");
  return text.length + (/\s/.test(text) ? QUOTE_COST : 0);
}

/** Characters a whole list costs: every tag plus the commas between them. */
export function listCharCost(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return 0;
  const body = tags.reduce((sum, tag) => sum + tagCharCost(tag), 0);
  return body + (tags.length - 1) * SEPARATOR_COST;
}

/** Words in a tag, used to classify how specific it is. */
export function tagWordCount(tag) {
  const text = String(tag ?? "").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Split pasted input on commas and newlines, strip hashes and collapse spaces. */
export function normaliseTags(raw) {
  return String(raw ?? "")
    .split(/[,\n]+/)
    .map((token) =>
      token
        .trim()
        .replace(/^#+/, "")
        .replace(/["']/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function classify(tag, brandTerms) {
  const lower = tag.toLowerCase();
  if (brandTerms.some((term) => term && lower.includes(term))) return TAG_CLASSES.brand.id;
  const words = tagWordCount(tag);
  if (words <= 1) return TAG_CLASSES.broad.id;
  if (words === 2) return TAG_CLASSES.specific.id;
  return TAG_CLASSES.longTail.id;
}

/**
 * Organise a pasted tag list.
 * @param {object} input
 * @param {string} input.rawTags  comma or newline separated tags
 * @param {string} input.brand    brand/channel terms, comma separated
 * @param {string} input.videoTypeId
 * @param {number} [input.budget] character budget, defaults to the field limit
 */
export function organiseTags(input = {}) {
  const { rawTags = "", brand = "", videoTypeId = VIDEO_TYPE_TARGETS[0].id, budget } = input;

  const limit = budget === undefined ? TAGS_FIELD_MAX_CHARS : Number(budget);
  if (!Number.isFinite(limit) || limit <= 0 || limit > TAGS_FIELD_MAX_CHARS) {
    return {
      error: `Character budget must be between 1 and ${TAGS_FIELD_MAX_CHARS}.`,
    };
  }

  const parsed = normaliseTags(rawTags);
  if (parsed.length === 0) {
    return { error: "Paste some tags first — separate them with commas or new lines." };
  }

  const brandTerms = normaliseTags(brand).map((term) => term.toLowerCase());

  const seen = new Map();
  const duplicates = [];
  const tooLong = [];

  parsed.forEach((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(tag);
      return;
    }
    if (tagCharCost(tag) > limit) {
      tooLong.push(tag);
      return;
    }
    seen.set(key, tag);
  });

  const unique = [...seen.values()];
  if (unique.length === 0) {
    return { error: "Every tag was either a duplicate or longer than the whole character budget." };
  }

  const classified = unique.map((tag) => ({
    tag,
    words: tagWordCount(tag),
    cost: tagCharCost(tag),
    className: classify(tag, brandTerms),
    overRecommended: tag.length > RECOMMENDED_MAX_TAG_CHARS,
  }));

  // Brand tags first (they are the ones you never want cut), then the rest in
  // the order they were pasted. Greedily keep tags while the field still fits.
  const ordered = [
    ...classified.filter((item) => item.className === TAG_CLASSES.brand.id),
    ...classified.filter((item) => item.className !== TAG_CLASSES.brand.id),
  ];

  const kept = [];
  const dropped = [];
  let used = 0;

  ordered.forEach((item) => {
    const addition = item.cost + (kept.length > 0 ? SEPARATOR_COST : 0);
    if (used + addition <= limit) {
      kept.push(item);
      used += addition;
    } else {
      dropped.push(item);
    }
  });

  const counts = {
    brand: kept.filter((item) => item.className === TAG_CLASSES.brand.id).length,
    broad: kept.filter((item) => item.className === TAG_CLASSES.broad.id).length,
    specific: kept.filter((item) => item.className === TAG_CLASSES.specific.id).length,
    longTail: kept.filter((item) => item.className === TAG_CLASSES.longTail.id).length,
  };

  const nonBrand = counts.broad + counts.specific + counts.longTail;
  const videoType = getVideoType(videoTypeId);

  const mix = ["broad", "specific", "longTail"].map((key) => {
    const actualShare = nonBrand > 0 ? counts[key] / nonBrand : 0;
    const targetShare = videoType[key];
    const targetCount = Math.round(targetShare * nonBrand);
    return {
      key,
      label: TAG_CLASSES[key].label,
      count: counts[key],
      actualShare,
      targetShare,
      targetCount,
      delta: counts[key] - targetCount,
    };
  });

  const notes = [];
  if (duplicates.length > 0) {
    notes.push(`Removed ${duplicates.length} duplicate ${duplicates.length === 1 ? "tag" : "tags"}.`);
  }
  if (tooLong.length > 0) {
    notes.push(`${tooLong.length} tag(s) were longer than the whole budget and were discarded.`);
  }
  if (dropped.length > 0) {
    notes.push(`${dropped.length} tag(s) did not fit in the ${limit}-character field.`);
  }
  const overRecommended = kept.filter((item) => item.overRecommended);
  if (overRecommended.length > 0) {
    notes.push(
      `${overRecommended.length} kept tag(s) run past ${RECOMMENDED_MAX_TAG_CHARS} characters — they use budget quickly.`,
    );
  }
  if (kept.length < MIN_USEFUL_TAGS) {
    notes.push(`Only ${kept.length} tag(s) kept. Under ${MIN_USEFUL_TAGS} the field is under-used.`);
  }

  return {
    videoType: { id: videoType.id, label: videoType.label, note: videoType.note },
    limit,
    kept,
    dropped,
    duplicates,
    tooLong,
    counts,
    nonBrand,
    mix,
    usedChars: used,
    remainingChars: limit - used,
    usedShare: used / limit,
    output: kept.map((item) => item.tag).join(", "),
    notes,
  };
}
