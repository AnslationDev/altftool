"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AudioLines,
  CheckCircle,
  Clipboard,
  Download,
  FileVideo,
  Gauge,
  Loader2,
  Lock,
  MonitorDown,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;
const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];

const PRESETS = {
  high: {
    label: "High Quality",
    detail: "Best visual quality, moderate size reduction.",
    crf: 22,
    maxHeight: "1080",
    fps: "source",
    audioBitrate: "128k",
    encoderPreset: "veryfast",
  },
  balanced: {
    label: "Balanced",
    detail: "Recommended mix of clarity, speed, and file size.",
    crf: 28,
    maxHeight: "720",
    fps: "source",
    audioBitrate: "96k",
    encoderPreset: "veryfast",
  },
  small: {
    label: "Small File",
    detail: "Aggressive compression for quick uploads and sharing.",
    crf: 34,
    maxHeight: "480",
    fps: "24",
    audioBitrate: "64k",
    encoderPreset: "veryfast",
  },
  custom: {
    label: "Custom",
    detail: "Tune every compression control manually.",
  },
};

const DEFAULT_SETTINGS = {
  preset: "balanced",
  outputFormat: "mp4",
  crf: PRESETS.balanced.crf,
  maxHeight: PRESETS.balanced.maxHeight,
  fps: PRESETS.balanced.fps,
  audioBitrate: PRESETS.balanced.audioBitrate,
  encoderPreset: PRESETS.balanced.encoderPreset,
  keepAudio: true,
  stripMetadata: true,
};

const RESOLUTION_OPTIONS = [
  { value: "source", label: "Original", detail: "Keep source dimensions" },
  { value: "1080", label: "1080p", detail: "Large screens" },
  { value: "720", label: "720p", detail: "Web and social" },
  { value: "480", label: "480p", detail: "Small uploads" },
  { value: "360", label: "360p", detail: "Maximum reduction" },
];

const FPS_OPTIONS = [
  { value: "source", label: "Source FPS" },
  { value: "30", label: "30 FPS" },
  { value: "24", label: "24 FPS" },
  { value: "15", label: "15 FPS" },
];

const AUDIO_OPTIONS = [
  { value: "64k", label: "64 kbps" },
  { value: "96k", label: "96 kbps" },
  { value: "128k", label: "128 kbps" },
  { value: "160k", label: "160 kbps" },
];

const ENCODER_PRESETS = [
  { value: "ultrafast", label: "Fastest" },
  { value: "veryfast", label: "Fast" },
  { value: "medium", label: "Smaller" },
];

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

function formatTime(seconds = 0) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  return [hours, minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function formatPercent(value = 0) {
  return `${Math.max(0, Math.round(value))}%`;
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
      .slice(0, 64) || "video"
  );
}

function getMimeType(ext) {
  if (ext === "webm") return "video/webm";
  return "video/mp4";
}

function even(value) {
  return Math.max(2, Math.round(value / 2) * 2);
}

function getTargetDimensions(metadata, settings) {
  if (!metadata.width || !metadata.height || settings.maxHeight === "source") {
    return null;
  }
  const cap = Number(settings.maxHeight);
  if (!cap || metadata.height <= cap) return null;

  const ratio = cap / metadata.height;
  return {
    width: even(metadata.width * ratio),
    height: even(cap),
  };
}

