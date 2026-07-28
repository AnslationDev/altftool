/**
 * ANSETS — the AltFTool admin asset layer.
 *
 * Three layers, and this is the middle one:
 *
 *   packages/ui   generic primitives   Button, Card, Input, Badge, Modal…
 *   src/ansets    admin patterns       PageHeader, StatGrid, DataTable, states…
 *   src/app/…     screens              compose ansets, own their data
 *
 * Everything reusable or dynamic across admin screens belongs here, imported as
 * `@/ansets`. The rule that keeps the console consistent: a screen should not
 * hand-roll a header, a KPI tile, a card shell, a table, a filter bar, or a
 * loading/empty/error state — if one is missing something, extend the anset so
 * every screen gets it, instead of forking it locally.
 */

// Layout
export { PageHeader, Breadcrumbs } from "./layout/PageHeader";
export { SectionCard } from "./layout/SectionCard";

// Data display
export { StatGrid, StatTile } from "./data/StatGrid";
export { DataTable } from "./data/DataTable";
export { FilterBar } from "./data/FilterBar";
export { BulkActionsBar } from "./data/BulkActionsBar";

// States
export { EmptyState, ErrorState, LoadingState, DataState, Bone } from "./states/States";

// Hooks
export { useAdminResource } from "./hooks/useAdminResource";
export { useTableControls } from "./hooks/useTableControls";
