"use client";

import React, { useState } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../style/SubmitDrawer.css";

export default function SubmitDrawer({ isOpen, onClose }) {
  const [submitName, setSubmitName] = useState("");
  const [submitLocation, setSubmitLocation] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");

  const resetDraft = () => {
    setIsFormSubmitted(false);
    setSaveError("");
    setSubmitName("");
    setSubmitLocation("");
    setSubmitUrl("");
    setSubmitNotes("");
  };

  const closeDrawer = () => {
    onClose();
    if (isFormSubmitted) resetDraft();
  };

  const handleSubmitWindow = (e) => {
    e.preventDefault();
    if (!submitName || !submitLocation || !submitUrl) return;
    setSaveError("");

    // There is deliberately no submission or moderation request here. This is
    // a private browser draft and only counts as saved if localStorage accepts
    // the write.
    try {
      const stored = JSON.parse(
        window.localStorage.getItem("windowswap_window_drafts") || "[]",
      );
      const drafts = Array.isArray(stored) ? stored : [];
      drafts.push({
        name: submitName,
        location: submitLocation,
        url: submitUrl,
        notes: submitNotes,
        savedAt: new Date().toISOString(),
      });
      window.localStorage.setItem("windowswap_window_drafts", JSON.stringify(drafts));
    } catch {
      setSaveError(
        "This browser blocked local storage, so the draft was not saved. Nothing was sent anywhere.",
      );
      return;
    }

    setIsFormSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">

          {/* Background backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="windowswap-submit-drawer relative w-full max-w-lg bg-windowswap-teal h-full shadow-[0_0_50px_-5px_rgba(0,0,0,0.5)] border-l border-teal-950/40 p-8 overflow-y-auto flex flex-col text-left windowswap-submit-scroll"
          >

            {/* Header bar */}
            <div className="windowswap-submit-header flex items-center justify-between pb-6 border-b border-teal-950">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-windowswap-cream" />
                <span className="font-serif text-xl font-bold tracking-wide">Window draft</span>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close window draft"
                className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form state coordination */}
            {!isFormSubmitted ? (
              <form onSubmit={handleSubmitWindow} className="windowswap-submit-form mt-8 flex-1 flex flex-col gap-6 text-sm">

                <div className="rounded-xl border border-border bg-surface-soft p-4 text-sm leading-relaxed text-foreground">
                  <p className="font-semibold">Local draft only</p>
                  <p className="mt-1 text-muted-foreground">
                    Saving this form writes a private draft to this browser. It
                    does not upload the video, contact AltFTool, or enter a
                    review queue.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-windowswap-cream font-semibold tracking-wider uppercase text-[10px]">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Isabella"
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    className="w-full bg-black/20 border border-teal-950/80 rounded-xl px-4 py-3 text-white outline-none focus:border-windowswap-terracotta focus:ring-1 focus:ring-windowswap-terracotta transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-windowswap-cream font-semibold tracking-wider uppercase text-[10px]">Location (City, Country)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Santorini, Greece"
                    value={submitLocation}
                    onChange={(e) => setSubmitLocation(e.target.value)}
                    className="w-full bg-black/20 border border-teal-950/80 rounded-xl px-4 py-3 text-white outline-none focus:border-windowswap-terracotta focus:ring-1 focus:ring-windowswap-terracotta transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-windowswap-cream font-semibold tracking-wider uppercase text-[10px]">Video URL for this draft</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://vimeo.com/... or GDrive link"
                    value={submitUrl}
                    onChange={(e) => setSubmitUrl(e.target.value)}
                    className="w-full bg-black/20 border border-teal-950/80 rounded-xl px-4 py-3 text-white outline-none focus:border-windowswap-terracotta focus:ring-1 focus:ring-windowswap-terracotta transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-windowswap-cream font-semibold tracking-wider uppercase text-[10px]">Vibe description</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Gentle rain tapping on the glass pane during a quiet study afternoon."
                    value={submitNotes}
                    onChange={(e) => setSubmitNotes(e.target.value)}
                    className="w-full bg-black/20 border border-teal-950/80 rounded-xl px-4 py-3 text-white outline-none focus:border-windowswap-terracotta focus:ring-1 focus:ring-windowswap-terracotta transition resize-none"
                  />
                </div>

                <div className="bg-black/35 rounded-2xl p-4 border border-teal-950/30 text-xs text-zinc-300 leading-relaxed font-light mt-2">
                  <span className="font-semibold text-white uppercase tracking-wider text-[9px] block mb-1">Suggested recording notes</span>
                  • Horizontal video, locked camera position (tripod is required).<br />
                  • Exactly 10 minutes long, showing window frame boundaries.<br />
                  • Sound: Keep native ambient noise (birds, wind, city traffic).
                </div>

                {saveError ? (
                  <p role="alert" className="rounded-xl border border-danger bg-danger-soft p-3 text-sm text-foreground">
                    {saveError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="w-full windowswap-primary-button py-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  Save Draft in This Browser
                </button>

              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-6"
              >
                <CheckCircle2 className="h-16 w-16 text-success mb-4" />
                <h3 className="font-serif text-2xl font-bold text-white mb-2">Draft saved on this device</h3>
                <p className="text-zinc-300 leading-relaxed font-light text-sm max-w-sm">
                  {submitName}, your private draft for <span className="font-semibold text-white">{submitLocation}</span> is stored only in this browser. It has not been sent to AltFTool or anyone else, and there is no review or follow-up.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetDraft}
                    className="windowswap-secondary-button rounded-full px-5 py-2.5 text-xs font-semibold"
                  >
                    Save another local draft
                  </button>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="windowswap-primary-button rounded-full px-5 py-2.5 text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
