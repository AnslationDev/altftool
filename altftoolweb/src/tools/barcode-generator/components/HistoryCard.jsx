"use client";

import { useState } from "react";
import { Download, MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import { getFormat } from "../utils/barcodeFormats";
import { downloadDataUrl } from "../utils/exporters";

function formatRelativeTime(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? "" : "s"} ago`;
}

function HistoryItem({ entry, onLoad, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const label = entry.format === "QR" ? "QR Code" : getFormat(entry.format).label;

  return (
    <article className="relative flex flex-col rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-1">
        <button
          type="button"
          onClick={() => onLoad(entry)}
          title="Load this barcode into the editor"
          className="flex h-16 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-card p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.thumb} alt={`${label} barcode for ${entry.data}`} className="max-h-full max-w-full object-contain" />
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="History item actions"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <MoreVertical aria-hidden="true" size={14} />
        </button>
      </div>

      <div className="mt-2 flex items-end justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{formatRelativeTime(entry.savedAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => downloadDataUrl(entry.thumb, `barcode-${entry.format}-${entry.id}.png`)}
          aria-label={`Download ${label} barcode as PNG`}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Download aria-hidden="true" size={14} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-2 top-8 z-20 w-32 space-y-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onLoad(entry);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
          >
            <RotateCcw aria-hidden="true" size={12} /> Load
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(entry.id);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-danger hover:bg-danger-soft"
          >
            <Trash2 aria-hidden="true" size={12} /> Delete
          </button>
        </div>
      )}
    </article>
  );
}

export default function HistoryCard({ history, onLoad, onDelete }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? history : history.slice(0, 5);

  return (
    <section aria-label="Recent history" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Recent History</h2>
        {history.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {showAll ? "Show less" : "View All"}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Saved barcodes appear here — hit <strong>Generate Barcode</strong> or{" "}
          <strong>Save to History</strong> to keep one. History stays on this device.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {visible.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onLoad={onLoad} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
