"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Trash2, Heart, HeartOff, BarChart3, CalendarDays } from "lucide-react";

export default function HistoryPanel({ history, onSelect, onDelete, favorites, onToggleFavorite }) {
  if (!history || history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-(--border) bg-(--card) p-10 text-center"
      >
        <div className="rounded-xl bg-(--muted) p-4">
          <Clock size={32} className="text-(--muted-foreground)" />
        </div>
        <div>
          <p className="font-semibold text-(--foreground)">No comparisons yet</p>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Upload two images and run a comparison to see your history here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-(--foreground) uppercase tracking-wider">
          History ({history.length})
        </h3>
        <span className="text-[11px] text-(--muted-foreground)">
          {favorites.length} favorites
        </span>
      </div>

      <AnimatePresence>
        {history.map((item, index) => {
          const isFav = favorites.includes(item.id);
          const date = new Date(item.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              className="group flex items-center gap-3 rounded-xl border border-(--border) bg-(--card) p-3 transition hover:border-(--border-strong) hover:shadow-sm"
            >
              <div
                onClick={() => onSelect(item)}
                role="button"
                tabIndex={0}
                aria-label={`View comparison from ${date}, ${item.percentage}% match`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item); } }}
                className="flex flex-1 cursor-pointer items-center gap-3 min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <div className="flex h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-(--border)">
                  <div className="w-1/2 overflow-hidden">
                    <img src={item.imageA} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="w-1/2 overflow-hidden">
                    <img src={item.imageB} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-(--foreground)">{item.percentage}%</span>
                    <span className="rounded-full bg-(--primary-soft) px-2 py-0.5 text-[10px] font-semibold text-(--primary)">
                      Match
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-(--muted-foreground)">
                    <CalendarDays size={10} />
                    {date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="rounded-lg p-1.5 transition hover:bg-(--muted) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                  aria-label={isFav ? "Unfavorite" : "Favorite"}
                >
                  <Star
                    size={14}
                    className={isFav ? "fill-yellow-400 text-yellow-400" : "text-(--muted-foreground)"}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:bg-(--danger)/10 hover:text-(--danger) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
