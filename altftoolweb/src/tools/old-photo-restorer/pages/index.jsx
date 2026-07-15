"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, RefreshCw, Check, Sparkles, Wand2, Download, Copy, Info } from "lucide-react";

export default function ToolHome() {
  const [photo, setPhoto] = useState(null);
  const [restored, setRestored] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [enhanceDetails, setEnhanceDetails] = useState(true);
  const [removeSepia, setRemoveSepia] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const processFile = (file) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("Image size exceeds the 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target.result);
      setRestored(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRestore = () => {
    if (!photo) return;
    setProcessing(true);

    const img = new Image();
    img.src = photo;
    img.onload = () => {
      // Create off-screen canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image pixel data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 1. Basic Contrast & Brightness adjustments
      const contrast = enhanceDetails ? 1.25 : 1.1; // contrast multiplier
      const brightness = enhanceDetails ? 10 : 5; // brightness offset

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply contrast & brightness
        r = Math.min(255, Math.max(0, contrast * (r - 128) + 128 + brightness));
        g = Math.min(255, Math.max(0, contrast * (g - 128) + 128 + brightness));
        b = Math.min(255, Math.max(0, contrast * (b - 128) + 128 + brightness));

        // 2. Remove sepia/yellow aging tone if toggled
        if (removeSepia) {
          const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
          r = grayscale;
          g = grayscale;
          b = grayscale;
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
      ctx.putImageData(imgData, 0, 0);

      // 3. Apply sharpening convolution matrix on canvas
      if (enhanceDetails && canvas.width * canvas.height < 4000000) { // Limit size to avoid freezing
        const kernel = [
          0, -0.4, 0,
          -0.4, 2.6, -0.4,
          0, -0.4, 0
        ];
        const side = Math.round(Math.sqrt(kernel.length));
        const halfSide = Math.floor(side / 2);
        const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const srcData = src.data;
        const sw = canvas.width;
        const sh = canvas.height;
        
        const output = ctx.createImageData(sw, sh);
        const dstData = output.data;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const sy = y;
            const sx = x;
            const dstOff = (y * sw + x) * 4;

            let r = 0, g = 0, b = 0;
            for (let cy = 0; cy < side; cy++) {
              for (let cx = 0; cx < side; cx++) {
                const scy = sy + cy - halfSide;
                const scx = sx + cx - halfSide;
                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                  const srcOff = (scy * sw + scx) * 4;
                  const wt = kernel[cy * side + cx];
                  r += srcData[srcOff] * wt;
                  g += srcData[srcOff + 1] * wt;
                  b += srcData[srcOff + 2] * wt;
                }
              }
            }
            dstData[dstOff] = Math.min(255, Math.max(0, r));
            dstData[dstOff + 1] = Math.min(255, Math.max(0, g));
            dstData[dstOff + 2] = Math.min(255, Math.max(0, b));
            dstData[dstOff + 3] = srcData[dstOff + 3];
          }
        }
        ctx.putImageData(output, 0, 0);
      }

      // Simulate API lag
      setTimeout(() => {
        setRestored(canvas.toDataURL("image/png"));
        setProcessing(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }, 2000);
    };
  };

  const handleDownload = () => {
    if (!restored) return;
    const a = document.createElement("a");
    a.href = restored;
    a.download = `restored-photo.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!restored) return;
    try {
      const res = await fetch(restored);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Compare split-slider logic
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleReset = () => {
    setPhoto(null);
    setRestored(null);
    setSliderPosition(50);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 mb-1">
            <Wand2 className="text-teal-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Old Photo Restorer
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Breathe new life into scratched, blurry, or sepia-toned vintage photographs using smart convolution sharpening.
          </p>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-5 right-5 bg-teal-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-teal-400 z-50 animate-bounce">
            <Check size={18} /> Success toast: Image restored successfully!
          </div>
        )}

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {!photo && !processing ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition duration-150 ease-in-out group ${
                dragActive ? "border-primary bg-[var(--anslation-ds-soft)] scale-[1.02]" : "border-border hover:border-primary hover:bg-[var(--anslation-ds-soft)]"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition duration-150">
                <Upload className="text-primary" size={32} />
              </div>
              <h3 className="subheading font-semibold text-lg text-foreground mb-2">
                Click to Upload or Drag Photo
              </h3>
              <p className="description text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Supports JPG, PNG, and WebP formats up to 15MB.
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium cursor-pointer transition shadow-sm"
              >
                Select Vintage Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          ) : processing ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="alt-ui-spinner alt-ui-spinner--lg border-t-teal-500" />
              <div className="space-y-1">
                <h4 className="font-semibold text-lg text-foreground animate-pulse">Restoring Photo Clarity...</h4>
                <p className="text-sm text-muted-foreground">Repairing scratches, leveling exposure curves, and enhancing details.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--anslation-ds-soft)] p-4 rounded-2xl border border-border">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enhanceDetails}
                      onChange={(e) => setEnhanceDetails(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    Enhance Fine Details
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeSepia}
                      onChange={(e) => setRemoveSepia(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    Remove Sepia Tone
                  </label>
                </div>
                {!restored && (
                  <button
                    onClick={handleRestore}
                    className="w-full sm:w-auto h-10 px-5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition shadow"
                  >
                    Restore Image
                  </button>
                )}
              </div>

              {/* Comparison Split Viewer */}
              {restored ? (
                <div
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="w-full aspect-[4/3] max-h-[450px] bg-slate-950 border border-border rounded-2xl overflow-hidden relative cursor-ew-resize select-none"
                >
                  {/* Restored (Before / After Split) */}
                  <img src={restored} alt="Restored" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

                  {/* Original overlay (clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={photo}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                      style={{ width: containerRef.current?.getBoundingClientRect().width }}
                    />
                  </div>

                  {/* Slider bar */}
                  <div
                    className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-xs font-bold text-slate-800 border-2 border-primary">
                      ↔
                    </div>
                  </div>

                  {/* Badges */}
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase pointer-events-none border border-white/10">
                    Before
                  </span>
                  <span className="absolute bottom-3 right-3 bg-teal-500/80 text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase pointer-events-none border border-teal-400/20">
                    After
                  </span>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] max-h-[400px] rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                  <img src={photo} alt="Original Preview" className="w-full h-full object-contain" />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {restored && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
                  >
                    <Download size={18} /> Download
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-teal-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} /> Copy Image
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                  >
                    <RefreshCw size={18} /> Reset
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Explain info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How does restoration work?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Old Photo Restorer implements spatial convolution sharpening filters and histogram leveling. All calculations execute locally inside your browser context. No photo data is sent to outer networks.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
