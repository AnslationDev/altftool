"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  Download,
  Eye,
  EyeOff,
  Grid3X3,
  LockKeyhole,
  MousePointer2,
  Plus,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Trash2,
  ZoomIn,
} from "lucide-react";

import {
  clampRect,
  createPresetRect,
  normalizeRect,
  percentRectToPixels,
  rectToPercent,
  scanContrastRegions,
} from "../lib/frameAnalysis.mjs";

const CAMERA_STATES = {
  IDLE: "idle",
  REQUESTING: "requesting",
  LIVE: "live",
  FROZEN: "frozen",
  STOPPED: "stopped",
  ERROR: "error",
};

const FIELD_META = [
  { key: "x", label: "Left", min: 0 },
  { key: "y", label: "Top", min: 0 },
  { key: "width", label: "Width", min: 1 },
  { key: "height", label: "Height", min: 1 },
];

function cameraErrorMessage(error) {
  if (error?.name === "NotAllowedError") {
    return "Camera permission was not granted. You can retry after allowing camera access in your browser.";
  }
  if (error?.name === "NotFoundError") {
    return "No camera was found on this device.";
  }
  if (error?.name === "NotReadableError") {
    return "The camera is busy in another app or could not be started.";
  }
  return "The camera could not be started. Check browser permissions and try again.";
}

function rectStyle(rect, bounds) {
  const percent = rectToPercent(rect, bounds);
  if (!percent) return undefined;
  return {
    left: `${percent.x}%`,
    top: `${percent.y}%`,
    width: `${percent.width}%`,
    height: `${percent.height}%`,
  };
}

