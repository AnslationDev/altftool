"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Crop } from "lucide-react";

export default function CropPdf() {
  const [file, setFile] = useState(null);
  const [targetMode, setTargetMode] = useState("all"); // "all" or "specific"
  const [specificPages, setSpecificPages] = useState("1");
  const [cropMargins, setCropMargins] = useState({
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0 && droppedFiles[0].name.toLowerCase().endsWith(".pdf")) {
      setFile(droppedFiles[0]);
      setResult(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const handleMarginChange = (field, val) => {
    const numVal = Math.max(0, parseInt(val) || 0);
    setCropMargins(prev => ({
      ...prev,
      [field]: numVal
    }));
    setResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const parsePageRange = (str, total) => {
    const indices = new Set();
    str.split(",").forEach(part => {
      part = part.trim();
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(total, b); i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= total) {
          indices.add(n - 1);
        }
      }
    });
    return [...indices].sort((a, b) => a - b);
  };

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(15);
    setStatusText("Loading PDF...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const totalPages = pages.length;

      setProgress(40);
      setStatusText("Calculating page dimensions and cropping...");

      let targets = pages.map((_, i) => i);
      if (targetMode === "specific") {
        targets = parsePageRange(specificPages, totalPages);
      }

      if (targets.length === 0) {
        throw new Error("Specified page selection resulted in 0 pages.");
      }

      const { top, bottom, left, right } = cropMargins;

      targets.forEach((idx, i) => {
        const step = 40 + Math.round((i / targets.length) * 45);
        setProgress(step);
        setStatusText(`Cropping page ${idx + 1}...`);

        const page = pages[idx];
        const { width, height } = page.getSize();
        
        // Calculate new bounding cropbox
        const newX = left;
        const newY = bottom;
        const newW = Math.max(10, width - left - right);
        const newH = Math.max(10, height - top - bottom);

        page.setCropBox(newX, newY, newW, newH);
      });

      setProgress(90);
      setStatusText("Saving document...");
      const outputBytes = await doc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_cropped.pdf";

      setResult({
        name: name,
        size: outputBytes.byteLength,
        url: downloadUrl
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to crop PDF." });
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
          onClick={() => document.getElementById("crop-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Define crop margins on the next step</p>
          
        </div>

<input 
            type="file" 
            id="crop-input-file" 
            accept=".pdf" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Document</h4>
          <div className="file-list">
            <div className="file-item">
              <span className="file-icon"><FileText size={16} /></span>
              <span className="file-name" title={file.name}>{file.name}</span>
              <span className="file-size">{formatSize(file.size)}</span>
              <button className="file-remove" onClick={removeFile}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Selection</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${targetMode === "all" ? "active" : ""}`}
              onClick={() => setTargetMode("all")}
            >
              All Pages
            </button>
            <button 
              className={`radio-btn ${targetMode === "specific" ? "active" : ""}`}
              onClick={() => setTargetMode("specific")}
            >
              Specific Pages
            </button>
          </div>

          {targetMode === "specific" && (
            <div className="cg" style={{ marginBottom: "20px" }}>
              <label htmlFor="crop-pages-input" className="lbl">Pages to Crop (e.g. 1, 3-5):</label>
              <input 
                type="text" 
                id="crop-pages-input" 
                value={specificPages}
                onChange={(e) => setSpecificPages(e.target.value)}
                placeholder="e.g. 1, 3-5"
                style={{ marginTop: "6px" }}
              />
            </div>
          )}

          <h4 className="lbl" style={{ marginBottom: "12px" }}>Crop Margins (Points)</h4>
          <div className="crop-inputs-grid" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "12px" 
          }}>
            <div className="cg">
              <label className="lbl">Top Margin:</label>
              <input 
                type="number" 
                value={cropMargins.top} 
                onChange={(e) => handleMarginChange("top", e.target.value)}
                min="0"
              />
            </div>
            <div className="cg">
              <label className="lbl">Bottom Margin:</label>
              <input 
                type="number" 
                value={cropMargins.bottom} 
                onChange={(e) => handleMarginChange("bottom", e.target.value)}
                min="0"
              />
            </div>
            <div className="cg">
              <label className="lbl">Left Margin:</label>
              <input 
                type="number" 
                value={cropMargins.left} 
                onChange={(e) => handleMarginChange("left", e.target.value)}
                min="0"
              />
            </div>
            <div className="cg">
              <label className="lbl">Right Margin:</label>
              <input 
                type="number" 
                value={cropMargins.right} 
                onChange={(e) => handleMarginChange("right", e.target.value)}
                min="0"
              />
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
            <strong>Crop Successful!</strong>
            <span>Your PDF was successfully cropped.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download PDF
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Crop Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleCrop}
        >
          <Crop size={14} /> Crop PDF
        </button>
      </div>
    </div>
  );
}
