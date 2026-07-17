"use client";

// Version-history drawer. Lists a page's saved revisions (written on every
// save via saveLanderRevision) and restores a chosen snapshot back into the
// editor — the restore only loads it into the editor's working state, so the
// user still reviews and Saves, which itself creates a fresh revision.

import { useEffect, useState } from "react";
import { X, History, RotateCcw, Loader2 } from "lucide-react";
import { fetchLanderRevisions } from "../services/landersService";

function fmt(ts) {
  const ms = ts?.toMillis?.() ?? (typeof ts === "number" ? ts : null);
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const REASON_LABEL = { edit: "Edited", manual: "Manual save", publish: "Published", restore: "Restored" };

export default function HistoryDrawer({ landerId, onRestore, onClose }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchLanderRevisions(landerId).then((r) => alive && setRows(r)).catch(() => alive && setRows([]));
    return () => { alive = false; };
  }, [landerId]);

  return (
    <div className="fixed inset-0 z-[95] flex justify-end bg-black/40" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface,var(--card))] shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-black text-[var(--foreground)]"><History className="h-4 w-4 text-[var(--primary)]" /> Version history</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {rows === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--muted)]">No revisions yet. Each save adds one.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((rev) => (
                <li key={rev.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--foreground)]">{REASON_LABEL[rev.reason] || rev.reason || "Saved"}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{fmt(rev.createdAt)}{rev.actor ? ` · ${rev.actor}` : ""}</p>
                  </div>
                  <button
                    onClick={() => { if (window.confirm("Load this version into the editor? You'll still need to Save.")) onRestore(rev.snapshot || {}); }}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
