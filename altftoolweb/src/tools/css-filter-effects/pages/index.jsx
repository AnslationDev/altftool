"use client";

import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle2, Copy, FileDown, RefreshCw, Image as ImageIcon, Eye } from "lucide-react";

export default function ToolHome() {
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [sepia, setSepia] = useState(0);

  const [comparePos, setComparePos] = useState(50); // split position
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const sampleImages = [
    { name: "Landscape", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80" },
    { name: "Portrait", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80" },
    { name: "Abstract Neon", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" }
  ];
  const [imgUrl, setImgUrl] = useState(sampleImages[0].url);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const getFilterString = () => {
    let f = "";
    if (blur > 0) f += `blur(${blur}px) `;
    if (brightness !== 100) f += `brightness(${brightness}%) `;
    if (contrast !== 100) f += `contrast(${contrast}%) `;
    if (grayscale > 0) f += `grayscale(${grayscale}%) `;
    if (hueRotate > 0) f += `hue-rotate(${hueRotate}deg) `;
    if (invert > 0) f += `invert(${invert}%) `;
    if (opacity !== 100) f += `opacity(${opacity}%) `;
    if (saturate !== 100) f += `saturate(${saturate}%) `;
    if (sepia > 0) f += `sepia(${sepia}%) `;
    return f.trim() || "none";
  };

  const getCssString = () => {
    return `.filtered-image {\n  filter: ${getFilterString()};\n}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`filter: ${getFilterString()};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const fileContent = `/* Filter Effects Stylesheet */\n${getCssString()}\n`;
    const textBlob = new Blob([fileContent], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "filter-effects.css";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const resetFilters = () => {
    setBlur(0);
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setHueRotate(0);
    setInvert(0);
    setOpacity(100);
    setSaturate(100);
    setSepia(0);
  };

  const handleCustomImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImgUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Sliders className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    CSS Filter Effects
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, Filters
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Design CSS image filters dynamically. Adjust lighting, blurs, color saturations, or sepia hues, and compare results using a before-and-after split slider.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Visual Filters", "Split Screen", "Custom Upload"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Preview Box (Full Width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={14} className="text-primary" />
            Comparison Split Visualizer (Slide horizontally to compare)
          </span>

          {/* Split Screen Image Slider */}
          <div
            ref={containerRef}
            className="w-full h-80 rounded-xl border border-border bg-slate-950 relative overflow-hidden select-none"
          >
            {/* Bottom Layer - Filtered Image */}
            <img
              src={imgUrl}
              alt="Filtered Preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: getFilterString() }}
            />

            {/* Top Layer - Original Image (Clipped by slider position) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white/60 shadow-lg"
              style={{ width: `${comparePos}%` }}
            >
              <img
                src={imgUrl}
                alt="Original Preview"
                className="absolute inset-y-0 left-0 object-cover max-w-none"
                style={{ width: `${containerWidth}px`, height: "100%" }}
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                Original
              </div>
            </div>

            {/* Right Side indicator label */}
            <div className="absolute top-2 right-2 bg-primary/80 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Filtered
            </div>

            {/* Range Slider Overlay representing Slider handle */}
            <input
              type="range"
              min="0"
              max="100"
              value={comparePos}
              onChange={(e) => setComparePos(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Drag handle line element */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 w-0.5 bg-white shadow-xl"
              style={{ left: `${comparePos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-border shadow flex items-center justify-center text-[10px] font-bold text-foreground">
                ↔
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-primary" />
                Filter Values Configuration
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-primary hover:underline px-2.5 py-1 bg-primary/5 rounded-lg flex items-center gap-1"
              >
                <RefreshCw size={10} /> Reset Filters
              </button>
            </div>

            {/* Slider grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Blur */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Blur</span>
                  <span className="text-primary font-mono">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Brightness</span>
                  <span className="text-primary font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Contrast</span>
                  <span className="text-primary font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Grayscale</span>
                  <span className="text-primary font-mono">{grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayscale}
                  onChange={(e) => setGrayscale(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Hue Rotate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Hue-Rotate</span>
                  <span className="text-primary font-mono">{hueRotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hueRotate}
                  onChange={(e) => setHueRotate(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Invert */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Invert</span>
                  <span className="text-primary font-mono">{invert}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={invert}
                  onChange={(e) => setInvert(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Saturate</span>
                  <span className="text-primary font-mono">{saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturate}
                  onChange={(e) => setSaturate(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Sepia</span>
                  <span className="text-primary font-mono">{sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sepia}
                  onChange={(e) => setSepia(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Image upload & Sample presets */}
            <div className="pt-4 border-t border-border mt-4 space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Select Preview Target Image
              </span>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  {sampleImages.map((img) => (
                    <button
                      key={img.name}
                      onClick={() => setImgUrl(img.url)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        imgUrl === img.url
                          ? "bg-primary border-primary text-white"
                          : "bg-surface-soft border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-primary/20 cursor-pointer transition">
                    <ImageIcon size={14} /> Upload Custom
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Generated CSS Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated CSS Code
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>
            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-2 select-all max-h-[140px] overflow-y-auto leading-relaxed break-all scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getCssString()}</pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
