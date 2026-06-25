# ALTF Engine — Internal SEO & Content Management Platform

**Architecture & Impact Analysis (Pre-Implementation)** · Status: **DRAFT FOR APPROVAL**

This document covers the expanded vision: ALTF Engine as the **single source of truth** for SEO, indexing, metadata, content, search visibility, and content management across the entire AltFTool ecosystem — manageable end-to-end from the Admin Panel with **no code deploys** for routine changes.

It builds on the SEO config engine already delivered (Phases 1–5: metadata core, sitemap/robots/crawl, redirect manager, health analyzer, AI recommendations) and extends it into a full **Content Control Center**. Throughout, ✅ = already built, 🟡 = partially built, 🔵 = new in this plan.

> **No implementation has started for the expanded scope.** Per the brief, this is the architecture review to be approved first.

---

## 0. Executive Summary

The hard part of this vision is **not** the SEO fields — those already flow through one factory and a Firestore override layer (built). The hard part is that AltFTool's **content lives in four very different places**, and a true CMS must unify them behind one editable layer + one search:

| Page type | Where content lives today | Admin-editable today? |
|---|---|---|
| **Blogs** (~500) | **Firestore** `projects/altftool/blogs` | ✅ yes (existing `blogs` admin module) |
| **Tools** (~280) | **Static repo file** `toolContentOverrides.js` + generated `toolMetaMap.js` | ❌ code only |
| **News** (up to ~10k) | **Static** `newsdata.json` + **live RSS feeds** | ❌ code/feed only |
| **Static / Policy** (7+) | **Hardcoded** `"use client"` JSX components | ❌ code only |
| **Landing modules** (buysmart, deals, wattpad, top9/11, homeserv, …) | Mix of JSON + Firestore | partial |

The platform therefore rests on three new pillars on top of the existing engine:

1. **Page Registry + Global Search** 🔵 — a denormalized index of *every* page (all sources) so the admin can search "Image Compressor" and instantly open its full SEO + content workspace.
2. **Unified Content Override Layer** 🔵 — extend the existing Firestore override doc to carry **content** (H1, intro, benefits, FAQs, body, schema), not just metadata, read server-side and merged over code defaults (backward compatible).
3. **Admin Workspaces + Dashboard** 🔵 — a search-first dashboard (page counts + SEO health) and a per-page visual SEO/content workspace.

Everything stays **SSR-safe, inert-by-default, and backward compatible**: code remains the fallback; the database only *overrides*.

---

## 1. Existing Architecture Analysis (Deliverable 1)

### 1.1 Monorepo & apps
- `altftoolweb` (public, Next 16 App Router, port 3002) — SSR/ISR, reads Firestore via **public REST** (no Admin SDK).
- `altftoolwebadmin` (admin, port 3001) — Firebase Auth + RBAC, **Admin SDK** server-side, module registry UI.
- `packages/core` (`@altftool/core`) — shared http/cache/env/firebase + **`@altftool/core/seo`** (built engine).
- Firestore project `altftool-bca36`; default-deny rules; `projects/altftool/**` = public read + active-admin write.

### 1.2 Page types & content sources (the CMS surface)
- **Tools**: `toolMetaMap.js` (name/description/category, generated), `toolSeoContent.js` (category templates → intro/steps/FAQs/benefits), `toolContentOverrides.js` (per-slug hand-written `intro`, `useCases`, `benefits: [title,body][]`, `faqs: [q,a][]`). Rendered server-side via `ToolSeoSection`.
- **Blogs**: Firestore `projects/altftool/blogs` (status, heading, content, seoTitle, seoDescription, author, category, tags, image…). Already CRUD'd by the admin `blogs` module; read on web via `firebaseBlogs.js` (REST).
- **News**: `public/data/newsdata.json` (`news[]`: id, slug, headline, summary, image_url…) + live RSS via `getNewsDataServer` (10-min ISR). `/news/topics/[topic]` is intentionally `noindex`.
- **Static/Policy**: `policypages/*` are hardcoded `"use client"` components — **no metadata, content in JSX**.
- **Landing modules**: brandrating, buysmart, exclusivedeals, wattpad, top9/11, homeserv (white-label "QuoteNest"), altflovepdf (white-label) — mixed JSON/Firestore, some roll their own metadata.

