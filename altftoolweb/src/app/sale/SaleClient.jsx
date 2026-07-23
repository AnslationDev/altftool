"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HeroSection from "./components/HeroSection";
import SalesNearYou from "./components/SalesNearYou";
import saleData from "./data/saleData";
import { CITY_OPTIONS } from "./data/cities";
import RouteLazySection from "@/components/ui/RouteLazySection";
import { RouteCardGridSkeleton, RouteSectionSkeleton, RouteStripSkeleton } from "@/components/ui/route-loading";

const ExploreCategories = dynamic(() => import("./components/ExploreCategories"), {
  loading: () => <RouteStripSkeleton items={5} />,
});
const TrendingSales = dynamic(() => import("./components/TrendingSales"), {
  loading: () => <RouteCardGridSkeleton cards={4} columns="lg:grid-cols-4" />,
});
const FlashSales = dynamic(() => import("./components/FlashSales"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const DealOfDay = dynamic(() => import("./components/DealOfDay"), {
  loading: () => <RouteCardGridSkeleton cards={5} />,
});
const UserFeedback = dynamic(() => import("./components/UserFeedback"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const FAQsSection = dynamic(() => import("./components/FAQsSection"), {
  loading: () => <RouteSectionSkeleton cards={2} />,
});
const NewsletterSection = dynamic(() => import("./components/NewsletterSection"), {
  loading: () => <RouteSectionSkeleton cards={2} />,
});

export default function SaleLocatorPage() {
  // ── 1. Location state — shared between Hero dropdown & SalesNearYou 
  // status: "idle" | "detecting" | "resolved" | "denied" | "error"
  const [locationName, setLocationName] = useState(
    saleData.hero.defaultLocation,
  );
  const [locationStatus, setLocationStatus] = useState("idle");
  const [userCoords, setUserCoords] = useState(null); // { lat, lng } from GPS

  //  Search query — used ONLY by SalesNearYou 
  const [nearbySearch, setNearbySearch] = useState("");

  //  Newsletter 
  const [email, setEmail] = useState("");

  // API-fetched deals state
  const [apiDeals, setApiDeals] = useState(null);
  const [dealsLoading, setDealsLoading] = useState(false);

  // Cities the user searched that weren't in the built-in CITY_OPTIONS list —
  // geocoded on demand and appended so they show up as normal city entries.
  const [dynamicCities, setDynamicCities] = useState([]);

  // Real-time Trending / Flash / Deal-of-Day product feeds (SerpAPI) —
  // no static/mock product data.
  const [homeDeals, setHomeDeals] = useState({ trending: [], flash: [], dealOfDay: [] });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/sale/home-deals")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setHomeDeals({
            trending: data.trending || [],
            flash: data.flash || [],
            dealOfDay: data.dealOfDay || [],
          });
        }
      })
      .catch((err) => console.error("Failed to fetch home deals:", err));

    return () => {
      cancelled = true;
    };
  }, []);


  // GPS detect → Nominatim reverse geocode 
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Your Location";
          setLocationName(city);
          setLocationStatus("resolved");
        } catch {
          setLocationStatus("error");
        }
      },
      (error) => {
        // Only a real permission refusal is "denied". A timeout or an
        // unavailable fix (common on desktops without high-accuracy GPS
        // hardware) is a different failure — don't mislabel it as denied
        // when the user actually allowed access.
        // error.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        setLocationStatus(error.code === 1 ? "denied" : "error");
      },
      // maximumAge: 0 forces the browser to get a brand-new reading every
      // time — never reuse a cached position. enableHighAccuracy is left at
      // its default (false): forcing high accuracy on hardware without a
      // real GPS chip (most desktops/laptops) frequently times out.
      { maximumAge: 0, timeout: 10000 },
    );
  }, []);

  //Manual city select (from Hero dropdown or SalesNearYou dropdown)
  const handleCitySelect = useCallback((city) => {
    setLocationName(city);
    setLocationStatus("resolved");
    setUserCoords(null); // clear GPS — distances will use city-center coords
  }, []);

  // 🔎 Resolve a free-typed city search: suggest/select if it matches a known
  // city, otherwise geocode it, add it to the dropdown, and select it.
  const resolveCityQuery = useCallback(
    async (rawQuery) => {
      const query = String(rawQuery || "").trim();
      if (!query) return { ok: false, message: "Enter a city name." };

      const merged = [...CITY_OPTIONS, ...dynamicCities];
      const match =
        merged.find((c) => c.label.toLowerCase() === query.toLowerCase()) ||
        merged.find((c) => c.label.toLowerCase().includes(query.toLowerCase()));

      if (match) {
        handleCitySelect(match.value);
        return { ok: true, city: match };
      }

      try {
        const res = await fetch(`/api/sale/geocode?location=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!res.ok || typeof data.latitude !== "number") {
          return { ok: false, message: data.error || `Couldn't find "${query}".` };
        }

        const newCity = {
          label: data.formattedAddress || query,
          value: query,
          lat: data.latitude,
          lng: data.longitude,
        };

        setDynamicCities((prev) =>
          prev.some((c) => c.value.toLowerCase() === newCity.value.toLowerCase())
            ? prev
            : [...prev, newCity],
        );
        handleCitySelect(newCity.value);
        return { ok: true, city: newCity };
      } catch {
        return { ok: false, message: "Network error — please try again." };
      }
    },
    [dynamicCities, handleCitySelect],
  );

  // 🔥 Auto-detect location on page mount — when user opens /sale page
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // 🌐 Fetch nearby deals from API whenever location or search changes.
  // Tracks the latest request so a slower, now-stale response (e.g. the
  // eager default-city prefetch below, if it resolves after GPS already
  // switched the city) can't clobber newer results.
  const latestDealsRequestRef = useRef(0);
  const fetchNearbyDeals = useCallback(async (city, query) => {
    const requestId = ++latestDealsRequestRef.current;
    setDealsLoading(true);
    try {
      const params = new URLSearchParams({ city, query: query || "deals" });
      const res = await fetch(`/api/sale/nearby-deals?${params.toString()}`);
      const data = await res.json();
      if (data.deals && requestId === latestDealsRequestRef.current) {
        setApiDeals(data.deals);
      }
    } catch (err) {
      console.error("Failed to fetch nearby deals:", err);
    } finally {
      if (requestId === latestDealsRequestRef.current) setDealsLoading(false);
    }
  }, []);

  // ⚡ Eagerly prefetch deals for the default city immediately on mount —
  // in parallel with GPS detection/reverse-geocoding — so real results
  // show up right away instead of waiting for location resolution to
  // finish before the deals fetch even starts.
  useEffect(() => {
    fetchNearbyDeals(saleData.hero.defaultLocation, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce the search text so we don't hit the deals API on every
  // keystroke — only once the user pauses typing.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(nearbySearch), 500);
    return () => clearTimeout(timer);
  }, [nearbySearch]);

  // Fetch when location name is resolved, or the (debounced) search changes
  useEffect(() => {
    if (locationName && locationStatus === "resolved") {
      fetchNearbyDeals(locationName, debouncedSearch);
    }
  }, [locationName, locationStatus, debouncedSearch, fetchNearbyDeals]);

  // 🔍 Explicit search submit (Enter / Search button) — fetch immediately
  // for the current location + search text, no debounce wait.
  const searchDealsNow = useCallback(() => {
    if (locationName) {
      fetchNearbyDeals(locationName, nearbySearch);
    }
  }, [locationName, nearbySearch, fetchNearbyDeals]);

 
  return (
    // <div className="min-h-screen text-(--foreground) flex flex-col space-y-10 ">
    <div>
      {/* 1. Hero — location dropdown + search that scrolls to SalesNearYou */}
      <HeroSection
        hero={saleData.hero}
        locationName={locationName}
        locationStatus={locationStatus}
        onDetectLocation={detectLocation}
      />

      {/* 4. Sales Near You — location-aware + search filter */}
      <SalesNearYou
        nearbyDeals={apiDeals || []}
        locationName={locationName}
        locationStatus={locationStatus}
        onDetectLocation={detectLocation}
        onCitySelect={handleCitySelect}
        onCitySearch={resolveCityQuery}
        dynamicCities={dynamicCities}
        userCoords={userCoords}
        searchQuery={nearbySearch}
        onSearchChange={setNearbySearch}
        onSearchSubmit={searchDealsNow}
        dealsLoading={dealsLoading}
      />

      <RouteLazySection fallback={<RouteStripSkeleton items={5} />} minHeight={260}>
        <ExploreCategories />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteCardGridSkeleton cards={4} columns="lg:grid-cols-4" />} minHeight={420}>
        <TrendingSales
          trendingSales={{ ...saleData.trendingSales, products: homeDeals.trending }}
        />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={360}>
        <FlashSales
          flashSales={{ ...saleData.flashSales, products: homeDeals.flash }}
        />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteCardGridSkeleton cards={5} />} minHeight={520}>
        <DealOfDay dealOfDay={homeDeals.dealOfDay} />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={300}>
        <UserFeedback feedback={saleData.feedback} />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteSectionSkeleton cards={2} />} minHeight={260}>
        <FAQsSection faq={saleData.faq} />
      </RouteLazySection>

      {/* ──  Newsletter  */}
      <RouteLazySection fallback={<RouteSectionSkeleton cards={2} />} minHeight={360}>
        <NewsletterSection
          email={email}
          setEmail={setEmail}
        />
      </RouteLazySection>
    </div>
  );
}
