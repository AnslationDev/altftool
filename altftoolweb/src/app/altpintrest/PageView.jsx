"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { Inter, Manrope } from 'next/font/google';
import { Search, X, Compass, SlidersHorizontal, MoreHorizontal, ArrowLeft, MessageCircle, Upload, ChevronDown, Smile, Image as ImageIcon, Download, Share2, Heart } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['700'] });

import FilterBar from './components/FilterBar';
import ExploreLanding from './components/landing/ExploreLanding';
import { filters as mockFilters, MOCK_DATA } from './data/mockData';
import { firebasePinterestCategoriesSource } from './service/firebasePinterestCategories';
import { firebasePinterestPinsSource } from './service/firebasePinterestPins';
import { updatePinLikes } from './service/pinActions';

const heights = ["h-[260px]", "h-[280px]", "h-[300px]", "h-[320px]", "h-[340px]", "h-[380px]", "h-[410px]", "h-[420px]", "h-[450px]", "h-[460px]", "h-[500px]"];
const FALLBACK_PIN_IMAGE = "/altpintrest-images/pin-card.png";

const getHeightForId = (id) => {
  if (typeof id === 'number') return heights[id % heights.length];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return heights[Math.abs(hash) % heights.length];
};

const getImageUrl = (value) => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  return [
    value.mediaUrl,
    value.media,
    value.url,
    value.src,
    value.image,
    value.img,
    value.logo,
    value.imageUrl,
    value.imageURL,
    value.downloadURL,
    value.photoURL,
    value.thumbnail,
    value.path,
  ].find((candidate) => typeof candidate === "string" && candidate.trim())?.trim() || "";
};

const normalizeCategory = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const CATEGORY_KEYWORDS = {
  "animals": ["animal", "pet", "dog", "cat", "fauna", "wildlife", "nature", "puppy", "kitten"],
  "art": ["art", "artist", "artwork", "drawing", "illustration", "painting", "generative", "creative"],
  "beauty": ["beauty", "makeup", "skincare", "cushion", "cosmetics", "foundation", "skin", "hair"],
  "design": ["design", "ui", "ux", "interface", "graphic", "logo", "web", "dashboard", "mobile"],
  "diy and crafts": ["diy", "craft", "handmade", "gift", "towel", "mug", "creative", "crafts"],
  "food and drink": ["food", "drink", "recipe", "cooking", "coffee", "tea", "baking", "meal", "comfort"],
  "home decor": ["home", "decor", "interior", "living room", "furniture", "room", "architecture", "house"],
  "mens fashion": ["men", "mens", "fashion", "outfit", "style", "clothing", "wear", "suit"],
  "quotes": ["quote", "quotes", "text", "inspiration", "typography", "motto", "life"],
  "tattoos": ["tattoo", "tattoos", "ink", "body art", "tattoo design"],
  "zodiac spotlight": ["zodiac", "astrology", "leo", "horoscope", "vibe"],
  "thoughtful diys": ["diy", "craft", "handmade", "gift"],
  "make your own": ["diy", "make", "handmade", "inspo"],
};

const getPrioritizedItems = (allItems, filter, query) => {
  let list = allItems;

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(item =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.originalData && JSON.stringify(item.originalData).toLowerCase().includes(q))
    );
  }

  if (!filter || filter === "All") {
    return list;
  }

  const normFilter = normalizeCategory(filter);
  const synonyms = CATEGORY_KEYWORDS[normFilter] || [normFilter];

  const exactMatches = [];
  const relatedMatches = [];
  const remainingPins = [];

  list.forEach(item => {
    const catNorm = normalizeCategory(item.category);
    const titleNorm = normalizeCategory(item.title);

    if (catNorm === normFilter || catNorm.includes(normFilter) || normFilter.includes(catNorm)) {
      exactMatches.push(item);
    }
    else if (synonyms.some(kw => catNorm.includes(kw) || titleNorm.includes(kw))) {
      relatedMatches.push(item);
    }
    else {
      remainingPins.push(item);
    }
  });

  const matched = [...exactMatches, ...relatedMatches];

  if (matched.length < 15) {
    const needed = 15 - matched.length;
    const fallbacks = remainingPins.slice(0, needed);
    return [...matched, ...fallbacks];
  }

  return matched;
};

