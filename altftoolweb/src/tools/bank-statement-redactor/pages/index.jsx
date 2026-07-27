"use client";

/* eslint-disable @next/next/no-img-element -- previews are local blob/data URLs whose rendered dimensions match the coordinate system */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  FileImage,
  FileLock2,
  FileText,
  Globe2,
  Hash,
  Images,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  MousePointer2,
  Plus,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import {
  BANK_STATEMENT_PRESETS,
  REDACTION_MODES,
  SENSITIVE_PATTERNS,
  applyCanvasRedactionMask,
  buildExportPlan,
  buildOutputName,
  calculatePrivacyScore,
  createPresetRectangle,
  getRasterScale,
  moveRectangle,
  projectRectangle,
  rectangleFromPoints,
  updateRectangleBounds,
} from "../lib/redactorModel.mjs";

import CompletionScreen from "../components/CompletionScreen";
import DetectionDashboard from "../components/DetectionDashboard";
import DocumentViewer from "../components/DocumentViewer";
import EditingToolbar from "../components/EditingToolbar";
import ExportSection from "../components/ExportSection";
import HeaderBar from "../components/HeaderBar";
import PrivacyAnalytics from "../components/PrivacyAnalytics";
import SearchPanel from "../components/SearchPanel";
import SidebarThumbnails from "../components/SidebarThumbnails";
import UploadDropzone from "../components/UploadDropzone";

const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_PDF_PAGES = 30;
const PREVIEW_MAX_EDGE = 1200;
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
      else reject(new Error("The browser could not create the raster output."));
    }, type);
  });
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
      1.6,
      PREVIEW_MAX_EDGE / Math.max(baseViewport.width, baseViewport.height),
    );
    const viewport = page.getViewport({ scale });
    const { canvas, context } = createCanvas(viewport.width, viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;

    // Extract text content for sensitive data auto-detection & search
    let pageTextItems = [];
    try {
      const textContent = await page.getTextContent();
      pageTextItems = textContent.items.map((item) => {
        const tx = pdfjsLibTransformToViewport(item.transform, viewport);
        return {
          str: item.str,
          x: Math.max(0, tx.x / viewport.width),
          y: Math.max(0, tx.y / viewport.height),
          width: Math.max(0.02, (item.width * scale) / viewport.width),
          height: Math.max(0.015, (item.height * scale) / viewport.height),
        };
      });
    } catch {
      // text extraction is best-effort
    }

    return {
      pageNumber,
      previewUrl: canvas.toDataURL("image/jpeg", 0.9),
      previewWidth: canvas.width,
      previewHeight: canvas.height,
      baseWidth: baseViewport.width,
      baseHeight: baseViewport.height,
      textItems: pageTextItems,
      rectangles: [],
    };
  } finally {
    page.cleanup();
  }
}

function pdfjsLibTransformToViewport(transform, viewport) {
  const x = transform[4];
  const y = transform[5];
  const pt = viewport.convertToViewportPoint(x, y);
  return { x: pt[0], y: pt[1] };
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
    previewUrl: canvas.toDataURL("image/jpeg", 0.92),
    previewWidth: canvas.width,
    previewHeight: canvas.height,
    sourceWidth: width,
    sourceHeight: height,
    textItems: [],
    rectangles: [],
  };
}

function drawMasks(context, rectangles, width, height) {
  rectangles.forEach((rectangle) => {
    const projected = projectRectangle(rectangle, width, height);
    applyCanvasRedactionMask(context, projected, rectangle);
  });
}

