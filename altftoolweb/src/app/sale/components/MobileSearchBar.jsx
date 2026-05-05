"use client";

import {
  Search,
  X,
  MapPin,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function MobileSearchBar({
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
  mobileCityRef,
}) {
  return (
    <div className="flex flex-col sm:hidden mb-5">
      <div className="w-full flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition">
        <Search className="w-4 h-4 text-[#2563EB] shrink-0" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search deals..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0 font-secondary"
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* City dropdown */}
        <div
          className="relative border-l border-gray-300 pl-3 shrink-0"
          ref={mobileCityRef}
        >
          <button
            onClick={() => setIsCityOpen((p) => !p)}
            disabled={locationStatus === "detecting"}
            className="flex items-center gap-1 text-sm text-gray-700 font-secondary"
          >
            {locationStatus === "detecting" ? (
              <Loader2 className="w-3.5 h-3.5 text-[#2563EB] animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
            )}

            <span className="max-w-23 truncate">{displayCity}</span>

            <ChevronDown
              className={`w-3 h-3 ${isCityOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isCityOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 min-w-45 overflow-hidden">
              <button
                onClick={() => {
                  onDetectLocation();
                  setIsCityOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#2563EB] font-semibold hover:bg-blue-50 border-b"
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
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50
                    ${
                      locationName === city.value
                        ? "text-[#2563EB] font-semibold bg-blue-50"
                        : "text-gray-700"
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {city.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-[#2563EB] text-white text-sm font-semibold px-5 py-3.5 rounded-full mt-3 cursor-pointer"
      >
        Search
      </button>
    </div>
  );
}