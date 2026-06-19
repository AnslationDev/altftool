"use client";

import { useState } from "react";
import { RefreshCw, Download, Check } from "lucide-react";
import { motion, useReducedMotion } from "../../lib/motion";

/** Framed preview surface with checkerboard + toolbar actions. */
export default function PreviewFrame({ title, onReset, onDownload, downloadLabel = "Download", busy, children, footer }) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);

  const handleDownload = () => {
    onDownload?.();
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  return (
    <motion.div
      className="ali-card overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--ali-border)" }}>
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--ali-grad)" }} />
          {title || "Preview"}
        </span>
        <div className="flex items-center gap-2">
          {onReset && (
            <button onClick={onReset} className="ali-btn ali-btn-ghost" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}>
              <RefreshCw size={14} /> New image
            </button>
          )}
          {onDownload && (
            <button onClick={handleDownload} disabled={busy} className="ali-btn ali-btn-primary" style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}>
              {done ? <><Check size={14} /> Saved</> : <><Download size={14} /> {downloadLabel}</>}
            </button>
          )}
        </div>
      </div>
      <div className="ali-checker grid place-items-center p-4 sm:p-6" style={{ minHeight: 380 }}>
        {children}
      </div>
      {footer && (
        <div className="border-t px-4 py-3 text-sm" style={{ borderColor: "var(--ali-border)" }}>{footer}</div>
      )}
    </motion.div>
  );
}

export function StatBadge({ label, value, accent }) {
  return (
    <div className="rounded-xl border p-3 text-center transition-colors" style={{ borderColor: "var(--ali-border)", background: accent ? "var(--ali-grad-soft)" : "var(--ali-surface)" }}>
      <div className="text-xs" style={{ color: "var(--ali-muted)" }}>{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums" style={{ color: accent ? "var(--ali-brand)" : "inherit" }}>{value}</div>
    </div>
  );
}
