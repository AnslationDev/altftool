"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, ImageIcon, Check, AlertCircle, Sparkles, Download } from "lucide-react";

export default function RemoveBackground() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0 && droppedFiles[0].type.startsWith("image/")) {
      handleFileChange({ target: { files: droppedFiles } });
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleRemoveBackground = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    setProgressMsg("Loading neural network engine...");

    try {
      // Dynamically import the library to avoid Next SSR errors
      const { removeBackground } = await import("@imgly/background-removal");
      
      setProgressMsg("Processing image (downloading AI model files if first run)...");
      
      // Run background removal
      const outputBlob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (key === "fetch") {
            const pct = Math.round((current / total) * 100);
            setProgressMsg(`Downloading model files: ${pct}%`);
          } else if (key === "compute") {
            setProgressMsg("Running segmentation model on your GPU/CPU...");
          }
        }
      });

      const outName = `${file.name.replace(/\.[^.]+$/, "")}_no_bg.png`;
      const downloadUrl = URL.createObjectURL(outputBlob);

      setResult({
        name: outName,
        size: outputBlob.size,
        url: downloadUrl
      });

      // Auto-download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setResult({ error: err.message || "Failed to remove background. Ensure browser supports WebAssembly." });
    } finally {
      setProcessing(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
<div 
          className="dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("remove-bg-input").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop an image here, or click to browse</p>
          <p className="dz-hint">Remove backgrounds automatically and 100% locally in-browser</p>
          
        </div>

<input 
            type="file" 
            id="remove-bg-input" 
            accept="image/*" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Image</h4>
          <div className="file-list">
            <div className="file-item">
              <span className="file-icon"><ImageIcon size={16} /></span>
              <span className="file-name" title={file.name}>{file.name}</span>
              <span className="file-size">{formatSize(file.size)}</span>
              <button className="file-remove" onClick={removeFile} disabled={processing}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="crop-editor-wrapper" style={{ marginTop: "20px" }}>
          <div className="crop-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--g50)", padding: "12px", border: "1px solid var(--g200)", borderRadius: "8px 8px 0 0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--g500)" }}>
              Source Image Preview
            </span>
          </div>

          <div 
            className="crop-canvas-container" 
            style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              padding: "24px", 
              background: "var(--g100)", 
              border: "1px solid var(--g200)", 
              borderTop: "none", 
              borderRadius: "0 0 8px 8px" 
            }}
          >
            <img 
              src={previewUrl} 
              alt="Source Preview" 
              style={{ 
                maxHeight: "320px", 
                maxWidth: "100%", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "4px"
              }} 
            />
          </div>

          <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginTop: "20px" }}>
            <Sparkles size={18} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#166534" }}>
              <strong>Local Processing:</strong> The background removal model executes completely on your device. The image never leaves your browser.
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">{progressMsg}</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "70%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Background Removed!</strong>
            <span>Transparent PNG output is downloaded.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
              <div 
                style={{ 
                  padding: "8px", 
                  borderRadius: "6px", 
                  background: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 16px 16px",
                  border: "1px solid var(--g200)"
                }}
              >
                <img 
                  src={result.url} 
                  alt="Result Preview" 
                  style={{ maxHeight: "150px", maxWidth: "100%" }} 
                />
              </div>
              <a 
                href={result.url} 
                download={result.name} 
                className="btn btn-pri" 
                style={{ textDecoration: "none", display: "inline-flex", gap: "6px" }}
              >
                <Download size={14} /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Failed to Remove Background</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && !processing && !result && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            onClick={handleRemoveBackground}
          >
            <Sparkles size={14} /> Remove Background
          </button>
        </div>
      )}
    </div>
  );
}
