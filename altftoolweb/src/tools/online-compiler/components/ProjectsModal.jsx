"use client";

import { Star, FolderPlus, Copy, Trash2, FolderOpen } from "lucide-react";
import Modal from "./Modal";

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

export default function ProjectsModal({
  open,
  onClose,
  projects,
  currentId,
  onOpen,
  onDelete,
  onToggleFavorite,
  onNew,
  onDuplicate,
}) {
  const sorted = [...projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <Modal open={open} onClose={onClose} title="Projects" maxWidth="max-w-xl">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-lg bg-(--primary) px-3 py-1.5 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90"
        >
          <FolderPlus size={15} /> New project
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-(--muted-foreground)">
          No saved projects yet. Your work auto-saves as you type.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((p) => (
            <li
              key={p.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                p.id === currentId ? "border-(--primary) bg-(--primary)/5" : "border-(--border) bg-(--background)"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleFavorite(p.id)}
                className={`${p.favorite ? "text-amber-400" : "text-(--muted-foreground)"} transition hover:scale-110`}
                aria-label="Toggle favorite"
              >
                <Star size={16} fill={p.favorite ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <FolderOpen size={16} className="text-(--primary)" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-(--foreground)">{p.name}</span>
                  <span className="block text-xs text-(--muted-foreground)">{fmt(p.updatedAt)}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(p.id)}
                title="Duplicate"
                className="rounded-md p-1.5 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                title="Delete"
                className="rounded-md p-1.5 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
