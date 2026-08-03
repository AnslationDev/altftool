"use client";
import React, { useState } from "react";

export default function ImageViewer({ src, alt = "", platform = "", className = "" }) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in`}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 max-w-full max-h-full">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-20 rounded-full bg-black/40 p-2 text-white"
            >
              ✕
            </button>
            <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] rounded" />
            {platform && <div className="mt-2 text-center text-sm text-white">{platform}</div>}
          </div>
        </div>
      )}
    </>
  );
}
