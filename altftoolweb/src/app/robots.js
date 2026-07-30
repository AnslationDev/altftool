import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { ANSWER_ENGINE_CRAWLERS } from "@/platform/seo/answerEngineManifest";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveCrawl } from "@altftool/core/seo/resolver";

export default async function robots() {
  // ALTF Engine: crawl directives are inert (empty) unless the engine is enabled,
  // so the default output below is identical to the pre-engine robots.txt.
  const config = await loadSeoConfig().catch(() => null);
  const crawl = resolveCrawl(config);

  // AltfWorld's forum and profile routes are generated from mock data
  // (5,000 members, 30,000 threads — see altfworld/data/mockCommunity.js), so
  // they open an effectively unbounded crawl space with nothing worth indexing
  // in it. Every /altfworld page is already noindex/nofollow via
  // altfworld/seo.js and absent from the sitemap; these two lines stop crawlers
  // walking the deep tree and spending budget the real tool pages need. The
  // /altfworld landing pages stay crawlable on purpose so the noindex on them
  // can actually be read.
  const MOCK_COMMUNITY_CRAWL_TRAPS = ["/altfworld/forums/", "/altfworld/profile/"];

  const rule = {
    userAgent: "*",
    allow: crawl.allow.length ? ["/", ...crawl.allow] : "/",
    // Do NOT disallow /_next/ — Googlebot needs the hashed CSS/JS/font assets
    // under /_next/static to render pages for indexing. Blocking them caused 46
    // "Blocked by robots.txt" entries in Search Console (all /_next/static/*)
    // and degrades render-based indexing. Only /api/ (non-content) is blocked.
    disallow: ["/api/", ...MOCK_COMMUNITY_CRAWL_TRAPS, ...crawl.disallow],
  };

  // Explicitly welcome AI assistant/answer-engine crawlers (AEO): they are
  // already covered by "*", but explicit rules survive future "*" tightening
  // and signal intent. Content stays available for AI citation/recommendation.
  const aiCrawlerRule = {
    userAgent: ANSWER_ENGINE_CRAWLERS,
    allow: "/",
    disallow: ["/api/", ...MOCK_COMMUNITY_CRAWL_TRAPS],
  };

  const sitemap = crawl.extraSitemaps.length
    ? [`${getSiteUrl()}/sitemap.xml`, ...crawl.extraSitemaps]
    : `${getSiteUrl()}/sitemap.xml`;

  return {
    rules: [rule, aiCrawlerRule],
    sitemap,
    host: getSiteUrl(),
  };
}
