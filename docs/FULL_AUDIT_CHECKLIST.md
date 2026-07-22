# AltFTool Full Audit Checklist

Last updated: 2026-06-12

Use this checklist when the goal is to verify the full AltFTool product, not just one page. It covers the public web app, admin app, Firebase data, API routes, performance, security, and release readiness.

## Product Story

AltFTool has two production apps in one repository:

- `altftoolweb` serves the public site, tools catalog, tool workspaces, blogs, BuySmart, deals, extensions, brand ratings, news, SEO routes, and public APIs.
- `altftoolwebadmin` serves the authenticated admin workspace for content, BuySmart, deals, blogs, notifications, support, analytics, route health, and release reports.

The intended flow is:

```text
Public/admin route -> thin App Router page -> registry or feature module -> shared core contract -> Firebase/API/provider -> loading/error/empty-aware UI
```

## What Must Be Checked

| Area | What to verify | Primary commands |
| --- | --- | --- |
| Route inventory | Public/admin routes exist, canonical redirects work, loading shells exist | `npm run routes:check`, `npm run test:route-loading` |
| Route runtime | HTTP status, browser probes, console errors, mobile overflow, slow routes | `npm run qa:routes:strict` |
| Public Firebase | Blogs, BuySmart, extensions, academy, videos, ratings can be read safely | `npm run firebase:live-check`, `npm run firebase:integrity` |
| Admin Firebase | Admin write path validates credentials and write contract | `npm run firebase:admin-write-check:dry-run` |
| API routes | Health, blogs, currency, metals, RSS, sitemap, ads.txt, service worker | targeted fetch smoke or `npm run test:smoke` |
| Security | Headers, protected admin APIs, dependency audit, secret exposure | `npm run test:security`, `npm run test:admin-api`, `npm run audit` |
| Performance | JS/CSS chunks, image budgets, lazy tool imports, Lighthouse budgets | `npm run bundle:audit`, `npm run performance:budget:strict`, `npm run test:lighthouse:dev` |
| UX | Mobile overflow, keyboard/focus basics, blog reader controls, priority tools | `npm run test:mobile-ux`, `npm run test:blogs-a11y-seo`, `npm run test:tools:priority` |
| Release | Env readiness, Vercel readiness, production parity and monitoring | `npm run env:readiness`, `npm run deploy:readiness`, `npm run release:doctor` |

## Current Audit Baseline

The latest local audit on 2026-06-12 verified:

- Web build passed with 283 generated pages.
- Admin build passed with 47 generated pages.
- Route QA production mode passed: 162 HTTP routes, 20 browser probes, 0 failures, 0 warnings, 0 slow routes over 2500 ms.
- Firebase live data passed: status `live`, score `100`, 19 checks passed.
- Firebase data integrity passed: status `clean`, score `100`, 20 checks passed.
- Firebase blog read check passed with live published blog sampling.
- Admin API safety passed: 6/6 tests.
- Smoke suite passed: 8/8 tests.
- Security headers passed: 2/2 tests.
- Priority tools passed: 40/40 tests.
- Mobile UX passed: 92/92 tests.
- Blog accessibility and SEO passed: 2/2 tests.
- Lighthouse budgets passed: 6/6 tests.
- Dependency audit passed after lockfile updates for the transitive `@grpc/grpc-js` advisory.

## Known Local Environment Gaps

These are not product-code failures, but they block some local release checks unless the shell exports the required values:

- `deploy:readiness` needs `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID` or `VERCEL_PROJECT_ID`, and `VERCEL_ADMIN_PROJECT_ID`.
- Full Admin SDK write verification needs server-only Firebase Admin credentials through `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_SERVICE_ACCOUNT_FILE`, or split `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
- Optional integrations such as maps, AI providers, VAPID, and monitoring webhooks should stay optional unless a route requires them for a release.

Never commit real tokens, service account JSON, private keys, or production passwords. Keep only examples and variable names in docs.

## Fast Local Audit

Use this when editing UI/routes and you need confidence quickly:

```bash
npm run routes:check
npm run qa:routes:inventory
npm run test:route-loading
npm run lint:web
npm run build:web
npm run build:admin
npm run test:smoke
```

## Full Local Audit

Use this before a release-style handoff:

```bash
npm run env:readiness
npm run routes:check
npm run qa:routes:inventory
npm run firebase:check
npm run firebase:live-check
npm run firebase:integrity
npm run firebase:blogs-read-check
npm run firebase:admin-write-check:dry-run
npm run content:blogs
npm run seo:blog-check
npm run seo:blog-links
npm run media:check
npm run test:core-cache
npm run test:route-loading
npm run lint:web
npm run build:web
npm run build:admin
npm run audit
npm run bundle:audit
npm run performance:budget:strict
```

Then run production-style servers:

```bash
npm run start:web
npm run start:admin
```

With the servers running:

```bash
npm run qa:routes:strict
ALTFT_REUSE_SERVER=true npm run test:smoke
ALTFT_REUSE_SERVER=true npm run test:security
ALTFT_REUSE_SERVER=true npm run test:admin-api
ALTFT_REUSE_SERVER=true npm run test:tools:priority
ALTFT_REUSE_SERVER=true npm run test:mobile-ux
ALTFT_REUSE_SERVER=true npm run test:blogs-a11y-seo
ALTFT_REUSE_SERVER=true npm run test:lighthouse:dev
```

## Targeted Public API Smoke

When checking data/API flow manually, these endpoints should return 2xx/3xx locally:

```text
/api/health
/api/blogs?offset=0&limit=3
/api/tools/currency-converter/2024-01-02?from=USD&to=EUR
/api/tools/metal-prices?currency=USD&metals=XAU
/rss.xml
/robots.txt
/sitemap.xml
/ads.txt
/sw.js
```

If an endpoint depends on a third-party provider, confirm it has a server-side timeout, a cache policy, and a user-safe fallback message.

## Scalable Architecture Rules

- Keep route files small. They should compose metadata, JSON-LD, and one feature entry component.
- Keep feature state inside the feature module. Move repeated contracts, caches, env validation, and HTTP helpers to `packages/core`.
- Keep reusable visual primitives in `packages/ui` or a shared app-level UI folder, not scattered as copy-pasted Tailwind blocks.
- Use dynamic imports for heavy editors, charts, media processors, AI widgets, and individual microtools.
- Use static/ISR pages for content that can be stale for minutes or hours. Use client/Firebase live reads only when the user needs realtime data.
- Use rate limits and request coalescing on upstream APIs to reduce cost and prevent duplicate traffic.
- Keep admin authorization enforced in API routes even when the UI already hides a button.
- Treat empty, loading, error, and permission-denied states as part of the feature contract.

## Improvement Backlog

High-value next improvements:

1. Add a saved route-QA Markdown artifact to release notes for every major UI pass.
2. Add a provider-health panel for optional third-party API keys so missing optional integrations are visible but not scary.
3. Add more focused Playwright flows for BuySmart search/filter, blog reader controls, and admin blog create/edit using emulator data.
4. Add bundle attribution for the largest web/admin chunks so heavy dependencies can be moved behind feature-level dynamic imports.
5. Add a production monitor schedule that stores the last successful `/api/health`, route QA, Firebase live, and link-check snapshots.