### 1.3 Admin architecture
- Project/module registry: `src/projects/<project>/config.js` → modules; dynamic route `(protected)/[project]/[module]/[...subpath]` → `renderAdminModuleRoute` → `resolveProjectModule` + `resolveAdminModuleRouteKey` + lazy loaders. (A module must be registered in **config.js + adminModuleLoaders.js + adminModuleRouteKeys.js** — the SEO module now is.)
- Auth/authz: `verifyActiveAdmin`/`verifySuperAdmin` (Admin SDK), custom claims, audit log (`writeAdminAuditLog`), rate limiting (`enforceRateLimit`). Superadmins see all modules.
- The `blogs` module is the reference content-CMS pattern; the `dynamic` module is the reference config-doc pattern.

### 1.4 Dependency map (high level)
```
Admin UI (module) ──> /api/seo/* (auth+validate+audit) ──> Firestore projects/altftool/seo/** + content/**
                                                                  │  (public REST read, ISR + tag)
Web SSR: createPageMetadata ─┐                                    │
         ToolSeoSection ─────┼── resolveSeo() + content overrides ┘
         sitemap.js / robots.js / proxy.js ── resolve{Sitemap,Crawl,Redirect}()
Page Registry/Search ──> Page Index collection <── indexer (admin job) reads all sources
```

---

## 2. Current SEO Flow Analysis (Deliverable 2)

Server-side, three layers stack per request (✅ all built/extended already):
1. **Root layout** sets title template `%s | AltFTool`, metadataBase, global defaults, Organization/WebSite JSON-LD.
2. **Page `generateMetadata`** → `createPageMetadata({ title, description, path, … })` builds canonical/OG/Twitter/robots from `path`+`noindex`. **Now also merges central config** (`applyCentralSeo` → `resolveSeo`): per-URL admin overrides win, type/global defaults fill gaps. Inert when engine off.
3. **JSON-LD** via `create*JsonLd` + `<JsonLd>`; **sitemap.js/robots.js/proxy.js** now read central config for inclusion/priority/crawl/redirects.

**Gap the CMS closes:** today only *metadata* is DB-overridable. Page **content** (tool intro/benefits/FAQs, static-page body) is still code. The CMS extends the override layer to content and adds the registry/search/dashboard on top.

---

## 3. Database Schema Design (Deliverable 3)

Design principles: **override, don't replace** (code stays the fallback); **one read per page** (denormalized); **versioned + audited**; **source-agnostic** (a page is identified by its `path`).

### 3.1 Core entities
- **PageOverride** — the unit of admin control for one URL. Extends the existing `seo/runtime.pages[path]` into a richer per-page document:
  ```
  {
    path, pageType, brandId,
    seo:     { title, description, keywords[], canonical, image,
               og:{type,publishedTime,modifiedTime,authors[],tags[]},
               twitter:{title,description,card} },
    robots:  { index, follow, maxSnippet, maxImagePreview },
    sitemap: { include, priority, changeFreq },
    content: { h1, intro, benefits:[{title,body}], faqs:[{q,a}], body, sections[] },
    schema:  [ {type:"FAQPage"|"Article"|"SoftwareApplication"|..., data} ],
    indexing:{ status, lastSubmitted, lastCrawled, coverageState },
    status:  "draft"|"published",
    version, updatedAt, updatedBy
  }
  ```
- **PageIndexEntry** — denormalized search/registry record (one per page, all sources):
  ```
  { path, pageType, source:"tool"|"blog"|"news"|"static"|"landing",
    title, h1, description, keywords[], indexState, hasOverride:bool,
    health:{missingTitle,missingDescription,missingCanonical,missingH1,missingSchema,noindex},
    updatedAt, searchText (lowercased title+desc+slug for prefix search) }
  ```
- **Redirect** ✅ (built, in `seo/runtime.redirects`; Phase will promote to its own collection for bulk ops).
- **GlobalConfig / BrandProfile / TypeDefault / Rule / Crawl** ✅ (built in `seo/runtime`).
- **HealthSnapshot** ✅ (built, `seo_health`).
- **AuditLog** ✅ (existing `admin_audit_logs`).

### 3.2 Effective-value resolution (SSR)
`effective(field) = pageOverride ?? ruleMatch ?? typeDefault ?? brand ?? global ?? CODE_DEFAULT`. Code default always exists → never blank, never a regression.

---

