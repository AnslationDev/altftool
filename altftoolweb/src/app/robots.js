import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveCrawl } from "@altftool/core/seo/resolver";

export default async function robots() {
  // ALTF Engine: crawl directives are inert (empty) unless the engine is enabled,
  // so the default output below is identical to the pre-engine robots.txt.
  const config = await loadSeoConfig().catch(() => null);
  const crawl = resolveCrawl(config);

  const rule = {
    userAgent: "*",
    allow: crawl.allow.length ? ["/", ...crawl.allow] : "/",
    // Do NOT disallow /_next/ — Googlebot needs the hashed CSS/JS/font assets
    // under /_next/static to render pages for indexing. Blocking them caused 46
    // "Blocked by robots.txt" entries in Search Console (all /_next/static/*)
    // and degrades render-based indexing. Only /api/ (non-content) is blocked.
    disallow: ["/api/", ...crawl.disallow],
  };

  const sitemap = crawl.extraSitemaps.length
    ? [`${getSiteUrl()}/sitemap.xml`, ...crawl.extraSitemaps]
    : `${getSiteUrl()}/sitemap.xml`;

  return { rules: [rule], sitemap };
}
