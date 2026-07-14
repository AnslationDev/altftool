"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileImage,
  Download,
  Settings2,
  Trash2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Info,
  Maximize2,
  FileText,
} from "lucide-react";

// Popular exam presets mapping
const PRESETS = {
  custom: {
    name: "Custom Dimensions",
    width: 400,
    height: 600,
    photoRatio: 0.7,
    minKB: 10,
    maxKB: 100,
  },
  upsc: {
    name: "UPSC Combined (350x525)",
    width: 350,
    height: 525,
    photoRatio: 0.67,
    minKB: 20,
    maxKB: 140,
  },
  ibps: {
    name: "IBPS / Bank Exam (400x550)",
    width: 400,
    height: 550,
    photoRatio: 0.72,
    minKB: 20,
    maxKB: 50,
  },
  ssc: {
    name: "SSC Combined (300x500)",
    width: 300,
    height: 500,
    photoRatio: 0.7,
    minKB: 10,
    maxKB: 50,
  },
  jee: {
    name: "JEE Main / NTA (350x450)",
    width: 350,
    height: 450,
    photoRatio: 0.75,
    minKB: 10,
    maxKB: 200,
  },
  neet: {
    name: "NEET UG / Medical (350x450)",
    width: 350,
    height: 450,
    photoRatio: 0.75,
    minKB: 10,
    maxKB: 200,
  },
  gate: {
    name: "GATE Exam (480x640)",
    width: 480,
    height: 640,
    photoRatio: 0.75,
    minKB: 10,
    maxKB: 150,
  },
  cat: {
    name: "CAT MBA Portal (150x200)",
    width: 150,
    height: 200,
    photoRatio: 0.7,
    minKB: 20,
    maxKB: 80,
  },
  nda: {
    name: "NDA / CDS UPSC (350x525)",
    width: 350,
    height: 525,
    photoRatio: 0.67,
    minKB: 20,
    maxKB: 140,
  },
};

