"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Film,
  Download,
  Settings,
  RefreshCw,
  Clock,
  Sliders,
  Play,
  Pause,
  Layers,
  Sparkles,
  Info,
  Trash2,
} from "lucide-react";

export default function MainComponent() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  // Trimming parameters
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);

  // GIF output configuration
  const [fps, setFps] = useState(10);
  const [scaleWidth, setScaleWidth] = useState(480);
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);
  const [maxColors, setMaxColors] = useState(256);

  // Status management
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [outputGifUrl, setOutputGifUrl] = useState("");
  const [outputSizeKB, setOutputSizeKB] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle video loading metrics
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Invalid file type. Please upload a standard video file (MP4, WebM, OGG).");
        return;
      }
      setError("");
      setSuccess("");
      setOutputGifUrl("");
      setOutputSizeKB(0);
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStartTime(0);
      setProgress(0);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setEndTime(Math.min(video.duration, 5)); // default to max 5s trim initially
      setVideoWidth(video.videoWidth);
      setVideoHeight(video.videoHeight);
      
      // Suggest scale width based on aspect ratio
      if (video.videoWidth > 640) {
        setScaleWidth(480);
      } else {
        setScaleWidth(video.videoWidth);
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        if (!isPlaying) {
          video.pause();
        }
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.currentTime = startTime;
        video.play();
        setIsPlaying(true);
      }
    }
  };

  // Main Conversion Routine
  const convertToGif = async () => {
    if (!videoUrl) return;
    setError("");
    setIsCompiling(true);
    setProgress(0);
    setStatusMessage("Initializing encoder...");

    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const gif = GIFEncoder();

      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      
      // Wait for video source to initialize
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error("Failed to load video source for extraction."));
      });

      const aspect = video.videoHeight / video.videoWidth;
      const targetWidth = Number(scaleWidth) || 480;
      const targetHeight = Math.round(targetWidth * aspect);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      const trimDuration = endTime - startTime;
      const totalFrames = Math.max(1, Math.round(trimDuration * fps));
      const frameInterval = 1 / fps;

      let currentFrame = 0;
      let seekTime = startTime;

      setStatusMessage("Extracting video frames...");

      while (seekTime < endTime) {
        // Seek video to targeted time
        video.currentTime = seekTime;

        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        // Draw seeked frame to temporary canvas
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

        // Read canvas pixel data
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const rgba = imageData.data;

        // Generate palette mapping
        const palette = quantize(rgba, maxColors);
        const index = applyPalette(rgba, palette);

        // Write frame to encoder bytes buffer
        gif.writeFrame(index, targetWidth, targetHeight, {
          palette,
          delay: Math.round((frameInterval / speed) * 1000), // adjusted speed delay
          repeat: loop ? 0 : -1,
        });

        currentFrame++;
        setProgress(Math.min(99, Math.round((currentFrame / totalFrames) * 100)));
        setStatusMessage(`Compiling frame ${currentFrame} of ${totalFrames}...`);
        
        seekTime += frameInterval;
      }

      gif.finish();
      const buffer = gif.bytes();
      const blob = new Blob([buffer], { type: "image/gif" });
      const url = URL.createObjectURL(blob);

      setOutputGifUrl(url);
      setOutputSizeKB(Math.round(blob.size / 1024));
      setProgress(100);
      setSuccess("Your animated GIF has been successfully compiled!");
    } catch (err) {
      setError(`GIF Compilation failed: ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!outputGifUrl) return;
    const link = document.createElement("a");
    link.href = outputGifUrl;
    link.download = `converted-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setVideoFile(null);
    setVideoUrl("");
    setDuration(0);
    setStartTime(0);
    setEndTime(5);
    setProgress(0);
    setOutputGifUrl("");
    setOutputSizeKB(0);
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Film className="h-8 w-8 text-teal-500 shrink-0" /> Video to GIF Converter
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Convert offline mp4 or webm video clips to looping animated GIFs privately. Processing happens entirely inside your browser.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone (Initially side-by-side or large panel) */}
      {!videoUrl ? (
        <div className="bg-(--surface) rounded-xl border border-(--border) p-8 shadow-sm text-center">
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-teal-500/20 hover:border-teal-500/50 bg-(--page) rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors max-w-2xl mx-auto"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="h-12 w-12 text-teal-500/60 mb-3 animate-bounce" />
            <span className="text-sm font-semibold text-(--foreground)">Choose Video File</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports MP4, WebM, OGG (Max 20MB recommended)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          
          {/* Row 1: Video Editor & Trimmer (Full Width) */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-(--border) pb-3">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
                <Film className="h-4.5 w-4.5 text-teal-500" /> Video Editor & Trimmer
              </h3>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-red-500 rounded text-xs font-semibold text-red-500 transition-colors bg-(--page) cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Video
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex justify-center items-center h-[400px]">
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                className="max-h-full max-w-full object-contain"
                muted
                playsInline
              />
              
              {/* Play Overlay Button */}
              <button
                onClick={togglePlay}
                className="absolute p-4 rounded-full bg-teal-500/90 text-white hover:bg-teal-600 transition-all hover:scale-105 shadow cursor-pointer active:scale-95"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </button>
            </div>

            {/* Duration Trim Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-teal-500" /> Start Time: {startTime.toFixed(2)}s</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-teal-500" /> End Time: {endTime.toFixed(2)}s</span>
                <span>Duration Selected: {(endTime - startTime).toFixed(2)}s</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">Start Marker</span>
                  <input
                    type="range"
                    min="0"
                    max={endTime}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStartTime(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold">End Marker</span>
                  <input
                    type="range"
                    min={startTime}
                    max={duration || 10}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEndTime(val);
                      if (videoRef.current) videoRef.current.currentTime = startTime;
                    }}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Export Configuration Panel (Horizontal columns below trimmer) */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-teal-500" /> Export Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
              
              {/* Col 1: Resolution & Speed (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Target Width
                  </label>
                  <input
                    type="number"
                    value={scaleWidth}
                    onChange={(e) => setScaleWidth(Math.max(100, Math.min(1920, Number(e.target.value))))}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Playback Speed
                  </label>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value={0.5}>0.5x Slowed</option>
                    <option value={1.0}>1.0x Normal</option>
                    <option value={1.5}>1.5x Fast</option>
                    <option value={2.0}>2.0x Double</option>
                  </select>
                </div>
              </div>

              {/* Col 2: Frame Rate & Loop Switch (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <span>Frame Rate (FPS)</span>
                    <span>{fps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Loop GIF</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              {/* Col 3: Color Depth & Advice (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Color Depth
                  </label>
                  <select
                    value={maxColors}
                    onChange={(e) => setMaxColors(Number(e.target.value))}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value={256}>256 Colors (High Quality)</option>
                    <option value={128}>128 Colors (Standard)</option>
                    <option value={64}>64 Colors (Medium size)</option>
                    <option value={32}>32 Colors (Low quality, Small)</option>
                  </select>
                </div>
                <div className="flex gap-2 items-start text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                  <p>GIF size depends heavily on duration, width, and FPS parameters.</p>
                </div>
              </div>

              {/* Col 4: Action & Progress (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Build Action
                  </label>
                  <button
                    onClick={convertToGif}
                    disabled={isCompiling}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isCompiling ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sliders className="h-3.5 w-3.5" />
                    )}
                    {isCompiling ? "Compiling..." : "Generate GIF"}
                  </button>
                </div>

                {isCompiling && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="truncate max-w-[120px]">{statusMessage}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-(--border) rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-teal-600 h-1 rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Row 3: Compiled Preview Section */}
          {outputGifUrl && (
            <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Compiled Animated GIF
              </h3>
              
              <div className="flex flex-col items-center justify-center">
                <div className="border border-(--border) shadow-md rounded-lg overflow-hidden bg-slate-200/50 dark:bg-slate-800/50 p-6 max-w-full flex justify-center">
                  <img
                    src={outputGifUrl}
                    alt="Compiled animation GIF preview"
                    className="max-h-[380px] object-contain border bg-white"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-center w-full max-w-md">
                  <div className="bg-(--page) p-2 rounded-lg border border-(--border)">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">File Size</span>
                    <span className="text-sm font-bold text-(--foreground)">{outputSizeKB} KB</span>
                  </div>
                  <div className="bg-(--page) p-2 rounded-lg border border-(--border)">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Dimensions</span>
                    <span className="text-sm font-bold text-(--foreground)">{scaleWidth} px width</span>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="mt-6 inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 w-full max-w-md"
                >
                  <Download className="h-4 w-4" /> Download Animated GIF
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
