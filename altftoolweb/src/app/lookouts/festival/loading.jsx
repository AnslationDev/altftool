import { RouteLoadingShell } from "@/components/ui/route-loading";

// Gives /lookouts/festival and everything nested under it (calendar,
// [slug], religion/[x], country/[x], category/[x]) its own Suspense
// boundary instead of inheriting the root layout's shared one. The shared
// boundary raced two resolution paths (React hydration vs. the legacy
// $RC/$RV stream-swap script) for the same content on any route that
// suspended under it, leaving a dead duplicate copy in the DOM and
// unreliable synthetic event wiring (onClick/onSubmit silently no-op on
// native events while still working via direct invocation). A dedicated
// boundary per segment avoids that race.
export default function FestivalLoading() {
  return <RouteLoadingShell />;
}
