"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { Upload, X, ImageIcon, Check, AlertCircle, RefreshCw } from "lucide-react";

export default function FormatConvert() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("png"); // "png", "jpg", "webp", "gif"
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Preparing conversion buffers...");
    setResult(null);

    const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : format === "gif" ? "image/gif" : "image/png";
    const ext = format;
    const qualityVal = quality / 100;
    const zip = files.length > 1 ? new JSZip() : null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const step = 10 + Math.round((i / files.length) * 80);
        setProgress(step);
        setStatusText(`Converting image ${i + 1} of ${files.length}...`);

        const imgEl = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgEl, 0, 0);

        const base = file.name.replace(/\.[^.]+$/, "");
        const name = `${base}.${ext}`;

        await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (zip) {
              zip.file(name, blob);
              resolve();
            } else {
              // Direct download
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              resolve();
            }
          }, mime, qualityVal);
        });
      }

      if (zip) {
        setProgress(95);
        setStatusText("Packaging conversion ZIP...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "converted_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setResult({
          message: `Converted ${files.length} images successfully.`,
          detail: "Downloaded as converted_images.zip"
        });
      } else {
        setResult({
          message: "Image format conversion successful.",
          detail: `Saved as ${ext.toUpperCase()}`
        });
      }

      setProgress(100);
      setProcessing(false);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to convert images." });
    }
  };

  return (
    <div className="tool-workspace-inner">
      <>
<div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("convert-input-files").click()}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>
        <p className="dz-main">Drag and drop images here, or click to browse</p>
        <p className="dz-hint">Converts between JPG, PNG, WebP, and GIF formats</p>
        
      </div>

<input 
          type="file" 
          id="convert-input-files" 
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
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Conversion Targets</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="cg">
                <label className="lbl">Convert Target Format:</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="png">PNG (Lossless vector rendering)</option>
                  <option value="jpg">JPG (Best file compression)</option>
                  <option value="webp">WebP (Modern compression quality)</option>
                </select>
                <p style={{ fontSize: "11.5px", color: "var(--g500)", marginTop: "6px" }}>
                  Note: GIF output is disabled because modern web browsers do not support native client-side static GIF encoding.
                </p>
              </div>

              <div className="cg">
                <label className="lbl">Target Compression Quality ({quality}%):</label>
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            <strong>Conversion Complete!</strong>
            <span>{result.message}</span>
            <small>{result.detail}</small>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Conversion Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleConvert}
          >
            <RefreshCw size={14} /> Convert Image(s)
          </button>
        </div>
      )}
    </div>
  );
}
