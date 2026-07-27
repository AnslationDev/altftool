"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode,
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
  costFormatter,
}) {
  const [copied, setCopied] = useState(false);

  if (!result || !report) return null;

  const handleDownloadJson = () => {
    downloadFile(
      JSON.stringify(report, null, 2),
      "llm-cost-privacy-summary.json",
      "application/json",
    );
  };

  const handleDownloadCsv = () => {
    const headers = ["Model_Index", "Request_Count", "Input_Tokens", "Output_Tokens", "Total_Tokens", "Unallocated_Tokens", "Estimated_Cost", "Priced_Requests"];
    const rows = report.modelSummaries.map((m) => [
      m.model,
      m.requestCount,
      m.inputTokens,
      m.outputTokens,
      m.totalTokens,
      m.unallocatedTokens,
      m.estimatedCost,
      m.pricedRequestCount,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csvContent, "llm-cost-privacy-report.csv", "text/csv");
  };

  const handleDownloadMarkdown = () => {
    const md = `# LLM Cost & Privacy Summary Report
Generated: ${report.generatedAt}
Format: ${report.format.toUpperCase()}

## Executive Key Metrics
- Total Requests: ${report.requestCount}
- Total Models: ${report.modelCount}
- Total Token Volume: ${report.totalTokens.toLocaleString()}
- Total Input Tokens: ${report.inputTokens.toLocaleString()}
- Total Output Tokens: ${report.outputTokens.toLocaleString()}
- Estimated Cost: ${costFormatter.format(report.estimatedCost)}
- Privacy Signals Found: ${report.privacySignalCount}

## Privacy Signal Audit
${report.privacySignals.length > 0 ? report.privacySignals.map((s) => `- ${s.label}: ${s.count}`).join("\n") : "Zero privacy signals detected."}

*Note: All processing performed 100% locally in browser. No raw log data retained.*
`;
    downloadFile(md, "llm-cost-privacy-report.md", "text/markdown");
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            <Share2 className="size-5 text-[var(--primary)]" />
            <span>Export &amp; Share Privacy Report</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Export counts-only, anonymized JSON, CSV, or Markdown reports (excludes prompt content and model names)
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
            <span>{copied ? "Copied JSON" : "Copy to Clipboard"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
