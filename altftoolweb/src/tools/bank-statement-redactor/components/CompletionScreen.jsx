"use client";

import {
  Download,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { formatBytes } from "../lib/redactorModel.mjs";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function CompletionScreen({
  result,
  sourceInfo,
  privacyScore,
  processingTimeMs = 0,
  onResetWorkspace,
}) {
  return (
    <section className="rounded-3xl border-2 border-[var(--success)] bg-[var(--surface)] p-6 shadow-lg sm:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)] shadow-sm">
          <ShieldCheck className="size-10" />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
          Document Successfully Redacted &amp; Flattened!
        </h2>
        <p className="mt-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
          All underlying PDF text layers, vectors, and metadata objects have been permanently destroyed. Your redacted statement is 100% safe to share.
        </p>

        {/* Certificate Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center">
            <span className="block text-xs font-bold text-[var(--muted-foreground)]">
              Pages Processed
            </span>
            <span className="mt-1 block text-2xl font-black text-[var(--foreground)]">
              {result.pageCount}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center">
            <span className="block text-xs font-bold text-[var(--muted-foreground)]">
              Fields Masked
            </span>
            <span className="mt-1 block text-2xl font-black text-[var(--foreground)]">
              {result.redactionCount}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success-soft)]/30 p-4 text-center">
            <span className="block text-xs font-bold text-[var(--success)]">
              Privacy Score
            </span>
            <span className="mt-1 block text-2xl font-black text-[var(--success)]">
              {privacyScore.score}%
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center">
            <span className="block text-xs font-bold text-[var(--muted-foreground)]">
              Processing Time
            </span>
            <span className="mt-1 block text-2xl font-black text-[var(--foreground)]">
              {processingTimeMs || "< 500"} ms
            </span>
          </div>
        </div>

        {/* File Sizes Comparison Pill */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs font-bold">
          <span className="text-[var(--muted-foreground)]">
            Original: {sourceInfo ? formatBytes(sourceInfo.size) : "—"}
          </span>
          <span className="text-[var(--success)] font-extrabold">
            🔒 Flattened Output: {formatBytes(result.blob.size)}
          </span>
        </div>

        {/* Action Triggers */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => downloadBlob(result.blob, result.name)}
            className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-[var(--success)] px-7 text-sm font-extrabold text-[var(--primary-foreground)] shadow-md transition-all hover:opacity-90"
          >
            <Download className="size-5" />
            <span>Download Again</span>
          </button>

          <button
            type="button"
            onClick={onResetWorkspace}
            className="inline-flex h-12 items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-6 text-sm font-bold text-[var(--foreground)] shadow-2xs transition-colors hover:bg-[var(--surface)]"
          >
            <RotateCcw className="size-5 text-[var(--primary)]" />
            <span>Start New Document</span>
          </button>
        </div>
      </div>
    </section>
  );
}
