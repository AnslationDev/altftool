"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { Upload, X, ImageIcon, Check, AlertCircle, Percent, ArrowDown } from "lucide-react";

export default function ImageCompress() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("jpg"); // "jpg", "png", "webp"
  const [quality, setQuality] = useState(70); // default compress target 70%
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null); // { original, output, saved, percentage }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
      setResult(null);
      setStats(null);
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
      setStats(null);
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
    setStats(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
    setStats(null);
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

  const handleCompress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Reading source files...");
    setResult(null);
    setStats(null);

    const mimeType = format === "jpg" ? "image/jpeg" : format === "png" ? "image/png" : "image/webp";
    const ext = format;
    const qualityVal = quality / 100;
    const zip = files.length > 1 ? new JSZip() : null;

    let totalOrig = 0;
    let totalOut = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalOrig += file.size;

        const step = 10 + Math.round((i / files.length) * 80);
        setProgress(step);
        setStatusText(`Compressing image ${i + 1} of ${files.length}...`);

        const imgEl = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgEl, 0, 0);

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const outName = `${baseName}_compressed.${ext}`;

        await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            totalOut += blob.size;
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
        setStatusText("Creating ZIP archive...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "compressed_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      const savedBytes = totalOrig - totalOut;
      const savedPct = Math.round((savedBytes / totalOrig) * 100);

      setStats({
        original: totalOrig,
        output: totalOut,
        saved: savedBytes,
        percentage: savedPct
      });

      setResult({
        message: savedBytes > 0 
          ? `Saved ${savedPct}% space across ${files.length} images.` 
          : `Processed ${files.length} images.`,
        detail: files.length > 1 ? "Downloaded as compressed_images.zip" : `Saved as ${ext.toUpperCase()}`
      });

      setProgress(100);
      setProcessing(false);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to compress images." });
    }
  };

  return (
    <div className="tool-workspace-inner">
      <>
<div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("compress-input-files").click()}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>
        <p className="dz-main">Drag and drop images here, or click to browse</p>
        <p className="dz-hint">Reduces JPEG, PNG, and WebP file sizes</p>
        
      </div>

<input 
          type="file" 
          id="compress-input-files" 
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
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Compression Settings</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="cg">
                <label className="lbl">Target Quality:</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="jpg">Convert to JPG (High Compression)</option>
                  <option value="png">Convert to PNG (Lossless)</option>
                  <option value="webp">Convert to WebP (Recommended)</option>
                </select>
              </div>

              <div className="cg">
                <label className="lbl">Compression Quality Limit ({quality}%):</label>
                <input 
                  type="number" 
                  min="10" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Math.min(100, Math.max(10, parseInt(e.target.value) || 70)))}
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

      {stats && (
        <div className="stats-dashboard" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "var(--g500)", display: "block" }}>Original Size</span>
            <strong style={{ fontSize: "14px", color: "var(--g700)" }}>{formatSize(stats.original)}</strong>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "var(--g500)", display: "block" }}>Compressed Size</span>
            <strong style={{ fontSize: "14px", color: "var(--g700)" }}>{formatSize(stats.output)}</strong>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "var(--g500)", display: "block" }}>Space Saved</span>
            <strong style={{ fontSize: "14px", color: stats.saved > 0 ? "var(--ok)" : "var(--g700)" }}>
              {stats.saved > 0 ? "-" : "+"}{formatSize(Math.abs(stats.saved))} ({stats.percentage}%)
            </strong>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Compression Done!</strong>
            <span>{result.message}</span>
            <small>{result.detail}</small>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Compression Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleCompress}
          >
            <ArrowDown size={14} /> Compress Image(s)
          </button>
        </div>
      )}
    </div>
  );
}
