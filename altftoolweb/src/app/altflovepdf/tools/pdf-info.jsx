"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, X, FileText, Check, AlertCircle, Info, Calendar, Hash, File, Monitor } from "lucide-react";

export default function PdfInfo() {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const selected = selectedFiles[0];
      setFile(selected);
      setLoading(true);
      setError("");
      setInfo(null);

      try {
        const bytes = new Uint8Array(await selected.arrayBuffer());
        
        let isEncrypted = false;
        let doc;
        try {
          doc = await PDFDocument.load(bytes);
        } catch (loadErr) {
          const errMsg = loadErr.message || "";
          if (
            errMsg.includes("encrypt") || 
            errMsg.includes("password") || 
            errMsg.includes("decrypt") || 
            errMsg.includes("security") ||
            errMsg.includes("ignoreEncryption")
          ) {
            isEncrypted = true;
            doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          } else {
            throw loadErr;
          }
        }
 
        let pageCount = 0;
        let pageSizes = [];
        try {
          const pages = doc.getPages();
          pageCount = pages.length;
          pageSizes = pages.slice(0, 5).map((p, i) => {
            const { width, height } = p.getSize();
            return `Page ${i + 1}: ${width.toFixed(0)} × ${height.toFixed(0)} pt`;
          });
        } catch (pagesErr) {
          console.warn("Could not read pages from encrypted PDF", pagesErr);
          pageSizes = ["Unable to read page dimensions (document is encrypted)"];
        }
 
        const safeGet = (fn) => {
          try {
            return fn() || "—";
          } catch (getErr) {
            return "Unable to read (encrypted)";
          }
        };
 
        const title = safeGet(() => doc.getTitle());
        const author = safeGet(() => doc.getAuthor());
        const subject = safeGet(() => doc.getSubject());
        const creator = safeGet(() => doc.getCreator());
        const producer = safeGet(() => doc.getProducer());
        const keywords = safeGet(() => (doc.getKeywords() || []).join(", "));
        
        let createdStr = "—";
        try {
          const c = doc.getCreationDate();
          if (c) createdStr = c.toLocaleString();
        } catch (dateErr) {
          createdStr = "Unable to read (encrypted)";
        }
 
        let modifiedStr = "—";
        try {
          const m = doc.getModificationDate();
          if (m) modifiedStr = m.toLocaleString();
        } catch (dateErr) {
          modifiedStr = "Unable to read (encrypted)";
        }
 
        setInfo({
          name: selected.name,
          size: selected.size,
          pageCount: pageCount || "Unknown",
          version: doc.context.header.toString() || "Unknown",
          title: title,
          author: author,
          subject: subject,
          creator: creator,
          producer: producer,
          created: createdStr,
          modified: modifiedStr,
          pageSizes: pageSizes,
          keywords: keywords,
          isEncrypted: isEncrypted
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to inspect PDF document parameters.");
      } finally {
        setLoading(false);
      }
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

  const removeFile = () => {
    setFile(null);
    setInfo(null);
    setError("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="tool-workspace-inner">
      {!file ? (
        <>
<div 
          className="dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("info-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Inspect metadata tags, layout sizes, versions, and security properties</p>
          
        </div>

<input 
            type="file" 
            id="info-input-file" 
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

      {loading && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">Reading metadata descriptors...</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "60%" }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Inspection Failed</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {info && (
        <div className="info-display-container" style={{ marginTop: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {info.isEncrypted && (
              <div style={{ display: "flex", gap: "10px", padding: "12px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", gridColumn: "1 / -1", marginBottom: "4px" }}>
                <AlertCircle size={18} style={{ color: "#e53e3e", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "12.5px", color: "#9b2c2c" }}>
                  <strong>Security Alert:</strong> This PDF is password-protected or encrypted. Some metadata fields, page dimensions, or text contents may be unreadable or incomplete because the file streams are encrypted.
                </div>
              </div>
            )}
            
            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><File size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>File Name</span>
                <span style={{ fontSize: "13px", fontWeight: "600", wordBreak: "break-all" }}>{info.name}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Hash size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>File Size</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{formatSize(info.size)}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Total Pages</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.pageCount} pages</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Monitor size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>PDF Version</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.version}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Document Title</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.title}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Author / Owner</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.author}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Calendar size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Created Date</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.created}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)" }}>
              <div style={{ color: "var(--g500)" }}><Calendar size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Modified Date</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.modified}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)", gridColumn: "span 2" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Subject / Summary</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.subject}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)", gridColumn: "span 2" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Keywords List</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.keywords}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)", gridColumn: "span 2" }}>
              <div style={{ color: "var(--g500)" }}><Info size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>PDF Producer Application</span>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{info.producer} / {info.creator}</span>
              </div>
            </div>

            <div className="info-item-card" style={{ display: "flex", gap: "12px", background: "var(--g50)", padding: "12px", borderRadius: "8px", border: "1px solid var(--g200)", gridColumn: "span 2" }}>
              <div style={{ color: "var(--g500)" }}><FileText size={20} /></div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--g500)", display: "block" }}>Page Physical Sizes (First 5 pages)</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px" }}>
                  {info.pageSizes.map((sizeStr, index) => (
                    <span 
                      key={index} 
                      style={{ fontSize: "12px", background: "var(--g200)", color: "var(--g700)", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}
                    >
                      {sizeStr}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
