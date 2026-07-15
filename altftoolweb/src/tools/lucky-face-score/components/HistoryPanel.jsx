"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Clock, Sparkles } from "lucide-react";
import { getScoreColor, getScoreBg } from "../utils/helpers";

export default function HistoryPanel({
  history,
  onSelect,
  onDelete,
  favorites,
  onToggleFavorite,
}) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted/50">
          <Clock size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No readings yet
        </p>
        <p className="text-xs text-muted-foreground">
          Upload a photo and reveal your luck to see history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-muted-foreground" />
          Reading History
        </h3>
        <span className="text-[10px] text-muted-foreground font-medium">
          {history.length} reading{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {history.map((item, index) => {
          const isFav = favorites?.some((f) => f.id === item.id);
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getScoreBg(item.score)} flex items-center justify-center`}>
                    <span className={`text-sm font-black ${getScoreColor(item.score)}`}>
                      {item.score}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {item.badge?.label}
                      </span>
                      <span className="text-base">{item.badge?.emoji}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {item.date} &middot; #{item.luckyNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition cursor-pointer"
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      size={14}
                      className={isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
