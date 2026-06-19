"use client";

import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
  Upload,
  X,
  FileText,
  Check,
  AlertCircle,
  Scissors,
} from "lucide-react";

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [splitMode, setSplitMode] = useState("all");
  const [pageRange, setPageRange] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const isPickingRef = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const resetResult = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
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

  const sanitizeName = (name = "document.pdf") => {
    return name.replace(/\.pdf$/i, "").replace(/[^\w-]+/g, "_");
  };

  const autoDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFilePicker = () => {
    if (processing || isLoadingRef.current || isPickingRef.current) return;

    isPickingRef.current = true;
    fileInputRef.current?.click();

    window.setTimeout(() => {
      isPickingRef.current = false;
    }, 600);
  };

  const loadFile = async (selectedFile) => {
    if (isLoadingRef.current) return;

    if (!isValidPdf(selectedFile)) {
      resetResult();
      setResult({ error: "Please select a valid PDF file." });
      return;
    }

    isLoadingRef.current = true;

    setFile(selectedFile);
    setProgress(0);
    setStatusText("");
    resetResult();

    window.setTimeout(() => {
      isLoadingRef.current = false;
    }, 300);
  };

  const handleFileChange = async (e) => {
    e.stopPropagation();

    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      await loadFile(selectedFile);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    isPickingRef.current = false;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (processing || isLoadingRef.current) return;

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      await loadFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setStatusText("");
    resetResult();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parsePageRange = (input, totalPages) => {
    const indices = new Set();

    input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (part.includes("-")) {
          let [start, end] = part.split("-").map((value) => Number(value.trim()));

          if (!Number.isInteger(start) || !Number.isInteger(end)) return;

          if (start > end) {
            [start, end] = [end, start];
          }

          for (
            let page = Math.max(1, start);
            page <= Math.min(totalPages, end);
            page += 1
          ) {
            indices.add(page - 1);
          }
        } else {
          const page = Number(part);

          if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
            indices.add(page - 1);
          }
        }
      });

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) {
      setResult({ error: "Please upload a PDF file first." });
      return;
    }

    try {
      setProcessing(true);
      setProgress(10);
      setStatusText("Loading PDF document...");
      resetResult();

      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const totalPages = srcPdf.getPageCount();

      if (!totalPages) {
        throw new Error("This PDF does not contain any pages.");
      }

      if (splitMode === "all") {
        const zip = new JSZip();
        const baseName = sanitizeName(file.name);

        setProgress(25);
        setStatusText("Extracting all pages...");

        for (let i = 0; i < totalPages; i += 1) {
          setProgress(25 + Math.round(((i + 1) / totalPages) * 55));
          setStatusText(`Extracting page ${i + 1} of ${totalPages}...`);

          const singlePagePdf = await PDFDocument.create();
          const [copiedPage] = await singlePagePdf.copyPages(srcPdf, [i]);

          singlePagePdf.addPage(copiedPage);

          const pdfBytes = await singlePagePdf.save();
          zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
        }

        setProgress(88);
        setStatusText("Generating ZIP file...");

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const outputName = `${baseName}_split_pages.zip`;

        setResult({
          name: outputName,
          size: zipBlob.size,
          url: downloadUrl,
        });

        setProgress(100);
        setStatusText("Split completed.");

        autoDownload(downloadUrl, outputName);
      } else {
        setProgress(35);
        setStatusText("Parsing page range...");

        const targetIndices = parsePageRange(pageRange, totalPages);

        if (!targetIndices.length) {
          throw new Error(
            `No valid pages found. Enter a range between 1 and ${totalPages}.`
          );
        }

        setProgress(55);
        setStatusText(`Extracting ${targetIndices.length} page(s)...`);

        const outputPdf = await PDFDocument.create();
        const copiedPages = await outputPdf.copyPages(srcPdf, targetIndices);

        copiedPages.forEach((page, index) => {
          outputPdf.addPage(page);
          setProgress(55 + Math.round(((index + 1) / copiedPages.length) * 25));
        });

        setProgress(88);
        setStatusText("Generating final PDF...");

        const pdfBytes = await outputPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);
        const outputName = `${sanitizeName(file.name)}_range.pdf`;

        setResult({
          name: outputName,
          size: blob.size,
          url: downloadUrl,
        });

        setProgress(100);
        setStatusText("Split completed.");

        autoDownload(downloadUrl, outputName);
      }
    } catch (err) {
      console.error("Split PDF error:", err);

      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to split PDF. Please try another PDF file.",
      });
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
            Drag and drop a PDF file here, or click to browse
          </p>

          <p className="dz-hint">
            Select once. Split all pages or extract a custom range.
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
            Selected Document
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

      {file && (
        <div
          className="options-card"
          style={{
            marginTop: "20px",
            background: "var(--g50)",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid var(--g200)",
          }}
        >
          <h4 className="lbl" style={{ marginBottom: "12px" }}>
            Split Settings
          </h4>

          <div
            className="radio-group"
            style={{
              marginBottom: "16px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className={`radio-btn ${splitMode === "all" ? "active" : ""}`}
              onClick={() => {
                setSplitMode("all");
                resetResult();
              }}
              disabled={processing}
            >
              Extract All Pages
            </button>

            <button
              type="button"
              className={`radio-btn ${splitMode === "range" ? "active" : ""}`}
              onClick={() => {
                setSplitMode("range");
                resetResult();
              }}
              disabled={processing}
            >
              Extract Specific Range
            </button>
          </div>

          {splitMode === "range" && (
            <div className="cg">
              <label htmlFor="split-range-input" className="lbl">
                Page Range:
              </label>

              <input
                type="text"
                id="split-range-input"
                value={pageRange}
                onChange={(e) => {
                  setPageRange(e.target.value);
                  resetResult();
                }}
                placeholder="Example: 1-3, 5, 8"
                style={{ marginTop: "6px" }}
                disabled={processing}
              />
            </div>
          )}
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
            <strong>Split Successful!</strong>
            <span>Your PDF was successfully split/extracted.</span>
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
              Download File
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
            <strong>Split Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

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
          disabled={!file || processing}
          onClick={handleSplit}
        >
          <Scissors size={14} />
          {processing ? "Splitting..." : "Split PDF"}
        </button>
      </div>
    </div>
  );
}