"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  FastForward,
  FileAudio,
  Gauge,
  Loader2,
  Music,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Volume2,
  Waves,
  XCircle,
} from "lucide-react";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "aac", "ogg", "flac"];

const OUTPUT_OPTIONS = [
  { value: "mp3", label: "MP3", detail: "Best for ringtones and sharing" },
  { value: "wav", label: "WAV", detail: "Lossless editing handoff" },
  { value: "m4a", label: "M4A", detail: "Small files with AAC audio" },
  { value: "ogg", label: "OGG", detail: "Open web audio format" },
  { value: "same", label: "Original", detail: "Keep the source container" },
];

const MODE_OPTIONS = [
  {
    value: "copy",
    label: "Fast Cut",
    detail: "No re-encode when keeping original format.",
    icon: FastForward,
  },
  {
    value: "processed",
    label: "Processed Cut",
    detail: "Use this for MP3 export, fades, volume, or normalization.",
    icon: Gauge,
  },
];

const BITRATE_OPTIONS = [96, 128, 192, 256, 320];

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
  return formatTime(seconds).replaceAll(":", "-");
}

function getExtension(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() || "mp3";
  return AUDIO_EXTENSIONS.includes(ext) ? ext : "mp3";
}

function sanitizeFileName(name = "audio") {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "audio"
  );
}

function getMimeType(ext) {
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "flac") return "audio/flac";
  return "audio/mpeg";
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

function getCodecArgs(ext, bitrate) {
  if (ext === "wav") return ["-c:a", "pcm_s16le"];
  if (ext === "m4a" || ext === "aac") {
    return ["-c:a", "aac", "-b:a", `${bitrate}k`];
  }
  if (ext === "ogg") return ["-c:a", "libvorbis", "-q:a", "5"];
  if (ext === "flac") return ["-c:a", "flac"];
  return ["-c:a", "libmp3lame", "-b:a", `${bitrate}k`];
}

