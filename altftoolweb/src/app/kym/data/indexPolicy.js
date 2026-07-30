/**
 * Indexing policy for the /kym family.
 *
 * Measured state of the section: one hub plus 37 detail routes. 35 of those 37
 * are rendered by KymGenericPage, which assembles every paragraph from eight
 * category templates in components/KymGenericPage.jsx — the body text of an
 * "Entry" page is word-for-word the body text of every other "Entry" page,
 * with the title interpolated into it. The remaining two are a weekly roundup
 * and a poll. Nothing in the section carries a real publish or update date,
 * and the hub mirrors the front page of an established meme encyclopedia,
 * which is exactly the comparison a search engine will make.
 *
 * Templated near-duplicate text at this ratio is what "scaled content abuse"
 * describes, and submitting 37 of them competes for queries already answered
 * by the source these pages resemble. The family leaves the index. The pages
 * stay live for anyone who lands on them, stay linked, and keep `follow: true`.
 *
 * To bring the section back once the entries carry researched, individually
 * written text: flip this one constant. The hub metadata, the detail metadata
 * and the sitemap loop all read it.
 */
export const KYM_INDEXABLE = false;

/**
 * Whether a /kym route may be indexed and submitted. Takes the path so the
 * rule can become per-entry later without touching any call site; today the
 * whole family shares one answer.
 */
export function isKymIndexable() {
  return KYM_INDEXABLE;
}
