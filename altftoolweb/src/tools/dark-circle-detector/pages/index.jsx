"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { analyzeDarkCircles } from "@/tools/_shared/beauty/utils/skinAnalysis";
import { getEyeRegions } from "@/tools/_shared/beauty/utils/faceAnalysis";
import { initImageSegmenter } from "@/tools/_shared/beauty/utils/hairPreview";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, MetricGrid, DetailRow } from "@/tools/_shared/beauty/components/ResultCard";

const SEVERITY_COLORS = {
  Minimal: "var(--primary)",
  Mild: "#F59E0B",
  Moderate: "#F97316",
  Significant: "#EF4444",
  Severe: "#DC2626",
};

const SEVERITY_BG = {
  Minimal: "bg-(--primary)/10 text-(--primary)",
  Mild: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Moderate: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Significant: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  Severe: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

export default function DarkCircleDetector() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [overlayUrl, setOverlayUrl] = useState(null);
  const [detectionStage, setDetectionStage] = useState(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        setModelsLoading(true);
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        if (!cancelled) setModelsLoaded(true);
      } catch {
        if (!cancelled) setError("Failed to load AI models. Please refresh and try again.");
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }
    loadModels();
    return () => { cancelled = true; };
  }, []);

  const drawOverlay = useCallback((img, eyeRegions) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    for (const side of ["left", "right"]) {
      const eye = eyeRegions[side];
      if (!eye) continue;
      const cx = eye.x + eye.w / 2;
      const cy = eye.y + eye.h;
      const radius = Math.max(eye.w * 0.8, eye.h * 1.2);
      const r2 = radius * radius;

      for (let py = Math.round(cy); py < Math.round(cy + radius) && py < canvas.height; py++) {
        for (let px = Math.round(cx - radius); px < Math.round(cx + radius) && px < canvas.width; px++) {
          const dx = px - cx, dy = py - cy;
          if (dx * dx + dy * dy > r2 || px < 0 || py < 0) continue;
          const idx = (py * canvas.width + px) * 4;
          const rv = data[idx], g = data[idx + 1], b = data[idx + 2];
          const luminance = 0.299 * rv + 0.587 * g + 0.114 * b;
          if (luminance < 5 || luminance > 250) continue;
          const bluish = Math.max(0, b - (rv + g) / 2);
          const darkness = Math.max(0, 100 - luminance * 0.4);
          if (bluish > 8) {
            data[idx] = Math.min(255, rv + 60);
            data[idx + 1] = Math.max(0, g - 30);
            data[idx + 2] = Math.max(0, b - 40);
            data[idx + 3] = 180;
          } else if (darkness > 25) {
            data[idx] = Math.min(255, rv + 40);
            data[idx + 1] = Math.max(0, g - 20);
            data[idx + 2] = Math.max(0, b - 20);
            data[idx + 3] = 140;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    overlayCanvasRef.current = canvas;
    setOverlayUrl(canvas.toDataURL());
  }, []);

  const handleImage = useCallback(async ({ src, img }) => {
    if (!mountedRef.current) return;
    setError(null);
    setResult(null);
    setOverlayUrl(null);
    setImage({ src, img });
    setLoading(true);
    setLoadingMessage("Initializing face detection...");
    setDetectionStage(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;

      if (!mountedRef.current) return;
      setLoadingMessage("Detecting face...");
      setDetectionStage("detecting");

      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks();

      if (!mountedRef.current) return;

      if (!detections || detections.length === 0) {
        setError("No face detected. Please use a clear front-facing photo with good lighting.");
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      const landmarks = detections[0].landmarks.positions;
      if (!landmarks || landmarks.length < 48) {
        setError("Could not extract facial landmarks. Try a more front-facing photo.");
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      setDetectionStage("analyzing");
      setLoadingMessage("Analyzing under-eye pigmentation...");

      const eyeRegions = getEyeRegions(landmarks);
      if (!eyeRegions) {
        setError("Could not determine eye regions from landmarks.");
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      let categoryMask = null;
      try {
        const segmenter = await initImageSegmenter();
        const result = segmenter.segment(img);
        categoryMask = result.categoryMask.getAsUint8Array();
      } catch (err) {
        console.warn("AI Segmentation failed", err);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = analyzeDarkCircles(imageData, eyeRegions, categoryMask);

      if (!mountedRef.current) return;

      setResult(analysis);
      drawOverlay(img, eyeRegions);

      if (analysis.severity !== "Unknown") {
        toast.success(`Analysis complete: ${analysis.severity} dark circles`);
      } else {
        toast.error("Could not produce a reliable analysis");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || "Analysis failed. Try a clear front-facing photo.");
      toast.error("Analysis failed");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMessage("");
        setDetectionStage(null);
      }
    }
  }, [drawOverlay]);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setLoadingMessage("");
    setOverlayUrl(null);
    setDetectionStage(null);
    canvasRef.current = null;
    overlayCanvasRef.current = null;
  }, []);

  const metrics = result
    ? [
        { label: "Darkness Level", value: `${result.darkness}%` },
        { label: "Bluishness", value: `${result.bluishness}` },
        { label: "Severity Score", value: `${result.score}%`, sub: result.severity },
      ]
    : [];

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Dark Circle Detector</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a selfie and let AI analyze dark circles under your eyes with real face detection.
          </p>
        </div>

        <div className="space-y-6">
          {!image && !loading && !result && (
            <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6">
              {modelsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-(--primary) animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-(--foreground) font-semibold">Loading AI models...</p>
                    <p className="text-sm text-(--muted-foreground) mt-1">Preparing face detection engine</p>
                  </div>
                </div>
              ) : modelsLoaded ? (
                <BeautyUploader onImage={handleImage} />
              ) : (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Model Load Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error || "Failed to load AI models."}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-5 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Detection Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-(--border) bg-(--card) shadow-md p-8 text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                {detectionStage === "detecting" ? (
                  <Eye className="w-7 h-7 text-(--primary) animate-pulse" />
                ) : (
                  <div className="w-7 h-7 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div>
                <p className="text-(--foreground) font-semibold">{loadingMessage}</p>
                <p className="text-sm text-(--muted-foreground) mt-1">
                  {detectionStage === "detecting"
                    ? "Scanning for facial landmarks..."
                    : "Measuring pigmentation and darkness"}
                </p>
              </div>
              <div className="max-w-xs mx-auto h-1.5 rounded-full bg-(--border) overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-(--primary)"
                  animate={{ width: detectionStage === "detecting" ? ["30%", "60%"] : ["60%", "95%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-(--primary)/10 to-cyan-400/10 dark:from-(--primary)/5 dark:to-cyan-400/5 p-6 md:p-8 text-center relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto rounded-full bg-(--primary)/10 flex items-center justify-center mb-4"
                  >
                    <Eye className="w-10 h-10 text-(--primary)" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    {result.severity}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 flex-wrap"
                  >
                    <ConfidenceBadge confidence={Math.round(result.confidence)} />
                    {result.confidence > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--primary)/10 text-(--primary)">
                        <CheckCircle2 className="w-3 h-3" />
                        Face-Detected
                      </span>
                    )}
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <ScoreBar label="Dark Circle Severity" score={result.score} />

                  <div>
                    <h3 className="text-sm font-semibold text-(--foreground) mb-3">Detection Metrics</h3>
                    <MetricGrid metrics={metrics} />
                  </div>

                  {overlayUrl && (
                    <div>
                      <h3 className="text-sm font-semibold text-(--foreground) mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-(--primary)" />
                        Under-Eye Analysis Overlay
                      </h3>
                      <div className="relative rounded-lg border border-(--border) overflow-hidden">
                        <img src={overlayUrl} alt="Dark circle detection overlay" className="w-full h-auto" />
                      </div>
                      <p className="text-xs text-(--muted-foreground) mt-2">
                        Highlighted regions indicate detected darkness and bluish pigmentation under the eyes based on actual pixel analysis.
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg bg-(--background) border border-(--border) p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-(--primary) mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                      <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Detailed Analysis</span>
                    </div>
                    <div className="p-4 space-y-1">
                      <DetailRow label="Severity" value={result.severity} />
                      <DetailRow label="Darkness Level" value={`${result.darkness}%`} />
                      <DetailRow label="Bluishness Index" value={`${result.bluishness}`} />
                      <DetailRow label="Score" value={`${result.score}%`} color="var(--primary)" />
                      <DetailRow label="Confidence" value={`${Math.round(result.confidence)}%`} color="var(--primary)" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--primary) text-white font-semibold hover:brightness-110 transition-all shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze Another
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
