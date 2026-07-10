# ALTF Engine — Centralized SEO & Index Management System

**Architecture & Impact Analysis (Pre-Implementation)**
Status: **DRAFT FOR APPROVAL** — no code has been written. This document is the deliverable required before implementation begins.
Scope: Admin-managed SEO/index control plane for the entire AltFTool platform.
Author: Engineering analysis pass · Target standard: production-grade, SDE-2.

---

## 0. Executive Summary

AltFTool already has a **substantially centralized, server-rendered SEO layer** — this is the single most important finding. Almost all metadata flows through one factory, `createPageMetadata()` in `altftoolweb/src/platform/seo/generateMetadata.js`, and the platform already has the exact precedent we need: the **`dynamic` admin module** writes a Firestore config doc that the public site reads server-side via REST with ISR. The ALTF Engine is therefore **not a greenfield build** — it is the productization of patterns that already exist, plus a control plane (admin UI + API + storage) layered on top.

The recommended design:

- **Storage:** Firestore, under `projects/altftool/seo/**` (reuses existing rules, indexes, REST-read patterns, and the public-read/admin-write boundary). No new database.
- **Admin control plane:** a new `seo` module inside `altftoolwebadmin`, writing through an **authenticated, audited, rate-limited admin API route** (`verifyActiveAdmin` + `writeAdminAuditLog` + `enforceRateLimit`).
- **Web consumption:** a new server-side SEO config reader in `altftoolweb` that mirrors `firebaseBlogs.js`, injected **inside `createPageMetadata()`** so every page inherits centrally-managed defaults with page-level overrides still winning.
- **No-deploy updates:** time-based ISR **plus on-demand revalidation** (cache tags / `revalidatePath`) triggered by the admin API on save, so SEO changes propagate in seconds without a deployment.
- **No regressions:** the engine ships **inert by default** (empty config = byte-identical output to today), behind a feature flag, with a backfill migration that imports current inline metadata into Firestore.

This unlocks the full requested feature set (titles, descriptions, keywords, canonical, OG/Twitter, robots directives, sitemap inclusion, indexing status, URL inspection tracking, structured data, redirect management, crawl settings, SEO health) across five incremental phases.

---

## 1. Existing Architecture Analysis

### 1.1 Monorepo topology

```
altftool/                      (npm workspaces, type: module, Node >=24)
├── altftoolweb/               Public site — Next.js 16 App Router (port 3002)
├── altftoolwebadmin/          Admin panel — Next.js 16 App Router (port 3001)
├── packages/
│   ├── core/                  @altftool/core — http (rate-limit), cache, env, firebase contracts, next security headers
│   └── ui/                    @altftool/ui — shared design system (token-first)
├── firestore.rules            Default-deny; projects/altftool/** = public read, active-admin write
├── firestore.indexes.json     Composite indexes (accessRequests, blogs, support_tickets)
├── firebase.json              Rules + indexes + storage + emulators (Firestore 8080)
└── (root audit docs)          SEO_AUDIT_REPORT.md, BACKEND_AUTH_AUDIT_REPORT.md, ARCHITECTURE_CODE_MAP.md, SECURITY_AUDIT.md, ...
```

Firebase project: **`altftool-bca36`**. Both apps are Next.js 16 App Router, React 19, Tailwind 4.

### 1.2 Public web app (`altftoolweb`)

- **Rendering:** Next.js native Metadata API only (React Helmet deliberately rejected — see `SEO_AUDIT_REPORT.md`). Server-side throughout.
- **Data access:** **no Firebase Admin SDK.** Reads Firestore over the **public REST API** (`firestore.googleapis.com/v1/...`) using `NEXT_PUBLIC_FIREBASE_API_KEY`, allowed because rules make `projects/altftool/**` publicly readable. Canonical pattern: `src/app/blogs/data/firebaseBlogs.js` (structuredQuery + `fetch(..., { next: { revalidate: 300 } })` + `AbortController` 3.5s timeout + in-memory `Map` cache + static fallback).
- **ISR:** `export const revalidate` (3600 on SSR pages and `sitemap.js`; 300 on blog REST). No tag-based revalidation today.

