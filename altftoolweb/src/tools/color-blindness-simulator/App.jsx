"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  RefreshCw, 
  Eye, 
  Trash2,
  Info,
  Maximize2,
  Zap,
  Layers,
  Settings2,
  Accessibility
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCanvas from "./components/ImageCanvas";
import ComparisonSlider from "./components/ComparisonSlider";
import { FilterModes, AdjustmentControls } from "./components/Controls";

// --- Subcomponents ---

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-4"
  >
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-4">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      Advanced Accessibility Engine
    </div>
    <h1 className="heading !text-4xl md:!text-6xl font-black mb-2">
      Color Blindness Simulator
    </h1>
    <p className="description text-base md:text-lg opacity-80 max-w-2xl mx-auto">
      Experience and analyze digital content through the eyes of color-blind users using high-fidelity RGB transformations.
    </p>
  </motion.div>
);

const InfoCard = ({ title, icon: Icon, children, className = "", headerActions }) => (
  <div className={`relative bg-(--card) border border-(--border) rounded-2xl px-4 py-2.5 transition-all duration-300 hover:border-blue-500/30 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between mb-2 border-b border-(--border) pb-1.5 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-(--background) border border-(--border) text-blue-500 shrink-0">
          {Icon && <Icon size={18} />}
        </div>
        <h3 className="font-primary font-bold text-lg text-(--foreground) truncate">{title}</h3>
      </div>
      <div className="shrink-0">
        {headerActions}
      </div>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon }) => (
  <div className="bg-(--card) border border-(--border) rounded-2xl p-6 hover:shadow-md transition-all">
    <div className="text-blue-500 mb-4 bg-blue-500/10 w-fit p-3 rounded-xl">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-(--foreground) mb-2">{title}</h3>
    <p className="text-sm text-(--muted-foreground) leading-relaxed">{desc}</p>
  </div>
);

const createSampleImage = (label, colors) => {
  const [a, b, c, d] = colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${a}" />
          <stop offset="48%" stop-color="${b}" />
          <stop offset="100%" stop-color="${c}" />
        </linearGradient>
      </defs>
      <rect width="360" height="240" fill="url(#g)" />
      <circle cx="84" cy="82" r="48" fill="${d}" opacity="0.82" />
      <rect x="178" y="46" width="118" height="118" rx="28" fill="#ffffff" opacity="0.22" />
      <path d="M0 188 C74 142 142 224 218 174 C270 140 314 150 360 122 L360 240 L0 240 Z" fill="#111827" opacity="0.28" />
      <text x="24" y="214" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const SAMPLE_IMAGES = [
  { name: "Ishihara Style", url: createSampleImage("Plate", ["#ef4444", "#22c55e", "#f59e0b", "#2563eb"]) },
  { name: "Spectral Chart", url: createSampleImage("Spectrum", ["#ef4444", "#22c55e", "#3b82f6", "#f8fafc"]) },
  { name: "Colorful City", url: createSampleImage("City", ["#0ea5e9", "#f97316", "#8b5cf6", "#facc15"]) },
  { name: "Abstract Art", url: createSampleImage("Abstract", ["#db2777", "#06b6d4", "#f97316", "#ffffff"]) },
  { name: "Interior Design", url: createSampleImage("Interior", ["#14b8a6", "#f8fafc", "#a855f7", "#fb7185"]) },
  { name: "Nature Landscape", url: createSampleImage("Nature", ["#166534", "#84cc16", "#38bdf8", "#fef3c7"]) },
];

// --- Main App ---

export default function ColorBlindnessSimulator() {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [mode, setMode] = useState("deuteranopia");
  const [settings, setSettings] = useState({
    severity: 1.0,
    brightness: 1.0,
    contrast: 0,
    saturation: 1.0
  });
  
  const fileInputRef = useRef(null);

  // Handle Paste
  React.useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => setImage(img);
              img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSettings({
      severity: 1.0,
      brightness: 1.0,
      contrast: 0,
      saturation: 1.0
    });
    setMode("deuteranopia");
    setSliderPosition(50);
  };

  const handleExport = () => {
    window.dispatchEvent(new CustomEvent("export-image"));
  };

  return (
    <div className="px-4 py-4 font-secondary selection:bg-blue-500/30 min-h-screen bg-(--background)">
      <div className="max-w-[1440px] mx-auto space-y-4">
        
        <Header />

        {!image ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => fileInputRef.current.click()}
            className="relative group cursor-pointer"
          >
            <div className="relative bg-(--card) border-2 border-dashed border-(--border) rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all hover:border-blue-500/50 max-w-xl mx-auto overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
              
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Upload size={24} />
              </div>
              <h2 className="text-lg font-black text-(--foreground) mb-1">Drop Image to Analyze</h2>
              <p className="text-[10px] text-(--muted-foreground) mb-4 max-w-xs">
                Upload designs, photos, or paste (Ctrl+V) to test accessibility.
              </p>
              
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <button className="btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <ImageIcon size={14} />
                  Choose Files
                </button>

                <div className="flex flex-col items-center gap-2 mt-2 w-full">
                  <span className="text-[8px] text-(--muted-foreground) font-black uppercase tracking-[0.2em]">Quick Pick</span>
                  <div className="flex justify-center gap-2">
                    {SAMPLE_IMAGES.map((item, i) => (
                      <button
                        key={i}
                        title={item.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          const img = new Image();
                          img.crossOrigin = "anonymous";
                          img.onload = () => setImage(img);
                          img.src = item.url;
                        }}
                        className="group/item relative w-10 h-10 rounded-lg overflow-hidden border border-(--border) hover:border-blue-500 transition-all hover:scale-110 active:scale-95 shrink-0 bg-(--background)"
                      >
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = SAMPLE_IMAGES[0].url;
                          }}
                        />
                        <div className="absolute inset-0 bg-blue-500/0 group-hover/item:bg-blue-500/10 transition-all"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="mt-8 flex gap-6 grayscale opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest">PNG</span>
                <span className="text-[10px] font-black uppercase tracking-widest">JPG</span>
                <span className="text-[10px] font-black uppercase tracking-widest">WEBP</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* 1. Main Preview Section */}
            <div className="bg-(--card) border border-(--border) rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              {/* Card Header */}
              <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--background)/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    Simulation Active
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-(--background) border border-(--border) text-(--muted-foreground) text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    {mode.replace(/-/g, ' ')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setImage(null)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                    title="Remove image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="flex items-center justify-center relative overflow-hidden bg-(--background) p-2 md:p-4 min-h-[200px]">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
                
                <div className="relative w-full max-w-5xl aspect-video md:aspect-auto flex items-center justify-center">
                  <ComparisonSlider position={sliderPosition} setPosition={setSliderPosition}>
                    <ImageCanvas 
                      image={image} 
                      settings={settings} 
                      mode={mode}
                      sliderPosition={sliderPosition}
                      onProcessingStart={() => setIsProcessing(true)}
                      onProcessingEnd={() => setIsProcessing(false)}
                    />
                  </ComparisonSlider>
                  
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 rounded-2xl">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Processing Pixels...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-4 border-t border-(--border) bg-(--background)/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-4 px-6 md:px-8">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2 text-(--muted-foreground) text-[10px] font-bold uppercase tracking-wider">
                    <ImageIcon size={14} className="text-blue-500" />
                    {image.width} × {image.height} PX
                  </div>
                  <div className="hidden xs:block w-px h-4 bg-(--border)"></div>
                  <div className="flex items-center gap-2 text-(--muted-foreground) text-[10px] font-bold uppercase tracking-wider">
                    <Accessibility size={14} className="text-blue-500" />
                    WCAG 2.1 Compliant
                  </div>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                   <button 
                    onClick={handleExport}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Download size={14} />
                    Export Simulation
                  </button>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-1">
                <InfoCard title="Filter Modes" icon={Layers}>
                  <FilterModes activeMode={mode} onSelect={setMode} />
                </InfoCard>
              </div>

              <div className="space-y-8 lg:col-span-1">
                <InfoCard 
                  title="Adjustments" 
                  icon={Settings2}
                  headerActions={
                    <button 
                      onClick={handleReset}
                      className="p-1.5 rounded-lg bg-(--background) border border-(--border) text-(--muted-foreground) hover:text-blue-500 hover:border-blue-500/30 transition-all"
                      title="Reset Settings"
                    >
                      <RefreshCw size={14} />
                    </button>
                  }
                >
                  <AdjustmentControls 
                    settings={settings} 
                    updateSetting={(k, v) => setSettings(prev => ({ ...prev, [k]: v }))} 
                  />
                </InfoCard>

                <InfoCard title="Quick Export" icon={Download}>
                   <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-(--background) border border-(--border)">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-500 uppercase leading-none">Format</span>
                        <span className="text-xs font-bold uppercase mt-1">PNG HD</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <ImageIcon size={16} />
                      </div>
                    </div>
                    <button 
                      onClick={handleExport}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                      Download HD
                    </button>
                  </div>
                </InfoCard>
              </div>
            </div>
          </div>
        )}

        {/* Features Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          <FeatureCard 
            title="Scientific Accuracy" 
            desc="Powered by the Machado et al. physiological model for realistic cone deficiency simulation." 
            icon={Zap}
          />
          <FeatureCard 
            title="Accessibility Testing" 
            desc="Identify problematic color combinations in your UI designs before they reach users." 
            icon={Accessibility}
          />
          <FeatureCard 
            title="Split-View Comparison" 
            desc="Drag the interactive slider to instantly compare original colors with simulated vision." 
            icon={Maximize2}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 mt-12">
          <div className="p-5 rounded-2xl bg-(--background) border border-blue-500/20 text-blue-500 shadow-xl">
            <Info size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-(--foreground) mb-2">Designer's Guide</h4>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              If your design becomes unreadable in <strong>Deuteranopia</strong> or <strong>Protanopia</strong> modes (the most common types), consider using icons, patterns, or direct labels in addition to color. Never rely on color alone to convey critical information or state changes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
