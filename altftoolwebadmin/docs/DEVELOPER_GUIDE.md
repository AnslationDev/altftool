# Admin AltFTools Developer Guide

Last updated: 2026-05-06

This document is the main onboarding guide for developers working on this admin panel. It explains how the app is structured, how routing and permissions work, how projects/modules are added, and what conventions to follow when extending the system.

For monorepo-level setup, validation, shared packages, Firebase boundaries, and standalone repo sync notes, also read:

- `../../docs/DEVELOPER_GUIDE.md`

## 1. What This Project Is

This is a multi-project, module-based admin panel built with:

- Next.js App Router
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Admin SDK for protected server routes

The admin panel supports:

- multiple products/projects under one admin UI
- project-scoped modules such as `blogs`, `ads`, `academy`, `trendingVideos`
- global system sections such as `admin-management` and `analytics`
- permission-based access control
- superadmin-only areas

## 2. High-Level Architecture

At runtime, the app is split into 4 layers:

1. App shell and routing
2. Auth and permission resolution
3. Project/module registry
4. Module implementation and data services

### Important entry points

- `src/app/layout.jsx`
  - root layout
  - wraps the app in `AuthProvider`
  - mounts `GlobalAlertHost`

- `src/app/page.jsx`
  - immediately redirects `/` to `/login`

- `src/app/(protected)/layout.jsx`
  - wraps protected screens with `AdminLayout`

- `src/components/admin/AdminLayout.jsx`
  - the main protected shell
  - handles auth guard
  - handles permission guard
  - renders `AdminSidebar`, `AdminHeader`, and page content

## 3. Route Model

The app supports two route styles:

### Project-scoped routes

Pattern:

```txt
/{projectId}/{moduleKey}
```

Examples:

- `/altftool/blogs`
- `/altftool/ads`
- `/leadtree/blogs`

These are the standard module routes.

### Global routes

Pattern:

```txt
/{globalSection}
```

Examples:

- `/admin-management`
- `/analytics`

These are not tied to a specific project.

### Dynamic module route loader

File:

- `src/app/(protected)/[project]/[module]/page.jsx`

This file:

- reads `projectId` and `moduleKey` from the URL
- validates that the project exists in the registry
- validates that the module exists in that project config
- dynamically imports:
  - `@/projects/${projectId}/modules/${moduleKey}/page.jsx`
  - optional `layout.jsx` inside that module folder

If a project or module is missing, the loader returns fallback text such as:

- `Invalid Project`
- `Module not found`
- `Module not implemented`

## 4. Project Registry

The central project registry lives in:

- `src/projects/index.js`

Example shape:

```js
export const PROJECTS = {
  altftool,
  leadtree,
};
```

Each project config defines:

- `id`
- `name`
- `logo`
- optional branding values
- `modules`

Example:

- `src/projects/altftool/config.js`
- `src/projects/leadtree/config.js`

Each module inside a project config typically defines:

- `label`
- `icon`

Example:

```js
modules: {
  blogs: { label: "Blogs", icon: Tag },
  ads: { label: "Ads", icon: Megaphone },
}
```

This registry is used by:

- sidebar navigation
- route validation
- breadcrumbs
- permission resolution
- analytics labeling

## 5. Auth Flow

### Client auth state

File:

- `src/context/AuthContext.jsx`

`AuthProvider` listens to Firebase Auth using `onAuthStateChanged()` and then calls:

- `/api/admin/me`

to resolve the current admin record.

### Login flow

File:

- `src/app/login/page.jsx`

The login screen supports:

- email/password login
- Google login

After login:

- `getFirstAllowedRoute(adminData)` decides where the user lands
- superadmin defaults to `/admin-management`
- standard admins are sent to the first project/module they can read

### Server admin resolution

File:

- `src/app/api/admin/me/route.js`

Behavior:

- verifies Firebase token
- looks up `admins/{uid}`
- falls back to lookup by email
- if no admin exists, checks `accessRequests`

Important status meanings:

- `200`: active admin found
- `401`: bad or missing token
- `403` with `"Access denied"`: rejected access request
- `403` with `"Inactive admin"`: inactive admin
- `404`: valid user but no active admin doc yet, treated as pending

