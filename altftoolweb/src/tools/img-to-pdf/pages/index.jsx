"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { 
  Upload, 
  Trash2, 
  Download, 
  Image as ImageIcon,
  CheckCircle,
  Zap,
  Shield,
  Plus
} from "lucide-react";

export default function ToolHome() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const processFiles = (newFiles) => {
    const processed = Array.from(newFiles)
      .filter(file => file.type.startsWith("image/"))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type,
        preview: URL.createObjectURL(file),
        originalFile: file,
      }));
    setFiles((prev) => [...prev, ...processed]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Helper to convert any image (WEBP, PNG, JPG) to standard JPEG bytes via canvas
  const getJpgBytes = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF"; // Fill white background for transparent images
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              blob.arrayBuffer().then(resolve).catch(reject);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          }, "image/jpeg", 0.95);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress(10);

    try {
      const pdfDoc = await PDFDocument.create();
      setProgress(35);

      for (let i = 0; i < files.length; i++) {
        const f = files[i];

        // Convert file to high-fidelity white-backed JPEG bytes
        const imgBytes = await getJpgBytes(f.originalFile);
        const img = await pdfDoc.embedJpg(imgBytes);

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

        setProgress(35 + ((i + 1) / files.length) * 55);
      }

      const pdfBytes = await pdfDoc.save();
      setProgress(100);

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images_merged.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF: " + err.message);
    }

    setTimeout(() => {
      setIsConverting(false);
      setProgress(0);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <ImageIcon className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Image to PDF Converter
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Documents
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Convert JPG, PNG, WEBP, and other image formats into high-quality PDF files. Safe, secure, and processed entirely inside your browser.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Supports Multi-Formats", "High Fidelity", "100% Client-Side"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Hidden Input */}
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drag & Drop Card */}
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary rounded-2xl bg-card hover:bg-surface-soft/40 p-8 text-center cursor-pointer transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-surface-soft text-primary group-hover:scale-110 transition duration-300 rounded-2xl border border-border">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Click or Drag images here</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Supports JPG, JPEG, PNG, WEBP, GIF, etc.</p>
            </div>
          </div>
        </section>

        {/* Features callouts */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">100% Secure</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
              Files never leave your local machine. All image-to-PDF compilation happens safely within your local web browser sandboxed environment.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Instant Compilation</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
              No server-side conversion delays. The optimized browser-native PDF generation engine builds and downloads output documents instantly.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">High Fidelity</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
              Original images are compiled into individual pages maintaining native dimensions, ensuring crisp text and layout resolutions.
            </p>
          </div>
        </section>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-soft/40 flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" />
                Selected Files ({files.length})
              </h3>
            </div>

            <div className="divide-y divide-border max-h-[300px] overflow-y-auto pr-1">
              {files.map((file) => (
                <div key={file.id} className="p-4 flex items-center justify-between hover:bg-surface-soft/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-surface-soft shrink-0">
                      <img 
                        src={file.preview} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">{file.size}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFile(file.id)}
                    className="text-muted hover:text-rose-500 p-2 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface-soft/20 border-t border-border">
              {isConverting ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground uppercase tracking-wider">
                    <span>Compiling PDF document...</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <div className="w-full bg-surface-soft border border-border rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConvert}
                  disabled={files.length === 0}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Download PDF Document
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
