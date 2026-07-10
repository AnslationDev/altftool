import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function ImagePreviewModal({ src, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[85vh] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl p-2 cursor-default flex flex-col items-center justify-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition shadow-lg z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="overflow-hidden rounded max-w-full max-h-[75vh]">
          <img
            src={src}
            alt="Preview Modal"
            className="w-full h-full object-contain max-h-[75vh]"
          />
        </div>
        <div className="mt-2 text-center text-xs font-semibold text-[var(--muted)] select-all truncate max-w-lg px-4">
          Reference URL: {src}
        </div>
      </div>
    </div>
  );
}
