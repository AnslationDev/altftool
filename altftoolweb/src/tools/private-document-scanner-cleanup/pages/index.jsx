"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Crop,
  Download,
  FileImage,
  LoaderCircle,
  LockKeyhole,
  MousePointer2,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  ScanText,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";

import {
  applyDocumentTone,
  computeHomography,
  defaultDocumentCorners,
  estimateOutputDimensions,
  moveDocumentCorner,
  toPixelCorners,
} from "../lib/documentGeometry.mjs";

const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_INPUT_PIXELS = 80_000_000;
const MAX_SOURCE_RASTER_PIXELS = 12_000_000;
const MAX_OUTPUT_PIXELS = 6_000_000;
const MAX_OUTPUT_DIMENSION = 3000;

const CORNER_LABELS = {
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-right": "Bottom right",
  "bottom-left": "Bottom left",
};

const CLEANUP_MODES = [
  {
    id: "color",
    label: "Color",
    description: "Keep the document colors",
  },
  {
    id: "grayscale",
    label: "Grayscale",
    description: "Remove color while keeping shades",
  },
  {
    id: "black-white",
    label: "Black & white",
    description: "Threshold for high-contrast text",
  },
];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function cameraErrorMessage(error) {
  if (error?.name === "NotAllowedError") {
    return "Camera permission was not granted. Allow it in the browser and try again.";
  }
  if (error?.name === "NotFoundError") return "No camera was found on this device.";
  if (error?.name === "NotReadableError") {
    return "The camera is busy in another app or could not be opened.";
  }
  return "The camera could not be started. Check browser permissions and try again.";
}

