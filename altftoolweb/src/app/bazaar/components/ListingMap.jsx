"use client";

/**
 * The Bazaar leaflet map.
 *
 * NEVER import this module directly from a server component or from a page.
 * `leaflet` reads `window` at module scope, so it must arrive through
 * `next/dynamic` with `{ ssr: false }` — see `MapPanel.jsx`, which is the only
 * supported entry point and also owns the same-height skeleton.
 * (`flightradar/components/ClientDashboardLoader.jsx` is the precedent.)
 *
 * Two things here are deliberate rather than incidental:
 *
 * 1. **Pins are areas, not addresses.** `listing.coords` is a seeded scatter
 *    inside roughly a 6 km box around the city centre, clustered per locality.
 *    Every surface that renders it says so, and the single-listing variant
 *    draws an explicit radius circle instead of a lone needle-sharp pin,
 *    because a pin on a stranger's home is a safety problem, not a UI detail.
 *
 * 2. **Zoom decides the unit of information.** Plotting 720 individual price
 *    pills at national zoom is unreadable and janky, so below `pinZoom` the
 *    map draws one count bubble per city at `city.coords` and switches to
 *    individual pins once you are zoomed into a city. A small result set
 *    (<= `PIN_ALWAYS_MAX`) skips clustering entirely — three ads should be
 *    three pins, not three bubbles reading "1".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import ManagedImage from "@/components/ui/ManagedImage";

import "leaflet/dist/leaflet.css";

/** Geographic centre of the served footprint, not of the country's bounding box. */
export const INDIA_CENTER = [22.6, 79.4];
export const INDIA_ZOOM = 4;
/** Zoom at which a city fills the viewport, so individual pins become readable. */
const PIN_ZOOM = 10;
/** Below this many plotted ads, clustering costs more than it buys. */
const PIN_ALWAYS_MAX = 25;
/**
 * Leaflet keeps every `Marker` in the DOM regardless of where it is, so
 * clustering alone is not enough: at city zoom all 480 pins were live nodes,
 * most of them thousands of pixels off-screen. Pins are therefore also limited
 * to the padded viewport, with a hard ceiling for the pathological case.
 */
const MAX_RENDERED_PINS = 240;
/** Render slightly beyond the edge so a small pan does not pop pins in. */
const VIEWPORT_PAD = 0.25;
/** Leaflet lays the OSM raster out to 19; asking for more just blurs it. */
const MAX_ZOOM = 18;
/**
 * Collision breathing room between two pills, beyond their half-widths (x) and
 * beyond the icon box (y). Vertical clearance is sized for the TALLEST thing a
 * grouped seed can become — a 40px "×10+" stack badge — plus a 4px gap, not
 * for the 32px pill box: the grouping decision is made before we know whether
 * a seed ends up a pill or a stack, and sizing for the pill left the biggest
 * badges kissing the pill below them by ~4px.
 */
const PIN_GAP_X = 6;
const PIN_GAP_Y = 44;
/** How far a stack click zooms in; pixel spacing quadruples per two levels. */
const STACK_ZOOM_STEP = 2;

const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
/**
 * Attribution is not decoration: OSM data is ODbL-licensed and redistributing
 * the tiles without crediting the contributors is a licence breach. The
 * control stays enabled and is themed rather than hidden.
 */
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/* ------------------------------------------------------------------
 * Icons
 * ---------------------------------------------------------------- */

/** divIcon HTML is a string, so anything interpolated into it gets escaped. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A price pill.
 *
 * Leaflet's bundled marker PNGs resolve relative to the stylesheet, which
 * breaks under every bundler — the classic "map with invisible pins". A
 * `divIcon` sidesteps the image entirely, and buys the thing a buyer actually
 * scans a classifieds map for: the price, on the map, without clicking.
 *
 * The width is derived from the label because leaflet needs real numbers to
 * anchor the icon; a CSS-sized divIcon anchors off-centre.
 */
/**
 * Leaflet `Icon` instances are stateless and safely shared between markers, so
 * they are cached by their inputs. Without this, every hover rebuilt an icon
 * for all ~500 markers and react-leaflet called `setIcon` on each one.
 */
