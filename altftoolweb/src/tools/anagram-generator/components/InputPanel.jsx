"use client";

import React from "react";
import { motion } from "framer-motion";
import { Type, Sparkles, RefreshCw, Layers, Lightbulb, Flame, X } from "lucide-react";

const EXAMPLE_CHIPS = [
  "listen",
  "triangle",
  "conversation",
  "algorithm",
  "education",
  "astronomy",
  "masterpiece",
];

const TRENDING_SUGGESTIONS = [
  "orchestra",
  "admirer",
  "dormitory",
  "desperation",
  "signature",
];

export default function InputPanel({
  input,
  setInput,
  onGenerate,
  isGenerating,
}) {
  // Calculations
  const charCount = input.length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  // Calculate factorial estimate for unique combinations
  const calculateCombinations = (str) => {
    const clean = str.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!clean.length) return 0;
    if (clean.length > 12) return "10M+"; // Cap display for large lengths
    let fact = 1;
    for (let i = 2; i <= clean.length; i++) fact *= i;
    return fact.toLocaleString();
  };

  const combinationsEstimate = calculateCombinations(input);

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
            <Type size={16} />
          </div>
          <span>Input Word or Phrase</span>
        </h2>
        {input && (
          <button
            onClick={handleClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            title="Clear text"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Editor Textarea with Glass & Glow Effect */}
      <div className="relative group/field">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any word or phrase (e.g. listen, triangle)..."
          rows={3}
          className="w-full bg-surface-soft/60 backdrop-blur-md border border-border/80 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 shadow-inner resize-none"
        />

        {/* Dynamic Input Badges Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="font-mono bg-card px-2.5 py-1 rounded-md border border-border/60">
              <strong className="text-foreground">{charCount}</strong> Characters
            </span>
            <span className="font-mono bg-card px-2.5 py-1 rounded-md border border-border/60">
              <strong className="text-foreground">{wordCount}</strong> {wordCount === 1 ? "Word" : "Words"}
            </span>
          </div>
          {charCount > 0 && (
            <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
              <Layers size={13} />
              <span>Est. Permutations: <strong className="font-mono">{combinationsEstimate}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Example Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Lightbulb size={14} className="text-amber-500" />
          <span>Quick Examples (Click to fill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_CHIPS.map((chip) => (
            <motion.button
              key={chip}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setInput(chip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 shadow-sm ${input.toLowerCase() === chip
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-card hover:bg-teal-500/10 text-foreground border-border hover:border-teal-500/40"
                }`}
            >
              {chip}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Popular & Trending Searches */}
      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Flame size={14} className="text-rose-500" />
          <span>Trending Words:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SUGGESTIONS.map((word) => (
            <button
              key={word}
              onClick={() => setInput(word)}
              className="text-xs font-mono text-muted-foreground hover:text-indigo-500 underline underline-offset-4 decoration-indigo-500/30 transition"
            >
              #{word}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Gradient CTA Button */}
      <motion.button
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        onClick={onGenerate}
        disabled={!input.trim() || isGenerating}
        className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-600 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
            <span>Rearranging Letters...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>✨ Generate Anagrams</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
