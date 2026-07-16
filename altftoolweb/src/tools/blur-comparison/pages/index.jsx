"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Droplet, Upload, Download, RotateCcw, ImagePlus, X, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

export default function BlurComparison() {
  const [imageUrl, setImageUrl] = useState(null);
  const [blurLevel, setBlurLevel] = useState(10);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setBlurLevel(10);
    setSliderPosition(50);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleRemove = () => {
    setImageUrl(null);
  };

  const handleReset = () => {
    setBlurLevel(10);
    setSliderPosition(50);
  };

  const onImageLoad = (e) => {
    setImageSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
    imgRef.current = e.target;
  };

  const handleMove = useCallback((clientX) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleMouseMove = useCallback((e) => handleMove(e.clientX), [handleMove]);
  const handleTouchMove = useCallback((e) => handleMove(e.touches[0].clientX), [handleMove]);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const handleDownload = () => {
    if (!imgRef.current) return;
    
    // Draw the blurred image onto a canvas for downloading
    const canvas = document.createElement("canvas");
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    const ctx = canvas.getContext("2d");
    
    ctx.filter = `blur(${blurLevel}px)`;
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    
    const link = document.createElement("a");
    link.download = `blurred-${blurLevel}px.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Image downloaded successfully!");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <SplitSquareHorizontal className="h-4 w-4" />
            Image Editor
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Droplet className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Blur Comparison
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Upload an image and use the interactive slider to compare the original with various blur intensities.
          </p>
        </section>

        {/* Main Content */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Workspace */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Interactive View</p>
                {imageSize.width > 0 && <h2 className="mt-1 text-sm text-[var(--muted-foreground)]">{imageSize.width} × {imageSize.height}px</h2>}
              </div>
              {imageUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              )}
            </div>

            {!imageUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 min-h-[500px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted)]/50"
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
              <div className="relative flex-1 min-h-[500px] flex items-center justify-center bg-[var(--muted)]/20 rounded-xl overflow-hidden group">
                <div 
                  ref={containerRef}
                  className="relative w-full max-w-full overflow-hidden select-none"
                  style={{
                    aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : 'auto',
                    maxHeight: '70vh'
                  }}
                  onMouseDown={(e) => {
                     setIsDragging(true);
                     handleMove(e.clientX);
                  }}
                  onTouchStart={(e) => {
                     setIsDragging(true);
                     handleMove(e.touches[0].clientX);
                  }}
                >
                  {/* Base Image (Original) */}
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    onLoad={onImageLoad}
                  />

                  {/* Blurred Overlay */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={imageUrl}
                      alt="Blurred"
                      className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                      style={{ 
                         width: '100%',
                         width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw',
                         filter: `blur(${blurLevel}px)` 
                      }}
                    />
                  </div>

                  {/* Slider Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                    style={{ left: `calc(${sliderPosition}% - 2px)` }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <div className="flex gap-1">
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    Blurred ({blurLevel}px)
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    Original
                  </div>
                </div>

                <button
                  onClick={handleRemove}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-20"
                  title="Remove Image"
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

            {/* Blur Control */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Blur Settings</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--muted-foreground)] mb-2">
                    <span>Intensity</span>
                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full">{blurLevel}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={blurLevel} 
                    onChange={(e) => setBlurLevel(+e.target.value)} 
                    className="w-full accent-[var(--primary)]" 
                  />
                </div>
                
                {/* Presets */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Presets</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBlurLevel(5)}>Subtle</Button>
                    <Button variant="outline" size="sm" onClick={() => setBlurLevel(15)}>Medium</Button>
                    <Button variant="outline" size="sm" onClick={() => setBlurLevel(40)}>Heavy</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Slider Position</p>
              <div className="flex gap-2">
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(0)}>Original</Button>
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(50)}>50 / 50</Button>
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(100)}>Blurred</Button>
              </div>
            </div>
            
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-600 dark:text-blue-400">
               <strong>Tip:</strong> You can drag the slider bar horizontally on the image preview to manually compare the before and after effects.
            </div>

          </aside>
        </section>
      </div>
    </main>
  );
}
