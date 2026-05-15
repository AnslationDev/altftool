"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  CheckCircle,
  Clock,
  Download,
  FastForward,
  FileVideo,
  Film,
  Gauge,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const OUTPUT_OPTIONS = [
  { value: "mp4", label: "MP4", detail: "Best compatibility" },
  { value: "webm", label: "WebM", detail: "Smaller browser clips" },
  { value: "same", label: "Original", detail: "Fastest when stream-copying" },
];

const MODE_OPTIONS = [
  {
    value: "copy",
    label: "Fast Trim",
    detail: "No re-encode, original quality, keyframe-based cut.",
    icon: FastForward,
  },
  {
    value: "precise",
    label: "Precise Trim",
    detail: "Re-encode for frame-accurate start and end points.",
    icon: Gauge,
  },
];

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];

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

function formatTime(seconds = 0, withMs = false) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const ms = Math.round((safe - Math.floor(safe)) * 1000);
  const base = [hours, minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return withMs ? `${base}.${String(ms).padStart(3, "0")}` : base;
}

function formatFileTime(seconds = 0) {
  return formatTime(seconds)
    .replaceAll(":", "-")
    .replace(".", "-");
}

function getExtension(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
  return VIDEO_EXTENSIONS.includes(ext) ? ext : "mp4";
}

function sanitizeFileName(name = "video") {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "video"
  );
}

