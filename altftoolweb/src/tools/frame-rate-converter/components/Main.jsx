"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Film,
  Upload,
  Download,
  Check,
  X,
  Loader2,
  RotateCcw,
  AlertCircle,
  Video,
  Clock,
  Monitor,
  Zap,
} from "lucide-react";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const TARGET_FPS = [
  23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120,
];

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function detectFpsFromVideo(videoEl) {
  return new Promise((resolve) => {
    if (!videoEl.requestVideoFrameCallback) {
      videoEl.play();
      const start = performance.now();
      let count = 0;
      const onTimeUpdate = () => {
        count++;
        if (count >= 10) {
          videoEl.pause();
          videoEl.removeEventListener("timeupdate", onTimeUpdate);
          const elapsed = (performance.now() - start) / 1000;
          const fps = count / elapsed;
          resolve(Math.round(fps * 1000) / 1000);
        }
      };
      videoEl.addEventListener("timeupdate", onTimeUpdate);
      return;
    }
    videoEl.play();
    const timestamps = [];
    const collect = (now) => {
      timestamps.push(now);
      if (timestamps.length >= 10) {
        videoEl.pause();
        const diffs = [];
        for (let i = 1; i < timestamps.length; i++) {
          diffs.push(timestamps[i] - timestamps[i - 1]);
        }
        const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const fps = 1000 / avg;
        resolve(Math.round(fps * 1000) / 1000);
        return;
      }
      videoEl.requestVideoFrameCallback(collect);
    };
    videoEl.requestVideoFrameCallback(collect);
  });
}