const iconCache = new Map();
function cached(key, build) {
  let icon = iconCache.get(key);
  if (!icon) {
    icon = build();
    iconCache.set(key, icon);
  }
  return icon;
}

/**
 * One width formula, used twice: to size the divIcon (leaflet needs real
 * numbers to anchor it) and to decide when two pills *collide* — collision has
 * to know how wide each pill actually is, or two long lakh prices still overlap
 * at a spacing that clears two short ones.
 */
function pillWidth(label) {
  return Math.min(
    120,
    Math.max(46, Math.round(String(label ?? "").length * 7.6) + 18),
  );
}

const PIN_HEIGHT = 26;
const PIN_TAIL = 6;

function priceIcon(label, active) {
  return cached(`pin|${active ? 1 : 0}|${label}`, () =>
    buildPriceIcon(label, active),
  );
}

function buildPriceIcon(label, active) {
  const text = String(label ?? "");
  const width = pillWidth(text);

  return L.divIcon({
    className: "bzr-map-icon",
    html: `<span class="bzr-pin${active ? " is-active" : ""}" style="min-width:${width}px">${escapeHtml(text)}</span>`,
    iconSize: [width, PIN_HEIGHT + PIN_TAIL],
    iconAnchor: [Math.round(width / 2), PIN_HEIGHT + PIN_TAIL],
    popupAnchor: [0, -(PIN_HEIGHT + PIN_TAIL)],
  });
}

/**
 * A "×3" stack pill — several ads whose price pills would paint on top of each
 * other at the current zoom, collapsed into one honest count.
 */
function stackIcon(count) {
  return cached(`stack|${count}`, () => {
    const size = count >= 10 ? 40 : count >= 5 ? 36 : 32;
    return L.divIcon({
      className: "bzr-map-icon",
      html: `<span class="bzr-stack" style="width:${size}px;height:${size}px">&times;${escapeHtml(
        count > 99 ? "99+" : count,
      )}</span>`,
      iconSize: [size, size],
      // Bottom-anchored like the pills it replaces, NOT centre-anchored. The
      // collision pass spaces anchor points assuming every icon's box sits
      // above its anchor; a centre-anchored badge would hang 16-20px below
      // the anchor into a neighbouring pill's cleared space — measured as a
      // real badge-on-pill kiss at zoom 13 before this was fixed.
      iconAnchor: [Math.round(size / 2), size],
      popupAnchor: [0, -size],
    });
  });
}

/** A per-city count bubble, sized by how much inventory sits under it. */
function clusterIcon(count, active) {
  return cached(`cluster|${active ? 1 : 0}|${count}`, () =>
    buildClusterIcon(count, active),
  );
}

function buildClusterIcon(count, active) {
  const size = count >= 100 ? 54 : count >= 25 ? 46 : count >= 10 ? 40 : 34;
  return L.divIcon({
    className: "bzr-map-icon",
    html: `<span class="bzr-cluster${active ? " is-active" : ""}" style="width:${size}px;height:${size}px">${escapeHtml(
      count > 999 ? "999+" : count,
    )}</span>`,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
    popupAnchor: [0, -Math.round(size / 2)],
  });
}

/* ------------------------------------------------------------------
 * Map plumbing
 * ---------------------------------------------------------------- */

/**
 * Absolute pixel position of a coordinate at a zoom level, straight off the
 * Web-Mercator CRS. Needs no map instance, and — the property the declutter
 * relies on — the pixel *distance* between two coordinates at a given zoom is
 * invariant under panning, so groupings only ever change on zoom, never while
 * dragging.
 */
function projectAtZoom(coords, zoomLevel) {
  return L.CRS.EPSG3857.latLngToPoint(
    L.latLng(coords[0], coords[1]),
    zoomLevel,
  );
}

function sameView(a, b) {
  if (!a || !b) return false;
  return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
}

/**
 * Open a marker's popup as soon as leaflet actually has one to open.
 *
 * A marker that pops out of a "×N" stack on selection mounts in the same
 * commit that set `selectedId`, and react-leaflet binds `<Popup>` in a
 * PASSIVE effect (`addPopup` in react-leaflet/lib/Popup.js) — so at every
 * moment React lets us run synchronously (our own effect, the ref callback),
 * `instance._popup` is still undefined and `openPopup()` is a silent no-op.
 * There is no "popup bound" event to subscribe to, so: try now, and retry on
 * a short bounded timer until the binding lands (typically the first retry).
 * The guard against `autoOpenedRef` makes a retry from a stale selection
 * abort instead of fighting the popup of a newer one.
 */
