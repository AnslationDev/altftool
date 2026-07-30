"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, Share2, Image } from "lucide-react";
import { useState } from "react";

export default function ShareDialog({ result, open, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!open || !result) return null;

  const { score, luckyNumber, luckyEmoji, badge, date, luckyColor } = result;

  const shareText = `🎲 My Lucky Face Score: ${score}/100!\n🍀 Lucky Number: ${luckyNumber}\n🎨 Lucky Color: ${luckyColor.name}\n🏅 Badge: ${badge.label} ${badge.emoji}\n📅 ${date}\n\nFind out your luck at ALTFTool!`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Lucky Face Score",
          text: shareText,
        });
      } catch {}
    } else {
      handleCopyText();
    }
  };

  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#101827";
    ctx.beginPath();
    ctx.roundRect(0, 0, 400, 500, 16);
    ctx.fill();

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎲 Lucky Face Score", 200, 60);

    ctx.font = "bold 64px system-ui, sans-serif";
    ctx.fillStyle = score >= 80 ? "#F59E0B" : score >= 60 ? "#22C55E" : score >= 40 ? "#EAB308" : "#EF4444";
    ctx.fillText(`${score}`, 200, 150);

    ctx.font = "16px system-ui, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("out of 100", 200, 175);

    ctx.font = "48px system-ui, sans-serif";
    ctx.fillText(luckyEmoji, 200, 240);

    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "#F8FAFC";
    ctx.fillText(`${badge.emoji} ${badge.label}`, 200, 290);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`Lucky #${luckyNumber}  •  ${luckyColor.name}`, 200, 320);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(date, 200, 350);

    ctx.fillStyle = "#607083";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("ALTFTool — Lucky Face Score", 200, 470);

    const link = document.createElement("a");
    link.download = `lucky-face-score-${score}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Share Result
              </h3>
              <button
                onClick={onClose}
                aria-label="Close share dialog"
                className="p-1.5 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg hover:bg-muted/50 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-xl bg-muted/30 border border-border p-4">
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                {shareText}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleCopyText}
                className="flex flex-col items-center gap-1.5 py-3 px-2 min-h-11 rounded-xl border border-border hover:bg-muted/50 transition cursor-pointer active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} className="text-muted-foreground" />
                )}
                <span className="text-[10px] font-medium text-muted-foreground">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1.5 py-3 px-2 min-h-11 rounded-xl border border-border hover:bg-muted/50 transition cursor-pointer active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <Share2 size={20} className="text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">Share</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="flex flex-col items-center gap-1.5 py-3 px-2 min-h-11 rounded-xl border border-border hover:bg-muted/50 transition cursor-pointer active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              >
                <Image size={20} className="text-muted-foreground" alt="" />
                <span className="text-[10px] font-medium text-muted-foreground">Image</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
