"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import JSZip from "jszip";
import { Upload, X, FileText, Check, AlertCircle, Camera } from "lucide-react";

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpeg"); // "jpeg" or "png"
  const [scale, setScale] = useState(1.5); // 1.0 to 4.0 scale resolution
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

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Reading PDF document...");
    setResult(null);
    setPreviews([]);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfjs();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const totalPages = pdfJsDoc.numPages;

      const zip = new JSZip();
      const generatedPreviews = [];

      for (let i = 1; i <= totalPages; i++) {
        const step = 10 + Math.round((i / totalPages) * 75);
        setProgress(step);
        setStatusText(`Rendering page ${i} of ${totalPages}...`);

        const page = await pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const fileExt = format === "png" ? "png" : "jpg";
        const dataUrl = canvas.toDataURL(mimeType, 0.92);

        // Keep page preview URLs
        if (i <= 6) { // limit previews to first 6 pages to avoid crashing memory
          generatedPreviews.push(dataUrl);
        }

        // Convert base64 dataURL to raw bytes
        const base64Data = dataUrl.split(",")[1];
        zip.file(`page_${i}.${fileExt}`, base64Data, { base64: true });
      }

      setPreviews(generatedPreviews);
      
      setProgress(90);
      setStatusText("Zipping all rendered images...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);

      setProgress(100);
      setProcessing(false);

      const name = file.name.replace(".pdf", "") + "_images.zip";

      setResult({
        name: name,
        size: zipBlob.size,
        url: downloadUrl
      });

      // Auto download ZIP
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
      setResult({ error: err.message || "Failed to render PDF pages." });
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
          onClick={() => document.getElementById("pdf2img-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Render PDF pages to images</p>
          
        </div>

<input 
            type="file" 
            id="pdf2img-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Output Format</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${format === "jpeg" ? "active" : ""}`}
              onClick={() => setFormat("jpeg")}
            >
              JPEG Format
            </button>
            <button 
              className={`radio-btn ${format === "png" ? "active" : ""}`}
              onClick={() => setFormat("png")}
            >
              PNG Format
            </button>
          </div>

          <div className="slider-row" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
              <label className="lbl">Render Resolution (Scale):</label>
              <span className="slider-val">{scale}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="0.5" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "6px" }}
            />
            <span style={{ fontSize: "11px", color: "var(--g400)" }}>Higher scale creates sharper but larger images.</span>
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
            <strong>Export Successful!</strong>
            <span>All pages rendered and saved to a ZIP file.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download ZIP File
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Export Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="previews-section" style={{ marginTop: "24px" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Preview (First {previews.length} pages)</h4>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
            gap: "12px",
            background: "var(--g50)",
            padding: "16px",
            borderRadius: "8px",
            border: "1.5px dashed var(--g300)"
          }}>
            {previews.map((src, i) => (
              <div key={i} style={{ border: "1px solid var(--g200)", padding: "4px", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={src} alt={`Page ${i+1}`} style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }} />
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
          onClick={handleConvert}
        >
          <Camera size={14} /> Export Pages
        </button>
      </div>
    </div>
  );
}
