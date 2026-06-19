"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, ImageIcon, Check, AlertCircle, Type, Download } from "lucide-react";

export default function MemeGenerator() {
  const [file, setFile] = useState(null);
  const [imgElement, setImgElement] = useState(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // Meme configurations
  const [topText, setTopText] = useState("WHEN THE CODE");
  const [bottomText, setBottomText] = useState("WORKS ON THE FIRST TRY");
  const [fontSize, setFontSize] = useState(40); // base percentage or px scale
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Impact");
  const [uppercase, setUppercase] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    drawPreview();
  }, [imgElement, topText, bottomText, fontSize, textColor, outlineColor, fontFamily, uppercase]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);

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

    const cW = Math.round(naturalW * displayScale);
    const cH = Math.round(naturalH * displayScale);

    canvas.width = cW;
    canvas.height = cH;

    const ctx = canvas.getContext("2d");
    // Draw base image
    ctx.drawImage(imgElement, 0, 0, cW, cH);

    // Calculate canvas-relative font size
    const previewFontSize = Math.max(12, Math.round(fontSize * displayScale));

    ctx.font = `900 ${previewFontSize}px ${fontFamily}, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = Math.max(2, Math.round(previewFontSize / 8));
    ctx.lineJoin = "round";

    const topT = uppercase ? topText.toUpperCase() : topText;
    const bottomT = uppercase ? bottomText.toUpperCase() : bottomText;

    // Draw Top Text
    if (topText) {
      ctx.textBaseline = "top";
      ctx.strokeText(topT, cW / 2, 10);
      ctx.fillText(topT, cW / 2, 10);
    }

    // Draw Bottom Text
    if (bottomText) {
      ctx.textBaseline = "bottom";
      ctx.strokeText(bottomT, cW / 2, cH - 10);
      ctx.fillText(bottomT, cW / 2, cH - 10);
    }
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
    setResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleGenerateMeme = () => {
    if (!file || !imgElement) return;
    setProcessing(true);
    setResult(null);

    try {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = naturalW;
      outCanvas.height = naturalH;

      const ctx = outCanvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0, naturalW, naturalH);

      // Draw high-res texts
      ctx.font = `900 ${fontSize}px ${fontFamily}, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = textColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = Math.max(2, Math.round(fontSize / 8));
      ctx.lineJoin = "round";

      const topT = uppercase ? topText.toUpperCase() : topText;
      const bottomT = uppercase ? bottomText.toUpperCase() : bottomText;

      // Draw Top Text
      if (topText) {
        ctx.textBaseline = "top";
        ctx.strokeText(topT, naturalW / 2, 20);
        ctx.fillText(topT, naturalW / 2, 20);
      }

      // Draw Bottom Text
      if (bottomText) {
        ctx.textBaseline = "bottom";
        ctx.strokeText(bottomT, naturalW / 2, naturalH - 20);
        ctx.fillText(bottomT, naturalW / 2, naturalH - 20);
      }

      outCanvas.toBlob((blob) => {
        const base = file.name.replace(/\.[^.]+$/, "");
        const outName = `${base}_meme.png`;
        const downloadUrl = URL.createObjectURL(blob);

        setResult({
          name: outName,
          size: blob.size,
          url: downloadUrl
        });

        // Auto download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = outName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setProcessing(false);
      }, "image/png");

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setResult({ error: err.message || "Failed to generate meme." });
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
          onClick={() => document.getElementById("meme-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a template image here, or click to browse</p>
          <p className="dz-hint">Add captions, select custom colors/fonts, and download in-browser</p>
          
        </div>

<input 
            type="file" 
            id="meme-input-file" 
            accept="image/*" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>Selected Template</h4>
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

      {imgElement && (
        <div className="crop-editor-wrapper" style={{ marginTop: "20px" }}>
          <div className="crop-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--g50)", padding: "12px", border: "1px solid var(--g200)", borderRadius: "8px 8px 0 0" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--g500)" }}>
              Live Meme Preview ({naturalW} × {naturalH} px)
            </span>
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
            <h4 className="lbl" style={{ marginBottom: "16px" }}>Caption &amp; Styling Settings</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="cg" style={{ display: "flex", flexDirection: "column" }}>
                <label className="lbl">Top Text:</label>
                <input 
                  type="text" 
                  value={topText} 
                  onChange={(e) => setTopText(e.target.value)}
                  style={{ marginTop: "6px" }}
                  placeholder="Enter top caption..."
                />
              </div>

              <div className="cg" style={{ display: "flex", flexDirection: "column" }}>
                <label className="lbl">Bottom Text:</label>
                <input 
                  type="text" 
                  value={bottomText} 
                  onChange={(e) => setBottomText(e.target.value)}
                  style={{ marginTop: "6px" }}
                  placeholder="Enter bottom caption..."
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }}>
              <div className="cg">
                <label className="lbl">Font Size (px):</label>
                <input 
                  type="number" 
                  min="16" 
                  max="120" 
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.min(120, Math.max(16, parseInt(e.target.value) || 40)))}
                  style={{ marginTop: "6px" }}
                />
              </div>

              <div className="cg">
                <label className="lbl">Text Color:</label>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ marginTop: "6px", width: "100%", height: "40px", cursor: "pointer", padding: "2px", border: "1px solid var(--g300)" }}
                />
              </div>

              <div className="cg">
                <label className="lbl">Outline Color:</label>
                <input 
                  type="color" 
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  style={{ marginTop: "6px", width: "100%", height: "40px", cursor: "pointer", padding: "2px", border: "1px solid var(--g300)" }}
                />
              </div>

              <div className="cg">
                <label className="lbl">Font Family:</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{ marginTop: "6px" }}
                >
                  <option value="Impact">Impact (Classic)</option>
                  <option value="Arial">Arial</option>
                  <option value="Comic Sans MS">Comic Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Trebuchet MS">Trebuchet</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input 
                type="checkbox" 
                id="uppercase-chk"
                checked={uppercase} 
                onChange={(e) => setUppercase(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="uppercase-chk" className="lbl" style={{ cursor: "pointer" }}>Force UPPERCASE Letters</label>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Generating meme image...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "80%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Meme Generated Successfully!</strong>
            <span>Your meme is ready for download.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Meme Image
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Generation Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {imgElement && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleGenerateMeme}
          >
            <Download size={14} /> Generate &amp; Download Meme
          </button>
        </div>
      )}
    </div>
  );
}
