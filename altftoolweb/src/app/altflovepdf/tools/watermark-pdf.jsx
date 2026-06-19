"use client";

import React, { useEffect, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import {
  Upload,
  X,
  FileText,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";

export default function WatermarkPdf() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(25);
  const [color, setColor] = useState("#ff0000");
  const [position, setPosition] = useState("diagonal");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const resetResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setResult(null);
  };

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const isValidPdfFile = (selectedFile) => {
    return (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf"))
    );
  };

  const sanitizeFileName = (name = "document.pdf") => {
    return name.replace(/\.pdf$/i, "").replace(/[^\w\-]+/g, "_");
  };

  const normalizeHexColor = (value) => {
    if (!value) return "#ff0000";

    let hex = value.trim();

    if (!hex.startsWith("#")) {
      hex = `#${hex}`;
    }

    const shortHex = /^#([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shortHex, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);

    if (!/^#[a-f\d]{6}$/i.test(hex)) {
      return "#ff0000";
    }

    return hex.toLowerCase();
  };

  const hexToRgb = (hex) => {
    const validHex = normalizeHexColor(hex);
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(validHex);

    if (!match) {
      return { r: 1, g: 0, b: 0 };
    }

    return {
      r: parseInt(match[1], 16) / 255,
      g: parseInt(match[2], 16) / 255,
      b: parseInt(match[3], 16) / 255,
    };
  };

  const autoDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!isValidPdfFile(selectedFile)) {
      resetResult();
      setResult({ error: "Please upload a valid PDF file." });
      return;
    }

    setFile(selectedFile);
    setProgress(0);
    setStatusText("");
    resetResult();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (!isValidPdfFile(droppedFile)) {
      resetResult();
      setResult({ error: "Only PDF files are supported." });
      return;
    }

    setFile(droppedFile);
    setProgress(0);
    setStatusText("");
    resetResult();
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

  const drawCenterWatermark = ({
    page,
    textValue,
    font,
    fontSize,
    colorValue,
    opacityValue,
  }) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(textValue, fontSize);

    page.drawText(textValue, {
      x: (width - textWidth) / 2,
      y: (height - fontSize) / 2,
      size: fontSize,
      font,
      color: colorValue,
      opacity: opacityValue,
    });
  };

  const drawDiagonalWatermark = ({
    page,
    textValue,
    font,
    fontSize,
    colorValue,
    opacityValue,
  }) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(textValue, fontSize);

    page.drawText(textValue, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: colorValue,
      opacity: opacityValue,
      rotate: degrees(45),
    });
  };

  const drawTiledWatermark = ({
    page,
    textValue,
    font,
    fontSize,
    colorValue,
    opacityValue,
  }) => {
    const { width, height } = page.getSize();
    const tileFontSize = Math.max(18, fontSize * 0.38);
    const textWidth = font.widthOfTextAtSize(textValue, tileFontSize);
    const xStep = Math.max(textWidth + 90, tileFontSize * 8);
    const yStep = Math.max(tileFontSize * 5, 90);

    for (let y = -yStep; y < height + yStep; y += yStep) {
      for (let x = -xStep; x < width + xStep; x += xStep) {
        page.drawText(textValue, {
          x,
          y,
          size: tileFontSize,
          font,
          color: colorValue,
          opacity: Math.min(opacityValue, 0.45),
          rotate: degrees(30),
        });
      }
    }
  };

  const handleAddWatermark = async () => {
    if (!file) {
      setResult({ error: "Please upload a PDF file first." });
      return;
    }

    const watermarkText = text.trim();

    if (!watermarkText) {
      setResult({ error: "Please enter watermark text." });
      return;
    }

    try {
      setProcessing(true);
      setProgress(10);
      setStatusText("Reading PDF document...");
      resetResult();

      const inputBytes = await file.arrayBuffer();

      setProgress(25);
      setStatusText("Loading PDF pages...");

      const pdfDoc = await PDFDocument.load(inputBytes, {
        ignoreEncryption: true,
      });

      const pages = pdfDoc.getPages();

      if (!pages.length) {
        throw new Error("This PDF does not contain any pages.");
      }

      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      const colorValue = rgb(r, g, b);
      const opacityValue = Math.min(Math.max(Number(opacity) / 100, 0.05), 0.9);

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const baseFontSize = Math.max(28, Math.min(width, height) / 10);

        const currentProgress =
          25 + Math.round(((index + 1) / pages.length) * 55);

        setProgress(currentProgress);
        setStatusText(`Applying watermark on page ${index + 1} of ${pages.length}...`);

        const commonOptions = {
          page,
          textValue: watermarkText,
          font,
          fontSize: baseFontSize,
          colorValue,
          opacityValue,
        };

        if (position === "center") {
          drawCenterWatermark(commonOptions);
        } else if (position === "tiled") {
          drawTiledWatermark(commonOptions);
        } else {
          drawDiagonalWatermark(commonOptions);
        }
      });

      setProgress(88);
      setStatusText("Saving watermarked PDF...");

      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = `${sanitizeFileName(file.name)}_watermarked.pdf`;

      setResult({
        name: outputName,
        size: blob.size,
        url: downloadUrl,
      });

      setProgress(100);
      setStatusText("Watermark applied successfully.");

      autoDownload(downloadUrl, outputName);
    } catch (err) {
      console.error("Watermark PDF error:", err);

      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to apply watermark. Please try with another PDF file.",
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
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
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
            Apply center, diagonal, or tiled text watermark on every PDF page
          </p>

          
        </div>

<input
            ref={fileInputRef}
            type="file"
            id="wm-input-file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
           onClick={(e) => e.stopPropagation()} />
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
          <h4 className="lbl" style={{ marginBottom: "16px" }}>
            Watermark Customizations
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div className="cg">
              <label className="lbl">Watermark Text:</label>

              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  resetResult();
                }}
                placeholder="CONFIDENTIAL"
                style={{ marginTop: "6px" }}
                disabled={processing}
              />
            </div>

            <div className="cg">
              <label className="lbl">Watermark Position:</label>

              <select
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  resetResult();
                }}
                style={{ marginTop: "6px" }}
                disabled={processing}
              >
                <option value="diagonal">Diagonal Rotated Center</option>
                <option value="center">Horizontal Center</option>
                <option value="tiled">Tiled Repeating Grid</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              className="slider-row"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label className="lbl">Text Opacity:</label>
                <span className="slider-val">{opacity}%</span>
              </div>

              <input
                type="range"
                min="5"
                max="90"
                value={opacity}
                onChange={(e) => {
                  setOpacity(Number(e.target.value));
                  resetResult();
                }}
                style={{ width: "100%", marginTop: "6px" }}
                disabled={processing}
              />
            </div>

            <div className="cg">
              <label className="lbl">Watermark Color:</label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginTop: "6px",
                }}
              >
                <input
                  type="color"
                  value={normalizeHexColor(color)}
                  onChange={(e) => {
                    setColor(e.target.value);
                    resetResult();
                  }}
                  style={{
                    width: "38px",
                    height: "38px",
                    padding: "2px",
                    border: "1px solid var(--g300)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  disabled={processing}
                />

                <input
                  type="text"
                  value={color.toUpperCase()}
                  onChange={(e) => {
                    setColor(e.target.value);
                    resetResult();
                  }}
                  onBlur={(e) => {
                    setColor(normalizeHexColor(e.target.value));
                  }}
                  style={{
                    width: "110px",
                    textTransform: "uppercase",
                  }}
                  disabled={processing}
                />
              </div>
            </div>
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
            <strong>Watermark Applied!</strong>
            <span>Successfully updated PDF with text watermark overlay.</span>
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
              Download Watermarked PDF
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
          onClick={handleAddWatermark}
        >
          <Copy size={14} />
          {processing ? "Applying..." : "Apply Watermark"}
        </button>
      </div>
    </div>
  );
}