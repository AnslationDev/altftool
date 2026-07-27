"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clover,
  Info,
  Sparkles,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Confetti from "react-confetti";
import { useLuckyScore } from "../hooks/useLuckyScore";
import UploadPanel from "../components/UploadPanel";
import LuckyMeter from "../components/LuckyMeter";
import ScoreCard from "../components/ScoreCard";
import FortuneCard from "../components/FortuneCard";
import HistoryPanel from "../components/HistoryPanel";
import Statistics from "../components/Statistics";
import Settings from "../components/Settings";
import ShareDialog from "../components/ShareDialog";

export default function LuckyFaceScoreMain() {
  const {
    image,
    imageData,
    result,
    loading,
    history,
    favorites,
    showResult,
    showConfetti,
    toastMsg,
    settings,
    isFavorite,
    totalReadings,
    averageScore,
    highestScore,
    earnedBadges,
    distribution,
    handleImageUpload,
    revealLuck,
    selectHistoryItem,
    deleteHistoryItem,
    toggleFavorite,
    toggleDarkMode,
    toggleAutoSave,
    setAnimationSpeed,
    clearData,
    resetAll,
  } = useLuckyScore();

  const [showFaq, setShowFaq] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showHistorySection, setShowHistorySection] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const hasResult = result && showResult;

  const faqs = [
    {
      q: "How is my Lucky Face Score calculated?",
      a: "The score is generated from a seed extracted from your uploaded photo's pixel data. A deterministic algorithm processes this seed to produce your unique luck score, lucky number, color, and fortune. It's all for fun and entertainment!",
    },
    {
      q: "Is my photo stored or uploaded to a server?",
      a: "No! Everything runs entirely in your browser. Your photo never leaves your device. All calculations happen client-side using the pixel data directly from your browser canvas.",
    },
    {
      q: "Can I get the same score again?",
      a: "The same photo will always produce the same result because the algorithm is deterministic. Different photos will generate different scores, so feel free to experiment!",
    },
    {
      q: "What do the badges mean?",
      a: "Badges are achievement levels based on your score: 0-20 'Needs a Four-Leaf Clover', 21-40 'Beginner's Luck', 41-60 'Lucky Star', 61-80 'Fortune's Favorite', and 81-100 'Grand Luck Master'. Try to collect them all!",
    },
  ];

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          numberOfPieces={result?.score >= 80 ? 500 : result?.score >= 60 ? 300 : 150}
          recycle={false}
          colors={["#F59E0B", "#14B8A6", "#22D3EE", "#EF4444", "#8B5CF6", "#22C55E"]}
        />
      )}

      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Toast */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 z-50 bg-card border border-border rounded-xl px-5 py-3 shadow-lg"
              >
                <p className="text-sm font-semibold text-foreground">{toastMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-1"
            >
              <Clover className="text-amber-500" size={32} />
            </motion.div>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Lucky Face Score
            </h1>
            <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Upload a photo and discover your fictional luck score with fun badges and fortune!
            </p>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 items-start">
            <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This tool is for entertainment purposes only. Luck scores are algorithmically generated
              and should not be interpreted as real-world fortune or personality assessments.
            </p>
          </div>

          {/* Upload Section */}
          {!hasResult && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md"
            >
              <UploadPanel onUpload={handleImageUpload} />
            </motion.div>
          )}

          {/* Action Buttons */}
          {image && !hasResult && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <button
                onClick={revealLuck}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl cursor-pointer transition active:scale-[0.98] motion-reduce:active:scale-100 duration-100 shadow-lg shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <Sparkles size={20} />
                Reveal My Luck
              </button>
              <button
                onClick={resetAll}
                aria-label="Reset and start over"
                className="flex items-center justify-center gap-2 py-3 px-4 min-w-11 min-h-11 border border-border text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-[0.98] motion-reduce:active:scale-100 duration-100 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <RefreshCw size={18} />
              </button>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-8 space-y-6"
            >
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="alt-ui-spinner alt-ui-spinner--lg border-t-amber-500" />
                <h4 className="font-semibold text-lg text-foreground animate-pulse">
                  Reading Your Fortune...
                </h4>
                <p className="text-sm text-muted-foreground">
                  Analyzing aura, cosmic alignment, and pixel energy.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  >
                    {["🍀", "✨", "⭐", "💫", "👑"][i]}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {hasResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Share button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 min-h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition cursor-pointer active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
                  >
                    <Share2 size={16} />
                    Share Result
                  </button>
                </div>

                {/* Lucky Meter + Score Card */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-md flex items-center justify-center">
                    <LuckyMeter score={result.score} animated />
                  </div>
                  <ScoreCard
                    result={result}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => toggleFavorite(result.id)}
                  />
                </div>

                {/* Fortune Card */}
                <FortuneCard result={result} />

                {/* Re-upload */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
                    Try Another Photo
                  </p>
                  <UploadPanel onUpload={handleImageUpload} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset button after result */}
          {hasResult && (
            <div className="flex justify-center">
              <button
                onClick={resetAll}
                className="flex items-center gap-2 py-2.5 px-6 min-h-11 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/50 transition cursor-pointer text-sm active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <RefreshCw size={16} />
                Reset Everything
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowStats(!showStats)}
              aria-expanded={showStats}
              className="w-full flex items-center justify-between p-4 min-h-11 hover:bg-muted/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-(--primary)"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Statistics Dashboard
              </span>
              {showStats ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0">
                    <Statistics
                      history={history}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowHistorySection(!showHistorySection)}
              aria-expanded={showHistorySection}
              className="w-full flex items-center justify-between p-4 min-h-11 hover:bg-muted/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-(--primary)"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Reading History
              </span>
              {showHistorySection ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showHistorySection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0">
                    <HistoryPanel
                      history={history}
                      onSelect={selectHistoryItem}
                      onDelete={deleteHistoryItem}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-expanded={showSettings}
              className="w-full flex items-center justify-between p-4 min-h-11 hover:bg-muted/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-(--primary)"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Settings
              </span>
              {showSettings ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0">
                    <Settings
                      settings={settings}
                      onToggleDarkMode={toggleDarkMode}
                      onToggleAutoSave={toggleAutoSave}
                      onAnimationSpeedChange={setAnimationSpeed}
                      onClearData={clearData}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowFaq(!showFaq)}
              aria-expanded={showFaq}
              className="w-full flex items-center justify-between p-4 min-h-11 hover:bg-muted/30 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-(--primary)"
            >
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Frequently Asked Questions
              </span>
              {showFaq ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showFaq && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
                    {faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-muted/20 border border-border p-4 space-y-2"
                      >
                        <h4 className="text-sm font-bold text-foreground">{faq.q}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              ALTFTool &middot; Lucky Face Score &middot; For entertainment purposes only
            </p>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        result={result}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
