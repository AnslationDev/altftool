"use client";

import { useState } from "react";
import { Download, FileJson, FileText, FileType } from "lucide-react";
import { exportPDF, exportJSON, exportTXT } from "../lib/exportUtils";

const OPTIONS = [
  { id: "pdf", label: "PDF", icon: FileType },
  { id: "json", label: "JSON", icon: FileJson },
  { id: "txt", label: "TXT", icon: FileText },
];

export default function ExportMenu({ analysis, suggestions, variations }) {
  const [busy, setBusy] = useState(null);
  const disabled = !analysis.subject;

  async function handleExport(type) {
    if (disabled || busy) return;
    setBusy(type);
    try {
      if (type === "pdf") await exportPDF(analysis, { suggestions, variations });
      if (type === "json") exportJSON(analysis, { suggestions, variations });
      if (type === "txt") exportTXT(analysis, { suggestions, variations });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-(--muted-foreground)">
        <Download className="h-4 w-4" aria-hidden="true" /> Export
      </span>
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled || Boolean(busy)}
            onClick={() => handleExport(opt.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-sm font-medium text-(--foreground) transition-colors hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {busy === opt.id ? "Exporting…" : opt.label}
          </button>
        );
      })}
    </div>
  );
}
