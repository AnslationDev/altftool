"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2, Download, Check } from "lucide-react";
import { useState } from "react";
import { FUN_DESCRIPTIONS, downloadAuraCard } from "../utils/helpers";

export default function ShareDialog({ open, onClose, aura }) {
  const [copied, setCopied] = useState(false);

  if (!aura) return null;

  const shareText = `✨ My Aura Color: ${aura.name}\n${aura.meaning}\n\n${FUN_DESCRIPTIONS[aura.key]}\n\nLucky Quote: ${aura.quote}\n\nDiscover your aura at Aura Color Generator!`;

  const isGradient = aura.hex.startsWith("linear-gradient");
  const glowColor = isGradient ? "#8B5CF6" : aura.hex;
  const auraStyle = {
    background: glowColor,
    boxShadow: `0 0 16px ${glowColor}60`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Aura Color", text: shareText });
        onClose();
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-(--foreground)">Share Your Aura</h3>
              <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 min-w-11 min-h-11 inline-flex items-center justify-center text-(--muted-foreground) hover:bg-(--muted) transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-(--background) p-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-full"
                  style={auraStyle}
                />
                <div>
                  <p className="text-sm font-semibold text-(--foreground)">{aura.name} Aura</p>
                  <p className="text-xs text-(--muted-foreground)">{aura.meaning}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
                >
                  <Share2 className="h-5 w-5" />
                  Share via...
                </button>
                <button
                  onClick={() => downloadAuraCard(aura, null)}
                  className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
                >
                  <Download className="h-5 w-5" />
                  Download as PNG
                </button>
              </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
