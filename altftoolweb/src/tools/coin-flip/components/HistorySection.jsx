"use client";

import { motion } from "framer-motion";
import { History, Clock, Trash2 } from "lucide-react";

export default function HistorySection({ history = [], onClearHistory }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--anslation-ds-secondary-soft)] text-[var(--secondary)]">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Toss History</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Timeline of recent flip outcomes</p>
          </div>
        </div>

        {history.length > 0 && onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center text-[var(--muted-foreground)]">
          <Clock className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm font-semibold">No toss history yet</p>
          <p className="text-xs opacity-75 mt-0.5">Press Flip Coin to start recording</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {history.map((item, idx) => {
            const isHeads = item === "H";
            return (
              <motion.div
                key={`${idx}-${item}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, delay: idx * 0.015 }}
                whileHover={{ scale: 1.15 }}
                className={`group relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm cursor-pointer transition border ${isHeads
                    ? "bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)] border-[var(--primary)]/30"
                    : "bg-[var(--anslation-ds-secondary-soft)] text-[var(--secondary)] border-[var(--secondary)]/30"
                  }`}
              >
                <span>{item}</span>

                {/* Tooltip on Hover */}
                <div className="pointer-events-none absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
                  <div className="rounded-lg bg-[var(--foreground)] px-2.5 py-1 text-[10px] font-semibold text-[var(--background)] shadow-lg whitespace-nowrap">
                    Toss #{idx + 1}: {isHeads ? "Heads" : "Tails"}
                  </div>
                  <div className="h-1.5 w-1.5 rotate-45 bg-[var(--foreground)] -mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
