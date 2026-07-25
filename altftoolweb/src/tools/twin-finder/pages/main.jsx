"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  BarChart3,
  Heart,
  RefreshCw,
  Sparkles,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import useTwinFinder from "../hooks/useTwinFinder";
import UploadPanel from "../components/UploadPanel";
import ImagePreview from "../components/ImagePreview";
import ComparisonViewer from "../components/ComparisonViewer";
import SimilarityMeter from "../components/SimilarityMeter";
import ResultCard from "../components/ResultCard";
import HistoryPanel from "../components/HistoryPanel";
import ShareDialog from "../components/ShareDialog";
import DownloadDialog from "../components/DownloadDialog";
import SettingsModal from "../components/SettingsModal";

export default function TwinFinderMain() {
  const {
    imageA, imageB, loading, comparing, result,
    history, favorites, settings, comparisonMode,
    toasts, canvasARef, canvasBRef,
    addImage, removeImage, runComparison,
    selectHistoryItem, deleteHistoryItem, toggleFavorite,
    clearAllHistory, updateSettings, resetAll, getStats,
    setComparisonMode, addToast,
  } = useTwinFinder();

  const [showShare, setShowShare] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const stats = getStats();

  const faqs = [
    {
      q: "How does the similarity score work?",
      a: "Twin Finder uses a pixel-level comparison algorithm combined with a seeded random factor based on your image data. The score is generated entirely in your browser — no images are uploaded to any server. This is purely for entertainment.",
    },
    {
      q: "Is my privacy protected?",
      a: "Absolutely. All image processing happens locally in your browser using the Canvas API. No image data is ever sent to a server or stored externally. Your photos stay on your device.",
    },
    {
      q: "Does this use real facial recognition?",
      a: "No. The similarity algorithm compares pixel data generically. The face landmarks shown in results are decorative SVG overlays placed at generic positions for visual fun, not actual facial detection.",
    },
    {
      q: "Can I save or share my results?",
      a: "Yes! Results are automatically saved to your browser's local storage. You can download results as PNG images or JSON data, copy text, or share using your device's share menu.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
                toast.type === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-500"
                  : "border-green-500/30 bg-green-500/10 text-green-500"
              }`}
            >
              {toast.type === "error" ? <AlertTriangle size={16} /> : <Info size={16} />}
              {toast.message}
              <button
                onClick={() => {}}
                aria-label="Dismiss notification"
                className="ml-2 rounded p-0.5 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hero */}
      <div className="mb-8 pt-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary-soft) px-4 py-1.5 text-xs font-semibold text-(--primary)"
        >
          <Sparkles size={14} />
          AI-Inspired Photo Comparison
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold tracking-tight md:text-4xl"
        >
          Twin Finder
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-3 max-w-xl text-(--muted-foreground)"
        >
          Upload two photos and discover your playful similarity score with fun visualizations!
        </motion.p>
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto mb-8 max-w-3xl rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 flex-shrink-0 text-yellow-500" />
          <p className="text-xs leading-relaxed text-(--muted-foreground)">
            This tool is for entertainment purposes only. Similarity scores are algorithmically generated and not based on actual facial recognition.
          </p>
        </div>
      </motion.div>

      {/* Action bar */}
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
          <BarChart3 size={16} />
          <span>{stats.total} comparisons</span>
          {stats.total > 0 && (
            <>
              <span className="text-(--muted)">·</span>
              <span>Avg {stats.avg}%</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-xl border border-(--border) p-2 min-w-11 min-h-11 inline-flex items-center justify-center text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8">
        {/* Upload Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UploadPanel onImagesAdded={addImage} loading={loading} />
        </motion.div>

        {/* Image Preview (with hidden canvases) */}
        {(imageA || imageB) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ImagePreview
              imageA={imageA}
              imageB={imageB}
              onRemove={removeImage}
              canvasARef={canvasARef}
              canvasBRef={canvasBRef}
            />
          </motion.div>
        )}

        {/* Compare Button */}
        {imageA && imageB && !result && !comparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={runComparison}
              className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-8 py-3 text-sm font-bold text-(--primary-foreground) shadow-md transition hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            >
              <Sparkles size={18} /> Compare Photos
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {comparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-(--border) border-t-(--primary)" />
            <p className="text-sm font-medium text-(--muted-foreground) animate-pulse">
              Analyzing your photos...
            </p>
          </motion.div>
        )}

        {/* Comparison Viewer */}
        {result && imageA && imageB && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ComparisonViewer
              imageA={imageA}
              imageB={imageB}
              mode={comparisonMode}
              onModeChange={setComparisonMode}
            />
          </motion.div>
        )}

        {/* Results Section */}
        {result && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <SimilarityMeter percentage={result.percentage} animated />
              <ResultCard
                result={result}
                onShare={() => setShowShare(true)}
                onDownload={() => setShowDownload(true)}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(result.id)}
              />
            </div>
            <div className="space-y-6">
              {/* Stats Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center">
                  <p className="text-2xl font-black text-(--foreground)">{stats.total}</p>
                  <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-wider mt-1">Total</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center">
                  <p className="text-2xl font-black text-(--foreground)">{stats.avg}%</p>
                  <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-wider mt-1">Average</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center">
                  <p className="text-2xl font-black text-(--foreground)">{stats.favoritesCount}</p>
                  <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-wider mt-1">Favorites</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center">
                  <p className="text-2xl font-black text-(--foreground)">{history.length > 0 ? `${stats.recent[0]?.percentage || 0}%` : "—"}</p>
                  <p className="text-[11px] font-medium text-(--muted-foreground) uppercase tracking-wider mt-1">Latest</p>
                </div>
              </motion.div>

              <HistoryPanel
                history={history}
                onSelect={selectHistoryItem}
                onDelete={deleteHistoryItem}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        )}

        {/* Empty State when no images */}
        {!imageA && !imageB && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-(--border) bg-(--card) p-12 text-center"
          >
            <div className="rounded-xl bg-(--muted) p-4">
              <Users size={36} className="text-(--muted-foreground)" />
            </div>
            <div className="max-w-sm">
              <p className="text-lg font-bold text-(--foreground)">Ready to find your twin?</p>
              <p className="mt-2 text-sm text-(--muted-foreground)">
                Upload two photos above and we will compare them with our playful similarity algorithm. All processing is done in your browser — privacy guaranteed!
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4 text-left">
              <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-bold text-(--foreground)">1. Upload</p>
                <p className="mt-1 text-[11px] text-(--muted-foreground)">Add two photos</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-bold text-(--foreground)">2. Compare</p>
                <p className="mt-1 text-[11px] text-(--muted-foreground)">See your score</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-bold text-(--foreground)">3. Share</p>
                <p className="mt-1 text-[11px] text-(--muted-foreground)">Share the fun</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-bold text-(--foreground)">4. History</p>
                <p className="mt-1 text-[11px] text-(--muted-foreground)">Review past results</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reset Button (when result exists) */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-6 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wider">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-xl border border-(--border) bg-(--card) p-4"
              >
                <h3 className="text-sm font-bold text-(--foreground)">{faq.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-(--muted-foreground)">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <ShareDialog
        open={showShare}
        onClose={() => setShowShare(false)}
        result={result}
      />
      <DownloadDialog
        open={showDownload}
        onClose={() => setShowDownload(false)}
        imageA={imageA}
        imageB={imageB}
        result={result}
      />
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={updateSettings}
        onClearAll={clearAllHistory}
      />
    </div>
  );
}
