"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileUp,
  UploadCloud,
} from "lucide-react";

export default function UploadDropzone({
  logSource,
  onLogSourceChange,
  fileRef,
  onFileRead,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("paste"); // "paste" | "upload"

  const detectFormat = (text = "") => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (/^[{[]/.test(trimmed)) {
      try {
        JSON.parse(trimmed);
        return "JSON";
      } catch {
        return "JSONL";
      }
    }
    if (trimmed.includes(",") || trimmed.includes("\t")) {
      return trimmed.includes("\t") ? "TSV" : "CSV";
    }
    return "Text";
  };

  const detectedFormat = detectFormat(logSource);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileRead(file);
  };

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
            1. Input LLM Usage Logs
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:text-sm">
            Paste API usage logs or upload JSON, JSONL, CSV, or TSV files (up to 8 MB)
          </p>
        </div>

        {/* Format & Mode Selector Tabs */}
        <div className="flex items-center gap-2">
          {detectedFormat && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)] shadow-2xs">
              <CheckCircle2 className="size-3.5" />
              <span>Detected: {detectedFormat}</span>
            </span>
          )}

          <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "paste"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Paste Log Text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "upload"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Upload File
            </button>
          </div>
        </div>
      </div>

      {activeTab === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-4 ring-[var(--primary-soft)]"
              : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--primary)] hover:bg-[var(--surface)]"
          }`}
        >
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
              <UploadCloud className="size-7" aria-hidden="true" />
            </div>

            <span className="mt-4 text-sm font-bold text-[var(--foreground)] sm:text-base">
              Drag &amp; drop usage log file here, or <span className="text-[var(--primary)] underline underline-offset-4">browse file</span>
            </span>
            <span className="mt-1 text-xs text-[var(--muted-foreground)]">
              Supports .json, .jsonl, .csv, .tsv, .txt up to 8 MB
            </span>

            <input
              ref={fileRef}
              type="file"
              accept=".json,.jsonl,.csv,.tsv,.txt,application/json,text/plain,text/csv"
              className="sr-only"
              onChange={(e) => void onFileRead(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      ) : (
        <div className="mt-5">
          <label className="block">
            <span className="sr-only">Paste LLM Usage Log Content</span>
            <textarea
              className="h-64 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 font-mono text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)]"
              value={logSource}
              onChange={(e) => onLogSourceChange(e.target.value)}
              placeholder={`[\n  {\n    "model": "gpt-4o",\n    "prompt": "Summarize user release notes...",\n    "usage": { "input_tokens": 1200, "output_tokens": 350 }\n  }\n]`}
              spellCheck="false"
            />
          </label>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-xs font-bold text-[var(--danger)]"
        >
          <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
