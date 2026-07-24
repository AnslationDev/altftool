"use client";

/* eslint-disable @next/next/no-img-element -- local user-selected files need exact blob/data URL previews */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileImage,
  FileLock2,
  FileText,
  Images,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  MousePointer2,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import {
  SALARY_SLIP_PRESETS,
  buildExportModel,
  createPresetRectangle,
  moveRectangle,
  projectRectangle,
  rectangleFromPoints,
  updateRectangleBounds,
} from "../lib/anonymizerModel.mjs";

const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_PDF_PAGES = 30;
const PREVIEW_MAX_EDGE = 1100;
const EXPORT_MAX_EDGE = 6000;
const KEYBOARD_NUDGE = 0.005;
const LARGE_KEYBOARD_NUDGE = 0.02;
const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/avif",
]);

const PRESET_ICONS = {
  identity: UserRound,
  address: MapPin,
  accounts: Landmark,
  salary: Banknote,
};

const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-foreground)] shadow-sm transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:cursor-not-allowed disabled:opacity-60";

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

function safeBaseName(filename = "salary-slip") {
  return (
    filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "salary-slip"
  );
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
  return { canvas, context };
}

function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser could not create the raster copy."));
    }, type);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  return pdfjs;
}

async function loadImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;

  try {
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function renderPdfPreviewPage(pdfDocument, pageNumber) {
  const page = await pdfDocument.getPage(pageNumber);

  try {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
      1.5,
      PREVIEW_MAX_EDGE / Math.max(baseViewport.width, baseViewport.height),
    );
    const viewport = page.getViewport({ scale });
    const { canvas, context } = createCanvas(viewport.width, viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;

    return {
      pageNumber,
      previewUrl: canvas.toDataURL("image/jpeg", 0.88),
      rectangles: [],
    };
  } finally {
    page.cleanup();
  }
}

async function renderImagePreview(file) {
  const image = await loadImage(file);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(width, height));
  const { canvas, context } = createCanvas(width * scale, height * scale);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    pageNumber: 1,
    previewUrl: canvas.toDataURL("image/jpeg", 0.9),
    sourceWidth: width,
    sourceHeight: height,
    rectangles: [],
  };
}

function drawMasks(context, rectangles, width, height) {
  context.save();
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  const semanticFill = getComputedStyle(document.documentElement)
    .getPropertyValue("--foreground")
    .trim();
  if (semanticFill) context.fillStyle = semanticFill;

  rectangles.forEach((rectangle) => {
    const projected = projectRectangle(rectangle, width, height);
    context.fillRect(
      projected.x,
      projected.y,
      projected.width,
      projected.height,
    );
  });
  context.restore();
}

async function exportPdf(sourceBytes, model, onProgress) {
  const [pdfjs, { PDFDocument }] = await Promise.all([
    getPdfJs(),
    import("pdf-lib"),
  ]);
  const loadingTask = pdfjs.getDocument({
    data: sourceBytes.slice(),
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const sourceDocument = await loadingTask.promise;
  const outputDocument = await PDFDocument.create();

  try {
    for (let index = 0; index < model.pages.length; index += 1) {
      const modelPage = model.pages[index];
      onProgress(`Rasterizing page ${index + 1} of ${model.pages.length}…`);
      const sourcePage = await sourceDocument.getPage(modelPage.pageNumber);

      try {
        const baseViewport = sourcePage.getViewport({ scale: 1 });
        const requestedScale = model.rasterDpi / 72;
        const scale = Math.min(
          requestedScale,
          EXPORT_MAX_EDGE /
            Math.max(baseViewport.width, baseViewport.height),
        );
        const viewport = sourcePage.getViewport({ scale });
        const { canvas, context } = createCanvas(
          viewport.width,
          viewport.height,
        );
        await sourcePage.render({ canvasContext: context, viewport }).promise;
        drawMasks(
          context,
          modelPage.rectangles,
          canvas.width,
          canvas.height,
        );

        const pngBlob = await canvasToBlob(canvas);
        const pngBytes = await pngBlob.arrayBuffer();
        const embeddedImage = await outputDocument.embedPng(pngBytes);
        const outputPage = outputDocument.addPage([
          baseViewport.width,
          baseViewport.height,
        ]);
        outputPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: baseViewport.width,
          height: baseViewport.height,
        });
        canvas.width = 1;
        canvas.height = 1;
      } finally {
        sourcePage.cleanup();
      }
    }

    onProgress("Assembling flattened PDF…");
    const outputBytes = await outputDocument.save({
      addDefaultPage: false,
      useObjectStreams: true,
    });
    return new Blob([outputBytes], { type: "application/pdf" });
  } finally {
    await sourceDocument.destroy();
  }
}

