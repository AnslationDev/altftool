import { LIVE_ENTRIES } from "@altftool/core/atlas";

/*
 * Search index for the ⌘K palette.
 *
 * Served as its own static asset rather than embedded in every Atlas page:
 * this is ~40 KB of searchable text that most visitors never need, and paying
 * for it on every page render to support one keyboard shortcut is the wrong
 * trade. Keys are single letters because they repeat 292 times.
 *
 *   s = slug, n = name, d = domain, t = tagline
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const index = LIVE_ENTRIES.map((entry) => ({
    s: entry.slug,
    n: entry.name,
    d: entry.domain,
    t: entry.tagline,
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
