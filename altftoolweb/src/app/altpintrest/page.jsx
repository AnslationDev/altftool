"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { Inter, Manrope } from 'next/font/google';
import { Search, X, Bell, Heart, SlidersHorizontal, MoreHorizontal, ArrowLeft, MessageCircle, Upload, ChevronDown, Smile, Image as ImageIcon } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['700'] });

import FilterBar from './components/FilterBar';
import { filters, MOCK_DATA } from './data/mockData';

export default function AltPinterest() {
  const [activeTab, setActiveTab] = useState("discover"); // "discover" or "saved"
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItems, setSavedItems] = useState(new Set([1, 3, 5, 7, 9, 10, 12, 14]));
  const [selectedItem, setSelectedItem] = useState(null);

  let displayedItems = MOCK_DATA;

  if (activeTab === "discover") {
    if (activeFilter !== "All") {
      displayedItems = displayedItems.filter(item => item.category === activeFilter);
    }
    if (searchQuery) {
      displayedItems = displayedItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  } else if (activeTab === "saved") {
    displayedItems = MOCK_DATA.filter(item => savedItems.has(item.id));
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
              filters={filters} 
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
          </>

        ) : activeTab === "discover" && selectedItem ? (

          /* ======================================= */
          /* 3. DISCOVER: IMAGE DETAILS VIEW         */
          /* ======================================= */
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-2">

            {/* Left Column: Detail Card & Back Button */}
            <div className="flex items-start gap-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-3 p-3 hover:bg-[var(--muted)] rounded-full transition-colors shrink-0 border border-transparent dark:border-[var(--border)]"
                title="Back"
              >
                <ArrowLeft size={24} className="text-[var(--foreground)]" />
              </button>

              {/* Detail Card Container */}
              <div className="w-full lg:w-[596px] bg-[var(--card)] rounded-[32px] shadow-lg shadow-black/5 border border-[#E5E5E0] dark:border-[var(--border)] overflow-hidden flex flex-col shrink-0">

                {/* Actions Header */}
                <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[var(--card)] z-10">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 hover:bg-[var(--muted)] px-2 py-1 rounded-lg cursor-pointer transition-colors text-[var(--foreground)]">
                      <Heart size={22} className={savedItems.has(selectedItem.id) ? "fill-[#2563EB] text-[#2563EB]" : ""} />
                      <span className="font-bold text-[15.5px]">{savedItems.has(selectedItem.id) ? "40" : "39"}</span>
                    </div>
                    <MessageCircle size={22} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]" />
                    <Upload size={22} className="hover:text-gray-500 cursor-pointer text-[var(--foreground)]" />
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
                {MOCK_DATA.filter(item => item.id !== selectedItem.id).map(item => (
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
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
