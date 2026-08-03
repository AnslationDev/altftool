/**
 * Indexing policy for the /top11 family.
 *
 * The section renders placeholder editorial data (see ./mock-data.js): the view
 * counts, the "184,000+ rankings" figure, the community-save totals and the
 * 0-10 scores are illustrative, not measured, and only one of the six rankings
 * has entries written for it — the rest reuse that list's scores under their own
 * subject names. Publishing invented scores and review counts is what removed
 * the previous Top11 from the index, so the whole family stays out of it until
 * the rankings carry real, sourced data.
 *
 * The pages stay live, stay linked and keep `follow: true`, so the section is
 * fully usable and still passes link equity onward. It is simply not submitted
 * and not indexed.
 *
 * To bring the section back: flip this one constant. Every metadata block reads
 * it, so nothing else needs to change.
 */
export const TOP11_INDEXABLE = false;

/**
 * Whether a /top11 route may be indexed and submitted. Takes the path so the
 * rule can become per-route later without touching any call site; today the
 * whole family shares one answer.
 */
export function isTop11Indexable() {
  return TOP11_INDEXABLE;
}
