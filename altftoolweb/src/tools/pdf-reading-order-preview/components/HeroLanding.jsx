"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ListOrdered, Upload, Sparkles, Layers, Play, ShieldCheck, FileUp } from "lucide-react";

export default function HeroLanding({ onInspectFile, onLoadDemoPdf, isBusy }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onInspectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <section className="w-full py-8 sm:py-12 px-4 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
      {/* Hero Header & Title */}
      <div className="space-y-4 max-w-3xl flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2"
        >
          <ListOrdered className="h-8 w-8" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white"
        >
          PDF Reading-Order Preview
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal"
        >
          Visually inspect how screen readers (NVDA, JAWS, VoiceOver) process PDF documents. Overlay sequence numbers, direction arrows, heatmaps, and verify WCAG 1.3.2 compliance.
        </motion.p>
      </div>

      {/* Upload & Demo Drag Zone Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-400 shadow-xl backdrop-blur-md"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={isBusy}
            onChange={(e) => void onInspectFile(e.target.files?.[0])}
          />

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 mb-4 shadow-inner">
            <Upload className="h-8 w-8 animate-bounce" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Upload PDF Document
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Drag & drop your PDF file here, browse local storage, or paste from clipboard (Ctrl+V)
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={onLoadDemoPdf}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 fill-current" />
              Try Demo PDF
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-3 text-xs font-extrabold text-slate-800 dark:text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <FileUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              Browse PDF File
            </button>
          </div>

          <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            100% Client-Side Privacy: PDFs are parsed entirely in local browser memory and never uploaded.
          </p>
        </div>
      </motion.div>

      {/* Feature Highlight Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full pt-4"
      >
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-lg backdrop-blur-md space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Visual Overlays
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Numbered badges, connecting flow arrows, heatmaps, and tag type bounding boxes.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-lg backdrop-blur-md space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Play className="h-5 w-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Reading Flow Player
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Animated sequence playback highlighting screen reader flow block-by-block.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-lg backdrop-blur-md space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            WCAG Rules & Audit
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Automated detection for column jumps, heading skips, captions, and exportable reports.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
