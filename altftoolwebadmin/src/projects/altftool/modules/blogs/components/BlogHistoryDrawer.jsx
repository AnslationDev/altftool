"use client";

import { useEffect, useState } from "react";
import { History, Loader2, RotateCcw, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { fetchBlogRevisions, restoreBlogRevision } from "../services/blogsService";
import { toJsDate } from "../lib/workflow";

function when(value) {
  const d = toJsDate(value);
  return d ? d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
}

/**
 * Slide-over drawer listing version history for a blog with one-click restore.
 * `currentBlog` is snapshotted before any restore so restore is itself undoable.
 */
export default function BlogHistoryDrawer({ open, blogId, currentBlog, onClose, onRestored }) {
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    if (!open || !blogId) return;
    setLoading(true);
    fetchBlogRevisions(blogId)
      .then(setRevisions)
      .catch((err) => {
        console.error("[history]", err);
        emitAlert({ type: "error", message: "Could not load version history." });
      })
      .finally(() => setLoading(false));
  }, [open, blogId]);

  if (!open) return null;

  const restore = async (revision) => {
    setRestoringId(revision.id);
    try {
      await restoreBlogRevision({ revision, currentBlog });
      emitAlert({ type: "success", message: "Revision restored." });
      onRestored?.(revision);
      onClose?.();
    } catch (err) {
      console.error("[history-restore]", err);
      emitAlert({ type: "error", message: "Restore failed." });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex justify-end bg-foreground/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Version history">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface shadow-lg">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <History className="h-4 w-4 text-primary" /> Version history
          </span>
          <button onClick={onClose} className="rounded-lg border border-border p-1.5 text-muted hover:bg-surface-soft" aria-label="Close history">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : revisions.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              No saved revisions yet. Revisions are captured each time you save.
            </p>
          ) : (
            <ol className="space-y-2">
              {revisions.map((rev) => (
                <li key={rev.id} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{rev.snapshot?.heading || rev.blogTitle || "Untitled"}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {when(rev.createdAt)} · {rev.reason || "save"}{rev.actor ? ` · ${rev.actor}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => restore(rev)}
                      disabled={Boolean(restoringId)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-surface-soft disabled:opacity-50"
                    >
                      {restoringId === rev.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      Restore
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