## 4. Firestore Collection Structure (Deliverable 4)

Under the existing public-read/admin-write tree (no rules rewrite needed for reads):
```
projects/altftool/
  seo/runtime                      ✅ global/brands/types/rules/crawl/redirects (built)
  seo_health/{id}                  ✅ health snapshots (built)

  pageOverrides/{encodedPath}      🔵 per-page SEO + CONTENT override   (encodedPath = base64url(path))
  pageIndex/{encodedPath}          🔵 denormalized registry/search record (one per page)
  redirects/{id}                   🔵 promoted redirect collection (bulk upload, hit counts)
  contentRevisions/{id}            🔵 optional version history for rollback

  blogs/{id}                       ✅ existing (blog content — already CMS-managed)
```
Indexes (`firestore.indexes.json`): `pageIndex` on `(pageType, updatedAt)`, `(source, indexState)`, and `searchText` prefix; `pageOverrides` on `(pageType, status, updatedAt)`; `redirects` on `(enabled, source)`.

**Rules addition (write-validation backstop):** tighten `match /projects/altftool/{pageOverrides,pageIndex,redirects}/{doc}` to `read: if true; write: if isActiveAdmin()` (reads already public via the broad rule; this just documents intent). Admin API remains the validated write path.

---

## 5. API Architecture (Deliverable 5)

All admin routes follow the house convention: `enforceRateLimit → verifyActiveAdmin → validate → Admin SDK → audit → revalidate`.

```
✅ /api/seo/config            GET/PUT   global/brands/types/rules/crawl/redirects
✅ /api/seo/health            GET/POST  run + history
✅ /api/seo/recommendations   POST      AI suggestions (Gemini + heuristic)
🔵 /api/seo/pages             GET       paginated registry list (filter by type/health/source)
🔵 /api/seo/pages/[encoded]   GET/PUT   full page workspace (SEO + content + schema)
🔵 /api/seo/search            GET       global search (q, type, limit)  → PageIndex
🔵 /api/seo/index/rebuild     POST      re-index all sources into pageIndex (superadmin)
🔵 /api/seo/redirects         GET/POST/DELETE + /bulk  (CSV/JSON bulk upload)
🔵 /api/seo/sitemap/preview   GET       resolved sitemap entries (include/exclude/priority)
```
Web side ✅: `/api/revalidate` (tag/path). New: web SSR readers extend to `pageOverrides` (content) alongside `seo/runtime`.

---

## 6. Admin UI Architecture (Deliverable 6)

A new top-level experience inside the existing module shell (`/altftool/seo`), structured as tabs/sub-routes (registered in config.js + loaders + routeKeys):

- **Dashboard** 🔵 — page counts per type, SEO-health tiles (missing titles/descriptions/canonicals/H1/schema, noindex, redirects, 404s), trend from `seo_health` history, quick links to worst offenders.
- **Search** 🔵 — the primary entry point: one search box → results across all page types → click → page workspace.
- **Page Workspace** 🔵 — per-page tabs: **Basic SEO** (title/description/keywords) · **Advanced** (canonical/robots/OG/Twitter) · **Content** (H1/intro/benefits/FAQs/body) · **Schema** (FAQ/Article/Tool/Org) · **Indexing** (index/follow/canonical mode/sitemap/priority) · live **preview** + **publish** (draft→published).
- **Sitemap Manager** 🔵 · **Redirect Center** 🔵 (incl. bulk upload) · **Config** ✅ (global/brands/types/rules) · **Health** ✅ · **AI** ✅.

UI built on the existing `@altftool/ui` design tokens; forms via the existing `react-hook-form` + `react-select` stack; tables via `@tanstack/react-table`; charts via `recharts`.

---

## 7. Search Architecture (Deliverable 7) — the most important feature

**Constraint:** Firestore has **no native full-text search**. Scale: ~280 tools + ~500 blogs + up to ~10k news + landing/static ≈ **10–12k pages**.

