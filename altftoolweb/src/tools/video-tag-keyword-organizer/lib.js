/**
 * Video Tag Keyword Organizer — pure keyword-set maths.
 * No React, no JSX, no DOM.
 */

/** YouTube's tags field accepts 500 characters in total, commas included. */
export const MAX_TAG_CHARS = 500;

/** Tags are comma separated, so a comma inside a tag splits it into two. */
export const TAG_SEPARATOR = ",";

/** Practical guideline, not a platform rule: very long tags rarely match a real search. */
export const LONG_TAG_CHARS = 30;

/** Sanity ceiling on how many groups and tags one plan can hold. */
export const MAX_GROUPS = 30;
export const MAX_TAGS_PER_GROUP = 200;

/**
 * Parse a group block. One group per line:
 *   Core: video editing, editing tutorial
 * Lines without a colon become a group called "Ungrouped".
 */
export function parseGroups(text) {
  const groups = [];
  const lines = String(text ?? "").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    const name = colon > 0 ? trimmed.slice(0, colon).trim() : "Ungrouped";
    const body = colon > 0 ? trimmed.slice(colon + 1) : trimmed;
    const tags = body
      .split(TAG_SEPARATOR)
      .map((tag) => tag.trim().replace(/\s+/g, " "))
      .filter(Boolean)
      .slice(0, MAX_TAGS_PER_GROUP);
    if (tags.length === 0) continue;
    const existing = groups.find((group) => group.name.toLowerCase() === name.toLowerCase());
    if (existing) existing.tags.push(...tags);
    else groups.push({ name, tags });
    if (groups.length > MAX_GROUPS) break;
  }
  return groups;
}

/** How many characters a tag list costs in the tags field: tags plus the commas between them. */
export function charCost(tags) {
  const list = Array.isArray(tags) ? tags : [];
  if (list.length === 0) return 0;
  return list.reduce((sum, tag) => sum + String(tag).length, 0) + (list.length - 1);
}

/**
 * Merge the selected groups into one tag set, de-duplicated and trimmed to the character limit.
 *
 * @param {object} options
 * @param {Array} options.groups     [{ name, tags: string[] }]
 * @param {string[]} options.selected Group names to include, in priority order.
 * @param {number} options.maxChars  Character budget, default 500.
 * @returns {{error:string}|{included:Array,excluded:Array,chars:number,remaining:number,duplicatesRemoved:number,warnings:string[]}}
 */
export function buildTagSet({ groups = [], selected = [], maxChars = MAX_TAG_CHARS } = {}) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return { error: "Add at least one keyword group, for example: Core: video editing, tutorial" };
  }
  const budget = Math.round(Number(maxChars));
  if (!Number.isFinite(budget) || budget < 1 || budget > 5000) {
    return { error: `The character budget must be between 1 and 5000 (YouTube allows ${MAX_TAG_CHARS}).` };
  }

  const chosenNames = Array.isArray(selected) ? selected : [];
  const chosen = chosenNames
    .map((name) => groups.find((group) => group.name === name))
    .filter(Boolean);
  if (chosen.length === 0) {
    return { error: "Select at least one group to build a tag set." };
  }

  const seen = new Map();
  const ordered = [];
  let duplicatesRemoved = 0;

  for (const group of chosen) {
    for (const rawTag of group.tags) {
      const tag = String(rawTag).trim().replace(/\s+/g, " ");
      if (!tag) continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) {
        duplicatesRemoved += 1;
        continue;
      }
      seen.set(key, true);
      ordered.push({ tag, group: group.name, length: tag.length });
    }
  }

  if (ordered.length === 0) {
    return { error: "The selected groups have no usable tags." };
  }

  const included = [];
  const excluded = [];
  let chars = 0;
  for (const entry of ordered) {
    const cost = included.length === 0 ? entry.length : entry.length + 1;
    if (chars + cost <= budget) {
      included.push(entry);
      chars += cost;
    } else {
      excluded.push(entry);
    }
  }

  const warnings = [];
  if (excluded.length > 0) {
    warnings.push(
      `${excluded.length} tag${excluded.length === 1 ? " does" : "s do"} not fit in ${budget} characters and were left out — drop a group or shorten the long tags.`,
    );
  }
  if (duplicatesRemoved > 0) {
    warnings.push(`${duplicatesRemoved} duplicate tag${duplicatesRemoved === 1 ? "" : "s"} removed (matching is case-insensitive).`);
  }
  const longTags = included.filter((entry) => entry.length > LONG_TAG_CHARS);
  if (longTags.length > 0) {
    warnings.push(
      `${longTags.length} tag${longTags.length === 1 ? " is" : "s are"} over ${LONG_TAG_CHARS} characters; long tags use up the budget fast: ${longTags
        .slice(0, 3)
        .map((entry) => entry.tag)
        .join(", ")}.`,
    );
  }

  const words = new Set();
  included.forEach((entry) => {
    entry.tag
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .forEach((word) => words.add(word));
  });

  const groupCounts = {};
  included.forEach((entry) => {
    groupCounts[entry.group] = (groupCounts[entry.group] || 0) + 1;
  });

  return {
    included,
    excluded,
    chars,
    remaining: budget - chars,
    budget,
    duplicatesRemoved,
    warnings,
    tagCount: included.length,
    uniqueWords: words.size,
    averageTagLength: included.length > 0 ? chars / included.length : 0,
    groupCounts,
    tagString: included.map((entry) => entry.tag).join(TAG_SEPARATOR),
  };
}

/** Compare two tag sets: what a new video shares with the channel's core set. */
export function overlap(setA, setB) {
  const a = new Set((Array.isArray(setA) ? setA : []).map((tag) => String(tag).trim().toLowerCase()).filter(Boolean));
  const b = new Set((Array.isArray(setB) ? setB : []).map((tag) => String(tag).trim().toLowerCase()).filter(Boolean));
  if (a.size === 0 || b.size === 0) return { shared: 0, percent: 0 };
  let shared = 0;
  a.forEach((tag) => {
    if (b.has(tag)) shared += 1;
  });
  return { shared, percent: (shared / Math.min(a.size, b.size)) * 100 };
}
