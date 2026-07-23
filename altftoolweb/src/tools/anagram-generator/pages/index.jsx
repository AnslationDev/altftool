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

// Original exact shuffle algorithm (LOGIC PRESERVED 100%)
function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
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

  // Settings states (LOGIC PRESERVED 100%)
  const [realWordsOnly, setRealWordsOnly] = useState(false);
  const [sortMode, setSortMode] = useState("random");
  const [allowDuplicates, setAllowDuplicates] = useState(true);

  // Advanced Filter states
  const [startsWith, setStartsWith] = useState("");
  const [endsWith, setEndsWith] = useState("");
  const [contains, setContains] = useState("");
  const [excludeLetters, setExcludeLetters] = useState("");
  const [dictionaryMode, setDictionaryMode] = useState("general");

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Original exact generation logic (LOGIC PRESERVED 100%)
  const generateAnagrams = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setIsGenerating(true);

    setTimeout(() => {
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

      setAnagrams(arr);
      setIsGenerating(false);
    }, 200);
  }, [input, count, sortMode]);

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
  const copyAnagram = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedTotal((prev) => prev + 1);
    showToast(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedIndex(null), 1400);
  };

  // Copy All Anagrams
  const handleCopyAll = () => {
    if (!filteredAnagrams.length) return;
    const fullText = filteredAnagrams.join("\n");
    navigator.clipboard.writeText(fullText);
    setCopiedTotal((prev) => prev + filteredAnagrams.length);
    showToast(`Copied all ${filteredAnagrams.length} anagrams to clipboard!`);
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
      content = `Index,Anagram,Length\n` + filteredAnagrams.map((word, i) => `${i + 1},"${word}",${word.length}`).join("\n");
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

  // Combination estimate calculation
  const combinationsEstimate = useMemo(() => {
    const clean = input.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!clean.length) return "0";
    if (clean.length > 12) return "10M+";
    let fact = 1;
    for (let i = 2; i <= clean.length; i++) fact *= i;
    return fact.toLocaleString();
  }, [input]);

  return (
    <div className="min-h-screen bg-[#F8F8FC] dark:bg-background text-foreground p-4 sm:p-6 lg:p-8 selection:bg-teal-500/30 selection:text-teal-600 dark:selection:text-teal-400">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
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
          realWordsOnly={realWordsOnly}
          setRealWordsOnly={setRealWordsOnly}
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
          dictionaryMode={dictionaryMode}
          setDictionaryMode={setDictionaryMode}
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
              realWordsOnly={realWordsOnly}
              setRealWordsOnly={setRealWordsOnly}
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
              dictionaryMode={dictionaryMode}
              setDictionaryMode={setDictionaryMode}
            />
          }
          rightComponent={
            <StatsGrid
              charCount={charCount}
              wordCount={wordCount}
              generatedCount={filteredAnagrams.length}
              copiedTotal={copiedTotal}
              favoritesCount={favorites.length}
              dictionaryMode={dictionaryMode}
              combinationsEstimate={combinationsEstimate}
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
