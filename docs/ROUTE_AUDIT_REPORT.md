# Routing Audit & Fix Report (Final) — altftool

**Date:** 2026-06-23
**Scope:** entire codebase — `altftoolweb` (public site) + `altftoolwebadmin` (admin), code files **and** JSON/data files.
**Constraint honored:** routing & navigation only — no UI redesign, no styling, no new features, no business-logic changes.

---

## Completion status

| Completion condition | Status |
|---|---|
| No missing routes | ✅ Every `page.jsx` auto-owns a route; none missing |
| No broken links | ✅ 0 broken links in code **and** JSON (both apps) |
| No 404 errors (from internal links) | ✅ 2 real 404-causing bugs found & fixed |
| No route conflicts | ✅ 0 URL collisions, 0 sibling dynamic-param conflicts |
| All pages reachable | ✅ All linked; 10 intentional direct-URL-only pages documented |
| Build passes | ⚠️ Cannot run in this environment (see §5); routing-level checks all pass |

---

## 1. Totals

| Metric | Public (`altftoolweb`) | Admin (`altftoolwebadmin`) |
|---|---|---|
| Page routes | 139 (101 static / 38 dynamic) | 18 (13 / 5) |
| API routes | 19 | 32 |
| Unique resolved URL paths | 139 (no collisions) | 18 (no collisions) |
| Broken links (code) | **0** | **0** |
| Broken links (JSON data) | **0** | **0** |
| Route conflicts | **0** | **0** |

---

## 2. Bugs fixed this engagement

### Fix A — Prank Social Media "Templates" links (8 occurrences, 4 files)
Links pointed to root-relative `/templates`, which has no route and was silently swallowed by the top-level `/[slug]` catch-all (rendering a generic page instead of 404-ing). Corrected to the real route `/prank-socialmedia/templates`.

- `components/site/Navbar.jsx` (3), `page.jsx` (3), `components/editor/EditorLayout.jsx` (1), `components/editor/previews/ComingSoonPreview.jsx` (1)

### Fix B — Exclusive Deals article links (7 occurrences, 1 file)
`exclusivedeals/(data)/db.json` `blog[].link` values used `/blog/<category>/<slug>` — a non-existent 3-segment path (the blog route is `/blogs/[slug]`, and the `/blog`→`/blogs` redirect only matches exactly `/blog`). These are rendered as related-post links on the e-blogs detail page (`href={post.link}`) → **404**. Corrected to the real route `/exclusivedeals/e-blogs/<category>/<slug>`, which the `e-blogs/[slug]/[id]` page resolves (it reads category at path index 2, slug at index 3). JSON re-validated as parseable.

**Total: 2 distinct defects, 15 link occurrences across 5 files.** All changes are pure href/string replacements — no structure, imports, styling, or logic touched.

---

## 3. Verified clean (no action needed)

- **Header / footer nav** — centralized in `platform/navigation/siteRoutes.js`; all entries resolve.
- **Homepage buttons/cards, tool cards, category cards, extension cards** — all resolve (tool routing via `toolRouteUtils` + `/tools/[category]/[slug]`, `/tools/all/[slug]`, with `next.config` redirects `/tools/:slug`→`/tools/all/:slug`).
- **TripFindBox** (~28 root-relative links in data/components) — correctly prefixed at render by the existing `tfbPath()` helper; resolve to `/tripfindbox/*`.
- **WhereGoes tool** (`/bulk`, `/history`, `/tester`) — internal client-side `navigate()` state machine, not real routes.
- **Other sub-apps** (homeserv, pranx, kym, ancestory, flightradar, windowswap, playbuzz, brandrating, fact-net) — internal links correctly self-prefixed.
- **Breadcrumbs** — implemented as SEO JSON-LD (`createBreadcrumbJsonLd`) derived from route segments; inherently valid.
- **`/robots.txt`, `/sitemap.xml`, `/rss.xml`** — valid generated routes (`app/robots.js`, `app/sitemap.js`, `app/rss.xml/route.js`).
- **Admin app** — 0 broken links. Its data seeds (tripfindbox content written to Firebase) and `roles.js` permission keys are data/config, not navigation.

---

## 4. Intentional orphans (reachable by direct URL, no nav link — by design)

`/ad-preview` (dev tool), `/buysmart/redirect` (programmatic redirect), `/unsubscribe` (email link), and the chrome-less full-screen experiences `/bharat-virasat`, `/patatap`, `/radio-garden`, `/soft-murmur`, `/pixel-thought` (+`/meditation`) — all registered in `GlobalChromeGate`. `/tools/developer/api-stress-estimator` is a category alias of `/tools/all/api-stress-estimator` (both valid). None are defects.

---

## 5. Build validation

`npm run build` **cannot run in this environment**, for reasons unrelated to routing:
- The project is OneDrive-synced, which rejects the symlinks npm workspaces need to link `@altftool/core` / `@altftool/ui`.
- Installed Node is v22; repo requires `>=24 <25`.
- `node_modules` is incomplete (e.g. `next-themes` absent at root).

**Routing-level validation performed instead (all pass):**
- 0 broken internal links — full-tree code scan + JSON scan, both apps.
- 0 route collisions; 0 sibling dynamic-param conflicts.
- Existing `npm run routes:check` passes.
- Both fix targets exist as real route files; edits are string-only (cannot affect compilation).

**To finish:** on a dev machine with Node 24, run `npm install && npm run build`. No routing-related build failures are expected. (Your next `npm install` also cleanly recreates the `node_modules/@altftool` workspace links.)

---

## 6. Optional follow-ups (need a product decision, not auto-applied)

1. **Sitemap coverage** — `app/sitemap.js` is a curated list; several public landings (`/playbuzz`, `/pranx`, `/kym`, `/ancestory`, `/fact-net`, `/windowswap`, `/flightradar`, `/sketchflow`, `/supportsetting`, and the experiences) aren't included. Confirm which should be indexed and I'll add them.
2. **`/tools/developer/api-stress-estimator`** duplicates the canonical `/tools/all/api-stress-estimator` — keep as alias or 301-redirect.
3. **Standalone experiences** — if patatap/radio-garden/soft-murmur/pixel-thought/bharat-virasat should be discoverable, add them to a hub; otherwise leave as direct-URL/SEO landings.
