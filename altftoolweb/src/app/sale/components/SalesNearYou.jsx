"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Loader2,
  LocateFixed,
  Navigation,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import DealCard from "./DealCard";
import MobileSearchBar from "./MobileSearchBar";
import DesktopSearchBar from "./DesktopSearchBar";

const SORT_OPTIONS = ["Nearest", "Highest Discount", "Lowest Price"];

// ── City options with centre coordinates
// Used for distance calculation when the user picks a city manually (no GPS)
const CITY_OPTIONS = [
  { label: "Gurugram", value: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { label: "Delhi", value: "Delhi", lat: 28.6139, lng: 77.209 },
  { label: "Noida", value: "Noida", lat: 28.5355, lng: 77.391 },
  { label: "Bengaluru", value: "Bengaluru", lat: 12.9716, lng: 77.5946 },
];

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

// ── Normalise any city string → canonical city key
const CITY_MAP = {
  gurugram: "Gurugram",
  gurgaon: "Gurugram",
  delhi: "Delhi",
  "new delhi": "Delhi",
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  noida: "Noida",
};
function normaliseCity(raw = "") {
  return CITY_MAP[raw.toLowerCase().trim()] ?? null;
}

// ── Get reference coords for a city (GPS first, else city-centre)
function getRefCoords(userCoords, cityName) {
  if (userCoords) return userCoords;
  const found = CITY_OPTIONS.find(
    (c) =>
      c.value.toLowerCase() === (normaliseCity(cityName) || "").toLowerCase(),
  );
  return found ? { lat: found.lat, lng: found.lng } : null;
}

export default function SalesNearYou({
  nearbyDeals,
  locationName, // string — city name
  locationStatus, // "idle"|"detecting"|"resolved"|"denied"|"error"
  onDetectLocation, // () => void  — trigger GPS
  onCitySelect, // (cityValue: string) => void — manual pick
  userCoords, // { lat, lng } | null — raw GPS
  searchQuery, // string — from hero search bar
  onSearchChange, // (v: string) => void
}) {
  const [sortBy, setSortBy] = useState("Nearest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const mobileCityRef = useRef(null);
  const desktopCityRef = useRef(null);
  const controlsCityRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [isActive, setIsActive] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        mobileCityRef.current &&
        !mobileCityRef.current.contains(e.target) &&
        desktopCityRef.current &&
        !desktopCityRef.current.contains(e.target) &&
        controlsCityRef.current &&
        !controlsCityRef.current.contains(e.target)
      ) {
        setIsCityOpen(false);
      }

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
    () => getRefCoords(userCoords, locationName),
    [userCoords, locationName],
  );

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

  const displayCity = locationName || "Your Location";
  const cityResolved = locationStatus === "resolved";
  const isGPS = cityResolved && !!userCoords;
  const showPrompt =
    locationStatus === "idle" ||
    locationStatus === "denied" ||
    locationStatus === "error";

  const handleSearch = () => {
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

        {/*  Mobile Search UI */}
            <MobileSearchBar
             searchQuery={searchQuery}
             onSearchChange={onSearchChange}
             handleSearch={handleSearch}
             locationStatus={locationStatus}
             displayCity={displayCity}
             isCityOpen={isCityOpen}
             setIsCityOpen={setIsCityOpen}
             onDetectLocation={onDetectLocation}
             onCitySelect={onCitySelect}
             CITY_OPTIONS={CITY_OPTIONS}
             locationName={locationName}
             mobileCityRef={mobileCityRef}
           />

        {/*  Desktop Search UI */}
           <DesktopSearchBar
             searchQuery={searchQuery}
             onSearchChange={onSearchChange}
             handleSearch={handleSearch}
             locationStatus={locationStatus}
             displayCity={displayCity}
             isCityOpen={isCityOpen}
             setIsCityOpen={setIsCityOpen}
             onDetectLocation={onDetectLocation}
             onCitySelect={onCitySelect}
             CITY_OPTIONS={CITY_OPTIONS}
             locationName={locationName}
             desktopCityRef={desktopCityRef}
           />


        {/* ── Location permission / error banner ── */}
        {/* <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border mb-6 flex-wrap
                ${locationStatus === "idle" ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                  ${locationStatus === "idle" ? "bg-blue-100" : "bg-red-100"}`}>
                  <Navigation className={`w-4 h-4 ${locationStatus === "idle" ? "text-blue-600" : "text-red-500"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold font-primary
                    ${locationStatus === "idle" ? "text-blue-800" : "text-red-700"}`}>
                    {locationStatus === "idle"
                      ? "Share your location for exact distances"
                      : locationStatus === "denied"
                        ? "Location access was denied"
                        : "Could not detect your location"}
                  </p>
                  <p className={`text-xs font-secondary mt-0.5
                    ${locationStatus === "idle" ? "text-blue-600" : "text-red-500"}`}>
                    {locationStatus === "idle"
                      ? "Or pick a city below to see nearby deals."
                      : "Enable location in browser settings and retry, or pick a city manually."}
                  </p>
                </div>
              </div>
              <button
                onClick={onDetectLocation}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-secondary transition cursor-pointer shrink-0
                  ${locationStatus === "idle"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                <LocateFixed className="w-4 h-4" />
                {locationStatus === "idle" ? "Detect My Location" : "Retry"}
              </button>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* ── Controls row ── */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          {/* LEFT CONTENT */}
          {filtered.length > 0 && (
            <div className="flex flex-row">
              <h3 className="text-xl md:text-2xl font-medium text-(--foreground) font-primary">
                {filtered.length - 1}+ deals near you {displayCity}
              </h3>
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-(--foreground) transition cursor-pointer bg-(--background) font-secondary"
            >
              <span className="text-(--muted-foreground) text-[15px]">
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
              filtered.map((deal, i) => (
                 <DealCard  key={deal.id} deal={deal} index={i} isGPS={isGPS}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
