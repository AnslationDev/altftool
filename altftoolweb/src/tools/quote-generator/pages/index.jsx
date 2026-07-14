"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, Button, SearchInput, Badge, ToastHost, Toast } from "@altftool/ui";
import { Heart, Quote } from "lucide-react";
import QuoteDisplay from "../components/QuoteDisplay";
import Toolbar from "../components/Toolbar";
import CustomizationPanel from "../components/CustomizationPanel";
import FavoritesModal from "../components/FavoritesModal";
import { quotesDb, CATEGORIES, getRandomQuote, searchQuotes, BACKGROUND_THEMES, FONTS } from "../utils/quotesDb";
import { downloadQuoteImage } from "../utils/imageExport";

const FAVORITES_KEY = "altftool_quote_generator_favorites";

export default function ToolHome() {
  // Quote State
  const [currentQuote, setCurrentQuote] = useState(() => getRandomQuote("All"));
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Use refs to avoid stale closures in handlers
  const currentQuoteRef = useRef(currentQuote);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const categoryRef = useRef("All");
  const searchQueryRef = useRef("");

  // Keep refs in sync
  useEffect(() => { currentQuoteRef.current = currentQuote; }, [currentQuote]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  // Customization State
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [themeId, setThemeId] = useState(BACKGROUND_THEMES[0].id);
  const [fontId, setFontId] = useState(FONTS[0].id);
  const [fontSize, setFontSize] = useState("text-2xl");
  const [textAlign, setTextAlign] = useState("text-center");

  // Favorites State
  const [favorites, setFavorites] = useState([]);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  // UI State
  const [isDownloading, setIsDownloading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const quoteRef = useRef(null);

  // Load favorites on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  const addToast = (message, tone = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Core generate — reads from refs so it's always fresh, never stale
  const generateAndPush = (cat) => {
    const useCat = cat !== undefined ? cat : categoryRef.current;
    const newQuote = getRandomQuote(useCat, currentQuoteRef.current?.id);

    // Slice future history and push new quote
    const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
    const newHistory = [...truncated, newQuote];
    const newIndex = newHistory.length - 1;

    setHistory(newHistory);
    setHistoryIndex(newIndex);
    setCurrentQuote(newQuote);
  };

  const handlePreviousQuote = () => {
    const idx = historyIndexRef.current;
    if (idx > 0) {
      const newIdx = idx - 1;
      setHistoryIndex(newIdx);
      setCurrentQuote(historyRef.current[newIdx]);
    }
  };

  const handleNextQuote = () => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx < hist.length - 1) {
      const newIdx = idx + 1;
      setHistoryIndex(newIdx);
      setCurrentQuote(hist[newIdx]);
    } else {
      generateAndPush();
    }
  };

  const handleCategoryChange = (c) => {
    setCategory(c);
    categoryRef.current = c;
    setSearchQuery("");
    searchQueryRef.current = "";
    generateAndPush(c);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    searchQueryRef.current = val;
    if (val.length > 2) {
      const results = searchQuotes(val);
      if (results.length > 0) {
        const found = results.find(q => q.id !== currentQuoteRef.current?.id) || results[0];
        setCurrentQuote(found);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchQueryRef.current = "";
    generateAndPush();
  };

  const isFavorite = favorites.some(f => f.id === currentQuote.id);

  const toggleFavorite = () => {
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== currentQuote.id);
      addToast("Removed from favorites", "info");
    } else {
      newFavorites = [...favorites, currentQuote];
      addToast("Added to favorites ❤️", "success");
    }
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const removeFavorite = (id) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
      addToast("Quote copied to clipboard! 📋", "success");
    } catch {
      addToast("Failed to copy", "danger");
    }
  };

  const handleShare = async () => {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Inspirational Quote", text });
      } catch (err) {
        if (err.name !== "AbortError") addToast("Failed to share", "danger");
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const filename = `quote-${currentQuote.author.replace(/\s+/g, "-").toLowerCase()}.png`;
    const success = await downloadQuoteImage(quoteRef, filename);
    addToast(success ? "Image downloaded! 🎉" : "Failed to generate image", success ? "success" : "danger");
    setIsDownloading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Quote className="h-4 w-4" />
              Creators
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Quote Generator</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Discover, customize, and share beautiful quotes for inspiration or social media content.
            </p>
          </div>
          <div className="flex-shrink-0 mt-2 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => setIsFavoritesModalOpen(true)}
              className="gap-2"
            >
              <Heart size={16} className="text-rose-500" />
              Favorites <Badge tone="neutral" className="ml-1">{favorites.length}</Badge>
            </Button>
          </div>
        </section>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto flex-1 overflow-x-auto pb-2 sm:pb-0">
            <Tabs
              items={CATEGORIES.map(c => ({ key: c, label: c }))}
              value={category}
              onChange={handleCategoryChange}
            />
          </div>
          <div className="w-full sm:w-64 flex-shrink-0">
            <SearchInput
              placeholder="Search quotes or authors..."
              value={searchQuery}
              onChange={handleSearch}
              onClear={clearSearch}
            />
          </div>
        </div>

        {/* Quote Display */}
        <div className="relative">
          <QuoteDisplay
            ref={quoteRef}
            quote={currentQuote}
            themeId={themeId}
            fontId={fontId}
            fontSize={fontSize}
            textAlign={textAlign}
          />
        </div>

        {/* Toolbar */}
        <Toolbar
          onGenerate={generateAndPush}
          onPrevious={handlePreviousQuote}
          onNext={handleNextQuote}
          canGoPrevious={historyIndex > 0}
          canGoNext={true}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onShare={handleShare}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          isDownloading={isDownloading}
        />

        {/* Customization */}
        <CustomizationPanel
          themeId={themeId}
          setThemeId={setThemeId}
          fontId={fontId}
          setFontId={setFontId}
          fontSize={fontSize}
          setFontSize={setFontSize}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
        />
      </div>

      {/* Modals & Toasts */}
      <FavoritesModal
        open={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFavorite}
        onSelectQuote={(quote) => {
          setCurrentQuote(quote);
          setIsFavoritesModalOpen(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <ToastHost position="bottom-right">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            message={t.message}
            onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        ))}
      </ToastHost>
    </main>
  );
}
