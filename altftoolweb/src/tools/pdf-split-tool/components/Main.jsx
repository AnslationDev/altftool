"use client";

import React, { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  Clipboard,
  Download,
  FileText,
  FileUp,
  Layers,
  Loader2,
  RefreshCw,
  Scissors,
  ShieldCheck,
  SplitSquareHorizontal,
  Trash2,
  UploadCloud,
} from "lucide-react";

const SPLIT_MODES = {
  every: {
    label: "Every Page",
    detail: "Create one PDF per page",
  },
  fixed: {
    label: "Fixed Batches",
    detail: "Split after every N pages",
  },
  custom: {
    label: "Custom Groups",
    detail: "Create files from semicolon-separated page groups",
  },
  extract: {
    label: "Extract Pages",
    detail: "Export selected pages into one PDF",
  },
  remove: {
    label: "Remove Pages",
    detail: "Export a PDF after deleting selected pages",
  },
};

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "split-pdf"
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function compressRange(numbers) {
  if (!numbers.length) return "";
  const sorted = [...numbers].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (let index = 1; index <= sorted.length; index += 1) {
    const current = sorted[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(start === previous ? String(start) : `${start}-${previous}`);
    start = current;
    previous = current;
  }

  return ranges.join(", ");
}

function parsePageRange(input, totalPages) {
  if (!totalPages) return [];
  const normalized = input.trim();
  if (!normalized) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [];
  const seen = new Set();
  const invalid = [];

  normalized.split(",").forEach((chunk) => {
    const segment = chunk.trim();
    if (!segment) return;
    const match = segment.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      invalid.push(segment);
      return;
    }

    let start = Number(match[1]);
    let end = Number(match[2] || match[1]);
    if (start > end) [start, end] = [end, start];

    if (start < 1 || end > totalPages) {
      invalid.push(segment);
      return;
    }

    for (let page = start; page <= end; page += 1) {
      if (!seen.has(page)) {
        pages.push(page);
        seen.add(page);
      }
    }
  });

  if (invalid.length) {
    throw new Error(
      `Invalid page range: ${invalid.join(", ")}. Use pages 1-${totalPages}.`,
    );
  }

  if (!pages.length) {
    throw new Error("Enter at least one page number.");
  }

  return pages;
}

function parseCustomGroups(input, totalPages) {
  const chunks = input
    .split(/[;\n]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!chunks.length) {
    throw new Error("Add custom groups like 1-3; 4,6; 7-10.");
  }

  return chunks.map((chunk, index) => {
    const pages = parsePageRange(chunk, totalPages);
    return {
      id: `part-${String(index + 1).padStart(2, "0")}`,
      label: `Part ${index + 1}`,
      pages,
    };
  });
}

function chunkPages(totalPages, batchSize) {
  const groups = [];
  for (let start = 1; start <= totalPages; start += batchSize) {
    const end = Math.min(totalPages, start + batchSize - 1);
    groups.push({
      id: `pages-${start}-${end}`,
      label: `Pages ${start}-${end}`,
      pages: Array.from({ length: end - start + 1 }, (_, index) => start + index),
    });
  }
  return groups;
}

function buildSplitPlan({ mode, totalPages, pageRange, customGroups, batchSize }) {
  if (!totalPages) return [];

  if (mode === "every") {
    return Array.from({ length: totalPages }, (_, index) => ({
      id: `page-${index + 1}`,
      label: `Page ${index + 1}`,
      pages: [index + 1],
    }));
  }

  if (mode === "fixed") {
    return chunkPages(totalPages, Math.max(1, Math.min(batchSize, totalPages)));
  }

  if (mode === "custom") {
    return parseCustomGroups(customGroups, totalPages);
  }

  if (mode === "extract") {
    const pages = parsePageRange(pageRange, totalPages);
    return [
      {
        id: `extracted-${compressRange(pages).replace(/[^a-z0-9]+/gi, "-")}`,
        label: "Extracted pages",
        pages,
      },
    ];
  }

  if (mode === "remove") {
    const removedPages = new Set(parsePageRange(pageRange, totalPages));
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
      (page) => !removedPages.has(page),
    );
    if (!pages.length) {
      throw new Error("Remove mode cannot delete every page. Keep at least one page.");
    }

    return [
      {
        id: "pages-removed",
        label: `Removed ${compressRange([...removedPages])}`,
        pages,
      },
    ];
  }

  return [];
}

