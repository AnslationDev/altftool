"use client";

import React, { useState } from "react";
import { Upload, X, FileText, Check, AlertCircle, Unlock } from "lucide-react";
import { decryptPDF, isEncrypted } from "../lib/pdf-decrypt";

export default function UnlockPdf() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const processUploadedFile = async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setPassword("");
    setProcessing(true);
    setProgress(15);
    setStatusText("Analyzing uploaded PDF...");

    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const info = await isEncrypted(bytes);

      if (!info.encrypted) {
        setProcessing(false);
        setProgress(0);
        setResult({ isNotEncrypted: true });
        return;
      }

      // Try automatic decryption with empty string
      try {
        const outputBytes = await decryptPDF(bytes, "");
        setProgress(100);
        setProcessing(false);

        const blob = new Blob([outputBytes], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);
        const name = selectedFile.name.replace(".pdf", "") + "_unlocked.pdf";

        setResult({
          name: name,
          size: outputBytes.byteLength,
          url: downloadUrl,
          autoUnlocked: true
        });

        // Auto download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (autoErr) {
        // Automatic empty password decryption failed, password is required
        setProcessing(false);
        setProgress(0);
        setResult({ requiresPassword: true });
      }
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to process PDF." });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processUploadedFile(selectedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0 && droppedFiles[0].name.toLowerCase().endsWith(".pdf")) {
      processUploadedFile(droppedFiles[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPassword("");
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleUnlock = async () => {
    if (!file) return;
    if (!password) {
      setResult({ error: "Please enter the decryption password.", requiresPassword: true });
      return;
    }

    setProcessing(true);
    setProgress(30);
    setStatusText("Reading PDF bytes...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setProgress(60);
      setStatusText("Attempting to decrypt with password...");

      const outputBytes = await decryptPDF(bytes, password);
      
      setProgress(85);
      setStatusText("Saving unlocked PDF...");

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_unlocked.pdf";

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

      setPassword("");

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ 
        error: "Incorrect password. The provided password does not match the user or owner password.", 
        requiresPassword: true 
      });
    }
  };

  const showSuccessBox = result && !result.error && !result.requiresPassword && !result.isNotEncrypted;

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
          <div 
            className="dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("unlock-input-file").click()}
          >
            <div className="dz-ic">
              <Upload size={32} />
            </div>
            <p className="dz-main">Drag and drop an encrypted PDF here, or click to browse</p>
            <p className="dz-hint">Decrypts protected files and removes opening passwords permanently</p>
          </div>

          <input 
            type="file" 
            id="unlock-input-file" 
            accept=".pdf" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()} 
          />
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

      {file && result?.requiresPassword && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Decrypt Credentials</h4>
          <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#fffaf0", border: "1px solid #feebc8", borderRadius: "6px", marginBottom: "16px" }}>
            <AlertCircle size={18} style={{ color: "#dd6b20", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#7b341e" }}>
              This PDF document is encrypted. Please enter the password below to decrypt and unlock it.
            </div>
          </div>
          <div className="cg" style={{ maxWidth: "400px" }}>
            <label className="lbl">Enter PDF Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Opening password"
              style={{ marginTop: "6px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUnlock();
              }}
            />
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

      {result && result.isNotEncrypted && (
        <div className="result-box active" style={{ marginTop: "20px", background: "var(--g100)", borderColor: "var(--g300)" }}>
          <span className="result-icon" style={{ color: "var(--g500)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>This PDF is not encrypted</strong>
            <span>The selected document has no password protection or encryption. No unlocking is required.</span>
          </div>
        </div>
      )}

      {showSuccessBox && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>PDF Decrypted Successfully!</strong>
            <span>All password protections have been removed from this document.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Unlocked PDF
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Decryption Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && result?.requiresPassword && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleUnlock}
          >
            <Unlock size={14} /> Decrypt &amp; Unlock
          </button>
        </div>
      )}
    </div>
  );
}
