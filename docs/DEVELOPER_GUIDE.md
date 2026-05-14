# AltFTool Developer Guide

Last updated: 2026-05-06

This is the main onboarding guide for developers working in the AltFTool monorepo. It explains the app layout, local setup, Firebase boundaries, validation commands, and the safest way to add or change features.

## 1. Project Overview

AltFTool is a two-app Next.js workspace:

- `altftoolweb/` is the public website for tools, blogs, BuySmart, deals, extensions, news, brand ratings, and public content.
- `altftoolwebadmin/` is the authenticated admin panel that manages public app data through Firebase-backed modules.

The apps share common helpers through:

- `packages/core/` for cache, HTTP, Firebase path, environment, and service contracts.
- `packages/ui/` for shared compact UI primitives.

The root workspace owns validation scripts, smoke tests, route contracts, and Firebase contract checks.

## 2. Required Runtime

Use the runtime defined by the root `package.json`:

```bash
node --version   # >=24 <25
npm --version    # >=11
```

Install from the monorepo root:

```bash
npm install
```

Use `npm ci` in CI or when you need a clean install from `package-lock.json`.

## 3. Local Development

Run both apps on the expected local ports:

```bash
npm run dev:web      # http://localhost:3002
npm run dev:admin    # http://localhost:3001
```

Production-style local starts:

```bash
npm run build
npm run start:web
npm run start:admin
```

Most smoke tests assume:

- public web at `http://localhost:3002`
- admin at `http://localhost:3001`

## 4. Useful Root Commands

```bash
npm run lint:web
npm run lint:web:budget
npm run routes:check
npm run firebase:check
npm run firebase:admin-write-check:dry-run
npm run bundle:audit
npm run audit
npm run build
npm run test:smoke
npm run validate
```

`npm run validate` is the full release gate. It currently runs web lint, the web lint budget, route checks, Firebase contract checks, dependency audits, web/admin builds, and Playwright smoke tests.

The Playwright route audit uses the already-built production web server and the dev admin server:

```bash
npm run build
npm run test:routes
```

Use `npm run test:routes:dev` only when you specifically want to audit both apps against local dev servers.

The lint warning budget is intentionally strict. If you reduce warnings, lower the default budget in:

```text
scripts/check-web-lint-budget.mjs
```

Do not raise the budget unless there is a temporary, documented reason.

## 5. Repository Layout

```text
altftool/
  docs/
    DEVELOPER_GUIDE.md
    ROUTES.md
    architecture/README.md
  altftoolweb/
    src/app/
    src/tools/
    src/platform/
    src/ads/
    docs/
  altftoolwebadmin/
    src/app/
    src/projects/
    src/components/
    src/lib/
    docs/
  packages/
    core/
    ui/
  scripts/
  tests/
```

## 6. Public Web App

Detailed web documentation lives in:

```text
altftoolweb/docs/DEVELOPER_GUIDE.md
```

Important web areas:

- `src/app/` contains App Router routes and API route handlers.
- `src/tools/<tool-slug>/` contains individual tool runtimes.
- `src/platform/registry/` contains tool, game, extension, route, and animation registries.
- `src/platform/navigation/siteRoutes.js` owns public header/footer navigation.
- `src/ads/` owns ad providers, placement layouts, and ad injection helpers.
- `src/app/blogs/` owns static-first blog catalog and Firebase hydration.

Public web conventions:

- Tools should load through registry-driven dynamic imports.
- Client code may only use `NEXT_PUBLIC_*` environment variables.
- Third-party service calls should go through server route handlers when keys, rate limits, CORS, or response normalization matter.
- Images should use the existing managed image component where the app already uses it.
- Loading, empty, and error states are part of the feature, not an afterthought.

## 7. Admin App

Detailed admin documentation lives in:

```text
altftoolwebadmin/docs/DEVELOPER_GUIDE.md
```

Important admin areas:

- `src/context/AuthContext.jsx` resolves Firebase Auth and admin metadata.
- `src/components/admin/AdminLayout.jsx` owns the protected shell.
- `src/projects/index.js` is the project registry.
- `src/projects/<project>/config.js` defines modules for each project.
- `src/projects/<project>/modules/<module>/` contains module UI and services.
- `src/lib/permissionUtils.js` owns project/module permission checks.
- `src/lib/firebaseAdmin.js` must lazy-initialize Firebase Admin SDK.

