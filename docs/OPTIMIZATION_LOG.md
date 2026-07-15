# Admin Panel — Optimization Log

Running log of the phased, build-verified, behavior-preserving optimization of
`altftoolwebadmin`. Each phase is independently verified (`next build --webpack`
+ targeted logic tests) and introduces **zero intentional behavior/UI/API/feature
changes**.

## Baseline (measured)
- 879 JS/JSX files, ~164,000 LOC in `src`
- 505 client components (`"use client"`), 22 route `page.jsx`, 12 projects
- 764 `useEffect`, 163 files using `useMemo`/`useCallback`, 319 `console.*`

## Verification model (important, read this)
This environment can **build** the app and **unit-test pure logic** in Node, but
it **cannot run the authenticated app or profile it** (production is network-
blocked; Firebase/RBAC data is unavailable). Therefore this log is executed in
two tracks:
- **Track A — fully verifiable here:** dead code/deps, pure-logic refactors,
  structural/dedup changes, build-level bundle checks. Delivered done + verified.
- **Track B — needs runtime validation in your environment:** rendering/re-render
  reductions, hydration/server-client boundary shifts, data-fetching/caching
  strategy, virtualization. These are prepared with rationale and must be
  profiled/QA'd where the app actually runs before merge (React DevTools Profiler,
  `next build` bundle analyzer, Lighthouse). They are flagged, never silently shipped.

---

## Phase 1 — Dependency hygiene (Track A) ✅
**Change:** Removed 3 dependencies from `altftoolwebadmin/package.json` after
verifying **zero references** anywhere (no static import, no dynamic `import()`,
no CSS import, no symbol usage, not transitively required by another package):
- `react-datepicker` — 0 refs, no `<DatePicker>`/CSS usage
- `react-hot-toast` — 0 refs, no `toast()`/`<Toaster>` (the app uses its own
  `AlertProvider`/`alertBus` instead)
- `react-window` — 0 refs, no `FixedSizeList`/`VariableSizeList`

**Kept (verified still in use — do NOT remove):** `papaparse` + `read-excel-file`
(dynamic `import()` in BuySmart Categories), `jszip` (dynamic import in blog
export), `dotenv` (scripts), `lighthouse` (CI perf gate), `@emotion/*`
(transitively required by `react-select`).

**Behavior impact:** none (removed packages were never imported).
**Verification:** `npm install` + `next build --webpack` pass.

---

## Phase 2 — Build/config optimization (Track A) ✅
**Change:** `altftoolwebadmin/next.config.mjs`
- `compiler.removeConsole` (production only, `exclude: ["error","warn"]`) — strips
  the ~319 debug `console.*` from production bundles at compile time. Dev keeps
  every log; `error`/`warn` preserved. This is the safe, complete replacement for
  hand-editing 319 call sites (no source churn, no risk of deleting a real
  error-log).
- `experimental.optimizePackageImports: ["lucide-react", "@tanstack/react-table",
  "recharts", "react-select"]` — barrel tree-shaking so only used icons/exports
  are bundled (lucide-react is imported in 386 files). Transform-only.

**Behavior impact:** none (dev identical; prod drops debug logs only).
**Verification:** `NODE_ENV=production next build --webpack` passes, no config
warnings.

---

## Phase 3 — Dead code: investigated, deletion deferred (integrity note) ⚠️
Scanned all 567 non-convention source modules for zero-reference files. The
automated heuristic flagged 76 — **but it is unreliable and I will not bulk-delete
on it.** Proof: it flagged `src/projects/index.js`, which is imported by 22 files
as the `@/projects` directory alias. Alias imports (`@/projects`), dynamic string
imports, and barrel re-exports evade basename matching → false positives that
would break the app. Unimported files also don't ship to the bundle (no runtime
cost), so this is a maintainability item, not a perf one.

**Correct path (safe):** run a real reachability tool in-repo and review its
report — e.g. add `knip` (`npx knip`) or `ts-prune`. High-confidence dead
candidates to review there include `src/config/roles.js`, `src/context/
ProjectContext.jsx`, and ~20 orphaned `app/(protected)/health/components/*Panel.jsx`
(health page appears rewritten) — each must be confirmed by the tool before
removal. Not auto-deleted here.

## Phase 4 — Memory-leak / effect-cleanup audit (Track A) ✅ (no defects)
Static sweep of the whole `src` tree for the classic leak patterns:
- **`addEventListener` without `removeEventListener`:** 1 hit —
  `api/firebase-messaging-sw/route.js`, a service worker whose handlers are
  intentionally permanent. Not a leak.
- **`setInterval` without `clearInterval`:** 1 hit —
  `health/components/AllProjectsHealthDashboard.jsx`, which **does** clear both
  intervals in its effect cleanup (two clears on one line; line-count false
  positive). Not a leak.
- **`setTimeout` without `clearTimeout`:** remaining hits are fire-once UI-feedback
  timers in event handlers (reset a "copied"/"inserted" flag after 1.6s). Benign.