export default function MainComponent() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);
  const [detectingFps, setDetectingFps] = useState(false);
  const [targetFps, setTargetFps] = useState(30);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputBlob, setOutputBlob] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);
  const ffmpegRef = useRef(null);
  const sourceUrlRef = useRef(null);
  const resultUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      ffmpegRef.current?.terminate?.();
    };
  }, []);

  const ensureFfmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) {
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
      const ff = new FFmpeg();
      ff.on("progress", ({ progress: p }) => {
        if (Number.isFinite(p)) setProgress(Math.min(98, Math.round(p * 100)));
      });
      ff.on("log", ({ message }) => {
        if (message?.trim()) setStatus(message.trim().slice(0, 140));
      });
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      ]);
      await ff.load({ coreURL, wasmURL });
      ffmpegRef.current = ff;
      setStatus("FFmpeg ready. Starting conversion...");
      return ff;
    } catch (err) {
      console.error("FFmpeg load error:", err);
      setError("Failed to load FFmpeg engine: " + (err?.message || "Unknown error. Check internet and try again."));
      throw err;
    } finally {
      setIsLoadingFfmpeg(false);
    }
  }, []);

  const cancelConversion = useCallback(() => {
    ffmpegRef.current?.terminate?.();
    ffmpegRef.current = null;
    setConverting(false);
    setIsLoadingFfmpeg(false);
    setStatus("Cancelled.");
    setProgress(0);
  }, []);

  const handleFile = useCallback(async (file) => {
    setError("");
    setOutputBlob(null);
    setOutputUrl(null);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setVideoMeta(null);

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file.");
      return;
    }

    const url = URL.createObjectURL(file);
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = url;
    setVideoFile(file);
    setVideoUrl(url);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error("Failed to load video metadata"));
      setTimeout(() => reject(new Error("Video load timeout")), 15000);
    });

    const info = {
      name: file.name,
      size: file.size,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      fps: 30,
    };
    setVideoMeta(info);

    setDetectingFps(true);
    try {
      info.fps = await detectFpsFromVideo(video);
      setVideoMeta({ ...info });
    } catch {}
    setDetectingFps(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  const convert = useCallback(async () => {
    if (!videoFile || !videoMeta) return;
    setConverting(true);
    setProgress(0);
    setError("");
    setOutputBlob(null);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setOutputUrl(null);

    try {
      const ffmpeg = await ensureFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      const ext = videoFile.name.match(/\.[^.]*$/)?.[0] || ".mp4";
      const inputName = `input${ext}`;
      const outputName = `output_${targetFps}fps.mp4`;

      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      await ffmpeg.exec([
        "-i", inputName,
        "-vf", `fps=${targetFps}`,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-y", outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setOutputBlob(blob);
      setOutputUrl(url);
      setProgress(100);
      setStatus("Conversion complete.");

      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (e) {
      if (!error) setError("Conversion failed: " + (e.message || "Unknown error"));
    }
    setConverting(false);
  }, [videoFile, videoMeta, targetFps, ensureFfmpeg, error]);

  const handleClear = useCallback(() => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = null;
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setOutputBlob(null);
    setOutputUrl(null);
    setError("");
    setProgress(0);
    setStatus("");
  }, []);

  return (
    <div className="space-y-6 p-7">
      <Header />

      <div className="rounded-xl bg-(--card) border border-(--border) p-5">
        <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
          <Video className="h-5 w-5 text-(--primary)" />
          Upload Video
        </h2>
        <p className="text-sm text-(--muted-foreground) mt-1">
          Drop a video to detect its frame rate and convert it to any target FPS
        </p>

        {!videoUrl ? (
          <div
            className="mt-4 border-2 border-dashed border-(--border) hover:border-(--primary) rounded-lg p-8 text-center cursor-pointer transition"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("video-upload").click()}
          >
            <Upload className="mx-auto h-12 w-12 text-(--muted-foreground)" />
            <p className="mt-4 font-medium text-(--foreground)">Drag & drop a video here</p>
            <p className="text-sm text-(--muted-foreground)">or click to browse</p>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-md bg-(--primary) text-(--primary-foreground) cursor-pointer"
            >
              Select Video
            </button>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="mt-4">
            <video
              src={videoUrl}
              className="w-full max-h-64 rounded-lg border border-(--border) bg-black"
              controls
            />
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded bg-red-500/10 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {videoMeta && (
        <div className="rounded-xl bg-(--card) border border-(--border) p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
              <Monitor className="h-5 w-5 text-(--primary)" />
              Video Info
            </h2>
            <button
              onClick={handleClear}
              className="text-sm px-3 py-1.5 rounded-md border border-(--border) text-(--foreground) cursor-pointer"
            >
              <RotateCcw className="inline h-3.5 w-3.5 mr-1" />
              Clear
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={Film}
              label="Frame Rate"
              value={detectingFps ? "Detecting..." : `${videoMeta.fps} fps`}
            />
            <InfoCard icon={Clock} label="Duration" value={formatDuration(videoMeta.duration)} />
            <InfoCard icon={Monitor} label="Resolution" value={`${videoMeta.width} × ${videoMeta.height}`} />
            <InfoCard icon={Download} label="Size" value={formatBytes(videoMeta.size)} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Target Frame Rate
              </label>
              <select
                value={targetFps}
                onChange={(e) => setTargetFps(parseFloat(e.target.value))}
                className="w-full bg-(--background) border border-(--border) text-(--foreground) rounded-lg p-2.5 outline-none focus:border-(--primary)"
              >
                {TARGET_FPS.map((fps) => (
                  <option key={fps} value={fps}>
                    {fps} fps{fps === videoMeta.fps ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              {converting ? (
                <button
                  onClick={cancelConversion}
                  className="flex-1 px-5 py-2.5 rounded-md border border-red-500 text-red-500 font-medium cursor-pointer"
                >
                  <X className="inline h-4 w-4 mr-2" />Cancel
                </button>
              ) : (
                <button
                  onClick={convert}
                  disabled={isLoadingFfmpeg}
                  className="flex-1 px-5 py-2.5 rounded-md bg-(--primary) text-(--primary-foreground) font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingFfmpeg ? (
                    <><Loader2 className="inline h-4 w-4 mr-2 animate-spin" />Loading FFmpeg...</>
                  ) : (
                    <><Zap className="inline h-4 w-4 mr-2" />Convert to {targetFps} fps</>
                  )}
                </button>
              )}
            </div>
          </div>

          {(converting || isLoadingFfmpeg) && (
            <div className="mt-4 space-y-1">
              <div className="w-full h-2 bg-(--muted) rounded-full overflow-hidden">
                <div
                  className="h-2 bg-(--primary) rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-(--muted-foreground) text-right">{status || `${progress}%`}</p>
            </div>
          )}

          {outputUrl && (
            <div className="mt-4 rounded-lg border border-(--border) bg-(--background) p-4">
              <p className="text-sm font-medium text-(--foreground) mb-2 flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" /> Conversion complete
              </p>
              <video
                src={outputUrl}
                className="w-full max-h-48 rounded-lg border border-(--border) bg-black mb-3"
                controls
              />
              <a
                href={outputUrl}
                download={`converted_${targetFps}fps.mp4`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-(--primary) text-(--primary-foreground) text-sm font-medium cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download ({formatBytes(outputBlob?.size)})
              </a>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-(--card) border border-(--border) p-6">
        <h2 className="text-xl font-bold text-center sm:text-left">Features</h2>
        <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureItem
            icon={Zap}
            title="Browser-Based"
            desc="All processing runs locally via FFmpeg.wasm. Your video never leaves your device."
          />
          <FeatureItem
            icon={Film}
            title="Auto Detect FPS"
            desc="Upload any video and the tool detects its native frame rate automatically."
          />
          <FeatureItem
            icon={Download}
            title="High Quality"
            desc="Uses libx264 with CRF 18 for excellent quality at the target frame rate."
          />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="container mx-auto px-4 py-2">
      <header className="text-center mb-8">
        <h1 className="heading">Frame Rate Converter</h1>
        <p className="text-center description">
          Upload a video, detect its frame rate, and convert it to any target FPS — all in your browser.
        </p>
      </header>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-3">
      <div className="flex items-center gap-2 text-xs text-(--muted-foreground) mb-0.5">
        <Icon className="h-3.5 w-3.5 text-(--primary)" />
        {label}
      </div>
      <p className="text-base font-semibold text-(--foreground)">{value}</p>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-(--primary)/10">
        <Icon className="h-5 w-5 text-(--primary)" />
      </div>
      <div>
        <h3 className="font-semibold text-(--foreground)">{title}</h3>
        <p className="text-sm text-(--muted-foreground)">{desc}</p>
      </div>
    </div>
  );
}
