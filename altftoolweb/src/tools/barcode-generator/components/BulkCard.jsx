"use client";

import { useRef, useState } from "react";
import { Check, FileDown, Loader2, UploadCloud, X } from "lucide-react";

export default function BulkCard({ onBulkFile, bulk, onClearBulk, onDownloadSample }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section aria-label="Bulk generate" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-foreground">Bulk Generate</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Generate multiple barcodes at once by uploading a CSV file.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,.tsv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onBulkFile(file);
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onBulkFile(file);
        }}
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        }`}
      >
        {bulk.state === "working" ? (
          <>
            <Loader2 aria-hidden="true" size={26} className="mb-2 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground">Generating barcodes…</p>
          </>
        ) : (
          <>
            <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud aria-hidden="true" size={20} />
            </span>
            <p className="text-sm font-medium text-foreground">Drag &amp; drop your CSV file here</p>
            <p className="my-1 text-xs text-muted-foreground">or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-9 items-center rounded-lg bg-primary/10 px-4 text-xs font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Upload CSV
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onDownloadSample}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <FileDown aria-hidden="true" size={13} /> Download sample CSV
      </button>

      {/* Result summary */}
      {bulk.state === "done" && (
        <div className="mt-3 rounded-xl border border-border bg-background p-3" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Check aria-hidden="true" size={14} className="text-success" />
              {bulk.succeeded} of {bulk.results.length} barcodes generated
              {bulk.succeeded > 0 ? " — ZIP downloaded" : ""}
            </p>
            <button
              type="button"
              onClick={onClearBulk}
              aria-label="Dismiss bulk results"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X aria-hidden="true" size={13} />
            </button>
          </div>
          {bulk.results.some((row) => !row.ok) && (
            <ul className="mt-2 max-h-28 space-y-1 overflow-auto">
              {bulk.results
                .filter((row) => !row.ok)
                .map((row, index) => (
                  <li key={`${row.data}-${index}`} className="truncate text-[11px] text-danger">
                    ✕ {row.data} — {row.error}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      {bulk.state === "error" && (
        <p className="mt-3 text-xs font-semibold text-danger" role="alert">
          {bulk.error}
        </p>
      )}
    </section>
  );
}
