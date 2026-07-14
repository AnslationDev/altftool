# SEO Engine — Multi-Tenant, Project-Isolated Architecture

The ALTF Engine SEO module is a **shared codebase serving every project**, but
its **data and access are 100% project-isolated**. An admin working in one
project can only ever see and manage that project's SEO — never another
project's.

Route: `/<project>/seo` (e.g. `/altftool/seo`, `/leadtree/seo`, `/coozter/seo`).

## Isolation model (defense in depth)

Isolation is enforced at **both** the frontend and the backend, using the same
RBAC check (`hasModuleAccess`) so the two layers can never disagree.

| Layer | Mechanism |
| --- | --- |
| Sidebar visibility | `AdminSidebar` lists a project's modules only where `hasModuleAccess({adminData, projectId, moduleKey:"seo", action:"read"})` is true. |
| Route guard | `AdminLayout` renders "Access denied" for `/<project>/seo` unless the admin has SEO read on that project. |
| **API authorization** | **Every** SEO API route calls `authorizeSeoRequest(request, action)` (`src/lib/seoAuth.js`), which verifies the admin, resolves the active project from `?project=`, and re-checks `hasModuleAccess` for that project. A hand-crafted request with another project's `?project=` is rejected with 403. |
| Data scoping | Each project reads/writes its OWN Firestore locations: config `projects/<project>/seo/runtime`, health `projects/<project>/seo_health` (see `src/lib/seoProject.js`). Project ids are validated against the registry (prototype-safe), never interpolated raw. |
| Client context | `seoService` derives the active project from the URL and sends `?project=<id>` on every call; the server treats it as untrusted and re-authorizes. |

Superadmins bypass per-project checks (full platform access). Regular admins are
granted SEO per project through the RBAC admin-management permission matrix,
which now lists the SEO module for every project automatically.

## Module surface (how SEO appears in every project)

- `SHARED_PROJECT_MODULES` in `src/projects/index.js` injects `seo` into every
  project's `modules`, so the sidebar, routing, RBAC matrix, and landing page
  pick it up for all current and future projects.
- `sharedModuleLoaders.seo` (`src/lib/adminModuleLoaders.js`) and
  `SHARED_MODULE_ROUTE_KEYS.seo` (`src/lib/adminModuleRouteKeys.js`) resolve the
  SEO pages/routes under any project.

## Per-project routes

Fully project-scoped (store + read + authorize per project):

- `GET/PUT /api/seo/config` · `GET/POST /api/seo/health`
- `GET /api/seo/registry` · `GET /api/seo/search` (per-project registry)
- `POST /api/seo/recommendations` · `POST /api/seo/links/check`

Locked to **altftool** (single shared external integration; other projects get
403 / the tab is hidden until per-project wiring exists):

- `/api/seo/gsc` and `/api/seo/gsc/*` — Google Search Console (one OAuth
  connection). Gated via `authorizeSeoRequest(..., { forceProject: "altftool" })`
  and `withAdminApi({ requireProjectModule: { project: "altftool", moduleKey: "seo" } })`.
- `POST /api/seo/generate` — altftool automation lane (page registry, proposals).

Cross-app cache revalidation only fires for the altftool project, so saving
another project's config never busts altftool.com's cache.

## What each new project needs (external, per-project)

The admin surface and isolation work out of the box for every project. To make a
project's SEO fully effective end-to-end, supply — per project — the pieces that
live outside this repo:

1. The project's public site must consume its config at
   `projects/<project>/seo/runtime` (as altftool.com does).
2. A per-project page-inventory endpoint (until then, the registry is built from
   that project's own per-page overrides + its `projects/<project>/blogs`).
3. A per-project Google Search Console OAuth connection and revalidate URL.
