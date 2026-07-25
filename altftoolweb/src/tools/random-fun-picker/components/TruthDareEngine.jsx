"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Input } from "@altftool/ui";
import {
  HelpCircle, Skull, MessageCircle, Heart, SkipForward,
  Star, Plus, X, Timer, Bookmark,
} from "lucide-react";
import { MODE_PACKS } from "../utils/data";

export default function TruthDareEngine({
  mode, setMode, difficulty, setDifficulty, pack, setPack,
  current, showCountdown, favorites, customQuestions, isAnimating, skipped,
  onPick, onSkip, onToggleFavorite, onAddCustom, onRemoveCustom,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customMode, setCustomMode] = useState("truth");
  const [customDiff, setCustomDiff] = useState("medium");

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    onAddCustom(customText, customMode, customDiff);
    setCustomText("");
    setShowAdd(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2 p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("truth")}
            className={`flex-1 py-2 px-3 min-h-11 rounded-lg text-xs font-semibold transition border focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 active:scale-[0.98] motion-reduce:active:scale-100 ${
              mode === "truth"
                ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
            }`}
          >
            <HelpCircle size="16" className="mx-auto mb-0.5" /> Truth
          </button>
          <button
            onClick={() => setMode("dare")}
            className={`flex-1 py-2 px-3 min-h-11 rounded-lg text-xs font-semibold transition border focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 active:scale-[0.98] motion-reduce:active:scale-100 ${
              mode === "dare"
                ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
            }`}
          >
            <Skull size="16" className="mx-auto mb-0.5" /> Dare
          </button>
        </div>

        <div className="flex gap-2">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 active:scale-[0.98] motion-reduce:active:scale-100 ${
                difficulty === d
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(MODE_PACKS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setPack(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 active:scale-[0.98] motion-reduce:active:scale-100 ${
                pack === key
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
              }`}
            >
              <MessageCircle size="12" className="inline mr-1" />
              {val.label}
            </button>
          ))}
        </div>

        <div className="min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showCountdown ? (
              <motion.div
                key="countdown"
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-center"
              >
                <Timer size="48" className="mx-auto mb-2 text-(--primary) animate-pulse" />
                <p className="text-lg font-bold text-(--foreground) animate-pulse">Ready...</p>
              </motion.div>
            ) : current ? (
              <motion.div
                key={current.id}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                className="text-center"
              >
                <div className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase mb-2 bg-(--primary-soft) text-(--primary)">
                  {current.mode} • {current.difficulty}
                </div>
                <p className="text-lg font-semibold text-(--foreground) mb-3">{current.text}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={onToggleFavorite} aria-label="Toggle favorite question" className="p-2 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35">
                    <Star size="16" className={favorites.find((f) => f.text === current.text) ? "fill-amber-400 text-amber-400" : ""} />
                  </button>
                  <button onClick={onSkip} aria-label="Skip question" className="p-2 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35">
                    <SkipForward size="16" /> Skip
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-(--muted-foreground)">
                <HelpCircle size="40" className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Press Pick to start!</p>
                <p className="text-xs mt-1">Skipped: {skipped}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button variant="primary" size="lg" className="w-full h-12 font-bold active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)/35" onClick={onPick} disabled={isAnimating}>
          {isAnimating ? "..." : "Pick!"}
        </Button>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Custom</h4>
          <button onClick={() => setShowAdd(!showAdd)} aria-label="Add custom question" className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35">
            <Plus size="14" />
          </button>
        </div>

        {showAdd && (
          <div className="space-y-2 p-2 rounded-lg bg-(--muted)">
            <Input value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter question..." aria-label="Custom question text" className="text-sm" />
            <div className="flex gap-1">
              {["truth", "dare"].map((m) => (
                <button key={m} onClick={() => setCustomMode(m)} className={`flex-1 py-1 rounded text-xs font-medium border capitalize focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                  customMode === m ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--card) text-(--muted-foreground)"
                }`}>{m}</button>
              ))}
            </div>
            <div className="flex gap-1">
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setCustomDiff(d)} className={`flex-1 py-1 rounded text-xs font-medium border capitalize focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                  customDiff === d ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--card) text-(--muted-foreground)"
                }`}>{d}</button>
              ))}
            </div>
            <Button variant="primary" size="sm" className="w-full" onClick={handleAddCustom} disabled={!customText.trim()}>Add</Button>
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {customQuestions.length === 0 ? (
            <p className="text-xs text-(--muted-foreground) text-center py-4">No custom questions yet</p>
          ) : (
            customQuestions.map((q) => (
              <div key={q.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-(--muted) text-sm">
                <span className="flex-1 truncate text-(--foreground)">{q.text}</span>
                <span className="text-[10px] uppercase text-(--muted-foreground)">{q.mode}</span>
                <button onClick={() => onRemoveCustom(q.id)} aria-label="Remove custom question" className="p-0.5 text-(--muted-foreground) hover:text-(--danger)"><X size="12" /></button>
              </div>
            ))
          )}
        </div>

        {favorites.length > 0 && (
          <>
            <div className="flex items-center gap-1 pt-2 border-t border-(--border)">
              <Star size="14" className="text-amber-400" />
              <span className="text-xs font-semibold text-(--foreground)">Favorites ({favorites.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
              {favorites.map((f, i) => (
                <div key={i} className="text-xs text-(--foreground) px-2 py-1 rounded bg-(--muted)">{f.text}</div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
