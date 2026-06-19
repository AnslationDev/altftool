"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Hash } from "lucide-react";

export default function PageNumbers() {
  const [file, setFile] = useState(null);
  const [startPage, setStartPage] = useState(1);
  const [format, setFormat] = useState("page-n"); // "n", "page-n", "n-of-total"
  const [position, setPosition] = useState("bottom-right"); // "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
  const [fontSize, setFontSize] = useState(10);
  const [margin, setMargin] = useState(30);
  const [color, setColor] = useState("#4b5563"); // hex code color default gray-600
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

  // Convert HEX string to PDFLib rgb colors
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const cleanHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
    return result
      ? rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        )
      : rgb(0.3, 0.3, 0.3);
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(15);
    setStatusText("Reading PDF pages...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;

      const pdfColor = hexToRgb(color);

      pages.forEach((page, i) => {
        setProgress(Math.round((i / total) * 75) + 15);
        const { width, height } = page.getSize();
        const n = startPage + i;
        
        let label;
        if (format === "n") {
          label = String(n);
        } else if (format === "page-n") {
          label = `Page ${n}`;
        } else {
          label = `${n} of ${total + startPage - 1}`;
        }

        const tW = font.widthOfTextAtSize(label, fontSize);
        let x, y;

        // Position lookup
        if (position === "top-left") {
          x = margin;
          y = height - margin - fontSize;
        } else if (position === "top-center") {
          x = width / 2 - tW / 2;
          y = height - margin - fontSize;
        } else if (position === "top-right") {
          x = width - margin - tW;
          y = height - margin - fontSize;
        } else if (position === "bottom-left") {
          x = margin;
          y = margin;
        } else if (position === "bottom-center") {
          x = width / 2 - tW / 2;
          y = margin;
        } else {
          // bottom-right
          x = width - margin - tW;
          y = margin;
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: pdfColor
        });
      });

      setProgress(90);
      setStatusText("Saving numbered document...");
      const outputBytes = await doc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_numbered.pdf";

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
      setResult({ error: err.message || "Failed to add page numbers." });
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
          onClick={() => document.getElementById("pn-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Inject dynamic running headers or footers with page counts</p>
          
        </div>

<input 
            type="file" 
            id="pn-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "16px" }}>Page Number Settings</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Start Numbering From:</label>
              <input 
                type="number" 
                min="1" 
                value={startPage} 
                onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Text Format:</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                style={{ marginTop: "6px" }}
              >
                <option value="n">Just Numbers (e.g. "1")</option>
                <option value="page-n">Page Prefix (e.g. "Page 1")</option>
                <option value="n-of-total">Total Progress (e.g. "1 of 12")</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Layout Alignment:</label>
              <select 
                value={position} 
                onChange={(e) => setPosition(e.target.value)}
                style={{ marginTop: "6px" }}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="cg">
              <label className="lbl">Page Margin Buffer (pt):</label>
              <input 
                type="number" 
                min="10" 
                max="100" 
                value={margin} 
                onChange={(e) => setMargin(Math.max(10, Math.min(100, parseInt(e.target.value) || 30)))}
                style={{ marginTop: "6px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="cg">
              <label className="lbl">Font Size (pt):</label>
              <input 
                type="number" 
                min="6" 
                max="24" 
                value={fontSize} 
                onChange={(e) => setFontSize(Math.max(6, Math.min(24, parseInt(e.target.value) || 10)))}
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Text Color:</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  style={{ width: "38px", height: "38px", padding: "2px", border: "1px solid var(--g300)", borderRadius: "4px", cursor: "pointer" }}
                />
                <input 
                  type="text" 
                  value={color.toUpperCase()} 
                  onChange={(e) => setColor(e.target.value)} 
                  style={{ width: "100px", textTransform: "uppercase" }}
                />
              </div>
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
            <strong>Page Numbers Added!</strong>
            <span>Successfully updated PDF with running page indices.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Numbered PDF
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Operation Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleAddNumbers}
        >
          <Hash size={14} /> Add Page Numbers
        </button>
      </div>
    </div>
  );
}
