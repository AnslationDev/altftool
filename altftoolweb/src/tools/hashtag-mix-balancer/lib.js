/**
 * Hashtag mix balancing.
 *
 * Tags are tiered by the number of existing posts carrying them, then a set of
 * a chosen size is built so the tier split matches a target for your account
 * size. Slot counts are allocated with the largest-remainder method so the
 * rounded per-tier counts always add up to the requested total.
 */

/** Instagram rejects a post carrying more than 30 hashtags. */
export const INSTAGRAM_MAX_HASHTAGS = 30;

/**
 * Instagram's own creator guidance suggests using around 3-5 hashtags per post
 * rather than filling the field.
 */
export const RECOMMENDED_MIN_HASHTAGS = 3;
export const RECOMMENDED_MAX_HASHTAGS = 5;

/** One branded tag is reserved so your own tag never gets squeezed out. */
export const BRAND_SLOTS = 1;

/**
 * Tier thresholds by number of posts already using the hashtag.
 * Order matters: the first tier whose minimum is met wins.
 */
export const TIERS = [
  {
    id: "mega",
    label: "Mega",
    min: 1000000,
    blurb: "1M+ posts. Your post is visible for seconds; useful for topical signal, not reach.",
  },
  {
    id: "large",
    label: "Large",
    min: 100000,
    blurb: "100K-1M posts. Competitive but reachable once a post already has engagement.",
  },
  {
    id: "niche",
    label: "Niche",
    min: 10000,
    blurb: "10K-100K posts. The band where a well-performing post can stay visible for hours.",
  },
  {
    id: "micro",
    label: "Micro",
    min: 1000,
    blurb: "1K-10K posts. Small audience, but a real chance of ranking near the top.",
  },
  {
    id: "tiny",
    label: "Ultra-niche",
    min: 0,
    blurb: "Under 1K posts. Almost no competition; only worth it if the tag is genuinely searched.",
  },
];

export const MIX_TIER_IDS = ["mega", "large", "niche", "micro", "tiny"];

/**
 * Target tier split by account size. Smaller accounts get more of the small
 * tags they can realistically rank in; larger accounts can afford the crowded
 * ones. This is a planning heuristic, not a published platform rule.
 */
export const ACCOUNT_SIZES = [
  {
    id: "nano",
    label: "Under 1,000 followers",
    mix: { mega: 0.05, large: 0.1, niche: 0.25, micro: 0.35, tiny: 0.25 },
  },
  {
    id: "small",
    label: "1,000 - 10,000 followers",
    mix: { mega: 0.1, large: 0.15, niche: 0.3, micro: 0.3, tiny: 0.15 },
  },
  {
    id: "mid",
    label: "10,000 - 100,000 followers",
    mix: { mega: 0.15, large: 0.3, niche: 0.3, micro: 0.2, tiny: 0.05 },
  },
  {
    id: "large",
    label: "Over 100,000 followers",
    mix: { mega: 0.25, large: 0.35, niche: 0.25, micro: 0.15, tiny: 0 },
  },
];

export function getAccountSize(sizeId) {
  return ACCOUNT_SIZES.find((size) => size.id === sizeId) || ACCOUNT_SIZES[0];
}

/** Tier for a post volume. Returns null when the volume is unknown. */
export function tierForVolume(volume) {
  const value = Number(volume);
  if (!Number.isFinite(value) || value < 0) return null;
  return TIERS.find((tier) => value >= tier.min) || TIERS[TIERS.length - 1];
}

/** Read "1,200,000", "1.2M" or "450k" into a number. Returns null if unusable. */
export function parseVolume(raw) {
  const text = String(raw ?? "").trim().replace(/,/g, "");
  if (!text) return null;
  const match = text.match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/i);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base) || base < 0) return null;
  const suffix = (match[2] || "").toLowerCase();
  const factor = suffix === "b" ? 1e9 : suffix === "m" ? 1e6 : suffix === "k" ? 1e3 : 1;
  return Math.round(base * factor);
}