Admin conventions:

- Protected routes must validate the Firebase token and the admin document.
- Superadmin-only areas must stay guarded at route and UI levels.
- Admin mutations should create audit logs where the existing module pattern does so.
- CSV/XLSX imports must keep file-size and row-count limits.
- Admin list caches should be cleared after create/update/delete operations.

## 8. Shared Packages

Use `@altftool/core` for repeated runtime behavior:

- `cache.js`: TTL and subscription cache utilities.
- `env.js`: shared environment contract helpers.
- `firebasePaths.js`: centralized Firebase collection/path names.
- `http.js`: JSON response, proxy, cache, timeout, and rate-limit helpers.
- `next.js`: Next.js helper utilities.
- `services.js`: shared service contracts.

Use `@altftool/ui` for repeated visual primitives:

- buttons
- icon buttons
- cards
- inputs
- badges
- loaders
- token-aligned shared CSS

If a helper or UI primitive is copied between `altftoolweb` and `altftoolwebadmin`, move it to a shared package instead.

## 9. Firebase Boundaries

Firebase client SDK is used in browser-facing app code. Firebase Admin SDK is used only in server routes where elevated access is required.

Keep these rules:

- Client writes must stay narrow and match `firestore.rules` and `storage.rules`.
- Admin SDK routes bypass Firestore rules, so route-level auth checks are mandatory.
- Public Firestore reads should use short TTL caches when data is safe to reuse.
- Realtime listeners used in multiple places should fan out through cached subscription helpers.
- Server/build code must not require runtime-only Firebase secrets at module scope.

Run the contract checker after Firebase path, rules, or admin module changes:

```bash
npm run firebase:check
```

Validate the Firebase Admin write path before releasing admin mutations:

```bash
npm run firebase:admin-write-check
```

Use `npm run firebase:admin-write-check:dry-run` when credentials are not available locally. For emulator validation, set `FIRESTORE_EMULATOR_HOST` before running the live command.

Run Firebase Security Rules tests with the local emulators:

```bash
npm run test:firebase-rules:emulator
```

Run admin CRUD path checks against the Firestore Emulator:

```bash
npm run test:admin-crud:emulator
```

Production monitoring is available through:

```bash
npm run monitor:production
```

Set `ALTFT_MONITOR_WEB_URL`, `ALTFT_MONITOR_ADMIN_URL`, and `ALTFT_MONITOR_ADMIN_TOKEN` to point it at a specific deployment. The GitHub Actions monitoring workflow defaults the public web check to `https://altftool.com` and uses repository variables/secrets for admin health.

Health surfaces:

```text
altftoolweb/src/app/api/health/route.js
altftoolwebadmin/src/app/api/health/route.js
altftoolwebadmin/src/app/(protected)/health/page.jsx
```

The public health API exposes safe web readiness, release, tool, content, SEO, and Firebase public-read signals. The admin health dashboard adds Firebase Admin readiness, Vercel deploy readiness, and production freshness checks against the public `/api/health` endpoint.

Production deployment runbook:

```text
docs/PRODUCTION_DEPLOYMENT.md
```

Check local deployment readiness without exposing secret values:

```bash
npm run env:readiness
npm run deploy:readiness -- --target=all
```

Use `npm run env:readiness:strict` before a production release. The `Deployment Readiness` GitHub Actions workflow runs the same strict check from repository secrets and variables.

Vercel production deploys need these GitHub Actions repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_WEB_PROJECT_ID
VERCEL_ADMIN_PROJECT_ID
```

`VERCEL_PROJECT_ID` can be used as the public web fallback when `VERCEL_WEB_PROJECT_ID` is not set. After changing these secrets, re-run the failed CI deploy jobs or manually run the `Vercel Deploy` workflow with target `all`.

## 10. Environment Variables

Do not commit `.env*` files with real secrets.

Common public web variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_USE_MOCK
```

