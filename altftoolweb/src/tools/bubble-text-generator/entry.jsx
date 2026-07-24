// src/tools/bubble-text-generator/entry.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { renderToPng, renderToSvg } from "./utils/converters";
import {
  FloatingBubbleBackground,
  HeroSection,
  InputControlsPanel,
  MultiStyleGrid,
  GoogleFontsGallery,
  EducationalSections,
  FaqSection,
  HistoryPanel
} from "./components";
import "./styles.css";

export default function BubbleTextGenerator() {
  const [inputText, setInputText] = useState("bubble text");
  const [fontColor, setFontColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("transparent");
  const [fontSize, setFontSize] = useState(32);
  const [textAlign, setTextAlign] = useState("center");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);

  // Load favorites, history & dark mode preference from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("btg_history_v2");
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedFavs = localStorage.getItem("btg_favs");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedTheme = localStorage.getItem("btg_theme");
      if (savedTheme === "dark") setDarkMode(true);
    } catch (e) {
      console.warn("Storage warning", e);
    }
  }, []);

  // Save theme state
  useEffect(() => {
    try {
      localStorage.setItem("btg_theme", darkMode ? "dark" : "light");
    } catch (e) {}
  }, [darkMode]);

  // Track mouse movement for parallax background
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  // Toggle Favorite style bookmark
  const handleToggleFavorite = (styleId) => {
    const updated = favorites.includes(styleId)
      ? favorites.filter((id) => id !== styleId)
      : [...favorites, styleId];

    setFavorites(updated);
    try {
      localStorage.setItem("btg_favs", JSON.stringify(updated));
    } catch (e) {}
  };

  // Handle Copy to Clipboard with confetti and toast
  const handleCopyText = (textToCopy) => {
    if (!textToCopy) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }

    // Trigger Confetti
    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#14B8A6", "#06B6D4", "#a855f7", "#ec4899"],
      });
    } catch (e) {}

    // Add to copy history
    const newEntry = {
      text: inputText,
      conv: textToCopy,
      timestamp: Date.now(),
    };

    const updated = [newEntry, ...history.filter((h) => h.conv !== textToCopy)].slice(0, 8);
    setHistory(updated);
    try {
      localStorage.setItem("btg_history_v2", JSON.stringify(updated));
    } catch (e) {}

    // Show Toast
    setToast("✓ Copied Successfully!");
    setTimeout(() => setToast(null), 2500);
  };

  // Download converted text as PNG
  const handleDownloadPng = (text, styleName, fontFamily = "sans-serif") => {
    if (!text) return;
    const dataUrl = renderToPng(text, {
      fontFamily,
      fontSize,
      color: fontColor,
      bgColor,
      align: textAlign,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${styleName.toLowerCase().replace(/\s+/g, "-")}-bubble.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast("PNG Exported!");
    setTimeout(() => setToast(null), 2000);
  };

  // Download converted text as SVG
  const handleDownloadSvg = (text, styleName, fontFamily = "sans-serif") => {
    if (!text) return;
    const svgData = renderToSvg(text, {
      fontFamily,
      fontSize,
      color: fontColor,
      bgColor,
    });

    const link = document.createElement("a");
    link.href = svgData;
    link.download = `${styleName.toLowerCase().replace(/\s+/g, "-")}-bubble.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast("SVG Exported!");
    setTimeout(() => setToast(null), 2000);
  };

  // History handlers
  const handleReuseHistory = (origText) => {
    setInputText(origText);
    setToast("Input Restored!");
    setTimeout(() => setToast(null), 1500);
  };

  const handleDeleteHistory = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    try {
      localStorage.setItem("btg_history_v2", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("btg_history_v2");
    } catch (e) {}
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen bg-[#F8FAFC] px-4 py-8 font-sans transition-colors duration-300 dark:bg-[#0B1120] sm:px-6 lg:px-8"
      >
        {/* Floating Bubble Background */}
        <FloatingBubbleBackground mousePos={mousePos} />

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-500 px-5 py-3 font-bold text-white shadow-2xl backdrop-blur animate-bounce">
            <CheckCircle2 className="h-5 w-5" />
            <span>{toast}</span>
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-6xl space-y-10">
          {/* Hero Section */}
          <HeroSection />

          {/* Input & Customization Panel */}
          <InputControlsPanel
            inputText={inputText}
            setInputText={setInputText}
            fontColor={fontColor}
            setFontColor={setFontColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
            onQuickExampleSelect={(ex) => setInputText(ex)}
          />

          {/* Multi-Style Simultaneous Unicode Results Grid */}
          <MultiStyleGrid
            inputText={inputText}
            fontColor={fontColor}
            bgColor={bgColor}
            fontSize={fontSize}
            textAlign={textAlign}
            searchQuery={searchQuery}
            showFavoritesOnly={showFavoritesOnly}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onCopyText={handleCopyText}
            onDownloadPng={handleDownloadPng}
            onDownloadSvg={handleDownloadSvg}
          />

          {/* Google Bubble Fonts Gallery */}
          <GoogleFontsGallery
            inputText={inputText}
            fontColor={fontColor}
            bgColor={bgColor}
            fontSize={fontSize}
            textAlign={textAlign}
            onCopyText={handleCopyText}
            onDownloadPng={handleDownloadPng}
          />

          {/* History Panel */}
          <HistoryPanel
            history={history}
            onCopyHistory={handleCopyText}
            onReuseHistory={handleReuseHistory}
            onDeleteHistory={handleDeleteHistory}
            onClearHistory={handleClearHistory}
          />

          {/* Educational & Platform Matrix Sections */}
          <EducationalSections />

          {/* Interactive FAQ Section */}
          <FaqSection />
        </div>
      </div>
    </div>
  );
}
