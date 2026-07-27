import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveCrawl } from "@altftool/core/seo/resolver";

/**
 * AI assistant / answer-engine agents that are explicitly welcomed.
 *
 * POLICY: this site wants to be cited by answer engines, so every agent that
 * fetches pages in order to answer or cite is listed here. They are already
 * permitted by the "*" group; the explicit group exists so the intent survives
 * any future tightening of "*", and so that adding or removing an agent is a
 * reviewed decision rather than a side effect.
 *
 * robots.txt semantics matter here: a crawler that matches its own group
 * ignores "*" entirely. That is why this group mirrors the site-wide allow and
 * disallow lists below instead of hardcoding its own — otherwise an agent
 * listed here would keep crawling a path the site had decided to withhold.
 *
 * Each entry is a real, documented user-agent token. Do not add speculative
 * ones: a token nobody sends is dead weight in a file every crawler parses.
 */
const AI_ANSWER_ENGINE_AGENTS = [
  // OpenAI — GPTBot indexes, OAI-SearchBot builds the ChatGPT search index,
  // ChatGPT-User fetches a page live when a user's question needs it.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic — ClaudeBot crawls, Claude-SearchBot builds the search index,
  // Claude-User fetches on a user's behalf. "Claude-Web" and "anthropic-ai"
  // are legacy tokens kept so older deployments still match.
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "anthropic-ai",
  // Perplexity — PerplexityBot indexes, Perplexity-User fetches a page that is
  // about to be cited in an answer.
  "PerplexityBot",
  "Perplexity-User",
  // Google — Google-Extended is the opt-in/opt-out control for Gemini and
  // AI Overviews grounding. It is not a crawler; Googlebot itself follows "*".
  "Google-Extended",
  // Apple — Applebot serves Siri and Spotlight; Applebot-Extended is the
  // separate control for Apple Intelligence.
  "Applebot",
  "Applebot-Extended",
  // Other assistants that cite sources.
  "Amazonbot",
  "DuckAssistBot",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "cohere-ai",
  // Corpus crawlers. These feed model training rather than a citing assistant,
  // so they buy no traffic — but they have been allowed since this file was
  // written and removing one is a product decision, not an SEO cleanup.
  "Bytespider",
  "CCBot",
];

export default async function robots() {
  // ALTF Engine: crawl directives are inert (empty) unless the engine is enabled,
  // so the default output below is identical to the pre-engine robots.txt.
  const config = await loadSeoConfig().catch(() => null);
  const crawl = resolveCrawl(config);

  // Do NOT disallow /_next/ — Googlebot needs the hashed CSS/JS/font assets
  // under /_next/static to render pages for indexing. Blocking them caused 46
  // "Blocked by robots.txt" entries in Search Console (all /_next/static/*)
  // and degrades render-based indexing. Only /api/ (non-content) is blocked;
  // no Open Graph image is served from /api/, so nothing renderable is hidden.
  const allow = crawl.allow.length ? ["/", ...crawl.allow] : "/";
  const disallow = ["/api/", ...crawl.disallow];

  const rule = {
    userAgent: "*",
    allow,
    disallow,
  };

  const aiCrawlerRule = {
    userAgent: AI_ANSWER_ENGINE_AGENTS,
    allow,
    disallow,
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
