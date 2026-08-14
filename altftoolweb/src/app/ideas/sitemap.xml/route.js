import { getTopIndex } from "@altftool/core/ideas/corpus";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

/*
 * Dedicated sitemap for the 12,000 published idea dossiers.
 *
 * These do not belong in the main /sitemap.xml: at ~150 bytes per entry they
 * add ~1.7MB, which pushes that document past the 2MB ceiling on Next's
 * unstable_cache. When that cap is exceeded the whole sitemap fails to render,
 * taking every other section of the site down with it — so a large section
 * getting its own sitemap is both standard practice and the safe option here.
 *
 * Referenced from robots.txt so crawlers find it without it being nested.
 * Written by hand rather than via Next's sitemap convention because that
 * convention routes through the same size-capped cache.
 */

/* The XML is roughly 1.9 MiB. Keep it out of the deployment artifact and let
   the response cache hold it for a day after the first crawler request. */
export const dynamic = "force-dynamic";

/* A sitemap may contain at most 50,000 URLs. The published Ideas index is
   currently 12,000 rows; this guard keeps a future corpus expansion from
   emitting an invalid document before the route is split into child shards. */
const MAX_SITEMAP_URLS = 50000;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const site = getSiteUrl();
  let entries = [];

  try {
    const index = await getTopIndex();
    entries = index.slice(0, MAX_SITEMAP_URLS).map((row) => row.s);
  } catch {
    // A missing corpus must not 500 the sitemap; an empty document is valid
    // and the build step that generates the corpus will fix it on next deploy.
    entries = [];
  }

  const urls = entries
    .map(
      (slug) =>
        `<url><loc>${escapeXml(`${site}/ideas/idea/${slug}`)}</loc><changefreq>monthly</changefreq><priority>0.72</priority></url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
