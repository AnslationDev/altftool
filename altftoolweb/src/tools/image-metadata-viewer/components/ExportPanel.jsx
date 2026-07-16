"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Table, Clipboard, Check } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function formatMetadataForTXT(metadata, colorPalette, dominantColor, privacyAnalysis, fileName) {
  let output = `Image Metadata Report\n`;
  output += `${"=".repeat(40)}\n`;
  output += `File: ${fileName}\n`;
  output += `Generated: ${new Date().toLocaleString()}\n\n`;

  const sections = [
    { title: "Camera", rows: metadata?.camera },
    { title: "Exposure", rows: metadata?.exposure },
    { title: "GPS", rows: metadata?.gps },
    { title: "Dates", rows: metadata?.dates },
    { title: "Software", rows: metadata?.software },
  ];

  for (const section of sections) {
    if (section.rows && section.rows.length > 0) {
      output += `${section.title}\n`;
      output += `${"-".repeat(30)}\n`;
      for (const row of section.rows) {
        output += `  ${row.name}: ${row.value}\n`;
      }
      output += "\n";
    }
  }

  if (colorPalette && colorPalette.length > 0) {
    output += `Color Palette\n`;
    output += `${"-".repeat(30)}\n`;
    output += `  Dominant: ${dominantColor}\n`;
    output += `  Colors: ${colorPalette.join(", ")}\n\n`;
  }

  if (privacyAnalysis) {
    output += `Privacy Analysis\n`;
    output += `${"-".repeat(30)}\n`;
    output += `  Risks: ${privacyAnalysis.risks?.length || 0}\n`;
    if (privacyAnalysis.risks) {
      for (const risk of privacyAnalysis.risks) {
        output += `  [${risk.level.toUpperCase()}] ${risk.label}: ${risk.detail}\n`;
      }
    }
    output += "\n";
  }

  return output;
}

function formatMetadataForCSV(metadata) {
  let output = "Section,Field,Value\n";

  const sections = [
    { name: "Camera", rows: metadata?.camera },
    { name: "Exposure", rows: metadata?.exposure },
    { name: "GPS", rows: metadata?.gps },
    { name: "Dates", rows: metadata?.dates },
    { name: "Software", rows: metadata?.software },
  ];

  for (const section of sections) {
    if (section.rows) {
      for (const row of section.rows) {
        const escapedName = `"${String(row.name).replace(/"/g, '""')}"`;
        const escapedValue = `"${String(row.value).replace(/"/g, '""')}"`;
        output += `${section.name},${escapedName},${escapedValue}\n`;
      }
    }
  }

  return output;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPanel({
  metadata,
  colorPalette,
  dominantColor,
  privacyAnalysis,
  fileName,
}) {
  const [copiedFormat, setCopiedFormat] = useState("");

  if (!metadata) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">
        Upload an image to enable export options.
      </div>
    );
  }

  const safeFileName = (fileName || "image").replace(/\.[^.]+$/, "");

  const handleExportJSON = () => {
    const data = {
      fileName,
      metadata: {
        camera: metadata.camera,
        exposure: metadata.exposure,
        gps: metadata.gps,
        dates: metadata.dates,
        software: metadata.software,
      },
      colors: { palette: colorPalette, dominant: dominantColor },
      privacy: privacyAnalysis,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      JSON.stringify(data, null, 2),
      `${safeFileName}-metadata.json`,
      "application/json"
    );
  };

  const handleExportTXT = () => {
    const content = formatMetadataForTXT(
      metadata,
      colorPalette,
      dominantColor,
      privacyAnalysis,
      fileName
    );
    downloadFile(content, `${safeFileName}-metadata.txt`, "text/plain");
  };

  const handleExportCSV = () => {
    const content = formatMetadataForCSV(metadata);
    downloadFile(content, `${safeFileName}-metadata.csv`, "text/csv");
  };

  const handleCopyJSON = async () => {
    const data = {
      fileName,
      metadata: {
        camera: metadata.camera,
        exposure: metadata.exposure,
        gps: metadata.gps,
        dates: metadata.dates,
        software: metadata.software,
      },
      colors: { palette: colorPalette, dominant: dominantColor },
      privacy: privacyAnalysis,
    };
    const success = await safeCopyText(JSON.stringify(data, null, 2));
    if (success) {
      setCopiedFormat("json");
      setTimeout(() => setCopiedFormat(""), 1500);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Export Metadata
        </h3>
        <p className="mb-4 text-xs text-[var(--muted-foreground)]">
          Download the extracted metadata in your preferred format.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleExportJSON}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
        >
          <FileJson className="h-4 w-4 text-[var(--primary)]" />
          JSON
        </button>
        <button
          type="button"
          onClick={handleExportTXT}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
        >
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          TXT
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
        >
          <Table className="h-4 w-4 text-[var(--primary)]" />
          CSV
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopyJSON}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors duration-150 hover:opacity-90"
      >
        {copiedFormat === "json" ? (
          <>
            <Check className="h-4 w-4" />
            Copied to Clipboard
          </>
        ) : (
          <>
            <Clipboard className="h-4 w-4" />
            Copy to Clipboard
          </>
        )}
      </button>
    </div>
  );
}
