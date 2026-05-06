"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "../components/SearchBar";
import { AppCard } from "../components/AppCard";
import { truncateText } from "../utils/helper";
import { fetchApps } from "../utils/appService";
import Features from "../components/Features";

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [similarApps, setSimilarApps] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [compareApps, setCompareApps] = useState([]);
  const [trendingApps, setTrendingApps] = useState([]);
  const [detectedCategory, setDetectedCategory] = useState(null);

  const categories = [
    "Social","Music","Productivity","Finance","Education","Gaming","Food & Groceries","Entertainment",
  ];

  const handleTagClick = (tag) => {
    const filtered = allApps.filter((app) =>
      app.tags?.includes(tag)
    );
    setResults(filtered);
  };

  const handleCategory = async (category) => {
    setQuery(category);
    setLoading(true);
    try {
      const apps = await fetchApps(category);
      setResults(apps);
      setAllApps(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);
      try {
        const apps = await fetchApps("popular");
        setResults(apps);
        setAllApps(apps);

        const trending = await fetchApps("trending");
        setTrendingApps(trending.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const handleCompare = (app) => {
    setCompareApps((prev) => {
      const exists = prev.find((a) => a.trackId === app.trackId);
      if (exists) return prev.filter((a) => a.trackId !== app.trackId);
      if (prev.length === 2) return prev;
      return [...prev, app];
    });
  };

  const searchApps = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const aiMap = {
        study: "Education",
        focus: "Productivity",
        music: "Music",
        chat: "Social",
        video: "Entertainment",
        money: "Finance",
      };

      let detected = query;
      Object.keys(aiMap).forEach((key) => {
        if (query.toLowerCase().includes(key)) {
          detected = aiMap[key];
        }
      });

      setDetectedCategory(detected);

      const apps = await fetchApps(detected || query);
      setResults(apps);
      setAllApps(apps);

      if (apps.length > 0) {
        const mainCategory = apps[0].category;

        const similar = apps.filter(
          (app, index) =>
            app.category === mainCategory && index !== 0
        );
        setSimilarApps(similar.slice(0, 4));

        const alt = apps.filter(
          (app, index) =>
            app.category === mainCategory && index !== 0
        );
        setAlternatives(alt.slice(0, 4));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="heading pt-5 text-2xl sm:text-3xl lg:text-4xl">
            Find Your Mobile App
          </h1>
          <p className="description pt-2 text-sm sm:text-base">
            Search for your favorite apps and discover new ones.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-10 max-w-3xl mx-auto">
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={searchApps}
            loading={loading}
            categories={categories}
            handleCategory={handleCategory}
          />
        </div>

        {/* AI MESSAGE */}
        {detectedCategory !== null && query && (
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-4">
            Showing smart results for &quot;{detectedCategory}&quot;
          </p>
        )}

        {/* RESULTS */}
        <div className="mb-10 rounded-2xl shadow-lg border-2 border-(--border) p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              {loading
                ? "Searching..."
                : query
                ? "Search Results"
                : "Popular Apps"}
            </h2>

            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {results.length} Apps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {results.map((app, index) => (
              <AppCard
                key={index}
                app={app}
                short={truncateText}
                onCompare={handleCompare}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        </div>

        {/* TRENDING */}
        {trendingApps.length > 0 && (
          <div className="mb-10 ">
            <h2 className="text-lg font-semibold mb-4 ">
              🔥 Trending Apps Today
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 items-stretch ">
              {trendingApps.map((app, index) => (
                <div key={index} className="min-w-[240px] sm:min-w-[260px] flex mt-2">
                  <AppCard
                    app={app}
                    short={truncateText}
                    onTagClick={handleTagClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <Features />
    </div>
  );
}