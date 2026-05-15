"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Palette,
  Search,
  Info,
  Zap,
  Globe,
  Briefcase,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Layout,
  MousePointer2,
  Image as ImageIcon,
  Download,
  Upload,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  getColorMeaning,
  generateHarmonies,
  generateGradients,
  getContrastRatio
} from "./utils/colorUtils";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-primary/30 transition-colors overflow-hidden break-words ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-12"
  >
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-6">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      Neural Color Engine Active
    </div>
    <h1 className="heading !text-5xl md:!text-7xl font-black mb-4">
      Color Psychology Analyzer
    </h1>
    <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
      Decode the emotional impact, branding power, and cultural significance of any color in real-time.
    </p>
  </motion.div>
);

// --- Main App ---

export default function ColorPsychologyAnalyzer() {
  const [color, setColor] = useState("#3b82f6"); // Default blue
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [harmonies, setHarmonies] = useState(null);
  const [gradients, setGradients] = useState([]);
  const [contrast, setContrast] = useState({ white: 0, black: 0 });
  const [extracting, setExtracting] = useState(false);
  const [history, setHistory] = useState([]);
  const [mockupType, setMockupType] = useState("dashboard"); // dashboard, mobile, web
  const fileInputRef = React.useRef(null);

  const updateColor = useCallback((hex) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;

    setColor(hex);
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Get analysis
    const meaning = getColorMeaning(hsl.h, hsl.s, hsl.l);
    setAnalysis(meaning);

    // Get harmonies
    setHarmonies(generateHarmonies(hsl.h, hsl.s, hsl.l));

    // Get gradients
    setGradients(generateGradients(hsl.h, hsl.s, hsl.l));

    // Get contrast
    setContrast({
      white: getContrastRatio(rgb, { r: 255, g: 255, b: 255 }),
      black: getContrastRatio(rgb, { r: 0, g: 0, b: 0 })
    });

    // Add to history
    setHistory(prev => {
      const newHistory = [hex, ...prev.filter(c => c !== hex)].slice(0, 10);
      if (typeof window !== "undefined") {
        localStorage.setItem("color-psychology-history", JSON.stringify(newHistory));
      }
      return newHistory;
    });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get average color or prominent color
        // For simplicity, let's take a few samples and pick the most vibrant
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 400) { // Sample every 100 pixels
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        const hex = rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count));
        updateColor(hex);
        setExtracting(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("color-psychology-history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
    updateColor(color);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-primary/30">
      <div className="max-w-[1440px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Input & Preview (Increased width) */}
          <div className="lg:col-span-6 space-y-8">
            <GlassCard title="Color Input" icon={MousePointer2}>
              <div className="space-y-6">
                {/* Color Picker & HEX Input */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Color Picker */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-(--border) cursor-pointer group shrink-0 shadow-inner">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(e.target.value)}
                      className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Palette className="text-white" size={24} />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4 min-w-0">
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest mb-1.5 block">HEX Value</label>
                      <div className="flex items-center relative">
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => updateColor(e.target.value)}
                          className="w-full bg-(--background) border border-(--border) rounded-xl pl-4 pr-10 py-3 text-lg font-mono font-bold focus:border-primary outline-none transition-all uppercase"
                          placeholder="#000000"
                        />
                        <button
                          onClick={() => handleCopy(color)}
                          className="absolute right-2 p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors z-10"
                        >
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block">RGB</label>
                        <div className="bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-xs font-mono opacity-80 truncate">
                          {(() => {
                            const rgb = hexToRgb(color);
                            return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
                          })()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block">HSL</label>
                        <div className="bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-xs font-mono opacity-80 truncate">
                          {(() => {
                            const rgb = hexToRgb(color);
                            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                            return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-4 border-t border-(--border)">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Image Extract</span>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                    >
                      <Upload size={12} />
                      {extracting ? "Extracting..." : "Upload Image"}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 block">Recent History</span>
                  <div className="flex flex-wrap gap-2">
                    {history.length > 0 ? history.map(c => (
                      <button
                        key={c}
                        onClick={() => updateColor(c)}
                        className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95 ${color.toLowerCase() === c.toLowerCase() ? 'border-primary' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    )) : (
                      <div className="text-[10px] text-muted-foreground italic">No history yet</div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard 
              title="Live Preview" 
              icon={Layout}
              headerActions={
                <div className="flex bg-(--background) rounded-lg border border-(--border) p-0.5">
                  {[
                    { id: "dashboard", icon: Layout },
                    { id: "mobile", icon: ImageIcon },
                    { id: "web", icon: Globe }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setMockupType(t.id)}
                      className={`p-1.5 rounded-md transition-all ${mockupType === t.id ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
                      title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                    >
                      <t.icon size={14} />
                    </button>
                  ))}
                </div>
              }
            >
              <div className="space-y-6">
                <div
                  className="w-full aspect-video rounded-3xl relative overflow-hidden shadow-2xl border border-white/10 group"
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                  {/* Dynamic Mockup Preview */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <AnimatePresence mode="wait">
                      {mockupType === "dashboard" && (
                        <motion.div 
                          key="dash"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-between overflow-hidden"
                        >
                          <div className="flex justify-between items-center">
                            <div className="w-8 h-8 rounded-full bg-white/20" />
                            <div className="flex gap-2">
                              <div className="w-12 h-3 rounded-full bg-white/20" />
                              <div className="w-12 h-3 rounded-full bg-white/20" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="w-3/4 h-6 rounded-lg bg-white/30" />
                            <div className="w-1/2 h-4 rounded-lg bg-white/20" />
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              <div className="h-16 rounded-xl bg-white/10" />
                              <div className="h-16 rounded-xl bg-white/10" />
                              <div className="h-16 rounded-xl bg-white/10" />
                            </div>
                          </div>
                          <button className="w-full py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-lg">
                            Analyze Dashboard
                          </button>
                        </motion.div>
                      )}

                      {mockupType === "mobile" && (
                        <motion.div 
                          key="mobile"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="w-48 h-full bg-white/10 backdrop-blur-md rounded-[40px] border-[6px] border-white/20 p-6 flex flex-col items-center justify-between shadow-2xl"
                        >
                          <div className="w-16 h-1 rounded-full bg-white/20 mt-2" />
                          <div className="flex flex-col items-center gap-4 w-full">
                            <div className="w-20 h-20 rounded-full bg-white/30" />
                            <div className="w-full space-y-2">
                              <div className="w-full h-3 rounded-full bg-white/30" />
                              <div className="w-3/4 h-3 rounded-full bg-white/20 mx-auto" />
                            </div>
                          </div>
                          <div className="w-full space-y-2 mb-4">
                            <div className="w-full h-10 rounded-2xl bg-white text-black text-[8px] font-bold flex items-center justify-center">GET STARTED</div>
                            <div className="w-full h-10 rounded-2xl bg-white/10 text-white text-[8px] font-bold flex items-center justify-center border border-white/20">LATER</div>
                          </div>
                        </motion.div>
                      )}

                      {mockupType === "web" && (
                        <motion.div 
                          key="web"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden flex flex-col"
                        >
                          <div className="h-8 w-full bg-white/10 flex items-center px-4 gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                          </div>
                          <div className="flex-1 p-8 flex flex-col justify-center">
                            <div className="max-w-xs space-y-4">
                              <div className="w-full h-8 rounded-lg bg-white/30" />
                              <div className="w-full h-4 rounded-lg bg-white/20" />
                              <div className="w-2/3 h-4 rounded-lg bg-white/20" />
                              <div className="flex gap-3 mt-6">
                                <div className="px-6 py-2 rounded-full bg-white text-black text-[10px] font-bold">Try Now</div>
                                <div className="px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold">Learn More</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-(--background) border border-(--border) text-center min-w-0">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1 truncate">Color Shade</span>
                    <span className="text-lg font-bold text-(--foreground) block truncate">{analysis?.name || "Neural"}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-(--background) border border-(--border) text-center min-w-0">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1 truncate">Mood</span>
                    <span className="text-lg font-bold text-(--foreground) block truncate">{analysis?.emotions[0] || "Neutral"}</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Accessibility Section */}
            <div className="w-full">
              <GlassCard title="Accessibility" icon={Eye} delay={0.5}>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">White Text</span>
                        <span className="text-sm font-bold">{contrast.white.toFixed(2)}:1</span>
                      </div>
                      <div className="h-2 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (contrast.white / 21) * 100)}%` }}
                          className={`h-full ${contrast.white >= 4.5 ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${contrast.white >= 4.5 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>AA</div>
                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${contrast.white >= 7 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>AAA</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Black Text</span>
                        <span className="text-sm font-bold">{contrast.black.toFixed(2)}:1</span>
                      </div>
                      <div className="h-2 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (contrast.black / 21) * 100)}%` }}
                          className={`h-full ${contrast.black >= 4.5 ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${contrast.black >= 4.5 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>AA</div>
                        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${contrast.black >= 7 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>AAA</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                    <Info size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {contrast.white >= 4.5 ? "White text is easily readable on this background." : "Warning: White text may have poor visibility."}
                    </p>
                  </div>
                </div>
              </GlassCard>

            </div>
          </div>

          {/* Right Column: Analysis Sections */}
          <div className="lg:col-span-6 space-y-8">

            {/* Emotional & Branding Stack */}
            <div className="grid grid-cols-1 gap-8">
              <GlassCard title="Emotional Impact" icon={Zap} delay={0.1}>
                <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
                  {analysis?.emotions.map((emo, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold whitespace-nowrap">
                      {emo}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic break-words">
                  "This color triggers feelings of {analysis?.emotions.slice(0, 3).join(', ')}."
                </p>
              </GlassCard>

              <GlassCard title="Branding Insight" icon={Briefcase} delay={0.2}>
                <div className="space-y-4">
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-1 block">Best Industries</span>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {analysis?.branding.industries.map((ind, i) => (
                        <span key={i} className="text-xs font-semibold text-(--foreground) break-words">{ind}{i < analysis.branding.industries.length - 1 ? ' •' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-(--background) border border-(--border) overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 block">Brand Personality</span>
                    <p className="text-xs font-bold text-(--foreground) break-words leading-tight">{analysis?.branding.personality}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard title="Cultural Meanings" icon={Globe} delay={0.3}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {analysis?.culture.map((cul, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-(--background) border border-(--border) hover:border-primary/20 transition-all group overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 block group-hover:translate-x-1 transition-transform">{cul.region}</span>
                    <p className="text-sm font-bold text-(--foreground) break-words leading-tight">{cul.meaning}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Color Harmony" icon={Palette} delay={0.4}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {harmonies && Object.entries(harmonies).map(([type, colors], i) => (
                  <div key={type} className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 block truncate">{type}</span>
                    <div className="flex h-10 rounded-xl overflow-hidden shadow-md border border-(--border)">
                      {colors.map((c, j) => (
                        <div
                          key={j}
                          onClick={() => updateColor(c.hex)}
                          className="flex-1 group relative cursor-pointer min-w-0"
                          style={{ backgroundColor: c.hex }}
                        >
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity px-1">
                            <span className="text-[7px] font-black text-white uppercase truncate">{c.hex}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>


      </div>

      {/* Scientific Methodology Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 px-4 max-w-7xl mx-auto">
        <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Psychological Anchoring</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on empirical research by color theorists like Faber Birren, our engine analyzes wavelength impact on the human limbic system.
          </p>
        </div>
        <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Cultural Anthropology</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cross-referenced with global color semiotics to provide accurate interpretations across Western, Eastern, and Middle Eastern contexts.
          </p>
        </div>
        <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layout size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Branding Semantics</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Evaluates color positioning against industry standards to determine brand personality and competitive market placement.
          </p>
        </div>
      </div>

      {/* Footer Design Guide */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mt-12 overflow-hidden relative mx-4 max-w-5xl lg:mx-auto">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="p-4 rounded-2xl bg-(--background) border border-primary/20 text-primary shadow-xl shrink-0">
          <Palette size={32} />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h4 className="text-lg md:text-xl font-black text-(--foreground) mb-2 uppercase tracking-tighter">Psychology Design Guide</h4>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Colors aren't just aesthetic choices; they are powerful psychological triggers. While <strong>Red</strong> can stimulate appetite and urgency, <strong>Blue</strong> fosters trust and reliability. Use this analyzer to ensure your brand's visual identity aligns perfectly with the subconscious message you want to send to your audience.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} />
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
