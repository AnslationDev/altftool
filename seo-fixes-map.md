# SEO Fixes Map — ALTFTOOL

**Source sheet:** Google Indexing_Altftools (`1smPjFjn7he…Hh90`)
**Generated:** 2026-06-23
**Engineer:** SEO verification pass

> **Important context.** The linked Google Sheet is an **indexing-submission / GSC tracking log**, not an SEO defect list. Every tab records URLs and their Google/Bing submission status. It contains **no issue rows, warnings, or recommendations** to fix line-by-line. Accordingly, this file maps each sheet tab to its real content and records the **code-verification status** of the SEO behaviour those rows depend on, rather than inventing issue IDs.

## Tab inventory & verification

| Tab | Content | Rows | Implication for code | Verified status |
|---|---|---|---|---|
| Google Indexing_Altftools | 16 top-level hub URLs, "indexing requested", Google/Bing = yes | 16 | Hubs must be indexable | ✅ All indexable (no noindex on hubs) |
| Keyword res. GSC | Same 16 hubs (duplicate of above) | 16 | — | ✅ |
| Tools | Tool URLs across categories + **Canonical column** → `/tools/all/<slug>` | ~150 | Category tool URLs must canonicalize to `/tools/all/<slug>` | ✅ `buildToolMetadata` sets `canonical:/tools/all/<slug>`; category route also `redirect()`s there |
| Extensions | ~39 `/extensions/<slug>` URLs, indexing requested | 39 | Extension detail pages must be indexable | ✅ Indexable; noindex only on not-found branch |
| Blogs | Blog post URLs, indexing tracker | many | Blog posts indexable + BlogPosting schema | ✅ `createBlogPostingJsonLd`, indexable |
| Exclusive Deals | `/exclusivedeals` hub | 1 | Hub indexable | ✅ |
| Buysmart | `/buysmart` hub | 1 | Hub indexable | ✅ |
| dual baar | GSC URL-inspection log (mostly `_next/static` assets; a few legacy URLs) | ~45 | See notes below | ⚠️ Legacy-only, no current-code defect |
| page / Sheet15 | Scratch / empty | — | — | n/a |

## Code SEO implementation — verified present & correct

| Capability | Where | Status |
|---|---|---|
| Centralized metadata (title, description, canonical, robots, OG, Twitter) | `platform/seo/generateMetadata.js → createPageMetadata` | ✅ |
| Canonical (`alternates.canonical`) | createPageMetadata | ✅ |
| Default `robots: { index:true, googleBot:{index:true} }` | createPageMetadata | ✅ |
| Meta-description length guard (≤160, sentence-aware) | `trimMetaDescription` | ✅ |
| Organization schema (global) | root `layout.jsx` → `createOrganizationJsonLd` | ✅ |
| WebSite + SearchAction schema (global) | root `layout.jsx` → `createWebsiteJsonLd` | ✅ |
| BreadcrumbList schema | `createBreadcrumbJsonLd` | ✅ |
| SoftwareApplication schema (tools) | `createToolJsonLd` | ✅ |
| FAQPage / HowTo schema | `createFaqJsonLd`, `createHowToJsonLd` | ✅ |
| BlogPosting / Article schema | `createBlogPostingJsonLd` | ✅ |
| Sitemap (static + dynamic: tools, blogs, extensions, deals, news, etc.) | `app/sitemap.js` | ✅ |
| robots.txt (allow all, disallow `/api/`, sitemap ref) | `app/robots.js` | ✅ |
| Canonical host = apex `https://altftool.com` | `siteConfig.url` | ✅ |

## Intentional noindex (verified — NOT defects, none tracked-for-indexing in sheet)

`/search`, `/personality/question/[id]`, `/personality/result`, `/fact-net/articles/[slug]`, `/fact-net/categories/[…]`, `/wattpad/read/[…]/[chapter]` — deliberately noindex (search results, quiz steps, reader chapters, thin pages). All other `index:false` occurrences are **not-found (404) branches** only.

## Genuine observations (low priority, optional — mostly not code issues)

| # | Observation | Source | Recommendation |
|---|---|---|---|
| O-1 | Legacy `/games/*` URLs (e.g. `/games/sudoku-master` = "reject") appear in GSC | dual baar tab | No such route exists (correctly 404). Optionally add 301s if these had backlinks. |
| O-2 | Mixed `www.` and apex host in older GSC entries | dual baar tab | Ensure host-level 301 `www → altftool.com` at Vercel/DNS (not app code). App canonicals already use apex. |
| O-3 | Stale `_next/static/*` "NOT FOUND" in GSC | dual baar tab | Normal post-deploy behaviour for hashed assets. No action. |
| O-4 | Sheet data-entry typos (title text in a Canonical cell; self-canonical note on `/tools/design/image-compressor`) | Tools tab | Sheet annotations only; code canonical is correct. |

## Decisions / deviations from the 15-phase prompt

- **React Helmet (Phase 3) NOT implemented — by design.** ALTFTOOL is Next.js App Router; SEO tags are rendered server-side via the native Metadata API. Adding React Helmet (client-side) would regress indexing and break the existing SSR metadata. The existing architecture already satisfies the intent of Phase 3.
- **No fabricated fixes.** The sheet contained no defects to remediate; code SEO was verified rather than rewritten, to honour "do not break existing functionality / UI / routing."
