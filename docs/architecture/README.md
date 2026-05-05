# AltFTool Architecture

Last updated: 2026-05-05

## Monorepo Layout

```text
altftool/
  altftoolweb/        Public Next.js app
  altftoolwebadmin/   Admin Next.js app
  packages/core/      Shared runtime helpers and contracts
```

## Core Rule

Shared behavior belongs in `packages/core` first. App folders should own route UI, product modules, and app-specific Firebase/project wiring.

Use `@altftool/core` for:

- security headers
- server environment validation
- route-handler error responses
- upstream API proxy helpers
- shared env-name contracts

Do not copy-paste the same env checks, security headers, or JSON proxy boilerplate into each route.

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

## Verification

From repo root:

```bash
npm run build
npm run audit
```

Individual apps:

```bash
npm run build:web
npm run build:admin
```
