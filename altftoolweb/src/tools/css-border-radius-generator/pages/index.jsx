"use client";

import React, { useState, useEffect } from "react";
import { SquareDashed, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, Layers } from "lucide-react";

export default function ToolHome() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [unit, setUnit] = useState("%"); // '%' or 'px'

  // Simple Mode values
  const [simpleTL, setSimpleTL] = useState(24);
  const [simpleTR, setSimpleTR] = useState(24);
  const [simpleBR, setSimpleBR] = useState(24);
  const [simpleBL, setSimpleBL] = useState(24);

  // Advanced Mode values (Horizontal / Vertical)
  // Format: tl-x tr-x br-x bl-x / tl-y tr-y br-y bl-y
  const [advTLX, setAdvTLX] = useState(30);
  const [advTRX, setAdvTRX] = useState(70);
  const [advBRX, setAdvBRX] = useState(40);
  const [advBLX, setAdvBLX] = useState(60);

  const [advTLY, setAdvTLY] = useState(30);
  const [advTRY, setAdvTRY] = useState(40);
  const [advBRY, setAdvBRY] = useState(70);
  const [advBLY, setAdvBLY] = useState(60);

  const [bgStyle, setBgStyle] = useState("gradient"); // 'gradient' | 'grid' | 'dark' | 'light'
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [borderRadiusString, setBorderRadiusString] = useState("");

  useEffect(() => {
    if (!isAdvanced) {
      const u = unit;
      setBorderRadiusString(`${simpleTL}${u} ${simpleTR}${u} ${simpleBR}${u} ${simpleBL}${u}`);
    } else {
      // Advanced organic border-radius shorthand is always percentage-based
      setBorderRadiusString(
        `${advTLX}% ${advTRX}% ${advBRX}% ${advBLX}% / ${advTLY}% ${advTRY}% ${advBRY}% ${advBLY}%`
      );
    }
  }, [isAdvanced, unit, simpleTL, simpleTR, simpleBR, simpleBL, advTLX, advTRX, advBRX, advBLX, advTLY, advTRY, advBRY, advBLY]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`border-radius: ${borderRadiusString};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const cssText = `.custom-shape {\n  border-radius: ${borderRadiusString};\n}`;
    const textBlob = new Blob([cssText], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "border-radius-styles.css";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const applyPreset = (preset) => {
    if (preset === "organic") {
      setIsAdvanced(true);
      setAdvTLX(30); setAdvTRX(70); setAdvBRX(40); setAdvBLX(60);
      setAdvTLY(30); setAdvTRY(40); setAdvBRY(70); setAdvBLY(60);
    } else if (preset === "leaf") {
      setIsAdvanced(true);
      setAdvTLX(0); setAdvTRX(100); setAdvBRX(0); setAdvBLX(100);
      setAdvTLY(0); setAdvTRY(100); setAdvBRY(0); setAdvBLY(100);
    } else if (preset === "shield") {
      setIsAdvanced(false);
      setUnit("%");
      setSimpleTL(10); setSimpleTR(10); setSimpleBR(50); setSimpleBL(50);
    } else if (preset === "circle") {
      setIsAdvanced(false);
      setUnit("%");
      setSimpleTL(50); setSimpleTR(50); setSimpleBR(50); setSimpleBL(50);
    } else if (preset === "card") {
      setIsAdvanced(false);
      setUnit("px");
      setSimpleTL(16); setSimpleTR(16); setSimpleBR(16); setSimpleBL(16);
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
                <SquareDashed className="h-5 w-5 text-primary group-hover:rotate-45 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    CSS Border Radius Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Visually configure box corner curvatures. Design standard cards, round circles, or organic fluid blobs using simple or 8-value shorthand modes.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Visual", "CSS3", "Organic Blobs"].map((item) => (
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-primary" />
              Live Preview
            </span>
            
            {/* Backdrop Selectors */}
            <div className="flex gap-1.5">
              {["gradient", "grid", "dark", "light"].map((style) => (
                <button
                  key={style}
                  onClick={() => setBgStyle(style)}
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border transition ${
                    bgStyle === style
                      ? "bg-primary border-primary text-white"
                      : "bg-surface-soft border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Display Area */}
          <div
            className={`w-full h-64 rounded-xl border border-border flex items-center justify-center p-8 transition-all duration-300 relative overflow-hidden ${
              bgStyle === "gradient"
                ? "bg-gradient-to-tr from-teal-900/40 via-cyan-900/30 to-slate-900/20"
                : bgStyle === "grid"
                ? "bg-surface-soft bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
                : bgStyle === "dark"
                ? "bg-slate-950"
                : "bg-white"
            }`}
          >
            <div
              className="w-40 h-40 bg-gradient-to-br from-primary to-secondary shadow-lg transition-all duration-300"
              style={{ borderRadius: borderRadiusString }}
            />
          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Tabs / Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdvanced(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    !isAdvanced
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-surface-soft text-foreground"
                  }`}
                >
                  Simple Mode
                </button>
                <button
                  onClick={() => setIsAdvanced(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isAdvanced
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-surface-soft text-foreground"
                  }`}
                >
                  Advanced Mode
                </button>
              </div>

              {!isAdvanced && (
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-background">
                  <button
                    onClick={() => setUnit("%")}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      unit === "%" ? "bg-surface-soft text-primary" : "text-muted-foreground"
                    }`}
                  >
                    %
                  </button>
                  <button
                    onClick={() => setUnit("px")}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                      unit === "px" ? "bg-surface-soft text-primary" : "text-muted-foreground"
                    }`}
                  >
                    px
                  </button>
                </div>
              )}
            </div>

            {/* Sliders Container */}
            {!isAdvanced ? (
              // Simple Mode Sliders
              <div className="space-y-5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                  <Sliders size={14} className="text-primary" />
                  Corner Radii Controls
                </span>
                
                {[
                  { label: "Top-Left Corner", val: simpleTL, set: setSimpleTL, max: unit === "%" ? 100 : 200 },
                  { label: "Top-Right Corner", val: simpleTR, set: setSimpleTR, max: unit === "%" ? 100 : 200 },
                  { label: "Bottom-Right Corner", val: simpleBR, set: setSimpleBR, max: unit === "%" ? 100 : 200 },
                  { label: "Bottom-Left Corner", val: simpleBL, set: setSimpleBL, max: unit === "%" ? 100 : 200 },
                ].map((slider, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-foreground font-semibold">
                      <span>{slider.label}</span>
                      <span className="text-primary font-mono">{slider.val}{unit}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={slider.max}
                      value={slider.val}
                      onChange={(e) => slider.set(parseInt(e.target.value))}
                      className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Advanced Mode Sliders (Always %)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Horizontal values */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <Sliders size={14} className="text-primary" />
                    Horizontal
                  </span>

                  {[
                    { label: "Top-Left H", val: advTLX, set: setAdvTLX },
                    { label: "Top-Right H", val: advTRX, set: setAdvTRX },
                    { label: "Bottom-Right H", val: advBRX, set: setAdvBRX },
                    { label: "Bottom-Left H", val: advBLX, set: setAdvBLX },
                  ].map((slider, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-foreground font-semibold">
                        <span>{slider.label}</span>
                        <span className="text-primary font-mono">{slider.val}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slider.val}
                        onChange={(e) => slider.set(parseInt(e.target.value))}
                        className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Vertical values */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <Sliders size={14} className="text-primary" />
                    Vertical
                  </span>

                  {[
                    { label: "Top-Left V", val: advTLY, set: setAdvTLY },
                    { label: "Top-Right V", val: advTRY, set: setAdvTRY },
                    { label: "Bottom-Right V", val: advBRY, set: setAdvBRY },
                    { label: "Bottom-Left V", val: advBLY, set: setAdvBLY },
                  ].map((slider, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-foreground font-semibold">
                        <span>{slider.label}</span>
                        <span className="text-primary font-mono">{slider.val}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slider.val}
                        onChange={(e) => slider.set(parseInt(e.target.value))}
                        className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Style Presets */}
            <div className="pt-4 border-t border-border mt-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">
                Quick Shape Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "card", label: "Soft Card" },
                  { id: "circle", label: "Circle/Oval" },
                  { id: "shield", label: "Shield Pattern" },
                  { id: "organic", label: "Organic Blob" },
                  { id: "leaf", label: "Leaf Structure" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-surface-soft border border-border hover:border-primary text-xs font-semibold text-foreground transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Generated CSS Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated CSS Code
              </span>
              
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition shrink-0"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition shrink-0"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-xs text-foreground space-y-2 select-all leading-relaxed break-all">
              <div><span className="text-primary">.custom-shape</span> &#123;</div>
              <div className="pl-4">
                <span className="text-muted-foreground">border-radius:</span>{" "}
                <span className="text-foreground font-semibold">{borderRadiusString};</span>
              </div>
              <div>&#125;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
