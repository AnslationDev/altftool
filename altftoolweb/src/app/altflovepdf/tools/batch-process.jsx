"use client";

import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { getPdfjs } from "../lib/pdfLoader";
import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";
import { Upload, X, Check, AlertCircle, Play } from "lucide-react";

const isEncryptedPdfError = (error) =>
  /encrypted|password|decrypt|security|invalid password/i.test(String(error?.message || error || ""));

export default function BatchProcess() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [op, setOp] = useState("compress");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [logs, setLogs] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    getPdfjs();
  }, []);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const addLog = (msg, type = "info") => {
    setLogs((prev) => [...prev, { text: msg, type }]);
  };

  const resetOutputState = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setLogs([]);
    setFileStatuses({});
    setProgress(0);
    setStatusText("");
  };

  const openFilePicker = () => {
    if (processing) return;

    const input = inputRef.current;
    if (!input) return;

    input.value = "";
    setTimeout(() => input.click(), 0);
  };

  const addPdfFiles = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []);

    const pdfFiles = selectedFiles.filter((f) => {
      const name = f.name?.toLowerCase() || "";
      return f.type === "application/pdf" || name.endsWith(".pdf");
    });

    if (!pdfFiles.length) {
      resetOutputState();
      addLog("Only PDF files are allowed.", "error");
      return;
    }

    resetOutputState();

    setFiles((prev) => {
      const existing = new Set(
        prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );

      const unique = pdfFiles.filter(
        (f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`)
      );

      return [...prev, ...unique];
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.currentTarget.files || []);
    addPdfFiles(selectedFiles);

    setTimeout(() => {
      if (e.currentTarget) e.currentTarget.value = "";
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addPdfFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    resetOutputState();
  };

  const clearAll = () => {
    setFiles([]);
    resetOutputState();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const runBatch = async () => {
    if (processing || files.length === 0) return;

    setProcessing(true);
    setProgress(5);
    setStatusText("Initializing batch queue...");
    setLogs([]);
    setResult(null);

    const zip = new JSZip();
    let success = 0;
    let failed = 0;
    const statuses = {};

    addLog(`Starting batch operation: ${op.toUpperCase()}`, "info");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      statuses[i] = "processing";
      setFileStatuses({ ...statuses });

      const step = 5 + Math.round((i / files.length) * 85);
      setProgress(step);
      setStatusText(`Processing document ${i + 1} of ${files.length}...`);
      addLog(`Processing: ${file.name} (${formatSize(file.size)})`, "info");

      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let outputBytes;

        if (op === "compress") {
          const doc = await PDFDocument.load(bytes);
          doc.setCreator("Local PDF Toolkit");
          outputBytes = await doc.save({ useObjectStreams: true });
        } else if (op === "flatten") {
          const doc = await PDFDocument.load(bytes);
          try {
            doc.getForm().flatten();
          } catch { }
          outputBytes = await doc.save();
        } else if (op === "rotate90") {
          const doc = await PDFDocument.load(bytes);
          doc.getPages().forEach((p) => {
            const cur = p.getRotation().angle;
            p.setRotation(degrees((cur + 90) % 360));
          });
          outputBytes = await doc.save();
        } else if (op === "addpn") {
          const doc = await PDFDocument.load(bytes);
          const font = await doc.embedFont(StandardFonts.Helvetica);
          const pgs = doc.getPages();

          pgs.forEach((page, idx) => {
            const { width } = page.getSize();
            const label = String(idx + 1);
            const tW = font.widthOfTextAtSize(label, 9);

            page.drawText(label, {
              x: width / 2 - tW / 2,
              y: 20,
              size: 9,
              font,
              color: rgb(0.4, 0.4, 0.4),
            });
          });

          outputBytes = await doc.save();
        } else if (op === "grayscale") {
      const pdfjsLib = await getPdfjs();
          const pdfSrc = await pdfjsLib.getDocument({ data: bytes }).promise;
          const outDoc = await PDFDocument.create();

          for (let p = 1; p <= pdfSrc.numPages; p++) {
            const page = await pdfSrc.getPage(p);
            const vp = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");

            canvas.width = vp.width;
            canvas.height = vp.height;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
              throw new Error("Canvas context is not available.");
            }

            await page.render({ canvasContext: ctx, viewport: vp }).promise;

            const id = ctx.getImageData(0, 0, canvas.width, canvas.height);

            for (let k = 0; k < id.data.length; k += 4) {
              const lum = Math.round(
                0.299 * id.data[k] + 0.587 * id.data[k + 1] + 0.114 * id.data[k + 2]
              );
              id.data[k] = lum;
              id.data[k + 1] = lum;
              id.data[k + 2] = lum;
            }

            ctx.putImageData(id, 0, 0);

            const b64 = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
            const bin = atob(b64);
            const ib = new Uint8Array(bin.length);

            for (let k = 0; k < bin.length; k++) {
              ib[k] = bin.charCodeAt(k);
            }

            const em = await outDoc.embedJpg(ib);
            const { width: iW, height: iH } = em.scale(1);

            outDoc.addPage([iW, iH]).drawImage(em, {
              x: 0,
              y: 0,
              width: iW,
              height: iH,
            });
          }

          outputBytes = await outDoc.save();
        }

        if (!outputBytes) {
          throw new Error("No output generated for this operation.");
        }

        const suffix = {
          compress: "_compressed",
          flatten: "_flat",
          rotate90: "_rot90",
          addpn: "_numbered",
          grayscale: "_gray",
        }[op];

        const outName = file.name.replace(/\.pdf$/i, "") + suffix + ".pdf";

        zip.file(outName, outputBytes);
        statuses[i] = "success";
        success++;
        addLog(`Completed: ${outName} (${formatSize(outputBytes.byteLength)})`, "success");
      } catch (err) {
        console.error(err);
        statuses[i] = "error";
        failed++;

        const reason = isEncryptedPdfError(err)
          ? "Password-protected PDF. Use Unlock PDF first, then run this batch operation."
          : err?.message || "Unknown processing error.";

        addLog(`Failed: ${file.name} - ${reason}`, "error");
      }

      setFileStatuses({ ...statuses });
    }

    setProgress(95);
    setStatusText("Compiling zip archive output package...");

    try {
      if (success > 0) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "batch_output.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setResult({
          success,
          failed,
          total: files.length,
          url: downloadUrl,
        });

        addLog(
          `Batch Process Completed: ${success} succeeded, ${failed} failed. ZIP downloaded.`,
          "success"
        );
      } else {
        setResult({
          success,
          failed,
          total: files.length,
          error: "All documents in the batch failed to process. No output ZIP was generated.",
        });

        addLog("Batch Process Completed: All documents failed. No output ZIP generated.", "error");
      }
    } catch (err) {
      console.error(err);
      addLog(`Zip generation failed: ${err?.message || "Unknown zip error."}`, "error");
      setResult({ error: "Packaging failed." });
    } finally {
      setProgress(100);
      setProcessing(false);
      setStatusText("Completed.");
    }
  };

  return (
    <div className="tool-workspace-inner">
      <div
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <div className="dz-ic">
          <Upload size={32} />
        </div>

        <p className="dz-main">Drag and drop multiple PDF files here, or click to browse</p>
        <p className="dz-hint">Processes matching operations in parallel client queues</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        id="batch-input-files"
        multiple
        accept="application/pdf,.pdf"
        style={{ display: "none" }}
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileChange}
        disabled={processing}
      />

      {files.length > 0 && (
        <div className="file-list-container" style={{ marginTop: "20px" }}>
          <h4 className="lbl" style={{ marginBottom: "10px" }}>
            Batch Queue ({files.length})
          </h4>

          <div className="file-list" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {files.map((f, idx) => (
              <div className="file-item" key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}>
                <span className="file-status-icon" style={{ marginRight: "10px", fontSize: "14px" }}>
                  {fileStatuses[idx] === "processing"
                    ? "⚙️"
                    : fileStatuses[idx] === "success"
                      ? "✅"
                      : fileStatuses[idx] === "error"
                        ? "❌"
                        : "⏳"}
                </span>

                <span className="file-name" title={f.name}>
                  {f.name}
                </span>

                <span className="file-size">{formatSize(f.size)}</span>

                <button
                  className="file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  disabled={processing}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

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
              Batch Actions Operation
            </h4>

            <div
              className="radio-group"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
            >
              <button
                type="button"
                className={`radio-btn ${op === "compress" ? "active" : ""}`}
                onClick={() => setOp("compress")}
                disabled={processing}
                style={{ textAlign: "left", padding: "10px" }}
              >
                <strong>Compress PDFs (Safe Optimize)</strong>
                <span style={{ fontSize: "11px", display: "block", color: "var(--g500)" }}>
                  Reduces structural streams (lossless)
                </span>
              </button>

              <button
                type="button"
                className={`radio-btn ${op === "flatten" ? "active" : ""}`}
                onClick={() => setOp("flatten")}
                disabled={processing}
                style={{ textAlign: "left", padding: "10px" }}
              >
                <strong>Flatten Forms</strong>
                <span style={{ fontSize: "11px", display: "block", color: "var(--g500)" }}>
                  Locks interactive textfields
                </span>
              </button>

              <button
                type="button"
                className={`radio-btn ${op === "rotate90" ? "active" : ""}`}
                onClick={() => setOp("rotate90")}
                disabled={processing}
                style={{ textAlign: "left", padding: "10px" }}
              >
                <strong>Rotate 90° Right</strong>
                <span style={{ fontSize: "11px", display: "block", color: "var(--g500)" }}>
                  Rotates all pages right
                </span>
              </button>

              <button
                type="button"
                className={`radio-btn ${op === "addpn" ? "active" : ""}`}
                onClick={() => setOp("addpn")}
                disabled={processing}
                style={{ textAlign: "left", padding: "10px" }}
              >
                <strong>Add Page Numbers</strong>
                <span style={{ fontSize: "11px", display: "block", color: "var(--g500)" }}>
                  Inserts bottom page labels
                </span>
              </button>

              <button
                type="button"
                className={`radio-btn ${op === "grayscale" ? "active" : ""}`}
                onClick={() => setOp("grayscale")}
                disabled={processing}
                style={{ textAlign: "left", padding: "10px", gridColumn: "span 2" }}
              >
                <strong>Rasterize &amp; Convert to Grayscale</strong>
                <span style={{ fontSize: "11px", display: "block", color: "var(--g500)" }}>
                  Converts pages to gray scale images
                </span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                type="button"
                className="btn btn-sec"
                onClick={clearAll}
                style={{ padding: "6px 12px", fontSize: "12.5px" }}
                disabled={processing}
              >
                Clear Queue
              </button>
            </div>
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

      {logs.length > 0 && (
        <div className="console-wrapper" style={{ marginTop: "20px" }}>
          <h4 className="lbl" style={{ marginBottom: "8px" }}>
            Process Log Output Console
          </h4>

          <div
            style={{
              background: "#1e293b",
              color: "#38bdf8",
              padding: "12px",
              fontFamily: "var(--mono)",
              fontSize: "12px",
              borderRadius: "6px",
              maxHeight: "150px",
              overflowY: "auto",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {logs.map((log, index) => (
              <div
                key={`${log.text}-${index}`}
                style={{
                  color:
                    log.type === "success"
                      ? "#4ade80"
                      : log.type === "error"
                        ? "#f87171"
                        : "#38bdf8",
                  marginBottom: "4px",
                }}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}>
            <Check size={20} />
          </span>

          <div className="result-text">
            <strong>Batch Done!</strong>
            <span>
              Successfully processed {result.success} out of {result.total} documents.
            </span>
            <small>Packaged archive batch file ready for download.</small>

            <a
              href={result.url}
              download="batch_output.zip"
              className="btn btn-pri"
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Batch Output ZIP
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}>
            <AlertCircle size={20} />
          </span>

          <div className="result-text">
            <strong>Batch Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="btn btn-pri"
            disabled={processing}
            onClick={runBatch}
          >
            <Play size={14} /> Run Batch Process
          </button>
        </div>
      )}
    </div>
  );
}