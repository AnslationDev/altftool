"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Download,
  FileText,
  Files,
  GripVertical,
  Trash2,
  Upload,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import Features from "./Features";

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
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdf.getPageCount();
}

/*  Merge PDFs */
const mergePdfs = async (files) => {
  try {
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
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center justify-between p-3 bg-(--background) rounded-lg border border-(--border) hover:bg-(--background)/60 transition"
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-(--muted-foreground)" />
        <FileText className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-(--foreground)">
            {file.file.name}
          </p>
          <p className="text-xs text-(--muted-foreground)">
            {(file.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      <button
        onClick={() => onRemove(file.id)}
        className="p-2 rounded hover:bg-(--card) cursor-pointer hover:text-red-500"
      >
        <Trash2 className="h-4 w-4  " />
      </button>
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
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Add at least two PDF files to prepare a merged output.");
  const [result, setResult] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFilesAdded = async (newFiles) => {
    if (!newFiles.length) {
      setError("Please select valid PDF files.");
      return;
    }

    try {
      const filesWithId = await Promise.all(newFiles.map(async (file) => ({
        id: uuidv4(),
        file,
        pages: await readPdfPageCount(file),
      })));
      const queuedFiles = [...files, ...filesWithId];
      setFiles(queuedFiles);
      setError("");
      setResult(null);
      setStatus(`${queuedFiles.length} files queued for merging.`);
    } catch {
      setError("Could not read one of the selected PDFs. Password-protected or damaged files may not be supported.");
      setStatus("PDF read failed.");
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

    try {
      const merged = await mergePdfs(files.map((f) => f.file));
      const filename = `merged-${Date.now()}.pdf`;
      setResult({ ...merged, filename });
      setStatus(`Merged PDF ready: ${files.length} files, ${merged.pageCount} pages, ${formatBytes(merged.blob.size)}.`);
    } catch {
      setError("Failed to merge PDFs.");
      setStatus("Merge failed.");
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages = files.reduce((sum, item) => sum + (item.pages || 0), 0);

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
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 p-4 rounded-lg">
          {error}
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
              className="text-sm text-(--muted-foreground) hover:text-red-500 cursor-pointer"
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
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                />
                <p className="mt-1 pl-10 text-xs text-(--muted-foreground)">
                  {file.pages} page{file.pages === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Button */}
      <div className="bg-(--card) p-6 rounded-2xl border border-(--border) flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <pre
          data-testid="tool-output"
          className="min-h-[96px] flex-1 whitespace-pre-wrap rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--foreground)"
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
          disabled={files.length < 2 || isMerging}
          className="bg-(--primary) text-(--primary-foreground) px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Files className="h-4 w-4" />
          {isMerging ? "Merging..." : "Merge Files"}
        </button>
        {result && (
          <button
            type="button"
            onClick={() => downloadBlob(result.blob, result.filename)}
            className="border border-(--border) bg-(--background) text-(--foreground) px-6 py-2 rounded-lg flex items-center gap-2 hover:border-(--primary)"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
        {result && <CheckCircle className="hidden h-5 w-5 text-green-600 sm:block" />}
      </div>
      <Features/>
    </div>
  );
}
