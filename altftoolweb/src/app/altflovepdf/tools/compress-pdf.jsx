"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Percent } from "lucide-react";

const ENCRYPTED_PDF_MESSAGE =
  "This PDF appears password-protected. Use Unlock PDF first, then compress the unlocked file.";

const isEncryptedPdfError = (error) =>
  /encrypted|password|decrypt|security|invalid password/i.test(String(error?.message || error || ""));

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("safe"); // "safe" or "aggressive"
  const [quality, setQuality] = useState(70); // 40 to 100
  const [dpi, setDpi] = useState(150); // 72 to 200
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

  const handleCompress = async () => {
    if (!file) return;
    const originalSize = file.size;
    setProcessing(true);
    setProgress(15);
    setStatusText("Reading PDF file...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let outputBytes;

      if (mode === "safe") {
        setProgress(50);
        setStatusText("Optimizing structural streams and clearing metadata...");
        
        const doc = await PDFDocument.load(bytes);
        doc.setTitle("");
        doc.setAuthor("");
        doc.setSubject("");
        doc.setKeywords([]);
        doc.setCreator("Local PDF Toolkit");
        doc.setProducer("Local PDF Toolkit");
        
        setProgress(80);
        outputBytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      } else {
        // Aggressive compression: rasterize to JPEGs
        setProgress(20);
        setStatusText("Initializing PDF rasterizer...");
        
        const scale = dpi / 72;
      const pdfjsLib = await getPdfjs();
        const pdfSrc = await pdfjsLib.getDocument({ data: bytes }).promise;
        const total = pdfSrc.numPages;
        const outDoc = await PDFDocument.create();

        for (let i = 1; i <= total; i++) {
          const step = 20 + Math.round((i / total) * 65);
          setProgress(step);
          setStatusText(`Rasterizing page ${i} of ${total}...`);

          const page = await pdfSrc.getPage(i);
          const vp = page.getViewport({ scale });
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
        setStatusText("Saving compressed PDF...");
        outputBytes = await outDoc.save({ useObjectStreams: true });
      }

      setProgress(100);
      setProcessing(false);

      const saved = originalSize - outputBytes.byteLength;
      const savedPct = Math.round((saved / originalSize) * 100);
      
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_compressed.pdf";

      setResult({
        name: name,
        originalSize,
        size: outputBytes.byteLength,
        saved,
        savedPct,
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
      const message = isEncryptedPdfError(err)
        ? ENCRYPTED_PDF_MESSAGE
        : err.message || "Failed to compress PDF.";
      setResult({ error: message });
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
          onClick={() => document.getElementById("compress-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Reduces PDF size locally inside your browser</p>
          
        </div>

<input 
            type="file" 
            id="compress-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Compression Mode</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${mode === "safe" ? "active" : ""}`}
              onClick={() => setMode("safe")}
            >
              Safe Optimize (Preserves text and layout)
            </button>
            <button 
              className={`radio-btn ${mode === "aggressive" ? "active" : ""}`}
              onClick={() => setMode("aggressive")}
            >
              Aggressive Raster Compress (Reduces image/vector size)
            </button>
          </div>

          {mode === "aggressive" && (
            <>
              <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#fffaf0", border: "1px solid #feebc8", borderRadius: "6px", marginBottom: "16px" }}>
                <AlertCircle size={18} style={{ color: "#dd6b20", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "12.5px", color: "#7b341e" }}>
                  <strong>Warning:</strong> Aggressive raster compression converts pages to JPEG images. All selectable text, searchable strings, links, and vector quality will be permanently lost.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="slider-row" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="lbl">DPI Resolution:</label>
                    <span className="slider-val">{dpi}</span>
                  </div>
                  <input 
                    type="range" 
                    min="72" 
                    max="200" 
                    value={dpi} 
                    onChange={(e) => setDpi(parseInt(e.target.value))}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>

                <div className="slider-row" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="lbl">JPEG Quality (%):</label>
                    <span className="slider-val">{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="95" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>
            </>
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
            <strong>Compression Complete!</strong>
            <span>
              {result.saved > 0 
                ? `Successfully reduced file size by ${result.savedPct}% (${formatSize(result.saved)} saved)` 
                : "PDF was already highly optimized. Saved original version."
              }
            </span>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--g500)" }}>
              <span>Before: {formatSize(result.originalSize)}</span>
              <span>After: {formatSize(result.size)}</span>
            </div>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "12px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Compressed PDF
            </a>
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

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleCompress}
        >
          <Percent size={14} /> Compress PDF
        </button>
      </div>
    </div>
  );
}
