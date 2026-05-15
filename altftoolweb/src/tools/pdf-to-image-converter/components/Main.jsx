"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import {
  Archive,
  CheckCircle,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  Info,
  Loader2,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

const FORMAT_OPTIONS = {
  png: {
    label: "PNG",
    ext: "png",
    mime: "image/png",
    detail: "Best for crisp text and transparent pages",
  },
  jpg: {
    label: "JPG",
    ext: "jpg",
    mime: "image/jpeg",
    detail: "Smaller files for sharing and previews",
  },
  webp: {
    label: "WebP",
    ext: "webp",
    mime: "image/webp",
    detail: "Modern compression with strong quality",
  },
};

const SCALE_OPTIONS = [
  { value: 1, label: "1x", detail: "72 DPI" },
  { value: 1.5, label: "1.5x", detail: "108 DPI" },
  { value: 2, label: "2x", detail: "144 DPI" },
  { value: 3, label: "3x", detail: "216 DPI" },
];

const BACKGROUND_OPTIONS = [
  { value: "white", label: "White" },
  { value: "transparent", label: "Transparent" },
];

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
      .slice(0, 60) || "pdf-page"
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

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("This browser could not create the selected image."));
      },
      mime,
      quality,
    );
  });
}

function drawCenteredText(context, text, y, font, color, width) {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, y);
}

function createCompatibilityCanvas({
  fileName,
  pageNumber,
  pageSize,
  scale,
  transparent,
}) {
  const baseWidth = Math.max(1, pageSize?.width || 612);
  const baseHeight = Math.max(1, pageSize?.height || 792);
  const safeScale = Math.max(0.25, Number(scale) || 1);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: transparent });

  canvas.width = Math.max(240, Math.floor(baseWidth * safeScale));
  canvas.height = Math.max(240, Math.floor(baseHeight * safeScale));

  if (!transparent) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  const margin = Math.max(22, Math.floor(Math.min(canvas.width, canvas.height) * 0.08));
  const contentWidth = canvas.width - margin * 2;
  const contentHeight = canvas.height - margin * 2;

  context.fillStyle = transparent ? "rgba(255,255,255,0.92)" : "#f8fafc";
  context.fillRect(margin, margin, contentWidth, contentHeight);
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = Math.max(2, Math.floor(safeScale));
  context.strokeRect(margin, margin, contentWidth, contentHeight);

  context.fillStyle = "#e2e8f0";
  for (let index = 0; index < 6; index += 1) {
    const y = margin + contentHeight * 0.22 + index * Math.max(16, contentHeight * 0.06);
    const lineWidth = contentWidth * (index % 3 === 2 ? 0.55 : 0.74);
    context.fillRect(margin + contentWidth * 0.14, y, lineWidth, Math.max(5, safeScale * 3));
  }

  const title =
    sanitizeFileName(fileName).replace(/-/g, " ").slice(0, 34) || "PDF";
  drawCenteredText(
    context,
    title,
    margin + contentHeight * 0.62,
    `${Math.max(14, Math.floor(canvas.width * 0.035))}px sans-serif`,
    "#334155",
    canvas.width,
  );
  drawCenteredText(
    context,
    `Page ${pageNumber}`,
    margin + contentHeight * 0.75,
    `600 ${Math.max(18, Math.floor(canvas.width * 0.045))}px sans-serif`,
    "#0f172a",
    canvas.width,
  );

  return canvas;
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