### Google login access-request flow

File:

- `src/app/api/admin/google-login/route.js`

Google login:

- allows only `@anslation.com`
- checks for active admin first
- if not an admin, creates or reuses a pending access request

## 6. Permission Model

### Main permission helper

File:

- `src/lib/permissionUtils.js`

Main function:

- `hasModuleAccess({ adminData, projectId, moduleKey, action })`

Rules:

1. no admin data -> deny
2. superadmin -> allow everything
3. inactive admin -> deny
4. project-scoped permissions use:
   - `adminData.projectAccess[projectId].permissions[moduleKey]`
5. legacy flat fallback uses:
   - `adminData.permissions[moduleKey]`

### Global superadmin-only sections

Defined in:

- `SUPERADMIN_ONLY_GLOBAL_MODULES`

Current values:

- `admin-management`
- `analytics`

These sections are intentionally not available to standard admins.

### Permission data shape

There are two active permission styles in the codebase:

#### New project-scoped permissions

```js
projectAccess: {
  altftool: {
    permissions: {
      blogs: { read: true, write: true, delete: false }
    }
  }
}
```

#### Legacy flat permissions

```js
permissions: {
  blogs: { read: true, write: true, delete: false }
}
```

The code still supports both.

## 7. Protected Layout Flow

File:

- `src/components/admin/AdminLayout.jsx`

This is the main runtime control point.

### What it does

1. reads the current pathname
2. determines whether the route is:
   - project-scoped
   - global
3. waits for `AuthContext`
4. redirects unauthenticated users to `/login`
5. redirects pending users to `/access-requested`
6. redirects denied users to `/access-denied`
7. checks permission for the target route
8. if denied, shows an inline access-denied state with a request-access action

### Request access flow

If a user lands on a module they cannot access, `AdminLayout` can create an access request using:

- `/api/admin/request-access`

For global sections it uses:

- `projectId: "__global__"`

## 8. Sidebar and Navigation Flow

File:

- `src/components/admin/AdminSidebar.jsx`

### How it works

- reads the current route
- determines active project
- loads available project tabs from `PROJECTS`
- shows only allowed modules based on `hasModuleAccess()`
- shows global sections separately under `System`
- remembers:
  - last selected project
  - sidebar collapsed state

### Important behavior

If the user is on a global route, the sidebar still remembers a `last-project-id` so the project picker does not feel disconnected.

## 9. Breadcrumbs and Route Parsing

File:

- `src/lib/routeUtils.js`

Main helpers:

- `getAdminRouteInfo(pathname)`
- `buildAdminBreadcrumbs(routeInfo)`

This utility understands:

- project routes like `/altftool/blogs`
- global flat sections like `/admin-management`
- legacy flat sections

If you add a new global flat route, make sure it is included in:

- `FLAT_SECTIONS`

## 10. Project and Module Folder Convention

Every project lives under:

```txt
src/projects/{projectId}
```

Typical structure:

```txt
src/projects/altftool/
  config.js
  modules/
    blogs/
      page.jsx
      layout.jsx   // optional
      components/
      services/
```

### Minimum for a module

To make a module routable, you usually need:

```txt
src/projects/{projectId}/modules/{moduleKey}/page.jsx
```

To make it appear in navigation, also register it in:

- `src/projects/{projectId}/config.js`

## 11. How To Add a New Project

Use this checklist.

### Step 1. Create project folder

Create:

```txt
src/projects/{projectId}/
```

Add:

- `config.js`
- `modules/`

### Step 2. Define the project config

Example:

```js
const myProjectConfig = {
  id: "myproject",
  name: "My Project",
  logo: MyLogo,
  modules: {
    blogs: { label: "Blogs", icon: FileText },
  },
};
```

### Step 3. Register project centrally

Update:

- `src/projects/index.js`

### Step 4. Add module page(s)

Create:

```txt
src/projects/{projectId}/modules/{moduleKey}/page.jsx
```

Optional:

- `layout.jsx`
- `components/`
- `services/`