Common optional server variables:

```text
GROQ_API_KEY
OPENROUTER_API_KEY
NEXT_PUBLIC_DEEPSEEK_API_KEY
```

Admin Firebase Admin routes may require service account variables depending on the local environment. Keep those server-only.

## 11. Adding A Public Tool

1. Create a folder under `altftoolweb/src/tools/<slug>/`.
2. Add the tool UI under `components/` or `pages/`.
3. Add or update `entry.jsx` if the loader expects it.
4. Register metadata in `src/platform/registry/toolMetaMap.js`.
5. Register runtime import in `src/platform/registry/toolRuntimeMap.js`.
6. Add any canonical route expectations to route docs/checks when needed.
7. Verify `/tools/[category]/[slug]` and `/tools/all/[slug]`.
8. Run:

```bash
npm run lint:web
npm run routes:check
npm run build:web
```

## 12. Adding An Admin Module

1. Add module config in `altftoolwebadmin/src/projects/<project>/config.js`.
2. Add a module folder at `src/projects/<project>/modules/<moduleKey>/`.
3. Implement `page.jsx`; add `layout.jsx` only if the module needs a custom shell.
4. Wire services through the app's Firebase helpers.
5. Add permissions for the module.
6. Add route aliases in `src/config/adminRoutes.js` only when the public URL should differ from the module key.
7. Update route docs/checks when a new canonical route is created.
8. Run:

```bash
npm run routes:check
npm run firebase:check
npm run build:admin
```

## 13. Route Contract

Route names are documented in:

```text
docs/ROUTES.md
```

Before changing route names, header/footer links, admin module keys, redirects, or route aliases, run:

```bash
npm run routes:check
```

Keep canonical routes stable. Add redirects for legacy routes when renaming is unavoidable.

## 14. Performance Rules

- Prefer server components for static or data-ready App Router pages.
- Push client components down to the smallest interactive boundary.
- Use dynamic imports for heavy tools, charts, canvas editors, PDF tooling, maps, and media editors.
- Use short TTL caches for safe repeated API/Firebase reads.
- Keep route handlers thin; share timeout, JSON response, proxy, and rate-limit helpers from `@altftool/core`.
- Avoid creating new state just to mirror another state value. Derive values during render when possible.
- Keep `react-hooks` warnings moving downward, not upward.

## 15. Security Rules

- Never expose server secrets through `NEXT_PUBLIC_*`.
- Validate inputs in API route handlers before upstream calls.
- Use rate limits for expensive public routes and sensitive admin mutations.
- Keep Firebase Admin SDK initialization lazy.
- Keep admin permission checks server-side for protected writes.
- Avoid untrusted HTML unless it is sanitized and the route has a clear reason.
- Do not use mixed-content HTTP calls from HTTPS pages.

## 16. Review Checklist

Before pushing:

1. Check `git status --short`.
2. Run `git diff --check`.
3. Run the smallest relevant validation first.
4. Run `npm run validate` before a release-style push.
5. Confirm lint warning budget did not regress.
6. Confirm Firebase and route checks pass if touched.
7. Commit with a concise message.
8. Push the monorepo.
9. If web app files changed and standalone `altftool.com` must be kept current, sync those web files to the standalone repo.

## 17. Standalone Repository Sync

The monorepo is the source of truth. The public web app is also mirrored to:

```text
AnslationDev/altftool.com
```

When a commit changes files under `altftoolweb/`, sync the changed web files into the standalone repo without the `altftoolweb/` prefix.

Admin app changes live in the monorepo unless a separate admin mirror is explicitly requested.

## 18. Common Gotchas

- `next dev` uses `--webpack` in both apps; keep that unless the project intentionally moves to another dev bundler.
- Build output can evaluate modules early, so do not initialize server-only SDKs at module scope.
- Browser-only APIs need client boundaries and `typeof window !== "undefined"` guards.
- Firestore paths should come from shared constants when possible.
- Route labels, route aliases, and permission keys are separate concepts in admin. Do not rename one without checking the others.
- Smoke tests cover web shell, tool detail flow, BuySmart images, Firebase blogs, admin login shell, and legacy redirects.
