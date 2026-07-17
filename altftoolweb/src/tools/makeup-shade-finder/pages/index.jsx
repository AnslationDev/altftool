"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Droplet, Heart, Eye, Smile, Sun, AlertCircle, RefreshCw, Sparkles, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as faceapi from "@vladmandic/face-api";
import { sampleSkinFromFaceRegion, sampleCheeks, averageColor, analyzeUndertoneFromMultiRegion, getSkinDepth, sampleSkinWithAI } from "@/tools/_shared/beauty/utils/colorAnalysis";
import { extractFaceBox } from "@/tools/_shared/beauty/utils/faceAnalysis";
import { initImageSegmenter } from "@/tools/_shared/beauty/utils/hairPreview";
import { MAKEUP_CATEGORIES, generateShadeRecommendations } from "@/tools/_shared/beauty/utils/makeupFinder";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import { ScoreBar, ColorSwatch } from "@/tools/_shared/beauty/components/ResultCard";

const CATEGORY_ICONS = {
  foundation: Droplet,
  concealer: Eye,
  blush: Heart,
  lipstick: Smile,
  eyeshadow: Eye,
  bronzer: Sun,
};

const STAGE_META = {
  "loading-models": { label: "Loading face detection models...", sub: "Downloading AI models for facial analysis" },
  detecting: { label: "Detecting face...", sub: "Scanning for facial landmarks" },
  sampling: { label: "Sampling skin regions...", sub: "Extracting color data from face area" },
  analyzing: { label: "Finding your shades...", sub: "Matching products to your skin tone" },
};

