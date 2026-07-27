# AltFTool Architecture

Last updated: 2026-05-05

## Monorepo Layout

```text
altftool/
  altftoolweb/        Public Next.js app
  altftoolwebadmin/   Admin Next.js app
  packages/core/      Shared runtime helpers and contracts
  packages/ui/        Shared Anslation/Fuse UI primitives
```

## Core Rule

Shared behavior belongs in `packages/core` first. App folders should own route UI, product modules, and app-specific Firebase/project wiring.

Use `@altftool/core` for:

- short-lived TTL caches and shared subscription registries
- security headers
- server environment validation
- route-handler error responses
- upstream API proxy helpers
- shared env-name contracts

Do not copy-paste the same env checks, security headers, JSON proxy boilerplate, or cache/listener plumbing into each route.

Use `@altftool/ui` for:

- token-aligned buttons, icon buttons, inputs, labels, cards, badges, and loaders
- compact 8px controls backed by `--anslation-ds-*`
- UI primitives that must look identical in the public app and admin app

Do not create a new component style in one app when it belongs in the shared UI layer.

## App Responsibilities

### `altftoolweb`

- Public website, tools, content routes, ads, and public Firebase reads.
- Third-party API calls go through server route handlers.
- Client code may use only `NEXT_PUBLIC_*` values.

### `altftoolwebadmin`

- Authenticated admin/workspace shell.
- Project registry and module routing live in `src/projects`.
- Firebase Admin SDK must stay lazy-initialized through `src/lib/firebaseAdmin.js`.
- CSV/XLSX imports must keep file-size and row-count limits.

## Dynamic Route Pattern

Prefer registry-driven loading for large surfaces:

- Public tools: `src/platform/registry/toolRuntimeMap.js`
- Admin projects/modules: `src/projects/index.js`

When adding a feature:

1. Add metadata to the registry.
2. Keep the route thin.
3. Put feature UI/services in the feature folder.
4. Move shared contracts/helpers into `packages/core` when a pattern repeats.

## Performance Pattern

- API routes that proxy upstream JSON should use `fetchJson`, `proxyJson`, or `jsonResponse` from `@altftool/core/http` so timeouts, request coalescing, and cache headers stay consistent.
- Expensive public routes and sensitive admin mutations should call `enforceRateLimit` before upstream/API work.
- Repeated Firebase `getDocs` reads should go through each app's `src/lib/firebaseCache.js` with a short TTL when data is safe to reuse.
- Realtime Firebase reads that can appear in multiple components should use `subscribeCached` so one `onSnapshot` listener fans out to all subscribers and replays the latest value on navigation.
- Client Firebase is initialized with persistent multi-tab local cache where the browser supports it. Server/build code falls back to normal Firestore initialization.
- Admin list caches must be cleared immediately after create/update/delete operations.
- Admin authorization data may be cached only with a very short TTL. Do not cache permission checks for long-lived windows.
- Heavy client widgets should be lazy loaded behind a client boundary when they are not part of the first interaction path.

## Firebase Security

Firestore and Storage policy lives in `firestore.rules` and `storage.rules`, with deploy config in `firebase.json`. Keep public client writes narrow: comments, likes/views, and local tool history are constrained, while admin content writes and uploads require an active admin document. Firebase Admin SDK API routes bypass these rules, so route-level auth checks remain mandatory.

## Verification

From repo root:

```bash
nvm use
npm ci
npm run validate
```

`validate` runs:

```bash
npm run audit
npm run build
npm run test:smoke
```

Individual apps:

```bash
npm run build:web
npm run build:admin
```
