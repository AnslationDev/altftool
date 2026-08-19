"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  EyeOff,
  FileVideo2,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ScanEye,
  ShieldCheck,
  Square,
  Trash2,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  activeRegionsAtTime,
  createDefaultRegion,
  formatTimestamp,
  normaliseRegion,
  regionToPixels,
  updateRegion,
} from "../lib/regions.mjs";

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

const CONTROL_CLASS =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

const MODE_OPTIONS = [
  {
    id: "solid",
    label: "Solid cover",
    description: "Best for passwords, keys, and identifiers.",
  },
  {
    id: "blur",
    label: "Blur",
    description: "Softens the selected pixels during export.",
  },
  {
    id: "pixelate",
    label: "Pixelate",
    description: "Downscales and enlarges the selected pixels.",
  },
];

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
  danger = false,
  pressed,
  className = "",
}) {
  let variant =
    "border border-border bg-surface text-foreground hover:border-primary hover:text-primary";
  if (primary) variant = "border border-primary bg-primary text-primary-foreground hover:bg-primary-hover";
  if (danger) variant = "border border-danger bg-surface text-danger hover:bg-danger-soft";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${variant} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function chooseMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionFromMimeType(mimeType) {
  const type = (mimeType || "").toLowerCase();
  if (type.includes("webm")) return "webm";
  if (type.includes("mp4")) return "mp4";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}

function seekVideo(video, time) {
  return new Promise((resolve, reject) => {
    if (Math.abs(video.currentTime - time) < 0.01) {
      resolve();
      return;
    }

    const cleanup = () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };
    const handleSeeked = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("The browser could not seek through this video."));
    };

    video.addEventListener("seeked", handleSeeked, { once: true });
    video.addEventListener("error", handleError, { once: true });
    video.currentTime = time;
  });
}

// Chromium-family browsers commonly report video.duration as Infinity right after
// "loadedmetadata" for blob URLs created from MediaRecorder output, because streamed
// WebM/Matroska containers omit the Segment Duration element. The documented recovery
// is to seek far past the end of the media and back to the start, which forces the
// browser to resolve and cache the real duration from the container's cues.
function recoverInfiniteDuration(video) {
  return new Promise((resolve) => {
    if (Number.isFinite(video.duration)) {
      resolve();
      return;
    }
    let settled = false;
    let timer;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeEventListener("durationchange", handleDurationChange);
      const restoreToStart = () => {
        video.removeEventListener("seeked", restoreToStart);
        resolve();
      };
      video.addEventListener("seeked", restoreToStart, { once: true });
      try {
        video.currentTime = 0;
      } catch {
        video.removeEventListener("seeked", restoreToStart);
        resolve();
      }
    };
    const handleDurationChange = () => {
      if (Number.isFinite(video.duration)) finish();
    };
    video.addEventListener("durationchange", handleDurationChange);
    timer = window.setTimeout(finish, 2_000);
    try {
      video.currentTime = 1e101;
    } catch {
      finish();
    }
  });
}

const REGION_DRAW_PRIORITY = { blur: 0, pixelate: 0, solid: 1 };

function drawExportFrame(context, video, regions, scratchCanvas, solidColour) {
  const canvas = context.canvas;
  context.filter = "none";
  context.imageSmoothingEnabled = true;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  activeRegionsAtTime(regions, video.currentTime)
    .slice()
    .sort(
      (a, b) => (REGION_DRAW_PRIORITY[a.mode] ?? 0) - (REGION_DRAW_PRIORITY[b.mode] ?? 0),
    )
    .forEach((region) => {
      const rectangle = regionToPixels(region, canvas.width, canvas.height);
      if (rectangle.width <= 0 || rectangle.height <= 0) return;

      if (region.mode === "solid") {
        context.save();
        context.fillStyle = solidColour;
        context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        context.restore();
        return;
      }

      if (region.mode === "blur") {
        const blurRadius = Math.max(
          8,
          Math.round(Math.min(rectangle.width, rectangle.height) / 12),
        );
        context.save();
        context.beginPath();
        context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        context.clip();
        context.filter = `blur(${blurRadius}px)`;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();
        return;
      }

      const sampleWidth = Math.max(1, Math.round(rectangle.width / 16));
      const sampleHeight = Math.max(1, Math.round(rectangle.height / 16));
      scratchCanvas.width = sampleWidth;
      scratchCanvas.height = sampleHeight;
      const scratch = scratchCanvas.getContext("2d");
      scratch.imageSmoothingEnabled = true;
      scratch.drawImage(
        video,
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height,
        0,
        0,
        sampleWidth,
        sampleHeight,
      );
      context.save();
      context.imageSmoothingEnabled = false;
      context.drawImage(
        scratchCanvas,
        0,
        0,
        sampleWidth,
        sampleHeight,
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height,
      );
      context.restore();
    });
}

