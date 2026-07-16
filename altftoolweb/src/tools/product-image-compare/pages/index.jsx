"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Image as ImageIcon, Upload, RotateCcw, X, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

export default function ProductImageCompare() {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);
  
  // To handle aspect ratio maintaining based on first uploaded image
  const imgARef = useRef(null);

  const handleFile = (file, setter) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    setter(url);
  };

  const handleDrop = (e, setter) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file, setter);
  };

  const handleReset = () => {
    setImageA(null);
    setImageB(null);
    setSliderPosition(50);
  };

  const onImageALoad = (e) => {
    imgARef.current = e.target;
    updateContainerSize();
  };
  
  const updateContainerSize = useCallback(() => {
    if (imgARef.current && containerRef.current) {
        // Find optimal size fitting in view while maintaining aspect ratio
        const imgAspect = imgARef.current.naturalWidth / imgARef.current.naturalHeight;
        setContainerSize({ aspect: imgAspect });
    }
  }, []);

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
  
  useEffect(() => {
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
  }, [updateContainerSize]);

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
            <ImageIcon className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Product Image Compare
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Upload two images (Before & After, or Product Variations) and use the interactive slider to compare them side-by-side.
          </p>
        </section>

        {/* Main Content */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Workspace */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Interactive View</p>
              </div>
              {(imageA || imageB) && (
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Start Over
                </Button>
              )}
            </div>

            {(!imageA || !imageB) ? (
              <div className="flex flex-col md:flex-row gap-4 min-h-[400px] flex-1">
                {/* Upload Zone A */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, setImageA)}
                  onClick={() => !imageA && fileInputARef.current?.click()}
                  className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors relative overflow-hidden ${
                      imageA ? 'border-[var(--border)] bg-black/5' : 'border-[var(--border)] bg-[var(--muted)]/30 hover:border-[var(--primary)] cursor-pointer hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <input
                    ref={fileInputARef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0], setImageA)}
                  />
                  
                  {imageA ? (
                     <>
                        <img src={imageA} alt="Image A" className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2 opacity-50 blur-sm" />
                        <div className="z-10 bg-black/60 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" /> Image A Ready
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setImageA(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full z-20 hover:bg-red-600 transition-colors shadow-md">
                           <X className="h-4 w-4" />
                        </button>
                     </>
                  ) : (
                      <>
                        <Upload className="h-10 w-10 text-[var(--muted-foreground)] opacity-50 mb-4" />
                        <p className="text-[var(--foreground)] font-medium text-center px-4">
                          Upload Image A
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">Before / Variant 1</p>
                      </>
                  )}
                </div>

                {/* Upload Zone B */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, setImageB)}
                  onClick={() => !imageB && fileInputBRef.current?.click()}
                  className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors relative overflow-hidden ${
                      imageB ? 'border-[var(--border)] bg-black/5' : 'border-[var(--border)] bg-[var(--muted)]/30 hover:border-[var(--primary)] cursor-pointer hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <input
                    ref={fileInputBRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0], setImageB)}
                  />
                  
                  {imageB ? (
                     <>
                        <img src={imageB} alt="Image B" className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2 opacity-50 blur-sm" />
                        <div className="z-10 bg-black/60 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400" /> Image B Ready
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setImageB(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full z-20 hover:bg-red-600 transition-colors shadow-md">
                           <X className="h-4 w-4" />
                        </button>
                     </>
                  ) : (
                      <>
                        <Upload className="h-10 w-10 text-[var(--muted-foreground)] opacity-50 mb-4" />
                        <p className="text-[var(--foreground)] font-medium text-center px-4">
                          Upload Image B
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">After / Variant 2</p>
                      </>
                  )}
                </div>
              </div>
            ) : (
              // Comparison Slider View
              <div className="relative flex-1 min-h-[500px] flex items-center justify-center bg-[var(--muted)]/20 rounded-xl overflow-hidden group">
                <div 
                  ref={containerRef}
                  className="relative w-full max-w-full overflow-hidden select-none"
                  style={{
                    aspectRatio: containerSize.aspect ? `${containerSize.aspect}` : 'auto',
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
                  {/* Image A (Base) */}
                  <img
                    src={imageA}
                    alt="Image A"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    onLoad={onImageALoad}
                  />

                  {/* Image B (Overlay clipped by slider) */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-transparent"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={imageB}
                      alt="Image B"
                      className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                      style={{ 
                         width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw'
                      }}
                    />
                  </div>

                  {/* Slider Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                    style={{ left: `calc(${sliderPosition}% - 2px)` }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-black/10">
                      <div className="flex gap-1">
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm">
                    Image B
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm">
                    Image A
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <aside className="space-y-4">
            {/* View Controls */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] opacity-100">
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Slider Position</p>
              <div className="flex gap-2 mb-4">
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(0)} disabled={!imageA || !imageB}>Show A</Button>
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(50)} disabled={!imageA || !imageB}>50 / 50</Button>
                 <Button variant="outline" className="flex-1 text-xs" onClick={() => setSliderPosition(100)} disabled={!imageA || !imageB}>Show B</Button>
              </div>
              
              <p className="text-xs font-semibold uppercase text-[var(--primary)] mb-3">Instructions</p>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-2 list-disc pl-4">
                 <li>Upload two images with identical dimensions for the best comparison experience.</li>
                 <li>Drag the slider horizontally over the preview to reveal the underlying image.</li>
                 <li>Use this to showcase Before/After edits, product color variants, or quality improvements.</li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-700 dark:text-emerald-400">
               <strong>Tip:</strong> The view automatically scales to maintain the aspect ratio of Image A. Make sure Image B matches it!
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

// Inline Check icon since it wasn't imported from lucide-react in the header
function Check(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
