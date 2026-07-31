# Route health audit — 2026-07-31

Read-only sweep of every page route under `altftoolweb/src/app`, checking each for
(1) metadata, (2) a canonical that matches the route, (3) JSON-LD whose type matches the
page, (4) correct sitemap membership, and (5) a real 200 rather than a `notFound()` at 200.

## Coverage — 29 of 329 route patterns verified over HTTP; 329 of 329 read statically

- **329 route patterns** exist (`find src/app -name 'page.jsx'`, `/api` excluded). The
  "~390 prerendered" figure counts prerendered *instances*, not patterns.
- **All 329** were read statically: metadata source (own export vs. nearest ancestor
  layout), declared canonical path, JSON-LD builders used, and sitemap membership.
- **29 patterns (31 URLs)** were additionally fetched from the dev server on :3002 and had
  their served `<head>`, JSON-LD and body text parsed.
- Sampling rule: every route family's hub, plus one real dynamic instance per family, plus
  a deliberate 404 probe. 117 URLs were queued; 88 timed out at 300 s under four-way
  concurrency and the dev server stopped answering before the serial retry finished. Per
  the brief I did not start another server.
- The brief supplied only device-level Search Console aggregates, not a page list, so
  "every route in the Search Console page list" could not be honoured. Family hubs stand
  in for it.

### Caveat that affects which numbers you can trust

**Corrected 2026-07-31.** An earlier version of this section claimed the dev server on
:3002 was running a different worktree, and used that to discount several findings. That
claim was checked and is false — the server is running this tree. Every finding below
should be read on its own evidence, not discounted for that reason.

What genuinely limits this audit is coverage, not provenance: 117 URLs were queued for
HTTP verification and 88 timed out at 300 s under four-way concurrency. 29 of 329 route
patterns were verified over HTTP; the rest are assessed from source only. Where a finding
rests on source alone, it says so.

Dev-server byte sizes are not production sizes; text-length figures are character counts
of extracted body text, compared only against other routes measured in the same run.

**Finding restored (it was withdrawn on the false premise above, and is real).** A tool
served under a category it does not belong to returns HTTP 200 and `index, follow`, rather
than redirecting. `src/app/tools/[category]/[slug]/page.jsx:56-58` contains a guard that
should `redirect()` in exactly this case, and the guard is present in the deployed commit,
yet production does not redirect. Verified live on 2026-07-31, with a cache-busting query
so this is the origin's own response and not a CDN hit:

    /tools/calculators/2-images-swap        200  index, follow
    /tools/games/2-images-swap              200  index, follow
    /tools/developer/2-images-swap          200  index, follow
    /tools/finance-calculators/2-images-swap 200  index, follow

`2-images-swap` is categorised Design & Color / Image & Photo, so none of those four is a
category it belongs to. The blast radius is 22 categories x 3,947 tools of URLs that
answer 200.

Two things keep this from being urgent, and both should be stated plainly rather than
used to close the finding: the canonical on every one of those responses correctly points
at `/tools/all/<slug>`, so Google consolidates them; and nothing links to them — the
category index added on 2026-07-31 links to `/tools/all/<slug>`. So this is wasted crawl
surface rather than duplicate content. The open question is why the guard does not fire.

---

## Findings, ranked by search cost

### 1. `/supportsetting/<anything>` is an unbounded indexable 200 with no content

`src/app/supportsetting/[...slug]/page.jsx:23-28` and
`src/app/supportsetting/data/routes.js:132-148` (`routes.js` is **identical** in both trees).

`describeSlug()` falls through to a generic title whenever the slug resolves to no
`activeId` and its first segment is not a known device, and the page's `generateMetadata`
never sets `noindex`. So any string under `/supportsetting/` answers 200, indexable, with a
self-referencing canonical.

Measured — `/supportsetting/foo`:

