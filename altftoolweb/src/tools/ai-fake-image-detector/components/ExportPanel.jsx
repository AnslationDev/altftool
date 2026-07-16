"use client";

import { useState } from "react";
import { Download, Printer, ClipboardCheck, Check } from "lucide-react";
import { exportToJSON, exportToPDF, copyReportToClipboard } from "../utils/exportUtils";

export default function ExportPanel({ report }) {
  const [copied, setCopied] = useState(false);
  const [jsonExported, setJsonExported] = useState(false);

  if (!report) return null;

  const handleCopy = async () => {
    const success = await copyReportToClipboard(report);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJSON = () => {
    const success = exportToJSON(report);
    if (success) {
      setJsonExported(true);
      setTimeout(() => setJsonExported(false), 2000);
    }
  };

  const handlePrint = () => {
    exportToPDF(report);
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h3 className="text-base font-semibold text-[var(--foreground)]">Export Report</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Download or share your analysis results.
      </p>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={handleJSON}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          {jsonExported ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Downloaded
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download JSON
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4" />
              Copy Summary
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
        Analysis performed entirely in your browser. No data is uploaded.
      </p>
    </div>
  );
}
