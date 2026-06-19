"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { Upload, X, FileText, Check, AlertCircle, Copy, Download } from "lucide-react";

export default function PdfToText() {
  const [file, setFile] = useState(null);
  const [includeDividers, setIncludeDividers] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setResult(null);
      setExtractedText("");
      setCopied(false);
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
      setExtractedText("");
      setCopied(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setExtractedText("");
    setCopied(false);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(15);
    setStatusText("Reading PDF structure...");
    setResult(null);
    setExtractedText("");
    setCopied(false);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfjs();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const totalPages = pdfJsDoc.numPages;

      let combinedText = "";

      for (let i = 1; i <= totalPages; i++) {
        const step = 15 + Math.round((i / totalPages) * 75);
        setProgress(step);
        setStatusText(`Extracting text from page ${i} of ${totalPages}...`);

        const page = await pdfJsDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = null;
        let pageText = "";
        
        for (const item of textContent.items) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += "\n";
          }
          pageText += item.str + " ";
          lastY = item.transform[5];
        }

        if (includeDividers) {
          combinedText += `\n--- PAGE ${i} ---\n\n` + pageText.trim() + "\n";
        } else {
          combinedText += pageText.trim() + "\n\n";
        }
      }

      setExtractedText(combinedText.trim());
      
      setProgress(100);
      setProcessing(false);
      setStatusText("Text extraction complete!");

      // Generate downloadable txt file
      const blob = new Blob([combinedText.trim()], { type: "text/plain;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_text.txt";

      setResult({
        name: name,
        size: blob.size,
        url: downloadUrl
      });

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to extract text from PDF." });
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
<div 
          className="dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf2txt-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Extract raw plain text from searchable PDFs</p>
          
        </div>

<input 
            type="file" 
            id="pdf2txt-input-file" 
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

      {file && !extractedText && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Extraction Settings</h4>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
            <input 
              type="checkbox" 
              checked={includeDividers} 
              onChange={(e) => setIncludeDividers(e.target.checked)} 
              style={{ width: "16px", height: "16px" }}
            />
            Include Page Number Dividers (e.g. &quot;--- PAGE 1 ---&quot;)
          </label>
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

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Extraction Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {extractedText && (
        <div className="text-output-section" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 className="lbl">Extracted Text Content</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-sec" onClick={copyToClipboard} style={{ padding: "6px 12px", fontSize: "12px" }}>
                <Copy size={12} /> {copied ? "Copied!" : "Copy Text"}
              </button>
              {result && (
                <a href={result.url} download={result.name} className="btn btn-pri" style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none", display: "inline-flex" }}>
                  <Download size={12} /> Download Text File
                </a>
              )}
            </div>
          </div>
          <textarea
            className="out-ta"
            value={extractedText}
            readOnly
            style={{ width: "100%", height: "350px", border: "1.5px solid var(--g300)" }}
          />
        </div>
      )}

      {!extractedText && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={!file || processing}
            onClick={handleExtract}
          >
            Extract Text
          </button>
        </div>
      )}
    </div>
  );
}
