"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Plus } from "lucide-react";

export default function InsertBlankPages() {
  const [file, setFile] = useState(null);
  const [insertPos, setInsertPos] = useState("start"); // "start", "end", "specific"
  const [specificPage, setSpecificPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState("a4"); // "a4", "letter"
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

  const handleInsert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(20);
    setStatusText("Loading PDF...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const srcDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      
      const srcPages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      const totalOriginal = srcPages.length;

      setProgress(50);
      setStatusText("Configuring blank page sizing...");

      let bW = 595.28; // A4 width in pt
      let bH = 841.89; // A4 height in pt

      if (pageSize === "letter") {
        bW = 612; // Letter width in pt
        bH = 792; // Letter height in pt
      } else if (pageSize === "same" && totalOriginal > 0) {
        const firstPageSize = srcPages[0].getSize();
        bW = firstPageSize.width;
        bH = firstPageSize.height;
      }

      setProgress(70);
      setStatusText("Adding blank pages at insertion index...");

      const pageNum = Math.max(1, Math.min(totalOriginal, specificPage));

      if (insertPos === "start") {
        // Add blank pages first
        for (let i = 0; i < pageCount; i++) {
          outDoc.addPage([bW, bH]);
        }
        // Copy original pages
        srcPages.forEach(p => outDoc.addPage(p));
      } else if (insertPos === "end") {
        // Copy original pages
        srcPages.forEach(p => outDoc.addPage(p));
        // Add blank pages last
        for (let i = 0; i < pageCount; i++) {
          outDoc.addPage([bW, bH]);
        }
      } else {
        // Insert before pageNum
        srcPages.forEach((p, idx) => {
          if (idx === pageNum - 1) {
            for (let j = 0; j < pageCount; j++) {
              outDoc.addPage([bW, bH]);
            }
          }
          outDoc.addPage(p);
        });
      }

      setProgress(90);
      setStatusText("Saving PDF...");
      const outputBytes = await outDoc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_with_blanks.pdf";

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
      setResult({ error: err.message || "Failed to insert blank pages." });
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
          onClick={() => document.getElementById("insert-blank-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Blank pages will be inserted into this file</p>
          
        </div>

<input 
            type="file" 
            id="insert-blank-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Insertion Position</h4>
          <div className="radio-group" style={{ marginBottom: "20px" }}>
            <button 
              className={`radio-btn ${insertPos === "start" ? "active" : ""}`}
              onClick={() => setInsertPos("start")}
            >
              Start of PDF
            </button>
            <button 
              className={`radio-btn ${insertPos === "end" ? "active" : ""}`}
              onClick={() => setInsertPos("end")}
            >
              End of PDF
            </button>
            <button 
              className={`radio-btn ${insertPos === "specific" ? "active" : ""}`}
              onClick={() => setInsertPos("specific")}
            >
              Specific Page
            </button>
          </div>

          {insertPos === "specific" && (
            <div className="cg" style={{ marginBottom: "20px" }}>
              <label htmlFor="insert-page-num" className="lbl">Insert before Page Number:</label>
              <input 
                type="number" 
                id="insert-page-num" 
                value={specificPage}
                onChange={(e) => setSpecificPage(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                style={{ marginTop: "6px" }}
              />
            </div>
          )}

          <h4 className="lbl" style={{ marginBottom: "12px" }}>Page Layout &amp; Count</h4>
          <div className="split-inputs" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            <div className="cg">
              <label className="lbl">Number of Blank Pages:</label>
              <input 
                type="number" 
                value={pageCount} 
                onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div className="cg">
              <label className="lbl">Blank Page Size:</label>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                style={{ height: "39px" }}
              >
                <option value="a4">A4 (595 x 842 pt)</option>
                <option value="letter">Letter (612 x 792 pt)</option>
                <option value="same">Same as First Page</option>
              </select>
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
            <strong>Insertion Successful!</strong>
            <span>Added {pageCount} blank page(s) to your PDF.</span>
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
            <strong>Insertion Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleInsert}
        >
          <Plus size={14} /> Insert Blank Pages
        </button>
      </div>
    </div>
  );
}
