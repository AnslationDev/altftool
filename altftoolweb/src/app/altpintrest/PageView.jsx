"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import { Inter, Manrope } from 'next/font/google';
import { Search, X, Menu, Compass, SlidersHorizontal, MoreHorizontal, ArrowLeft, MessageCircle, Upload, ChevronDown, Smile, Image as ImageIcon, Download, Share2, Heart, Sparkles, RefreshCw, Loader2, ArrowDown, Check, RotateCcw, AlertCircle } from 'lucide-react';
import './altpintrest.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['700'] });

import ExploreLanding from './components/landing/ExploreLanding';
import ExploreHeaderHero from './components/landing/ExploreHeaderHero';
import PinSkeletonGrid from './components/landing/PinSkeletonGrid';
import ProgressivePinImage from './components/landing/ProgressivePinImage';
import { filters as mockFilters, MOCK_DATA } from './data/mockData';
import { firebasePinterestCategoriesSource } from './service/firebasePinterestCategories';
import { firebasePinterestPinsSource } from './service/firebasePinterestPins';
import { updatePinLikes } from './service/pinActions';
import { downloadPinImage } from './service/downloadHelper';
import { useSavedPins } from './service/useSavedPins';
import { useLikedPins } from './service/useLikedPins';

const heights = ["h-[260px]", "h-[280px]", "h-[300px]", "h-[320px]", "h-[340px]", "h-[380px]", "h-[410px]", "h-[420px]", "h-[450px]", "h-[460px]", "h-[500px]"];
const FALLBACK_PIN_IMAGE = "/altpintrest-images/Listitem → Group - Pin card.png";

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
  "food and recipes": ["food", "drink", "recipe", "cooking", "coffee", "tea", "baking", "meal", "comfort"],
  "home decor": ["home", "decor", "interior", "living room", "furniture", "room", "architecture", "house"],
  "home decor idea": ["home", "decor", "interior", "living room", "furniture", "room", "architecture", "house"],
  "mens fashion": ["men", "mens", "fashion", "outfit", "style", "clothing", "wear", "suit"],
  "outfit and style idea": ["men", "mens", "fashion", "outfit", "style", "clothing", "wear", "suit", "beauty", "girl", "woman"],
  "green thumb idea": ["plant", "plants", "garden", "green", "flower", "nature", "campfire", "outdoor"],
  "ui and ai design idea": ["ui", "ux", "ai", "design", "midjourney", "prompt", "cyberpunk", "dashboard", "web", "art"],
  "quotes": ["quote", "quotes", "text", "inspiration", "typography", "motto", "life"],
  "tattoos": ["tattoo", "tattoos", "ink", "body art", "tattoo design"],
  "zodiac spotlight": ["zodiac", "astrology", "leo", "horoscope", "vibe", "afro"],
  "thoughtful diys": ["diy", "craft", "handmade", "gift", "towel", "mug"],
  "make your own": ["handmade", "ceramic", "mug", "pottery", "craft", "diy"],
  "trending ui": ["ui", "ux", "neumorphic", "interface", "dashboard", "design"],
  "conversational ui": ["ai", "conversational", "ui", "card", "chat", "bot"],
  "prompts": ["prompt", "prompts", "midjourney", "anime", "avatar", "french crop", "ai"],
  "rain": ["rain", "rainy", "water", "monsoon", "drop", "weather", "storm"],
  "fifa world cup": ["fifa", "world cup", "football", "soccer", "stadium", "sports", "match", "cup"],
  "rose": ["rose", "roses", "flower", "red rose", "floral", "bloom", "botanical"],
  "ai images": ["ai", "ai image", "ai art", "generative art", "midjourney", "dall-e", "prompt", "digital art"],
  "ai art": ["ai", "ai image", "ai art", "generative art", "midjourney", "dall-e", "prompt", "digital art"],
  "car": ["car", "cars", "vehicle", "automobile", "sports car", "supercar", "drive", "ride"],
  "cool wallpaper": ["wallpaper", "wallpapers", "background", "desktop wallpaper", "phone wallpaper", "cool wallpaper", "aesthetic"],
  "flowers": ["flower", "flowers", "rose", "floral", "botanical", "bloom", "garden", "tulip"],
  "graphic design": ["graphic design", "design", "ui", "ux", "typography", "logo", "poster", "branding", "vector"],
  "nature": ["nature", "landscape", "forest", "mountain", "ocean", "trees", "wildlife", "sky", "outdoor"],
  "productivity": ["productivity", "workspace", "code", "dev", "tech", "setup", "office"],
  "development": ["development", "dev", "code", "react", "ui", "programming", "tech"],
  "ui design": ["ui", "ux", "interface", "web", "design", "dashboard", "app"]
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

