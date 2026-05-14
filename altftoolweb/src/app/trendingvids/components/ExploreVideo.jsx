"use client";
import { Play, Plus, Clock, X, ChevronDown } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import VideoDialogModal from "./VideoDialogModal";
import { useYoutubeVideos } from "../hooks/useYoutubeVideos";
import ReelsView from "./ReelsView";
import { useTheme } from "@/contexts/ThemeContext";
import { matchesExploreCategory } from "../services/firebaseTrendingVideos";
import ManagedImage from "@/components/ui/ManagedImage";
import DataStateNotice from "@/components/ui/DataStateNotice";

export default function ExploreVideos({
  categories = [],
  searchResults,
  activeCategory,
  onClearSearch,
}) {
  const [active, setActive] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tab, setTab] = useState("Videos");
  const [sortBy, setSortBy] = useState("Latest");
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { theme } = useTheme();
  const visibleCategories = useMemo(() => categories.slice(0, 4), [categories]);
  const filters = useMemo(() => ["All", ...visibleCategories], [visibleCategories]);
  const searchedActiveFilter = useMemo(() => {
    const firstCategory = searchResults?.[0]?.category;
    if (!firstCategory) return "";
    return (
      filters.find((filter) => filter.toLowerCase() === firstCategory.toLowerCase()) || "All"
    );
  }, [filters, searchResults]);
  const activeFilter = searchedActiveFilter || activeCategory || active;

  const { videos, loading, loadMore, hasMore, error, source } = useYoutubeVideos(
    activeFilter,
    tab,
    sortBy,
  );

  useEffect(() => {
    if (tab === "Reels") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [tab]);

  const handleCategoryClick = (filterName) => {
    setActive(filterName);
    if (onClearSearch) onClearSearch();
  };

  const videosToShow = (() => {
    if (searchResults && searchResults.length > 0) {
      if (activeFilter === "All") return searchResults;
      return searchResults.filter((v) =>
        matchesExploreCategory({ category: v.category }, activeFilter),
      );
    }
    return videos;
  })();

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise((res) => setTimeout(res, 2000));
    await loadMore();
    setIsLoadingMore(false);
  };

  const getVideoKey = (v) => v.id ?? v.videoId ?? v._id;

  if (tab === "Reels") {
    return (
      <div className="fixed inset-0 z-[10000] bg-(--card) flex flex-col ">
        <div className="  flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E2E8F0] bg-(--background) shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-(--foreground)">
            Reels
          </h2>

          <div className="flex items-center gap-3">
            <div className="bg-[#F1F5F9] border-(--border) rounded-full p-1 flex gap-1">
              {["Videos", "Reels"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`px-4 py-1.5 text-sm rounded-full transition cursor-pointer ${
                    tab === item ? "bg-[#2563EB] text-white" : "text-[#64748B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTab("Videos")}
              className="p-2 rounded-full hover:bg-[#F1F5F9] transition cursor-pointer"
              aria-label="Close Reels"
            >
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ReelsView active={activeFilter} />
        </div>
      </div>
    );
  }

  return (
    <>
      <section id="explore-videos" className="section text-center   ">
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 relative">
            <div className="text-center w-full">
              <h2 className="section-title animate-slide-up">
                Explore Video Content
              </h2>

              <p className="section-subtitle !mb-0 animate-slide-up">
                Browse all videos across tools, workflows, and insights filtered
                to match your interests
              </p>
            </div>

            <div
              className=" mt-4
  sm:mt-0
  sm:ml-auto
  w-fit            
  self-start      
  sm:self-auto
  rounded-full p-1 flex gap-1 shadow-sm
  animate-slide-left  "
            >
              {["Videos", "Reels"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`px-4 sm:px-5 py-2 text-sm rounded-full transition cursor-pointer whitespace-nowrap ${
                    tab === item
                      ? "bg-(--primary) text-white"
                      : "text-(--muted-foreground)"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="flex gap-3 whitespace-nowrap min-w-max px-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleCategoryClick(filter)}
                    className={`animate-slide-right px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-medium border transition cursor-pointer flex-shrink-0 ${
                      activeFilter === filter
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
                        : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 animate-slide-left">
              <span className="text-md text-(--muted-foreground) whitespace-nowrap">
                Sort by :
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none border border-(--border) rounded-full px-4 pr-10 py-2 text-sm text-(--foreground) outline-none cursor-pointer"
                >
                  <option>Latest</option>
                  <option>Popular</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-(--foreground) ">
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>
          </div>

          {source === "fallback" && !loading ? (
            <DataStateNotice
              compact
              className="mb-6 text-left"
              title={error ? "Live videos could not refresh" : "Live videos are still syncing"}
              message="Showing a curated local video set so the browsing experience stays usable."
            />
          ) : null}

          {loading ? (
            <p className="text-center text-(--foreground)">
              Loading videos....
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {videosToShow.map((v, i) => {
                const hoverKey = getVideoKey(v);
                const isHovered = hoveredVideo === hoverKey;

                return (
                  <div
                    key={i}
                    className={`w-full animate-slide-right rounded-[20px] p-4 shadow-sm flex flex-col h-full space-y-3 shadow-md transition-all duration-300 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] ${theme === "dark" ? "bg-(--card) border border-(--border)" : "bg-white border border-gray-200"}`}
                  >
                    <div className="flex flex-col flex-grow">
                      <div
                        className="relative rounded-[16px] overflow-hidden"
                        onMouseEnter={() => setHoveredVideo(hoverKey)}
                        onMouseLeave={() => setHoveredVideo(null)}
                      >
                        {isHovered ? (
                          // ── FIX: check source === "file" (not "firebase") ──────────────
                          v.source === "file" || (!v.videoId && v.videoUrl) ? (
                            <video
                              src={v.videoUrl}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full aspect-video object-cover"
                            />
                          ) : (
                            <iframe
                              className="w-full aspect-video"
                              src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=1`}
                              allow="autoplay"
                            />
                          )
                        ) : (
                          <ManagedImage
                            src={v.image || v.thumbnail}
                            alt={v.title}
                            className="w-full aspect-video object-cover"
                          />
                        )}

                        <div className="absolute top-3 right-3 bg-[#E8F2FF] text-[#203667] text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <Clock size={16} />
                          {v.time}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="bg-[#E8F2FF] text-[#203667] px-3 py-1 rounded-full text-md font-bold">
                          {v.channelName}
                        </span>
                        <span className="text-[#94A3B8] text-xs sm:text-sm">
                          {v.date}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-[15px] font-semibold text-(--foreground) mt-3 line-clamp-2 min-h-[48px]">
                        {v.title}
                      </h3>

                      <p className="text-sm text-[#64748B] mt-2 line-clamp-2 min-h-[40px]">
                        {v.desc || ""}
                      </p>
                    </div>

                    <button
                      // ── FIX: pass full video object, not just the ID ──────────────
                      onClick={() => setSelectedVideo(v)}
                      className="mt-auto w-full bg-(--primary) text-white py-3 rounded-full flex items-center justify-center gap-2 text-sm hover:bg-(--primary-hover) cursor-pointer"
                    >
                      <Play size={16} /> Watch Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && !loading && (
            <div className="text-center flex items-center gap-4 justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="bg-[#E8F2FF] text-[#203667] px-6 py-3 rounded-full transition cursor-pointer flex flex-row items-center gap-2 font-semibold"
              >
                <Plus />
                {isLoadingMore ? "Loading..." : "Load More Content"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FIX: pass the full video object — modal handles both YT and Firebase ── */}
      {selectedVideo && (
        <VideoDialogModal
          videoId={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
