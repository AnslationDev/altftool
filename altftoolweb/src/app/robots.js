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
    disallow: ["/api/", "/_next/", ...crawl.disallow],
  };

  const sitemap = crawl.extraSitemaps.length
    ? [`${getSiteUrl()}/sitemap.xml`, ...crawl.extraSitemaps]
    : `${getSiteUrl()}/sitemap.xml`;

  return { rules: [rule], sitemap };
}