export default function MainComponent() {
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [peaks, setPeaks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trimMode, setTrimMode] = useState("processed");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [volumeGain, setVolumeGain] = useState(0);
  const [normalize, setNormalize] = useState(false);
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
  const audioRef = useRef(null);
  const ffmpegRef = useRef(null);
  const sourceUrlRef = useRef("");
  const resultUrlRef = useRef("");

  const selectedDuration = Math.max(0, endTime - startTime);
  const sourceExt = file ? getExtension(file.name) : "mp3";
  const effectiveOutputFormat =
    outputFormat === "same" ? sourceExt : outputFormat;
  const hasAudioFilters =
    fadeIn > 0 || fadeOut > 0 || volumeGain !== 0 || normalize;
  const needsEncoding =
    trimMode === "processed" || outputFormat !== "same" || hasAudioFilters;
  const estimatedSize =
    file && duration ? Math.round(file.size * (selectedDuration / duration)) : 0;
  const selectionLeft = duration ? (startTime / duration) * 100 : 0;
  const selectionWidth = duration
    ? ((endTime - startTime) / duration) * 100
    : 0;

  const outputSummary = useMemo(() => {
    if (!file) return "Upload an audio file to configure the cut.";
    if (selectedDuration <= 0) return "Select a valid audio range.";
    return `${formatTime(selectedDuration, true)} clip · ${effectiveOutputFormat.toUpperCase()} · ${needsEncoding ? `${bitrate} kbps` : "stream copy"}`;
  }, [bitrate, effectiveOutputFormat, file, needsEncoding, selectedDuration]);

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
    setPeaks([]);
    setStatus("");
    setError("");
    setIsPlayingSelection(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const buildWaveform = async (selectedFile) => {
    setIsAnalyzing(true);
    setPeaks([]);

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext unsupported");

      const audioContext = new AudioContextClass();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const sampleCount = 160;
      const blockSize = Math.max(1, Math.floor(audioBuffer.length / sampleCount));
      const channels = Array.from(
        { length: audioBuffer.numberOfChannels },
        (_, channel) => audioBuffer.getChannelData(channel),
      );

      const nextPeaks = Array.from({ length: sampleCount }, (_, index) => {
        const start = index * blockSize;
        const end = Math.min(start + blockSize, audioBuffer.length);
        const stride = Math.max(1, Math.floor((end - start) / 80));
        let peak = 0;

        for (let position = start; position < end; position += stride) {
          channels.forEach((channelData) => {
            peak = Math.max(peak, Math.abs(channelData[position] || 0));
          });
        }

        return Number(Math.min(1, peak).toFixed(3));
      });

      setPeaks(nextPeaks);
      if (audioBuffer.duration && !duration) {
        const length = Number(audioBuffer.duration.toFixed(3));
        setDuration(length);
        setEndTime(length);
      }
      await audioContext.close();
    } catch (err) {
      console.warn("Waveform generation failed:", err);
      setPeaks([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadAudioFile = (selectedFile) => {
    setError("");
    setStatus("");
    clearResult();

    const ext = getExtension(selectedFile?.name);
    const isAudio =
      selectedFile?.type?.startsWith("audio/") ||
      AUDIO_EXTENSIONS.includes(ext);

    if (!isAudio) {
      setError("Please upload a valid audio file.");
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
    setOutputFormat(ext === "wav" ? "wav" : "mp3");
    buildWaveform(selectedFile);
  };

  const handleMetadata = () => {
    const audio = audioRef.current;
    if (!audio?.duration || !Number.isFinite(audio.duration)) return;

    const length = Number(audio.duration.toFixed(3));
    setDuration(length);
    setEndTime(length);
    setStatus(`${formatTime(length, true)} audio loaded. Pick a cut range.`);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime || 0);
    if (isPlayingSelection && audio.currentTime >= endTime) {
      audio.pause();
      audio.currentTime = startTime;
      setIsPlayingSelection(false);
    }
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) loadAudioFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const selectedFile = event.dataTransfer.files?.[0];
    if (selectedFile) loadAudioFile(selectedFile);
  };

  const updateStart = (value) => {
    const nextStart = clampTime(value, 0, Math.max(0, endTime - 0.05));
    setStartTime(Number(nextStart.toFixed(3)));
  };

  const updateEnd = (value) => {
    const nextEnd = clampTime(value, Math.min(duration, startTime + 0.05), duration);
    setEndTime(Number(nextEnd.toFixed(3)));
  };

  const seekAudio = (time) => {
    const audio = audioRef.current;
    const next = clampTime(time, 0, duration || 0);
    if (audio) audio.currentTime = next;
    setCurrentTime(next);
  };

  const playSelection = async () => {
    const audio = audioRef.current;
    if (!audio || selectedDuration <= 0) return;

    if (isPlayingSelection) {
      audio.pause();
      setIsPlayingSelection(false);
      return;
    }

    audio.currentTime = startTime;
    setIsPlayingSelection(true);
    try {
      await audio.play();
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
      setStatus("FFmpeg ready. Starting audio cut...");
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

  const buildAudioFilters = () => {
    const filters = [];

    if (fadeIn > 0) {
      filters.push(`afade=t=in:st=0:d=${Math.min(fadeIn, selectedDuration).toFixed(2)}`);
    }

    if (fadeOut > 0) {
      const outDuration = Math.min(fadeOut, selectedDuration);
      const outStart = Math.max(0, selectedDuration - outDuration);
      filters.push(`afade=t=out:st=${outStart.toFixed(2)}:d=${outDuration.toFixed(2)}`);
    }

    if (volumeGain !== 0) {
      filters.push(`volume=${volumeGain.toFixed(1)}dB`);
    }

    if (normalize) {
      filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
    }

    return filters;
  };

  const buildCommand = (inputName, outputName) => {
    const start = formatTime(startTime, true);
    const length = selectedDuration.toFixed(3);
    const filters = buildAudioFilters();

    if (!needsEncoding && filters.length === 0) {
      return [
        "-ss",
        start,
        "-t",
        length,
        "-i",
        inputName,
        "-vn",
        "-c",
        "copy",
        outputName,
      ];
    }

    const args = ["-ss", start, "-t", length, "-i", inputName, "-vn"];
    if (filters.length) {
      args.push("-af", filters.join(","));
    }
    args.push(...getCodecArgs(effectiveOutputFormat, bitrate), outputName);
    return args;
  };

  const handleTrim = async () => {
    if (!file) {
      setError("Upload an audio file first.");
      return;
    }

    if (!duration || selectedDuration <= 0.05) {
      setError("Select an audio clip longer than 0.05 seconds.");
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

      setStatus("Preparing source audio...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus("Cutting audio...");
      const exitCode = await ffmpeg.exec(buildCommand(inputName, outputName));

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
      setStatus(`Audio clip ready: ${formatBytes(blob.size)}.`);

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (err) {
      console.error("Audio cut failed:", err);
      setError(
        err.message ||
          "Failed to cut audio. Try MP3 output, shorter range, or Fast Cut.",
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
    setStatus("Audio cut cancelled.");
    setProgress(0);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">MP3 Cutter / Audio Trimmer</h1>
        <p className="description mt-3">
          Cut songs, podcasts, voice notes, and ringtone clips with waveform
          preview, fade controls, and browser-side FFmpeg export.
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
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                className="hidden"
                onChange={handleInputChange}
              />

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                    {file ? (
                      <FileAudio className="h-6 w-6" />
                    ) : (
                      <UploadCloud className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-(--foreground)">
                      {file ? file.name : "Upload an audio file"}
                    </h2>
                    <p className="mt-1 text-sm text-(--muted-foreground)">
                      {file
                        ? `${formatBytes(file.size)} · ${duration ? formatTime(duration, true) : "loading duration"}`
                        : "Drag and drop MP3, WAV, M4A, OGG, or FLAC audio here."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                        Browser processing
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1">
                        <Music className="h-3.5 w-3.5 text-(--primary)" />
                        MP3 · WAV · M4A · OGG
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
                    {file ? "Change Audio" : "Select Audio"}
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
              <div className="mt-5 rounded-lg border border-(--border) bg-(--background) p-4">
                <audio
                  ref={audioRef}
                  src={sourceUrl}
                  controls
                  className="w-full"
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
                    Audio Timeline
                  </h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Use waveform, sliders, or exact seconds to select your clip.
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
                  {isPlayingSelection ? "Pause Selection" : "Play Selection"}
                </button>
              </div>

              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-lg border border-(--border) bg-(--background) p-3">
                  <div className="flex h-28 items-center gap-0.5">
                    {isAnalyzing ? (
                      <div className="flex w-full items-center justify-center text-(--muted-foreground)">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Building waveform...
                      </div>
                    ) : peaks.length ? (
                      peaks.map((peak, index) => {
                        const percent =
                          peaks.length > 1 ? (index / (peaks.length - 1)) * 100 : 0;
                        const inSelection =
                          percent >= selectionLeft &&
                          percent <= selectionLeft + selectionWidth;
                        return (
                          <div
                            key={`${peak}-${index}`}
                            className={`flex-1 rounded-full transition ${
                              inSelection ? "bg-(--primary)" : "bg-(--border)"
                            }`}
                            style={{
                              height: `${Math.max(8, peak * 100)}%`,
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="flex w-full flex-col items-center justify-center text-center text-(--muted-foreground)">
                        <Waves className="mb-2 h-6 w-6" />
                        <span className="text-sm">
                          Waveform unavailable for this file, trimming still works.
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute bottom-0 top-0 w-0.5 bg-green-500"
                    style={{ left: `${selectionLeft}%` }}
                  />
                  <div
                    className="absolute bottom-0 top-0 w-0.5 bg-red-500"
                    style={{ left: `${selectionLeft + selectionWidth}%` }}
                  />
                  <div
                    className="absolute bottom-0 top-0 w-0.5 bg-yellow-500"
                    style={{
                      left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="tool-form-grid">
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
                      <span className="font-medium text-(--foreground)">End</span>
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

                <div className="tool-compact-grid">
                  <div className="rounded-lg border border-(--border) p-3">
                    <p className="text-xs text-(--muted-foreground)">Current</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-(--foreground)">
                      {formatTime(currentTime, true)}
                    </p>
                    <button
                      type="button"
                      onClick={() => seekAudio(startTime)}
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
                    Trimmed Audio
                  </h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {resultBlob
                      ? `${resultName} · ${formatBytes(resultBlob.size)}`
                      : "Your processed audio clip will appear here."}
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
                    Download Audio
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
                <div className="mt-6 rounded-lg border border-(--border) bg-(--background) p-4">
                  <audio src={resultUrl} controls className="w-full" />
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
                  Choose cut mode, format, and sound treatment.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-(--foreground)">
                  Cut mode
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
                  {OUTPUT_OPTIONS.find((option) => option.value === outputFormat)
                    ?.detail}
                </p>
              </div>

              {needsEncoding && effectiveOutputFormat !== "wav" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--foreground)">
                    Bitrate
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {BITRATE_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBitrate(value)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                          bitrate === value
                            ? "border-(--primary) bg-(--section-highlight)"
                            : "border-(--border) bg-(--background) hover:border-(--primary)"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-(--foreground)">
                      Fade in
                    </label>
                    <span className="text-sm font-semibold text-(--foreground)">
                      {fadeIn.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={fadeIn}
                    onChange={(event) => setFadeIn(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-(--foreground)">
                      Fade out
                    </label>
                    <span className="text-sm font-semibold text-(--foreground)">
                      {fadeOut.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={fadeOut}
                    onChange={(event) => setFadeOut(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-(--foreground)">
                      Volume gain
                    </label>
                    <span className="text-sm font-semibold text-(--foreground)">
                      {volumeGain > 0 ? "+" : ""}
                      {volumeGain.toFixed(1)} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={volumeGain}
                    onChange={(event) => setVolumeGain(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNormalize((value) => !value)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 transition ${
                  normalize
                    ? "border-(--primary) bg-(--section-highlight)"
                    : "border-(--border) bg-(--background)"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
                  <Volume2 className="h-4 w-4 text-(--primary)" />
                  Loudness normalize
                </span>
                <span className="text-xs text-(--muted-foreground)">
                  {normalize ? "On" : "Off"}
                </span>
              </button>

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
                  Engine: {ffmpegReady ? "ready" : "loads on first cut"}
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
                    ? "Cutting..."
                    : "Cut Audio"}
              </button>

              {resultBlob && (
                <button
                  type="button"
                  onClick={() => {
                    clearResult();
                    setStatus("Result cleared. Ready for another cut.");
                  }}
                  className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Cut
                </button>
              )}
            </div>
          </section>

          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Clip Stats</h2>
                <p className="text-sm text-(--muted-foreground)">
                  Live source and selected audio details.
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
