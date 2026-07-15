"use client";

import React from "react";
import { Heart, Copy, Share2, Download, Tag, User, Hash, Type } from "lucide-react";
import { getWordCount, getCharCount } from "../utils/exportUtils";

export default function JokeCard({ joke, isFavorite, onToggleFavorite, onCopy, onShare, onDownload }) {
  if (!joke) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--card) p-8 text-center">
        <p className="text-sm text-(--muted-foreground)">No joke to display. Click Generate to get started.</p>
      </div>
    );
  }

  const wordCount = getWordCount(joke.joke);
  const charCount = getCharCount(joke.joke);

  return (
    <section className="rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      {/* Category & Source badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {joke.category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
            <Tag size={12} />
            {joke.category}
          </span>
        )}
        {joke.author && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
            <User size={12} />
            {joke.author}
          </span>
        )}
      </div>

      {/* Joke text */}
      <blockquote className="text-lg sm:text-xl font-medium leading-relaxed text-[var(--foreground)] mb-6">
        &ldquo;{joke.joke}&rdquo;
      </blockquote>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)] mb-5">
        <span className="inline-flex items-center gap-1">
          <Type size={12} />
          {wordCount} words
        </span>
        <span className="inline-flex items-center gap-1">
          <Hash size={12} />
          {charCount} chars
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onToggleFavorite}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150
            ${isFavorite
              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
              : "bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--secondary-hover)"
            }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Favorited" : "Favorite"}
        </button>

        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--secondary-hover) transition-colors"
          aria-label="Copy joke"
        >
          <Copy size={14} />
          Copy
        </button>

        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--secondary-hover) transition-colors"
          aria-label="Share joke"
        >
          <Share2 size={14} />
          Share
        </button>

        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--secondary-hover) transition-colors"
          aria-label="Download joke"
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </section>
  );
}