// `heading` is the server-rendered landing-page h1 from page.jsx. It arrives as
// children so it is present in the initial HTML; the explore branch supplies
// its own visible h1 in ExploreHeaderHero.
export default function AltPinterest({ defaultView, children: heading }) {
  const [showLanding, setShowLanding] = useState(defaultView !== "explore");
  const [activeTab, setActiveTab] = useState("discover");
  const [activeExploreNavTab, setActiveExploreNavTab] = useState("home");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { savedPins, savedIds, isSaved, toggleSave: toggleSaveStore } = useSavedPins();
  const { isLiked, toggleLike } = useLikedPins();
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Download State & Notification Toast Management
  const [downloadingState, setDownloadingState] = useState({});
  const [downloadToast, setDownloadToast] = useState({
    show: false,
    message: '',
    type: 'loading',
    retryFn: null
  });
  const toastTimerRef = useRef(null);

  // Pagination & Infinite Scroll States
  const BATCH_SIZE = 50;
  const MAX_AUTO_BATCHES = 3;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [autoBatchCount, setAutoBatchCount] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const observerTargetRef = useRef(null);

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

  const combinedCategories = React.useMemo(() => {
    if (firebaseCategories.length > 0) return firebaseCategories;
    const pinCategories = Array.from(
      new Set(firebasePins.map(p => p.Category || p.category).filter(Boolean))
    );
    return pinCategories.map(c => ({ id: c, name: c }));
  }, [firebaseCategories, firebasePins]);

  const dynamicFilters = combinedCategories.length > 0
    ? ["All", ...combinedCategories.map(cat => cat.name || cat.title || cat)]
    : mockFilters;

  let displayedItems = dynamicData;

  if (activeTab === "discover") {
    displayedItems = getPrioritizedItems(dynamicData, activeFilter, searchQuery);
  } else if (activeTab === "saved") {
    const savedList = savedPins.map(savedPin => {
      const match = dynamicData.find(d => String(d.id) === String(savedPin.id) || d.id === savedPin.id);
      return match ? { ...savedPin, ...match } : savedPin;
    });
    displayedItems = savedList;
  }

  // Smart Recommendation Pins for Saved Tab (Up to 50 pins, excluding saved pins)
  const savedCategories = new Set(
    savedPins.map((p) => normalizeCategory(p.category)).filter(Boolean)
  );
  const availableRecommendationPins = dynamicData.filter((pin) => !isSaved(pin.id));
  const categoryMatchPins = [];
  const remainingRecommendationPins = [];

  availableRecommendationPins.forEach((pin) => {
    const normCat = normalizeCategory(pin.category);
    if (savedCategories.size > 0 && savedCategories.has(normCat)) {
      categoryMatchPins.push(pin);
    } else {
      remainingRecommendationPins.push(pin);
    }
  });

  const recommendedPins = [...categoryMatchPins, ...remainingRecommendationPins].slice(0, 50);

  const totalItemsCount = displayedItems.length;
  const isSelectedActive = Boolean(selectedItem);

  // Handle initial loading & reset pagination when filter or search changes
  useEffect(() => {
    setIsInitialLoading(true);
    setVisibleCount(BATCH_SIZE);
    setAutoBatchCount(1);
    setFetchError(null);

    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [activeFilter, searchQuery, activeTab]);

  // Infinite scroll trigger via IntersectionObserver (Only for first 3 automatic batches)
  useEffect(() => {
    if (isInitialLoading || isSelectedActive || showLanding || autoBatchCount >= MAX_AUTO_BATCHES) return;

    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && visibleCount < totalItemsCount) {
          setIsLoadingMore(true);

          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, totalItemsCount));
            setAutoBatchCount((prev) => prev + 1);
            setIsLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 0.1, rootMargin: '350px' }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isInitialLoading, isLoadingMore, visibleCount, totalItemsCount, isSelectedActive, showLanding, autoBatchCount]);

  // Manual Load More handler after 3 auto batches
  const handleLoadMoreManual = () => {
    if (isLoadingMore || visibleCount >= displayedItems.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, displayedItems.length));
      setAutoBatchCount(1); // Reset auto batch count to allow subsequent auto loading
      setIsLoadingMore(false);
    }, 600);
  };

  const paginatedItems = displayedItems.slice(0, visibleCount);

  // Related pins for Pin Detail view
  const detailRelatedItems = selectedItem ? (() => {
    const matches = dynamicData.filter(item => {
      if (item.id === selectedItem.id) return false;
      const sameCategory = item.category && selectedItem.category && item.category.toLowerCase() === selectedItem.category.toLowerCase();
      const sameTitle = item.title && selectedItem.title && (
        item.title.toLowerCase().includes(selectedItem.title.toLowerCase()) ||
        selectedItem.title.toLowerCase().includes(item.title.toLowerCase())
      );
      return sameCategory || sameTitle;
    });

    const fallbacks = dynamicData.filter(item => item.id !== selectedItem.id && !matches.some(m => m.id === item.id));
    return [...matches, ...fallbacks];
  })() : [];

  const leftSideRelated = detailRelatedItems.slice(0, 8);
  const rightSideRelated = detailRelatedItems.slice(8, 20);
  const bottomInfiniteRelated = detailRelatedItems.slice(20);

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
    params.set("view", "explore");
    params.set("pin", item.id.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;

    const stateObj = {
      showLanding: false,
      activeFilter: activeFilter,
      searchQuery: searchQuery,
      selectedItemId: item.id,
      activeTab: "discover",
      prevScrollY: currentScroll
    };

    if (typeof window !== "undefined") {
      window.history.pushState(stateObj, "", newUrl);
    }

    setShowLanding(false);
    setActiveTab("discover");
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

  const toggleSave = (e, itemOrId) => {
    if (e && e.stopPropagation) e.stopPropagation();
    let fullPin = null;
    if (typeof itemOrId === 'object' && itemOrId !== null) {
      fullPin = itemOrId;
    } else {
      fullPin = dynamicData.find(p => String(p.id) === String(itemOrId) || p.id === itemOrId) || { id: itemOrId };
    }
    toggleSaveStore(fullPin);
  };

  const showToast = (message, type = 'loading', retryFn = null, autoHide = true) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setDownloadToast({ show: true, message, type, retryFn });

    if (autoHide && type !== 'loading') {
      toastTimerRef.current = setTimeout(() => {
        setDownloadToast(prev => ({ ...prev, show: false }));
      }, 3500);
    }
  };

  const handleDownload = (e, item, optionalTitle = '') => {
    e?.stopPropagation();

    const pinId = typeof item === 'object' ? item.id : (item || 'download');
    const imageUrl = typeof item === 'object' ? (item.image || item.src || item.url) : item;
    const title = optionalTitle || (typeof item === 'object' ? item.title : '');

    setDownloadingState(prev => ({ ...prev, [pinId]: 'preparing' }));
    showToast('Preparing your download...', 'loading', null, false);

    downloadPinImage(item, title, {
      onStateChange: (state, message) => {
        setDownloadingState(prev => ({ ...prev, [pinId]: state }));

        if (state === 'preparing') {
          showToast('Preparing your download...', 'loading', null, false);
        } else if (state === 'downloading') {
          showToast('Downloading high-resolution image...', 'loading', null, false);
        } else if (state === 'success') {
          showToast('✓ Image Downloaded Successfully', 'success');
          setTimeout(() => {
            setDownloadingState(prev => ({ ...prev, [pinId]: 'idle' }));
          }, 3000);
        } else if (state === 'error') {
          const retry = () => handleDownload(null, item, title);
          showToast('Unable to download this image. Please try again.', 'error', retry, false);
        }
      },
      onError: (errorMsg, retryFn) => {
        showToast(errorMsg || 'Unable to download this image. Please try again.', 'error', retryFn, false);
      }
    });
  };

  const handleLike = async (e, pinId, currentLikesCount = 0) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const targetId = String(pinId || "");
    if (!targetId) return;

    await toggleLike(targetId, currentLikesCount, (err) => {
      if (err?.code !== 'permission-denied') {
        showToast("Unable to update like. Please try again.", "error");
      }
    });
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div className={`altpinterest-root min-h-screen bg-[var(--background)] text-[var(--foreground)] ${inter.className}`}>
      {/* Global Unified Sticky Header Across All Pages */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800/80 px-3 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="max-w-[1560px] mx-auto h-16 flex items-center justify-between gap-2 sm:gap-4 w-full">

          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            <div
              onClick={() => {
                navigateToHome();
                setMobileMenuOpen(false);
              }}
              className="flex items-center cursor-pointer group shrink-0"
            >
              <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-[#0D9488] transition-colors">
                AltPintrest
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5 font-semibold shrink-0">
              <button
                onClick={navigateToHome}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors text-sm ${showLanding
                  ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200"
                  }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab("discover");
                  setSelectedItem(null);
                  navigateToExplore("");
                }}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors text-sm ${!showLanding && activeTab === "discover"
                  ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200"
                  }`}
              >
                Explore
              </button>
              <button
                onClick={() => {
                  setShowLanding(false);
                  setActiveTab("saved");
                  setSelectedItem(null);
                }}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-colors text-sm ${!showLanding && activeTab === "saved"
                  ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200"
                  }`}
              >
                Saved ({savedPins.length})
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl min-w-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateToExplore(searchQuery);
                setMobileMenuOpen(false);
              }}
              className="relative flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent focus-within:border-[#0d9488] focus-within:ring-0 focus-within:outline-none transition-colors"
              style={{ outline: 'none' }}
            >
              <Search size={16} className="text-gray-400 mr-1.5 sm:mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none placeholder-gray-400"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </form>
          </div>

          {/* Desktop User Controls Action Button */}
          <div className="hidden sm:flex items-center shrink-0">
            <button
              onClick={() => {
                if (showLanding) navigateToExplore("");
                else navigateToHome();
              }}
              className="px-4 py-2 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Compass size={16} />
              <span>{showLanding ? "Enter Feed" : "Home Landing"}</span>
            </button>
          </div>

          {/* Mobile Menu Icon Toggle (Visible on mobile < sm) */}
          <div className="flex sm:hidden items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 flex flex-col gap-2.5 shadow-lg animate-in slide-in-from-top duration-200">
            <button
              onClick={() => {
                navigateToHome();
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${showLanding
                ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-800 dark:text-gray-200"
                }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setActiveTab("discover");
                setSelectedItem(null);
                navigateToExplore("");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${!showLanding && activeTab === "discover"
                ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-800 dark:text-gray-200"
                }`}
            >
              Explore
            </button>

            <button
              onClick={() => {
                setShowLanding(false);
                setActiveTab("saved");
                setSelectedItem(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${!showLanding && activeTab === "saved"
                ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-800 dark:text-gray-200"
                }`}
            >
              Saved ({savedPins.length})
            </button>

            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 mt-1">
              <button
                onClick={() => {
                  if (showLanding) navigateToExplore("");
                  else navigateToHome();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={18} />
                <span>{showLanding ? "Enter Feed" : "Home Landing"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Body Content */}
      {showLanding ? (
        <ExploreLanding
          onStartExploring={(term) => navigateToExplore(term)}
          onNavigateHome={navigateToHome}
          onNavigateExplore={() => navigateToExplore("")}
          onSelectPin={(pin) => handleCardClick(pin)}
          dynamicData={dynamicData}
          heading={heading}
        />
      ) : (
        <div className="max-w-[1560px] mx-auto w-full flex flex-col pt-6 pb-20 px-4 sm:px-6 lg:px-8">
          {/* ======================================= */}
          {/* EXPLORE HERO & EDITORIAL CATEGORY PANELS */}
          {/* ======================================= */}
          {activeTab === "discover" && !selectedItem && (
            <ExploreHeaderHero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeFilter}
              categories={combinedCategories}
              onSelectCategory={(cat) => {
                const catToSet = (cat === "All" || cat === "Popular" || cat === "Trending") ? "All" : cat;
                setActiveFilter(catToSet);
                if (typeof window !== "undefined") {
                  const params = new URLSearchParams(window.location.search);
                  params.set("view", "explore");
                  if (catToSet !== "All") params.set("category", catToSet);
                  else params.delete("category");
                  const newUrl = `${window.location.pathname}?${params.toString()}`;
                  window.history.pushState({
                    showLanding: false,
                    activeFilter: catToSet,
                    searchQuery: searchQuery,
                    selectedItemId: null,
                    activeTab: "discover",
                    scrollY: window.scrollY
                  }, "", newUrl);
                }
              }}
              activeNavTab={activeExploreNavTab}
              setActiveNavTab={setActiveExploreNavTab}
            />
          )}

          {/* ======================================= */}
          {/* 2. DISCOVER: DEFAULT MASONRY GRID & PAGINATION */}
          {/* ======================================= */}
          {activeTab === "discover" && !selectedItem ? (
            <div id="pins-feed-section" className="w-full">
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
                    className="text-xs font-semibold text-[#0D9488] hover:underline cursor-pointer"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {/* Error Retry Banner */}
              {fetchError && (
                <div className="my-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between text-red-800 dark:text-red-300">
                  <span className="text-sm font-medium">Failed to load pins. Please try again.</span>
                  <button
                    onClick={() => {
                      setFetchError(null);
                      setIsInitialLoading(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Initial Pinterest-Style Skeleton Loader */}
              {isInitialLoading ? (
                <PinSkeletonGrid count={15} />
              ) : (
                <>
                  {/* Main Masonry Grid */}
                  <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-6 w-full">
                    {paginatedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="break-inside-avoid flex flex-col gap-2 mb-8 group cursor-pointer relative transition-all duration-300 transform"
                        style={{
                          animation: 'fadeInUp 0.35s ease-out forwards',
                          animationDelay: `${(idx % 10) * 0.03}s`
                        }}
                        onClick={() => handleCardClick(item)}
                      >
                        {/* Progressive Blur-Up Image with Aspect Ratio Protection */}
                        <ProgressivePinImage
                          src={item.image}
                          alt={item.title}
                          heightClass={item.height}
                        />

                        {/* Card Title & Author Metadata */}
                        <div className="pt-1.5 px-1 flex flex-col gap-0.5">
                          <h4 className="text-gray-900 dark:text-white font-semibold text-[14px] sm:text-[15px] leading-snug truncate">
                            {item.title || "Untitled Pin"}
                          </h4>
                          {item.author && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-1">
                              {item.author}
                            </p>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                          <button
                            onClick={(e) => handleDownload(e, item)}
                            disabled={downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading'}
                            className="p-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full shadow-md border border-gray-200/80 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-70"
                            title="Download Image"
                            aria-label={`Download ${item.title || 'image'}`}
                          >
                            {downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading' ? (
                              <Loader2 size={18} className="animate-spin text-[#0D9488]" />
                            ) : downloadingState[item.id] === 'success' ? (
                              <Check size={18} className="text-emerald-500" />
                            ) : (
                              <Download size={18} className="text-gray-900 dark:text-white" />
                            )}
                          </button>
                          <button
                            onClick={(e) => toggleSave(e, item)}
                            aria-label={isSaved(item.id) ? "Unsave Pin" : "Save Pin"}
                            className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${isSaved(item.id) ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-[#0D9488] text-white hover:bg-teal-700'}`}
                          >
                            {isSaved(item.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        <div className="flex justify-between items-center px-1 opacity-70 group-hover:opacity-100 transition-opacity mt-0.5">
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {item.category || item.tag || 'Free Stock'}
                          </span>
                          <div className="flex items-center gap-2.5">
                            <div
                              onClick={(e) => {
                                const targetId = item.originalData?.id || item.id;
                                const count = item.originalData?.likes || item.likes || 0;
                                handleLike(e, targetId, count);
                              }}
                              aria-label={isLiked(item.id) ? "Unlike Pin" : "Like Pin"}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 cursor-pointer transition-colors"
                            >
                              <Heart size={14} className={isLiked(item.id) ? "fill-red-500 text-red-500 scale-110" : ""} />
                              <span>{(item.originalData?.likes || item.likes || 0) + (isLiked(item.id) ? 1 : 0)}</span>
                            </div>
                            <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300 hover:text-[#0D9488] dark:hover:text-teal-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Loading Skeleton during Infinite Scroll / Load More */}
                  {isLoadingMore && (
                    <div className="mt-6">
                      <PinSkeletonGrid count={10} />
                    </div>
                  )}

                  {/* Infinite Scroll Trigger Sentinel (Active for first 3 batches) */}
                  {autoBatchCount < MAX_AUTO_BATCHES && (
                    <div ref={observerTargetRef} className="h-10 w-full my-4" />
                  )}

                  {/* Load More Button (Appears after 3 Auto Batches) */}
                  {!isLoadingMore && autoBatchCount >= MAX_AUTO_BATCHES && visibleCount < displayedItems.length && (
                    <div className="my-10 flex flex-col items-center justify-center">
                      <button
                        onClick={handleLoadMoreManual}
                        disabled={isLoadingMore}
                        className="px-8 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-3 disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Loading more inspiration...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Inspiration</span>
                            <ArrowDown size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* End of Feed Banner */}
                  {!isLoadingMore && visibleCount >= displayedItems.length && displayedItems.length > 0 && (
                    <div className="my-14 py-8 flex flex-col items-center justify-center border-t border-gray-200/80 dark:border-zinc-800 text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                        <Sparkles size={20} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        You're all caught up ✨
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You've viewed all {displayedItems.length} available pins in this feed.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

          ) : activeTab === "discover" && selectedItem ? (

            <div className="flex flex-col gap-6 mt-1 w-full">

              {/* Top Back Navigation Bar */}
              <div className="flex items-center justify-between w-full pb-1">
                <button
                  onClick={handleBackFromDetail}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs border border-gray-200/80 dark:border-zinc-700 hover:scale-105"
                  title="Back to feed"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>

                {selectedItem.category && (
                  <span className="text-xs sm:text-sm font-semibold px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] border border-teal-200/80 dark:border-teal-800/60 uppercase tracking-wider">
                    {selectedItem.category}
                  </span>
                )}
              </div>

              {/* Top 2-Column Section: Left Detail Card + Continued Pins, Right Related Pins */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-start w-full">

                {/* Left Column Container: Main Detail Card + Continued Related Pins */}
                <div className="flex flex-col gap-6 w-full lg:w-[520px] xl:w-[640px] shrink-0">

                  {/* Main Detail Card */}
                  <div className="w-full bg-[var(--card)] rounded-[32px] shadow-lg shadow-black/5 border border-[#E5E5E0] dark:border-[var(--border)] overflow-hidden flex flex-col">

                    {/* Actions Header */}
                    <div className="flex items-center justify-between px-3 sm:px-6 py-3.5 sm:py-5 sticky top-0 bg-[var(--card)] z-10 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2.5 sm:gap-6 shrink-0">
                        <div
                          onClick={(e) => {
                            const targetId = selectedItem.originalData?.id || selectedItem.id;
                            const count = selectedItem.originalData?.likes || selectedItem.likes || 0;
                            handleLike(e, targetId, count);
                          }}
                          aria-label={isLiked(selectedItem.originalData?.id || selectedItem.id) ? "Unlike Pin" : "Like Pin"}
                          className="flex items-center gap-1.5 hover:bg-[var(--muted)] px-2.5 py-1.5 rounded-full cursor-pointer transition-all duration-200 active:scale-95 text-[var(--foreground)]"
                        >
                          <Heart size={20} className={isLiked(selectedItem.originalData?.id || selectedItem.id) ? "fill-red-500 text-red-500 scale-110" : "hover:text-red-500"} />
                          <span className="font-bold text-xs sm:text-[15.5px]">
                            {(selectedItem.originalData?.likes || selectedItem.likes || 0) + (isLiked(selectedItem.originalData?.id || selectedItem.id) ? 1 : 0)}
                          </span>
                        </div>
                        <MessageCircle size={20} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)] shrink-0" />
                        <button onClick={(e) => handleShare(e, selectedItem)} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)] shrink-0">
                          <Share2 size={20} />
                        </button>
                        <button
                          onClick={(e) => handleDownload(e, selectedItem)}
                          disabled={downloadingState[selectedItem.id] === 'preparing' || downloadingState[selectedItem.id] === 'downloading'}
                          className="hover:text-gray-500 cursor-pointer text-[var(--foreground)] shrink-0 disabled:opacity-50"
                          title="Download Image"
                          aria-label={`Download ${selectedItem.title || 'image'}`}
                        >
                          {downloadingState[selectedItem.id] === 'preparing' || downloadingState[selectedItem.id] === 'downloading' ? (
                            <Loader2 size={20} className="animate-spin text-[#0D9488]" />
                          ) : downloadingState[selectedItem.id] === 'success' ? (
                            <Check size={20} className="text-emerald-500" />
                          ) : (
                            <Download size={20} />
                          )}
                        </button>
                        <MoreHorizontal size={20} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)] shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                        <span className="font-bold text-xs sm:text-[15.5px] items-center gap-1 cursor-pointer text-[var(--foreground)] hidden xs:flex">
                          Profile <ChevronDown size={16} />
                        </span>
                        <button
                          onClick={(e) => toggleSave(e, selectedItem)}
                          aria-label={isSaved(selectedItem.id) ? "Unsave Pin" : "Save Pin"}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-[15.5px] transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${isSaved(selectedItem.id)
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-[#0D9488] text-white hover:bg-teal-700'
                            }`}
                        >
                          {isSaved(selectedItem.id) ? 'Saved' : 'Save'}
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
                              ? 'border-[#0D9488]'
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
                                ? 'border-[#0D9488]'
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
                      <h1 className="text-[20px] font-bold leading-tight text-[var(--foreground)] font-[#Segoe_UI]">
                        {selectedItem.title || "AI Generated Inspiration"}
                      </h1>

                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="user" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[14px] font-medium text-[var(--foreground)]">Lamice Neves</span>
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

                  {/* Continued Related Pins directly beneath Selected Detail Card */}
                  {leftSideRelated.length > 0 && (
                    <div className="mt-4 flex flex-col gap-4 w-full">
                      <h3 className="font-bold text-xl text-[var(--foreground)] font-[#Segoe_UI]">
                        More to explore
                      </h3>
                      <div className="columns-2 gap-6 w-full">
                        {leftSideRelated.map(item => (
                          <div
                            key={item.id}
                            className="break-inside-avoid flex flex-col gap-2 mb-6 group cursor-pointer relative"
                            onClick={() => {
                              handleCardClick(item);
                              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <ProgressivePinImage
                              src={item.image}
                              alt={item.title}
                              heightClass={item.height}
                            />

                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={(e) => toggleSave(e, item)}
                                aria-label={isSaved(item.id) ? "Unsave Pin" : "Save Pin"}
                                className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${isSaved(item.id) ? 'bg-black text-white' : 'bg-[#0D9488] text-white hover:bg-teal-700'}`}
                              >
                                {isSaved(item.id) ? 'Saved' : 'Save'}
                              </button>
                            </div>

                            <div className="flex justify-end items-center px-1 opacity-70 group-hover:opacity-100 transition-opacity mt-0.5">
                              <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300 hover:text-[#0D9488] transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Masonry Grid (More like this) */}
                <div className="flex-1 min-w-0 mt-6 lg:mt-0 w-full">
                  <h3 className="font-bold text-xl mb-6 text-[var(--foreground)] font-[#Segoe_UI]">
                    More like this
                  </h3>
                  <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 2xl:columns-3 gap-4 sm:gap-6 w-full">
                    {rightSideRelated.map(item => (
                      <div
                        key={item.id}
                        className="break-inside-avoid flex flex-col gap-2 mb-6 group cursor-pointer relative"
                        onClick={() => {
                          handleCardClick(item);
                          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <ProgressivePinImage
                          src={item.image}
                          alt={item.title}
                          heightClass={item.height}
                        />

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => toggleSave(e, item)}
                            aria-label={isSaved(item.id) ? "Unsave Pin" : "Save Pin"}
                            className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${isSaved(item.id) ? 'bg-black text-white' : 'bg-[#0D9488] text-white hover:bg-teal-700'}`}
                          >
                            {isSaved(item.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        <div className="flex justify-end items-center px-1 opacity-70 group-hover:opacity-100 transition-opacity mt-0.5">
                          <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300 hover:text-[#0D9488] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Full-Width Continuous Infinite Feed */}
              {bottomInfiniteRelated.length > 0 && (
                <div className="w-full pt-10 mt-6 border-t border-gray-200/80 dark:border-zinc-800 flex flex-col items-center">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] font-[#Segoe_UI]">
                      Explore more ideas
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Continuous visual story inspiration matching your selection
                    </p>
                  </div>

                  <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-6 w-full">
                    {bottomInfiniteRelated.map(item => (
                      <div
                        key={item.id}
                        className="break-inside-avoid flex flex-col gap-2 mb-8 group cursor-pointer relative transition-all duration-300 transform"
                        onClick={() => {
                          handleCardClick(item);
                          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <ProgressivePinImage
                          src={item.image}
                          alt={item.title}
                          heightClass={item.height}
                        />

                        {/* Card Title & Author Metadata */}
                        <div className="pt-1.5 px-1 flex flex-col gap-0.5">
                          <h4 className="text-gray-900 dark:text-white font-semibold text-[14px] sm:text-[15px] leading-snug truncate">
                            {item.title || "Untitled Pin"}
                          </h4>
                          {item.author && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-1">
                              {item.author}
                            </p>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                          <button
                            onClick={(e) => handleDownload(e, item)}
                            disabled={downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading'}
                            className="p-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full shadow-md border border-gray-200/80 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-70"
                            title="Download Image"
                            aria-label={`Download ${item.title || 'image'}`}
                          >
                            {downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading' ? (
                              <Loader2 size={18} className="animate-spin text-[#0D9488]" />
                            ) : downloadingState[item.id] === 'success' ? (
                              <Check size={18} className="text-emerald-500" />
                            ) : (
                              <Download size={18} className="text-gray-900 dark:text-white" />
                            )}
                          </button>
                          <button
                            onClick={(e) => toggleSave(e, item)}
                            aria-label={isSaved(item.id) ? "Unsave Pin" : "Save Pin"}
                            className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${isSaved(item.id) ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-[#0D9488] text-white hover:bg-teal-700'}`}
                          >
                            {isSaved(item.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        <div className="flex justify-end items-center px-1 opacity-70 group-hover:opacity-100 transition-opacity mt-0.5">
                          <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300 hover:text-[#0D9488] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* End of Feed Banner */}
                  <div className="my-14 py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <Sparkles size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      You've reached the end of related ideas ✨
                    </p>
                  </div>
                </div>
              )}

            </div>

          ) : (
            <>
              {/* ======================================= */}
              {/* 4. PREMIUM SAVED IDEAS HERO & FEED      */}
              {/* ======================================= */}

              {/* Saved Profile Hero Banner */}
              <div className="w-full mb-6 sm:mb-12 rounded-[24px] sm:rounded-[36px] bg-gradient-to-br from-teal-50/70 via-gray-50 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-gray-200/80 dark:border-zinc-800 p-4 sm:p-10 lg:p-12 shadow-xs sm:shadow-sm relative overflow-hidden select-none">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10">

                  {/* Profile & Info */}
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                        alt="Profile Avatar"
                        className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover ring-2 sm:ring-4 ring-white dark:ring-zinc-800 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#0D9488] border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center">
                        <Sparkles size={10} className="text-white" />
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="text-xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                          Your Saved Collection
                        </h1>
                        <Heart size={20} className="text-[#0D9488] fill-[#0D9488] shrink-0 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-base font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span>Curated by Lamice Neves</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="font-bold text-gray-900 dark:text-white">{displayedItems.length} Pins Saved</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={navigateToExplore}
                      className="w-full sm:w-auto px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Compass size={16} />
                      <span>Explore More Ideas</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Saved Pins Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-5 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  All Saved Pins ({displayedItems.length})
                </h2>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full self-start sm:self-auto">
                  Private collection • Only you can see this
                </span>
              </div>

              {/* Responsive Masonry Grid for Saved Ideas */}
              {displayedItems.length > 0 ? (
                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-3 sm:gap-6 w-full">
                  {displayedItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-8 group cursor-pointer relative transition-all duration-300 transform"
                      style={{
                        animation: 'fadeInUp 0.35s ease-out forwards',
                        animationDelay: `${(idx % 10) * 0.03}s`
                      }}
                      onClick={() => {
                        setActiveTab("discover");
                        handleCardClick(item);
                      }}
                    >
                      {/* Progressive Blur-Up Image */}
                      <ProgressivePinImage
                        src={item.image}
                        alt={item.title}
                        heightClass={item.height}
                      />

                      {/* Card Title & Author Metadata */}
                      <div className="pt-1 px-0.5 flex flex-col gap-0.5">
                        <h4 className="text-gray-900 dark:text-white font-semibold text-xs sm:text-[15px] leading-snug truncate">
                          {item.title || "Saved Inspiration"}
                        </h4>
                        {item.author && (
                          <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-medium line-clamp-1">
                            {item.author}
                          </p>
                        )}
                      </div>

                      {/* Action Controls: Always visible on mobile, Hover-activated on Desktop */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1.5 sm:gap-2 z-10">
                        <button
                          onClick={(e) => handleDownload(e, item)}
                          disabled={downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading'}
                          className="p-1.5 sm:p-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full shadow-md border border-gray-200/80 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-70"
                          title="Download Image"
                          aria-label={`Download ${item.title || 'image'}`}
                        >
                          {downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading' ? (
                            <Loader2 size={16} className="animate-spin text-[#0D9488]" />
                          ) : downloadingState[item.id] === 'success' ? (
                            <Check size={16} className="text-emerald-500" />
                          ) : (
                            <Download size={15} className="sm:w-[18px] sm:h-[18px]" />
                          )}
                        </button>
                        <button
                          onClick={(e) => toggleSave(e, item)}
                          aria-label="Unsave Pin"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-xs bg-[#0D9488] hover:bg-teal-700 text-white shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                          Unsave
                        </button>
                      </div>

                      {/* Category Label */}
                      <div className="flex justify-end items-center px-0.5 opacity-80 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity mt-0.5">
                        <MoreHorizontal size={16} className="sm:w-[20px] sm:h-[20px] text-gray-600 dark:text-gray-300 hover:text-[#0D9488] transition-colors" />
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                /* Empty Saved State fallback if user un-saves all items */
                <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-zinc-900/50 rounded-[28px] sm:rounded-[32px] border border-dashed border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] flex items-center justify-center mb-4 shadow-sm">
                    <Heart size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">You haven't saved any pins yet.</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">
                    Save your favorite visual stories, prompts, and design ideas to build your personal moodboard collection.
                  </p>
                  <button
                    onClick={navigateToExplore}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Compass size={18} />
                    <span>Discover Ideas to Save</span>
                  </button>
                </div>
              )}

              {/* ========================================================= */}
              {/* 5. RECOMMENDATIONS SECTION: MORE PINS TO EXPLORE           */}
              {/* ========================================================= */}
              {recommendedPins.length > 0 && (
                <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-gray-200/80 dark:border-zinc-800 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-6 sm:mb-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        See More Pins
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                        Handpicked visual inspiration based on your interests
                      </p>
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
                      {recommendedPins.length} Ideas to Explore
                    </span>
                  </div>

                  <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-3 sm:gap-6 w-full">
                    {recommendedPins.map((item, idx) => {
                      const itemSaved = isSaved(item.id);
                      return (
                        <div
                          key={item.id || idx}
                          className="break-inside-avoid flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-8 group cursor-pointer relative transition-all duration-300 transform"
                          style={{
                            animation: 'fadeInUp 0.35s ease-out forwards',
                            animationDelay: `${(idx % 10) * 0.03}s`
                          }}
                          onClick={() => {
                            handleCardClick(item);
                          }}
                        >
                          {/* Progressive Blur-Up Image */}
                          <ProgressivePinImage
                            src={item.image}
                            alt={item.title}
                            heightClass={item.height}
                          />

                          {/* Card Title & Author Metadata */}
                          <div className="pt-1 px-0.5 flex flex-col gap-0.5">
                            <h4 className="text-gray-900 dark:text-white font-semibold text-xs sm:text-[15px] leading-snug truncate">
                              {item.title || "Visual Inspiration"}
                            </h4>
                            {item.author && (
                              <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-medium line-clamp-1">
                                {item.author}
                              </p>
                            )}
                          </div>

                          {/* Floating Action Controls on Hover */}
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 sm:gap-2 z-10">
                            <button
                              onClick={(e) => handleDownload(e, item)}
                              disabled={downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading'}
                              className="p-1.5 sm:p-2 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full shadow-md border border-gray-200/80 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-70"
                              title="Download Image"
                              aria-label={`Download ${item.title || 'image'}`}
                            >
                              {downloadingState[item.id] === 'preparing' || downloadingState[item.id] === 'downloading' ? (
                                <Loader2 size={16} className="animate-spin text-[#0D9488]" />
                              ) : downloadingState[item.id] === 'success' ? (
                                <Check size={16} className="text-emerald-500" />
                              ) : (
                                <Download size={15} className="sm:w-[18px] sm:h-[18px]" />
                              )}
                            </button>
                            <button
                              onClick={(e) => toggleSave(e, item)}
                              aria-label={itemSaved ? "Unsave Pin" : "Save Pin"}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${itemSaved
                                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                                : 'bg-[#0D9488] text-white hover:bg-teal-700'
                                }`}
                            >
                              {itemSaved ? 'Saved' : 'Save'}
                            </button>
                          </div>

                          {/* Category Label */}
                          <div className="flex justify-end items-center px-0.5 opacity-80 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity mt-0.5">
                            <MoreHorizontal size={16} className="sm:w-[20px] sm:h-[20px] text-gray-600 dark:text-gray-300 hover:text-[#0D9488] transition-colors" />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* Global Download Toast Notification */}
      {downloadToast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-gray-900/95 dark:bg-zinc-800/95 backdrop-blur-md text-white shadow-2xl border border-gray-700/60 dark:border-zinc-700 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 max-w-[90vw]">
          {downloadToast.type === 'loading' ? (
            <Loader2 size={18} className="animate-spin text-[#0D9488] shrink-0" />
          ) : downloadToast.type === 'success' ? (
            <Check size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{downloadToast.message}</span>
          {downloadToast.retryFn && (
            <button
              onClick={() => {
                const fn = downloadToast.retryFn;
                setDownloadToast(prev => ({ ...prev, show: false }));
                if (typeof fn === 'function') fn();
              }}
              className="ml-2 px-3.5 py-1 bg-[#0D9488] hover:bg-teal-600 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          )}
          {downloadToast.type !== 'loading' && (
            <button
              onClick={() => setDownloadToast(prev => ({ ...prev, show: false }))}
              className="ml-1 text-gray-400 hover:text-white p-0.5 rounded-full transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
