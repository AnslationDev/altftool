"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clipboard,
  Download,
  FileText,
  Files,
  GripVertical,
  Loader2,
  PackageCheck,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import Features from "./Features";

let pdfDocumentPromise;

function loadPdfDocument() {
  pdfDocumentPromise ||= import("pdf-lib").then((module) => module.PDFDocument);
  return pdfDocumentPromise;
}

const MAX_PDF_FILES = 20;
const MAX_PDF_BYTES = 80 * 1024 * 1024;

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
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

async function readPdfPageCount(file) {
  const PDFDocument = await loadPdfDocument();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdf.getPageCount();
}

function buildMergeManifest(files, result, status) {
  return [
    "PDF Merge Manifest",
    `Status: ${result ? "Merged PDF ready" : status}`,
    `Files: ${files.length}`,
    `Pages: ${files.reduce((sum, item) => sum + (item.pages || 0), 0)}`,
    result ? `Output: ${result.filename} (${formatBytes(result.blob.size)})` : "Output: Not generated yet",
    "",
    "Input order:",
    ...files.map(
      (item, index) =>
        `${index + 1}. ${item.file.name} - ${item.pages || 0} page${item.pages === 1 ? "" : "s"} - ${formatBytes(item.file.size)}`,
    ),
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ].join("\n");
}

/*  Merge PDFs */
const mergePdfs = async (files) => {
  try {
    const PDFDocument = await loadPdfDocument();
    const mergedPdf = await PDFDocument.create();
    let pageCount = 0;

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      pageCount += copiedPages.length;
    }

    const pdfBytes = await mergedPdf.save();
    return {
      blob: new Blob([pdfBytes], { type: "application/pdf" }),
      pageCount,
    };
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw new Error("Failed to merge PDFs.");
  }
};

