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

## Backlog (next phases)
- **P3 (A):** Verified dead-file / dead-export removal across `src`.
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
