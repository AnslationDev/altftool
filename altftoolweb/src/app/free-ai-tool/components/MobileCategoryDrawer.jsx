"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { TOOL_CATEGORIES } from "../data/tools";

/** Bottom-sheet category picker for phones and small tablets. */
export default function MobileCategoryDrawer({ open, onClose, activeId, onSelect }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <motion.button
            type="button"
            aria-label="Close category menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-slate-900/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Browse AI tool categories"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />
                <h3 className="text-base font-bold text-slate-900">Browse categories</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="fat-scrollbar grid max-h-[calc(78vh-4.5rem)] grid-cols-2 gap-2 overflow-y-auto p-4 pb-8">
              {TOOL_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = category.id === activeId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onSelect(category.id);
                      onClose();
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-colors ${
                      isActive
                        ? "border-violet-300 bg-violet-50 text-violet-950"
                        : "border-slate-200 bg-slate-50 text-slate-600 active:bg-slate-100"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${category.hue[0]}22, ${category.hue[1]}14)`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: category.hue[0] }} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{category.label}</span>
                      <span className="block text-[11px] text-slate-500">{category.tools.length} tools</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
