"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Camera, RefreshCw, Check, Sparkles, Droplet, Download, Copy, Info } from "lucide-react";
import { getFaceApi } from "../../emotion-detector/services/faceApiClient";

const FITZPATRICK_TYPES = [
  { type: "Type I", description: "Very fair skin, highly sensitive to sun, always burns, never tans." },
  { type: "Type II", description: "Fair skin, highly sensitive to sun, burns easily, tans minimally." },
  { type: "Type III", description: "Medium-fair skin, mildly sensitive, burns moderately, tans gradually." },
  { type: "Type IV", description: "Olive skin, low sensitivity, burns minimally, tans easily." },
  { type: "Type V", description: "Brown skin, very low sensitivity, rarely burns, tans extremely easily." },
  { type: "Type VI", description: "Deep brown/black skin, least sensitive, never burns, deeply pigmented." }
];

export default function ToolHome() {
  const [photo, setPhoto] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const initWebcam = async () => {
    setError("");
    setPhoto(null);
    setResult(null);
    setUseWebcam(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Unable to access webcam. Please check permissions or upload a photo instead.");
      setUseWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseWebcam(false);
  };

  const processFile = (file) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("Image size exceeds the 15MB limit.");
      return;
    }
    setError("");
    stopWebcam();

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL("image/png");
    setPhoto(base64);
    stopWebcam();
    runAnalysis(base64);
  };

  const handleAnalyzePhoto = () => {
    if (!photo) return;
    runAnalysis(photo);
  };

  const runAnalysis = async (imgSrc) => {
    setAnalyzing(true);
    setResult(null);
    setError("");

    try {
      const faceapi = await getFaceApi();
      const img = new Image();
      img.src = imgSrc;

      img.onload = async () => {
        // Load face-api models
        const MODEL_URL = "/models";
        if (!faceapi.nets.tinyFaceDetector.params) {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        }

        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
        
        let sampleX = Math.round(img.width / 2);
        let sampleY = Math.round(img.height / 2);
        let sampleW = 50;
        let sampleH = 50;

        if (detection) {
          const box = detection.box;
          // Sample cheek: right of nose bridge (~65% x, ~60% y relative to bounding box)
          sampleX = Math.round(box.x + box.width * 0.65);
          sampleY = Math.round(box.y + box.height * 0.6);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Clamp sample box
        sampleX = Math.max(0, Math.min(img.width - sampleW, sampleX - sampleW / 2));
        sampleY = Math.max(0, Math.min(img.height - sampleH, sampleY - sampleH / 2));

        const pixelData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;
        
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;

        for (let i = 0; i < pixelData.length; i += 4) {
          sumR += pixelData[i];
          sumG += pixelData[i + 1];
          sumB += pixelData[i + 2];
          count++;
        }

        const avgR = Math.round(sumR / count);
        const avgG = Math.round(sumG / count);
        const avgB = Math.round(sumB / count);

        const hex = rgbToHex(avgR, avgG, avgB);
        const hsl = rgbToHsl(avgR, avgG, avgB);

        // Determine Undertone: based on Hue bounds (hues 15-40 are Warm, 0-15 or 325-360 Cool, 40-50 Neutral)
        let undertone = "Neutral";
        if (hsl.h >= 14 && hsl.h <= 36) {
          undertone = "Warm";
        } else if (hsl.h < 14 || hsl.h > 320) {
          undertone = "Cool";
        }

        // Determine Fitzpatrick Skin Type (Type I to VI based on lightness)
        let fitzType = "Type III";
        let fitzIdx = 2;

        if (hsl.l > 85) {
          fitzType = "Type I";
          fitzIdx = 0;
        } else if (hsl.l > 72) {
          fitzType = "Type II";
          fitzIdx = 1;
        } else if (hsl.l > 55) {
          fitzType = "Type III";
          fitzIdx = 2;
        } else if (hsl.l > 40) {
          fitzType = "Type IV";
          fitzIdx = 3;
        } else if (hsl.l > 25) {
          fitzType = "Type V";
          fitzIdx = 4;
        } else {
          fitzType = "Type VI";
          fitzIdx = 5;
        }

        // Recommend matching colors based on undertone
        let powerColors = ["#1E3A8A", "#0D9488", "#7C3AED", "#DB2777", "#F3F4F6"]; // Neutral default
        let lipstick = ["#E11D48", "#BE123C", "#9F1239", "#FDA4AF", "#F43F5E"];
        let jewelry = "Gold & Silver Balanced";

        if (undertone === "Warm") {
          powerColors = ["#EA580C", "#D97706", "#854D0E", "#65A30D", "#78716C"];
          lipstick = ["#DC2626", "#C2410C", "#B45309", "#EA580C", "#991B1B"];
          jewelry = "Yellow Gold";
        } else if (undertone === "Cool") {
          powerColors = ["#2563EB", "#4F46E5", "#0284C7", "#0891B2", "#475569"];
          lipstick = ["#DB2777", "#C084FC", "#EC4899", "#8B5CF6", "#E11D48"];
          jewelry = "Silver & White Gold";
        }

        setResult({
          hex,
          rgb: `rgb(${avgR}, ${avgG}, ${avgB})`,
          hsl: `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`,
          undertone,
          fitzType,
          fitzIdx,
          powerColors,
          lipstick,
          jewelry,
          matchedByAI: !!detection
        });
        setAnalyzing(false);
      };
    } catch (err) {
      console.error(err);
      setError("An error occurred during skin analysis. Please try again.");
      setAnalyzing(false);
    }
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Skin Tone Report ===
Surface Color: ${result.hex}
Coordinates: ${result.rgb} | ${result.hsl}

Undertone: ${result.undertone}
Fitzpatrick Skin Type: ${result.fitzType}

Recommended Wardrobe & Grooming:
------------------------------------------
Recommended Clothes Palettes: ${result.powerColors.join(", ")}
Recommended Lip Shades: ${result.lipstick.join(", ")}
Recommended Metal: ${result.jewelry}
==========================================`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownloadSwatch = () => {
    if (!result) return;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    
    // Draw circular swatch
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, 2 * Math.PI);
    ctx.fillStyle = result.hex;
    ctx.fill();

    // Print text info
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(result.hex.toUpperCase(), 150, 140);
    ctx.fillText(`${result.undertone} Undertone`, 150, 170);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `skin-tone-swatch-${result.hex}.png`;
    a.click();
  };

  const handleReset = () => {
    stopWebcam();
    setPhoto(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-1">
            <Droplet className="text-rose-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Skin Tone Analyzer
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Sample surface pigments from your camera feed or photos to calculate Fitzpatrick values and get wardrobe guidelines.
          </p>
        </div>

        {/* Workspace Layout */}
        <div className="space-y-8">
          
          {/* Capture/Upload Panel */}
          <div className="bg-card border border-border rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              Capture or Upload Image
            </h3>

            {error && (
              <div className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-950/20 rounded-xl text-xs text-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {!photo && !useWebcam && !analyzing ? (
              <div className="space-y-4">
                
                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary hover:bg-[var(--anslation-ds-soft)] transition"
                >
                  <Upload className="text-muted-foreground mb-2 mx-auto" size={24} />
                  <span className="text-xs font-bold text-foreground block">Upload Photo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* Webcam Activation Button */}
                <button
                  type="button"
                  onClick={initWebcam}
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-2 text-xs"
                >
                  <Camera size={16} /> Activate Face Camera
                </button>

              </div>
            ) : useWebcam ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-border flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                  
                  {/* Guideline Circular Target Overlay */}
                  <div className="absolute inset-0 border-[3px] border-dashed border-cyan-400/60 rounded-full w-24 h-24 m-auto animate-pulse flex items-center justify-center">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Cheek Target</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCapture}
                    className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition text-xs"
                  >
                    Capture Swatch
                  </button>
                  <button
                    onClick={stopWebcam}
                    className="h-10 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : analyzing ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="alt-ui-spinner border-t-rose-500" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground text-sm animate-pulse">Sampling Epidermal Ratios...</h4>
                  <p className="text-xs text-muted-foreground">Isolating face coordinates and clustering skin tone pixels.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Photo Preview with Target guidance scanner */}
                <div className="relative w-full aspect-video max-h-[400px] bg-slate-950 border border-border rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <img src={photo} alt="Face Sample" className="w-full h-full object-contain" />
                  <div className="absolute border-2 border-dashed border-rose-500/80 rounded-full w-14 h-14 animate-[ping_3s_infinite]" />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyzePhoto}
                    className="flex-1 h-10 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl cursor-pointer transition text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <Droplet size={14} /> Run Analysis
                  </button>
                  <button
                    onClick={handleReset}
                    className="h-10 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Analysis Dashboard */}
          <div className="w-full space-y-6">
            {result ? (
              <div className="space-y-6">
                
                {/* Color Swatch card */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Swatch circle with pulsing gradient */}
                  <div
                    className="w-24 h-24 rounded-full border-4 border-border shadow-md animate-pulse flex items-center justify-center relative"
                    style={{ backgroundColor: result.hex, animationDuration: "3s" }}
                  />

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Detected Color Coordinates</span>
                    <h3 className="text-xl font-mono font-black text-foreground">
                      {result.hex.toUpperCase()}
                    </h3>
                    <div className="text-[11px] font-mono text-muted-foreground space-y-0.5">
                      <p>{result.rgb}</p>
                      <p>{result.hsl}</p>
                    </div>
                  </div>
                </div>

                {/* Undertone and Fitzpatrick type cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Undertone Classification</span>
                    <span className="text-base font-bold text-foreground">
                      {result.undertone === "Warm" ? "Warm Undertone" : result.undertone === "Cool" ? "Cool Undertone" : "Neutral Undertone"}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Matches clothing hues, cosmetics shades, and metals.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Fitzpatrick Type</span>
                    <span className="text-base font-bold text-foreground">
                      {result.fitzType}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {FITZPATRICK_TYPES[result.fitzIdx].description}
                    </p>
                  </div>
                </div>

                {/* Recommendation Engine palettes */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-rose-500" /> Style & Color Coordination Guide
                  </h4>
                  
                  {/* Power colors */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block">Wardrobe Power Colors</span>
                    <div className="flex gap-2">
                      {result.powerColors.map((col) => (
                        <div
                          key={col}
                          className="w-10 h-10 rounded-xl border border-border"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lipstick */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block">Cosmetic Lipstick Hues</span>
                    <div className="flex gap-2">
                      {result.lipstick.map((col) => (
                        <div
                          key={col}
                          className="w-10 h-10 rounded-xl border border-border"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Jewelry metal */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">Jewelry Metal Pairing</span>
                    <span className="text-xs text-muted-foreground font-semibold">{result.jewelry}</span>
                  </div>
                </div>

                {/* Export actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadSwatch}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
                  >
                    <Download size={18} /> Export Swatch
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-teal-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} /> Copy Report
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-4 py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Droplet className="text-muted-foreground" size={28} />
                </div>
                <h3 className="font-semibold text-lg text-foreground">Awaiting Color Sample</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Activate your webcam or upload a close-up facial image in the left panel to scan surface pigments.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
