"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, RefreshCw, AlertCircle, CheckCircle2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { analyzeFaceSymmetry } from "@/tools/_shared/beauty/utils/faceAnalysis";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, DetailRow } from "@/tools/_shared/beauty/components/ResultCard";

const FEATURE_ICONS = {
  Eyes: Eye,
  Brows: Eye,
  Cheeks: ScanFace,
  Jaw: ScanFace,
  Nose: ScanFace,
  Lips: Eye,
};

const FEATURE_COLORS = {
  Eyes: "var(--primary)",
  Brows: "#8B5CF6",
  Cheeks: "#EC4899",
  Jaw: "#F59E0B",
  Nose: "#3B82F6",
  Lips: "#EF4444",
};

export default function FaceSymmetryChecker() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [overlayUrl, setOverlayUrl] = useState(null);
  const imageRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const handleImage = useCallback(async ({ src, img }) => {
    setError(null);
    setResult(null);
    setOverlayUrl(null);
    setImage({ src, img });
    setLoading(true);
    setLoadingLabel("Loading AI models...");
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);
    } catch {
      setError("Failed to load AI models. Please refresh and try again.");
      toast.error("Model loading failed");
      setLoading(false);
      return;
    }
    setLoadingLabel("Analyzing facial symmetry...");
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const detections = await faceapi
        .detectAllFaces(offscreen, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks();
      if (!detections || detections.length === 0) {
        setError("No face detected. Please try a different photo with a clear, front-facing view.");
        toast.error("No face detected");
        setLoading(false);
        return;
      }
      const landmarks = detections[0].landmarks.positions;
      const symmetryResult = analyzeFaceSymmetry(landmarks);
      setResult(symmetryResult);
      toast.success(`Symmetry score: ${symmetryResult.score}%`);
      drawOverlay(landmarks, img.width, img.height);
    } catch (e) {
      console.error(e);
      setError(`Analysis failed: ${e?.message || "Unknown error"}. Try a clearer image.`);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
      setLoadingLabel("");
    }
  }, []);

  const drawOverlay = useCallback((landmarks, w, h) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "rgba(20, 184, 166, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 68; i++) {
      if (i === 0) ctx.moveTo(landmarks[i].x, landmarks[i].y);
      else ctx.lineTo(landmarks[i].x, landmarks[i].y);
    }
    ctx.stroke();

    for (let i = 0; i < 68; i++) {
      const x = landmarks[i].x;
      const y = landmarks[i].y;
      const isKey = [0, 8, 16, 17, 21, 22, 26, 27, 30, 31, 35, 36, 39, 42, 45, 48, 51, 54, 57].includes(i);
      ctx.beginPath();
      ctx.arc(x, y, isKey ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isKey ? "#14B8A6" : "rgba(20, 184, 166, 0.5)";
      ctx.fill();
      if (isKey) {
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    const pairs = [
      [36, 45], [17, 26], [1, 15], [4, 12], [31, 35], [48, 54],
    ];
    const midX = landmarks[27]?.x || w / 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
    ctx.lineWidth = 1;
    for (const [a, b] of pairs) {
      ctx.beginPath();
      ctx.moveTo(midX, Math.min(landmarks[a]?.y, landmarks[b]?.y) - 10);
      ctx.lineTo(midX, Math.max(landmarks[a]?.y, landmarks[b]?.y) + 10);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const midline = landmarks[27]?.x || w / 2;
    ctx.beginPath();
    ctx.moveTo(midline, 10);
    ctx.lineTo(midline, h - 10);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    setOverlayUrl(canvas.toDataURL());
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setOverlayUrl(null);
    overlayCanvasRef.current = null;
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "var(--primary)";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#F97316";
    return "#EF4444";
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Face Symmetry Checker</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a front-facing selfie to analyze the bilateral symmetry of your facial features.
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-(--border) bg-(--card) shadow-md p-8 text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-(--foreground) font-semibold">{loadingLabel}</p>
                <p className="text-sm text-(--muted-foreground) mt-1">This should only take a moment</p>
              </div>
              <div className="max-w-xs mx-auto h-1.5 rounded-full bg-(--border) overflow-hidden">
                <div className="h-full rounded-full bg-(--primary) animate-pulse" style={{ width: "60%" }} />
              </div>
            </motion.div>
          )}

          {result && !loading && image && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={image.src}
                      alt="Uploaded"
                      className="w-full h-auto object-contain"
                    />
                    {overlayUrl && (
                      <img
                        src={overlayUrl}
                        alt="Landmark overlay"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 border-t border-(--border)/50 bg-(--background)/80">
                    <span className="text-xs text-(--muted-foreground)">68-point facial landmark detection & symmetry lines</span>
                    <ConfidenceBadge confidence={result.confidence} />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-(--primary)/10 to-cyan-400/10 dark:from-(--primary)/5 dark:to-cyan-400/5 p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-16 h-16 mx-auto rounded-full bg-(--primary)/10 flex items-center justify-center mb-3"
                      >
                        <ScanFace className="w-8 h-8 text-(--primary)" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-(--muted-foreground) uppercase tracking-wider font-semibold"
                      >
                        Symmetry Score
                      </motion.p>
                      <motion.p
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-(--foreground) mt-1"
                        style={{ color: getScoreColor(result.score) }}
                      >
                        {result.score}%
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3"
                      >
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--primary)/10 text-(--primary)">
                          <Sparkles className="w-3 h-3" />
                          AI Analysis
                        </span>
                      </motion.div>
                    </div>
                    <div className="p-5">
                      <ScoreBar label="Overall Symmetry" score={result.score} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-5">
                    <h3 className="text-sm font-semibold text-(--foreground) mb-4">Feature Breakdown</h3>
                    <div className="space-y-3">
                      {result.details.map((detail, i) => {
                        const Icon = FEATURE_ICONS[detail.name] || ScanFace;
                        const color = FEATURE_COLORS[detail.name] || "var(--primary)";
                        return (
                          <motion.div
                            key={detail.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <span className="text-sm font-medium text-(--foreground)">{detail.name}</span>
                              </div>
                              <span className="text-sm font-bold" style={{ color: getScoreColor(detail.score) }}>
                                {detail.score}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-(--border) overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${detail.score}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-(--muted-foreground) mt-0.5">
                              <span>L: {detail.leftDist}px</span>
                              <span>R: {detail.rightDist}px</span>
                              <span>Ratio: {detail.ratio}%</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-(--primary)/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-(--primary)" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-(--foreground) mb-1">Analysis Summary</h4>
                    <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden">
                <div className="px-5 py-3 border-b border-(--border)/50 bg-(--background)/50">
                  <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Detailed Measurements</span>
                </div>
                <div className="p-5 space-y-1">
                  {result.details.map((d) => (
                    <DetailRow
                      key={d.name}
                      label={`${d.name} Symmetry`}
                      value={`${d.score}% (L: ${d.leftDist}px / R: ${d.rightDist}px, ${d.ratio}% ratio)`}
                      color={getScoreColor(d.score)}
                    />
                  ))}
                  <DetailRow label="Overall Confidence" value={`${result.confidence}%`} color="var(--primary)" />
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--primary) text-white font-semibold hover:brightness-110 transition-all shadow-lg"
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