function getMimeType(ext) {
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
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

function clampTime(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

export default function MainComponent() {
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [trimMode, setTrimMode] = useState("copy");
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [keepAudio, setKeepAudio] = useState(true);
  const [crf, setCrf] = useState(22);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingSelection, setIsPlayingSelection] = useState(false);
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultName, setResultName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);
  const resultUrlRef = useRef("");
  const sourceUrlRef = useRef("");

  const selectedDuration = Math.max(0, endTime - startTime);
  const sourceExt = file ? getExtension(file.name) : "mp4";
  const effectiveOutputFormat =
    outputFormat === "same"
      ? trimMode === "copy"
        ? sourceExt
        : "mp4"
      : outputFormat;
  const estimatedSize =
    file && duration ? Math.round(file.size * (selectedDuration / duration)) : 0;
  const selectionLeft = duration ? (startTime / duration) * 100 : 0;
  const selectionWidth = duration
    ? ((endTime - startTime) / duration) * 100
    : 0;

  const outputSummary = useMemo(() => {
    if (!file) return "Upload a video to configure the trim.";
    if (selectedDuration <= 0) return "Select a valid time range.";
    return `${formatTime(selectedDuration, true)} clip · ${effectiveOutputFormat.toUpperCase()} · ${keepAudio ? "audio kept" : "muted"}`;
  }, [effectiveOutputFormat, file, keepAudio, selectedDuration]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      ffmpegRef.current?.terminate?.();
    };
  }, []);

  const clearResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = "";
    setResultUrl("");
    setResultBlob(null);
    setResultName("");
    setProgress(0);
  };

  const resetTool = () => {
    clearResult();
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    setFile(null);
    setSourceUrl("");
    setDuration(0);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setStatus("");
    setError("");
    setIsPlayingSelection(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const loadVideoFile = (selectedFile) => {
    setError("");
    setStatus("");
    clearResult();

    const ext = getExtension(selectedFile?.name);
    const isVideo =
      selectedFile?.type?.startsWith("video/") ||
      VIDEO_EXTENSIONS.includes(ext);

    if (!isVideo) {
      setError("Please upload a valid video file.");
      return;
    }

    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    const url = URL.createObjectURL(selectedFile);
    sourceUrlRef.current = url;

    setFile(selectedFile);
    setSourceUrl(url);
    setDuration(0);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setOutputFormat(ext === "webm" ? "webm" : "mp4");
  };

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video?.duration || !Number.isFinite(video.duration)) return;

    const length = Number(video.duration.toFixed(3));
    setDuration(length);
    setEndTime(length);
    setStatus(`${formatTime(length, true)} video loaded. Pick a trim range.`);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime || 0);
    if (isPlayingSelection && video.currentTime >= endTime) {
      video.pause();
      video.currentTime = startTime;
      setIsPlayingSelection(false);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) loadVideoFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (selectedFile) loadVideoFile(selectedFile);
  };

  const updateStart = (value) => {
    const nextStart = clampTime(value, 0, Math.max(0, endTime - 0.1));
    setStartTime(Number(nextStart.toFixed(3)));
  };

  const updateEnd = (value) => {
    const nextEnd = clampTime(value, Math.min(duration, startTime + 0.1), duration);
    setEndTime(Number(nextEnd.toFixed(3)));
  };

  const seekVideo = (time) => {
    const video = videoRef.current;
    const next = clampTime(time, 0, duration || 0);
    if (video) video.currentTime = next;
    setCurrentTime(next);
  };

  const playSelection = async () => {
    const video = videoRef.current;
    if (!video || selectedDuration <= 0) return;

    if (isPlayingSelection) {
      video.pause();
      setIsPlayingSelection(false);
      return;
    }

    video.currentTime = startTime;
    setIsPlayingSelection(true);
    try {
      await video.play();
    } catch {
      setIsPlayingSelection(false);
    }
  };

  const ensureFfmpeg = async () => {
    if (ffmpegRef.current?.loaded) {
      setFfmpegReady(true);
      return ffmpegRef.current;
    }

    setIsLoadingFfmpeg(true);
    setError("");
    setStatus("Loading FFmpeg engine...");
    setProgress(0);

    try {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);

      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: ffmpegProgress }) => {
        if (Number.isFinite(ffmpegProgress)) {
          setProgress(Math.min(98, Math.round(ffmpegProgress * 100)));
        }
      });
      ffmpeg.on("log", ({ message }) => {
        if (message?.trim()) {
          setStatus(message.trim().slice(0, 140));
        }
      });

      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      ]);

      await ffmpeg.load({ coreURL, wasmURL });
      ffmpegRef.current = ffmpeg;
      setFfmpegReady(true);
      setStatus("FFmpeg ready. Starting trim...");
      return ffmpeg;
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setFfmpegReady(false);
      throw new Error(
        "Could not load FFmpeg engine. Check internet once and try again.",
      );
    } finally {
      setIsLoadingFfmpeg(false);
    }
  };

  const buildCommand = (inputName, outputName) => {
    const start = formatTime(startTime, true);
    const length = selectedDuration.toFixed(3);

    if (trimMode === "copy") {
      const args = [
        "-ss",
        start,
        "-t",
        length,
        "-i",
        inputName,
        "-map",
        "0",
      ];
      if (!keepAudio) args.push("-an");
      args.push("-c", "copy", "-avoid_negative_ts", "make_zero", outputName);
      return args;
    }

    const args = [
      "-ss",
      start,
      "-t",
      length,
      "-i",
      inputName,
      "-map",
      "0:v:0",
    ];

    if (keepAudio) {
      args.push("-map", "0:a?");
    } else {
      args.push("-an");
    }

    if (effectiveOutputFormat === "webm") {
      args.push(
        "-c:v",
        "libvpx-vp9",
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-crf",
        String(crf),
        "-b:v",
        "0",
      );
      if (keepAudio) args.push("-c:a", "libopus", "-b:a", "96k");
    } else {
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        String(crf),
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
      );
      if (keepAudio) args.push("-c:a", "aac", "-b:a", "128k");
    }

    args.push(outputName);
    return args;
  };

  const handleTrim = async () => {
    if (!file) {
      setError("Upload a video first.");
      return;
    }

    if (!duration || selectedDuration <= 0.09) {
      setError("Select a clip longer than 0.1 seconds.");
      return;
    }

    setIsTrimming(true);
    setProgress(0);
    setError("");
    clearResult();

    const inputName = `input.${sourceExt}`;
    const outputName = `${sanitizeFileName(file.name)}-${formatFileTime(startTime)}-to-${formatFileTime(endTime)}.${effectiveOutputFormat}`;

    try {
      const ffmpeg = await ensureFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      setStatus("Preparing source video...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus("Trimming video...");
      const args = buildCommand(inputName, outputName);
      const exitCode = await ffmpeg.exec(args);

      if (exitCode !== 0) {
        throw new Error("FFmpeg returned a non-zero exit code.");
      }

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: getMimeType(effectiveOutputFormat) });
      const url = URL.createObjectURL(blob);

      resultUrlRef.current = url;
      setResultUrl(url);
      setResultBlob(blob);
      setResultName(outputName);
      setProgress(100);
      setStatus(`Trim ready: ${formatBytes(blob.size)}.`);

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (err) {
      console.error("Video trim failed:", err);
      setError(
        err.message ||
          "Failed to trim video. Try Fast Trim, MP4 output, or a smaller file.",
      );
      setStatus("");
    } finally {
      setIsTrimming(false);
    }
  };

  const cancelTrim = () => {
    ffmpegRef.current?.terminate?.();
    ffmpegRef.current = null;
    setFfmpegReady(false);
    setIsTrimming(false);
    setIsLoadingFfmpeg(false);
    setStatus("Trim cancelled.");
    setProgress(0);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">Video Trimmer</h1>
        <p className="description mt-3">
          Cut videos directly in your browser with start/end controls, preview,
          audio options, and FFmpeg-powered export.
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
            <div
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-6 transition ${
                isDragging
                  ? "border-(--primary) bg-(--section-highlight)"
                  : "border-(--border) bg-(--background) hover:border-(--primary)"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v"
                className="hidden"
                onChange={handleInputChange}
              />

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                    {file ? (
                      <FileVideo className="h-6 w-6" />
                    ) : (
                      <UploadCloud className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-(--foreground)">
                      {file ? file.name : "Upload a video file"}
                    </h2>
                    <p className="mt-1 text-sm text-(--muted-foreground)">
                      {file
                        ? `${formatBytes(file.size)} · ${duration ? formatTime(duration, true) : "loading duration"}`
                        : "Drag and drop a video here, or browse from your device."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                        No server upload
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <Film className="h-3.5 w-3.5 text-(--primary)" />
                        MP4 · WebM · MOV
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isTrimming || isLoadingFfmpeg}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {file ? "Change Video" : "Select Video"}
                  </button>
                  {file && (
                    <button
                      type="button"
                      onClick={resetTool}
                      disabled={isTrimming}
                      className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {sourceUrl && (
              <div className="mt-5 overflow-hidden rounded-lg border border-(--border) bg-black">
                <video
                  ref={videoRef}
                  src={sourceUrl}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                  onLoadedMetadata={handleMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPause={() => setIsPlayingSelection(false)}
                />
              </div>
            )}
          </section>

          {file && (
            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Timeline
                  </h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Set the exact part of the video you want to export.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={playSelection}
                  disabled={!duration || selectedDuration <= 0}
                  className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlayingSelection ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlayingSelection ? "Pause Preview" : "Play Selection"}
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-(--background)">
                    <div
                      className="absolute top-0 h-full rounded-full bg-(--primary)"
                      style={{
                        left: `${selectionLeft}%`,
                        width: `${selectionWidth}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-red-500"
                      style={{
                        left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="tool-form-grid mt-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-(--foreground)">
                          Start
                        </span>
                        <span className="font-mono text-(--muted-foreground)">
                          {formatTime(startTime, true)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={startTime}
                        onChange={(event) => updateStart(event.target.value)}
                        className="w-full accent-green-600"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-(--foreground)">
                          End
                        </span>
                        <span className="font-mono text-(--muted-foreground)">
                          {formatTime(endTime, true)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={endTime}
                        onChange={(event) => updateEnd(event.target.value)}
                        className="w-full accent-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="tool-compact-grid">
                  <div className="rounded-lg border border-(--border) p-3">
                    <p className="text-xs text-(--muted-foreground)">Current</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-(--foreground)">
                      {formatTime(currentTime, true)}
                    </p>
                    <button
                      type="button"
                      onClick={() => seekVideo(startTime)}
                      className="mt-2 text-xs font-medium text-(--primary)"
                    >
                      Jump to start
                    </button>
                  </div>
                  <div className="rounded-lg border border-(--border) p-3">
                    <p className="text-xs text-(--muted-foreground)">Clip Length</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-(--foreground)">
                      {formatTime(selectedDuration, true)}
                    </p>
                    <p className="mt-2 text-xs text-(--muted-foreground)">
                      Est. {formatBytes(estimatedSize)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-(--border) p-3">
                    <p className="text-xs text-(--muted-foreground)">Quick Set</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateStart(currentTime)}
                        className="rounded-lg border border-(--border) px-2 py-1 text-xs font-medium hover:border-(--primary)"
                      >
                        Set Start
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEnd(currentTime)}
                        className="rounded-lg border border-(--border) px-2 py-1 text-xs font-medium hover:border-(--primary)"
                      >
                        Set End
                      </button>
                    </div>
                  </div>
                </div>

                <div className="tool-form-grid">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-(--foreground)">
                      Start seconds
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={duration}
                      step="0.01"
                      value={startTime}
                      onChange={(event) => updateStart(event.target.value)}
                      className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-(--foreground)">
                      End seconds
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={duration}
                      step="0.01"
                      value={endTime}
                      onChange={(event) => updateEnd(event.target.value)}
                      className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
                    />
                  </label>
                </div>
              </div>
            </section>
          )}

          {(error || status) && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                error
                  ? "border-red-500/40 bg-red-500/10 text-red-600"
                  : "border-green-500/40 bg-green-500/10 text-green-700"
              }`}
            >
              {error ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{error || status}</p>
            </div>
          )}

          {(isTrimming || resultUrl) && (
            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Trimmed Result
                  </h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {resultBlob
                      ? `${resultName} · ${formatBytes(resultBlob.size)}`
                      : "Your processed clip will appear here."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isTrimming && (
                    <button
                      type="button"
                      onClick={cancelTrim}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => resultBlob && downloadBlob(resultBlob, resultName)}
                    disabled={!resultBlob}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    Download Clip
                  </button>
                </div>
              </div>

              {(isTrimming || progress > 0) && (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-(--muted-foreground)">
                    <span>
                      {isLoadingFfmpeg
                        ? "Loading engine"
                        : isTrimming
                          ? "Processing"
                          : "Ready"}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                    <div
                      className="h-full rounded-full bg-(--primary) transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {resultUrl && (
                <div className="mt-6 overflow-hidden rounded-lg border border-(--border) bg-black">
                  <video
                    src={resultUrl}
                    controls
                    playsInline
                    className="aspect-video w-full bg-black"
                  />
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">
                  Export Settings
                </h2>
                <p className="text-sm text-(--muted-foreground)">
                  Choose speed, quality, and container.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Trim mode
                </label>
                <div className="space-y-2">
                  {MODE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTrimMode(option.value)}
                        className={`w-full rounded-lg border p-3 text-left transition ${
                          trimMode === option.value
                            ? "border-(--primary) bg-(--section-highlight)"
                            : "border-(--border) bg-(--background) hover:border-(--primary)"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
                          <Icon className="h-4 w-4 text-(--primary)" />
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-(--muted-foreground)">
                          {option.detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Output format
                </label>
                <div className="tool-compact-grid">
                  {OUTPUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOutputFormat(option.value)}
                      className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                        outputFormat === option.value
                          ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                          : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                  {outputFormat === "same" && trimMode === "precise"
                    ? "Precise mode exports Original as MP4 for browser playback."
                    : OUTPUT_OPTIONS.find((option) => option.value === outputFormat)
                        ?.detail}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setKeepAudio((value) => !value)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 transition ${
                    keepAudio
                      ? "border-(--primary) bg-(--section-highlight)"
                      : "border-(--border) bg-(--background)"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
                    {keepAudio ? (
                      <Volume2 className="h-4 w-4 text-(--primary)" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-600" />
                    )}
                    {keepAudio ? "Keep audio" : "Remove audio"}
                  </span>
                  <span className="text-xs text-(--muted-foreground)">
                    Toggle
                  </span>
                </button>
              </div>

              {trimMode === "precise" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-(--foreground)">
                      Re-encode quality
                    </label>
                    <span className="text-sm font-semibold text-(--foreground)">
                      CRF {crf}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="32"
                    step="1"
                    value={crf}
                    onChange={(event) => setCrf(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                  <p className="mt-2 text-xs text-(--muted-foreground)">
                    Lower CRF means higher quality and larger output.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-(--border) bg-(--background) p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-(--primary)" />
                  <span className="text-sm font-semibold text-(--foreground)">
                    Export summary
                  </span>
                </div>
                <p className="text-xs leading-5 text-(--muted-foreground)">
                  {outputSummary}
                </p>
                <p className="mt-2 text-xs text-(--muted-foreground)">
                  Engine: {ffmpegReady ? "ready" : "loads on first trim"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleTrim}
                disabled={!file || isTrimming || isLoadingFfmpeg || selectedDuration <= 0}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isTrimming || isLoadingFfmpeg ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )}
                {isLoadingFfmpeg
                  ? "Loading Engine..."
                  : isTrimming
                    ? "Trimming..."
                    : "Trim Video"}
              </button>

              {resultBlob && (
                <button
                  type="button"
                  onClick={() => {
                    clearResult();
                    setStatus("Result cleared. Ready for another trim.");
                  }}
                  className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Trim
                </button>
              )}
            </div>
          </section>

          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <AudioLines className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Clip Stats</h2>
                <p className="text-sm text-(--muted-foreground)">
                  Live range and file details.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Source</span>
                <span className="font-semibold text-(--foreground)">
                  {file ? sourceExt.toUpperCase() : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Duration</span>
                <span className="font-mono font-semibold text-(--foreground)">
                  {duration ? formatTime(duration) : "--:--:--"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Selected</span>
                <span className="font-mono font-semibold text-(--foreground)">
                  {formatTime(selectedDuration)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Output</span>
                <span className="font-semibold text-(--foreground)">
                  {effectiveOutputFormat.toUpperCase()}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
