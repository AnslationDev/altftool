"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Instagram, Upload, Download, RotateCcw, ImagePlus, X } from "lucide-react";
import { Button } from "@altftool/ui";

const CANVAS_SIZE = 1080; // High resolution for Instagram DP

const BORDERS = [
  { id: "none", label: "None", width: 0, gradient: [] },
  { id: "ig-classic", label: "IG Classic", width: 30, gradient: ["#f09433", "#e6683c", "#dc2743", "#cc2366", "#bc1888"] },
  { id: "neon", label: "Neon Pink", width: 30, gradient: ["#ff00ff", "#00ffff"] },
  { id: "gold", label: "Gold", width: 30, gradient: ["#FFD700", "#FDB931"] },
  { id: "dark", label: "Dark", width: 30, gradient: ["#111", "#333"] },
  { id: "white", label: "White", width: 30, gradient: ["#fff", "#eee"] },
];

const FILTERS = [
  { id: "normal", label: "Normal", filter: "none" },
  { id: "clarendon", label: "Clarendon", filter: "contrast(1.2) saturate(1.35)" },
  { id: "gingham", label: "Gingham", filter: "brightness(1.05) hue-rotate(-10deg)" },
  { id: "moon", label: "Moon", filter: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { id: "lark", label: "Lark", filter: "contrast(0.9) saturate(1.1)" },
  { id: "reyes", label: "Reyes", filter: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" },
  { id: "juno", label: "Juno", filter: "saturate(1.3) contrast(1.1) sepia(0.2)" },
  { id: "crema", label: "Crema", filter: "sepia(0.5) contrast(0.9) brightness(1.1)" },
];

export default function InstagramDPEnhancer() {
  const [imageUrl, setImageUrl] = useState(null);
  const [border, setBorder] = useState("ig-classic");
  const [selectedFilter, setSelectedFilter] = useState("normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBorder("ig-classic");
    setSelectedFilter("normal");
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleRemove = () => {
    setImageUrl(null);
    handleReset();
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Clear background
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw background circle for transparency support
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, Math.PI * 2);
    ctx.clip();

    // Apply filters
    const baseFilter = FILTERS.find(f => f.id === selectedFilter)?.filter || "none";
    const adjustmentFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.filter = baseFilter === "none" ? adjustmentFilter : `${baseFilter} ${adjustmentFilter}`;

    // Draw Image
    const scale = zoom / 100;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (imgAspect > 1) {
      drawH = CANVAS_SIZE * scale;
      drawW = drawH * imgAspect;
    } else {
      drawW = CANVAS_SIZE * scale;
      drawH = drawW / imgAspect;
    }
    
    // Adjust offset relative to canvas size
    const adjustedOffsetX = (offsetX / 100) * CANVAS_SIZE;
    const adjustedOffsetY = (offsetY / 100) * CANVAS_SIZE;
    
    const drawX = (CANVAS_SIZE - drawW) / 2 + adjustedOffsetX;
    const drawY = (CANVAS_SIZE - drawH) / 2 + adjustedOffsetY;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore(); // Restore from clip

    // Draw Border
    const borderObj = BORDERS.find((b) => b.id === border);
    if (borderObj && borderObj.width > 0) {
      // White gap (inner border)
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2 - borderObj.width - 10, 0, Math.PI * 2);
      ctx.lineWidth = 15; // Inner white gap width
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Outer colorful border
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2 - borderObj.width/2, 0, Math.PI * 2);
      ctx.lineWidth = borderObj.width;
      
      if (borderObj.gradient.length > 1) {
         let grad = ctx.createLinearGradient(0, CANVAS_SIZE, CANVAS_SIZE, 0); // Bottom-left to top-right
         borderObj.gradient.forEach((color, i) => {
            grad.addColorStop(i / (borderObj.gradient.length - 1), color);
         });
         ctx.strokeStyle = grad;
      } else if (borderObj.gradient.length === 1) {
         ctx.strokeStyle = borderObj.gradient[0];
      }
      ctx.stroke();
    }
  }, [imageUrl, border, selectedFilter, brightness, contrast, saturation, zoom, offsetX, offsetY]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imgRef.current) drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "instagram-dp-enhanced.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Instagram className="h-4 w-4" />
            Social Media
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Instagram className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Instagram DP Enhancer
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Create an eye-catching Instagram display picture with gradient rings, filters, and perfect circular cropping.
          </p>
        </section>

        {/* Main Content */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Canvas Preview */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Preview</p>
                <h2 className="mt-1 text-xl font-semibold">1080 × 1080px (HD)</h2>
              </div>
              {imageUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              )}
            </div>

            {!imageUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted)]/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Upload className="h-12 w-12 text-[var(--muted-foreground)] opacity-50 mb-4" />
                <p className="text-[var(--muted-foreground)] font-medium">
                  Drop your photo here or click to upload
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Supports JPG, PNG, WebP
                </p>
              </div>
            ) : (
              <div className="relative group w-full max-w-[400px] mx-auto">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-full shadow-lg border-4 border-[var(--background)] bg-transparent"
                  style={{ aspectRatio: "1/1" }}
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <aside className="space-y-4">
            {/* Upload another */}
            {imageUrl && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <ImagePlus className="h-4 w-4" /> Change Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            )}

            {/* Border Ring */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Story Ring</p>
              <div className="grid grid-cols-3 gap-2">
                {BORDERS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBorder(b.id)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                      border === b.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Insta Filters */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Filters</p>
              <div className="grid grid-cols-4 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`rounded-lg border px-1 py-2 text-[11px] font-semibold transition-all text-center ${
                      selectedFilter === f.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom & Position */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Zoom & Position</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>Zoom</span><span>{zoom}%</span>
                  </div>
                  <input type="range" min="50" max="250" value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>X Offset</span><span>{offsetX}</span>
                  </div>
                  <input type="range" min="-100" max="100" value={offsetX} onChange={(e) => setOffsetX(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>Y Offset</span><span>{offsetY}</span>
                  </div>
                  <input type="range" min="-100" max="100" value={offsetY} onChange={(e) => setOffsetY(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
              </div>
            </div>

            {/* Adjustments */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Adjustments</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>Brightness</span><span>{brightness}%</span>
                  </div>
                  <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>Contrast</span><span>{contrast}%</span>
                  </div>
                  <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-1">
                    <span>Saturation</span><span>{saturation}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(+e.target.value)} className="w-full accent-[var(--primary)]" />
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
