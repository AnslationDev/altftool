"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Loader2,
  Navigation,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import DealCard from "./DealCard";
import { useNearbySearch } from "@/app/sale/hooks/useNearbySearch";
import {
  normaliseCity,
  getRefCoords,
} from "@/app/sale/data/cities";

// Leaflet touches `window` at module scope, so it can't be part of the
// server-rendered bundle — load it client-only, matching the pattern used
// by the flightradar dashboard's map component.
const NearbyMallResults = dynamic(() => import("./NearbyMallResults"), { ssr: false });

const SORT_OPTIONS = ["Nearest", "Highest Discount", "Lowest Price"];
const CARDS_PER_PAGE = 6;

// ── Haversine — accurate great-circle distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SalesNearYou({
  nearbyDeals,
  locationName, // string — city name
  locationStatus, // "idle"|"detecting"|"resolved"|"denied"|"error"
  onDetectLocation, // () => void  — trigger GPS
  onCitySelect, // (cityValue: string) => void — manual pick
  onCitySearch, // (query: string) => Promise<{ok:boolean,message?:string}> — suggest-or-geocode
  dynamicCities = [], // cities geocoded on the fly that aren't in the static list
  userCoords, // { lat, lng } | null — raw GPS
  searchQuery, // string — from hero search bar
  onSearchChange, // (v: string) => void
  onSearchSubmit, // () => void — fetch deals for the current search immediately
  dealsLoading, // boolean — true while API is fetching
}) {
  const [sortBy, setSortBy] = useState("Nearest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_PAGE);

  const sortDropdownRef = useRef(null);
  const loadMoreRef = useRef(null);

  const [isActive, setIsActive] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reference point for distance calc: GPS coords OR city centre
  const refCoords = useMemo(
    () => getRefCoords(userCoords, locationName, dynamicCities),
    [userCoords, locationName, dynamicCities],
  );

  // ── Nearby Sale Search: ANY non-empty search always searches real nearby
  // malls & stores (via OpenStreetMap), reusing the same location state as
  // the rest of this component — no duplicate geolocation logic, and no
  // keyword-list guessing about what counts as a "mall search".
  const {
    results: mallResults,
    loading: mallLoading,
    error: mallError,
    search: searchNearbyMalls,
    reset: resetMallSearch,
  } = useNearbySearch();

  // ── Step 1: enrich every deal with a computed distance
  const enrichedDeals = useMemo(() => {
    return nearbyDeals.map((deal) => {
      if (refCoords && deal.latitude != null && deal.longitude != null) {
        const km = haversineKm(
          refCoords.lat,
          refCoords.lng,
          deal.latitude,
          deal.longitude,
        );
        return { ...deal, computedDistance: Math.round(km * 10) / 10 };
      }
      return { ...deal, computedDistance: null };
    });
  }, [nearbyDeals, refCoords]);

  // ── Step 2: filter by tab + city + search, then sort
  const filtered = useMemo(() => {
    let deals = enrichedDeals.filter((d) => d.type === "nearby");



    // console.log("deals near me ", deals);

    // Filter by city
    const detectedCity = normaliseCity(locationName);
    if (detectedCity) {
      deals = deals.filter(
        (d) => d.city.toLowerCase() === detectedCity.toLowerCase(),
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      deals = deals.filter((d) =>
        `${d.title} ${d.offerText} ${d.area}`.toLowerCase().includes(q),
      );
    }

    // Sorting
    if (sortBy === "Nearest") {
      deals = [...deals].sort(
        (a, b) => (a.computedDistance ?? 9999) - (b.computedDistance ?? 9999),
      );
    } else if (sortBy === "Highest Discount") {
      deals = [...deals].sort((a, b) => {
        const pct = (d) =>
          ((d.originalPrice - d.salePrice) / d.originalPrice) * 100;
        return pct(b) - pct(a);
      });
    } else if (sortBy === "Lowest Price") {
      deals = [...deals].sort((a, b) => a.salePrice - b.salePrice);
    }

    return deals;
  }, [enrichedDeals, sortBy, locationName, searchQuery]);

  // Any non-empty search query searches real nearby malls/stores via OSM
  // — lightly debounced (matches the 500ms debounce SaleClient already uses
  // for the product-deal search) so it doesn't hit the API on every
  // keystroke. This is driven entirely by real, live-fetched place data —
  // never a hardcoded list of malls/brands.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || !refCoords) {
      resetMallSearch();
      return undefined;
    }

    const timer = setTimeout(() => {
      searchNearbyMalls({ latitude: refCoords.lat, longitude: refCoords.lng, keyword: query });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, refCoords?.lat, refCoords?.lng, searchNearbyMalls, resetMallSearch]);

  const showMallView = Boolean(searchQuery.trim());

  // ── Step 3: paginate — show 6 cards at a time, reveal more on scroll
  useEffect(() => {
    setVisibleCount(CARDS_PER_PAGE);
  }, [locationName, searchQuery, sortBy]);

  const visibleDeals = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const hasMoreDeals = visibleCount < filtered.length;

  // Infinite scroll — grow visibleCount by CARDS_PER_PAGE when the sentinel
  // at the bottom of the grid enters the viewport.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMoreDeals) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + CARDS_PER_PAGE, filtered.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreDeals, filtered.length]);

  const displayCity = locationName || "Your Location";
  const cityResolved = locationStatus === "resolved";
  const isGPS = cityResolved && !!userCoords;

  const handleSearch = () => {
    // Fetch deals for the current location + search text right away
    // (bypasses the debounce so pressing Search always feels instant).
    onSearchSubmit?.();

    if (!searchQuery.trim()) return;

    // scroll to results
    const el = document.getElementById("sales-near-you");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // id anchor — Hero search button scrolls here
    <section id="sales-near-you" className=" bg-(--background) section ">
      <div className=" ">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="section-title text-left mb-2">Sales Near You</h2>

            <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary">
              Find The Best Offers From Stores Near Your Location
            </p>
          </div>

          {/* Right button */}
          <button
            onClick={() => {
              onDetectLocation();
              setIsActive(true);
            }}
            className={`group flex items-center gap-2 px-4 py-2 font-medium rounded-full border text-sm font-secondary cursor-pointer transition-all duration-200

            ${
              isActive
                ? "bg-(--primary) text-white border-(--primary)"
                : "border-(--border) text-(--foreground) hover:bg-(--primary)/5 hover:text-(--primary) hover:border-none"
            }
          `}
          >
            <Navigation
              className={`w-4 h-4 transition-colors duration-200
              ${
                isActive
                  ? "text-white"
                  : "text-(--foreground) group-hover:text-(--primary)"
              }`}
            />

            <span
              className={`transition-colors duration-200
              ${isActive ? "text-white" : "group-hover:text-(--primary)"}`}
            >
              Use current location
            </span>
          </button>
        </div>

        {/* ── Nearby Sale Search results (real OSM malls/stores) ── */}
        {showMallView ? (
          <NearbyMallResults
            origin={refCoords}
            results={mallResults}
            loading={mallLoading}
            error={mallError}
            locationStatus={locationStatus}
            onDetectLocation={onDetectLocation}
          />
        ) : (
          <>
        {/* ── Controls row ── */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          {/* LEFT CONTENT */}
          {filtered.length > 0 && (
            <div className="flex flex-row">
              <h3 className="text-xl md:text-2xl font-medium text-(--foreground) font-primary">
                {filtered.length}+ deals near you {displayCity}
              </h3>
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-(--foreground) transition cursor-pointer bg-(--background) font-secondary"
            >
              <span className="text-(--muted-foreground) text-sm">
                Sort by:
              </span>

              <div className="flex gap-2 items-center border border-(--border) py-2 px-4 rounded-full">
                <span className="font-medium">{sortBy}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-(--muted-foreground) transition ${isSortOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-(--background) border border-(--border) rounded-xl shadow-lg z-20 min-w-40 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-(--muted) transition cursor-pointer font-secondary
              ${
                sortBy === opt
                  ? "text-(--primary) font-medium"
                  : "text-(--foreground)"
              }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

{/* ── Deals grid ── */}
        <AnimatePresence mode="wait">
          {dealsLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
              <p className="text-(--muted-foreground) font-secondary text-sm">
                Finding the best deals near {displayCity}...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={locationName + searchQuery + sortBy}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [@media(min-width:1350px)]:grid-cols-4 2xl:grid-cols-4 gap-6"
            >
              {filtered.length === 0 ? (
                <div className="col-span-full flex flex-col items-center py-16 gap-3 text-center">
                  <Search className="w-10 h-10 text-(--muted-foreground)/30" />
                  <p className="font-semibold text-(--foreground) font-primary">
                    No deals found
                  </p>
                  <p className="text-sm text-(--muted-foreground) font-secondary">
                    Try a different search or pick another city.
                  </p>
                </div>
              ) : (
                visibleDeals.map((deal, i) => (
                  <DealCard key={deal.id} deal={deal} index={i} isGPS={isGPS} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Infinite scroll sentinel + "loading more" indicator ── */}
        {!dealsLoading && hasMoreDeals && (
          <div ref={loadMoreRef} className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-(--primary) animate-spin" />
          </div>
        )}
          </>
        )}
      </div>
    </section>
  );
}
