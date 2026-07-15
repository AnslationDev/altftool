"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Download } from "lucide-react";

export default function ShareDialog({ open, onClose, result }) {
  const [copied, setCopied] = useState(false);

  const shareText = result
    ? `I just compared two photos with Twin Finder and got a ${result.percentage}% similarity match! ${result.insights} Try it yourself!`
    : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  }, [shareText]);

  const handleWebShare = useCallback(async () => {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: "Twin Finder Result",
        text: shareText,
        url: window.location.href,
      });
    } catch {
      /* user cancelled */
    }
  }, [shareText, handleCopyLink]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-(--foreground)">Share Result</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
              >
                <X size={18} />
              </button>
            </div>

            {result && (
              <div className="mt-4 rounded-xl bg-(--muted) p-4">
                <p className="text-center text-3xl font-black text-(--foreground)">
                  {result.percentage}% Match
                </p>
                <p className="mt-2 text-center text-sm text-(--muted-foreground)">
                  {result.insights}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) px-4 py-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy Text
                  </>
                )}
              </button>

              {"share" in navigator && (
                <button
                  onClick={handleWebShare}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
                >
                  <Share2 size={16} /> Share via...
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-(--muted-foreground)">
              Results are for entertainment purposes only.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
