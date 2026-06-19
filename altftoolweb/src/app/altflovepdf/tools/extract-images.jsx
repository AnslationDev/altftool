"use client";

import React, { useState, useEffect } from "react";
import { getPdfjs } from "../lib/pdfLoader";
import JSZip from "jszip";
import { Upload, X, FileText, Check, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function ExtractImages() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Configure pdfjs worker path
    getPdfjs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
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
      setFile(droppedFiles[0]);
      setResult(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setStatusText("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const convertToPngBase64 = (imgObj) => {
    const canvas = document.createElement("canvas");
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext("2d");

    let rgbaData;
    const pixelCount = imgObj.width * imgObj.height;
    
    if (imgObj.data.length === pixelCount * 3) {
      rgbaData = new Uint8ClampedArray(pixelCount * 4);
      let jOffset = 0;
      for (let k = 0; k < imgObj.data.length; k += 3) {
        rgbaData[jOffset] = imgObj.data[k];
        rgbaData[jOffset + 1] = imgObj.data[k + 1];
        rgbaData[jOffset + 2] = imgObj.data[k + 2];
        rgbaData[jOffset + 3] = 255;
        jOffset += 4;
      }
    } else if (imgObj.data.length === pixelCount * 4) {
      rgbaData = imgObj.data;
    } else if (imgObj.data.length === pixelCount) {
      rgbaData = new Uint8ClampedArray(pixelCount * 4);
      let jOffset = 0;
      for (let k = 0; k < imgObj.data.length; k++) {
        const val = imgObj.data[k];
        rgbaData[jOffset] = val;
        rgbaData[jOffset + 1] = val;
        rgbaData[jOffset + 2] = val;
        rgbaData[jOffset + 3] = 255;
        jOffset += 4;
      }
    } else {
      rgbaData = new Uint8ClampedArray(imgObj.data);
    }

    const imageData = new ImageData(rgbaData, imgObj.width, imgObj.height);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png").split(",")[1];
  };

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(5);
    setStatusText("Loading PDF...");
    setResult(null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await getPdfjs();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = pdfJsDoc.numPages;
      const zip = new JSZip();
      let imgCount = 0;
      let fallbackUsed = false;

      const skippedPages = [];

      for (let i = 1; i <= total; i++) {
        const step = 5 + Math.round((i / total) * 80);
        setProgress(step);
        setStatusText(`Scanning page ${i} of ${total} for images...`);

        const page = await pdfJsDoc.getPage(i);
        const opList = await page.getOperatorList();
        const ops = opList.fnArray;
        const args = opList.argsArray;
        const imgKeys = [];
        const inlineImgs = [];

        for (let j = 0; j < ops.length; j++) {
          if (
            ops[j] === pdfjsLib.OPS.paintImageXObject ||
            ops[j] === pdfjsLib.OPS.paintImageMaskXObject ||
            ops[j] === pdfjsLib.OPS.paintJpegXObject
          ) {
            const key = args[j][0];
            if (key && !imgKeys.includes(key)) {
              imgKeys.push(key);
            }
          } else if (ops[j] === pdfjsLib.OPS.paintInlineImageXObject) {
            const inlineImg = args[j][0];
            if (inlineImg && inlineImg.width && inlineImg.height) {
              inlineImgs.push(inlineImg);
            }
          }
        }

        if (imgKeys.length === 0 && inlineImgs.length === 0) {
          skippedPages.push(i);
          continue;
        }

        // Force pdf.js to resolve page objects
        await page.render({ canvasContext: document.createElement("canvas").getContext("2d"), viewport: page.getViewport({ scale: 1 }) }).promise.catch(() => {});

        let pageImgIdx = 1;
        for (const key of imgKeys) {
          try {
            const imgObj = await new Promise((resolveObj) => {
              page.objs.get(key, (obj) => {
                resolveObj(obj);
              });
            });

            if (imgObj && imgObj.width && imgObj.height && imgObj.data) {
              const b64 = convertToPngBase64(imgObj);
              zip.file(`page_${i}_img_${pageImgIdx}.png`, b64, { base64: true });
              imgCount++;
              pageImgIdx++;
            }
          } catch (e) {
            console.error(`Failed to extract object ${key} from page ${i}`, e);
          }
        }

        for (const inlineImg of inlineImgs) {
          try {
            if (inlineImg && inlineImg.width && inlineImg.height && inlineImg.data) {
              const b64 = convertToPngBase64(inlineImg);
              zip.file(`page_${i}_inline_${pageImgIdx}.png`, b64, { base64: true });
              imgCount++;
              pageImgIdx++;
            }
          } catch (e) {
            console.error(`Failed to extract inline image on page ${i}`, e);
          }
        }
      }

      if (imgCount === 0) {
        fallbackUsed = true;
        for (let i = 1; i <= total; i++) {
          const step = 85 + Math.round((i / total) * 10);
          setProgress(step);
          setStatusText(`No embedded images found. Rendering page ${i} of ${total} as fallback image...`);

          const page = await pdfJsDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;

          const dataUrl = canvas.toDataURL("image/png");
          const base64Data = dataUrl.split(",")[1];
          zip.file(`page_${i}.png`, base64Data, { base64: true });
          imgCount++;
        }
      }

      setProgress(95);
      setStatusText("Packaging zip archive...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);

      setProgress(100);
      setProcessing(false);

      const name = file.name.replace(".pdf", "") + "_extracted_images.zip";
      setResult({
        name: name,
        size: zipBlob.size,
        url: downloadUrl,
        count: imgCount,
        skippedPages: skippedPages,
        fallbackUsed: fallbackUsed
      });

      // Auto download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setProcessing(false);
      setProgress(0);
      setResult({ error: err.message || "Failed to extract images from PDF." });
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
          onClick={() => document.getElementById("extract-input-file").click()}
        >
          <div className="dz-ic">
            <Upload size={32} />
          </div>
          <p className="dz-main">Drag and drop a PDF file here, or click to browse</p>
          <p className="dz-hint">Extract all embedded graphic/raster images</p>
          
        </div>

<input 
            type="file" 
            id="extract-input-file" 
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

      {processing && (
        <div className="progress-wrap active" style={{ marginTop: "20px" }}>
          <div className="progress-label">{statusText}</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="result-box active" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--ok)" }}><Check size={20} /></span>
          <div className="result-text">
            <strong>Extraction Successful!</strong>
            {result.fallbackUsed ? (
              <span>No embedded raster images found. We converted the {result.count} page(s) to images instead.</span>
            ) : (
              <span>Extracted {result.count} images from your document.</span>
            )}
            {!result.fallbackUsed && result.skippedPages && result.skippedPages.length > 0 && (
              <div style={{ margin: "6px 0", padding: "6px 10px", background: "var(--g100)", borderLeft: "3px solid var(--primary)", fontSize: "12px", borderRadius: "0 4px 4px 0", color: "var(--g600)" }}>
                Note: Pages {result.skippedPages.join(", ")} contain only text or vector graphics (no embedded raster images) and were skipped.
              </div>
            )}
            <small>{formatSize(result.size)} • {result.name}</small>
            <a 
              href={result.url} 
              download={result.name} 
              className="btn btn-pri" 
              style={{ marginTop: "10px", textDecoration: "none", display: "inline-flex" }}
            >
              Download ZIP File
            </a>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="result-box active error" style={{ marginTop: "20px" }}>
          <span className="result-icon" style={{ color: "var(--err)" }}><AlertCircle size={20} /></span>
          <div className="result-text">
            <strong>Extraction Failed</strong>
            <span>{result.error}</span>
          </div>
        </div>
      )}

      <div className="action-row" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button 
          className="btn btn-pri" 
          disabled={!file || processing}
          onClick={handleExtract}
        >
          <ImageIcon size={14} /> Extract Images
        </button>
      </div>
    </div>
  );
}