export default function MainComponent() {
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);

  // Settings
  const [preset, setPreset] = useState("upsc");
  const [customWidth, setCustomWidth] = useState(PRESETS.custom.width);
  const [customHeight, setCustomHeight] = useState(PRESETS.custom.height);
  const [gap, setGap] = useState(10);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [photoScale, setPhotoScale] = useState(100);
  const [signScale, setSignScale] = useState(100);
  const [photoRatio, setPhotoRatio] = useState(0.7);

  // Compression & Output
  const [targetMaxKB, setTargetMaxKB] = useState(50);
  const [targetMinKB, setTargetMinKB] = useState(20);
  const [compressFormat, setCompressFormat] = useState("image/jpeg");
  const [outputDataUrl, setOutputDataUrl] = useState("");
  const [outputSizeKB, setOutputSizeKB] = useState(0);
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef(null);
  const photoInputRef = useRef(null);
  const signInputRef = useRef(null);

  // Handle Preset Selection
  useEffect(() => {
    if (preset !== "custom") {
      const p = PRESETS[preset];
      setCustomWidth(p.width);
      setCustomHeight(p.height);
      setPhotoRatio(p.photoRatio);
      setTargetMinKB(p.minKB);
      setTargetMaxKB(p.maxKB);
    }
  }, [preset]);

  // Redraw Canvas when settings/images change
  useEffect(() => {
    generateMergedImage();
  }, [
    photo,
    signature,
    preset,
    customWidth,
    customHeight,
    gap,
    bgColor,
    photoScale,
    signScale,
    photoRatio,
    targetMaxKB,
    compressFormat,
  ]);

  // Load Image file helper
  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0], setPhoto);
    }
  };

  const handleSignUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0], setSignature);
    }
  };

  const loadImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        callback(img);
        setError("");
      };
      img.onerror = () => {
        setError("Failed to parse image file. Use standard JPEG, PNG or WEBP files.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Iterative binary quality adjustment loop to fit target file size limit
  const compressToTargetKB = (canvas, format, minKB, maxKB) => {
    if (format === "image/png") {
      const dataUrl = canvas.toDataURL(format);
      const sizeKB = Math.round((dataUrl.split(",")[1].length * 3) / 4 / 1024);
      return { dataUrl, sizeKB };
    }

    let low = 0.05;
    let high = 0.98;
    let bestQuality = 0.85;
    let bestDataUrl = canvas.toDataURL(format, bestQuality);
    let bestSizeKB = Math.round((bestDataUrl.split(",")[1].length * 3) / 4 / 1024);

    if (bestSizeKB <= maxKB && bestSizeKB >= minKB) {
      return { dataUrl: bestDataUrl, sizeKB: bestSizeKB };
    }

    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2;
      const dataUrl = canvas.toDataURL(format, mid);
      const sizeKB = Math.round((dataUrl.split(",")[1].length * 3) / 4 / 1024);

      if (sizeKB <= maxKB) {
        bestQuality = mid;
        bestDataUrl = dataUrl;
        bestSizeKB = sizeKB;
        low = mid;
      } else {
        high = mid;
      }
    }

    return { dataUrl: bestDataUrl, sizeKB: bestSizeKB };
  };

  // Canvas drawing routine
  const generateMergedImage = () => {
    if (!photo && !signature) {
      setOutputDataUrl("");
      setOutputSizeKB(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = Number(customWidth) || 350;
    const height = Number(customHeight) || 525;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const borderGap = Number(gap) || 0;
    const photoAreaHeight = Math.round(height * photoRatio) - Math.round(borderGap / 2);
    const signAreaHeight = height - photoAreaHeight - borderGap;

    if (photo) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, photoAreaHeight);
      ctx.clip();

      const scale = photoScale / 100;
      const sWidth = photo.width * scale;
      const sHeight = photo.height * scale;

      const x = (width - sWidth) / 2;
      const y = (photoAreaHeight - sHeight) / 2;

      ctx.drawImage(photo, x, y, sWidth, sHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PHOTO PLACEHOLDER", width / 2, photoAreaHeight / 2);
    }

    if (borderGap > 0) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, photoAreaHeight, width, borderGap);
    }

    if (signature) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, photoAreaHeight + borderGap, width, signAreaHeight);
      ctx.clip();

      const scale = signScale / 100;
      const sWidth = signature.width * scale;
      const sHeight = signature.height * scale;

      const x = (width - sWidth) / 2;
      const y = photoAreaHeight + borderGap + (signAreaHeight - sHeight) / 2;

      ctx.drawImage(signature, x, y, sWidth, sHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SIGNATURE PLACEHOLDER", width / 2, photoAreaHeight + borderGap + signAreaHeight / 2);
    }

    const targetFormat = compressFormat === "application/pdf" ? "image/jpeg" : compressFormat;
    const { dataUrl, sizeKB } = compressToTargetKB(canvas, targetFormat, targetMinKB, targetMaxKB);
    setOutputDataUrl(dataUrl);
    setOutputSizeKB(sizeKB);
    setOutputWidth(width);
    setOutputHeight(height);
  };

  const handleDownload = async () => {
    if (!outputDataUrl) return;

    if (compressFormat === "application/pdf") {
      setLoading(true);
      try {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: outputWidth > outputHeight ? "landscape" : "portrait",
          unit: "px",
          format: [outputWidth, outputHeight],
        });
        pdf.addImage(outputDataUrl, "JPEG", 0, 0, outputWidth, outputHeight);
        pdf.save(`merged-document-${outputWidth}x${outputHeight}.pdf`);
        setSuccess("Downloaded joined document as PDF!");
      } catch (err) {
        setError(`PDF conversion failed: ${err.message}`);
      }
      setLoading(false);
      setTimeout(() => setSuccess(""), 4000);
      return;
    }

    const extension = compressFormat === "image/png" ? "png" : "jpg";
    const filename = `merged-document-${outputWidth}x${outputHeight}-${outputSizeKB}kb.${extension}`;

    const link = document.createElement("a");
    link.href = outputDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("Downloaded joined document successfully!");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      {/* Page Title */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2 flex items-center justify-center gap-2">
          Join Photo & Signature
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Merge passport photographs and scanned signatures into single compliant files for competitive exams and employment portals.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Upload Panels (Always side-by-side horizontally at the top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Photo Upload Card */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm">
          <h3 className="text-sm font-bold text-(--foreground) mb-3 uppercase tracking-wider flex items-center gap-2">
            <FileImage className="h-4 w-4 text-teal-500" /> 1. Upload Passport Photo
          </h3>
          {!photo ? (
            <div
              onClick={() => photoInputRef.current.click()}
              className="border-2 border-dashed border-teal-500/20 hover:border-teal-500/50 bg-(--page) rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-teal-500/60 mb-2 animate-bounce" />
              <span className="text-xs font-semibold text-(--foreground)">Choose Passport Photo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">JPEG, PNG, or WEBP</span>
            </div>
          ) : (
            <div className="relative border border-(--border) rounded-lg overflow-hidden bg-(--page) p-2 flex flex-col items-center">
              <img
                src={photo.src}
                alt="Passport preview"
                className="max-h-36 object-contain rounded"
              />
              <div className="w-full mt-3 flex justify-between items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {photo.width} x {photo.height} px
                </span>
                <button
                  onClick={() => setPhoto(null)}
                  className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Scale slider */}
              <div className="w-full mt-3 border-t border-(--border) pt-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Fit Size:</span>
                  <span>{photoScale}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={photoScale}
                  onChange={(e) => setPhotoScale(Number(e.target.value))}
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Signature Upload Card */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm">
          <h3 className="text-sm font-bold text-(--foreground) mb-3 uppercase tracking-wider flex items-center gap-2">
            <FileImage className="h-4 w-4 text-teal-500" /> 2. Upload Signature
          </h3>
          {!signature ? (
            <div
              onClick={() => signInputRef.current.click()}
              className="border-2 border-dashed border-teal-500/20 hover:border-teal-500/50 bg-(--page) rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <input
                ref={signInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignUpload}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-teal-500/60 mb-2 animate-pulse" />
              <span className="text-xs font-semibold text-(--foreground)">Choose Signature Image</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">JPEG, PNG, or WEBP</span>
            </div>
          ) : (
            <div className="relative border border-(--border) rounded-lg overflow-hidden bg-(--page) p-2 flex flex-col items-center">
              <img
                src={signature.src}
                alt="Signature preview"
                className="max-h-36 object-contain bg-white rounded p-1 border"
              />
              <div className="w-full mt-3 flex justify-between items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {signature.width} x {signature.height} px
                </span>
                <button
                  onClick={() => setSignature(null)}
                  className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Scale slider */}
              <div className="w-full mt-3 border-t border-(--border) pt-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Fit Size:</span>
                  <span>{signScale}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={signScale}
                  onChange={(e) => setSignScale(Number(e.target.value))}
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Preview and Fit Configuration Panel (Only show once both are uploaded) */}
      {photo && signature ? (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Compliant Image Preview Card (Centered & Premium) */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm w-full">
            <h3 className="text-sm font-bold text-(--foreground) border-b border-(--border) pb-3 mb-4 flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-teal-500" /> Compliant Image Preview
            </h3>
            
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col items-center justify-center">
              <div className="border border-(--border) shadow-md rounded-lg overflow-hidden bg-slate-200/50 dark:bg-slate-800/50 p-6 max-w-full flex justify-center">
                <img
                  src={outputDataUrl}
                  alt="Merged combined output"
                  className="max-h-[380px] object-contain border bg-white"
                />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3 text-center w-full max-w-md">
                <div className="bg-(--page) p-2 rounded-lg border border-(--border)">
                  <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">File Size</span>
                  <span className="text-sm font-bold text-(--foreground)">{outputSizeKB} KB</span>
                </div>
                <div className="bg-(--page) p-2 rounded-lg border border-(--border)">
                  <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Dimensions</span>
                  <span className="text-sm font-bold text-(--foreground)">{outputWidth} x {outputHeight} px</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="mt-6 inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 w-full max-w-md"
              >
                {compressFormat === "application/pdf" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loading ? "Compiling PDF..." : `Download Joined ${compressFormat === "application/pdf" ? "PDF Document" : "Image"}`}
              </button>
            </div>
          </div>

          {/* Horizontal Configuration Panel */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-teal-500" /> Fit Dimensions & Sizes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Col 1: Preset & Custom Dimensions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Exam Preset
                  </label>
                  <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {Object.keys(PRESETS).map((k) => (
                      <option key={k} value={k}>
                        {PRESETS[k].name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => {
                        setPreset("custom");
                        setCustomWidth(Math.max(100, Number(e.target.value)));
                      }}
                      className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => {
                        setPreset("custom");
                        setCustomHeight(Math.max(100, Number(e.target.value)));
                      }}
                      className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Col 2: Ratio Split */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span>Photo vs Sign Split</span>
                  <span>{Math.round(photoRatio * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={Math.round(photoRatio * 100)}
                  onChange={(e) => {
                    setPreset("custom");
                    setPhotoRatio(Number(e.target.value) / 100);
                  }}
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Drag to specify what percentage of the canvas height is reserved for the passport photograph.
                </p>
              </div>

              {/* Col 3: Spacing & Background color */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    <span>Vertical Gap</span>
                    <span>{gap} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Line Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 border border-(--border) rounded cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-semibold text-(--foreground) uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Col 4: Target Limits & Formats */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Max KB
                    </label>
                    <input
                      type="number"
                      value={targetMaxKB}
                      onChange={(e) => setTargetMaxKB(Math.max(5, Number(e.target.value)))}
                      className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2 outline-none focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Format
                    </label>
                    <select
                      value={compressFormat}
                      onChange={(e) => setCompressFormat(e.target.value)}
                      className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="image/jpeg">JPEG (.jpg)</option>
                      <option value="image/png">PNG (.png)</option>
                      <option value="application/pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                  <Info className="h-3 w-3 text-teal-500 shrink-0 mt-0.5" />
                  Target limits are automatically compiled in real-time in the browser.
                </p>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-(--surface) rounded-xl border border-(--border) p-8 text-center shadow-sm">
          <ImageIcon className="h-10 w-10 text-teal-500/30 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Please upload both Passport Photo and Signature above to begin processing.
          </p>
        </div>
      )}
    </div>
  );
}
