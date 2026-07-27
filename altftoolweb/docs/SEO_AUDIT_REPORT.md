# AltFTool Technical SEO Audit

**Reviewed:** July 24, 2026
**Application:** `altftoolweb` (Next.js App Router)
**Canonical origin:** `https://www.altftool.com`

## Current Coverage

- Every public App Router page pattern has metadata exported by its page or its exact route layout.
- The generated source inventory is [seo-route-inventory.md](./seo-route-inventory.md).
- `npm run seo:routes` is a blocking audit for missing route metadata, unsafe localhost canonicals, duplicate route patterns, and incomplete raw indexable metadata.
- Invalid dynamic records, private result pages, provider previews, duplicate aliases, and redirect-only states use `noindex` instead of competing with canonical pages.
- Production canonicals cannot be changed to localhost or a preview domain by a bad `NEXT_PUBLIC_SITE_URL` value.
- CMS-supplied absolute URLs on the legacy apex host are normalized to the canonical `www` host while deliberate external syndication canonicals remain supported.

## Metadata Architecture

`altftoolweb/src/platform/seo/generateMetadata.js` is the primary public metadata API. It provides:

- canonical URLs on one production host;
- unique title and trimmed meta description output;
- index/follow and Googlebot preview directives;
- Open Graph and Twitter card metadata;
- image alt text;
- article publication, modification, and author fields;
- language alternates;
- optional central SEO overrides when `ALTFT_SEO_ENGINE_ENABLED` is active.

The central SEO engine remains inert when disabled. Route code continues to own its default metadata.

## Crawl And Discovery

- `robots.txt` allows public content and blocks only non-content API routes by default.
- `robots.txt` declares the canonical host and canonical sitemap.
- `sitemap.xml` is registry-driven and includes public tools, categories, blogs, news, products, experiences, workflows, prompts, games, business hubs, and other canonical records.
- Noindex preview/utility routes are intentionally omitted from the sitemap.
- `/site-map` is the human-readable route directory.
- `/llms.txt` provides a factual, generated platform summary for answer engines without claiming that every tool has the same privacy or processing model.

## Structured Data

Global entity nodes:

- `Organization`
- `WebSite`

Route-level nodes are used only when backed by visible page content:

- `BreadcrumbList`
- `CollectionPage`
- `ItemList`
- `SoftwareApplication` / `WebApplication`
- `Article` / `BlogPosting`
- `FAQPage`
- `HowTo`

Schema does not replace useful page content and must not describe hidden or unavailable features.

## Rendering And Performance

- Important metadata and structured data are server-rendered.
- App Router loading boundaries and registry-driven static generation reduce blocking client work.
- Microsoft Clarity loads after the window load event and is no longer on the critical hydration path.
- Google Analytics and production-only AdSense remain centrally managed.
- Font rendering uses `display: swap`.
- Sitemap and selected data-heavy SEO sources use cache/revalidation policies.
- Blog topic matching prioritizes titles, headings, categories, tools, and tags so generic body-copy mentions do not create oversized or weakly related archives.
- Archive cards are bounded while the remaining server-rendered text links preserve crawlable discovery.
- Prerendered HTML has a blocking 1 MiB per-page budget; the current largest page is below that threshold.

Performance quality is enforced by the existing bundle, media, route, prerender, and performance budget scripts. `npm run seo:rendered` also inspects final build HTML instead of assuming source exports produced the intended tags. Real-user Core Web Vitals still need field monitoring in Search Console because lab tests cannot reproduce every device and network.

## Validation Commands

```bash
npm run seo:routes
npm run seo:rendered
npm run test:seo-site-url
npm run seo:blog-check
npm run seo:blog-links
node --test packages/core/src/seo/*.test.mjs
npm run lint:web
npm run build:web
npm run build:admin
```

For a release candidate, also run the route smoke, performance budget, security, and live parity checks from the root `package.json`.

## External Follow-Up

Code can make a URL eligible for discovery; it cannot guarantee ranking or indexing. Release owners should:

1. Submit `https://www.altftool.com/sitemap.xml` in the matching Search Console property.
2. Inspect representative canonical URLs after deployment.
3. Monitor Page Indexing, Core Web Vitals, HTTPS, rich-result, and manual-action reports.
4. Improve pages with weak original content instead of creating near-duplicate keyword pages.
5. Maintain editorial dates, authorship, sources, internal links, and accurate product claims.
6. Earn relevant references and links through genuinely useful tools, research, and guides.

## Guardrails

- Do not add React Helmet; Next.js Metadata API keeps head output server-rendered.
- Do not index search results, account state, temporary results, previews, or thin aliases.
- Do not put non-canonical or redirected URLs in the sitemap.
- Do not add schema that is not supported by visible content.
- Do not hardcode production origins outside the central SEO URL module.
- Do not enable the central SEO engine without validating its crawl, canonical, and redirect rules.