### Step 5. Add permissions in admin-management

If the module should be assignable to admins, make sure the permission UI and stored permission schema include it.

Current centralized permission label list:

- `src/config/permissionModules.js`

Note:

This file currently contains only a partial list, so if you add a new module and want it assignable in permission screens, update it.

### Step 6. Confirm Firestore naming

If your module data lives in:

```txt
projects/{projectId}/{moduleKey}
```

then analytics can usually discover it by default.

If your Firestore collection name does not match the module folder name, or the module uses nested collections, you must add an analytics override in:

- `src/lib/analytics/moduleRegistry.js`

## 12. How To Add a New Module to an Existing Project

Use this checklist.

### Step 1. Create the module folder

```txt
src/projects/{projectId}/modules/{moduleKey}/
```

### Step 2. Add the page

```txt
page.jsx
```

Optional:

```txt
layout.jsx
components/
services/
data/
```

### Step 3. Register the module in the project config

Update:

- `src/projects/{projectId}/config.js`

### Step 4. Add permission support

If admins should be assignable to this module, update:

- `src/config/permissionModules.js`

### Step 5. Add CRUD audit logging

If the module supports create/update/delete flows, use:

- `src/lib/auditClient.js`

to send events to:

- `src/app/api/audit/log/route.js`

This is important for admin audit history and analytics quality.

### Step 6. Check analytics compatibility

Default analytics discovery works best when the module stores data in:

```txt
projects/{projectId}/{moduleKey}
```

with timestamp fields like:

- `createdAt`
- `updatedAt`
- or `uploadedAt`

If your module uses:

- a different collection name
- nested collections
- array-based documents

then update:

- `src/lib/analytics/moduleRegistry.js`

## 13. Firestore and Storage Conventions

### Client SDK

File:

- `src/lib/firebase.js`

Exports:

- `auth`
- `db`
- `storage`

### Server/Admin SDK

File:

- `src/lib/firebaseAdmin.js`

Used in protected API routes.

### Common storage patterns in the repo

#### Flat project collections

Example:

```txt
projects/altftool/blogs/{docId}
projects/altftool/extensions/{docId}
projects/altftool/academy/{docId}
```

#### Nested section collections

Example:

```txt
projects/altftool/deals/hero/items/{docId}
projects/altftool/consumerrating/branddetail/items/{docId}
```

#### Array-based document models

Used by parts of BuySmart:

```txt
projects/altftool/buySmart/{docId}
```

where actual records are arrays inside a document.

### Timestamp conventions

Across the codebase you will find:

- Firestore `serverTimestamp()`
- numeric timestamps from `Date.now()`
- `uploadedAt` for media

Analytics normalizes these formats, but new modules should prefer consistent timestamp fields when possible.

## 14. Audit Logging

### Client helper

File:

- `src/lib/auditClient.js`

Usage:

```js
logAuditEvent({
  module: "blogs",
  action: "BLOG_DELETE",
  entityType: "blog",
  entityId: id,
  summary: `Deleted blog ${id}`,
  changes: { id },
  route: "/blogs",
});
```

### Server route

File:

- `src/app/api/audit/log/route.js`

It:

- verifies active admin token
- validates `module` and `action`
- writes logs using `writeAdminAuditLog()`

### Storage

File:

- `src/lib/adminAuditLog.js`

Collection:

- `admin_audit_logs`

Recommended convention for new modules:

- log create/update/delete
- include clear `summary`
- include `entityType`
- include `entityId`
- include route and structured metadata when useful

## 15. Analytics System

### Main route

- `/analytics`

### API

- `src/app/api/analytics/route.js`

Superadmin only.

### Aggregation layer

- `src/lib/analytics/analytics.service.js`

This service computes:

- total tracked records
- recent additions
- recent updates
- stale module detection
- per-project summaries
- module activity scoring

### Analytics registry

- `src/lib/analytics/moduleRegistry.js`

This file is important.

It does 2 things:

1. dynamically discovers projects/modules from `src/projects`
2. defines special overrides for modules that do not match the default Firestore pattern

Examples of special cases already handled:

- `buysmart`
- `images`
- `trendingVideos`
- `deals`
- `consumerrating`

### Analytics rule of thumb

If a module stores data in a simple collection matching its module key, the analytics layer usually works automatically.

If not, add an override.

## 16. Global Modules

Global modules are handled separately from project modules.

Current global sections:

- `admin-management`
- `analytics`

Sidebar config for these lives directly in:

- `src/components/admin/AdminSidebar.jsx`

If you add a new global screen:

1. create the route in `src/app/(protected)/{global-section}/page.jsx`
2. add it to `GLOBAL_MODULES` in `AdminSidebar`
3. update `FLAT_SECTIONS` in `src/lib/routeUtils.js`
4. decide whether it belongs in `SUPERADMIN_ONLY_GLOBAL_MODULES`
5. if admins need assignable permission, extend permission config/UI

## 17. Current Known Architectural Quirks

These are worth knowing before refactoring.

### 1. Mixed permission models

The code supports both:

- project-scoped permissions
- legacy flat permissions

Be careful not to break the fallback path.

### 2. Mixed Firestore naming patterns

Not all modules use the same Firestore path conventions.

Examples:

- folder `trendingVideos`
- collection `trendingvideos`

### 3. Mixed timestamp formats

Some modules use:

- Firestore timestamps
- `Date.now()`
- `uploadedAt`

Analytics normalizes these, but new code should be more consistent.

### 4. Permission label registry is incomplete

`src/config/permissionModules.js` does not yet fully mirror all existing modules.

If you add or expose permissions for a new module, update it.

### 5. Analytics is CRUD/data driven, not page-view driven

Current analytics tells you:

- what data changed
- what modules are active based on content movement

It does not yet track:

- page opens
- time spent
- true navigation frequency

## 18. Recommended Developer Workflow

When adding a module:

1. create the module page
2. register it in project config
3. add services/data layer
4. make permission support explicit
5. add audit logging to CRUD flows
6. verify Firestore collection shape
7. add analytics override if needed

When adding a project:

1. create project config
2. register project in `src/projects/index.js`
3. add module folders/pages
4. confirm sidebar and route behavior
5. confirm permission behavior
6. confirm analytics discovery

## 19. Suggested Documentation Maintenance Rules

Whenever you add or change any of the following, update this guide:

- new project
- new module
- new global section
- new Firestore data pattern
- permission model changes
- analytics override changes
- auth/access-request behavior changes

## 20. Quick Reference

### Core files

- `src/app/layout.jsx`
- `src/app/page.jsx`
- `src/app/login/page.jsx`
- `src/app/(protected)/layout.jsx`
- `src/components/admin/AdminLayout.jsx`
- `src/components/admin/AdminSidebar.jsx`
- `src/components/admin/AdminHeader.jsx`
- `src/context/AuthContext.jsx`
- `src/lib/firebase.js`
- `src/lib/firebaseAdmin.js`
- `src/lib/permissionUtils.js`
- `src/lib/routeUtils.js`
- `src/projects/index.js`

### Auth/admin APIs

- `src/app/api/admin/me/route.js`
- `src/app/api/admin/google-login/route.js`
- `src/app/api/admin/request-access/route.js`
- `src/app/api/admin/list/route.js`

### Audit and analytics

- `src/lib/auditClient.js`
- `src/app/api/audit/log/route.js`
- `src/lib/adminAuditLog.js`
- `src/app/api/analytics/route.js`
- `src/lib/analytics/analytics.service.js`
- `src/lib/analytics/moduleRegistry.js`

## 21. Final Advice for Future Developers

- Prefer registry-driven changes over hardcoding.
- Keep project config, sidebar behavior, permissions, and analytics in sync.
- If a module does not show in analytics, check Firestore path mismatch first.
- If a route exists but doesn’t show in the sidebar, check project config and permission resolution.
- If a user logs in successfully but can’t land anywhere, inspect `getFirstAllowedRoute()`.
- When in doubt, trace the flow in this order:
  - route
  - project config
  - auth
  - permission
  - module page import
  - Firestore path
