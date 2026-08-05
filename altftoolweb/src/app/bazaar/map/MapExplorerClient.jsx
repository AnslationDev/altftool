"use client";

/**
 * /bazaar/map — the split map + list explorer.
 *
 * Three decisions worth knowing before editing this:
 *
 * 1. **The URL is still the filter state.** This page reads exactly the browse
 *    contract (`?city=`, `?category=`, `?min=`, `?max=`, `?q=`) and writes it
 *    back through `router.push`, so a map view is linkable and a filter set
 *    survives moving between `/bazaar/search` and here. Nothing filters in
 *    component state. `useSearchParams()` means this tree must sit inside a
 *    `<Suspense>` boundary — the page provides it.
 *
 * 2. **The list is the map's viewport, not a second copy of the results.** The
 *    map reports which plotted ads are inside its bounds after every pan and
 *    zoom, and the list renders that set. Before the map has reported anything
 *    (server render, and the moment before hydration) the list shows the whole
 *    result set, which is the honest superset.
 *
 * 3. **The map mounts only once the store has hydrated.** The default view is
 *    the visitor's stored `citySlug`, which is unknowable during SSR. Rendering
 *    the same-height `MapSkeleton` until `useHydrated()` is true keeps server
 *    and first client render identical and avoids mounting at all-India and
 *    then jerking to Pune.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Crosshair,
  Info,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import MapPanel, { MapSkeleton } from "../components/MapPanel";
import { EmptyState, Note } from "../components/primitives";
import { getMarket } from "../data/market";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/** Matches ListingMap's own defaults; duplicated so the list header can label it. */
const INDIA_CENTER = [22.6, 79.4];
const INDIA_ZOOM = 4;
/**
 * Zoom used when the view is pinned to one city.
 *
 * 13, not 11: listings scatter over roughly a 6 km box, which is exactly what
 * a 360px-wide map shows at zoom 13 — so the whole city still fits. At 11 the
 * pill-collision declutter (correctly) collapsed the entire city into two
 * "×N" stacks and the landing view showed no price at all; at 13 the opening
 * frame is a readable mix of price pills and small stacks.
 */
const CITY_ZOOM = 13;
/** Rows are cheap but not free; the map is the overview, the list is a sample. */
const LIST_LIMIT = 60;
/**
 * Before the map has reported a viewport — the server render, and the frame
 * before hydration — the list is the whole result set, and 60 rows of it is
 * pure page weight the client discards immediately. 24 is the repo's standing
 * cap on server-rendered cards.
 */
const PRE_VIEWPORT_LIST_LIMIT = 24;

/** Map height, in one place, because the skeleton has to agree with it exactly. */
const MAP_HEIGHT = "clamp(420px, 66vh, 720px)";

function buildHref(params) {
  const search = params.toString();
  return search ? `/bazaar/map?${search}` : "/bazaar/map";
}

