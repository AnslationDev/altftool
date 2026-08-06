"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, ArrowRight } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80";

const ALL_CATEGORY_CARDS = [
  {
    name: "All",
    count: "All topics",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Rain",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Fifa World Cup",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Art",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "ROSE",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Ai images",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "car",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "cool wallpaper",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Flowers",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Food & Recipes",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Graphic Design",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Nature",
    count: "Topic collection",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80"
  }
];

export default function AllCategoriesModal({ isOpen, onClose, onSelectCategory, activeCategory }) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = ALL_CATEGORY_CARDS.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-xl transition-all duration-300 select-none">
      <div
        className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-zinc-950 rounded-[32px] border border-gray-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-[#0D9488]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Explore All Categories
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse all visual topics, collections, and aesthetic stories
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="px-6 sm:px-8 pt-4 pb-2">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category (e.g. Rain, Art, Nature, car)..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:px-8 sm:pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredCategories.map((topic) => {
              const isSelected = activeCategory?.toLowerCase() === topic.name.toLowerCase();

              return (
                <div
                  key={topic.name}
                  onClick={() => {
                    onSelectCategory(topic.name);
                    onClose();
                    setTimeout(() => {
                      const elem = document.getElementById("pins-feed-section");
                      if (elem) {
                        elem.scrollIntoView({ behavior: "smooth" });
                      } else if (typeof window !== "undefined") {
                        window.scrollTo({ top: 650, behavior: "smooth" });
                      }
                    }, 50);
                  }}
                  className={`group relative h-[160px] sm:h-[180px] rounded-[22px] overflow-hidden cursor-pointer border transition-all duration-300 transform hover:scale-[1.03] shadow-sm hover:shadow-xl ${
                    isSelected
                      ? "ring-4 ring-[#0D9488] border-[#0D9488]"
                      : "border-gray-200/80 dark:border-zinc-800"
                  }`}
                >
                  <img
                    src={topic.image}
                    alt={topic.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/80 mb-1">
                      {topic.count}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white capitalize leading-tight mb-1 group-hover:underline">
                      {topic.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <p className="text-base font-medium">No category matches "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs font-bold text-[#0D9488] hover:underline"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
