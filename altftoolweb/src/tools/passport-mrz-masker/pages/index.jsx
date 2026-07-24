"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  EyeOff,
  FileImage,
  Image as ImageIcon,
  LockKeyhole,
  Move,
  Plus,
  RectangleHorizontal,
  ScanLine,
  ShieldCheck,
  Trash2,
  Undo2,
  Upload,
  User,
} from "lucide-react";

import {
  clampMask,
  createPresetMask,
  getExportSpec,
  hitTestMasks,
  maskToIntegerPixels,
  normalizeDrag,
  transformMask,
} from "../lib/passportMaskGeometry.mjs";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 20_000_000;
const MIN_MASK_SIZE = 12;
const HISTORY_LIMIT = 30;

const CONTROL_CLASS =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

const PRESET_OPTIONS = [
  {
    key: "mrz",
    label: "MRZ bottom zone",
    description: "Common two- or three-line zone",
    icon: ScanLine,
  },
  {
    key: "passportNumber",
    label: "Passport number",
    description: "Approximate upper details area",
    icon: RectangleHorizontal,
  },
  {
    key: "face",
    label: "Face",
    description: "Approximate portrait area",
    icon: User,
  },
  {
    key: "custom",
    label: "Custom area",
    description: "Add a centred adjustable mask",
    icon: Plus,
  },
];

function cloneMasks(masks) {
  return masks.map((mask) => ({ ...mask }));
}

