"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Search,
  WifiOff,
  Clock,
  Star,
  Store,
  ShoppingCart,
  Shirt,
  Footprints,
  BookOpen,
  Gem,
  ChevronDown,
  Tag,
} from "lucide-react";
import {
  GOOGLE_LIKE_TILE_URL,
  GOOGLE_LIKE_ATTRIBUTION,
  DEFAULT_MAP_ZOOM,
  SELECTED_MAP_ZOOM,
  getMapCenter,
  getResultExternalLink,
  getDirectionsUrl,
} from "@/lib/sale/map.service.js";
import { useMallPromotions } from "@/app/sale/hooks/useMallPromotions";
import MallPromotions from "./MallPromotions";

const CATEGORY_LABELS = {
  shopping_mall: "Shopping mall",
  department_store: "Department store",
  electronics_store: "Electronics store",
  clothing_store: "Clothing store",
  shoe_store: "Shoe store",
  supermarket: "Supermarket",
  book_store: "Book store",
  jewelry_store: "Jewelry store",
};

function humanizeCategory(category) {
  return CATEGORY_LABELS[category] || "Store";
}

/**
 * Format a distance for display the way Google does — meters below 1km,
 * kilometres above.
 */
function formatDistance(km) {
  if (!Number.isFinite(km)) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`;
}

// Google Maps' marker palette — used only for pin/dot color, not real data.
const PIN_COLOR = "#EA4335"; // Google's default red POI pin
const SELECTED_PIN_COLOR = "#1A73E8"; // Google's accent blue when a place is focused
const ORIGIN_DOT_COLOR = "#4285F4"; // Google's "you are here" blue dot

const CATEGORY_ICONS = {
  shopping_mall: Store,
  department_store: Store,
  electronics_store: ShoppingCart,
  clothing_store: Shirt,
  shoe_store: Footprints,
  supermarket: ShoppingCart,
  book_store: BookOpen,
  jewelry_store: Gem,
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || Store;
}

/**
 * OSM's opening_hours tag is a free-text mini-DSL (e.g. "Mo-Su 10:00-22:00").
 * Fully parsing it needs a real opening_hours library; here we only pull out
 * a simple "HH:MM-HH:MM" range for a friendly display and fall back to the
 * raw tag otherwise — never invented, always what the place is actually
 * tagged with in OpenStreetMap.
 */
function to12h(h, m) {
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m}${period}`;
}

function formatOpeningHours(raw) {
  if (!raw) return null;
  const match = raw.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return raw.length > 48 ? `${raw.slice(0, 48)}…` : raw;
  return `${to12h(match[1], match[2])} – ${to12h(match[3], match[4])}`;
}

/**
 * Compute a Google-style "Open · Closes 10pm" / "Closed · Opens 10am" status
 * from the real OSM opening_hours tag. This only understands a single daily
 * time range applied every day (handling an overnight range that crosses
 * midnight) — it does not parse day-of-week exceptions in the opening_hours
 * mini-DSL, so it's a reasonable approximation rather than a full parser.
 * Returns null when the tag is missing or doesn't match that simple shape,
 * rather than guessing.
 */
function getOpenStatus(raw) {
  if (!raw) return null;
  const match = raw.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const [, oh, om, ch, cm] = match;
  const openMins = Number(oh) * 60 + Number(om);
  let closeMins = Number(ch) * 60 + Number(cm);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const crossesMidnight = closeMins <= openMins;
  const isOpen = crossesMidnight
    ? nowMins >= openMins || nowMins < closeMins
    : nowMins >= openMins && nowMins < closeMins;

  return {
    isOpen,
    closeLabel: to12h(ch, cm),
    openLabel: to12h(oh, om),
  };
}