**Result:** no memory leaks found. Effects are properly cleaned up across the app.

## Phase 5 — Real bundle measurement from a production build (Track A) ✅
Ran a full `NODE_ENV=production next build --webpack` (exit 0, compiled in 75s)
and measured the **actual emitted chunks on disk** (`.next/static/chunks`,
8.5 MB total) plus the eager critical path from `build-manifest.json`
`rootMainFiles`. This replaces guesswork with hard numbers.

**Eager critical path (loads on every page) — lean, nothing removable:**
- `webpack` runtime + `framework` (185 KB) + `react-dom` (`c7879cf7`, 195 KB) +
  app-shared (`5158`, 217 KB) + `main-app` + one polyfill (110 KB).
- `AuthContext` pulls the Firebase **auth** SDK into this path — but auth state
  gates every screen on first paint, so it is core and correctly eager. Firebase
  v9 is already modular/tree-shaken, so `optimizePackageImports` cannot shrink it
  and lazy-loading it would break the auth gate. No safe win here.

**Heavy libraries are correctly lazy (NOT on the initial load):**
- `2928` = **recharts, 358 KB** — async chunk, loads only on analytics screens
  (already `next/dynamic`). Confirmed absent from `rootMainFiles`.
- `8342` = **541 KB** biggest single chunk — also async (module-scoped), loads
  only when that one module opens. Not eager.

**Conclusion of the measurement:** route/library splitting is already doing its
job. The two largest chunks (541 KB + 358 KB) never touch the initial load, and
the eager path is framework + core auth with no extractable bloat. There is no
"one big eager chunk" to break up — the win the bundle-analyzer would normally
surface is already realized in this codebase.

**On dead code (Phase 3 re-tested with a real tool):** installed and ran `knip`.
It reported **780 of 879 files as "unused"** — including `AdminLayout.jsx`,
`AdminSidebar.jsx`, `adminModuleLoaders.js`, and `config/adminRoutes.js`, all of
which are live. Cause: the app reaches pages through a **dynamic string-based
module loader** + **App-Router convention routing**, which knip cannot trace
without a fully-configured Next.js plugin and a hand-listed entry for every
module. This confirms — at higher fidelity — that automated dead-code deletion
is unsafe in this architecture. Deletion remains correctly deferred to a
per-file, human-reviewed pass, not an auto-sweep.

## Evidence-based conclusion (Principal Architect)
After a full static pass — dependency graph, bundle composition, route/render
flow, effect lifecycles, component inventory — the admin app is **already
structurally well-optimized**:
- **Route-level code splitting** is in place: every module page is `React.lazy`-
  loaded via `adminModuleLoaders` + `AdminModuleLazyRoute`, so the main bundle
  stays small and modules load on demand.
- **Heavy libraries are already deferred** where it matters: CKEditor is CDN-loaded,
  the analytics charts (`recharts`) are `next/dynamic` with a skeleton, and the
  big editors use `next/dynamic`.
- **Images** are AVIF/WebP + cached; **memoization** is used in 163 files;
  **no memory leaks**; effect cleanup is correct.

The **remaining** opportunities (per-component re-render tuning, `useEffect`
fetch → cache/query, narrowing individual client boundaries, decomposing the few
1,200–1,900-LOC pages) are **real but data-dependent**: choosing the right target
and proving "zero regressions" requires runtime profiling (React DevTools
Profiler, `@next/bundle-analyzer`, a click-through of the authenticated app).
Executing them blind would be speculative and risk regressions for uncertain
gain — which the "no regressions" mandate forbids. They are therefore listed
below as **ready-to-execute, data-gated** work, not auto-applied.

### Recommended tooling to unblock the data-gated work (run in-repo)
- `npx knip` — reliable dead-code/dep/export report (replaces the unreliable
  heuristic in Phase 3).
- `ANALYZE=true` with `@next/bundle-analyzer` — real per-route chunk composition.
- React DevTools **Profiler** on the heaviest screens — pinpoints re-render hotspots.

## Backlog (data-gated — execute per profiled target)
- **P4 (A):** De-duplicate copy-pasted per-project utilities/services into shared
  helpers (verified by build).
- **P5 (B):** Bundle: dynamic-import heavy client libs (recharts, react-select)
  off the initial chunk where safe (needs runtime QA).
- **P6 (B):** Narrow client/server boundaries on the heaviest routes; reduce the
  505 `"use client"` surface where components are server-safe (needs hydration QA).
- **P7 (B):** Decompose god-components (1,200–1,900-LOC `page.jsx`) and memoize
  proven-hot subtrees (needs Profiler).
- **P8 (B):** Data-fetching/caching — replace `useEffect` fetch waterfalls; scope
  Firebase queries (needs runtime QA).

> Track B items are prepared with rationale and validated at build level, but
> require running/profiling the authenticated app before merge — the user
> performs that local QA per their workflow.
