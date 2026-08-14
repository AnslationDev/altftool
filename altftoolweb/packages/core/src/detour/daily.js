/**
 * AltF Detour — the daily pick.
 *
 * A random button gives people no reason to come back tomorrow: every visit is
 * the same offer. One deliberate pick per day is the cheapest possible return
 * hook, and unlike the button it produces a stable, indexable page.
 *
 * Deterministic from the date alone. No storage, no cron, no build step — the
 * same date yields the same site on every server, forever, which means the page
 * can be cached and shared without two people seeing different answers.
 */

/**
 * Meta categories are excluded from the daily pick. "Today's detour is a
 * directory of other directories" is a wasted day, and one of those entries is
 * this site's own competitor set.
 */
const EXCLUDED_CATEGORIES = new Set(["directories", "arcade-hubs"]);

/** FNV-1a. Small, fast, and well spread for short ASCII keys like a date. */
export function hashString(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    // The FNV prime, via shifts because Math.imul on 16777619 overflows to
    // float precision in some engines.
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

/** `YYYY-MM-DD` in UTC, so the pick turns over at the same instant worldwide. */
export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** The pool the daily pick draws from, sorted for a stable index. */
export function dailyPool(sites) {
  return sites
    .filter((site) => !EXCLUDED_CATEGORIES.has(site.category))
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug, "en"));
}

/**
 * The site for a given day. `offset` steps backwards through previous days,
 * which is how the page renders "yesterday" and "the day before" without
 * needing to store anything.
 */
export function pickForDate(sites, key = dateKey(), offset = 0) {
  const pool = dailyPool(sites);
  if (!pool.length) return null;

  /*
   * Rendezvous hashing rather than `hash(date) % pool.length`.
   *
   * The modulo version reshuffles every future *and past* pick whenever the
   * catalog size changes, which would make the "Previously" list on
   * /detour/today quietly wrong — it would show sites that were never actually
   * the pick on those days, while the page claims the opposite.
   *
   * Hashing each candidate against the date and taking the highest instead
   * means adding an entry only changes the days that entry now wins (~1 in N),
   * and removing one only changes the days it used to win. Every other day is
   * untouched, so the archive stays honest as the catalog grows.
   */
  const seed = `${key}#${offset}`;
  let best = pool[0];
  let bestScore = hashString(`${seed}#${pool[0].slug}`);

  for (let index = 1; index < pool.length; index += 1) {
    const score = hashString(`${seed}#${pool[index].slug}`);
    // Slug comparison breaks ties so the result never depends on pool order.
    if (score > bestScore || (score === bestScore && pool[index].slug < best.slug)) {
      best = pool[index];
      bestScore = score;
    }
  }

  return best;
}

/** The last `count` days, most recent first. Used for the archive strip. */
export function recentPicks(sites, count = 7, from = new Date()) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(from);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = dateKey(date);
    return { key, offset, site: pickForDate(sites, key, 0) };
  });
}
