# AltFTools Admin

The internal admin console for the AltFTool platform — a single multi-project,
module-based panel for managing content, ads, RBAC/access, support, security,
and platform health across every product under the AltFTool umbrella
(AltFTool, LeadTree, CareerBook, and more).

Built with Next.js (App Router), Firebase Auth, Firestore, Firebase Storage,
and the Firebase Admin SDK for protected server routes. Runs alongside its
sibling `altftoolweb` (the public site) in this monorepo.

## Documentation

- **[docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** — architecture,
  routing, the auth/RBAC model, Firestore conventions, and how to add a new
  project or module. Start here.
- [`../docs/DEVELOPER_GUIDE.md`](../docs/DEVELOPER_GUIDE.md) — monorepo-level
  setup, shared packages, and cross-app conventions.
- [`../master.md`](../master.md) — the design system every screen in this app
  (and `altftoolweb`) must follow: tokens, theming, component standards.

## Getting Started

```bash
# From the monorepo root, once:
npm install

# From this directory:
cp .env.example .env.local   # then fill in real values — see comments inline
npm run dev
```

The dev server runs on **[http://localhost:3001](http://localhost:3001)**
(set via `-p 3001` when launched through the monorepo root's `npm run dev`;
running `npm run dev` directly from this directory uses Next's default port
unless overridden).

For a quick local sign-in without setting up Google OAuth, set
`NEXT_PUBLIC_DEV_BYPASS_AUTH=true` in `.env.local` and use "Continue as Local
Admin" on the login screen — see `src/lib/localAdminSession.js`. This bypass
is compiled out of production builds regardless of the flag.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Regenerate the tool-slug registry, then start the dev server (`next dev --webpack`). |
| `npm run build` | Regenerate generated registries/health manifests, patch Next's dependency tree, then production build. Always use `--webpack` — Turbopack cannot resolve the `@altftool/*` workspace packages. |
| `npm start` | Serve a production build. |
| `npm run lint` | ESLint (`eslint-config-next` + React Hooks rules). |
| `npm run firebase:admin-write-check` | Verifies the Firebase Admin SDK can actually write, against a real project. |
| `npm run firebase:admin-write-check:dry-run` | Same check without writing. |
| `npm run test:firebase-rules` | Firestore security rules test (via `../tests/`). |
| `npm run test:admin-crud` | Admin CRUD flow test against the Firebase emulator. |
| `npm run test:admin-web-sync` | Cross-app (admin ↔ web) data-sync test. |

Monorepo-root scripts (`npm run <script>` from `../`) add release gates on
top of this app: `lint:web`, `qa:routes:*`, `firebase:integrity:*`,
`performance:budget:*`, `validate`, `validate:full`, and more — see the root
`package.json` and `../docs/DEVELOPER_GUIDE.md`.

## Environment

See [`.env.example`](./.env.example) for every variable this app reads, with
inline comments on what each one is for and where it's used. Copy it to
`.env.local` and never commit the copy — `.gitignore` only tracks the
`.example` template.

## Project Structure

```
src/
  app/            Routes (App Router) — public auth pages + (protected) admin shell
  ansets/         Shared, composed admin UI patterns (PageHeader, DataTable, states, …)
  components/     Lower-level shared components (AdminLayout, AdminSidebar, …)
  config/         Route/module registries — the source of truth for nav + RBAC gating
  context/        React context providers (AuthContext, …)
  lib/            Server + client utilities: Firebase, RBAC, security, permissions
  services/       Data-access layer for shared resources (admin users, …)
  projects/       Per-project module implementations (blogs, ads, academy, …)
```

## Contributing

Before changing anything UI-facing, read [`../master.md`](../master.md) —
it's the single source of truth for this platform's design tokens and
component standards, and takes precedence over any conflicting guidance
elsewhere. Keep changes theme-aware (light + dark) and WCAG AA compliant.
