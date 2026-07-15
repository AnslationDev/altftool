"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Settings, RotateCcw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import useBeautyScore from "../hooks/useBeautyScore";
import { formatTimestamp, FAQS } from "../utils/helpers";
import UploadPanel from "../components/UploadPanel";
import ImageEditor from "../components/ImageEditor";
import ScanAnimation from "../components/ScanAnimation";
import ScoreGauge from "../components/ScoreGauge";
import ResultCard from "../components/ResultCard";
import ComplimentCard from "../components/ComplimentCard";
import HistoryPanel from "../components/HistoryPanel";
import ShareDialog from "../components/ShareDialog";
import SettingsModal from "../components/SettingsModal";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function BeautyScoreMain() {
  const {
    image,
    setImage,
    imageData,
    setImageData,
    scanning,
    result,
    history,
    favorites,
    settings,
    setSettings,
    showConfetti,
    error,
    showShare,
    setShowShare,
    showSettings,
    setShowSettings,
    handleImageUpload,
    handleAnalyze,
    handleScanComplete,
    handleReset,
    handleDeleteHistory,
    handleClearAll,
    handleToggleFavorite,
  } = useBeautyScore();

  const [showFaq, setShowFaq] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectHistory = useCallback(
    (item) => {
      setImage(item.imageData || null);
      setImageData(item.imageData || null);
    },
    [setImage, setImageData]
  );

  const handleShareClick = useCallback(() => {
    setShowShare(true);
  }, [setShowShare]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    if (!result.imageData) return;
    const link = document.createElement("a");
    link.download = `beauty-score-${result.id}.jpg`;
    link.href = result.imageData;
    link.click();
  }, [result]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#ec4899", "#a855f7", "#3b82f6", "#14b8a6", "#f59e0b", "#22d3ee"]}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-pink-300/20 mb-1"
          >
            <Sparkles className="text-pink-400" size={32} />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Beauty Score
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Upload a photo for a fun, fictional beauty score with positive compliments and style tags!
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-300/20 rounded-2xl p-4 sm:p-5 text-center">
          <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
            <AlertCircle size={14} className="inline-block -mt-0.5 mr-1" />
            This tool is for entertainment purposes only. Beauty scores are algorithmically generated, completely fictional, and do not reflect real-world attractiveness or worth. Everyone is beautiful in their own unique way.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex justify-between items-center">
          <div />
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            {result && (
              <button
                onClick={handleReset}
                className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        {!image && !scanning && !result && (
          <UploadPanel
            onUpload={handleImageUpload}
            error={error}
            disabled={scanning}
          />
        )}

        {/* Image & Editor */}
        {image && !scanning && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ImageEditor image={image} />

            <button
              onClick={handleAnalyze}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Analyze My Beauty
            </button>
          </motion.div>
        )}

        {/* Scan Animation */}
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ScanAnimation
              image={image}
              scanning={scanning}
              onComplete={handleScanComplete}
            />
          </motion.div>
        )}

        {/* Results */}
        {result && !scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ResultCard
              result={result}
              isFavorite={favorites.includes(result.id)}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShareClick}
              onDownload={handleDownload}
            />
            <ComplimentCard compliments={result.compliments} />

            {settings.autoSave && (
              <div className="flex justify-center">
                <span className="text-[10px] text-muted-foreground bg-card border border-border px-3 py-1 rounded-full">
                  Result saved to history
                </span>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full h-10 border border-border hover:bg-card text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </motion.div>
        )}

        {/* History Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">History & Dashboard</h2>
          </div>
          <HistoryPanel
            history={history}
            favorites={favorites}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowFaq((s) => !s)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-pink-400" size={18} />
              <h3 className="font-bold text-foreground">Frequently Asked Questions</h3>
            </div>
            {showFaq ? (
              <ChevronUp size={18} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={18} className="text-muted-foreground" />
            )}
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
                <div className="px-5 pb-5 space-y-3">
                  {FAQS.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="space-y-1 p-3 rounded-xl bg-muted/20 border border-border"
                    >
                      <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ShareDialog
        open={showShare}
        onClose={() => setShowShare(false)}
        result={result}
      />
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
