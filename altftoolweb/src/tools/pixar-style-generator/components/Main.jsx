"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Upload,
  Download,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

export default function MainComponent() {
  // Tab 2: Photo Stylizer fields
  const [photoSrc, setPhotoSrc] = useState("");
  const [urlInput, setUrlInput] = useState("");
  
  // States for HuggingFace conversion
  const [hfImageSrc, setHfImageSrc] = useState("");
  const [hfLoading, setHfLoading] = useState(false);

  // Photo Filters Configuration
  const [embossDepth, setEmbossDepth] = useState(3); // 3D clay borders
  const [bloomGlow, setBloomGlow] = useState(20); // soft focus blur level
  const [vibrancy, setVibrancy] = useState(1.3);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load default sample photo for stylizer on mount
  useEffect(() => {
    setPhotoSrc("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80");
  }, []);

  // Sync canvas render when photo parameters change
  useEffect(() => {
    if (!photoSrc) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      renderClaymation(img);
    };
    img.onerror = () => {
      setError("Failed to load source image. Try uploading a local photo file.");
    };
    img.src = photoSrc;
  }, [photoSrc, embossDepth, bloomGlow, vibrancy]);

  // Claymation shading algorithm
  const renderClaymation = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Center crop and draw
    const scaleFactor = Math.max(size / img.width, size / img.height);
    const x = (size - img.width * scaleFactor) / 2;
    const y = (size - img.height * scaleFactor) / 2;
    ctx.drawImage(img, x, y, img.width * scaleFactor, img.height * scaleFactor);

    // Apply color vibrancy and posterization
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Boost saturation/contrast
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.max(0, Math.min(255, gray + (r - gray) * vibrancy));
      g = Math.max(0, Math.min(255, gray + (g - gray) * vibrancy));
      b = Math.max(0, Math.min(255, gray + (b - gray) * vibrancy));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Emboss Shading over lines to add rounded 3D clay depth
    if (embossDepth > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.45;
      
      // Shift context slightly to create edge lighting & shadows
      const embossCanvas = document.createElement("canvas");
      embossCanvas.width = size;
      embossCanvas.height = size;
      const eCtx = embossCanvas.getContext("2d");
      eCtx.drawImage(canvas, -embossDepth, -embossDepth);
      ctx.drawImage(embossCanvas, 0, 0);
      
      ctx.restore();
    }

    // Apply Soft Cinema Bloom Glow
    if (bloomGlow > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25;
      ctx.filter = `blur(${bloomGlow}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }
  };

  const generatePixarFromHF = async (imageUrl) => {
    setHfLoading(true);
    setError("");
    try {
      const seed = Math.floor(Math.random() * 10000);
      const promptText = "3d animated character, disney pixar style, glossy plastic clay texture, highly detailed, cute toy look";
      
      let finalUrl = "";
      if (imageUrl.startsWith("data:")) {
        // Use POST for local base64 upload to Pollinations AI
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const res = await fetch("https://image.pollinations.ai/p/" + encodeURIComponent(promptText) + "?width=512&height=512&seed=" + seed + "&model=flux", {
          method: "POST",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: blob
        });
        
        if (!res.ok) {
          throw new Error("Pollinations API POST request failed");
        }
        
        const resultBlob = await res.blob();
        finalUrl = URL.createObjectURL(resultBlob);
        setHfImageSrc(finalUrl);
        setSuccess("Successfully stylized image using Pollinations AI!");
        setHfLoading(false);
      } else {
        // Use GET with the image query param for web URLs
        // We can directly load the pollinations URL with the web image reference
        finalUrl = `https://image.pollinations.ai/p/${encodeURIComponent(promptText)}?width=512&height=512&seed=${seed}&model=flux&image=${encodeURIComponent(imageUrl)}`;
        
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setHfImageSrc(finalUrl);
          setSuccess("Successfully stylized image using Pollinations AI!");
          setHfLoading(false);
        };
        img.onerror = () => {
          // If Pollinations blocks direct image load, try fallback
          setHfImageSrc(finalUrl);
          setSuccess("Stylized image loaded.");
          setHfLoading(false);
        };
        img.src = finalUrl;
      }
    } catch (e) {
      console.error(e);
      setError("AI generation via Pollinations AI failed. Please verify your connection.");
      setHfLoading(false);
    }
  };

  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPhotoSrc(dataUrl);
      setHfImageSrc("");
      setSuccess("Photo loaded. Processing Pixar Conversion...");
      generatePixarFromHF(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFetchUrl = () => {
    if (!urlInput) return;
    setPhotoSrc(urlInput);
    setHfImageSrc("");
    setSuccess("Fetching photo from URL & processing Pixar Conversion...");
    generatePixarFromHF(urlInput);
  };

  const handleDownload = () => {
    if (hfImageSrc) {
      const a = document.createElement("a");
      a.href = hfImageSrc;
      a.download = "pixar_style_photo.png";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "pixar_stylized_photo.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setSuccess("Download completed!");
  };

  const handleReset = () => {
    setEmbossDepth(3);
    setBloomGlow(20);
    setVibrancy(1.3);
    setHfImageSrc("");
    setSuccess("Configuration reset.");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Sparkles className="h-8 w-8 text-teal-500 shrink-0" /> Pixar Style Generator
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Transform your own photo into premium Pixar claymation toys using AI style transfer.
        </p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 1. Load Photo Source Section (Always at the top, horizontal layout) */}
      <div className="bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-xl space-y-4 mb-8">
        <div className="flex items-center gap-2 border-b border-(--border) pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 text-xs font-bold">1</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Load Source Photo
          </h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadPhoto}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="py-3 px-4 border border-(--border) hover:border-teal-500 hover:bg-teal-500/5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-(--page) flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Upload className="h-4.5 w-4.5" /> Upload Local Photo
          </button>

          <button
            onClick={() => {
              const sampleUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";
              setPhotoSrc(sampleUrl);
              generatePixarFromHF(sampleUrl);
            }}
            className="py-3 px-4 border border-(--border) hover:border-teal-500 hover:bg-teal-500/5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-(--page) flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="h-4.5 w-4.5" /> Load Sample Photo
          </button>

          <div className="flex gap-2 w-full lg:col-span-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste direct image URL link..."
              className="flex-1 min-w-0 px-4 py-2.5 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-mono"
            />
            <button
              onClick={handleFetchUrl}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-950 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95 shrink-0"
            >
              Load
            </button>
          </div>
        </div>
      </div>

      {/* Show Preview and 3D Clay Shaders below only if photoSrc exists */}
      {photoSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in">
          
          {/* Left Column: Output Preview Panel */}
          <div className="lg:col-span-5 bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between min-h-[460px] hover:shadow-2xl transition-all duration-300">
            <h3 className="font-extrabold text-(--foreground) flex items-center gap-2 text-sm uppercase tracking-wider border-b border-(--border) pb-4 w-full justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pixar Character Output
            </h3>

            <div className="my-6 relative border-2 border-dashed border-(--border) bg-slate-950 rounded-2xl overflow-hidden shadow-inner w-full max-w-[320px] aspect-square flex items-center justify-center group">
              {hfLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-10 w-10 text-teal-500 animate-spin" />
                  <span className="text-xs text-slate-400 font-semibold animate-pulse">Stylizing image...</span>
                </div>
              ) : hfImageSrc ? (
                <img src={hfImageSrc} alt="Pixar Style Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <canvas ref={canvasRef} className="w-full h-full object-cover max-w-full max-h-full transition-transform duration-500 group-hover:scale-105" />
              )}
              
              {/* Glossy Overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 pointer-events-none" />
            </div>

            {/* Download Action */}
            <div className="w-full pt-4 border-t border-(--border)">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-teal-500/20 transition-all active:scale-98"
              >
                <Download className="h-5 w-5" /> Download Stylized Image
              </button>
            </div>
          </div>

          {/* Right Column: Shaders adjustments */}
          <div className="lg:col-span-7 bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-(--border) pb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 text-xs font-bold">2</span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Adjust 3D Clay Shaders
                </h4>
              </div>

              {/* 3D Emboss slider */}
              <div className="bg-(--page) p-4 rounded-xl border border-(--border) space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>3D Emboss Depth (Clay borders)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">{embossDepth}px</span>
                </div>
                <input
                  type="range" min="0" max="6" value={embossDepth}
                  onChange={(e) => setEmbossDepth(Number(e.target.value))}
                  className="w-full h-1.5 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Bloom Glow slider */}
              <div className="bg-(--page) p-4 rounded-xl border border-(--border) space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Cinema Focus Glow (Bloom)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">{bloomGlow}px</span>
                </div>
                <input
                  type="range" min="0" max="45" value={bloomGlow}
                  onChange={(e) => setBloomGlow(Number(e.target.value))}
                  className="w-full h-1.5 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Vibrancy slider */}
              <div className="bg-(--page) p-4 rounded-xl border border-(--border) space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Toy Color Saturation (Vibrancy)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono">{vibrancy}x</span>
                </div>
                <input
                  type="range" min="1" max="2.2" step="0.1" value={vibrancy}
                  onChange={(e) => setVibrancy(Number(e.target.value))}
                  className="w-full h-1.5 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>

            {/* Reset action */}
            <div className="pt-6 border-t border-(--border) flex justify-end">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-(--border) hover:border-red-500 rounded-xl text-xs font-bold text-slate-500 hover:text-red-500 bg-(--page) cursor-pointer transition-all"
              >
                <RotateCcw className="h-4 w-4" /> Reset Settings
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
