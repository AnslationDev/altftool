"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Download, Share2, Check, Image, FileText } from "lucide-react";

export default function ShareDialog({ open, onClose, result }) {
  const [copied, setCopied] = useState(false);

  if (!open || !result) return null;

  const shareText = `✦ My Beauty Score: ${result.score}/100 ✦
Mood: ${result.moodBadge}
Style: ${result.styleTags?.join(", ") || "—"}

Compliments:
${result.compliments?.map((c) => `• ${c}`).join("\n")}

Created with ALTFTool Beauty Score ✨`;

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
        await navigator.share({
          title: "My Beauty Score",
          text: shareText,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([shareText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beauty-score-${result.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    if (!result.imageData) {
      handleDownloadText();
      return;
    }
    const link = document.createElement("a");
    link.download = `beauty-score-${result.id}.jpg`;
    link.href = result.imageData;
    link.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Share2 className="text-pink-400" size={20} />
              <h3 className="font-bold text-foreground">Share Your Result</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted/30 text-muted-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-3">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/20 transition cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Share2 className="text-pink-400" size={20} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-pink-400 transition-colors">
                  Share via...
                </p>
                <p className="text-xs text-muted-foreground">
                  Use your device&apos;s share menu
                </p>
              </div>
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/20 transition cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                {copied ? (
                  <Check className="text-green-400" size={20} />
                ) : (
                  <Copy className="text-blue-400" size={20} />
                )}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  {copied ? "Copied!" : "Copy Text"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Copy report to clipboard
                </p>
              </div>
            </button>

            <button
              onClick={handleDownloadImage}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/20 transition cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Image className="text-purple-400" size={20} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  Download Image
                </p>
                <p className="text-xs text-muted-foreground">
                  Save your photo result
                </p>
              </div>
            </button>

            <button
              onClick={handleDownloadText}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/20 transition cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <FileText className="text-amber-400" size={20} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors">
                  Download Text Report
                </p>
                <p className="text-xs text-muted-foreground">
                  Save as .txt file
                </p>
              </div>
            </button>
          </div>

          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              You are beautiful! Share the positivity with your friends.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