function InfoPanel({ icon: Icon, title, children }) {
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

export default function WebcamBackgroundPrivacyScanner() {
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const nextZoneIdRef = useRef(1);
  const mountedRef = useRef(true);

  const [cameraState, setCameraState] = useState(CAMERA_STATES.IDLE);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showCovers, setShowCovers] = useState(true);
  const [notice, setNotice] = useState(
    "Camera access starts only after you choose Start camera preview.",
  );

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (cameraState !== CAMERA_STATES.LIVE || !videoRef.current || !streamRef.current) {
      return;
    }
    videoRef.current.srcObject = streamRef.current;
    const playResult = videoRef.current.play();
    if (playResult?.catch) playResult.catch(() => {});
  }, [cameraState]);

  const startCamera = useCallback(async () => {
    releaseStream();
    setCameraError("");
    setCameraState(CAMERA_STATES.REQUESTING);
    setNotice("Waiting for your browser camera permission…");

    if (!window.isSecureContext) {
      setCameraError("Camera access requires a secure HTTPS page or localhost.");
      setCameraState(CAMERA_STATES.ERROR);
      setNotice("Camera was not started.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support camera access.");
      setCameraState(CAMERA_STATES.ERROR);
      setNotice("Camera was not started.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraState(CAMERA_STATES.LIVE);
      setNotice("Live preview is active. Freeze a frame when the background is visible.");
    } catch (error) {
      if (!mountedRef.current) return;
      setCameraError(cameraErrorMessage(error));
      setCameraState(CAMERA_STATES.ERROR);
      setNotice("Camera was not started.");
    }
  }, [releaseStream]);

  const stopCamera = useCallback(() => {
    releaseStream();
    setCameraState(CAMERA_STATES.STOPPED);
    setNotice("Camera stopped. Its media track has been released.");
  }, [releaseStream]);

  const freezeFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setNotice("The camera is still preparing. Wait a moment and try again.");
      return;
    }

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = video.videoWidth;
    sourceCanvas.height = video.videoHeight;
    const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      setNotice("This browser could not create a local frame preview.");
      return;
    }
    context.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
    frameRef.current = context.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    releaseStream();
    setDimensions({ width: sourceCanvas.width, height: sourceCanvas.height });
    setZones([]);
    setSuggestions([]);
    setSelectedZoneId(null);
    setDraft(null);
    setShowCovers(true);
    setCameraState(CAMERA_STATES.FROZEN);
    setNotice(
      "Frame frozen and camera stopped. Review the whole image, then cover every sensitive area manually.",
    );
  }, [releaseStream]);

  const drawFrame = useCallback(
    (canvas, includeCovers) => {
      const frame = frameRef.current;
      if (!canvas || !frame) return;
      canvas.width = frame.width;
      canvas.height = frame.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.putImageData(frame, 0, 0);

      if (includeCovers) {
        const tokenStyles = window.getComputedStyle(document.documentElement);
        context.fillStyle =
          tokenStyles.getPropertyValue("--foreground").trim() || "CanvasText";
        zones.forEach((zone) => {
          context.fillRect(
            Math.round(zone.rect.x),
            Math.round(zone.rect.y),
            Math.round(zone.rect.width),
            Math.round(zone.rect.height),
          );
        });
      }
    },
    [zones],
  );

  useEffect(() => {
    if (cameraState === CAMERA_STATES.FROZEN) {
      drawFrame(previewCanvasRef.current, showCovers);
    }
  }, [cameraState, dimensions, drawFrame, showCovers]);

  const addZone = useCallback((rect, label) => {
    if (!dimensions) return;
    const safeRect = clampRect(rect, dimensions);
    if (!safeRect) return;
    const id = `zone-${nextZoneIdRef.current}`;
    nextZoneIdRef.current += 1;
    setZones((current) => [
      ...current,
      {
        id,
        label: label || `Privacy zone ${current.length + 1}`,
        rect: safeRect,
      },
    ]);
    setSelectedZoneId(id);
    setShowCovers(true);
    setNotice("Privacy zone added. The final PNG will use an opaque cover here.");
  }, [dimensions]);

  const addPreset = useCallback(
    (preset) => {
      const rect = createPresetRect(dimensions, preset);
      if (rect) addZone(rect);
    },
    [addZone, dimensions],
  );

  const removeZone = useCallback((id) => {
    setZones((current) => current.filter((zone) => zone.id !== id));
    setSelectedZoneId((current) => (current === id ? null : current));
    setNotice("Privacy zone removed.");
  }, []);

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) || null,
    [selectedZoneId, zones],
  );
  const selectedPercent = useMemo(
    () => (selectedZone && dimensions ? rectToPercent(selectedZone.rect, dimensions) : null),
    [dimensions, selectedZone],
  );

  const updateSelectedZone = useCallback(
    (field, rawValue) => {
      if (!selectedZone || !dimensions) return;
      const currentPercent = rectToPercent(selectedZone.rect, dimensions);
      const value = Number(rawValue);
      if (!currentPercent || !Number.isFinite(value)) return;
      const nextRect = percentRectToPixels(
        { ...currentPercent, [field]: value },
        dimensions,
      );
      if (!nextRect) return;
      setZones((current) =>
        current.map((zone) =>
          zone.id === selectedZone.id ? { ...zone, rect: nextRect } : zone,
        ),
      );
    },
    [dimensions, selectedZone],
  );

  const pointFromPointer = useCallback((event) => {
    const canvas = previewCanvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return null;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      x: Math.min(
        frame.width,
        Math.max(0, ((event.clientX - bounds.left) / bounds.width) * frame.width),
      ),
      y: Math.min(
        frame.height,
        Math.max(0, ((event.clientY - bounds.top) / bounds.height) * frame.height),
      ),
    };
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (!drawMode) return;
      const point = pointFromPointer(event);
      if (!point) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraft({ start: point, current: point });
    },
    [drawMode, pointFromPointer],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!drawMode || !draft) return;
      const point = pointFromPointer(event);
      if (point) setDraft((current) => (current ? { ...current, current: point } : null));
    },
    [draft, drawMode, pointFromPointer],
  );

  const finishPointerZone = useCallback(
    (event) => {
      if (!drawMode || !draft || !dimensions) return;
      const point = pointFromPointer(event) || draft.current;
      const rect = normalizeRect(draft.start, point, dimensions);
      setDraft(null);
      if (!rect) {
        setNotice("That selection was too small. Drag a larger rectangle.");
        return;
      }
      addZone(rect);
    },
    [addZone, dimensions, draft, drawMode, pointFromPointer],
  );

  const scanFrame = useCallback(() => {
    if (!frameRef.current || isScanning) return;
    setIsScanning(true);
    setNotice("Running a local contrast-pattern scan…");
    window.requestAnimationFrame(() => {
      const results = scanContrastRegions(frameRef.current);
      if (!mountedRef.current) return;
      setSuggestions(results);
      setIsScanning(false);
      setNotice(
        results.length
          ? `${results.length} contrast-pattern hint${results.length === 1 ? "" : "s"} found. Review each one before adding a cover.`
          : "No strong contrast patterns were suggested. Manual review is still required.",
      );
    });
  }, [isScanning]);

  const addSuggestion = useCallback(
    (suggestion) => {
      addZone(suggestion.rect, suggestion.label);
      setSuggestions((current) => current.filter((item) => item.id !== suggestion.id));
    },
    [addZone],
  );

  const addAllSuggestions = useCallback(() => {
    if (!suggestions.length || !dimensions) return;
    const additions = suggestions.map((suggestion, index) => {
      const id = `zone-${nextZoneIdRef.current}`;
      nextZoneIdRef.current += 1;
      return {
        id,
        label: `Suggested zone ${zones.length + index + 1}`,
        rect: clampRect(suggestion.rect, dimensions),
      };
    });
    setZones((current) => [...current, ...additions]);
    setSelectedZoneId(additions.at(-1)?.id || null);
    setSuggestions([]);
    setShowCovers(true);
    setNotice("All suggested regions were added as privacy zones. Review them before export.");
  }, [dimensions, suggestions, zones.length]);

  const downloadCoveredFrame = useCallback(() => {
    if (!frameRef.current || !zones.length) return;
    const exportCanvas = document.createElement("canvas");
    drawFrame(exportCanvas, true);
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        setNotice("The covered PNG could not be created in this browser.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "webcam-background-covered.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice("Covered PNG downloaded. The original frame was not uploaded.");
    }, "image/png");
  }, [drawFrame, zones.length]);

  const retake = useCallback(() => {
    frameRef.current = null;
    setDimensions(null);
    setZones([]);
    setSuggestions([]);
    setSelectedZoneId(null);
    setDraft(null);
    startCamera();
  }, [startCamera]);

  const discardFrame = useCallback(() => {
    frameRef.current = null;
    setDimensions(null);
    setZones([]);
    setSuggestions([]);
    setSelectedZoneId(null);
    setDraft(null);
    setCameraState(CAMERA_STATES.IDLE);
    setNotice("Frozen frame discarded from this page.");
  }, []);

  const draftRect =
    draft && dimensions
      ? {
          x: Math.min(draft.start.x, draft.current.x),
          y: Math.min(draft.start.y, draft.current.y),
          width: Math.abs(draft.current.x - draft.start.x),
          height: Math.abs(draft.current.y - draft.start.y),
        }
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Camera className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Local privacy review
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Webcam Background Privacy Scanner
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Freeze a frame before a call, zoom into the background, mark sensitive regions,
              and export an opaque-covered copy. Nothing is uploaded or saved by this tool.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <div className="flex items-center gap-2 font-bold text-success">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              Browser-only processing
            </div>
            <p className="mt-2 leading-relaxed">
              Camera access is requested only after your click. The media track stops when you
              freeze a frame.
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
            <strong>Manual review is required.</strong> Pattern hints are simple contrast
            heuristics—not face, identity, text, or QR-code detection—and may miss sensitive
            details.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <main className="tool-card min-w-0 overflow-hidden xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Camera and covered preview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the entire frame. Privacy covers are opaque in the exported PNG.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-bold ${
                cameraState === CAMERA_STATES.LIVE
                  ? "bg-warning-soft text-warning"
                  : cameraState === CAMERA_STATES.FROZEN
                    ? "bg-success-soft text-success"
                    : "bg-surface-soft text-muted-foreground"
              }`}
            >
              <span className="h-2 w-2 rounded-pill bg-current" aria-hidden="true" />
              {cameraState === CAMERA_STATES.LIVE
                ? "Camera live"
                : cameraState === CAMERA_STATES.FROZEN
                  ? "Frame local"
                  : "Camera off"}
            </span>
          </div>

          {cameraState === CAMERA_STATES.IDLE ||
          cameraState === CAMERA_STATES.STOPPED ||
          cameraState === CAMERA_STATES.ERROR ? (
            <div className="flex min-h-96 flex-col items-center justify-center bg-surface-soft p-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-surface text-primary shadow-sm">
                {cameraState === CAMERA_STATES.ERROR ? (
                  <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
                ) : (
                  <CameraOff className="h-8 w-8" aria-hidden="true" />
                )}
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {cameraState === CAMERA_STATES.ERROR
                  ? "Camera unavailable"
                  : cameraState === CAMERA_STATES.STOPPED
                    ? "Camera is stopped"
                    : "Camera permission stays off until you start"}
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {cameraState === CAMERA_STATES.ERROR
                  ? cameraError
                  : "This tool uses only the camera feed granted to this browser tab. It cannot inspect another app, call, or virtual background."}
              </p>
              <button type="button" className="btn-primary mt-5" onClick={startCamera}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                {cameraState === CAMERA_STATES.ERROR ? "Retry camera" : "Start camera preview"}
              </button>
            </div>
          ) : null}

          {cameraState === CAMERA_STATES.REQUESTING ? (
            <div className="flex min-h-96 flex-col items-center justify-center bg-surface-soft p-6 text-center">
              <span
                className="h-10 w-10 animate-spin rounded-pill border-2 border-border border-t-primary motion-reduce:animate-none"
                aria-hidden="true"
              />
              <h3 className="mt-5 text-lg font-bold text-foreground">Waiting for permission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose Allow in your browser to open a local preview.
              </p>
              <button type="button" className="btn-secondary mt-5" onClick={stopCamera}>
                <CameraOff className="h-4 w-4" aria-hidden="true" />
                Cancel
              </button>
            </div>
          ) : null}

          {cameraState === CAMERA_STATES.LIVE ? (
            <div className="bg-canvas">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => setCameraReady(true)}
                className="block max-h-screen min-h-80 w-full object-contain"
                aria-label="Live webcam preview"
              />
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border bg-surface p-4">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={freezeFrame}
                  disabled={!cameraReady}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Freeze frame
                </button>
                <button type="button" className="btn-secondary" onClick={stopCamera}>
                  <CameraOff className="h-4 w-4" aria-hidden="true" />
                  Stop camera
                </button>
              </div>
            </div>
          ) : null}

          {cameraState === CAMERA_STATES.FROZEN && dimensions ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface p-4">
                <button
                  type="button"
                  className={drawMode ? "btn-primary" : "btn-secondary"}
                  onClick={() => setDrawMode((current) => !current)}
                  aria-pressed={drawMode}
                >
                  <MousePointer2 className="h-4 w-4" aria-hidden="true" />
                  {drawMode ? "Drawing zone" : "Draw privacy zone"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCovers((current) => !current)}
                  aria-pressed={showCovers}
                >
                  {showCovers ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  {showCovers ? "Hide cover preview" : "Show cover preview"}
                </button>
                <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(event) => setShowGrid(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <Grid3X3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Grid
                </label>
                <label className="ml-auto flex min-h-11 min-w-48 items-center gap-3 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground">
                  <ZoomIn className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="sr-only">Preview zoom</span>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    step="25"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="min-w-24 flex-1 accent-primary"
                    aria-label="Preview zoom"
                  />
                  <span className="w-12 text-right text-xs text-muted-foreground">{zoom}%</span>
                </label>
              </div>

              <div className="max-h-screen overflow-auto bg-surface-soft p-3 sm:p-5">
                <div className="relative" style={{ width: `${zoom}%` }}>
                  <canvas
                    ref={previewCanvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerZone}
                    onPointerCancel={() => setDraft(null)}
                    className={`block h-auto w-full select-none rounded-lg shadow-sm ${
                      drawMode ? "touch-none cursor-crosshair" : "cursor-default"
                    }`}
                    role="img"
                    aria-label={`Frozen local webcam frame with ${zones.length} privacy zone${zones.length === 1 ? "" : "s"}`}
                  />

                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                    {showGrid
                      ? [25, 50, 75].flatMap((position) => [
                          <span
                            key={`vertical-${position}`}
                            className="absolute inset-y-0 border-l border-border-strong"
                            style={{ left: `${position}%` }}
                            aria-hidden="true"
                          />,
                          <span
                            key={`horizontal-${position}`}
                            className="absolute inset-x-0 border-t border-border-strong"
                            style={{ top: `${position}%` }}
                            aria-hidden="true"
                          />,
                        ])
                      : null}

                    {suggestions.map((suggestion) => (
                      <span
                        key={suggestion.id}
                        className="absolute border-2 border-dashed border-warning bg-warning-soft/20"
                        style={rectStyle(suggestion.rect, dimensions)}
                        aria-hidden="true"
                      />
                    ))}

                    {zones.map((zone) => (
                      <span
                        key={zone.id}
                        className={`absolute border-2 ${
                          zone.id === selectedZoneId
                            ? "border-secondary bg-secondary/20"
                            : "border-primary bg-primary/20"
                        }`}
                        style={rectStyle(zone.rect, dimensions)}
                        aria-hidden="true"
                      />
                    ))}

                    {draftRect ? (
                      <span
                        className="absolute border-2 border-dashed border-primary bg-primary/20"
                        style={rectStyle(draftRect, dimensions)}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface p-4">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={downloadCoveredFrame}
                  disabled={!zones.length}
                  title={zones.length ? undefined : "Add at least one privacy zone first"}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download covered PNG
                </button>
                <button type="button" className="btn-secondary" onClick={retake}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retake
                </button>
                <button type="button" className="btn-secondary" onClick={discardFrame}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Discard frame
                </button>
                {!zones.length ? (
                  <p className="text-xs text-muted-foreground">
                    Add a privacy zone to enable safe export.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          <p
            className="border-t border-border bg-surface px-5 py-3 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {notice}
          </p>
        </main>

        <aside className="space-y-6">
          {cameraState === CAMERA_STATES.FROZEN && dimensions ? (
            <>
              <section className="tool-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-foreground">Privacy zones</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Drag on the frame, or use these keyboard-accessible presets and controls.
                    </p>
                  </div>
                  <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                    {zones.length}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["top", "Top"],
                    ["center", "Center"],
                    ["bottom", "Bottom"],
                  ].map(([preset, label]) => (
                    <button
                      key={preset}
                      type="button"
                      className="min-h-11 rounded-lg border border-border bg-surface px-2 text-xs font-bold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/35"
                      onClick={() => addPreset(preset)}
                    >
                      <Plus className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                {zones.length ? (
                  <div className="mt-5 space-y-2">
                    {zones.map((zone, index) => (
                      <div
                        key={zone.id}
                        className={`flex items-center gap-2 rounded-lg border p-2 ${
                          zone.id === selectedZoneId
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedZoneId(zone.id)}
                          className="min-h-10 min-w-0 flex-1 rounded-md px-2 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/35"
                        >
                          Zone {index + 1}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeZone(zone.id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/35"
                          aria-label={`Remove zone ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg bg-surface-soft p-3 text-sm text-muted-foreground">
                    No zones yet. Add one for screens, documents, photos, addresses, or other
                    details you do not want visible.
                  </p>
                )}

                {selectedZone && selectedPercent ? (
                  <fieldset className="mt-5 border-t border-border pt-5">
                    <legend className="text-sm font-bold text-foreground">Adjust selected zone</legend>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {FIELD_META.map((field) => (
                        <label
                          key={field.key}
                          className="text-xs font-semibold text-muted-foreground"
                        >
                          {field.label} (%)
                          <input
                            type="number"
                            min={field.min}
                            max="100"
                            step="1"
                            value={Math.round(selectedPercent[field.key])}
                            onChange={(event) =>
                              updateSelectedZone(field.key, event.target.value)
                            }
                            className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-3 focus:ring-primary/35"
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
              </section>

              <section className="tool-card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                    <ScanSearch className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">Contrast-pattern hints</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Optional local scan for small areas with repeated light/dark edges.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary mt-4 w-full"
                  onClick={scanFrame}
                  disabled={isScanning}
                >
                  <ScanSearch className="h-4 w-4" aria-hidden="true" />
                  {isScanning ? "Scanning locally…" : "Suggest regions"}
                </button>

                {suggestions.length ? (
                  <div className="mt-4 space-y-2">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="rounded-lg border border-warning bg-warning-soft p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">{suggestion.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Heuristic score {suggestion.confidence}/100
                            </p>
                          </div>
                          <button
                            type="button"
                            className="min-h-10 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/35"
                            onClick={() => addSuggestion(suggestion)}
                          >
                            Add cover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary w-full"
                      onClick={addAllSuggestions}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add all after review
                    </button>
                  </div>
                ) : null}
              </section>
            </>
          ) : null}

          <InfoPanel icon={ShieldCheck} title="What this tool can do">
            <ul className="space-y-2">
              <li>• Show the camera feed this tab receives after permission.</li>
              <li>• Freeze one frame and help you inspect it with zoom and a grid.</li>
              <li>• Place opaque privacy covers and download the covered PNG.</li>
            </ul>
          </InfoPanel>

          <InfoPanel icon={AlertTriangle} title="Important limits">
            <ul className="space-y-2">
              <li>• It cannot see another app, meeting window, or virtual background output.</li>
              <li>• It does not recognize faces, identity, text, or confidential documents.</li>
              <li>• It cannot guarantee that every sensitive detail has been detected.</li>
            </ul>
          </InfoPanel>
        </aside>
      </div>
    </div>
  );
}
