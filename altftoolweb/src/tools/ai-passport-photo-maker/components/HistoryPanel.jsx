"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Trash2, Eye, Download, History, AlertTriangle } from "lucide-react";
import { Button } from "@altftool/ui";

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function HistoryItem({ item, isFav, onSelect, onDelete, onToggleFavorite }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-(--border) bg-(--card) hover:shadow-sm transition-shadow group"
    >
      <div className="w-12 h-14 rounded-lg overflow-hidden bg-(--muted) border border-(--border) shrink-0">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-(--muted-foreground)">
            <Clock size={16} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--foreground) truncate">{item.templateName || "Unknown Template"}</p>
        <p className="text-[10px] text-(--muted-foreground)">{formatDate(item.date)}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleFavorite(item)}
          className={`p-1.5 rounded-lg transition-colors
            ${isFav ? "text-amber-500" : "text-(--muted-foreground) opacity-0 group-hover:opacity-100"}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={14} fill={isFav ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => onSelect(item)}
          className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-(--primary) hover:bg-(--primary-soft)/20 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="View item"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-(--danger) hover:bg-(--danger)/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete item"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function HistoryPanel({
  history = [],
  onSelect = () => {},
  onDelete = () => {},
  onToggleFavorite = () => {},
  favorites = [],
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-(--muted-foreground)">
        <History size={36} />
        <p className="text-sm font-medium">No history yet</p>
        <p className="text-xs text-center max-w-[200px]">Your processed photos will appear here.</p>
      </div>
    );
  }

  const sorted = [...history].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const displayed = sorted.slice(0, 20);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">
          Recent ({history.length})
        </span>
        <button
          onClick={() => setShowConfirmClear(true)}
          className="text-xs text-(--muted-foreground) hover:text-(--danger) transition-colors px-2 py-1 rounded-lg hover:bg-(--danger)/10"
        >
          Clear all
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {displayed.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            isFav={favorites.includes(item.id)}
            onSelect={onSelect}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </AnimatePresence>

      {history.length > 20 && (
        <p className="text-[10px] text-(--muted-foreground) text-center pt-1">
          Showing 20 of {history.length} items
        </p>
      )}

      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 p-3 rounded-xl border border-(--danger)/20 bg-(--danger)/5"
          >
            <AlertTriangle size={14} className="shrink-0 text-(--danger)" />
            <span className="text-xs text-(--foreground) flex-1">Clear all history?</span>
            <button
              onClick={() => { history.forEach((item) => onDelete(item.id)); setShowConfirmClear(false); }}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-(--danger) text-white hover:bg-(--danger)/80 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-(--muted-foreground) hover:bg-(--muted)/50 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
