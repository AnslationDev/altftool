"use client";

import React from "react";
import { Laugh, Search, X } from "lucide-react";
import { useJokeGenerator } from "../hooks/useJokeGenerator";
import JokeCard from "../components/JokeCard";
import JokeControls from "../components/JokeControls";
import CategoryFilter from "../components/CategoryFilter";
import FavoritesPanel from "../components/FavoritesPanel";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import { copyJoke, shareJoke, downloadAsTxt } from "../utils/exportUtils";

export default function ToolHome() {
  const {
    currentJoke,
    loading,
    category,
    searchQuery,
    favorites,
    isFavorite,
    canGoPrevious,
    autoPlay,
    showFavorites,
    toastMsg,
    source,
    categories,
    handlePrevious,
    handleNext,
    handleRefresh,
    handleCategoryChange,
    handleSearch,
    toggleFavorite,
    removeFavorite,
    toggleAutoPlay,
    setShowFavorites,
    selectJoke,
    showToast,
  } = useJokeGenerator();

  const handleCopy = async () => {
    const ok = await copyJoke(currentJoke);
    showToast(ok ? "Copied to clipboard" : "Copy failed — try again");
  };

  const handleShare = async () => {
    await shareJoke(currentJoke);
  };

  const handleDownload = () => {
    if (!currentJoke) return;
    const filename = `joke-${currentJoke.category?.replace(/\s+/g, "-").toLowerCase() || "general"}.txt`;
    downloadAsTxt(currentJoke, filename);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Laugh className="h-4 w-4" />
            Entertainment
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Joke Generator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Generate random jokes from multiple categories. Save favorites, search, and share with friends.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase
              ${source === "api"
                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
              }`}>
              {source === "api" ? "Live API" : "Local Dataset"}
            </span>
          </div>
        </section>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search jokes by keyword..."
              aria-label="Search jokes by keyword"
              className="w-full input pl-9 pr-8 py-2 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-(--muted) text-(--muted-foreground)"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          active={category}
          onChange={handleCategoryChange}
        />

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--primary)" />
          </div>
        )}

        {/* Joke Card */}
        {!loading && (
          <JokeCard
            joke={currentJoke}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onCopy={handleCopy}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        )}

        {/* Controls */}
        <JokeControls
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRefresh={handleRefresh}
          onToggleAutoPlay={toggleAutoPlay}
          onToggleFavorites={() => setShowFavorites(true)}
          canGoPrevious={canGoPrevious}
          autoPlay={autoPlay}
          isFavorite={isFavorite}
          favoritesCount={favorites.length}
        />

        {/* Toast */}
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-(--foreground) text-(--background) px-4 py-2 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2"
          >
            {toastMsg}
          </div>
        )}

        {/* Favorites Panel */}
        {showFavorites && (
          <FavoritesPanel
            favorites={favorites}
            onClose={() => setShowFavorites(false)}
            onRemove={removeFavorite}
            onSelect={selectJoke}
          />
        )}

        {/* Extra sections */}
        <div className="mt-16 pt-8 border-t border-(--divider)">
          <HowItWorks />
          <div className="border-t border-(--divider)">
            <Features />
          </div>
        </div>
      </div>
    </main>
  );
}
