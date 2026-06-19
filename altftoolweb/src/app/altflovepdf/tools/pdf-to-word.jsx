"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, FileText, Check, AlertCircle, Sparkles, Download } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { getPdfjs } from "../lib/pdfLoader";

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setResult(null);
    }
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

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const extractParagraphs = async (pdfDoc) => {
    const allParagraphs = [];
    const rowTolerance = 12; // tolerance to group text chunks on same baseline

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items;

      if (items.length === 0) continue;

      const rowsMap = new Map();

      for (const item of items) {
        if (!item.str.trim()) continue;

        const x = item.transform[4];
        const y = item.transform[5];

        let foundYKey = null;
        for (const existingY of rowsMap.keys()) {
          if (Math.abs(existingY - y) < rowTolerance) {
            foundYKey = existingY;
            break;
          }
        }

        if (foundYKey !== null) {
          rowsMap.get(foundYKey).push({ text: item.str, x });
        } else {
          rowsMap.set(y, [{ text: item.str, x }]);
        }
      }

      // Sort lines descending (from top-of-page down)
      const sortedYKeys = Array.from(rowsMap.keys()).sort((a, b) => b - a);

      for (const yKey of sortedYKeys) {
        // Sort left-to-right (ascending X)
        const rowItems = rowsMap.get(yKey).sort((a, b) => a.x - b.x);
        
        // Merge adjacent texts to reconstruct paragraphs
        const lineText = rowItems.map((cell) => cell.text).join(" ");
        if (lineText.trim()) {
          allParagraphs.push(lineText);
        }
      }

      // Page break indicator
      if (pageNum < pdfDoc.numPages) {
        allParagraphs.push("--- PAGE BREAK ---");
      }
    }

    return allParagraphs;
  };

  const handleConvertToWord = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfjs();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdfDoc = await loadingTask.promise;

      if (pdfDoc.numPages === 0) {
        throw new Error("The PDF document does not contain any pages.");
      }

      const textLines = await extractParagraphs(pdfDoc);

      if (textLines.length === 0) {
        throw new Error(
          "No readable text layer detected. This PDF appears to be a scanned document or image-only PDF. Please ensure the document has a searchable text layer (OCR) before converting."
        );
      }

      // Construct docx Paragraph components
      const docxChildren = textLines.map((line) => {
        if (line === "--- PAGE BREAK ---") {
          return new Paragraph({
            children: [new TextRun({ text: "", break: 1 })]
          });
        }
        return new Paragraph({
          children: [new TextRun({ text: line, size: 24, font: "Calibri" })],
          spacing: { after: 120 }
        });
      });

      // Create docx Document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxChildren
          }
        ]
      });

      // Build blob bytes
      const blob = await Packer.toBlob(doc);
      const outName = `${file.name.replace(/\.[^.]+$/, "")}_converted.docx`;
      const downloadUrl = URL.createObjectURL(blob);

      setResult({
        name: outName,
        size: blob.size,
        url: downloadUrl,
        linesParsed: textLines.length
      });

      // Auto download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setResult({ error: err.message || "Failed to parse PDF text segments." });
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
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("word-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Extract PDF textual contents and layout flows into a Word (.docx) document client-side</p>
          
        </div>

<input 
            type="file" 
            id="word-input-file" 
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
              <button className="file-remove" onClick={() => setFile(null)} disabled={processing}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="options-card" style={{ marginTop: "20px", background: "var(--g50)", padding: "16px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
          <h4 className="lbl" style={{ marginBottom: "12px" }}>Converter Properties</h4>
          <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#f0fdf4", border: "1px solid #ccfbf1", borderRadius: "6px" }}>
            <Sparkles size={18} style={{ color: "#0d9488", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#115e59" }}>
              <strong>Browser Engine Info:</strong> The parser will dynamically group inline text segments, order them sequentially page by page, and generate standard paragraphs.
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Extracting logical paragraphs and formatting document...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "85%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Document Extracted!</strong>
            <span>Your PDF has been successfully converted to Word.</span>
            <small>{formatSize(result.size)} • {result.linesParsed} lines • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Word File
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Conversion Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      {file && !processing && !result && (
        <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button className="btn btn-pri" onClick={handleConvertToWord}>
            <Download size={14} /> Convert to Word (DOCX)
          </button>
        </div>
      )}
    </div>
  );
}
