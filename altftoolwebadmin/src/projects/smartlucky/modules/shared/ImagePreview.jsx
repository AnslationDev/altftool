"use client";

import { useState } from "react";
import { X, Maximize2, Minimize2, Copy, CheckCircle2 } from "lucide-react";

export default function ImagePreview({ src, alt = "preview" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!src) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => setOpen(true)}
          className="relative group shrink-0 rounded-lg overflow-hidden border border-[var(--border)] hover:ring-2 hover:ring-[var(--primary)]/40 transition-all"
          style={{ width: 80, height: 56 }}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Maximize2 size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <code className="text-[11px] text-[var(--muted)] truncate block flex-1">{src}</code>
            <button type="button" onClick={copyUrl} title="Copy URL" className="shrink-0 p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] transition">
              {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition z-10">
              <X size={16} />
            </button>
            <img src={src} alt={alt} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" />
            <p className="mt-2 text-xs text-white/60 text-center truncate">{src}</p>
          </div>
        </div>
      )}
    </>
  );
}
