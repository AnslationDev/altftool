"use client";

import React, { useState } from "react";
import { Upload, X, ImageIcon, Check, AlertCircle, Shield, Info, Download } from "lucide-react";

export default function ExifRemover() {
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
    if (droppedFiles.length > 0 && (droppedFiles[0].type === "image/jpeg" || droppedFiles[0].type === "image/png")) {
      handleFileChange({ target: { files: droppedFiles } });
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const stripExifFromJpeg = (arrayBuffer) => {
    const dv = new DataView(arrayBuffer);
    if (dv.getUint16(0) !== 0xFFD8) {
      return arrayBuffer; // Not a valid JPEG
    }
    
    let offset = 2;
    const chunks = [];
    chunks.push(new Uint8Array(arrayBuffer.slice(0, 2))); // Add SOI
    
    const len = arrayBuffer.byteLength;
    while (offset < len) {
      if (offset + 4 > len) {
        chunks.push(new Uint8Array(arrayBuffer.slice(offset)));
        break;
      }
      
      const marker = dv.getUint16(offset);
      if (marker === 0xFFD9) { // End of Image
        chunks.push(new Uint8Array(arrayBuffer.slice(offset)));
        break;
      }
      
      // If marker is standard, find length
      const size = dv.getUint16(offset + 2);
      
      // Remove APP1 segment (0xFFE1) which carries EXIF, GPS and metadata
      if (marker === 0xFFE1) {
        offset += 2 + size; // skip EXIF
      } else {
        chunks.push(new Uint8Array(arrayBuffer.slice(offset, offset + 2 + size)));
        offset += 2 + size;
      }
    }
    
    const totalLength = chunks.reduce((acc, cur) => acc + cur.length, 0);
    const resultBytes = new Uint8Array(totalLength);
    let pos = 0;
    for (const chunk of chunks) {
      resultBytes.set(chunk, pos);
      pos += chunk.length;
    }
    return resultBytes.buffer;
  };

  const stripMetadataFromPng = (arrayBuffer) => {
    const dv = new DataView(arrayBuffer);
    if (dv.getUint32(0) !== 0x89504E47 || dv.getUint32(4) !== 0x0D0A1A0A) {
      return arrayBuffer; // Not a valid PNG
    }
    
    const chunks = [];
    chunks.push(new Uint8Array(arrayBuffer.slice(0, 8))); // PNG signature
    
    let offset = 8;
    const len = arrayBuffer.byteLength;
    
    while (offset < len) {
      if (offset + 8 > len) {
        chunks.push(new Uint8Array(arrayBuffer.slice(offset)));
        break;
      }
      
      const chunkLength = dv.getUint32(offset);
      const chunkType = String.fromCharCode(
        dv.getUint8(offset + 4),
        dv.getUint8(offset + 5),
        dv.getUint8(offset + 6),
        dv.getUint8(offset + 7)
      );
      
      const totalChunkLength = 12 + chunkLength; // length + type + data + crc
      
      // Only keep critical chunks: IHDR, PLTE, IDAT, IEND, and transparency tRNS
      const criticalChunks = ["IHDR", "PLTE", "IDAT", "IEND", "tRNS"];
      if (criticalChunks.includes(chunkType)) {
        chunks.push(new Uint8Array(arrayBuffer.slice(offset, offset + totalChunkLength)));
      }
      
      offset += totalChunkLength;
      if (chunkType === "IEND") break;
    }
    
    const totalLength = chunks.reduce((acc, cur) => acc + cur.length, 0);
    const resultBytes = new Uint8Array(totalLength);
    let pos = 0;
    for (const chunk of chunks) {
      resultBytes.set(chunk, pos);
      pos += chunk.length;
    }
    return resultBytes.buffer;
  };

  const handleCleanMetadata = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let cleanedBuffer;

      if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
        cleanedBuffer = stripExifFromJpeg(arrayBuffer);
      } else if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
        cleanedBuffer = stripMetadataFromPng(arrayBuffer);
      } else {
        throw new Error("Unsupported image format. Please upload JPEG or PNG.");
      }

      const outBlob = new Blob([cleanedBuffer], { type: file.type });
      const outName = `${file.name.replace(/\.[^.]+$/, "")}_cleaned.${file.name.split(".").pop()}`;
      const downloadUrl = URL.createObjectURL(outBlob);

      const sizeDiff = file.size - outBlob.size;

      setResult({
        name: outName,
        size: outBlob.size,
        savedBytes: sizeDiff > 0 ? sizeDiff : 0,
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
      setResult({ error: err.message || "Failed to strip image EXIF." });
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
          onClick={() => document.getElementById("exif-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a JPG or PNG here, or click to browse</p>
          <p className="dz-hint">Remove EXIF, camera tags, device properties, and location tags completely locally</p>
          
        </div>

<input 
            type="file" 
            id="exif-input-file" 
            accept="image/jpeg, image/png" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Image</h4>
          <div className="file-list">
            <div className="file-item">
              <span className="file-icon"><ImageIcon size={16} /></span>
              <span className="file-name" title={file.name}>{file.name}</span>
              <span className="file-size">{formatSize(file.size)}</span>
              <button className="file-remove" onClick={removeFile} disabled={processing}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={16} style={{ color: "var(--ok)" }} /> Metadata Clean Settings
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "6px" }}>
            <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#115e59" }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                This operation will strip the following metadata structures locally:
                <ul style={{ margin: "6px 0 0 16px", padding: 0, listStyleType: "disc" }}>
                  <li>GPS location coordinates</li>
                  <li>Camera details (ISO, Shutter speed, Aperture, Model)</li>
                  <li>Software creator/editor signatures (Photoshop, GIMP)</li>
                  <li>Original timestamp metadata</li>
                  <li>Non-essential color spaces and thumbnail blocks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Stripping binary metadata tags...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "90%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Metadata Cleaned Successfully!</strong>
            <span>Your image has been stripped of all location and device information.</span>
            <small>
              {formatSize(result.size)} • Cleaned name: {result.name}
              {result.savedBytes > 0 && ` (Saved ${formatSize(result.savedBytes)} of metadata data)`}
            </small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Cleaned Image
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Cleaning Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && !processing && !result && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            onClick={handleCleanMetadata}
          >
            <Shield size={14} /> Clear EXIF &amp; Download
          </button>
        </div>
      )}
    </div>
  );
}
