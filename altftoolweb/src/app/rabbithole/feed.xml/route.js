import { SITES, pickRotating } from "@altftool/core/rabbithole";
import { BRAND, REVIEWED_ON, getCategory } from "@altftool/core/rabbithole/taxonomy";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

/*
 * RSS for the directory.
 *
 * Worth the thirty lines: none of the commercial directory products ship a
 * feed, and the audience for "interesting websites" is disproportionately the
 * audience that still runs a reader. It is the cheapest differentiator here.
 *
 * The feed carries a rotating slice rather than all 340 entries — a reader
 * showing three hundred items at once is noise, and the catalog has no real
 * publication dates to sort by. The rotation is hash-seeded so the document is
 * byte-identical between builds and does not churn subscribers' unread counts.
 */

export const revalidate = 86400;
export const dynamic = "force-static";

const FEED_SIZE = 40;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET() {
  const site = getSiteUrl();
  const selection = pickRotating(SITES, FEED_SIZE, `feed-${REVIEWED_ON.iso}`);

  const items = selection
    .map((entry) => {
      const category = getCategory(entry.category);
      const url = `${site}/rabbithole/site/${entry.slug}`;
      const body = [
        entry.description,
        entry.whyItsGood,
        `Filed under ${category?.name || "the directory"}. Goes to ${entry.host}.`,
      ].join(" ");

      return [
        "<item>",
        `<title>${escapeXml(`${entry.name} — ${entry.blurb}`)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(body)}</description>`,
        category ? `<category>${escapeXml(category.name)}</category>` : "",
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(BRAND.name)}</title>
<link>${escapeXml(`${site}/rabbithole`)}</link>
<atom:link href="${escapeXml(`${site}/rabbithole/feed.xml`)}" rel="self" type="application/rss+xml"/>
<description>${escapeXml(`${BRAND.tagline} A hand-checked directory of interesting websites, sorted by how long each one takes to be worth it.`)}</description>
<language>en</language>
<generator>AltFTool</generator>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
