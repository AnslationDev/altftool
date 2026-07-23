import React, { useState, useRef, useCallback, useEffect } from "react";
import JSZip from "jszip";
import Layout from "../components/Layout";
import { useImageCompression } from "../hooks/useImageCompression";
import { ImageProcessor } from "../utils/ImageProcessor";
import HowItWorks from "../components/HowItWorks";
import {
  Sparkles, UploadCloud, Trash2, ArrowLeft, Download,
  Settings, Image as ImageIcon, Sliders, CheckCircle2,
  FileImage, Compass, Info, Zap, Shield, RefreshCcw
} from "lucide-react";

const SAMPLES = [
  {
    id: "panda",
    name: "panda.jpg",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    desc: "Large photo",
    size: "2.8MB",
  },
  {
    id: "artwork",
    name: "artwork.jpg",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    desc: "Illustration artwork",
    size: "2.9MB",
  },
  {
    id: "screen",
    name: "device-screen.jpg",
    url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80",
    desc: "Device screen",
    size: "1.6MB",
  },
  {
    id: "icon",
    name: "vector-icon.jpg",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    desc: "Icon style graphic",
    size: "13KB",
  }
];

/* ─── Comparison Slider (Squoosh-style) ─── */
function ComparisonSlider({ originalUrl, compressedUrl }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      update(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [update]);

  const startDrag = (e) => {
    dragging.current = true;
    update(e.touches ? e.touches[0].clientX : e.clientX);
  };

  if (!originalUrl || !compressedUrl) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 cursor-ew-resize select-none"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {/* Right side (Compressed) */}
      <img
        src={compressedUrl}
        alt="Compressed"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      {/* Left side clip (Original) */}
      <div
        className="absolute inset-0 overflow-hidden border-r border-white/60 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt="Original"
          draggable={false}
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Slider Line & Handle */}
      <div
        className="absolute inset-y-0 z-10 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
        style={{ left: `${pos}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white border-2 border-teal-500 shadow-xl flex items-center justify-center pointer-events-none text-teal-600 transition-transform active:scale-95"
        style={{ left: `${pos}%` }}
      >
        <div className="flex gap-1">
          <span className="w-1.5 h-3 border-l-2 border-teal-500 rounded-sm"></span>
          <span className="w-1.5 h-3 border-l-2 border-teal-500 rounded-sm"></span>
        </div>
      </div>

      {/* Tags */}
      <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
        Original
      </span>
      <span className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-teal-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
        Compressed
      </span>
    </div>
  );
}

/* ─── Thumbnail Strip ─── */
function ThumbStrip({ images, activeIdx, results, onSelect, onRemove }) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2.5 px-1 scrollbar-thin">
      {images.map((img, i) => (
        <div
          key={i}
          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 shrink-0 hover:scale-105 ${activeIdx === i ? "border-teal-500 ring-4 ring-teal-500/15" : "border-slate-200 hover:border-slate-300"}`}
          onClick={() => onSelect(i)}
        >
          <img src={img.preview} alt="" draggable={false} className="w-full h-full object-cover" />
          <button
            className="absolute top-1 right-1 w-5 h-5 rounded-md bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-rose-400"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
          >
            <span className="text-xs font-bold leading-none">×</span>
          </button>
          {results[i] && (
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ImageCompressorPage() {
  const {
    images, activeIdx, results, settings, isCompressing, error, stats,
    addFiles, removeImage, selectImage, updateSettings, compressOne,
    compressAll, resetAll,
  } = useImageCompression();

  const inputRef = useRef(null);
  const [viewMode, setViewMode] = useState("compare");
  const [loadingSample, setLoadingSample] = useState(false);

  const activeImage = activeIdx !== null ? images[activeIdx] : null;
  const activeResult = activeIdx !== null ? results[activeIdx] : null;
  const allDone = images.length > 0 && images.every((_, i) => results[i]);
  const completedCount = Object.values(results).filter(Boolean).length;
  const processingStatus = error
    ? `Compression error: ${error}`
    : isCompressing
      ? "Compressing images..."
      : completedCount > 0
        ? `Compressed image ready. Output: ${completedCount} of ${images.length} ${images.length === 1 ? "image" : "images"}.`
        : images.length > 0
          ? `Ready: ${images.length} ${images.length === 1 ? "image" : "images"} selected.`
          : "Ready: choose one or more images.";

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  }, [addFiles]);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
    e.target.value = "";
  };

  const loadSample = async (url, filename) => {
    setLoadingSample(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/jpeg" });
      addFiles([file]);
    } catch (err) {
      console.error("Failed to load sample image", err);
    } finally {
      setLoadingSample(false);
    }
  };

  const downloadImage = (idx) => {
    const r = results[idx];
    const img = images[idx];
    if (!r || !img) return;
    const a = document.createElement("a");
    a.href = r.url;
    const ext = settings.format === "jpeg" ? "jpg" : settings.format;
    a.download = `${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const ext = settings.format === "jpeg" ? "jpg" : settings.format;
    Object.keys(results).forEach(i => {
      const r = results[i];
      const img = images[parseInt(i)];
      zip.file(`${img.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`, r.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "compressed_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <div className="relative mx-auto w-full max-w-6xl my-4 font-sans text-slate-800 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500"></div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-7 mb-7 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/80 shadow-sm">
                <Compass className="w-7 h-7 text-teal-600 animate-spin-slow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Compression workspace</h2>
                  <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                    100% Free
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Ultra-fast, browser-only image optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { icon: Shield, label: "Private", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { icon: Zap, label: "No Upload", color: "text-amber-600 bg-amber-50 border-amber-100" },
                { icon: FileImage, label: "8 Formats", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border ${color}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </div>
              ))}
              {images.length > 0 && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          <p
            className="mb-5 rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs font-medium text-muted-foreground"
            data-testid="tool-output"
            role="status"
            aria-live="polite"
          >
            {processingStatus}
          </p>

          {/* ── EMPTY STATE (Squoosh-Style Landing) ── */}
          {images.length === 0 && (
            <div
              className="relative -mx-6 md:-mx-8 overflow-hidden cursor-pointer animate-in fade-in duration-500"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => inputRef.current?.click()}
            >
              {/* Transparent checkered background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
                  backgroundColor: "#f9fafb",
                }}
              />

              {/* Floating Dots */}
              {[
                { size: 12, top: "8%",  left: "5%",  opacity: 0.6, delay: "0s" },
                { size: 7,  top: "22%", left: "2%",  opacity: 0.4, delay: "0.3s" },
                { size: 18, top: "55%", left: "6%",  opacity: 0.5, delay: "0.8s" },
                { size: 8,  top: "15%", left: "16%", opacity: 0.35, delay: "0.5s" },
                { size: 52, top: "5%",  left: "78%", opacity: 0.55, delay: "0.2s" },
                { size: 9,  top: "30%", right: "6%", opacity: 0.4, delay: "0.6s" },
                { size: 13, top: "60%", right: "3%", opacity: 0.5, delay: "0.1s" },
                { size: 7,  top: "48%", right: "14%",opacity: 0.3, delay: "0.9s" },
              ].map((d, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-float pointer-events-none"
                  style={{
                    width: d.size,
                    height: d.size,
                    top: d.top,
                    left: d.left,
                    right: d.right,
                    opacity: d.opacity,
                    backgroundColor: "#f43f7e",
                    animationDelay: d.delay,
                    animationDuration: `${3 + i * 0.4}s`,
                  }}
                />
              ))}

              {/* Main Blob Drop Target */}
              <div className="relative z-10 flex flex-col items-center justify-center pt-20 pb-36 text-center">
                {/* Large overlapping blobs */}
                <div className="relative flex items-center justify-center w-72 h-72 mb-6">
                  <div
                    className="absolute w-56 h-56 rounded-full opacity-30 animate-float"
                    style={{ background: "radial-gradient(circle, #f472b6, #ec4899)", animationDuration: "4s" }}
                  />
                  <div
                    className="absolute w-64 h-64 rounded-full opacity-25 animate-float"
                    style={{
                      background: "radial-gradient(circle, #fb7185, #f43f5e)",
                      animationDuration: "5s",
                      animationDelay: "0.5s",
                      transform: "translate(16px, -10px)",
                    }}
                  />
                  {/* Inner clickable area */}
                  <div className="relative z-10 flex flex-col items-center gap-3 p-8 rounded-full bg-rose-400/80 hover:bg-rose-400 shadow-2xl hover:shadow-rose-400/40 w-52 h-52 items-center justify-center transition-all duration-300 group">
                    <svg
                      className="w-10 h-10 text-white opacity-90 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                      <line x1="12" y1="5" x2="12" y2="5.01" />
                      <line x1="15" y1="3" x2="15" y2="5" />
                      <line x1="15" y1="3" x2="17" y2="3" />
                    </svg>
                    <p className="text-white text-[13px] font-bold leading-snug">
                      Drop{" "}
                      <span className="italic font-black">OR</span>{" "}
                      <span className="underline underline-offset-2 cursor-pointer">Paste</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Wave Divider */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20">
                <svg
                  viewBox="0 0 1440 180"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  className="w-full block"
                  style={{ height: 130 }}
                >
                  <path
                    d="M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,180 L0,180 Z"
                    fill="#3b82f6"
                  />
                  <path
                    d="M0,110 C200,160 480,60 720,110 C960,160 1200,60 1440,110 L1440,180 L0,180 Z"
                    fill="#2563eb"
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* Blue Bottom Bar — sample images */}
              <div
                className="relative z-10 w-full flex flex-col items-center pt-8 pb-10 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, #3b82f6 0%, #2563eb 100%)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-white/80 text-sm font-semibold mb-6">
                  Or <strong className="text-white font-black">try one</strong> of these:
                </p>
                <div className="flex items-end gap-8 pointer-events-auto">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      disabled={loadingSample}
                      onClick={(e) => { e.stopPropagation(); loadSample(sample.url, sample.name); }}
                      className="group flex flex-col items-center gap-2 disabled:opacity-50 hover:-translate-y-2 transition-transform duration-300"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20 shadow-xl ring-4 ring-white/5 group-hover:ring-white/30 transition-all duration-300">
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="text-[11px] font-black text-white/70 group-hover:text-white tracking-wide transition-colors">
                        {sample.size || "~2MB"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            data-testid="image-compressor-file-input"
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileInput}
          />

          {/* ── WORKSPACE ── */}
          {images.length > 0 && (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in duration-300">

              {/* Left Column: Visual Viewport */}
              <div className="space-y-6">
                {/* Thumb strip for batch processing */}
                {images.length > 1 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Batch Thumbnails ({images.length})</div>
                    <ThumbStrip images={images} activeIdx={activeIdx} results={results} onSelect={selectImage} onRemove={removeImage} />
                  </div>
                )}

                {activeImage ? (
                  <div className="space-y-4">
                    {/* View Controls & Info */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      {/* Compare Tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                        {["compare", "original", "compressed"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === mode ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {/* Original metadata quick chip */}
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{activeImage.name}</span>
                        <span className="text-slate-300">|</span>
                        <span>{ImageProcessor.formatFileSize(activeImage.size)}</span>
                      </div>
                    </div>

                    {/* Image Viewport */}
                    <div className="relative border border-slate-200/60 rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[300px] max-h-[480px]">
                      {viewMode === "compare" && activeResult ? (
                        <ComparisonSlider originalUrl={activeImage.preview} compressedUrl={activeResult.url} />
                      ) : viewMode === "compressed" && activeResult ? (
                        <img src={activeResult.url} alt="Compressed" className="max-h-[440px] w-auto object-contain rounded-xl" />
                      ) : (
                        <img src={activeImage.preview} alt="Original" className="max-h-[440px] w-auto object-contain rounded-xl" />
                      )}
                    </div>

                    {/* Stats comparison strip */}
                    {activeResult && (
                      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                        <div className="flex gap-4 items-center">
                          <div className="text-xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Before</span>
                            <span className="font-mono font-bold text-slate-600">{ImageProcessor.formatFileSize(activeImage.size)}</span>
                          </div>
                          <div className="text-slate-300 font-extralight text-lg">→</div>
                          <div className="text-xs">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">After</span>
                            <span className="font-mono font-black text-slate-900">{ImageProcessor.formatFileSize(activeResult.size)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Savings</span>
                          <span className={`text-lg font-black tracking-tight ${activeResult.ratio > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {activeResult.ratio > 0 ? `-${activeResult.ratio}%` : `+${Math.abs(activeResult.ratio)}%`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
                    Select an image to preview
                  </div>
                )}
              </div>

              {/* Right Column: Squoosh Settings Panel */}
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6 sticky top-6">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-teal-600" /> Compression Settings
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/60 px-2 py-0.5 rounded">Standard</span>
                  </div>

                  {/* Format Grid */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Export Format</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["webp", "jpeg", "png", "avif", "gif", "bmp", "ico", "tiff"].map((f) => (
                        <button
                          key={f}
                          onClick={() => updateSettings({ format: f })}
                          className={`py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider transition-all ${settings.format === f ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-600/20" : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Slider */}
                  {settings.format !== "png" && (
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quality</label>
                        <span className="text-sm font-black text-teal-600">{settings.quality}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={settings.quality}
                          onChange={(e) => updateSettings({ quality: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resize Section */}
                  <div className="border-t border-slate-200/60 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Resize Image</label>
                      <button
                        onClick={() => updateSettings({ resizeEnabled: !settings.resizeEnabled })}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all ${settings.resizeEnabled ? "bg-teal-50 border-teal-300 text-teal-700 shadow-sm" : "border-slate-200 text-slate-400 bg-white"}`}
                      >
                        {settings.resizeEnabled ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                    {settings.resizeEnabled && (
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Max Width</span>
                          <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none"
                            value={settings.maxWidth}
                            onChange={e => updateSettings({ maxWidth: parseInt(e.target.value) || 100 })}
                          />
                        </div>
                        <span className="text-slate-300 font-bold px-1 mt-4">×</span>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Max Height</span>
                          <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none"
                            value={settings.maxHeight}
                            onChange={e => updateSettings({ maxHeight: parseInt(e.target.value) || 100 })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compressor Actions */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/60">
                    {/* Compress individual trigger */}
                    {!activeResult ? (
                      <button
                        disabled={isCompressing}
                        onClick={() => compressOne(activeIdx)}
                        className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" /> {isCompressing ? "Compressing..." : "Compress Image"}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(activeIdx)}
                          className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button
                          onClick={() => compressOne(activeIdx)}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                          title="Re-compress with updated settings"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Batch compress all */}
                    {images.length > 1 && (
                      <button
                        disabled={isCompressing}
                        onClick={compressAll}
                        className="w-full py-2.5 rounded-xl border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 font-bold text-xs uppercase tracking-wider hover:bg-indigo-50/50 transition-all"
                      >
                        {isCompressing ? "Compressing Batch..." : `Compress All (${images.length})`}
                      </button>
                    )}

                    {/* Batch download all */}
                    {allDone && (
                      <button
                        onClick={downloadAll}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Download Batch (.ZIP)
                      </button>
                    )}
                  </div>

                  {/* Cumulative stats block */}
                  {stats && (
                    <div className="bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-sans mb-1">Batch Report</div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Original</span>
                        <span className="font-semibold text-slate-700">{ImageProcessor.formatFileSize(stats.original)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Compressed</span>
                        <span className="font-semibold text-slate-700">{ImageProcessor.formatFileSize(stats.compressed)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                        <span className="font-bold text-slate-900 font-sans">Total Saved</span>
                        <span className="font-black text-emerald-600">{stats.percentage}%</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-200/60 pt-3">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your images never leave your device.</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Static educational guides below */}
      <div className="mx-auto w-full max-w-6xl mt-8">
        <HowItWorks />
      </div>
    </Layout>
  );
}
