"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Zap,
  Trash2,
  Maximize2,
  Info,
  Eye,
  EyeOff,
  Sparkles,
  Palette,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRESETS } from "./utils/filters";
import ImageCanvas from "./components/ImageCanvas";
import { GrainControls, ColorControls, EffectControls } from "./components/Controls";
import Presets from "./components/Presets";

// --- Subcomponents ---

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-4">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      Professional Grain Engine
    </div>
    <h1 className="heading !text-4xl md:!text-6xl font-black mb-2">
      Image Noise & Grain Adder
    </h1>
    <p className="description text-base md:text-lg opacity-80 max-w-2xl mx-auto">
      Elevate your photos with realistic film grain, vintage textures, and cinematic analog aesthetics.
    </p>
  </motion.div>
);

const InfoCard = ({ title, icon: Icon, children, className = "", headerActions }) => (
  <div className={`relative bg-(--card) border border-(--border) rounded-2xl px-6 py-4 transition-all duration-300 hover:border-blue-500/30 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between mb-6 border-b border-(--border) pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-(--background) border border-(--border) text-blue-500">
          {Icon && <Icon size={18} />}
        </div>
        <h3 className="font-primary font-bold text-lg text-(--foreground)">{title}</h3>
      </div>
      {headerActions}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon }) => (
  <div className="bg-(--card) border border-(--border) rounded-2xl p-6 hover:shadow-md transition-all">
    <h3 className="text-lg font-bold text-(--foreground) mb-2">{title}</h3>
    <p className="text-sm text-(--muted-foreground) leading-relaxed">{desc}</p>
  </div>
);

// --- Main App ---

export default function ImageNoiseGrainAdder() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [settings, setSettings] = useState(PRESETS[0].settings);
  const [activePreset, setActivePreset] = useState("none");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSettings(PRESETS[0].settings);
    setActivePreset("none");
  };

  const handleExport = () => {
    // This will be handled by the canvas component
    window.dispatchEvent(new CustomEvent("export-image"));
  };

  const applyPreset = (preset) => {
    setSettings(preset.settings);
    setActivePreset(preset.id);
  };

  return (
    <div className="px-4 py-8 font-secondary selection:bg-blue-500/30 min-h-screen bg-(--background)">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        <Header />

        {!image ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => fileInputRef.current.click()}
            className="relative group cursor-pointer"
          >
            <div className="relative bg-(--card) border-2 border-dashed border-(--border) rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all hover:border-blue-500/50 max-w-lg mx-auto">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-500">
                <Upload size={24} />
              </div>
              <h2 className="text-lg font-bold text-(--foreground) mb-1">Upload Photo</h2>
              <p className="text-[10px] text-(--muted-foreground) mb-4">Drag and drop or click to browse. Support for JPG, PNG, and WEBP.</p>
              <button className="btn-primary px-5 py-2 text-xs flex items-center gap-2">
                <ImageIcon size={14} />
                Select File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* 1. Main Image Preview Section */}
            <div className="bg-(--card) border border-(--border) rounded-3xl overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--background)/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <button 
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="p-2 rounded-xl bg-(--background) border border-(--border) text-(--foreground) hover:text-blue-500 transition-all shadow-sm"
                    title="Hold to see original"
                  >
                    {showOriginal ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    Live Render
                  </div>
                </div>

                <button 
                  onClick={() => setImage(null)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                  title="Remove image"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Canvas Container */}
              <div className="flex items-center justify-center relative overflow-hidden bg-(--background) p-4 min-h-[200px]">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
                
                <div className="relative group">
                  <ImageCanvas 
                    image={image} 
                    settings={settings} 
                    showOriginal={showOriginal}
                    onProcessingStart={() => setIsProcessing(true)}
                    onProcessingEnd={() => setIsProcessing(false)}
                  />
                  
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-(--background)/40 backdrop-blur-[2px] z-20 rounded-lg">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-3 border-t border-(--border) bg-(--background)/50 backdrop-blur-sm flex justify-between items-center px-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-(--muted-foreground) text-[10px] font-bold uppercase tracking-wider">
                    <ImageIcon size={12} className="text-blue-500" />
                    {image.width} × {image.height} PX
                  </div>
                  <div className="w-px h-3 bg-(--border)"></div>
                  <div className="text-(--muted-foreground) text-[10px] font-bold uppercase tracking-widest">
                    {settings.animated ? "Animation Active" : "Static Mode"}
                  </div>
                </div>
                <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500/5 rounded border border-blue-500/10">
                  Master Render
                </div>
              </div>
            </div>

            {/* 2. Style Presets Section (Full Width) */}
            <InfoCard title="Cinematic Presets" icon={Layers}>
              <Presets 
                activePreset={activePreset} 
                onSelect={applyPreset} 
              />
            </InfoCard>

            {/* 3. Controls Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoCard 
                title="Film Grain" 
                icon={Sparkles}
                headerActions={
                  <button 
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-(--background) border border-(--border) text-(--muted-foreground) hover:text-blue-500 hover:border-blue-500/30 transition-all"
                    title="Reset"
                  >
                    <RefreshCw size={14} />
                  </button>
                }
              >
                <GrainControls 
                  settings={settings} 
                  updateSetting={(k, v) => {
                    setSettings(prev => ({ ...prev, [k]: v }));
                    setActivePreset("custom");
                  }} 
                />
              </InfoCard>

              <InfoCard title="Color & Tone" icon={Palette}>
                <ColorControls 
                  settings={settings} 
                  updateSetting={(k, v) => {
                    setSettings(prev => ({ ...prev, [k]: v }));
                    setActivePreset("custom");
                  }} 
                />
              </InfoCard>

              <InfoCard title="Analog Artifacts" icon={Wand2}>
                <EffectControls 
                  settings={settings} 
                  updateSetting={(k, v) => {
                    setSettings(prev => ({ ...prev, [k]: v }));
                    setActivePreset("custom");
                  }} 
                />
              </InfoCard>

              {/* 4. Export Section (Standardized) */}
              <InfoCard title="Export Masterpiece" icon={Download}>
                <div className="relative space-y-5 py-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                      Engine Ready
                    </div>
                    <p className="text-[11px] text-(--muted-foreground) font-bold uppercase tracking-wider">High Fidelity • 100% Quality</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleExport}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] text-sm group/btn border border-blue-400/20"
                    >
                      <Download size={18} className="group-hover/btn:translate-y-0.5 transition-transform" />
                      DOWNLOAD HD
                    </button>
                    <p className="text-center text-[9px] text-(--muted-foreground)/60 font-medium">Processed and saved locally.</p>
                  </div>

                  <div className="flex justify-between items-center px-2 pt-4 border-t border-(--border)/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/60">Format</span>
                      <span className="text-[10px] font-bold uppercase">JPEG HD</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/60">License</span>
                      <span className="text-[10px] font-bold uppercase">Free Use</span>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        )}

        {/* Features Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          <FeatureCard 
            title="Procedural Grain" 
            desc="Physically accurate grain simulation using advanced noise algorithms for a true analog look." 
            icon={Layers}
          />
          <FeatureCard 
            title="Real-time Performance" 
            desc="Blazing fast rendering using HTML5 Canvas API. See your edits instantly as you slide." 
            icon={Zap}
          />
          <FeatureCard 
            title="Pro Presets" 
            desc="Inspired by legendary films like Kodak Portra, Fujifilm, and vintage VHS aesthetics." 
            icon={Maximize2}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mt-8">
          <div className="p-4 rounded-xl bg-(--background) border border-blue-500/20 text-blue-500">
            <Info size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-(--foreground) mb-1">Creator's Tip</h4>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              For a realistic film look, combine <strong>Fine Grain</strong> with a subtle <strong>Vignette</strong> and slightly increased <strong>Contrast</strong>. If you're going for a vintage 90s feel, add <strong>Dust & Scratches</strong> and use a higher <strong>Grain Size</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