### 1.3 Admin app (`altftoolwebadmin`)

- **Auth:** Firebase Auth (client SDK), domain-locked to `@anslation.com`. Pending Google users create an `accessRequests` doc, approved by a superadmin.
- **Authz:** `admins/{uid}` doc (`roleType: admin|superadmin`, `isActive`, `permissions`, `projectAccess`) mirrored into Firebase **custom claims** (`src/lib/syncAdminClaims.js`).
- **Server trust boundary:** `firebase-admin` SDK is initialized lazily (`src/lib/firebaseAdmin.js` → `adminAuth`, `adminDb`, `adminMessaging`). API routes verify `Authorization: Bearer <idToken>` via `verifyActiveAdmin` / `verifySuperAdmin` (`src/lib/serverAdminAuth.js`, `src/lib/adminAccess.js`).
- **API convention (32 route handlers):** `enforceRateLimit` → auth verify → validate body (allowlists) → `adminDb`/`adminAuth` op → `syncAdminClaims` (if RBAC) → `writeAdminAuditLog` → `NextResponse.json` with 400/401/403/404/409/500 semantics.
- **Module system:** `src/projects/index.js` → `PROJECTS = { altftool, leadtree }`; `src/projects/altftool/config.js` declares a `modules` map; each module lives in `src/projects/altftool/modules/<module>/` with `page.jsx` + `components/` + `services/`. Dynamic routing via `(protected)/[project]/[module]/[...subpath]/page.jsx` → `renderAdminModuleRoute()` → lazy loaders in `src/lib/adminModuleLoaders.js`. Sidebar auto-builds from the registry filtered by `hasModuleAccess()`.
- **Design system:** token-first `--anslation-ds-*` variables, `@altftool/ui` primitives (documented in `DESIGN_SYSTEM.md`).

### 1.4 The precedent that defines our integration seam

`src/projects/altftool/modules/dynamic/service/dynamic.service.js` **upserts** `projects/altftool/navigation/dynamic`; the public app's `altftoolweb/src/app/[slug]/page.jsx` (`revalidate = 3600`) **reads that doc via REST** and drives `generateMetadata` + `notFound()`. **This is exactly the admin-writes-config / web-reads-server-side loop the ALTF Engine generalizes.**

---

## 2. Current SEO Flow Analysis

### 2.1 End-to-end (server-side) for a typical page

1. **Root layout** (`altftoolweb/src/app/layout.jsx`) sets `metadataBase`, the title template `"%s | AltFTool"`, site-wide defaults (description, keywords, default OG/Twitter, `robots: index/follow`, manifest, icons), and renders global JSON-LD (`createOrganizationJsonLd()`, `createWebsiteJsonLd()`).
2. **Page `generateMetadata`** calls `createPageMetadata({ title, description, path, image?, keywords?, type?, noindex? })`. This single factory builds title, trimmed description (≤160 chars), merged keywords, **canonical** (`alternates.canonical = absoluteUrl(path)` + `languages` x-default/en), full **OpenGraph**, **Twitter** (`summary_large_image`), and **robots** (`index: !noindex`). The result deep-merges over the root metadata.
3. **Page body JSON-LD** rendered via the `create*JsonLd` factories + the single `JsonLd` component (`src/platform/seo/JsonLd.jsx`).
4. **Request-time:** `src/proxy.js` enforces apex host + a `REDIRECTS_MAP` (301) before pages render. Additional static redirects live in `next.config.mjs` (`redirects()`), which **require a deployment** to change.

### 2.2 `createPageMetadata` is the central seam

`altftoolweb/src/platform/seo/generateMetadata.js` exports `siteConfig` (name, url, default OG image, locale, twitter, sameAs, keywords) and `createPageMetadata()`. ~89–104 page files funnel through it. Canonical/OG/robots are 100% derived from `path` + `noindex`; pages never hand-build canonical URLs. **A central config lookup merged inside this factory — beneath the caller's explicit args — propagates to nearly the entire site in one change, with page overrides preserved by argument precedence.**

### 2.3 Sitemap & robots