async function exportPdf(sourceBytes, plan, onProgress) {
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
    for (let index = 0; index < plan.pages.length; index += 1) {
      const modelPage = plan.pages[index];
      onProgress(`Rasterizing page ${index + 1} of ${plan.pages.length}…`);
      const sourcePage = await sourceDocument.getPage(modelPage.pageNumber);
      try {
        const baseViewport = sourcePage.getViewport({ scale: 1 });
        const scale = getRasterScale({
          width: baseViewport.width,
          height: baseViewport.height,
          rasterDpi: plan.rasterDpi,
          maxEdge: EXPORT_MAX_EDGE,
        });
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

async function exportImage(file, plan, onProgress) {
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
    plan.pages[0]?.rectangles || [],
    canvas.width,
    canvas.height,
  );
  return canvasToBlob(canvas);
}

export default function BankStatementRedactor() {
  const [sourceInfo, setSourceInfo] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedRectangleId, setSelectedRectangleId] = useState(null);
  const [draftRectangle, setDraftRectangle] = useState(null);
  const [rasterDpi, setRasterDpi] = useState(144);
  const [selectedRedactionMode, setSelectedRedactionMode] = useState("black");
  const [exportAcknowledged, setExportAcknowledged] = useState(false);
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  const [processingTimeMs, setProcessingTimeMs] = useState(0);

  const sourceRef = useRef(null);
  const previewRef = useRef(null);
  const interactionRef = useRef(null);
  const sequenceRef = useRef(0);
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

  const pagesWithoutRedactions = useMemo(
    () =>
      pages
        .filter((page) => page.rectangles.length === 0)
        .map((page) => page.pageNumber),
    [pages],
  );

  // Calculate Privacy Score & Assistant Advice
  const privacyScore = useMemo(
    () => calculatePrivacyScore(detectedItems, pages.flatMap((p) => p.rectangles)),
    [detectedItems, pages],
  );

  // Full-Document Search Matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim() || pages.length === 0) return [];
    const query = searchQuery.toLowerCase();
    const matches = [];

    pages.forEach((page) => {
      if (Array.isArray(page.textItems)) {
        page.textItems.forEach((item) => {
          if (item.str && item.str.toLowerCase().includes(query)) {
            matches.push({
              pageNumber: page.pageNumber,
              str: item.str,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
            });
          }
        });
      }
    });

    return matches;
  }, [pages, searchQuery]);

  const pushHistory = useCallback((nextPages) => {
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.stringify(nextPages)];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevPages = JSON.parse(historyStack[historyIndex - 1]);
      setPages(prevPages);
      setHistoryIndex((idx) => idx - 1);
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextPages = JSON.parse(historyStack[historyIndex + 1]);
      setPages(nextPages);
      setHistoryIndex((idx) => idx + 1);
    }
  }, [historyIndex, historyStack]);

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
    setDetectedItems([]);
    setHistoryStack([]);
    setHistoryIndex(-1);
    setShowSearch(false);
    setSearchQuery("");
  }, [clearResult]);

  const nextRectangleId = useCallback(() => {
    sequenceRef.current += 1;
    return `bank-mask-${sequenceRef.current}`;
  }, []);

  const updatePageRectangles = useCallback(
    (pageIndex, updater) => {
      clearResult();
      setPages((currentPages) => {
        const next = currentPages.map((page, index) =>
          index === pageIndex
            ? { ...page, rectangles: updater(page.rectangles) }
            : page,
        );
        pushHistory(next);
        return next;
      });
    },
    [clearResult, pushHistory],
  );

  const selectPage = useCallback((index) => {
    setActivePageIndex(index);
    setSelectedRectangleId(null);
    setDraftRectangle(null);
    interactionRef.current = null;
  }, []);

  // Sensitive Data Scanner
  const autoScanDocumentText = useCallback((loadedPages) => {
    const detected = [];
    let itemId = 1;

    loadedPages.forEach((page) => {
      if (Array.isArray(page.textItems) && page.textItems.length > 0) {
        page.textItems.forEach((item) => {
          SENSITIVE_PATTERNS.forEach((pattern) => {
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
            if (regex.test(item.str)) {
              detected.push({
                id: `det-${itemId++}`,
                category: pattern.category,
                key: pattern.key,
                label: pattern.label,
                value: item.str,
                severity: pattern.severity,
                confidence: pattern.confidence,
                pageNumber: page.pageNumber,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                status: "detected",
              });
            }
          });
        });
      }
    });

    setDetectedItems(detected);
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
      setStatus("Reading statement locally and running text extraction…");

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
            setHistoryStack([JSON.stringify(previewPages)]);
            setHistoryIndex(0);
            setSourceInfo({
              type: "pdf",
              name: file.name,
              size: file.size,
              pageCount: pdfDocument.numPages,
            });
            autoScanDocumentText(previewPages);
          } finally {
            await pdfDocument.destroy();
          }
        } else {
          setStatus("Rendering image preview…");
          const preview = await renderImagePreview(file);
          sourceRef.current = { type: "image", file };
          setPages([preview]);
          setHistoryStack([JSON.stringify([preview])]);
          setHistoryIndex(0);
          setSourceInfo({
            type: "image",
            name: file.name,
            size: file.size,
            pageCount: 1,
            dimensions: `${preview.sourceWidth} × ${preview.sourceHeight}`,
          });
          autoScanDocumentText([preview]);
        }
        setStatus(
          "Ready. Sensitive fields identified locally. Review detections or add custom masks.",
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
    [autoScanDocumentText, resetWorkspace],
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
      setDraftRectangle(rectangleFromPoints(start, start, id, selectedRedactionMode));
    },
    [activePage, isBusy, nextRectangleId, pointFromPointer, selectedRedactionMode],
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
          rectangleFromPoints(interaction.start, point, interaction.id, selectedRedactionMode),
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
    [activePageIndex, pointFromPointer, selectedRedactionMode, updatePageRectangles],
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
          selectedRedactionMode,
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
    [activePageIndex, pointFromPointer, selectedRedactionMode, updatePageRectangles],
  );

  const addPreset = useCallback(
    (presetKey) => {
      const rectangle = createPresetRectangle(presetKey, nextRectangleId(), selectedRedactionMode);
      updatePageRectangles(activePageIndex, (rectangles) => [
        ...rectangles,
        rectangle,
      ]);
      setSelectedRectangleId(rectangle.id);
    },
    [activePageIndex, nextRectangleId, selectedRedactionMode, updatePageRectangles],
  );

  const addCustomRectangle = useCallback(() => {
    const rectangle = {
      id: nextRectangleId(),
      label: "Custom redaction",
      presetKey: null,
      mode: selectedRedactionMode,
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
  }, [activePageIndex, nextRectangleId, selectedRedactionMode, updatePageRectangles]);

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
    setPages((currentPages) => {
      const next = currentPages.map((page, index) =>
        index === activePageIndex
          ? page
          : {
              ...page,
              rectangles: [
                ...page.rectangles,
                { ...selectedRectangle, id: nextRectangleId() },
              ],
            },
      );
      pushHistory(next);
      return next;
    });
  }, [
    activePageIndex,
    clearResult,
    nextRectangleId,
    pages.length,
    pushHistory,
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

  // Handle Detection Dashboard Actions
  const handleRedactDetectedItem = useCallback(
    (item) => {
      const rectangle = {
        id: nextRectangleId(),
        label: item.label,
        mode: selectedRedactionMode,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        severity: item.severity,
        category: item.category,
      };

      const pageIdx = item.pageNumber - 1;
      updatePageRectangles(pageIdx, (rects) => [...rects, rectangle]);
      setDetectedItems((items) =>
        items.map((i) => (i.id === item.id ? { ...i, status: "redacted" } : i)),
      );
    },
    [nextRectangleId, selectedRedactionMode, updatePageRectangles],
  );

  const handleIgnoreDetectedItem = useCallback((itemId) => {
    setDetectedItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, status: "ignored" } : i)),
    );
  }, []);

  const handleRedactAllHighRisk = useCallback(() => {
    detectedItems
      .filter((i) => i.severity === "high" && i.status !== "redacted")
      .forEach((item) => handleRedactDetectedItem(item));
  }, [detectedItems, handleRedactDetectedItem]);

  const handleRedactAllSelected = useCallback(
    (ids) => {
      const set = new Set(ids);
      detectedItems
        .filter((i) => set.has(i.id))
        .forEach((item) => handleRedactDetectedItem(item));
    },
    [detectedItems, handleRedactDetectedItem],
  );

  // Redact All Search Matches
  const handleRedactAllMatches = useCallback(() => {
    if (searchMatches.length === 0) return;
    searchMatches.forEach((match) => {
      const rectangle = {
        id: nextRectangleId(),
        label: `Search Match: ${searchQuery}`,
        mode: selectedRedactionMode,
        x: match.x,
        y: match.y,
        width: match.width,
        height: match.height,
      };
      updatePageRectangles(match.pageNumber - 1, (rects) => [...rects, rectangle]);
    });
  }, [nextRectangleId, searchMatches, searchQuery, selectedRedactionMode, updatePageRectangles]);

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
    setStatus("Preparing flattened raster pages…");
    const startTime = performance.now();

    try {
      const plan = buildExportPlan({
        sourceType: sourceInfo.type,
        pages,
        rasterDpi,
      });
      const blob =
        sourceRef.current.type === "pdf"
          ? await exportPdf(sourceRef.current.bytes, plan, setStatus)
          : await exportImage(sourceRef.current.file, plan, setStatus);
      const name = buildOutputName(sourceInfo.name, sourceInfo.type);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setProcessingTimeMs(Math.round(performance.now() - startTime));
      setResult({
        blob,
        name,
        url,
        type: sourceInfo.type,
        pageCount: plan.totalPages,
        redactionCount: plan.totalRedactions,
      });
      setStatus(
        "Flattened copy created. Complete final inspection below before downloading.",
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "The redacted copy could not be created.",
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
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <HeaderBar
        sourceInfo={sourceInfo}
        privacyScore={privacyScore}
        totalRedactions={totalRedactions}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSearch={() => setShowSearch((v) => !v)}
        onOpenAssistant={() => setShowAssistant((v) => !v)}
        onResetWorkspace={resetWorkspace}
      />

      {/* Full Document Search Overlay */}
      {showSearch && (
        <SearchPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMatches={searchMatches}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={() => setCurrentMatchIndex((i) => (i + 1) % Math.max(1, searchMatches.length))}
          onPrevMatch={() => setCurrentMatchIndex((i) => (i - 1 + searchMatches.length) % Math.max(1, searchMatches.length))}
          onRedactAllMatches={handleRedactAllMatches}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Upload Dropzone */}
      <UploadDropzone
        sourceInfo={sourceInfo}
        isBusy={isBusy}
        onFileSelect={loadFile}
        onReplaceFile={loadFile}
        error={error}
      />

      {/* Processing Status Message */}
      {status && (
        <div
          aria-live="polite"
          className="flex min-h-8 items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]"
        >
          {isBusy && (
            <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
          )}
          <span>{status}</span>
        </div>
      )}

      {/* Main Document Workspace Grid */}
      {activePage ? (
        <div className="grid gap-6 xl:grid-cols-12">
          {/* Left Column: Thumbnails Sidebar */}
          <div className="xl:col-span-2">
            <SidebarThumbnails
              pages={pages}
              activePageIndex={activePageIndex}
              onSelectPage={selectPage}
              sourceType={sourceInfo?.type}
            />
          </div>

          {/* Middle Column: Interactive Document Canvas Viewer */}
          <div className="space-y-6 xl:col-span-7">
            <DocumentViewer
              activePage={activePage}
              activePageIndex={activePageIndex}
              totalPages={pages.length}
              onSelectPage={selectPage}
              selectedRectangleId={selectedRectangleId}
              onSelectRectangle={setSelectedRectangleId}
              onStartDrawing={startDrawing}
              onStartMoving={startMoving}
              onContinueInteraction={continueInteraction}
              onFinishInteraction={finishInteraction}
              draftRectangle={draftRectangle}
              onRectangleKeyDown={handleRectangleKeyDown}
              searchMatches={searchMatches}
            />

            {/* Privacy Analytics & Recommendations */}
            {(showAssistant || privacyScore.advice.length > 0) && (
              <PrivacyAnalytics
                privacyScore={privacyScore}
                onApplyAdvice={handleRedactAllHighRisk}
              />
            )}
          </div>

          {/* Right Column: Editing Tools & Smart Detection Dashboard */}
          <div className="space-y-6 xl:col-span-3">
            <EditingToolbar
              activeToolMode="select"
              onChangeToolMode={() => {}}
              selectedRedactionMode={selectedRedactionMode}
              onChangeRedactionMode={setSelectedRedactionMode}
              selectedRectangle={selectedRectangle}
              onUpdateSelected={updateSelectedRectangle}
              onRemoveSelected={removeRectangle}
              onAddPreset={addPreset}
              onAddCustom={addCustomRectangle}
              onClearPage={clearPage}
              onCopyToAllPages={copySelectedToAllPages}
              pageCount={pages.length}
              activePageRectanglesCount={activePage.rectangles.length}
            />

            {detectedItems.length > 0 && (
              <DetectionDashboard
                detectedItems={detectedItems}
                onRedactItem={handleRedactDetectedItem}
                onIgnoreItem={handleIgnoreDetectedItem}
                onRedactAllHighRisk={handleRedactAllHighRisk}
                onRedactAllSelected={handleRedactAllSelected}
                onClearDetected={() => setDetectedItems([])}
                activePageIndex={activePageIndex}
                onJumpToPage={selectPage}
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Export & Inspection Section */}
      {sourceInfo && (
        <ExportSection
          sourceInfo={sourceInfo}
          totalRedactions={totalRedactions}
          rasterDpi={rasterDpi}
          onChangeRasterDpi={(dpi) => {
            clearResult();
            setRasterDpi(dpi);
          }}
          exportAcknowledged={exportAcknowledged}
          onChangeExportAcknowledged={(ack) => {
            clearResult();
            setExportAcknowledged(ack);
          }}
          pagesWithoutRedactions={pagesWithoutRedactions}
          isBusy={isBusy}
          onExportResult={exportResult}
          result={result}
          inspectionConfirmed={inspectionConfirmed}
          onChangeInspectionConfirmed={setInspectionConfirmed}
        />
      )}

      {/* Completion Summary Screen */}
      {result && inspectionConfirmed && (
        <CompletionScreen
          result={result}
          sourceInfo={sourceInfo}
          privacyScore={privacyScore}
          processingTimeMs={processingTimeMs}
          onResetWorkspace={resetWorkspace}
        />
      )}
    </main>
  );
}
