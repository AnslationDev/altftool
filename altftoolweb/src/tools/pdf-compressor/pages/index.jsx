"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FileDown, Upload, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";

// Matches the "Supports PDF files up to 100MB" copy below — actually enforced,
// not just a number on the page.
const MAX_FILE_BYTES = 100 * 1024 * 1024;

// Caps how large a single rasterized page can get so an unusually large PDF
// page can't stall the tab with a multi-hundred-megapixel canvas.
const EXPORT_MAX_EDGE = 3000;

// Quality controls both the render resolution (scale relative to the PDF's
// native 72dpi points) and the JPEG re-encode quality used per page, so the
// three buttons actually produce three different, quality-appropriate
// outputs instead of identical bytes.
const QUALITY_MAP = {
  low: { scale: 1, jpegQuality: 0.5 },
  medium: { scale: 1.5, jpegQuality: 0.72 },
  high: { scale: 2, jpegQuality: 0.88 },
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  // The public worker is pinned to the exact dependency version and guarded
  // by pdfAssets.test.mjs. Reusing it avoids bundling a second 1.2 MiB worker
  // into the Amplify compute artifact.
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  return pdfjs;
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not create the compressed image."))),
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Real compression: every page is rasterized through pdf.js at a
 * quality-dependent resolution, re-encoded as a JPEG at a quality-dependent
 * ratio, and reassembled into a brand-new PDF with pdf-lib — the same
 * rasterize-and-rebuild approach already used elsewhere in this codebase
 * (src/tools/permanent-pdf-image-redactor) to produce a genuinely different
 * output file rather than a byte-for-byte copy of the input. Original
 * document metadata (author, producer, creation tool, etc.) is not carried
 * over because the output is an entirely new PDFDocument.
 *
 * Trade-off, by design: pages become flattened JPEG images, so the result is
 * no longer text-searchable/selectable. That is disclosed in the tool's UI
 * copy rather than left implicit.
 */
async function compressPdf(file, quality, onProgress) {
  const { scale, jpegQuality } = QUALITY_MAP[quality] ?? QUALITY_MAP.medium;
  const [pdfjs, { PDFDocument }] = await Promise.all([getPdfJs(), import("pdf-lib")]);

  const sourceBytes = await file.arrayBuffer();
  let sourceDocument = null;
  try {
    sourceDocument = await pdfjs.getDocument({ data: sourceBytes.slice(0) }).promise;
    const outputDocument = await PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= sourceDocument.numPages; pageNumber += 1) {
      onProgress?.(pageNumber, sourceDocument.numPages);
      const page = await sourceDocument.getPage(pageNumber);
      try {
        const baseViewport = page.getViewport({ scale: 1 });
        const safeScale = Math.max(
          0.1,
          Math.min(scale, EXPORT_MAX_EDGE / Math.max(baseViewport.width, baseViewport.height)),
        );
        const viewport = page.getViewport({ scale: safeScale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport }).promise;

        const jpegBlob = await canvasToJpegBlob(canvas, jpegQuality);
        const jpegBytes = await jpegBlob.arrayBuffer();
        const embeddedImage = await outputDocument.embedJpg(jpegBytes);
        const outputPage = outputDocument.addPage([baseViewport.width, baseViewport.height]);
        outputPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: baseViewport.width,
          height: baseViewport.height,
        });

        canvas.width = 1;
        canvas.height = 1;
      } finally {
        page.cleanup();
      }
    }

    const outputBytes = await outputDocument.save({ useObjectStreams: true });
    return new Blob([outputBytes], { type: "application/pdf" });
  } finally {
    if (sourceDocument) await sourceDocument.destroy();
  }
}

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState("medium");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [resultSize, setResultSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const fileInputRef = useRef(null);
  const resultUrlRef = useRef(null);

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  // Revoke whatever object URL is live when the component unmounts, so a
  // navigation away mid-session doesn't leak the last blob indefinitely.
  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    [],
  );

  const clearResultUrl = useCallback(() => {
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const handleFile = useCallback(
    (f) => {
      if (!f) return;
      if (f.type !== "application/pdf") {
        setMessage("Please select a valid PDF file.");
        setStatus("error");
        return;
      }
      if (f.size > MAX_FILE_BYTES) {
        setMessage(`"${f.name}" is ${formatBytes(f.size)}. This tool supports PDF files up to 100MB.`);
        setStatus("error");
        return;
      }
      clearResultUrl();
      setFile(f);
      setOriginalSize(f.size);
      setStatus("idle");
      setMessage("");
      setResultSize(null);
    },
    [clearResultUrl],
  );

  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0] ?? null);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files?.[0] ?? null);
    },
    [handleFile],
  );

  const compress = useCallback(async () => {
    if (!file) return;
    clearResultUrl();
    setStatus("loading");
    setMessage("Compressing PDF...");
    try {
      const blob = await compressPdf(file, quality, (pageNumber, totalPages) => {
        if (totalPages > 1) setMessage(`Compressing page ${pageNumber} of ${totalPages}...`);
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setStatus("done");
      setMessage(
        blob.size < file.size
          ? `Compression complete. Result: ${formatBytes(blob.size)}`
          : `Done. This file was already efficient, so the result (${formatBytes(blob.size)}) did not shrink further.`,
      );
    } catch (err) {
      setStatus("error");
      setMessage("Compression failed: " + (err?.message || "Please try another file."));
    }
  }, [file, quality, clearResultUrl]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <FileDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">PDF Compressor</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">PDF Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reduce PDF file size while preserving quality. Runs entirely in your browser.</p>
            </div>
          </div>
        </section>

        {/* Upload */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm"
          onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-surface-soft"}`}
          >
            <Upload className={`h-8 w-8 ${file ? "text-primary" : "text-muted-foreground"}`} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatBytes(originalSize)}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Drop PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports PDF files up to 100MB</p>
              </div>
            )}
          </button>
        </div>

        {/* Quality selector */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">Compression Quality</p>
          <div className="grid grid-cols-3 gap-3">
            {[["low","Low Quality","Smallest file size"], ["medium","Balanced","Recommended"], ["high","High Quality","Best appearance"]].map(([k,l,d]) => (
              <button key={k} type="button" onClick={() => setQuality(k)}
                aria-pressed={quality === k}
                className={`rounded-lg border p-3 text-left transition-colors ${quality === k ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                <div className="text-xs font-bold">{l}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{d}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Compression rebuilds the PDF from flattened, re-encoded page images, so the output is no longer text-searchable or selectable.
          </p>
        </div>

        {/* Action */}
        <button onClick={compress} disabled={!file || status === "loading"}
          aria-busy={status === "loading"}
          className="w-full rounded-xl bg-primary text-white py-3 font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing...</> : <><FileDown className="h-4 w-4" /> Compress PDF</>}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {status === "loading" ? message : ""}
        </span>

        {/* Result */}
        {status === "done" && resultUrl && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-success bg-success-soft p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Compression complete</p>
                <p className="text-xs text-muted-foreground">{formatBytes(originalSize)} → {formatBytes(resultSize)}</p>
              </div>
            </div>
            <a href={resultUrl} download={`compressed_${file?.name}`}
              className="rounded-lg bg-success text-white px-4 py-2 text-xs font-semibold hover:bg-success/90 transition-colors">
              Download
            </a>
          </div>
        )}
        {status === "error" && (
          <div role="alert" className="rounded-xl border border-danger bg-danger-soft p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-danger shrink-0" />
            <p className="text-sm text-danger">{message}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">All processing happens locally in your browser. No files are uploaded to any server.</p>
        </div>
      </div>
    </div>
  );
}
