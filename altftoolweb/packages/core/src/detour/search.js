/**
 * AltF Detour — catalog search.
 *
 * A directory of 1,300 entries that can only be browsed is half a product: most
 * people arrive knowing roughly what they want ("bubble wrap", "old games",
 * "rain sounds") and a filter tree cannot answer that.
 *
 * Deliberately not a fuzzy matcher. Typo tolerance sounds generous but on a
 * catalog this size it mostly surfaces confident nonsense — "cat" matching
 * "chat", "cast", "cart". Exact substring matching over name, category and
 * blurb, scored by where the hit landed, gets the right answer far more often
 * and is a tenth of the code.
 *
 * Pure and dependency-free so it runs identically on the server (for the
 * crawlable, no-JS result page) and in the browser (for as-you-type).
 */

/** Field weights. A name hit is worth far more than a blurb hit. */
const WEIGHT = {
  nameExact: 1000,
  namePrefix: 500,
  nameWord: 300,
  nameSubstring: 150,
  categoryName: 80,
  vibe: 40,
  blurbWord: 30,
  blurbSubstring: 10,
};

export function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Forms of a term worth trying, most specific first.
 *
 * Matching is prefix-based, which already covers singular → plural ("sound"
 * finds "sounds"). The reverse does not work, so a trailing "s" is stripped as
 * a fallback: without it "rain sounds" misses every entry whose blurb says
 * "sound". Deliberately not a stemmer — English stemming brings more false
 * matches than it fixes at this scale.
 */
function variantsOf(term) {
  if (term.length > 3 && term.endsWith("s")) {
    return [term, term.slice(0, -1)];
  }
  return [term];
}

/**
 * Scores one site against one already-normalised term. Returns 0 for no match
 * so the caller can treat scoring and filtering as the same pass.
 */
function scoreTerm(site, rawTerm, categoryName) {
  if (!rawTerm) return 0;

  let best = 0;
  for (const term of variantsOf(rawTerm)) {
    // The singular fallback scores slightly lower than an exact hit, so an
    // exact match always outranks one that needed the fallback.
    const penalty = term === rawTerm ? 1 : 0.9;
    best = Math.max(best, scoreExact(site, term, categoryName) * penalty);
    if (best >= WEIGHT.nameExact) break;
  }
  return best;
}

function scoreExact(site, term, categoryName) {
  const name = normalise(site.name);

  if (name === term) return WEIGHT.nameExact;
  if (name.startsWith(term)) return WEIGHT.namePrefix;

  // Word-boundary hit inside the name — "sand" matching "Falling Sand".
  if (name.split(" ").some((word) => word.startsWith(term))) {
    return WEIGHT.nameWord;
  }
  if (name.includes(term)) return WEIGHT.nameSubstring;

  if (
    categoryName &&
    normalise(categoryName)
      .split(" ")
      .some((word) => word.startsWith(term))
  ) {
    return WEIGHT.categoryName;
  }

  // Prefix, not substring. Vibe ids are single words and several contain each
  // other as substrings — "brainy" contains "rain", which quietly made every
  // brainy site a match for a search about rain sounds.
  if (site.vibes?.some((vibe) => vibe.startsWith(term))) return WEIGHT.vibe;

  // Blurbs are matched on word starts only. A raw substring search across
  // prose is almost pure noise: "rain" hits "trainer", "constraints" and
  // "brain", and because terms are AND-ed one bad hit drags an unrelated site
  // into the results rather than merely ranking it low.
  const blurb = normalise(site.blurb);
  if (blurb.split(" ").some((word) => word.startsWith(term))) {
    return WEIGHT.blurbWord;
  }

  return 0;
}

/**
 * Searches the catalog.
 *
 * Multi-word queries are AND-ed: every term must hit something, or a search for
 * "retro racing" returns everything retro plus everything racing, which is
 * worse than no results. Scores are summed so a site matching both strongly
 * outranks one that scrapes past on each.
 *
 * `categoryNames` maps category id → display name so "puzzle" can match the
 * category without every caller re-deriving it.
 */
export function searchSites(sites, query, { categoryNames, limit } = {}) {
  const terms = normalise(query).split(" ").filter(Boolean);
  if (!terms.length) return [];

  const scored = [];

  for (const site of sites) {
    const categoryName = categoryNames?.get(site.category);
    let total = 0;
    let matchedAll = true;

    for (const term of terms) {
      const score = scoreTerm(site, term, categoryName);
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }

    if (matchedAll) scored.push({ site, score: total });
  }

  scored.sort((a, b) =>
    b.score === a.score
      ? a.site.name.localeCompare(b.site.name, "en")
      : b.score - a.score,
  );

  const results = scored.map((entry) => entry.site);
  return typeof limit === "number" ? results.slice(0, limit) : results;
}

/**
 * Suggestions for an empty or fruitless search. Drawn from the catalog rather
 * than hard-coded so they cannot drift out of date, and biased toward acclaimed
 * entries because those are the ones worth leading with.
 */
export function suggestedSearches(sites, count = 8) {
  const seen = new Set();
  const out = [];

  for (const site of sites) {
    if (out.length >= count) break;
    if (!site.acclaimed) continue;
    const first = normalise(site.name).split(" ")[0];
    if (first.length < 4 || seen.has(first)) continue;
    seen.add(first);
    out.push(site.name);
  }

  return out;
}
