"use client";

import React, { useState, useEffect } from "react";
import { Layers, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, Eye } from "lucide-react";

export default function ToolHome() {
  const [blur, setBlur] = useState(16);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgOpacity, setBgOpacity] = useState(0.15);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderOpacity, setBorderOpacity] = useState(0.25);
  const [shadowOpacity, setShadowOpacity] = useState(0.15);
  const [shadowBlur, setShadowBlur] = useState(30);
  const [borderRadius, setBorderRadius] = useState(16);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Computed RGBA conversions
  const hexToRgba = (hex, opacity) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${opacity})`;
    }
    return `rgba(255, 255, 255, ${opacity})`;
  };

  const bgRgba = hexToRgba(bgColor, bgOpacity);
  const borderRgba = hexToRgba(borderColor, borderOpacity);

  const cssString = `background: ${bgRgba};\nborder-radius: ${borderRadius}px;\nbox-shadow: 0 4px 30px rgba(0, 0, 0, ${shadowOpacity});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid ${borderRgba};`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const cssContent = `.glass-card {\n  ${cssString.replace(/\n/g, "\n  ")}\n}`;
    const textBlob = new Blob([cssContent], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "glassmorphism-card.css";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const presetStyle = (type) => {
    if (type === "frosty") {
      setBlur(20); setBgColor("#ffffff"); setBgOpacity(0.12); setBorderColor("#ffffff"); setBorderOpacity(0.3); setShadowOpacity(0.2);
    } else if (type === "deep") {
      setBlur(35); setBgColor("#000000"); setBgOpacity(0.35); setBorderColor("#ffffff"); setBorderOpacity(0.15); setShadowOpacity(0.4);
    } else if (type === "neon") {
      setBlur(12); setBgColor("#14b8a6"); setBgOpacity(0.15); setBorderColor("#22d3ee"); setBorderOpacity(0.45); setShadowOpacity(0.3);
    } else if (type === "minimal") {
      setBlur(4); setBgColor("#ffffff"); setBgOpacity(0.05); setBorderColor("#ffffff"); setBorderOpacity(0.1); setShadowOpacity(0.05);
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
                <Layers className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Glassmorphism CSS Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, CSS3
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Design frosted-glass user interfaces visually. Adjust opacity, shadows, background blur filters, and view them immediately overlaying animated color bubbles.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Glassmorphism", "CSS3", "Responsive"].map((item) => (
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
            Live Preview
          </span>

          {/* Display Area with animated background bubbles */}
          <div className="w-full h-64 rounded-xl border border-border bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
            
            {/* Floating Bubbles */}
            <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 blur-sm opacity-80 animate-pulse" />
            <div className="absolute bottom-8 right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 blur-sm opacity-80" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-xs opacity-70" />

            {/* Glass Card */}
            <div
              className="w-full max-w-[260px] aspect-[4/3] p-5 flex flex-col justify-between transition-all duration-150 relative z-10"
              style={{
                background: bgRgba,
                borderRadius: `${borderRadius}px`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, ${shadowOpacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: `1px solid ${borderRgba}`,
              }}
            >
              <div className="space-y-1.5">
                <div className="h-3.5 w-12 rounded bg-white/20 animate-pulse" />
                <div className="text-sm font-black text-white/90 leading-tight">
                  Glassmorphic Premium UI Card
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-white/70">
                <span>#### #### #### 2026</span>
                <span className="font-bold text-white/90">ALTFTOOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout - Controls and Code Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Sliders size={14} className="text-primary" />
              Glass Card Customization
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Blur Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Backdrop Blur</span>
                  <span className="text-primary font-mono">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={blur}
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Corner Curvature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Border Radius</span>
                  <span className="text-primary font-mono">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Background Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Background Opacity</span>
                  <span className="text-primary font-mono">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgOpacity * 100}
                  onChange={(e) => setBgOpacity(parseFloat(e.target.value) / 100)}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Border Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Border Opacity</span>
                  <span className="text-primary font-mono">{Math.round(borderOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={borderOpacity * 100}
                  onChange={(e) => setBorderOpacity(parseFloat(e.target.value) / 100)}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Shadow Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Shadow Density</span>
                  <span className="text-primary font-mono">{Math.round(shadowOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOpacity * 100}
                  onChange={(e) => setShadowOpacity(parseFloat(e.target.value) / 100)}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Card Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                    />
                    <span className="text-[10px] font-mono font-bold uppercase">{bgColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Border Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                    />
                    <span className="text-[10px] font-mono font-bold uppercase">{borderColor}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Presets */}
            <div className="pt-4 border-t border-border mt-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">
                Theme Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "frosty", label: "Frosty White" },
                  { id: "deep", label: "Deep Charcoal" },
                  { id: "neon", label: "Neon Cyan" },
                  { id: "minimal", label: "Ultra Clean" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => presetStyle(p.id)}
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

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[11px] text-foreground space-y-1 select-all leading-relaxed break-all">
              <div><span className="text-primary">.glass-card</span> &#123;</div>
              {cssString.split("\n").map((line, idx) => (
                <div key={idx} className="pl-4">
                  <span className="text-muted-foreground">{line.split(":")[0]}:</span>
                  <span className="text-foreground font-semibold">{line.split(":")[1]}</span>
                </div>
              ))}
              <div>&#125;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