- `src/app/sitemap.js` (`revalidate = 3600`) enumerates: ~90 hardcoded `staticRoutes` with priorities; JSON data (buysmart stores, deals, wattpad, news, top11, apps, altflovepdf TOOLS, homeserv services); `toolMetaMap`; local blog data (`getAllBlogs`, categories, tags, authors, topic clusters); and **live Firestore** (`getLiveSitemapCollections()` → blogs, extensions, consumerrating categories/subcategories/brands) via REST with a 3.5s timeout that silently returns `[]` on failure.
- `src/app/robots.js` is **static** (allow all, disallow `/api/`+`/_next/`, link sitemap).

### 2.4 Per-page-type metadata (consistency map)

| Page type | Uses `createPageMetadata`? | Canonical | noindex usage | Override mechanism |
|---|---|---|---|---|
| **Tools** | Yes (via `buildToolMetadata`) | `/tools/all/<slug>` (canonicalized) | none (all indexable) | `toolContentOverrides.js` per-slug |
| **Blogs (detail)** | Yes, then spread-overrides for article OG | `path` | thin archives `< 2` posts | object spread (`publishedTime`, `authors`, `tags`) |
| **Blogs (taxonomy)** | Yes | `path` | `noindex` when thin | helper args |
| **News** | Yes | `path` | `/news/topics/[topic]` always `noindex` | helper args |
| **Policies (7 pages)** | **No metadata at all** | **wrongly defaults to `/`** | none | none — invisible to SEO system |
| **brandrating / buysmart / exclusivedeals / wattpad / top9 / top11** | Mostly yes (index pages) | `path` | inline `robots:{index:false}` for 404s | helper args |
| **homeserv ("QuoteNest Pros")** | **Rolls own** raw metadata, white-label brand | none | none | bespoke |
| **altflovepdf ("Altf❤️PDF")** | **Rolls own** raw metadata, white-label brand | none | none | bespoke |
| **`"use client"` detail routes** | Cannot export metadata → inherit ancestor | inherited | none | none |

### 2.5 Documented state (from existing audits)

`SEO_AUDIT_REPORT.md` (authoritative, 2026-06-23): the platform scores 95/100; **0 documented SEO defects, 0 code changes required**; React Helmet explicitly rejected. Open low-priority items: legacy `/games/*` 301s (only if backlinks), enforce `www→apex` at host level, GSC stale `_next/static` (no action). The ALTF Engine must **preserve this clean baseline** — no regressions.

---

## 3. Risks, Dependencies & Integration Points

### 3.1 Integration points (where the engine plugs in)

| Seam | File | Engine role |
|---|---|---|
| Metadata factory | `altftoolweb/src/platform/seo/generateMetadata.js` → `createPageMetadata`, `siteConfig` | Inject central config (defaults under caller args); add brand profiles + article OG block |
| Sitemap | `altftoolweb/src/app/sitemap.js` | Drive inclusion/exclusion + priority + changefreq from config |
| Robots | `altftoolweb/src/app/robots.js` | Make rules config-driven |
| Redirects | `src/proxy.js` (runtime) + `next.config.mjs` (static) | Phase 3 redirect manager reads Firestore map at runtime |
| Web data reader | new `altftoolweb/src/platform/seo/seoConfigSource.js` (mirror `firebaseBlogs.js`) | Server-side REST read of SEO config + cache |
| Admin module | new `altftoolwebadmin/src/projects/altftool/modules/seo/**` | Control-plane UI |
| Admin API | new `altftoolwebadmin/src/app/api/seo/**` | Authenticated/audited writes + revalidation trigger |
| Storage | Firestore `projects/altftool/seo/**` | Source of truth |

