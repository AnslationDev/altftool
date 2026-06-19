"use client";

import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  X,
  FileText,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function OrganizePdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const isLoadingRef = useRef(false);
  const pagesRef = useRef([]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);

      pagesRef.current.forEach((page) => {
        if (page?.thumb?.startsWith("blob:")) {
          URL.revokeObjectURL(page.thumb);
        }
      });
    };
  }, [result]);

  const resetResult = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  };

  const clearThumbs = () => {
    pagesRef.current.forEach((page) => {
      if (page?.thumb?.startsWith("blob:")) {
        URL.revokeObjectURL(page.thumb);
      }
    });
  };

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const isValidPdf = (selectedFile) => {
    return (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf"))
    );
  };

  const getOutputName = (name = "document.pdf") => {
    return `${name
      .replace(/\.pdf$/i, "")
      .replace(/[^\w-]+/g, "_")}_organized.pdf`;
  };

  const openFilePicker = () => {
    if (processing || isLoadingRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    e.stopPropagation();

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    await loadPdf(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (processing || isLoadingRef.current) return;

    const droppedFile = e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    await loadPdf(droppedFile);
  };

  const loadPdf = async (pdfFile) => {
    if (isLoadingRef.current) return;

    if (!isValidPdf(pdfFile)) {
      resetResult();
      setResult({ error: "Please select a valid PDF file." });
      return;
    }

    isLoadingRef.current = true;
    clearThumbs();
    resetResult();

    setFile(pdfFile);
    setPages([]);
    setProcessing(true);
    setProgress(10);
    setStatusText("Loading PDF document...");

    try {
      const pdfjsLib = await import(/* webpackIgnore: true */ "/altflovepdf/pdf.min.mjs");

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
      }

      const arrayBuffer = await pdfFile.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer.slice(0),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: false,
      });

      const pdfJsDoc = await loadingTask.promise;
      const numPages = pdfJsDoc.numPages;

      if (!numPages) {
        throw new Error("This PDF does not contain any pages.");
      }

      const loadedPages = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(10 + Math.round((i / numPages) * 75));
        setStatusText(`Rendering thumbnail ${i} of ${numPages}...`);

        const pdfPage = await pdfJsDoc.getPage(i);
        const viewport = pdfPage.getViewport({ scale: 0.35 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        if (!context) {
          throw new Error("Canvas rendering is not supported in this browser.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await pdfPage.render({
          canvasContext: context,
          viewport,
        }).promise;

        const thumb = canvas.toDataURL("image/jpeg", 0.8);

        loadedPages.push({
          id: `page-${i}-${crypto.randomUUID?.() || Date.now()}`,
          originalIndex: i - 1,
          originalPageNumber: i,
          thumb,
          width: viewport.width,
          height: viewport.height,
        });

        pdfPage.cleanup?.();
      }

      await pdfJsDoc.destroy?.();

      setPages(loadedPages);
      setProgress(100);
      setStatusText("PDF pages loaded successfully.");
    } catch (err) {
      console.error("PDF load error:", err);

      setFile(null);
      setPages([]);
      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to load PDF pages. Please try another PDF file.",
      });
    } finally {
      setProcessing(false);
      isLoadingRef.current = false;

      setTimeout(() => {
        setProgress(0);
        setStatusText("");
      }, 500);
    }
  };

  const removeFile = () => {
    clearThumbs();
    resetResult();

    setFile(null);
    setPages([]);
    setProgress(0);
    setStatusText("");

    dragItem.current = null;
    dragOverItem.current = null;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deletePage = (id) => {
    setPages((prev) => prev.filter((page) => page?.id !== id));
    resetResult();
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const fromIndex = dragItem.current;
    const toIndex = dragOverItem.current;

    dragItem.current = null;
    dragOverItem.current = null;

    if (
      fromIndex === null ||
      toIndex === null ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0
    ) {
      return;
    }

    setPages((prev) => {
      if (
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        !prev[fromIndex]
      ) {
        return prev;
      }

      const updatedPages = [...prev];
      const [draggedPage] = updatedPages.splice(fromIndex, 1);

      if (!draggedPage) return prev;

      updatedPages.splice(toIndex, 0, draggedPage);
      return updatedPages.filter(Boolean);
    });

    resetResult();
  };

  const moveLeft = (index) => {
    if (index <= 0) return;

    setPages((prev) => {
      if (!prev[index]) return prev;

      const updatedPages = [...prev];
      const [current] = updatedPages.splice(index, 1);

      if (!current) return prev;

      updatedPages.splice(index - 1, 0, current);
      return updatedPages.filter(Boolean);
    });

    resetResult();
  };

  const moveRight = (index) => {
    if (index >= pages.length - 1) return;

    setPages((prev) => {
      if (!prev[index]) return prev;

      const updatedPages = [...prev];
      const [current] = updatedPages.splice(index, 1);

      if (!current) return prev;

      updatedPages.splice(index + 1, 0, current);
      return updatedPages.filter(Boolean);
    });

    resetResult();
  };

  const autoDownload = (url, fileName) => {
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!file) {
      setResult({ error: "Please upload a PDF file first." });
      return;
    }

    const validPages = pages.filter(
      (page) => page && Number.isInteger(page.originalIndex)
    );

    if (!validPages.length) {
      setResult({ error: "Please keep at least one page before saving." });
      return;
    }

    try {
      setProcessing(true);
      setProgress(15);
      setStatusText("Reading original PDF...");
      resetResult();

      const arrayBuffer = await file.arrayBuffer();

      setProgress(35);
      setStatusText("Preparing new PDF order...");

      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const outputPdf = await PDFDocument.create();
      const pageIndices = validPages.map((page) => page.originalIndex);

      const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndices);

      copiedPages.forEach((pdfPage, index) => {
        outputPdf.addPage(pdfPage);
        setProgress(35 + Math.round(((index + 1) / copiedPages.length) * 45));
        setStatusText(`Adding page ${index + 1} of ${copiedPages.length}...`);
      });

      setProgress(88);
      setStatusText("Saving organized PDF...");

      const outputBytes = await outputPdf.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = getOutputName(file.name);

      setResult({
        name: outputName,
        size: blob.size,
        url: downloadUrl,
      });

      setProgress(100);
      setStatusText("PDF organized successfully.");

      autoDownload(downloadUrl, outputName);
    } catch (err) {
      console.error("Organize PDF error:", err);

      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to organize PDF pages. Please try another PDF file.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const safePages = pages.filter(Boolean);

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
<div
          className="dropzone"
          role="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>

          <p className="dz-main">
            Drag and drop a PDF file here to reorder or delete pages
          </p>

          <p className="dz-hint">
            Select once. Pages will load as draggable thumbnails.
          </p>

          
        </div>

<input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onClick={(e) => e.stopPropagation()}
            onChange={handleFileChange}
            disabled={processing}
          />
</>
      ) : (
        <div className="file-list-container">
          <h4 className="lbl" style={{ marginBottom: "10px" }}>
            Active Document
          </h4>

          <div className="file-list">
            <div className="file-item">
              <span className="file-icon">
                <FileText size={16} />
              </span>

              <span className="file-name" title={file.name}>
                {file.name}
              </span>

              <span className="file-size">{formatSize(file.size)}</span>

              <button
                type="button"
                className="file-remove"
                onClick={removeFile}
                disabled={processing}
                aria-label="Remove selected PDF"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {safePages.length > 0 && (
        <div className="organize-workspace" style={{ marginTop: "24px" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>
            Drag pages to reorder or delete pages:
          </h4>

          <div
            className="organize-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "16px",
              background: "var(--g50)",
              padding: "20px",
              borderRadius: "12px",
              border: "1.5px dashed var(--g300)",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {safePages.map((page, index) => (
              <div
                className="page-thumb"
                key={page.id}
                draggable={!processing}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  position: "relative",
                  background: "#fff",
                  border: "1px solid var(--g200)",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: processing ? "default" : "grab",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <button
                  type="button"
                  className="page-thumb-del"
                  onClick={() => deletePage(page.id)}
                  disabled={processing}
                  aria-label={`Delete page ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "var(--err)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: processing ? "not-allowed" : "pointer",
                    fontSize: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  ✕
                </button>

                <img
                  src={page.thumb}
                  alt={`Page ${index + 1}`}
                  draggable={false}
                  style={{
                    maxWidth: "100%",
                    height: "100px",
                    objectFit: "contain",
                    border: "1px solid var(--g200)",
                    marginBottom: "8px",
                    userSelect: "none",
                    pointerEvents: "none",
                    background: "#fff",
                  }}
                />

                <div
                  className="page-thumb-num"
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "var(--g500)",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  Page {index + 1}
                  <br />
                  <span style={{ fontWeight: 500, color: "var(--g400)" }}>
                    Original {page.originalPageNumber}
                  </span>
                </div>

                <div
                  className="thumb-arrows"
                  style={{
                    display: "flex",
                    gap: "8px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => moveLeft(index)}
                    disabled={processing || index === 0}
                    aria-label={`Move page ${index + 1} left`}
                    style={{
                      background: "none",
                      border: "none",
                      color:
                        index === 0 || processing
                          ? "var(--g300)"
                          : "var(--b700)",
                      cursor:
                        index === 0 || processing ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowLeft size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveRight(index)}
                    disabled={processing || index === safePages.length - 1}
                    aria-label={`Move page ${index + 1} right`}
                    style={{
                      background: "none",
                      border: "none",
                      color:
                        index === safePages.length - 1 || processing
                          ? "var(--g300)"
                          : "var(--b700)",
                      cursor:
                        index === safePages.length - 1 || processing
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">{statusText}</div>

          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}>
            <Check size={20} />
          </span>

          <div className="result-text">
            <strong>Organize Successful!</strong>
            <span>
              Saved {safePages.length} page(s) in your new layout order.
            </span>
            <small>
              {formatSize(result.size)} • {result.name}
            </small>

            <a
              href={result.url}
              download={result.name}
              className="btn btn-pri"
              style={{
                marginTop: "10px",
                textDecoration: "none",
                display: "inline-flex",
              }}
            >
              Download PDF
            </a>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}>
            <AlertCircle size={20} />
          </span>

          <div className="result-text">
            <strong>Operation Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && safePages.length > 0 && (
        <div
          className="action-row"
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn btn-pri"
            disabled={processing}
            onClick={handleSave}
          >
            {processing ? "Processing..." : "Save & Download PDF"}
          </button>
        </div>
      )}
    </div>
  );
}