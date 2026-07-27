"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@altftool/ui";
import { X, Heart, Share2, Star, Trophy, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function WinnerModal({ winner, onClose, onToggleFavorite, isFavorite }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [winner]);

  const handleCopy = () => {
    const name = winner?.name || winner;
    if (!name) return;
    navigator.clipboard?.writeText(String(name)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  useEffect(() => {
    if (!winner) return;
    const timer = setTimeout(() => {}, 100);
    return () => clearTimeout(timer);
  }, [winner]);

  if (!winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          recycle={false}
          numberOfPieces={200}
          colors={["#14B8A6", "#22D3EE", "#8B5CF6", "#F43F5E", "#F59E0B", "#3B82F6"]}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-10 w-full max-w-sm"
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="bg-(--card) border border-(--border) rounded-2xl shadow-2xl p-6 text-center">
            <button onClick={onClose} aria-label="Close winner dialog" className="absolute top-3 right-3 p-1 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)">
              <X size="18" />
            </button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-(--primary-soft) flex items-center justify-center">
              <Trophy className="text-(--primary)" size="32" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) mb-1">Winner</p>
            <h2 className="text-2xl font-bold text-(--foreground) mb-4">{winner.name || winner}</h2>

            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copy winner name">
                {copied ? <Check size="14" className="text-(--success)" /> : <Copy size="14" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={onToggleFavorite}>
                <Heart size="14" className={isFavorite ? "fill-(--danger) text-(--danger)" : ""} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Spin Again
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
