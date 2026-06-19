"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const pdfFiles = droppedFiles.filter(f => f.name.toLowerCase().endsWith(".pdf"));
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
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

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setProgress(10);
    setStatusText("Initializing PDF Document...");
    setResult(null);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const step = 10 + Math.round((i / files.length) * 70);
        setProgress(step);
        setStatusText(`Reading and merging: ${file.name}...`);

        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      setProgress(85);
      setStatusText("Optimizing and saving merged document...");
      const mergedPdfBytes = await mergedPdf.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      
      setResult({
        name: "merged.pdf",
        size: mergedPdfBytes.byteLength,
        url: downloadUrl
      });
      setStatusText("Merge successful!");

      // Auto trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to merge PDF files." });
    }
  };

  return (
    <div className="tool-workspace-inner">
      <>
<div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("merge-input-file").click()}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>
        <p className="dz-main">Drag and drop PDF files here, or click to browse</p>
        <p className="dz-hint">Supports multiple PDF files</p>
        
      </div>

<input 
          type="file" 
          id="merge-input-file" 
          multiple 
          accept=".pdf" 
          style={{ display: "none" }} 
          onChange={handleFileChange}
         onClick={(e) => e.stopPropagation()} />
</>

      {files.length > 0 && (
        <div className="file-list-container" style={{ marginTop: "20px" }}>
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Files ({files.length})</h4>
          <div className="file-list">
            {files.map((file, idx) => (
              <div className="file-item" key={idx}>
                <span className="file-icon"><FileText size={16} /></span>
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
            <strong>Merge Successful!</strong>
            <span>Your files were merged successfully.</span>
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
            <strong>Merge Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={files.length < 2 || processing}
          onClick={handleMerge}
        >
          Merge PDF
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