### 3.2 Key risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **SEO regression** from changing the metadata factory | High | Engine inert by default (empty config → identical output); golden-snapshot tests of metadata for representative routes before/after; feature flag `ALTFT_SEO_ENGINE_ENABLED` |
| **Firestore read failure** degrades metadata at render | High | Hard fallback to current inline values (never throw); short timeout; in-memory cache; static-import fallback like `firebaseBlogs.js` |
| **Stale config** after admin edit (ISR latency) | Med | On-demand revalidation (cache tags + `revalidatePath`/`revalidateTag`) fired by admin API on save |
| **Bad config breaks indexing** (e.g. accidental site-wide `noindex`) | High | Server-side schema validation (Zod), guardrails (block global noindex without explicit confirm), audit log, versioned config with rollback |
| **Public-read config leakage** | Low | SEO config is non-sensitive (it becomes public HTML anyway); keep secrets out of it |
| **Unauthenticated writes** (no server guard on `(protected)`) | High | All writes go through admin API with `verifyActiveAdmin`; Firestore rules tightened with field validation on `projects/altftool/seo/**` |
| **Two redirect systems diverge** (`next.config` vs `proxy.js` vs new manager) | Med | Phase 3 consolidates runtime redirects into the engine; document precedence; keep build-time redirects for invariants only |
| **OneDrive/dev-env git fragility** (observed) | Ops | Do all git work on the developer machine, not via synced mounts |

### 3.3 Dependencies

- `firebase-admin` (admin app, already present) for authenticated writes.
- Firestore public REST read (web app, already used).
- A validation library — recommend **Zod** added to `packages/core` (the repo is JS/JSDoc, not TS; Zod gives runtime + inferred static types).
- Next.js on-demand revalidation APIs (`revalidateTag`, `revalidatePath`) — native to App Router.

---

## 4. Target Architecture — ALTF Engine

### 4.1 Layered model

