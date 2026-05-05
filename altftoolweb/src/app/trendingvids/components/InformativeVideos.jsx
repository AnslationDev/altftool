"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Play,
  Clock,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { videos, categories } from "../data/content";
import VideoCard from "./VideoCard";

const InformativeVideos = ({ data = videos, categoryList = categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6); // Initial count set to 6
  const scrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -250 : 250;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // 1. Filter all available videos first
  const allFilteredVideos = useMemo(() => {
    return data.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, selectedCategory]);

  // 2. Slice based on visibleCount
  const displayedVideos = useMemo(() => {
    return allFilteredVideos.slice(0, visibleCount);
  }, [allFilteredVideos, visibleCount]);

  // 3. Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCategory]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSelectedVideo(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="space-y-12 font-secondary max-w-7xl mx-auto py-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black font-primary tracking-tight text-foreground">
              Content <span className="text-primary">Library</span>
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Showing {allFilteredVideos.length} curated resources
            </p>
          </div>

          <div className="relative w-full lg:w-[400px] group z-20">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-sm group-focus-within:bg-background">
              <Search className="ml-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full p-4 bg-transparent focus:outline-none font-medium text-sm text-foreground placeholder:text-muted-foreground/70"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="relative flex items-center gap-2 group/container">
          <button
            onClick={() => scrollCategories("left")}
            className="z-10 p-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm
               hover:bg-accent hover:text-accent-foreground
               text-muted-foreground shadow-sm transition-all active:scale-95 hidden md:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-4 py-2"
            >
              {categoryList.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="relative min-w-fit px-5 py-2 rounded-full transition-all duration-300 isolate"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full"
                        style={{ zIndex: -1 }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span
                      className={`text-sm font-bold tracking-wide transition-colors duration-200 ${isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="z-10 p-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm
               hover:bg-accent hover:text-accent-foreground
               text-muted-foreground shadow-sm transition-all active:scale-95 hidden md:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid & Load More Section */}
      <div className="min-h-[400px] flex flex-col">
        {displayedVideos.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {displayedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <VideoCard video={video} onClick={setSelectedVideo} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {allFilteredVideos.length > visibleCount && (
              <div className="flex flex-col items-center justify-center mt-16 gap-4">
                <button
                  onClick={handleLoadMore}
                  className="group relative px-10 py-4 bg-primary text-primary-foreground font-bold rounded-2xl 
                 transition-all duration-300 hover:scale-[1.02] active:scale-95 
                 shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.6)]
                 overflow-hidden border border-white/10"
                >
                  {/* Animated Gradient Shimmer Overlay */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <span className="relative flex items-center gap-3 tracking-tight">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500 ease-out" />
                    Load More Content
                  </span>
                </button>

                {/* Subtle indicator of remaining items */}
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-70">
                  Viewing {displayedVideos.length} of {allFilteredVideos.length}{" "}
                  resources
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center bg-card/30 rounded-3xl border border-dashed border-border">
            <div className="p-4 bg-background rounded-full shadow-sm">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                No matches found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setSelectedVideo(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="lg:flex-[3] bg-black aspect-video lg:aspect-auto">
                <iframe
                  title={selectedVideo.title}
                  src={`${selectedVideo.videoUrl}?autoplay=1&mute=0&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>

              <div className="lg:flex-1 p-6 lg:p-8 flex flex-col overflow-y-auto">
                <div className="space-y-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary w-fit">
                    {selectedVideo.category}
                  </span>
                  <h2 className="text-2xl font-black font-primary text-foreground leading-tight">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {selectedVideo.description}
                  </p>
                </div>

                <div className="mt-auto pt-8 border-t border-border flex items-center gap-6">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{selectedVideo.duration}</span>
                  </div>
                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    Open on YouTube <Play className="w-3 h-3 fill-current" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InformativeVideos;