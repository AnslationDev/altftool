"use client";

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
  CITY_OPTIONS,
  locationName,
  desktopCityRef,
}) {
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
          <div className="absolute left-0 top-full mt-2 bg-(--card) border border-(--border) rounded-2xl shadow-lg z-50 min-w-50 overflow-hidden">
            <button
              onClick={() => {
                onDetectLocation();
                setIsCityOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-(--primary) font-semibold hover:bg-(--anslation-ds-primary-soft) border-b border-(--border)"
            >
              <MapPin className="w-4 h-4" />
              Use My Location
            </button>

            {CITY_OPTIONS.map((city) => (
              <button
                key={city.value}
                onClick={() => {
                  onCitySelect(city.value);
                  setIsCityOpen(false);
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