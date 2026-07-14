"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={`flex max-h-[85vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-2xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h3 className="text-base font-semibold text-(--foreground)">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
