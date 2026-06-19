"use client";

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Type } from "lucide-react";

export default function HeaderFooter() {
  const [file, setFile] = useState(null);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [alignment, setAlignment] = useState("center"); // "left", "center", "right"
  const [fontSize, setFontSize] = useState(10);
  const [margin, setMargin] = useState(25);
  const [color, setColor] = useState("#4b5563"); // default gray-600
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

  const handleApply = async () => {
    if (!file) return;
    if (!headerText.trim() && !footerText.trim()) {
      setResult({ error: "Please enter at least header text or footer text." });
      return;
    }

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

      const resolveTemplate = (text, pageNum, totalNum) => {
        return text
          .replace(/\{n\}/g, String(pageNum))
          .replace(/\{total\}/g, String(totalNum));
      };

      pages.forEach((page, i) => {
        setProgress(Math.round((i / total) * 70) + 15);
        const { width, height } = page.getSize();
        const pageNum = i + 1;

        const drawTextRow = (textTemplate, y) => {
          if (!textTemplate.trim()) return;
          const resolvedText = resolveTemplate(textTemplate, pageNum, total);
          const tW = font.widthOfTextAtSize(resolvedText, fontSize);
          
          let x;
          if (alignment === "left") {
            x = margin;
          } else if (alignment === "right") {
            x = width - margin - tW;
          } else {
            x = (width - tW) / 2;
          }

          page.drawText(resolvedText, {
            x,
            y,
            size: fontSize,
            font,
            color: pdfColor
          });
        };

        // Draw header text near top margin
        if (headerText) {
          drawTextRow(headerText, height - margin - fontSize);
        }

        // Draw footer text near bottom margin
        if (footerText) {
          drawTextRow(footerText, margin);
        }
      });

      setProgress(90);
      setStatusText("Saving document...");
      const outputBytes = await doc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_header_footer.pdf";

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
      setResult({ error: err.message || "Failed to add header & footer text." });
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
          onClick={() => document.getElementById("hf-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Add running header or footer notes to all pages</p>
          
        </div>

<input 
            type="file" 
            id="hf-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "16px" }}>Header &amp; Footer Layout</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Header Text Template:</label>
              <input 
                type="text" 
                placeholder="e.g. CONFIDENTIAL DOCUMENT"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Footer Text Template:</label>
              <input 
                type="text" 
                placeholder="e.g. Page {n} of {total}"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                style={{ marginTop: "6px" }}
              />
            </div>
          </div>

          <p style={{ fontSize: "11px", color: "var(--g500)", marginTop: "-10px", marginBottom: "16px" }}>
            Use template tags <strong>{"{n}"}</strong> for current page number and <strong>{"{total}"}</strong> for total pages.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Text Alignment:</label>
              <select 
                value={alignment} 
                onChange={(e) => setAlignment(e.target.value)}
                style={{ marginTop: "6px" }}
              >
                <option value="left">Left Aligned</option>
                <option value="center">Centered</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>

            <div className="cg">
              <label className="lbl">Margin Gap (pt):</label>
              <input 
                type="number" 
                min="10" 
                max="80" 
                value={margin} 
                onChange={(e) => setMargin(Math.max(10, Math.min(80, parseInt(e.target.value) || 25)))}
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
              <label className="lbl">Font Color:</label>
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
            <strong>Header &amp; Footer Applied!</strong>
            <span>Successfully updated PDF with running header &amp; footer text annotations.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download PDF File
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
          onClick={handleApply}
        >
          <Type size={14} /> Add Header &amp; Footer
        </button>
      </div>
    </div>
  );
}
