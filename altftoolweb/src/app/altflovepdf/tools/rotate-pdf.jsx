"use client";

import React, { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, RotateCw } from "lucide-react";

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(90); // 90, 180, 270
  const [targetMode, setTargetMode] = useState("all"); // "all" or "specific"
  const [specificPages, setSpecificPages] = useState("1");
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

  const handleRotate = async () => {
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
      setStatusText("Calculating rotation angles...");

      let targets = pages.map((_, i) => i);
      if (targetMode === "specific") {
        targets = parsePageRange(specificPages, totalPages);
      }

      if (targets.length === 0) {
        throw new Error("No valid pages found to rotate based on your selection.");
      }

      targets.forEach((idx, i) => {
        const step = 40 + Math.round((i / targets.length) * 40);
        setProgress(step);
        setStatusText(`Rotating page ${idx + 1}...`);

        const page = pages[idx];
        const currentRotation = page.getRotation().angle;
        // Apply rotation degrees
        page.setRotation(degrees((currentRotation + angle) % 360));
      });

      setProgress(85);
      setStatusText("Saving PDF...");
      const outputBytes = await doc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_rotated.pdf";

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
      setResult({ error: err.message || "Failed to rotate PDF." });
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
          onClick={() => document.getElementById("rotate-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Only PDF files are supported</p>
          
        </div>

<input 
            type="file" 
            id="rotate-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Rotation Angle</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${angle === 90 ? "active" : ""}`}
              onClick={() => setAngle(90)}
            >
              90° CW
            </button>
            <button 
              className={`radio-btn ${angle === 180 ? "active" : ""}`}
              onClick={() => setAngle(180)}
            >
              180°
            </button>
            <button 
              className={`radio-btn ${angle === 270 ? "active" : ""}`}
              onClick={() => setAngle(270)}
            >
              90° CCW
            </button>
          </div>

          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Selection</h4>
          <div className="radio-group" style={{ marginBottom: "16px" }}>
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
            <div className="cg">
              <label htmlFor="rotate-pages-input" className="lbl">Pages to Rotate (e.g. 1, 3-5):</label>
              <input 
                type="text" 
                id="rotate-pages-input" 
                value={specificPages}
                onChange={(e) => setSpecificPages(e.target.value)}
                placeholder="e.g. 1, 3-5"
                style={{ marginTop: "6px" }}
              />
            </div>
          )}
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
            <strong>Rotation Successful!</strong>
            <span>Your PDF pages were rotated successfully.</span>
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
            <strong>Rotation Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleRotate}
        >
          <RotateCw size={14} /> Rotate PDF
        </button>
      </div>
    </div>
  );
}