export default function MapExplorerClient({
  points = [],
  cities = [],
  categories = [],
  total = 0,
  plottedTotal = 0,
  cap = 0,
}) {
  const { t, categoryName } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const storedCity = useBazaarStore((s) => s.citySlug);
  const [isPending, startTransition] = useTransition();

  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";
  const q = searchParams.get("q") || "";

  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [visibleIds, setVisibleIds] = useState(null);
  const [mobileView, setMobileView] = useState("map");
  const rowRefs = useRef(new Map());

  const cityBySlug = useMemo(
    () => new Map(cities.map((c) => [c.slug, c])),
    [cities],
  );
  const pointById = useMemo(
    () => new Map(points.map((p) => [p.id, p])),
    [points],
  );

  /**
   * The remembered city is an *opening* view, not a standing rule.
   *
   * `useBazaarStore` cannot express "no city chosen" — `citySlug` defaults to
   * Mumbai — so the store has to be told to stop having an opinion the moment
   * the visitor picks "All India". Otherwise clearing the city would delete
   * `?city=`, the store default would take over again, the map would snap
   * straight back to Mumbai, and the national view would be unreachable.
   *
   * Only *clearing* sets this: choosing a real city already wins on its own, so
   * flipping the flag then would move the map twice.
   */
  const [cityCleared, setCityCleared] = useState(false);

  /**
   * Where to open. An explicit `?city=` wins: it came from a link somebody
   * shared. Then the remembered city, then all-India.
   */
  const view = useMemo(() => {
    const explicit = city ? cityBySlug.get(city) : null;
    if (explicit?.coords) return { center: explicit.coords, zoom: CITY_ZOOM };
    // A city we have no coordinates for gets the national view, not a guess.
    if (city) return { center: INDIA_CENTER, zoom: INDIA_ZOOM };
    if (!cityCleared) {
      const remembered = storedCity ? cityBySlug.get(storedCity) : null;
      if (remembered?.coords)
        return { center: remembered.coords, zoom: CITY_ZOOM };
    }
    return { center: INDIA_CENTER, zoom: INDIA_ZOOM };
  }, [city, storedCity, cityBySlug, cityCleared]);

  /** Filter writes go through the URL, so back/forward and sharing both work. */
  const setParam = useCallback(
    (updates) => {
      if ("city" in updates && !updates.city) setCityCleared(true);
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value === null || value === undefined)
          next.delete(key);
        else next.set(key, String(value));
      }
      startTransition(() => router.push(buildHref(next), { scroll: false }));
    },
    [router, searchParams],
  );

  const handleViewport = useCallback(({ ids }) => {
    setVisibleIds(ids);
  }, []);

  const visiblePoints = useMemo(() => {
    if (visibleIds === null) return points;
    const inView = [];
    for (const id of visibleIds) {
      const point = pointById.get(id);
      if (point) inView.push(point);
    }
    return inView;
  }, [visibleIds, points, pointById]);

  const listLimit = visibleIds === null ? PRE_VIEWPORT_LIST_LIMIT : LIST_LIMIT;
  const listRows = visiblePoints.slice(0, listLimit);

  /** Picking a pin should reveal its row, not leave it 40 rows down. */
  useEffect(() => {
    if (!selectedId) return;
    const row = rowRefs.current.get(selectedId);
    row?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const activeFilters = [
    city ? { key: "city", label: cityBySlug.get(city)?.name || city } : null,
    category
      ? {
          key: "category",
          label: categories.find((c) => c.slug === category)?.name || category,
        }
      : null,
    q ? { key: "q", label: `“${q}”` } : null,
    min
      ? {
          key: "min",
          label: `Min ${getMarket().currencySymbol}${Number(min).toLocaleString(getMarket().numberLocale)}`,
        }
      : null,
    max
      ? {
          key: "max",
          label: `Max ${getMarket().currencySymbol}${Number(max).toLocaleString(getMarket().numberLocale)}`,
        }
      : null,
  ].filter(Boolean);

  const capped = plottedTotal > cap;

  return (
    <div className="pb-12">
      {/* ---------------- Filters (URL-backed) ---------------- */}
      <form
        className="bzr-panel mb-3 flex flex-wrap items-end gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setParam({
            q: String(data.get("q") || "").trim(),
            min: String(data.get("min") || "").trim(),
            max: String(data.get("max") || "").trim(),
          });
        }}
      >
        <p className="flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {t("filter.heading")}
        </p>

        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-medium text-(--muted-foreground)">
          {t("filter.city")}
          <select
            value={city}
            onChange={(event) => setParam({ city: event.target.value })}
            className="rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-2.5 py-2 text-sm text-(--foreground)"
          >
            <option value="">{t("filter.allCountry", { country: getMarket().countryName })}</option>
            {cities.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name}
                {entry.coords ? "" : " (not mapped)"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-medium text-(--muted-foreground)">
          {t("filter.category")}
          <select
            value={category}
            onChange={(event) => setParam({ category: event.target.value })}
            className="rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-2.5 py-2 text-sm text-(--foreground)"
          >
            <option value="">{t("filter.allCategories")}</option>
            {categories.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {categoryName(entry.slug, entry.name)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs font-medium text-(--muted-foreground)">
          {t("map.keyword")}
          <input
            key={`q-${q}`}
            name="q"
            defaultValue={q}
            type="search"
            placeholder="iPhone, sofa…"
            className="rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-2.5 py-2 text-sm text-(--foreground)"
          />
        </label>

        <label className="flex w-[6.5rem] flex-col gap-1 text-xs font-medium text-(--muted-foreground)">
          {t("map.minRupee", { symbol: getMarket().currencySymbol })}
          <input
            key={`min-${min}`}
            name="min"
            defaultValue={min}
            type="number"
            min="0"
            inputMode="numeric"
            className="rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-2.5 py-2 text-sm text-(--foreground)"
          />
        </label>

        <label className="flex w-[6.5rem] flex-col gap-1 text-xs font-medium text-(--muted-foreground)">
          {t("map.maxRupee", { symbol: getMarket().currencySymbol })}
          <input
            key={`max-${max}`}
            name="max"
            defaultValue={max}
            type="number"
            min="0"
            inputMode="numeric"
            className="rounded-[var(--bzr-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-2.5 py-2 text-sm text-(--foreground)"
          />
        </label>

        <button type="submit" className="bzr-btn shrink-0">
          {t("map.apply")}
        </button>
      </form>

      {activeFilters.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className="bzr-chip is-active"
              onClick={() => setParam({ [filter.key]: "" })}
              aria-label={t("filter.remove", { label: filter.label })}
            >
              {filter.label}
              <X className="ms-1 h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <Link href="/bazaar/map" className="bzr-chip">
            {t("filter.clearAll")}
          </Link>
        </div>
      ) : null}

      {/* ---------------- Honesty about what a pin means ---------------- */}
      <div className="mb-3">
        <Note icon={Info}>
          Pins mark an{" "}
          <strong className="font-semibold">approximate area</strong> — a
          neighbourhood, never a street address. Sellers share the exact meeting
          point in chat. Zoomed out, each bubble is a city count; zoom in to see
          individual ads.
        </Note>
      </div>

      {/* ---------------- Mobile Map / List switch ---------------- */}
      <div
        className="mb-3 flex gap-2 lg:hidden"
        role="group"
        aria-label={t("map.viewToggle")}
      >
        <button
          type="button"
          className={`bzr-chip flex-1 justify-center ${mobileView === "map" ? "is-active" : ""}`}
          aria-pressed={mobileView === "map"}
          onClick={() => setMobileView("map")}
        >
          <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {t("map.map")}
        </button>
        <button
          type="button"
          className={`bzr-chip flex-1 justify-center ${mobileView === "list" ? "is-active" : ""}`}
          aria-pressed={mobileView === "list"}
          onClick={() => setMobileView("list")}
        >
          <List className="h-3.5 w-3.5" aria-hidden="true" />
          {t("map.list")}
          <span className="ms-1 opacity-70">{visiblePoints.length}</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ---------------- Map ---------------- */}
        <div className={`${mobileView === "map" ? "" : "hidden"} lg:block`}>
          {hydrated ? (
            <MapPanel
              height={MAP_HEIGHT}
              points={points}
              cities={cities}
              center={view.center}
              zoom={view.zoom}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              onViewportChange={handleViewport}
              resizeKey={mobileView}
              ariaLabel="Map of approximate ad locations"
            />
          ) : (
            <div style={{ height: MAP_HEIGHT }}>
              <MapSkeleton label={t("map.loading")} />
            </div>
          )}
        </div>

        {/* ---------------- List of what is in view ---------------- */}
        <section
          aria-label={t("map.adsInView")}
          className={`${mobileView === "list" ? "" : "hidden"} min-w-0 lg:block`}
        >
          <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-sm font-semibold text-(--foreground)">
              {visibleIds === null
                ? `${points.length.toLocaleString("en-IN")} ads plotted`
                : `${visiblePoints.length.toLocaleString("en-IN")} ad${
                    visiblePoints.length === 1 ? "" : "s"
                  } in view`}
            </h2>
            <p className="text-xs text-(--muted-foreground)">
              {total.toLocaleString("en-IN")} match{total === 1 ? "es" : ""}{" "}
              these filters
              {isPending ? " · updating…" : ""}
            </p>
          </header>

          {capped ? (
            <p className="mb-2 text-xs text-(--muted-foreground)">
              {cap.toLocaleString("en-IN")} of{" "}
              {plottedTotal.toLocaleString("en-IN")} mappable ads are plotted.
              Pick a city or a category to map every one of them.
            </p>
          ) : null}
          {plottedTotal < total ? (
            <p className="mb-2 text-xs text-(--muted-foreground)">
              {(total - plottedTotal).toLocaleString("en-IN")} ad
              {total - plottedTotal === 1 ? "" : "s"} sit in cities we have no
              coordinates for, so they are not on the map.
            </p>
          ) : null}

          {listRows.length === 0 ? (
            <EmptyState title={t("empty.map.title")} message={t("empty.map.message")} />
          ) : (
            /* The scroll box is capped at the map height so the split view lines
               up on desktop and the scrolling stays inside the column. */
            <ul className="flex max-h-[clamp(420px,66vh,720px)] flex-col gap-1.5 overflow-y-auto rounded-[var(--bzr-radius,0.75rem)] border border-(--border) bg-(--card) p-1.5">
              {listRows.map((point) => {
                const active = point.id === selectedId;
                return (
                  <li
                    key={point.id}
                    ref={(node) => {
                      if (node) rowRefs.current.set(point.id, node);
                      else rowRefs.current.delete(point.id);
                    }}
                    onMouseEnter={() => setHoveredId(point.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`flex items-center gap-2.5 rounded-[var(--bzr-radius-sm,0.5rem)] border p-1.5 transition-colors ${
                      active
                        ? "border-(--primary) bg-(--bzr-soft)"
                        : point.id === hoveredId
                          ? "border-(--bzr-line) bg-(--bzr-card-hover)"
                          : "border-transparent"
                    }`}
                  >
                    <Link
                      href={`/bazaar/item/${point.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-2.5"
                      onFocus={() => setHoveredId(point.id)}
                      onBlur={() => setHoveredId(null)}
                    >
                      <span className="relative block h-14 w-16 shrink-0 overflow-hidden rounded-[var(--bzr-radius-sm,0.5rem)] bg-(--bzr-media)">
                        {point.image ? (
                          <ManagedImage
                            src={point.image}
                            alt=""
                            width={64}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-(--foreground)">
                          {point.priceLabel}
                        </span>
                        <span className="block truncate text-xs font-medium text-(--foreground)">
                          {point.title}
                        </span>
                        <span className="block truncate text-[0.7rem] text-(--muted-foreground)">
                          {point.locality}
                          {point.cityName ? `, ${point.cityName}` : ""}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedId(point.id)}
                      aria-label={`Show ${point.title} on the map`}
                      aria-pressed={active}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-(--border) text-(--muted-foreground) hover:bg-(--bzr-soft) hover:text-(--foreground)"
                    >
                      <Crosshair className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {visiblePoints.length > listLimit ? (
            <p className="mt-2 text-xs text-(--muted-foreground)">
              Showing the first {listLimit} of{" "}
              {visiblePoints.length.toLocaleString("en-IN")} ads
              {visibleIds === null ? " plotted" : " in view"}. Zoom in to narrow
              it down.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