/*  Draggable Item  */
const DraggableFileItem = ({
  file,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  canMoveUp,
  canMoveDown,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) p-3 transition hover:bg-(--background)/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <GripVertical className="hidden h-4 w-4 shrink-0 text-(--muted-foreground) sm:block" />
        <FileText className="h-5 w-5 shrink-0 text-red-500" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-(--foreground)">
            {file.file.name}
          </p>
          <p className="text-xs text-(--muted-foreground)">
            {formatBytes(file.file.size)} • {file.pages} page{file.pages === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={!canMoveUp}
          className="flex h-11 w-11 items-center justify-center rounded text-(--muted-foreground) hover:bg-(--card) hover:text-(--foreground) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-9 sm:w-9"
          aria-label={`Move ${file.file.name} up`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={!canMoveDown}
          className="flex h-11 w-11 items-center justify-center rounded text-(--muted-foreground) hover:bg-(--card) hover:text-(--foreground) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-9 sm:w-9"
          aria-label={`Move ${file.file.name} down`}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          className="flex h-11 w-11 items-center justify-center rounded text-(--muted-foreground) hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-9 sm:w-9"
          aria-label={`Remove ${file.file.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/*  Dropzone  */
const PDFDropzone = ({ onFilesAdded }) => {
  const onDrop = (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );
    onFilesAdded(pdfFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer bg-(--background) transition
        ${
          isDragActive
            ? "border-(--primary) bg-(--primary)/10"
            : "border-(--border) hover:border-(--primary)"
        }`}
    >
      <input {...getInputProps({ "data-testid": "pdf-merger-file-input" })} />
      <div className="flex flex-col items-center gap-3">
        <Upload className="h-8 w-8 text-(--muted-foreground)" />
        <p className="font-medium text-(--foreground)">
          {isDragActive ? "Drop PDFs here" : "Drag & drop PDF files here"}
        </p>
        <p className="text-sm text-(--muted-foreground)">or click to browse</p>
      </div>
    </div>
  );
};

/*  Main Component */
export default function MainComponent() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Add at least two PDF files to prepare a merged output.");
  const [result, setResult] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [copied, setCopied] = useState(false);

  const handleFilesAdded = async (newFiles) => {
    const validFiles = newFiles.filter((file) => file.size <= MAX_PDF_BYTES);
    const availableSlots = Math.max(0, MAX_PDF_FILES - files.length);
    const filesToRead = validFiles.slice(0, availableSlots);
    const skippedCount = newFiles.length - filesToRead.length;

    if (!filesToRead.length) {
      setError("Please select valid PDF files.");
      return;
    }

    setIsReading(true);
    setProgress({ done: 0, total: filesToRead.length });
    setStatus("Reading PDF page counts...");

    try {
      const filesWithId = [];
      for (let index = 0; index < filesToRead.length; index += 1) {
        const file = filesToRead[index];
        filesWithId.push({
          id: uuidv4(),
          file,
          pages: await readPdfPageCount(file),
        });
        setProgress({ done: index + 1, total: filesToRead.length });
      }
      const queuedFiles = [...files, ...filesWithId];
      setFiles(queuedFiles);
      setError("");
      setResult(null);
      setCopied(false);
      setStatus(
        `${queuedFiles.length} file${queuedFiles.length === 1 ? "" : "s"} queued for merging.${
          skippedCount ? ` ${skippedCount} file${skippedCount === 1 ? "" : "s"} skipped by size or queue limit.` : ""
        }`,
      );
    } catch {
      setError("Could not read one of the selected PDFs. Password-protected or damaged files may not be supported.");
      setStatus("PDF read failed.");
    } finally {
      setIsReading(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const handleRemoveFile = (id) => {
    const queuedFiles = files.filter((f) => f.id !== id);
    setFiles(queuedFiles);
    setResult(null);
    setStatus(
      queuedFiles.length
        ? `${queuedFiles.length} file${queuedFiles.length === 1 ? "" : "s"} queued for merging.`
        : "Add at least two PDF files to prepare a merged output.",
    );
  };

  const handleClearAll = () => {
    setFiles([]);
    setResult(null);
    setError("");
    setCopied(false);
    setProgress({ done: 0, total: 0 });
    setStatus("Add at least two PDF files to prepare a merged output.");
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...files];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setFiles(updated);
    setDraggedIndex(null);
    setResult(null);
    setStatus("File order updated. Merge again to refresh output.");
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFiles(updated);
    setResult(null);
    setStatus("File order updated. Merge again to refresh output.");
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files.");
      return;
    }

    setIsMerging(true);
    setError("");
    setResult(null);
    setStatus("Merging PDF pages locally...");
    setProgress({ done: 0, total: files.length });

    try {
      const merged = await mergePdfs(files.map((f) => f.file));
      const filename = `merged-${Date.now()}.pdf`;
      setResult({ ...merged, filename });
      setProgress({ done: files.length, total: files.length });
      setStatus(`Merged PDF ready: ${files.length} files, ${merged.pageCount} pages, ${formatBytes(merged.blob.size)}.`);
    } catch {
      setError("Failed to merge PDFs.");
      setStatus("Merge failed.");
    } finally {
      setIsMerging(false);
      window.setTimeout(() => setProgress({ done: 0, total: 0 }), 500);
    }
  };

  const totalPages = files.reduce((sum, item) => sum + (item.pages || 0), 0);
  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const manifest = useMemo(() => buildMergeManifest(files, result, status), [files, result, status]);

  const copyManifest = async () => {
    if (!files.length) {
      setError("Add PDF files before copying a manifest.");
      return;
    }
    const success = await safeCopyText(manifest);
    if (!success) {
      setError("Could not copy the merge manifest in this browser.");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const downloadManifest = () => {
    if (!files.length) return;
    downloadBlob(
      new Blob([manifest], { type: "text/plain;charset=utf-8" }),
      result?.filename?.replace(/\.pdf$/i, "-manifest.txt") || "pdf-merge-manifest.txt",
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className=" px-6 rounded-2xl flex justify-center items-center flex-col ">
        <h2 className="heading text-center">PDF Merger</h2>
        <p className="description text-center mt-3">
          Merge multiple PDF files quickly into a single document.
        </p>
      </div>

      {/* Dropzone */}
      <div className="bg-(--card) p-6 rounded-2xl border border-(--border)">
        <PDFDropzone onFilesAdded={handleFilesAdded} />
        <p className="mt-3 text-center text-xs text-(--muted-foreground)">
          Up to {MAX_PDF_FILES} PDFs per batch, {formatBytes(MAX_PDF_BYTES)} each. Processing stays in your browser.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger-soft p-4 text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {(isReading || isMerging || status) && (
        <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
          {isReading || isMerging ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <p className="font-medium">{status}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Files", files.length, `${MAX_PDF_FILES} max`],
          ["Pages", totalPages, "Queued total"],
          ["Source size", formatBytes(totalSize), "Before merge"],
          ["Output", result ? formatBytes(result.blob.size) : "Pending", result ? "Ready" : "Not generated"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-lg border border-(--border) bg-(--card) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">{label}</p>
            <p className="mt-2 text-xl font-bold text-(--foreground)">{value}</p>
            <p className="mt-1 text-xs text-(--muted-foreground)">{detail}</p>
          </div>
        ))}
      </div>

      {progress.total > 0 && (
        <div className="rounded-lg border border-(--border) bg-(--card) p-4">
          <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
            <span>{isReading ? "Reading files" : "Merging files"}</span>
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

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-(--card) p-6 rounded-2xl border border-(--border)">
          <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-(--foreground)">
                  Files ({files.length})
                </h3>
            <button
              onClick={handleClearAll}
              className="min-h-11 rounded px-2 text-sm text-(--muted-foreground) hover:text-danger cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 ">
            {files.map((file, index) => (
              <div className=""
                key={file.id}
                onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <DraggableFileItem
                    file={file}
                    index={index}
                    onRemove={handleRemoveFile}
                    onMoveUp={(currentIndex) => moveFile(currentIndex, currentIndex - 1)}
                    onMoveDown={(currentIndex) => moveFile(currentIndex, currentIndex + 1)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    canMoveUp={index > 0}
                    canMoveDown={index < files.length - 1}
                  />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Button */}
      <div className="bg-(--card) p-6 rounded-2xl border border-(--border) flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <pre
          data-testid="tool-output"
          className="min-h-[96px] flex-1 whitespace-pre-wrap rounded-xl ring-1 ring-(--border) bg-(--card) p-3 text-sm leading-6 text-(--foreground)"
        >
          {[
            result ? "Merged PDF ready" : status,
            `Files: ${files.length}`,
            `Pages: ${totalPages}`,
            result ? `Output: ${formatBytes(result.blob.size)}` : "Output: Not generated yet",
            error ? `Error: ${error}` : "",
          ].filter(Boolean).join("\n")}
        </pre>
        <button
          type="button"
          onClick={handleMerge}
          disabled={files.length < 2 || isMerging || isReading}
          className="bg-(--primary) text-(--primary-foreground) min-h-11 px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
        >
          {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Files className="h-4 w-4" />}
          {isMerging ? "Merging..." : "Merge Files"}
        </button>
        <button
          type="button"
          onClick={copyManifest}
          disabled={!files.length}
          className="border border-(--border) bg-(--background) text-(--foreground) min-h-11 px-6 py-2 rounded-lg flex items-center gap-2 transition hover:border-(--primary) disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
        >
          <Clipboard className="h-4 w-4" />
          {copied ? "Copied" : "Copy Manifest"}
        </button>
        <button
          type="button"
          onClick={downloadManifest}
          disabled={!files.length}
          className="border border-(--border) bg-(--background) text-(--foreground) min-h-11 px-6 py-2 rounded-lg flex items-center gap-2 transition hover:border-(--primary) disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
        >
          <PackageCheck className="h-4 w-4" />
          Export Manifest
        </button>
        {result && (
          <button
            type="button"
            onClick={() => downloadBlob(result.blob, result.filename)}
            className="border border-(--border) bg-(--background) text-(--foreground) min-h-11 px-6 py-2 rounded-lg flex items-center gap-2 transition hover:border-(--primary) active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
        <button type="button" onClick={handleClearAll} className="border border-(--border) bg-(--background) text-(--foreground) min-h-11 px-6 py-2 rounded-lg flex items-center gap-2 transition hover:border-(--primary) active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35">
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        {result && <CheckCircle className="hidden h-5 w-5 text-green-600 sm:block" />}
      </div>
      <Features/>
    </div>
  );
}