**Chosen design — a denormalized `pageIndex` collection + tiered search:**
1. **Indexer job** (`/api/seo/index/rebuild`, also incremental on content save) walks every source — `toolMetaMap`, Firestore blogs, news JSON/feed, static route list, landing data — and writes one compact `pageIndex` doc per page (title, h1, description, slug, type, indexState, health flags, `searchText`).
2. **Search query**: for the admin's typed query, search `pageIndex` by `searchText` prefix + `pageType` filter (Firestore range queries on a normalized field), paginated. For tools/blogs/landing/static (~1k) this is instant; for news (10k) prefix queries stay bounded.
3. **Scale-out option (documented, not required day 1):** swap the query layer for **Typesense / Meilisearch / Algolia** fed from the same `pageIndex` — true typo-tolerant full-text at 10k+ scale. The `pageIndex` schema is designed to be the source for either path, so we can start in-Firestore and graduate without reworking data.

Result shape returned by search = enough to render the workspace header immediately (URL, title, description, canonical, H1, index status, last updated, hasOverride), with the full doc lazy-loaded on open.

---

## 8. Content Management Architecture (Deliverable 8)

**Principle: a unified override layer over heterogeneous code/data sources.** Each page type gets an **adapter** that knows how to (a) read its *code-default* content and (b) apply the Firestore `pageOverrides.content`. SSR merges override-over-default.

| Page type | Default source | Override mechanism | Effort |
|---|---|---|---|
| **Tools** | `toolContentOverrides.js` + templates | `toolSeoContent.js`/`ToolSeoSection` read `pageOverrides.content` first, fall back to code | 🟡 medium — extend existing override stack to Firestore |
| **Blogs** | Firestore blogs | already editable; surface in the same workspace (reuse blogs service) | ✅ low |
| **News** | JSON/feed | override headline/summary/SEO via `pageOverrides`; body stays feed-driven | 🟡 medium |
| **Static/Policy** | hardcoded JSX | add a `policypages/[slug]` server route + section renderer reading `pageOverrides.content.sections`; migrate existing copy in | 🔵 higher |
| **Landing/white-label** | JSON/Firestore | `pageOverrides` + brand profiles (built) | 🟡 medium |

**Backward compatibility is absolute:** if no override exists, the page renders exactly as today (code default). Migration moves content into Firestore incrementally, page-type by page-type, behind the same feature flag.

**SSR read path:** the web app gains a cached `loadPageOverride(path)` (mirrors `firebaseBlogs.js`: REST + ISR tag + in-memory cache + fallback). `createPageMetadata` and the content components consume it. On admin publish → `revalidateTag`/`revalidatePath` → live in seconds.

---

## 9. Migration Strategy (Deliverable 9)

1. **Ship inert** behind `ALTFT_SEO_ENGINE_ENABLED` (already the case). Empty overrides = current output.
2. **Build the registry** — run the indexer to populate `pageIndex` (read-only over existing sources). No site impact.
3. **Golden snapshots** of metadata + key content for a representative set; regression gate.
4. **Backfill overrides** per type: import `toolContentOverrides.js` → `pageOverrides.content` for tools; blogs already in Firestore; news SEO; then static pages last (requires the section-renderer route).
5. **Enable per type** progressively; monitor GSC + the health dashboard.
6. **Promote redirects** from `seo/runtime.redirects` to the `redirects` collection for bulk ops (keep both readers during transition).
7. **Rollback** anytime: flip the flag (engine inert) or revert a doc `version` / draft.

No big-bang cutover; each step is independently shippable and reversible.

---

## 10. Risk Analysis (Deliverable 10)

| Risk | Sev | Mitigation |
|---|---|---|
| SEO regression from content/metadata override | High | Inert-by-default + golden snapshots + per-type rollout + flag (proven in Phases 1–5) |
| Firestore read failure degrades SSR | High | Hard fallback to code defaults; short timeout; in-memory + ISR cache (built pattern) |
| Stale index after edits | Med | Incremental re-index on save + on-demand revalidation tag |
| Search at 10k news scale | Med | Bounded prefix queries now; documented Typesense/Algolia upgrade path sharing `pageIndex` |
| Accidental site-wide noindex / bad canonical / redirect loop | High | Validation + guardrails + health analyzer (built) + draft/publish + version rollback |
| Static-page content migration breaks layout | Med | Section-renderer is additive; migrate one page at a time with preview before publish |
| Unauthorized writes (no server guard on `(protected)`) | High | All writes via audited admin API + Firestore rules (built convention) |
| Index/registry write volume (10k news) | Med | Batched writes, incremental updates, off-peak rebuild job |
| Dual content source confusion (code vs DB) | Med | Workspace clearly shows "code default vs override"; adapters are the single merge point |