function openPopupWhenBound(instance, id, autoOpenedRef, tries = 8) {
  if (autoOpenedRef.current !== id) return;
  if (instance._popup && instance._map) {
    instance.openPopup();
    return;
  }
  if (tries <= 0) return;
  window.setTimeout(
    () => openPopupWhenBound(instance, id, autoOpenedRef, tries - 1),
    40,
  );
}

/**
 * `MapContainer`'s `center`/`zoom` are initial values only, so recentring
 * (the visitor changed city, or picked a listing) has to go through the map
 * instance.
 */
function ViewController({ center, zoom, resizeKey }) {
  const map = useMap();
  const last = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!center) return;
    if (sameView(last.current?.center, center) && last.current?.zoom === zoom)
      return;
    last.current = { center, zoom };
    // The first programmatic move is not animated: a fly-in from the default
    // national view to the stored city reads as a glitch, not a transition.
    map.setView(center, zoom, { animate: moved.current });
    moved.current = true;
  }, [center, zoom, map]);

  /**
   * The mobile Map/List switch hides the column with `hidden`, and leaflet
   * caches the container size — coming back shows a quarter-rendered map until
   * something invalidates it.
   */
  useEffect(() => {
    if (resizeKey === undefined) return;
    const id = window.setTimeout(() => map.invalidateSize(), 60);
    return () => window.clearTimeout(id);
  }, [resizeKey, map]);

  return null;
}

/**
 * Reports the viewport: which plotted ads are inside it, the zoom, and the
 * bounds. The ids drive the list; the bounds and zoom drive which pins are
 * worth putting in the DOM at all.
 */
function ViewportReporter({ points, onViewportChange }) {
  const map = useMap();

  const report = useCallback(() => {
    /**
     * A collapsed container has no viewport worth reporting.
     *
     * The mobile Map/List switch hides the map column with `hidden`, which
     * takes leaflet's container to 0x0 and fires `resize`. Reporting that
     * degenerate bounds emptied the visible set, so switching to List and back
     * to Map came back to a map with no pins on it at all. The last good
     * viewport is kept until a real resize replaces it.
     */
    const size = map.getSize();
    if (!size.x || !size.y) return;

    const bounds = map.getBounds();
    const visible = [];
    for (const point of points) {
      if (bounds.contains(point.coords)) visible.push(point.id);
    }
    onViewportChange({ ids: visible, zoom: map.getZoom(), bounds });
  }, [map, points, onViewportChange]);

  useMapEvents({ moveend: report, zoomend: report, resize: report });

  useEffect(() => {
    report();
  }, [report]);

  return null;
}

/**
 * The CAMERA half of list→map sync: bring the selected ad into view if it is
 * off-screen, and zoom past the clustering threshold if the map is still
 * showing city bubbles (the pins then mount on the next viewport report).
 *
 * Deliberately does NOT open the popup. That happens in the selected marker's
 * ref callback (see the pill `ref` below): an effect here re-runs whenever
 * `rendered` changes identity — which is every hover — and an effect-based
 * openPopup kept re-opening popups the visitor had just closed. It also
 * missed the pop-out mount entirely, because react-leaflet exposes a new
 * marker's instance on a second sync render and React flushes this effect
 * before that render happens.
 */
function SelectionController({
  selectedId,
  points,
  rendered,
  pinsVisible,
  pinZoom,
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const point = points.find((entry) => entry.id === selectedId);
    if (!point) return;

    if (!pinsVisible) {
      map.setView(point.coords, pinZoom + 1);
      return;
    }

    const isRendered = rendered.some((entry) => entry.id === selectedId);
    if (!isRendered || !map.getBounds().contains(point.coords)) {
      map.setView(point.coords, Math.max(map.getZoom(), pinZoom + 1));
    }
  }, [selectedId, points, rendered, pinsVisible, pinZoom, map]);

  return null;
}

