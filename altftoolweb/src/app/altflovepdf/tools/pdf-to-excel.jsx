"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, FileText, Check, AlertCircle, Sparkles, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { getPdfjs } from "../lib/pdfLoader";

export default function PdfToExcel() {
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

  const extractTableRows = async (pdfDoc) => {
    const allRows = [];
    const rowTolerance = 10; // points tolerance to merge items on same horizontal line

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items;

      if (items.length === 0) continue;

      const rowsMap = new Map();

      for (const item of items) {
        if (!item.str.trim()) continue;

        // transform[4] is X, transform[5] is Y coordinate
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

      // Sort rows from top of the page to the bottom (descending Y)
      const sortedYKeys = Array.from(rowsMap.keys()).sort((a, b) => b - a);

      for (const yKey of sortedYKeys) {
        // Sort items inside this row left-to-right (ascending X)
        const rowItems = rowsMap.get(yKey).sort((a, b) => a.x - b.x);
        const cellValues = rowItems.map((cell) => cell.text);
        
        if (cellValues.length > 0) {
          allRows.push(cellValues);
        }
      }

      // Append page separators for multi-page tables
      if (pageNum < pdfDoc.numPages) {
        allRows.push([`--- Page ${pageNum + 1} separator ---`]);
      }
    }

    return allRows;
  };

  const handleConvertToExcel = async () => {
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

      // Extract raw table matrix
      const matrixData = await extractTableRows(pdfDoc);

      if (matrixData.length === 0) {
        throw new Error(
          "No text or tabular layout detected. This PDF appears to be a scanned document or image-only PDF. Please ensure the document has a searchable text layer (OCR) before converting."
        );
      }

      // Compile rows matrix into worksheet
      const ws = XLSX.utils.aoa_to_sheet(matrixData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDF Data Table");

      const outBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const outBlob = new Blob([outBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const outName = `${file.name.replace(/\.[^.]+$/, "")}_converted.xlsx`;
      const downloadUrl = URL.createObjectURL(outBlob);

      setResult({
        name: outName,
        size: outBlob.size,
        url: downloadUrl,
        rowsParsed: matrixData.length
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
      setResult({ error: err.message || "Failed to extract table cells from PDF." });
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
          onClick={() => document.getElementById("excel-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Extract structured tabular text grids to editable Excel (.xlsx) spreadsheets client-side</p>
          
        </div>

<input 
            type="file" 
            id="excel-input-file" 
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
          <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "6px" }}>
            <Sparkles size={18} style={{ color: "#0d9488", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#115e59" }}>
              <strong>Browser Engine Info:</strong> The parser scans raw text tokens, groups elements lying on same horizontal lines, orders columns, and compiles spreadsheet matrix tables.
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Extracting coordinate layout patterns and compiling worksheet...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "85%" }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Spreadsheet Extracted!</strong>
            <span>Your PDF table has been successfully converted.</span>
            <small>{formatSize(result.size)} • {result.rowsParsed} rows • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download Excel File
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
          <button className="btn btn-pri" onClick={handleConvertToExcel}>
            <Download size={14} /> Convert to Excel (XLSX)
          </button>
        </div>
      )}
    </div>
  );
}