---

## 11. Scalability Plan (Deliverable 11)

- **Read path O(1) per page**: one cached `pageOverride` doc by deterministic key + bounded config; no N+1. ISR + in-memory + on-demand revalidation.
- **Registry/search**: `pageIndex` is denormalized and paginated; designed to graduate to a dedicated search engine without schema change.
- **Multi-module & extensible**: everything namespaced under `projects/altftool/**`; adapters per page type → adding a new page type = add an adapter + register it, no core changes. Generalizes to other projects (`leadtree`).
- **Write throughput**: admin edits are low-volume; the only bulk path (indexer) uses batched writes + incremental updates.
- **No hardcoded page logic**: page identity is the `path`; behavior is data-driven via overrides/rules/adapters — exactly the "generic architecture" the brief requires.
- **SSR/SSG/ISR/dynamic** all supported; canonical/robots/metadata always server-rendered.

---

## 12. Mapping to the 12-Step Vision

| Vision step | Status | Where |
|---|---|---|
| 1 Understand codebase | ✅ | this doc + prior audits |
| 2 Central editing (no code) | 🟡 | metadata ✅; content 🔵 (override layer) |
| 3 **Global search** | 🔵 | `pageIndex` + `/api/seo/search` + Search UI |
| 4 Website-wide content mgmt | 🔵 | `pageOverrides.content` + adapters |
| 5 Central dashboard | 🔵 | counts + health tiles (health engine ✅) |
| 6 Indexing management | 🟡→🔵 | robots/sitemap/canonical config ✅; per-page indexing UI 🔵 |
| 7 Content optimization workspace | 🔵 | Page Workspace tabs |
| 8 Dynamic (DB-driven) metadata | ✅ | `createPageMetadata` + `seo/runtime` (built) |
| 9 Sitemap management | 🟡→🔵 | config-driven sitemap ✅; manager UI 🔵 |
| 10 Redirect management | ✅→🔵 | runtime redirects ✅; bulk/center UI 🔵 |
| 11 Future AI SEO layer | 🟡 | recommendations ✅; scoring/internal-linking 🔵 |
| 12 Enterprise (scalable/SSR/safe) | ✅ | inert-by-default, adapters, override model |

---

## 13. Proposed Roadmap (expanded platform)

- **A. Page Registry + Global Search** (foundation for everything) — indexer, `pageIndex`, `/search`, Search UI, Dashboard counts.
- **B. Page Workspace + Content Override Layer** — `pageOverrides` (SEO+content), web SSR readers + adapters (tools first, then blogs surface, news, landing).
- **C. Indexing & Sitemap Manager UI** — per-page index controls + sitemap manager (engine already config-driven).
- **D. Redirect Center** — promote to collection + bulk upload UI.
- **E. SEO Health Dashboard v2** — registry-wide health (missing H1/schema/canonical across *all* pages, 404 detection).
- **F. Static-page content migration** — section renderer + migrate policy/about/contact.
- **G. AI SEO layer v2** — scoring (SEO/readability/optimization), internal-linking + keyword suggestions, bulk apply.

Each phase ships behind the existing flag, inert by default, regression-gated.

---

## 14. Open Decisions / Approvals Needed

1. **Search backend**: start in-Firestore `pageIndex` (recommended) vs adopt Typesense/Algolia from day 1? *(Rec: Firestore now, graduate later — schema is ready for both.)*
2. **Static-page content**: migrate to DB-driven section renderer (full CMS) vs keep code + only manage their SEO? *(Rec: SEO first, content migration in Phase F.)*
3. **News at 10k**: index all, or only server-rendered/indexable news (skip noindex topic pages)? *(Rec: index indexable pages; track the rest read-only.)*
4. **Draft/publish workflow + version history**: include `contentRevisions` for rollback now or later? *(Rec: now — cheap insurance for content edits.)*
5. **Redirect collection promotion**: do in Phase D, keeping `seo/runtime.redirects` as fallback. Confirm.
6. **Phase order**: A→G as written, or reprioritize (e.g., Page Workspace before full Search)?

---

*End of architecture review. No code written for the expanded scope. Phases 1–5 (the SEO engine core) are already implemented and inert-by-default. Awaiting approval of §14 before building the platform layers (Registry/Search → Workspace/Content → Managers → AI v2).*
