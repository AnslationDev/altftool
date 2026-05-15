"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import { Inter, Manrope } from 'next/font/google';
import { Search, X, Bell, Heart, SlidersHorizontal, MoreHorizontal, ArrowLeft, MessageCircle, Upload, ChevronDown, Smile, Image as ImageIcon, Download, Share2 } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['700'] });

import FilterBar from './components/FilterBar';
import { filters as mockFilters, MOCK_DATA } from './data/mockData';
import { firebasePinterestCategoriesSource } from './service/firebasePinterestCategories';
import { firebasePinterestPinsSource } from './service/firebasePinterestPins';
import { updatePinLikes } from './service/pinActions';

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
    value.url,
    value.src,
    value.image,
    value.imageUrl,
    value.imageURL,
    value.downloadURL,
    value.photoURL,
    value.thumbnail,
    value.path,
  ].find((candidate) => typeof candidate === "string" && candidate.trim())?.trim() || "";
};

export default function AltPinterest() {
  const [activeTab, setActiveTab] = useState("discover"); // "discover" or "saved"
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItems, setSavedItems] = useState(new Set([1, 3, 5, 7, 9, 10, 12, 14]));
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

  const dynamicFilters = firebaseCategories.length > 0
    ? ["All", ...firebaseCategories.map(cat => cat.name)]
    : mockFilters;

  const dynamicData = firebasePins.length > 0
    ? firebasePins.flatMap(pin => {
      const category = pin.Category || pin.category || "Other";
      const mainImage = getImageUrl(pin.image || pin.img || pin.logo || pin.url || pin.imageUrl || pin.imageURL || pin.photoURL || pin.thumbnail);
      const gallerySource = Array.isArray(pin.gallery)
        ? pin.gallery
        : Array.isArray(pin.images)
          ? pin.images
          : [];
      const gallery = gallerySource.map(getImageUrl).filter(Boolean);

      const items = [];

      // 1. Add Main Image
      if (mainImage) {
        items.push({
          id: `${pin.id}-main`,
          title: pin.title || "Untitled",
          image: mainImage,
          height: getHeightForId(`${pin.id}-main`),
          category: category,
          originalData: pin
        });
      }

      // 2. Add Gallery Images (excluding duplicates of mainImage)
      gallery.forEach((img, idx) => {
        if (img && img !== mainImage) {
          items.push({
            id: `${pin.id}-gallery-${idx}`,
            title: pin.title || "Untitled",
            image: img,
            height: getHeightForId(`${pin.id}-gallery-${idx}`),
            category: category,
            originalData: pin
          });
        }
      });

      // 3. Fallback if no images found at all
      if (items.length === 0) {
        items.push({
          id: pin.id,
          title: pin.title || "Untitled",
          image: FALLBACK_PIN_IMAGE,
          height: getHeightForId(pin.id),
          category: category,
          originalData: pin
        });
      }

      return items;
    })
    : MOCK_DATA;

  let displayedItems = dynamicData;

  if (activeTab === "discover") {
    if (activeFilter !== "All") {
      displayedItems = displayedItems.filter(item => item.category === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      displayedItems = displayedItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    }
  } else if (activeTab === "saved") {
    displayedItems = dynamicData.filter(item => savedItems.has(item.id));
  }

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleDownload = async (e, imageUrl, title) => {
    e.stopPropagation();

    // Check if it's a relative/local path (these don't have CORS issues)
    if (imageUrl.startsWith('/')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title || 'pin'}.png`;
      link.click();
      return;
    }

    try {
      // Try fetching with blob (works if CORS is configured in Firebase Console)
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
      // Fallback for cross-origin images without CORS config:
      // We open in a new tab which allows the user to right-click > Save Image
      const newWindow = window.open(imageUrl, '_blank');
      if (!newWindow) {
        alert("Please allow popups to download this image.");
      }
    }
  };

  const handleLike = async (e, pinId, originalId) => {
    e.stopPropagation();
    const idToUpdate = originalId || pinId;
    if (typeof idToUpdate !== 'string') return;

    const result = await updatePinLikes(idToUpdate);
    if (!result.success && result.error?.code === 'permission-denied') {
      alert("Permission Denied: Please update your Firestore Rules to allow likes (see instructions).");
    }
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    const shareUrl = window.location.href; // Or a specific pin URL if available
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] ${inter.className}`}>

      {/* Main Content Container */}
      <div className="max-w-[1280px] mx-auto w-full flex flex-col pt-10 pb-20 px-6 md:px-8">

        {/* ======================================= */}
        {/* 1. DISCOVER TOP: SEARCH BAR & ICONS       */}
        {/* ======================================= */}
        {activeTab === "discover" && (
          <div className="flex items-center gap-4 w-full mb-6">
            <div className="flex-1 bg-[#F1F5F9] dark:bg-[var(--muted)] rounded-[9999px] h-[60px] flex items-center px-6 focus-within:ring-2 focus-within:ring-[#2563EB]/50 transition-shadow">
              <Search size={20} className="text-[#64748B] mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search AI tools, websites, prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#64748B] dark:text-[var(--foreground)] placeholder-[#64748B] text-[14px] w-full"
              />
              {searchQuery && (
                <X
                  size={18}
                  className="text-[#64748B] cursor-pointer hover:text-gray-800 dark:hover:text-white ml-3 shrink-0"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button className="w-[40px] h-[40px] flex items-center justify-center border border-[#E5E7EB] dark:border-[var(--border)] rounded-[9999px] hover:bg-gray-100 dark:hover:bg-[var(--muted)] transition-colors text-[#4A5565] dark:text-[var(--foreground)]">
                <Bell size={20} />
              </button>
              <button
                onClick={() => {
                  setActiveTab("saved");
                  setSelectedItem(null); // Clear selection when leaving discover
                }}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[#E5E7EB] dark:border-[var(--border)] rounded-[9999px] hover:bg-gray-100 dark:hover:bg-[var(--muted)] transition-colors text-[#4A5565] dark:text-[var(--foreground)]"
                title="Go to Saved Ideas"
              >
                <Heart size={20} />
              </button>
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
              setActiveFilter={setActiveFilter}
            />

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
                      className={`w-full object-cover ${item.height} transition-transform duration-500 group-hover:scale-105`}
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
                onClick={() => setSelectedItem(null)}
                className="self-start lg:mt-3 p-3 hover:bg-[var(--muted)] rounded-full transition-colors shrink-0 border border-transparent dark:border-[var(--border)]"
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
                      <Heart size={22} className={selectedItem.originalData?.likes > 0 ? "fill-[#2563EB] text-[#2563EB]" : ""} />
                      <span className="font-bold text-[15.5px]">{selectedItem.originalData?.likes || 0}</span>
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
                      className={`px-6 py-3 rounded-full font-bold text-[15.5px] transition-colors ${savedItems.has(selectedItem.id)
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                        }`}
                    >
                      {savedItems.has(selectedItem.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Main Image */}
                <div className="px-4">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full rounded-[24px] object-cover"
                    style={{ maxHeight: '650px', minHeight: '400px' }}
                  />
                </div>
                {/* Info & Comments */}
                <div className="px-8 py-8 flex flex-col gap-6">
                  <h1 className="text-[20px] font-bold leading-tight text-[var(--foreground)] font-['Segoe_UI',_sans-serif]">
                    {selectedItem.title || "AI Generated Inspiration"}
                  </h1>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="user" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[14px] font-medium text-[var(--foreground)]">Lamice Neves</span>
                  </div>

                  <div className="border-t border-[#E9E9E9] dark:border-[var(--border)] pt-8 mt-4">
                    <h2 className="text-[16px] font-bold mb-4 text-[var(--foreground)] font-['Segoe_UI',_sans-serif]">No comments yet</h2>
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

                  // Related if: Same Category, Same Parent (Gallery), or Similar Title
                  const sameCategory = item.category && selectedItem.category && item.category === selectedItem.category;
                  const sameParent = item.originalData?.id && selectedItem.originalData?.id && item.originalData.id === selectedItem.originalData.id;
                  const sameTitle = item.title && selectedItem.title && (
                    item.title.toLowerCase().includes(selectedItem.title.toLowerCase()) ||
                    selectedItem.title.toLowerCase().includes(item.title.toLowerCase())
                  );

                  return sameCategory || sameParent || sameTitle;
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
                        className={`w-full object-cover ${item.height} transition-transform duration-500 group-hover:scale-105`}
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
                onClick={() => {
                  setActiveTab("discover");
                  setSelectedItem(null);
                }}
                className="w-[40px] h-[40px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[var(--muted)] rounded-full transition-colors shrink-0 border border-transparent dark:border-[var(--border)]"
                title="Back to Discover"
              >
                <ArrowLeft size={24} className="text-black dark:text-[var(--foreground)]" />
              </button>

              <div className="flex items-end gap-[6px]">
                <h1 className={`text-[40px] leading-[40px] font-bold tracking-[-0.5px] text-[#000000] dark:text-[var(--foreground)] ${manrope.className}`}>
                  Your saved Ideas
                </h1>
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
                    // Click on saved item opens it in discover mode details
                    setActiveTab("discover");
                    handleCardClick(item);
                  }}
                >

                  <div className="overflow-hidden rounded-[14.36px] bg-[var(--muted)] relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full object-cover ${item.height} transition-transform duration-500 group-hover:scale-105`}
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
                    <p className="text-[12.5px] leading-[15px] font-normal text-[#000000] dark:text-[var(--foreground)] truncate font-['Segoe_UI',_sans-serif]">
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
