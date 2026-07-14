"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Download, CornerUpLeft } from "lucide-react";
import { toast } from "sonner";
import { downloadJson } from "../utils/download";

// History panel: revisit previously generated/searched characters.
export default function HistoryPanel({ history, onClear, onSelect, onExport }) {
  const handleExport = () => {
    if (history.length === 0) {
      toast.error("History is empty");
      return;
    }
    downloadJson(history, "ccg-history.json");
    toast.success("History exported");
  };

  const handleClear = () => {
    if (history.length === 0) return;
    onClear();
    toast.success("History cleared");
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border) bg-(--card) p-10 text-center shadow-sm">
        <History size={28} className="mx-auto mb-3 text-(--muted-foreground)" />
        <p className="text-sm text-(--muted-foreground)">
          No history yet. Generate or search characters to build your history.
        </p>
      </div>
    );
  }

  const GLYPH_FONT = '"Noto Serif SC","Songti SC","STSong",serif';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title text-lg font-semibold text-(--foreground)">
          Generation History ({history.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--muted) active:scale-95"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--muted) active:scale-95"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.button
              key={`${item.char}-${item.unicode}`}
              type="button"
              onClick={() => onSelect(item)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex flex-col items-center rounded-2xl border border-(--border) bg-(--card) p-4 text-center shadow-sm transition hover:border-(--primary)/40"
            >
              <span
                style={{ fontFamily: GLYPH_FONT }}
                className="text-5xl leading-none text-(--primary)"
              >
                {item.char}
              </span>
              <span className="mt-2 text-sm font-medium text-(--foreground)">
                {item.pinyin}
              </span>
              <span className="text-xs text-(--muted-foreground)">
                {item.meaning}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-(--muted-foreground) opacity-0 transition group-hover:opacity-100">
                <CornerUpLeft size={12} />
                Reopen
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
