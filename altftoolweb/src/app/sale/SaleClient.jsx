"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import HeroSection from "./components/HeroSection";
import SalesNearYou from "./components/SalesNearYou";
import saleData from "./data/saleData";
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
      () => setLocationStatus("denied"),
      { timeout: 8000 },
    );
  }, []);

  //Manual city select (from Hero dropdown or SalesNearYou dropdown) 
  const handleCitySelect = useCallback((city) => {
    setLocationName(city);
    setLocationStatus("resolved");
    setUserCoords(null); // clear GPS — distances will use city-center coords
  }, []);

 
  return (
    // <div className="min-h-screen text-(--foreground) flex flex-col space-y-10 ">
    <div>
      {/* 1. Hero — location dropdown + search that scrolls to SalesNearYou */}
      <HeroSection
        hero={saleData.hero}
        locationName={locationName}
        locationStatus={locationStatus}
        onDetectLocation={detectLocation}
        onCitySelect={handleCitySelect}
        
        onNearbySearchChange={setNearbySearch}
      />

      {/* 4. Sales Near You — location-aware + search filter */}
      <SalesNearYou
        nearbyDeals={saleData.nearbyDeals}
        locationName={locationName}
        locationStatus={locationStatus}
        onDetectLocation={detectLocation}
        onCitySelect={handleCitySelect}
        userCoords={userCoords}
        searchQuery={nearbySearch}
        onSearchChange={setNearbySearch}
      />

      <RouteLazySection fallback={<RouteStripSkeleton items={5} />} minHeight={260}>
        <ExploreCategories />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteCardGridSkeleton cards={4} columns="lg:grid-cols-4" />} minHeight={420}>
        <TrendingSales trendingSales={saleData.trendingSales} />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={360}>
        <FlashSales flashSales={saleData.flashSales} />
      </RouteLazySection>

      <RouteLazySection fallback={<RouteCardGridSkeleton cards={5} />} minHeight={520}>
        <DealOfDay dealOfDay={saleData.dealOfDay} />
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
