"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  X,
  FileText,
  Check,
  AlertCircle,
  Edit,
  Image as ImageIcon,
  Type,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function SignPdf() {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);

  const [sigType, setSigType] = useState("draw");
  const [typedText, setTypedText] = useState("John Doe");
  const [typedFont, setTypedFont] = useState("cursive");
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(""); // use dataURL not blob URL
  const [sigWidth, setSigWidth] = useState(150);
  const [coords, setCoords] = useState(null);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const isPickingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const renderTokenRef = useRef(0);
  const pdfDocRef = useRef(null); // keep ref in sync for cleanup

  const pdfCanvasRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const sigCtxRef = useRef(null); // persist canvas context

  // ─── Signature canvas init ────────────────────────────────────────────────

  const initSigCanvas = useCallback(() => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    sigCtxRef.current = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Init canvas when draw tab becomes active
  useEffect(() => {
    if (sigType === "draw") {
      // small delay so DOM is painted
      const id = setTimeout(initSigCanvas, 80);
      return () => clearTimeout(id);
    }
  }, [sigType, initSigCanvas]);

  // ─── PDF rendering ────────────────────────────────────────────────────────

  const drawSignatureOverlay = useCallback(
    (ctx, canvasW, canvasH) => {
      if (!coords) return;
      const h = sigWidth * 0.5;
      const x = coords.x - sigWidth / 2;
      const y = coords.y - h / 2;

      ctx.save();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x, y, sigWidth, h);
      ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
      ctx.fillRect(x, y, sigWidth, h);
      ctx.restore();
    },
    [coords, sigWidth]
  );

  const renderPdfPage = useCallback(async () => {
    if (!pdfDocRef.current || !pdfCanvasRef.current) return;

    const token = ++renderTokenRef.current;

    try {
      const page = await pdfDocRef.current.getPage(selectedPage);
      if (token !== renderTokenRef.current) {
        page.cleanup?.();
        return;
      }

      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      if (token !== renderTokenRef.current) {
        page.cleanup?.();
        return;
      }

      if (coords) drawSignatureOverlay(ctx);
      page.cleanup?.();
    } catch (err) {
      if (token === renderTokenRef.current) {
        console.error("PDF render error:", err);
        setResult({ error: err?.message || "Failed to render PDF page." });
      }
    }
  }, [selectedPage, coords, sigWidth, drawSignatureOverlay]); // sigWidth included so overlay updates

  useEffect(() => {
    if (pdfDoc && pdfCanvasRef.current) {
      renderPdfPage();
    }
  }, [pdfDoc, renderPdfPage]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy?.();
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, []); // intentionally empty — run only on unmount

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const resetResult = () => setResult(null);

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const isValidPdf = (f) =>
    f &&
    (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

  const openFilePicker = () => {
    if (processing || loadingPdf || isPickingRef.current) return;
    isPickingRef.current = true;
    fileInputRef.current?.click();
    setTimeout(() => (isPickingRef.current = false), 700);
  };

  const clearPdf = () => {
    renderTokenRef.current += 1;
    pdfDocRef.current?.destroy?.();
    pdfDocRef.current = null;

    setFile(null);
    setPdfDoc(null);
    setPageCount(0);
    setSelectedPage(1);
    setCoords(null);
    setLoadingPdf(false);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── PDF load ─────────────────────────────────────────────────────────────

  const loadPdf = async (selectedFile) => {
    if (isLoadingRef.current) return;
    if (!isValidPdf(selectedFile)) {
      setResult({ error: "Please upload a valid PDF file." });
      return;
    }

    isLoadingRef.current = true;
    renderTokenRef.current += 1;

    try {
      setLoadingPdf(true);
      setResult(null);
      setCoords(null);
      setSelectedPage(1);

      // destroy previous
      pdfDocRef.current?.destroy?.();
      pdfDocRef.current = null;

      const pdfjs = await import(/* webpackIgnore: true */ "/altflovepdf/pdf.min.mjs");
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: false,
      });

      const doc = await loadingTask.promise;

      if (!doc.numPages) {
        await doc.destroy?.();
        throw new Error("This PDF has no pages.");
      }

      pdfDocRef.current = doc;
      setFile(selectedFile);
      setPdfDoc(doc); // triggers render effect
      setPageCount(doc.numPages);
    } catch (err) {
      console.error("PDF load error:", err);
      pdfDocRef.current = null;
      setFile(null);
      setPdfDoc(null);
      setPageCount(0);
      setResult({
        error:
          err?.message ||
          "Failed to load PDF. Ensure it is not encrypted or corrupted.",
      });
    } finally {
      setLoadingPdf(false);
      isLoadingRef.current = false;
      isPickingRef.current = false;
    }
  };

  const handleFileChange = async (e) => {
    e.stopPropagation();
    const f = e.target.files?.[0];
    if (f) await loadPdf(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
    isPickingRef.current = false;
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processing || loadingPdf || isLoadingRef.current) return;
    const f = e.dataTransfer.files?.[0];
    if (f) await loadPdf(f);
  };

  // ─── Canvas click (place signature) ──────────────────────────────────────

  const handleCanvasClick = (e) => {
    if (!pdfCanvasRef.current || processing) return;
    const canvas = pdfCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setCoords({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
    resetResult();
  };

  // ─── Draw events ──────────────────────────────────────────────────────────

  const getPointerPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const pt = e.touches?.[0] || e;
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    // Always fetch fresh context
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    sigCtxRef.current = ctx;
    const { x, y } = getPointerPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current || !sigCtxRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getPointerPos(e, canvas);
    sigCtxRef.current.lineTo(x, y);
    sigCtxRef.current.stroke();
  };

  const stopDrawing = () => { isDrawingRef.current = false; };

  // ─── Image upload — convert to dataURL immediately ────────────────────────

  const handleImageUpload = (e) => {
    e.stopPropagation();
    const img = e.target.files?.[0];
    if (!img) return;

    if (!img.type.startsWith("image/")) {
      setResult({ error: "Please upload a valid image file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target.result); // base64 dataURL — safe for fetch()
      setImageFile(img);
      resetResult();
    };
    reader.onerror = () => setResult({ error: "Failed to read image file." });
    reader.readAsDataURL(img);

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ─── Build signature data URL ─────────────────────────────────────────────

  const getSignatureDataUrl = async () => {
    if (sigType === "draw") {
      const canvas = sigCanvasRef.current;
      if (!canvas) throw new Error("Drawing pad not ready.");

      // Check if anything was drawn (not just white)
      const ctx = canvas.getContext("2d");
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasDrawing = data.some((v, i) => i % 4 !== 3 && v < 200);
      if (!hasDrawing) throw new Error("Please draw your signature first.");

      return canvas.toDataURL("image/png");
    }

    if (sigType === "type") {
      if (!typedText.trim()) throw new Error("Please enter your signature text.");

      const tmp = document.createElement("canvas");
      tmp.width = 500;
      tmp.height = 180;
      const ctx = tmp.getContext("2d");

      // White bg so PNG embeds cleanly
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tmp.width, tmp.height);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (typedFont === "Georgia") {
        ctx.font = "italic 46px Georgia, serif";
      } else if (typedFont === "Courier") {
        ctx.font = "38px 'Courier New', monospace";
      } else {
        ctx.font = "52px cursive";
      }

      ctx.fillText(typedText.trim(), 250, 90);
      return tmp.toDataURL("image/png");
    }

    if (sigType === "image") {
      if (!imageDataUrl) throw new Error("Please upload a signature image.");
      return imageDataUrl; // already a dataURL — fetch() works fine
    }

    throw new Error("Unknown signature type.");
  };

  // ─── Apply & embed signature ──────────────────────────────────────────────

  const handleApplySignature = async () => {
    if (!file) { setResult({ error: "Upload a PDF first." }); return; }
    if (!coords) { setResult({ error: "Click on the PDF to place the signature." }); return; }

    try {
      setProcessing(true);
      setResult(null);

      const sigDataUrl = await getSignatureDataUrl();

      const arrayBuffer = await file.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const targetPage = pdfLibDoc.getPages()[selectedPage - 1];
      if (!targetPage) throw new Error("Page not found in PDF.");

      const { width: pageW, height: pageH } = targetPage.getSize();
      const canvas = pdfCanvasRef.current;
      if (!canvas) throw new Error("PDF canvas not ready.");

      // scaleX/scaleY: canvas pixel → PDF point
      const scaleX = pageW / canvas.width;
      const scaleY = pageH / canvas.height;

      const sigPdfW = sigWidth * scaleX;
      const sigPdfH = sigWidth * 0.5 * scaleY;

      // PDF origin is bottom-left; canvas origin is top-left
      // coords.y is center of signature box in canvas space
      const sigPdfX = (coords.x - sigWidth / 2) * scaleX;
      const sigPdfY = pageH - (coords.y + sigWidth * 0.25) * scaleY;

      // Fetch dataURL → ArrayBuffer (works reliably for data: URIs)
      const resp = await fetch(sigDataUrl);
      const imageBytes = await resp.arrayBuffer();

      let embeddedImage;
      try {
        embeddedImage = await pdfLibDoc.embedPng(imageBytes);
      } catch {
        embeddedImage = await pdfLibDoc.embedJpg(imageBytes);
      }

      targetPage.drawImage(embeddedImage, {
        x: sigPdfX,
        y: sigPdfY,
        width: sigPdfW,
        height: sigPdfH,
      });

      const outputBytes = await pdfLibDoc.save();
      const outputName = `${file.name.replace(/\.[^.]+$/, "")}_signed.pdf`;
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setResult({ name: outputName, size: blob.size, url: downloadUrl });

      // auto-download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outputName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Sign error:", err);
      setResult({ error: err?.message || "Failed to embed signature. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="tool-workspace-inner">
      {/* ── File drop zone ── */}
      {!file ? (
        <>
<div
          className="dropzone"
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
        >
          <div className="dz-ic"><Upload size={32} /></div>
          <p className="dz-main">Drag & drop a PDF here, or click to browse</p>
          <p className="dz-hint">Draw, type, or upload your signature — 100% local.</p>
          
        </div>

<input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onClick={(e) => e.stopPropagation()}
            onChange={handleFileChange}
            disabled={processing || loadingPdf}
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
              <button
                type="button"
                className="file-remove"
                onClick={clearPdf}
                disabled={processing || loadingPdf}
                aria-label="Remove PDF"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading bar ── */}
      {loadingPdf && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Loading PDF document…</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "55%" }} />
          </div>
        </div>
      )}

      {/* ── Main editor ── */}
      {file && pdfDoc && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 300px",
          gap: "20px",
          marginTop: "20px",
        }}>
          {/* Left — PDF preview */}
          <div style={{
            background: "var(--g100)",
            border: "1px solid var(--g200)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 0,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              width: "100%",
              marginBottom: "12px",
              fontSize: "13px",
              flexWrap: "wrap",
            }}>
              <span>Page {selectedPage} of {pageCount}</span>
              <span style={{ color: "var(--g500)" }}>
                {coords ? "✓ Signature placed — reposition by clicking again" : "Click on page to place signature"}
              </span>
            </div>

            <div style={{
              overflow: "auto",
              maxWidth: "100%",
              maxHeight: "520px",
              border: "1px dashed var(--g300)",
              background: "#fff",
              cursor: "crosshair",
            }}>
              <canvas ref={pdfCanvasRef} onClick={handleCanvasClick} />
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                type="button"
                className="btn btn-sec"
                disabled={selectedPage <= 1 || processing}
                onClick={() => {
                  setSelectedPage((p) => Math.max(1, p - 1));
                  setCoords(null);
                }}
              >
                ← Previous
              </button>
              <button
                type="button"
                className="btn btn-sec"
                disabled={selectedPage >= pageCount || processing}
                onClick={() => {
                  setSelectedPage((p) => Math.min(pageCount, p + 1));
                  setCoords(null);
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Right — Signature panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="options-card" style={{
              background: "var(--g50)",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid var(--g200)",
            }}>
              <h4 className="lbl" style={{ marginBottom: "12px" }}>Signature Method</h4>

              <div className="radio-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { key: "draw", icon: <Edit size={14} />, label: "Draw Signature" },
                  { key: "type", icon: <Type size={14} />, label: "Type Name" },
                  { key: "image", icon: <ImageIcon size={14} />, label: "Upload Image" },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`radio-btn ${sigType === key ? "active" : ""}`}
                    onClick={() => { setSigType(key); resetResult(); }}
                    disabled={processing}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>

              {/* Draw pad */}
              {sigType === "draw" && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="lbl">Draw inside box:</label>
                    <button
                      type="button"
                      onClick={initSigCanvas}
                      disabled={processing}
                      style={{ fontSize: "11px", color: "var(--err)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
                    >
                      <RefreshCw size={10} /> Reset
                    </button>
                  </div>
                  <canvas
                    ref={sigCanvasRef}
                    width={260}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--g300)",
                      borderRadius: "4px",
                      cursor: "crosshair",
                      touchAction: "none",
                      display: "block",
                    }}
                  />
                </div>
              )}

              {/* Type name */}
              {sigType === "type" && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label className="lbl">Signature text:</label>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => { setTypedText(e.target.value); resetResult(); }}
                      style={{ marginTop: "4px", width: "100%", boxSizing: "border-box" }}
                      disabled={processing}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="lbl">Font style:</label>
                    <select
                      value={typedFont}
                      onChange={(e) => { setTypedFont(e.target.value); resetResult(); }}
                      style={{ marginTop: "4px", width: "100%", boxSizing: "border-box" }}
                      disabled={processing}
                    >
                      <option value="cursive">Cursive Classic</option>
                      <option value="Georgia">Georgia Italic</option>
                      <option value="Courier">Courier Modern</option>
                    </select>
                  </div>
                  {/* Live preview */}
                  <div style={{ padding: "10px", border: "1px solid var(--g200)", background: "#fff", borderRadius: "4px", minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{
                      font: typedFont === "Georgia"
                        ? "italic 28px Georgia, serif"
                        : typedFont === "Courier"
                          ? "22px 'Courier New', monospace"
                          : "32px cursive",
                      color: "#000",
                    }}>
                      {typedText || "Preview"}
                    </span>
                  </div>
                </div>
              )}

              {/* Image upload */}
              {sigType === "image" && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label className="lbl">Upload signature image:</label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={processing}
                  />
                  {imageFile && <small style={{ color: "var(--g500)" }}>{imageFile.name}</small>}
                  {imageDataUrl && (
                    <div style={{ padding: "8px", border: "1px solid var(--g200)", background: "#fff", borderRadius: "4px" }}>
                      <img src={imageDataUrl} alt="Signature preview" style={{ maxHeight: "60px", maxWidth: "100%", display: "block" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Size slider */}
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="lbl">Signature width:</label>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>{sigWidth}px</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="280"
                  value={sigWidth}
                  onChange={(e) => { setSigWidth(Number(e.target.value)); resetResult(); }}
                  style={{ width: "100%", marginTop: "6px" }}
                  disabled={processing}
                />
              </div>
            </div>

            {/* Placement status */}
            {coords && (
              <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                <Sparkles size={18} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "12.5px", color: "#166534" }}>
                  Signature placed. Click &quot;Apply Signature&quot; to finalize, or reposition by clicking again.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Processing bar ── */}
      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Embedding signature into PDF…</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "85%" }} />
          </div>
        </div>
      )}

      {/* ── Success result ── */}
      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Document Signed!</strong>
            <span>Signature embedded successfully.</span>
            <small>{formatSize(result.size)} • {result.name}</small>
            <a
              href={result.url}
              download={result.name}
              className="btn btn-pri"
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Signed PDF
            </a>
          </div>
        </div>
      )}

      {/* ── Error result ── */}
      {result?.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Failed to sign PDF</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {/* ── Action button ── */}
      {file && pdfDoc && coords && !processing && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-pri" onClick={handleApplySignature}>
            Apply Signature &amp; Download
          </button>
        </div>
      )}
    </div>
  );
}
