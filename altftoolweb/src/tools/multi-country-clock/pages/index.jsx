"use client";

import React, { useState } from "react";

import HeroSection from "../components/HeroSection";
import SearchBar from "../components/SearchBar";
import ClockGrid from "../components/ClockGrid";
import TimezoneList from "../components/TimezoneList";
import Features from "../components/Features";
import { getTimeZoneSearchText } from "../lib";

// Popular timezones to start with
const DEFAULT_TIMEZONES = [
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const MAX_SELECTED_TIMEZONES = 12;
const AVAILABLE_TIMEZONES =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : DEFAULT_TIMEZONES;

function App() {
  const [selectedTimezones, setSelectedTimezones] = useState(DEFAULT_TIMEZONES);
  const [searchQuery, setSearchQuery] = useState("");
  const [hour12, setHour12] = useState(true);

  // Add timezone
  const handleAddTimezone = (timezone) => {
    setSelectedTimezones((currentTimezones) => {
      if (
        currentTimezones.includes(timezone) ||
        currentTimezones.length >= MAX_SELECTED_TIMEZONES
      ) {
        return currentTimezones;
      }

      return [...currentTimezones, timezone];
    });
  };

  // Remove timezone
  const handleRemoveTimezone = (timezone) => {
    setSelectedTimezones((currentTimezones) =>
      currentTimezones.filter((currentTimezone) => currentTimezone !== timezone),
    );
  };

  // Filter search
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("en-US");
  const filteredTimezones = AVAILABLE_TIMEZONES.filter((timezone) =>
    getTimeZoneSearchText(timezone).includes(normalizedSearch),
  );

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <HeroSection hour12={hour12} onHour12Change={setHour12} />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {searchQuery && (
        <TimezoneList
          filteredTimezones={filteredTimezones}
          selectedTimezones={selectedTimezones}
          onAddTimezone={handleAddTimezone}
          maxSelectedTimezones={MAX_SELECTED_TIMEZONES}
        />
      )}

      <ClockGrid
        selectedTimezones={selectedTimezones}
        onRemoveTimezone={handleRemoveTimezone}
        hour12={hour12}
      />

      <Features />
    </div>
  );
}

export default App;
