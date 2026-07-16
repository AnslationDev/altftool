"use client";
import React, { useState } from "react";
import {
  Copy,
  Check,
  Star,
  Download,
  Share2,
  Printer,
  Sparkles,
  RefreshCw,
  Eye,
  Type,
  Palette,
} from "lucide-react";

export default function BrandingPanel({ nameData, onToggleFavorite, isFavorite, onGenerateSimilar }) {
  const [copiedColor, setCopiedColor] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [logoBgType, setLogoBgType] = useState("gradient"); // gradient, dark, light
  const [selectedFont, setSelectedFont] = useState(nameData.fontRecommendation);
  const [logoIconStyle, setLogoIconStyle] = useState(nameData.logoStyle || "minimal");
  
  // Custom color regeneration override
  const [currentColors, setCurrentColors] = useState({
    primary: nameData.colors.primary,
    secondary: nameData.colors.secondary,
    accent: nameData.colors.accent,
  });

  React.useEffect(() => {
    setCurrentColors({
      primary: nameData.colors.primary,
      secondary: nameData.colors.secondary,
      accent: nameData.colors.accent,
    });
    setSelectedFont(nameData.fontRecommendation);
    setLogoIconStyle(nameData.logoStyle || "minimal");
  }, [nameData]);

  const handleRegenColors = () => {
    const randomHex = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setCurrentColors({
      primary: randomHex(),
      secondary: randomHex(),
      accent: randomHex(),
    });
  };

  const handleCopyColor = (hex, label) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleCopyBrandingPack = () => {
    const pack = `
Brand Name: ${nameData.name}
Tagline: ${nameData.tagline}
Colors: Primary ${currentColors.primary}, Secondary ${currentColors.secondary}, Accent ${currentColors.accent}
Font: ${selectedFont}
Personality: ${nameData.personality.join(", ")}
    `;
    navigator.clipboard.writeText(pack.trim());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Define SVG logo templates dynamically
  const renderLogoIcon = () => {
    if (logoIconStyle === "geometric") {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" fill={currentColors.primary} />
          <rect x="13" y="13" width="8" height="8" rx="2" fill={currentColors.secondary} />
          <circle cx="17" cy="7" r="4" fill={currentColors.accent} />
        </svg>
      );
    }
    if (logoIconStyle === "gradient") {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColors.primary} />
              <stop offset="100%" stopColor={currentColors.secondary} />
            </linearGradient>
          </defs>
          <path d="M12 2L2 22h20L12 2zM12 6l6.5 13h-13L12 6z" fill="url(#logoGrad)" />
        </svg>
      );
    }
    // minimal
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" strokeWidth="2">
        <circle cx="12" cy="12" r="9" stroke={currentColors.primary} />
        <path d="M12 8v8M8 12h8" stroke={currentColors.accent} />
      </svg>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
      
      {/* 1. Logo Visualizer & Identity Canvas */}
      <div className="lg:w-2/5 p-6 flex flex-col justify-between space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5" /> Live Logo Visualizer
          </span>
          <h3 className="font-extrabold text-lg text-foreground mb-4">Identity Sandbox</h3>
        </div>

        {/* Live Logo Frame */}
        <div
          className={`h-48 rounded-xl flex flex-col items-center justify-center p-6 border border-border/80 transition-all ${
            logoBgType === "gradient"
              ? "bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white"
              : logoBgType === "dark"
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-950"
          }`}
        >
          {renderLogoIcon()}
          <span
            className="text-2xl font-black mt-3 tracking-tight"
            style={{ fontFamily: selectedFont === "Space Grotesk" ? "sans-serif" : "sans-serif" }}
          >
            {nameData.name}
          </span>
          <span className="text-[10px] uppercase tracking-wider opacity-70 mt-1">
            {nameData.tagline}
          </span>
        </div>

        {/* Logo controls */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          {/* Logo style selectors */}
          <div className="grid grid-cols-3 gap-1">
            {["minimal", "geometric", "gradient"].map((st) => (
              <button
                key={st}
                onClick={() => setLogoIconStyle(st)}
                className={`py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                  logoIconStyle === st
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-secondary"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* BG theme selector */}
          <div className="grid grid-cols-3 gap-1">
            {["gradient", "dark", "light"].map((bg) => (
              <button
                key={bg}
                onClick={() => setLogoBgType(bg)}
                className={`py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                  logoBgType === bg
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-secondary"
                }`}
              >
                {bg} Background
              </button>
            ))}
          </div>

          <button
            onClick={handleRegenColors}
            className="w-full py-2 bg-secondary text-foreground border border-border text-xs font-bold rounded-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Randomize Colors
          </button>
        </div>
      </div>

      {/* 2. Detailed Branding Metrics & Color Schemes */}
      <div className="lg:w-3/5 p-6 space-y-6">
        
        {/* Core details */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">{nameData.name}</h2>
            <p className="text-sm text-primary font-bold mt-1">Slogan: "{nameData.tagline}"</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? "bg-yellow-500/10 border-yellow-500/35 text-yellow-500"
                  : "border-border hover:bg-secondary text-muted-foreground"
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleCopyBrandingPack}
              className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-all"
              title="Copy Branding Package"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-all"
              title="Print Blueprint"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Naming metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-y border-border/60 py-4">
          {[
            { label: "Overall Score", val: nameData.scores.overall },
            { label: "Popularity", val: nameData.scores.popularity },
            { label: "Pronunciation", val: nameData.scores.pronunciation },
            { label: "Memorability", val: nameData.scores.memorability },
            { label: "Domain Availability", val: nameData.scores.availability },
          ].map((m, idx) => (
            <div key={idx} className="bg-secondary/40 p-2.5 rounded-lg border border-border/40 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                {m.label}
              </span>
              <span className="text-lg font-black text-foreground">{m.val}%</span>
            </div>
          ))}
        </div>

        {/* Suggested Color Schemes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-primary" /> Generated Color Palettes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: "Primary", hex: currentColors.primary },
              { label: "Secondary", hex: currentColors.secondary },
              { label: "Accent", hex: currentColors.accent },
              { label: "Dark Neutral", hex: "#0f172a" },
              { label: "Light Neutral", hex: "#f8fafc" },
            ].map((c, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyColor(c.hex, c.label)}
                className="bg-card border border-border/80 p-2 rounded-xl text-left hover:shadow-md transition-all flex flex-col justify-between h-20 group"
              >
                <div className="w-full h-6 rounded-lg" style={{ backgroundColor: c.hex }} />
                <div>
                  <span className="text-[9px] text-muted-foreground block font-bold truncate">{c.label}</span>
                  <span className="text-[10px] font-black text-foreground flex items-center justify-between">
                    {c.hex}
                    {copiedColor === c.label ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font selections */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-primary" /> Font Pairing Suggestions
          </h4>
          <div className="flex flex-wrap gap-2">
            {["Space Grotesk", "Sora", "Poppins", "Inter", "Outfit", "Manrope", "Urbanist"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFont(f)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                  selectedFont === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sibling Generator button */}
        <button
          onClick={() => onGenerateSimilar(nameData.name)}
          className="w-full py-2.5 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Generate Similar Brand Names
        </button>

      </div>
    </div>
  );
}
