// src/tools/ambiguous-figure-viewer/components.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  ChevronRight,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Heart,
  Download,
  Share2,
  Compass,
  Zap,
  Flame,
  Trophy,
  Award,
  History as HistoryIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ILLUSIONS, soundFx } from "./utils.js";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,var(--primary)/0.08,transparent)]" />
      <motion.div
        className="absolute left-[6%] top-[10%] h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl"
        animate={{ x: [0, 24, -12, 0], y: [0, -18, 16, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[12%] right-[5%] h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.05] blur-3xl"
        animate={{ x: [0, -32, 18, 0], y: [0, 18, -16, 0], scale: [1, 0.95, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
    </div>
  );
}

function FallbackArtwork({ illusion, compact = false }) {
  const id = illusion?.id || "fallback";

  return (
    <div className={`ambiguous-artwork ambiguous-artwork-${id} ${compact ? "is-compact" : ""}`}>
      <div className="art-grid" />
      <div className="art-shape art-shape-a" />
      <div className="art-shape art-shape-b" />
      <div className="art-shape art-shape-c" />
      <div className="art-center">
        <Eye className="h-5 w-5" />
      </div>
    </div>
  );
}

function IllusionArtwork({ illusion, compact = false, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[var(--background)] ${className}`}>
      {!failed && illusion?.image ? (
        <img
          src={illusion.image}
          alt={illusion.title || "Optical Illusion"}
          onError={() => setFailed(true)}
          className="h-full w-full bg-[var(--background)] object-contain transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <FallbackArtwork illusion={illusion} compact={compact} />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
    </div>
  );
}

export function HeroFeaturedCard({ illusion, onOpenViewer }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeInterpIdx, setActiveInterpIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -y / 20, y: x / 20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!illusion) return null;
  const currentInterp = illusion.interpretations?.[activeInterpIdx] || illusion.interpretations?.[0];

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
          onClick={() => onOpenViewer && onOpenViewer(illusion)}
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
              {illusion.interpretations?.map((interp, idx) => (
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
            {showHint && currentInterp && (
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
                <span className="font-bold underline">
                  {illusion.interpretations?.map((i) => i.label).join(" & ")}
                </span>
                .
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

export function IllusionCard({ illusion, onClick, isSolved, isFavorite, onToggleFavorite }) {
  const diffColors = {
    Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-sky-100 text-sky-700 border-sky-200",
    Advanced: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <motion.div
      layout
      onClick={() => onClick && onClick(illusion)}
      className="group relative min-w-0 cursor-pointer overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white text-left shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#14b8a6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/35"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-slate-100">
        <IllusionArtwork illusion={illusion} compact />
      </div>

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
              onToggleFavorite && onToggleFavorite(illusion.id);
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

      {/* Card Info */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-black text-slate-900 group-hover:text-[#14b8a6] transition">
            {illusion.title}
          </h3>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:bg-[#14b8a6] group-hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {illusion.description}
        </p>
      </div>
    </motion.div>
  );
}

export function UserProgressDashboard({
  solvedCount = 0,
  totalCount = 12,
  streak = 0,
  brainScore = 0,
  xp = 0,
  favoriteCategory = "Gestalt",
}) {
  const percent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="h-4 w-4 text-[#14b8a6]" />
          <span className="text-[11px] font-extrabold uppercase">Solved</span>
        </div>
        <p className="mt-2 text-xl font-black text-slate-900">
          {solvedCount} <span className="text-xs font-bold text-slate-400">/ {totalCount}</span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-[#14b8a6]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Flame className="h-4 w-4 text-amber-500" />
          <span className="text-[11px] font-extrabold uppercase">Daily Streak</span>
        </div>
        <p className="mt-2 text-xl font-black text-slate-900">{streak} Days</p>
        <p className="mt-1 text-[10px] font-bold text-amber-600">Active streak 🔥</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="h-4 w-4 text-purple-500" />
          <span className="text-[11px] font-extrabold uppercase">Brain Score</span>
        </div>
        <p className="mt-2 text-xl font-black text-slate-900">{brainScore} pts</p>
        <p className="mt-1 text-[10px] font-bold text-purple-600">Cognitive index</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Zap className="h-4 w-4 text-sky-500" />
          <span className="text-[11px] font-extrabold uppercase">Experience</span>
        </div>
        <p className="mt-2 text-xl font-black text-slate-900">{xp} XP</p>
        <p className="mt-1 text-[10px] font-bold text-sky-600">Level {Math.floor(xp / 200) + 1}</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px] font-extrabold uppercase">Progress</span>
        </div>
        <p className="mt-2 text-xl font-black text-slate-900">{percent}%</p>
        <p className="mt-1 text-[10px] font-bold text-emerald-600">Completed</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="h-4 w-4 text-rose-500" />
          <span className="text-[11px] font-extrabold uppercase">Top Field</span>
        </div>
        <p className="mt-2 truncate text-base font-black text-slate-900">{favoriteCategory}</p>
        <p className="mt-1 text-[10px] font-bold text-rose-600">Dominant focus</p>
      </div>
    </div>
  );
}

export function AchievementsSection({ achievements = [], userProgress }) {
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
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
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
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-110 ${
                  ach.unlocked ? "bg-purple-100 text-purple-700" : "bg-slate-200/60 text-slate-400"
                }`}
              >
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

export function IllusionViewer({
  illusion,
  onClose,
  isSolved,
  onToggleSolved,
  isFavorite,
  onToggleFavorite,
  onSelectIllusion,
}) {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState("normal");
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState("overview");
  const [activeInterpId, setActiveInterpId] = useState(illusion?.interpretations?.[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (illusion?.interpretations?.[0]?.id) {
      setActiveInterpId(illusion.interpretations[0].id);
    }
  }, [illusion]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (mode !== "spotlight") return;
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "+") setZoom((value) => Math.min(value + 0.2, 2.4));
      if (event.key === "-") setZoom((value) => Math.max(value - 0.2, 0.8));
      if (event.key === "r") setZoom(1);
      if (event.key === "b") setMode((value) => (value === "blur" ? "normal" : "blur"));
      if (event.key === "s") setMode((value) => (value === "spotlight" ? "normal" : "spotlight"));
      if (event.key === "i") setMode((value) => (value === "invert" ? "normal" : "invert"));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!illusion?.image) return;
    const link = document.createElement("a");
    link.href = illusion.image;
    link.download = `${illusion.id || "illusion"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetView = () => {
    setZoom(1);
    setMode("normal");
  };

  if (!illusion) return null;
  const currentInterp = illusion.interpretations?.find((i) => i.id === activeInterpId) || illusion.interpretations?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="viewer-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 p-3 backdrop-blur-md sm:p-5"
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-md backdrop-blur sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              type="button"
              aria-label="Close viewer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                {illusion.title}
              </h2>
              <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
                {illusion.perceptionType}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleSolved && onToggleSolved(illusion.id);
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
                onToggleFavorite && onToggleFavorite(illusion.id);
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

        {/* Main Content Area */}
        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Left Main Viewport & Controls */}
          <div className="flex flex-col gap-4">
            <section className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
              <div
                ref={frameRef}
                className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 sm:min-h-[480px] lg:min-h-[580px]"
                style={{ "--x": `${mousePos.x}%`, "--y": `${mousePos.y}%` }}
              >
                <motion.div
                  className="h-full w-full origin-center"
                  animate={{ scale: zoom }}
                  transition={{ type: "spring", stiffness: 190, damping: 24 }}
                >
                  <IllusionArtwork
                    illusion={illusion}
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
            </section>

            {/* Viewing Tools & Quick Controls Toolbar */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Panel title="Viewing Tools" icon={Maximize2}>
                <div className="grid grid-cols-3 gap-2">
                  <IconButton icon={<ZoomIn size={16} />} onClick={() => setZoom((v) => Math.min(v + 0.2, 2.4))} label="In" />
                  <IconButton icon={<ZoomOut size={16} />} onClick={() => setZoom((v) => Math.max(v - 0.2, 0.8))} label="Out" />
                  <IconButton icon={<RotateCcw size={16} />} onClick={resetView} label="Reset" />
                  <IconButton active={mode === "blur"} icon={<Layers size={16} />} onClick={() => setMode((v) => (v === "blur" ? "normal" : "blur"))} label="Blur" />
                  <IconButton active={mode === "spotlight"} icon={<Search size={16} />} onClick={() => setMode((v) => (v === "spotlight" ? "normal" : "spotlight"))} label="Spotlight" />
                  <IconButton active={mode === "invert"} icon={<Minimize2 size={16} />} onClick={() => setMode((v) => (v === "invert" ? "normal" : "invert"))} label="Invert" />
                </div>
              </Panel>

              <Panel title="Perception Metrics" icon={Brain}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <StatItem label="Zoom Level" value={`${Math.round(zoom * 100)}%`} />
                  <StatItem label="Active Mode" value={mode} />
                  <StatItem label="Difficulty" value={illusion.difficulty} />
                  <StatItem label="Interpretations" value={`${illusion.interpretations?.length || 0}`} />
                </div>
              </Panel>
            </div>
          </div>

          {/* Right Details & Psychology Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
              {/* Tabs Header */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 rounded-lg py-2 transition ${
                    activeTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                  type="button"
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 rounded-lg py-2 transition ${
                    activeTab === "history" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                  type="button"
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab("psychology")}
                  className={`flex-1 rounded-lg py-2 transition ${
                    activeTab === "psychology" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                  type="button"
                >
                  Psychology
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Select Interpretation</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {illusion.interpretations?.map((interp) => (
                        <button
                          key={interp.id}
                          onClick={() => {
                            soundFx.playClick();
                            setActiveInterpId(interp.id);
                          }}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            activeInterpId === interp.id
                              ? "border-[#14b8a6] bg-teal-50/50 font-extrabold text-[#14b8a6] shadow-xs"
                              : "border-slate-200 bg-white font-bold text-slate-600 hover:border-slate-300"
                          }`}
                          type="button"
                        >
                          <span className="text-xs">{interp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentInterp && (
                    <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-3.5 text-xs leading-5 text-slate-600">
                      <span className="font-bold text-slate-900">Perceptual Focus:</span> {currentInterp.hint}
                    </div>
                  )}

                  <div className="rounded-2xl border border-purple-200/60 bg-purple-50/80 p-3.5 text-xs text-purple-900">
                    <span className="mb-1 flex items-center gap-1 font-bold text-purple-700">
                      <Sparkles className="h-3.5 w-3.5" /> Perception Key:
                    </span>
                    {illusion.description}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3 text-xs leading-6 text-slate-600">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <HistoryIcon className="h-4 w-4 text-[#14b8a6]" /> Historical Background
                  </div>
                  <p>
                    This figure illustrates bistable optical perception documented by early Gestalt psychologists.
                    The human visual cortex continuously re-evaluates competing sensory inputs to establish figure versus background.
                  </p>
                </div>
              )}

              {activeTab === "psychology" && (
                <div className="space-y-3 text-xs leading-6 text-slate-600">
                  <div className="flex items-center gap-2 font-black text-slate-900">
                    <Brain className="h-4 w-4 text-[#a855f7]" /> Visual Neuroscience
                  </div>
                  <p>
                    Neural populations in the primary visual cortex (V1) and lateral occipital complex experience reciprocal inhibition.
                    When one neural assembly tires, the competing representation takes over dominance.
                  </p>
                </div>
              )}
            </div>

            {/* Related Figures Board */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Related Figures</span>
                <span className="text-[10px] font-bold text-slate-400">Explore More</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ILLUSIONS.filter((i) => i.id !== illusion.id)
                  .slice(0, 4)
                  .map((relIllusion) => (
                    <button
                      key={relIllusion.id}
                      onClick={() => {
                        soundFx.playClick();
                        if (onSelectIllusion) onSelectIllusion(relIllusion);
                      }}
                      type="button"
                      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 p-1.5 text-left transition hover:border-rose-300"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-white">
                        <IllusionArtwork illusion={relIllusion} compact />
                      </div>
                      <span className="mt-1 line-clamp-1 text-[11px] font-black text-slate-800 group-hover:text-rose-600">
                        {relIllusion.title}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="min-w-0 text-sm font-black text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function IconButton({ icon, onClick, active, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
        active
          ? "border-[#14b8a6] bg-[#14b8a6] text-white shadow-xs"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6]"
      }`}
      title={label}
      type="button"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200/60 bg-slate-50 p-2.5">
      <p className="break-words text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

export function ScientificEducation() {
  const sections = [
    {
      title: "How Perception Switches",
      content: "Ambiguous figures provide two or more stable interpretations. Since the sensory input is constant, the change happens inside the brain.",
      icon: Brain,
    },
    {
      title: "Bistable Perception",
      content: "Neural groups compete for dominance. When one representation fatigues, perception can suddenly flip to the other meaning.",
      icon: Sparkles,
    },
    {
      title: "Top-Down Processing",
      content: "Expectations, memories, and context influence which interpretation your visual system chooses first.",
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {sections.map(({ title, content, icon: Icon }) => (
        <div
          key={title}
          className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-[#14b8a6]"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#14b8a6]">
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="break-words text-base font-black text-slate-900">{title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">{content}</p>
        </div>
      ))}
    </div>
  );
}
