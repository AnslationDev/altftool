"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

export default function DesktopSearchBar({
  searchQuery,
  onSearchChange,
  handleSearch,
  locationStatus,
  displayCity,
  isCityOpen,
  setIsCityOpen,
  onDetectLocation,
  onCitySelect,
  onCitySearch,
  CITY_OPTIONS,
  locationName,
  desktopCityRef,
}) {
  const [cityQuery, setCityQuery] = useState("");
  const [citySearchState, setCitySearchState] = useState({ loading: false, error: "" });

  const filteredCityOptions = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return CITY_OPTIONS;
    return CITY_OPTIONS.filter((city) => city.label.toLowerCase().includes(q));
  }, [CITY_OPTIONS, cityQuery]);

  const closeCityDropdown = () => {
    setIsCityOpen(false);
    setCityQuery("");
    setCitySearchState({ loading: false, error: "" });
  };

  const submitCitySearch = async () => {
    if (!onCitySearch || !cityQuery.trim()) return;
    setCitySearchState({ loading: true, error: "" });
    const result = await onCitySearch(cityQuery);
    if (result?.ok) {
      closeCityDropdown();
    } else {
      setCitySearchState({ loading: false, error: result?.message || "City not found." });
    }
  };

  return (
    <div className="hidden sm:flex items-center gap-3 border border-(--border) rounded-full px-4 py-2.5 bg-(--background) mb-5">
      {/* Location */}
      <div className="relative" ref={desktopCityRef}>
        <button
          onClick={() => setIsCityOpen((p) => !p)}
          disabled={locationStatus === "detecting"}
          className="flex items-center gap-2 text-sm font-secondary cursor-pointer"
        >
          {locationStatus === "detecting" ? (
            <Loader2 className="w-4 h-4 text-(--primary) animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-(--primary)" />
          )}

          <span className="max-w-30 truncate">{displayCity}</span>

          <ChevronDown
            className={`w-4 h-4 transition ${
              isCityOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isCityOpen && (
          <div className="absolute left-0 top-full mt-2 bg-(--card) border border-(--border) rounded-2xl shadow-lg z-50 min-w-64 overflow-hidden">
            {/* Search any city — suggests a match, or geocodes a new one */}
            <div className="p-2 border-b border-(--border)">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-(--border) bg-(--background)">
                <Search className="w-3.5 h-3.5 text-(--muted-foreground) shrink-0" />
                <input
                  autoFocus
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCitySearchState({ loading: false, error: "" });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submitCitySearch()}
                  placeholder="Search any city..."
                  className="w-full bg-transparent outline-none text-sm font-secondary"
                />
                {citySearchState.loading && (
                  <Loader2 className="w-3.5 h-3.5 text-(--primary) animate-spin shrink-0" />
                )}
              </div>
              {citySearchState.error && (
                <p className="text-xs text-red-500 font-secondary mt-1.5 px-1">{citySearchState.error}</p>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              <button
                onClick={() => {
                  onDetectLocation();
                  closeCityDropdown();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-(--primary) font-semibold hover:bg-(--anslation-ds-primary-soft) border-b border-(--border)"
              >
                <MapPin className="w-4 h-4" />
                Use My Location
              </button>

              {filteredCityOptions.map((city) => (
                <button
                  key={city.value}
                  onClick={() => {
                    onCitySelect(city.value);
                    closeCityDropdown();
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-(--anslation-ds-soft)
                    ${
                      locationName === city.value
                        ? "text-(--primary) font-semibold bg-(--anslation-ds-primary-soft)"
                        : "text-(--foreground)"
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {city.label}
                </button>
              ))}

              {filteredCityOptions.length === 0 && (
                <button
                  onClick={submitCitySearch}
                  disabled={citySearchState.loading}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-(--primary) font-medium hover:bg-(--anslation-ds-primary-soft) disabled:opacity-60"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search &quot;{cityQuery}&quot;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-(--border)" />

      {/* Search */}
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-5 h-5 text-(--primary)" />

        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search deals, stores or categories..."
          className="w-full bg-transparent outline-none text-sm font-secondary"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-(--muted-foreground) hover:text-(--foreground) transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="px-5 py-2 rounded-full bg-(--primary) text-(--primary-foreground) text-sm font-secondary cursor-pointer hover:bg-(--primary-hover) transition"
      >
        Search
      </button>
    </div>
  );
}