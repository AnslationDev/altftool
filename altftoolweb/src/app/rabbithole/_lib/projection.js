import { hashString } from "@altftool/core/rabbithole/hash";

/**
 * Trims catalog records down to the fields the client explorer actually
 * renders. `description` and `whyItsGood` are roughly three quarters of a
 * record's weight and are only read on detail pages, so shipping them to the
 * browser would triple the RSC payload for nothing.
 */
export function toBrowseProjection(sites) {
  const projected = sites.map((site) => ({
    slug: site.slug,
    name: site.name,
    host: site.host,
    url: site.url,
    category: site.category,
    blurb: site.blurb,
    timeToJoy: site.timeToJoy,
    vibes: site.vibes,
    bestOn: site.bestOn,
    needsAccount: site.needsAccount,
    free: site.free,
    year: site.year,
    altfAlternative: site.altfAlternative,
  }));

  return interleaveByCategory(projected);
}

/**
 * The default "curated" order. Alphabetical would open the browse page with a
 * screen and a half of the same category, which reads as a thin directory even
 * though it is not. Dealing one site per category in rotation makes the first
 * screen show the actual breadth. Deterministic, so the static HTML is stable.
 */
export function interleaveByCategory(sites) {
  const buckets = new Map();

  for (const site of sites) {
    if (!buckets.has(site.category)) buckets.set(site.category, []);
    buckets.get(site.category).push(site);
  }

  for (const [category, bucket] of buckets) {
    bucket.sort(
      (a, b) =>
        hashString(`order:${category}:${a.slug}`) -
        hashString(`order:${category}:${b.slug}`),
    );
  }

  const order = [...buckets.keys()].sort();
  const result = [];
  let index = 0;
  let added = true;

  while (added) {
    added = false;
    for (const category of order) {
      const bucket = buckets.get(category);
      if (index < bucket.length) {
        result.push(bucket[index]);
        added = true;
      }
    }
    index += 1;
  }

  return result;
}
