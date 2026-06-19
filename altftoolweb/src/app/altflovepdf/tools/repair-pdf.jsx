"use client";

import React, { useState } from "react";
import { Upload, X, FileText, Check, AlertCircle, Wrench, Sparkles } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function RepairPdf() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
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
      handleFileChange({ target: { files: droppedFiles } });
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const repairPdfBytes = (bytes) => {
    // 1. Locate start of PDF marker (%PDF-) to clear leading noise
    const headerBytes = new Uint8Array([37, 80, 68, 70, 45]); // "%PDF-"
    let startIndex = -1;
    for (let i = 0; i < bytes.length - 5; i++) {
      if (
        bytes[i] === headerBytes[0] &&
        bytes[i + 1] === headerBytes[1] &&
        bytes[i + 2] === headerBytes[2] &&
        bytes[i + 3] === headerBytes[3] &&
        bytes[i + 4] === headerBytes[4]
      ) {
        startIndex = i;
        break;
      }
    }

    let workingBytes = bytes;
    if (startIndex > 0) {
      workingBytes = bytes.subarray(startIndex);
    }

    // 2. Locate ending marker (%%EOF) to clear trailing web socket or download junk
    const eofBytes = new Uint8Array([37, 37, 69, 79, 70]); // "%%EOF"
    let lastEofIndex = -1;
    for (let i = workingBytes.length - 5; i >= 0; i--) {
      if (
        workingBytes[i] === eofBytes[0] &&
        workingBytes[i + 1] === eofBytes[1] &&
        workingBytes[i + 2] === eofBytes[2] &&
        workingBytes[i + 3] === eofBytes[3] &&
        workingBytes[i + 4] === eofBytes[4]
      ) {
        lastEofIndex = i;
        break;
      }
    }

    if (lastEofIndex !== -1) {
      const trimEnd = lastEofIndex + 5;
      if (trimEnd < workingBytes.length) {
        workingBytes = workingBytes.subarray(0, trimEnd);
      }
    }

    return workingBytes;
  };

  const handleRepairPdf = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const rawBytes = new Uint8Array(await file.arrayBuffer());
      
      // Perform header/footer byte alignment repairs
      const cleanedBytes = repairPdfBytes(rawBytes);

      // Load document bytes to trigger internal tree parsing and rebuild XRef offset table
      const doc = await PDFDocument.load(cleanedBytes, { ignoreEncryption: true });
      
      // Save rebuilding structural streams
      const repairedBytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false
      });

      const outName = `${file.name.replace(/\.[^.]+$/, "")}_repaired.pdf`;
      const downloadUrl = URL.createObjectURL(new Blob([repairedBytes], { type: "application/pdf" }));

      setResult({
        name: outName,
        size: repairedBytes.byteLength,
        url: downloadUrl
      });

      // Auto download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setResult({ error: err.message || "Unable to parse or rebuild cross-reference trees." });
    } finally {
      setProcessing(false);
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
          onClick={() => document.getElementById("repair-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a corrupted PDF here, or click to browse</p>
          <p className="dz-hint">Fix broken XRef tables, trim leading/trailing garbage bytes, and rewrite structure streams</p>
          
        </div>

<input 
            type="file" 
            id="repair-input-file" 
            accept=".pdf" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected PDF</h4>
          <div className="file-list">
            <div className="file-item">
              <span className="file-icon"><FileText size={16} /></span>
              <span className="file-name" title={file.name}>{file.name}</span>
              <span className="file-size">{formatSize(file.size)}</span>
              <button className="file-remove" onClick={() => setFile(null)} disabled={processing}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Wrench size={16} /> Rebuild Repair Engine
          </h4>
          <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "6px" }}>
            <Sparkles size={18} style={{ color: "#0d9488", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#115e59" }}>
              <strong>Browser Repair Details:</strong> This tool will trim header noise, locate structural boundaries, rewrite indexing catalogs, and reconstruct damaged PDF properties.
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Parsing objects and reconstructing references...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "85%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Repair Complete!</strong>
            <span>Your document has been restructured and recovered.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Repaired PDF
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Repair Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && !processing && !result && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button className="btn btn-pri" onClick={handleRepairPdf}>
            Reconstruct &amp; Repair PDF
          </button>
        </div>
      )}
    </div>
  );
}
