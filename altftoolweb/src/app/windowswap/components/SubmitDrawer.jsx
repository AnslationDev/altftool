"use client";

import React, { useState } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import "../style/SubmitDrawer.css";

export default function SubmitDrawer({ isOpen, onClose }) {
  const [submitName, setSubmitName] = useState("");
  const [submitLocation, setSubmitLocation] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmitWindow = (e) => {
    e.preventDefault();
    if (!submitName || !submitLocation || !submitUrl) return;

    // No moderation/review backend exists yet — persist locally instead of
    // discarding the submission.
    try {
      const submissions = JSON.parse(window.localStorage.getItem("windowswap_submissions") || "[]");
      submissions.push({
        name: submitName,
        location: submitLocation,
        url: submitUrl,
        notes: submitNotes,
        submittedAt: new Date().toISOString(),
      });
      window.localStorage.setItem("windowswap_submissions", JSON.stringify(submissions));
    } catch {
      // localStorage can be unavailable in private browsing; UI still succeeds.
    }

    setIsFormSubmitted(true);

    // Burst beautiful confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Reset drawer state after brief delay
    setTimeout(() => {
      onClose();
      setIsFormSubmitted(false);
      setSubmitName("");
      setSubmitLocation("");
      setSubmitUrl("");
      setSubmitNotes("");
    }, 3500);
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
            onClick={onClose}
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
                <span className="font-serif text-xl font-bold tracking-wide">Submit a window</span>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form state coordination */}
            {!isFormSubmitted ? (
              <form onSubmit={handleSubmitWindow} className="windowswap-submit-form mt-8 flex-1 flex flex-col gap-6 text-sm">

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
                  <label className="text-windowswap-cream font-semibold tracking-wider uppercase text-[10px]">Raw Video URL (GDrive/Vimeo/Dropbox)</label>
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
                  <span className="font-semibold text-white uppercase tracking-wider text-[9px] block mb-1">submission checklist</span>
                  • Horizontal video, locked camera position (tripod is required).<br />
                  • Exactly 10 minutes long, showing window frame boundaries.<br />
                  • Sound: Keep native ambient noise (birds, wind, city traffic).
                </div>

                <button
                  type="submit"
                  className="w-full windowswap-primary-button py-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  Submit Window View
                </button>

              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-6"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4 animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-white mb-2">Thank you, {submitName}!</h3>
                <p className="text-zinc-300 leading-relaxed font-light text-sm max-w-sm">
                  This is a demonstration copy: your scenic window view from <span className="font-semibold text-white">{submitLocation}</span> has been saved only in this browser&rsquo;s local storage. It hasn&rsquo;t been sent to AltFTool or anyone else, so there&rsquo;s nothing yet for us to review.
                </p>
              </motion.div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
