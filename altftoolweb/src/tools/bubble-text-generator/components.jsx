// src/tools/bubble-text-generator/components.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  Trash2,
  RotateCcw,
  Wand2,
  Instagram,
  MessageSquare,
  Phone,
  Gamepad2,
  Twitter,
  Youtube,
  Video,
  Info,
  Layers,
  History,
  BookOpen,
  Zap,
  Globe2,
  ShieldCheck,
  Clock,
  Moon,
  Sun,
  Search,
  Heart,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  HelpCircle,
  Sliders,
  CheckCircle2,
  Circle,
  Disc,
  Square,
  Hash,
  Minimize2,
  ArrowDownRight,
  Maximize2,
  Bold,
  Italic,
  PenTool,
  Strikethrough,
  Underline,
  PartyPopper,
  Tag
} from "lucide-react";
import {
  BUBBLE_STYLES,
  GOOGLE_BUBBLE_FONTS,
  convertText,
  renderToPng,
  renderToSvg,
  QUICK_EXAMPLES,
  PLATFORMS,
  FAQS
} from "./utils/converters";

// --- REAL PLATFORM BRAND SVG ICONS ---
export function PlatformIcon({ name, className = "h-4 w-4" }) {
  switch (name) {
    case "Instagram":
      return <Instagram className={className} />;
    case "TikTok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 3.91 1.39V6.69z" />
        </svg>
      );
    case "Discord":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case "WhatsApp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "Twitter / X":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "YouTube":
      return <Youtube className={className} />;
    case "Gaming Platforms":
      return <Gamepad2 className={className} />;
    default:
      return <Globe2 className={className} />;
  }
}

// --- STYLE CARD ICON HELPER ---
export function getStyleIcon(styleId) {
  switch (styleId) {
    case "classicBubble": return <Circle className="h-4 w-4 text-[#14B8A6]" />;
    case "darkBubble": return <Disc className="h-4 w-4 text-slate-800 dark:text-cyan-400" />;
    case "bubbleUpper": return <Type className="h-4 w-4 text-[#14B8A6]" />;
    case "bubbleLower": return <Type className="h-4 w-4 text-teal-600" />;
    case "squaredBubble": return <Square className="h-4 w-4 text-cyan-600" />;
    case "negativeSquared": return <Square className="h-4 w-4 fill-cyan-600 text-cyan-600" />;
    case "parenthesisBubble": return <span className="font-bold text-xs text-[#14B8A6]">(a)</span>;
    case "circledNumbers": return <Hash className="h-4 w-4 text-[#14B8A6]" />;
    case "darkCircledNumbers": return <Hash className="h-4 w-4 text-slate-900 dark:text-white" />;
    case "tinyText": return <Minimize2 className="h-4 w-4 text-purple-500" />;
    case "subscriptBubble": return <ArrowDownRight className="h-4 w-4 text-indigo-500" />;
    case "fullWidth": return <Maximize2 className="h-4 w-4 text-blue-500" />;
    case "doubleStruck": return <Layers className="h-4 w-4 text-[#14B8A6]" />;
    case "boldBubble": return <Bold className="h-4 w-4 text-slate-900 dark:text-white" />;
    case "italicBubble": return <Italic className="h-4 w-4 text-slate-700 dark:text-slate-200" />;
    case "cursiveScript": return <PenTool className="h-4 w-4 text-pink-500" />;
    case "gothicBubble": return <BookOpen className="h-4 w-4 text-[#06B6D4]" />;
    case "strikethroughBubble": return <Strikethrough className="h-4 w-4 text-[#14B8A6]" />;
    case "underlineBubble": return <Underline className="h-4 w-4 text-[#14B8A6]" />;
    case "sparkleBubble": return <Sparkles className="h-4 w-4 text-amber-500" />;
    case "balloonBubble": return <PartyPopper className="h-4 w-4 text-rose-500" />;
    case "stickerBox": return <Tag className="h-4 w-4 text-emerald-500" />;
    default: return <Sparkles className="h-4 w-4 text-[#14B8A6]" />;
  }
}

