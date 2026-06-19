"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { Upload, X, ImageIcon, Check, AlertCircle, Maximize2, Lock, Unlock } from "lucide-react";

export default function ImageResizer() {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState("pixels"); // "pixels", "percent", "fit"
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState(50);
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState("jpg"); // "jpg", "png", "webp"
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped]);
      setResult(null);
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleResize = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Initializing images...");
    setResult(null);

    const mimeType = format === "jpg" ? "image/jpeg" : format === "png" ? "image/png" : "image/webp";
    const ext = format;
    const qualityVal = quality / 100;
    const zip = files.length > 1 ? new JSZip() : null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const step = 10 + Math.round((i / files.length) * 80);
        setProgress(step);
        setStatusText(`Resizing image ${i + 1} of ${files.length}...`);

        const imgEl = await loadImage(file);
        const natW = imgEl.naturalWidth;
        const natH = imgEl.naturalHeight;

        let targetW = natW;
        let targetH = natH;

        const wInput = parseFloat(width);
        const hInput = parseFloat(height);

        if (mode === "pixels") {
          targetW = wInput || natW;
          targetH = hInput || natH;
          if (locked) {
            if (wInput && !hInput) {
              targetH = Math.round((wInput * natH) / natW);
            } else if (hInput && !wInput) {
              targetW = Math.round((hInput * natW) / natH);
            }
          }
        } else if (mode === "percent") {
          targetW = Math.round((natW * percent) / 100);
          targetH = Math.round((natH * percent) / 100);
        } else {
          // Fit mode
          const maxW = wInput || natW;
          const maxH = hInput || natH;
          const scale = Math.min(maxW / natW, maxH / natH, 1);
          targetW = Math.round(natW * scale);
          targetH = Math.round(natH * scale);
        }

        targetW = Math.max(1, targetW);
        targetH = Math.max(1, targetH);

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(imgEl, 0, 0, targetW, targetH);

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const outName = `${baseName}_${targetW}x${targetH}.${ext}`;

        await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (zip) {
              zip.file(outName, blob);
              resolve();
            } else {
              // Individual download
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = outName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              resolve();
            }
          }, mimeType, qualityVal);
        });
      }

      if (zip) {
        setProgress(95);
        setStatusText("Packaging ZIP archive...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "resized_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setResult({
          message: `Resized ${files.length} images successfully.`,
          detail: "Downloaded as resized_images.zip"
        });
      } else {
        setResult({
          message: "Image resized successfully.",
          detail: `Saved as ${ext.toUpperCase()}`
        });
      }
      setProgress(100);
      setProcessing(false);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to resize images." });
    }
  };

  return (
    <div className="tool-workspace-inner">
      <>
<div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("resize-input-files").click()}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>
        <p className="dz-main">Drag and drop images here, or click to browse</p>
        <p className="dz-hint">Supports JPEG, PNG, WebP format scaling</p>
        
      </div>

<input 
          type="file" 
          id="resize-input-files" 
          multiple
          accept="image/*" 
          style={{ display: "none" }} 
          onChange={handleFileChange}
         onClick={(e) => e.stopPropagation()} />
</>

      {files.length > 0 && (
        <div className="file-list-container" style={{ marginTop: "20px" }}>
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Images ({files.length})</h4>
          <div className="file-list" style={{ maxHeight: "180px", overflowY: "auto" }}>
            {files.map((f, idx) => (
              <div className="file-item" key={idx}>
                <span className="file-icon"><ImageIcon size={16} /></span>
                <span className="file-name" title={f.name}>{f.name}</span>
                <span className="file-size">{formatSize(f.size)}</span>
                <button className="file-remove" onClick={() => removeFile(idx)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Resize Settings</h4>
            
            <div className="radio-group" style={{ marginBottom: "20px" }}>
              <button 
                className={`radio-btn ${mode === "pixels" ? "active" : ""}`}
                onClick={() => setMode("pixels")}
              >
                By Pixels
              </button>
              <button 
                className={`radio-btn ${mode === "percent" ? "active" : ""}`}
                onClick={() => setMode("percent")}
              >
                By Percentage
              </button>
              <button 
                className={`radio-btn ${mode === "fit" ? "active" : ""}`}
                onClick={() => setMode("fit")}
              >
                Fit Dimensions
              </button>
            </div>

            {mode === "percent" ? (
              <div className="slider-row" style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="lbl">Resize to Percentage:</label>
                  <span className="slider-val">{percent}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  value={percent} 
                  onChange={(e) => setPercent(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="cg">
                  <label className="lbl">{mode === "fit" ? "Max Width (px):" : "Width (px):"}</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input 
                      type="number" 
                      placeholder="e.g. 1920" 
                      value={width} 
                      onChange={(e) => setWidth(e.target.value)}
                    />
                    {mode === "pixels" && (
                      <button 
                        className="btn btn-sec" 
                        style={{ padding: "8px", height: "38px" }}
                        onClick={() => setLocked(!locked)}
                        title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                      >
                        {locked ? <Lock size={15} /> : <Unlock size={15} />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="cg">
                  <label className="lbl">{mode === "fit" ? "Max Height (px):" : "Height (px):"}</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1080" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="cg">
                <label className="lbl">Output Format:</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="jpg">JPG Image Format</option>
                  <option value="png">PNG Image Format</option>
                  <option value="webp">WebP Modern Format</option>
                </select>
              </div>

              <div className="cg">
                <label className="lbl">Compression Quality ({quality}%):</label>
                <input 
                  type="number" 
                  min="30" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Math.min(100, Math.max(30, parseInt(e.target.value) || 90)))}
                  style={{ marginTop: "6px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn btn-sec" onClick={clearFiles} style={{ padding: "6px 12px", fontSize: "12.5px" }}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">{statusText}</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Resize Completed!</strong>
            <span>{result.message}</span>
            <small>{result.detail}</small>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Resizing Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleResize}
          >
            <Maximize2 size={14} /> Resize Image(s)
          </button>
        </div>
      )}
    </div>
  );
}
