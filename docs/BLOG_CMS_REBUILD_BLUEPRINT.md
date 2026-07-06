# AltFTool Blog CMS — Audit & First-Principles Rebuild Blueprint

> Staff/SDE-3 engineering plan to transform `/blogs`, `/add-blogs`, `/edit-blog`, `/quality`, `/analytics`, `/bulk-refresh` into a **content-team-first, SEO-first editorial platform** (Notion/Sanity/Contentful/Gutenberg-class), while preserving backward compatibility and the `master.md` design system.

**Scope audited:** admin module `altftoolwebadmin/src/projects/altftool/modules/blogs/**`, blog APIs (`api/blogs/*`, `api/admin/blogs/export`), `blogsService.js`, `firestore.rules`, `firestore.indexes.json`, and the public renderer `altftoolweb/src/app/blogs/**` + `src/platform/seo/*`.

---

## 1. Executive summary

The CMS is **feature-rich but engineer-shaped**. It has a deep SEO/quality engine and an excellent public-site SEO output, but the authoring workflow is technical, fragmented across many panels, and missing the editorial primitives a content team expects (review states, scheduling, version history UI, save parity, sticky publish actions). The fastest path to "content-team-first" is **not** rebuilding the SEO output (it's already strong) — it's **re-architecting the authoring workflow, information architecture, and the three dashboards**, plus closing a short list of real SEO gaps.

**Verdict by area**

| Area | State | Headline |
|---|---|---|
| Blog list `/blogs` | ✅ Rebuilt (Phase 0) | Global search, CSV/XLSX export, clickable rows, filters, responsive, tokenized |
| Editor `/add-blogs` `/edit-blog` | ⚠️ Rich but fragmented | No review/scheduled states, save/auto-save parity gap, no version-history UI, not sticky, no shortcuts, duplicated logic, hardcoded colors |
| Quality `/quality` | ⚠️ Strong engine, weak UX | 17-point checklist + link graph + one-click fixes exist; OG/Twitter/CWV/orphan/duplicate checks missing; hardcoded colors |
| Analytics `/analytics` | ⚠️ Static, Firestore-only | No GA4/GSC, no time-series/trends, no drill-down; 49+ hardcoded colors; full-dataset in-memory |
| Bulk Refresh `/bulk-refresh` | ❌ Not actually bulk | Per-post manual editing, no batch API, no progress/logs, partial rollback, no rate limiting |
| Data model / rules | ⚠️ Solid base | Good indexes (status+createdAt, status+category+createdAt); no slug-uniqueness constraint; no author/tag indexes; status limited to draft/published |
| Public SEO output | ✅ Strong | metadata, canonical, robots, OG, Twitter, JSON-LD (BlogPosting/Breadcrumb/FAQ/HowTo/ItemList), sitemap, robots.txt, internal links, ISR all present |

---

## 2. Detailed audit findings

### 2.1 Editor (`add-blogs` 1127 lines, `edit-blog` 980 lines, ~20 components)

**Exists:** logical content sections (Post details, Trust metadata, Sources & review, CTA/FAQ pickers, Templates, Content blocks, Content, SEO settings); jump-to/highlight on validation; inline live preview (`BlogLivePreview`) + optional modal preview (flagged `blog_preview`); a comprehensive publish gate (`BlogPublishQualityGate`, 8+ blockers + warnings); duplicate slug/title guard; CKEditor with textarea fallback; rich field set (heading, slug, author, authorRole, reviewedBy, editorialNote, reviewedAt, date, description, excerpt, seoTitle, seoDescription, image, imageAlt, tags, sources, sourceNotes, status, engagement counters).

**Partial:** version history (rollback collection `blogQualityRollbacks` exists in service but **no editor UI**); SEO section collapsible but **not sticky**.

**Missing:** Review / SEO-validation / Scheduled states (only `draft`/`published`); **scheduling** (publish-at); **auto-save parity** (add-blogs autosaves to localStorage every 2s; edit-blog has **none** and no unsaved-changes guard); **keyboard shortcuts**; real-time slug-collision warning while typing.

**Debt:** `generateSlug()` redefined in 5 places; `stripHtml()`/`cleanText()` duplicated; hardcoded colors in progress bars, banners, SEO status, CTA picker.

### 2.2 Quality (`quality/page.jsx` 1821 lines + engine)

**Implemented checks:** title/meta length (50–60), meta description (120–160), slug validation (8–75, hyphenated), content depth (≥250/300 words), headings (≥2 H2/H3), intro/paragraph readability, image presence + alt (5–125), internal-link count + health (broken/weak-anchor/self-link auto-fix), internal-link suggestions (graph-aware), trust signals (author/reviewer/editorial), review freshness (≥90d stale), JSON-LD detection (BlogPosting/Breadcrumb/FAQ) via runtime-QA fetch of the live URL, schema preview + copy. **One-click fixes:** link cleanup, weak-anchor rewrite, internal-link plan injection, content-health bulk routing — all preview-before-apply.

**Missing:** Open Graph / Twitter validation; Core Web Vitals (no LCP/CLS/INP); orphan-page pre-publish gate; duplicate-content detection (no body hash/similarity); sitemap-inclusion/index-readiness scoring beyond noindex detection; URL-consistency check beyond slug format.

### 2.3 Analytics (`analytics/page.jsx`)

**Source:** `fetchAllBlogs()` once, then ~523 lines of in-memory `useMemo`. Metrics = Firestore fields only (`views`, `likesCount`, `commentsCount`, `toolClickCount`, `helpful/notHelpful`, computed quality/schema scores, freshness). Visuals: publishing cadence, category/tag bars, top-engagement list, CTA leaders, quality attention queue.

**Missing:** GA4 / Search Console (no impressions, CTR, queries, sessions, bounce); time-series trends; benchmarks/quartiles; anomaly/decay detection; drill-down; scheduled report export. **Debt:** 49+ hardcoded colors; full-dataset client aggregation.

### 2.4 Bulk Refresh (`bulk-refresh/page.jsx`)

Reality: a **selection/queue UI that deep-links to per-post editing** — there is **no bulk write**. Refresh "actions" build field/block payloads (`blogRefreshKit.js`) applied one blog at a time. Filters by status/gap/category/search; "select top 25" cap. **Missing:** batch API, progress/queue status, logs, dry-run, full rollback (only `description` is reversible; `seoTitle`/`seoDescription`/`tags`/trust fields are one-way), rate limiting on writes; `bulkDeleteBlogs` fires unbatched `Promise.all`.

### 2.5 Data model & rules

Collections: `projects/altftool/blogs` (+ `comments`, `views` subcollections), `categories`, `blogQualityRollbacks`. Indexes: `status+createdAt`, `status+category+createdAt` (collection scope) — good for the admin list. Rules: public read; engagement-only client updates; create/delete gated by `isActiveAdmin()`; rollbacks server-only. **Gaps:** no slug-uniqueness enforcement (app-layer only), no author/tag indexes, status vocabulary limited to draft/published.

### 2.6 Public SEO output — already strong (do not rebuild)

`generateMetadata.js` + `blogs/[slug]/page.jsx` produce per-article title/description, canonical (apex domain), robots (noindex for thin archives), OG (with article published/modified/author/tags), Twitter `summary_large_image`, and JSON-LD (BlogPosting w/ author, citations, engagement; Breadcrumb; FAQ; HowTo; ItemList). `sitemap.js` includes blogs + categories + tags + authors + topics (incl. up to 500 live Firebase blogs); `robots.js` references the sitemap; `next/image` with alt + priority on hero; sophisticated internal-linking (`internalLinks.js`); ISR `revalidate=3600`. **Minor gaps:** on-edit on-demand revalidation (`revalidateTag`) not wired; inline-image alt coverage not audited; no breadcrumb JSON-LD on category/tag/author; no slug-uniqueness DB guard; CWV not monitored.

---

## 3. First-principles target architecture

### 3.1 Information architecture & navigation (reduce clicks)

Replace the scattered top-bar links with a single **Blog workspace shell**:

```
Blog
├─ Content        ← unified list (all statuses) = today's /blogs (Phase 0)
├─ Editor         ← create/edit (one component, id-aware)
├─ Insights       ← Analytics (actionable)
├─ SEO Health     ← Quality (actionable, one-click)
└─ Operations     ← Bulk Refresh (real batch jobs + logs)
```

One persistent left rail (collapsible, icon-only on mobile), one sticky page header per view with the **single primary action** for that view (`master.md`: one primary action per view). Every list row/card → Editor (already shipped in Phase 0). Breadcrumb: `Blog / {Section} / {Title}`.

### 3.2 Editorial workflow state machine (backward compatible)

Introduce a `workflowState` field **without breaking the existing `status`**:

```
draft → in_review → seo_validation → scheduled → published
                 ↘ (changes_requested) ↩            ↘ (unpublish) → draft
```

- Keep `status ∈ {draft, published}` as the **public-facing** field (rules + renderer unchanged). `workflowState` is admin-only metadata; `published` ⇔ `status==="published"`.
- Add `publishAt` (Timestamp) for scheduling; a scheduled blog stays `status:"draft"` until a Cloud Function/cron flips it to `published` at `publishAt` (or on next ISR with a server check). Backward compatible: absent `workflowState` ⇒ treat as `draft`/`published` by `status`.
- Add `reviewers[]`, `reviewNotes[]`, `seoValidatedAt`, `seoValidatedBy` for the Review/SEO gates.

### 3.3 Version history (promote the existing mechanism)

Generalize `blogQualityRollbacks` → `blogRevisions` capturing **full snapshots** (not just `description`) on every save: `{blogId, snapshot, author, reason, createdAt}`. Editor gets a **History drawer**: list revisions, diff against current, restore (writes a new revision). Reuse `applyBlogDescriptionWithRollback` pattern (write-before-mutate, server-only read).

### 3.4 Data-model additions (all optional/defaulted ⇒ backward compatible)

`workflowState`, `publishAt`, `seoValidatedAt/By`, `reviewers[]`, `revisionCount`, `ogTitle/ogDescription/ogImage` (override OG), `twitterTitle/Description`, `canonicalOverride`, `noindex` (per-post). New indexes: `workflowState+updatedAt`, `author+createdAt`, plus a `slugLower` field + app-layer uniqueness check (and a `blogSlugs/{slug}` guard doc enforced by rules).

---

## 4. Editor redesign spec

- **Three-pane, responsive shell:** left = content canvas (grouped sections, collapsible, drag-free); right = **sticky utility rail** with tabs — SEO, Checklist, Preview, History, Settings (sticky on desktop, bottom-sheet on mobile); top = sticky action bar (status pill, Save state, `Save`, `Preview`, primary `Publish/Schedule/Request review`).
- **Auto-save everywhere:** debounced (1–2s) local draft + explicit server save; identical in create and edit; "Saved • 12:04" indicator; `beforeunload` guard on dirty state. Server autosave writes to a `draft` revision, never to the live published doc until Publish.
- **Workflow actions:** primary button is contextual to `workflowState` (Draft→"Request review", In review→"Approve & validate SEO", SEO ok→"Schedule"/"Publish now"). Secondary menu for unpublish/duplicate/delete.
- **Sticky SEO panel:** live title/description length meters, slug editor with **real-time collision check**, OG/Twitter override + live SERP/social preview, canonical + noindex toggles, schema preview. Pulls from existing `BlogSeoChecklist`/`blogSeoHealth`.
- **Live preview:** inline split-view (desktop) + device-frame modal; reuse `BlogLivePreview`/`BlogPreviewModal`, unify behind one component.
- **Keyboard shortcuts:** `⌘S` save, `⌘↵` publish/primary, `⌘K` command palette (jump to section/insert block), `⌘P` preview, `⌘/` shortcut help. Honor `prefers-reduced-motion`, full focus management.
- **Dedup:** extract `@/projects/altftool/modules/blogs/lib/slug.js`, `lib/html.js` (strip/wordcount), `lib/blogSchema.js` — single source for slug/strip/tag parsing used by editor, list, quality, export.

---

## 5. Dashboard redesigns

### 5.1 SEO Health (`/quality`)
Actionable board: top KPIs (avg score, % publish-ready, # blockers), a prioritized **work queue** (sortable by impact = gap weight × views × status), each row with inline one-click fixes (already exist) + **bulk apply** to selected. Add the missing checks: **OG/Twitter presence**, **orphan-page** (zero inbound from link graph) pre-publish gate, **duplicate-content** (normalized body shingle/hash similarity), **index-readiness** score (canonical + noindex + sitemap presence + schema valid). Surface runtime-QA per URL with re-run.

### 5.2 Insights (`/analytics`)
Keep Firestore engagement, **add GA4 + Search Console connectors** (impressions, clicks, CTR, position, top queries) behind a feature flag with graceful empty-states. Add **time-series** (views/clicks over 30/90d), **decay detection** (downward 28-day slope), **benchmarks** (quartiles by category), and **drill-down** (category → posts). Move aggregation to a memoized selector layer; paginate/virtualize long lists.

### 5.3 Operations (`/bulk-refresh`)
Turn into a **real batch engine**: select → choose action (SEO pack / FAQ / sources / links / mark-reviewed) → **dry-run preview** → run as a tracked job. New API `POST /api/admin/blogs/bulk` using Firestore **batched writes (≤500/commit)** + per-item result, a `blogBulkJobs/{id}` progress doc (queued/running/done/failed counts), live progress bar, downloadable **log**, and **full rollback** via `blogRevisions`. Rate-limit + concurrency cap server-side.

---

## 6. SEO blocker remediation (grounded)

**Already correct (verify only):** metadata, canonical, robots, OG, Twitter, JSON-LD (BlogPosting/Breadcrumb/FAQ/HowTo/ItemList), sitemap (blogs/categories/tags/authors/topics), robots.txt, internal linking, image alt on hero, ISR.

**Real fixes to implement:**
1. **Slug uniqueness** — `slugLower` + `blogSlugs/{slug}` guard doc + rule + editor real-time check (prevents duplicate-URL/canonical conflicts).
2. **On-edit revalidation** — call `revalidateTag('blog:'+slug)` (+ sitemap) on publish/update so changes go live without the 1h wait.
3. **OG/Twitter validation** in the editor SEO panel + Quality (presence/length/image dims).
4. **Inline-image alt audit** — scan `description` HTML for `<img>` missing `alt`; block/ warn pre-publish.
5. **Orphan + duplicate** detection in Quality (link-graph inbound = 0; body similarity).
6. **Breadcrumb JSON-LD** on category/tag/author routes.
7. **Core Web Vitals** — wire Vercel/RUM reporting; surface LCP/CLS/INP per template in Insights.

---

## 7. Responsive, accessibility & design-system conformance

- Every page/modal/table/form/editor/dashboard rebuilt on `master.md` **semantic tokens** (`bg-surface`, `text-foreground`, `bg-primary`, …) — light **and** dark — replacing the 100+ hardcoded `blue/gray/green/...-NNN` classes found across editor/quality/analytics.
- Breakpoints: mobile (cards/bottom-sheets), tablet (2-col), laptop/desktop (3-pane), ultrawide (max-width container, no stretched line lengths). Tap targets ≥44px; tables → cards on mobile (pattern already shipped in Phase 0 `BlogTable`).
- WCAG 2.1 AA: focus rings, keyboard operability, `aria` on dialogs/menus, `prefers-reduced-motion`, color-contrast via tokens.

---

## 8. Performance, maintainability, APIs

- **Reads:** single cached `fetchAllBlogsCached` (shipped) shared by list/stats/analytics/quality; invalidate on writes. Move heavy aggregation into pure selector modules (testable, memoized).
- **Writes:** batched (`writeBatch`, ≤500) for bulk + delete; replace unbatched `Promise.all`.
- **APIs:** keep existing streaming export (CSV/JSON) as server fallback; add `bulk` + `revisions` endpoints with admin auth + rate-limit (reuse `enforceRateLimit`). 
- **Dedup:** shared `lib/` for slug/html/schema/tags; one preview component; one SEO-score source.
- **Tests:** unit-test slug/uniqueness, export (CSV+XLSX), workflow transitions, bulk batching; keep `next build --webpack` green.

---

## 9. Phased delivery plan (backward-compatible, shippable increments)

| Phase | Outcome | Risk | Status |
|---|---|---|---|
| **0 — List & Export** | Global search fixed (fetch-all + cross-field), CSV/**XLSX** export by date range, clickable rows→editor, filters, responsive, tokenized, no-dup stats | Low | ✅ **Shipped** |
| **1 — Editor workflow** | Workflow states + scheduling, auto-save parity + unsaved guard, sticky action bar + SEO rail, version-history drawer, keyboard shortcuts, slug real-time check, dedup `lib/` | Med | Proposed next |
| **2 — SEO Health** | Actionable queue + bulk-apply, OG/Twitter/orphan/duplicate/index-readiness checks, breadcrumb JSON-LD on archives, inline-alt audit | Med | Proposed |
| **3 — Operations** | Real batch API + job progress/logs/rollback, dry-run, rate limits | Med | Proposed |
| **4 — Insights** | GA4/GSC connectors (flagged), time-series, decay, benchmarks, drill-down | Med-High | Proposed |
| **5 — SEO infra** | slug-uniqueness guard + rule, on-edit revalidation, CWV RUM | Low-Med | Proposed |

**Guarantees:** every phase keeps `status`/rules/public renderer working; new fields default-absent; SEO engine stays gated; build with `next build --webpack`.

---

## 10. Risks & notes

- The sandbox cannot run `next build --webpack` (SWC "Bus error"), so admin changes are validated by parser + targeted logic/unit tests here and **must be built locally** before ship.
- GA4/GSC require credentials/connectors → feature-flagged with empty states.
- Scheduling needs a Cloud Function/cron (or ISR-time server check) to flip `status` at `publishAt`.
- Status-model change is additive; a one-time backfill sets `workflowState` from existing `status`.

---

*Phase 0 is already merged in this branch (list/search/export/responsive/tokens). Recommend Phase 1 (Editor) next — highest content-team impact.*
