"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Droplets, Sun, Snowflake, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { sampleSkinFromFaceRegion, sampleCheeks, averageColor, analyzeUndertoneFromMultiRegion } from "@/tools/_shared/beauty/utils/colorAnalysis";
import { extractFaceBox } from "@/tools/_shared/beauty/utils/faceAnalysis";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, DetailRow, ColorSwatch } from "@/tools/_shared/beauty/components/ResultCard";

const UNDERTONE_META = {
  Warm: { icon: Sun, bg: "from-amber-400/20 to-orange-400/20", darkBg: "from-amber-400/10 to-orange-400/10", hex: "#F59E0B", jewelry: "Gold metals (yellow/rose gold), warm-toned accessories", foundation: "Warm/ golden-toned foundation (e.g., NC series)" },
  Cool: { icon: Snowflake, bg: "from-blue-400/20 to-purple-400/20", darkBg: "from-blue-400/10 to-purple-400/10", hex: "#3B82F6", jewelry: "Silver metals (white gold/platinum), cool-toned accessories", foundation: "Cool/ pink-toned foundation (e.g., NW series)" },
  Neutral: { icon: Droplets, bg: "from-green-400/20 to-teal-400/20", darkBg: "from-green-400/10 to-teal-400/10", hex: "#14B8A6", jewelry: "Both gold and silver — you can wear any metal", foundation: "Neutral-toned foundation (e.g., N series)" },
};

const STAGE_META = {
  "loading-models": { label: "Loading face detection models...", sub: "Downloading AI models for facial analysis" },
  detecting: { label: "Detecting face...", sub: "Scanning for facial landmarks" },
  sampling: { label: "Sampling skin regions...", sub: "Extracting color data from face area" },
  analyzing: { label: "Analyzing undertone...", sub: "Computing warm/cool balance" },
};

export default function SkinUndertoneChecker() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [skinColor, setSkinColor] = useState(null);
  const canvasRef = useRef(null);
  const modelsLoaded = useRef(false);

  const ensureModels = useCallback(async () => {
    if (modelsLoaded.current) return;
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    modelsLoaded.current = true;
  }, []);

  const handleImage = useCallback(async ({ src, img }) => {
    setError(null);
    setResult(null);
    setSkinColor(null);
    setImage({ src, img });
    setLoading(true);
    try {
      setStage("loading-models");
      await ensureModels();

      setStage("detecting");
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks();
      if (!detection) {
        setError("No face detected. Please ensure your face is clearly visible and facing forward.");
        toast.error("No face found");
        setLoading(false);
        setStage(null);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const faceBox = extractFaceBox(detection.landmarks.positions);
      if (!faceBox) {
        setError("Could not determine face boundaries. Try a different photo.");
        toast.error("Face box extraction failed");
        setLoading(false);
        setStage(null);
        return;
      }

      setStage("sampling");
      const skinSamples = sampleSkinFromFaceRegion(imageData, faceBox);
      const cheekSamples = sampleCheeks(imageData, faceBox);

      if (skinSamples.length < 10 && cheekSamples.length < 10) {
        setError("Could not sample enough skin pixels. Try a closer, well-lit photo.");
        toast.error("Insufficient skin sample");
        setLoading(false);
        setStage(null);
        return;
      }

      setStage("analyzing");
      const undertoneResult = analyzeUndertoneFromMultiRegion(skinSamples, cheekSamples);
      if (!undertoneResult) {
        setError("Unable to analyze undertone from the sampled regions. Try a different photo.");
        toast.error("Undertone analysis failed");
        setLoading(false);
        setStage(null);
        return;
      }

      setSkinColor(undertoneResult.skinColor);
      setResult(undertoneResult);
      toast.success(`${undertoneResult.undertone} undertone detected`);
    } catch (e) {
      const msg = e?.message?.includes("models") ? "Failed to load face detection models. Please refresh and try again." : "Analysis failed. Try a different photo with even lighting.";
      setError(msg);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
      setStage(null);
    }
  }, [ensureModels]);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setError(null);
    setSkinColor(null);
    setLoading(false);
    setStage(null);
    canvasRef.current = null;
  }, []);

  const meta = result ? UNDERTONE_META[result.undertone] : null;
  const UndertoneIcon = meta ? meta.icon : Palette;
  const hexColor = skinColor ? `#${skinColor.r.toString(16).padStart(2, "0")}${skinColor.g.toString(16).padStart(2, "0")}${skinColor.b.toString(16).padStart(2, "0")}` : null;

  const stageInfo = STAGE_META[stage];

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Skin Undertone Checker</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a selfie to discover your skin&apos;s undertone — warm, cool, or neutral — and get personalized recommendations.
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

          {loading && stageInfo && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-(--border) bg-(--card) shadow-md p-8 text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-(--primary) animate-spin" />
              </div>
              <div>
                <p className="text-(--foreground) font-semibold">{stageInfo.label}</p>
                <p className="text-sm text-(--muted-foreground) mt-1">{stageInfo.sub}</p>
              </div>
              <div className="max-w-xs mx-auto h-1.5 rounded-full bg-(--border) overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: stage === "loading-models" ? "25%" : stage === "detecting" ? "50%" : stage === "sampling" ? "75%" : "90%" }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-(--primary)"
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
                <div className={`bg-gradient-to-r ${meta.bg} dark:${meta.darkBg} p-6 md:p-8 text-center relative`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto rounded-full bg-(--primary)/10 flex items-center justify-center mb-4"
                  >
                    <UndertoneIcon className="w-10 h-10 text-(--primary)" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    {result.undertone}
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
                      Color Analysis
                    </span>
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <ScoreBar label="Undertone Match Score" score={result.score} />

                  <div className="rounded-lg bg-(--background) border border-(--border) p-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-(--primary) mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  {hexColor && (
                    <div>
                      <h3 className="text-sm font-semibold text-(--foreground) mb-3">Detected Skin Tone</h3>
                      <ColorSwatch hex={hexColor} name={`RGB (${skinColor.r}, ${skinColor.g}, ${skinColor.b})`} size="lg" />
                    </div>
                  )}

                  {result.hsl && (
                    <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                        <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">HSL Values</span>
                      </div>
                      <div className="p-4 space-y-1">
                        <DetailRow label="Hue" value={`${result.hsl.h}°`} />
                        <DetailRow label="Saturation" value={`${result.hsl.s}%`} />
                        <DetailRow label="Lightness" value={`${result.hsl.l}%`} />
                      </div>
                    </div>
                  )}

                  {result.hsv && (
                    <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                        <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">HSV Values</span>
                      </div>
                      <div className="p-4 space-y-1">
                        <DetailRow label="Hue" value={`${result.hsv.h}°`} />
                        <DetailRow label="Saturation" value={`${result.hsv.s}%`} />
                        <DetailRow label="Value" value={`${result.hsv.v}%`} />
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                      <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Recommendations</span>
                    </div>
                    <div className="p-4 space-y-1">
                      <DetailRow label="Foundation Type" value={meta.foundation} />
                      <DetailRow label="Jewelry" value={meta.jewelry} />
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
