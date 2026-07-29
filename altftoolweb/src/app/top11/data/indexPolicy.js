/**
 * Indexing policy for the /top11 family.
 *
 * Measured state of the section: one hub plus ten category routes. After the
 * invented 0-10 scores, the "Excellent" labels, the invented review counts and
 * the hardcoded "Last Updated" line were stripped out, a category page is a
 * title, a one-line description and one or two brand names with three bullet
 * features each. Nothing on these pages is tested, scored or dated by
 * AltFTool, and the queries they target ("best VPN", "best CRM", "best home
 * warranty") are held by Trustpilot, G2 and the vendors themselves. The whole
 * family therefore leaves the index rather than competing on pages that cannot
 * win and that dilute the crawl budget of the routes that can.
 *
 * The pages stay live, stay linked from the hub grid and keep `follow: true`,
 * so the section is still usable and still passes link equity onward. It is
 * simply not submitted and not indexed.
 *
 * To bring the section back once the categories carry real, sourced
 * comparisons: flip this one constant. Every metadata block, every schema
 * block and the sitemap loop read it, so nothing else needs to change.
 */
export const TOP11_INDEXABLE = false;

/**
 * Whether a /top11 route may be indexed and submitted. Takes the slug so the
 * rule can become per-category later without touching any call site; today
 * the whole family shares one answer.
 */
export function isTop11Indexable() {
  return TOP11_INDEXABLE;
}
