"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Eye } from "lucide-react";

export default function GrayscalePdf() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpeg"); // "jpeg" or "png"
  const [quality, setQuality] = useState(85); // 50 to 100
  const [resolution, setResolution] = useState(1.5); // 1.0 to 3.0
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setResult(null);
      setPreviews([]);
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
      setPreviews([]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setPreviews([]);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleGrayscale = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(5);
    setStatusText("Reading PDF document...");
    setResult(null);
    setPreviews([]);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfjs();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const totalPages = pdfJsDoc.numPages;

      const outDoc = await PDFDocument.create();
      const generatedPreviews = [];

      for (let i = 1; i <= totalPages; i++) {
        const step = 5 + Math.round((i / totalPages) * 80);
        setProgress(step);
        setStatusText(`Converting page ${i} of ${totalPages} to grayscale...`);

        const page = await pdfJsDoc.getPage(i);
        const vp = page.getViewport({ scale: resolution });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        // Perform pixel conversion
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const r = data[j];
          const g = data[j + 1];
          const b = data[j + 2];
          // Luminance formula: Y = 0.299R + 0.587G + 0.114B
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          data[j] = data[j + 1] = data[j + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality / 100);

        // Preview thumbnail for first 4 pages
        if (i <= 4) {
          generatedPreviews.push(dataUrl);
        }

        // Convert base64 dataUrl to bytes
        const base64 = dataUrl.split(",")[1];
        const binStr = atob(base64);
        const imgBytes = new Uint8Array(binStr.length);
        for (let k = 0; k < binStr.length; k++) {
          imgBytes[k] = binStr.charCodeAt(k);
        }

        let embeddedImg;
        if (format === "png") {
          embeddedImg = await outDoc.embedPng(imgBytes);
        } else {
          embeddedImg = await outDoc.embedJpg(imgBytes);
        }

        const { width: iW, height: iH } = embeddedImg.scale(1);
        const outPage = outDoc.addPage([iW, iH]);
        outPage.drawImage(embeddedImg, { x: 0, y: 0, width: iW, height: iH });
      }

      setPreviews(generatedPreviews);

      setProgress(90);
      setStatusText("Saving grayscale PDF...");
      const outputBytes = await outDoc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_grayscale.pdf";

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
      setResult({ error: err.message || "Failed to convert PDF to grayscale." });
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
          onClick={() => document.getElementById("grayscale-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Converts color text and images to black-and-white</p>
          
        </div>

<input 
            type="file" 
            id="grayscale-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Raster Format</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${format === "jpeg" ? "active" : ""}`}
              onClick={() => setFormat("jpeg")}
            >
              JPEG (Compressed)
            </button>
            <button 
              className={`radio-btn ${format === "png" ? "active" : ""}`}
              onClick={() => setFormat("png")}
            >
              PNG (Lossless)
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "10px" }}>
            <div className="cg">
              <label className="lbl">Render Resolution (Scale):</label>
              <select 
                value={resolution} 
                onChange={(e) => setResolution(parseFloat(e.target.value))}
                style={{ marginTop: "6px" }}
              >
                <option value="1">1.0x (Fast / Smaller File)</option>
                <option value="1.5">1.5x (Recommended Balanced)</option>
                <option value="2">2.0x (High Quality)</option>
                <option value="3">3.0x (Ultra Quality / Heavy File)</option>
              </select>
            </div>
            
            {format === "jpeg" && (
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
            )}
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
            <strong>Conversion Successful!</strong>
            <span>Your PDF has been converted to grayscale.</span>
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
            <strong>Conversion Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="previews-section" style={{ marginTop: "24px" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Grayscale Preview (First {previews.length} Pages)</h4>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", 
            gap: "12px",
            background: "var(--g50)",
            padding: "16px",
            borderRadius: "8px",
            border: "1.5px dashed var(--g300)"
          }}>
            {previews.map((src, i) => (
              <div key={i} style={{ border: "1px solid var(--g200)", padding: "4px", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={src} alt={`Page ${i+1}`} style={{ maxWidth: "100%", maxHeight: "140px", objectFit: "contain" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--g500)", marginTop: "4px" }}>Page {i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleGrayscale}
        >
          <Eye size={14} /> Convert to Grayscale
        </button>
      </div>
    </div>
  );
}
