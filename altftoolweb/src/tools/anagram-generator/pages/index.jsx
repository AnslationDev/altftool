"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import HeroHeader from "../components/HeroHeader";
import DualSectionWorkspace from "../components/DualSectionWorkspace";
import DualSectionCard from "../components/DualSectionCard";
import SettingsPanel from "../components/SettingsPanel";
import StatsGrid from "../components/StatsGrid";
import ResultsGrid from "../components/ResultsGrid";
import EmptyState from "../components/EmptyState";
import ExportToolbar from "../components/ExportToolbar";
import EducationalCards from "../components/EducationalCards";
import { combinationsEstimate as computeCombinationsEstimate } from "../utils/combinations";

// Shuffles the letters within a single word (Fisher-Yates).
function shuffleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// Shuffles each word independently so multi-word phrases keep their word
// boundaries intact instead of relocating spaces into the middle of a word.
function shuffleString(str) {
  return str
    .split(/(\s+)/)
    .map((token) => (/^\s+$/.test(token) ? token : shuffleWord(token)))
    .join("");
}

export default function ToolHome() {
  const [input, setInput] = useState("listen");
  const [count, setCount] = useState(10);
  const [anagrams, setAnagrams] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedTotal, setCopiedTotal] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastGenerationMs, setLastGenerationMs] = useState(null);

  // Settings states (LOGIC PRESERVED 100%)
  const [sortMode, setSortMode] = useState("random");
  const [allowDuplicates, setAllowDuplicates] = useState(true);

  // Advanced Filter states
  const [startsWith, setStartsWith] = useState("");
  const [endsWith, setEndsWith] = useState("");
  const [contains, setContains] = useState("");
  const [excludeLetters, setExcludeLetters] = useState("");

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Original exact generation logic (LOGIC PRESERVED 100%)
  const generateAnagrams = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    // "Allow Duplicate Letters" gates whether an input whose letters repeat
    // (e.g. "conversation") is accepted, matching its "maintain exact
    // character frequencies" description.
    if (!allowDuplicates) {
      const letters = text.toLowerCase().replace(/[^a-z]/g, "").split("");
      if (new Set(letters).size !== letters.length) {
        showToast('Input has duplicate letters — enable "Allow Duplicate Letters" or use a word with all unique letters.');
        return;
      }
    }

    setIsGenerating(true);

    setTimeout(() => {
      const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
      const result = new Set();
      result.add(text);

      let attempts = 0;
      while (result.size < Math.min(count, 100) && attempts < 1000) {
        result.add(shuffleString(text));
        attempts++;
      }

      let arr = Array.from(result);

      // Apply UI sorting option
      if (sortMode === "az") {
        arr.sort((a, b) => a.localeCompare(b));
      } else if (sortMode === "length") {
        arr.sort((a, b) => a.length - b.length);
      }

      const elapsedMs = (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt;

      setAnagrams(arr);
      setLastGenerationMs(elapsedMs);
      setIsGenerating(false);
    }, 200);
  }, [input, count, sortMode, allowDuplicates]);

  // Apply visual frontend filters
  const filteredAnagrams = useMemo(() => {
    if (!anagrams || !anagrams.length) return [];
    return anagrams.filter((word) => {
      const lower = word.toLowerCase();
      if (startsWith && !lower.startsWith(startsWith.toLowerCase().trim())) return false;
      if (endsWith && !lower.endsWith(endsWith.toLowerCase().trim())) return false;
      if (contains && !lower.includes(contains.toLowerCase().trim())) return false;
      if (excludeLetters) {
        const excluded = excludeLetters.toLowerCase().replace(/[^a-z]/g, "").split("");
        for (const char of excluded) {
          if (lower.includes(char)) return false;
        }
      }
      return true;
    });
  }, [anagrams, startsWith, endsWith, contains, excludeLetters]);

  // Copy Anagram
  const copyAnagram = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setCopiedTotal((prev) => prev + 1);
      showToast(`Copied "${text}" to clipboard!`);
      setTimeout(() => setCopiedIndex(null), 1400);
    } catch {
      showToast("Couldn't copy to clipboard — check your browser permissions.");
    }
  };

  // Copy All Anagrams
  const handleCopyAll = async () => {
    if (!filteredAnagrams.length) return;
    const fullText = filteredAnagrams.join("\n");
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedTotal((prev) => prev + filteredAnagrams.length);
      showToast(`Copied all ${filteredAnagrams.length} anagrams to clipboard!`);
    } catch {
      showToast("Couldn't copy to clipboard — check your browser permissions.");
    }
  };

  // Export File (TXT, CSV, JSON)
  const handleExportFormat = (format) => {
    if (!filteredAnagrams.length) return;
    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "txt") {
      content = filteredAnagrams.join("\n");
      mimeType = "text/plain";
      extension = "txt";
    } else if (format === "csv") {
      const escapeCsvField = (value) => `"${String(value).replace(/"/g, '""')}"`;
      content = `Index,Anagram,Length\n` + filteredAnagrams.map((word, i) => `${i + 1},${escapeCsvField(word)},${word.length}`).join("\n");
      mimeType = "text/csv";
      extension = "csv";
    } else if (format === "json") {
      content = JSON.stringify({ input, count: filteredAnagrams.length, anagrams: filteredAnagrams }, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anagrams-${input.replace(/\s+/g, "-")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredAnagrams.length} anagrams as .${extension}!`);
  };

  // Share Individual or All
  const handleShare = (word) => {
    const shareText = `Check out this anagram for "${input}": ${word}`;
    if (navigator.share) {
      navigator.share({ title: "Anagram Generator", text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast(`Share text for "${word}" copied to clipboard!`);
    }
  };

  const handleShareAll = () => {
    const shareText = `Anagrams for "${input}": ${filteredAnagrams.slice(0, 5).join(", ")}...`;
    if (navigator.share) {
      navigator.share({ title: "Anagram Generator Results", text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast(`Results summary copied to clipboard!`);
    }
  };

  // Toggle Favorite
  const toggleFavorite = (word) => {
    if (favorites.includes(word)) {
      setFavorites(favorites.filter((f) => f !== word));
      showToast(`Removed "${word}" from favorites`);
    } else {
      setFavorites([...favorites, word]);
      showToast(`Saved "${word}" to favorites ⭐`);
    }
  };

  // Quick fill handler
  const handleQuickFill = (text) => {
    setInput(text);
  };

  const charCount = input.length;
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  // Combination estimate calculation — multinomial coefficient so repeated
  // letters don't overstate the count, with real magnitude past 12 letters.
  const combinationsEstimate = useMemo(() => computeCombinationsEstimate(input), [input]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 selection:bg-teal-500/30 selection:text-teal-600 dark:selection:text-teal-400">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-card border border-teal-500/40 text-foreground shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <div className="p-1 rounded-lg bg-teal-500 text-white">
              <Check size={14} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1360px] mx-auto space-y-8">
        {/* 1. HERO HEADER (Excluded as requested) */}
        <HeroHeader />

        {/* 2. DUAL PARENT CARD 1: MAIN SEARCH WORKSPACE (Input Left Card 40% & Results Dashboard Right Card 60%) */}
        <DualSectionWorkspace
          input={input}
          setInput={setInput}
          onGenerate={generateAnagrams}
          isGenerating={isGenerating}
          count={count}
          setCount={setCount}
          sortMode={sortMode}
          setSortMode={setSortMode}
          allowDuplicates={allowDuplicates}
          setAllowDuplicates={setAllowDuplicates}
          startsWith={startsWith}
          setStartsWith={setStartsWith}
          endsWith={endsWith}
          setEndsWith={setEndsWith}
          contains={contains}
          setContains={setContains}
          excludeLetters={excludeLetters}
          setExcludeLetters={setExcludeLetters}
          combinationsEstimate={combinationsEstimate}
          lastGenerationMs={lastGenerationMs}
          filteredAnagrams={filteredAnagrams}
          copyAnagram={copyAnagram}
          copiedIndex={copiedIndex}
          copiedTotal={copiedTotal}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          handleShare={handleShare}
          handleCopyAll={handleCopyAll}
          handleExportFormat={handleExportFormat}
          handleShareAll={handleShareAll}
          handleQuickFill={handleQuickFill}
          childrenResults={
            filteredAnagrams.length > 0 ? (
              <ResultsGrid
                anagrams={filteredAnagrams}
                onCopy={copyAnagram}
                copiedIndex={copiedIndex}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onShare={handleShare}
                isGenerating={isGenerating}
              />
            ) : (
              <EmptyState onQuickFill={handleQuickFill} />
            )
          }
        />

        {/* 3. DUAL PARENT CARD 2: ADVANCED FILTERS (Left 50%) & LIVE STATISTICS (Right 50%) */}
        <DualSectionCard
          leftWidth="lg:w-[50%]"
          rightWidth="lg:w-[50%]"
          rightIsDark={false}
          leftComponent={
            <SettingsPanel
              count={count}
              setCount={setCount}
              sortMode={sortMode}
              setSortMode={setSortMode}
              allowDuplicates={allowDuplicates}
              setAllowDuplicates={setAllowDuplicates}
              startsWith={startsWith}
              setStartsWith={setStartsWith}
              endsWith={endsWith}
              setEndsWith={setEndsWith}
              contains={contains}
              setContains={setContains}
              excludeLetters={excludeLetters}
              setExcludeLetters={setExcludeLetters}
            />
          }
          rightComponent={
            <StatsGrid
              charCount={charCount}
              wordCount={wordCount}
              generatedCount={filteredAnagrams.length}
              copiedTotal={copiedTotal}
              favoritesCount={favorites.length}
              combinationsEstimate={combinationsEstimate}
              lastGenerationMs={lastGenerationMs}
            />
          }
        />

        {/* 4. DUAL PARENT CARD 3: EXPORT TOOLBAR (Left 40%) & KNOWLEDGE CENTER (Right 60%) */}
        <DualSectionCard
          leftWidth="lg:w-[40%]"
          rightWidth="lg:w-[60%]"
          rightIsDark={false}
          leftComponent={
            <ExportToolbar
              anagrams={filteredAnagrams}
              onCopyAll={handleCopyAll}
              onExportFormat={handleExportFormat}
              onShareAll={handleShareAll}
            />
          }
          rightComponent={<EducationalCards />}
        />
      </div>
    </div>
  );
}
