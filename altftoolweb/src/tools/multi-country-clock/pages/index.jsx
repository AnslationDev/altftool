"use client";

import React, { useState, useEffect } from "react";

import HeroSection from "../components/HeroSection";
import SearchBar from "../components/SearchBar";
import ClockGrid from "../components/ClockGrid";
import TimezoneList from "../components/TimezoneList";
import Features from "../components/Features";

// Popular timezones to start with
const DEFAULT_TIMEZONES = [
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function App() {
  const [allTimezones, setAllTimezones] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState(DEFAULT_TIMEZONES);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all available timezones on mount
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await fetch(
          "https://timeapi.io/api/TimeZone/AvailableTimeZones",
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setAllTimezones(data);
      } catch (error) {
        console.error("Failed to fetch timezones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimezones();
  }, []);

  // Add timezone
  const handleAddTimezone = (timezone) => {
    if (!selectedTimezones.includes(timezone)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
  };

  // Remove timezone
  const handleRemoveTimezone = (timezone) => {
    setSelectedTimezones(selectedTimezones.filter((tz) => tz !== timezone));
  };

  // Filter search
  const filteredTimezones = allTimezones.filter((timezone) =>
    timezone.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <HeroSection />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ClockGrid
        selectedTimezones={selectedTimezones}
        onRemoveTimezone={handleRemoveTimezone}
      />

      {searchQuery && (
        <TimezoneList
          filteredTimezones={filteredTimezones}
          selectedTimezones={selectedTimezones}
          onAddTimezone={handleAddTimezone}
        />
      )}
      <Features/>
      {/* Optional loading indicator */}
      {loading && (
        <div className="fixed bottom-6 right-6 p-3 rounded-full bg-(--card) border border-(--border)">
          <div className="w-6 h-6 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default App;