/** Zoom buttons, because the default control is unstyleable in both themes. */
function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute end-2.5 top-2.5 z-[500] flex flex-col overflow-hidden rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) shadow-sm">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="grid h-8 w-8 place-items-center text-base font-semibold text-(--foreground) hover:bg-(--bzr-soft)"
      >
        +
      </button>
      <span className="h-px bg-(--border)" aria-hidden="true" />
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="grid h-8 w-8 place-items-center text-base font-semibold text-(--foreground) hover:bg-(--bzr-soft)"
      >
        &minus;
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Map
 * ---------------------------------------------------------------- */

export default function ListingMap({
  points = [],
  cities = [],
  center = INDIA_CENTER,
  zoom = INDIA_ZOOM,
  /** "explorer" = clustering + viewport reporting · "single" = one ad, one area. */
  variant = "explorer",
  /** Radius of the honest "approximate area" ring, in metres. Single variant. */
  radiusMeters = 1400,
  selectedId = null,
  hoveredId = null,
  onSelect,
  onHover,
  onViewportChange,
  resizeKey,
  scrollWheelZoom = true,
  ariaLabel = "Map of ads",
}) {
  const single = variant === "single";
  /** `{ zoom, bounds }` as last reported by the map itself; null until mounted. */
  const [viewport, setViewport] = useState(null);
  /**
   * Tiles are a network dependency, and a map that fails silently is a grey
   * void. Track whether anything ever loaded so the container can say so.
   */
  const [tileState, setTileState] = useState("pending");
  const markerRefs = useRef(new Map());
  /**
   * Which pin the popup was last auto-opened for. Selection opens the popup
   * from the marker's REF callback, not from an effect — see the comment on
   * the ref below — and this guards it so a re-render cannot re-open a popup
   * the visitor has deliberately closed. Cleared when the selection clears,
   * so re-selecting the same ad opens it again.
   */
  const autoOpenedFor = useRef(null);

  useEffect(() => {
    if (!selectedId) autoOpenedFor.current = null;
  }, [selectedId]);

  const cityCoords = useMemo(() => {
    const map = new Map();
    for (const city of cities) {
      if (city?.coords) map.set(city.slug, city);
    }
    return map;
  }, [cities]);

  const plotted = useMemo(
    () =>
      points.filter((p) => Array.isArray(p?.coords) && p.coords.length === 2),
    [points],
  );

  const zoomLevel = viewport?.zoom ?? zoom;
  const showPins =
    single || plotted.length <= PIN_ALWAYS_MAX || zoomLevel >= PIN_ZOOM;

  /**
   * The pins that actually reach the DOM: inside the padded viewport, capped.
   *
   * Before the map has reported a viewport we render nothing for a big set
   * (the report lands in a mount effect, so this is one frame) but everything
   * for a small one, which covers the single-listing variant that has no
   * reporter at all.
   */
  const pinPoints = useMemo(() => {
    if (!showPins) return [];
    if (!viewport?.bounds) {
      return plotted.length <= PIN_ALWAYS_MAX ? plotted : [];
    }
    const padded = viewport.bounds.pad(VIEWPORT_PAD);
    const out = [];
    for (const point of plotted) {
      if (!padded.contains(point.coords)) continue;
      out.push(point);
      if (out.length >= MAX_RENDERED_PINS) break;
    }
    return out;
  }, [showPins, viewport, plotted]);

  /**
   * Declutter: pills that would paint on top of each other collapse into one
   * "×N" stack pill.
   *
   * The viewport cap bounded the DOM node count but not visual collision —
   * Mumbai at zoom 11 spreads a locality over ~90px while two lakh-price
   * pills need ~180px between centres to clear each other, so the bottom of
   * every cluster was an unreadable pile. Showing the density as a count is
   * the honest fix; nudging pills apart would draw ads where they are not.
   *
   * Mechanics:
   * - Greedy seed-absorb over the (deterministic) point order: a pin within
   *   half-width sum + gap of an existing seed joins it, else it becomes one.
   *   Width-aware, because a fixed radius that clears `₹1,100` still leaves
   *   `₹40,50,000` overlapping. O(pins × seeds), bounded by the 240-pin cap.
   * - Projection via the CRS, not the map instance, so grouping depends only
   *   on zoom — panning never reshuffles the stacks.
   * - The selected and hovered pins are *excluded* from grouping: picking a
   *   list row whose ad sits inside a stack pops that one pill out on top
   *   (active-styled, z-raised) instead of leaving the row pointing at
   *   nothing. That is the row→pin sync answer for grouped ads.
   * - Clicking a stack zooms in STACK_ZOOM_STEP levels on it (pixel spacing
   *   quadruples, which resolves the overwhelming majority); at max zoom,
   *   where zooming is impossible, it opens a popup listing the members —
   *   two ads jittered onto near-identical coordinates can legitimately
   *   collide even at zoom 18.
   */
  const { singlePins, stackPins } = useMemo(() => {
    if (pinPoints.length === 0) return { singlePins: [], stackPins: [] };

    const zInt = Math.round(zoomLevel);
    const popped = [];
    const groupable = [];
    for (const point of pinPoints) {
      if (point.id === selectedId || point.id === hoveredId) popped.push(point);
      else groupable.push(point);
    }

    const seeds = [];
    for (const point of groupable) {
      const projected = projectAtZoom(point.coords, zInt);
      const width = pillWidth(point.priceLabel);
      const seed = seeds.find(
        (entry) =>
          Math.abs(entry.projected.x - projected.x) <
            (entry.width + width) / 2 + PIN_GAP_X &&
          Math.abs(entry.projected.y - projected.y) < PIN_GAP_Y,
      );
      if (seed) seed.members.push(point);
      else seeds.push({ projected, width, members: [point], anchor: point });
    }

    const singles = [...popped];
    const stacks = [];
    for (const seed of seeds) {
      if (seed.members.length === 1) singles.push(seed.members[0]);
      else
        stacks.push({
          key: `stack-${seed.anchor.id}`,
          coords: seed.anchor.coords,
          members: seed.members,
        });
    }
    return { singlePins: singles, stackPins: stacks };
  }, [pinPoints, zoomLevel, selectedId, hoveredId]);

  /** One bubble per city that has both coordinates and inventory in view. */
  const clusters = useMemo(() => {
    if (showPins) return [];
    const grouped = new Map();
    for (const point of plotted) {
      const city = cityCoords.get(point.citySlug);
      if (!city) continue;
      const entry = grouped.get(point.citySlug);
      if (entry) entry.count += 1;
      else
        grouped.set(point.citySlug, {
          slug: city.slug,
          name: city.name,
          coords: city.coords,
          count: 1,
        });
    }
    return [...grouped.values()].sort((a, b) => b.count - a.count);
  }, [showPins, plotted, cityCoords]);

  const handleViewport = useCallback(
    (next) => {
      setViewport({ zoom: next.zoom, bounds: next.bounds });
      // The parent only needs the ids and the zoom; bounds are leaflet's.
      onViewportChange?.({ ids: next.ids, zoom: next.zoom });
    },
    [onViewportChange],
  );

  const emptyPlot = plotted.length === 0;

  return (
    <div
      className="bzr-map relative h-full w-full overflow-hidden rounded-[var(--bzr-radius,0.75rem)] border border-(--border) bg-(--bzr-media)"
      /* Leaflet's panes run to z-index 800 and its controls to 1000, while the
         Bazaar sticky search bar is z-40. Without an isolated stacking context
         the map paints straight over the header on scroll. */
      style={{ isolation: "isolate" }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={3}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom={scrollWheelZoom}
        zoomControl={false}
        attributionControl
        worldCopyJump={false}
        /**
         * Zoom animation off, deliberately, and this is load-bearing.
         *
         * Leaflet's animated zoom is a small state machine: `_animatingZoom`
         * goes true, and `_tryAnimatedZoom` swallows every subsequent
         * single-step zoom (`return true` before it looks at anything else)
         * until a transition-end clears the flag. Measured in this app the
         * flag got stuck on, and the symptom was silent and total: the +/-
         * buttons, the scroll wheel and `setZoom` all did nothing, while a
         * jump of more than `zoomAnimationThreshold` (4) levels still worked
         * because it skips the animated path. With the animation off the flag
         * is never set, so there is nothing to get stuck. Instant zoom is also
         * the better trade on the low-end Android this is built for, and it
         * matches bazaar.css, which already neutralises every transform under
         * `prefers-reduced-motion`.
         */
        zoomAnimation={false}
        aria-label={ariaLabel}
        style={{
          height: "100%",
          width: "100%",
          background: "var(--bzr-media)",
        }}
      >
        <TileLayer
          url={OSM_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={MAX_ZOOM}
          eventHandlers={{
            tileload: () => setTileState((s) => (s === "ok" ? s : "ok")),
            tileerror: () => setTileState((s) => (s === "ok" ? s : "error")),
          }}
        />

        <ViewController center={center} zoom={zoom} resizeKey={resizeKey} />
        <ZoomButtons />

        {variant === "explorer" ? (
          <>
            <ViewportReporter
              points={plotted}
              onViewportChange={handleViewport}
            />
            <SelectionController
              selectedId={selectedId}
              points={plotted}
              rendered={singlePins}
              pinsVisible={showPins}
              pinZoom={PIN_ZOOM}
            />
          </>
        ) : null}

        {/* Single-listing variant: the ring carries the honesty. A bare pin
            implies an address we do not have and would not publish. */}
        {single && plotted[0] ? (
          <Circle
            center={plotted[0].coords}
            radius={radiusMeters}
            /* Styled by class, not by `color`/`fillColor`: leaflet writes those
               as SVG presentation attributes, where `var(--primary)` does not
               resolve. A CSS rule on the class outranks the attribute. */
            pathOptions={{ className: "bzr-area-ring", weight: 1.5 }}
          />
        ) : null}

        {/* City bubbles at national/state zoom. */}
        {clusters.map((cluster) => (
          <Marker
            key={`cluster-${cluster.slug}`}
            position={cluster.coords}
            icon={clusterIcon(cluster.count, false)}
            keyboard={false}
            title={`${cluster.name} — ${cluster.count} ad${cluster.count === 1 ? "" : "s"}`}
            alt={`${cluster.count} ads in ${cluster.name}`}
            eventHandlers={{
              click: (event) => {
                // A bubble is a "take me there" affordance, not a popup.
                event.target._map?.setView(cluster.coords, PIN_ZOOM + 1);
              },
            }}
          />
        ))}

        {/* Local "×N" stacks — pills that would collide at this zoom. */}
        {stackPins.map((stack) => (
          <Marker
            key={stack.key}
            position={stack.coords}
            icon={stackIcon(stack.members.length)}
            zIndexOffset={200}
            alt={`${stack.members.length} ads stacked here`}
            title={`${stack.members.length} ads here — click to zoom in`}
            eventHandlers={{
              click: (event) => {
                const map = event.target._map;
                if (!map) return;
                const current = map.getZoom();
                if (current >= MAX_ZOOM) return; // popup takes over below
                // "Spread into its members" is a SEPARATION problem, not a
                // fit problem. `fitBounds` on the members is a trap here: a
                // stack's members are by definition within about one pill of
                // each other, so their bounds already "fit" at the current
                // zoom and fitBounds computes a no-op — measured exactly so
                // (target zoom == current zoom) before this was rewritten.
                //
                // Instead, zoom in until the group's current pixel spread
                // would fill ~60% of the shorter viewport side: enough for
                // the pills to come apart, while keeping every member on or
                // near the screen. Clamped to [1..3] levels so a click always
                // does something and near-coincident members cannot yank the
                // camera to street level in one go; if a smaller stack
                // remains, the next click climbs the same ladder, and at max
                // zoom the popup takes over. Centred on the centroid, not the
                // anchor, so the spread happens around the middle of the
                // group. Zooming re-runs the grouping, which unmounts this
                // marker.
                let latSum = 0;
                let lngSum = 0;
                const projected = stack.members.map((member) => {
                  latSum += member.coords[0];
                  lngSum += member.coords[1];
                  return projectAtZoom(member.coords, current);
                });
                let spread = 0;
                for (let i = 0; i < projected.length; i++) {
                  for (let j = i + 1; j < projected.length; j++) {
                    spread = Math.max(
                      spread,
                      Math.hypot(
                        projected[i].x - projected[j].x,
                        projected[i].y - projected[j].y,
                      ),
                    );
                  }
                }
                const size = map.getSize();
                const room = 0.6 * Math.min(size.x, size.y);
                const wanted =
                  spread > 0
                    ? Math.round(Math.log2(room / spread))
                    : STACK_ZOOM_STEP;
                const step = Math.max(1, Math.min(3, wanted));
                map.setView(
                  [
                    latSum / stack.members.length,
                    lngSum / stack.members.length,
                  ],
                  Math.min(MAX_ZOOM, current + step),
                );
              },
            }}
          >
            {/* The popup is bound ONLY at MAX_ZOOM, where "zoom in to spread"
                has no zoom left (jitter can land two ads near-coincident even
                at street level, and a click that does nothing is a dead end).
                Below max zoom it must not exist at all: a bound popup opens
                and toggles on the very click that runs the zoom handler, and
                its open/auto-pan fights the camera move. */}
            {zoomLevel >= MAX_ZOOM ? (
              <Popup className="bzr-map-popup" minWidth={196} maxWidth={220}>
                <div className="w-[196px]">
                  <p className="text-[0.8rem] font-bold text-(--foreground)">
                    {stack.members.length} ads in this spot
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {stack.members.slice(0, 5).map((member) => (
                      <li key={member.id} className="leading-snug">
                        <Link
                          href={`/bazaar/item/${member.slug}`}
                          className="text-[0.78rem] font-semibold text-(--primary) underline"
                        >
                          {member.priceLabel} — {member.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {stack.members.length > 5 ? (
                    <p className="mt-1 text-[0.72rem] text-(--muted-foreground)">
                      and {stack.members.length - 5} more nearby
                    </p>
                  ) : null}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ))}

        {/* Individual price pills, viewport-limited and decluttered. */}
        {singlePins.map((point) => {
          const active = point.id === selectedId || point.id === hoveredId;
          return (
            <Marker
              key={point.id}
              position={point.coords}
              icon={priceIcon(point.priceLabel, active)}
              zIndexOffset={active ? 900 : 0}
              alt={`${point.priceLabel} — ${point.title}`}
              title={`${point.priceLabel} — ${point.title}`}
              ref={(instance) => {
                if (!instance) {
                  markerRefs.current.delete(point.id);
                  return;
                }
                markerRefs.current.set(point.id, instance);
                /**
                 * Selection's popup opens from HERE, not from an effect in
                 * SelectionController. A pin that pops out of a "×N" stack on
                 * selection mounts in the same commit that set `selectedId`;
                 * react-leaflet only exposes the instance on a second sync
                 * render, and React flushes the already-queued passive
                 * effects BEFORE that render — so an effect-based openPopup
                 * ran against an empty ref map once and was never
                 * re-triggered (the internal second render changes no
                 * props). The ref is the earliest point where the instance
                 * exists at all; `openPopupWhenBound` then absorbs the last
                 * gap, that react-leaflet binds the <Popup> child in a
                 * passive effect which has not run yet either.
                 */
                if (
                  point.id === selectedId &&
                  autoOpenedFor.current !== point.id
                ) {
                  autoOpenedFor.current = point.id;
                  openPopupWhenBound(instance, point.id, autoOpenedFor);
                }
              }}
              eventHandlers={{
                click: () => onSelect?.(point.id),
                mouseover: () => onHover?.(point.id),
                mouseout: () => onHover?.(null),
              }}
            >
              <Popup className="bzr-map-popup" minWidth={196} maxWidth={220}>
                <div className="w-[196px]">
                  {point.image ? (
                    <ManagedImage
                      src={point.image}
                      alt=""
                      width={196}
                      height={104}
                      className="h-[104px] w-full rounded-[var(--bzr-radius-sm,0.5rem)] object-cover"
                    />
                  ) : null}
                  <p className="mt-2 text-[0.95rem] font-bold leading-none text-(--foreground)">
                    {point.priceLabel}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[0.8rem] font-medium leading-snug text-(--foreground)">
                    {point.title}
                  </p>
                  <p className="mt-1 text-[0.72rem] text-(--muted-foreground)">
                    {point.locality}
                    {point.cityName ? `, ${point.cityName}` : ""} · approximate
                    area
                  </p>
                  <Link
                    href={`/bazaar/item/${point.slug}`}
                    className="mt-2 inline-block text-[0.78rem] font-semibold text-(--primary) underline"
                  >
                    View this ad
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Degradation, not a grey void: say what happened and where we are. */}
      {tileState === "error" ? (
        <p className="pointer-events-none absolute inset-x-3 top-3 z-[600] rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card)/95 px-3 py-2 text-xs font-medium text-(--foreground) shadow-sm">
          Map tiles could not load (no network). Pins are still placed correctly
          relative to each other.
        </p>
      ) : null}

      {emptyPlot ? (
        <p className="pointer-events-none absolute inset-0 z-[600] grid place-items-center px-6 text-center text-sm font-medium text-(--muted-foreground)">
          No ads in this selection can be placed on a map.
        </p>
      ) : null}

      <style>{`
        .bzr-map .leaflet-container {
          font: inherit;
          background: var(--bzr-media);
          outline: none;
        }
        .bzr-map .leaflet-control-attribution {
          background: color-mix(in srgb, var(--card) 92%, transparent);
          color: var(--muted-foreground);
          font-size: 0.65rem;
          padding: 1px 6px;
          /* Physical on purpose: Leaflet pins this control to the physical
             bottom-right corner regardless of document direction, so the
             rounded corner must stay the physical top-left to match. */
          border-top-left-radius: 0.35rem;
        }
        .bzr-map .leaflet-control-attribution a { color: var(--primary); }
        .bzr-map .bzr-map-icon { background: none; border: 0; }

        .bzr-map .bzr-area-ring {
          stroke: var(--primary);
          stroke-opacity: 0.75;
          fill: var(--primary);
          fill-opacity: 0.12;
        }

        .bzr-map .bzr-pin {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 26px;
          padding: 0 8px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgb(0 0 0 / 0.28);
          transition: transform 120ms ease, background 120ms ease;
        }
        /* The tail is what makes a pill read as "this exact spot".
           left:50% + translateX(-50%) is symmetric centring — identical in
           both directions, so physical is fine here. */
        .bzr-map .bzr-pin::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top: 6px solid var(--card);
        }
        .bzr-map .bzr-pin.is-active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--primary-foreground, #fff);
          transform: scale(1.1);
          z-index: 2;
        }
        .bzr-map .bzr-pin.is-active::after { border-top-color: var(--primary); }

        /* A local stack of colliding pills. Deliberately NOT the city-bubble
           style: outline-on-card reads as "several of the pills you are
           already looking at", where the solid primary bubble means "a whole
           city you have not zoomed into yet". */
        .bzr-map .bzr-stack {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: var(--card);
          border: 2px solid var(--primary);
          color: var(--foreground);
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 1px 4px rgb(0 0 0 / 0.28);
        }

        .bzr-map .bzr-cluster {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary) 88%, var(--card));
          color: var(--primary-foreground, #fff);
          border: 2px solid var(--card);
          font-size: 0.78rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.3);
        }

        .bzr-map .bzr-map-popup .leaflet-popup-content-wrapper {
          background: var(--card);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: var(--bzr-radius-sm, 0.5rem);
          padding: 0;
          box-shadow: 0 6px 20px rgb(0 0 0 / 0.22);
        }
        .bzr-map .bzr-map-popup .leaflet-popup-content { margin: 8px; }
        .bzr-map .bzr-map-popup .leaflet-popup-tip {
          background: var(--card);
          border: 1px solid var(--border);
        }
        .bzr-map .bzr-map-popup a.leaflet-popup-close-button { color: var(--muted-foreground); }

        /* OSM raster tiles are drawn for a light page. Inverting only the tile
           pane keeps a dark UI coherent without darkening the pins, which live
           in the marker pane. */
        [data-theme="dark"] .bzr-map .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.9) saturate(0.82);
        }

        @media (prefers-reduced-motion: reduce) {
          .bzr-map .bzr-pin { transition: none; }
          .bzr-map .bzr-pin.is-active { transform: none; }
        }
      `}</style>
    </div>
  );
}
