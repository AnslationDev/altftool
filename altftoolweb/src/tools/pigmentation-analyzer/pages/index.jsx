"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Grid, AlertCircle, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { analyzePigmentation } from "@/tools/_shared/beauty/utils/skinAnalysis";
import { extractFaceBox } from "@/tools/_shared/beauty/utils/faceAnalysis";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, MetricGrid, DetailRow } from "@/tools/_shared/beauty/components/ResultCard";

const SEVERITY_COLORS = {
  Even: "var(--primary)",
  Mild: "#F59E0B",
  Moderate: "#F97316",
  Significant: "#EF4444",
  Severe: "#DC2626",
};

const SEVERITY_BG = {
  Even: "bg-(--primary)/10 text-(--primary)",
  Mild: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Moderate: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Significant: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  Severe: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

const LOADING_STEPS = ["Loading face detection model...", "Loading face landmark model...", "Detecting face...", "Analyzing pigmentation..."];

const getHeatmapColor = (lum, mean) => {
  const diff = lum - mean;
  if (diff < -15) return "rgba(239,68,68,0.7)";
  if (diff < -8) return "rgba(249,115,22,0.6)";
  if (diff < -3) return "rgba(234,179,8,0.5)";
  if (diff < 3) return "rgba(34,197,94,0.4)";
  if (diff < 8) return "rgba(234,179,8,0.5)";
  if (diff < 15) return "rgba(249,115,22,0.6)";
  return "rgba(239,68,68,0.7)";
};

export default function PigmentationAnalyzer() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [meanLum, setMeanLum] = useState(0);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const imgRef = useRef(null);
  const modelsLoaded = useRef(false);
  const prevSrcRef = useRef(null);

  // The overlay canvas is drawn at the source image's natural pixel size, but
  // the <img> is shown with object-contain inside a box whose aspect ratio
  // can differ from the image's (it's capped at max-h-[500px]), which
  // letterboxes the visible photo. Position/size the canvas to match the
  // actual letterboxed photo rect instead of stretching across the full box,
  // so heatmap pixels land over the correct photo pixels.
  const positionOverlay = useCallback(() => {
    const imgEl = imgRef.current;
    const overlay = overlayRef.current;
    const srcCanvas = canvasRef.current;
    if (!imgEl || !overlay || !srcCanvas || !srcCanvas.width || !srcCanvas.height) return;
    const boxW = imgEl.clientWidth;
    const boxH = imgEl.clientHeight;
    if (!boxW || !boxH) return;
    const imgRatio = srcCanvas.width / srcCanvas.height;
    const boxRatio = boxW / boxH;
    let dispW, dispH;
    if (imgRatio > boxRatio) {
      dispW = boxW;
      dispH = boxW / imgRatio;
    } else {
      dispH = boxH;
      dispW = boxH * imgRatio;
    }
    overlay.style.left = `${(boxW - dispW) / 2}px`;
    overlay.style.top = `${(boxH - dispH) / 2}px`;
    overlay.style.width = `${dispW}px`;
    overlay.style.height = `${dispH}px`;
  }, []);

  useEffect(() => {
    if (!blockData || !canvasRef.current || !overlayRef.current) return;
    const overlay = overlayRef.current;
    const srcCanvas = canvasRef.current;
    overlay.width = srcCanvas.width;
    overlay.height = srcCanvas.height;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    for (const block of blockData) {
      ctx.fillStyle = getHeatmapColor(block.lum, meanLum);
      ctx.fillRect(block.bx, block.by, 10, 10);
    }
    positionOverlay();
  }, [blockData, meanLum, positionOverlay]);

  useEffect(() => {
    if (!blockData || !imgRef.current) return;
    const imgEl = imgRef.current;
    const ro = new ResizeObserver(() => positionOverlay());
    ro.observe(imgEl);
    window.addEventListener("resize", positionOverlay);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", positionOverlay);
    };
  }, [blockData, positionOverlay]);

  // Revoke the previously-created blob object URL whenever it's replaced or
  // the component unmounts, so uploaded images don't leak memory.
  useEffect(() => {
    return () => {
      if (prevSrcRef.current) URL.revokeObjectURL(prevSrcRef.current);
    };
  }, []);

  const handleImage = useCallback(async ({ src, img }) => {
    if (prevSrcRef.current && prevSrcRef.current !== src) {
      URL.revokeObjectURL(prevSrcRef.current);
    }
    prevSrcRef.current = src;
    setError(null);
    setResult(null);
    setBlockData(null);
    setMeanLum(0);
    setImage({ src, img });
    setLoading(true);
    setLoadingStep(0);
    try {
      if (!modelsLoaded.current) {
        setLoadingStep(0);
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setLoadingStep(1);
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        modelsLoaded.current = true;
      }

      setLoadingStep(2);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;

      const detection = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      if (!detection || detection.length === 0 || !detection[0].landmarks) {
        throw new Error("No face detected. Please ensure your face is clearly visible and well-lit.");
      }
      const landmarks = detection[0].landmarks.positions;
      const faceBox = extractFaceBox(landmarks);
      if (!faceBox) throw new Error("Could not determine face region.");

      const padX = Math.round(faceBox.w * 0.2);
      const padY = Math.round(faceBox.h * 0.2);
      const region = {
        x: Math.max(0, faceBox.x + padX),
        y: Math.max(0, faceBox.y + padY),
        w: Math.min(Math.round(faceBox.w * 0.6), canvas.width - faceBox.x - padX),
        h: Math.min(Math.round(faceBox.h * 0.6), canvas.height - faceBox.y - padY),
      };

      setLoadingStep(3);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = analyzePigmentation(imageData, region);
      if (!analysis || analysis.confidence === 0) {
        throw new Error("Insufficient skin area for pigmentation analysis in the detected face region.");
      }
      setResult(analysis);

      if (analysis.blockData && analysis.blockData.length > 0) {
        const m = analysis.blockData.reduce((s, b) => s + b.lum, 0) / analysis.blockData.length;
        setMeanLum(m);
        setBlockData(analysis.blockData);
      }

      toast.success(`Analysis complete: ${analysis.severity}`);
    } catch (err) {
      const msg = err.message || "Pigmentation analysis failed. Try a clearer image.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (prevSrcRef.current) {
      URL.revokeObjectURL(prevSrcRef.current);
      prevSrcRef.current = null;
    }
    setImage(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setLoadingStep(0);
    setBlockData(null);
    setMeanLum(0);
    canvasRef.current = null;
  }, []);

  const metrics = result
    ? [
        { label: "Variation Score", value: `${result.variation}%`, sub: "tone unevenness" },
        { label: "Spots Detected", value: result.spots, sub: "pigmented areas" },
        { label: "Confidence", value: `${Math.round(result.confidence)}%`, sub: "rough estimate, region coverage" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 -mt-10">Pigmentation Analyzer</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a selfie to analyze skin pigmentation, detect uneven tone, and identify hyperpigmented areas.
          </p>
        </div>

        <div className="space-y-6">
          {!image && !loading && !result && (
            <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6">
              <BeautyUploader onImage={handleImage} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-5 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Analysis Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              key="loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-(--border) bg-(--card) shadow-md p-8 text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-(--primary) animate-spin" />
              </div>
              <div>
                <p className="text-(--foreground) font-semibold">{LOADING_STEPS[loadingStep]}</p>
                <p className="text-sm text-(--muted-foreground) mt-1">
                  {loadingStep === 0 && "Downloading face detection model..."}
                  {loadingStep === 1 && "Downloading face landmark model..."}
                  {loadingStep === 2 && "Locating facial features..."}
                  {loadingStep === 3 && "Processing skin tone variation data"}
                </p>
              </div>
              <div className="max-w-xs mx-auto h-1.5 rounded-full bg-(--border) overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-(--primary)"
                  initial={{ width: 0 }}
                  animate={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="result"
              role="status"
              aria-live="polite"
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
                    <Sun className="w-10 h-10 text-(--primary)" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    <span className={`inline-block px-4 py-1 rounded-full text-lg md:text-xl ${SEVERITY_BG[result.severity] || SEVERITY_BG.Even}`}>
                      {result.severity}
                    </span>
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 flex-wrap mt-3"
                  >
                    <ConfidenceBadge confidence={Math.round(result.confidence)} />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--primary)/10 text-(--primary)">
                      <Sparkles className="w-3 h-3" />
                      AI Analysis
                    </span>
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <ScoreBar label="Pigmentation Score" score={result.score} color={SEVERITY_COLORS[result.severity] || "var(--primary)"} />

                  <div>
                    <h3 className="text-sm font-semibold text-(--foreground) mb-3">Key Metrics</h3>
                    <MetricGrid metrics={metrics} />
                  </div>

                  <div className="rounded-lg bg-(--background) border border-(--border) p-4">
                    <div className="flex items-start gap-2.5">
                      <Grid className="w-5 h-5 text-(--primary) mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  {blockData && blockData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-(--foreground) mb-3">Pigmentation Variation Map</h3>
                      <div className="rounded-xl border border-(--border) overflow-hidden bg-(--background) relative">
                        <div className="relative">
                          <img
                            ref={imgRef}
                            src={image.src}
                            alt="Analysis"
                            className="w-full h-auto max-h-[500px] object-contain"
                            onLoad={positionOverlay}
                          />
                          <canvas
                            ref={overlayRef}
                            className="absolute pointer-events-none"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="p-3 flex items-center justify-between text-xs text-(--muted-foreground) border-t border-(--border)">
                          <span>Red = strong variation (darker or lighter)</span>
                          <span>Green = even tone</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                      <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Detailed Analysis</span>
                    </div>
                    <div className="p-4 space-y-1">
                      <DetailRow label="Severity" value={result.severity} color={SEVERITY_COLORS[result.severity]} />
                      <DetailRow label="Variation Score" value={`${result.variation}%`} color={result.variation < 22 ? "var(--primary)" : result.variation < 35 ? "#F59E0B" : "#EF4444"} />
                      <DetailRow label="Spots Detected" value={result.spots} />
                      <DetailRow label="Avg Luminance" value={`${Math.round(meanLum)}`} />
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
