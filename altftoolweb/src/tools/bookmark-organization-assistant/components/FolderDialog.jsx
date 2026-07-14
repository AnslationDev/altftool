/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";

export function FolderDialog({ open, mode = "create", initial, onSubmit, onCancel }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
  }, [open, initial]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={mode === "rename" ? "Rename folder" : "Create folder"}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--foreground)">
                {mode === "rename" ? "Rename folder" : "New folder"}
              </h3>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close"
                className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <FolderPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Folder name"
                aria-label="Folder name"
                className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90 disabled:opacity-50"
              >
                {mode === "rename" ? "Rename" : "Create"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
