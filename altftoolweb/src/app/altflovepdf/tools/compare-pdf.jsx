"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload, X, FileText, AlertCircle, Columns, Layers } from "lucide-react";

export default function ComparePdf() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [docA, setDocA] = useState(null);
  const [docB, setDocB] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState("side-by-side");
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  const inputARef = useRef(null);
  const inputBRef = useRef(null);
  const isPickingARef = useRef(false);
  const isPickingBRef = useRef(false);
  const renderTokenRef = useRef(0);

  const canvasRefA = useRef(null);
  const canvasRefB = useRef(null);
  const canvasRefDiff = useRef(null);

  useEffect(() => {
    return () => {
      docA?.destroy?.();
      docB?.destroy?.();
    };
  }, [docA, docB]);

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const isValidPdf = (file) =>
    file &&
    (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

  const resetDocs = async () => {
    renderTokenRef.current += 1;
    try {
      await docA?.destroy?.();
      await docB?.destroy?.();
    } catch { }
    setDocA(null);
    setDocB(null);
    setPageCount(0);
    setCurrentPage(1);
    setRendering(false);
  };

  const openFilePicker = (target) => {
    if (loading || rendering) return;

    if (target === "a") {
      if (isPickingARef.current) return;
      isPickingARef.current = true;
      inputARef.current?.click();
      setTimeout(() => (isPickingARef.current = false), 700);
    }

    if (target === "b") {
      if (isPickingBRef.current) return;
      isPickingBRef.current = true;
      inputBRef.current?.click();
      setTimeout(() => (isPickingBRef.current = false), 700);
    }
  };

  const setSelectedFile = async (target, selectedFile) => {
    if (!selectedFile) return;

    if (!isValidPdf(selectedFile)) {
      setError("Please upload a valid PDF file.");
      return;
    }

    setError("");
    await resetDocs();

    if (target === "a") setFileA(selectedFile);
    else setFileB(selectedFile);
  };

  const handleFileChange = async (target, e) => {
    e.stopPropagation();
    const selectedFile = e.target.files?.[0];

    if (selectedFile) await setSelectedFile(target, selectedFile);

    if (target === "a") {
      isPickingARef.current = false;
      if (inputARef.current) inputARef.current.value = "";
    } else {
      isPickingBRef.current = false;
      if (inputBRef.current) inputBRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (target, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || rendering) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) await setSelectedFile(target, droppedFile);
  };

  const loadPdfFile = async (pdfFile) => {
    const pdfjs = await import(/* webpackIgnore: true */ "/altflovepdf/pdf.min.mjs");

    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
    }

    const arrayBuffer = await pdfFile.arrayBuffer();

    return await pdfjs.getDocument({
      data: arrayBuffer.slice(0),
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: false,
    }).promise;
  };

  const handleFilesSubmit = async () => {
    if (!fileA || !fileB) {
      setError("Please upload both PDF documents first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await resetDocs();

      const [loadedA, loadedB] = await Promise.all([
        loadPdfFile(fileA),
        loadPdfFile(fileB),
      ]);

      const minPages = Math.min(loadedA.numPages || 0, loadedB.numPages || 0);

      if (!minPages) {
        await loadedA?.destroy?.();
        await loadedB?.destroy?.();
        throw new Error("One of the uploaded PDFs contains no pages.");
      }

      setDocA(loadedA);
      setDocB(loadedB);
      setPageCount(minPages);
      setCurrentPage(1);
    } catch (err) {
      setError(err?.message || "Failed to load PDF documents.");
    } finally {
      setLoading(false);
    }
  };

  const clearCanvas = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderPageToCanvas = async (doc, pageNumber, canvas, scale = 1.2) => {
    if (!doc || !canvas) return null;

    const pdfPage = await doc.getPage(pageNumber);
    const viewport = pdfPage.getViewport({ scale });
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) throw new Error("Canvas rendering is not supported.");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    pdfPage.cleanup?.();

    return { width: canvas.width, height: canvas.height };
  };

  const normalizeCanvasToSize = (sourceCanvas, width, height) => {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d", { alpha: false });

    tempCanvas.width = width;
    tempCanvas.height = height;

    if (!tempCtx || !sourceCanvas) return tempCanvas;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, width, height);
    tempCtx.drawImage(sourceCanvas, 0, 0);

    return tempCanvas;
  };

  const renderCleanDiff = (canvasA, canvasB, canvasDiff, sizeA, sizeB) => {
    const width = Math.max(sizeA.width, sizeB.width);
    const height = Math.max(sizeA.height, sizeB.height);

    const normalizedA = normalizeCanvasToSize(canvasA, width, height);
    const normalizedB = normalizeCanvasToSize(canvasB, width, height);

    canvasDiff.width = width;
    canvasDiff.height = height;

    const ctxA = normalizedA.getContext("2d");
    const ctxB = normalizedB.getContext("2d");
    const ctxDiff = canvasDiff.getContext("2d");

    const imgA = ctxA.getImageData(0, 0, width, height);
    const imgB = ctxB.getImageData(0, 0, width, height);
    const out = ctxDiff.createImageData(width, height);

    for (let i = 0; i < imgA.data.length; i += 4) {
      const ar = imgA.data[i];
      const ag = imgA.data[i + 1];
      const ab = imgA.data[i + 2];

      const br = imgB.data[i];
      const bg = imgB.data[i + 1];
      const bb = imgB.data[i + 2];

      const diff = Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb);

      if (diff > 70) {
        // Detect if pixel is background (near white) in A and B to classify added/removed
        const isWhiteA = ar > 230 && ag > 230 && ab > 230;
        const isWhiteB = br > 230 && bg > 230 && bb > 230;

        if (!isWhiteA && isWhiteB) {
          // Present in A, missing/white in B (Removed) -> Red (#ef4444)
          out.data[i] = 239;
          out.data[i + 1] = 68;
          out.data[i + 2] = 68;
          out.data[i + 3] = 255;
        } else if (isWhiteA && !isWhiteB) {
          // Missing/white in A, present in B (Added) -> Green (#22c55e)
          out.data[i] = 34;
          out.data[i + 1] = 197;
          out.data[i + 2] = 94;
          out.data[i + 3] = 255;
        } else {
          // Both are non-white but differ (Different text or color changed) -> Yellow/Orange (#f59e0b)
          out.data[i] = 245;
          out.data[i + 1] = 158;
          out.data[i + 2] = 11;
          out.data[i + 3] = 255;
        }
      } else {
        // Unchanged pixel - draw original color
        out.data[i] = ar;
        out.data[i + 1] = ag;
        out.data[i + 2] = ab;
        out.data[i + 3] = 255;
      }
    }

    ctxDiff.putImageData(out, 0, 0);
  };

  async function renderComparison() {
    if (!docA || !docB || !pageCount) return;

    const token = ++renderTokenRef.current;

    try {
      setRendering(true);
      setError("");

      const canvasA = canvasRefA.current;
      const canvasB = canvasRefB.current;
      const canvasDiff = canvasRefDiff.current;

      clearCanvas(canvasA);
      clearCanvas(canvasB);
      clearCanvas(canvasDiff);

      const sizeA = await renderPageToCanvas(docA, currentPage, canvasA);
      if (token !== renderTokenRef.current) return;

      const sizeB = await renderPageToCanvas(docB, currentPage, canvasB);
      if (token !== renderTokenRef.current) return;

      if (
        compareMode === "overlay-diff" &&
        canvasA &&
        canvasB &&
        canvasDiff &&
        sizeA &&
        sizeB
      ) {
        renderCleanDiff(canvasA, canvasB, canvasDiff, sizeA, sizeB);
      }
    } catch (err) {
      setError(err?.message || "Failed to render PDF comparison.");
    } finally {
      if (token === renderTokenRef.current) setRendering(false);
    }
  }

  useEffect(() => {
    if (!docA || !docB || pageCount <= 0) return;

    const renderTimer = window.setTimeout(() => {
      renderComparison();
    }, 0);

    return () => window.clearTimeout(renderTimer);
  }, [docA, docB, currentPage, compareMode, pageCount]);

  const removeFileA = async () => {
    setFileA(null);
    setError("");
    await resetDocs();
    if (inputARef.current) inputARef.current.value = "";
  };

  const removeFileB = async () => {
    setFileB(null);
    setError("");
    await resetDocs();
    if (inputBRef.current) inputBRef.current.value = "";
  };

  const clearComparison = async () => {
    setError("");
    await resetDocs();
  };

  return (
    <div className="tool-workspace-inner">
      {(!docA || !docB) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <div>
            <label className="lbl" style={{ marginBottom: "8px", display: "block" }}>
              Original PDF Document A
            </label>

            {!fileA ? (
              <>
                <div
                  className="dropzone"
                  role="button"
                  tabIndex={0}
                  onClick={() => openFilePicker("a")}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop("a", e)}
                  style={{ padding: "30px 20px" }}
                >
                  <Upload size={24} style={{ marginBottom: "8px" }} />
                  <p className="dz-main" style={{ fontSize: "13px" }}>Upload Document A</p>
                  <p className="dz-hint">Click once or drag PDF here</p>
                </div>

                <input
                  ref={inputARef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleFileChange("a", e)}
                />
              </>
            ) : (
              <div className="file-item" style={{ background: "var(--g50)", padding: "10px", borderRadius: "6px", display: "flex", gap: "10px", alignItems: "center", border: "1px solid var(--g200)" }}>
                <FileText size={16} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div title={fileA.name} style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fileA.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--g500)" }}>{formatSize(fileA.size)}</div>
                </div>
                <button type="button" onClick={removeFileA} className="file-remove">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="lbl" style={{ marginBottom: "8px", display: "block" }}>
              Modified PDF Document B
            </label>

            {!fileB ? (
              <>
                <div
                  className="dropzone"
                  role="button"
                  tabIndex={0}
                  onClick={() => openFilePicker("b")}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop("b", e)}
                  style={{ padding: "30px 20px" }}
                >
                  <Upload size={24} style={{ marginBottom: "8px" }} />
                  <p className="dz-main" style={{ fontSize: "13px" }}>Upload Document B</p>
                  <p className="dz-hint">Click once or drag PDF here</p>
                </div>

                <input
                  ref={inputBRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleFileChange("b", e)}
                />
              </>
            ) : (
              <div className="file-item" style={{ background: "var(--g50)", padding: "10px", borderRadius: "6px", display: "flex", gap: "10px", alignItems: "center", border: "1px solid var(--g200)" }}>
                <FileText size={16} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div title={fileB.name} style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fileB.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--g500)" }}>{formatSize(fileB.size)}</div>
                </div>
                <button type="button" onClick={removeFileB} className="file-remove">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fileA && fileB && (!docA || !docB) && !loading && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <button type="button" className="btn btn-pri" onClick={handleFilesSubmit}>
            Compare Documents
          </button>
        </div>
      )}

      {(loading || rendering) && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">
            {loading ? "Loading PDF documents..." : "Rendering comparison..."}
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: loading ? "50%" : "75%" }} />
          </div>
        </div>
      )}

      {error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}>
            <AlertCircle size={20} />
          </span>
          <div className="result-text">
            <strong>Failed to compare</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {docA && docB && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", background: "var(--g50)", padding: "12px", border: "1px solid var(--g200)", borderRadius: "8px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-sec" onClick={() => setCompareMode("side-by-side")}>
                <Columns size={14} /> Side-by-Side
              </button>
              <button type="button" className="btn btn-sec" onClick={() => setCompareMode("overlay-diff")}>
                <Layers size={14} /> Highlight Changes
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-sec" disabled={currentPage <= 1 || rendering} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                Prev Page
              </button>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Page {currentPage} of {pageCount}
              </span>
              <button type="button" className="btn btn-sec" disabled={currentPage >= pageCount || rendering} onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}>
                Next Page
              </button>
            </div>

            <button type="button" className="btn btn-sec" onClick={clearComparison} style={{ color: "var(--err)" }}>
              Clear
            </button>
          </div>

          {compareMode === "side-by-side" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--g200)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--g500)" }}>DOCUMENT A ORIGINAL</span>
                <div style={{ marginTop: "8px", maxWidth: "100%", overflow: "auto", border: "1px solid var(--g100)" }}>
                  <canvas ref={canvasRefA} style={{ maxWidth: "100%" }} />
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--g200)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--g500)" }}>DOCUMENT B MODIFIED</span>
                <div style={{ marginTop: "8px", maxWidth: "100%", overflow: "auto", border: "1px solid var(--g100)" }}>
                  <canvas ref={canvasRefB} style={{ maxWidth: "100%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid var(--g200)", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "16px", fontSize: "12px", fontWeight: 600, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--g600)" }}>
                  <span style={{ width: "12px", height: "12px", background: "var(--g300)", borderRadius: "2px" }} /> Unchanged
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#b91c1c" }}>
                  <span style={{ width: "12px", height: "12px", background: "#ef4444", borderRadius: "2px" }} /> Removed (Doc A)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                  <span style={{ width: "12px", height: "12px", background: "#22c55e", borderRadius: "2px" }} /> Added (Doc B)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#b45309" }}>
                  <span style={{ width: "12px", height: "12px", background: "#f59e0b", borderRadius: "2px" }} /> Modified
                </span>
              </div>

              <canvas ref={canvasRefA} style={{ display: "none" }} />
              <canvas ref={canvasRefB} style={{ display: "none" }} />

              <div style={{ marginTop: "12px", maxWidth: "100%", overflow: "auto", border: "1px solid var(--g200)", background: "#fff", borderRadius: "4px" }}>
                <canvas ref={canvasRefDiff} style={{ maxWidth: "100%" }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
