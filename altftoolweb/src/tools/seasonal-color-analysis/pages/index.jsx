"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { sampleSkinFromFaceRegion, sampleHair, sampleCheeks, averageColor, analyzeSeasonalPalette } from "@/tools/_shared/beauty/utils/colorAnalysis";
import { extractFaceBox } from "@/tools/_shared/beauty/utils/faceAnalysis";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ConfidenceBadge, ColorSwatch } from "@/tools/_shared/beauty/components/ResultCard";

const SEASON_META = {
  Spring: { icon: "🌸", bg: "from-yellow-300/20 to-pink-300/20", darkBg: "from-yellow-300/10 to-pink-300/10", hex: "#FDE68A" },
  Summer: { icon: "🌊", bg: "from-blue-300/20 to-purple-300/20", darkBg: "from-blue-300/10 to-purple-300/10", hex: "#93C5FD" },
  Autumn: { icon: "🍂", bg: "from-orange-300/20 to-red-300/20", darkBg: "from-orange-300/10 to-red-300/10", hex: "#FDBA74" },
  Winter: { icon: "❄️", bg: "from-cyan-300/20 to-blue-300/20", darkBg: "from-cyan-300/10 to-blue-300/10", hex: "#67E8F9" },
  "Deep Winter": { icon: "🌙", bg: "from-indigo-300/20 to-purple-300/20", darkBg: "from-indigo-300/10 to-purple-300/10", hex: "#818CF8" },
  "Deep Autumn": { icon: "🌰", bg: "from-amber-300/20 to-brown-300/20", darkBg: "from-amber-300/10 to-brown-300/10", hex: "#D97706" },
  "Soft Summer": { icon: "🌿", bg: "from-gray-300/20 to-blue-300/20", darkBg: "from-gray-300/10 to-blue-300/10", hex: "#94A3B8" },
  "Soft Autumn": { icon: "🍁", bg: "from-stone-300/20 to-orange-300/20", darkBg: "from-stone-300/10 to-orange-300/10", hex: "#A8A29E" },
  "Clear Spring": { icon: "🌈", bg: "from-yellow-200/20 to-green-300/20", darkBg: "from-yellow-200/10 to-green-300/10", hex: "#86EFAC" },
  "Warm Autumn": { icon: "🔥", bg: "from-orange-300/20 to-red-300/20", darkBg: "from-orange-300/10 to-red-300/10", hex: "#F97316" },
  "Cool Summer": { icon: "💎", bg: "from-sky-300/20 to-pink-300/20", darkBg: "from-sky-300/10 to-pink-300/10", hex: "#7DD3FC" },
  "True Summer": { icon: "🫧", bg: "from-blue-200/20 to-gray-300/20", darkBg: "from-blue-200/10 to-gray-300/10", hex: "#BAE6FD" },
};

const STAGE_META = {
  "loading-models": { label: "Loading face detection models...", sub: "Downloading AI models for facial analysis" },
  detecting: { label: "Detecting face...", sub: "Scanning for facial landmarks" },
  sampling: { label: "Sampling skin, hair, and face regions...", sub: "Extracting color data from your features" },
  analyzing: { label: "Analyzing color season...", sub: "Classifying your seasonal palette" },
};

export default function SeasonalColorAnalysis() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [colors, setColors] = useState(null);
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
    setColors(null);
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
      const hairSamples = sampleHair(imageData, faceBox);
      const cheekSamples = sampleCheeks(imageData, faceBox);

      if (skinSamples.length < 10) {
        setError("Could not sample enough skin pixels. Try a closer, well-lit photo.");
        toast.error("Insufficient skin sample");
        setLoading(false);
        setStage(null);
        return;
      }

      const skinAvg = averageColor(skinSamples);
      const hairAvg = hairSamples.length > 10 ? averageColor(hairSamples) : { r: 80, g: 70, b: 60 };
      const eyeAvg = cheekSamples.length > 10 ? averageColor(cheekSamples) : { r: 100, g: 90, b: 80 };

      setColors({ skin: skinAvg, hair: hairAvg, eyes: eyeAvg });

      setStage("analyzing");
      const seasonResult = analyzeSeasonalPalette(skinAvg, hairAvg, eyeAvg);
      setResult(seasonResult);
      toast.success(`Your season: ${seasonResult.season}`);
    } catch (e) {
      console.error(e);
      const msg = e?.message?.includes("models") ? "Failed to load face detection models. Please refresh and try again." : `Analysis failed: ${e?.message || "Unknown error"}. Try a different photo with even lighting.`;
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
    setColors(null);
    setLoading(false);
    setStage(null);
    canvasRef.current = null;
  }, []);

  const meta = result ? SEASON_META[result.season] : null;

  const skinHex = colors ? `#${colors.skin.r.toString(16).padStart(2, "0")}${colors.skin.g.toString(16).padStart(2, "0")}${colors.skin.b.toString(16).padStart(2, "0")}` : null;
  const hairHex = colors ? `#${colors.hair.r.toString(16).padStart(2, "0")}${colors.hair.g.toString(16).padStart(2, "0")}${colors.hair.b.toString(16).padStart(2, "0")}` : null;
  const eyeHex = colors ? `#${colors.eyes.r.toString(16).padStart(2, "0")}${colors.eyes.g.toString(16).padStart(2, "0")}${colors.eyes.b.toString(16).padStart(2, "0")}` : null;

  const stageInfo = STAGE_META[stage];

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Seasonal Color Analysis</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a selfie to discover your personal color season based on your skin, hair, and eye color.
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
                    className="w-20 h-20 mx-auto rounded-full bg-(--primary)/10 flex items-center justify-center mb-4 text-4xl"
                  >
                    {meta.icon}
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    {result.season}
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
                      Seasonal Analysis
                    </span>
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <ScoreBar label="Season Match Score" score={result.score} />

                  <div className="rounded-lg bg-(--background) border border-(--border) p-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-(--primary) mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  {result.palette && result.palette.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-(--foreground) mb-3">Your Color Palette</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {result.palette.map((name, i) => {
                          const hex = typeof name === "object" ? name.hex : null;
                          const label = typeof name === "object" ? name.name : name;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="rounded-lg bg-(--background) border border-(--border) p-3 text-center"
                            >
                              {hex && (
                                <div
                                  className="w-8 h-8 rounded-lg border border-(--border) mx-auto mb-1.5"
                                  style={{ backgroundColor: hex }}
                                />
                              )}
                              {!hex && (
                                <div
                                  className="w-8 h-8 rounded-lg border border-(--border) mx-auto mb-1.5"
                                  style={{
                                    background: `linear-gradient(135deg, hsl(${i * 40}, 70%, 60%), hsl(${i * 40 + 30}, 65%, 45%))`,
                                  }}
                                />
                              )}
                              <p className="text-xs font-medium text-(--foreground) truncate">{label}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {colors && (
                    <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-(--border)/50 bg-(--card)/50">
                        <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Detected Colors</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {skinHex && <ColorSwatch hex={skinHex} name={`Skin (${colors.skin.r}, ${colors.skin.g}, ${colors.skin.b})`} size="sm" />}
                        {hairHex && <ColorSwatch hex={hairHex} name={`Hair (${colors.hair.r}, ${colors.hair.g}, ${colors.hair.b})`} size="sm" />}
                        {eyeHex && <ColorSwatch hex={eyeHex} name={`Eyes (${colors.eyes.r}, ${colors.eyes.g}, ${colors.eyes.b})`} size="sm" />}
                      </div>
                    </div>
                  )}
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
