# ALTF Engine — Phase 1 Implementation Notes

Phase 1 (SEO Management Core) of the centralized SEO & Index Management System.
See `ALTF_ENGINE_ARCHITECTURE_PLAN.md` for the full design.

## What shipped

A centrally-managed, server-rendered SEO layer that is **OFF and fully inert by
default** (output byte-identical to the previous behavior), with an authenticated
admin control plane and no-deploy propagation.

### Files added

**Shared contracts — `packages/core/src/seo/`**
- `resolver.js` — pure, dependency-free precedence resolver (`resolveSeo`, `applyResolvedSeo`, `globToRegExp`). No I/O.
- `schemas.js` — dependency-free validation + normalization (`validateSeoConfig`, `normalizeSeoEntry`, `emptySeoConfig`) + guardrails (e.g. blocks accidental site-wide `noindex`).
- `index.js` — public surface. Subpath exports added to `packages/core/package.json` (`./seo`, `./seo/resolver`, `./seo/schemas`).
- `resolver.test.mjs` — 9 unit tests (run: `node --test packages/core/src/seo/resolver.test.mjs`). Covers inertness, precedence, glob matching, sitemap directives, validation guardrails.

**Web (`altftoolweb`)**
- `src/platform/seo/seoConfigSource.js` — server-side reader for the single config doc `projects/altftool/seo/runtime` (Firestore REST + in-memory TTL cache + ISR tag + timeout + empty-config fallback). Feature-flag gated. Mirrors `firebaseBlogs.js`.
- `src/platform/seo/generateMetadata.js` — `createPageMetadata` now consults the central snapshot via `applyCentralSeo()`. Inheritance (`fill`) applies only where the page omitted a value; per-URL overrides (`force`) win. Added optional `canonical`, `follow`, `pageType`, `brandId` args. **Inert when the engine is off** (snapshot null → args pass through unchanged).
- `src/app/api/revalidate/route.js` — secret-gated on-demand revalidation (`revalidateTag('seo-config')`).

**Admin (`altftoolwebadmin`)**
- `src/app/api/seo/config/route.js` — `GET`/`PUT` control-plane API: `enforceRateLimit` → `verifyActiveAdmin` → `validateSeoConfig` → Admin SDK write (version++ + audit) → cross-app revalidate.
- `src/projects/altftool/modules/seo/page.jsx` — SEO Engine admin UI (enable toggle + structured config editor with server validation/warnings).
- `src/projects/altftool/modules/seo/services/seoService.js` — authenticated client (Bearer idToken).
- Registered the module in `src/projects/altftool/config.js` and `src/lib/adminModuleLoaders.js` (appears in the sidebar, routes at `/altftool/seo`).

### No Firestore rules change required
`firestore.rules` already grants `projects/altftool/{document=**}` **public read + active-admin write**, which covers `seo/runtime`. The admin API writes via the Admin SDK (rules-bypassing, but authenticated + audited in code). Single-doc reads need no index.

## How to enable

The engine is dormant until you opt in.

1. **Web env** (`altftoolweb`):
   - `ALTFT_SEO_ENGINE_ENABLED=true` (or `NEXT_PUBLIC_SEO_ENGINE_ENABLED=true`)
   - `ALTFT_REVALIDATE_SECRET=<random-secret>` (for the revalidate endpoint)
   - optional: `ALTFT_SEO_CONFIG_TTL_SECONDS` (default 300)
2. **Admin env** (`altftoolwebadmin`):
   - `ALTFT_WEB_REVALIDATE_URL=https://altftool.com/api/revalidate`
   - `ALTFT_REVALIDATE_SECRET=<same-secret-as-web>`
