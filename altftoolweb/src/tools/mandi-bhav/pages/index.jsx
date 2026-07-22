"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  Calendar,
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function MandiBhav() {
  const [searchCity, setSearchCity] = useState("");
  const [searchCrop, setSearchCrop] = useState("");
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Popular states in India
  const states = [
    "Delhi",
    "Maharashtra",
    "Punjab",
    "Haryana",
    "Uttar Pradesh",
    "Karnataka",
    "Tamil Nadu",
    "Gujarat",
    "Rajasthan",
    "Madhya Pradesh",
    "Bihar",
  ];

  // Popular crops and vegetables
  const popularCrops = [
    "Wheat",
    "Rice",
    "Potato",
    "Onion",
    "Tomato",
    "Cotton",
    "Sugarcane",
    "Maize",
  ];

  // Real API endpoint for data.gov.in
  const API_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  // Public API key
  const API_KEY = "579b464db66ec23bdd000001a96749eb8ea44e9e569839eccd6d13a0";

  // Fetch real market data from data.gov.in API
  const fetchRealMarketData = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: "100",
        offset: "0",
      });

      // Add filters if selected
      if (selectedState) {
        params.append("filters[state]", selectedState);
      }
      if (searchCrop) {
        params.append("filters[commodity]", searchCrop);
      }

      const response = await fetch(`${API_URL}?${params}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        setMarketData(data.records);
        setLastUpdated(new Date());
        setError("");
      } else {
        setError(
          "No data found for the selected filters. Try different search criteria."
        );
        setMarketData([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(
        `Unable to fetch real-time data: ${err.message}. Showing sample data.`
      );
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const sampleCrops = [
      "Wheat",
      "Rice",
      "Potato",
      "Onion",
      "Tomato",
      "Cotton",
      "Bajra",
      "Maize",
    ];
    const sampleMarkets = ["APMC Market", "Mandi Samiti", "Krishi Upaj Mandi"];
    const sampleStates = ["Delhi", "Maharashtra", "Punjab", "Haryana"];

    const sample = [];
    for (let i = 0; i < 12; i++) {
      const minPrice = Math.floor(Math.random() * 1000) + 500;
      const maxPrice = minPrice + Math.floor(Math.random() * 500) + 200;
      const modalPrice = Math.floor((minPrice + maxPrice) / 2);

      sample.push({
        state: sampleStates[i % sampleStates.length],
        district: "Sample District",
        market: sampleMarkets[i % sampleMarkets.length],
        commodity: sampleCrops[i % sampleCrops.length],
        variety: "Local",
        min_price: minPrice.toString(),
        max_price: maxPrice.toString(),
        modal_price: modalPrice.toString(),
        arrival_date: new Date().toISOString().split("T")[0],
      });
    }
    setMarketData(sample);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    // Load real data on component mount
    fetchRealMarketData();
  }, [selectedState]);

  const handleSearch = () => {
    fetchRealMarketData();
  };

  const handleRefresh = () => {
    fetchRealMarketData();
  };

  const filteredData = marketData.filter((item) => {
    const cityMatch =
      !searchCity ||
      item.market?.toLowerCase().includes(searchCity.toLowerCase()) ||
      item.district?.toLowerCase().includes(searchCity.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchCity.toLowerCase());

    const cropMatch =
      !searchCrop ||
      item.commodity?.toLowerCase().includes(searchCrop.toLowerCase());

    return cityMatch && cropMatch;
  });

  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-(--card) p-8 rounded-3xl border border-(--border) shadow-sm">
          <div className="flex items-center gap-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 shrink-0">
              <TrendingUp className="w-8 h-8 text-(--primary)" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-(--foreground) tracking-tight">
                Mandi Bhav
              </h1>
              <p className="text-(--muted-foreground) mt-1">
                Daily Crop & Vegetable Market Rates - Live from AGMARKNET
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-(--primary) text-white hover:bg-(--primary)/90 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
            {lastUpdated && (
              <p className="text-xs text-(--muted-foreground)">
                Updated: {lastUpdated.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-(--card) rounded-2xl shadow-sm border border-(--border) p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-(--foreground) mb-2">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-(--background) text-(--foreground) border border-(--border) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all appearance-none"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--foreground) mb-2">
                City / Market / District
              </label>
              <input
                type="text"
                placeholder="Search location..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-(--background) text-(--foreground) border border-(--border) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--foreground) mb-2">
                Crop / Vegetable
              </label>
              <input
                type="text"
                placeholder="Search commodity..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-(--background) text-(--foreground) border border-(--border) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full h-11 bg-(--primary) text-white hover:bg-(--primary)/90 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search Prices
              </button>
            </div>
          </div>

          {/* Quick Search Pills */}
          <div className="mt-6 pt-6 border-t border-(--border)">
            <p className="text-sm font-medium text-(--muted-foreground) mb-3">Popular Crops</p>
            <div className="flex flex-wrap gap-2">
              {popularCrops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => {
                    setSearchCrop(crop);
                    fetchRealMarketData();
                  }}
                  className="px-4 py-1.5 bg-(--primary)/10 text-(--primary) rounded-full text-sm font-medium hover:bg-(--primary)/20 transition-colors border border-(--primary)/20"
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Real-Time Data from AGMARKNET Portal
            </p>
            <p className="text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
              This app fetches live market prices from India's official agricultural marketing portal (data.gov.in). Data is updated daily by market officials across the country.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-500 font-medium">{error}</p>
          </div>
        )}

        {/* Market Data Cards */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <Loader2 className="w-12 h-12 text-(--primary) animate-spin mb-6" />
            <p className="text-(--muted-foreground) font-medium text-lg animate-pulse">Fetching latest market rates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredData.map((item, index) => {
              const minPrice = parseFloat(item.min_price) || 0;
              const maxPrice = parseFloat(item.max_price) || 0;
              const modalPrice = parseFloat(item.modal_price) || 0;
              const priceRange = maxPrice - minPrice;
              const changePercent = minPrice > 0 ? ((priceRange / minPrice) * 100).toFixed(1) : 0;

              return (
                <div
                  key={index}
                  className="bg-(--card) rounded-2xl border border-(--border) shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden group"
                >
                  {/* Decorative left accent line */}
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-(--primary) opacity-70 group-hover:opacity-100 transition-opacity" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-bold text-(--foreground) capitalize">
                        {item.commodity}
                      </h3>
                      {item.variety && item.variety !== "Other" && (
                        <p className="text-sm text-(--muted-foreground) capitalize">{item.variety}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-(--muted-foreground) mt-3 bg-(--muted)/50 inline-flex px-2 py-1 rounded-md">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {item.market}, {item.district || item.state}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-(--muted-foreground) mb-1 font-medium">Range</div>
                      <div className="text-(--primary) font-bold bg-(--primary)/10 px-2 py-1 rounded-md">
                        {changePercent}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-(--background) border border-(--border) p-4 rounded-xl">
                      <span className="text-(--muted-foreground) font-medium text-sm">
                        Modal Price
                      </span>
                      <span className="text-2xl font-bold text-(--primary)">
                        ₹{modalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-(--border) space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-(--muted-foreground) font-medium">Min Price</span>
                        <span className="font-bold text-(--foreground)">
                          ₹{minPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-(--muted-foreground) font-medium">Max Price</span>
                        <span className="font-bold text-(--foreground)">
                          ₹{maxPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {item.arrival_date && (
                      <div className="flex items-center gap-2 text-xs text-(--muted-foreground) pt-4 mt-2 border-t border-(--border)">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          Arrival: {new Date(item.arrival_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="text-center py-24 bg-(--card) rounded-3xl border border-(--border) shadow-sm">
            <Search className="w-16 h-16 text-(--muted) mx-auto mb-6" />
            <p className="text-(--foreground) font-semibold text-xl mb-2">No market data found</p>
            <p className="text-(--muted-foreground)">
              Try adjusting your search filters or click refresh
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
