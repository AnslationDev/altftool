"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, ImageIcon, Check, AlertCircle, Crop, RotateCcw } from "lucide-react";

export default function ImageCrop() {
  const [file, setFile] = useState(null);
  const [imgElement, setImgElement] = useState(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [cropRect, setCropRect] = useState(null); // { x, y, w, h } relative to canvas
  const [format, setFormat] = useState("png"); // "png", "jpg", "webp"
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    drawBaseImage();
  }, [imgElement]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);
      setCropRect(null);

      const img = new Image();
      const url = URL.createObjectURL(selected);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxW = 520;
        const maxH = 320;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        
        setImgElement(img);
        setDisplayScale(scale);
        setNaturalW(img.naturalWidth);
        setNaturalH(img.naturalHeight);
      };
      img.src = url;
    }
  };

  const drawBaseImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;
    
    const cW = Math.round(naturalW * displayScale);
    const cH = Math.round(naturalH * displayScale);
    
    canvas.width = cW;
    canvas.height = cH;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0, cW, cH);
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current || !imgElement) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawingRef.current = true;
    startPosRef.current = { x, y };
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current || !canvasRef.current || !imgElement) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    // Draw clean base image
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    
    // Draw cropping selector box overlay
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    
    const width = curX - startPosRef.current.x;
    const height = curY - startPosRef.current.y;
    
    ctx.strokeRect(startPosRef.current.x, startPosRef.current.y, width, height);
    ctx.fillStyle = "rgba(37, 99, 235, 0.08)";
    ctx.fillRect(startPosRef.current.x, startPosRef.current.y, width, height);
  };

  const handleMouseUp = (e) => {
    if (!drawingRef.current || !canvasRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const x = Math.min(startPosRef.current.x, endX);
    const y = Math.min(startPosRef.current.y, endY);
    const w = Math.abs(endX - startPosRef.current.x);
    const h = Math.abs(endY - startPosRef.current.y);

    if (w < 6 || h < 6) return; // ignore tiny double-clicks

    setCropRect({ x, y, w, h });
  };

  const handleResetCrop = () => {
    setCropRect(null);
    drawBaseImage();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0 && droppedFiles[0].type.startsWith("image/")) {
      handleFileChange({ target: { files: droppedFiles } });
    }
  };

  const removeFile = () => {
    setFile(null);
    setImgElement(null);
    setCropRect(null);
    setResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleCropImage = () => {
    if (!file || !cropRect || !imgElement) return;
    setProcessing(true);
    setResult(null);

    try {
      const { x, y, w, h } = cropRect;
      
      // Map canvas crop region back to natural coordinates
      const nx = Math.round(x / displayScale);
      const ny = Math.round(y / displayScale);
      const nw = Math.round(w / displayScale);
      const nh = Math.round(h / displayScale);

      const outCanvas = document.createElement("canvas");
      outCanvas.width = nw;
      outCanvas.height = nh;
      outCanvas.getContext("2d").drawImage(
        imgElement,
        nx, ny, nw, nh, // source rect
        0, 0, nw, nh  // dest rect
      );

      const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const ext = format;
      const qualityVal = quality / 100;

      outCanvas.toBlob((blob) => {
        const base = file.name.replace(/\.[^.]+$/, "");
        const outName = `${base}_cropped.${ext}`;
        const downloadUrl = URL.createObjectURL(blob);

        setResult({
          name: outName,
          size: blob.size,
          url: downloadUrl,
          dimensions: `${nw} × ${nh}`
        });

        // Auto download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setProcessing(false);
      }, mime, qualityVal);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setResult({ error: err.message || "Failed to crop image." });
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
          onClick={() => document.getElementById("crop-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop an image here, or click to browse</p>
          <p className="dz-hint">Click and drag boundaries to crop selections</p>
          
        </div>

<input 
            type="file" 
            id="crop-input-file" 
            accept="image/*" 
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
              <button className="file-remove" onClick={removeFile}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {imgElement && (
        <div className="crop-editor-wrapper" style={{ marginTop: "20px" }}>
          <div className="crop-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--g50)", padding: "12px", border: "1px solid var(--g200)", borderRadius: "8px 8px 0 0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--g500)" }}>
              {cropRect 
                ? `Selected: ${Math.round(cropRect.w / displayScale)} × ${Math.round(cropRect.h / displayScale)} px`
                : `Dimensions: ${naturalW} × ${naturalH} px (Drag on image to select area)`
              }
            </span>
            <button className="btn btn-sec" onClick={handleResetCrop} style={{ padding: "6px 12px", fontSize: "12.5px" }}>
              <RotateCcw size={13} /> Reset Selection
            </button>
          </div>

          <div 
            className="crop-canvas-container" 
            style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              padding: "24px", 
              background: "var(--g100)", 
              border: "1px solid var(--g200)", 
              borderTop: "none", 
              borderRadius: "0 0 8px 8px" 
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { drawingRef.current = false; }}
              style={{ 
                cursor: "crosshair", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                background: "#ffffff",
                userSelect: "none"
              }}
            />
          </div>

          <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Export Crop Settings</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="cg">
                <label className="lbl">Output Format:</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="png">PNG Format (Recommended for charts/text)</option>
                  <option value="jpg">JPG Format (Compressed)</option>
                  <option value="webp">WebP Modern Format</option>
                </select>
              </div>

              <div className="cg">
                <label className="lbl">Quality (%):</label>
                <input 
                  type="number" 
                  min="50" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Math.min(100, Math.max(50, parseInt(e.target.value) || 90)))}
                  style={{ marginTop: "6px" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Cropping image layer...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "80%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Cropped Successfully!</strong>
            <span>New cropped region is ready.</span>
            <small>{formatSize(result.size)} • {result.dimensions} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Cropped Image
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Cropping Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {imgElement && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={!cropRect || processing}
            onClick={handleCropImage}
          >
            <Crop size={14} /> Crop Selection
          </button>
        </div>
      )}
    </div>
  );
}