function safeBaseName(filename) {
  const withoutExtension = String(filename || "document").replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return cleaned || "document";
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not encode the cleaned image."));
      },
      type,
      quality,
    );
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
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildCleanDocumentCanvas(image, corners, settings) {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const sourceScale = Math.min(
    1,
    Math.sqrt(MAX_SOURCE_RASTER_PIXELS / (naturalWidth * naturalHeight)),
  );
  const sourceWidth = Math.max(2, Math.round(naturalWidth * sourceScale));
  const sourceHeight = Math.max(2, Math.round(naturalHeight * sourceScale));

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("This browser could not create a local image canvas.");
  sourceContext.drawImage(image, 0, 0, sourceWidth, sourceHeight);
  const sourcePixels = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight).data;

  const naturalCorners = toPixelCorners(
    corners,
    Math.max(1, naturalWidth - 1),
    Math.max(1, naturalHeight - 1),
  );
  const dimensions = estimateOutputDimensions(naturalCorners, {
    maxDimension: MAX_OUTPUT_DIMENSION,
    maxPixels: MAX_OUTPUT_PIXELS,
  });
  const scaledCorners = naturalCorners.map((point) => ({
    x:
      point.x *
      (sourceWidth - 1) /
      Math.max(1, naturalWidth - 1),
    y:
      point.y *
      (sourceHeight - 1) /
      Math.max(1, naturalHeight - 1),
  }));
  const destinationCorners = [
    { x: 0, y: 0 },
    { x: dimensions.width - 1, y: 0 },
    { x: dimensions.width - 1, y: dimensions.height - 1 },
    { x: 0, y: dimensions.height - 1 },
  ];
  const homography = computeHomography(destinationCorners, scaledCorners);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = dimensions.width;
  outputCanvas.height = dimensions.height;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) throw new Error("This browser could not create the cleaned output.");
  const outputImage = outputContext.createImageData(dimensions.width, dimensions.height);
  const outputPixels = outputImage.data;

  for (let y = 0; y < dimensions.height; y += 1) {
    for (let x = 0; x < dimensions.width; x += 1) {
      const denominator = homography[6] * x + homography[7] * y + homography[8];
      const projectedX =
        (homography[0] * x + homography[1] * y + homography[2]) / denominator;
      const projectedY =
        (homography[3] * x + homography[4] * y + homography[5]) / denominator;
      const safeX = Math.min(sourceWidth - 1, Math.max(0, projectedX));
      const safeY = Math.min(sourceHeight - 1, Math.max(0, projectedY));
      const left = Math.floor(safeX);
      const top = Math.floor(safeY);
      const right = Math.min(sourceWidth - 1, left + 1);
      const bottom = Math.min(sourceHeight - 1, top + 1);
      const horizontalMix = safeX - left;
      const verticalMix = safeY - top;
      const topLeftOffset = (top * sourceWidth + left) * 4;
      const topRightOffset = (top * sourceWidth + right) * 4;
      const bottomLeftOffset = (bottom * sourceWidth + left) * 4;
      const bottomRightOffset = (bottom * sourceWidth + right) * 4;
      const outputOffset = (y * dimensions.width + x) * 4;
      const topLeftWeight = (1 - horizontalMix) * (1 - verticalMix);
      const topRightWeight = horizontalMix * (1 - verticalMix);
      const bottomLeftWeight = (1 - horizontalMix) * verticalMix;
      const bottomRightWeight = horizontalMix * verticalMix;
      const sourceAlpha =
        (sourcePixels[topLeftOffset + 3] * topLeftWeight +
          sourcePixels[topRightOffset + 3] * topRightWeight +
          sourcePixels[bottomLeftOffset + 3] * bottomLeftWeight +
          sourcePixels[bottomRightOffset + 3] * bottomRightWeight) /
        255;
      const red =
        (sourcePixels[topLeftOffset] * topLeftWeight +
          sourcePixels[topRightOffset] * topRightWeight +
          sourcePixels[bottomLeftOffset] * bottomLeftWeight +
          sourcePixels[bottomRightOffset] * bottomRightWeight) *
          sourceAlpha +
        255 * (1 - sourceAlpha);
      const green =
        (sourcePixels[topLeftOffset + 1] * topLeftWeight +
          sourcePixels[topRightOffset + 1] * topRightWeight +
          sourcePixels[bottomLeftOffset + 1] * bottomLeftWeight +
          sourcePixels[bottomRightOffset + 1] * bottomRightWeight) *
          sourceAlpha +
        255 * (1 - sourceAlpha);
      const blue =
        (sourcePixels[topLeftOffset + 2] * topLeftWeight +
          sourcePixels[topRightOffset + 2] * topRightWeight +
          sourcePixels[bottomLeftOffset + 2] * bottomLeftWeight +
          sourcePixels[bottomRightOffset + 2] * bottomRightWeight) *
          sourceAlpha +
        255 * (1 - sourceAlpha);
      const [toneRed, toneGreen, toneBlue] = applyDocumentTone(red, green, blue, settings);

      outputPixels[outputOffset] = toneRed;
      outputPixels[outputOffset + 1] = toneGreen;
      outputPixels[outputOffset + 2] = toneBlue;
      outputPixels[outputOffset + 3] = 255;
    }
  }

  outputContext.putImageData(outputImage, 0, 0);
  return { canvas: outputCanvas, dimensions };
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <section className="tool-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-foreground">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrivateDocumentScannerCleanup() {
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const previewRef = useRef(null);
  const objectUrlRef = useRef(null);
  const streamRef = useRef(null);
  const dragRef = useRef(null);
  const mountedRef = useRef(true);

  const [imageInfo, setImageInfo] = useState(null);
  const [corners, setCorners] = useState(defaultDocumentCorners);
  const [mode, setMode] = useState("color");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(110);
  const [threshold, setThreshold] = useState(155);
  const [format, setFormat] = useState("png");
  const [jpegQuality, setJpegQuality] = useState(90);
  const [cameraState, setCameraState] = useState("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Choose an image or start the camera. No document data leaves this tab.",
  );

  const releaseCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (cameraState !== "live" || !cameraVideoRef.current || !streamRef.current) {
      return;
    }
    cameraVideoRef.current.srcObject = streamRef.current;
    const playResult = cameraVideoRef.current.play();
    if (playResult?.catch) playResult.catch(() => {});
  }, [cameraState]);

  const loadLocalImage = useCallback((blob, filename) => {
    setError("");
    if (!blob?.type?.startsWith("image/")) {
      setError("Choose a PNG, JPEG, WebP, or another browser-supported image.");
      return Promise.resolve(false);
    }
    if (blob.size > MAX_FILE_BYTES) {
      setError("This image is larger than 30 MB. Choose a smaller document photo.");
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!mountedRef.current) {
          URL.revokeObjectURL(objectUrl);
          resolve(false);
          return;
        }
        if (image.naturalWidth * image.naturalHeight > MAX_INPUT_PIXELS) {
          URL.revokeObjectURL(objectUrl);
          setError("This image has too many pixels to process safely in the browser.");
          resolve(false);
          return;
        }
        if (image.naturalWidth < 32 || image.naturalHeight < 32) {
          URL.revokeObjectURL(objectUrl);
          setError("This image is too small for document cleanup. Choose one at least 32 × 32.");
          resolve(false);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objectUrl;
        setImageInfo({
          element: image,
          name: filename || "document-image",
          size: blob.size,
          width: image.naturalWidth,
          height: image.naturalHeight,
          src: objectUrl,
        });
        setCorners(defaultDocumentCorners());
        setNotice(
          `Document ready: ${image.naturalWidth} × ${image.naturalHeight}. Move all four corners onto the page edges.`,
        );
        resolve(true);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        if (mountedRef.current) {
          setError("The browser could not decode this image. Try PNG, JPEG, or WebP.");
        }
        resolve(false);
      };
      image.src = objectUrl;
    });
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (file) await loadLocalImage(file, file.name);
      event.target.value = "";
    },
    [loadLocalImage],
  );

  const startCamera = useCallback(async () => {
    releaseCamera();
    setError("");
    setCameraState("requesting");
    setNotice("Waiting for browser camera permission…");

    if (!window.isSecureContext) {
      setCameraState("idle");
      setError("Camera access requires HTTPS or localhost. Image upload still works.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("idle");
      setError("This browser does not support camera access. Upload a photo instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraState("live");
      setNotice("Camera preview is local. Hold the document steady, then capture.");
    } catch (cameraError) {
      if (!mountedRef.current) return;
      setCameraState("idle");
      setError(cameraErrorMessage(cameraError));
      setNotice("Camera was not started.");
    }
  }, [releaseCamera]);

  const stopCamera = useCallback(() => {
    releaseCamera();
    setCameraState("idle");
    setNotice("Camera stopped and its media track was released.");
  }, [releaseCamera]);

  const captureCamera = useCallback(async () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth || !video?.videoHeight) {
      setError("The camera is still preparing. Wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("This browser could not capture the local camera frame.");
      return;
    }
    context.drawImage(video, 0, 0);
    releaseCamera();
    setCameraState("idle");
    try {
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      await loadLocalImage(blob, "camera-document.jpg");
    } catch (captureError) {
      setError(captureError.message);
    }
  }, [loadLocalImage, releaseCamera]);

  const clearDocument = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setImageInfo(null);
    setCorners(defaultDocumentCorners());
    setError("");
    setNotice("Document discarded from this page.");
  }, []);

  const rotateImage = useCallback(
    async (direction) => {
      if (!imageInfo || processing) return;
      setProcessing(true);
      setError("");
      setNotice("Rotating the image locally…");
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imageInfo.height;
        canvas.height = imageInfo.width;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("This browser could not rotate the image.");
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(direction * Math.PI / 2);
        context.drawImage(
          imageInfo.element,
          -imageInfo.width / 2,
          -imageInfo.height / 2,
        );
        const blob = await canvasToBlob(canvas, "image/png");
        await loadLocalImage(
          blob,
          `${safeBaseName(imageInfo.name)}-${direction < 0 ? "left" : "right"}.png`,
        );
      } catch (rotationError) {
        setError(rotationError.message);
      } finally {
        if (mountedRef.current) setProcessing(false);
      }
    },
    [imageInfo, loadLocalImage, processing],
  );

  const pointFromPointer = useCallback((event) => {
    const preview = previewRef.current;
    if (!preview) return null;
    const bounds = preview.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  }, []);

  const moveCorner = useCallback((id, position) => {
    setCorners((current) => moveDocumentCorner(current, id, position));
  }, []);

  const handleCornerPointerDown = useCallback((event, id) => {
    dragRef.current = { id, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handleCornerPointerMove = useCallback(
    (event, id) => {
      if (dragRef.current?.id !== id || dragRef.current.pointerId !== event.pointerId) {
        return;
      }
      const point = pointFromPointer(event);
      if (point) moveCorner(id, point);
    },
    [moveCorner, pointFromPointer],
  );

  const stopCornerDrag = useCallback((event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }, []);

  const handleCornerKeyDown = useCallback(
    (event, corner) => {
      const vectors = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const vector = vectors[event.key];
      if (!vector) return;
      event.preventDefault();
      const step = event.shiftKey ? 0.02 : 0.004;
      moveCorner(corner.id, {
        x: corner.x + vector[0] * step,
        y: corner.y + vector[1] * step,
      });
    },
    [moveCorner],
  );

  const exportDocument = useCallback(async () => {
    if (!imageInfo || processing) return;
    setProcessing(true);
    setError("");
    setNotice("Applying perspective correction and cleanup locally…");
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    try {
      const result = buildCleanDocumentCanvas(imageInfo.element, corners, {
        mode,
        brightness,
        contrast,
        threshold,
      });
      const isJpeg = format === "jpeg";
      const mimeType = isJpeg ? "image/jpeg" : "image/png";
      const blob = await canvasToBlob(
        result.canvas,
        mimeType,
        isJpeg ? jpegQuality / 100 : undefined,
      );
      const extension = isJpeg ? "jpg" : "png";
      downloadBlob(blob, `${safeBaseName(imageInfo.name)}-cleaned.${extension}`);
      setNotice(
        `Cleaned ${result.dimensions.width} × ${result.dimensions.height} ${extension.toUpperCase()} downloaded. The source was never uploaded.`,
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "The cleaned image could not be created.",
      );
      setNotice("Export did not finish.");
    } finally {
      if (mountedRef.current) setProcessing(false);
    }
  }, [
    brightness,
    contrast,
    corners,
    format,
    imageInfo,
    jpegQuality,
    mode,
    processing,
    threshold,
  ]);

  const previewFilter = useMemo(() => {
    const grayscale = mode === "color" ? 0 : 1;
    const previewContrast =
      mode === "black-white" ? Math.max(contrast, 210) : contrast;
    return `brightness(${brightness}%) contrast(${previewContrast}%) grayscale(${grayscale})`;
  }, [brightness, contrast, mode]);

  const polygonPoints = useMemo(
    () => corners.map((corner) => `${corner.x},${corner.y}`).join(" "),
    [corners],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ScanText className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Local document cleanup
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Private Document Scanner & Cleanup
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Capture or upload a document photo, place four page corners, correct perspective,
              clean up its tone, and download a flattened PNG or JPEG.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <div className="flex items-center gap-2 font-bold text-success">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              Stays in this browser tab
            </div>
            <p className="mt-2 leading-relaxed">
              Images are processed in memory. This tool has no upload, account, history, or cloud
              processing step.
            </p>
          </div>
        </div>
      </header>

      <div
        className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-foreground"
        role="note"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Manual review is required.</strong> This tool does not detect page edges,
            verify document authenticity, run OCR, or remove the original file from your device.
            Black-and-white preview is approximate; the downloaded image uses the chosen threshold.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <main className="tool-card min-w-0 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Document and crop corners</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag each numbered handle onto the matching document corner.
              </p>
            </div>
            {imageInfo ? (
              <span className="inline-flex items-center gap-2 rounded-pill bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Image local
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-pill bg-surface-soft px-3 py-1.5 text-xs font-bold text-muted-foreground">
                <FileImage className="h-4 w-4" aria-hidden="true" />
                No image selected
              </span>
            )}
          </div>

          {!imageInfo && cameraState === "idle" ? (
            <div className="grid min-h-96 gap-4 bg-surface-soft p-6 sm:grid-cols-2">
              <button
                type="button"
                className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface p-6 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft text-primary">
                  <Upload className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="mt-4 font-bold text-foreground">Upload document photo</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  PNG, JPEG, WebP, or another browser-supported image up to 30 MB
                </span>
              </button>
              <button
                type="button"
                className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-border bg-surface p-6 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={startCamera}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft text-primary">
                  <Camera className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="mt-4 font-bold text-foreground">Use device camera</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Permission is requested only after this click; the rear camera is preferred
                </span>
              </button>
            </div>
          ) : null}

          {!imageInfo && cameraState === "requesting" ? (
            <div className="flex min-h-96 flex-col items-center justify-center bg-surface-soft p-6 text-center">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold text-foreground">Waiting for permission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose Allow in the browser to open a local camera preview.
              </p>
              <button type="button" className="btn-secondary mt-5" onClick={stopCamera}>
                <CameraOff className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          ) : null}

          {!imageInfo && cameraState === "live" ? (
            <div className="bg-canvas">
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => setCameraReady(true)}
                className="block max-h-screen min-h-80 w-full object-contain"
                aria-label="Live local document camera preview"
              />
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border bg-surface p-4">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={captureCamera}
                  disabled={!cameraReady}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Capture document
                </button>
                <button type="button" className="btn-secondary" onClick={stopCamera}>
                  <CameraOff className="h-4 w-4" aria-hidden="true" />
                  Stop camera
                </button>
              </div>
            </div>
          ) : null}

          {imageInfo ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface p-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => rotateImage(-1)}
                  disabled={processing}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Rotate left
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => rotateImage(1)}
                  disabled={processing}
                >
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                  Rotate right
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setCorners(defaultDocumentCorners());
                    setNotice("Crop corners reset to the full image.");
                  }}
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Reset corners
                </button>
                <button type="button" className="btn-secondary" onClick={clearDocument}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Discard
                </button>
              </div>

              <div className="bg-canvas p-6">
                <div className="flex justify-center">
                  <div ref={previewRef} className="relative inline-block max-w-full touch-none">
                    {/* The source is a local object URL and is never sent to a remote image loader. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageInfo.src}
                      alt="Local document preview with adjustable crop corners"
                      className="block h-auto max-h-screen max-w-full select-none"
                      style={{ filter: previewFilter }}
                      draggable={false}
                    />
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 1 1"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <polygon
                        points={polygonPoints}
                        fill="var(--primary)"
                        fillOpacity="0.08"
                        stroke="var(--primary)"
                        strokeWidth="0.006"
                      />
                    </svg>
                    {corners.map((corner, index) => (
                      <button
                        key={corner.id}
                        type="button"
                        className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-pill border-2 border-primary bg-surface text-sm font-black text-primary shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        style={{
                          left: `${corner.x * 100}%`,
                          top: `${corner.y * 100}%`,
                        }}
                        aria-label={`${CORNER_LABELS[corner.id]} crop corner. Drag it or use arrow keys; hold Shift for larger steps.`}
                        onPointerDown={(event) => handleCornerPointerDown(event, corner.id)}
                        onPointerMove={(event) => handleCornerPointerMove(event, corner.id)}
                        onPointerUp={stopCornerDrag}
                        onPointerCancel={stopCornerDrag}
                        onKeyDown={(event) => handleCornerKeyDown(event, corner)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-surface p-4">
                <div className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm text-muted-foreground">
                  <MousePointer2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p>
                    Handle order: top left, top right, bottom right, bottom left. Keyboard users
                    can focus a handle and use arrow keys; Shift moves it farther.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </main>

        <aside className="min-w-0 space-y-6">
          <section className="tool-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-foreground">Cleanup controls</h2>
                <p className="text-sm text-muted-foreground">Tune the flattened output</p>
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-foreground">Document style</legend>
              <div className="mt-3 space-y-2">
                {CLEANUP_MODES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      mode === option.id
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:border-primary"
                    }`}
                    onClick={() => setMode(option.id)}
                    aria-pressed={mode === option.id}
                  >
                    <span className="block text-sm font-bold text-foreground">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="document-brightness" className="text-sm font-bold text-foreground">
                    Brightness
                  </label>
                  <output htmlFor="document-brightness" className="text-sm font-bold text-primary">
                    {brightness}%
                  </output>
                </div>
                <input
                  id="document-brightness"
                  type="range"
                  min="60"
                  max="160"
                  value={brightness}
                  className="mt-2 w-full accent-primary"
                  onChange={(event) => setBrightness(Number(event.target.value))}
                  disabled={!imageInfo}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="document-contrast" className="text-sm font-bold text-foreground">
                    Contrast
                  </label>
                  <output htmlFor="document-contrast" className="text-sm font-bold text-primary">
                    {contrast}%
                  </output>
                </div>
                <input
                  id="document-contrast"
                  type="range"
                  min="60"
                  max="200"
                  value={contrast}
                  className="mt-2 w-full accent-primary"
                  onChange={(event) => setContrast(Number(event.target.value))}
                  disabled={!imageInfo}
                />
              </div>

              {mode === "black-white" ? (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="document-threshold" className="text-sm font-bold text-foreground">
                      White threshold
                    </label>
                    <output htmlFor="document-threshold" className="text-sm font-bold text-primary">
                      {threshold}
                    </output>
                  </div>
                  <input
                    id="document-threshold"
                    type="range"
                    min="80"
                    max="220"
                    value={threshold}
                    className="mt-2 w-full accent-primary"
                    onChange={(event) => setThreshold(Number(event.target.value))}
                    disabled={!imageInfo}
                  />
                </div>
              ) : null}
            </div>
          </section>

          <section className="tool-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Download className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-foreground">Export cleaned image</h2>
                <p className="text-sm text-muted-foreground">PNG or JPEG, up to 6 megapixels</p>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="document-format" className="text-sm font-bold text-foreground">
                File format
              </label>
              <select
                id="document-format"
                value={format}
                className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="png">PNG — lossless</option>
                <option value="jpeg">JPEG — smaller file</option>
              </select>
            </div>

            {format === "jpeg" ? (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="document-quality" className="text-sm font-bold text-foreground">
                    JPEG quality
                  </label>
                  <output htmlFor="document-quality" className="text-sm font-bold text-primary">
                    {jpegQuality}%
                  </output>
                </div>
                <input
                  id="document-quality"
                  type="range"
                  min="60"
                  max="100"
                  value={jpegQuality}
                  className="mt-2 w-full accent-primary"
                  onChange={(event) => setJpegQuality(Number(event.target.value))}
                />
              </div>
            ) : null}

            <button
              type="button"
              className="btn-primary mt-5 w-full"
              onClick={exportDocument}
              disabled={!imageInfo || processing}
            >
              {processing ? (
                <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              {processing ? "Processing locally…" : "Download cleaned image"}
            </button>

            {imageInfo ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-soft p-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {imageInfo.width} × {imageInfo.height}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatFileSize(imageInfo.size)}
                  </dd>
                </div>
              </dl>
            ) : null}
          </section>

          <div
            className={`rounded-xl border p-4 text-sm ${
              error
                ? "border-danger bg-danger-soft text-foreground"
                : "border-border bg-surface-soft text-muted-foreground"
            }`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {error ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
              ) : (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
              <p className="leading-relaxed">{error || notice}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <InfoCard icon={Crop} title="Four-corner correction">
          A projective transform maps the selected quadrilateral to a straight rectangular image.
          Keep the numbered corners in clockwise order.
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="Privacy boundary">
          This page does not upload, retain, OCR, or inspect document content. Closing or refreshing
          the page discards its in-memory preview.
        </InfoCard>
        <InfoCard icon={FileImage} title="Raster output">
          Downloads are flattened PNG or JPEG images, not searchable PDFs. Preserve your original
          separately if you may need it later.
        </InfoCard>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Choose a local document image"
      />
    </div>
  );
}
