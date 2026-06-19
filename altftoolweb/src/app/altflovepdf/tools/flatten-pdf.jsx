"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Layers } from "lucide-react";

export default function FlattenPdf() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("form"); // "form" (interactive fields lock) or "raster" (render to static images)
  const [quality, setQuality] = useState(85); // jpeg quality for raster flatten
  const [resolution, setResolution] = useState(1.5); // scale for raster flatten
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

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

  const handleFlatten = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(15);
    setStatusText("Reading PDF document...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let outputBytes;

      if (mode === "form") {
        setProgress(50);
        setStatusText("Locking interactive form fields...");
        
        const doc = await PDFDocument.load(bytes);
        try {
          const form = doc.getForm();
          form.flatten();
        } catch (e) {
          throw new Error("Could not flatten form fields: " + e.message);
        }
        
        setProgress(85);
        setStatusText("Generating document...");
        outputBytes = await doc.save();
      } else {
        // Raster flatten: render all pages to static images
        setProgress(20);
        setStatusText("Initializing page rasterizer...");
        
      const pdfjsLib = await getPdfjs();
        const pdfSrc = await pdfjsLib.getDocument({ data: bytes }).promise;
        const total = pdfSrc.numPages;
        const outDoc = await PDFDocument.create();

        for (let i = 1; i <= total; i++) {
          const step = 20 + Math.round((i / total) * 65);
          setProgress(step);
          setStatusText(`Rasterizing page ${i} of ${total}...`);

          const page = await pdfSrc.getPage(i);
          const vp = page.getViewport({ scale: resolution });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;

          const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
          const base64 = dataUrl.split(",")[1];
          const binStr = atob(base64);
          const imgBytes = new Uint8Array(binStr.length);
          for (let k = 0; k < binStr.length; k++) {
            imgBytes[k] = binStr.charCodeAt(k);
          }

          const embImg = await outDoc.embedJpg(imgBytes);
          const { width: iW, height: iH } = embImg.scale(1);
          const outPage = outDoc.addPage([iW, iH]);
          outPage.drawImage(embImg, { x: 0, y: 0, width: iW, height: iH });
        }

        setProgress(90);
        setStatusText("Saving static PDF document...");
        outputBytes = await outDoc.save();
      }

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_flattened.pdf";

      setResult({
        name: name,
        size: outputBytes.byteLength,
        url: downloadUrl
      });

      // Auto download
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
      setResult({ error: err.message || "Failed to flatten PDF." });
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
          onClick={() => document.getElementById("flatten-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Lock form inputs or merge page vector layers to flat images</p>
          
        </div>

<input 
            type="file" 
            id="flatten-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Flattening Option</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${mode === "form" ? "active" : ""}`}
              onClick={() => setMode("form")}
            >
              Flatten Forms Only (Locks input areas, keeps vector quality)
            </button>
            <button 
              className={`radio-btn ${mode === "raster" ? "active" : ""}`}
              onClick={() => setMode("raster")}
            >
              Full Page Rasterization (Merges text, links, and graphics)
            </button>
          </div>

          {mode === "raster" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="cg">
                <label className="lbl">Rendering Scale:</label>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(parseFloat(e.target.value))}
                  style={{ marginTop: "6px" }}
                >
                  <option value="1">1.0x (Standard quality / small file)</option>
                  <option value="1.5">1.5x (Recommended balanced)</option>
                  <option value="2">2.0x (High resolution / sharp text)</option>
                </select>
              </div>

              <div className="cg">
                <label className="lbl">JPEG Quality (%):</label>
                <input 
                  type="number" 
                  min="50" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Math.min(100, Math.max(50, parseInt(e.target.value) || 85)))}
                  style={{ marginTop: "6px" }}
                />
              </div>
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
            <strong>PDF Flattened Successfully!</strong>
            <span>All specified objects are locked inside the document structure.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Flattened PDF
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Flattening Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleFlatten}
        >
          <Layers size={14} /> Flatten PDF
        </button>
      </div>
    </div>
  );
}
