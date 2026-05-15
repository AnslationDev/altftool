"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Download,
  FileText,
  FileType,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  ScanText,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";

const MODE_OPTIONS = {
  flow: {
    label: "Flowing Document",
    detail: "Best for editable articles, reports, and resumes",
  },
  page: {
    label: "Page-by-Page",
    detail: "Keeps page boundaries and line structure visible",
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
      .slice(0, 70) || "converted-document"
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

function groupTextItems(items) {
  const normalized = items
    .filter((item) => item.str?.trim())
    .map((item) => {
      const [, , , scaleY, x, y] = item.transform || [0, 0, 0, 10, 0, 0];
      const fontSize = Math.max(Math.abs(scaleY || 0), item.height || 10, 6);
      return {
        text: item.str.replace(/\s+/g, " ").trim(),
        x,
        y,
        width: item.width || 0,
        endX: x + (item.width || 0),
        fontSize,
      };
    })
    .sort((a, b) => {
      if (Math.abs(b.y - a.y) > 2) return b.y - a.y;
      return a.x - b.x;
    });

  const lines = [];

  normalized.forEach((item) => {
    let line = lines.find(
      (candidate) => Math.abs(candidate.y - item.y) <= Math.max(2.5, item.fontSize * 0.28),
    );

    if (!line) {
      line = {
        y: item.y,
        x: item.x,
        fontSize: item.fontSize,
        items: [],
      };
      lines.push(line);
    }

    line.x = Math.min(line.x, item.x);
    line.y = (line.y * line.items.length + item.y) / (line.items.length + 1);
    line.fontSize = Math.max(line.fontSize, item.fontSize);
    line.items.push(item);
  });

  return lines
    .map((line) => {
      const sorted = [...line.items].sort((a, b) => a.x - b.x);
      let text = "";
      let previousEnd = null;

      sorted.forEach((item) => {
        const gap = previousEnd === null ? 0 : item.x - previousEnd;
        const needsSpace =
          text &&
          gap > Math.max(2.5, item.fontSize * 0.18) &&
          !/[-/([{]$/.test(text);

        text += `${needsSpace ? " " : ""}${item.text}`;
        previousEnd = item.endX;
      });

      return {
        text: text.replace(/\s+/g, " ").trim(),
        x: line.x,
        y: line.y,
        fontSize: line.fontSize,
      };
    })
    .filter((line) => line.text)
    .sort((a, b) => b.y - a.y);
}

function buildParagraphs(lines, detectHeadings) {
  if (!lines.length) return [];
  const averageFontSize =
    lines.reduce((sum, line) => sum + line.fontSize, 0) / lines.length;
  const paragraphs = [];
  let current = null;
  let previousLine = null;

  lines.forEach((line) => {
    const titleCaseWords = line.text.match(/\b[A-Z][a-z]+/g) || [];
    const headingBySize = line.fontSize >= averageFontSize * 1.32;
    const headingByShape =
      line.text.length <= 90 &&
      line.text.length >= 4 &&
      /^[A-Z0-9\s.,:()[\]-]+$/.test(line.text) &&
      /[A-Z]/.test(line.text);
    const headingByTitleCase =
      line.text.length <= 48 &&
      titleCaseWords.length >= 2 &&
      !/[.!?]$/.test(line.text) &&
      !/[|@]/.test(line.text);
    const isBullet = /^[•*▪▫◦-]\s+/.test(line.text);
    const isHeading =
      detectHeadings && !isBullet && (headingBySize || headingByShape || headingByTitleCase);
    const gap = previousLine ? Math.abs(previousLine.y - line.y) : 0;
    const startsNewParagraph =
      !current ||
      isHeading ||
      isBullet ||
      current.isHeading ||
      gap > Math.max(averageFontSize * 1.45, previousLine?.fontSize * 1.2 || 18) ||
      Math.abs(line.x - (previousLine?.x || line.x)) > 28 ||
      /[.!?:;)]$/.test(current.text);

    if (startsNewParagraph) {
      current = {
        text: line.text,
        isHeading,
        fontSize: line.fontSize,
      };
      paragraphs.push(current);
    } else {
      current.text = `${current.text}${current.text.endsWith("-") ? "" : " "}${line.text}`;
    }

    previousLine = line;
  });

  return paragraphs.map((paragraph) => ({
    ...paragraph,
    text: paragraph.text.replace(/-\s+/g, "").replace(/\s+/g, " ").trim(),
  }));
}

function buildPlainText(pages) {
  return pages
    .map((page) => [`Page ${page.pageNumber}`, ...page.lines.map((line) => line.text)].join("\n"))
    .join("\n\n");
}

function createStats(pages) {
  const text = pages.map((page) => page.text).join(" ");
  return {
    pages: pages.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: pages.reduce((sum, page) => sum + page.lines.length, 0),
    paragraphs: pages.reduce((sum, page) => sum + page.paragraphs.length, 0),
    scannedPages: pages.filter((page) => page.lines.length === 0).length,
  };
}

function StatCard({ label, value, detail, icon: Icon }) {
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
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [disablePdfWorker, setDisablePdfWorker] = useState(false);
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [mode, setMode] = useState("flow");
  const [includePageBreaks, setIncludePageBreaks] = useState(true);
  const [includePageHeadings, setIncludePageHeadings] = useState(false);
  const [includeReport, setIncludeReport] = useState(false);
  const [detectHeadings, setDetectHeadings] = useState(true);
  const [activePreviewPage, setActivePreviewPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const pdfDocRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadPdfJs = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        try {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.mjs",
            import.meta.url,
          ).toString();
          if (mounted) setDisablePdfWorker(false);
        } catch {
          if (mounted) setDisablePdfWorker(true);
        }
        if (mounted) setPdfjsLib(pdfjs);
      } catch (err) {
        console.error("Failed to load PDF.js:", err);
        if (mounted) setError("Failed to initialize the PDF text engine.");
      }
    };

    loadPdfJs();

    return () => {
      mounted = false;
      if (pdfDocRef.current?.destroy) {
        pdfDocRef.current.destroy();
      }
    };
  }, []);

  const rangePreview = useMemo(() => {
    if (!pageCount) return { pages: [], error: "" };
    try {
      return { pages: parsePageRange(pageRange, pageCount), error: "" };
    } catch (err) {
      return { pages: [], error: err.message };
    }
  }, [pageRange, pageCount]);

  const selectedPages = useMemo(
    () => rangePreview.pages.map((pageNumber) => pages[pageNumber - 1]).filter(Boolean),
    [pages, rangePreview.pages],
  );

  const preparedSelectedPages = useMemo(
    () =>
      selectedPages.map((page) => ({
        ...page,
        paragraphs: buildParagraphs(page.lines, detectHeadings),
      })),
    [detectHeadings, selectedPages],
  );

  const selectedStats = useMemo(() => createStats(preparedSelectedPages), [preparedSelectedPages]);
  const currentPreviewPage = useMemo(() => {
    const page = pages[activePreviewPage - 1];
    if (!page) return null;
    return {
      ...page,
      paragraphs: buildParagraphs(page.lines, detectHeadings),
    };
  }, [activePreviewPage, detectHeadings, pages]);
  const canConvert =
    Boolean(file) &&
    preparedSelectedPages.length > 0 &&
    !rangePreview.error &&
    !isLoadingPdf &&
    selectedStats.words > 0;

  const resetTool = () => {
    setFile(null);
    setPages([]);
    setPageCount(0);
    setPageRange("");
    setActivePreviewPage(1);
    setProgress({ done: 0, total: 0 });
    setStatus("");
    setError("");
    setCopied(false);
    if (pdfDocRef.current?.destroy) {
      pdfDocRef.current.destroy();
    }
    pdfDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processPdfFile = async (nextFile) => {
    if (!nextFile) return;
    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (!pdfjsLib) {
      setError("PDF engine is still loading. Try again in a moment.");
      return;
    }

    if (pdfDocRef.current?.destroy) {
      pdfDocRef.current.destroy();
      pdfDocRef.current = null;
    }

    setFile(nextFile);
    setPages([]);
    setPageCount(0);
    setPageRange("");
    setActivePreviewPage(1);
    setError("");
    setStatus("Reading PDF text layers...");
    setProgress({ done: 0, total: 0 });
    setIsLoadingPdf(true);

    try {
      const data = new Uint8Array(await nextFile.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({
        data,
        disableWorker: disablePdfWorker,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setPageCount(pdf.numPages);
      setProgress({ done: 0, total: pdf.numPages });

      const extractedPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent({
          includeMarkedContent: true,
          disableNormalization: false,
        });
        const lines = groupTextItems(textContent.items || []);
        const paragraphs = buildParagraphs(lines, detectHeadings);
        const text = lines.map((line) => line.text).join("\n");

        extractedPages.push({
          pageNumber,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          lines,
          paragraphs,
          text,
        });

        setProgress({ done: pageNumber, total: pdf.numPages });
      }

      setPages(extractedPages);
      setStatus("PDF text extracted. Preview it, then export DOCX.");
    } catch (err) {
      console.error("PDF to Word extraction failed:", err);
      setError(
        err?.message ||
          "Could not read this PDF. Try a text-based PDF without password protection.",
      );
      setStatus("");
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processPdfFile(event.dataTransfer.files?.[0]);
  };

  const buildDocx = async () => {
    if (!canConvert) {
      setError(
        selectedStats.words
          ? "Select a valid page range before converting."
          : "No editable text was found in the selected pages. Scanned PDFs need OCR first.",
      );
      return;
    }

    setIsConverting(true);
    setError("");
    setStatus("Building editable Word document...");

    try {
      const {
        AlignmentType,
        Document,
        HeadingLevel,
        Packer,
        PageBreak,
        Paragraph,
        Table,
        TableCell,
        TableRow,
        TextRun,
        WidthType,
      } = await import("docx");

      const children = [];

      if (includeReport) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun(file ? sanitizeFileName(file.name).replaceAll("-", " ") : "Converted PDF")],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Converted from PDF with ${selectedStats.pages} page${selectedStats.pages === 1 ? "" : "s"} and ${selectedStats.words.toLocaleString("en-IN")} words.`,
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              ["Pages", selectedStats.pages],
              ["Words", selectedStats.words],
              ["Paragraphs", selectedStats.paragraphs],
              ["Lines", selectedStats.lines],
              ["Empty text pages", selectedStats.scannedPages],
            ].map(
              ([label, value]) =>
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 40, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ text: String(label) })],
                    }),
                    new TableCell({
                      width: { size: 60, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ text: String(value) })],
                    }),
              ],
                }),
            ),
          }),
          new Paragraph({ text: "" }),
        );
      }

      preparedSelectedPages.forEach((page, index) => {
        if (includePageHeadings) {
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun(`Page ${page.pageNumber}`)],
            }),
          );
        }

        const contentBlocks =
          mode === "page"
            ? page.lines.map((line) => ({ text: line.text, isHeading: false }))
            : page.paragraphs;

        if (!contentBlocks.length) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "No embedded text found on this page.",
                  italics: true,
                }),
              ],
            }),
          );
        }

        contentBlocks.forEach((block) => {
          children.push(
            new Paragraph({
              heading: block.isHeading ? HeadingLevel.HEADING_3 : undefined,
              spacing: { after: block.isHeading ? 120 : 180 },
              children: [new TextRun(block.text)],
            }),
          );
        });

        if (includePageBreaks && index < preparedSelectedPages.length - 1) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }
      });

      const document = new Document({
        creator: "AltFTool",
        title: file ? sanitizeFileName(file.name).replaceAll("-", " ") : "Converted PDF",
        description: "Editable DOCX generated from PDF text layers.",
        sections: [{ properties: {}, children }],
      });
      const blob = await Packer.toBlob(document);
      downloadBlob(blob, `${sanitizeFileName(file.name)}.docx`);
      setStatus("DOCX exported successfully.");
    } catch (err) {
      console.error("DOCX generation failed:", err);
      setError("Could not generate DOCX. Try a smaller PDF or fewer pages.");
    } finally {
      setIsConverting(false);
    }
  };

  const copyExtractedText = async () => {
    if (!preparedSelectedPages.length) return;
    await navigator.clipboard?.writeText(buildPlainText(preparedSelectedPages));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const exportText = () => {
    if (!preparedSelectedPages.length || !file) return;
    const blob = new Blob([buildPlainText(preparedSelectedPages)], {
      type: "text/plain;charset=utf-8",
    });
    downloadBlob(blob, `${sanitizeFileName(file.name)}.txt`);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">PDF to Word Converter</h1>
        <p className="description mt-3">
          Convert text-based PDFs into editable DOCX files with page range,
          layout cleanup, live preview, and local browser-side processing.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <FileType className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Editable Word Export</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                This converter extracts embedded PDF text and rebuilds it as a
                Word document. For scanned image-only PDFs, use OCR first.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Selected output
            </p>
            <p className="mt-2 text-3xl font-bold text-(--primary)">DOCX</p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Editable text, copyable paragraphs, and optional page breaks.
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
              className="hidden"
              onChange={(event) => processPdfFile(event.target.files?.[0])}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
              Drop PDF here
            </h2>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Works best with selectable-text PDFs like invoices, reports,
              resumes, statements, and ebooks.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => fileInputRef.current?.click()}
              disabled={!pdfjsLib || isLoadingPdf}
            >
              {isLoadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isLoadingPdf ? "Reading PDF..." : "Choose PDF"}
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
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={resetTool}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {progress.total > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
                    <span>Extraction progress</span>
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
            <h2 className="font-semibold text-(--foreground)">Conversion Settings</h2>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">Page Range</span>
              <input
                value={pageRange}
                onChange={(event) => setPageRange(event.target.value)}
                placeholder={pageCount ? `All pages, or 1-${Math.min(pageCount, 3)}, 7` : "Upload a PDF first"}
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              />
              <p className="mt-2 text-xs text-(--muted-foreground)">
                Leave blank to convert all pages.
              </p>
            </label>

            <div className="mt-5 grid gap-3">
              {Object.entries(MODE_OPTIONS).map(([value, option]) => (
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

            <div className="mt-5 grid gap-3">
              {[
                ["includePageBreaks", includePageBreaks, setIncludePageBreaks, "Add page breaks"],
                ["includePageHeadings", includePageHeadings, setIncludePageHeadings, "Add page headings"],
                ["includeReport", includeReport, setIncludeReport, "Include conversion report"],
                ["detectHeadings", detectHeadings, setDetectHeadings, "Detect headings"],
              ].map(([key, value, setter, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3"
                >
                  <span className="text-sm font-medium text-(--foreground)">{label}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => setter(event.target.checked)}
                    className="h-5 w-5 accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={buildDocx}
                disabled={!canConvert || isConverting}
              >
                {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isConverting ? "Creating DOCX..." : "Download DOCX"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copyExtractedText}
                disabled={!selectedPages.length}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy Text"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={exportText}
                disabled={!selectedPages.length}
              >
                <FileText className="h-4 w-4" />
                TXT
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
              {isLoadingPdf || isConverting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{status}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {rangePreview.error && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{rangePreview.error}</p>
            </div>
          )}

          <div className="tool-card-grid">
            <StatCard icon={Layers} label="Pages" value={selectedStats.pages} detail={`${pageCount || 0} total`} />
            <StatCard icon={ScanText} label="Words" value={selectedStats.words.toLocaleString("en-IN")} detail="Selected range" />
            <StatCard icon={FileText} label="Paragraphs" value={selectedStats.paragraphs.toLocaleString("en-IN")} detail="Detected blocks" />
            <StatCard icon={ShieldCheck} label="Empty Pages" value={selectedStats.scannedPages} detail="May need OCR" />
          </div>

          {selectedStats.scannedPages > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">
                {selectedStats.scannedPages} selected page{selectedStats.scannedPages === 1 ? "" : "s"} did not expose editable text. The DOCX will include a note for those pages.
              </p>
            </div>
          )}

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Extracted Text Preview</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Check the text layer before downloading the Word file.
                </p>
              </div>
              {pageCount > 0 && (
                <select
                  value={activePreviewPage}
                  onChange={(event) => setActivePreviewPage(Number(event.target.value))}
                  className="rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {pages.map((page) => (
                    <option key={page.pageNumber} value={page.pageNumber}>
                      Page {page.pageNumber}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="min-h-[360px] rounded-lg border border-(--border) bg-(--background) p-4">
              {currentPreviewPage ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-(--muted-foreground)">
                    <span className="rounded-md bg-(--card) px-2 py-1">
                      {currentPreviewPage.lines.length} lines
                    </span>
                    <span className="rounded-md bg-(--card) px-2 py-1">
                      {currentPreviewPage.paragraphs.length} paragraphs
                    </span>
                    <span className="rounded-md bg-(--card) px-2 py-1">
                      {currentPreviewPage.width} x {currentPreviewPage.height}
                    </span>
                  </div>
                  <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-(--foreground)">
                    {currentPreviewPage.text || "No embedded text found on this page."}
                  </pre>
                </>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center text-center text-(--muted-foreground)">
                  <FileText className="mb-3 h-10 w-10" />
                  <p className="font-medium">Upload a PDF to preview extracted text.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
