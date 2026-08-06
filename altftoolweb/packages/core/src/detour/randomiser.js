/**
 * AltF Detour — the picker behind the button.
 *
 * Kept as pure functions with an injectable random source so the behaviour is
 * unit-testable. Everything a caller can tune is a filter; the only opinion
 * baked in is the weighting below.
 *
 * Weighting: AltF originals are picked more often than their share of the
 * catalog. The reason is operational rather than promotional — they are the only
 * entries we can promise are still online, load in under a second, carry no
 * third-party tracking and will not have quietly become a parked domain. A
 * random button that lands on a dead link twice in a row is a broken product.
 * `ORIGINAL_WEIGHT` is deliberately modest so the external web still dominates.
 */

const ORIGINAL_WEIGHT = 3;
const EXTERNAL_WEIGHT = 1;

/** How many recent picks to remember before allowing a repeat. */
export const HISTORY_DEPTH = 40;

export function weightFor(site) {
  return site.origin === "altf" ? ORIGINAL_WEIGHT : EXTERNAL_WEIGHT;
}

/**
 * Narrows the catalog. Every key is optional; an omitted key does not filter.
 * `vibes` and `categories` are OR-matched within themselves and AND-matched
 * against each other, which is what a visitor ticking boxes expects.
 */
export function filterSites(sites, filters = {}) {
  const {
    timeToJoy,
    vibes,
    categories,
    families,
    sfwOnly = false,
    silentOnly = false,
    mobileOnly = false,
    freeOnly = false,
    noAccountOnly = false,
    originalsOnly = false,
    categoryFamilyMap,
  } = filters;

  const vibeSet = vibes?.length ? new Set(vibes) : null;
  const categorySet = categories?.length ? new Set(categories) : null;
  const familySet = families?.length ? new Set(families) : null;

  return sites.filter((site) => {
    if (timeToJoy && site.timeToJoy !== timeToJoy) return false;
    if (categorySet && !categorySet.has(site.category)) return false;
    if (familySet) {
      const family = categoryFamilyMap?.get(site.category);
      if (!family || !familySet.has(family)) return false;
    }
    if (vibeSet && !site.vibes.some((vibe) => vibeSet.has(vibe))) return false;
    if (sfwOnly && !site.sfw) return false;
    if (silentOnly && site.needsSound) return false;
    if (mobileOnly && site.bestOn === "desktop") return false;
    if (freeOnly && !site.free) return false;
    if (noAccountOnly && site.needsAccount) return false;
    if (originalsOnly && site.origin !== "altf") return false;
    return true;
  });
}

/**
 * Weighted pick. `exclude` is the recent-history set; it is dropped entirely
 * rather than partially when it would leave nothing to choose from, so a narrow
 * filter still returns something instead of null.
 */
export function pickRandom(sites, { exclude, random = Math.random } = {}) {
  if (!sites.length) return null;

  let pool = sites;
  if (exclude?.size) {
    const fresh = sites.filter((site) => !exclude.has(site.slug));
    if (fresh.length) pool = fresh;
  }

  const total = pool.reduce((sum, site) => sum + weightFor(site), 0);
  let ticket = random() * total;

  for (const site of pool) {
    ticket -= weightFor(site);
    if (ticket <= 0) return site;
  }

  // Floating-point drift can leave `ticket` fractionally positive after the
  // loop. Returning the last entry is correct and keeps the function total.
  return pool[pool.length - 1];
}

/** Convenience: filter then pick, in one call. */
export function pickDetour(sites, { filters, exclude, random } = {}) {
  return pickRandom(filterSites(sites, filters), { exclude, random });
}

/**
 * Bounded FIFO of recently served slugs. Returned as a new array so callers can
 * keep it in React state without mutating.
 */
export function rememberPick(history, slug, depth = HISTORY_DEPTH) {
  const next = [slug, ...history.filter((item) => item !== slug)];
  return next.slice(0, depth);
}
