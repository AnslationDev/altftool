"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Share2,
} from "lucide-react";

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ExportCenter({
  report,
  result,
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  if (!result || !result.ok || !report) return null;

  const handleDownloadJson = () => {
    downloadFile(
      JSON.stringify(report, null, 2),
      "local-ai-readiness-summary.json",
      "application/json",
    );
  };

  const handleDownloadCsv = () => {
    const headers = ["Profile_ID", "Status", "Gap_Count"];
    const rows = report.profiles.map((p) => [p.id, p.status, p.gapCount]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csvContent, "local-ai-readiness-report.csv", "text/csv");
  };

  const handleDownloadMarkdown = () => {
    const md = `# Local AI Hardware Readiness Report
Created At: ${report.createdAt}
Hardware Assessment Scope: 100% Local / Manually Entered / Browser Diagnostics

## Summary Counts
- Profiles Assessed: ${report.counts.assessed}
- Meets Thresholds: ${report.counts.meetsThresholds}
- Close to Thresholds: ${report.counts.closeToThresholds}
- Below Thresholds: ${report.counts.belowThresholds}
- Total Input Gaps: ${report.counts.totalGaps}

## Workload Profiles Breakdown
${report.profiles.map((p) => `- ${p.id}: ${p.status.toUpperCase()} (${p.gapCount} gaps)`).join("\n")}

*Note: All assessments performed locally on client device. No hardware telemetry stored.*
`;
    downloadFile(md, "local-ai-readiness-report.md", "text/markdown");
  };

  const handleCopyClipboard = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            <Share2 className="size-5 text-[var(--primary)]" />
            <span>Export &amp; Share Readiness Assessment</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Export anonymized summary reports in JSON, CSV, or Markdown format
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition-all hover:opacity-90"
          >
            <Download className="size-4" />
            <span>JSON Summary</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-xs font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface)]"
          >
            <FileSpreadsheet className="size-4 text-[var(--primary)]" />
            <span>CSV Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-xs font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface)]"
          >
            <FileText className="size-4 text-[var(--primary)]" />
            <span>Markdown Summary</span>
          </button>

          <button
            type="button"
            onClick={handleCopyClipboard}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-xs font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface)]"
          >
            {copied ? <Check className="size-4 text-[var(--success)]" /> : <Copy className="size-4" />}
            <span>
              {copied
                ? "Copied JSON"
                : copyFailed
                  ? "Copy failed — try again"
                  : "Copy to Clipboard"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
