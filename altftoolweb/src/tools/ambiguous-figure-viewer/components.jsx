// src/tools/ambiguous-figure-viewer/components.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  Eye,
  Flame,
  Heart,
  HelpCircle,
  History as HistoryIcon,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { soundFx, getIllusionGallery, ILLUSIONS } from "./utils.js";

// --- Ambient Background with Floating Particles ---
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#14b8a6]/10 via-[#38bdf8]/5 to-transparent" />
      <motion.div
        className="floating-particle left-[8%] top-[12%] h-64 w-64 bg-[#14b8a6] opacity-[0.07] blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-particle right-[10%] top-[25%] h-80 w-80 bg-[#38bdf8] opacity-[0.06] blur-3xl"
        animate={{ x: [0, -35, 25, 0], y: [0, 30, -20, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-particle left-[40%] top-[60%] h-72 w-72 bg-[#a855f7] opacity-[0.05] blur-3xl"
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 25, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
      />
    </div>
  );
}

// --- Illusion Artwork Renderer ---
export function IllusionArtwork({ illusion, compact = false, className = "", overrideImage = null }) {
  const [failed, setFailed] = useState(false);
  const imgSrc = overrideImage || illusion.image;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-slate-900/5 ${className}`}>
      {!failed ? (
        <img
          src={imgSrc}
          alt={illusion.title}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
          <Eye className="h-8 w-8 animate-pulse" />
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
    </div>
  );
}

// --- HERO FEATURED ILLUSION CARD ---
export function HeroFeaturedCard({ illusion, onOpenViewer }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeInterpIdx, setActiveInterpIdx] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const currentInterp = illusion.interpretations[activeInterpIdx] || illusion.interpretations[0];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="glow-border hero-breathing relative overflow-hidden rounded-3xl bg-white p-5 shadow-xl sm:p-6"
    >
      <div className="relative flex flex-col gap-4">
        {/* Card Header Tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#38bdf8] px-3 py-1 text-xs font-black text-white shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            LOOK TWICE
          </span>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
            Featured Optical Illusion
          </span>
        </div>

        {/* Card Image Container */}
        <div
          onClick={() => onOpenViewer(illusion)}
          className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-inner"
        >
          <IllusionArtwork illusion={illusion} />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-extrabold text-slate-900 shadow-lg">
              <Eye className="h-4 w-4 text-[#14b8a6]" /> Open Full Lab Viewer
            </span>
          </div>
        </div>

        {/* Title & Question */}
        <div>
          <h3 className="text-xl font-black text-slate-900">{illusion.title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">Can you find both interpretations?</p>
        </div>

        {/* Interpretation Selector & Hints */}
        <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Interpretations:</span>
            <div className="flex gap-1.5">
              {illusion.interpretations.map((interp, idx) => (
                <button
                  key={interp.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveInterpIdx(idx);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                    activeInterpIdx === idx
                      ? "bg-[#14b8a6] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:text-[#14b8a6]"
                  }`}
                  type="button"
                >
                  {interp.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-amber-50 p-2.5 text-xs font-medium text-amber-900 border border-amber-200/60"
              >
                <span className="font-bold">💡 Hint ({currentInterp.label}):</span> {currentInterp.hint}
              </motion.div>
            )}

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-teal-50 p-2.5 text-xs font-medium text-teal-900 border border-teal-200/60"
              >
                <span className="font-bold">✨ Perception Unlocked:</span> This illusion switches between{" "}
                <span className="font-bold underline">{illusion.interpretations.map((i) => i.label).join(" & ")}</span>.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowHint(!showHint);
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-[#14b8a6] hover:text-[#14b8a6]"
            type="button"
          >
            {showHint ? "Hide Hint" : "Show Hint 💡"}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setShowAnswer(!showAnswer);
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
            type="button"
          >
            {showAnswer ? "Hide Answer" : "Reveal Answer ✨"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- GALLERY ILLUSION CARD ---
export function IllusionCard({ illusion, onClick, isSolved, isFavorite, onToggleFavorite }) {
  const diffColors = {
    Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-sky-100 text-sky-700 border-sky-200",
    Advanced: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className="afv-card-hover group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
    >
      {/* Top Image Preview Container */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
          <IllusionArtwork illusion={illusion} compact />

          {/* Favorite & Solved Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                diffColors[illusion.difficulty] || diffColors.Beginner
              }`}
            >
              {illusion.difficulty}
            </span>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {isSolved && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs" title="Solved!">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onToggleFavorite(illusion.id);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-rose-300 bg-rose-50 text-rose-500 shadow-xs"
                    : "border-slate-200/80 bg-white/90 text-slate-400 hover:text-rose-500"
                }`}
                type="button"
                aria-label="Favorite"
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-black text-slate-900 group-hover:text-[#14b8a6] transition">
              {illusion.title}
            </h3>
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600">
              {illusion.category}
            </span>
          </div>

          <p className="line-clamp-2 text-xs leading-5 text-slate-500">
            {illusion.description}
          </p>
        </div>
      </div>

      {/* Card Footer Stats & Open CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-teal-600">
            <Zap className="h-3 w-3" /> {illusion.solvePercentage}% Solved
          </span>
          <span className="flex items-center gap-1">
            <Compass className="h-3 w-3" /> {illusion.avgSolveTime}
          </span>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClick(illusion);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-[#14b8a6] group-hover:text-white"
          type="button"
          aria-label="View Details"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// --- USER PROGRESS DASHBOARD ---
export function UserProgressDashboard({ solvedCount, totalCount, streak, brainScore, xp, favoriteCategory }) {
  const pct = Math.round((solvedCount / (totalCount || 1)) * 100);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="afv-glass rounded-3xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Progress Ring & Solved Metrics */}
        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="7" fill="transparent" />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-black text-slate-900">{pct}%</span>
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Done</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#14b8a6]">
              <Brain className="h-3.5 w-3.5" /> Perception Lab
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              {solvedCount} <span className="text-base font-bold text-slate-400">/ {totalCount} Figures</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Master optical illusions to train cognitive flexibility.
            </p>
          </div>
        </div>

        {/* Right Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 text-left shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Flame className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">{streak} Days</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current Streak</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 text-left shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Trophy className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">{brainScore}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Brain Score</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 text-left shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Zap className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xl font-black text-slate-900">{xp} XP</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Experience</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-3.5 text-left shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Heart className="h-4 w-4" />
            </div>
            <p className="mt-2 truncate text-sm font-black text-slate-900">{favoriteCategory}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Category</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- GAMIFIED ACHIEVEMENTS SECTION ---
export function AchievementsSection({ achievements, userProgress }) {
  const iconMap = {
    Eye,
    Compass,
    Zap,
    Flame,
    Trophy,
    Award,
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#a855f7]">Milestones</span>
          <h3 className="text-xl font-black text-slate-900">Perceptual Badges & XP</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700">
          <Award className="h-4 w-4" /> {achievements.filter((a) => a.unlocked).length} / {achievements.length} Badges
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {achievements.map((ach) => {
          const IconComp = iconMap[ach.iconKey] || Award;
          return (
            <div
              key={ach.id}
              className={`group relative flex flex-col items-center rounded-2xl border p-3.5 text-center transition ${
                ach.unlocked
                  ? "border-purple-200 bg-gradient-to-b from-purple-50/50 to-white text-slate-900 shadow-xs"
                  : "border-slate-200/60 bg-slate-50/60 text-slate-400 opacity-60"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-110 ${
                ach.unlocked ? "bg-purple-100 text-purple-700" : "bg-slate-200/60 text-slate-400"
              }`}>
                <IconComp className="h-5 w-5" />
              </div>
              <h4 className="mt-2 line-clamp-1 text-xs font-black">{ach.name}</h4>
              <p className="mt-1 line-clamp-2 text-[10px] leading-3.5 text-slate-400">{ach.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- FULL LAB ILLUSION VIEWER MODAL ---
export function IllusionViewer({ illusion, onClose, isSolved, onToggleSolved, isFavorite, onToggleFavorite, onSelectIllusion }) {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState("normal");
  const [activeInterpId, setActiveInterpId] = useState(illusion.interpretations[0]?.id);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview"); // overview, history, psychology
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const frameRef = useRef(null);

  const gallery = getIllusionGallery(illusion);
  const currentImageObj = gallery[activeGalleryIdx] || gallery[0];

  useEffect(() => {
    setActiveGalleryIdx(0);
  }, [illusion.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") setZoom((v) => Math.min(v + 0.2, 2.4));
      if (e.key === "-") setZoom((v) => Math.max(v - 0.2, 0.8));
      if (e.key === "r") setZoom(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleMouseMove = (e) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const currentInterp = illusion.interpretations.find((i) => i.id === activeInterpId) || illusion.interpretations[0];

  const handleShare = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    soundFx.playClick();
    const link = document.createElement("a");
    link.href = currentImageObj.url;
    link.download = `${illusion.id}-${currentImageObj.id}-illusion.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="viewer-overlay fixed inset-0 z-50 overflow-y-auto p-3 sm:p-5"
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 p-3.5 shadow-md backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              type="button"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900">{illusion.title}</h2>
              <p className="text-xs font-extrabold uppercase text-[#14b8a6]">{illusion.perceptionType}</p>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleSolved(illusion.id);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                isSolved
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700"
              }`}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" /> {isSolved ? "Solved!" : "Mark Solved"}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onToggleFavorite(illusion.id);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                isFavorite
                  ? "border-rose-300 bg-rose-50 text-rose-500"
                  : "border-slate-200 bg-slate-100 text-slate-600 hover:text-rose-500"
              }`}
              type="button"
              title="Favorite"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:text-[#14b8a6]"
              type="button"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={handleDownload}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:text-[#14b8a6]"
              type="button"
              title="Download Image"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Viewer Left, Details Right */}
        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* Main Image Lab Canvas */}
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-md">
            {/* Interactive Image Frame */}
            <div
              ref={frameRef}
              onMouseMove={handleMouseMove}
              style={{ "--x": `${mousePos.x}%`, "--y": `${mousePos.y}%` }}
              className="relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 sm:min-h-[440px]"
            >
              <motion.div
                animate={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="h-full w-full"
              >
                <IllusionArtwork
                  illusion={illusion}
                  overrideImage={currentImageObj?.url}
                  className={`${
                    mode === "blur"
                      ? "blur-md"
                      : mode === "invert"
                      ? "invert"
                      : mode === "contrast"
                      ? "contrast-200"
                      : mode === "spotlight"
                      ? "spotlight-mask"
                      : ""
                  }`}
                />
              </motion.div>

              {copied && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur">
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Interactive Multi-Image Gallery Selector Strip */}
            <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Layers className="h-4 w-4 text-[#14b8a6]" />
                  Related Image Styles & Variations ({gallery.length})
                </span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">
                  Active: {currentImageObj?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {gallery.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveGalleryIdx(idx);
                    }}
                    type="button"
                    className={`group relative flex flex-col overflow-hidden rounded-xl border p-2 text-left transition ${
                      activeGalleryIdx === idx
                        ? "border-[#14b8a6] bg-white ring-2 ring-[#14b8a6]/20 shadow-sm"
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
                      <img src={item.url} alt={item.label} className="h-full w-full object-contain transition group-hover:scale-105" />
                    </div>
                    <div className="mt-1.5 flex flex-col">
                      <span className="line-clamp-1 text-[11px] font-black text-slate-900">{item.label}</span>
                      <span className="text-[9px] font-bold text-slate-400">{item.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-2.5 border border-slate-200/60">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((v) => Math.min(v + 0.2, 2.4))}
                  className="rounded-xl bg-white p-2 text-slate-700 shadow-xs hover:text-[#14b8a6]"
                  title="Zoom In"
                  type="button"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoom((v) => Math.max(v - 0.2, 0.8))}
                  className="rounded-xl bg-white p-2 text-slate-700 shadow-xs hover:text-[#14b8a6]"
                  title="Zoom Out"
                  type="button"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-xl bg-white p-2 text-slate-700 shadow-xs hover:text-[#14b8a6]"
                  title="Reset Zoom"
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <span className="ml-1 text-xs font-bold text-slate-500">{Math.round(zoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMode(mode === "blur" ? "normal" : "blur")}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    mode === "blur" ? "bg-[#14b8a6] text-white" : "bg-white text-slate-600 hover:text-[#14b8a6]"
                  }`}
                  type="button"
                >
                  Blur
                </button>
                <button
                  onClick={() => setMode(mode === "spotlight" ? "normal" : "spotlight")}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    mode === "spotlight" ? "bg-[#14b8a6] text-white" : "bg-white text-slate-600 hover:text-[#14b8a6]"
                  }`}
                  type="button"
                >
                  Spotlight
                </button>
                <button
                  onClick={() => setMode(mode === "invert" ? "normal" : "invert")}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    mode === "invert" ? "bg-[#14b8a6] text-white" : "bg-white text-slate-600 hover:text-[#14b8a6]"
                  }`}
                  type="button"
                >
                  Invert
                </button>
              </div>
            </div>
          </div>

          {/* Right Tabbed Details Sidebar */}
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-md">
            {/* Tab Navigation */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  activeTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
                type="button"
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  activeTab === "history" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
                type="button"
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("psychology")}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  activeTab === "psychology" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
                type="button"
              >
                Psychology
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 space-y-4">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Interpretations Toggle List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-400">Select Interpretation</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {illusion.interpretations.map((interp) => (
                        <button
                          key={interp.id}
                          onClick={() => {
                            soundFx.playClick();
                            setActiveInterpId(interp.id);
                          }}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            activeInterpId === interp.id
                              ? "border-[#14b8a6] bg-teal-50/50 text-[#14b8a6] font-extrabold shadow-xs"
                              : "border-slate-200 bg-white text-slate-600 font-bold hover:border-slate-300"
                          }`}
                          type="button"
                        >
                          <span className="text-xs">{interp.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60 text-xs leading-5 text-slate-600">
                      <span className="font-bold text-slate-900">Perceptual Focus:</span> {currentInterp?.hint}
                    </div>
                  </div>

                  {/* Fun Fact Callout */}
                  <div className="rounded-2xl bg-purple-50/80 p-3.5 border border-purple-200/60 text-xs text-purple-900">
                    <span className="font-bold flex items-center gap-1 text-purple-700 mb-1">
                      <Sparkles className="h-3.5 w-3.5" /> Fun Fact:
                    </span>
                    {illusion.funFact}
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Solve Rate</span>
                      <span className="text-base font-black text-slate-900">{illusion.solvePercentage}%</span>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Avg Time</span>
                      <span className="text-base font-black text-slate-900">{illusion.avgSolveTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3 text-xs leading-6 text-slate-600">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <HistoryIcon className="h-4 w-4 text-[#14b8a6]" /> Historical Background
                  </div>
                  <p>{illusion.history}</p>
                </div>
              )}

              {activeTab === "psychology" && (
                <div className="space-y-3 text-xs leading-6 text-slate-600">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <Brain className="h-4 w-4 text-[#a855f7]" /> Visual Neuroscience
                  </div>
                  <p>{illusion.psychology}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinterest-Style Related Images Board Grid */}
        <div className="rounded-3xl bg-white p-5 shadow-md border border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500">
                <Sparkles className="h-3.5 w-3.5" /> Pinterest-Style Gallery Board
              </span>
              <h3 className="text-base font-black text-slate-900">Related Ambiguous Figures & Visual Collections</h3>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
              Browse Related
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {ILLUSIONS.filter((i) => i.id !== illusion.id)
              .slice(0, 6)
              .map((relIllusion) => (
                <button
                  key={relIllusion.id}
                  onClick={() => {
                    soundFx.playClick();
                    if (onSelectIllusion) onSelectIllusion(relIllusion);
                  }}
                  type="button"
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 text-left transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-xs">
                    <IllusionArtwork illusion={relIllusion} compact />
                  </div>
                  <div className="mt-2 space-y-0.5 px-1">
                    <h4 className="line-clamp-1 text-xs font-black text-slate-900 group-hover:text-rose-600 transition">
                      {relIllusion.title}
                    </h4>
                    <span className="block text-[9px] font-extrabold text-slate-400">{relIllusion.category}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- SCIENTIFIC EDUCATION CARDS ---
export function ScientificEducation() {
  const sections = [
    {
      title: "Bistable Dynamics",
      content: "When sensory input presents two equally plausible interpretations, neural clusters in the visual cortex compete for perceptual dominance.",
      icon: Brain,
    },
    {
      title: "Top-Down Processing",
      content: "Prior expectations, memories, and spatial context actively shape what your mind perceives long before conscious awareness.",
      icon: Eye,
    },
    {
      title: "Neural Fatigue",
      content: "Prolonged focus on one meaning fatigues specific neural pathways, causing perception to spontaneously flip to the secondary meaning.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {sections.map(({ title, content, icon: Icon }) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-[#14b8a6]"
        >
          <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#14b8a6]">
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="text-base font-black text-slate-900">{title}</h4>
          <p className="mt-2 text-xs leading-6 text-slate-500">{content}</p>
        </div>
      ))}
    </div>
  );
}
