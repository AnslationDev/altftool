"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, ImageIcon, Check, AlertCircle, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

export default function RotateImage() {
  const [file, setFile] = useState(null);
  const [imgElement, setImgElement] = useState(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState("png"); // "png", "jpg", "webp"
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    drawPreview();
  }, [imgElement, rotation, flipH, flipV]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);

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

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;

    // Calculate display dimensions based on rotation
    const is90or270 = rotation === 90 || rotation === 270;
    const currentW = is90or270 ? naturalH : naturalW;
    const currentH = is90or270 ? naturalW : naturalH;

    const maxW = 520;
    const maxH = 320;
    const scale = Math.min(maxW / currentW, maxH / currentH, 1);

    const cW = Math.round(currentW * scale);
    const cH = Math.round(currentH * scale);

    canvas.width = cW;
    canvas.height = cH;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cW, cH);

    // Apply rotation & flip transformations
    ctx.save();
    ctx.translate(cW / 2, cH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Render image
    const imgDrawW = is90or270 ? cH : cW;
    const imgDrawH = is90or270 ? cW : cH;
    ctx.drawImage(imgElement, -imgDrawW / 2, -imgDrawH / 2, imgDrawW, imgDrawH);
    ctx.restore();
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev + 270) % 360);
  };

  const toggleFlipH = () => {
    setFlipH((prev) => !prev);
  };

  const toggleFlipV = () => {
    setFlipV((prev) => !prev);
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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleApplyTransform = () => {
    if (!file || !imgElement) return;
    setProcessing(true);
    setResult(null);

    try {
      const is90or270 = rotation === 90 || rotation === 270;
      const targetW = is90or270 ? naturalH : naturalW;
      const targetH = is90or270 ? naturalW : naturalH;

      const outCanvas = document.createElement("canvas");
      outCanvas.width = targetW;
      outCanvas.height = targetH;

      const ctx = outCanvas.getContext("2d");
      ctx.clearRect(0, 0, targetW, targetH);

      // Apply natural-scale transformation
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(imgElement, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
      ctx.restore();

      const mime = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const ext = format;
      const qualityVal = quality / 100;

      outCanvas.toBlob((blob) => {
        const base = file.name.replace(/\.[^.]+$/, "");
        const outName = `${base}_rotated.${ext}`;
        const downloadUrl = URL.createObjectURL(blob);

        setResult({
          name: outName,
          size: blob.size,
          url: downloadUrl,
          dimensions: `${targetW} × ${targetH}`
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
      setResult({ error: err.message || "Failed to transform image." });
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
          onClick={() => document.getElementById("rotate-image-input").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop an image here, or click to browse</p>
          <p className="dz-hint">Rotate or flip images vertically/horizontally in-browser</p>
          
        </div>

<input 
            type="file" 
            id="rotate-image-input" 
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
              Preview: {rotation}° rotation {flipH ? "+ Horizontal Flip" : ""} {flipV ? "+ Vertical Flip" : ""}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-sec" onClick={rotateCounterClockwise} style={{ padding: "6px 10px", fontSize: "12.5px" }} title="Rotate 90° CCW">
                <RotateCcw size={14} />
              </button>
              <button className="btn btn-sec" onClick={rotateClockwise} style={{ padding: "6px 10px", fontSize: "12.5px" }} title="Rotate 90° CW">
                <RotateCw size={14} />
              </button>
              <button className={`btn btn-sec ${flipH ? "active" : ""}`} onClick={toggleFlipH} style={{ padding: "6px 10px", fontSize: "12.5px", background: flipH ? "var(--g200)" : "" }} title="Flip Horizontal">
                <FlipHorizontal size={14} />
              </button>
              <button className={`btn btn-sec ${flipV ? "active" : ""}`} onClick={toggleFlipV} style={{ padding: "6px 10px", fontSize: "12.5px", background: flipV ? "var(--g200)" : "" }} title="Flip Vertical">
                <FlipVertical size={14} />
              </button>
            </div>
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
              style={{ 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                background: "#ffffff",
                userSelect: "none"
              }}
            />
          </div>

          <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Export Options</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="cg">
                <label className="lbl">Output Format:</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="png">PNG Format (Lossless)</option>
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
          <div className="progress-label">Applying transformations...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "80%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Transformation Complete!</strong>
            <span>Your image has been rotated/flipped.</span>
            <small>{formatSize(result.size)} • {result.dimensions} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Transformed Image
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Failed to Transform</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {imgElement && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleApplyTransform}
          >
            <RotateCw size={14} /> Apply &amp; Download
          </button>
        </div>
      )}
    </div>
  );
}