| field | value |
|---|---|
| status | `200` |
| `<title>` | `Support Settings – Manage Preferences \| AltFTool` |
| canonical | `…/supportsetting/foo` |
| robots | `index, follow` |
| text inside `<main>` | 12 characters |
| `<h1>` count | 0 |
| page-level JSON-LD | none (only the layout's Organization + WebSite) |

The route's own header comment claims "700+ OS settings and 150+ device settings"; none of
those deep links are in the sitemap either — `src/app/sitemap.js:122` publishes only
`/supportsetting`. So the family contributes zero discoverable URLs and an unlimited number
of crawlable soft-404s.

**Fix:** in `generateMetadata`, pass `noindex: true` when `resolveSlug()` returns no
`activeId` and no device matches — the same branch `describeSlug` already detects. If the
resolvable deep links are worth having, enumerate them into `sitemap.js` at the same time.

### 2. Every 404 answers 200 and publishes a canonical for the dead URL

`src/app/[slug]/page.jsx:39` (**identical** in both trees).

The root catch-all handles every unmatched single-segment URL. Its `generateMetadata` sets
`path: \`/${slug}\``, so `createPageMetadata` emits `alternates.canonical` for a URL that
does not exist, and the page then calls `notFound()` at line 57.

Measured — `/this-page-does-not-exist-xyz`: `200`, title `Page Not Found | AltFTool`,
`robots: noindex`, canonical `…/this-page-does-not-exist-xyz`, 12 characters inside `<main>`.

The 200-instead-of-404 behaviour is already documented in the repo at
`src/app/tools/toolRouteUtils.js:215-219` as verified in production, so this is not a
dev-only artifact. The `noindex` keeps these out of the index, but Search Console still
counts them as Soft 404s and they still consume crawl budget — and the same file's
comment at line 228 says "dropping the canonical stops these pointing at the homepage",
which the code does not actually do: line 233 still passes a `path`, so the tool 404s
self-canonicalise too.

**Fix — this recommendation was wrong and is withdrawn 2026-07-31.** Omitting `path`
does not remove the canonical: `createPageMetadata` falls back to `path: args.path || "/"`
(`generateMetadata.js:162`), so every 404 would canonicalise to the homepage — the exact
duplicate signal this finding objects to, aimed at a page that matters. And a noindexed
page *should* carry a self-referencing canonical; pointing it at a different URL is how a
noindex directive travels to that URL, which this repo has already had to fix once on
`/extensions/[slug]`.

The behaviour is correct as it stands. The real defect was the source comment at
`toolRouteUtils.js`, which claimed the canonical had been dropped when it had not — that
is now corrected. What remains genuinely open in this finding is the platform-level
200-instead-of-404, which is not fixable from route code.

### 3. `/tools/developer/api-stress-estimator` contradicts its own canonical

`src/app/tools/developer/api-stress-estimator/page.jsx:20, 28, 34, 41`
(**identical** in both trees).

This is a hardcoded static copy of a route the dynamic segment already serves, and it has
drifted. Line 20 sets `toolPath = "/tools/developer/api-stress-estimator"` and line 28
calls `createToolJsonLd({ slug, tool, category: "developer" })`, which makes the entity's
`url` and `mainEntityOfPage.@id` point at `/tools/developer/…` — while the page's canonical,
from `buildToolMetadata` (`toolRouteUtils.js:243`), is `/tools/all/api-stress-estimator`.
Lines 34 and 41 give the `HowTo` and `FAQPage` nodes `/tools/developer/…` `@id`s as well.

`src/app/tools/[category]/[slug]/page.jsx:79` was already fixed for exactly this, with a
comment describing the bug — but a static path segment shadows the dynamic one, so this
file never picks the fix up.

Measured: `/tools/developer/api-stress-estimator` → 200, canonical
`/tools/all/api-stress-estimator`, same JSON-LD node set as the `/tools/all` copy.

`src/app/tools/all/api-stress-estimator/page.jsx` is correct (`category: "all"`, `toolPath`
under `/tools/all`).

**Fix:** delete both hardcoded directories — `/tools/[category]/[slug]` and
`/tools/all/[slug]` serve them, and `api-stress-estimator`'s registry category is
`"Developer"` so the mirror URL keeps working. If they exist to guarantee prerendering,
change line 28 to `category: "all"` and line 20 to `/tools/all/${slug}`.

### 4. All 23 `/tools` hub and category URLs share one H1 that names no topic

`src/app/tools/ToolsClient.jsx:900`:

```jsx
<h1 className="route-title">
  Ready to find your perfect <span className="tp-accent-word">tool?</span>
</h1>
```

`ToolsClient` differs between the trees, but this H1 block is byte-identical in both (line
900 here, line 869 there), so the measurement transfers.

`/tools`, `/tools/all` and all 21 `/tools/[category]` pages render this and nothing else at
H1. Measured on four of them — `/tools`, `/tools/all`, `/tools/calculators`,
`/tools/ai-tools` — each returned exactly one `<h1>` with identical text, while `<title>`
and canonical are correctly per-category.

These are the site's highest-value URLs: sitemap priority 0.72–0.95, and in this tree they
now carry the crawlable anchor for every tool in their category. Their only heading is a
CTA that mentions no category, no tool count and no product noun.

**Fix:** the page already computes the category label and count for the sidebar. Render
that as the H1 (`Calculators — 503 free online calculators`) and demote the CTA line to a
`<p>` or an `<h2>`.

### 5. 211 sitemap URLs across seven families carry no page-level JSON-LD

Verified by `grep -rln JsonLd` returning nothing for any of these directories — no import,
no `application/ld+json`, so these pages ship only the root layout's Organization and
WebSite nodes. The sitemap loops that publish them are identical in both trees except
`/kym`, where this tree publishes at least as many as the sibling.

| family | sitemap URLs | files identical across trees |
|---|---|---|
| `/tradeon/asset/[symbol]` + `/tradeon/chart/[symbol]` | 72 | yes |
| `/imgprompt/studio/[tool]` | 52 | yes |
| `/kym/[slug]` | ≥37 | no — stated from this tree's source |
| `/pranx/[slug]` (+ `/[child]`) | 24 | yes |
| `/prank-socialmedia/editor/[slug]` | 14 | yes |
| `/fact-net/articles/[slug]` | 8 | yes |
| `/homeserv/services/[slug]` | 4 | yes |

`src/platform/seo/generateMetadata.js:505-510` already carries the argument for fixing this
class ("those families described nothing") and the `path` parameter on `createToolJsonLd`
that makes it a two-line change per family — it was applied to `/transform`,
`/altfcalculators`, `/altflovepdf` and `/pranx`'s siblings but not to these.

A further **108** URLs emit a `BreadcrumbList` but no entity for their own subject:
`/n8n/[slug]` (59 workflow templates) and `/top9/[slug]` (49). Confirmed over HTTP for
`/n8n/build-your-first-ai-agent`: `Organization, WebSite, BreadcrumbList, ItemList` and
nothing describing the workflow. (`/n8n/category` and `/n8n/node` are fine — both emit
`CollectionPage` + `ItemList`.)

### 6. `/altflovepdf` and its 39 tool pages server-render almost no text

Measured in one run, character counts of extracted body text:

| URL | body text |
|---|---|
| `/altflovepdf` | 3,417 |
| `/altflovepdf/merge-pdf` | 3,572 |
| `/blogs/view-all/latest` (deliberately thin, `noindex`) | 3,619 |
| `/altfcalculators/loan-emi-calculator` (same product shape) | 8,595 |
| `/tools/all/2-images-swap` | 9,334 |

Both `page.jsx` files are identical across trees. The `PageView.jsx` components differ —
the sibling's hub copy is 8 lines *longer* and still imports the `panels` module this tree
has deleted, so this tree serves the same or less. The figures are therefore conservative.

`/altflovepdf/[toolSlug]` does emit `SoftwareApplication` + `BreadcrumbList` (added
recently, `[toolSlug]/page.jsx:111-129`), but there is no on-page copy for that markup to
correspond to. 39 sitemap URLs at priority 0.62 with roughly chrome-only server HTML.

### 7. Six indexable routes appear in no sitemap

Checked against `src/app/sitemap.js` in this tree; `grep` finds no entry for any of them
(only `/embed:90`, `/windowswap/pricing:104` and `/supportsetting:122` exist nearby).

- `/altflinking` — indexable, seven targeted keywords in `page.jsx:10-18`, emits
  `createToolJsonLd`. A hub page with no sitemap entry.
- `/altpintrest/explore`
- `/playbuzz/quiz-play`
- `/windowswap/sendGift`
- `/smartlink` — indexable *and* describes itself in `page.jsx:8` as a "redirect handler".
  The sibling worktree has already noindexed it and documented it as retired, so this one
  is being fixed elsewhere; nothing to do here beyond not re-introducing it.
- the whole `/supportsetting/[...slug]` space — see finding 1.

Not findings, checked and cleared: `/lander/[slug]` and `/brandrating/[slug]/[category]`
are published by Firestore-driven loops that returned nothing in dev; `/games/[slug]` is a
`redirect()` shim, correctly `noindex` and correctly absent; `/skill/[skill]/[country]` is
correctly `noindex` with the reason documented in `page.jsx:19-23`.

### 8. `/altfcalculators` and `/altflovepdf` hubs emit no `CollectionPage` or `ItemList`

Both `page.jsx` files contain zero `JsonLd` references (identical across trees). Measured:
both return only `Organization` + `WebSite`.

Every comparable directory page measured in the same run emits
`CollectionPage` + `ItemList` + `BreadcrumbList`: `/tools`, `/tools/all`,
`/tools/calculators`, `/tools/ai-tools`, `/blogs`, `/blogs/topics`,
`/blogs/category/tools`, `/products`, `/signals`, `/locations`. `/altfcalculators` is
sitemap priority 0.78 and the entry point for 104 calculator URLs.

---

## What is healthy

- **Metadata presence (check 1): clean.** All 329 routes resolve metadata, either from
  their own `metadata`/`generateMetadata` export (250) or from a co-located ancestor
  layout (79). No route falls through to the root layout alone.
- **Canonical correctness (check 2): clean apart from the above.** Every static route's
  declared `path` matches its route; the only two literal mismatches are the intentional
  `/tools/<category>/<slug>` → `/tools/all/<slug>` consolidation. Every dynamic route's
  `path` template matches its route shape after manually clearing 15 flagged by
  indirection. The homepage canonical renders as origin-with-no-trailing-slash while the
  sitemap lists `/` — Google normalises these; not worth changing.
- **`/tools` detail pages** — `SoftwareApplication+WebApplication`, `HowTo`, `FAQPage`,
  `BreadcrumbList`, `ItemList`, correct canonical, real H1, 9–10 KB of text. The
  curated-only gating on `HowTo`/`FAQPage` is right.
- **`/blogs`** — `BlogPosting` on posts, `CollectionPage`+`ItemList` on every index,
  `noindex` correctly on `/blogs/view-all/[section]`, thin posts correctly excluded from
  the sitemap.
- **`/locations`** — the richest graph measured: `Country`, `Service`, `WebPage`,
  `BreadcrumbList`, `FAQPage`, `ItemList`, 141 URLs.
- **`/bops`** — provider landers are `noindex` and correctly excluded; the indexable loan,
  insurance and housing-needs verticals are correctly included, each with a per-vertical
  canonical from `_lib/metadata.js`. The redirected `bathroom`/`hvac` guides are correctly
  held out (`sitemap.js:205`).
- **`/alternatives`, `/exam-photo`, `/news`, `/apps`, `/extensions`, `/wattpad`,
  `/altfgame`, `/deals`, `/buysmart`** — each emits a page-appropriate primary entity.
- **`robots.js`** — correct: only `/api/` disallowed, `/_next/` deliberately left crawlable
  with the reason recorded.
- **No sitemap URL points at a route that does not exist.** Every one of the 5,345 entries
  the dev server rendered matches a route pattern in `src/app`.

## Unit tests

`node scripts/run-unit-tests.mjs` → **941 tests, 941 pass, 0 fail** (2.24 s). This audit
changed no source file, so this is the pre-existing state.

## Duplicate tool display names (added 2026-07-31)

15 display names are shared by two tools each, so 30 tool
pages render an identical `<title>` and compete for the same query. Two of our own
results splitting one query's ranking signal is a plain cannibalisation loss.

- **Animation Generator** — `animation-generator`, `animation-generator-tool`
- **Attendance Percentage Calculator** — `attendance-calculator`, `attendance-percentage-calculator`
- **Body Fat Percentage Calculator** — `body-fat-calculator`, `body-fat-percentage-calculator`
- **CAGR Calculator** — `cagr-calculator`, `cagr-calculator-tool`
- **Cymatics Simulator** — `cymatics`, `cymatics-simulator`
- **Emergency Fund Calculator** — `emergency-fund-calculator`, `emergency-fund-size-calculator-india`
- **FD Premature Withdrawal Penalty Calculator** — `fd-premature-withdrawal-calculator`, `fd-premature-withdrawal-penalty-calculator`
- **Freelance Hourly Rate Calculator** — `freelance-hourly-rate-calculator`, `freelance-rate-calculator`
- **HRA Exemption Calculator** — `hra-exemption-calculator`, `hra-exemption-calculator-detailed`
- **Inflation Impact Calculator** — `inflation-calculator`, `inflation-impact-calculator`
- **Moving Checklist Builder** — `moving-checklist`, `moving-checklist-builder`
- **Portfolio Rebalancing Calculator** — `portfolio-rebalancer`, `portfolio-rebalancing-calculator`
- **Recurring Deposit Maturity Calculator** — `rd-maturity-calculator`, `recurring-deposit-maturity-calculator`
- **Senior Citizen Savings Scheme Calculator** — `scss-quarterly-payout-calculator`, `senior-citizen-savings-scheme-calculator`
- **Stock Average Price Calculator** — `stock-average-calculator`, `stock-average-price-calculator`

**This is a finding, not a fix, and deliberately so.** Search Console cannot decide it:
14 of the 15 pairs have zero impressions and zero clicks in the 7-day export, and the
fifteenth (`animation-generator`) has 5 impressions. So there is no data saying which
member should survive.

Reading the descriptions, most pairs look like deliberate *variants* rather than
accidents — `emergency-fund-calculator` is generic while
`emergency-fund-size-calculator-india` weighs job stability and dependents;
`hra-exemption-calculator-detailed` adds a monthly breakdown the plain one lacks. If that
is right, the fix is not to delete or noindex either page: it is to give them names that
say how they differ, so the two `<title>`s stop colliding.

Two constraints on whoever picks this up. `src/platform/registry/toolMetaMap.js` is
generated — the name lives in each tool's `tool.config.js`, and editing the registry
directly will be overwritten on the next `generate:registry`. And per
[the tool-description note], a tool's name and description have more than one source, so
changing `tool.config.js` alone may not move what the page renders; check the generated
SEO shards and any admin override for that slug too.

The whole set is checkable in one pass:

```bash
node -e 'const m=require("./altftoolweb/src/platform/registry/toolMetaMap.js");' # see the audit script in this doc
```