function buildPlanText(file, plan, mode) {
  return [
    "PDF Split Plan",
    `File: ${file?.name || "No file selected"}`,
    `Mode: ${SPLIT_MODES[mode]?.label || mode}`,
    `Outputs: ${plan.length}`,
    ...plan.map(
      (part, index) =>
        `${index + 1}. ${part.label}: ${part.pages.length} page${part.pages.length === 1 ? "" : "s"} (${compressRange(part.pages)})`,
    ),
  ].join("\n");
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="text-xl font-bold text-(--foreground)">{value}</p>
          {detail && <p className="text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState("every");
  const [pageRange, setPageRange] = useState("1-3");
  const [customGroups, setCustomGroups] = useState("1-2; 3-4; 5");
  const [batchSize, setBatchSize] = useState(2);
  const [filenamePrefix, setFilenamePrefix] = useState("split");
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const splitPlan = useMemo(() => {
    if (!pageCount) return { parts: [], error: "" };
    try {
      return {
        parts: buildSplitPlan({
          mode,
          totalPages: pageCount,
          pageRange,
          customGroups,
          batchSize,
        }),
        error: "",
      };
    } catch (err) {
      return { parts: [], error: err.message };
    }
  }, [batchSize, customGroups, mode, pageCount, pageRange]);

  const totalOutputPages = splitPlan.parts.reduce(
    (sum, part) => sum + part.pages.length,
    0,
  );
  const canSplit =
    Boolean(file) &&
    splitPlan.parts.length > 0 &&
    !splitPlan.error &&
    !isReading &&
    !isSplitting;

  const resetTool = () => {
    setFile(null);
    setPageCount(0);
    setProgress({ done: 0, total: 0 });
    setStatus("");
    setError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const readPdf = async (nextFile) => {
    if (!nextFile) return;
    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    setIsReading(true);
    setError("");
    setStatus("Reading PDF page structure...");
    setFile(nextFile);
    setPageCount(0);
    setProgress({ done: 0, total: 0 });
    setFilenamePrefix(sanitizeFileName(nextFile.name));

    try {
      const bytes = await nextFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
      setStatus("PDF loaded. Choose a split mode and review the output plan.");
    } catch (err) {
      console.error("Failed to read PDF:", err);
      setFile(null);
      setStatus("");
      setError(
        "Could not read this PDF. Password-protected or damaged PDFs may not be supported.",
      );
    } finally {
      setIsReading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    readPdf(event.dataTransfer.files?.[0]);
  };

  const splitPdf = async () => {
    if (!canSplit) {
      setError(splitPlan.error || "Upload a PDF and select a valid split plan.");
      return;
    }

    setIsSplitting(true);
    setError("");
    setStatus("Splitting PDF pages...");
    setProgress({ done: 0, total: splitPlan.parts.length });

    try {
      const sourceBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const outputs = [];

      for (let index = 0; index < splitPlan.parts.length; index += 1) {
        const part = splitPlan.parts[index];
        const outputPdf = await PDFDocument.create();
        const copiedPages = await outputPdf.copyPages(
          sourcePdf,
          part.pages.map((page) => page - 1),
        );

        copiedPages.forEach((page) => outputPdf.addPage(page));

        if (preserveMetadata) {
          outputPdf.setTitle(`${file.name.replace(/\.[^/.]+$/, "")} - ${part.label}`);
          outputPdf.setCreator("AltFTool PDF Split Tool");
          outputPdf.setProducer("AltFTool PDF Split Tool");
          outputPdf.setCreationDate(new Date());
        }

        const bytes = await outputPdf.save();
        outputs.push({
          filename: `${sanitizeFileName(filenamePrefix)}-${String(index + 1).padStart(2, "0")}-${part.id}.pdf`,
          bytes,
        });
        setProgress({ done: index + 1, total: splitPlan.parts.length });
      }

      if (outputs.length === 1) {
        downloadBlob(
          new Blob([outputs[0].bytes], { type: "application/pdf" }),
          outputs[0].filename,
        );
      } else {
        setStatus("Packaging split PDFs into ZIP...");
        const zip = new JSZip();
        outputs.forEach((output) => zip.file(output.filename, output.bytes));
        zip.file(
          "split-plan.txt",
          buildPlanText(file, splitPlan.parts, mode),
        );
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        downloadBlob(zipBlob, `${sanitizeFileName(filenamePrefix)}-split.zip`);
      }

      setStatus(
        outputs.length === 1
          ? "PDF exported successfully."
          : `${outputs.length} split PDFs exported in a ZIP.`,
      );
    } catch (err) {
      console.error("PDF split failed:", err);
      setError("Could not split this PDF. Try fewer pages or another PDF file.");
    } finally {
      setIsSplitting(false);
    }
  };

  const copyPlan = async () => {
    if (!splitPlan.parts.length) return;
    await navigator.clipboard?.writeText(buildPlanText(file, splitPlan.parts, mode));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">PDF Split Tool</h1>
        <p className="description mt-3">
          Split PDFs by page, fixed batch size, custom ranges, extraction, or
          page removal with fast browser-side export.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Advanced PDF Splitting</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Upload one PDF, preview the exact output plan, then download a
                single PDF or a ZIP of split documents.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Output mode
            </p>
            <p className="mt-2 text-3xl font-bold text-(--primary)">
              {splitPlan.parts.length > 1 ? "ZIP" : "PDF"}
            </p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {splitPlan.parts.length || 0} output file{splitPlan.parts.length === 1 ? "" : "s"} planned.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed bg-(--card) p-6 text-center transition ${
              isDragging
                ? "border-(--primary) bg-(--section-highlight)"
                : "border-(--border) hover:border-(--primary)"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              data-testid="pdf-split-file-input"
              className="hidden"
              onChange={(event) => readPdf(event.target.files?.[0])}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
              Drop PDF here
            </h2>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Works locally for regular PDFs. Password-protected files may need
              unlocking first.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isReading || isSplitting}
            >
              {isReading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              {isReading ? "Reading PDF..." : "Choose PDF"}
            </button>
          </div>

          {file && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-(--foreground)">{file.name}</p>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {formatBytes(file.size)} • {pageCount || "Reading"} pages
                  </p>
                </div>
                <button type="button" className="btn-secondary shrink-0" onClick={resetTool}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {progress.total > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
                    <span>Progress</span>
                    <span>{progress.done}/{progress.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                    <div
                      className="h-full rounded-full bg-(--primary) transition-all"
                      style={{
                        width: `${Math.round((progress.done / progress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-(--border) bg-(--card) p-5">
            <h2 className="font-semibold text-(--foreground)">Split Settings</h2>

            <div className="mt-4 grid gap-3">
              {Object.entries(SPLIT_MODES).map(([value, option]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-lg border p-4 text-left transition ${
                    mode === value
                      ? "border-(--primary) bg-(--section-highlight)"
                      : "border-(--border) bg-(--background)"
                  }`}
                >
                  <span className="block font-semibold text-(--foreground)">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm text-(--muted-foreground)">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>

            {mode === "fixed" && (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Pages per PDF</span>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, pageCount || 999)}
                  value={batchSize}
                  onChange={(event) => setBatchSize(Math.max(1, Number(event.target.value) || 1))}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                />
              </label>
            )}

            {(mode === "extract" || mode === "remove") && (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  {mode === "remove" ? "Pages to Remove" : "Pages to Extract"}
                </span>
                <input
                  data-testid="pdf-split-page-range"
                  value={pageRange}
                  onChange={(event) => setPageRange(event.target.value)}
                  placeholder={pageCount ? `Example: 1-${Math.min(pageCount, 3)}, 7` : "Upload a PDF first"}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                />
              </label>
            )}

            {mode === "custom" && (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Custom Groups</span>
                <textarea
                  value={customGroups}
                  onChange={(event) => setCustomGroups(event.target.value)}
                  rows={4}
                  placeholder="1-3; 4,6; 7-10"
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                />
                <p className="mt-2 text-xs text-(--muted-foreground)">
                  Separate output PDFs with semicolons or new lines.
                </p>
              </label>
            )}

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">Filename Prefix</span>
              <input
                value={filenamePrefix}
                onChange={(event) => setFilenamePrefix(event.target.value)}
                placeholder="split-document"
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              />
            </label>

            <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3">
              <span className="text-sm font-medium text-(--foreground)">Add basic metadata to outputs</span>
              <input
                type="checkbox"
                checked={preserveMetadata}
                onChange={(event) => setPreserveMetadata(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={splitPdf}
                disabled={!canSplit}
              >
                {isSplitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isSplitting ? "Splitting..." : "Split PDF"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copyPlan}
                disabled={!splitPlan.parts.length}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy Plan"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {status && (
            <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              {isReading || isSplitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{status}</p>
            </div>
          )}

          {(error || splitPlan.error) && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error || splitPlan.error}</p>
            </div>
          )}

          <div className="tool-card-grid">
            <StatCard icon={FileText} label="Source Pages" value={pageCount || 0} detail="Input PDF" />
            <StatCard icon={SplitSquareHorizontal} label="Outputs" value={splitPlan.parts.length} detail={splitPlan.parts.length > 1 ? "ZIP package" : "Single PDF"} />
            <StatCard icon={Layers} label="Output Pages" value={totalOutputPages} detail="Across all files" />
            <StatCard icon={ShieldCheck} label="Processing" value="Local" detail="Browser-side split" />
          </div>

          <section data-testid="tool-output" className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Split Plan Preview</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Review output PDFs before downloading.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--muted-foreground)">
                <Archive className="h-4 w-4" />
                {splitPlan.parts.length > 1 ? "ZIP output" : "PDF output"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-(--border)">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
                  <tr>
                    <th className="px-4 py-3">Output</th>
                    <th className="px-4 py-3">Pages</th>
                    <th className="px-4 py-3">Page Count</th>
                    <th className="px-4 py-3">Filename</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {splitPlan.parts.length ? (
                    splitPlan.parts.slice(0, 80).map((part, index) => (
                      <tr key={`${part.id}-${index}`} className="bg-(--card)">
                        <td className="px-4 py-3 font-semibold text-(--foreground)">
                          {part.label}
                        </td>
                        <td className="px-4 py-3 text-(--foreground)">
                          {compressRange(part.pages)}
                        </td>
                        <td className="px-4 py-3 text-(--foreground)">
                          {part.pages.length}
                        </td>
                        <td className="px-4 py-3 text-(--muted-foreground)">
                          {sanitizeFileName(filenamePrefix)}-{String(index + 1).padStart(2, "0")}-{part.id}.pdf
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-(--card)">
                      <td className="px-4 py-8 text-center text-(--muted-foreground)" colSpan={4}>
                        Upload a PDF to generate a split plan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {splitPlan.parts.length > 80 && (
              <p className="mt-3 text-sm text-(--muted-foreground)">
                Showing first 80 outputs. The full plan will still be exported.
              </p>
            )}
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Splitting preserves page visuals and annotations copied by the PDF
              engine, but advanced bookmarks or form behavior may not be retained
              in every PDF.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