function RegionStyle({ mode, selected }) {
  const modeClass =
    mode === "solid"
      ? "border-foreground bg-foreground/90 text-background"
      : mode === "blur"
        ? "border-primary bg-surface/20 text-foreground backdrop-blur-md"
        : "border-primary bg-primary-soft/80 text-foreground backdrop-blur-sm";

  return `${modeClass} ${
    selected ? "ring-[3px] ring-primary/40" : ""
  } absolute overflow-hidden rounded-sm border-2`;
}

function NumberField({ label, value, min, max, step = 0.1, suffix, onChange, disabled }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">
        {label} {suffix ? `(${suffix})` : ""}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className={CONTROL_CLASS}
      />
    </label>
  );
}

export default function ScreenRecordingRedactor() {
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [regions, setRegions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newMode, setNewMode] = useState("solid");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [outputExtension, setOutputExtension] = useState("webm");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scratchCanvasRef = useRef(null);
  const drawingRef = useRef(null);
  const sourceUrlRef = useRef("");
  const outputUrlRef = useRef("");
  const recorderRef = useRef(null);
  const finishHandlerRef = useRef(null);
  const exportStreamRef = useRef(null);
  const sourceCaptureRef = useRef(null);
  const animationFrameRef = useRef(0);
  const exportingRef = useRef(false);
  const cancelledRef = useRef(false);
  const priorMutedRef = useRef(false);

  const selectedRegion = regions.find((region) => region.id === selectedId) || null;
  const activeRegions = useMemo(
    () => activeRegionsAtTime(regions, currentTime),
    [currentTime, regions],
  );

  useEffect(() => {
    return () => {
      exportingRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      exportStreamRef.current?.getTracks().forEach((track) => track.stop());
      sourceCaptureRef.current?.getTracks().forEach((track) => track.stop());
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, []);

  const commitRegions = (nextRegions) => {
    setHistory((current) => [...current.slice(-24), regions]);
    setRegions(nextRegions);
  };

  const clearOutput = () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = "";
    setOutputUrl("");
    setOutputSize(0);
  };

  const resetWorkspace = () => {
    if (
      (sourceUrl || regions.length > 0) &&
      typeof window !== "undefined" &&
      !window.confirm(
        "Start a new video? This clears the loaded video and every redaction region, and cannot be undone.",
      )
    ) {
      return;
    }
    if (isExporting) {
      cancelledRef.current = true;
      exportingRef.current = false;
      videoRef.current?.pause();
      if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    }
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    clearOutput();
    setFile(null);
    setSourceUrl("");
    setMetadata(null);
    setRegions([]);
    setHistory([]);
    setSelectedId("");
    setCurrentTime(0);
    setIsPlaying(false);
    setDraft(null);
    setError("");
    setMessage("");
    setExportProgress(0);
  };

  const loadFile = (nextFile) => {
    setError("");
    setMessage("");

    if (!nextFile?.type?.startsWith("video/")) {
      setError("Choose a video file that your browser can decode.");
      return;
    }

    if (isExporting) {
      setError("Cancel the current export before choosing another video.");
      return;
    }

    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    clearOutput();
    const url = URL.createObjectURL(nextFile);
    sourceUrlRef.current = url;
    setFile(nextFile);
    setSourceUrl(url);
    setMetadata(null);
    setRegions([]);
    setHistory([]);
    setSelectedId("");
    setCurrentTime(0);
    setIsPlaying(false);
    setMessage("Reading video metadata…");
  };

  const handleLoadedMetadata = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!Number.isFinite(video.duration)) {
      await recoverInfiniteDuration(video);
    }
    if (videoRef.current !== video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration || !video.videoWidth || !video.videoHeight) {
      setError("This video has no readable duration or frame dimensions.");
      setMessage("");
      return;
    }
    setMetadata({
      duration,
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setMessage("Video ready. Draw on the preview or add a centre region.");
  };

  const handleVideoError = () => {
    setMetadata(null);
    setError(
      "This browser could not decode the selected video. Try a browser-supported MP4 or WebM file.",
    );
    setMessage("");
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || isExporting) return;
    setError("");
    try {
      if (video.paused) {
        if (video.ended) video.currentTime = 0;
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setError("The browser blocked playback. Try pressing play again.");
    }
  };

  const seekPreview = (time) => {
    const video = videoRef.current;
    if (!video || isExporting) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const makeRegionId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `region-${Date.now()}`;

  const addCentreRegion = () => {
    if (!metadata || isExporting) return;
    const region = {
      ...createDefaultRegion({
        id: makeRegionId(),
        time: currentTime,
        duration: metadata.duration,
      }),
      mode: newMode,
    };
    commitRegions([...regions, region]);
    setSelectedId(region.id);
    setMessage("Region added. Adjust its timing and position in the inspector.");
  };

  const pointFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100)),
    };
  };

  const handlePointerDown = (event) => {
    if (!metadata || isExporting || event.button !== 0) return;
    const point = pointFromPointer(event);
    drawingRef.current = point;
    setDraft({ x: point.x, y: point.y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    const point = pointFromPointer(event);
    const start = drawingRef.current;
    setDraft({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  };

  const finishDrawing = (event) => {
    if (!drawingRef.current || !draft || !metadata) return;
    drawingRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (draft.width < 1 || draft.height < 1) {
      setDraft(null);
      return;
    }

    const defaultRegion = createDefaultRegion({
      id: makeRegionId(),
      time: currentTime,
      duration: metadata.duration,
    });
    const region = normaliseRegion(
      {
        ...defaultRegion,
        ...draft,
        mode: newMode,
      },
      metadata.duration,
    );
    commitRegions([...regions, region]);
    setSelectedId(region.id);
    setDraft(null);
    setMessage("Timed redaction region added.");
  };

  const changeSelectedRegion = (patch) => {
    if (!selectedRegion || !metadata || isExporting) return;
    commitRegions(updateRegion(regions, selectedRegion.id, patch, metadata.duration));
  };

  const removeRegion = (id) => {
    if (isExporting) return;
    const next = regions.filter((region) => region.id !== id);
    commitRegions(next);
    if (selectedId === id) setSelectedId(next[0]?.id || "");
    setMessage("Region removed. Use Undo to restore it.");
  };

  const clearRegions = () => {
    if (!regions.length || isExporting) return;
    commitRegions([]);
    setSelectedId("");
    setMessage("All regions removed. Use Undo to restore them.");
  };

  const undoRegions = () => {
    if (!history.length || isExporting) return;
    const previous = history[history.length - 1];
    setRegions(previous);
    setHistory((current) => current.slice(0, -1));
    if (!previous.some((region) => region.id === selectedId)) {
      setSelectedId(previous[0]?.id || "");
    }
    setMessage("Last region change undone.");
  };

  const stopExportResources = () => {
    exportingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);
    exportStreamRef.current?.getTracks().forEach((track) => track.stop());
    sourceCaptureRef.current?.getTracks().forEach((track) => track.stop());
    exportStreamRef.current = null;
    sourceCaptureRef.current = null;
    if (finishHandlerRef.current) {
      videoRef.current?.removeEventListener("ended", finishHandlerRef.current);
      finishHandlerRef.current = null;
    }
  };

  const cancelExport = () => {
    if (!isExporting) return;
    cancelledRef.current = true;
    exportingRef.current = false;
    if (finishHandlerRef.current) {
      videoRef.current?.removeEventListener("ended", finishHandlerRef.current);
      finishHandlerRef.current = null;
    }
    videoRef.current?.pause();
    if (recorderRef.current?.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopExportResources();
      setIsExporting(false);
    }
    setMessage("Export cancelled.");
  };

  const startExport = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const scratchCanvas = scratchCanvasRef.current;
    if (!video || !canvas || !scratchCanvas || !metadata || !regions.length) return;

    setError("");
    setMessage("");
    clearOutput();

    if (
      typeof MediaRecorder === "undefined" ||
      typeof canvas.captureStream !== "function"
    ) {
      setError(
        "This browser does not provide the Canvas Capture and MediaRecorder APIs needed for local export.",
      );
      return;
    }

    try {
      video.pause();
      setIsPlaying(false);
      priorMutedRef.current = video.muted;
      await seekVideo(video, 0);

      canvas.width = metadata.width;
      canvas.height = metadata.height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas rendering is unavailable.");

      const solidColour = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();
      drawExportFrame(context, video, regions, scratchCanvas, solidColour);

      const stream = canvas.captureStream(30);
      exportStreamRef.current = stream;

      const captureMethod = video.captureStream || video.mozCaptureStream;
      if (typeof captureMethod === "function") {
        const sourceCapture = captureMethod.call(video);
        sourceCaptureRef.current = sourceCapture;
        sourceCapture.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      const mimeType = chooseMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks = [];
      cancelledRef.current = false;
      exportingRef.current = true;
      video.muted = true;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) chunks.push(event.data);
      });

      recorder.addEventListener(
        "stop",
        () => {
          stopExportResources();
          video.muted = priorMutedRef.current;
          setIsExporting(false);
          setIsPlaying(false);
          if (cancelledRef.current) {
            setExportProgress(0);
            return;
          }

          const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
          if (!blob.size) {
            setError("The browser ended the export without producing video data.");
            setExportProgress(0);
            return;
          }
          const url = URL.createObjectURL(blob);
          outputUrlRef.current = url;
          setOutputUrl(url);
          setOutputSize(blob.size);
          setOutputExtension(extensionFromMimeType(recorder.mimeType));
          setExportProgress(100);
          setMessage("Flattened WebM ready. Review it before deleting the original.");
        },
        { once: true },
      );

      recorder.addEventListener(
        "error",
        () => {
          setError("The browser encoder stopped unexpectedly.");
        },
        { once: true },
      );

      const render = () => {
        if (!exportingRef.current) return;
        drawExportFrame(context, video, regions, scratchCanvas, solidColour);
        setExportProgress(
          Math.min(99, Math.round((video.currentTime / metadata.duration) * 100)),
        );
        if (!video.ended) animationFrameRef.current = requestAnimationFrame(render);
      };

      const finish = () => {
        drawExportFrame(context, video, regions, scratchCanvas, solidColour);
        if (recorder.state !== "inactive") recorder.stop();
      };
      finishHandlerRef.current = finish;
      video.addEventListener("ended", finish, { once: true });

      setIsExporting(true);
      setExportProgress(0);
      setMessage("Exporting in real time. Keep this tab visible until it finishes.");
      recorder.start(1000);
      animationFrameRef.current = requestAnimationFrame(render);
      await video.play();
    } catch (caughtError) {
      cancelledRef.current = true;
      if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
      stopExportResources();
      if (video) video.muted = priorMutedRef.current;
      setIsExporting(false);
      setExportProgress(0);
      setError(caughtError?.message || "The browser could not start the local export.");
    }
  };

  const downloadOutput = () => {
    if (!outputUrl) return;
    const stem = (file?.name || "screen-recording").replace(/\.[^.]+$/, "");
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = `${stem}-redacted.${outputExtension || "webm"}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const timePercent = metadata
    ? Math.min(100, Math.max(0, (currentTime / metadata.duration) * 100))
    : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ScanEye className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Screen Recording Redactor
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Local video privacy
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Cover sensitive areas for a specific time range, then flatten the result into a
                new WebM without uploading the recording.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Privacy guarantees">
            {[
              ["Local only", LockKeyhole],
              ["No storage", EyeOff],
              ["Flattened export", Layers3],
            ].map(([label, Icon]) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-surface-soft px-3 text-xs font-bold text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section
        className="mt-6 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4"
        aria-label="Export limitations"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-bold text-foreground">Review every frame before sharing</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Browser codecs, blur edges, fast motion, and audio capture vary. Export runs in real
            time and is not a guarantee that every sensitive detail was found or hidden.
          </p>
        </div>
      </section>

      {error ? (
        <div
          className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-sm p-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {!sourceUrl ? (
        <section className="mt-6 tool-card p-5 sm:p-8">
          <label
            htmlFor="screen-recording-upload"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              loadFile(event.dataTransfer.files?.[0]);
            }}
            className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-soft p-6 text-center transition-colors hover:border-primary focus-within:border-primary"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Upload className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="mt-4 text-lg font-bold text-foreground">
              Choose a screen recording
            </span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Drop a browser-supported video here, or press Enter on this area to browse. The
              file remains on this device.
            </span>
            <span className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">
              Select video
            </span>
            <input
              id="screen-recording-upload"
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(event) => {
                loadFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
            <div className="tool-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-foreground">{file?.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metadata
                      ? `${metadata.width} × ${metadata.height} · ${formatTimestamp(
                          metadata.duration,
                        )} · ${formatBytes(file?.size)}`
                      : "Reading video…"}
                  </p>
                </div>
                <ActionButton
                  icon={RotateCcw}
                  onClick={resetWorkspace}
                  disabled={isExporting}
                >
                  New video
                </ActionButton>
              </div>

              <div className="bg-canvas p-3 sm:p-5">
                <div
                  className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-canvas"
                  style={{
                    aspectRatio: metadata
                      ? `${metadata.width} / ${metadata.height}`
                      : "16 / 9",
                  }}
                >
                  <video
                    ref={videoRef}
                    src={sourceUrl}
                    playsInline
                    muted={isMuted}
                    preload="metadata"
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={handleVideoError}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="h-full w-full object-contain"
                  />
                  {metadata ? (
                    <div
                      className="absolute inset-0 touch-none"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={finishDrawing}
                      onPointerCancel={() => {
                        drawingRef.current = null;
                        setDraft(null);
                      }}
                      role="group"
                      aria-label="Video redaction drawing surface. Use Add centre region for keyboard-only editing."
                    >
                      {activeRegions.map((region) => (
                        <button
                          type="button"
                          key={region.id}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => setSelectedId(region.id)}
                          className={RegionStyle({
                            mode: region.mode,
                            selected: selectedId === region.id,
                          })}
                          style={{
                            left: `${region.x}%`,
                            top: `${region.y}%`,
                            width: `${region.width}%`,
                            height: `${region.height}%`,
                          }}
                          aria-label={`Select ${region.mode} region from ${formatTimestamp(
                            region.start,
                          )} to ${formatTimestamp(region.end)}`}
                        >
                          <span className="flex h-full items-center justify-center p-1 text-xs font-bold capitalize">
                            {region.mode}
                          </span>
                        </button>
                      ))}
                      {draft ? (
                        <span
                          className="pointer-events-none absolute rounded-sm border-2 border-primary bg-primary-soft/60"
                          style={{
                            left: `${draft.x}%`,
                            top: `${draft.y}%`,
                            width: `${draft.width}%`,
                            height: `${draft.height}%`,
                          }}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 border-t border-border p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                    <span>{formatTimestamp(currentTime)}</span>
                    <span>{metadata ? formatTimestamp(metadata.duration) : "00:00.0"}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={metadata?.duration || 0.01}
                    step="0.01"
                    value={Math.min(currentTime, metadata?.duration || 0)}
                    onChange={(event) => seekPreview(Number(event.target.value))}
                    disabled={!metadata || isExporting}
                    className="w-full accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                    aria-label="Preview time"
                  />
                  <div className="relative mt-2 h-3 overflow-hidden rounded-pill bg-surface-soft">
                    {regions.map((region) => (
                      <button
                        type="button"
                        key={region.id}
                        onClick={() => {
                          setSelectedId(region.id);
                          seekPreview(region.start);
                        }}
                        disabled={isExporting}
                        className="absolute inset-y-0 min-w-1 rounded-pill bg-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                        style={{
                          left: `${(region.start / metadata.duration) * 100}%`,
                          width: `${Math.max(
                            0.5,
                            ((region.end - region.start) / metadata.duration) * 100,
                          )}%`,
                        }}
                        aria-label={`Go to redaction from ${formatTimestamp(
                          region.start,
                        )} to ${formatTimestamp(region.end)}`}
                      />
                    ))}
                    <span
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
                      style={{ left: `${timePercent}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    icon={isPlaying ? Pause : Play}
                    onClick={togglePlayback}
                    disabled={!metadata || isExporting}
                    pressed={isPlaying}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </ActionButton>
                  <ActionButton
                    icon={isMuted ? VolumeX : Volume2}
                    onClick={() => setIsMuted((current) => !current)}
                    disabled={!metadata || isExporting}
                    pressed={isMuted}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </ActionButton>
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-md bg-surface-soft px-3 text-xs font-bold text-muted-foreground">
                    <MousePointer2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    Drag over the preview to add a region
                  </span>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="tool-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-foreground">Redaction regions</h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Regions are stored only in this open page.
                    </p>
                  </div>
                  <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                    {regions.length}
                  </span>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-bold text-muted-foreground">
                    New region style
                  </span>
                  <select
                    value={newMode}
                    onChange={(event) => setNewMode(event.target.value)}
                    disabled={!metadata || isExporting}
                    className={CONTROL_CLASS}
                  >
                    {MODE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {MODE_OPTIONS.find((option) => option.id === newMode)?.description}
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <ActionButton
                    icon={Plus}
                    onClick={addCentreRegion}
                    disabled={!metadata || isExporting}
                  >
                    Add centre region
                  </ActionButton>
                  <ActionButton
                    icon={Undo2}
                    onClick={undoRegions}
                    disabled={!history.length || isExporting}
                  >
                    Undo
                  </ActionButton>
                </div>

                {regions.length ? (
                  <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {regions.map((region, index) => (
                      <div
                        key={region.id}
                        className={`flex items-center gap-2 rounded-md border p-2 ${
                          selectedId === region.id
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-surface-soft"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(region.id);
                            seekPreview(region.start);
                          }}
                          disabled={isExporting}
                          className="min-h-11 min-w-0 flex-1 rounded-sm px-2 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                        >
                          <span className="block truncate text-sm font-bold text-foreground">
                            Region {index + 1} · {region.mode}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {formatTimestamp(region.start)}–{formatTimestamp(region.end)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRegion(region.id)}
                          disabled={isExporting}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:opacity-60"
                          aria-label={`Remove region ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-soft p-4 text-center">
                    <Square className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Draw on the preview or add a centre region. Keyboard users can edit every
                      value below.
                    </p>
                  </div>
                )}
              </section>

              {selectedRegion ? (
                <section className="tool-card p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-foreground">Region inspector</h2>
                    <ActionButton
                      icon={Trash2}
                      onClick={() => removeRegion(selectedRegion.id)}
                      disabled={isExporting}
                      danger
                      className="px-3"
                    >
                      Remove
                    </ActionButton>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-bold text-muted-foreground">
                      Effect
                    </span>
                    <select
                      value={selectedRegion.mode}
                      onChange={(event) =>
                        changeSelectedRegion({ mode: event.target.value })
                      }
                      disabled={isExporting}
                      className={CONTROL_CLASS}
                    >
                      {MODE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <NumberField
                      label="Start"
                      suffix="seconds"
                      value={selectedRegion.start}
                      min={0}
                      max={metadata.duration}
                      onChange={(value) => changeSelectedRegion({ start: value })}
                      disabled={isExporting}
                    />
                    <NumberField
                      label="End"
                      suffix="seconds"
                      value={selectedRegion.end}
                      min={selectedRegion.start}
                      max={metadata.duration}
                      onChange={(value) => changeSelectedRegion({ end: value })}
                      disabled={isExporting}
                    />
                    <NumberField
                      label="Left"
                      suffix="%"
                      value={selectedRegion.x}
                      min={0}
                      max={99}
                      onChange={(value) => changeSelectedRegion({ x: value })}
                      disabled={isExporting}
                    />
                    <NumberField
                      label="Top"
                      suffix="%"
                      value={selectedRegion.y}
                      min={0}
                      max={99}
                      onChange={(value) => changeSelectedRegion({ y: value })}
                      disabled={isExporting}
                    />
                    <NumberField
                      label="Width"
                      suffix="%"
                      value={selectedRegion.width}
                      min={1}
                      max={100 - selectedRegion.x}
                      onChange={(value) => changeSelectedRegion({ width: value })}
                      disabled={isExporting}
                    />
                    <NumberField
                      label="Height"
                      suffix="%"
                      value={selectedRegion.height}
                      min={1}
                      max={100 - selectedRegion.y}
                      onChange={(value) => changeSelectedRegion({ height: value })}
                      disabled={isExporting}
                    />
                  </div>
                </section>
              ) : null}

              {regions.length ? (
                <ActionButton
                  icon={Trash2}
                  onClick={clearRegions}
                  disabled={isExporting}
                  danger
                  className="w-full"
                >
                  Remove all regions
                </ActionButton>
              ) : null}
            </aside>
          </section>

          <section className="mt-6 tool-card p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <FileVideo2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Flatten redactions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {regions.length
                        ? `${regions.length} timed region${regions.length === 1 ? "" : "s"} will be baked into each frame.`
                        : "Add at least one redaction region before exporting."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                    Real-time export
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    WebM output
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    Audio is best-effort
                  </span>
                </div>

                {isExporting || exportProgress > 0 ? (
                  <div className="mt-4" aria-live="polite">
                    <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                      <span>{isExporting ? "Encoding locally" : "Export complete"}</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-pill bg-surface-soft"
                      role="progressbar"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={exportProgress}
                    >
                      <div
                        className="h-full rounded-pill bg-primary transition-[width]"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {isExporting ? (
                  <ActionButton icon={X} onClick={cancelExport} danger>
                    Cancel export
                  </ActionButton>
                ) : (
                  <ActionButton
                    icon={Layers3}
                    onClick={startExport}
                    disabled={!metadata || !regions.length}
                    primary
                  >
                    Export redacted WebM
                  </ActionButton>
                )}
              </div>
            </div>
          </section>

          {outputUrl ? (
            <section className="mt-6 tool-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">Redacted export ready</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      WebM · {formatBytes(outputSize)}
                    </p>
                  </div>
                </div>
                <ActionButton icon={Download} onClick={downloadOutput} primary>
                  Download WebM
                </ActionButton>
              </div>
              <div className="bg-canvas p-4 sm:p-6">
                <video
                  src={outputUrl}
                  controls
                  playsInline
                  className="mx-auto max-h-screen w-full rounded-lg border border-border bg-canvas"
                />
              </div>
              <p className="border-t border-border p-4 text-sm leading-relaxed text-muted-foreground">
                Scrub through the downloaded result at every redaction boundary. Keep the
                original until you have verified the new file.
              </p>
            </section>
          ) : null}

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          <canvas ref={scratchCanvasRef} className="hidden" aria-hidden="true" />
        </>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="How this tool works">
        {[
          {
            icon: Upload,
            title: "1. Load locally",
            body: "Your browser reads the selected recording from this device. No account or upload is used.",
          },
          {
            icon: MousePointer2,
            title: "2. Mark time and area",
            body: "Draw rectangles, set precise start and end times, and choose solid, blur, or pixelate.",
          },
          {
            icon: Download,
            title: "3. Flatten and review",
            body: "Canvas redraws every frame and MediaRecorder creates a browser-dependent WebM.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
