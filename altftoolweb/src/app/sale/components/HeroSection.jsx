"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { CITY_OPTIONS } from "../data/cities";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const headingStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/**
 * Floating product composition — real PNG cutouts, not generated art.
 *
 * Drop a transparent-cutout PNG at each `file` path below and it renders
 * automatically; until then a plain labeled placeholder holds the slot so
 * the layout/animation is fully built and ready.
 *
 * Expected folder: /public/sale-locator/hero-products/
 *   sneakers.png · headphones.png · smartwatch.png
 *   perfume.png  · backpack.png   · camera.png
 */
const FLOATING_PRODUCTS = [
  {
    id: "sneakers",
    label: "Sneakers",
    file: "/sale-locator/hero-products/snikkers.webp",
    depth: "front",
    className: "left-[-6%] bottom-[-24%] w-[46%] max-w-[280px]",
    float: {  duration: 5.5, delay: 0 },
    enter: "left",
  },
  {
    id: "headphones",
    label: "Headphones",
    file: "/sale-locator/hero-products/headphone.webp",
    depth: "front",
    className: "right-[-4%] top-[32%] w-[38%] max-w-[230px] height: 320",
    float: {
       duration: 6.5, delay: 0.3 },
    enter: "right",
  },
  {
    id: "laptop",
    label: "Laptop",
    file: "/sale-locator/hero-products/laptop.png",
    depth: "front",
    className: "left-1/2 -translate-x-1/2 bottom-[8%] w-[60%] max-w-[730px]",
    float: {
       duration: 5, delay: 0.6 },
    enter: "right",
  },
  {
    id: "perfume",
    label: "Perfume",
    file: "/sale-locator/hero-products/phone.png",
    depth: "mid",
    className: "left-[20%] top-[-28%] w-[46%] max-w-[310px]",
    float: { duration: 4.5, delay: 0.15 },
    enter: "left",
  },
  {
    id: "backpack",
    label: "Backpack",
    file: "/sale-locator/hero-products/watch.webp",
    depth: "back",
    className: "left-[0%] top-[14%] w-[28%] max-w-[190px]",
    float: {
       duration: 7, delay: 0.45 },
    enter: "left",
  },
  {
    id: "camera",
    label: "Camera",
    file: "/sale-locator/hero-products/camera.png",
    depth: "back",
    className: "right-[24%] top-[10%] w-[18%] max-w-[120px]",
    float: {
       duration: 6, delay: 0.75 },
    enter: "right",
  },
];

const DEPTH_STYLES = {
  front: "opacity-100 drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)] z-30",
  mid: "opacity-95 drop-shadow-[0_14px_22px_rgba(0,0,0,0.14)] z-20",
  back: "opacity-70 blur-[0.5px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.10)] z-10",
};

/**
 * One floating product slot. Tries the real cutout PNG first; falls back to
 * a plain labeled placeholder (no icon soup, no fake glow) so the composition
 * never looks broken while assets are still being sourced.
 */
