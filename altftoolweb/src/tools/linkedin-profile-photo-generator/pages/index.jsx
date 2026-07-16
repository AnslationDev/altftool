"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Linkedin, Upload, Download, RotateCcw, Image as ImageIcon, Briefcase, Settings2, Sparkles, SlidersHorizontal } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

// Canvas size for standard LinkedIn DP
const CANVAS_SIZE = 400;
const CENTER = CANVAS_SIZE / 2;

const OVERLAYS = {
  NONE: null,
  OPEN_TO_WORK: { text: "#OpenToWork", color: "#22c55e" }, // Green
  HIRING: { text: "#Hiring", color: "#8b5cf6" }, // Purple
  LOOKING: { text: "#Looking", color: "#3b82f6" }, // Blue
};

const BACKGROUNDS = {
  TRANSPARENT: "transparent",
  WHITE: "#ffffff",
  LINKEDIN_BLUE: "#0a66c2",
  SLATE_DARK: "#0f172a",
  MUTED_GRAY: "#f3f4f6",
  TEAL: "#14b8a6",
};

export default function LinkedinProfilePhoto() {
  const [image, setImage] = useState(null);
  const [imageEl, setImageEl] = useState(null);
  
  // Image Adjustments
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  // Decorations
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState(BACKGROUNDS.LINKEDIN_BLUE);
  const [bgColor, setBgColor] = useState(BACKGROUNDS.TRANSPARENT);
  const [overlay, setOverlay] = useState("NONE");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
    }
    const url = URL.createObjectURL(file);
    setImage(url);
    
    const img = new Image();
    img.src = url;
    img.onload = () => {
        setImageEl(img);
        handleReset();
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBorderWidth(0);
    setOverlay("NONE");
    setBgColor(BACKGROUNDS.TRANSPARENT);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Background
    if (bgColor !== BACKGROUNDS.TRANSPARENT) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, CENTER, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (imageEl) {
        // Draw Image
        ctx.save();
        
        // Apply Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        
        // Calculate dimensions based on zoom
        const scale = zoom / 100;
        const minDim = Math.min(imageEl.width, imageEl.height);
        const ratio = CANVAS_SIZE / minDim;
        
        const dw = imageEl.width * ratio * scale;
        const dh = imageEl.height * ratio * scale;
        
        const dx = CENTER - (dw / 2) + offsetX;
        const dy = CENTER - (dh / 2) + offsetY;
        
        ctx.drawImage(imageEl, dx, dy, dw, dh);
        ctx.restore();
    }

    // Restore from circle clip for overlays and borders
    ctx.restore();

    // Draw Border
    if (borderWidth > 0) {
        ctx.beginPath();
        // Adjust radius so border draws inside canvas bounds
        ctx.arc(CENTER, CENTER, CENTER - (borderWidth / 2), 0, Math.PI * 2);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }

    // Draw Overlay (#OpenToWork style)
    if (overlay !== "NONE" && OVERLAYS[overlay]) {
        const o = OVERLAYS[overlay];
        const bannerHeight = 70;
        
        ctx.save();
        // Clip again to circle to keep banner inside
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, CENTER, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw banner arc
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, CENTER + 10, 0, Math.PI * 2);
        ctx.lineWidth = bannerHeight;
        ctx.strokeStyle = o.color;
        
        // Using dash array to simulate the banner covering the bottom-left curve
        // This takes some math, but we can just draw a thick arc segment
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, CENTER - (bannerHeight/2), 0.7 * Math.PI, 1.2 * Math.PI);
        ctx.lineWidth = bannerHeight;
        ctx.strokeStyle = o.color;
        ctx.stroke();

        // Draw Text inside banner
        ctx.translate(CENTER, CENTER);
        ctx.rotate(0.95 * Math.PI); // Rotate text along the arc
        ctx.fillStyle = "white";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // The text position depends on the angle, we place it exactly on the banner curve
        ctx.fillText(o.text, 0, CENTER - (bannerHeight/2));
        
        ctx.restore();
    }

  }, [imageEl, zoom, offsetX, offsetY, brightness, contrast, saturation, borderWidth, borderColor, bgColor, overlay]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "linkedin-profile-photo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Profile photo downloaded!");
  };

  // Mouse/Touch Drag Handlers for Panning
  const startDrag = (e) => {
    if (!imageEl) return;
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - offsetX, y: clientY - offsetY };
  };

  const onDrag = (e) => {
    if (!isDragging.current || !imageEl) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffsetX(clientX - dragStart.current.x);
    setOffsetY(clientY - dragStart.current.y);
  };

  const endDrag = () => {
    isDragging.current = false;
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Linkedin className="h-4 w-4" />
            Social Media Tools
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Linkedin className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            LinkedIn Profile Photo Generator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Upgrade your professional presence. Add real-time filters, backgrounds, custom border rings, and #OpenToWork banners to your display picture.
          </p>
        </section>

        {/* Content */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Workspace */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-6">
               <p className="text-xs font-semibold uppercase text-[var(--primary)]">Real-time Canvas</p>
               {image && (
                 <Button variant="outline" size="sm" onClick={() => setImage(null)} className="h-8">
                    Start Over
                 </Button>
               )}
            </div>

            {!image ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full max-w-md min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted)]/50 aspect-square"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Upload className="h-12 w-12 text-[var(--muted-foreground)] opacity-50 mb-4" />
                <p className="text-[var(--foreground)] font-medium">Upload Photo</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">JPG, PNG, WebP supported</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div 
                   className="relative rounded-full shadow-2xl bg-[var(--muted)] cursor-move overflow-hidden border border-black/5 dark:border-white/5"
                   onMouseDown={startDrag}
                   onMouseMove={onDrag}
                   onMouseUp={endDrag}
                   onMouseLeave={endDrag}
                   onTouchStart={startDrag}
                   onTouchMove={onDrag}
                   onTouchEnd={endDrag}
                >
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_SIZE} 
                    height={CANVAS_SIZE}
                    className="max-w-full h-auto w-[400px] sm:w-[500px]"
                  />
                </div>
                
                <p className="mt-6 text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                   <ImageIcon className="h-4 w-4" /> Drag image to adjust position
                </p>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <aside className={`space-y-4 ${!image ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* Actions */}
            <Button onClick={handleDownload} className="w-full h-12 text-lg gap-2" disabled={!image}>
              <Download className="h-5 w-5" /> Download DP
            </Button>
            
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="w-full gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset Edits
                </Button>
            </div>

            {/* Banner & Border Settings */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2 mb-4">
                 <Briefcase className="h-4 w-4 text-[var(--primary)]" />
                 <p className="text-sm font-semibold uppercase">Decorations</p>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Overlay Banner</label>
                    <select 
                        value={overlay}
                        onChange={(e) => setOverlay(e.target.value)}
                        className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                        <option value="NONE">No Banner</option>
                        <option value="OPEN_TO_WORK">#OpenToWork (Green)</option>
                        <option value="HIRING">#Hiring (Purple)</option>
                        <option value="LOOKING">#Looking (Blue)</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Border Ring Thickness: {borderWidth}px</label>
                    <input 
                      type="range" min="0" max="30" value={borderWidth} 
                      onChange={(e) => setBorderWidth(+e.target.value)} 
                      className="w-full accent-[var(--primary)]"
                    />
                 </div>
                 
                 {borderWidth > 0 && (
                     <div>
                        <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Border Color</label>
                        <input 
                          type="color" value={borderColor} 
                          onChange={(e) => setBorderColor(e.target.value)} 
                          className="w-full h-8 rounded cursor-pointer"
                        />
                     </div>
                 )}
                 
                 <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Background Fill</label>
                    <select 
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                        <option value={BACKGROUNDS.TRANSPARENT}>Transparent</option>
                        <option value={BACKGROUNDS.WHITE}>Solid White</option>
                        <option value={BACKGROUNDS.LINKEDIN_BLUE}>LinkedIn Blue</option>
                        <option value={BACKGROUNDS.TEAL}>Professional Teal</option>
                        <option value={BACKGROUNDS.SLATE_DARK}>Dark Slate</option>
                        <option value={BACKGROUNDS.MUTED_GRAY}>Muted Gray</option>
                    </select>
                 </div>
              </div>
            </div>

            {/* Adjustments */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2 mb-4">
                 <Settings2 className="h-4 w-4 text-[var(--primary)]" />
                 <p className="text-sm font-semibold uppercase">Position & Zoom</p>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--muted-foreground)]">Zoom</span>
                      <span className="font-medium">{zoom}%</span>
                    </div>
                    <input 
                      type="range" min="10" max="300" value={zoom} 
                      onChange={(e) => setZoom(+e.target.value)} 
                      className="w-full accent-[var(--primary)]"
                    />
                 </div>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
               <div className="flex items-center gap-2 mb-4">
                 <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
                 <p className="text-sm font-semibold uppercase">Filters</p>
               </div>
               
               <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--muted-foreground)]">Brightness</span>
                      <span className="font-medium">{brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={brightness} 
                      onChange={(e) => setBrightness(+e.target.value)} 
                      className="w-full accent-[var(--primary)]"
                    />
                 </div>
                 
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--muted-foreground)]">Contrast</span>
                      <span className="font-medium">{contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={contrast} 
                      onChange={(e) => setContrast(+e.target.value)} 
                      className="w-full accent-[var(--primary)]"
                    />
                 </div>
                 
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--muted-foreground)]">Saturation</span>
                      <span className="font-medium">{saturation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={saturation} 
                      onChange={(e) => setSaturation(+e.target.value)} 
                      className="w-full accent-[var(--primary)]"
                    />
                 </div>
               </div>
            </div>
            
          </aside>
        </section>
      </div>
    </main>
  );
}
