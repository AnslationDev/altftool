"use client";

import React, { useState, useEffect } from "react";
import { MousePointerClick, CheckCircle2, Copy, FileDown, Sliders, RefreshCw } from "lucide-react";

export default function ToolHome() {
  const [btnText, setBtnText] = useState("Click Me");
  const [paddingX, setPaddingX] = useState(24);
  const [paddingY, setPaddingY] = useState(12);
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState("600");
  const [borderRadius, setBorderRadius] = useState(8);

  const [bgType, setBgType] = useState("gradient"); // 'solid' | 'gradient'
  const [bgColor1, setBgColor1] = useState("#0d9488"); // Teal 600
  const [bgColor2, setBgColor2] = useState("#22d3ee"); // Cyan 400
  const [textColor, setTextColor] = useState("#ffffff");

  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState("#e2e8f0");

  const [shadowDepth, setShadowDepth] = useState(4);
  const [shadowOpacity, setShadowOpacity] = useState(0.15);

  const [hoverScale, setHoverScale] = useState(1.05);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const getBackgroundCss = () => {
    if (bgType === "solid") {
      return `background-color: ${bgColor1};`;
    }
    return `background: linear-gradient(135deg, ${bgColor1} 0%, ${bgColor2} 100%);`;
  };

  const getCssString = () => {
    return `.custom-button {\n  ${getBackgroundCss()}\n  color: ${textColor};\n  padding: ${paddingY}px ${paddingX}px;\n  font-size: ${fontSize}px;\n  font-weight: ${fontWeight};\n  border-radius: ${borderRadius}px;\n  border: ${borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none"};\n  box-shadow: 0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0, 0, 0, ${shadowOpacity});\n  cursor: pointer;\n  transition: all 0.2s ease-in-out;\n}\n\n.custom-button:hover {\n  transform: scale(${hoverScale});\n  box-shadow: 0 ${shadowDepth + 2}px ${(shadowDepth + 2) * 2}px rgba(0, 0, 0, ${shadowOpacity + 0.05});\n}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCssString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const fileContent = `/* Button Stylesheet */\n${getCssString()}\n\n<!-- HTML Structure -->\n<button class="custom-button">${btnText}</button>`;
    const textBlob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "custom-button-styles.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const applyPreset = (type) => {
    if (type === "neon") {
      setBgType("gradient"); setBgColor1("#0d9488"); setBgColor2("#22d3ee"); setTextColor("#ffffff"); setBorderRadius(9999); setBorderWidth(0); setShadowDepth(8); setShadowOpacity(0.25);
    } else if (type === "outline") {
      setBgType("solid"); setBgColor1("transparent"); setTextColor("#14b8a6"); setBorderRadius(8); setBorderWidth(2); setBorderColor("#14b8a6"); setShadowDepth(0); setShadowOpacity(0);
    } else if (type === "dark") {
      setBgType("solid"); setBgColor1("#0f172a"); setTextColor("#f8fafc"); setBorderRadius(12); setBorderWidth(1); setBorderColor("#334155"); setShadowDepth(4); setShadowOpacity(0.15);
    } else if (type === "retro") {
      setBgType("solid"); setBgColor1("#f59e0b"); setTextColor("#1e293b"); setBorderRadius(0); setBorderWidth(3); setBorderColor("#1e293b"); setShadowDepth(6); setShadowOpacity(0.9); setHoverScale(1.0);
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
                <MousePointerClick className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    CSS Button Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, Button
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Design customized interactive UI action buttons. Configure sizes, hover scale ratios, shadows, gradients, and export CSS classes instantly.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Buttons", "Hover States", "Visual Editor"].map((item) => (
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
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Interactive Preview (Hover over the button!)
          </span>

          {/* Display Area */}
          <div className="w-full h-64 rounded-xl border border-border bg-surface-soft bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] flex items-center justify-center p-8 relative overflow-hidden">
            
            <button
              className="transition-all select-none animate-none"
              style={{
                display: "inline-block",
                padding: `${paddingY}px ${paddingX}px`,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                borderRadius: `${borderRadius}px`,
                color: textColor,
                background: bgType === "solid"
                  ? bgColor1
                  : `linear-gradient(135deg, ${bgColor1} 0%, ${bgColor2} 100%)`,
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
                boxShadow: `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(${hoverScale})`;
                e.currentTarget.style.boxShadow = `0 ${shadowDepth + 2}px ${(shadowDepth + 2) * 2}px rgba(0, 0, 0, ${shadowOpacity + 0.05})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1.0)";
                e.currentTarget.style.boxShadow = `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0, 0, 0, ${shadowOpacity})`;
              }}
            >
              {btnText}
            </button>

          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Sliders size={14} className="text-primary" />
              Button Customizations
            </span>

            {/* Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Button Text Content</label>
              <input
                type="text"
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Padding X */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Padding H</span>
                  <span className="text-primary font-mono">{paddingX}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={paddingX}
                  onChange={(e) => setPaddingX(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Padding Y */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Padding V</span>
                  <span className="text-primary font-mono">{paddingY}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={paddingY}
                  onChange={(e) => setPaddingY(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Font Size</span>
                  <span className="text-primary font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="28"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Corner curvature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Corner Radius</span>
                  <span className="text-primary font-mono">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Background Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground uppercase">Background Mode</label>
                <select
                  value={bgType}
                  onChange={(e) => setBgType(e.target.value)}
                  className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none"
                >
                  <option value="solid">Solid Fill</option>
                  <option value="gradient">Linear Gradient</option>
                </select>
              </div>

              {/* Hover animation scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Hover Scale</span>
                  <span className="text-primary font-mono">{hoverScale}x</span>
                </div>
                <input
                  type="range"
                  min="95"
                  max="115"
                  value={hoverScale * 100}
                  onChange={(e) => setHoverScale(parseFloat(e.target.value) / 100)}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Colors controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">Color 1</label>
                  <input
                    type="color"
                    value={bgColor1}
                    onChange={(e) => setBgColor1(e.target.value)}
                    className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                  />
                </div>

                {bgType === "gradient" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-foreground uppercase">Color 2</label>
                    <input
                      type="color"
                      value={bgColor2}
                      onChange={(e) => setBgColor2(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                    />
                  </div>
                )}
              </div>

              {/* Text & Border Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-8 w-10 bg-transparent cursor-pointer rounded border border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">Border Width</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2 text-xs outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Presets */}
            <div className="pt-4 border-t border-border mt-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">
                Quick Button Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "neon", label: "Neon Gradient" },
                  { id: "outline", label: "Outline Minimal" },
                  { id: "dark", label: "Slate Dark" },
                  { id: "retro", label: "Retro Bold" },
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

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-2 select-all max-h-[220px] overflow-y-auto leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getCssString()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
