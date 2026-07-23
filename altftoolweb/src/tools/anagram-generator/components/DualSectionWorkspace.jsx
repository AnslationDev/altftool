"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Type,
  Layers,
  Flame,
  X,
  Shuffle,
  Dice5,
  RefreshCw,
  Zap,
  ShieldCheck,
  Star,
  Download,
  Copy,
  FileText,
  FileSpreadsheet,
  FileCode,
  Share2,
} from "lucide-react";

const FEATURE_CHIPS = [
  { label: "Performance", icon: Zap },
  { label: "Accuracy", icon: ShieldCheck },
  { label: "Scrabble Match", icon: Star },
  { label: "Permutations", icon: Flame },
];

const EXAMPLE_CHIPS = [
  "listen",
  "triangle",
  "conversation",
  "education",
  "developer",
  "creative",
];

export default function DualSectionWorkspace({
  input,
  setInput,
  onGenerate,
  isGenerating,
  count,
  setCount,
  realWordsOnly,
  setRealWordsOnly,
  sortMode,
  setSortMode,
  allowDuplicates,
  setAllowDuplicates,
  startsWith,
  setStartsWith,
  endsWith,
  setEndsWith,
  contains,
  setContains,
  excludeLetters,
  setExcludeLetters,
  dictionaryMode,
  setDictionaryMode,
  filteredAnagrams,
  copyAnagram,
  copiedIndex,
  copiedTotal,
  favorites,
  toggleFavorite,
  handleShare,
  handleCopyAll,
  handleExportFormat,
  handleShareAll,
  handleQuickFill,
  childrenResults,
}) {
  const charCount = input.length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  const combinationsEstimate = useMemo(() => {
    const clean = input.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!clean.length) return "0";
    if (clean.length > 12) return "10M+";
    let fact = 1;
    for (let i = 2; i <= clean.length; i++) fact *= i;
    return fact.toLocaleString();
  }, [input]);

  const handleClear = () => {
    setInput("");
  };

  const handleShuffleInput = () => {
    if (!input.trim()) return;
    const arr = input.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setInput(arr.join(""));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[1360px] mx-auto rounded-[32px] bg-white dark:bg-card border border-black/10 dark:border-border/80 p-5 sm:p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 my-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* ========================================================================= */}
        {/* LEFT CONTENT CARD (Input & Controls - 40% Width on Desktop) */}
        {/* ========================================================================= */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          className="w-full lg:w-[40%] rounded-[24px] bg-[#FAFAFA] dark:bg-surface-soft/90 p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-black/5 dark:border-border/60"
        >
          {/* Eyebrow */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-teal-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Input &amp; Generation Controls</span>
            </div>

            {/* Split Heading (32px Bold) */}
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight">
              <span className="text-gray-500 dark:text-muted-foreground block">
                Rearrange Any Letters,
              </span>
              <span className="text-gray-900 dark:text-foreground block">
                Unleash Wordplay Magic
              </span>
            </h2>

            <p className="text-sm text-gray-600 dark:text-muted-foreground leading-[170%] max-w-[90%]">
              Enter any word or phrase below to instantly calculate all possible anagram variations and combinations.
            </p>
          </div>

          {/* Feature Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {FEATURE_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className="h-[36px] px-3.5 rounded-full border border-[#E5E7EB] dark:border-border bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-border text-xs font-medium text-gray-700 dark:text-foreground flex items-center gap-1.5 transition-colors shadow-sm cursor-default"
                >
                  <Icon size={14} className="text-teal-500" />
                  <span>{chip.label}</span>
                </div>
              );
            })}
          </div>

          {/* Input Textarea & Toolbar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Type size={14} className="text-teal-500" />
                <span>Input Workspace</span>
              </label>

              <div className="flex items-center gap-2">
                {input && (
                  <button
                    onClick={handleShuffleInput}
                    className="text-xs font-medium text-gray-500 hover:text-teal-600 flex items-center gap-1 transition px-2 py-1 rounded-md bg-white dark:bg-card border border-gray-200 dark:border-border"
                    title="Shuffle letters"
                  >
                    <Shuffle size={12} /> Shuffle
                  </button>
                )}
                {input && (
                  <button
                    onClick={handleClear}
                    className="text-xs font-medium text-gray-400 hover:text-rose-500 flex items-center gap-1 transition px-1.5 py-0.5"
                    title="Clear text"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste any word or phrase (e.g. listen, triangle)..."
              rows={3}
              className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-4 text-base font-medium text-gray-900 dark:text-foreground placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-inner resize-none"
            />

            {/* Counters */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground font-mono">
              <span>{charCount} Chars &bull; {wordCount} Words</span>
              <span>Est. Permutations: <strong className="text-teal-600 dark:text-teal-400">{combinationsEstimate}</strong></span>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="space-y-2 pt-1 border-t border-gray-200 dark:border-border/60">
            <span className="text-xs font-semibold text-gray-500 dark:text-muted-foreground">
              Quick Examples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setInput(chip)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    input.toLowerCase() === chip
                      ? "bg-teal-500 text-white border-teal-500 font-bold"
                      : "bg-white dark:bg-card hover:bg-teal-500/10 text-gray-700 dark:text-foreground border-gray-200 dark:border-border"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA Button (Large Pill Button - 48px Height, Radius 999px) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            disabled={!input.trim() || isGenerating}
            className="w-full h-[48px] rounded-full font-bold text-base text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-teal-500/20 mt-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Rearranging...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>Generate Anagrams</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* ========================================================================= */}
        {/* RIGHT CONTENT CARD (Global Theme Color Dashboard - 60% Width on Desktop) */}
        {/* ========================================================================= */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="w-full lg:w-[60%] rounded-[24px] bg-surface-soft dark:bg-card border border-border/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden text-foreground"
        >
          {/* Subtle Ambient Light Orb inside Dashboard */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-[60px] pointer-events-none" />

          {/* Header & Subtitle */}
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-[30px] font-extrabold text-foreground tracking-tight leading-tight">
                Generated Anagram Dashboard
              </h3>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                {filteredAnagrams.length} Variations Found
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-[170%]">
              Live word permutation analytics, length classification, and instant export toolbar.
            </p>
          </div>

          {/* Analytics Floating Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
            <div className="px-3.5 py-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Accuracy
              </span>
              <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">100% Match</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Words Count
              </span>
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{filteredAnagrams.length} Words</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Search Speed
              </span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">&lt; 5ms</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                Permutations
              </span>
              <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{combinationsEstimate}</span>
            </div>
          </div>

          {/* Visualization / Results Display Area */}
          <div className="relative z-10 flex-1 rounded-2xl bg-card border border-border/80 p-4 sm:p-5 overflow-y-auto max-h-[440px] custom-scrollbar space-y-4">
            {childrenResults}
          </div>

          {/* Quick Export Toolbar Row at Bottom of Right Card */}
          {filteredAnagrams.length > 0 && (
            <div className="relative z-10 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-3.5 py-2 rounded-xl bg-card hover:bg-border border border-border/80 text-xs font-bold text-foreground flex items-center gap-1.5 transition shadow-sm"
                >
                  <Copy size={13} className="text-teal-500" />
                  <span>Copy All</span>
                </button>

                <button
                  onClick={() => handleExportFormat("txt")}
                  className="px-3 py-2 rounded-xl bg-card hover:bg-border border border-border/80 text-xs font-bold text-foreground flex items-center gap-1 transition shadow-sm"
                >
                  <FileText size={13} className="text-teal-500" />
                  <span>TXT</span>
                </button>
                <button
                  onClick={() => handleExportFormat("csv")}
                  className="px-3 py-2 rounded-xl bg-card hover:bg-border border border-border/80 text-xs font-bold text-foreground flex items-center gap-1 transition shadow-sm"
                >
                  <FileSpreadsheet size={13} className="text-indigo-500" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportFormat("json")}
                  className="px-3 py-2 rounded-xl bg-card hover:bg-border border border-border/80 text-xs font-bold text-foreground flex items-center gap-1 transition shadow-sm"
                >
                  <FileCode size={13} className="text-purple-500" />
                  <span>JSON</span>
                </button>
              </div>

              <button
                onClick={handleShareAll}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
              >
                <Share2 size={13} />
                <span>Share Results</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