async function exportImage(file, model, onProgress) {
  onProgress("Rasterizing image and applying opaque masks…");
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(
    1,
    EXPORT_MAX_EDGE / Math.max(sourceWidth, sourceHeight),
  );
  const { canvas, context } = createCanvas(
    sourceWidth * scale,
    sourceHeight * scale,
  );
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawMasks(
    context,
    model.pages[0]?.rectangles || [],
    canvas.width,
    canvas.height,
  );
  return canvasToBlob(canvas);
}

function PercentInput({ id, label, value, onChange }) {
  return (
    <label
      htmlFor={id}
      className="block text-xs font-semibold text-[var(--muted-foreground)]"
    >
      {label}
      <span className="relative mt-1 block">
        <input
          id={id}
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={Math.round(value * 1000) / 10}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 pr-8 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[var(--muted-foreground)]">
          %
        </span>
      </span>
    </label>
  );
}

export default function SalarySlipAnonymizer() {
  const [sourceInfo, setSourceInfo] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedRectangleId, setSelectedRectangleId] = useState(null);
  const [draftRectangle, setDraftRectangle] = useState(null);
  const [rasterDpi, setRasterDpi] = useState(144);
  const [exportAcknowledged, setExportAcknowledged] = useState(false);
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState(null);
  const sourceRef = useRef(null);
  const previewRef = useRef(null);
  const interactionRef = useRef(null);
  const rectangleSequenceRef = useRef(0);
  const resultUrlRef = useRef(null);

  const activePage = pages[activePageIndex] || null;
  const selectedRectangle =
    activePage?.rectangles.find(
      (rectangle) => rectangle.id === selectedRectangleId,
    ) || null;
  const totalRedactions = useMemo(
    () =>
      pages.reduce(
        (total, page) => total + page.rectangles.length,
        0,
      ),
    [pages],
  );
  const pagesWithoutMasks = useMemo(
    () =>
      pages
        .filter((page) => page.rectangles.length === 0)
        .map((page) => page.pageNumber),
    [pages],
  );

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setInspectionConfirmed(false);
  }, []);

  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    [],
  );

  const resetWorkspace = useCallback(() => {
    clearResult();
    sourceRef.current = null;
    setSourceInfo(null);
    setPages([]);
    setActivePageIndex(0);
    setSelectedRectangleId(null);
    setDraftRectangle(null);
    setExportAcknowledged(false);
    setStatus("");
    setError("");
  }, [clearResult]);

  const nextRectangleId = useCallback(() => {
    rectangleSequenceRef.current += 1;
    return `salary-mask-${rectangleSequenceRef.current}`;
  }, []);

  const updatePageRectangles = useCallback(
    (pageIndex, updater) => {
      clearResult();
      setPages((currentPages) =>
        currentPages.map((page, index) =>
          index === pageIndex
            ? { ...page, rectangles: updater(page.rectangles) }
            : page,
        ),
      );
    },
    [clearResult],
  );

  const selectPage = useCallback((index) => {
    setActivePageIndex(index);
    setSelectedRectangleId(null);
    setDraftRectangle(null);
    interactionRef.current = null;
  }, []);

  const loadFile = useCallback(
    async (file) => {
      if (!file) return;
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const isImage =
        IMAGE_TYPES.has(file.type) ||
        /\.(?:png|jpe?g|webp|bmp|avif)$/i.test(file.name);

      if (!isPdf && !isImage) {
        setError("Choose a PDF, PNG, JPEG, WebP, BMP, or AVIF file.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("Choose a file smaller than 40 MB for this local session.");
        return;
      }

      resetWorkspace();
      setIsBusy(true);
      setStatus("Reading the salary slip locally…");

      try {
        if (isPdf) {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const pdfjs = await getPdfJs();
          const loadingTask = pdfjs.getDocument({
            data: bytes.slice(),
            isEvalSupported: false,
            useSystemFonts: true,
          });
          const pdfDocument = await loadingTask.promise;

          try {
            if (pdfDocument.numPages > MAX_PDF_PAGES) {
              throw new Error(
                `This workspace supports up to ${MAX_PDF_PAGES} PDF pages at a time.`,
              );
            }

            const previewPages = [];
            for (
              let pageNumber = 1;
              pageNumber <= pdfDocument.numPages;
              pageNumber += 1
            ) {
              setStatus(
                `Rendering preview ${pageNumber} of ${pdfDocument.numPages}…`,
              );
              previewPages.push(
                await renderPdfPreviewPage(pdfDocument, pageNumber),
              );
            }

            sourceRef.current = { type: "pdf", bytes };
            setPages(previewPages);
            setSourceInfo({
              type: "pdf",
              name: file.name,
              size: file.size,
              pageCount: pdfDocument.numPages,
            });
          } finally {
            await pdfDocument.destroy();
          }
        } else {
          setStatus("Rendering image preview…");
          const preview = await renderImagePreview(file);
          sourceRef.current = { type: "image", file };
          setPages([preview]);
          setSourceInfo({
            type: "image",
            name: file.name,
            size: file.size,
            pageCount: 1,
            dimensions: `${preview.sourceWidth} × ${preview.sourceHeight}`,
          });
        }

        setStatus(
          "Ready. Add and position masks over every detail you do not want to share.",
        );
      } catch (loadError) {
        sourceRef.current = null;
        setPages([]);
        setSourceInfo(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "The selected file could not be opened.",
        );
        setStatus("");
      } finally {
        setIsBusy(false);
      }
    },
    [resetWorkspace],
  );

  const pointFromPointer = useCallback((event) => {
    const bounds = previewRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) return null;
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  }, []);

  const startDrawing = useCallback(
    (event) => {
      if (!activePage || isBusy || event.button !== 0) return;
      const start = pointFromPointer(event);
      if (!start) return;
      previewRef.current?.setPointerCapture(event.pointerId);
      const id = nextRectangleId();
      interactionRef.current = { mode: "draw", start, id };
      setSelectedRectangleId(null);
      setDraftRectangle(rectangleFromPoints(start, start, id));
    },
    [activePage, isBusy, nextRectangleId, pointFromPointer],
  );

  const startMoving = useCallback(
    (event, rectangle) => {
      if (isBusy || event.button !== 0) return;
      event.stopPropagation();
      const start = pointFromPointer(event);
      if (!start) return;
      previewRef.current?.setPointerCapture(event.pointerId);
      setSelectedRectangleId(rectangle.id);
      interactionRef.current = { mode: "move", start, initial: rectangle };
    },
    [isBusy, pointFromPointer],
  );

  const continueInteraction = useCallback(
    (event) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const point = pointFromPointer(event);
      if (!point) return;

      if (interaction.mode === "draw") {
        setDraftRectangle(
          rectangleFromPoints(interaction.start, point, interaction.id),
        );
        return;
      }

      const moved = moveRectangle(
        interaction.initial,
        point.x - interaction.start.x,
        point.y - interaction.start.y,
      );
      updatePageRectangles(activePageIndex, (rectangles) =>
        rectangles.map((rectangle) =>
          rectangle.id === interaction.initial.id ? moved : rectangle,
        ),
      );
    },
    [activePageIndex, pointFromPointer, updatePageRectangles],
  );

  const finishInteraction = useCallback(
    (event) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const point = pointFromPointer(event);

      if (interaction.mode === "draw" && point) {
        const rectangle = rectangleFromPoints(
          interaction.start,
          point,
          interaction.id,
        );
        if (rectangle.width >= 0.002 && rectangle.height >= 0.002) {
          updatePageRectangles(activePageIndex, (rectangles) => [
            ...rectangles,
            rectangle,
          ]);
          setSelectedRectangleId(rectangle.id);
        }
      }

      interactionRef.current = null;
      setDraftRectangle(null);
      if (previewRef.current?.hasPointerCapture(event.pointerId)) {
        previewRef.current.releasePointerCapture(event.pointerId);
      }
    },
    [activePageIndex, pointFromPointer, updatePageRectangles],
  );

  const addPreset = useCallback(
    (presetKey) => {
      const rectangle = createPresetRectangle(
        presetKey,
        nextRectangleId(),
      );
      updatePageRectangles(activePageIndex, (rectangles) => [
        ...rectangles,
        rectangle,
      ]);
      setSelectedRectangleId(rectangle.id);
    },
    [activePageIndex, nextRectangleId, updatePageRectangles],
  );

  const addCustomMask = useCallback(() => {
    const rectangle = {
      id: nextRectangleId(),
      label: "Custom mask",
      presetKey: null,
      x: 0.34,
      y: 0.44,
      width: 0.32,
      height: 0.12,
    };
    updatePageRectangles(activePageIndex, (rectangles) => [
      ...rectangles,
      rectangle,
    ]);
    setSelectedRectangleId(rectangle.id);
  }, [activePageIndex, nextRectangleId, updatePageRectangles]);

  const updateSelectedRectangle = useCallback(
    (changes) => {
      if (!selectedRectangleId) return;
      updatePageRectangles(activePageIndex, (rectangles) =>
        rectangles.map((rectangle) =>
          rectangle.id === selectedRectangleId
            ? updateRectangleBounds(rectangle, changes)
            : rectangle,
        ),
      );
    },
    [activePageIndex, selectedRectangleId, updatePageRectangles],
  );

  const removeRectangle = useCallback(
    (rectangleId) => {
      updatePageRectangles(activePageIndex, (rectangles) =>
        rectangles.filter((rectangle) => rectangle.id !== rectangleId),
      );
      setSelectedRectangleId((current) =>
        current === rectangleId ? null : current,
      );
    },
    [activePageIndex, updatePageRectangles],
  );

  const clearPage = useCallback(() => {
    updatePageRectangles(activePageIndex, () => []);
    setSelectedRectangleId(null);
  }, [activePageIndex, updatePageRectangles]);

  const copySelectedToAllPages = useCallback(() => {
    if (!selectedRectangle || pages.length < 2) return;
    clearResult();
    setPages((currentPages) =>
      currentPages.map((page, index) =>
        index === activePageIndex
          ? page
          : {
              ...page,
              rectangles: [
                ...page.rectangles,
                { ...selectedRectangle, id: nextRectangleId() },
              ],
            },
      ),
    );
  }, [
    activePageIndex,
    clearResult,
    nextRectangleId,
    pages.length,
    selectedRectangle,
  ]);

  const handleRectangleKeyDown = useCallback(
    (event, rectangle) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeRectangle(rectangle.id);
        return;
      }

      const amount = event.shiftKey
        ? LARGE_KEYBOARD_NUDGE
        : KEYBOARD_NUDGE;
      const deltas = {
        ArrowLeft: [-amount, 0],
        ArrowRight: [amount, 0],
        ArrowUp: [0, -amount],
        ArrowDown: [0, amount],
      };
      const delta = deltas[event.key];
      if (!delta) return;
      event.preventDefault();
      setSelectedRectangleId(rectangle.id);
      updatePageRectangles(activePageIndex, (rectangles) =>
        rectangles.map((item) =>
          item.id === rectangle.id
            ? moveRectangle(item, delta[0], delta[1])
            : item,
        ),
      );
    },
    [activePageIndex, removeRectangle, updatePageRectangles],
  );

  const exportResult = useCallback(async () => {
    if (
      !sourceInfo ||
      !sourceRef.current ||
      !exportAcknowledged ||
      totalRedactions === 0
    ) {
      return;
    }

    clearResult();
    setError("");
    setIsBusy(true);
    setStatus("Preparing a new rasterized copy…");

    try {
      const model = buildExportModel({
        sourceType: sourceInfo.type,
        pages,
        rasterDpi,
      });
      const blob =
        sourceRef.current.type === "pdf"
          ? await exportPdf(sourceRef.current.bytes, model, setStatus)
          : await exportImage(sourceRef.current.file, model, setStatus);
      const extension = sourceInfo.type === "pdf" ? "pdf" : "png";
      const name = `${safeBaseName(sourceInfo.name)}-anonymized.${extension}`;
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({
        blob,
        name,
        url,
        type: sourceInfo.type,
        pageCount: model.totalPages,
        redactionCount: model.totalRedactions,
      });
      setStatus(
        "Rasterized copy created. Inspect the result before enabling download.",
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "The anonymized copy could not be created.",
      );
      setStatus("");
    } finally {
      setIsBusy(false);
    }
  }, [
    clearResult,
    exportAcknowledged,
    pages,
    rasterDpi,
    sourceInfo,
    totalRedactions,
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <FileLock2 className="size-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                  Salary Slip Anonymizer
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-2 py-1 text-xs font-bold text-[var(--success)]">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                  Local only
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                Manually cover details you do not want to share, then rebuild
                the slip as a flattened PDF or PNG. Files stay in this browser
                tab and are not uploaded.
              </p>
            </div>
          </div>
          {sourceInfo ? (
            <button
              type="button"
              onClick={resetWorkspace}
              disabled={isBusy}
              className={secondaryButton}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Start over
            </button>
          ) : null}
        </div>
      </header>

      <aside className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert
            className="mt-0.5 size-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-[var(--foreground)]">
              No automatic detection
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
              This tool does not scan for names, PAN, account numbers, salary
              amounts, or any other sensitive data. Presets are only movable
              starting rectangles. You must position every mask and inspect
              every page yourself.
            </p>
          </div>
        </div>
      </aside>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              1. Choose a salary slip
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              PDF, PNG, JPEG, WebP, BMP, or AVIF · maximum 40 MB · PDFs up to
              30 pages
            </p>
          </div>
          <label className={`${secondaryButton} cursor-pointer`}>
            <Upload className="size-4" aria-hidden="true" />
            {sourceInfo ? "Replace file" : "Choose PDF or image"}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp,image/avif"
              className="sr-only"
              disabled={isBusy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void loadFile(file);
              }}
            />
          </label>
        </div>

        {sourceInfo ? (
          <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--foreground)]">
              {sourceInfo.type === "pdf" ? (
                <FileText className="size-4 text-[var(--primary)]" />
              ) : (
                <FileImage className="size-4 text-[var(--primary)]" />
              )}
              {sourceInfo.name}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {formatBytes(sourceInfo.size)}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {sourceInfo.type === "pdf"
                ? `${sourceInfo.pageCount} page${
                    sourceInfo.pageCount === 1 ? "" : "s"
                  }`
                : sourceInfo.dimensions}
            </span>
          </div>
        ) : null}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm font-semibold text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <p
        aria-live="polite"
        className="min-h-5 text-sm font-medium text-[var(--muted-foreground)]"
      >
        {isBusy ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            {status}
          </span>
        ) : (
          status
        )}
      </p>

      {activePage ? (
        <section className="grid gap-5 xl:grid-cols-12">
          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[var(--foreground)]">Pages</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {totalRedactions} mask{totalRedactions === 1 ? "" : "s"} total
                </p>
              </div>
              <Images
                className="size-5 text-[var(--primary)]"
                aria-hidden="true"
              />
            </div>
            <div
              className="mt-4 flex gap-3 overflow-x-auto pb-2 xl:max-h-screen xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden"
              aria-label="Salary slip pages"
            >
              {pages.map((page, index) => (
                <button
                  key={page.pageNumber}
                  type="button"
                  onClick={() => selectPage(index)}
                  aria-current={index === activePageIndex ? "page" : undefined}
                  className={`min-w-32 rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    index === activePageIndex
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <img
                    src={page.previewUrl}
                    alt=""
                    className="aspect-[4/3] w-full rounded-md border border-[var(--border)] bg-[var(--canvas)] object-contain"
                  />
                  <span className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-[var(--foreground)]">
                    {sourceInfo.type === "pdf"
                      ? `Page ${page.pageNumber}`
                      : "Image"}
                    <span className="text-[var(--muted-foreground)]">
                      {page.rectangles.length}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-4 xl:col-span-7">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-bold text-[var(--foreground)]">
                    2. Position every mask
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Drag on the page to draw a custom mask. Drag a mask to move
                    it, or focus it and use arrow keys. Shift + arrow moves
                    farther; Delete removes it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCustomMask}
                  className={secondaryButton}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add custom mask
                </button>
              </div>

              <div className="mt-4 flex min-h-80 items-center justify-center overflow-auto rounded-lg border border-[var(--border)] bg-[var(--canvas)] p-3">
                <div
                  ref={previewRef}
                  className="relative inline-block max-w-full touch-none select-none overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--surface)] shadow-sm"
                  onPointerDown={startDrawing}
                  onPointerMove={continueInteraction}
                  onPointerUp={finishInteraction}
                  onPointerCancel={finishInteraction}
                  aria-label={`Masking canvas for ${
                    sourceInfo.type === "pdf"
                      ? `page ${activePage.pageNumber}`
                      : sourceInfo.name
                  }`}
                >
                  <img
                    src={activePage.previewUrl}
                    alt={`Preview of ${
                      sourceInfo.type === "pdf"
                        ? `salary slip page ${activePage.pageNumber}`
                        : sourceInfo.name
                    }`}
                    draggable="false"
                    className="block h-auto max-h-screen max-w-full"
                  />
                  {activePage.rectangles.map((rectangle, index) => (
                    <button
                      key={rectangle.id}
                      type="button"
                      aria-label={`${rectangle.label}, mask ${index + 1}. Use arrow keys to move or Delete to remove.`}
                      aria-pressed={
                        rectangle.id === selectedRectangleId
                      }
                      onPointerDown={(event) =>
                        startMoving(event, rectangle)
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedRectangleId(rectangle.id);
                      }}
                      onKeyDown={(event) =>
                        handleRectangleKeyDown(event, rectangle)
                      }
                      className={`absolute cursor-move border-2 bg-[var(--foreground)] opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
                        rectangle.id === selectedRectangleId
                          ? "border-[var(--secondary)]"
                          : "border-[var(--surface)]"
                      }`}
                      style={{
                        left: `${rectangle.x * 100}%`,
                        top: `${rectangle.y * 100}%`,
                        width: `${rectangle.width * 100}%`,
                        height: `${rectangle.height * 100}%`,
                      }}
                    >
                      <span className="sr-only">{rectangle.label}</span>
                    </button>
                  ))}
                  {draftRectangle ? (
                    <span
                      className="pointer-events-none absolute border-2 border-dashed border-[var(--secondary)] bg-[var(--foreground)] opacity-80"
                      style={{
                        left: `${draftRectangle.x * 100}%`,
                        top: `${draftRectangle.y * 100}%`,
                        width: `${draftRectangle.width * 100}%`,
                        height: `${draftRectangle.height * 100}%`,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    selectPage(Math.max(0, activePageIndex - 1))
                  }
                  disabled={activePageIndex === 0}
                  className={secondaryButton}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {activePageIndex + 1} / {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    selectPage(
                      Math.min(pages.length - 1, activePageIndex + 1),
                    )
                  }
                  disabled={activePageIndex === pages.length - 1}
                  className={secondaryButton}
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:col-span-3">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <h2 className="font-bold text-[var(--foreground)]">
                Manual presets
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Add a starting rectangle, then move and resize it to fit this
                exact slip.
              </p>
              <div className="mt-3 grid gap-2">
                {Object.values(SALARY_SLIP_PRESETS).map((preset) => {
                  const Icon = PRESET_ICONS[preset.key];
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => addPreset(preset.key)}
                      className={`${secondaryButton} !justify-start`}
                    >
                      <Icon
                        className="size-4 text-[var(--primary)]"
                        aria-hidden="true"
                      />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <MousePointer2
                  className="size-5 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <h2 className="font-bold text-[var(--foreground)]">
                  Selected mask
                </h2>
              </div>

              {selectedRectangle ? (
                <>
                  <label
                    htmlFor="mask-label"
                    className="mt-4 block text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    Label
                    <input
                      id="mask-label"
                      type="text"
                      value={selectedRectangle.label}
                      onChange={(event) =>
                        updateSelectedRectangle({
                          label: event.target.value,
                        })
                      }
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                    />
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <PercentInput
                      id="mask-left"
                      label="Left"
                      value={selectedRectangle.x}
                      onChange={(x) => updateSelectedRectangle({ x })}
                    />
                    <PercentInput
                      id="mask-top"
                      label="Top"
                      value={selectedRectangle.y}
                      onChange={(y) => updateSelectedRectangle({ y })}
                    />
                    <PercentInput
                      id="mask-width"
                      label="Width"
                      value={selectedRectangle.width}
                      onChange={(width) =>
                        updateSelectedRectangle({ width })
                      }
                    />
                    <PercentInput
                      id="mask-height"
                      label="Height"
                      value={selectedRectangle.height}
                      onChange={(height) =>
                        updateSelectedRectangle({ height })
                      }
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    {pages.length > 1 ? (
                      <button
                        type="button"
                        onClick={copySelectedToAllPages}
                        className={`${secondaryButton} w-full`}
                      >
                        Copy position to every page
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        removeRectangle(selectedRectangle.id)
                      }
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove selected
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Select a mask to edit its label, position, and size.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-[var(--foreground)]">
                  This page
                </h2>
                <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
                  {activePage.rectangles.length}
                </span>
              </div>
              {activePage.rectangles.length ? (
                <ol className="mt-3 space-y-2">
                  {activePage.rectangles.map((rectangle, index) => (
                    <li key={rectangle.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRectangleId(rectangle.id)
                        }
                        className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                          rectangle.id === selectedRectangleId
                            ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                            : "border-[var(--border)] bg-[var(--surface-soft)]"
                        } text-[var(--foreground)]`}
                      >
                        <span className="truncate">
                          {index + 1}. {rectangle.label}
                        </span>
                        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                          {Math.round(rectangle.width * 100)} ×{" "}
                          {Math.round(rectangle.height * 100)}%
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No masks on this page.
                </p>
              )}
              {activePage.rectangles.length ? (
                <button
                  type="button"
                  onClick={clearPage}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Clear page masks
                </button>
              ) : null}
            </section>
          </aside>
        </section>
      ) : null}

      {sourceInfo && pages.length ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 size-6 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    3. Create a flattened copy
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {sourceInfo.type === "pdf"
                      ? "Each page becomes a raster image inside a new PDF. Selectable text, form fields, links, scripts, attachments, and original PDF objects are not copied."
                      : "The source image is redrawn into a new PNG. Its original container and metadata are not copied."}
                  </p>
                </div>
              </div>

              {pagesWithoutMasks.length ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--foreground)]">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-[var(--warning)]"
                    aria-hidden="true"
                  />
                  <span>
                    No masks on{" "}
                    {sourceInfo.type === "pdf"
                      ? `page${pagesWithoutMasks.length === 1 ? "" : "s"} ${pagesWithoutMasks.join(", ")}`
                      : "the image"}
                    . Confirm that this is intentional.
                  </span>
                </div>
              ) : null}

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <input
                  type="checkbox"
                  checked={exportAcknowledged}
                  onChange={(event) =>
                    setExportAcknowledged(event.target.checked)
                  }
                  className="mt-0.5 size-5 rounded border-[var(--border-strong)] accent-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
                <span className="text-sm leading-6 text-[var(--foreground)]">
                  I manually checked every page and understand that the tool
                  cannot identify missed sensitive details for me.
                </span>
              </label>
            </div>

            <div className="space-y-3">
              {sourceInfo.type === "pdf" ? (
                <label
                  htmlFor="raster-quality"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  PDF raster quality
                  <select
                    id="raster-quality"
                    value={rasterDpi}
                    onChange={(event) => {
                      clearResult();
                      setRasterDpi(Number(event.target.value));
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    <option value="96">Screen · 96 DPI</option>
                    <option value="144">Balanced · 144 DPI</option>
                    <option value="216">Detailed · 216 DPI</option>
                  </select>
                </label>
              ) : null}
              <div className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                {totalRedactions} mask{totalRedactions === 1 ? "" : "s"} across{" "}
                {pages.length} {pages.length === 1 ? "page" : "pages"}
              </div>
              <button
                type="button"
                onClick={() => void exportResult()}
                disabled={
                  isBusy || !exportAcknowledged || totalRedactions === 0
                }
                className={`${primaryButton} w-full`}
              >
                {isBusy ? (
                  <LoaderCircle
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <FileLock2 className="size-4" aria-hidden="true" />
                )}
                Create rasterized {sourceInfo.type === "pdf" ? "PDF" : "PNG"}
              </button>
              {totalRedactions === 0 ? (
                <p className="text-xs font-semibold text-[var(--danger)]">
                  Add at least one mask before exporting.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--success)] text-[var(--success)]">
              <Eye className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                4. Final inspection required
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                Inspect every page, every edge of each mask, and any small
                identifiers before sharing. Export success does not mean the
                slip is fully anonymized.
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {result.redactionCount} masks · {result.pageCount}{" "}
                {result.pageCount === 1 ? "page" : "pages"} ·{" "}
                {formatBytes(result.blob.size)}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--canvas)]">
            {result.type === "pdf" ? (
              <iframe
                src={result.url}
                title="Rasterized salary slip final inspection preview"
                className="h-96 w-full"
              />
            ) : (
              <img
                src={result.url}
                alt="Rasterized anonymized salary slip final inspection preview"
                className="mx-auto max-h-96 max-w-full object-contain"
              />
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={inspectionConfirmed}
                onChange={(event) =>
                  setInspectionConfirmed(event.target.checked)
                }
                className="mt-0.5 size-5 rounded border-[var(--border-strong)] accent-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
              <span className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                I inspected the final copy and confirmed every intended detail
                is covered.
              </span>
            </label>
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.name)}
              disabled={!inspectionConfirmed}
              className={`${primaryButton} shrink-0`}
            >
              {inspectionConfirmed ? (
                <Download className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              Download final copy
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