/**
 * Parse "#tag 120k" lines. Volume is optional; a tag without one is kept but
 * cannot be tiered.
 */
export function parseHashtagLines(raw) {
  const lines = String(raw ?? "")
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = [];
  const seen = new Set();
  const duplicates = [];
  const unreadable = [];

  lines.forEach((line) => {
    const parts = line.split(/\s+/).filter(Boolean);
    const rawTag = parts[0].replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    if (!rawTag) {
      unreadable.push(line);
      return;
    }
    const key = rawTag.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(`#${rawTag}`);
      return;
    }
    seen.add(key);
    const volume = parts.length > 1 ? parseVolume(parts.slice(1).join("")) : null;
    entries.push({ tag: `#${rawTag}`, volume });
  });

  return { entries, duplicates, unreadable };
}

/**
 * Largest-remainder allocation: split `total` slots across the given shares so
 * the integer counts sum to exactly `total`.
 */
export function allocateSlots(shares, total) {
  const keys = Object.keys(shares);
  const n = Math.max(0, Math.trunc(Number(total) || 0));
  const counts = {};
  keys.forEach((key) => {
    counts[key] = 0;
  });
  if (n === 0) return counts;

  const sum = keys.reduce((acc, key) => acc + (Number(shares[key]) || 0), 0);
  if (!(sum > 0)) return counts;

  const exact = keys.map((key) => ({
    key,
    value: ((Number(shares[key]) || 0) / sum) * n,
  }));

  let assigned = 0;
  exact.forEach((item) => {
    counts[item.key] = Math.floor(item.value);
    assigned += counts[item.key];
  });

  const remainders = exact
    .map((item) => ({ key: item.key, frac: item.value - Math.floor(item.value) }))
    .sort((a, b) => b.frac - a.frac || keys.indexOf(a.key) - keys.indexOf(b.key));

  let index = 0;
  while (assigned < n && remainders.length > 0) {
    counts[remainders[index % remainders.length].key] += 1;
    assigned += 1;
    index += 1;
  }

  return counts;
}

/**
 * Build a balanced hashtag set.
 * @param {object} input
 * @param {string} input.rawTags   "#tag 120k" lines
 * @param {string} input.brand     brand terms, comma separated
 * @param {string} input.accountSizeId
 * @param {number} input.setSize   how many hashtags the final set should hold
 */
