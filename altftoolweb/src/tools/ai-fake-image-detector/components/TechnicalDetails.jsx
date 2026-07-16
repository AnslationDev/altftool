"use client";

import { FileText, Info } from "lucide-react";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function TechnicalDetails({ technicalInfo }) {
  if (!technicalInfo) return null;

  const rows = [
    { label: "File Name", value: technicalInfo.fileName || "—" },
    { label: "File Size", value: formatFileSize(technicalInfo.fileSize) },
    { label: "File Type", value: technicalInfo.fileType || "—" },
    {
      label: "Dimensions",
      value: technicalInfo.dimensions
        ? `${technicalInfo.dimensions.width} x ${technicalInfo.dimensions.height} px`
        : "—",
    },
    { label: "Aspect Ratio", value: technicalInfo.aspectRatio || "—" },
    { label: "EXIF Data", value: technicalInfo.hasExif ? "Present" : "Not Found" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">File Properties</h3>
        </div>
        <div className="mt-4 divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-[var(--muted-foreground)]">{row.label}</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {technicalInfo.exifSummary && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-base font-semibold text-[var(--foreground)]">EXIF Summary</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {technicalInfo.exifSummary}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--primary)]" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">Analysis Metadata</h3>
        </div>
        <div className="mt-4 divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-[var(--muted-foreground)]">Processing</span>
            <span className="text-sm font-medium text-[var(--foreground)]">Client-side</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-[var(--muted-foreground)]">Checks Performed</span>
            <span className="text-sm font-medium text-[var(--foreground)]">8 analysis modules</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-[var(--muted-foreground)]">Data Upload</span>
            <span className="text-sm font-medium text-green-600">None (local processing)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