// Teardrop pin — same silhouette Google Maps uses for POI markers — built as
// an inline SVG divIcon so no extra image assets need to be fetched.
function createPinIcon(color, large = false) {
  const size = large ? 34 : 28;
  const height = Math.round(size * 1.36);
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${height}" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 24 14 24s14-13.5 14-24c0-7.7-6.3-14-14-14z" fill="${color}"/>
      <circle cx="14" cy="14" r="5.5" fill="white"/>
    </svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

// Google Maps' blinking blue "you are here" dot.
function createOriginIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${ORIGIN_DOT_COLOR};border:3px solid white;box-shadow:0 0 0 4px rgba(66,133,244,0.3),0 1px 4px rgba(0,0,0,0.35);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function ResultCard({ result, origin, isSelected, onSelect, innerRef }) {
  const CategoryIcon = useMemo(() => getCategoryIcon(result.category), [result.category]);
  const hours = formatOpeningHours(result.openingHours);
  const openStatus = useMemo(() => getOpenStatus(result.openingHours), [result.openingHours]);
  const hasRealRating = Number.isFinite(Number(result.rating)) && Number(result.rating) > 0;
  const distanceLabel = formatDistance(result.distance);
  const directionsUrl = getDirectionsUrl(origin, result);
  const [imgFailed, setImgFailed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { status: promoStatus, events: promoEvents, message: promoMessage, fetchFor } = useMallPromotions();

  const handleToggleDetails = (e) => {
    e.stopPropagation();
    setDetailsOpen((prev) => {
      const next = !prev;
      if (next) fetchFor({ website: result.website, name: result.name });
      return next;
    });
  };

  return (
    <motion.div
      ref={innerRef}
      data-result-id={result.id}
      onClick={() => onSelect(result)}
      onMouseEnter={() => onSelect(result)}
      whileHover={{ y: -2 }}
      className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-colors
        ${isSelected ? "border-(--primary) bg-(--primary)/5" : "border-(--border) hover:border-(--primary)/40"}`}
    >
      <div className="flex gap-3">
      {/* Left — a real photo (from OSM's own `image` tag, or a Wikipedia
          thumbnail for notable places) when one exists; otherwise a category
          icon thumbnail. Never a fabricated/stock photo standing in for the
          actual place. */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-(--primary)/10 flex items-center justify-center">
        {result.imageUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary external OSM/Wikipedia photo URL, not a local/known asset
          <img
            src={result.imageUrl}
            alt={result.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <CategoryIcon className="w-9 h-9 text-(--primary)" />
        )}
      </div>

      {/* Right — name, rating, category, distance, address, hours */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-(--foreground) font-primary truncate">{result.name}</h4>
          {distanceLabel && (
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-(--primary)/10 text-(--primary) font-secondary">
              {distanceLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {hasRealRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-(--foreground) font-secondary">
                {Number(result.rating).toFixed(1)}
              </span>
            </div>
          )}
          <span className="text-xs text-(--muted-foreground) font-secondary">
            {humanizeCategory(result.category)}
          </span>
        </div>

        {result.address && (
          <p className="flex items-start gap-1 text-xs text-(--muted-foreground) font-secondary mt-1">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{result.address}</span>
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {openStatus ? (
            <span className="flex items-center gap-1 text-xs font-secondary">
              <Clock className="w-3 h-3 text-(--muted-foreground)" />
              <span className={openStatus.isOpen ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {openStatus.isOpen ? `Open · Closes ${openStatus.closeLabel}` : `Closed · Opens ${openStatus.openLabel}`}
              </span>
            </span>
          ) : (
            hours && (
              <span className="flex items-center gap-1 text-xs text-(--muted-foreground) font-secondary">
                <Clock className="w-3 h-3" />
                {hours}
              </span>
            )
          )}
          {result.phoneNumber && (
            <span className="flex items-center gap-1 text-xs text-(--muted-foreground) font-secondary">
              <Phone className="w-3 h-3" /> {result.phoneNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-secondary bg-(--primary) text-white hover:opacity-90 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
          {result.website && (
            <a
              href={getResultExternalLink(result)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-secondary border border-(--border) text-(--foreground) hover:border-(--primary)/40 transition"
            >
              Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            type="button"
            onClick={handleToggleDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-secondary border border-(--border) text-(--foreground) hover:border-(--primary)/40 transition ml-auto cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            Offers &amp; Events
            <ChevronDown className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
      </div>

      {detailsOpen && (
        <div className="mt-2 pt-2 border-t border-(--border)" onClick={(e) => e.stopPropagation()}>
          <MallPromotions status={promoStatus} events={promoEvents} message={promoMessage} />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Google-style "nearby mall search" results — list on the left, interactive
 * map on the right. Rendered instead of the DealCard grid only when the
 * user's search matches a nearby-mall/store intent. Clicking a result
 * centers the map on it and opens the real place's website (or, if it has
 * none, an OSM directions link) in a new tab.
 *
 * Every field shown (name, address, distance, hours, phone) is real data
 * from OpenStreetMap. OSM has no photo or review/rating system, so the
 * thumbnail is a category icon rather than a fabricated photo, and the
 * rating row only renders when a real rating value is present.
 *
 * @param {{
 *   origin: { lat: number, lng: number } | null,
 *   results: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   locationStatus: string,
 *   onDetectLocation: () => void,
 * }} props
 */
export default function NearbyMallResults({ origin, results, loading, error, locationStatus, onDetectLocation }) {
  const [selected, setSelected] = useState(null);
  const listRef = useRef(null);
  const cardElsRef = useRef(new Map());

  useEffect(() => {
    setSelected(null);
  }, [results]);

  // Keep the map in sync while scrolling the list, not just on click/hover —
  // whichever card sits nearest the vertical center of the (scrollable) list
  // becomes "selected" and recenters the map, the way Google's own
  // list+map results do.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const rootRect = root.getBoundingClientRect();
        const centerY = rootRect.top + rootRect.height / 2;

        let closestEl = null;
        let closestDist = Infinity;
        visible.forEach((entry) => {
          const rect = entry.target.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - centerY);
          if (dist < closestDist) {
            closestDist = dist;
            closestEl = entry.target;
          }
        });

        const match = closestEl && results.find((r) => String(r.id) === closestEl.dataset.resultId);
        if (match) setSelected(match);
      },
      { root, rootMargin: "-35% 0px -35% 0px", threshold: 0 },
    );

    cardElsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [results]);

  const originIcon = useMemo(() => createOriginIcon(), []);
  const pinIcon = useMemo(() => createPinIcon(PIN_COLOR), []);
  const selectedPinIcon = useMemo(() => createPinIcon(SELECTED_PIN_COLOR, true), []);

  const center = getMapCenter(origin, selected ? [selected] : results);
  const zoom = selected ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM;

  // Only block on location when we truly have no usable coordinates at all —
  // a denied/failed GPS request is fine as long as a city fallback resolved
  // an origin (getRefCoords already handles that), so don't show this for
  // every "denied" status, only when there's nothing to search from.
  const hasOrigin = origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng);
  if (!hasOrigin) {
    const isDenied = locationStatus === "denied";
    const isError = locationStatus === "error";
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-2xl border border-(--border)">
        <WifiOff className="w-10 h-10 text-(--muted-foreground)/40" />
        <p className="font-semibold text-(--foreground) font-primary">
          {isDenied
            ? "Location access was denied"
            : isError
              ? "Couldn't detect your location"
              : "Share your location to search nearby"}
        </p>
        <p className="text-sm text-(--muted-foreground) font-secondary max-w-sm">
          Enable location access, or pick a city above to search for nearby malls and stores.
        </p>
        <button
          onClick={onDetectLocation}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-secondary bg-(--primary) text-white hover:opacity-90 transition cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          {isDenied || isError ? "Retry" : "Detect My Location"}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
        <p className="text-(--muted-foreground) font-secondary text-sm">
          Searching nearby malls and stores...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-2xl border border-(--border)">
        <WifiOff className="w-10 h-10 text-(--muted-foreground)/40" />
        <p className="font-semibold text-(--foreground) font-primary">Something went wrong</p>
        <p className="text-sm text-(--muted-foreground) font-secondary max-w-sm">{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <Search className="w-10 h-10 text-(--muted-foreground)/30" />
        <p className="font-semibold text-(--foreground) font-primary">No nearby malls found</p>
        <p className="text-sm text-(--muted-foreground) font-secondary">
          Try a different search term, or expand your search to a nearby city.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="nearby-mall-results"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_1.1fr] gap-6"
      >
        {/* Left — results list */}
        <div ref={listRef} className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              origin={origin}
              isSelected={selected?.id === result.id}
              onSelect={setSelected}
              innerRef={(el) => {
                if (el) cardElsRef.current.set(String(result.id), el);
                else cardElsRef.current.delete(String(result.id));
              }}
            />
          ))}
        </div>

        {/* Right — interactive map, styled to sit close to Google Maps' look */}
        <div className="relative rounded-2xl overflow-hidden border border-(--border) h-[420px] lg:h-[560px]">
          <MapContainer center={center} zoom={zoom} scrollWheelZoom zoomControl={false} className="w-full h-full">
            <TileLayer
              url={GOOGLE_LIKE_TILE_URL}
              attribution={GOOGLE_LIKE_ATTRIBUTION}
              detectRetina
              maxZoom={20}
              maxNativeZoom={20}
            />
            <ZoomControl position="bottomright" />
            <MapRecenter center={center} zoom={zoom} />

            {origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng) && (
              <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {results
              .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
              .map((result) => (
                <Marker
                  key={result.id}
                  position={[result.lat, result.lng]}
                  icon={selected?.id === result.id ? selectedPinIcon : pinIcon}
                  eventHandlers={{ click: () => setSelected(result) }}
                >
                  <Popup>
                    <div className="font-secondary">
                      <p className="font-semibold mb-1">{result.name}</p>
                      {result.address && <p className="text-xs">{result.address}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <a
                          href={getDirectionsUrl(origin, result)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-(--primary) inline-flex items-center gap-1 font-semibold"
                        >
                          Directions
                        </a>
                        {result.website && (
                          <a
                            href={getResultExternalLink(result)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-(--primary) inline-flex items-center gap-1"
                          >
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--background)/90 border border-(--border) text-xs text-(--muted-foreground) font-secondary">
            <MapPin className="w-3.5 h-3.5 text-(--primary)" />
            {results.length} places found
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
