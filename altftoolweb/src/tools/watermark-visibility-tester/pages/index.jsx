"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Crop,
  Download,
  Eye,
  FileImage,
  ImageDown,
  MousePointer2,
  RefreshCw,
  ScanEye,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

import {
  analyzeRoiPixels,
  buildVisibilityReport,
  calculateWatermarkWorkingDimensions,
  centeredCropBounds,
  compareRoiSignals,
  mapRoiIntoCrop,
  normalizeRoi,
  parseWatermarkRasterDimensions,
  validateWatermarkRasterDimensions,
  watermarkRasterLimits,
} from "../lib/watermarkMetrics.mjs";

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_ROI = { x: 62, y: 76, width: 32, height: 16 };
const DEFAULT_SETTINGS = {
  jpegQuality: 45,
  resizePercent: 40,
  cropRetainedPercent: 80,
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("This browser could not decode the image."));
    image.src = url;
  });
}

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser could not encode a preview.")),
      type,
      quality,
    );
  });
}

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas image processing is unavailable.");
  return { canvas, context };
}

async function blobToCanvas(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const { canvas, context } = makeCanvas(
      image.naturalWidth,
      image.naturalHeight,
    );
    context.drawImage(image, 0, 0);
    return { canvas, context };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasImageData(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas image reading is unavailable.");
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "watermark-visibility-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatMetric(value) {
  return value === null || value === undefined ? "Not measurable" : `${value}%`;
}

function VariantCard({ variant, assessment, onAssessment }) {
  return (
    <article className="tool-card min-w-0 overflow-hidden">
      <div className="relative bg-surface-soft">
        <Image
          src={variant.url}
          alt={`${variant.label} stress preview`}
          width={variant.width}
          height={variant.height}
          unoptimized
          className="max-h-80 h-auto w-full object-contain"
        />
      </div>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="font-bold text-foreground">{variant.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {variant.detail}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-soft p-3">
            <dt className="text-xs font-semibold text-muted-foreground">
              ROI retained
            </dt>
            <dd className="mt-1 font-black text-foreground">
              {variant.retainedAreaPercent}%
            </dd>
          </div>
          <div className="rounded-lg bg-surface-soft p-3">
            <dt className="text-xs font-semibold text-muted-foreground">
              Pixel size
            </dt>
            <dd className="mt-1 font-black text-foreground">
              {variant.width} × {variant.height}
            </dd>
          </div>
          <div className="rounded-lg bg-surface-soft p-3">
            <dt className="text-xs font-semibold text-muted-foreground">
              Spread retained
            </dt>
            <dd className="mt-1 font-black text-foreground">
              {formatMetric(variant.signal?.spreadRetainedPercent)}
            </dd>
          </div>
          <div className="rounded-lg bg-surface-soft p-3">
            <dt className="text-xs font-semibold text-muted-foreground">
              Edges retained
            </dt>
            <dd className="mt-1 font-black text-foreground">
              {formatMetric(variant.signal?.edgeRetainedPercent)}
            </dd>
          </div>
        </dl>

        <fieldset>
          <legend className="text-xs font-bold text-foreground">
            Your visual review
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              ["readable", "Readable"],
              ["marginal", "Marginal"],
              ["lost", "Lost"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`min-h-10 rounded-md border px-2 text-xs font-bold transition-colors ${
                  assessment === value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-foreground hover:border-primary"
                }`}
                aria-pressed={assessment === value}
                onClick={() => onAssessment(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </article>
  );
}

export default function WatermarkVisibilityTester() {
  const fileInputRef = useRef(null);
  const stageRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const sourceUrlRef = useRef("");
  const generatedUrlsRef = useRef([]);
  const dragRef = useRef(null);

  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [roi, setRoi] = useState(DEFAULT_ROI);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [variants, setVariants] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const report = useMemo(
    () => buildVisibilityReport({ variants, assessments, settings }),
    [assessments, settings, variants],
  );

  useEffect(
    () => () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const clearGenerated = () => {
    generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    generatedUrlsRef.current = [];
    setVariants([]);
    setAssessments({});
  };

  const clearAll = () => {
    clearGenerated();
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    sourceCanvasRef.current = null;
    setSourceUrl("");
    setDimensions(null);
    setRoi(DEFAULT_ROI);
    setSettings(DEFAULT_SETTINGS);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFile = async (file) => {
    if (!file) return;
    if (!SUPPORTED_TYPES.has(file.type)) {
      setError(
        "Choose a JPEG, PNG, or WebP image. SVG is excluded to avoid external resources.",
      );
      return;
    }
    if (
      file.size <= 0 ||
      file.size > watermarkRasterLimits.maxFileBytes
    ) {
      setError("Choose a non-empty image no larger than 20 MB.");
      return;
    }

    setBusy(true);
    setError("");
    clearGenerated();
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    sourceCanvasRef.current = null;
    setSourceUrl("");
    setDimensions(null);
    let decodeUrl = "";
    let previewUrl = "";
    try {
      const header = new Uint8Array(
        await file
          .slice(
            0,
            Math.min(file.size, watermarkRasterLimits.maxHeaderBytes),
          )
          .arrayBuffer(),
      );
      const sourceDimensions = parseWatermarkRasterDimensions(header);
      if (!sourceDimensions || sourceDimensions.mediaType !== file.type) {
        throw new Error(
          "The file does not have a complete matching JPEG, PNG, or WebP header.",
        );
      }
      const sourceCheck =
        validateWatermarkRasterDimensions(sourceDimensions);
      if (!sourceCheck.ok) {
        throw new Error(
          `Image dimensions must be at most ${watermarkRasterLimits.maxSourceEdge.toLocaleString("en-US")}px per edge and ${watermarkRasterLimits.maxSourcePixels.toLocaleString("en-US")} total pixels.`,
        );
      }

      decodeUrl = URL.createObjectURL(file);
      const image = await loadImage(decodeUrl);
      const dimensionsMatch =
        (image.naturalWidth === sourceDimensions.width &&
          image.naturalHeight === sourceDimensions.height) ||
        (image.naturalWidth === sourceDimensions.height &&
          image.naturalHeight === sourceDimensions.width);
      if (!dimensionsMatch) {
        throw new Error(
          "The decoded image dimensions do not match its raster header.",
        );
      }
      const working = calculateWatermarkWorkingDimensions(
        image.naturalWidth,
        image.naturalHeight,
      );
      if (!working) {
        throw new Error("The decoded image dimensions are invalid.");
      }
      const { canvas, context } = makeCanvas(working.width, working.height);
      context.drawImage(image, 0, 0, working.width, working.height);
      const previewBlob = await canvasToBlob(canvas, "image/png");
      previewUrl = URL.createObjectURL(previewBlob);
      sourceCanvasRef.current = canvas;
      sourceUrlRef.current = previewUrl;
      setSourceUrl(previewUrl);
      setDimensions({
        width: working.width,
        height: working.height,
        sourceWidth: sourceDimensions.width,
        sourceHeight: sourceDimensions.height,
        downscaledForSafety: working.downscaledForSafety,
      });
      setRoi(DEFAULT_ROI);
      previewUrl = "";
    } catch (nextError) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      sourceUrlRef.current = "";
      sourceCanvasRef.current = null;
      setSourceUrl("");
      setDimensions(null);
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The image could not be opened.",
      );
    } finally {
      if (decodeUrl) URL.revokeObjectURL(decodeUrl);
      setBusy(false);
    }
  };

  const pointerPercent = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return null;
    return {
      x: Math.min(
        100,
        Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
      ),
      y: Math.min(
        100,
        Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
      ),
    };
  };

  const startSelection = (event) => {
    const point = pointerPercent(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = point;
    setRoi(normalizeRoi({ x: point.x, y: point.y, width: 0.5, height: 0.5 }));
    clearGenerated();
  };

  const moveSelection = (event) => {
    if (!dragRef.current) return;
    const point = pointerPercent(event);
    if (!point) return;
    const start = dragRef.current;
    setRoi(
      normalizeRoi({
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        width: Math.abs(point.x - start.x),
        height: Math.abs(point.y - start.y),
      }),
    );
  };

  const endSelection = () => {
    dragRef.current = null;
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: Number(value) }));
    clearGenerated();
  };

  const updateRoiValue = (key, value) => {
    setRoi((current) => normalizeRoi({ ...current, [key]: Number(value) }));
    clearGenerated();
  };

  const runStressTest = async () => {
    const sourceCanvas = sourceCanvasRef.current;
    if (!sourceCanvas) return;
    setBusy(true);
    setError("");
    clearGenerated();
    let pendingUrls = [];
    try {
      const baseline = analyzeRoiPixels(canvasImageData(sourceCanvas), roi);
      const next = [];

      const addVariant = async ({
        id,
        label,
        detail,
        canvas,
        blob,
        mappedRoi = roi,
        retainedAreaPercent = 100,
      }) => {
        const outputBlob = blob || (await canvasToBlob(canvas));
        const url = URL.createObjectURL(outputBlob);
        pendingUrls.push(url);
        const metrics = mappedRoi
          ? analyzeRoiPixels(canvasImageData(canvas), mappedRoi)
          : null;
        next.push({
          id,
          label,
          detail,
          url,
          width: canvas.width,
          height: canvas.height,
          retainedAreaPercent,
          signal: metrics ? compareRoiSignals(baseline, metrics) : null,
        });
      };

      const jpegBlob = await canvasToBlob(
        sourceCanvas,
        "image/jpeg",
        settings.jpegQuality / 100,
      );
      const jpeg = await blobToCanvas(jpegBlob);
      await addVariant({
        id: "jpeg",
        label: "JPEG compression",
        detail: `Encoded at browser quality ${settings.jpegQuality}%.`,
        canvas: jpeg.canvas,
        blob: jpegBlob,
      });

      const resizeScale = settings.resizePercent / 100;
      const resized = makeCanvas(
        sourceCanvas.width * resizeScale,
        sourceCanvas.height * resizeScale,
      );
      resized.context.drawImage(
        sourceCanvas,
        0,
        0,
        resized.canvas.width,
        resized.canvas.height,
      );
      await addVariant({
        id: "resize",
        label: "Downscaled image",
        detail: `Reduced to ${settings.resizePercent}% of each processed dimension.`,
        canvas: resized.canvas,
      });

      const grayscale = makeCanvas(sourceCanvas.width, sourceCanvas.height);
      grayscale.context.drawImage(sourceCanvas, 0, 0);
      const grayscalePixels = grayscale.context.getImageData(
        0,
        0,
        grayscale.canvas.width,
        grayscale.canvas.height,
      );
      for (let offset = 0; offset < grayscalePixels.data.length; offset += 4) {
        const gray = Math.round(
          0.2126 * grayscalePixels.data[offset] +
            0.7152 * grayscalePixels.data[offset + 1] +
            0.0722 * grayscalePixels.data[offset + 2],
        );
        grayscalePixels.data[offset] = gray;
        grayscalePixels.data[offset + 1] = gray;
        grayscalePixels.data[offset + 2] = gray;
      }
      grayscale.context.putImageData(grayscalePixels, 0, 0);
      await addVariant({
        id: "grayscale",
        label: "Grayscale conversion",
        detail: "Color information removed with relative-luminance weighting.",
        canvas: grayscale.canvas,
      });

      const cropBounds = centeredCropBounds(settings.cropRetainedPercent);
      const cropX = Math.round((cropBounds.x / 100) * sourceCanvas.width);
      const cropY = Math.round((cropBounds.y / 100) * sourceCanvas.height);
      const cropWidth = Math.max(
        1,
        Math.round((cropBounds.width / 100) * sourceCanvas.width),
      );
      const cropHeight = Math.max(
        1,
        Math.round((cropBounds.height / 100) * sourceCanvas.height),
      );
      const cropped = makeCanvas(cropWidth, cropHeight);
      cropped.context.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );
      const mapped = mapRoiIntoCrop(roi, cropBounds);
      await addVariant({
        id: "crop",
        label: "Centered crop",
        detail: `Retained the centered ${settings.cropRetainedPercent}% width and height.`,
        canvas: cropped.canvas,
        mappedRoi: mapped.roi,
        retainedAreaPercent: mapped.retainedPercent,
      });

      generatedUrlsRef.current = pendingUrls;
      pendingUrls = [];
      setVariants(next);
    } catch (nextError) {
      pendingUrls.forEach((url) => URL.revokeObjectURL(url));
      setError(
        nextError instanceof Error
          ? nextError.message
          : "The stress previews could not be generated.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="tool-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ScanEye className="h-4 w-4" aria-hidden="true" />
              Local visual stress test
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Watermark Visibility Tester
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Mark the watermark area, create common transformed previews
              locally, then record your own readability judgment.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <AlertTriangle
                className="h-5 w-5 text-warning"
                aria-hidden="true"
              />
              Visual review is required
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pixel metrics are not text recognition, ownership evidence,
              authenticity proof, or a guarantee that people can read the
              watermark.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="tool-card p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <MousePointer2
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Mark the watermark
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag directly across the visible watermark. A current selection
                replaces the old one.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose local image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={busy}
              aria-label="Choose a local image for watermark visibility testing"
              onChange={(event) =>
                void openFile(event.target.files?.[0] || null)
              }
            />
          </div>

          {sourceUrl && dimensions ? (
            <>
              <div
                ref={stageRef}
                className="relative mt-5 touch-none cursor-crosshair overflow-hidden rounded-lg border border-border bg-surface-soft"
                onPointerDown={startSelection}
                onPointerMove={moveSelection}
                onPointerUp={endSelection}
                onPointerCancel={endSelection}
                aria-label="Image selection surface"
              >
                <Image
                  src={sourceUrl}
                  alt="Uploaded image for local watermark inspection"
                  width={dimensions.width}
                  height={dimensions.height}
                  unoptimized
                  className="h-auto w-full select-none"
                  draggable={false}
                />
                <span
                  className="pointer-events-none absolute border-2 border-primary bg-primary-soft/30"
                  style={{
                    left: `${roi.x}%`,
                    top: `${roi.y}%`,
                    width: `${roi.width}%`,
                    height: `${roi.height}%`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  Header: {dimensions.sourceWidth} × {dimensions.sourceHeight} ·
                  Processed: {dimensions.width} × {dimensions.height}
                </span>
                <span>
                  ROI: {roi.width.toFixed(1)}% × {roi.height.toFixed(1)}%
                </span>
              </div>
              <fieldset className="mt-4">
                <legend className="text-sm font-bold text-foreground">
                  Keyboard-adjustable region percentages
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["x", "Left", 0, 99.5],
                    ["y", "Top", 0, 99.5],
                    ["width", "Width", 0.5, 100 - roi.x],
                    ["height", "Height", 0.5, 100 - roi.y],
                  ].map(([key, label, minimum, maximum]) => (
                    <label key={key} className="block">
                      <span className="text-xs font-bold text-muted-foreground">
                        {label} %
                      </span>
                      <input
                        type="number"
                        min={minimum}
                        max={maximum}
                        step="0.5"
                        value={Number(roi[key].toFixed(1))}
                        onChange={(event) =>
                          updateRoiValue(key, event.target.value)
                        }
                        className="input-field mt-1 w-full"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
              {dimensions.downscaledForSafety ? (
                <p className="mt-3 rounded-lg border border-warning bg-warning-soft p-3 text-sm text-foreground">
                  The header was checked before browser decode. The rendered
                  working preview is bounded to{" "}
                  {watermarkRasterLimits.maxWorkingEdge.toLocaleString("en-US")}
                  px per edge and{" "}
                  {watermarkRasterLimits.maxWorkingPixels.toLocaleString("en-US")}{" "}
                  total pixels.
                </p>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              className="mt-5 flex min-h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-soft p-6 text-center hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage
                className="h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <span className="font-bold text-foreground">
                Open a JPEG, PNG, or WebP
              </span>
              <span className="text-sm text-muted-foreground">
                Maximum 20 MB,{" "}
                {watermarkRasterLimits.maxSourceEdge.toLocaleString("en-US")}px
                per edge, and{" "}
                {watermarkRasterLimits.maxSourcePixels.toLocaleString("en-US")}{" "}
                pixels; no upload
              </span>
            </button>
          )}
        </section>

        <aside className="space-y-6">
          <section className="tool-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <SlidersHorizontal
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Stress settings
            </h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="flex justify-between gap-3 text-sm font-bold text-foreground">
                  JPEG quality <span>{settings.jpegQuality}%</span>
                </span>
                <input
                  type="range"
                  min="10"
                  max="95"
                  step="5"
                  value={settings.jpegQuality}
                  onChange={(event) =>
                    updateSetting("jpegQuality", event.target.value)
                  }
                  className="mt-2 w-full accent-primary"
                />
              </label>
              <label className="block">
                <span className="flex justify-between gap-3 text-sm font-bold text-foreground">
                  Resize dimensions <span>{settings.resizePercent}%</span>
                </span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={settings.resizePercent}
                  onChange={(event) =>
                    updateSetting("resizePercent", event.target.value)
                  }
                  className="mt-2 w-full accent-primary"
                />
              </label>
              <label className="block">
                <span className="flex justify-between gap-3 text-sm font-bold text-foreground">
                  Center crop retained{" "}
                  <span>{settings.cropRetainedPercent}%</span>
                </span>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={settings.cropRetainedPercent}
                  onChange={(event) =>
                    updateSetting("cropRetainedPercent", event.target.value)
                  }
                  className="mt-2 w-full accent-primary"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface-soft p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Privacy boundary
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Processing stays in this browser tab. SVG is excluded, and no URL,
              image, pixel, filename, or ROI coordinate is included in the
              downloadable summary.
            </p>
          </section>
        </aside>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11"
          onClick={() => void runStressTest()}
          disabled={!sourceUrl || busy}
        >
          <ImageDown className="h-4 w-4" aria-hidden="true" />
          {busy ? "Processing locally…" : "Create stress previews"}
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11"
          onClick={clearAll}
          disabled={busy}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {variants.length ? (
          <button
            type="button"
            className="btn-secondary min-h-11"
            onClick={() => downloadJson(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download privacy-safe summary
          </button>
        ) : null}
      </div>

      {variants.length ? (
        <section className="space-y-5" aria-live="polite">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
              <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
              Stress previews
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Compare the actual pictures and mark your judgment. Spread and
              edge percentages are pixel-signal ratios against the selected
              original area; values may exceed 100% and compression artifacts
              can raise them.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                assessment={assessments[variant.id]}
                onAssessment={(value) =>
                  setAssessments((current) => ({
                    ...current,
                    [variant.id]: value,
                  }))
                }
              />
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4">
            <Crop
              className="mt-1 h-5 w-5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground">
              These four transformations are examples, not every platform
              pipeline. Test the real destination too—its resampling,
              sharpening, overlays, crop, and display size may differ.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
