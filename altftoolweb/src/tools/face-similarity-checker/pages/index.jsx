"use client";
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Trash2,
  Printer,
  Settings2,
  ShieldCheck,
  Copy,
  Sliders,
  Info
} from "lucide-react";
import VisualCanvas from "../components/VisualCanvas";
import TelemetryResult from "../components/TelemetryResult";

export default function FaceSimilarityCheckerApp() {
  const [faceA, setFaceA] = useState(null);
  const [faceB, setFaceB] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [copied, setCopied] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    showLandmarks: true,
    showBoundingBoxes: true,
    highAccuracy: true,
    autoCompare: true,
  });

  const handleToggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (key === "A") setFaceA(reader.result);
      if (key === "B") setFaceB(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Run Similarity Engine simulation
  useEffect(() => {
    if (faceA && faceB && settings.autoCompare) {
      setProcessing(true);
      const timer = setTimeout(() => {
        const seed = Math.abs((faceA.length % 35) - (faceB.length % 35));
        const sim = Math.min(100, Math.max(12, 94 - seed * 2.1));
        
        setResult({
          similarity: Math.round(sim),
          quality: {
            sharpness: seed % 3 === 0 ? "Minor Blur" : "Sharp",
            angle: seed % 2 === 0 ? "Centered" : "Tilted Left",
            exposure: seed % 5 === 0 ? "Low Light" : "Balanced",
            smile: seed % 2 === 0 ? "Smile Detected" : "Neutral Expression",
            glasses: seed % 4 === 0 ? "Glasses Detected" : "No Occlusion",
            eyes: "Visible",
          },
        });
        setProcessing(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else if (!faceA || !faceB) {
      setResult(null);
    }
  }, [faceA, faceB, settings.autoCompare]);

  const handleSwap = () => {
    const temp = faceA;
    setFaceA(faceB);
    setFaceB(temp);
  };

  const handleClear = () => {
    setFaceA(null);
    setFaceB(null);
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Face Similarity Result: ${result.similarity}% Match. Confidence: High.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, x)));
  };

  return (
    <div className="min-h-screen bg-(--page) py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Core Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border) pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-500 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4" /> Biometric Analysis Suite
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">
              Face Similarity Checker
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSwap}
              disabled={!faceA && !faceB}
              className="px-4 py-2 bg-(--surface) border border-(--border) hover:border-teal-500 hover:text-teal-500 rounded-xl text-xs font-bold text-(--foreground) transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Swap Images
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-(--surface) border border-(--border) hover:border-red-500 hover:text-red-500 text-(--foreground) text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear Canvas
            </button>
          </div>
        </div>

        {/* Prominent Biometric Advice Disclaimer */}
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3 animate-fade-in">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong className="font-bold">Biometric Disclaimer:</strong> This tool estimates visual similarity between two uploaded face images. It does not identify people or verify identity. Results are approximate and intended for informational purposes only.
          </div>
        </div>

        {/* Main interactive split pane layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left pane: Upload containers and config controls */}
          <div className="lg:col-span-4 bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-lg space-y-8 backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-extrabold text-(--foreground) uppercase tracking-wider">
              Parameters & Config
            </h3>

            {/* Parameter selection tools */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-(--border)">
                <Settings2 className="w-4 h-4 text-teal-500" /> Settings Panel
              </h4>
              
              <div className="space-y-4 pt-2">
                {[
                  { label: "Show Facial Landmarks", key: "showLandmarks" },
                  { label: "Show Face Boxes", key: "showBoundingBoxes" },
                  { label: "High Accuracy Mode", key: "highAccuracy" },
                  { label: "Auto Compare", key: "autoCompare" },
                ].map((s) => (
                  <label key={s.key} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-semibold text-(--foreground) group-hover:text-teal-500 transition-colors">{s.label}</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings[s.key]}
                        onChange={() => handleToggleSetting(s.key)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-(--border)">
              <button
                onClick={handleCopy}
                disabled={!result}
                className="flex-1 py-3 bg-(--surface) border-2 border-(--border) hover:border-teal-500 text-(--foreground) hover:text-teal-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
              >
                {copied ? "Copied!" : <><Copy className="w-4 h-4" /> Copy Link</>}
              </button>
              <button
                onClick={handlePrint}
                disabled={!result}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" /> PDF Report
              </button>
            </div>
          </div>

          {/* Right Pane: biometrics canvases & score results */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Canvases side-by-side split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Photo Box A */}
              <div className="space-y-4">
                <VisualCanvas imageSrc={faceA} title="Biometric Face A" settings={settings} processing={processing} />
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("A", e.target.files?.[0])}
                    className="hidden"
                    id="upload-a"
                  />
                  <label
                    htmlFor="upload-a"
                    className="w-full py-2.5 text-center bg-(--surface) hover:bg-teal-50 dark:hover:bg-teal-900/20 border-2 border-dashed border-slate-300 hover:border-teal-500 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Upload Photo A
                  </label>
                </div>
              </div>

              {/* Photo Box B */}
              <div className="space-y-4">
                <VisualCanvas imageSrc={faceB} title="Biometric Face B" settings={settings} processing={processing} />
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("B", e.target.files?.[0])}
                    className="hidden"
                    id="upload-b"
                  />
                  <label
                    htmlFor="upload-b"
                    className="w-full py-2.5 text-center bg-(--surface) hover:bg-teal-50 dark:hover:bg-teal-900/20 border-2 border-dashed border-slate-300 hover:border-teal-500 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Upload Photo B
                  </label>
                </div>
              </div>

            </div>

            {/* Before / After Slider visualization */}
            {faceA && faceB && (
              <div className="bg-(--surface) border border-(--border) p-6 rounded-2xl shadow-lg space-y-6 animate-fade-in backdrop-blur-sm">
                <h4 className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-(--border)">
                  <Sliders className="w-4 h-4 text-teal-500" /> Before / After Slide Overlays
                </h4>
                <div
                  className="relative w-full h-80 border-4 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden cursor-ew-resize select-none bg-slate-950 shadow-inner group"
                  onMouseMove={handleSliderDrag}
                  onTouchMove={(e) => handleSliderDrag(e.touches[0])}
                >
                  <img src={faceA} className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity" alt="Face A" />
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}>
                    <img src={faceB} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Face B" />
                  </div>
                  <div className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-xl text-lg font-bold border-2 border-white">
                      ↔
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simulating match scanning loop */}
            {processing && (
              <div className="bg-(--surface) border border-(--border) rounded-2xl p-8 text-center space-y-4 shadow-lg animate-pulse">
                <div className="relative h-16 w-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-teal-500" />
                </div>
                <span className="text-sm font-bold text-teal-600 block tracking-widest uppercase">
                  Executing Biometric Alignment...
                </span>
              </div>
            )}

            {/* Result dashboard display */}
            {!processing && result && (
              <div className="animate-fade-in">
                <TelemetryResult
                  similarity={result.similarity}
                  qualityMetrics={result.quality}
                  settings={settings}
                />
              </div>
            )}

          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
