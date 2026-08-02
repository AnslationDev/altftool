"use client";

import { useState, useEffect, useRef } from "react";
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
  const [trendingApps, setTrendingApps] = useState([]);
  const [detectedCategory, setDetectedCategory] = useState(null);
  const latestRequestId = useRef(0);

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
    const requestId = ++latestRequestId.current;
    setQuery(category);
    // Explicit category picks are not "smart" detections, so clear any
    // stale "Showing smart results for X" banner from a previous search.
    setDetectedCategory(null);
    setLoading(true);
    try {
      const apps = await fetchApps(category);
      if (requestId !== latestRequestId.current) return;
      setResults(apps);
      setAllApps(apps);
    } catch (err) {
      console.error(err);
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    const loadApps = async () => {
      const requestId = ++latestRequestId.current;
      setLoading(true);
      try {
        const apps = await fetchApps("popular");
        if (requestId === latestRequestId.current) {
          setResults(apps);
          setAllApps(apps);
        }

        const trending = await fetchApps("trending");
        if (requestId === latestRequestId.current) {
          setTrendingApps(trending.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (requestId === latestRequestId.current) setLoading(false);
      }
    };
    loadApps();
  }, []);

  const searchApps = async () => {
    if (!query.trim()) return;
    const requestId = ++latestRequestId.current;
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

      const apps = await fetchApps(detected || query);
      if (requestId !== latestRequestId.current) return;

      setDetectedCategory(detected);
      setResults(apps);
      setAllApps(apps);
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
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
          <p className="text-center text-xs sm:text-sm text-(--muted-foreground) mb-4">
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
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        </div>

        {/* TRENDING */}
        {trendingApps.length > 0 && (
          <div className="mb-10 ">
            <h2 className="text-lg font-semibold mb-4 ">
              🔥 More Apps to Explore
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