function FloatingProduct({ product, index }) {
  const [failed, setFailed] = useState(false);

  // Entrance direction — products slide in from the side of the
  // composition they sit on (left-positioned items enter from the left,
  // right-positioned items enter from the right) instead of just fading in.
  const enterX = product.enter === "left" ? -110 : product.enter === "right" ? 110 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 24, x: enterX }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      transition={{ duration: 0.8, delay: 0.5 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${product.className} ${DEPTH_STYLES[product.depth]}`}
    >
      <motion.div className="relative aspect-square w-full">
        {!failed ? (
          <Image
            src={product.file}
            alt={product.label}
            fill
            sizes="280px"
            className="object-contain select-none"
            draggable={false}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--card)/70 px-3 text-center">
            <span className="text-[11px] font-medium text-(--muted-foreground) font-secondary">
              {product.label}
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/** ~10 fixed positions (not random — avoids SSR/client hydration mismatch). */
const PARTICLES = [
  { top: "12%", left: "8%", size: 5, duration: 9, delay: 0 },
  { top: "22%", left: "88%", size: 4, duration: 11, delay: 1 },
  { top: "68%", left: "92%", size: 6, duration: 8, delay: 0.5 },
  { top: "80%", left: "18%", size: 4, duration: 10, delay: 1.4 },
  { top: "40%", left: "4%", size: 3, duration: 12, delay: 0.8 },
  { top: "6%", left: "48%", size: 4, duration: 9.5, delay: 1.8 },
  { top: "90%", left: "60%", size: 5, duration: 10.5, delay: 0.3 },
  { top: "54%", left: "96%", size: 3, duration: 8.5, delay: 1.1 },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-(--primary)/25"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/**
 * Ambient brand glow + dot grid — same background graphic used on the
 * AltFTool homepage hero ((marketing)/components/HeroSection.jsx), copied
 * in directly since it isn't a standalone reusable component there (no
 * export, no props — just inline JSX built from theme tokens).
 */
function BackgroundMesh() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_70%)] blur-2xl" />
      <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--secondary)_14%,transparent),transparent_70%)] blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_60%_60%_at_30%_35%,black,transparent)]" />
    </div>
  );
}

/**
 * Compact location + search bar used inline in the hero — reuses the same
 * city list and search state as the rest of the page (SalesNearYou), it
 * does not maintain its own parallel copy of the query.
 */
function HeroLocationSearch({
  locationName,
  locationStatus,
  onDetectLocation,
  onCitySelect,
  onCitySearch,
  dynamicCities = [],
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder,
}) {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityState, setCityState] = useState({ loading: false, error: "" });
  const containerRef = useRef(null);

  const allCities = useMemo(() => [...CITY_OPTIONS, ...dynamicCities], [dynamicCities]);
  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return allCities;
    return allCities.filter((c) => c.label.toLowerCase().includes(q));
  }, [allCities, cityQuery]);

  const closeCityDropdown = () => {
    setIsCityOpen(false);
    setCityQuery("");
    setCityState({ loading: false, error: "" });
  };

  const submitCitySearch = async () => {
    if (!onCitySearch || !cityQuery.trim()) return;
    setCityState({ loading: true, error: "" });
    const result = await onCitySearch(cityQuery);
    if (result?.ok) closeCityDropdown();
    else setCityState({ loading: false, error: result?.message || "City not found." });
  };

  const displayCity =
    locationStatus === "detecting"
      ? "Detecting..."
      : locationName || "Search your city";

  return (
    <div ref={containerRef} className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 rounded-2xl sm:rounded-full border border-(--border) bg-(--card) p-1.5">
      {/* Location */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsCityOpen((p) => !p)}
          disabled={locationStatus === "detecting"}
          className="flex w-full items-center gap-2 rounded-full px-3.5 py-2 text-sm font-secondary text-(--foreground) hover:bg-(--muted) transition-colors cursor-pointer"
        >
          {locationStatus === "detecting" ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-(--primary)" />
          ) : (
            <MapPin className="h-4 w-4 shrink-0 text-(--primary)" />
          )}
          <span className="max-w-28 truncate">{displayCity}</span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isCityOpen ? "rotate-180" : ""}`} />
        </button>

        {isCityOpen && (
          <div className="absolute left-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-lg">
            <div className="border-b border-(--border) p-2">
              <div className="flex items-center gap-2 rounded-full border border-(--border) bg-(--background) px-3 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)" />
                <input
                  autoFocus
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCityState({ loading: false, error: "" });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submitCitySearch()}
                  placeholder="Search any city..."
                  className="w-full bg-transparent text-sm font-secondary outline-none"
                />
                {cityState.loading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-(--primary)" />}
              </div>
              {cityState.error && (
                <p className="mt-1.5 px-1 text-xs text-red-500 font-secondary">{cityState.error}</p>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onDetectLocation();
                  closeCityDropdown();
                }}
                className="flex w-full items-center gap-2 border-b border-(--border) px-4 py-3 text-sm font-semibold text-(--primary) hover:bg-(--anslation-ds-primary-soft) cursor-pointer"
              >
                <Navigation className="h-4 w-4" />
                Detect my location
              </button>

              {filteredCities.map((city) => (
                <button
                  type="button"
                  key={city.value}
                  onClick={() => {
                    onCitySelect(city.value);
                    closeCityDropdown();
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-(--anslation-ds-soft) cursor-pointer ${
                    locationName === city.value
                      ? "bg-(--anslation-ds-primary-soft) font-semibold text-(--primary)"
                      : "text-(--foreground)"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city.label}
                </button>
              ))}

              {filteredCities.length === 0 && (
                <button
                  type="button"
                  onClick={submitCitySearch}
                  disabled={cityState.loading}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-(--primary) hover:bg-(--anslation-ds-primary-soft) disabled:opacity-60 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search &quot;{cityQuery}&quot;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="hidden h-6 w-px bg-(--border) sm:block" />

      {/* Deal search */}
      <div className="flex flex-1 items-center gap-2 px-3.5 py-2">
        <Search className="h-4 w-4 shrink-0 text-(--muted-foreground)" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-secondary outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="shrink-0 text-(--muted-foreground) hover:text-(--foreground) cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onSearchSubmit}
        className="shrink-0 rounded-full bg-(--primary) px-5 py-2.5 text-sm font-semibold
        font-secondary text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors cursor-pointer"
      >
        Search Deals
      </button>
    </div>
  );
}

/**
 * Right-side visual — a small set of real product cutouts composed at
 * different depths/scales. Static once placed — no hover/mouse-driven
 * animation.
 */
function ProductComposition() {
  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-xl">
      <div className="relative h-full w-full">
        {FLOATING_PRODUCTS.map((product, i) => (
          <FloatingProduct key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function HeroSection({
  hero = {},
  locationName = "Your Location",
  locationStatus = "idle",
  onDetectLocation = () => {},
  onNearbyStoresClick = onDetectLocation,
  onCitySelect = () => {},
  onCitySearch = async () => ({ ok: false }),
  dynamicCities = [],
  searchQuery = "",
  onSearchChange = () => {},
  onSearchSubmit = () => {},
}) {
  const hasCustomHeading = Boolean(hero.headingLine1 || hero.headline);
  const headingLine1 = hero.headingLine1 || hero.headline || "Discover The Best";
  const headingAccent = hero.headingAccent || hero.headlineAccent || "Deals";
  const headingLine3 = hero.headingLine3 || (hasCustomHeading ? "" : "Near You");
  const description =
    hero.subtext ||
    "Smart, seamless shopping — explore real-time offers, nearby sales, and trending discounts from stores around you.";
  const searchPlaceholder = hero.searchPlaceholder || "Search deals, brands or stores";

  const scrollToDeals = () => {
    document.getElementById("sales-near-you")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchSubmit = () => {
    onSearchSubmit();
    scrollToDeals();
  };

  return (
    <section className="section relative overflow-hidden">
      {/* <BackgroundMesh /> */}

      <div className="relative z-10 py-14 lg:flex lg:items-center lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center lg:gap-10 w-full">
          {/* ── LEFT (~42%) ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-4 py-1.5 text-xs font-semibold text-(--primary) font-secondary"
            >
              <span className="relative flex h-3.5 w-3.5">
                <MapPin className="absolute inline-flex h-full w-full animate-ping opacity-75" />
                <MapPin className="relative inline-flex h-3.5 w-3.5" />
              </span>
              {locationStatus === "resolved" && locationName ? `Live deals in ${locationName}` : "Live shopping deals"}
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={headingStagger}
              className="font-primary font-extrabold tracking-tight leading-[1.05] text-[2.5rem] sm:text-6xl lg:text-[4.4rem]"
            >
              <motion.span variants={fadeUp} className="block text-(--foreground)">
                {headingLine1}
              </motion.span>
              <motion.span
                variants={fadeUp}
                className="block"
                style={{
                  backgroundImage: "var(--anslation-ds-cta-gradient)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {headingAccent}
              </motion.span>
              {headingLine3 && (
                <motion.span variants={fadeUp} className="block text-(--foreground)">
                  {headingLine3}
                </motion.span>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 max-w-md text-sm sm:text-base leading-relaxed text-(--muted-foreground) font-secondary"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-7 max-w-lg"
            >
              <HeroLocationSearch
                locationName={locationName}
                locationStatus={locationStatus}
                onDetectLocation={onDetectLocation}
                onCitySelect={onCitySelect}
                onCitySearch={onCitySearch}
                dynamicCities={dynamicCities}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSearchSubmit={handleSearchSubmit}
                placeholder={searchPlaceholder}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-5 flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                type="button"
                onClick={handleSearchSubmit}
                whileHover={{ y: -3, boxShadow: "0 16px 36px color-mix(in srgb, var(--primary) 38%, transparent)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white font-secondary shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_25%,transparent)] cursor-pointer"
                style={{ backgroundImage: "var(--anslation-ds-cta-gradient)" }}
              >
                {hero.ctaText || "Explore Deals"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              {/* <motion.button
                type="button"
                onClick={onNearbyStoresClick}
                whileHover={{ y: -3, borderColor: "var(--primary)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--card) px-7 py-3.5 text-sm font-semibold text-(--foreground) font-secondary transition-colors hover:text-(--primary) cursor-pointer"
              >
                {locationStatus === "detecting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Nearby Stores
              </motion.button> */}
            </motion.div>
          </div>

          {/* ── RIGHT (~58%) — floating product composition ── */}
          <div className="lg:col-span-6">
            <div className="relative">
              <FloatingParticles />
              <ProductComposition />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