function getOutputName(file, settings) {
  const label = `${settings.maxHeight === "source" ? "source" : `${settings.maxHeight}p`}-crf${settings.crf}`;
  return `${sanitizeFileName(file.name)}-compressed-${label}.${settings.outputFormat}`;
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

function buildSummary(file, metadata, settings, resultBlob) {
  const target = getTargetDimensions(metadata, settings);
  const savings = resultBlob
    ? ((file.size - resultBlob.size) / file.size) * 100
    : 0;

  return [
    "Video Compressor",
    `Source: ${file.name}`,
    `Original size: ${formatBytes(file.size)}`,
    resultBlob ? `Compressed size: ${formatBytes(resultBlob.size)}` : "Compressed size: not generated yet",
    resultBlob ? `Savings: ${formatPercent(savings)}` : "Savings: not generated yet",
    `Duration: ${formatTime(metadata.duration)}`,
    `Source dimensions: ${metadata.width} x ${metadata.height}`,
    `Output dimensions: ${target ? `${target.width} x ${target.height}` : "Source dimensions"}`,
    `Format: ${settings.outputFormat.toUpperCase()}`,
    `CRF: ${settings.crf}`,
    `FPS: ${settings.fps === "source" ? "Source" : settings.fps}`,
    `Audio: ${settings.keepAudio ? settings.audioBitrate : "Muted"}`,
    `Metadata stripped: ${settings.stripMetadata ? "Yes" : "No"}`,
  ].join("\n");
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
            {label}
          </p>
          <p className="break-words text-lg font-bold leading-tight text-(--foreground)">
            {value}
          </p>
          {detail && <p className="text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [metadata, setMetadata] = useState({ duration: 0, width: 0, height: 0 });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultName, setResultName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);
  const sourceUrlRef = useRef("");
  const resultUrlRef = useRef("");

  const targetDimensions = useMemo(
    () => getTargetDimensions(metadata, settings),
    [metadata, settings],
  );
  const outputDimensions = targetDimensions || {
    width: metadata.width,
    height: metadata.height,
  };
  const resultSavings = resultBlob && file
    ? ((file.size - resultBlob.size) / file.size) * 100
    : 0;
  const roughSizeFactor = useMemo(() => {
    const qualityFactor = Math.max(0.18, Math.min(0.95, (40 - settings.crf) / 24));
    const resolutionFactor = targetDimensions
      ? (targetDimensions.width * targetDimensions.height) /
        Math.max(1, metadata.width * metadata.height)
      : 1;
    const fpsFactor = settings.fps === "source" ? 1 : Math.min(1, Number(settings.fps) / 30);
    const audioFactor = settings.keepAudio ? 1 : 0.9;
    return Math.max(0.08, Math.min(0.98, qualityFactor * resolutionFactor * fpsFactor * audioFactor));
  }, [metadata, settings, targetDimensions]);
  const estimatedSize = file ? Math.round(file.size * roughSizeFactor) : 0;

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

  const updateSettings = (patch, markCustom = true) => {
    setSettings((current) => ({
      ...current,
      ...patch,
      preset: markCustom ? "custom" : patch.preset || current.preset,
    }));
    clearResult();
    setStatus("");
    setError("");
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset || presetKey === "custom") {
      updateSettings({ preset: "custom" }, false);
      return;
    }
    updateSettings(
      {
        preset: presetKey,
        crf: preset.crf,
        maxHeight: preset.maxHeight,
        fps: preset.fps,
        audioBitrate: preset.audioBitrate,
        encoderPreset: preset.encoderPreset,
      },
      false,
    );
  };

  const resetTool = () => {
    clearResult();
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    setSourceUrl("");
    setFile(null);
    setMetadata({ duration: 0, width: 0, height: 0 });
    setSettings(DEFAULT_SETTINGS);
    setStatus("");
    setError("");
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
    setMetadata({ duration: 0, width: 0, height: 0 });
    setSettings((current) => ({
      ...current,
      outputFormat: ext === "webm" ? "webm" : "mp4",
    }));
  };

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video?.duration || !Number.isFinite(video.duration)) return;
    const nextMetadata = {
      duration: Number(video.duration.toFixed(3)),
      width: video.videoWidth || 0,
      height: video.videoHeight || 0,
    };
    setMetadata(nextMetadata);
    setStatus(
      `${formatTime(nextMetadata.duration)} video loaded at ${nextMetadata.width} x ${nextMetadata.height}.`,
    );
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
        if (message?.trim()) setStatus(message.trim().slice(0, 140));
      });

      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      ]);

      await ffmpeg.load({ coreURL, wasmURL });
      ffmpegRef.current = ffmpeg;
      setFfmpegReady(true);
      setStatus("FFmpeg ready. Starting compression...");
      return ffmpeg;
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setFfmpegReady(false);
      throw new Error("Could not load FFmpeg engine. Check internet once and try again.");
    } finally {
      setIsLoadingFfmpeg(false);
    }
  };

  const buildCommand = (inputName, outputName) => {
    const args = ["-i", inputName, "-map", "0:v:0"];
    if (settings.keepAudio) args.push("-map", "0:a?");
    else args.push("-an");

    const filters = [];
    if (targetDimensions) {
      filters.push(`scale=${targetDimensions.width}:${targetDimensions.height}:flags=lanczos`);
    }
    if (settings.fps !== "source") filters.push(`fps=${settings.fps}`);
    if (filters.length) args.push("-vf", filters.join(","));

    args.push("-sn");
    if (settings.stripMetadata) args.push("-map_metadata", "-1");

    if (settings.outputFormat === "webm") {
      args.push(
        "-c:v",
        "libvpx-vp9",
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-row-mt",
        "1",
        "-crf",
        String(settings.crf),
        "-b:v",
        "0",
      );
      if (settings.keepAudio) args.push("-c:a", "libopus", "-b:a", settings.audioBitrate);
    } else {
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        settings.encoderPreset,
        "-crf",
        String(settings.crf),
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
      );
      if (settings.keepAudio) args.push("-c:a", "aac", "-b:a", settings.audioBitrate);
    }

    args.push("-y", outputName);
    return args;
  };

  const compressVideo = async () => {
    if (!file) {
      setError("Upload a video first.");
      return;
    }

    setIsCompressing(true);
    setProgress(0);
    setError("");
    clearResult();

    const sourceExt = getExtension(file.name);
    const inputName = `input.${sourceExt}`;
    const outputName = getOutputName(file, settings);

    try {
      const ffmpeg = await ensureFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      setStatus("Preparing source video...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus("Compressing video...");
      const exitCode = await ffmpeg.exec(buildCommand(inputName, outputName));
      if (exitCode !== 0) throw new Error("FFmpeg returned a non-zero exit code.");

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: getMimeType(settings.outputFormat) });
      const url = URL.createObjectURL(blob);

      resultUrlRef.current = url;
      setResultUrl(url);
      setResultBlob(blob);
      setResultName(outputName);
      setProgress(100);
      setStatus(`Compression ready: ${formatBytes(blob.size)}.`);

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (err) {
      console.error("Video compression failed:", err);
      setError(
        err.message ||
          "Failed to compress video. Try MP4 output, a smaller resolution, or a shorter file.",
      );
      setStatus("");
    } finally {
      setIsCompressing(false);
    }
  };

  const cancelCompression = () => {
    ffmpegRef.current?.terminate?.();
    ffmpegRef.current = null;
    setFfmpegReady(false);
    setIsCompressing(false);
    setIsLoadingFfmpeg(false);
    setStatus("Compression cancelled.");
    setProgress(0);
  };

  const copySummary = async () => {
    if (!file) return;
    await navigator.clipboard?.writeText(buildSummary(file, metadata, settings, resultBlob));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 text-(--foreground)">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="heading">Video Compressor</h1>
        <p className="description mt-3 text-balance">
          Compress videos locally with quality presets, resolution caps, audio
          controls, metadata stripping, preview playback, and direct downloads.
        </p>
      </div>

      <section className="mt-7 rounded-lg border border-(--border) bg-(--section-highlight) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_330px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">
                Browser-Side Video Compression
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Downscale large clips, reduce bitrate through CRF, tune audio,
                and export MP4 or WebM without uploading the source file.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Estimated output
            </p>
            <p className="mt-2 text-2xl font-bold text-(--primary)">
              {file ? formatBytes(estimatedSize) : "Upload video"}
            </p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {file
                ? `${outputDimensions.width || "-"} x ${outputDimensions.height || "-"} · CRF ${settings.crf}`
                : "Choose a video to calculate settings."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
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
                        ? `${formatBytes(file.size)} · ${metadata.duration ? formatTime(metadata.duration) : "loading metadata"}`
                        : "Drag and drop a video here, or browse from your device."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                        No server upload
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <Video className="h-3.5 w-3.5 text-(--primary)" />
                        MP4 · WebM · MOV
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isCompressing || isLoadingFfmpeg}
                    className="btn-primary"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {file ? "Change Video" : "Select Video"}
                  </button>
                  {file && (
                    <button
                      type="button"
                      onClick={resetTool}
                      disabled={isCompressing}
                      className="btn-secondary"
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
                />
              </div>
            )}
          </section>

          <section className="rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Compression Settings</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Start with a preset, then tune output size and quality.
                </p>
              </div>
            </div>

            <div className="tool-compact-grid">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`rounded-lg border p-4 text-left transition ${
                    settings.preset === key
                      ? "border-(--primary) bg-(--section-highlight)"
                      : "border-(--border) bg-(--background) hover:border-(--primary)"
                  }`}
                >
                  <span className="block font-semibold text-(--foreground)">
                    {preset.label}
                  </span>
                  <span className="mt-1 block text-sm text-(--muted-foreground)">
                    {preset.detail}
                  </span>
                </button>
              ))}
            </div>

            <div className="tool-form-grid mt-5">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Output Format
                </span>
                <select
                  value={settings.outputFormat}
                  onChange={(event) => updateSettings({ outputFormat: event.target.value })}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WebM (VP9)</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Resolution Cap
                </span>
                <select
                  value={settings.maxHeight}
                  onChange={(event) => updateSettings({ maxHeight: event.target.value })}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {RESOLUTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.detail}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Frame Rate
                </span>
                <select
                  value={settings.fps}
                  onChange={(event) => updateSettings({ fps: event.target.value })}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {FPS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Encoder Speed
                </span>
                <select
                  value={settings.encoderPreset}
                  onChange={(event) => updateSettings({ encoderPreset: event.target.value })}
                  disabled={settings.outputFormat === "webm"}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary) disabled:opacity-50"
                >
                  {ENCODER_PRESETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-(--foreground)">
                CRF Quality
                <span className="rounded-md bg-(--section-highlight) px-2 py-1 text-(--primary)">
                  {settings.crf}
                </span>
              </span>
              <input
                type="range"
                min="18"
                max="40"
                value={settings.crf}
                onChange={(event) => updateSettings({ crf: Number(event.target.value) })}
                className="w-full accent-[var(--primary)]"
              />
              <p className="mt-2 text-xs text-(--muted-foreground)">
                Lower CRF means better quality and larger file. Higher CRF means smaller file.
              </p>
            </label>

            <div className="mt-5 grid gap-3">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3">
                <span className="text-sm font-medium text-(--foreground)">Keep audio track</span>
                <input
                  type="checkbox"
                  checked={settings.keepAudio}
                  onChange={(event) => updateSettings({ keepAudio: event.target.checked })}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>

              {settings.keepAudio && (
                <label>
                  <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                    Audio Bitrate
                  </span>
                  <select
                    value={settings.audioBitrate}
                    onChange={(event) => updateSettings({ audioBitrate: event.target.value })}
                    className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                  >
                    {AUDIO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3">
                <span className="text-sm font-medium text-(--foreground)">Strip metadata</span>
                <input
                  type="checkbox"
                  checked={settings.stripMetadata}
                  onChange={(event) => updateSettings({ stripMetadata: event.target.checked })}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={compressVideo}
                disabled={!file || isCompressing || isLoadingFfmpeg}
              >
                {isCompressing || isLoadingFfmpeg ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isCompressing || isLoadingFfmpeg ? "Compressing..." : "Compress Video"}
              </button>
              {(isCompressing || isLoadingFfmpeg) && (
                <button type="button" className="btn-secondary" onClick={cancelCompression}>
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={copySummary}
                disabled={!file}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy Summary"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {status && (
            <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              {isCompressing || isLoadingFfmpeg ? (
                <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{status}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="tool-card-grid">
            <StatCard icon={FileVideo} label="Source" value={file ? formatBytes(file.size) : "0 B"} detail={metadata.duration ? formatTime(metadata.duration) : "No video"} />
            <StatCard icon={MonitorDown} label="Output" value={`${outputDimensions.width || "-"}x${outputDimensions.height || "-"}`} detail={settings.maxHeight === "source" ? "Original size" : `${settings.maxHeight}p cap`} />
            <StatCard icon={Gauge} label="CRF" value={settings.crf} detail={PRESETS[settings.preset]?.label || "Custom"} />
            <StatCard icon={AudioLines} label="Audio" value={settings.keepAudio ? settings.audioBitrate : "Muted"} detail={settings.outputFormat.toUpperCase()} />
          </div>

          {(isCompressing || isLoadingFfmpeg || progress > 0) && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-4">
              <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
                <span>{ffmpegReady ? "Compression progress" : "Engine loading"}</span>
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

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Size Analysis</h2>
                <p className="text-sm text-(--muted-foreground)">
                  Compare the estimated or final compressed output.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Original</span>
                <span className="font-semibold text-(--foreground)">
                  {file ? formatBytes(file.size) : "0 B"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">
                  {resultBlob ? "Compressed" : "Estimated"}
                </span>
                <span className="font-semibold text-(--foreground)">
                  {resultBlob ? formatBytes(resultBlob.size) : formatBytes(estimatedSize)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2">
                <span className="text-(--muted-foreground)">Savings</span>
                <span className="font-semibold text-(--foreground)">
                  {resultBlob ? formatPercent(resultSavings) : "Estimated after run"}
                </span>
              </div>
            </div>
          </section>

          {resultUrl && (
            <section className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="mb-4">
                <h2 className="font-semibold text-(--foreground)">Compressed Result</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Preview before saving the final file.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-(--border) bg-black">
                <video
                  src={resultUrl}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              </div>
              <button
                type="button"
                onClick={() => downloadBlob(resultBlob, resultName)}
                className="btn-primary mt-4 w-full"
              >
                <Download className="h-4 w-4" />
                Download {resultName}
              </button>
            </section>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
            <Lock className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Processing happens in this browser with FFmpeg. Large 4K or long
              files can take time and memory depending on your device.
            </p>
          </div>

          {!settings.keepAudio && (
            <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--card) p-4 text-(--muted-foreground)">
              <VolumeX className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)" />
              <p className="text-sm">Audio will be removed from the compressed output.</p>
            </div>
          )}

          {settings.keepAudio && (
            <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--card) p-4 text-(--muted-foreground)">
              <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)" />
              <p className="text-sm">Audio will be re-encoded at {settings.audioBitrate}.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
