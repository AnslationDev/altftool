"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  Eye,
  FileImage,
  Grid3X3,
  ImageDown,
  Info,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ScanSearch,
  SlidersHorizontal,
  Upload,
  XCircle,
} from "lucide-react";

import {
  applyExifOrientationToDimensions,
  buildPrivacySafeElaSummary,
  buildResidualRegionGrid,
  calculateWorkingDimensions,
  computeAbsoluteResidualMagnitudes,
  createResidualHeatmapPixels,
  detectRasterMime,
  ELA_LIMITATIONS,
  ELA_LIMITS,
  parseJpegExifOrientation,
  parseRasterDimensions,
  summarizeResidualMagnitudes,
  SUPPORTED_MIME_TYPES,
  validateRasterDimensions,
} from "../lib/elaAnalysis.mjs";

const MIME_LABELS = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

function formatBytes(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

function formatMetric(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/u, "");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("This browser could not decode the raster image."));
    image.src = url;
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

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser could not create the JPEG pass.")),
      "image/jpeg",
      quality,
    );
  });
}

function flattenTransparencyOnWhite(imageData) {
  let hadTransparency = false;
  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    const alpha = imageData.data[offset + 3];
    if (alpha === 255) continue;
    hadTransparency = true;
    const alphaRatio = alpha / 255;
    imageData.data[offset] = Math.round(
      imageData.data[offset] * alphaRatio + 255 * (1 - alphaRatio),
    );
    imageData.data[offset + 1] = Math.round(
      imageData.data[offset + 1] * alphaRatio + 255 * (1 - alphaRatio),
    );
    imageData.data[offset + 2] = Math.round(
      imageData.data[offset + 2] * alphaRatio + 255 * (1 - alphaRatio),
    );
    imageData.data[offset + 3] = 255;
  }
  return hadTransparency;
}

async function decodeBlobIntoCanvas(blob, width, height) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const output = makeCanvas(width, height);
    output.context.drawImage(image, 0, 0, width, height);
    return output;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// Reads a growing prefix of the file until a recognizable raster header
// yields real dimensions, or the whole file has been read. A large-but-valid
// chained metadata block (embedded ICC profile, extended XMP, etc.) can push
// the SOF0/IHDR/VP8X marker past ELA_LIMITS.maxHeaderBytes, so a single fixed
// slice can under-read a well-formed image. If the very first slice doesn't
// even carry a recognizable signature, more bytes cannot help, so this stops
// immediately instead of re-reading the file needlessly.
async function readRasterHeader(file) {
  const attemptSizes = [Math.min(file.size, ELA_LIMITS.maxHeaderBytes)];
  while (attemptSizes[attemptSizes.length - 1] < file.size) {
    attemptSizes.push(
      Math.min(file.size, attemptSizes[attemptSizes.length - 1] * 4),
    );
  }

  let headerBytes = new Uint8Array();
  let mimeType = null;
  let headerDimensions = null;
  for (const attemptSize of attemptSizes) {
    headerBytes = new Uint8Array(
      await file.slice(0, attemptSize).arrayBuffer(),
    );
    mimeType = detectRasterMime(headerBytes);
    if (!mimeType) break;
    headerDimensions = parseRasterDimensions(headerBytes);
    if (headerDimensions) break;
  }
  return { headerBytes, mimeType, headerDimensions };
}

function drawCanvas(target, source) {
  if (!target || !source) return;
  target.width = source.width;
  target.height = source.height;
  const context = target.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, target.width, target.height);
  context.drawImage(source, 0, 0);
}

function drawHeatmap(target, magnitudes, width, height, displayGain) {
  if (!target) return;
  target.width = width;
  target.height = height;
  const context = target.getContext("2d");
  if (!context) return;
  const imageData = context.createImageData(width, height);
  imageData.data.set(
    createResidualHeatmapPixels(magnitudes, displayGain),
  );
  context.putImageData(imageData, 0, 0);
}

function downloadSummary(summary) {
  const objectUrl = URL.createObjectURL(
    new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "image-ela-numerical-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function CanvasCard({ canvasRef, caption, title }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex min-h-64 items-center justify-center bg-canvas p-3">
        <canvas
          ref={canvasRef}
          className="h-auto max-h-96 w-full object-contain"
          role="img"
          aria-label={title}
        />
      </div>
      <figcaption className="p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{caption}</p>
      </figcaption>
    </figure>
  );
}

