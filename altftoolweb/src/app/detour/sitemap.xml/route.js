import { ALL_SITES } from "@altftool/core/detour";
import { CATEGORIES, COLLECTIONS, TIME_BANDS, VIBES } from "@altftool/core/detour/taxonomy";
import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { TOYS } from "../play/_toys/registry";

/*
 * Dedicated sitemap for Detour.
 *
 * The section contributes a few thousand URLs, most of them the per-site detail
 * pages. Those do not belong in the main /sitemap.xml: that document is already
 * large and is built through a size-capped cache, and pushing it over the cap
 * fails the whole sitemap rather than just this section.
 *
 * Referenced from robots.txt so crawlers find it without it being nested.
 */

export const revalidate = 0;
export const dynamic = "force-dynamic";

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const site = getSiteUrl();

  const entries = [
    { path: "/detour", priority: 0.95, changefreq: "daily" },
    { path: "/detour/browse", priority: 0.88, changefreq: "weekly" },
    { path: "/detour/categories", priority: 0.85, changefreq: "weekly" },
    { path: "/detour/collections", priority: 0.82, changefreq: "weekly" },
    { path: "/detour/play", priority: 0.86, changefreq: "weekly" },
    { path: "/detour/today", priority: 0.84, changefreq: "daily" },
    { path: "/detour/about", priority: 0.6, changefreq: "monthly" },
    { path: "/detour/submit", priority: 0.5, changefreq: "monthly" },

    ...TOYS.map((toy) => ({
      path: `/detour/play/${toy.slug}`,
      priority: 0.8,
      changefreq: "monthly",
    })),
    ...CATEGORIES.map((category) => ({
      path: `/detour/category/${category.id}`,
      priority: 0.78,
      changefreq: "weekly",
    })),
    ...COLLECTIONS.map((collection) => ({
      path: `/detour/collections/${collection.id}`,
      priority: 0.74,
      changefreq: "weekly",
    })),
    ...VIBES.map((vibe) => ({
      path: `/detour/vibes/${vibe.id}`,
      priority: 0.72,
      changefreq: "weekly",
    })),
    ...TIME_BANDS.map((band) => ({
      path: `/detour/time/${band.id}`,
      priority: 0.72,
      changefreq: "weekly",
    })),
    ...ALL_SITES.map((entry) => ({
      path: `/detour/site/${entry.slug}`,
      priority: entry.origin === "altf" ? 0.7 : 0.62,
      changefreq: "monthly",
    })),
  ];

  const urls = entries
    .map(
      ({ path, priority, changefreq }) =>
        `<url><loc>${escapeXml(`${site}${path}`)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
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
