"use client";

import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Camera,
  FileCode,
  Eye,
} from "lucide-react";

export default function WebpageToPdf() {
  const [mode, setMode] = useState("website");
  const [file, setFile] = useState(null);
  const [rawHtml, setRawHtml] = useState("");
  const [size, setSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  const isExtensionAvailable =
    typeof window !== "undefined" &&
    typeof chrome !== "undefined" &&
    chrome?.tabs &&
    typeof chrome.tabs.captureVisibleTab === "function";

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const resetResult = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setShowPreview(false);
  };

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };



  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.html?$/i)) {
      resetResult();
      setResult({ error: "Please upload only .html or .htm files." });
      return;
    }

    setFile(selectedFile);
    setRawHtml("");
    resetResult();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (!droppedFile.name.match(/\.html?$/i)) {
      resetResult();
      setResult({ error: "Only .html and .htm files are supported." });
      return;
    }

    setFile(droppedFile);
    setRawHtml("");
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

  const getPdfPageSize = (imageWidth, imageHeight) => {
    if (size === "a4") {
      return orientation === "landscape"
        ? { width: 841.89, height: 595.28 }
        : { width: 595.28, height: 841.89 };
    }

    if (size === "letter") {
      return orientation === "landscape"
        ? { width: 792, height: 612 }
        : { width: 612, height: 792 };
    }

    return {
      width: imageWidth,
      height: imageHeight,
    };
  };

  const compilePdfFromImage = async (dataUrl, fileName) => {
    setProgress(70);
    setStatusText("Creating PDF from captured image...");

    const base64 = dataUrl.split(",")[1];

    if (!base64) {
      throw new Error("Invalid image capture data.");
    }

    const binaryString = atob(base64);
    const imageBytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    const pdfDoc = await PDFDocument.create();
    const mimeType = dataUrl.slice(5, dataUrl.indexOf(";")).toLowerCase();

    const embeddedImage = mimeType.includes("png")
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    const imageDims = embeddedImage.scale(1);
    const pageSize = getPdfPageSize(imageDims.width, imageDims.height);

    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

    const scale = Math.min(
      pageSize.width / imageDims.width,
      pageSize.height / imageDims.height
    );

    const drawWidth = imageDims.width * scale;
    const drawHeight = imageDims.height * scale;

    page.drawImage(embeddedImage, {
      x: (pageSize.width - drawWidth) / 2,
      y: (pageSize.height - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    setProgress(90);
    setStatusText("Saving PDF file...");

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const downloadUrl = URL.createObjectURL(blob);

    setResult({
      name: fileName,
      size: blob.size,
      url: downloadUrl,
    });

    setProgress(100);
    setStatusText("PDF ready.");
  };

  const handleCaptureExtension = async () => {
    if (!isExtensionAvailable) {
      setResult({
        error:
          "Active tab capture requires the companion Chrome Extension environment.",
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(15);
      setStatusText("Capturing active browser tab...");
      resetResult();

      const tabDataUrl = await new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          null,
          { format: "png", quality: 100 },
          (imageUrl) => {
            if (chrome.runtime?.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            if (!imageUrl) {
              reject(new Error("Unable to capture active tab."));
              return;
            }

            resolve(imageUrl);
          }
        );
      });

      await compilePdfFromImage(tabDataUrl, "captured_tab.pdf");
    } catch (err) {
      console.error("Tab capture failed:", err);

      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to capture the active tab. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertHtml = async () => {
    if (!file && !rawHtml.trim()) {
      setResult({
        error: "Please upload an HTML file or paste raw HTML content first.",
      });
      return;
    }

    let iframe = null;

    try {
      setProcessing(true);
      setProgress(15);
      setStatusText("Reading HTML input...");
      resetResult();

      const htmlContent = file ? await file.text() : rawHtml.trim();

      if (!htmlContent) {
        throw new Error("HTML content is empty.");
      }

      setProgress(30);
      setStatusText("Compiling HTML, CSS and JavaScript...");

      const isFullHtml =
        /<html/i.test(htmlContent) ||
        /<body/i.test(htmlContent) ||
        /<head/i.test(htmlContent);

      let fullHtml = "";
      if (isFullHtml) {
        fullHtml = htmlContent;
      } else {
        fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                html,
                body {
                  margin: 0;
                  padding: 0;
                  background: #ffffff;
                  color: #000000;
                  font-family: Arial, Helvetica, sans-serif;
                }

                * {
                  box-sizing: border-box;
                }

                img,
                video,
                canvas,
                svg {
                  max-width: 100%;
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;
      }

      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-10000px";
      iframe.style.top = "0";
      iframe.style.width = orientation === "landscape" ? "1123px" : "794px";
      iframe.style.height = "1400px";
      iframe.style.border = "0";
      iframe.style.background = "#ffffff";
      iframe.style.visibility = "visible";

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      await new Promise((resolve, reject) => {
        iframe.onload = resolve;
        iframe.onerror = reject;
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
      });

      // Wait a bit to ensure styles and any scripts execute/apply
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!iframeDoc || !iframeDoc.body) {
        throw new Error("Unable to render HTML document.");
      }

      // Copy stylesheets and style tags to body so html2pdf captures them
      const headStyles = iframeDoc.querySelectorAll("style, link[rel='stylesheet']");
      headStyles.forEach((styleEl) => {
        if (!iframeDoc.body.contains(styleEl)) {
          iframeDoc.body.appendChild(styleEl.cloneNode(true));
        }
      });

      setProgress(55);
      setStatusText("Rendering visual layout...");

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const outputName = file
        ? `${file.name.replace(/\.html?$/i, "")}.pdf`
        : "converted_html.pdf";

      const options = {
        margin: 10,
        filename: outputName,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: iframeDoc.documentElement.scrollWidth,
          windowHeight: iframeDoc.documentElement.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: size === "original" ? "a4" : size,
          orientation,
          compress: true,
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      setProgress(75);
      setStatusText("Generating PDF file...");

      const pdfArrayBuffer = await html2pdf()
        .set(options)
        .from(iframeDoc.body)
        .outputPdf("arraybuffer");

      setProgress(90);
      setStatusText("Saving PDF file...");

      const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setResult({
        name: outputName,
        size: blob.size,
        url: downloadUrl,
      });

      setProgress(100);
      setStatusText("PDF ready.");
    } catch (err) {
      console.error("HTML conversion failed:", err);

      setProgress(0);
      setStatusText("");

      setResult({
        error:
          err?.message ||
          "Failed to convert HTML content. Please check your HTML and try again.",
      });
    } finally {
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }

      setProcessing(false);
    }
  };

  return (
    <div className="tool-workspace-inner">
      <div
        className="tab-group"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className={`radio-btn ${mode === "website" ? "active" : ""}`}
          onClick={() => {
            setMode("website");
            resetResult();
          }}
          disabled={processing}
          style={{ flex: "1 1 220px", padding: "10px", fontWeight: "bold" }}
        >
          Website Mode
        </button>

        <button
          type="button"
          className={`radio-btn ${mode === "extension" ? "active" : ""}`}
          onClick={() => {
            setMode("extension");
            resetResult();
          }}
          disabled={processing}
          style={{ flex: "1 1 220px", padding: "10px", fontWeight: "bold" }}
        >
          Extension Mode
        </button>
      </div>

      {mode === "website" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!file ? (
            <>
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
                  Drag and drop an HTML file here, or click to browse
                </p>

                <p className="dz-hint">
                  Convert local HTML files or pasted HTML code into a PDF
                </p>

                
              </div>

<input
                  ref={fileInputRef}
                  type="file"
                  id="webpage-html-input"
                  accept=".html,.htm,text/html"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                 onClick={(e) => e.stopPropagation()} />
</>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "var(--g400)",
                  fontWeight: "600",
                }}
              >
                — OR PASTE RAW HTML CODE BELOW —
              </div>

              <div className="cg">
                <label className="lbl">Paste HTML Code:</label>

                <textarea
                  value={rawHtml}
                  onChange={(e) => {
                    setRawHtml(e.target.value);
                    resetResult();
                  }}
                  placeholder="<h1>Hello World</h1><p>My first PDF document page.</p>"
                  rows={7}
                  style={{
                    marginTop: "6px",
                    fontFamily: "var(--mono)",
                    fontSize: "13px",
                    resize: "vertical",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="file-list-container">
              <h4 className="lbl" style={{ marginBottom: "10px" }}>
                Selected HTML Document
              </h4>

              <div className="file-list">
                <div className="file-item">
                  <span className="file-icon">
                    <FileCode size={16} />
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
                    aria-label="Remove selected file"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {(file || rawHtml.trim()) && (
            <div
              className="action-row"
              style={{
                marginTop: "12px",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn btn-pri"
                disabled={processing}
                onClick={handleConvertHtml}
              >
                <FileCode size={14} />
                {processing ? "Rendering..." : "Render HTML to PDF"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="options-card"
          style={{
            background: "var(--g50)",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid var(--g200)",
          }}
        >
          <h4 className="lbl" style={{ marginBottom: "12px" }}>
            Chrome Extension Tab Capture
          </h4>

          <p
            style={{
              fontSize: "12.5px",
              color: "var(--g500)",
              marginBottom: "16px",
              lineHeight: "1.5",
            }}
          >
            Capture the current active browser tab and convert it into a local
            PDF document.
          </p>

          {isExtensionAvailable ? (
            <button
              type="button"
              className="btn btn-sec"
              onClick={handleCaptureExtension}
              disabled={processing}
            >
              <Camera size={14} />
              {processing ? "Capturing..." : "Capture Active Tab"}
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "12px",
                background: "var(--err-bg, #fff5f5)",
                border: "1px solid var(--err-border, #feb2b2)",
                padding: "14px",
                borderRadius: "8px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle
                size={20}
                style={{
                  color: "var(--err, #e53e3e)",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />

              <div>
                <strong
                  style={{
                    display: "block",
                    color: "var(--err, #e53e3e)",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Requires Companion Extension
                </strong>

                <span
                  style={{
                    fontSize: "12.5px",
                    color: "var(--g600)",
                    lineHeight: "1.4",
                  }}
                >
                  Active tab capture works only inside the companion Chrome
                  Extension environment.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {((mode === "website" && (file || rawHtml.trim())) ||
        (mode === "extension" && isExtensionAvailable)) && (
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
              PDF Page Layout Options
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
                className={`radio-btn ${size === "original" ? "active" : ""}`}
                onClick={() => {
                  setSize("original");
                  resetResult();
                }}
                disabled={processing || mode === "website"}
                title={
                  mode === "website"
                    ? "Original size is available only for tab capture mode."
                    : ""
                }
              >
                Original Size
              </button>

              <button
                type="button"
                className={`radio-btn ${size === "a4" ? "active" : ""}`}
                onClick={() => {
                  setSize("a4");
                  resetResult();
                }}
                disabled={processing}
              >
                A4 Size
              </button>

              <button
                type="button"
                className={`radio-btn ${size === "letter" ? "active" : ""}`}
                onClick={() => {
                  setSize("letter");
                  resetResult();
                }}
                disabled={processing}
              >
                Letter Size
              </button>
            </div>

            {size !== "original" && (
              <div
                className="radio-group"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className={`radio-btn ${orientation === "portrait" ? "active" : ""
                    }`}
                  onClick={() => {
                    setOrientation("portrait");
                    resetResult();
                  }}
                  disabled={processing}
                >
                  Portrait Orientation
                </button>

                <button
                  type="button"
                  className={`radio-btn ${orientation === "landscape" ? "active" : ""
                    }`}
                  onClick={() => {
                    setOrientation("landscape");
                    resetResult();
                  }}
                  disabled={processing}
                >
                  Landscape Orientation
                </button>
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
            <strong>PDF Generated Successfully!</strong>
            <span>Your PDF document is ready.</span>
            <small>
              {formatSize(result.size)} • {result.name}
            </small>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-sec"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                }}
                onClick={() => setShowPreview(true)}
              >
                <Eye size={14} />
                Preview PDF
              </button>

              <a
                href={result.url}
                download={result.name}
                className="btn btn-pri"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#ffffff",
                }}
              >
                Download PDF
              </a>
            </div>
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
      {showPreview && result?.url && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="modal-container"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1000px",
              height: "90%",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--g200, #e2e8f0)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "650", color: "var(--ink)" }}>
                PDF Preview - {result.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "background 0.2s",
                }}
              >
                <X size={20} />
              </button>
            </div>
            {/* PDF Embed / Iframe */}
            <div style={{ flex: 1, position: "relative", background: "#f1f5f9" }}>
              <iframe
                src={`${result.url}#toolbar=1`}
                title="PDF Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}