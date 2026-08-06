const LEXICON_ALTERNATE_VIEW = /^\/lexicon\/(?:rhymes|thesaurus)\/[^/]+$/;
const LEXICON_DATED_ARCHIVE = /^\/lexicon\/word-of-the-day\/\d{4}-\d{2}-\d{2}$/;
const LEXICON_WORD = /^\/lexicon\/word\/[^/]+$/;

/**
 * Some substantial, indexable Lexicon pages are deliberately discovered via
 * internal links instead of submitted through the section's bounded sitemap:
 *
 * - rhyme and thesaurus pages are alternate cuts of a submitted word page;
 * - the dated word-of-the-day archive is a fully linked chronological chain;
 * - multi-word lemmas remain browseable, while the word shards submit only
 *   the bounded single-word corpus.
 *
 * Keep this list narrow. Any unrecognised indexable canonical missing from all
 * advertised sitemaps remains a blocking index-control failure.
 */
export function isIntentionalSitemapOmission({ route = "", title = "" } = {}) {
  if (LEXICON_ALTERNATE_VIEW.test(route)) return true;
  if (LEXICON_DATED_ARCHIVE.test(route)) return true;
  if (!LEXICON_WORD.test(route)) return false;

  const lemma =
    String(title)
      .split(/\s+[—–]\s+meaning,/u)[0]
      ?.trim() || "";
  return /\s/u.test(lemma);
}
