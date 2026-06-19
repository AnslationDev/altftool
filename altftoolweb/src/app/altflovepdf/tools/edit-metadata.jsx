"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Edit } from "lucide-react";

export default function EditMetadata() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);

      try {
        const bytes = new Uint8Array(await selected.arrayBuffer());
        const doc = await PDFDocument.load(bytes);
        setTitle(doc.getTitle() || "");
        setAuthor(doc.getAuthor() || "");
        setSubject(doc.getSubject() || "");
        setKeywords((doc.getKeywords() || []).join(", "));
        setCreator(doc.getCreator() || "");
        setProducer(doc.getProducer() || "");
      } catch (err) {
        console.error(err);
        setResult({ error: "Could not read metadata fields from PDF." });
      }
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

  const removeFile = () => {
    setFile(null);
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
    setCreator("");
    setProducer("");
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const clearForm = () => {
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
    setCreator("");
    setProducer("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleSaveMetadata = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(20);
    setStatusText("Reading PDF document...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);

      // Apply metadata attributes
      doc.setTitle(title.trim());
      doc.setAuthor(author.trim());
      doc.setSubject(subject.trim());
      
      const parsedKeywords = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      doc.setKeywords(parsedKeywords);
      
      doc.setCreator(creator.trim());
      doc.setProducer(producer.trim());
      doc.setModificationDate(new Date());

      setProgress(75);
      setStatusText("Saving metadata headers...");
      const outputBytes = await doc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_meta.pdf";

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
      setResult({ error: err.message || "Failed to update PDF metadata." });
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
          onClick={() => document.getElementById("meta-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">View, edit, or remove PDF document tags and property values</p>
          
        </div>

<input 
            type="file" 
            id="meta-input-file" 
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
          <h4 className="lbl" style={{ marginBottom: "16px" }}>Document Metadata Fields</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Document Title:</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Author / Creator Name:</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
                style={{ marginTop: "6px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cg">
              <label className="lbl">Subject / Description:</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">Keywords (comma separated):</label>
              <input 
                type="text" 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="key1, key2, key3"
                style={{ marginTop: "6px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="cg">
              <label className="lbl">Creator Application:</label>
              <input 
                type="text" 
                value={creator} 
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Creator Application"
                style={{ marginTop: "6px" }}
              />
            </div>

            <div className="cg">
              <label className="lbl">PDF Producer Tool:</label>
              <input 
                type="text" 
                value={producer} 
                onChange={(e) => setProducer(e.target.value)}
                placeholder="PDF Producer"
                style={{ marginTop: "6px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button className="btn btn-sec" onClick={clearForm} style={{ padding: "6px 12px", fontSize: "12px" }}>
              Clear Fields
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
            <strong>Metadata Updated!</strong>
            <span>Successfully updated PDF property records.</span>
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
            <strong>Operation Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleSaveMetadata}
        >
          <Edit size={14} /> Update Metadata
        </button>
      </div>
    </div>
  );
}
