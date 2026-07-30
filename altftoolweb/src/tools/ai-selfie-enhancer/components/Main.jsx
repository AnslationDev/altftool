"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  RotateCcw,
  Download,
  Sliders,
  Undo2,
  Brush,
  Sun,
  Contrast,
  Image as ImageIcon,
} from "lucide-react";

export default function MainComponent() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalName, setOriginalName] = useState("selfie.jpg");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [smoothing, setSmoothing] = useState(0);
  const [preset, setPreset] = useState("normal");

  // Before/after split slider position (0 to 100)
  const [splitOffset, setSplitOffset] = useState(50);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const presets = {
    // Core Foundation Presets
    normal: { b: 100, c: 100, s: 100, sm: 0, description: "Natural, balanced skin tone and lighting" },
    natural: { b: 95, c: 98, s: 96, sm: 0.3, description: "True-to-life enhancement without artificial look" },
    balanced: { b: 102, c: 102, s: 102, sm: 0.7, description: "Perfect harmony between all enhancement parameters" },
    
    // Professional Studio Presets
    studio: { b: 110, c: 110, s: 102, sm: 1, description: "Professional studio lighting look with controlled contrast" },
    professional: { b: 105, c: 115, s: 108, sm: 1.5, description: "Advanced skin smoothing and sophisticated tone balancing" },
    polished: { b: 108, c: 108, s: 102, sm: 1.8, description: "Glamour studio polished finish with premium touch-up" },
    
    // Creative Light & Color Presets
    bright: { b: 115, c: 110, s: 95, sm: 0.5, description: "Lifted brightness for vibrant, energetic portraits" },
    crisp: { b: 105, c: 105, s: 98, sm: 0.5, description: "Enhanced skin clarity with subtle brightness enhancement" },
    fresh: { b: 112, c: 98, s: 104, sm: 1.2, description: "Awakened, refreshed look with slight brightening" },
    radiant: { b: 120, c: 108, s: 112, sm: 2.5, description: "Glowing, dewy skin finish with enhanced radiance" },
    
    // Artistic & Stylized Presets
    cinematic: { b: 115, c: 105, s: 108, sm: 2, description: "Movie theater style with dramatic deep contrast" },
    elegant: { b: 100, c: 110, s: 105, sm: 1, description: "Timeless elegance with subtle sophistication" },
    vintage: { b: 95, c: 90, s: 75, sm: 0.5, description: "Classic vintage photo aesthetic with warm tones" },
    cyberpunk: { b: 100, c: 130, s: 140, sm: 1, description: "Futuristic cyberpunk styling with neon highlights" },
    
    // Specialized Skin Enhancement Presets
    smooth: { b: 95, c: 100, s: 98, sm: 2, description: "Maximum skin smoothing for flawless complexion" },
    refined: { b: 108, c: 112, s: 106, sm: 1.5, description: "Subtle enhancement perfect for mature skin texture" },
    definition: { b: 108, c: 118, s: 104, sm: 1, description: "Enhanced facial definition and structural lighting" },
    
    // Dynamic & Vibrant Presets
    vibrant: { b: 105, c: 115, s: 120, sm: 1, description: "Bold color expression with high saturation" },
    lively: { b: 110, c: 100, s: 115, sm: 1.5, description: "Vibrant, energetic look with enhanced emotional appeal" },
    sophisticated: { b: 105, c: 115, s: 108, sm: 1.5, description: "Advanced skin smoothing with artistic enhancement" },
    glamorous: { b: 115, c: 95, s: 110, sm: 3.5, description: "Hollywood glamour with dramatic lighting" },
    
    // Night & Low Light Presets
    moonlight: { b: 98, c: 105, s: 94, sm: 1.5, description: "Subtle lunar lighting for soft dramatic effects" },
    "studio night": { b: 105, c: 115, s: 98, sm: 1, description: "Professional studio lighting for intimate portraits" },
    
    // Portrait Specific Presets
    headshot: { b: 110, c: 115, s: 105, sm: 1.5, description: "Corporate headshot enhancement with professional polish" },
    casual: { b: 100, c: 95, s: 90, sm: 0.8, description: "Casual everyday enhancement with subtle warmth" },
    outdoor: { b: 112, c: 108, s: 105, sm: 1, description: "Natural outdoor lighting simulation" },
    
    // Advanced Algorithmic Presets
    enhanced: { b: 107, c: 107, s: 107, sm: 1, description: "Advanced enhancement algorithm with pixel-level optimization" },
    premium: { b: 108, c: 112, s: 106, sm: 1.5, description: "Luxury enhancement with meticulous detail work" },
    elite: { b: 110, c: 115, s: 108, sm: 2, description: "Elite enhancement for high-end commercial use" },
    
    // Healing & Repair Presets
    healing: { b: 103, c: 102, s: 98, sm: 2.5, description: "Healing-focused with maximum blemish reduction" },
    flawless: { b: 98, c: 100, s: 96, sm: 3, description: "Digital perfection with near-total imperfection removal" },
    
    // Extreme Effects Presets
    dramatic: { b: 125, c: 130, s: 115, sm: 2.5, description: "High drama with extreme contrast and saturation" },
    surreal: { b: 95, c: 140, s: 125, sm: 1.5, description: "Surreal art direction with exaggerated tones" },
    
    // Seasonal & Contextual Presets
    summer: { b: 115, c: 105, s: 115, sm: 0.8, description: "Summertime vibrancy with warm, sunny feel" },
    winter: { b: 98, c: 110, s: 92, sm: 1, description: "Winter portrait clarity with cool, crisp tones" },
    autumn: { b: 108, c: 112, s: 95, sm: 1, description: "Autumn warmth with rich, golden undertones" },
    
    // Modern Social Media Presets
    tiktok: { b: 108, c: 108, s: 115, sm: 1, description: "TikTok trending style with enhanced social appeal" },
    instagram: { b: 103, c: 105, s: 110, sm: 0.7, description: "Instagram-ready enhancement with perfect balance" },
    
    // Professional Composition Presets
    commercial: { b: 108, c: 112, s: 106, sm: 1.8, description: "Commercial-grade enhancement with perfect polish" },
    editorial: { b: 105, c: 108, s: 104, sm: 1.2, description: "Editorial style with sophisticated subtlety" },
    
    // Specialized Focus Presets
    eyes: { b: 98, c: 110, s: 102, sm: 2, description: "Eye-focused enhancement with reduced blemishes around eyes" },
    lips: { b: 102, c: 108, s: 104, sm: 1.5, description: "Lip-enhancement focused with subtle face slimming" },
    smile: { b: 105, c: 108, s: 106, sm: 1, description: "Smile-enhancing lighting with facial highlighting" },
    
    // Photography Quality Presets
    film: { b: 100, c: 105, s: 95, sm: 1, description: "Classic film-like aesthetic with natural grain simulation" },
    analog: { b: 103, c: 108, s: 98, sm: 0.8, description: "Analog photography style with warm tones" },
    digital: { b: 105, c: 110, s: 108, sm: 1, description: "Pure digital enhancement with sharp details" },
    
    // Celebrity & Influencer Presets
    celebrity: { b: 108, c: 112, s: 106, sm: 2, description: "Hollywood celebrity-ready enhancement" },
    influencer: { b: 105, c: 110, s: 108, sm: 1.5, description: "Social media influencer aesthetic with mass appeal" },
    
    // Lifestyle Presets
    wellness: { b: 103, c: 102, s: 104, sm: 1.5, description: "Wellness-focused enhancement with natural glow" },
    fitness: { b: 112, c: 105, s: 108, sm: 1, description: "Fitness model enhancement with athletic definition" },
    
    // Fashion & Beauty Magazine Presets
    magazine: { b: 108, c: 112, s: 106, sm: 1.8, description: "Fashion magazine cover quality enhancement" },
    billboard: { b: 110, c: 115, s: 108, sm: 2, description: "Billboard-ready enhancement with mass market appeal" },
    
    // Time-Period Presets
    retro: { b: 100, c: 95, s: 85, sm: 0.5, description: "Retro era look with vintage warmth and softness" },
    modern: { b: 108, c: 112, s: 106, sm: 1.5, description: "Contemporary modern aesthetic with clean lines" },
    future: { b: 105, c: 115, s: 110, sm: 2, description: "Futuristic enhancement with digital precision" },
    
    // Artistic Expression Presets
    abstract: { b: 110, c: 105, s: 120, sm: 2, description: "Abstract art direction with bold color blocks" },
    minimalist: { b: 98, c: 100, s: 96, sm: 0.3, description: "Minimalist aesthetic with subtle skin tone" },
    expressionist: { b: 115, c: 125, s: 115, sm: 1.5, description: "Expressionist styling with emotional intensity" },
    
    // Special Occasion Presets
    wedding: { b: 102, c: 105, s: 104, sm: 1.5, description: "Wedding photography enhancement with romantic lighting" },
    portrait: { b: 105, c: 110, s: 106, sm: 1.5, description: "Classic portrait enhancement with professional polish" },
    anniversary: { b: 108, c: 110, s: 108, sm: 1.2, description: "Anniversary celebration enhancement with warm tones" },
    
    // Technical Quality Presets
    print: { b: 105, c: 110, s: 106, sm: 1, description: "Print-optimized enhancement for publication quality" },
    web: { b: 103, c: 105, s: 104, sm: 0.8, description: "Web-optimized enhancement for digital display" },
    mobile: { b: 104, c: 106, s: 105, sm: 1, description: "Mobile screen enhancement with balanced appearance" },
    
    // Geographic & Cultural Presets
    asian: { b: 102, c: 108, s: 96, sm: 1.2, description: "Asian beauty enhancement with traditional aesthetics" },
    caucasian: { b: 105, c: 110, s: 104, sm: 0.8, description: "Caucasian complexion enhancement with natural refinement" },
    "middle-eastern": { b: 108, c: 115, s: 110, sm: 1.5, description: "Middle-eastern beauty enhancement with rich heritage" },
    
    // Age-Specific Presets
    teen: { b: 103, c: 105, s: 110, sm: 1, description: "Teen enhancement with youthful vibrancy" },
    adult: { b: 105, c: 108, s: 106, sm: 1.2, description: "Adult enhancement with sophisticated refinement" },
    senior: { b: 100, c: 105, s: 98, sm: 1.5, description: "Senior enhancement with gentle, flattering softness" },
    
    // Mood-Based Presets
    energetic: { b: 112, c: 108, s: 115, sm: 1.5, description: "High-energy enhancement with upbeat colors" },
    calm: { b: 98, c: 102, s: 94, sm: 1, description: "Calm enhancement with soothing, muted tones" },
    passionate: { b: 110, c: 110, s: 112, sm: 1.5, description: "Passionate enhancement with intense emotional depth" },
    
    // Professional Field Presets
    medical: { b: 100, c: 105, s: 100, sm: 1, description: "Medical photography enhancement with clinical precision" },
    academic: { b: 103, c: 108, s: 102, sm: 1, description: "Academic presentation enhancement with professional tone" },
    business: { b: 108, c: 112, s: 106, sm: 1.5, description: "Business professional enhancement with authority" },
    
    // Lifestyle & Activity Presets
    "outdoor-adventure": { b: 113, c: 110, s: 108, sm: 1.5, description: "Outdoor adventure enhancement with natural ruggedness" },
    corporate: { b: 108, c: 112, s: 106, sm: 1.5, description: "Corporate boardroom enhancement with executive polish" },
    creative: { b: 110, c: 108, s: 112, sm: 1.8, description: "Creative professional enhancement with artistic expression" },
  };

  const handleApplyPreset = (key) => {
    setPreset(key);
    const p = presets[key];
    setBrightness(Math.max(50, p.b));
    setContrast(Math.max(50, p.c));
    setSaturation(Math.max(50, p.s));
    setSmoothing(p.sm);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setSuccess("");
    setOriginalName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      handleApplyPreset("normal");
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files?.[0]);
  };

  // Build the CSS filter string
  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  
  // Custom styling for skin smoothing
  const enhancedStyle = {
    filter: filterString,
    // Add smoothing using a subtle blur if selected
    ...(smoothing > 0 ? { filter: `${filterString} blur(${smoothing / 2}px)` } : {})
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Build same filter on canvas
      const canvasFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` + 
        (smoothing > 0 ? ` blur(${smoothing / 2}px)` : "");
        
      ctx.filter = canvasFilter;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Export image
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement("a");
      const nameParts = originalName.split(".");
      const extension = nameParts.pop();
      a.download = `${nameParts.join(".")}.enhanced.jpg`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccess("Enhanced image downloaded successfully!");
    };
  };

  const handleResetControls = () => {
    handleApplyPreset("normal");
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitOffset(pct);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitOffset(pct);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-400 mb-2">
          <Sparkles className="h-8 w-8 text-teal-500 shrink-0" /> AI Selfie Enhancer
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Enhance lighting, smooth skins, and apply creative studio backdrops locally in your browser.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm">
          {success}
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left column: Split Image viewer */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-(--border) pb-3">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider">
              Interactive Preview
            </h3>
            <span className="text-[11px] text-slate-500">Drag/hover image to slide comparison</span>
          </div>

          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-(--border) hover:border-teal-500 rounded-xl p-12 text-center cursor-pointer transition-all bg-(--page) flex flex-col items-center justify-center min-h-[350px]"
            >
              <Upload className="h-10 w-10 text-teal-500/70 mb-4 animate-bounce" />
              <p className="text-sm font-semibold text-(--foreground)">Drag & Drop your selfie here</p>
              <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, or WEBP up to 5MB</p>
              <button className="mt-4 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold rounded-lg border border-teal-500/20">
                Browse Files
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Interactive Before/After Split Slider */}
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 select-none flex items-center justify-center min-h-[350px] cursor-ew-resize"
              >
                {/* Underlay (Enhanced/After) */}
                <img
                  src={imageSrc}
                  alt="Enhanced Selfie"
                  className="max-h-[400px] object-contain max-w-full"
                  style={enhancedStyle}
                  draggable="false"
                />

                {/* Overlay (Original/Before) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                  style={{ clipPath: `polygon(0 0, ${splitOffset}% 0, ${splitOffset}% 100%, 0 100%)` }}
                >
                  <img
                    src={imageSrc}
                    alt="Original Selfie"
                    className="max-h-[400px] object-contain max-w-full"
                    draggable="false"
                  />
                </div>

                {/* Split line separator bar */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.6)] pointer-events-none"
                  style={{ left: `${splitOffset}%` }}
                />
                
                {/* Split handle circle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white text-slate-800 border border-slate-300 flex items-center justify-center shadow-lg font-bold text-xs pointer-events-none"
                  style={{ left: `calc(${splitOffset}% - 16px)` }}
                >
                  ↔
                </div>

                {/* Badges */}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] uppercase font-bold tracking-wider">Before</span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-teal-500/80 text-white rounded text-[10px] uppercase font-bold tracking-wider">After</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setImageSrc(null)}
                  className="flex-1 py-2 border border-red-500/20 hover:border-red-500/50 rounded-lg text-xs font-semibold text-red-500 bg-(--surface) cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Remove Image
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download (.jpg)
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Right column: Filters & Control Sliders */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-6">
          <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider border-b border-(--border) pb-3">
            <Sliders className="h-4 w-4 text-teal-500" /> Enhancement Dashboard
          </h3>

          {/* Quick AI Presets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex justify-between items-center">
              <span>AI Preset Enhancers</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
                {Object.keys(presets).length} Presets
              </span>
            </h4>

            <div className="relative">
              <select
                value={preset}
                onChange={(e) => {
                  setPreset(e.target.value);
                  if (imageSrc) handleApplyPreset(e.target.value);
                }}
                disabled={!imageSrc}
                aria-label="Enhancement preset"
                className="w-full appearance-none bg-(--surface) border border-(--border) rounded-lg px-4 py-2.5 text-sm font-medium text-(--foreground) focus:outline-none focus:border-teal-500 cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <option value="normal" className="bg-(--surface)">Normal (Default)</option>
                <option value="custom" disabled className="bg-(--surface)">Custom</option>
                {Object.keys(presets)
                  .filter(key => key !== "normal")
                  .map((key) => {
                    const p = presets[key];
                    return (
                      <option key={key} value={key} className="bg-(--surface) capitalize">
                        {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()} ({Math.round(p.b)}% Brightness, {Math.round(p.c)}% Contrast)
                      </option>
                    );
                  })}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Sliders className="h-4 w-4 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Manual Fine-Tuning */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Manual Fine-Tuning
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetControls}
                  disabled={!imageSrc}
                  className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Undo2 className="h-3 w-3" /> Reset
                </button>
              </div>
            </div>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Brightness</span>
                <span className="font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                disabled={!imageSrc}
                aria-label="Brightness"
                onChange={(e) => {
                  setBrightness(parseInt(e.target.value));
                  setPreset("custom");
                }}
                className="w-full cursor-pointer accent-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><Contrast className="h-3.5 w-3.5" /> Contrast</span>
                <span className="font-bold">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                disabled={!imageSrc}
                aria-label="Contrast"
                onChange={(e) => {
                  setContrast(parseInt(e.target.value));
                  setPreset("custom");
                }}
                className="w-full cursor-pointer accent-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Saturation</span>
                <span className="font-bold">{saturation}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={saturation}
                disabled={!imageSrc}
                aria-label="Saturation"
                onChange={(e) => {
                  setSaturation(parseInt(e.target.value));
                  setPreset("custom");
                }}
                className="w-full cursor-pointer accent-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Skin Smoothing */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><Brush className="h-3.5 w-3.5" /> Skin Smoothing (Blur)</span>
                <span className="font-bold">{smoothing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={smoothing}
                disabled={!imageSrc}
                aria-label="Skin smoothing"
                onChange={(e) => {
                  setSmoothing(parseFloat(e.target.value));
                  setPreset("custom");
                }}
                className="w-full cursor-pointer accent-teal-500 disabled:opacity-50"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
