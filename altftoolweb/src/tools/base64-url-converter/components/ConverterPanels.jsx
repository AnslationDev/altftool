"use client";

import { useRef, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRightLeft,
  Check,
  ClipboardPaste,
  Copy,
  Download,
  FileText,
  FileUp,
  Maximize2,
  Settings2,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const buttonClass =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40 shadow-2xs";

const STATUS_STYLES = {
  ready: { dot: "bg-emerald-500 animate-pulse", label: "Ready", border: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" },
  success: { dot: "bg-blue-500", label: "Converted", border: "border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" },
  error: { dot: "bg-rose-500", label: "Invalid", border: "border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" },
};

function FullscreenOutput({ title, output, onCopy, copied, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} fullscreen`}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={onCopy} className={buttonClass}>
              {copied ? <Check aria-hidden="true" size={13} className="text-emerald-600" /> : <Copy aria-hidden="true" size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close fullscreen"
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
        <pre className="min-h-40 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-100">
          {output}
        </pre>
      </div>
    </div>
  );
}

export default function ConverterPanels({
  direction,
  input,
  onInputChange,
  output,
  error,
  status,
  onConvert,
  onSwap,
  onPasteClipboard,
  onUploadFile,
  onClearAll,
  copied,
  onCopy,
  onDownload,
  shared,
  onShare,
  onOptionsClick,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const inputTitle = direction === "encode" ? "Base64 Input" : "URL-safe Base64 Input";
  const outputTitle = direction === "encode" ? "URL-safe Base64 Output" : "Standard Base64 Output";
  const inputPlaceholder = "Paste your Base64 string here...";
  const outputPlaceholder = "URL-safe Base64 output will appear here...";
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.ready;

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onUploadFile(file);
  };

  return (
    <section aria-label="Converter" className="grid items-center gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.b64,.json,text/plain"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Input card */}
      <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <FileText aria-hidden="true" size={17} className="text-blue-600 dark:text-blue-400" />
            <span>{inputTitle}</span>
          </h2>
          <div className="flex gap-2">
            <button type="button" onClick={onPasteClipboard} className={buttonClass}>
              <ClipboardPaste aria-hidden="true" size={13} className="text-slate-500" />
              <span>Paste</span>
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonClass}>
              <FileUp aria-hidden="true" size={13} className="text-slate-500" />
              <span>Upload .txt</span>
            </button>
          </div>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={`relative flex-1 rounded-xl transition-all ${
            isDragging ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900" : ""
          }`}
        >
          <label htmlFor="b64-input" className="sr-only">
            {inputTitle}
          </label>
          <textarea
            id="b64-input"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            spellCheck={false}
            placeholder={inputPlaceholder}
            className="h-64 w-full resize-y rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 xl:h-72"
          />

          {!input && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-8 py-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
            >
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-500 dark:text-slate-400">
                <Upload aria-hidden="true" size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag &amp; drop a file here
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  or click to upload
                </span>
              </div>
            </button>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <p className="text-xs tabular-nums text-slate-500 dark:text-slate-400" aria-live="polite">
            {input.length.toLocaleString()} characters
          </p>
          <button type="button" disabled={!input} onClick={() => onInputChange("")} className={buttonClass}>
            <Trash2 aria-hidden="true" size={13} className="text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Middle rail - matching reference screenshot */}
      <div className="flex flex-row items-center justify-center gap-3 py-2 xl:flex-col xl:py-0">
        <button
          type="button"
          onClick={onSwap}
          title="Swap conversion direction"
          aria-label="Swap conversion direction"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs transition-all hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <ArrowLeftRight aria-hidden="true" size={18} />
        </button>

        <button
          type="button"
          onClick={onConvert}
          disabled={!input.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-md shadow-blue-600/25 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <ArrowRightLeft aria-hidden="true" size={16} />
          <span>Convert</span>
        </button>

        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${statusStyle.border}`}
          aria-live="polite"
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
          <span>{statusStyle.label}</span>
        </div>

        <button type="button" onClick={onOptionsClick} className={buttonClass}>
          <Settings2 aria-hidden="true" size={14} className="text-slate-500" />
          <span>Options</span>
        </button>
      </div>

      {/* Output card */}
      <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ArrowLeftRight aria-hidden="true" size={17} className="text-blue-600 dark:text-blue-400" />
            <span>{outputTitle}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!output} onClick={onCopy} className={buttonClass}>
              {copied ? <Check aria-hidden="true" size={13} className="text-emerald-600" /> : <Copy aria-hidden="true" size={13} className="text-slate-500" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button type="button" disabled={!output} onClick={onDownload} className={buttonClass}>
              <Download aria-hidden="true" size={13} className="text-slate-500" />
              <span>Download .txt</span>
            </button>
            <button type="button" disabled={!input} onClick={onShare} className={buttonClass}>
              {shared ? <Check aria-hidden="true" size={13} className="text-emerald-600" /> : <Share2 aria-hidden="true" size={13} className="text-slate-500" />}
              <span>{shared ? "Copied" : "Share"}</span>
            </button>
            <button
              type="button"
              disabled={!output}
              onClick={() => setMaximized(true)}
              aria-label="View output fullscreen"
              className={buttonClass}
            >
              <Maximize2 aria-hidden="true" size={13} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="h-64 w-full resize-y overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 font-mono text-sm leading-relaxed xl:h-72">
          {error ? (
            <p role="alert" className="font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          ) : output ? (
            <pre className="whitespace-pre-wrap break-all text-slate-900 dark:text-slate-100">
              {output}
            </pre>
          ) : (
            <p className="text-slate-400 dark:text-slate-500">{outputPlaceholder}</p>
          )}
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <p className="text-xs tabular-nums text-slate-500 dark:text-slate-400" aria-live="polite">
            {output.length.toLocaleString()} characters
          </p>
          <button type="button" disabled={!input && !output} onClick={onClearAll} className={buttonClass}>
            <Trash2 aria-hidden="true" size={13} className="text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {maximized && output && (
        <FullscreenOutput
          title={outputTitle}
          output={output}
          onCopy={onCopy}
          copied={copied}
          onClose={() => setMaximized(false)}
        />
      )}
    </section>
  );
}