function createMaskId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `passport-mask-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function triggerDownload(url, filename) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function paintMaskedImage(
  canvas,
  image,
  masks,
  { selectedId = null, showOutlines = false } = {},
) {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return false;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const rootStyles = getComputedStyle(document.documentElement);
  const maskColour = rootStyles.getPropertyValue("--foreground").trim();
  const primaryColour = rootStyles.getPropertyValue("--primary").trim();
  const borderColour = rootStyles.getPropertyValue("--border-strong").trim();
  const displayScale = canvas.clientWidth
    ? canvas.width / canvas.clientWidth
    : 1;
  const lineWidth = Math.max(2, displayScale * 2);
  const handleSize = Math.max(6, displayScale * 6);

  masks.forEach((mask) => {
    const rectangle = maskToIntegerPixels(mask, {
      width: canvas.width,
      height: canvas.height,
    });

    context.save();
    if (maskColour) context.fillStyle = maskColour;
    context.fillRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    );

    if (showOutlines) {
      context.lineWidth = lineWidth;
      if (mask.id === selectedId && primaryColour) {
        context.strokeStyle = primaryColour;
      } else if (borderColour) {
        context.strokeStyle = borderColour;
      }
      context.strokeRect(mask.x, mask.y, mask.width, mask.height);

      if (mask.id === selectedId) {
        if (primaryColour) context.fillStyle = primaryColour;
        const handles = [
          [mask.x, mask.y],
          [mask.x + mask.width, mask.y],
          [mask.x, mask.y + mask.height],
          [mask.x + mask.width, mask.y + mask.height],
        ];
        handles.forEach(([x, y]) => {
          context.fillRect(
            x - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize,
          );
        });
      }
    }
    context.restore();
  });

  return true;
}

function GeometryField({ label, value, maximum, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min="0"
        max={Math.max(1, Math.round(maximum))}
        step="1"
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className={CONTROL_CLASS}
      />
    </label>
  );
}

export default function PassportMrzMasker() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const interactionRef = useRef(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [masks, setMasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [exportFormat, setExportFormat] = useState("png");
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false);
  const [status, setStatus] = useState(
    "Choose a passport image to begin. Nothing is uploaded.",
  );
  const [error, setError] = useState("");
  const [themeRevision, setThemeRevision] = useState(0);

  const selectedMask = useMemo(
    () => masks.find((mask) => mask.id === selectedId) || null,
    [masks, selectedId],
  );

  const rememberCurrent = useCallback(() => {
    setHistory((current) => [
      ...current.slice(-(HISTORY_LIMIT - 1)),
      cloneMasks(masks),
    ]);
  }, [masks]);

  const commitMasks = useCallback(
    (nextMasks, message) => {
      rememberCurrent();
      setMasks(nextMasks);
      setInspectionConfirmed(false);
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
      setError("This image is larger than 25 MB. Choose a smaller file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
        URL.revokeObjectURL(objectUrl);
        setError(
          "This image has too many pixels to edit safely in this browser.",
        );
        return;
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = objectUrl;
      setImageInfo({
        element: image,
        name: file.name || "passport-image",
        size: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setMasks([]);
      setHistory([]);
      setSelectedId(null);
      setInspectionConfirmed(false);
      setStatus(
        `Image ready: ${image.naturalWidth} × ${image.naturalHeight}. Add a preset or draw a custom mask.`,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("The browser could not decode this image.");
    };
    image.src = objectUrl;
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

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
      paintMaskedImage(canvas, imageInfo.element, masks, {
        selectedId,
        showOutlines: true,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [imageInfo, masks, selectedId, themeRevision]);

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

  const clearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageInfo(null);
    setMasks([]);
    setHistory([]);
    setSelectedId(null);
    setInspectionConfirmed(false);
    setError("");
    setStatus("Image cleared. Nothing was stored.");
  };

  const addPreset = (presetKey) => {
    if (!imageInfo) return;
    const newMask = createPresetMask(presetKey, imageInfo, createMaskId());
    commitMasks(
      [...masks, newMask],
      `${newMask.label} preset added. Resize and reposition it for this document.`,
    );
    setSelectedId(newMask.id);
  };

  const removeMask = (id) => {
    commitMasks(
      masks.filter((mask) => mask.id !== id),
      "Mask removed.",
    );
    if (selectedId === id) setSelectedId(null);
  };

  const undo = useCallback(() => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setMasks(cloneMasks(previous));
    setHistory(history.slice(0, -1));
    setSelectedId(null);
    setInspectionConfirmed(false);
    setStatus("Last mask edit undone.");
  }, [history]);

  const updateSelected = (updates, message) => {
    if (!selectedMask || !imageInfo) return;
    const updated = clampMask(
      { ...selectedMask, ...updates },
      imageInfo,
      MIN_MASK_SIZE,
    );
    commitMasks(
      masks.map((mask) => (mask.id === selectedId ? updated : mask)),
      message,
    );
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
    const hit = hitTestMasks(masks, point, point.displayScale * 10);
    rememberCurrent();
    setInspectionConfirmed(false);

    if (hit) {
      const originalMask = masks.find((mask) => mask.id === hit.id);
      setSelectedId(hit.id);
      interactionRef.current = {
        kind: hit.part,
        handle: hit.handle,
        id: hit.id,
        start: point,
        originalMask: { ...originalMask },
      };
    } else {
      const id = createMaskId();
      const newMask = {
        id,
        preset: "custom",
        label: "Custom area",
        ...normalizeDrag(point, point, imageInfo, 1),
      };
      setMasks([...masks, newMask]);
      setSelectedId(id);
      interactionRef.current = {
        kind: "draw",
        id,
        start: point,
      };
    }

    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current;
    if (!interaction || !imageInfo) return;
    const point = getCanvasPoint(event);

    if (interaction.kind === "draw") {
      const nextRectangle = normalizeDrag(
        interaction.start,
        point,
        imageInfo,
        1,
      );
      setMasks((current) =>
        current.map((mask) =>
          mask.id === interaction.id ? { ...mask, ...nextRectangle } : mask,
        ),
      );
      return;
    }

    const transformed = transformMask(
      interaction.originalMask,
      {
        kind: interaction.kind,
        handle: interaction.handle,
        dx: point.x - interaction.start.x,
        dy: point.y - interaction.start.y,
      },
      imageInfo,
      MIN_MASK_SIZE,
    );
    setMasks((current) =>
      current.map((mask) => (mask.id === interaction.id ? transformed : mask)),
    );
  };

  const finishPointerInteraction = (event) => {
    const interaction = interactionRef.current;
    if (!interaction) return;

    if (interaction.kind === "draw") {
      setMasks((current) => {
        const created = current.find((mask) => mask.id === interaction.id);
        if (
          !created ||
          created.width < MIN_MASK_SIZE ||
          created.height < MIN_MASK_SIZE
        ) {
          setSelectedId(null);
          setStatus("The drawn area was too small, so it was not added.");
          return current.filter((mask) => mask.id !== interaction.id);
        }
        setStatus("Custom mask added.");
        return current;
      });
    } else {
      setStatus("Mask position updated.");
    }

    interactionRef.current = null;
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handleCanvasKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }
    if (!selectedMask || !imageInfo) return;

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeMask(selectedMask.id);
      return;
    }

    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (!directions[event.key]) return;

    event.preventDefault();
    const multiplier = event.shiftKey ? 10 : 1;
    const [baseX, baseY] = directions[event.key];
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
    const transformed = transformMask(
      selectedMask,
      action,
      imageInfo,
      MIN_MASK_SIZE,
    );
    commitMasks(
      masks.map((mask) => (mask.id === selectedMask.id ? transformed : mask)),
      event.altKey
        ? "Mask resized with the keyboard."
        : "Mask moved with the keyboard.",
    );
  };

  const exportImage = () => {
    if (!imageInfo?.element || !masks.length || !inspectionConfirmed) {
      return;
    }

    const canvas = document.createElement("canvas");
    const painted = paintMaskedImage(canvas, imageInfo.element, masks);
    if (!painted) {
      setError("The browser could not prepare this image.");
      return;
    }

    const exportSpec = getExportSpec(exportFormat, imageInfo.name);
    setError("");
    setStatus("Flattening the masked image in your browser…");
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("The browser could not export this image.");
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(url, exportSpec.filename);
        window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
        setStatus(
          "Flattened image downloaded. Re-open it, zoom in, and inspect every masked area before sharing.",
        );
      },
      exportSpec.mimeType,
      exportSpec.quality,
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-primary">
            Local passport image privacy
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Passport &amp; MRZ Masker
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Manually cover MRZ lines, passport numbers, faces, or any custom
            region, then download a flattened PNG or JPEG.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-2">
              <LockKeyhole
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              No upload or storage
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-2">
              <EyeOff className="h-4 w-4 text-primary" aria-hidden="true" />
              No OCR or identity verification
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-2">
              <CheckCircle2
                className="h-4 w-4 text-success"
                aria-hidden="true"
              />
              Flattened local export
            </span>
          </div>
        </div>
      </header>

      <section
        className="mt-6 rounded-lg border border-warning bg-warning-soft p-4"
        aria-label="Preset and inspection warning"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-1 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold">
              Presets are starting points, not document detection
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Passport layouts vary by country, version, crop, and scan. This
              tool does not read, detect, store, validate, or verify identity
              data. Resize every mask and inspect the final download before
              sharing it.
            </p>
          </div>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/*"
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
        aria-label="Choose passport image"
      />

      {!imageInfo ? (
        <section
          className="mt-6 rounded-xl border border-dashed border-border-strong bg-surface p-6 text-center shadow-sm sm:p-10"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold">
            Choose or drop a passport image
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            PNG, JPEG, WebP, or another browser-supported image up to 25 MB.
            Processing stays in this browser tab.
          </p>
          <button
            type="button"
            className="btn-primary mt-5 inline-flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            Choose image
          </button>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="min-w-0 lg:col-span-2">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">
                    {imageInfo.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage className="h-4 w-4" aria-hidden="true" />
                    Replace
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

              <div className="mt-4 overflow-auto rounded-lg border border-border bg-surface-soft p-2">
                <canvas
                  ref={canvasRef}
                  className="mx-auto block h-auto max-h-screen w-auto max-w-full touch-none cursor-crosshair rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  tabIndex={0}
                  role="application"
                  aria-roledescription="passport masking canvas"
                  aria-label="Passport image mask editor. Draw with the pointer. Select a mask and use arrow keys to move it."
                  aria-describedby="passport-editor-help"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishPointerInteraction}
                  onPointerCancel={finishPointerInteraction}
                  onKeyDown={handleCanvasKeyDown}
                />
              </div>

              <div
                id="passport-editor-help"
                className="mt-4 flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm text-muted-foreground"
              >
                <Move
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p>
                  Drag empty space to draw. Drag inside a mask to move it or
                  drag a corner to resize. Keyboard: arrows move, Shift + arrows
                  move by 10 pixels, Alt + arrows resize, and Delete removes the
                  selected mask.
                </p>
              </div>
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-bold">Add a mask</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Each preset is approximate. Adjust it on the preview.
              </p>
              <div className="mt-4 grid gap-2">
                {PRESET_OPTIONS.map(
                  ({ key, label, description, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      className="flex min-h-11 w-full items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                      onClick={() => addPreset(key)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {description}
                        </span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-bold">Selected mask</h2>
              {selectedMask ? (
                <div className="mt-4 space-y-4">
                  <p className="rounded-lg bg-surface-soft p-3 text-sm font-semibold">
                    {selectedMask.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <GeometryField
                      label="X position"
                      value={selectedMask.x}
                      maximum={imageInfo.width}
                      onChange={(value) =>
                        updateSelected({ x: value }, "Mask position updated.")
                      }
                    />
                    <GeometryField
                      label="Y position"
                      value={selectedMask.y}
                      maximum={imageInfo.height}
                      onChange={(value) =>
                        updateSelected({ y: value }, "Mask position updated.")
                      }
                    />
                    <GeometryField
                      label="Width"
                      value={selectedMask.width}
                      maximum={imageInfo.width}
                      onChange={(value) =>
                        updateSelected({ width: value }, "Mask size updated.")
                      }
                    />
                    <GeometryField
                      label="Height"
                      value={selectedMask.height}
                      maximum={imageInfo.height}
                      onChange={(value) =>
                        updateSelected({ height: value }, "Mask size updated.")
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-secondary inline-flex w-full items-center justify-center gap-2 border-danger text-danger hover:bg-danger-soft"
                    onClick={() => removeMask(selectedMask.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove selected mask
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Select a mask on the preview or in the list to edit exact
                  pixel coordinates.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Masks</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {masks.length}
                </span>
              </div>
              {masks.length ? (
                <ol className="mt-4 max-h-64 space-y-2 overflow-auto">
                  {masks.map((mask, index) => (
                    <li key={mask.id}>
                      <button
                        type="button"
                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md border p-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 ${
                          selectedId === mask.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background"
                        }`}
                        onClick={() => setSelectedId(mask.id)}
                        aria-pressed={selectedId === mask.id}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Move
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm font-semibold">
                            {mask.label}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {index + 1}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No masks yet. Add a preset or draw on the image.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-bold">Export flattened copy</h2>
              <label
                htmlFor="passport-export-format"
                className="mt-4 block text-sm font-semibold"
              >
                Image format
              </label>
              <select
                id="passport-export-format"
                value={exportFormat}
                className={`${CONTROL_CLASS} mt-2`}
                onChange={(event) => setExportFormat(event.target.value)}
              >
                <option value="png">PNG — lossless</option>
                <option value="jpeg">JPEG — smaller file</option>
              </select>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-3">
                <input
                  type="checkbox"
                  checked={inspectionConfirmed}
                  onChange={(event) =>
                    setInspectionConfirmed(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-sm leading-relaxed">
                  I inspected every mask at full preview size and understand I
                  must inspect the downloaded copy before sharing.
                </span>
              </label>

              <button
                type="button"
                className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2"
                onClick={exportImage}
                disabled={!masks.length || !inspectionConfirmed}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download flattened image
              </button>
              {!masks.length ? (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Add at least one mask before export.
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      )}

      <div
        className="mt-6 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {status}
      </div>
      {error ? (
        <div
          className="mt-6 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </main>
  );
}
