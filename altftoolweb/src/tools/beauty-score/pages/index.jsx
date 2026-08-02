"use client";

import React, { useState, useRef } from "react";
import { ScanFace, Upload, Camera, RefreshCw, Activity, Sparkles, MoveHorizontal } from "lucide-react";
import { Button } from "@altftool/ui";
import useBeautyScore from "../hooks/useBeautyScore";
import ScannerOverlay from "../components/ScannerOverlay";
import ScoreResult from "../components/ScoreResult";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];

export default function BeautyScoreHome() {
  const [imageSrc, setImageSrc] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Matches the img's own natural aspect ratio once it loads, so the "Face Detected"
  // overlay box (positioned as a percentage of this container) lines up with the
  // photo even when it isn't 16:9 — see the <img onLoad> handler below.
  const [mediaAspect, setMediaAspect] = useState(16 / 9);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const { analyzing, result, error, analyzeImage, reset } = useBeautyScore();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      alert("Please upload a JPG or PNG photo.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert("That photo is larger than 5MB. Please upload a smaller image.");
      return;
    }
    stopWebcam();
    reset();
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      setImageSrc(src);
      analyzeImage(src);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e);
  };

  const startWebcam = async () => {
    reset();
    setImageSrc(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Could not access webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const src = canvas.toDataURL("image/jpeg");
      stopWebcam();
      setImageSrc(src);
      analyzeImage(src);
    }
  };

  const resetAll = () => {
    reset();
    setImageSrc(null);
    stopWebcam();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6 pb-24">
      <div className="mx-auto max-w-5xl space-y-12">

        <section className="text-center space-y-4">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ScanFace className="h-4 w-4" />
            Fun / AI
          </div>
          <div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
              Beauty Score Calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)] leading-relaxed">
              Upload a clear, front-facing photo to let our AI analyze your facial proportions, symmetry, and calculate your unique beauty score based on the Golden Ratio.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="flex flex-col items-center gap-10">
          
          {/* Action Buttons & Dropzone */}
          {!imageSrc && !isWebcamActive && (
            <div className="w-full max-w-3xl">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-10 sm:p-16 text-center transition-all duration-300 ${
                  isDragging 
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-[1.02]" 
                    : "border-[var(--border)] bg-[var(--card)] hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/5 shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="rounded-full bg-[var(--muted)] p-4 text-[var(--muted-foreground)]">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">Drag & Drop your photo here</h3>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4 relative z-10">
                    <Button
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-6 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Upload size={20} />
                      <span className="font-semibold text-base">Upload Photo</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={startWebcam}
                      className="flex-1 py-6 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Camera size={20} />
                      <span className="font-semibold text-base">Use Webcam</span>
                    </Button>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Photo file to analyze"
                />
              </div>

              {/* Feature Highlights section (only visible before upload) */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400 mb-4">
                    <MoveHorizontal size={24} />
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-2">Facial Symmetry</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">AI measures the exact balance between the left and right sides of your face.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3 text-emerald-600 dark:text-emerald-400 mb-4">
                    <Activity size={24} />
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-2">Golden Ratio</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">Calculates geometric proportions of your eyes, nose, and jawline.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 text-amber-600 dark:text-amber-400 mb-4">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-2">AI Accuracy</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">Uses advanced neural networks to map 68 precise facial landmarks.</p>
                </div>
              </div>
            </div>
          )}

          {/* Media Container */}
          {(imageSrc || isWebcamActive) && (
            <div className="w-full max-w-2xl">
              <div
                className="relative mx-auto flex items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--border)] bg-black shadow-2xl"
                style={{ aspectRatio: mediaAspect, maxHeight: "70vh" }}
              >
                {isWebcamActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                )}

                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Face to analyze"
                    className="w-full h-full object-contain"
                    onLoad={(e) => setMediaAspect(e.target.naturalWidth / e.target.naturalHeight)}
                  />
                )}

                {/* Overlays */}
                <ScannerOverlay isScanning={analyzing} />

                {/* Box drawn from detection result. Positioned as a percentage of
                    this container, which is why the container's aspect-ratio is
                    kept in sync with the photo's own natural size above — without
                    that, the img would letterbox inside the container and this
                    percentage math would no longer line up with the real face. */}
                {result && result.box && (
                  <div
                    className="absolute border-2 border-purple-500 shadow-[0_0_10px_#a855f7] rounded-md transition-all duration-500"
                    style={{
                      left: `${(result.box.x / result.box.imageWidth) * 100}%`,
                      top: `${(result.box.y / result.box.imageHeight) * 100}%`,
                      width: `${(result.box.width / result.box.imageWidth) * 100}%`,
                      height: `${(result.box.height / result.box.imageHeight) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 rounded bg-primary px-2 py-1 font-mono text-xs text-primary-foreground">
                      Face Detected
                    </div>
                  </div>
                )}
              </div>

              {/* Controls below media */}
              <div className="mt-4 flex justify-center gap-4">
                {isWebcamActive && (
                  <Button variant="primary" onClick={captureWebcam} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35">
                    <ScanFace size={18} /> Capture & Analyze
                  </Button>
                )}
                <Button variant="secondary" onClick={resetAll} className="gap-2 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35">
                  <RefreshCw size={18} /> Start Over
                </Button>
              </div>

              {error && (
                <div role="alert" className="mt-4 p-4 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Result Section */}
          {!analyzing && result && (
            <div className="w-full max-w-2xl" role="status" aria-live="polite">
              <ScoreResult result={result} />
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
