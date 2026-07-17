"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, RefreshCw, AlertCircle, CheckCircle2, Circle, Square, Heart, Gem, RectangleVertical, Sparkles } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { detectFaceShape } from "@/tools/_shared/beauty/utils/faceAnalysis";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, MetricGrid, DetailRow } from "@/tools/_shared/beauty/components/ResultCard";

const SHAPE_ICONS = {
  Oval: Circle,
  Round: Circle,
  Square: Square,
  Heart: Heart,
  Diamond: Gem,
  Oblong: RectangleVertical,
};

export default function FaceShapeDetector() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  const handleImage = useCallback(async ({ src, img }) => {
    setError(null);
    setResult(null);
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
    setLoadingLabel("Detecting face shape...");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks();
      if (!detections || detections.length === 0) {
        setError("No face detected. Please try a different photo with a clear, front-facing view.");
        toast.error("No face detected");
        setLoading(false);
        return;
      }
      const landmarks = detections[0].landmarks.positions;
      const shapeResult = detectFaceShape(landmarks);
      setResult(shapeResult);
      toast.success(`Detected: ${shapeResult.shape} face shape`);
    } catch {
      setError("Face detection failed. Try a clearer image.");
      toast.error("Detection failed");
    } finally {
      setLoading(false);
      setLoadingLabel("");
    }
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
    setLoading(false);
    canvasRef.current = null;
  }, []);

  const metrics = result
    ? [
        { label: "Width Ratio", value: result.metrics.widthRatio.toFixed(2), sub: "jaw / height" },
        { label: "Forehead/Jaw", value: result.metrics.foreheadJawRatio.toFixed(2), sub: "forehead / jaw" },
        { label: "Chin/Jaw", value: result.metrics.chinJawRatio.toFixed(2), sub: "chin / jaw" },
        { label: "Jaw Angle", value: `${result.metrics.jawAngle.toFixed(1)}°`, sub: "jaw sharpness" },
      ]
    : [];

  const ShapeIcon = result ? SHAPE_ICONS[result.shape] || ScanFace : null;

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Face Shape Detector</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a front-facing photo and let AI analyze your facial proportions to determine your face shape.
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
                    {ShapeIcon && <ShapeIcon className="w-10 h-10 text-(--primary)" />}
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    {result.shape}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <ConfidenceBadge confidence={result.confidence} />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--primary)/10 text-(--primary)">
                      <Sparkles className="w-3 h-3" />
                      AI Analysis
                    </span>
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <ScoreBar label="Overall Score" score={result.score} />

                  <div>
                    <h3 className="text-sm font-semibold text-(--foreground) mb-3">Facial Proportions</h3>
                    <MetricGrid metrics={metrics} />
                  </div>

                  <div className="rounded-lg bg-(--background) border border-(--border) p-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-(--primary) mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                      <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Detailed Metrics</span>
                    </div>
                    <div className="p-4 space-y-1">
                      <DetailRow label="Width Ratio (jaw/height)" value={result.metrics.widthRatio.toFixed(3)} />
                      <DetailRow label="Forehead/Jaw Ratio" value={result.metrics.foreheadJawRatio.toFixed(3)} />
                      <DetailRow label="Chin/Jaw Ratio" value={result.metrics.chinJawRatio.toFixed(3)} />
                      <DetailRow label="Jaw Angle" value={`${result.metrics.jawAngle.toFixed(1)}°`} />
                      <DetailRow label="Confidence" value={`${result.confidence}%`} color="var(--primary)" />
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
