"use client";

import { motion } from "framer-motion";
import { Heart, Trash2, Clock, Sparkles } from "lucide-react";
import { AURA_COLORS } from "../utils/helpers";

export default function HistoryPanel({ history, favorites, onSelect, onDelete, onToggleFavorite }) {
  const isFavorited = (item) => favorites.some((f) => f.timestamp === item.timestamp);
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-(--border) bg-(--card) p-8 text-center">
        <Clock className="h-10 w-10 text-(--muted-foreground)" />
        <p className="text-sm font-semibold text-(--muted-foreground)">No aura history yet</p>
        <p className="text-xs text-(--muted-foreground)">Generate your first aura to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-(--foreground)">History</h3>
        <span className="text-xs text-(--muted-foreground)">{history.length} readings</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {history.map((item, index) => (
          <motion.div
            key={item.timestamp || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-(--border) bg-(--card) p-3 transition-all hover:border-(--primary) hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            aria-label={`View ${item.name} aura reading`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item); } }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-full"
                style={{
                  background: item.hex.startsWith("linear-gradient") ? "#8B5CF6" : item.hex,
                  boxShadow: `0 0 12px ${item.hex.startsWith("linear-gradient") ? "#8B5CF6" : item.hex}60`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--foreground) truncate">{item.name}</p>
                <p className="text-xs text-(--muted-foreground) truncate">{item.meaning}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                aria-label={isFavorited(item) ? "Remove from favorites" : "Add to favorites"}
                className="rounded-lg p-1.5 text-(--muted-foreground) hover:text-(--danger) transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <Heart className={`h-4 w-4 ${isFavorited(item) ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.timestamp); }}
                aria-label="Delete reading"
                className="rounded-lg p-1.5 text-(--muted-foreground) hover:text-(--danger) transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
        </motion.div>
      ))}
      </div>
    </div>
  );
}