export default function ImageElaForensicsViewer() {
  const fileInputRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const recompressedCanvasRef = useRef(null);
  const sourcePreviewRef = useRef(null);
  const recompressedPreviewRef = useRef(null);
  const heatmapPreviewRef = useRef(null);
  const runTokenRef = useRef(0);
  const [selection, setSelection] = useState(null);
  const [jpegQuality, setJpegQuality] = useState(85);
  const [displayGain, setDisplayGain] = useState(12);
  const [gridSize, setGridSize] = useState(4);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const regionGrid = useMemo(
    () =>
      result
        ? buildResidualRegionGrid(
            result.magnitudes,
            result.width,
            result.height,
            gridSize,
            gridSize,
          )
        : null,
    [gridSize, result],
  );

  const privacySummary = useMemo(
    () =>
      result && selection && regionGrid
        ? buildPrivacySafeElaSummary({
            sourceMimeType: selection.mimeType,
            dimensions: selection.dimensions,
            jpegQuality: result.jpegQuality,
            displayGain,
            residualSummary: result.summary,
            regionGrid,
          })
        : null,
    [displayGain, regionGrid, result, selection],
  );

  useEffect(() => {
    if (!result) return;
    drawCanvas(sourcePreviewRef.current, sourceCanvasRef.current);
    drawCanvas(
      recompressedPreviewRef.current,
      recompressedCanvasRef.current,
    );
    drawHeatmap(
      heatmapPreviewRef.current,
      result.magnitudes,
      result.width,
      result.height,
      displayGain,
    );
  }, [displayGain, result]);

  function invalidateResult() {
    runTokenRef.current += 1;
    recompressedCanvasRef.current = null;
    setResult(null);
    setError("");
  }

  async function chooseImage(file) {
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    sourceCanvasRef.current = null;
    recompressedCanvasRef.current = null;
    setSelection(null);
    setResult(null);
    setError("");
    if (!file) return;

    if (
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg")
    ) {
      setError(
        "SVG is excluded. Choose a local JPEG, PNG, or WebP raster image.",
      );
      return;
    }
    if (file.size <= 0 || file.size > ELA_LIMITS.maxFileBytes) {
      setError(
        `Choose a non-empty image no larger than ${formatBytes(ELA_LIMITS.maxFileBytes)}.`,
      );
      return;
    }

    setBusy(true);
    let objectUrl = "";
    try {
      const { headerBytes, mimeType, headerDimensions } =
        await readRasterHeader(file);
      if (!mimeType || !headerDimensions) {
        throw new Error(
          "The file header is not a supported or complete JPEG, PNG, or WebP raster image. SVG and other formats are excluded.",
        );
      }
      const dimensionCheck = validateRasterDimensions(headerDimensions);
      if (!dimensionCheck.ok) {
        throw new Error(
          `The image dimensions exceed the pre-decode safety limit of ${ELA_LIMITS.maxSourceEdge.toLocaleString("en-US")} pixels per edge and ${ELA_LIMITS.maxSourcePixels.toLocaleString("en-US")} total pixels.`,
        );
      }
      // The browser decodes JPEG pixels already rotated per the file's own
      // EXIF Orientation tag, so a 90/270-degree rotation (tag 5-8) reports
      // naturalWidth/naturalHeight with axes swapped relative to the
      // EXIF-blind header dimensions above. Compare against the
      // orientation-corrected expectation so a genuinely valid rotated JPEG
      // isn't rejected, while a real header/pixel mismatch still is.
      const orientedDimensions = applyExifOrientationToDimensions(
        headerDimensions,
        parseJpegExifOrientation(headerBytes),
      );

      objectUrl = URL.createObjectURL(
        file.type === mimeType ? file : file.slice(0, file.size, mimeType),
      );
      const image = await loadImage(objectUrl);
      if (
        image.naturalWidth !== orientedDimensions.width ||
        image.naturalHeight !== orientedDimensions.height
      ) {
        throw new Error(
          "The decoded dimensions do not match the raster header, so the image was rejected.",
        );
      }
      const dimensions = calculateWorkingDimensions(
        orientedDimensions.width,
        orientedDimensions.height,
      );
      const source = makeCanvas(
        dimensions.processedWidth,
        dimensions.processedHeight,
      );
      source.context.drawImage(
        image,
        0,
        0,
        dimensions.processedWidth,
        dimensions.processedHeight,
      );
      const sourcePixels = source.context.getImageData(
        0,
        0,
        dimensions.processedWidth,
        dimensions.processedHeight,
      );
      const transparencyFlattened =
        flattenTransparencyOnWhite(sourcePixels);
      if (transparencyFlattened) {
        source.context.putImageData(sourcePixels, 0, 0);
      }

      if (runTokenRef.current !== token) return;
      sourceCanvasRef.current = source.canvas;
      setSelection({
        filename: file.name,
        fileSize: file.size,
        mimeType,
        dimensions,
        transparencyFlattened,
      });
    } catch (nextError) {
      if (runTokenRef.current === token) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "The raster image could not be opened locally.",
        );
      }
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (runTokenRef.current === token) setBusy(false);
    }
  }

  async function runAnalysis() {
    const sourceCanvas = sourceCanvasRef.current;
    if (!sourceCanvas || !selection || busy) return;
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    recompressedCanvasRef.current = null;
    setResult(null);
    setError("");
    setBusy(true);

    try {
      const jpegBlob = await canvasToBlob(
        sourceCanvas,
        jpegQuality / 100,
      );
      const recompressed = await decodeBlobIntoCanvas(
        jpegBlob,
        sourceCanvas.width,
        sourceCanvas.height,
      );
      const originalPixels = sourceCanvas
        .getContext("2d", { willReadFrequently: true })
        ?.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const recompressedPixels = recompressed.context.getImageData(
        0,
        0,
        recompressed.canvas.width,
        recompressed.canvas.height,
      );
      if (!originalPixels) {
        throw new Error("Canvas image reading is unavailable.");
      }
      const magnitudes = computeAbsoluteResidualMagnitudes(
        originalPixels.data,
        recompressedPixels.data,
      );
      const summary = summarizeResidualMagnitudes(magnitudes);

      if (runTokenRef.current !== token) return;
      recompressedCanvasRef.current = recompressed.canvas;
      setResult({
        width: sourceCanvas.width,
        height: sourceCanvas.height,
        magnitudes,
        summary,
        jpegQuality,
      });
    } catch {
      if (runTokenRef.current === token) {
        setError(
          "The browser could not complete the local JPEG re-encoding analysis. Try a smaller raster image or a current browser.",
        );
      }
    } finally {
      if (runTokenRef.current === token) setBusy(false);
    }
  }

  function reset() {
    runTokenRef.current += 1;
    sourceCanvasRef.current = null;
    recompressedCanvasRef.current = null;
    setSelection(null);
    setJpegQuality(85);
    setDisplayGain(12);
    setGridSize(4);
    setResult(null);
    setBusy(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <ScanSearch aria-hidden="true" className="h-4 w-4" />
              Local residual viewer
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Image ELA Forensics Viewer
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              Re-encode a bounded raster image as JPEG, measure absolute pixel
              residuals, and inspect a gain-adjusted heatmap and regional numbers.
              The tool intentionally produces no authenticity or manipulation
              verdict.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-primary" />
              No upload · No storage
            </p>
            <p className="mt-1 text-muted-foreground">
              Pixels stay in this browser tab
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-xl border border-warning bg-warning-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-warning">
            <AlertTriangle aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              ELA is not a tamper detector
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Bright or uneven residuals do not mean “manipulated,” and low or
              uniform residuals do not mean “authentic.” This viewer measures one
              browser JPEG re-encoding response and cannot establish evidentiary
              truth, provenance, authorship, capture time, or admissibility.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileImage aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Choose one local raster image
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                JPEG, PNG, and WebP signatures are accepted. SVG is explicitly
                excluded.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={`.jpg,.jpeg,.png,.webp,${SUPPORTED_MIME_TYPES.join(",")}`}
            className="sr-only"
            disabled={busy}
            aria-label="Choose a local JPEG, PNG, or WebP image for ELA analysis"
            onChange={(event) => {
              void chooseImage(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-secondary mt-5 inline-flex min-h-11 items-center justify-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            Choose raster image
          </button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Maximum {formatBytes(ELA_LIMITS.maxFileBytes)}. Processing is bounded
            to {ELA_LIMITS.maxImageEdge.toLocaleString("en-US")} pixels on either
            edge and {ELA_LIMITS.maxProcessingPixels.toLocaleString("en-US")} total
            pixels. Before decode, headers over{" "}
            {ELA_LIMITS.maxSourceEdge.toLocaleString("en-US")} pixels per edge or{" "}
            {ELA_LIMITS.maxSourcePixels.toLocaleString("en-US")} pixels total are
            rejected.
          </p>

          {selection ? (
            <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
              <p className="break-all font-semibold text-foreground">
                {selection.filename}
              </p>
              <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                    Detected format
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {MIME_LABELS[selection.mimeType]}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                    File size
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {formatBytes(selection.fileSize)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                    Source dimensions
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {selection.dimensions.sourceWidth} ×{" "}
                    {selection.dimensions.sourceHeight}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                    Processed dimensions
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {selection.dimensions.processedWidth} ×{" "}
                    {selection.dimensions.processedHeight}
                  </dd>
                </div>
              </dl>
              {selection.dimensions.downscaled ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  A bounded working copy was downscaled locally. Scaling itself can
                  change residual structure.
                </p>
              ) : null}
              {selection.transparencyFlattened ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Transparent pixels were flattened onto white before JPEG
                  re-encoding, which affects the measured residual.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-6 text-center">
              <ImageDown
                aria-hidden="true"
                className="mx-auto h-7 w-7 text-muted-foreground"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                No image is retained after you clear or close this tab.
              </p>
            </div>
          )}

          {selection ? (
            selection.mimeType === "image/jpeg" ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-info bg-info-soft p-4">
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-info"
                />
                <p className="text-sm leading-6 text-foreground">
                  JPEG is the format for which ELA is generally most
                  interpretable, but even JPEG residuals do not provide a verdict.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                />
                <p className="text-sm leading-6 text-foreground">
                  This {MIME_LABELS[selection.mimeType]} input is being converted
                  across formats into JPEG. The residual primarily reflects that
                  conversion and is less interpretable than JPEG-on-JPEG ELA.
                </p>
              </div>
            )
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Re-encode and display controls
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Quality changes the JPEG pass. Gain changes only heatmap
                brightness, never the reported raw residual numbers.
              </p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span>JPEG re-encode quality</span>
              <span>{jpegQuality}%</span>
            </span>
            <input
              type="range"
              min={ELA_LIMITS.minJpegQuality}
              max={ELA_LIMITS.maxJpegQuality}
              step="1"
              value={jpegQuality}
              disabled={busy}
              className="mt-3 w-full accent-primary"
              onChange={(event) => {
                invalidateResult();
                setJpegQuality(Number(event.target.value));
              }}
            />
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              Lower quality usually produces larger compression residuals. The
              source image’s original quality is not inferred.
            </span>
          </label>

          <label className="mt-6 block">
            <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span>Heatmap display gain</span>
              <span>{displayGain}×</span>
            </span>
            <input
              type="range"
              min={ELA_LIMITS.minDisplayGain}
              max={ELA_LIMITS.maxDisplayGain}
              step="1"
              value={displayGain}
              disabled={busy}
              className="mt-3 w-full accent-primary"
              onChange={(event) => setDisplayGain(Number(event.target.value))}
            />
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              Dark means a smaller displayed residual; bright means a larger one
              after gain. Brightness is not a suspicion score.
            </span>
          </label>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              Numerical region grid
            </span>
            <select
              className="input-field min-h-11 w-full"
              value={gridSize}
              disabled={busy}
              onChange={(event) => setGridSize(Number(event.target.value))}
            >
              <option value="2">2 × 2 regions</option>
              <option value="4">4 × 4 regions</option>
              <option value="8">8 × 8 regions</option>
            </select>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              The grid reports raw residual statistics by position without
              ranking or labeling any region.
            </span>
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() => void runAnalysis()}
              disabled={!selection || busy}
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <ScanSearch aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? "Processing locally…" : "Run local ELA"}
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={reset}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear session
            </button>
          </div>

          {error ? (
            <p
              className="mt-5 rounded-lg border border-danger bg-danger-soft p-4 text-sm leading-6 text-foreground"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </section>
      </div>

      {result ? (
        <>
          <section className="mt-6" aria-labelledby="ela-results-heading">
            <div className="rounded-xl border border-success bg-success-soft p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0 text-success"
                />
                <div>
                  <h2
                    id="ela-results-heading"
                    className="text-2xl font-bold text-foreground"
                  >
                    Residual visualization ready
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    These are descriptive measurements from the selected browser
                    re-encode settings. No region or image is classified as
                    authentic, manipulated, or tampered.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              <CanvasCard
                canvasRef={sourcePreviewRef}
                title="Decoded working image"
                caption="Bounded decoded pixels used as the local comparison baseline."
              />
              <CanvasCard
                canvasRef={recompressedPreviewRef}
                title={`Browser JPEG at ${result.jpegQuality}%`}
                caption="Locally re-encoded and decoded again in this browser."
              />
              <CanvasCard
                canvasRef={heatmapPreviewRef}
                title={`Residual heatmap at ${displayGain}× gain`}
                caption="Absolute mean-RGB difference; dark is lower and bright is higher after display gain."
              />
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <BarChart3 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Raw residual summary
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Values use a 0–255 mean absolute RGB difference scale and are not
                  amplified by heatmap gain.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                icon={BarChart3}
                label="Mean"
                value={formatMetric(result.summary.mean)}
                detail="Average raw per-pixel residual."
              />
              <MetricCard
                icon={BarChart3}
                label="Median"
                value={result.summary.median}
                detail="50th percentile raw residual."
              />
              <MetricCard
                icon={BarChart3}
                label="95th percentile"
                value={result.summary.p95}
                detail="95% of pixels are at or below."
              />
              <MetricCard
                icon={BarChart3}
                label="Maximum"
                value={result.summary.maximum}
                detail="Largest raw residual value."
              />
              <MetricCard
                icon={Eye}
                label="Non-zero pixels"
                value={`${formatMetric(result.summary.nonZeroPercent)}%`}
                detail="Any measurable RGB residual."
              />
            </div>
          </section>

          {regionGrid ? (
            <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Grid3X3 aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Regional residual grid
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Row-major positional summaries only. Differences between
                      cells require context and do not identify edits.
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {regionGrid.columns} × {regionGrid.rows} ·{" "}
                  {regionGrid.regionCount} cells
                </span>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-3xl border-collapse text-left text-sm">
                  <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        Cell
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        Pixels
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        Mean
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        RMS
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        P95
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        Maximum
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold">
                        Non-zero
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {regionGrid.regions.map((region) => (
                      <tr
                        key={`${region.row}-${region.column}`}
                        className="text-foreground"
                      >
                        <th
                          scope="row"
                          className="whitespace-nowrap px-3 py-3 font-semibold"
                        >
                          R{region.row} · C{region.column}
                        </th>
                        <td className="px-3 py-3">
                          {region.pixelCount.toLocaleString("en-US")}
                        </td>
                        <td className="px-3 py-3">
                          {formatMetric(region.mean)}
                        </td>
                        <td className="px-3 py-3">
                          {formatMetric(region.rootMeanSquare)}
                        </td>
                        <td className="px-3 py-3">{region.p95}</td>
                        <td className="px-3 py-3">{region.maximum}</td>
                        <td className="px-3 py-3">
                          {formatMetric(region.nonZeroPercent)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-foreground">
                  Export privacy-safe numerical summary
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The JSON includes settings, bounded dimensions, raw aggregate
                  measurements, region numbers, and interpretation limits. It
                  excludes the filename, image pixels, previews, file bytes, and
                  any verdict.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-11 shrink-0 items-center justify-center gap-2"
                onClick={() => privacySummary && downloadSummary(privacySummary)}
                disabled={!privacySummary}
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download summary JSON
              </button>
            </div>
          </section>
        </>
      ) : null}

      <section className="mt-6 rounded-xl border border-info bg-info-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Info
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-info"
          />
          <div>
            <h2 className="font-semibold text-foreground">
              Why benign images can look uneven
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Ordinary recompression, cropping or edits, resizing and scaling,
              sharpening or denoising, camera HDR and phone pipelines, social-media
              exports, synthetic-image generation, and multiple saves can create
              or suppress residual differences. These effects can produce both
              false positives and false negatives.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface-soft p-5">
        <div className="flex items-start gap-3">
          <XCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <h2 className="font-semibold text-foreground">
              Interpretation limits
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              {ELA_LIMITATIONS.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
