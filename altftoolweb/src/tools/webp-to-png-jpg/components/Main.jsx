"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Image,
  Upload,
  Download,
  Archive,
  Check,
  X,
  FileImage,
  Sliders,
  Loader2,
  RotateCcw,
  AlertCircle,
  ImagePlus,
  Shield,
  Zap,
  FileText,
} from "lucide-react";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

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
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const dropRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    setError("");
    const valid = [];
    for (const f of fileList) {
      if (!f.type.match("image/webp") && !f.name.toLowerCase().endsWith(".webp")) {
        setError(`"${f.name}" is not a WebP file.`);
        continue;
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      valid.push({
        id,
        file: f,
        name: f.name,
        size: f.size,
        previewUrl: URL.createObjectURL(f),
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
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
    setError("");
  };

  const convertFile = useCallback(
    (item) =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          if (format === "pdf") {
            const MAX_DIM = 14400;
            let fitWidth = img.naturalWidth;
            let fitHeight = img.naturalHeight;
            if (fitWidth > MAX_DIM || fitHeight > MAX_DIM) {
              const scale = Math.min(MAX_DIM / fitWidth, MAX_DIM / fitHeight);
              fitWidth = Math.round(fitWidth * scale);
              fitHeight = Math.round(fitHeight * scale);
            }
            const pdfCanvas = document.createElement("canvas");
            pdfCanvas.width = fitWidth;
            pdfCanvas.height = fitHeight;
            const pdfCtx = pdfCanvas.getContext("2d");
            pdfCtx.drawImage(img, 0, 0, fitWidth, fitHeight);
            const imgData = pdfCanvas.toDataURL("image/jpeg", quality / 100);
            const orientation = fitWidth > fitHeight ? "landscape" : "portrait";
            const pdf = new jsPDF({ orientation, unit: "px", format: [fitWidth, fitHeight] });
            pdf.addImage(imgData, "JPEG", 0, 0, fitWidth, fitHeight);
            const blob = pdf.output("blob");
            const convertedUrl = URL.createObjectURL(blob);
            resolve({
              ...item,
              convertedBlob: blob,
              convertedUrl,
              convertedSize: blob.size,
              status: "done",
            });
            return;
          }

          const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
          const qualityArg = format === "jpg" ? quality / 100 : undefined;

          canvas.toBlob(
            (blob) => {
              const ext = format === "jpg" ? "jpg" : "png";
              const convertedUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                convertedBlob: blob,
                convertedUrl,
                convertedSize: blob.size,
                status: "done",
              });
            },
            mimeType,
            qualityArg,
          );
        };
        img.onerror = () => {
          resolve({ ...item, status: "error" });
        };
        img.src = item.previewUrl;
      }),
    [format, quality],
  );

  const convertAll = useCallback(async () => {
    setIsConverting(true);
    setError("");

    const pending = files.filter((f) => f.status !== "done");
    const results = await Promise.all(pending.map(convertFile));

    setFiles((prev) =>
      prev.map((f) => {
        const updated = results.find((r) => r.id === f.id);
        return updated || f;
      }),
    );
    setIsConverting(false);
  }, [files, convertFile]);

  const downloadSingle = (item) => {
    if (!item.convertedBlob) return;
    const ext = format === "jpg" ? "jpg" : format === "pdf" ? "pdf" : "png";
    const url = URL.createObjectURL(item.convertedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName(item.name)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.status === "done");
    if (doneFiles.length < 2) return;

    const zip = new JSZip();
    const ext = format === "jpg" ? "jpg" : format === "pdf" ? "pdf" : "png";

    doneFiles.forEach((f) => {
      zip.file(`${sanitizeFileName(f.name)}.${ext}`, f.convertedBlob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `webp-converted-${format}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [files, format]);

  const pendingCount = files.filter((f) => f.status !== "done").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6 p-7">
      <Header />

      <div className="rounded-xl bg-(--card) border border-(--border) p-5">
        <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
          <ImagePlus className="h-5 w-5 text-(--primary)" />
          Upload WebP Images
        </h2>
        <p className="text-sm text-(--muted-foreground) mt-1">
          Select one or more WebP files to convert
        </p>

        <div
          ref={dropRef}
          className="mt-4 border-2 border-dashed border-(--border) hover:border-(--primary) rounded-lg p-8 text-center cursor-pointer transition"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("webp-file-upload").click()}
        >
          <Upload className="mx-auto h-12 w-12 text-(--muted-foreground)" />
          <p className="mt-4 font-medium text-(--foreground)">
            Drag & drop WebP images here
          </p>
          <p className="text-sm text-(--muted-foreground)">or click to browse</p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-md bg-(--primary) text-(--primary-foreground) cursor-pointer"
          >
            Select WebP Files
          </button>

          <input
            id="webp-file-upload"
            type="file"
            accept=".webp,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded bg-red-500/10 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="rounded-xl bg-(--card) border border-(--border) p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
              <FileImage className="h-5 w-5 text-(--primary)" />
              {files.length} file{files.length > 1 ? "s" : ""}
            </h2>
            <button
              onClick={clearAll}
              className="text-sm px-3 py-1.5 rounded-md border border-(--border) text-(--foreground) cursor-pointer"
            >
              <RotateCcw className="inline h-3.5 w-3.5 mr-1" />
              Clear All
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
            {files.map((item) => (
              <div
                key={item.id}
                className="relative group w-32 sm:w-36 rounded-lg border border-(--border) overflow-hidden bg-(--background)"
              >
                <div className="aspect-square relative">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.status === "done" && (
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                  )}
                  {item.status === "pending" && isConverting && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-(--primary) animate-spin" />
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="text-xs text-(--foreground) truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-(--muted-foreground)">
                    {formatBytes(item.size)}
                  </p>
                  {item.status === "done" && item.convertedSize != null && (
                    <p className="text-xs text-green-500">
                      {formatBytes(item.convertedSize)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeFile(item.id)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {item.status === "done" && (
                  <button
                    onClick={() => downloadSingle(item)}
                    className="mt-1 w-full py-1.5 rounded-md bg-(--primary) text-(--primary-foreground) text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="rounded-xl bg-(--card) border border-(--border) p-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
            <Sliders className="h-5 w-5 text-(--primary)" />
            Conversion Settings
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-2">
                Output Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat("png")}
                  className={`flex-1 px-4 py-2 rounded-md border cursor-pointer text-sm font-medium transition ${
                    format === "png"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--background) text-(--foreground) border-(--border)"
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setFormat("jpg")}
                  className={`flex-1 px-4 py-2 rounded-md border cursor-pointer text-sm font-medium transition ${
                    format === "jpg"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--background) text-(--foreground) border-(--border)"
                  }`}
                >
                  JPG
                </button>
                <button
                  onClick={() => setFormat("pdf")}
                  className={`flex-1 px-4 py-2 rounded-md border cursor-pointer text-sm font-medium transition ${
                    format === "pdf"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--background) text-(--foreground) border-(--border)"
                  }`}
                >
                  PDF
                </button>
              </div>
            </div>

            {(format === "jpg" || format === "pdf") && (
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-(--primary) cursor-pointer"
                />
                <div className="flex justify-between text-xs text-(--muted-foreground) mt-1">
                  <span>Smaller</span>
                  <span>Best Quality</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={convertAll}
              disabled={isConverting || pendingCount === 0}
              className="px-5 py-2.5 rounded-md bg-(--primary) text-(--primary-foreground) font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <>
                  <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Image className="inline h-4 w-4 mr-2" alt="" />
                  Convert {pendingCount > 0 ? `(${pendingCount})` : ""}
                </>
              )}
            </button>

            {doneCount > 0 && (
              <button
                onClick={() => {
                  if (doneCount > 1 && format !== "pdf") {
                    downloadAll();
                  } else {
                    files.filter(f => f.status === "done").forEach(downloadSingle);
                  }
                }}
                className="px-5 py-2.5 rounded-md border border-(--border) text-(--foreground) font-medium cursor-pointer"
              >
                {doneCount > 1 && format !== "pdf" ? (
                  <><Archive className="inline h-4 w-4 mr-2" />Download All as ZIP ({doneCount})</>
                ) : (
                  <><Download className="inline h-4 w-4 mr-2" />Download</>
                )}
              </button>
            )}

          </div>

          {doneCount > 0 && (
            <p className="mt-3 text-sm text-green-500 flex items-center gap-1">
              <Check className="h-4 w-4" />
              {doneCount} image{doneCount > 1 ? "s" : ""} converted successfully
            </p>
          )}
        </div>
      )}

      {/* Features mini */}
      <div className="rounded-xl bg-(--card) border border-(--border) p-6">
        <h2 className="text-xl font-bold text-center sm:text-left">Features</h2>
        <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureItem
            icon={Shield}
            title="100% Private"
            desc="All conversion happens locally in your browser."
          />
          <FeatureItem
            icon={Zap}
            title="Batch Convert"
            desc="Process multiple WebP files at once."
          />
          <FeatureItem
            icon={Download}
            title="ZIP Export"
            desc="Download all converted images as a ZIP archive."
          />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="container mx-auto px-4 py-2">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">WebP to PNG / JPG / PDF Converter</h1>
        <p className="text-center description">
          Convert WebP images to high-quality PNG, JPG, or PDF files directly
          in your browser. Batch convert multiple files and download as a ZIP.
        </p>
      </header>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-(--primary)/10">
        <Icon className="h-5 w-5 text-(--primary)" />
      </div>
      <div>
        <h3 className="font-semibold text-(--foreground)">{title}</h3>
        <p className="text-sm text-(--muted-foreground)">{desc}</p>
      </div>
    </div>
  );
}


