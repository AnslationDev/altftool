# AltFTool Web Developer Guide

Last updated: 2026-05-06

This guide is for developers working on the public `altftoolweb` Next.js app. It covers routes, tool architecture, Firebase usage, styling, performance, and validation.

## 1. App Purpose

`altftoolweb` powers the public AltFTool product:

- tool catalog and individual browser tools
- BuySmart stores and product discovery
- blogs and article detail pages
- exclusive deals
- brand ratings
- extensions
- news
- support/settings content
- public API route handlers used by tools

The app is built on Next.js App Router, React 19, Tailwind CSS v4, Firebase, and a registry-driven loading model for large feature surfaces.

## 2. Local Commands

From the monorepo root:

```bash
npm run dev:web        # http://localhost:3002
npm run build:web
npm run lint:web
npm run lint:web:budget
```

From inside `altftoolweb/`:

```bash
npm run dev
npm run build
npm run lint
```

The preferred full validation command is still from the monorepo root:

```bash
npm run validate
```

## 3. Important Folders

```text
src/app/                 App Router routes and API routes
src/tools/               Individual tool runtimes
src/platform/registry/   Tool/game/extension/animation registries
src/platform/navigation/ Public navigation and route helpers
src/ads/                 Ads provider, placement layouts, injectors
src/contexts/            Theme, animations, global client providers
src/components/ui/       Shared public-app UI helpers
src/lib/                 Firebase and app utilities
```

## 4. Route Model

Canonical route names are documented in:

```text
../../docs/ROUTES.md
```

Key public routes:

- `/`
- `/tools`
- `/tools/[category]`
- `/tools/[category]/[slug]`
- `/tools/all/[slug]`
- `/blogs`
- `/blogs/[slug]`
- `/buysmart`
- `/brandrating`
- `/exclusivedeals`
- `/extensions`
- `/news`
- `/supportsetting`

Header/footer route labels live in:

```text
src/platform/navigation/siteRoutes.js
```

Run route checks after route, redirect, header, or footer changes:

```bash
npm run routes:check
```

## 5. Tool Architecture

Tools are loaded dynamically so the public app does not ship every tool runtime on first page load.

Common tool layout:

```text
src/tools/<tool-slug>/
  entry.jsx
  pages/index.jsx
  components/
  hooks/
  utils/
```

Registry files:

```text
src/platform/registry/toolMetaMap.js
src/platform/registry/toolRuntimeMap.js
```

When adding or renaming a tool:

1. Create or update `src/tools/<slug>/`.
2. Add metadata in `toolMetaMap.js`.
3. Add dynamic import wiring in `toolRuntimeMap.js`.
4. Confirm the canonical category route.
5. Add loading, empty, and error states.
6. Run lint, route check, and a web build.

## 6. Blogs

Blog pages use a static-first model:

- `src/app/blogs/data/blogs.js` provides immediate catalog/detail content.
- Firebase hydration refreshes content after the page is usable.
- `/blogs` uses `BlogExplorerClient.jsx` for filters, sort, chunked loading, and idle Firebase hydration.
- `/blogs/[slug]` uses `BlogDetailClient.jsx` to hydrate the static article with Firestore data.

Rules:

- Keep static fallback content complete enough for initial render and SEO.
- Firestore-only data should not make the page blank.
- Only persist likes/comments when the real Firestore document id exists.

## 7. Firebase Usage

Client Firebase is used for public reads and narrow public writes. Keep these boundaries:

- Client code uses only public Firebase env variables.
- Public writes must match `firestore.rules` and `storage.rules`.
- Repeated safe reads should use app cache helpers where available.
- Realtime subscriptions should be shared/cached when multiple components need the same data.
- Third-party calls that need secrets, CORS control, normalization, or rate limiting should use an API route.

Run this after changing Firebase paths, rules, collection contracts, or admin-managed public data structures:

```bash
npm run firebase:check
```

## 8. API Routes

Public tool API handlers live under:

```text
src/app/api/
```

Rules:

- Validate input before upstream calls.
- Keep server-only keys off the client.
- Use shared `@altftool/core/http` helpers when adding proxy/JSON handlers.
- Add timeouts and rate limits for expensive routes.
- Return consistent JSON errors.

## 9. Styling And Theme

Global styles live in:

```text
src/app/globals.css
src/app/theme.css
```

Follow the existing AltFTool/Anslation visual contract:

- Use CSS variables such as `--background`, `--foreground`, `--card`, `--border`, `--primary`.
- Keep controls compact and consistent.
- Use the existing `.heading`, `.subheading`, and `.description` utilities where appropriate.
- Keep dark mode working through the `data-theme` attribute.
- Avoid one-off hardcoded palettes unless a feature has a specific semantic color need.

Shared UI primitives are available through:

```text
@altftool/ui
```

## 10. Animations

Use the global animation classes for basic reveal effects:

```jsx
<section className="animate-fade-up">...</section>
```

Use Framer Motion only where layout transitions, gestures, or spring behavior are needed.

Respect reduced motion. Avoid animations that block content, delay route usability, or cause layout shifts.

## 11. Images

Use the existing managed image pattern where the surrounding route already uses it:

```text
src/components/ui/ManagedImage
```

Rules:

- Always provide meaningful `alt` text.
- Use stable dimensions or responsive constraints to avoid layout shift.
- Do not rely on a Firebase image without a graceful fallback.
- Keep smoke coverage for important image surfaces such as BuySmart A-Z cards.

## 12. Performance Rules

- Keep route files thin.
- Put heavy client-only widgets behind dynamic imports.
- Avoid state that simply mirrors props or other state.
- Prefer `useMemo` for expensive derived lists and `useCallback` for stable effect/listener dependencies.
- Clean up timers, event listeners, observers, object URLs, and abortable fetches.
- Do not add global providers for features used by only one route.
- Keep lint warnings moving down; the root lint budget enforces this.

## 13. Security Rules

- Never put secrets in `NEXT_PUBLIC_*`.
- Do not call HTTP-only external APIs from HTTPS pages.
- Abort fetches in effects when the result may update state after unmount.
- Sanitize or avoid untrusted HTML.
- Validate uploads by type, size, and route-specific limits.
- Route handlers must not trust client input.

## 14. Validation Checklist

Before pushing web changes:

```bash
git diff --check
npm run lint:web
npm run lint:web:budget
npm run routes:check
npm run firebase:check
npm run build:web
```

For a release-style pass:

```bash
npm run validate
```

## 15. Standalone Repo Sync

The monorepo source path is:

```text
altftoolweb/
```

The standalone web repository is:

```text
AnslationDev/altftool.com
```

When syncing a web commit to the standalone repo, copy changed files without the `altftoolweb/` prefix.

Example:

```text
altftoolweb/src/tools/qr-generator/components/Main.jsx
```

becomes:

```text
src/tools/qr-generator/components/Main.jsx
```

Keep the standalone repo current whenever production web deployment depends on it.
