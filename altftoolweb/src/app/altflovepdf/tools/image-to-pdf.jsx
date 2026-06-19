"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, Image as ImageIcon, Check, AlertCircle, FileImage } from "lucide-react";

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [layoutMode, setLayoutMode] = useState("fit"); // "fit", "a4-portrait", "a4-landscape", "letter-portrait", "letter-landscape"
  const [marginMode, setMarginMode] = useState("none"); // "none", "small", "large"
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imgFiles = selectedFiles.filter(f => f.type.startsWith("image/"));
    if (imgFiles.length > 0) {
      setFiles(prev => [...prev, ...imgFiles]);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const imgFiles = droppedFiles.filter(f => f.type.startsWith("image/"));
    if (imgFiles.length > 0) {
      setFiles(prev => [...prev, ...imgFiles]);
      setResult(null);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const clearAll = () => {
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Initializing PDF Document...");
    setResult(null);

    try {
      const pdfDoc = await PDFDocument.create();
      
      const marginVal = marginMode === "none" ? 0 : marginMode === "small" ? 20 : 50;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const step = 10 + Math.round((i / files.length) * 75);
        setProgress(step);
        setStatusText(`Processing image ${i + 1} of ${files.length}: ${file.name}...`);

        // Load image onto helper element
        const img = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const tempImg = new Image();
            tempImg.onload = () => resolve(tempImg);
            tempImg.onerror = (err) => reject(new Error("Failed to decode image data: " + err.message));
            tempImg.src = e.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Draw image onto canvas to get standard JPEG byte array
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const response = await fetch(jpegDataUrl);
        const jpegBytes = await response.arrayBuffer();
        const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

        // Calculate page sizing
        let pageW, pageH;
        let imgW = img.naturalWidth;
        let imgH = img.naturalHeight;

        if (layoutMode === "fit") {
          pageW = imgW + marginVal * 2;
          pageH = imgH + marginVal * 2;
        } else {
          // Standard document sizes
          if (layoutMode.startsWith("a4")) {
            pageW = 595.28;
            pageH = 841.89;
          } else {
            pageW = 612;
            pageH = 792;
          }

          if (layoutMode.endsWith("landscape")) {
            const temp = pageW;
            pageW = pageH;
            pageH = temp;
          }
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        
        // Calculate image placement scale
        const availW = pageW - marginVal * 2;
        const availH = pageH - marginVal * 2;
        
        const widthScale = availW / imgW;
        const heightScale = availH / imgH;
        const finalScale = Math.min(widthScale, heightScale);

        const finalW = imgW * finalScale;
        const finalH = imgH * finalScale;
        
        const posX = marginVal + (availW - finalW) / 2;
        const posY = marginVal + (availH - finalH) / 2;

        page.drawImage(embeddedImg, {
          x: posX,
          y: posY,
          width: finalW,
          height: finalH
        });
      }

      setProgress(90);
      setStatusText("Saving PDF...");
      const pdfBytes = await pdfDoc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setResult({
        name: "images_converted.pdf",
        size: pdfBytes.byteLength,
        url: downloadUrl
      });

      // Auto download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "images_converted.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to convert images to PDF." });
    }
  };

  return (
    <div className="tool-workspace-inner">
      <>
<div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("img2pdf-input-file").click()}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>
        <p className="dz-main">Drag and drop images here, or click to browse</p>
        <p className="dz-hint">Supports JPG, PNG, and WebP images</p>
        
      </div>

<input 
          type="file" 
          id="img2pdf-input-file" 
          multiple 
          accept="image/*" 
          style={{ display: "none" }} 
          onChange={handleFileChange}
         onClick={(e) => e.stopPropagation()} />
</>

      {files.length > 0 && (
        <div className="file-list-container" style={{ marginTop: "20px" }}>
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Images ({files.length})</h4>
          <div className="file-list">
            {files.map((file, idx) => (
              <div className="file-item" key={idx}>
                <span className="file-icon"><FileImage size={16} /></span>
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
                <button className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(idx); }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Configuration</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${layoutMode === "fit" ? "active" : ""}`}
              onClick={() => setLayoutMode("fit")}
            >
              Fit Page to Image
            </button>
            <button 
              className={`radio-btn ${layoutMode === "a4-portrait" ? "active" : ""}`}
              onClick={() => setLayoutMode("a4-portrait")}
            >
              A4 Portrait
            </button>
            <button 
              className={`radio-btn ${layoutMode === "a4-landscape" ? "active" : ""}`}
              onClick={() => setLayoutMode("a4-landscape")}
            >
              A4 Landscape
            </button>
            <button 
              className={`radio-btn ${layoutMode === "letter-portrait" ? "active" : ""}`}
              onClick={() => setLayoutMode("letter-portrait")}
            >
              Letter Portrait
            </button>
            <button 
              className={`radio-btn ${layoutMode === "letter-landscape" ? "active" : ""}`}
              onClick={() => setLayoutMode("letter-landscape")}
            >
              Letter Landscape
            </button>
          </div>

          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Margin</h4>
          <div className="radio-group">
            <button 
              className={`radio-btn ${marginMode === "none" ? "active" : ""}`}
              onClick={() => setMarginMode("none")}
            >
              No Margin
            </button>
            <button 
              className={`radio-btn ${marginMode === "small" ? "active" : ""}`}
              onClick={() => setMarginMode("small")}
            >
              Small (20pt)
            </button>
            <button 
              className={`radio-btn ${marginMode === "large" ? "active" : ""}`}
              onClick={() => setMarginMode("large")}
            >
              Large (50pt)
            </button>
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
            <span>Successfully generated PDF from {files.length} images.</span>
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

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={files.length === 0 || processing}
          onClick={handleConvert}
        >
          <ImageIcon size={14} /> Convert to PDF
        </button>
        {files.length > 0 && (
          <button 
            className="btn btn-sec" 
            disabled={processing}
            onClick={clearAll}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
