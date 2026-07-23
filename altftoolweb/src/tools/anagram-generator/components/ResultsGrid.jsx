"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Star, Share2, Sparkles, Layers, LayoutGrid } from "lucide-react";
import confetti from "canvas-confetti";

export default function ResultsGrid({
  anagrams,
  onCopy,
  copiedIndex,
  favorites,
  onToggleFavorite,
  onShare,
  isGenerating,
}) {
  const [viewMode, setViewMode] = useState("grouped"); // 'grouped' or 'grid'

  // Group anagrams by word length (WordTips style)
  const groupedAnagrams = useMemo(() => {
    if (!anagrams || !anagrams.length) return {};
    const groups = {};
    anagrams.forEach((word) => {
      const len = word.length;
      if (!groups[len]) groups[len] = [];
      groups[len].push(word);
    });
    // Sort keys descending (longest words first)
    const sortedKeys = Object.keys(groups).sort((a, b) => Number(b) - Number(a));
    const sortedGroups = {};
    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });
    return sortedGroups;
  }, [anagrams]);

  const handleCopy = (word, index, e) => {
    onCopy(word, index);

    // Trigger confetti particles from click target
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x, y },
        colors: ["#14B8A6", "#2563EB", "#8B5CF6", "#22C55E"],
      });
    } catch {
      // Fallback
    }
  };

  if (isGenerating) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-card/60 border border-border/60 animate-pulse p-5 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2 w-3/4">
              <div className="h-5 bg-border/80 rounded-md w-3/4" />
              <div className="h-3.5 bg-border/40 rounded-md w-1/2" />
            </div>
            <div className="w-full h-8 rounded-xl bg-border/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 my-2">
      {/* Grouping View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Showing {anagrams.length} Anagram Variation{anagrams.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-soft border border-border/60">
          <button
            onClick={() => setViewMode("grouped")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "grouped"
                ? "bg-card text-teal-600 dark:text-teal-400 shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Group words by length (WordTips layout)"
          >
            <Layers size={13} />
            <span>Length Groups</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "grid"
                ? "bg-card text-teal-600 dark:text-teal-400 shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Show all words in a grid"
          >
            <LayoutGrid size={13} />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Render Grouped Words (2 CARDS PER ROW Layout) */}
      {viewMode === "grouped" ? (
        <div className="space-y-6">
          {Object.entries(groupedAnagrams).map(([length, words]) => (
            <div
              key={length}
              className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm space-y-4"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-extrabold uppercase tracking-wide">
                    {length} Letter Words
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    ({words.length} {words.length === 1 ? "Word" : "Words"})
                  </span>
                </div>
              </div>

              {/* Group Cards Grid: STRICTLY 2 CARDS PER ROW (grid-cols-1 sm:grid-cols-2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {words.map((word) => {
                  const globalIdx = anagrams.indexOf(word);
                  const isCopied = copiedIndex === globalIdx;
                  const isFavorite = favorites.includes(word);

                  return (
                    <motion.div
                      key={`${word}-${globalIdx}`}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="group relative p-5 rounded-2xl bg-surface-soft/80 border border-border/80 hover:border-teal-500/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      {/* Top Row: Word & Index Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="text-xl sm:text-2xl font-mono font-black text-foreground tracking-wide break-words text-wrap block leading-snug">
                            {word}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-card border border-border/60 text-foreground font-semibold">
                              {word.length} Letters
                            </span>
                            <span>&bull;</span>
                            <span className="px-2 py-0.5 rounded-md bg-card border border-border/60 text-muted-foreground">
                              {new Set(word.toLowerCase().split("")).size} Unique Letters
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-card border border-border/80 text-muted-foreground shrink-0 shadow-sm">
                          #{globalIdx + 1}
                        </span>
                      </div>

                      {/* Bottom Row: Action Buttons Toolbar */}
                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border/40 gap-2">
                        <div className="flex items-center gap-2">
                          {/* Favorite Toggle Button */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onToggleFavorite(word)}
                            className={`p-2.5 rounded-xl border transition-all duration-200 ${
                              isFavorite
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-sm"
                                : "bg-card hover:bg-surface-soft border-border/60 text-muted-foreground hover:text-amber-500"
                            }`}
                            title={isFavorite ? "Remove favorite" : "Bookmark anagram"}
                          >
                            <Star className={`w-4 h-4 ${isFavorite ? "fill-amber-500" : ""}`} />
                          </motion.button>

                          {/* Share Button */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onShare(word)}
                            className="p-2.5 rounded-xl bg-card hover:bg-indigo-500/10 border border-border/60 text-muted-foreground hover:text-indigo-500 transition-all duration-200"
                            title="Share anagram word"
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Copy Button */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleCopy(word, globalIdx, e)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                            isCopied
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25"
                              : "bg-card hover:bg-teal-500 text-foreground hover:text-white border-border/80 hover:border-teal-500"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 animate-bounce" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-teal-500 group-hover:text-white transition" />
                              <span>Copy Anagram</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Regular Grid View: STRICTLY 2 CARDS PER ROW (grid-cols-1 sm:grid-cols-2) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {anagrams.map((word, index) => {
              const isCopied = copiedIndex === index;
              const isFavorite = favorites.includes(word);

              return (
                <motion.div
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="group relative p-5 rounded-2xl bg-card border border-border/80 hover:border-teal-500/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl font-mono font-black text-foreground tracking-wide break-words text-wrap block leading-snug">
                        {word}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-surface-soft border border-border/60 text-foreground font-semibold">
                          {word.length} Letters
                        </span>
                        <span>&bull;</span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-soft border border-border/60 text-muted-foreground">
                          {new Set(word.toLowerCase().split("")).size} Unique Letters
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface-soft border border-border/80 text-muted-foreground shrink-0 shadow-sm">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border/40 gap-2">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onToggleFavorite(word)}
                        className={`p-2.5 rounded-xl border transition-all duration-200 ${
                          isFavorite
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-sm"
                            : "bg-surface-soft hover:bg-card border-border/60 text-muted-foreground hover:text-amber-500"
                        }`}
                        title={isFavorite ? "Remove favorite" : "Bookmark anagram"}
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? "fill-amber-500" : ""}`} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onShare(word)}
                        className="p-2.5 rounded-xl bg-surface-soft hover:bg-indigo-500/10 border border-border/60 text-muted-foreground hover:text-indigo-500 transition-all duration-200"
                        title="Share anagram word"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleCopy(word, index, e)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                        isCopied
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25"
                          : "bg-surface-soft hover:bg-teal-500 text-foreground hover:text-white border-border/80 hover:border-teal-500"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-teal-500 group-hover:text-white transition" />
                          <span>Copy Anagram</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