```
        ┌────────────────────────────── ADMIN (altftoolwebadmin) ──────────────────────────────┐
        │  SEO module UI  ──>  /api/seo/* (verifyActiveAdmin + Zod + audit + rate-limit)         │
        │                          │  write              │ on save                               │
        └──────────────────────────┼─────────────────────┼───────────────────────────────────────┘
                                    v                     v
                         Firestore projects/altftool/seo/**     POST revalidate hook ─┐
                                    │  public REST read                                 │
        ┌───────────────────────────┼──────────────── WEB (altftoolweb) ───────────────┼─────────┐
        │  seoConfigSource.js (REST + cache + fallback)                                  │         │
        │      │ resolveSeo(pageType, path, entity)                                       │ revalidateTag/Path
        │      v                                                                          v         │
        │  createPageMetadata()  ──>  page metadata (title/desc/canonical/OG/twitter/robots)        │
        │  sitemap.js  ──>  inclusion/priority/changefreq                                           │
        │  robots.js   ──>  directives                                                              │
        │  proxy.js    ──>  redirects (Phase 3)                                                     │
        └──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Inheritance & override resolution (server-side, deterministic)

A page's effective SEO is resolved by merging, **lowest to highest precedence**:

1. **Global defaults** (`seo/global`) — extends today's `siteConfig` (site name, default OG image, title template, default robots).
2. **Brand profile** (`seo/brands/<brandId>`) — for white-label properties (`altftool`, `quotenest` (homeserv), `altflovepdf`). Overrides name/url/OG/template/twitter.
3. **Page-type defaults** (`seo/types/<type>`) — tools, blogs, news, policies, landing, etc. (default title pattern, changefreq, priority, robots policy).
4. **Pattern rules** (`seo/rules/*`) — path-glob rules (e.g. `/news/topics/*` → `noindex`), evaluated in order.
5. **Per-entity / per-path override** (`seo/pages/<encodedPath>`) — explicit admin override for a single URL or entity.
6. **Code-level page args** (what the page passes to `createPageMetadata` today) — **always wins**, guaranteeing backward compatibility and that engineering can hard-pin any value.

`resolveSeo()` returns a fully-merged object; `createPageMetadata` applies it under the caller's explicit args. Result with empty config = today's output exactly.

### 4.3 Brand profiles (handles the white-label divergence)

`homeserv` ("QuoteNest Pros") and `altflovepdf` ("Altf❤️PDF") deliberately use different identities. The engine models this as first-class **brand profiles** so they can be centrally managed without forcing one site identity — closing a current gap rather than fighting it.

---

## 5. Database Design (Firestore)

All under the existing project tree so current rules/REST-read apply. Documents are small, denormalized for single-read resolution, and versioned.

### 5.1 Collections & document shapes

```
projects/altftool/seo/global                      (singleton)
  { siteName, defaultBrandId, titleTemplate, titleDefault,
    defaultDescription, defaultKeywords[], defaultOgImage, locale,
    twitterHandle, sameAs[], defaultRobots:{ index, follow },
    updatedAt, updatedBy, version }

projects/altftool/seo/brands/{brandId}            (altftool | quotenest | altflovepdf | ...)
  { name, shortName, url, titleTemplate, ogImage, twitterHandle, locale, version, updatedAt, updatedBy }

projects/altftool/seo/types/{pageType}            (tools | blogs | news | policies | landing | wattpad | ...)
  { titlePattern, descriptionPattern, defaultPriority, defaultChangeFreq,
    robotsPolicy:{ index, follow }, includeInSitemap:bool, schemaTemplates[], version, updatedAt, updatedBy }

projects/altftool/seo/rules/{ruleId}              (ordered pattern rules)
  { order, pathGlob, match:{ brand?, type? }, set:{ noindex?, priority?, changeFreq?, canonicalStrategy? },
    enabled, note, version, updatedAt, updatedBy }

projects/altftool/seo/pages/{encodedPath}         (per-URL / per-entity override)  encodedPath = base64url(path)
  { path, brandId?, type?, title?, description?, keywords[]?, canonical?, image?,
    og:{ type?, publishedTime?, modifiedTime?, authors[]?, tags[]? }?,
    twitter:{ title?, description?, card? }?,
    robots:{ index?, follow?, maxSnippet?, maxImagePreview? }?,
    sitemap:{ include?:bool, priority?, changeFreq? }?,
    schema[]?,                                   // structured-data overrides
    indexing:{ status?, lastSubmitted?, lastCrawled?, coverageState? }?,  // Phase 2 tracking
    enabled, version, updatedAt, updatedBy }

projects/altftool/seo/redirects/{redirectId}      (Phase 3)
  { source, destination, type:301|302, enabled, hits, note, version, updatedAt, updatedBy }

projects/altftool/seo/audit/{autoId}              (config change history; complements admin audit log)
  { entityRef, before, after, actorUid, actorEmail, at }

projects/altftool/seo/health/{snapshotId}         (Phase 4)
  { generatedAt, scope, metrics:{ missingTitles, missingDescriptions, duplicateCanonicals,
    noindexCount, orphanRedirects, sitemapCount }, findings[] }
```

### 5.2 Indexes (`firestore.indexes.json`)

- `seo/rules` — composite `enabled ASC, order ASC`.
- `seo/redirects` — `enabled ASC, source ASC`.
- `seo/pages` — `enabled ASC, type ASC, updatedAt DESC` (admin listing/filtering).
- `seo/audit` — `entityRef ASC, at DESC`.

### 5.3 Rules (`firestore.rules`)

Add a tighter block (current `projects/altftool/{document=**}` already gives public-read/admin-write; we narrow writes with validation):

```
match /projects/altftool/seo/{document=**} {
  allow read: if true;                                  // public read (web app REST)
  allow write: if isActiveAdmin()                       // existing helper
               && request.resource.data.version is int; // minimal server-trust invariant
}
```

Authoritative validation happens in the admin API (Zod); rules are the backstop.

---

## 6. API Design

### 6.1 Admin API (`altftoolwebadmin/src/app/api/seo/**`) — follows the 32-route convention

| Method & path | Purpose | Auth |
|---|---|---|
| `GET /api/seo/config?scope=global\|brands\|types\|rules` | Load config sections for the editor | `verifyActiveAdmin` |
| `PUT /api/seo/config/{scope}/{id?}` | Upsert a config doc (Zod-validated) | `verifyActiveAdmin` |
| `GET /api/seo/pages?type=&q=&cursor=` | Paginated per-page overrides | `verifyActiveAdmin` |
| `PUT /api/seo/pages/{encodedPath}` | Upsert per-page override | `verifyActiveAdmin` |
| `POST /api/seo/preview` | Server-side resolve → returns effective metadata for a path (no write) | `verifyActiveAdmin` |
| `POST /api/seo/revalidate` | Trigger `revalidateTag`/`revalidatePath` on the web app | `verifyActiveAdmin` |
| `GET/PUT/DELETE /api/seo/redirects/*` | Redirect manager (Phase 3) | `verifyActiveAdmin` |
| `POST /api/seo/health/run` | Generate a health snapshot (Phase 4) | `verifySuperAdmin` |
| `POST /api/seo/recommendations` | AI suggestions (Phase 5) | `verifyActiveAdmin` |

Every mutating route: `enforceRateLimit` → auth → **Zod validate** → `adminDb` upsert with `version++` + `serverTimestamp` → `writeAdminAuditLog` → revalidation trigger → `NextResponse.json`. Standard 400/401/403/404/409/500 semantics.

### 6.2 Web read API (`altftoolweb`)

- `src/platform/seo/seoConfigSource.js` — `loadSeoConfig()` reads `projects/altftool/seo/**` via Firestore REST (`next: { revalidate, tags: ['seo-config'] }`), in-memory `Map` cache + `AbortController` timeout + static fallback. Mirrors `firebaseBlogs.js` exactly.
- `resolveSeo({ pageType, path, brandId?, entity? })` — pure function applying the §4.2 precedence; fully unit-testable, no I/O.
- Consumed inside `createPageMetadata` (defaults under caller args), `sitemap.js`, `robots.js`, and (Phase 3) `proxy.js`.

### 6.3 Cross-app revalidation contract

Admin `POST /api/seo/revalidate` → calls a protected web endpoint `altftoolweb/src/app/api/revalidate/route.js` (shared secret `CRON_SECRET`/`REVALIDATE_SECRET`) → `revalidateTag('seo-config')` (+ `revalidatePath` for specific routes). Gives **near-instant, no-deploy propagation**.

### 6.4 Type-safe contracts

Define Zod schemas in `packages/core/src/seo/schemas.js` (shared by both apps). Export inferred JSDoc/`.d.ts` typedefs. This satisfies "type-safe implementation" in a JS codebase: runtime validation at the trust boundary + static types for editors.

---

## 7. SSR / SSG / ISR / Dynamic-Route Compatibility

- **Server-side only:** all SEO output (`createPageMetadata`, sitemap, robots) is generated on the server — canonical/robots/OG reliability preserved (requirement 6).
- **SSG/`generateStaticParams` routes** (tools categories, etc.): config is read at build/revalidate; on-demand `revalidateTag('seo-config')` refreshes them without redeploy.
- **ISR pages** (`revalidate = 3600`): unchanged; add the `seo-config` tag so admin saves can force-refresh.
- **Dynamic SSR routes** (`[slug]`, news, blogs detail): read config per request through the cached source.
- **Edge/runtime redirects** (Phase 3): `proxy.js` reads the redirect map (cached) at request time.
- **Fallback guarantee:** if config is unavailable, every path returns today's inline values — no throw, no blank metadata.

---

## 8. Security Considerations

- **Writes are authenticated, audited, rate-limited, and validated** at the API layer (`verifyActiveAdmin` + Zod + `writeAdminAuditLog` + `enforceRateLimit`). The known "no server guard on `(protected)`" gap is mitigated because trust is enforced at the API/Firestore-rules layer, not route placement.
- **Firestore rules** backstop writes (`isActiveAdmin()` + version invariant); reads are public (config is non-sensitive — it becomes public HTML).
- **Guardrails for dangerous ops:** site-wide `noindex`, global canonical changes, and bulk redirects require explicit confirmation + are flagged in the audit log; consider superadmin-only for global scope.
- **Revalidation endpoint** protected by shared secret; rate-limited.
- **No secrets in SEO config.** Keep API keys out (the public REST read means anything stored is world-readable).
- **Versioning + rollback:** every doc carries `version` + audit history for one-click revert of a bad change.

---

## 9. Scalability Considerations

- **Read path is O(small):** a bounded set of config docs (`global`, brands, types, rules) + at most one `pages/<path>` doc per render, all cached in-memory and at the ISR layer. No N+1.
- **`pages` collection** can grow large; admin listing is indexed + cursor-paginated; the web read fetches a single doc by deterministic key (`base64url(path)`), not a query.
- **Rules evaluation** is bounded (ordered, small N) and cached.
- **Sitemap** already aggregates live collections; engine adds inclusion/priority lookups from cached config, not per-URL Firestore reads.
- **Caching tiers:** in-memory Map (per instance) → ISR (`revalidate` + tags) → Firestore. On-demand revalidation avoids long staleness without hammering Firestore.
- **Multi-project ready:** schema is namespaced under `projects/altftool/**`; the same module generalizes to `leadtree` and future projects.

---

## 10. Migration Strategy (zero-regression)

1. **Ship inert.** Land `resolveSeo` + `seoConfigSource` with empty config behind `ALTFT_SEO_ENGINE_ENABLED=false`. Output is byte-identical to today.
2. **Golden snapshots.** Capture current metadata (title/desc/canonical/OG/robots) + sitemap + robots for a representative route set (tool, blog detail, blog taxonomy, news, news-topic, policy, brand, white-label). These are the regression gate.
3. **Backfill.** A script reads existing inline metadata (`toolContentOverrides`, blog data, news, `siteConfig`, sitemap `staticRoutes`) and writes equivalent `seo/*` docs. Engine ON must reproduce the golden snapshots.
4. **Fix-forward the known gaps** (only after parity): policy-page canonicals (currently `/`), white-label brand profiles, blog article-OG block, `"use client"` detail routes (via server layout wrappers).
5. **Enable progressively** per page-type behind the flag; monitor GSC + the Phase 4 health dashboard.
6. **Redirect consolidation** (Phase 3): migrate `proxy.js` `REDIRECTS_MAP` + safe `next.config.mjs` redirects into the engine; keep build-time redirects only for structural invariants.

Rollback at any point = flip the flag (engine becomes inert) or revert a config version.

---

## 11. Engineering Standards (SDE-2)

- **Modular:** `packages/core/src/seo/` (schemas + resolver, shared) · `altftoolweb/src/platform/seo/` (read + apply) · `altftoolwebadmin/.../modules/seo/` (UI) · `altftoolwebadmin/src/app/api/seo/` (control plane). Clear separation: resolver is pure; I/O is isolated; UI never talks to Firestore directly (goes through the API).
- **Type-safe:** Zod contracts + inferred typedefs; validation at every boundary.
- **Backward compatible:** code-level page args always win; empty config = current behavior.
- **No SEO regressions:** golden-snapshot gate + feature flag + staged rollout.
- **Maintainable:** follows existing module/API/service conventions exactly (no new paradigms); fully audited and versioned.
- **Tested:** unit tests for `resolveSeo` precedence; snapshot tests for metadata; API contract tests; rules tests via the Firestore emulator (already configured).

---

## 12. Phased Roadmap

Each phase is independently shippable and leaves the platform in a better, regression-free state.

### Phase 1 — SEO Management Core
**Goal:** central management of title, description, keywords, canonical, OG, Twitter, robots; inheritance + per-page override; server-rendered.
- `packages/core/src/seo/{schemas,resolver}.js`; `altftoolweb/src/platform/seo/seoConfigSource.js`; wire `resolveSeo` into `createPageMetadata`.
- Admin `seo` module (global/brands/types/pages editors) + `/api/seo/config`, `/api/seo/pages`, `/api/seo/preview`, `/api/seo/revalidate`.
- Firestore rules + indexes; backfill script; golden-snapshot tests; feature flag.
- **Fixes shipped:** policy-page canonicals, white-label brand profiles, blog article-OG block.
- **Acceptance:** engine ON reproduces golden snapshots; editing a page's title in admin updates production HTML within seconds (no deploy); policy pages get correct canonicals.

### Phase 2 — Indexing & Sitemap Control
**Goal:** manage sitemap inclusion/exclusion, priority, changefreq; track Google indexing status & URL inspection.
- Config-drive `sitemap.js` + `robots.js`; admin sitemap manager (toggle include, set priority/changefreq per type/path).
- Indexing tracking store (`seo/pages.indexing`); optional **Google Search Console API** integration (URL Inspection, coverage) behind a service account; manual status entry as fallback (matches the existing "Google Indexing" tracker sheet).
- **Acceptance:** admins control sitemap membership without code; indexing status visible per URL.

### Phase 3 — Redirect Manager
**Goal:** manage 301/302 redirects without deploys; consolidate the two existing redirect systems.
- `seo/redirects` collection + admin CRUD; `proxy.js` reads the cached redirect map at runtime; hit counters; loop/duplicate detection.
- Migrate `proxy.js` `REDIRECTS_MAP` and safe `next.config.mjs` redirects into the engine.
- **Acceptance:** add/edit/disable a redirect from admin, live in seconds; no redirect chains/loops.

### Phase 4 — SEO Analytics Dashboard
**Goal:** health monitoring & coverage.
- `POST /api/seo/health/run` scans config + routes for missing titles/descriptions, duplicate canonicals, accidental noindex, orphan redirects, sitemap drift; stores snapshots; admin dashboard (recharts) + trends.
- Optional GSC/PageSpeed signals (the repo already has a PageSpeed API route pattern).
- **Acceptance:** dashboard surfaces actionable SEO issues with history.

### Phase 5 — AI-Powered SEO Recommendations
**Goal:** suggest titles/descriptions/keywords/schema from page content.
- `POST /api/seo/recommendations` (reuses existing AI route patterns — gemini/openai routes already present) generates suggestions; admin one-click apply (writes a `pages` override, audited).
- Guardrails: suggestions are drafts; never auto-publish global/noindex changes.
- **Acceptance:** admin gets quality suggestions and can apply them safely.

---

## 13. Open Decisions / Approvals Needed

Please confirm before Phase 1 implementation:

1. **Storage location** — `projects/altftool/seo/**` in the existing Firestore (recommended), vs a new top-level collection. *Recommend: existing tree (reuses rules/REST/precedent).*
2. **Write path** — authenticated admin **API route** with audit + Zod (recommended) vs direct client-SDK writes. *Recommend: API route.*
3. **Validation library** — add **Zod** to `packages/core` (recommended) vs hand-rolled validators. *Recommend: Zod.*
4. **Revalidation** — add on-demand `revalidateTag` web endpoint + secret (recommended) vs rely on time-based ISR only. *Recommend: on-demand.*
5. **Scope gating** — global/brand changes superadmin-only; per-page overrides for all active admins. *Confirm RBAC.*
6. **GSC API integration** (Phase 2) — provision a Search Console service account, or start with manual indexing-status entry? *Recommend: manual first, API later.*
7. **Phase ordering** — proceed Phase 1 → 5 as written, or reprioritize (e.g. redirects earlier)?

---

## 14. Appendix — Key File References

**Web (altftoolweb):** `src/platform/seo/generateMetadata.js`, `src/platform/seo/JsonLd.jsx`, `src/app/layout.jsx`, `src/app/robots.js`, `src/app/sitemap.js`, `src/proxy.js`, `src/app/[slug]/page.jsx`, `src/app/blogs/data/firebaseBlogs.js`, `src/app/tools/{toolRouteUtils,toolSeoContent,toolContentOverrides}.js`, `src/platform/registry/toolMetaMap.js`.

**Admin (altftoolwebadmin):** `src/projects/altftool/config.js`, `src/projects/altftool/modules/dynamic/service/dynamic.service.js`, `src/projects/altftool/modules/blogs/services/blogsService.js`, `src/lib/{firebaseAdmin,serverAdminAuth,adminAccess,syncAdminClaims,adminAuditLog,adminModuleLoaders}.js`, `src/app/api/admin/*/route.js`, `src/config/adminRoutes.js`.

**Root:** `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `SEO_AUDIT_REPORT.md`, `BACKEND_AUTH_AUDIT_REPORT.md`, `ARCHITECTURE_CODE_MAP.md`, `SECURITY_AUDIT.md`, `packages/core/src/{http,cache,env}.js`.

---

*End of analysis. No code has been written. Awaiting approval of §13 before beginning Phase 1.*
