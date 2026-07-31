"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  EyeOff,
  Image as ImageIcon,
  MousePointer2,
  Move,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";

import {
  boxBlurRgba,
  clampRectangle,
  hitTestRectangles,
  normalizeRectangle,
  pixelateRgba,
  suggestTextLikeRegions,
  transformRectangle,
} from "../lib/editorLogic.mjs";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 16_000_000;
const MIN_RECTANGLE_SIZE = 8;
const HISTORY_LIMIT = 30;
const DEFAULT_STRENGTH = 16;

const MASK_MODES = [
  {
    id: "mask",
    label: "Solid mask",
    description: "Strongest visual cover",
    icon: EyeOff,
  },
  {
    id: "blur",
    label: "Blur",
    description: "Softens details",
    icon: Sparkles,
  },
  {
    id: "pixelate",
    label: "Pixelate",
    description: "Blocks fine detail",
    icon: ScanLine,
  },
];

function cloneRectangles(rectangles) {
  return rectangles.map((rectangle) => ({ ...rectangle }));
}

function createRectangleId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `mask-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function integerRectangle(rectangle, bounds) {
  const safe = clampRectangle(rectangle, bounds, 1);
  const x = Math.floor(safe.x);
  const y = Math.floor(safe.y);
  const right = Math.min(bounds.width, Math.ceil(safe.x + safe.width));
  const bottom = Math.min(bounds.height, Math.ceil(safe.y + safe.height));

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  };
}

function applyRectangles(canvas, image, rectangles) {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0);

  rectangles.forEach((rectangle) => {
    const region = integerRectangle(rectangle, {
      width: canvas.width,
      height: canvas.height,
    });

    if (rectangle.mode === "mask") {
      context.fillRect(region.x, region.y, region.width, region.height);
      return;
    }

    const imageData = context.getImageData(region.x, region.y, region.width, region.height);
    const strength = Math.max(4, Math.min(40, Number(rectangle.strength) || 12));
    const edited =
      rectangle.mode === "pixelate"
        ? pixelateRgba(imageData.data, region.width, region.height, strength)
        : boxBlurRgba(
            imageData.data,
            region.width,
            region.height,
            Math.max(2, Math.round(strength / 2)),
          );

    imageData.data.set(edited);
    context.putImageData(imageData, region.x, region.y);
  });

  return context;
}

function drawEditorOutlines(canvas, rectangles, selectedId) {
  const context = canvas.getContext("2d");
  if (!context || !rectangles.length) return;

  const rootStyles = getComputedStyle(document.documentElement);
  const primary = rootStyles.getPropertyValue("--primary").trim();
  const borderStrong = rootStyles.getPropertyValue("--border-strong").trim();
  const displayScale = canvas.clientWidth ? canvas.width / canvas.clientWidth : 1;
  const lineWidth = Math.max(2, displayScale * 2);
  const handleSize = Math.max(6, displayScale * 6);

  rectangles.forEach((rectangle) => {
    const selected = rectangle.id === selectedId;
    context.save();
    context.lineWidth = lineWidth;
    if (selected && primary) context.strokeStyle = primary;
    if (!selected && borderStrong) context.strokeStyle = borderStrong;
    context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    if (selected) {
      if (primary) context.fillStyle = primary;
      const corners = [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
      ];
      corners.forEach(([x, y]) => {
        context.fillRect(
          x - handleSize / 2,
          y - handleSize / 2,
          handleSize,
          handleSize,
        );
      });
    }
    context.restore();
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function modeLabel(mode) {
  return MASK_MODES.find((entry) => entry.id === mode)?.label || "Mask";
}

function triggerDownload(url, filename) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function ScreenshotPrivacyMasker() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const interactionRef = useRef(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeMode, setActiveMode] = useState("mask");
  const [exportFormat, setExportFormat] = useState("png");
  const [status, setStatus] = useState(
    "Choose, drop, or paste a screenshot. Nothing is uploaded.",
  );
  const [error, setError] = useState("");
  const [themeRevision, setThemeRevision] = useState(0);

  const selectedRectangle = useMemo(
    () => rectangles.find((rectangle) => rectangle.id === selectedId) || null,
    [rectangles, selectedId],
  );

  const rememberCurrent = useCallback(() => {
    setHistory((current) => [
      ...current.slice(-(HISTORY_LIMIT - 1)),
      cloneRectangles(rectangles),
    ]);
  }, [rectangles]);

  const commitRectangles = useCallback(
    (nextRectangles, message) => {
      rememberCurrent();
      setRectangles(nextRectangles);
      if (message) setStatus(message);
    },
    [rememberCurrent],
  );

  const loadFile = useCallback((file) => {
    setError("");
    if (!file?.type?.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("This image is larger than 25 MB. Choose a smaller screenshot.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
        URL.revokeObjectURL(objectUrl);
        setError("This image has too many pixels to edit safely in the browser.");
        return;
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = objectUrl;
      setImageInfo({
        element: image,
        name: file.name || "pasted-screenshot.png",
        size: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setRectangles([]);
      setHistory([]);
      setSelectedId(null);
      setStatus(
        `Screenshot ready: ${image.naturalWidth} × ${image.naturalHeight}. Draw a region to hide.`,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("The browser could not decode this image.");
    };
    image.src = objectUrl;
  }, []);

  const clearImage = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageInfo(null);
    setRectangles([]);
    setHistory([]);
    setSelectedId(null);
    setError("");
    setStatus("Screenshot cleared. Nothing was stored.");
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      const imageItem = [...(event.clipboardData?.items || [])].find((item) =>
        item.type.startsWith("image/"),
      );
      const imageFile = imageItem?.getAsFile();
      if (imageFile) {
        loadFile(imageFile);
        setStatus("Pasted screenshot loaded locally.");
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeRevision((revision) => revision + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!imageInfo?.element || !canvasRef.current) return undefined;
    const canvas = canvasRef.current;
    const frame = window.requestAnimationFrame(() => {
      applyRectangles(canvas, imageInfo.element, rectangles);
      drawEditorOutlines(canvas, rectangles, selectedId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [imageInfo, rectangles, selectedId, themeRevision]);

  const handleFiles = (files) => {
    const file = [...(files || [])].find((candidate) =>
      candidate.type.startsWith("image/"),
    );
    if (file) loadFile(file);
    else setError("No supported image was found.");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
      displayScale: canvas.width / bounds.width,
    };
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0 || !imageInfo || !canvasRef.current) return;
    event.preventDefault();
    canvasRef.current.focus();
    const point = getCanvasPoint(event);
    const hit = hitTestRectangles(rectangles, point, point.displayScale * 10);

    if (hit) {
      const originalRectangle = rectangles.find((rectangle) => rectangle.id === hit.id);
      setSelectedId(hit.id);
      interactionRef.current = {
        kind: hit.part,
        handle: hit.handle,
        id: hit.id,
        start: point,
        originalRectangle: { ...originalRectangle },
        historyRecorded: false,
      };
    } else {
      rememberCurrent();
      const id = createRectangleId();
      const rectangle = {
        id,
        ...normalizeRectangle(point, point, imageInfo, 1),
        mode: activeMode,
        strength: DEFAULT_STRENGTH,
      };
      setRectangles([...rectangles, rectangle]);
      setSelectedId(id);
      interactionRef.current = {
        kind: "draw",
        id,
        start: point,
        historyRecorded: true,
      };
    }

    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current;
    if (!interaction || !imageInfo) return;
    const point = getCanvasPoint(event);

    if (interaction.kind === "draw") {
      const nextRectangle = normalizeRectangle(
        interaction.start,
        point,
        imageInfo,
        1,
      );
      setRectangles((current) =>
        current.map((rectangle) =>
          rectangle.id === interaction.id
            ? { ...rectangle, ...nextRectangle }
            : rectangle,
        ),
      );
      return;
    }

    if (!interaction.historyRecorded) {
      interaction.historyRecorded = true;
      rememberCurrent();
    }

    const action = {
      kind: interaction.kind,
      handle: interaction.handle,
      dx: point.x - interaction.start.x,
      dy: point.y - interaction.start.y,
    };
    const transformed = transformRectangle(
      interaction.originalRectangle,
      action,
      imageInfo,
      MIN_RECTANGLE_SIZE,
    );
    setRectangles((current) =>
      current.map((rectangle) =>
        rectangle.id === interaction.id
          ? { ...rectangle, ...transformed }
          : rectangle,
      ),
    );
  };

  const finishPointerInteraction = (event) => {
    const interaction = interactionRef.current;
    if (!interaction) return;

    if (interaction.kind === "draw") {
      setRectangles((current) => {
        const created = current.find((rectangle) => rectangle.id === interaction.id);
        if (
          !created ||
          created.width < MIN_RECTANGLE_SIZE ||
          created.height < MIN_RECTANGLE_SIZE
        ) {
          setSelectedId(null);
          setStatus("Region was too small, so it was not added.");
          return current.filter((rectangle) => rectangle.id !== interaction.id);
        }
        setStatus(`${modeLabel(created.mode)} region added.`);
        return current;
      });
    } else if (interaction.historyRecorded) {
      setStatus("Region position updated.");
    } else {
      setStatus("Region selected.");
    }

    interactionRef.current = null;
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const updateSelected = (updates, message) => {
    if (!selectedId) return;
    commitRectangles(
      rectangles.map((rectangle) =>
        rectangle.id === selectedId ? { ...rectangle, ...updates } : rectangle,
      ),
      message,
    );
  };

  // Applies an update without pushing a new history entry. Used for
  // continuous inputs (e.g. dragging the strength slider) where each
  // intermediate value should not consume its own undo step.
  const updateSelectedLive = (updates, message) => {
    if (!selectedId) return;
    setRectangles((current) =>
      current.map((rectangle) =>
        rectangle.id === selectedId ? { ...rectangle, ...updates } : rectangle,
      ),
    );
    if (message) setStatus(message);
  };

  const beginStrengthAdjustment = (event) => {
    if (event?.type === "keydown" && event.repeat) return;
    rememberCurrent();
  };

  const removeRectangle = (id) => {
    commitRectangles(
      rectangles.filter((rectangle) => rectangle.id !== id),
      "Region removed.",
    );
    if (selectedId === id) setSelectedId(null);
  };

  const undo = useCallback(() => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setRectangles(cloneRectangles(previous));
    setHistory(history.slice(0, -1));
    setSelectedId(null);
    setStatus("Last edit undone.");
  }, [history]);

  const handleCanvasKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }
    if (!selectedRectangle || !imageInfo) return;

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeRectangle(selectedRectangle.id);
      return;
    }

    const deltas = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (!deltas[event.key]) return;

    event.preventDefault();
    const multiplier = event.shiftKey ? 10 : 1;
    const [baseX, baseY] = deltas[event.key];
    const action = event.altKey
      ? {
          kind: "resize",
          handle: "se",
          dx: baseX * multiplier,
          dy: baseY * multiplier,
        }
      : {
          kind: "move",
          dx: baseX * multiplier,
          dy: baseY * multiplier,
        };
    const transformed = transformRectangle(
      selectedRectangle,
      action,
      imageInfo,
      MIN_RECTANGLE_SIZE,
    );
    commitRectangles(
      rectangles.map((rectangle) =>
        rectangle.id === selectedId
          ? { ...rectangle, ...transformed }
          : rectangle,
      ),
      event.altKey ? "Region resized with keyboard." : "Region moved with keyboard.",
    );
  };

  const suggestRegions = () => {
    if (!imageInfo?.element) return;
    const analysisCanvas = document.createElement("canvas");
    const scale = Math.min(1, 600 / imageInfo.width, 400 / imageInfo.height);
    analysisCanvas.width = Math.max(2, Math.round(imageInfo.width * scale));
    analysisCanvas.height = Math.max(2, Math.round(imageInfo.height * scale));
    const context = analysisCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(
      imageInfo.element,
      0,
      0,
      analysisCanvas.width,
      analysisCanvas.height,
    );
    const imageData = context.getImageData(
      0,
      0,
      analysisCanvas.width,
      analysisCanvas.height,
    );
    const suggestions = suggestTextLikeRegions(
      imageData.data,
      analysisCanvas.width,
      analysisCanvas.height,
    ).map((region) => ({
      id: createRectangleId(),
      x: region.x / scale,
      y: region.y / scale,
      width: region.width / scale,
      height: region.height / scale,
      mode: activeMode,
      strength: DEFAULT_STRENGTH,
    }));

    if (!suggestions.length) {
      setStatus("No high-contrast regions were suggested. Draw masks manually.");
      return;
    }

    commitRectangles(
      [...rectangles, ...suggestions],
      `${suggestions.length} local suggestions added. Inspect every region before export.`,
    );
    setSelectedId(suggestions[0].id);
  };

  const exportImage = () => {
    if (!imageInfo?.element) return;
    const canvas = document.createElement("canvas");
    applyRectangles(canvas, imageInfo.element, rectangles);
    const mimeType = exportFormat === "jpeg" ? "image/jpeg" : "image/png";
    const baseName =
      imageInfo.name.replace(/\.[^./\\]+$/, "").replace(/[^\w-]+/g, "-") ||
      "screenshot";
    setStatus("Flattening the edited image in your browser…");
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("The browser could not export this image.");
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(
          url,
          `${baseName}-privacy-masked.${exportFormat === "jpeg" ? "jpg" : "png"}`,
        );
        window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
        setStatus("Flattened image downloaded. Verify it before sharing.");
      },
      mimeType,
      exportFormat === "jpeg" ? 0.92 : undefined,
    );
  };

  const setMode = (mode) => {
    setActiveMode(mode);
    if (selectedRectangle) {
      updateSelected({ mode }, `${modeLabel(mode)} applied to selected region.`);
    } else {
      setStatus(`${modeLabel(mode)} selected for the next region.`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-primary">
            Browser-only privacy editor
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Screenshot Privacy Masker
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted-foreground)]">
            Cover sensitive regions with a solid mask, blur, or pixelation. Your image
            stays in this browser tab and exports as a flattened copy.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              No upload or account
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
              Flattened PNG or JPEG
            </span>
          </div>
        </div>
      </header>

      <section
        className="mt-6 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4"
        aria-label="Privacy warning"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-1 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold">Review every masked area before sharing</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              This tool cannot guarantee that all sensitive content is found. Solid masks
              are safer than blur or pixelation for secrets; the optional suggestions are
              only a simple local high-contrast heuristic.
            </p>
          </div>
        </div>
      </section>

      {!imageInfo ? (
        <section
          className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] p-6 text-center shadow-sm sm:p-10"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Choose or drop a screenshot</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            PNG, JPEG, WebP, and other browser-supported images up to 25 MB. You can
            also paste an image from your clipboard.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Choose image
            </button>
            <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Paste anywhere
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
            aria-label="Choose screenshot"
          />
        </section>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="min-w-0 lg:col-span-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{imageInfo.name}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {imageInfo.width} × {imageInfo.height} ·{" "}
                      {formatFileSize(imageInfo.size)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-2"
                      onClick={undo}
                      disabled={!history.length}
                    >
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                      Undo
                    </button>
                    <button
                      type="button"
                      className="btn-secondary inline-flex items-center gap-2"
                      onClick={clearImage}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2" aria-label="Mask type">
                  {MASK_MODES.map(({ id, label, icon: Icon, description }) => (
                    <button
                      key={id}
                      type="button"
                      title={description}
                      className={`btn-secondary inline-flex items-center gap-2 ${
                        activeMode === id
                          ? "border-primary bg-primary/10 text-primary"
                          : ""
                      }`}
                      aria-pressed={activeMode === id}
                      onClick={() => setMode(id)}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={suggestRegions}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Suggest regions
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-2">
                <canvas
                  ref={canvasRef}
                  className="mx-auto block h-auto max-h-screen w-auto max-w-full touch-none cursor-crosshair rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  tabIndex={0}
                  role="application"
                  aria-roledescription="screenshot masking canvas"
                  aria-label="Screenshot mask editor. Draw with the pointer. Select a region and use arrow keys to move it."
                  aria-describedby="editor-help"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishPointerInteraction}
                  onPointerCancel={finishPointerInteraction}
                  onKeyDown={handleCanvasKeyDown}
                />
              </div>

              <div
                id="editor-help"
                className="mt-4 flex items-start gap-3 rounded-lg bg-[var(--surface-soft)] p-3 text-sm text-[var(--muted-foreground)]"
              >
                <MousePointer2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  Drag empty space to draw. Drag inside a region to move it or drag a
                  corner to resize. Keyboard: arrows move, Shift + arrows move by 10
                  pixels, Alt + arrows resize, and Delete removes.
                </p>
              </div>
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <h2 className="text-lg font-bold">Region settings</h2>
              {selectedRectangle ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="region-mode"
                      className="text-sm font-semibold text-[var(--foreground)]"
                    >
                      Effect
                    </label>
                    <select
                      id="region-mode"
                      value={selectedRectangle.mode}
                      className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      onChange={(event) =>
                        updateSelected(
                          { mode: event.target.value },
                          `${modeLabel(event.target.value)} applied.`,
                        )
                      }
                    >
                      {MASK_MODES.map((mode) => (
                        <option key={mode.id} value={mode.id} title={mode.description}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRectangle.mode !== "mask" ? (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="region-strength"
                          className="text-sm font-semibold text-[var(--foreground)]"
                        >
                          Strength
                        </label>
                        <span className="text-sm font-bold text-primary">
                          {selectedRectangle.strength}
                        </span>
                      </div>
                      <input
                        id="region-strength"
                        type="range"
                        min="4"
                        max="40"
                        step="2"
                        value={selectedRectangle.strength}
                        className="mt-2 w-full accent-[var(--primary)]"
                        onPointerDown={beginStrengthAdjustment}
                        onKeyDown={beginStrengthAdjustment}
                        onChange={(event) =>
                          updateSelectedLive(
                            { strength: Number(event.target.value) },
                            "Effect strength updated.",
                          )
                        }
                      />
                    </div>
                  ) : null}

                  <dl className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--surface-soft)] p-3 text-sm">
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Position</dt>
                      <dd className="mt-1 font-semibold">
                        {Math.round(selectedRectangle.x)}, {Math.round(selectedRectangle.y)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Size</dt>
                      <dd className="mt-1 font-semibold">
                        {Math.round(selectedRectangle.width)} ×{" "}
                        {Math.round(selectedRectangle.height)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                    onClick={() => removeRectangle(selectedRectangle.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove selected region
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Draw or select a region to change its effect and strength.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Regions</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {rectangles.length}
                </span>
              </div>
              {rectangles.length ? (
                <ol className="mt-4 max-h-64 space-y-2 overflow-auto">
                  {rectangles.map((rectangle, index) => (
                    <li key={rectangle.id}>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                          selectedId === rectangle.id
                            ? "border-primary bg-primary/10"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                        onClick={() => setSelectedId(rectangle.id)}
                        aria-pressed={selectedId === rectangle.id}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Move className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate text-sm font-semibold">
                            Region {index + 1}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                          {modeLabel(rectangle.mode)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No regions yet. Draw on the screenshot.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <h2 className="text-lg font-bold">Export flattened copy</h2>
              <label
                htmlFor="export-format"
                className="mt-4 block text-sm font-semibold text-[var(--foreground)]"
              >
                Image format
              </label>
              <select
                id="export-format"
                value={exportFormat}
                className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                onChange={(event) => setExportFormat(event.target.value)}
              >
                <option value="png">PNG — lossless</option>
                <option value="jpeg">JPEG — smaller file</option>
              </select>
              <button
                type="button"
                className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
                onClick={exportImage}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download flattened image
              </button>
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                Re-open the download and zoom in to confirm that every secret is covered.
              </p>
            </section>
          </aside>
        </div>
      )}

      <div
        className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted-foreground)]"
        role="status"
        aria-live="polite"
      >
        {status}
      </div>
      {error ? (
        <div
          className="mt-6 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </main>
  );
}
