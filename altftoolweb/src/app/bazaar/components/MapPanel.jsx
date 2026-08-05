"use client";

/**
 * The only supported way to put a map on a Bazaar page.
 *
 * `leaflet` reads `window` at module scope, so `ListingMap` can never be part
 * of a server render — it arrives through `next/dynamic` with `{ ssr: false }`
 * (the pattern `flightradar/components/ClientDashboardLoader.jsx` established).
 *
 * The reserved box is not decoration. `MapPanel` owns the height and applies it
 * to the wrapper, so the skeleton, the loaded map and a tile-less failure state
 * all occupy exactly the same space and the chunk arriving shifts nothing. A
 * dynamic import with no reserved height is one of the easiest ways to fail a
 * CLS audit.
 *
 * Usage (server or client parent):
 *   <MapPanel points={[point]} center={listing.coords} zoom={13} variant="single" height={220} />
 */

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

/**
 * Also exported for callers that must gate the map on something of their own —
 * `MapExplorerClient` holds this until `useHydrated()` is true so the map is
 * not mounted at the default view and then yanked to the stored city.
 *
 * Defaults to filling its parent, because the parent is the element carrying
 * the real height.
 */
export function MapSkeleton({
  height = "100%",
  label = "Loading map…",
  className = "",
}) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-[var(--bzr-radius,0.75rem)] border border-(--border) bg-(--bzr-media) ${className}`}
      style={{ height }}
      role="status"
      aria-live="polite"
    >
      {/* A faint graticule, so the box reads as "a map is coming" rather than
          "something is broken", without animating anything expensive. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <p className="relative flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1.5 text-xs font-medium text-(--muted-foreground)">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
    </div>
  );
}

const ListingMap = dynamic(() => import("./ListingMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function MapPanel({
  height = 360,
  className = "",
  ...mapProps
}) {
  return (
    <div className={className} style={{ height }}>
      <ListingMap {...mapProps} />
    </div>
  );
}