// --- BACKGROUND FLOATING BUBBLE EFFECT FOR INDIVIDUAL CARDS ---
export function CardBubbleBackground({ isHovered, activeColor = "teal", burstTrigger = 0 }) {
  const cardBubbles = [
    { size: 36, left: "7%", duration: "5.5s", delay: "0s", opacity: 0.28 },
    { size: 22, left: "26%", duration: "7.5s", delay: "1.2s", opacity: 0.22 },
    { size: 44, left: "48%", duration: "6.2s", delay: "0.6s", opacity: 0.2 },
    { size: 28, left: "70%", duration: "7.0s", delay: "1.9s", opacity: 0.24 },
    { size: 38, left: "88%", duration: "5.4s", delay: "0.3s", opacity: 0.22 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      {/* Dynamic Radial Glow on Hover */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br transition-all duration-500 blur-xl ${activeColor === "cyan" ? "from-cyan-400/30 to-teal-400/10" : "from-teal-400/30 to-cyan-400/10"
          } ${isHovered ? "scale-150 opacity-100" : "scale-100 opacity-40"}`}
      />
      <div
        className={`absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-gradient-to-tr transition-all duration-500 blur-xl ${activeColor === "cyan" ? "from-teal-400/30 to-purple-400/10" : "from-cyan-400/30 to-purple-400/10"
          } ${isHovered ? "scale-150 opacity-100" : "scale-100 opacity-40"}`}
      />

      {/* Floating Card Background Bubbles */}
      {cardBubbles.map((b, i) => (
        <div
          key={i}
          className={`animate-card-float-bubble absolute rounded-full border shadow-xs transition-all duration-300 ${activeColor === "cyan"
              ? "border-cyan-300/40 bg-gradient-to-tr from-cyan-400/25 to-teal-200/20 dark:border-cyan-500/30 dark:from-cyan-500/20 dark:to-teal-400/10"
              : "border-teal-300/40 bg-gradient-to-tr from-teal-400/25 to-cyan-200/20 dark:border-teal-500/30 dark:from-teal-500/20 dark:to-cyan-400/10"
            } ${isHovered ? "scale-125 border-cyan-400/60 shadow-cyan-300/30 opacity-90" : ""}`}
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            bottom: "-35px",
            opacity: isHovered ? Math.min(b.opacity * 2.2, 0.7) : b.opacity,
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            "--card-duration": isHovered ? "3.8s" : b.duration,
            "--card-delay": b.delay,
          }}
        >
          {/* Subtle Reflection */}
          <div className="absolute top-0.5 left-1 h-1.5 w-1.5 rounded-full bg-white/70 blur-[0.5px]" />
        </div>
      ))}

      {/* Interactive Engagement Click Burst Particles */}
      {burstTrigger > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            key={burstTrigger}
            className="animate-bubble-burst h-24 w-24 rounded-full border-2 border-teal-400/70 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 blur-xs"
          />
        </div>
      )}
    </div>
  );
}

// --- FLOATING BUBBLE BACKGROUND WITH PARALLAX ---
export function FloatingBubbleBackground({ mousePos }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 85) + 30,
      left: `${(i * 5.5) + Math.random() * 4}%`,
      duration: `${Math.floor(Math.random() * 10) + 12}s`,
      delay: `${(i * 0.7).toFixed(1)}s`,
      opacity: Math.random() * 0.25 + 0.1,
      blur: Math.floor(Math.random() * 4) + 2,
    }));
    setBubbles(items);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * 35;
  const parallaxY = (mousePos.y - 0.5) * 35;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-[#06B6D4]/15 via-[#14B8A6]/10 to-transparent" />

      <motion.div
        animate={{ x: parallaxX, y: parallaxY }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
        className="absolute inset-0"
      >
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="animate-float-bubble absolute rounded-full border border-cyan-300/40 bg-gradient-to-tr from-cyan-400/20 to-teal-300/30 shadow-lg"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: b.left,
              bottom: "-100px",
              opacity: b.opacity,
              backdropFilter: `blur(${b.blur}px)`,
              WebkitBackdropFilter: `blur(${b.blur}px)`,
              "--duration": b.duration,
              "--delay": b.delay,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// --- HERO SECTION ---
export function HeroSection() {
  const badges = [
    { label: "22 Bubble Styles", icon: Layers },
    { label: "Instant Live Conversion", icon: Zap },
    { label: "PNG & SVG Export", icon: Download },
    { label: "Google Fonts Gallery", icon: Type },
    { label: "100% Free Forever", icon: ShieldCheck },
  ];

  return (
    <div className="relative mb-6 text-center py-4">
      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          Bubble Text <span className="bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text text-transparent">Generator & Fonts</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Transform normal text into stylish bubble letters Ⓕⓞⓡ Instagram, TikTok, Discord, WhatsApp, Facebook, gaming usernames, and web designs!
        </p>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {badges.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-cyan-300"
            >
              <Icon className="h-3.5 w-3.5 text-[#14B8A6]" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- INPUT & CUSTOMIZATION CONTROLS PANEL ---
export function InputControlsPanel({
  inputText,
  setInputText,
  fontColor,
  setFontColor,
  bgColor,
  setBgColor,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onQuickExampleSelect
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const unicodeLength = Array.from(inputText).length;

  const colorPresets = ["#0f172a", "#14b8a6", "#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#ef4444"];
  const bgPresets = ["transparent", "#ffffff", "#f8fafc", "#0f172a", "#fef3c7", "#ecfdf5", "#f0f9ff"];

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setBurstTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6 space-y-5">
      {/* Background Floating Bubbles for Typing Panel */}
      <CardBubbleBackground isHovered={isFocused} activeColor="teal" burstTrigger={burstTrigger} />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-base dark:bg-teal-950">✍️</span>
            Type Your Text
          </h2>
          {inputText && (
            <button
              onClick={() => setInputText("")}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition"
              type="button"
            >
              Clear Text
            </button>
          )}
        </div>

        {/* Large Textarea with Engagement Focus Effects */}
        <textarea
          value={inputText}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type something amazing..."
          rows={3}
          className="btg-custom-scroll w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:border-[#14B8A6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#14B8A6]/15 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#14B8A6]"
        />

        {/* Live Statistics & Quick Example Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              Chars: <strong className="text-slate-900 dark:text-white">{charCount}</strong>
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              Words: <strong className="text-slate-900 dark:text-white">{wordCount}</strong>
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              Unicode: <strong className="text-[#14B8A6]">{unicodeLength}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Presets:</span>
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  onQuickExampleSelect(ex);
                  setBurstTrigger((prev) => prev + 1);
                }}
                type="button"
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-[#14B8A6] hover:bg-teal-50 hover:text-[#14B8A6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#14B8A6] dark:hover:text-cyan-400 active:scale-95"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Customization Toolbar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
          {/* Font Color */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Palette className="h-3.5 w-3.5 text-[#14B8A6]" /> Font Color
            </label>
            <div className="flex items-center gap-1.5">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  onClick={() => setFontColor(c)}
                  type="button"
                  className={`h-6 w-6 rounded-full border border-slate-300 shadow-xs transition hover:scale-110 ${fontColor === c ? "ring-2 ring-[#14B8A6] ring-offset-1" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sliders className="h-3.5 w-3.5 text-[#06B6D4]" /> Background Color
            </label>
            <div className="flex items-center gap-1.5">
              {bgPresets.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBgColor(bg)}
                  type="button"
                  className={`h-6 w-6 rounded-full border border-slate-300 shadow-xs transition hover:scale-110 ${bgColor === bg ? "ring-2 ring-[#06B6D4] ring-offset-1" : ""}`}
                  style={{ backgroundColor: bg === "transparent" ? "#ffffff" : bg }}
                  title={bg === "transparent" ? "Transparent Background" : bg}
                >
                  {bg === "transparent" && <span className="text-[10px] text-slate-400">∅</span>}
                </button>
              ))}
              <input
                type="color"
                value={bgColor === "transparent" ? "#ffffff" : bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent"
                title="Custom Background"
              />
            </div>
          </div>

          {/* Font Size & Align */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Font Size ({fontSize}px)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={18}
                max={64}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#14B8A6]"
              />
              <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                <button
                  onClick={() => setTextAlign("left")}
                  className={`p-1 rounded ${textAlign === "left" ? "bg-white text-[#14B8A6] shadow-xs dark:bg-slate-700" : "text-slate-400"}`}
                  type="button"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign("center")}
                  className={`p-1 rounded ${textAlign === "center" ? "bg-white text-[#14B8A6] shadow-xs dark:bg-slate-700" : "text-slate-400"}`}
                  type="button"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign("right")}
                  className={`p-1 rounded ${textAlign === "right" ? "bg-white text-[#14B8A6] shadow-xs dark:bg-slate-700" : "text-slate-400"}`}
                  type="button"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Search & Favorites Filter */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Filter Styles</span>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${showFavoritesOnly ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" : "text-slate-400 hover:text-slate-600"
                  }`}
                type="button"
              >
                <Heart className={`h-3 w-3 ${showFavoritesOnly ? "fill-rose-500 text-rose-500" : ""}`} />
                Saved Only
              </button>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 20+ styles..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#14B8A6] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT FOR INDIVIDUAL UNICODE BUBBLE STYLE CARDS ---
export function BubbleStyleCard({
  st,
  inputText,
  fontColor,
  bgColor,
  fontSize,
  textAlign,
  isFav,
  onToggleFavorite,
  onCopyText,
  onDownloadPng,
  onDownloadSvg
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  const converted = convertText(inputText || "bubble text", st.id);

  const triggerEngagement = (action) => {
    setBurstTrigger((prev) => prev + 1);
    action();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#14B8A6] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Animated Card Background Bubbles */}
      <CardBubbleBackground isHovered={isHovered} activeColor="teal" burstTrigger={burstTrigger} />

      <div className="relative z-10">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-base font-black text-[#14B8A6] dark:bg-teal-950/80 transition-transform duration-300 group-hover:scale-110 shadow-xs">
              {getStyleIcon(st.id)}
            </span>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-[#14B8A6]">
                {st.label}
              </h4>
              <span className="text-xs font-bold text-slate-400">{st.category}</span>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(st.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${isFav
                ? "border-rose-300 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-950"
                : "border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-800"
              }`}
            type="button"
            title="Bookmark style"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        {/* Output Canvas Preview with Engagement Interaction */}
        <div
          onClick={() => triggerEngagement(() => onCopyText(converted))}
          className="btg-custom-scroll group/preview my-5 flex min-h-[115px] cursor-pointer items-center overflow-x-auto rounded-2xl border border-slate-100 p-5 shadow-inner transition-all duration-300 hover:border-teal-300/60 dark:border-slate-800 dark:hover:border-teal-700/60"
          style={{
            backgroundColor: bgColor === "transparent" ? "rgba(248, 250, 252, 0.7)" : bgColor,
            justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          }}
          title="Click to copy text!"
        >
          <span
            className="animate-char-pop whitespace-nowrap font-mono font-bold transition-all duration-300 group-hover/preview:scale-105"
            style={{
              color: fontColor,
              fontSize: `${Math.min(fontSize, 46)}px`,
            }}
          >
            {converted}
          </span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          onClick={() => triggerEngagement(() => onCopyText(converted))}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#14B8A6] py-2.5 text-xs sm:text-sm font-black text-white shadow-sm transition-all duration-200 hover:bg-[#0d9488] hover:shadow-md active:scale-95"
        >
          <Copy className="h-4 w-4" /> Copy
        </button>

        <button
          onClick={() => triggerEngagement(() => onDownloadPng(converted, st.label))}
          type="button"
          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition-all duration-200 hover:border-[#14B8A6] hover:text-[#14B8A6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 active:scale-95"
        >
          <Download className="h-4 w-4" /> PNG
        </button>

        <button
          onClick={() => triggerEngagement(() => onDownloadSvg(converted, st.label))}
          type="button"
          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition-all duration-200 hover:border-[#14B8A6] hover:text-[#14B8A6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 active:scale-95"
        >
          <FileCode2 className="h-4 w-4" /> SVG
        </button>
      </div>
    </motion.div>
  );
}

// --- MULTI-STYLE SIMULTANEOUS UNICODE RESULTS GRID ---
export function MultiStyleGrid({
  inputText,
  fontColor,
  bgColor,
  fontSize,
  textAlign,
  searchQuery,
  showFavoritesOnly,
  favorites,
  onToggleFavorite,
  onCopyText,
  onDownloadPng,
  onDownloadSvg
}) {
  const filteredStyles = BUBBLE_STYLES.filter((st) => {
    const matchesSearch = st.label.toLowerCase().includes(searchQuery.toLowerCase()) || st.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = showFavoritesOnly ? favorites.includes(st.id) : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#14B8A6]">Unicode Styles</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Generated Bubble Font Results ({filteredStyles.length})
          </h3>
        </div>
      </div>

      {filteredStyles.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold text-slate-400">No matching bubble styles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredStyles.map((st) => (
            <BubbleStyleCard
              key={st.id}
              st={st}
              inputText={inputText}
              fontColor={fontColor}
              bgColor={bgColor}
              fontSize={fontSize}
              textAlign={textAlign}
              isFav={favorites.includes(st.id)}
              onToggleFavorite={onToggleFavorite}
              onCopyText={onCopyText}
              onDownloadPng={onDownloadPng}
              onDownloadSvg={onDownloadSvg}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUBCOMPONENT FOR INDIVIDUAL GOOGLE FONT CARDS ---
export function GoogleFontCard({
  font,
  inputText,
  fontColor,
  bgColor,
  fontSize,
  textAlign,
  onCopyText,
  onDownloadPng
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  const displayText = inputText || "Bubble Font";

  const triggerEngagement = (action) => {
    setBurstTrigger((prev) => prev + 1);
    action();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#06B6D4] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Animated Card Background Bubbles */}
      <CardBubbleBackground isHovered={isHovered} activeColor="cyan" burstTrigger={burstTrigger} />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-[#06B6D4]">
            {font.name}
          </h4>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-[#06B6D4] dark:bg-cyan-950">
            {font.category}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-400">{font.desc}</p>

        {/* Styled Live Text Box */}
        <div
          onClick={() => triggerEngagement(() => onCopyText(displayText))}
          className="btg-custom-scroll group/preview my-5 flex min-h-[115px] cursor-pointer items-center overflow-x-auto rounded-2xl border border-slate-100 p-5 shadow-inner transition-all duration-300 hover:border-cyan-300/60 dark:border-slate-800 dark:hover:border-cyan-700/60"
          style={{
            backgroundColor: bgColor === "transparent" ? "rgba(248, 250, 252, 0.7)" : bgColor,
            justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          }}
          title="Click to copy text!"
        >
          <span
            className="whitespace-nowrap font-bold transition-all duration-300 group-hover/preview:scale-105"
            style={{
              fontFamily: font.family,
              color: fontColor,
              fontSize: `${Math.min(fontSize, 46)}px`,
            }}
          >
            {displayText}
          </span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          onClick={() => triggerEngagement(() => onCopyText(displayText))}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition-all duration-200 hover:border-[#06B6D4] hover:text-[#06B6D4] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 active:scale-95"
        >
          <Copy className="h-4 w-4" /> Copy Text
        </button>

        <button
          onClick={() => triggerEngagement(() => onDownloadPng(displayText, font.name, font.family))}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#14B8A6] py-2.5 text-xs sm:text-sm font-black text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95"
        >
          <Download className="h-4 w-4" /> Export PNG
        </button>
      </div>
    </div>
  );
}

// --- GOOGLE BUBBLE FONTS GALLERY ---
export function GoogleFontsGallery({
  inputText,
  fontColor,
  bgColor,
  fontSize,
  textAlign,
  onCopyText,
  onDownloadPng
}) {
  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-[#06B6D4]">Google Web Fonts</span>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Google Bubble Fonts Gallery</h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Preview your text live rendered in popular rounded Google Web Fonts for graphic designs & branding!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {GOOGLE_BUBBLE_FONTS.map((font) => (
          <GoogleFontCard
            key={font.name}
            font={font}
            inputText={inputText}
            fontColor={fontColor}
            bgColor={bgColor}
            fontSize={fontSize}
            textAlign={textAlign}
            onCopyText={onCopyText}
            onDownloadPng={onDownloadPng}
          />
        ))}
      </div>
    </div>
  );
}

// --- EDUCATIONAL & PLATFORM MATRIX SECTIONS ---
export function EducationalSections() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="space-y-8">
      {/* 3 Explanation Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#14B8A6] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <CardBubbleBackground isHovered={hoveredCard === 0} activeColor="teal" />
          <div className="relative z-10">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#14B8A6] dark:bg-teal-950">
              <Info className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">What is Bubble Font?</h4>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Bubble fonts use special Enclosed Alphanumerics from the Unicode Standard (code points U+24B6 to U+24E9). This enables text like ⓐⓑⓒ to display inside circles natively on any smartphone or web browser.
            </p>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#06B6D4] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <CardBubbleBackground isHovered={hoveredCard === 1} activeColor="cyan" />
          <div className="relative z-10">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#06B6D4] dark:bg-cyan-950">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">How It Works</h4>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              When you type standard keyboard letters, our client-side engine maps each character to its corresponding Unicode code point instantaneously in real-time without sending data to any external server.
            </p>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <CardBubbleBackground isHovered={hoveredCard === 2} activeColor="cyan" />
          <div className="relative z-10">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">Why Use Bubble Fonts</h4>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Bubble letters dramatically boost visual engagement on social media bios, post titles, Discord channel handles, and gaming nicknames, making your profile stand out from standard text.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Compatibility Grid */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#14B8A6]">Compatibility</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Platform Compatibility Matrix</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLATFORMS.map((plat) => (
            <div
              key={plat.name}
              className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/50 transition-all duration-200 hover:scale-105 hover:border-teal-400/50 hover:bg-white dark:hover:bg-slate-800"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${plat.color} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <PlatformIcon name={plat.name} className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{plat.name}</h4>
                <p className="text-[10px] font-bold text-slate-400">{plat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- INTERACTIVE FAQ ACCORDION ---
export function FaqSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-[#06B6D4]">Help & Answers</span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={faq.q}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition dark:border-slate-800 dark:bg-slate-800/40"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-slate-900 dark:text-white hover:text-[#14B8A6] transition"
                type="button"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-[#14B8A6]" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-200/60 p-4 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- RECENT COPY HISTORY PANEL ---
export function HistoryPanel({ history, onCopyHistory, onReuseHistory, onDeleteHistory, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
          <History className="h-4 w-4 text-[#14B8A6]" />
          Recent Copy History ({history.length})
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs font-bold text-slate-400 hover:text-rose-500 transition"
          type="button"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item, idx) => (
          <div
            key={`${item.conv}-${idx}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 transition hover:bg-white dark:border-slate-800 dark:bg-slate-800/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm font-bold text-slate-900 dark:text-white">{item.conv}</p>
              <span className="text-[10px] font-medium text-slate-400">Style: {item.style}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onCopyHistory(item.conv)}
                className="rounded-lg bg-white p-2 text-slate-600 shadow-xs hover:text-[#14B8A6] dark:bg-slate-700 dark:text-slate-300"
                title="Copy"
                type="button"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onReuseHistory(item.text)}
                className="rounded-lg bg-white p-2 text-slate-600 shadow-xs hover:text-[#14B8A6] dark:bg-slate-700 dark:text-slate-300"
                title="Edit / Reuse Input"
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDeleteHistory(idx)}
                className="rounded-lg bg-white p-2 text-slate-400 hover:text-rose-500 dark:bg-slate-700"
                title="Delete"
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
