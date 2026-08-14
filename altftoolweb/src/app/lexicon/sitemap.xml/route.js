import { getManifest } from "@altftool/core/lexicon/corpus";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

/*
 * Dedicated sitemap INDEX for AltF Lexicon.
 *
 * Two separate limits force this shape.
 *
 * 1. These URLs do not belong in the main /sitemap.xml. That document is built
 *    through Next's unstable_cache, which caps an entry at 2MB, and exceeding
 *    the cap makes the WHOLE sitemap fail to render rather than truncating —
 *    taking every other section of the site down with it. Only the ~35 lexicon
 *    hub URLs are listed there; everything else lives here.
 *
 * 2. A single sitemap may not exceed 50,000 URLs or 50MB uncompressed. The
 *    corpus has 83,253 single-word entries, so one document cannot hold them.
 *    This route therefore returns a <sitemapindex> pointing at bounded child
 *    documents under /lexicon/sitemap/<shard>, each capped at URLS_PER_SHARD.
 *
 * Referenced from robots.txt so crawlers find it without it being nested.
 * Written by hand rather than via Next's sitemap convention because that
 * convention routes through the same size-capped cache.
 */

export const revalidate = 86400;
export const dynamic = "force-static";

/*
 * Must match URLS_PER_SHARD in ./sitemap/[shard]/route.js — the index names the
 * shards, the shard route slices them, and a disagreement silently drops the
 * tail of the corpus. 40,000 leaves headroom under the 50,000 protocol limit
 * for a corpus regeneration that adds words.
 */
const URLS_PER_SHARD = 40000;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const site = getSiteUrl();

  let wordShards = 0;
  try {
    const manifest = await getManifest();
    // manifest.words counts the single-word (non-phrase) entries, which is
    // exactly the set /lexicon/sitemap/words-N lists.
    wordShards = Math.max(1, Math.ceil(Number(manifest.words || 0) / URLS_PER_SHARD));
  } catch {
    // A missing corpus must not 500 the sitemap. The "pages" shard still
    // renders the hub URLs from static data, and the build step that generates
    // the corpus will restore the word shards on the next deploy.
    wordShards = 0;
  }

  const shards = [
    "pages",
    ...Array.from({ length: wordShards }, (unused, index) => `words-${index + 1}`),
  ];

  const body = shards
    .map(
      (shard) =>
        `<sitemap><loc>${escapeXml(`${site}/lexicon/sitemap/${shard}`)}</loc></sitemap>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