export default function MakeupShadeFinder() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [skinColor, setSkinColor] = useState(null);
  const [undertoneInfo, setUndertoneInfo] = useState(null);
  const [skinDepth, setSkinDepth] = useState(null);
  const [openSection, setOpenSection] = useState("foundation");
  const canvasRef = useRef(null);
  const modelsLoaded = useRef(false);

  const ensureModels = useCallback(async () => {
    if (modelsLoaded.current) return;
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await initImageSegmenter();
    modelsLoaded.current = true;
  }, []);

  const handleImage = useCallback(async ({ src, img }) => {
    setError(null);
    setResult(null);
    setSkinColor(null);
    setUndertoneInfo(null);
    setSkinDepth(null);
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
      
      let skinSamples = [];
      let cheekSamples = [];
      
      try {
        const segmenter = await initImageSegmenter();
        const result = segmenter.segment(img);
        const categoryMask = result.categoryMask.getAsUint8Array();
        skinSamples = sampleSkinWithAI(imageData, categoryMask);
      } catch (err) {
        console.warn("AI Segmentation failed, falling back to basic bounds", err);
      }

      if (skinSamples.length < 50) {
        skinSamples = sampleSkinFromFaceRegion(imageData, faceBox);
        cheekSamples = sampleCheeks(imageData, faceBox);
      }

      if (skinSamples.length < 10) {
        setError("Could not sample enough skin pixels. Try a closer, well-lit photo.");
        toast.error("Insufficient skin sample");
        setLoading(false);
        setStage(null);
        return;
      }

      setStage("analyzing");
      // Use pure skin samples if available; cheekSamples fallback if needed
      const avg = averageColor(skinSamples.length > 10 ? skinSamples : cheekSamples);
      setSkinColor(avg);

      const undertoneResult = analyzeUndertoneFromMultiRegion(skinSamples, cheekSamples.length > 10 ? cheekSamples : []);
      if (!undertoneResult) {
        setError("Unable to analyze undertone. Try a different photo.");
        toast.error("Undertone analysis failed");
        setLoading(false);
        setStage(null);
        return;
      }
      setUndertoneInfo(undertoneResult);

      const luminance = 0.299 * avg.r + 0.587 * avg.g + 0.114 * avg.b;
      const depth = getSkinDepth(luminance);
      setSkinDepth(depth);

      const recommendations = generateShadeRecommendations(avg, undertoneResult.undertone, depth);
      setResult(recommendations);
      toast.success(`Found ${undertoneResult.undertone} undertone — ${depth} skin`);
    } catch (e) {
      console.error(e);
      const msg = e?.message?.includes("models") ? "Failed to load face detection models. Please refresh and try again." : `Analysis failed: ${e?.message || "Unknown error"}. Try a clearer image.`;
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
    setUndertoneInfo(null);
    setSkinDepth(null);
    setLoading(false);
    setStage(null);
    setOpenSection("foundation");
    canvasRef.current = null;
  }, []);

  const toggleSection = (id) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const skinDisplayColor = skinColor
    ? `rgb(${skinColor.r}, ${skinColor.g}, ${skinColor.b})`
    : "var(--border)";

  const stageInfo = STAGE_META[stage];

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Makeup Shade Finder</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a selfie to discover personalized makeup shades that complement your skin tone and undertone.
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
                <div className="bg-gradient-to-r from-(--primary)/10 to-cyan-400/10 dark:from-(--primary)/5 dark:to-cyan-400/5 p-6 md:p-8 text-center relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 overflow-hidden ring-4 ring-(--border)"
                    style={{ backgroundColor: skinDisplayColor }}
                  >
                    <Palette className="w-10 h-10 text-white drop-shadow-lg" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2"
                  >
                    {undertoneInfo?.undertone} &bull; {skinDepth}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 flex-wrap"
                  >
                    {undertoneInfo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--primary)/10 text-(--primary)">
                        <Sparkles className="w-3 h-3" />
                        {undertoneInfo.undertone} Undertone
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                      <Sun className="w-3 h-3" />
                      {skinDepth} Skin
                    </span>
                  </motion.div>
                  {undertoneInfo && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-(--muted-foreground) mt-3 max-w-lg mx-auto"
                    >
                      {undertoneInfo.description}
                    </motion.p>
                  )}
                </div>

                <div className="p-6 md:p-8 space-y-4">
                  <ScoreBar label="Undertone Match" score={undertoneInfo?.score || 0} />

                  <div className="space-y-3">
                    {MAKEUP_CATEGORIES.map((category, ci) => {
                      const catResult = result[category.id];
                      if (!catResult) return null;
                      const isOpen = openSection === category.id;
                      const Icon = CATEGORY_ICONS[category.id] || Palette;
                      const shades = catResult.shades;
                      const singleShade = !shades && catResult.shade;

                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ci * 0.05 }}
                          className="rounded-lg border border-(--border) bg-(--background) overflow-hidden"
                        >
                          <button
                            onClick={() => toggleSection(category.id)}
                            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-(--card)/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-(--primary)/10 flex items-center justify-center">
                                <Icon className="w-4.5 h-4.5 text-(--primary)" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-(--foreground)">{category.name}</p>
                                <p className="text-[11px] text-(--muted-foreground)">{category.description}</p>
                              </div>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-(--muted-foreground)" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-(--muted-foreground)" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-(--border)/50 pt-3 space-y-3">
                                  {singleShade && (
                                    <ColorSwatch
                                      hex={catResult.hex || "#888"}
                                      name={catResult.shade}
                                      size="lg"
                                    />
                                  )}
                                  {singleShade && catResult.brand && (
                                    <p className="text-xs text-(--muted-foreground)">
                                      Brand: <span className="font-medium text-(--foreground)">{catResult.brand}</span>
                                    </p>
                                  )}
                                  {shades && shades.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {shades.map((shade, si) => (
                                        <div
                                          key={si}
                                          className="flex items-center gap-3 p-2.5 rounded-lg bg-(--card)/50 border border-(--border)/50"
                                        >
                                          <div
                                            className="w-8 h-8 rounded-lg border border-(--border) flex-shrink-0"
                                            style={{ backgroundColor: shade.hex }}
                                          />
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-(--foreground) truncate">{shade.name}</p>
                                            <p className="text-[10px] text-(--muted-foreground) font-mono">{shade.hex}</p>
                                            {shade.desc && (
                                              <p className="text-[11px] text-(--muted-foreground) mt-0.5 leading-tight">{shade.desc}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {catResult.notes && (
                                    <p className="text-xs text-(--muted-foreground) italic pt-1 border-t border-(--border)/30">{catResult.notes}</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
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