export function balanceHashtags(input = {}) {
  const {
    rawTags = "",
    brand = "",
    accountSizeId = ACCOUNT_SIZES[0].id,
    setSize = RECOMMENDED_MAX_HASHTAGS,
  } = input;

  const size = Math.trunc(Number(setSize));
  if (!Number.isFinite(size)) {
    return { error: "Set size must be a number." };
  }
  if (size < 1 || size > INSTAGRAM_MAX_HASHTAGS) {
    return {
      error: `Set size must be between 1 and ${INSTAGRAM_MAX_HASHTAGS} hashtags.`,
    };
  }

  const { entries, duplicates, unreadable } = parseHashtagLines(rawTags);
  if (entries.length === 0) {
    return { error: "Add some hashtags — one per line, with the post count if you have it." };
  }

  const brandTerms = String(brand)
    .split(/[\n,]+/)
    .map((term) => term.trim().replace(/^#+/, "").toLowerCase())
    .filter(Boolean);

  const classified = entries.map((entry) => {
    const lower = entry.tag.slice(1).toLowerCase();
    const isBrand = brandTerms.some((term) => term && lower.includes(term));
    const tier = entry.volume === null ? null : tierForVolume(entry.volume);
    return {
      ...entry,
      isBrand,
      tierId: isBrand ? "brand" : tier ? tier.id : null,
      tierLabel: isBrand ? "Branded" : tier ? tier.label : "Unknown volume",
    };
  });

  const branded = classified.filter((item) => item.isBrand);
  const unknown = classified.filter((item) => !item.isBrand && item.tierId === null);
  const tiered = classified.filter((item) => !item.isBrand && item.tierId !== null);

  const account = getAccountSize(accountSizeId);

  const brandPicked = branded.slice(0, Math.min(BRAND_SLOTS, size));
  const remainingSlots = size - brandPicked.length;
  const target = allocateSlots(account.mix, remainingSlots);

  // Pick per tier, smallest volume first inside a tier: those are the ones a
  // post has the best chance of ranking in.
  const pool = {};
  MIX_TIER_IDS.forEach((tierId) => {
    pool[tierId] = tiered
      .filter((item) => item.tierId === tierId)
      .sort((a, b) => a.volume - b.volume);
  });

  const picked = [...brandPicked];
  const shortfall = {};

  MIX_TIER_IDS.forEach((tierId) => {
    const want = target[tierId] || 0;
    const available = pool[tierId];
    const take = Math.min(want, available.length);
    picked.push(...available.slice(0, take));
    shortfall[tierId] = want - take;
    pool[tierId] = available.slice(take);
  });

  // Backfill any unfilled slots from whatever is left, closest tiers first.
  const leftovers = MIX_TIER_IDS.flatMap((tierId) => pool[tierId]).concat(
    branded.slice(brandPicked.length),
    unknown,
  );
  let leftoverIndex = 0;
  while (picked.length < size && leftoverIndex < leftovers.length) {
    picked.push(leftovers[leftoverIndex]);
    leftoverIndex += 1;
  }

  const actual = {};
  MIX_TIER_IDS.forEach((tierId) => {
    actual[tierId] = picked.filter((item) => item.tierId === tierId).length;
  });

  const nonBrandPicked = picked.filter((item) => !item.isBrand && item.tierId !== null).length;

  const mixRows = MIX_TIER_IDS.map((tierId) => {
    const tier = TIERS.find((item) => item.id === tierId);
    return {
      id: tierId,
      label: tier.label,
      blurb: tier.blurb,
      targetShare: account.mix[tierId] || 0,
      targetCount: target[tierId] || 0,
      count: actual[tierId] || 0,
      actualShare: nonBrandPicked > 0 ? (actual[tierId] || 0) / nonBrandPicked : 0,
      available: tiered.filter((item) => item.tierId === tierId).length,
      shortfall: shortfall[tierId] || 0,
    };
  });

  const notes = [];
  if (duplicates.length > 0) {
    notes.push(`Removed ${duplicates.length} duplicate hashtag(s).`);
  }
  if (unreadable.length > 0) {
    notes.push(`${unreadable.length} line(s) had no usable hashtag and were skipped.`);
  }
  if (unknown.length > 0) {
    notes.push(
      `${unknown.length} hashtag(s) have no post count, so they could not be tiered — add a number like "120k" after the tag.`,
    );
  }
  if (branded.length === 0) {
    notes.push("No branded hashtag found. One tag you own makes your posts findable as a set.");
  }
  const missing = MIX_TIER_IDS.filter((tierId) => (shortfall[tierId] || 0) > 0);
  if (missing.length > 0) {
    notes.push(
      `Not enough tags in: ${missing
        .map((tierId) => TIERS.find((tier) => tier.id === tierId).label)
        .join(", ")}. Slots were filled from other tiers.`,
    );
  }
  if (picked.length < size) {
    notes.push(`Only ${picked.length} hashtags available for a set of ${size}.`);
  }
  if (size > RECOMMENDED_MAX_HASHTAGS) {
    notes.push(
      `Instagram's own guidance suggests ${RECOMMENDED_MIN_HASHTAGS}-${RECOMMENDED_MAX_HASHTAGS} hashtags per post rather than filling the field.`,
    );
  }

  return {
    account: { id: account.id, label: account.label },
    setSize: size,
    picked,
    classified,
    branded,
    unknown,
    mixRows,
    notes,
    output: picked.map((item) => item.tag).join(" "),
    totalAvailable: classified.length,
  };
}
