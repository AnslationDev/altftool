"use client";

import React, { useState } from "react";
import { Upload, X, FileText, Check, AlertCircle, Lock } from "lucide-react";
import { encryptPDF } from "../lib/pdf-encrypt";

export default function ProtectPdf() {
  const [file, setFile] = useState(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
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
    setUserPassword("");
    setOwnerPassword("");
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleProtect = async () => {
    if (!file) return;
    if (!userPassword) {
      setResult({ error: "Please enter a user opening password." });
      return;
    }

    setProcessing(true);
    setProgress(20);
    setStatusText("Reading PDF file...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      
      setProgress(50);
      setStatusText("Applying encryption algorithm...");
      
      const ownerPw = ownerPassword.trim() || userPassword;
      
      const outputBytes = await encryptPDF(bytes, userPassword, {
        ownerPassword: ownerPw,
        algorithm: "AES-256"
      });

      setProgress(85);
      setStatusText("Saving protected PDF...");

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_protected.pdf";

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

      // Reset passwords for security
      setUserPassword("");
      setOwnerPassword("");

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to protect PDF document." });
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
          onClick={() => document.getElementById("protect-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Secure your document with custom user passwords</p>
          
        </div>

<input 
            type="file" 
            id="protect-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "16px" }}>Encryption Settings</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="cg">
              <label className="lbl">User Password (to Open Document):</label>
              <input 
                type="password" 
                value={userPassword} 
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Required"
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Owner Password (to Modify Permissions):</label>
              <input 
                type="password" 
                value={ownerPassword} 
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Optional (defaults to user password)"
                style={{ marginTop: "6px" }}
              />
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
            <strong>Encryption Complete!</strong>
            <span>Your document is now locked with password protection.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Protected PDF
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
          onClick={handleProtect}
        >
          <Lock size={14} /> Protect PDF
        </button>
      </div>
    </div>
  );
}
