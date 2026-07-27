"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCode,
  FileImage,
  FileText,
  FileUp,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { formatBytes } from "../lib/redactorModel.mjs";

export default function UploadDropzone({
  sourceInfo,
  isBusy,
  onFileSelect,
  onReplaceFile,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            onFileSelect(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFileSelect]);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
            {sourceInfo ? "Document Loaded for Redaction" : "1. Select or Drop Statement"}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:text-sm">
            Upload PDF, PNG, JPEG, WebP, BMP, or AVIF · Files processed strictly in memory
          </p>
        </div>

        {sourceInfo && (
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-xs font-bold text-[var(--foreground)] shadow-xs transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface)]">
            <FileUp className="size-4 text-[var(--primary)]" aria-hidden="true" />
            <span>Replace document</span>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp,image/avif"
              className="sr-only"
              disabled={isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onReplaceFile(file);
              }}
            />
          </label>
        )}
      </div>

      {!sourceInfo && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-4 ring-[var(--primary-soft)]"
              : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--primary)] hover:bg-[var(--surface)]"
          }`}
        >
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm transition-transform group-hover:scale-105">
              <UploadCloud className="size-8" aria-hidden="true" />
            </div>

            <span className="mt-5 text-sm font-bold text-[var(--foreground)] sm:text-base">
              Drag &amp; drop statement here, or <span className="text-[var(--primary)] underline underline-offset-4">browse files</span>
            </span>
            <span className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Pro tip: Paste directly from clipboard using <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px]">Ctrl+V</kbd>
            </span>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <FileText className="size-3.5 text-[var(--primary)]" aria-hidden="true" /> PDF Documents
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <FileImage className="size-3.5 text-[var(--primary)]" aria-hidden="true" /> Image Files
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)] shadow-2xs">
                <LockKeyhole className="size-3.5" aria-hidden="true" /> 100% Offline Ready
              </span>
            </div>

            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp,image/avif"
              className="sr-only"
              disabled={isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onFileSelect(file);
              }}
            />
          </label>
        </div>
      )}

      {sourceInfo && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs font-medium">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              {sourceInfo.type === "pdf" ? (
                <FileText className="size-6" aria-hidden="true" />
              ) : (
                <FileImage className="size-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <span className="block font-extrabold text-[var(--foreground)] sm:text-sm">
                {sourceInfo.name}
              </span>
              <span className="text-[var(--muted-foreground)]">
                {formatBytes(sourceInfo.size)} ·{" "}
                {sourceInfo.type === "pdf"
                  ? `${sourceInfo.pageCount} page(s)`
                  : `${sourceInfo.dimensions}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-3 py-1 text-xs font-bold text-[var(--success)]">
              <CheckCircle2 className="size-4" aria-hidden="true" /> Validated &amp; Ready
            </span>
          </div>
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