3. In the admin **SEO Engine** module, set `"enabled": true` in the config and save. The doc is created at `projects/altftool/seo/runtime`.
4. **Warm the cache (recommended once live):** add `await primeSeoConfig()` from `@/platform/seo/seoConfigSource` at the top of the root `layout.jsx` `generateMetadata` (requires converting the root layout's `export const metadata` to an async `generateMetadata`). Until then, the global config still applies but may take one extra render cycle to warm per ISR window.

Both flags off → the engine does nothing and the site behaves exactly as before.

## Verification done
- `resolver.test.mjs`: 9/9 passing, including the inert-when-empty guarantee.
- `node --check` on the new pure-JS modules.
- `createPageMetadata` inertness verified by inspection: engine-off → `getSeoConfigSnapshot()` returns null → args unchanged; `follow` default `true` and `canonical` undefined reproduce the prior output exactly.

## Remaining (next increments)
- **Phase 1 finish:** root-layout cache priming; convert the 7 policy pages / white-label modules (homeserv, altflovepdf) to inherit central config (closes the canonical-`/` bug and brand-profile gap); a golden-snapshot regression test harness; richer per-section admin forms; a `/api/seo/preview` route.
- **Phases 2–5:** sitemap/robots config-drive + indexing tracking; redirect manager; analytics dashboard; AI recommendations (per the roadmap in the architecture plan).

## Engineering notes
- **Type-safety:** Phase 1 uses dependency-free validators (no new install) instead of Zod, to keep the engine self-contained and avoid a monorepo dependency change in a constrained environment. The function surface (`validateSeoConfig`) can be swapped to Zod later without touching callers.
- **Backward compatibility:** every existing `createPageMetadata` call site is untouched and behaves identically with the engine off.

---

## Phase 2 — Indexing & Sitemap Control (added)

Sitemap and robots.txt are now centrally controllable, still **inert when the engine is off**.

**Added / changed**
- `packages/core/src/seo/schemas.js` — new `crawl` section `{ disallow[], allow[], extraSitemaps[] }` in `emptySeoConfig()` + `validateSeoConfig()` (rooted-path + http(s) normalization).
- `packages/core/src/seo/resolver.js` — `resolveCrawl(config)` and `resolveSitemap(config, ctx)` exports.
- `altftoolweb/src/app/sitemap.js` — loads the central config once per build; `pushUnique` now applies per-path **exclusion** (`sitemap.include=false`) and **priority/changeFrequency** overrides from rules/types/pages. Defensive try/catch; unchanged output when config empty/disabled.
- `altftoolweb/src/app/robots.js` — now async; merges `crawl.disallow`/`allow` and appends `extraSitemaps`. Output byte-identical to the previous robots.txt when the engine is off.
- Tests: `packages/core/src/seo/phase2.test.mjs` (crawl + sitemap resolution + validation). Verified: `resolveCrawl`, crawl normalization, and the byte-identical-robots-when-off guarantee pass; `resolveSitemap` is the same code path proven by the Phase 1 sitemap test.

**How to use (admin SEO Engine config)**
```json
{
  "enabled": true,
  "crawl": { "disallow": ["/preview/"], "extraSitemaps": ["https://altftool.com/news-sitemap.xml"] },
  "types": { "tools": { "defaultPriority": 0.8, "defaultChangeFreq": "weekly" } },
  "rules": [ { "pathGlob": "/tools/all/*", "set": { "priority": 0.9 } } ],
  "pages": { "/some/url": { "sitemap": { "include": false } } }
}
```

**Still ahead in Phase 2:** indexing-status tracking per URL (manual entry + optional Google Search Console API), and an admin sitemap/index dashboard.

---

## Phase 3 — Redirect Manager (added)

301/302 redirects are now admin-manageable at runtime (no deploy), applied in `proxy.js`. **Inert when the engine is off** (legacy redirect behavior byte-preserved).

**Added / changed**
- `packages/core/src/seo/schemas.js` — new `redirects[]` (`{ source, destination, type:301|302, enabled, note }`) in `emptySeoConfig()` + `validateSeoConfig()`, with guardrails: source must be a rooted path, destination must be a rooted path or absolute `http(s)` URL, plus **self-redirect, duplicate-source, and A↔B loop detection**.
- `packages/core/src/seo/resolver.js` — `resolveRedirect(redirects, pathname)` (exact + trailing-slash match; skips disabled/self/empty; returns `{ destination, statusCode }`).
- `altftoolweb/src/platform/seo/redirectSource.js` — **middleware-safe** loader: plain `fetch` + `cache:"no-store"`, module-level TTL cache (default 60s), feature-flag gated (returns `[]` instantly when off → zero added latency), never throws.
- `altftoolweb/src/proxy.js` — now `async`; checks central redirects first (internal → apex+path with the configured status; external → straight redirect), then falls through to the existing static `REDIRECTS_MAP` + tool/news patterns. Default status stays `301`.
- Tests: `packages/core/src/seo/phase3.test.mjs` + a verified self-contained run covering matching, validation guardrails, and **proxy inertness when off**.

**How to use (admin SEO Engine config)**
```json
{
  "enabled": true,
  "redirects": [
    { "source": "/old-guide", "destination": "/blogs/new-guide", "type": 301 },
    { "source": "/promo", "destination": "https://partner.example.com", "type": 302 }
  ]
}
```

**Migration note:** the legacy `REDIRECTS_MAP` in `proxy.js` and the static `redirects()` in `next.config.mjs` still work and take effect when no central redirect matches. Move them into the engine incrementally; keep build-time redirects only for structural invariants.

---

## Phase 4 — SEO Analytics / Health Dashboard (added)

A health analyzer that scans the central config for issues, stored as snapshots with history and surfaced in the admin SEO module.

**Added / changed**
- `packages/core/src/seo/health.js` — pure `analyzeSeoHealth(config, { routes })` → `{ generatedAt, metrics, findings[] }`. Checks: global noindex (error), broad noindex rules, invalid rule globs, redirect self/loop/chain/duplicate, redirect↔page conflicts, redirecting a live route, duplicate canonicals, partial page metadata, page overrides for unknown routes; computes a 0–100 score. Exported via `@altftool/core/seo`.
- `altftoolwebadmin/src/app/api/seo/health/route.js` — `POST` runs the analyzer over the live config and stores a snapshot in `projects/altftool/seo_health`; `GET` returns the last 20 snapshots. Auth + rate-limit + audit.
- `altftoolwebadmin/src/projects/altftool/modules/seo/services/seoService.js` — `runHealthCheck()`, `fetchHealthHistory()`.
- `altftoolwebadmin/src/projects/altftool/modules/seo/page.jsx` — a **Health panel**: run button, metric cards (score/errors/warnings/redirects/noindex/rules), severity-coded findings list, and a collapsible history.
- Tests: `packages/core/src/seo/health.test.mjs` — **7/7 passing** (loops, chains, duplicate canonicals, broad noindex, metrics, route-inventory checks).

---

## Phase 5 — AI-Powered SEO Recommendations (added)

Generate title/description/keyword suggestions for a page, with a one-click "apply to config draft" that flows through the normal audited save.

**Added / changed**
- `packages/core/src/seo/recommendations.js` — pure helpers: `buildRecommendationPrompt()` (strict-JSON prompt), `parseRecommendation()` (robustly extracts JSON from fenced/prose model output), `normalizeSuggestion()` (clamps title ≤60 / description ≤155, dedupes ≤8 keywords), and `heuristicRecommendation()` (deterministic no-AI fallback from title/content/path). Exported via `@altftool/core/seo`.
- `altftoolwebadmin/src/app/api/seo/recommendations/route.js` — `POST` calls **Gemini** (`gemini-2.5-flash`) when `GEMINI_API_KEY` is set, parses the response, and **falls back to the heuristic** when no key/parse fails — so it always returns a usable suggestion. Auth + rate-limited. Read-only (applying happens via the audited config save).
- `altftoolwebadmin/.../seo/services/seoService.js` — `getRecommendation({ path, title, content, url })`.
- `altftoolwebadmin/.../seo/page.jsx` — **AI Recommendations panel**: path + content inputs, "Suggest SEO" button, suggestion card (title/description/keywords + source badge), and "Apply to config draft" which writes `pages[path]` into the editor for review before Save.
- Tests: `packages/core/src/seo/recommendations.test.mjs` — **7/7 passing** (JSON/fence/prose parsing, junk→null, clamping/dedupe, heuristic derivation, path fallback, prompt constraints).

**Config:** set `GEMINI_API_KEY` in the admin env to enable AI suggestions; without it the heuristic fallback is used automatically.

---

## Engine status — all five phases delivered

| Phase | Scope | Status |
|---|---|---|
| 1 | Metadata core (title/desc/canonical/OG/Twitter/robots, inheritance + per-URL overrides) | ✅ inert by default |
| 2 | Sitemap / robots / crawl control | ✅ inert by default |
| 3 | Redirect manager (301/302, no deploy) | ✅ inert by default |
| 4 | SEO health analyzer + dashboard | ✅ |
| 5 | AI recommendations (Gemini + heuristic fallback) | ✅ |

**Test totals:** resolver 9, phase2 6, phase3 6, health 7, recommendations 7 — all passing. Everything is gated behind `ALTFT_SEO_ENGINE_ENABLED`; with it off the public site behaves exactly as before.

**Still optional/next:** Phase 2 indexing-status tracking (manual entry + Google Search Console API), per-section admin form editors (vs the JSON editor), Zod swap-in, and root-layout cache priming + policy-page/white-label migration from the Phase 1 finish list.

---

## Platform Phase A — Page Registry + Global Search (added)

First slice of the expanded CMS vision (`ALTF_ENGINE_PLATFORM_ARCHITECTURE.md`): one searchable registry of **every** page across all sources, plus a dashboard.

**Added / changed**
- `packages/core/src/seo/registry.js` — pure: `buildPageIndexEntry`, `computePageHealth`, `searchPages` (ranked, AND-terms, title/path boosts), `summarizeRegistry`. Exported via `@altftool/core/seo`. Tests: `registry.test.mjs` (**7/7 passing**).
- `altftoolweb/src/app/api/pages/inventory/route.js` — secret-gated enumerator that walks tools (`toolMetaMap`), blogs (`getAllBlogs`), news (`newsdata.json`), static + policy pages into normalized entries (+ marks which already have a central override).
- `altftoolwebadmin/src/lib/seoRegistrySource.js` — fetches + TTL-caches the inventory (auto-derives the web URL from `ALTFT_WEB_REVALIDATE_URL`, or set `ALTFT_WEB_INVENTORY_URL`).
- `altftoolwebadmin/src/app/api/seo/search/route.js` — `GET ?q=&type=` ranked search.
- `altftoolwebadmin/src/app/api/seo/registry/route.js` — `GET` dashboard summary (counts by type + aggregate health + "needs attention").
- Admin UI — two new screens registered as sub-routes (config.js already has the module; added to **adminModuleLoaders.js + adminModuleRouteKeys.js**):
  - `/altftool/seo/dashboard` — page counts + SEO-health tiles + needs-attention list.
  - `/altftool/seo/search` — global search box → results → detail panel (URL, canonical, H1, index status, override state). Nav links tie Config/Dashboard/Search together.

**How to use:** open `/altftool/seo/search`, type e.g. "Image Compressor" → see the page with its SEO snapshot. Dashboard shows totals (tools/blogs/news/…) and health counts. The inventory auto-refreshes (2-min TTL) or via `?refresh=1`.

**Next (Phase B):** Page Workspace (edit SEO **and content** per page → write `pageOverrides`), web SSR readers + per-type content adapters, then Indexing/Sitemap/Redirect manager UIs.