// `heading` is the server-rendered page h1 (see page.jsx / explore/page.jsx).
// It arrives as children so it is present in the server HTML rather than only
// after hydration, and exactly one of the two branches below renders it.
export default function AltPinterest({ defaultView, children: heading }) {
  const [showLanding, setShowLanding] = useState(defaultView !== "explore");
  const [activeTab, setActiveTab] = useState("discover");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItems, setSavedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

  const [firebaseCategories, setFirebaseCategories] = useState([]);
  const [firebasePins, setFirebasePins] = useState([]);

  useEffect(() => {
    const unsubCategories = firebasePinterestCategoriesSource.subscribe((data) => {
      setFirebaseCategories(data);
    });

    const unsubPins = firebasePinterestPinsSource.subscribe((data) => {
      setFirebasePins(data);
    });

    return () => {
      unsubCategories && unsubCategories();
      unsubPins && unsubPins();
    };
  }, []);

  const dynamicData = firebasePins.length > 0
    ? firebasePins.map(pin => {
      const category = pin.Category || pin.category || "Other";
      const mainImage = getImageUrl(pin.image || pin.img || pin.logo || pin.url || pin.imageUrl || pin.imageURL || pin.photoURL || pin.thumbnail) || FALLBACK_PIN_IMAGE;
      const gallerySource = Array.isArray(pin.gallery)
        ? pin.gallery
        : Array.isArray(pin.images)
          ? pin.images
          : [];
      const gallery = gallerySource.map(getImageUrl).filter(Boolean);

      return {
        id: pin.id,
        title: pin.title || "Untitled",
        image: mainImage,
        height: getHeightForId(pin.id),
        category: category,
        gallery: gallery,
        originalData: pin
      };
    })
    : MOCK_DATA;

  // Save scroll helper
  const saveCurrentScroll = () => {
    if (typeof window !== "undefined") {
      const key = showLanding ? "alt_home_scroll" : "alt_explore_scroll";
      sessionStorage.setItem(key, window.scrollY.toString());
      return window.scrollY;
    }
    return 0;
  };

  // Popstate event handler for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      const categoryParam = params.get("category");
      const searchParam = params.get("search");
      const pinParam = params.get("pin");

      if (state) {
        setShowLanding(state.showLanding);
        setActiveFilter(state.activeFilter || "All");
        setSearchQuery(state.searchQuery || "");
        setActiveTab(state.activeTab || "discover");

        if (state.selectedItemId) {
          const targetPin = dynamicData.find(d => d.id.toString() === state.selectedItemId.toString());
          setSelectedItem(targetPin || null);
        } else {
          setSelectedItem(null);
        }

        const scrollYToRestore = state.prevScrollY ?? state.fromHomeScrollY ?? state.scrollY ?? 0;
        setTimeout(() => {
          window.scrollTo({ top: scrollYToRestore, behavior: 'instant' });
        }, 40);

      } else {
        const isExploreView = viewParam === "explore" || defaultView === "explore" || !!categoryParam;
        setShowLanding(!isExploreView);
        setActiveFilter(categoryParam || "All");
        setSearchQuery(searchParam || "");

        if (pinParam) {
          const targetPin = dynamicData.find(d => d.id.toString() === pinParam.toString());
          setSelectedItem(targetPin || null);
        } else {
          setSelectedItem(null);
        }

        const storageKey = !isExploreView ? "alt_home_scroll" : "alt_explore_scroll";
        const savedScroll = parseInt(sessionStorage.getItem(storageKey) || "0", 10);
        setTimeout(() => {
          window.scrollTo({ top: savedScroll, behavior: 'instant' });
        }, 40);
      }
    };

    // Replace initial history state if empty
    if (typeof window !== "undefined" && !window.history.state) {
      const params = new URLSearchParams(window.location.search);
      const isExploreView = params.get("view") === "explore" || defaultView === "explore" || !!params.get("category");
      window.history.replaceState({
        showLanding: !isExploreView,
        activeFilter: params.get("category") || "All",
        searchQuery: params.get("search") || "",
        selectedItemId: params.get("pin") || null,
        activeTab: "discover",
        scrollY: window.scrollY
      }, "", window.location.href);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultView, dynamicData]);

  const dynamicFilters = firebaseCategories.length > 0
    ? ["All", ...firebaseCategories.map(cat => cat.name)]
    : mockFilters;

  let displayedItems = dynamicData;

  if (activeTab === "discover") {
    displayedItems = getPrioritizedItems(dynamicData, activeFilter, searchQuery);
  } else if (activeTab === "saved") {
    displayedItems = dynamicData.filter(item => savedItems.has(item.id));
  }

  const navigateToExplore = (categoryOrTerm = "") => {
    const currentScroll = saveCurrentScroll();
    let catToSet = "All";

    if (categoryOrTerm) {
      if (categoryOrTerm === "All Categories" || categoryOrTerm === "Featured Editorial") {
        catToSet = "All";
      } else {
        catToSet = categoryOrTerm;
      }
    }

    const params = new URLSearchParams(window.location.search);
    params.set("view", "explore");
    if (catToSet !== "All") {
      params.set("category", catToSet);
    } else {
      params.delete("category");
    }
    params.delete("pin");
    const newUrl = `${window.location.pathname}?${params.toString()}`;

    const stateObj = {
      showLanding: false,
      activeFilter: catToSet,
      searchQuery: searchQuery,
      selectedItemId: null,
      activeTab: "discover",
      fromHomeScrollY: currentScroll,
      scrollY: 0
    };

    if (typeof window !== "undefined") {
      window.history.pushState(stateObj, "", newUrl);
    }

    setActiveFilter(catToSet);
    setShowLanding(false);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToHome = () => {
    saveCurrentScroll();
    const targetScroll = parseInt(sessionStorage.getItem("alt_home_scroll") || "0", 10);

    const params = new URLSearchParams(window.location.search);
    params.delete("view");
    params.delete("category");
    params.delete("search");
    params.delete("pin");
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;

    const stateObj = {
      showLanding: true,
      activeFilter: "All",
      searchQuery: "",
      selectedItemId: null,
      activeTab: "discover",
      scrollY: targetScroll
    };

    if (typeof window !== "undefined") {
      window.history.pushState(stateObj, "", newUrl);
    }

    setShowLanding(true);
    setSelectedItem(null);
    setTimeout(() => {
      window.scrollTo({ top: targetScroll, behavior: 'instant' });
    }, 30);
  };

  const handleCardClick = (item) => {
    const currentScroll = saveCurrentScroll();

    const params = new URLSearchParams(window.location.search);
    params.set("pin", item.id.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;

    const stateObj = {
      showLanding: showLanding,
      activeFilter: activeFilter,
      searchQuery: searchQuery,
      selectedItemId: item.id,
      activeTab: activeTab,
      prevScrollY: currentScroll
    };

    if (typeof window !== "undefined") {
      window.history.pushState(stateObj, "", newUrl);
    }

    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackFromDetail = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      setSelectedItem(null);
      const key = showLanding ? "alt_home_scroll" : "alt_explore_scroll";
      const savedScroll = parseInt(sessionStorage.getItem(key) || "0", 10);
      setTimeout(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' });
      }, 30);
    }
  };

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = async (e, imageUrl, title) => {
    e.stopPropagation();

    if (imageUrl.startsWith('/')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title || 'pin'}.png`;
      link.click();
      return;
    }

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'pin'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("CORS/Download failed, falling back to new tab:", error);
      const newWindow = window.open(imageUrl, '_blank');
      if (!newWindow) {
        alert("Please allow popups to download this image.");
      }
    }
  };

  const handleLike = async (e, pinId, originalId) => {
    e.stopPropagation();
    const idToUpdate = originalId || pinId;
    if (typeof idToUpdate !== 'string') {
      setLikedItems(prev => {
        const next = new Set(prev);
        if (next.has(pinId)) next.delete(pinId);
        else next.add(pinId);
        return next;
      });
      return;
    }

    const result = await updatePinLikes(idToUpdate);
    if (!result.success && result.error?.code === 'permission-denied') {
      alert("Permission Denied: Please update your Firestore Rules to allow likes (see instructions).");
    }
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  if (showLanding) {
    return (
      <ExploreLanding
        heading={heading}
        onStartExploring={(term) => navigateToExplore(term)}
        onNavigateHome={navigateToHome}
        onNavigateExplore={() => navigateToExplore("")}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] ${inter.className}`}>

      {/* Main Content Container */}
      <div className="max-w-[1280px] mx-auto w-full flex flex-col pt-10 pb-20 px-6 md:px-8">

        {/* Header navigation bar inside Explore feed */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-6">
            <div
              onClick={navigateToHome}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
                P
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white hidden sm:inline">
                AltPinterest
              </span>
            </div>

            <nav className="flex items-center gap-2 font-semibold text-sm">
              <button
                onClick={navigateToHome}
                className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab("discover");
                  setSelectedItem(null);
                  setActiveFilter("All");
                }}
                className={`px-4 py-2 rounded-full font-bold transition-colors cursor-pointer ${activeTab === "discover"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200"
                  }`}
              >
                Explore
              </button>
              <button
                onClick={() => {
                  setActiveTab("saved");
                  setSelectedItem(null);
                }}
                className={`px-4 py-2 rounded-full font-bold transition-colors cursor-pointer ${activeTab === "saved"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200"
                  }`}
              >
                Saved Ideas ({savedItems.size})
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={navigateToHome}
              className="px-4 py-2 flex items-center gap-2 border border-[#E5E7EB] dark:border-[var(--border)] rounded-full hover:bg-gray-100 dark:hover:bg-[var(--muted)] transition-colors text-xs sm:text-sm font-semibold text-[#4A5565] dark:text-[var(--foreground)] cursor-pointer"
              title="Return to Home Landing"
            >
              <Compass size={18} className="text-[#E60023]" />
              <span className="hidden sm:inline">Home Landing</span>
            </button>
          </div>
        </div>

        {/* Server-rendered page heading. Sits above the tab switch so it is
            present for every sub-view and stays the single h1 on the route. */}
        {heading ? <div className="mb-8">{heading}</div> : null}

        {/* ======================================= */}
        {/* 1. DISCOVER TOP: SEARCH BAR             */}
        {/* ======================================= */}
        {activeTab === "discover" && (
          <div className="flex items-center gap-4 w-full mb-6">
            <div
              className="flex-1 bg-[#F1F5F9] dark:bg-[var(--muted)] rounded-[9999px] h-[56px] flex items-center px-6 border border-transparent focus-within:border-[#2563EB] focus-within:ring-0 focus-within:outline-none transition-colors"
              style={{ outline: 'none' }}
            >
              <Search size={20} className="text-[#64748B] mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search pins, categories, ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none text-[#64748B] dark:text-[var(--foreground)] placeholder-[#64748B] text-[14px] w-full"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
              {searchQuery && (
                <X
                  size={18}
                  className="text-[#64748B] cursor-pointer hover:text-gray-800 dark:hover:text-white ml-3 shrink-0"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 2. DISCOVER: DEFAULT MASONRY GRID         */}
        {/* ======================================= */}
        {activeTab === "discover" && !selectedItem ? (
          <>
            {/* Filters Row */}
            <FilterBar
              filters={dynamicFilters}
              activeFilter={activeFilter}
              setActiveFilter={(filter) => {
                setActiveFilter(filter);
                if (typeof window !== "undefined") {
                  const params = new URLSearchParams(window.location.search);
                  params.set("view", "explore");
                  if (filter !== "All") params.set("category", filter);
                  else params.delete("category");
                  const newUrl = `${window.location.pathname}?${params.toString()}`;
                  window.history.pushState({
                    showLanding: false,
                    activeFilter: filter,
                    searchQuery: searchQuery,
                    selectedItemId: null,
                    activeTab: "discover",
                    scrollY: window.scrollY
                  }, "", newUrl);
                }
              }}
            />

            {/* Active Filter Indicator */}
            {activeFilter !== "All" && (
              <div className="mb-6 flex items-center justify-between bg-gray-50 dark:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Showing pins for: <span className="font-bold text-gray-900 dark:text-white capitalize">{activeFilter}</span>
                </p>
                <button
                  onClick={() => {
                    setActiveFilter("All");
                    if (typeof window !== "undefined") {
                      const params = new URLSearchParams(window.location.search);
                      params.delete("category");
                      const newUrl = `${window.location.pathname}?${params.toString()}`;
                      window.history.pushState({
                        showLanding: false,
                        activeFilter: "All",
                        searchQuery: searchQuery,
                        selectedItemId: null,
                        activeTab: "discover",
                        scrollY: window.scrollY
                      }, "", newUrl);
                    }
                  }}
                  className="text-xs font-semibold text-[#E60023] hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Masonry Grid */}
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
              {displayedItems.map(item => (
                <div
                  key={item.id}
                  className="break-inside-avoid flex flex-col gap-2 mb-8 group cursor-pointer relative"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="overflow-hidden rounded-[14.36px] bg-[var(--muted)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => handleDownload(e, item.image, item.title)}
                      className="p-2 bg-white/90 hover:bg-white rounded-full text-black shadow-sm transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={(e) => toggleSave(e, item.id)}
                      className={`px-4 py-2 rounded-full font-bold text-sm ${savedItems.has(item.id) ? 'bg-black text-white' : 'bg-[#E60023] text-white'}`}
                    >
                      {savedItems.has(item.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  <div className="flex justify-end px-2 opacity-60 group-hover:opacity-100 transition-opacity mt-1">
                    <MoreHorizontal size={24} className="text-[var(--foreground)] hover:text-[#2563EB] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </>

        ) : activeTab === "discover" && selectedItem ? (

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-2 items-center lg:items-start">

            {/* Left Column: Detail Card & Back Button */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 w-full lg:w-auto">
              <button
                onClick={handleBackFromDetail}
                className="self-start lg:mt-3 p-3 hover:bg-[var(--muted)] rounded-full transition-colors shrink-0 border border-transparent dark:border-[var(--border)] cursor-pointer"
                title="Back"
              >
                <ArrowLeft size={24} className="text-[var(--foreground)]" />
              </button>

              {/* Detail Card Container */}
              <div className="w-full lg:w-[596px] bg-[var(--card)] rounded-[32px] shadow-lg shadow-black/5 border border-[#E5E5E0] dark:border-[var(--border)] overflow-hidden flex flex-col shrink-0">

                {/* Actions Header */}
                <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[var(--card)] z-10">
                  <div className="flex items-center gap-6">
                    <div
                      onClick={(e) => handleLike(e, selectedItem.id, selectedItem.originalData?.id)}
                      className="flex items-center gap-1.5 hover:bg-[var(--muted)] px-2 py-1 rounded-lg cursor-pointer transition-colors text-[var(--foreground)]"
                    >
                      <Heart size={22} className={selectedItem.originalData?.likes > 0 || likedItems.has(selectedItem.id) ? "fill-[#2563EB] text-[#2563EB]" : ""} />
                      <span className="font-bold text-[15.5px]">{selectedItem.originalData?.likes || (likedItems.has(selectedItem.id) ? 1 : 0)}</span>
                    </div>
                    <MessageCircle size={22} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]" />
                    <button onClick={(e) => handleShare(e, selectedItem)} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]">
                      <Share2 size={22} />
                    </button>
                    <button onClick={(e) => handleDownload(e, selectedItem.image, selectedItem.title)} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]">
                      <Download size={22} />
                    </button>
                    <MoreHorizontal size={22} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]" />
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-bold text-[15.5px] flex items-center gap-1 cursor-pointer text-[var(--foreground)]">
                      Profile <ChevronDown size={18} />
                    </span>
                    <button
                      onClick={(e) => toggleSave(e, selectedItem.id)}
                      className={`px-6 py-3 rounded-full font-bold text-[15.5px] transition-colors cursor-pointer ${savedItems.has(selectedItem.id)
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                        }`}
                    >
                      {savedItems.has(selectedItem.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Main Image */}
                <div className="px-4 flex justify-center bg-gray-50/50 dark:bg-zinc-900/50 rounded-[24px] overflow-hidden">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="max-w-full h-auto block rounded-[24px] object-contain"
                    style={{ maxHeight: '700px' }}
                  />
                </div>

                {/* Gallery Carousel/Thumbnails if present */}
                {selectedItem.gallery && selectedItem.gallery.length > 0 && (
                  <div className="px-8 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Pin Gallery ({selectedItem.gallery.length + 1} images)
                    </p>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                      <button
                        onClick={() => setSelectedItem(prev => ({
                          ...prev,
                          image: getImageUrl(prev.originalData?.image || prev.originalData?.img || prev.originalData?.logo || prev.originalData?.url) || FALLBACK_PIN_IMAGE
                        }))}
                        className={`h-14 w-14 overflow-hidden rounded-lg border-2 shrink-0 transition ${selectedItem.image === (getImageUrl(selectedItem.originalData?.image || selectedItem.originalData?.img || selectedItem.originalData?.logo || selectedItem.originalData?.url) || FALLBACK_PIN_IMAGE)
                          ? 'border-[#2563EB]'
                          : 'border-transparent hover:border-gray-300'
                          }`}
                      >
                        <img
                          src={getImageUrl(selectedItem.originalData?.image || selectedItem.originalData?.img || selectedItem.originalData?.logo || selectedItem.originalData?.url) || FALLBACK_PIN_IMAGE}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>

                      {selectedItem.gallery.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedItem(prev => ({ ...prev, image: imgUrl }))}
                          className={`h-14 w-14 overflow-hidden rounded-lg border-2 shrink-0 transition ${selectedItem.image === imgUrl
                            ? 'border-[#2563EB]'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Info & Comments */}
                <div className="px-8 py-8 flex flex-col gap-6">
                  {/* Was an h1. The pin detail is a client-side sub-view of
                      this route, not its own document, and the route now has a
                      server-rendered h1 above — so this is the sub-view's
                      heading, not the page's. Text and styling unchanged. */}
                  <h2 className="text-[20px] font-bold leading-tight text-[var(--foreground)] font-[#Segoe_UI]">
                    {selectedItem.title || "Visual inspiration"}
                  </h2>

                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[14px] font-medium text-[var(--foreground)]">
                      AltFTool visual library
                    </span>
                  </div>

                  <div className="border-t border-[#E9E9E9] dark:border-[var(--border)] pt-8 mt-4">
                    <h2 className="text-[16px] font-bold mb-4 text-[var(--foreground)] font-[#Segoe_UI]">No comments yet</h2>
                    <div className="bg-[#F3F4F6] dark:bg-[var(--muted)] border border-[#E5E5E0] dark:border-[var(--border)] rounded-full px-5 py-3.5 flex items-center justify-between cursor-pointer">
                      <span className="text-[15.5px] text-[#9197A3]">Add a comment to start the conversation</span>
                      <div className="flex gap-4 text-gray-500">
                        <Smile size={20} className="hover:text-gray-700 dark:hover:text-white transition-colors" />
                        <ImageIcon size={20} className="hover:text-gray-700 dark:hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Masonry Grid (More like this) */}
            <div className="flex-1 mt-10 lg:mt-0">
              <h3 className="font-bold text-xl mb-6 text-[var(--foreground)] lg:hidden">More like this</h3>
              <div className="columns-2 md:columns-3 gap-6">
                {dynamicData.filter(item => {
                  if (item.id === selectedItem.id) return false;

                  const sameCategory = item.category && selectedItem.category && item.category.toLowerCase() === selectedItem.category.toLowerCase();
                  const sameTitle = item.title && selectedItem.title && (
                    item.title.toLowerCase().includes(selectedItem.title.toLowerCase()) ||
                    selectedItem.title.toLowerCase().includes(item.title.toLowerCase())
                  );

                  return sameCategory || sameTitle;
                }).map(item => (
                  <div
                    key={item.id}
                    className="break-inside-avoid flex flex-col gap-2 mb-6 group cursor-pointer relative"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="overflow-hidden rounded-[14.36px] bg-[var(--muted)]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleSave(e, item.id)}
                        className={`px-4 py-2 rounded-full font-bold text-sm ${savedItems.has(item.id) ? 'bg-black text-white' : 'bg-[#E60023] text-white'}`}
                      >
                        {savedItems.has(item.id) ? 'Saved' : 'Save'}
                      </button>
                    </div>

                    <div className="flex justify-end px-2 opacity-60 group-hover:opacity-100 transition-opacity mt-1">
                      <MoreHorizontal size={24} className="text-[var(--foreground)] hover:text-[#2563EB] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        ) : (

          /* ======================================= */
          /* 4. SAVED IDEAS VIEW                     */
          /* ======================================= */
          <>
            <div className="flex items-center gap-4 mb-10 w-full mt-4">
              <button
                onClick={handleBackFromDetail}
                className="w-[40px] h-[40px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[var(--muted)] rounded-full transition-colors shrink-0 border border-transparent dark:border-[var(--border)] cursor-pointer"
                title="Back"
              >
                <ArrowLeft size={24} className="text-black dark:text-[var(--foreground)]" />
              </button>

              <div className="flex items-end gap-[6px]">
                {/* Was an h1, demoted for the same reason as the pin detail
                    above: the Saved tab is a sub-view of this route. */}
                <h2 className={`text-[40px] leading-[40px] font-bold tracking-[-0.5px] text-[#000000] dark:text-[var(--foreground)] ${manrope.className}`}>
                  Your saved Ideas
                </h2>
                <Heart size={30} strokeWidth={2.5} className="text-[#000000] dark:text-[var(--foreground)] mb-1" />
              </div>
            </div>

            {/* Masonry Grid for Saved Ideas */}
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
              {displayedItems.map(item => (
                <div
                  key={item.id}
                  className="break-inside-avoid flex flex-col gap-[6px] mb-8 group cursor-pointer relative"
                  onClick={() => {
                    setActiveTab("discover");
                    handleCardClick(item);
                  }}
                >

                  <div className="overflow-hidden rounded-[14.36px] bg-[var(--muted)] relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => handleDownload(e, item.image, item.title)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-full text-black shadow-sm transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => toggleSave(e, item.id)}
                        className="px-3 py-1.5 rounded-full font-bold text-xs bg-white text-black hover:bg-gray-200"
                      >
                        Unsave
                      </button>
                    </div>
                  </div>

                  <div className="px-1 mt-1">
                    <p className="text-[12.5px] leading-[15px] font-normal text-[#000000] dark:text-[var(--foreground)] truncate font-[#Segoe_UI]">
                      {item.title}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
