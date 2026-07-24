"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  Download,
  FileCode2,
  RotateCcw,
} from "lucide-react";

const baseButton =
  "inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40";

const activeEncode = "border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold";
const activeDecode = "border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold";

export default function QuickActions({
  direction,
  onSetDirection,
  onPasteClipboard,
  onSampleData,
  hasOutput,
  copied,
  onCopy,
  onDownload,
  onResetAll,
}) {
  return (
    <section aria-label="Quick actions" className="flex flex-wrap justify-center gap-2.5 py-1">
      <button type="button" onClick={onPasteClipboard} className={baseButton}>
        <Clipboard aria-hidden="true" size={14} className="text-blue-500" />
        <span>Paste from Clipboard</span>
      </button>

      <button type="button" onClick={onSampleData} className={baseButton}>
        <FileCode2 aria-hidden="true" size={14} className="text-purple-500" />
        <span>Sample Data</span>
      </button>

      <button
        type="button"
        aria-pressed={direction === "encode"}
        onClick={() => onSetDirection("encode")}
        className={`${baseButton} ${direction === "encode" ? activeEncode : ""}`}
      >
        <ArrowRight aria-hidden="true" size={14} className="text-emerald-500 stroke-[2.5]" />
        <span>Encode to URL-safe</span>
      </button>

      <button
        type="button"
        aria-pressed={direction === "decode"}
        onClick={() => onSetDirection("decode")}
        className={`${baseButton} ${direction === "decode" ? activeDecode : ""}`}
      >
        <ArrowLeft aria-hidden="true" size={14} className="text-blue-500 stroke-[2.5]" />
        <span>Decode from URL-safe</span>
      </button>

      <button type="button" disabled={!hasOutput} onClick={onCopy} className={baseButton}>
        {copied ? (
          <Check aria-hidden="true" size={14} className="text-emerald-600" />
        ) : (
          <Copy aria-hidden="true" size={14} className="text-slate-500" />
        )}
        <span>{copied ? "Copied!" : "Copy Result"}</span>
      </button>

      <button type="button" disabled={!hasOutput} onClick={onDownload} className={baseButton}>
        <Download aria-hidden="true" size={14} className="text-blue-500" />
        <span>Download Result</span>
      </button>

      <button type="button" onClick={onResetAll} className={baseButton}>
        <RotateCcw aria-hidden="true" size={14} className="text-slate-500" />
        <span>Reset All</span>
      </button>
    </section>
  );
}
