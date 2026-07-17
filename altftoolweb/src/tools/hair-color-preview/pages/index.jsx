"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, RotateCcw, Download, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { HAIR_COLORS, applyHairColor, hexToRgb, initImageSegmenter } from "@/tools/_shared/beauty/utils/hairPreview";
import BeautyUploader from "@/tools/_shared/beauty/components/BeautyUploader";
import BeforeAfterSlider from "@/tools/_shared/components/BeforeAfterSlider";

const CATEGORIES = ["Natural", "Warm", "Blonde", "Fashion", "Highlight"];

export default function HairColorPreview() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(Object.fromEntries(CATEGORIES.map((c) => [c, true])));
  const originalCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const groupedColors = useMemo(() => {
    const groups = {};
    for (const cat of CATEGORIES) groups[cat] = HAIR_COLORS.filter((c) => c.category === cat);
    return groups;
  }, []);

  const handleImage = useCallback(async ({ src, img }) => {
    setError(null);
    setSelectedColor(null);
    setPreviewCanvas(null);
    setImage({ src, img });
    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      originalCanvasRef.current = canvas;
      
      // Pre-load the AI Segmenter in the background
      await initImageSegmenter();
    } catch {
      setError("Failed to process image or load AI models.");
      toast.error("Image processing failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleColorSelect = useCallback(async (color) => {
    if (!originalCanvasRef.current) return;
    setProcessing(true);
    setSelectedColor(color);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = originalCanvasRef.current.width;
      canvas.height = originalCanvasRef.current.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(originalCanvasRef.current, 0, 0);
      await applyHairColor(canvas, color.hex, 0.7);
      previewCanvasRef.current = canvas;
      setPreviewCanvas(canvas);
      toast.success(`Applied: ${color.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply color");
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedColor(null);
    setPreviewCanvas(null);
    previewCanvasRef.current = null;
    toast.success("Preview reset");
  }, []);

  const handleDownload = useCallback(() => {
    if (!previewCanvasRef.current) return;
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to generate download");
        return;
      }
      const name = selectedColor ? selectedColor.name.replace(/\s+/g, "-").toLowerCase() : "hair-preview";
      saveAs(blob, `${name}.png`);
      toast.success("Image downloaded");
    }, "image/png");
  }, [selectedColor]);

  const toggleCategory = useCallback((cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Hair Color Preview</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload a photo and try on 30+ hair colors from natural to bold fashion shades.
          </p>
        </div>

        <div className="space-y-6">
          {!image && !loading && (
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
                <Sparkles className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error</p>
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
                <p className="text-(--foreground) font-semibold">Processing image...</p>
                <p className="text-sm text-(--muted-foreground) mt-1">Preparing for color preview</p>
              </div>
            </motion.div>
          )}

          {image && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden"
                >
                  {selectedColor && previewCanvas ? (
                    <div>
                      <BeforeAfterSlider beforeImage={image.src} afterCanvas={previewCanvas} className="max-h-[500px]" />
                      <div className="px-4 py-2.5 border-t border-(--border)/50 bg-(--background)/80 flex items-center justify-between">
                        <span className="text-xs font-medium text-(--foreground)">
                          Color: <span className="text-(--primary) font-semibold">{selectedColor.name}</span>
                        </span>
                        <span className="text-[10px] text-(--muted-foreground) font-mono">{selectedColor.hex}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={image.src} alt="Uploaded" className="w-full h-auto object-contain max-h-[500px]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <div className="px-5 py-3 rounded-xl bg-black/50 backdrop-blur-md text-white text-sm font-medium">
                          Select a color below to preview
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {selectedColor && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-(--border) bg-(--card) text-(--foreground) font-medium hover:bg-(--background) transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--primary) text-white font-medium hover:brightness-110 transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </motion.button>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-3">
                <div className="rounded-xl border border-(--border) bg-(--card) shadow-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-(--border)/50 bg-gradient-to-r from-(--primary)/5 to-cyan-400/5 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-(--primary)" />
                    <span className="text-sm font-semibold text-(--foreground)">Color Palette</span>
                  </div>
                  <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                    {CATEGORIES.map((cat) => {
                      const colors = groupedColors[cat];
                      const isExpanded = expandedCategories[cat];
                      return (
                        <div key={cat} className="rounded-lg border border-(--border)/50 overflow-hidden">
                          <button
                            onClick={() => toggleCategory(cat)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-(--background)/50 hover:bg-(--background) transition-colors text-sm font-semibold text-(--foreground)"
                          >
                            <span>{cat}</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-(--muted-foreground)" /> : <ChevronRight className="w-3.5 h-3.5 text-(--muted-foreground)" />}
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 p-2">
                                  {colors.map((color) => (
                                    <motion.button
                                      key={color.hex}
                                      whileHover={{ scale: 1.15, zIndex: 10 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleColorSelect(color)}
                                      title={color.name}
                                      className={`relative w-full aspect-square rounded-lg border-2 transition-all cursor-pointer ${
                                        selectedColor?.hex === color.hex
                                          ? "border-(--primary) ring-2 ring-(--primary)/30 scale-110 z-10"
                                          : "border-(--border) hover:border-(--primary)/50"
                                      }`}
                                      style={{ backgroundColor: color.hex }}
                                    >
                                      {processing && selectedColor?.hex === color.hex && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                      )}
                                    </motion.button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedColor && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-(--border) bg-(--card) shadow-md p-4 text-center"
                  >
                    <div
                      className="w-10 h-10 rounded-xl border border-(--border) mx-auto mb-2"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <p className="text-sm font-semibold text-(--foreground)">{selectedColor.name}</p>
                    <p className="text-[10px] text-(--muted-foreground) font-mono">{selectedColor.hex}</p>
                    <p className="text-xs text-(--muted-foreground) mt-1 capitalize">{selectedColor.category}</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