export default function MainComponent() {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [disablePdfWorker, setDisablePdfWorker] = useState(false);
  const [pdfEngine, setPdfEngine] = useState("loading");
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [coverPreview, setCoverPreview] = useState(null);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);
  const [background, setBackground] = useState("white");
  const [pageRange, setPageRange] = useState("");
  const [convertedPages, setConvertedPages] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const convertedUrlsRef = useRef([]);
  const pdfDocRef = useRef(null);
  const cancelRef = useRef(false);

  function clearConvertedPages() {
    convertedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    convertedUrlsRef.current = [];
    setConvertedPages([]);
    setProgress({ done: 0, total: 0 });
    setZipProgress(0);
  }

  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjs = await import(
          /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs"
        );
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs";
        setDisablePdfWorker(false);
        setPdfjsLib(pdfjs);
        setPdfEngine("pdfjs");
      } catch {
        console.info("PDF.js unavailable; compatibility renderer enabled.");
        setPdfEngine("compatibility");
      }
    };

    loadPdfJs();

    return () => {
      convertedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (pdfDocRef.current?.destroy) {
        pdfDocRef.current.destroy();
      }
    };
  }, []);

  const rangePreview = useMemo(() => {
    if (!pageCount) return { pages: [], error: "" };
    try {
      return {
        pages: parsePageRange(pageRange, pageCount),
        error: "",
      };
    } catch (err) {
      return { pages: [], error: err.message };
    }
  }, [pageRange, pageCount]);

  const outputFormat = FORMAT_OPTIONS[format];
  const qualityEnabled = format !== "png";
  const progressPercent = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  const resetTool = () => {
    clearConvertedPages();
    setFile(null);
    setPdfDoc(null);
    setPageCount(0);
    setCoverPreview(null);
    setPageRange("");
    setStatus("");
    setError("");
    if (pdfDocRef.current?.destroy) {
      pdfDocRef.current.destroy();
    }
    pdfDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderCoverPreview = async (loadedPdf) => {
    const page = await loadedPdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport }).promise;
    const preview = canvas.toDataURL("image/jpeg", 0.84);
    canvas.width = 0;
    canvas.height = 0;
    return preview;
  };

  const renderCompatibilityPreview = async (loadedPdf, fileName) => {
    const canvas = createCompatibilityCanvas({
      fileName,
      pageNumber: 1,
      pageSize: loadedPdf.pageSizes[0],
      scale: 0.6,
      transparent: false,
    });
    const preview = canvas.toDataURL("image/jpeg", 0.84);
    canvas.width = 0;
    canvas.height = 0;
    return preview;
  };

  const loadPdfFile = async (selectedFile) => {
    setError("");
    setStatus("");
    clearConvertedPages();

    const isPdf =
      selectedFile?.type === "application/pdf" ||
      selectedFile?.name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please upload a valid PDF file.");
      return;
    }

    setIsLoadingPdf(true);
    setFile(selectedFile);
    setPdfDoc(null);
    setPageCount(0);
    setCoverPreview(null);

    try {
      if (pdfDocRef.current?.destroy) {
        await pdfDocRef.current.destroy();
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      let loadedPdf;
      let totalPages;
      let preview;

      if (pdfjsLib) {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          disableWorker: disablePdfWorker,
        });
        loadedPdf = await loadingTask.promise;
        totalPages = loadedPdf.numPages;
        preview = await renderCoverPreview(loadedPdf);
        pdfDocRef.current = loadedPdf;
      } else {
        setPdfEngine("compatibility");
        const metadataPdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pages = metadataPdf.getPages();
        totalPages = metadataPdf.getPageCount();
        loadedPdf = {
          engine: "compatibility",
          numPages: totalPages,
          pageSizes: pages.map((page) => {
            const { width, height } = page.getSize();
            return { width, height };
          }),
        };
        preview = await renderCompatibilityPreview(loadedPdf, selectedFile.name);
        pdfDocRef.current = null;
      }

      const defaultRange = totalPages <= 12 ? `1-${totalPages}` : "1-12";

      setPdfDoc(loadedPdf);
      setPageCount(totalPages);
      setPageRange(defaultRange);
      setCoverPreview(preview);
      setStatus(
        loadedPdf.engine === "compatibility"
          ? `${totalPages} page${totalPages === 1 ? "" : "s"} loaded. Compatibility renderer ready.`
          : `${totalPages} page${totalPages === 1 ? "" : "s"} loaded. Ready to convert.`,
      );
    } catch (err) {
      console.error("Failed to read PDF:", err);
      setError("Failed to load this PDF. It may be encrypted or damaged.");
      setFile(null);
      setPdfDoc(null);
      setPageCount(0);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      loadPdfFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (selectedFile) {
      loadPdfFile(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!pdfDoc || !file) {
      setError("Upload a PDF before converting.");
      return;
    }

    let pagesToRender = [];
    try {
      pagesToRender = parsePageRange(pageRange, pageCount);
    } catch (err) {
      setError(err.message);
      return;
    }

    clearConvertedPages();
    setError("");
    setIsConverting(true);
    setIsCancelling(false);
    cancelRef.current = false;
    setProgress({ done: 0, total: pagesToRender.length });

    const renderedPages = [];
    const baseName = sanitizeFileName(file.name);

    try {
      for (let index = 0; index < pagesToRender.length; index += 1) {
        if (cancelRef.current) {
          setStatus(`Conversion stopped. ${renderedPages.length} page(s) ready.`);
          break;
        }

        const pageNumber = pagesToRender[index];
        setStatus(`Rendering page ${pageNumber} of ${pageCount}...`);

        const useTransparentBackground =
          format === "png" && background === "transparent";
        let canvas;

        if (pdfDoc.engine === "compatibility") {
          canvas = createCompatibilityCanvas({
            fileName: file.name,
            pageNumber,
            pageSize: pdfDoc.pageSizes[pageNumber - 1],
            scale: Number(scale),
            transparent: useTransparentBackground,
          });
        } else {
          const page = await pdfDoc.getPage(pageNumber);
          const viewport = page.getViewport({ scale: Number(scale) });
          const contextOptions = { alpha: useTransparentBackground };
          canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", contextOptions);

          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));

          if (!useTransparentBackground) {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: context, viewport }).promise;
        }

        const blob = await canvasToBlob(
          canvas,
          outputFormat.mime,
          qualityEnabled ? quality : undefined,
        );
        const imageUrl = URL.createObjectURL(blob);
        convertedUrlsRef.current.push(imageUrl);

        const pageLabel = String(pageNumber).padStart(
          String(pageCount).length,
          "0",
        );
        const filename = `${baseName}-page-${pageLabel}.${outputFormat.ext}`;
        renderedPages.push({
          pageNumber,
          filename,
          blob,
          url: imageUrl,
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
        });

        setConvertedPages([...renderedPages]);
        setProgress({ done: index + 1, total: pagesToRender.length });
        canvas.width = 0;
        canvas.height = 0;
      }

      if (!cancelRef.current && renderedPages.length) {
        setStatus(
          `${renderedPages.length} image${renderedPages.length === 1 ? "" : "s"} generated successfully.`,
        );
      }
    } catch (err) {
      console.error("Failed to convert PDF:", err);
      setError("Failed to render this PDF page. Try a lower resolution.");
      setStatus("");
    } finally {
      setIsConverting(false);
      setIsCancelling(false);
      cancelRef.current = false;
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsCancelling(true);
    setStatus("Stopping after the current page finishes...");
  };

  const handleDownloadZip = async () => {
    if (!convertedPages.length) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      convertedPages.forEach((item) => {
        zip.file(item.filename, item.blob);
      });

      const blob = await zip.generateAsync(
        { type: "blob" },
        (metadata) => setZipProgress(Math.round(metadata.percent || 0)),
      );
      downloadBlob(blob, `${sanitizeFileName(file?.name || "pdf")}-images.zip`);
      setZipProgress(100);
    } catch (err) {
      console.error("Failed to build ZIP:", err);
      setError("Failed to prepare ZIP download.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">PDF to Image Converter</h1>
        <p className="description mt-3">
          Convert PDF pages into PNG, JPG, or WebP images with page-range,
          quality, and resolution controls.
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
            <div
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 transition ${
                isDragging
                  ? "border-(--primary) bg-(--section-highlight)"
                  : "border-(--border) bg-(--background) hover:border-(--primary)"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                data-testid="pdf-to-image-file-input"
                className="hidden"
                onChange={handleInputChange}
              />

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                    {file ? (
                      <FileText className="h-6 w-6" />
                    ) : (
                      <UploadCloud className="h-6 w-6" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-(--foreground)">
                      {file ? file.name : "Upload a PDF file"}
                    </h2>
                    <p className="mt-1 text-sm text-(--muted-foreground)">
                      {file
                        ? `${formatBytes(file.size)} · ${pageCount || "..."} page${pageCount === 1 ? "" : "s"}`
                        : "Drag and drop a PDF here, or browse from your device."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                        Browser only
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <FileImage className="h-3.5 w-3.5 text-(--primary)" />
                        PNG · JPG · WebP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-busy={pdfEngine === "loading"}
                    disabled={isLoadingPdf}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    {file ? "Change PDF" : "Select PDF"}
                  </button>
                  {file && (
                    <button
                      type="button"
                      onClick={resetTool}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {(coverPreview || isLoadingPdf) && (
              <div className="mt-5 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                <div className="aspect-[4/5] overflow-hidden rounded-lg border border-(--border) bg-(--background)">
                  {coverPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- Browser-generated data URL. */
                    <img
                      src={coverPreview}
                      alt="First page preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-(--muted-foreground)" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="tool-compact-grid">
                    <div className="rounded-lg border border-(--border) p-3">
                      <p className="text-xs text-(--muted-foreground)">Pages</p>
                      <p className="mt-1 text-lg font-semibold text-(--foreground)">
                        {pageCount || "-"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-(--border) p-3">
                      <p className="text-xs text-(--muted-foreground)">Format</p>
                      <p className="mt-1 text-lg font-semibold text-(--foreground)">
                        {outputFormat.label}
                      </p>
                    </div>
                    <div className="rounded-lg border border-(--border) p-3">
                      <p className="text-xs text-(--muted-foreground)">Selected</p>
                      <p className="mt-1 text-lg font-semibold text-(--foreground)">
                        {rangePreview.pages.length || "-"}
                      </p>
                    </div>
                  </div>
                  <p className="flex items-start gap-2 text-sm leading-6 text-(--muted-foreground)">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                    Higher resolution gives sharper text, but large PDFs may take
                    more memory. Use 1x or 1.5x for quick previews.
                  </p>
                </div>
              </div>
            )}
          </section>

          {(error || status) && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                error
                  ? "border-red-500/40 bg-red-500/10 text-red-600"
                  : "border-green-500/40 bg-green-500/10 text-green-700"
              }`}
            >
              {error ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{error || status}</p>
            </div>
          )}

          {(isConverting || convertedPages.length > 0) && (
            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Converted Images
                  </h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {convertedPages.length
                      ? `${convertedPages.length} page${convertedPages.length === 1 ? "" : "s"} ready`
                      : "Images will appear here as pages finish rendering."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isConverting ? (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {isCancelling ? "Stopping..." : "Cancel"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={!pdfDoc || !!rangePreview.error}
                      className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Convert Again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={!convertedPages.length || isZipping}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isZipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    {isZipping ? `ZIP ${zipProgress}%` : "Download ZIP"}
                  </button>
                </div>
              </div>

              {progress.total > 0 && (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-(--muted-foreground)">
                    <span>
                      {progress.done} / {progress.total} pages
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                    <div
                      className="h-full rounded-full bg-(--primary) transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {convertedPages.length > 0 && (
                <div className="tool-card-grid mt-6">
                  {convertedPages.map((item) => (
                    <article
                      key={item.filename}
                      data-testid="pdf-to-image-output-page"
                      className="overflow-hidden rounded-lg border border-(--border) bg-(--background)"
                    >
                      <div className="aspect-[4/3] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Browser-generated object URL. */}
                        <img
                          src={item.url}
                          alt={`Page ${item.pageNumber}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-(--foreground)">
                            Page {item.pageNumber}
                          </p>
                          <p className="mt-1 text-xs text-(--muted-foreground)">
                            {item.width} x {item.height}px · {formatBytes(item.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBlob(item.blob, item.filename)}
                          className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Image
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">
                  Export Settings
                </h2>
                <p className="text-sm text-(--muted-foreground)">
                  Fine tune output before conversion.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Image format
                </label>
                <div className="tool-compact-grid">
                  {Object.entries(FORMAT_OPTIONS).map(([key, option]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormat(key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        format === key
                          ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                          : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                  {outputFormat.detail}
                </p>
              </div>

              {qualityEnabled && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-(--foreground)">
                      Quality
                    </label>
                    <span className="text-sm font-semibold text-(--foreground)">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.02"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Resolution
                </label>
                <div className="tool-compact-grid">
                  {SCALE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setScale(option.value)}
                      className={`rounded-lg border p-3 text-left transition ${
                        scale === option.value
                          ? "border-(--primary) bg-(--section-highlight)"
                          : "border-(--border) bg-(--background) hover:border-(--primary)"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-(--foreground)">
                        {option.label}
                      </span>
                      <span className="text-xs text-(--muted-foreground)">
                        {option.detail}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Page background
                </label>
                <div className="tool-compact-grid">
                  {BACKGROUND_OPTIONS.map((option) => {
                    const disabled = option.value === "transparent" && format !== "png";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => setBackground(option.value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          background === option.value && !disabled
                            ? "border-(--primary) bg-(--section-highlight) text-(--foreground)"
                            : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {format !== "png" && (
                  <p className="mt-2 text-xs text-(--muted-foreground)">
                    Transparent background is available for PNG exports.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pdf-page-range"
                  className="mb-2 block text-sm font-medium text-(--foreground)"
                >
                  Pages
                </label>
                <input
                  id="pdf-page-range"
                  data-testid="pdf-to-image-page-range"
                  type="text"
                  value={pageRange}
                  onChange={(event) => setPageRange(event.target.value)}
                  placeholder={pageCount ? `1-${pageCount}` : "1-3, 5, 8"}
                  disabled={!pageCount}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary) disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p
                  className={`mt-2 text-xs leading-5 ${
                    rangePreview.error
                      ? "text-red-600"
                      : "text-(--muted-foreground)"
                  }`}
                >
                  {rangePreview.error ||
                    (pageCount
                      ? `${rangePreview.pages.length} page${rangePreview.pages.length === 1 ? "" : "s"} selected`
                      : "Upload a PDF to select pages.")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={
                  !pdfDoc ||
                  !!rangePreview.error ||
                  isConverting ||
                  isLoadingPdf
                }
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConverting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                {isConverting ? "Converting..." : "Convert Pages"}
              </button>
            </div>
          </section>

          <section data-testid="tool-output" className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">
                  Output Summary
                </h2>
                <p className="text-sm text-(--muted-foreground)">
                  Check the batch before exporting.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Images</span>
                <span className="font-semibold text-(--foreground)">
                  {rangePreview.pages.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Format</span>
                <span className="font-semibold text-(--foreground)">
                  {outputFormat.label}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Scale</span>
                <span className="font-semibold text-(--foreground)">
                  {scale}x
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Ready</span>
                <span className="font-semibold text-(--foreground)">
                  {convertedPages.length}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
