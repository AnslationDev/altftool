"use client";

import React, { useState, useEffect } from "react";
import { Spline, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, Zap } from "lucide-react";

export default function ToolHome() {
  const [pointsCount, setPointsCount] = useState(6);
  const [randomness, setRandomness] = useState(50);
  const [seed, setSeed] = useState(1);
  const [fillType, setFillType] = useState("gradient"); // 'solid' | 'gradient'
  const [color1, setColor1] = useState("#14b8a6"); // Teal
  const [color2, setColor2] = useState("#22d3ee"); // Cyan
  const [gradientAngle, setGradientAngle] = useState(45);

  const [svgPath, setSvgPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Math to generate organic blob points & smooth path
  useEffect(() => {
    const points = [];
    const center = 200;
    const baseRadius = 130;
    const maxOffset = 70 * (randomness / 100);
    const angleStep = (Math.PI * 2) / pointsCount;

    // A deterministic pseudo-random offset using simple sine of seed
    const getPseudoRandom = (idx) => {
      const x = Math.sin(seed + idx * 8.7) * 9999;
      return x - Math.floor(x);
    };

    for (let i = 0; i < pointsCount; i++) {
      const angle = i * angleStep;
      const offset = (getPseudoRandom(i) - 0.5) * 2 * maxOffset;
      const r = baseRadius + offset;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      points.push({ x, y });
    }

    // Connect points using quadratic Bezier midpoints
    const len = points.length;
    if (len >= 3) {
      let path = "";
      const firstMidX = (points[0].x + points[len - 1].x) / 2;
      const firstMidY = (points[0].y + points[len - 1].y) / 2;
      path += `M ${firstMidX.toFixed(1)} ${firstMidY.toFixed(1)}`;

      for (let i = 0; i < len; i++) {
        const pCurrent = points[i];
        const pNext = points[(i + 1) % len];
        const midX = (pCurrent.x + pNext.x) / 2;
        const midY = (pCurrent.y + pNext.y) / 2;
        path += ` Q ${pCurrent.x.toFixed(1)} ${pCurrent.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
      }

      path += " Z";
      setSvgPath(path);
    }
  }, [pointsCount, randomness, seed]);

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000) + 1);
  };

  const getFullSvgString = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    ${
      fillType === "gradient"
        ? `<linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>`
        : ""
    }
  </defs>
  <path d="${svgPath}" fill="${fillType === "gradient" ? "url(#blobGrad)" : color1}" />
</svg>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullSvgString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([getFullSvgString()], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `organic-blob-seed-${seed}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Spline className="h-5 w-5 text-primary group-hover:rotate-90 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    SVG Blob Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, SVG
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate fluid organic SVG blobs. Adjust points count, randomness complexity, colors, or output raw XML / linear gradient vectors.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["SVG Vector", "Fluid Shape", "Randomized"].map((item) => (
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
            <Zap size={14} className="text-primary" />
            Live Preview
          </span>

          {/* Display Area */}
          <div className="w-full h-64 rounded-xl border border-border bg-surface-soft bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] flex items-center justify-center p-8 relative overflow-hidden">
            <svg viewBox="0 0 400 400" className="h-full drop-shadow-md">
              <defs>
                <linearGradient id="blobPreviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color1} />
                  <stop offset="100%" stopColor={color2} />
                </linearGradient>
              </defs>
              <path
                d={svgPath}
                fill={fillType === "gradient" ? "url(#blobPreviewGrad)" : color1}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>

        {/* Workspace Layout - Config and Code Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Sliders size={14} className="text-primary" />
              Blob Shape Configurations
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Points Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Complexity (Points)</span>
                  <span className="text-primary font-mono">{pointsCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={pointsCount}
                  onChange={(e) => setPointsCount(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Randomness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Fluidity (Randomness)</span>
                  <span className="text-primary font-mono">{randomness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={randomness}
                  onChange={(e) => setRandomness(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Fill Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Fill Scheme
                </label>
                <select
                  value={fillType}
                  onChange={(e) => setFillType(e.target.value)}
                  className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none"
                >
                  <option value="gradient">Linear Gradient</option>
                  <option value="solid">Solid Color</option>
                </select>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground uppercase">Stop 1</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                    />
                    <span className="text-[10px] font-mono font-bold uppercase">{color1}</span>
                  </div>
                </div>

                {fillType === "gradient" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground uppercase">Stop 2</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                      />
                      <span className="text-[10px] font-mono font-bold uppercase">{color2}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Seed Generator */}
            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Mutation Seed
                </span>
                <span className="text-[10px] text-muted-foreground">Seed: {seed}</span>
              </div>
              <button
                onClick={generateRandomSeed}
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition"
              >
                <RefreshCw size={14} /> Mutate Shape
              </button>
            </div>

          </div>

          {/* Generated Code Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated SVG Code
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

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-1 select-all max-h-[180px] overflow-y-auto leading-relaxed break-all scrollbar-thin">
              {getFullSvgString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
