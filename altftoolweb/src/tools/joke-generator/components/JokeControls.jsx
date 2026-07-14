"use client";

import React from "react";
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Heart,
} from "lucide-react";

export default function JokeControls({
  onPrevious,
  onNext,
  onRefresh,
  onToggleAutoPlay,
  onToggleFavorites,
  canGoPrevious,
  autoPlay,
  isFavorite,
  favoritesCount,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Previous joke"
      >
        <ChevronLeft size={16} />
        Prev
      </button>

      <button
        onClick={onRefresh}
        className="btn-primary text-sm"
        aria-label="Generate new joke"
      >
        <RefreshCcw size={16} />
        Generate
      </button>

      <button
        onClick={onNext}
        className="btn-secondary text-sm"
        aria-label="Next joke"
      >
        Next
        <ChevronRight size={16} />
      </button>

      <button
        onClick={onToggleAutoPlay}
        className={`btn-secondary text-sm ${autoPlay ? "bg-(--primary) text-(--primary-foreground) border-transparent" : ""}`}
        aria-label={autoPlay ? "Stop auto-generate" : "Start auto-generate"}
        aria-pressed={autoPlay}
      >
        {autoPlay ? <Pause size={16} /> : <Play size={16} />}
        {autoPlay ? "Pause" : "Auto"}
      </button>

      <button
        onClick={onToggleFavorites}
        className="btn-secondary text-sm gap-1.5"
        aria-label="Show favorites"
      >
        <Heart size={14} className="text-rose-500" fill="currentColor" />
        Favorites
        {favoritesCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-(--muted) text-[10px] font-bold text-(--foreground)">
            {favoritesCount}
          </span>
        )}
      </button>
    </div>
  );
}
