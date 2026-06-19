"use client";

import React, { useState, useEffect, useRef } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { Upload, X, FileText, Check, AlertCircle, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from "lucide-react";

export default function PdfPreview() {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thumbs, setThumbs] = useState([]); // Array of dataURLs for thumbnail rendering

  const canvasRef = useRef(null);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setLoading(true);
      setError("");
      setThumbs([]);
      setCurrentPage(1);

      try {
        const bytes = new Uint8Array(await selected.arrayBuffer());
      const pdfjsLib = await getPdfjs();
        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        
        // Build thumbnail list in background
        buildThumbnails(doc);
      } catch (err) {
        console.error(err);
        setError("Failed to open document. Verify it is a valid PDF.");
        setLoading(false);
      }
    }
  };

  const buildThumbnails = async (doc) => {
    const total = doc.numPages;
    const thumbData = [];
    
    try {
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 0.15 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        thumbData.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL()
        });
      }
      setThumbs(thumbData);
    } catch (err) {
      console.error("Failed to build thumbs: ", err);
    } finally {
      setLoading(false);
    }
  };

  async function renderPage(pageNum) {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const vp = page.getViewport({ scale: scale });
      const canvas = canvasRef.current;
      canvas.width = vp.width;
      canvas.height = vp.height;

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
    } catch (err) {
      console.error("Error rendering PDF page preview:", err);
    }
  }

  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(currentPage);
  }, [pdfDoc, currentPage, scale]);

  const zoomIn = () => setScale((s) => Math.min(4.0, parseFloat((s + 0.25).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(0.25, parseFloat((s - 0.25).toFixed(2))));
  const resetZoom = () => setScale(1.0);

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
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPage(1);
    setScale(1.0);
    setThumbs([]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
<div 
          className="dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("preview-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">View page slides, read layout, and zoom into text content</p>
          
        </div>

<input 
            type="file" 
            id="preview-input-file" 
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
              <button className="file-remove" onClick={removeFile}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Rendering page preview layers...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "40%" }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Preview Failed</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {pdfDoc && (
        <div className="preview-workspace-wrapper" style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", background: "var(--g50)", padding: "16px", border: "1px solid var(--g200)", borderRadius: "8px" }}>
          
          {/* THUMBNAIL STRIP */}
          <div 
            className="thumbnail-strip"
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px", 
              maxHeight: "600px", 
              overflowY: "auto", 
              paddingRight: "6px",
              borderRight: "1px solid var(--g200)"
            }}
          >
            <h5 className="lbl" style={{ textAlign: "center", marginBottom: "4px" }}>Pages</h5>
            {thumbs.map((thumb) => (
              <div 
                key={thumb.pageNumber} 
                onClick={() => setCurrentPage(thumb.pageNumber)}
                style={{ 
                  position: "relative",
                  cursor: "pointer", 
                  border: currentPage === thumb.pageNumber ? "2px solid var(--pri)" : "1px solid var(--g300)", 
                  padding: "2px", 
                  borderRadius: "4px", 
                  background: "#ffffff",
                  boxShadow: currentPage === thumb.pageNumber ? "0 0 6px rgba(37,99,235,0.25)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <img 
                  src={thumb.dataUrl} 
                  alt={`Thumb ${thumb.pageNumber}`} 
                  style={{ width: "100%", display: "block" }}
                />
                <span 
                  style={{ 
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#ffffff",
                    fontSize: "8px",
                    fontWeight: "700",
                    padding: "1px 4px",
                    borderRadius: "2px"
                  }}
                >
                  {thumb.pageNumber}
                </span>
              </div>
            ))}
          </div>

          {/* MAIN PAGE PREVIEW AREA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* TOOLBAR */}
            <div className="preview-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--g100)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--g200)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button 
                  className="btn btn-sec"
                  style={{ padding: "6px 8px" }}
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--g600)", minWidth: "90px", textAlign: "center" }}>
                  Page {currentPage} / {totalPages}
                </span>
                <button 
                  className="btn btn-sec"
                  style={{ padding: "6px 8px" }}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button className="btn btn-sec" onClick={zoomOut} style={{ padding: "6px 8px" }} title="Zoom Out">
                  <ZoomOut size={15} />
                </button>
                <span style={{ fontSize: "11px", fontWeight: "600", minWidth: "40px", textAlign: "center" }}>
                  {Math.round(scale * 100)}%
                </span>
                <button className="btn btn-sec" onClick={zoomIn} style={{ padding: "6px 8px" }} title="Zoom In">
                  <ZoomIn size={15} />
                </button>
                <button className="btn btn-sec" onClick={resetZoom} style={{ padding: "6px 8px" }} title="Fit Page Width">
                  <Maximize size={14} />
                </button>
              </div>
            </div>

            {/* PREVIEW CANVAS */}
            <div 
              className="preview-canvas-viewport" 
              style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "flex-start", 
                padding: "20px", 
                background: "var(--g200)", 
                borderRadius: "6px", 
                minHeight: "400px", 
                maxHeight: "550px", 
                overflow: "auto" 
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ 
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)", 
                  background: "#ffffff",
                  maxWidth: "100%"
                }}
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
