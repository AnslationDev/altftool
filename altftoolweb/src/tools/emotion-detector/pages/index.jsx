"use client";

import { useState, useRef, useEffect } from "react";
import UploadArea from "../components/UploadArea";
import ImagePreview from "../components/ImagePreview";
import ResultPanel from "../components/ResultPanel";
import WebcamDetector from "../components/WebcamDetector";
import EmotionHistory from "../components/EmotionHistory";
import HowItWorks from "../components/HowItWorks";
import useEmotionAnalysis from "../hooks/useEmotionAnalysis";

export default function ToolHome() {
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("upload");
  const [cameraDenied, setCameraDenied] = useState(false);
  const startCameraRef = useRef(null);

  const {
    analyzing,
    result,
    error,
    history,
    analyzeImage,
    reset,
    setResult,
    clearHistory
  } = useEmotionAnalysis();

  useEffect(() => {
    if (mode === "camera" && startCameraRef.current) {
      startCameraRef.current();
    }
  }, [mode]);

  const handleSelectHistoryItem = (item) => {
    setPreview(item.image);
    setResult(item.faces);
    setMode("upload");
  };

  const handleReset = () => {
    setPreview(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Emotion Detector
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Analyze facial expressions in real-time or upload photos to detect and visualize emotions instantly using computer vision.
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setMode("upload");
              handleReset();
            }}
            className={`px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all active:scale-95 duration-100 ${
              mode === "upload"
                ? "bg-primary text-white shadow-md shadow-teal-500/10"
                : "bg-card text-foreground border border-border hover:bg-[var(--anslation-ds-soft)]"
            }`}
          >
            Upload Photo
          </button>

          <button
            onClick={() => {
              setMode("camera");
              handleReset();
              setCameraDenied(false);
            }}
            className={`px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all active:scale-95 duration-100 ${
              mode === "camera"
                ? "bg-primary text-white shadow-md shadow-teal-500/10"
                : "bg-card text-foreground border border-border hover:bg-[var(--anslation-ds-soft)]"
            }`}
          >
            Live Webcam
          </button>
        </div>

        {/* Core Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          {mode === "upload" ? (
            !preview ? (
              <UploadArea
                setPreview={setPreview}
                analyzeImage={analyzeImage}
              />
            ) : (
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                  <ImagePreview
                    preview={preview}
                    onReset={handleReset}
                    result={result}
                  />
                  <ResultPanel
                    analyzing={analyzing}
                    result={result}
                    error={error}
                    onReset={handleReset}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                <WebcamDetector
                  onResult={(faces) => {
                    setResult(faces);
                    setCameraDenied(false);
                  }}
                  onCameraDenied={() => setCameraDenied(true)}
                  setStartCamera={(fn) => {
                    startCameraRef.current = fn;
                  }}
                />
                
                <ResultPanel
                  analyzing={false}
                  result={result}
                  error={error}
                  onReset={() => {
                    setMode("upload");
                    handleReset();
                  }}
                />
              </div>

              {cameraDenied && (
                <div className="mt-6 p-4 border border-red-200 bg-red-50/50 rounded-2xl text-xs sm:text-sm text-red-800 space-y-2">
                  <p className="font-bold">⚠️ Camera Access is Blocked</p>
                  <p>To enable real-time detection, grant permission to use your camera in your browser settings:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Click the lock/camera icon in the browser address bar.</li>
                    <li>Change camera permission to &quot;Allow&quot;.</li>
                    <li>Refresh this page.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Log */}
        <EmotionHistory
          history={history}
          onSelect={handleSelectHistoryItem}
          onClear={clearHistory}
        />

        {/* Educational Section */}
        <HowItWorks />

      </div>
    </div>
  );
}
