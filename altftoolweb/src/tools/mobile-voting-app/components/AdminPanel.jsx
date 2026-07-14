"use client";

import { useState } from "react";
import {
  Settings,
  Trash2,
  RotateCcw,
  Download,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AdminPanel = ({ poll, onDelete, onResetVotes, onClose, onReopen, onExport }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isClosed = poll.status === "closed";

  const handleDelete = () => {
    onDelete(poll.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-(--muted) transition cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
          <Settings size={14} /> Admin Controls
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-(--border) pt-3">
          <div className="flex flex-wrap gap-2">
            {!isClosed ? (
              <button
                onClick={() => onClose(poll.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition cursor-pointer"
              >
                <Lock size={14} /> Close Poll
              </button>
            ) : (
              <button
                onClick={() => onReopen(poll.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition cursor-pointer"
              >
                <Unlock size={14} /> Reopen Poll
              </button>
            )}

            <button
              onClick={() => onResetVotes(poll.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Votes
            </button>

            <button
              onClick={() => onExport(poll.id, "csv")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition cursor-pointer"
            >
              <Download size={14} /> CSV
            </button>

            <button
              onClick={() => onExport(poll.id, "json")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition cursor-pointer"
            >
              <Download size={14} /> JSON
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--anslation-ds-danger)] text-sm font-medium text-[var(--anslation-ds-danger)] hover:bg-[var(--anslation-ds-danger-soft)] transition cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-(--card) border border-(--border) shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--foreground)">Delete Poll</h3>
            <p className="text-sm text-(--muted-foreground)">
              Are you sure you want to delete &quot;{poll.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-(--border) text-(--foreground) hover:bg-(--muted) transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--anslation-ds-danger)] text-white hover:opacity-90 transition font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
