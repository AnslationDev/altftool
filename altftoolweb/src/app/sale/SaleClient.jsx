"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import SalesNearYou from "./components/SalesNearYou";
import saleData from "./data/saleData";
import ExploreCategories from "./components/ExploreCategories";
import FlashSales from "./components/FlashSales";
import DealOfDay from "./components/DealOfDay";
import NewsletterSection from "./components/NewsletterSection";
import UserFeedback from "./components/UserFeedback";
import FAQsSection from "./components/FAQsSection";
import TrendingSales from "./components/TrendingSales";


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

      <ExploreCategories />

      <TrendingSales trendingSales={saleData.trendingSales} />

      <FlashSales flashSales={saleData.flashSales} />

      <DealOfDay dealOfDay={saleData.dealOfDay} />

      <UserFeedback feedback={saleData.feedback} />

      <FAQsSection faq={saleData.faq} />

      {/* ──  Newsletter  */}
      <NewsletterSection
        email={email}
        setEmail={setEmail}
        
      />
    </div>
  );
}
