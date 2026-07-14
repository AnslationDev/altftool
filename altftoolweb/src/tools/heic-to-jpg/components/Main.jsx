"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Download,
  Settings,
  RefreshCw,
  Clock,
  Sliders,
  Play,
  Pause,
  Layers,
  Sparkles,
  Info,
  Trash2,
  Check,
  AlertCircle,
  Archive,
  Loader2,
  X,
  FileImage,
} from "lucide-react";
import JSZip from "jszip";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "converted-image";
}

export default function MainComponent() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("jpg");
  const [quality, setQuality] = useState(90);
  
  // Status management
  const [isConverting, setIsConverting] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  // Handle files selection
  const addFiles = useCallback((fileList) => {
    setError("");
    setSuccess("");
    const valid = [];
    for (const f of fileList) {
      const nameLower = f.name.toLowerCase();
      if (!nameLower.endsWith(".heic") && !nameLower.endsWith(".heif")) {
        setError(`"${f.name}" is not a valid HEIC/HEIF image file.`);
        continue;
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      valid.push({
        id,
        file: f,
        name: f.name,
        size: f.size,
        convertedBlob: null,
        convertedUrl: null,
        convertedSize: null,
        status: "pending",
      });
    }
    if (valid.length) {
      setFiles((prev) => [...prev, ...valid]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
    setIsGenerated(false);
    setError("");
    setSuccess("");
  };

  // Convert HEIC Routine
  const convertFiles = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError("");
    setSuccess("");

    try {
      const heic2anyModule = await import("heic2any");
      const heic2any = heic2anyModule.default;

      const updatedFiles = [...files];

      for (let i = 0; i < updatedFiles.length; i++) {
        const item = updatedFiles[i];
        if (item.status === "done") continue;

        try {
          // Update status to processing
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: "converting" } : f))
          );

          // Convert HEIC to a standard image blob first (PNG or JPG)
          const toType = format === "png" ? "image/png" : "image/jpeg";
          const converted = await heic2any({
            blob: item.file,
            toType: toType,
            quality: quality / 100,
          });

          // Ensure we extract a single blob output (in case array is returned)
          const imageBlob = Array.isArray(converted) ? converted[0] : converted;

          let outputBlob = imageBlob;
          let convertedUrl = URL.createObjectURL(imageBlob);

          // If PDF format is requested, embed the converted image blob in a jsPDF document page
          if (format === "pdf") {
            const img = new window.Image();
            img.src = convertedUrl;
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            const { jsPDF } = await import("jspdf");
            const fitWidth = img.naturalWidth;
            const fitHeight = img.naturalHeight;
            const orientation = fitWidth > fitHeight ? "landscape" : "portrait";
            const pdf = new jsPDF({
              orientation,
              unit: "px",
              format: [fitWidth, fitHeight],
            });
            pdf.addImage(img.src, "JPEG", 0, 0, fitWidth, fitHeight);
            
            // Clean up temporary image URL
            URL.revokeObjectURL(convertedUrl);

            outputBlob = pdf.output("blob");
            convertedUrl = URL.createObjectURL(outputBlob);
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    convertedBlob: outputBlob,
                    convertedUrl,
                    convertedSize: outputBlob.size,
                    status: "done",
                  }
                : f
            )
          );
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f))
          );
        }
      }

      setIsGenerated(true);
      setSuccess("HEIC images converted successfully!");
    } catch (err) {
      setError(`Conversion library failed to initialize: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadSingle = (item) => {
    if (!item.convertedBlob) return;
    const ext = format === "png" ? "png" : format === "pdf" ? "pdf" : "jpg";
    const link = document.createElement("a");
    link.href = item.convertedUrl;
    link.download = `${sanitizeFileName(item.name)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    const doneFiles = files.filter((f) => f.status === "done");
    if (doneFiles.length === 0) return;

    const zip = new JSZip();
    const ext = format === "png" ? "png" : format === "pdf" ? "pdf" : "jpg";

    doneFiles.forEach((f) => {
      zip.file(`${sanitizeFileName(f.name)}.${ext}`, f.convertedBlob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heic-converted-${format}-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pendingCount = files.filter((f) => f.status !== "done").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <ImageIcon className="h-8 w-8 text-teal-500 shrink-0" /> HEIC to JPG Converter
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Batch convert high-efficiency Apple HEIC/HEIF photos to compatible JPG or PNG formats 100% locally in your browser.
        </p>
      </div>

      {/* Alerts */}
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

      {/* Step 1: Upload HEIC files card */}
      <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-(--border) pb-3">
          <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
            <UploadCloud className="h-4.5 w-4.5 text-teal-500" /> Select HEIC / HEIF Images
          </h3>
          {files.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-red-500 rounded text-xs font-semibold text-red-500 transition-colors bg-(--page) cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          )}
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-teal-500/20 hover:border-teal-500/50 bg-(--page) rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors max-w-2xl mx-auto text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".heic,.heif"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="h-12 w-12 text-teal-500/60 mb-3 animate-bounce" />
          <span className="text-sm font-semibold text-(--foreground)">Choose HEIC Files</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag and drop images here or browse (multiple files allowed)</span>
        </div>

        {/* Selected files list details */}
        {files.length > 0 && (
          <div className="pt-4 border-t border-(--border) space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Queue: {files.length} Photo(s)</h4>
            <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-1">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-2 bg-(--page) border border-(--border) rounded-lg pl-3 pr-2.5 py-1.5 text-xs font-medium text-(--foreground) relative group"
                >
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <span className="text-slate-500">({formatBytes(item.size)})</span>
                  {item.status === "converting" && (
                    <Loader2 className="h-3 w-3 text-teal-500 animate-spin" />
                  )}
                  {item.status === "done" && (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="p-0.5 text-slate-500 hover:text-red-500 rounded cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2 & 3: Options and Convert trigger button */}
      {files.length > 0 && (
        <>
          {/* Step 2: Customization options */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-teal-500" /> Convert Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-center">
              
              {/* Col 1: Target Output Format */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Output Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat("jpg")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      format === "jpg"
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-(--page) text-(--foreground) border-(--border)"
                    }`}
                  >
                    JPG
                  </button>
                  <button
                    onClick={() => setFormat("png")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      format === "png"
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-(--page) text-(--foreground) border-(--border)"
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setFormat("pdf")}
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      format === "pdf"
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-(--page) text-(--foreground) border-(--border)"
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Col 2: Image Quality Slider */}
              <div className="lg:col-span-5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <span>Image Compression Quality</span>
                  <span>{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
              </div>

              {/* Col 3: General Advice */}
              <div className="lg:col-span-3 flex gap-2.5 items-start text-slate-500 dark:text-slate-400 text-xs">
                <Info className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                <p>Convert multiple files locally. EXIF metadata may be excluded to optimize storage.</p>
              </div>

            </div>
          </div>

          {/* Step 3: Action Trigger Card */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 text-center shadow-sm flex flex-col items-center justify-center">
            <button
              onClick={convertFiles}
              disabled={isConverting || pendingCount === 0}
              className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isConverting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sliders className="h-4 w-4" />
              )}
              {isConverting ? "Converting Photos..." : `Convert HEIC to ${format.toUpperCase()}`}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Ready to process {pendingCount} queue image(s).
            </p>
          </div>
        </>
      )}

      {/* Step 4: Preview and Batch ZIP downloads */}
      {isGenerated && (
        <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-(--border) pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-(--foreground) flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Converted Photo Outputs
            </h3>
            {doneCount > 1 && (
              <button
                onClick={downloadAllAsZip}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-98"
              >
                <Archive className="h-3.5 w-3.5" /> Download All as ZIP ({doneCount})
              </button>
            )}
          </div>

          {/* Output Previews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {files
              .filter((item) => item.status === "done")
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-(--page) rounded-xl border border-(--border) p-3 shadow-inner space-y-3 flex flex-col justify-between"
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden border border-(--border) bg-slate-200/50 flex justify-center items-center">
                    <img
                      src={item.convertedUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-(--foreground) font-bold truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Size: {formatBytes(item.convertedSize)}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadSingle(item)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold cursor-pointer active:scale-98"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              ))}
          </div>

        </div>
      )}

    </div>
  );
}
