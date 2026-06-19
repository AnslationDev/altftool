"use client";

import React, { useState, useEffect, useRef } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import { PDFDocument, rgb } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, ChevronLeft, ChevronRight, Eraser, ShieldAlert } from "lucide-react";

export default function RedactPdf() {
  const [file, setFile] = useState(null);
  const [pdfJsDoc, setPdfJsDoc] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rects, setRects] = useState({}); // { [pageNumber]: [{ cx, cy, cw, ch }] }
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const pageImageDataRef = useRef(null);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);
      setRects({});
      setCurrentPage(1);

      try {
        const bytes = new Uint8Array(await selected.arrayBuffer());
        setPdfBytes(bytes);
        // Pass a copy to prevent the PDF.js worker from detaching the original array buffer
      const pdfjsLib = await getPdfjs();
        const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
        setPdfJsDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error(err);
        setResult({ error: "Could not load PDF document." });
      }
    }
  };

  async function renderPage(pageNum) {
    if (!pdfJsDoc || !canvasRef.current) return;

    try {
      const page = await pdfJsDoc.getPage(pageNum);
      const vp = page.getViewport({ scale: 1 });
      const maxW = 540;
      const scale = Math.min(maxW / vp.width, 1.8);
      const fvp = page.getViewport({ scale });

      const canvas = canvasRef.current;
      canvas.width = fvp.width;
      canvas.height = fvp.height;
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport: fvp }).promise;

      // Store base page image data to easily redraw on mousemove
      pageImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      drawRectangles();
    } catch (err) {
      console.error("Failed to render page: ", err);
    }
  }

  const drawRectangles = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageImageDataRef.current) return;
    const ctx = canvas.getContext("2d");
    
    // Reset canvas to original clean PDF page capture
    ctx.putImageData(pageImageDataRef.current, 0, 0);

    const pageRects = rects[currentPage] || [];
    ctx.fillStyle = "#000000";
    pageRects.forEach((r) => {
      ctx.fillRect(r.cx, r.cy, r.cw, r.ch);
    });
  };

  // Load and render page when current page changes
  useEffect(() => {
    if (!pdfJsDoc || !canvasRef.current) return;
    renderPage(currentPage);
  }, [pdfJsDoc, currentPage]);

  const handleMouseDown = (e) => {
    if (!canvasRef.current || !pageImageDataRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawingRef.current = true;
    startPosRef.current = { x, y };
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current || !canvasRef.current || !pageImageDataRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    // Draw active rectangle overlays
    drawRectangles();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(
      startPosRef.current.x,
      startPosRef.current.y,
      curX - startPosRef.current.x,
      curY - startPosRef.current.y
    );
  };

  const handleMouseUp = (e) => {
    if (!drawingRef.current || !canvasRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const cx = Math.min(startPosRef.current.x, endX);
    const cy = Math.min(startPosRef.current.y, endY);
    const cw = Math.abs(endX - startPosRef.current.x);
    const ch = Math.abs(endY - startPosRef.current.y);

    if (cw < 4 || ch < 4) return; // ignore tiny double-clicks

    const updated = { ...rects };
    if (!updated[currentPage]) {
      updated[currentPage] = [];
    }
    updated[currentPage].push({ cx, cy, cw, ch });
    
    setRects(updated);

    // Trigger canvas redraw with the new permanent redaction box
    setTimeout(() => {
      if (canvasRef.current) {
        drawRectangles();
      }
    }, 0);
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
    setPdfJsDoc(null);
    setPdfBytes(null);
    setTotalPages(0);
    setCurrentPage(1);
    setRects({});
    setResult(null);
    pageImageDataRef.current = null;
  };

  const clearCurrentPage = () => {
    const updated = { ...rects };
    updated[currentPage] = [];
    setRects(updated);
    setTimeout(drawRectangles, 0);
  };

  const clearAllPages = () => {
    setRects({});
    setTimeout(() => {
      if (canvasRef.current) {
        drawRectangles();
      }
    }, 0);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleApplyRedactions = async () => {
    if (!file) return;
    const totalRects = Object.values(rects).reduce((acc, currentList) => acc + currentList.length, 0);
    if (totalRects === 0) {
      setResult({ error: "No redaction boxes drawn. Drag bounding selections on the page first." });
      return;
    }

    setProcessing(true);
    setProgress(10);
    setStatusText("Initializing redaction engine...");
    setResult(null);

    try {
      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      const srcDoc = await PDFDocument.load(pdfBytes);
      const destDoc = await PDFDocument.create();
      
      const total = pdfJsDoc.numPages;
      let count = 0;

      for (let i = 1; i <= total; i++) {
        const step = 10 + Math.round((i / total) * 75);
        setProgress(step);
        setStatusText(`Processing page ${i} of ${total}...`);

        const pageRects = rects[i];
        if (!pageRects || pageRects.length === 0) {
          // Copy page exactly to keep vector layout and text selectivity
          const [copiedPage] = await destDoc.copyPages(srcDoc, [i - 1]);
          destDoc.addPage(copiedPage);
        } else {
          // Page has redactions: render to canvas and bake black-out blocks into a single image
          const pdfPage = await pdfJsDoc.getPage(i);
          const scale = 2.5; // High resolution
          const vp = pdfPage.getViewport({ scale });
          
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          await pdfPage.render({ canvasContext: ctx, viewport: vp }).promise;

          // Screen coords map
          const vp0 = pdfPage.getViewport({ scale: 1 });
          const maxW = 540;
          const sc = Math.min(maxW / vp0.width, 1.8);
          const fvp = pdfPage.getViewport({ scale: sc });

          const canvasW = fvp.width;
          const canvasH = fvp.height;

          ctx.fillStyle = "#000000";
          pageRects.forEach((r) => {
            const scaleX = vp.width / canvasW;
            const scaleY = vp.height / canvasH;
            ctx.fillRect(r.cx * scaleX, r.cy * scaleY, r.cw * scaleX, r.ch * scaleY);
            count++;
          });

          // Compress to JPEG and embed
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const base64 = dataUrl.split(",")[1];
          const binStr = atob(base64);
          const imgBytes = new Uint8Array(binStr.length);
          for (let k = 0; k < binStr.length; k++) {
            imgBytes[k] = binStr.charCodeAt(k);
          }

          const embImg = await destDoc.embedJpg(imgBytes);
          const origSize = srcDoc.getPages()[i - 1].getSize();
          const newPage = destDoc.addPage([origSize.width, origSize.height]);
          newPage.drawImage(embImg, {
            x: 0,
            y: 0,
            width: origSize.width,
            height: origSize.height
          });
        }
      }

      setProgress(90);
      setStatusText("Saving redacted PDF...");
      const outputBytes = await destDoc.save();

      setProgress(100);
      setProcessing(false);

      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const name = file.name.replace(".pdf", "") + "_redacted.pdf";

      setResult({
        name: name,
        size: outputBytes.byteLength,
        url: downloadUrl,
        count
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
      setResult({ error: err.message || "Failed to redact PDF." });
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
          onClick={() => document.getElementById("redact-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Draw boxes to black out and hide sensitive information</p>
          
        </div>

<input 
            type="file" 
            id="redact-input-file" 
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

      {pdfJsDoc && (
        <div className="redact-workspace-wrapper" style={{ marginTop: "20px" }}>
          <div className="redact-toolbar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "var(--g50)", padding: "12px", border: "1px solid var(--g200)", borderRadius: "8px 8px 0 0", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button 
                className="btn btn-sec"
                style={{ padding: "6px 10px" }}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--g600)", minWidth: "90px", textAlign: "center" }}>
                Page {currentPage} / {totalPages}
              </span>
              <button 
                className="btn btn-sec"
                style={{ padding: "6px 10px" }}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-sec" onClick={clearCurrentPage} style={{ padding: "6px 12px", fontSize: "12.5px" }}>
                <Eraser size={13} /> Clear Page
              </button>
              <button className="btn btn-sec" onClick={clearAllPages} style={{ padding: "6px 12px", fontSize: "12.5px" }}>
                Clear All
              </button>
            </div>
          </div>

          <div 
            className="redact-editor-container" 
            style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              padding: "24px", 
              background: "var(--g100)", 
              border: "1px solid var(--g200)", 
              borderTop: "none", 
              borderRadius: "0 0 8px 8px", 
              overflow: "auto", 
              maxHeight: "600px" 
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
            <strong>Redaction Applied Permanently!</strong>
            <span>Obscured {result.count} selected regions.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Redacted PDF
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

      {pdfJsDoc && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button 
            className="btn btn-pri" 
            disabled={processing}
            onClick={handleApplyRedactions}
          >
            <ShieldAlert size={14} /> Burn Redactions
          </button>
        </div>
      )}
    </div>
  );
}
