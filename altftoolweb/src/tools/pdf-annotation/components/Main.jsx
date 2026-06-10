"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Pen, Highlighter, Type, Download, Trash2, ZoomIn, ZoomOut, FileText,
  Square, Circle, ArrowUpRight, Check, Undo2, Redo2, Eraser, Clipboard,
  Loader2, RefreshCw, AlertTriangle, ShieldCheck
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_PDF_BYTES = 80 * 1024 * 1024;

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "annotated-pdf"
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawAnnotation(ctx, ann, scale = 1) {
  if (ann.type === "signature") {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.scale(scale, scale);
      ctx.drawImage(img, ann.x, ann.y, ann.width || 150, ann.height || 60);
      ctx.restore();
    };
    img.src = ann.data;
    return;
  }

  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = ann.color;
  ctx.fillStyle = ann.color;
  ctx.lineWidth = 3;

  if (ann.type === "pen") {
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ann.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
  }
  if (ann.type === "highlight") {
    ctx.globalAlpha = 0.4;
    ctx.fillRect(Math.min(ann.x, ann.x + ann.width), Math.min(ann.y, ann.y + ann.height), Math.abs(ann.width), Math.abs(ann.height));
  }
  if (ann.type === "rect") ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
  if (ann.type === "circle") {
    ctx.beginPath();
    const radius = Math.sqrt(ann.width ** 2 + ann.height ** 2);
    ctx.arc(ann.x, ann.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
  if (ann.type === "arrow") {
    const headlen = 15;
    const dx = ann.width;
    const dy = ann.height;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(ann.x, ann.y);
    ctx.lineTo(ann.x + dx, ann.y + dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ann.x + dx, ann.y + dy);
    ctx.lineTo(ann.x + dx - headlen * Math.cos(angle - Math.PI / 6), ann.y + dy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(ann.x + dx - headlen * Math.cos(angle + Math.PI / 6), ann.y + dy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  }
  if (ann.type === "text") {
    ctx.font = `${ann.fontSize || 20}px sans-serif`;
    ctx.fillText(ann.text, ann.x, ann.y);
  }

  ctx.restore();
}

async function drawAnnotationForExport(ctx, ann) {
  if (ann.type === "signature") {
    const img = await loadImage(ann.data);
    ctx.drawImage(img, ann.x, ann.y, ann.width || 150, ann.height || 60);
    return;
  }

  drawAnnotation(ctx, ann, 1);
}

function buildAnnotationSummary(file, pages, annotations) {
  const counts = annotations.reduce((acc, ann) => {
    acc[ann.type] = (acc[ann.type] || 0) + 1;
    return acc;
  }, {});

  return [
    "PDF annotation summary",
    `File: ${file?.name || "Untitled PDF"}`,
    `Size: ${formatBytes(file?.size || 0)}`,
    `Pages: ${pages.length}`,
    `Total annotations: ${annotations.length}`,
    ...Object.entries(counts).map(([type, count]) => `${type}: ${count}`),
  ].join("\n");
}

function releaseRenderedPages(pages = []) {
  pages.forEach((page) => {
    if (page?.canvas) {
      page.canvas.width = 0;
      page.canvas.height = 0;
    }
  });
}

export default function MainComponent() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]); 
  const [currentPageIdx, setCurrentPageIdx] = useState(0); 
  const [currentTool, setCurrentTool] = useState("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, text: "" });
  const [fontSize, setFontSize] = useState(20);

  // RGB States (New)
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const color = useMemo(() => {
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }, [rgb]);

  // Signature States
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigType, setSigType] = useState("draw");
  const sigCanvasRef = useRef(null);
  const [isSigDrawing, setIsSigDrawing] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const pdfPagesRef = useRef([]);

  useEffect(() => {
    pdfPagesRef.current = pdfPages;
  }, [pdfPages]);

  useEffect(() => () => releaseRenderedPages(pdfPagesRef.current), []);

  useEffect(() => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setIsPdfReady(true);
      return () => {};
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setIsPdfReady(true);
    };
    script.onerror = () => {
      setError("PDF annotation engine could not load. Refresh and try again.");
    };
    return () => document.body.removeChild(script);
  }, []);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(annotations))]);
    setRedoStack([]);
  }, [annotations]);

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [JSON.parse(JSON.stringify(annotations)), ...prev]);
    setAnnotations(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(annotations))]);
    setAnnotations(next);
    setRedoStack(prev => prev.slice(1));
  };

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || pdfPages.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const page = pdfPages[currentPageIdx]; 
    canvasRef.current.width = page.canvas.width * zoom;
    canvasRef.current.height = page.canvas.height * zoom;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(page.canvas, 0, 0, canvasRef.current.width, canvasRef.current.height);

    annotations
      .filter((ann) => ann.pageIndex === currentPageIdx)
      .forEach((ann) => drawAnnotation(ctx, ann, zoom));
  }, [pdfPages, currentPageIdx, annotations, zoom]);

  useEffect(() => { if (pdfPages.length > 0) redrawCanvas(); }, [pdfPages, currentPageIdx, annotations, zoom, redrawCanvas]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    setError("");
    setStatus("");
    setCopied(false);
    const isPdf = file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");
    if (!file) return;
    if (!isPdf) {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(`PDF must be under ${formatBytes(MAX_PDF_BYTES)}.`);
      return;
    }
    if (!isPdfReady || !window.pdfjsLib) {
      setError("PDF annotation engine is still loading. Try again in a moment.");
      return;
    }

    releaseRenderedPages(pdfPagesRef.current);
    setIsLoadingPdf(true);
    setStatus("Rendering PDF pages for annotation...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      let pdf = null;
      try {
        const typedArray = new Uint8Array(event.target.result);
        pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        const pagesArray = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          pagesArray.push({ canvas, thumb: canvas.toDataURL("image/jpeg", 0.2) });
        }
        setPdfFile(file);
        setPdfPages(pagesArray);
        setCurrentPageIdx(0);
        setAnnotations([]);
        setHistory([]);
        setRedoStack([]);
        setZoom(1);
        setStatus(`Loaded ${pagesArray.length} page${pagesArray.length === 1 ? "" : "s"}. Add annotations and export PDF.`);
      } catch (err) {
        console.error("PDF annotation load failed:", err);
        setError("Could not load this PDF. It may be encrypted or corrupted.");
        setStatus("");
      } finally {
        await pdf?.destroy?.();
        setIsLoadingPdf(false);
      }
    };
    reader.onerror = () => {
      setError("Could not read the selected PDF.");
      setStatus("");
      setIsLoadingPdf(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoords(e);
    
    if (currentTool === "eraser") {
      saveHistory();
      setAnnotations(prev => prev.filter(ann => {
        if (ann.pageIndex !== currentPageIdx) return true;
        if (ann.type === "pen") return !ann.points.some(p => Math.hypot(p.x - x, p.y - y) < 10);
        const minX = Math.min(ann.x, ann.x + (ann.width || 100));
        const maxX = Math.max(ann.x, ann.x + (ann.width || 100));
        const minY = Math.min(ann.y, ann.y + (ann.height || 50));
        const maxY = Math.max(ann.y, ann.y + (ann.height || 50));
        return !(x >= minX && x <= maxX && y >= minY && y <= maxY);
      }));
      return;
    }

    const hitIndex = annotations.findIndex(ann => {
      if (ann.pageIndex !== currentPageIdx) return false;
      if (ann.type === "text") {
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = `${ann.fontSize || 20}px sans-serif`;
        const metrics = ctx.measureText(ann.text);
        return x >= ann.x && x <= ann.x + metrics.width && y <= ann.y && y >= ann.y - (ann.fontSize || 20);
      }
      if (ann.type === "signature") {
        return x >= ann.x && x <= ann.x + (ann.width || 150) && y >= ann.y && y <= ann.y + (ann.height || 60);
      }
      return false;
    });

    if (hitIndex !== -1) {
      saveHistory();
      setDraggingIndex(hitIndex);
      setDragOffset({ x: x - annotations[hitIndex].x, y: y - annotations[hitIndex].y });
      return;
    }

    if (currentTool === "text") {
      setTextInput({ show: true, x, y, text: "" });
      return;
    }

    if (currentTool === "signature") {
      setShowSigModal(true);
      setTextInput({ ...textInput, x, y });
      return;
    }

    saveHistory();
    setIsDrawing(true);
    const newAnn = { type: currentTool, pageIndex: currentPageIdx, color, x, y, width: 0, height: 0, points: currentTool === "pen" ? [{ x, y }] : [] };
    setAnnotations([...annotations, newAnn]);
  };

  const draw = (e) => {
    const { x, y } = getCoords(e);
    if (draggingIndex !== null) {
      setAnnotations(prev => {
        const copy = [...prev];
        copy[draggingIndex] = { ...copy[draggingIndex], x: x - dragOffset.x, y: y - dragOffset.y };
        return copy;
      });
      return;
    }
    if (!isDrawing) return;
    setAnnotations(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last.type === "pen") last.points = [...last.points, { x, y }];
      else { last.width = x - last.x; last.height = y - last.y; }
      return copy;
    });
  };

  const stopDrawing = () => { setIsDrawing(false); setDraggingIndex(null); };

  const addSignatureToCanvas = (data) => {
    saveHistory();
    setAnnotations([...annotations, { 
      type: "signature", pageIndex: currentPageIdx, x: textInput.x, y: textInput.y, data, width: 150, height: 60
    }]);
    setShowSigModal(false);
  };

  const clearCurrentPage = () => {
    if (!annotations.some((ann) => ann.pageIndex === currentPageIdx)) return;
    saveHistory();
    setAnnotations((previous) => previous.filter((ann) => ann.pageIndex !== currentPageIdx));
    setStatus(`Cleared annotations from page ${currentPageIdx + 1}.`);
  };

  const resetTool = () => {
    releaseRenderedPages(pdfPagesRef.current);
    setPdfFile(null);
    setPdfPages([]);
    setCurrentPageIdx(0);
    setAnnotations([]);
    setHistory([]);
    setRedoStack([]);
    setZoom(1);
    setStatus("");
    setError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderAnnotatedPage = async (pageIndex) => {
    const page = pdfPages[pageIndex];
    const canvas = document.createElement("canvas");
    canvas.width = page.canvas.width;
    canvas.height = page.canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(page.canvas, 0, 0, canvas.width, canvas.height);

    const pageAnnotations = annotations.filter((ann) => ann.pageIndex === pageIndex);
    for (const ann of pageAnnotations) {
      await drawAnnotationForExport(ctx, ann);
    }

    return canvas;
  };

  const exportAnnotatedPdf = async () => {
    if (!pdfFile || !pdfPages.length) return;
    setIsExporting(true);
    setError("");
    setStatus("Rendering annotated PDF...");

    try {
      const { jsPDF } = await import("jspdf");
      let doc = null;

      for (let pageIndex = 0; pageIndex < pdfPages.length; pageIndex += 1) {
        const canvas = await renderAnnotatedPage(pageIndex);
        const width = canvas.width;
        const height = canvas.height;
        const orientation = width > height ? "landscape" : "portrait";

        if (!doc) {
          doc = new jsPDF({ orientation, unit: "pt", format: [width, height] });
        } else {
          doc.addPage([width, height], orientation);
        }

        doc.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, width, height);
      }

      doc.save(`${sanitizeFileName(pdfFile.name)}-annotated.pdf`);
      setStatus(`Exported ${pdfPages.length} annotated page${pdfPages.length === 1 ? "" : "s"}.`);
    } catch (err) {
      console.error("Annotated PDF export failed:", err);
      setError("Could not export the annotated PDF. Try a smaller file.");
      setStatus("");
    } finally {
      setIsExporting(false);
    }
  };

  const exportCurrentPagePng = () => {
    if (!canvasRef.current || !pdfFile) return;
    const link = document.createElement("a");
    link.download = `${sanitizeFileName(pdfFile.name)}-page-${currentPageIdx + 1}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const copySummary = async () => {
    if (!pdfFile) return;
    const success = await safeCopyText(
      buildAnnotationSummary(pdfFile, pdfPages, annotations),
    );
    if (!success) {
      setError("Could not copy the annotation summary in this browser.");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-(--card) border border-(--border) rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 className="block text-(--foreground) text-2xl font-semibold mb-3">PDF Annotation Workspace</h2>
          <p className="text-(--muted-foreground) text-base">Annotate PDFs with pen, highlights, shapes, text, signatures, undo/redo, and all-page PDF export.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!isPdfReady || isLoadingPdf}
          className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity font-semibold disabled:opacity-60"
        >
          {isLoadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isLoadingPdf ? "Loading PDF..." : isPdfReady ? "Upload PDF" : "Loading engine..."}
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" data-testid="pdf-annotation-file-input" onChange={handleFileUpload} className="hidden" />
      </div>

      {(pdfFile || status || error) && (
        <div
          data-testid="tool-output"
          className="rounded-lg border border-(--border) bg-(--card) p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {error ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-(--primary)" />
                )}
                <p className={`font-semibold ${error ? "text-red-600" : "text-(--foreground)"}`}>
                  {error || status || "Ready to annotate"}
                </p>
              </div>
              {pdfFile && (
                <p className="mt-1 truncate text-sm text-(--muted-foreground)">
                  {pdfFile.name} - {formatBytes(pdfFile.size)} - {pdfPages.length} page{pdfPages.length === 1 ? "" : "s"} - {annotations.length} annotation{annotations.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
            {pdfFile && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={resetTool} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {pdfPages.length > 0 && (
        <>
          <div className="bg-(--card) border border-(--border) rounded-lg p-5 flex flex-wrap gap-6 shadow-sm">
            <div className="flex-1 min-w-[300px]">
              <p className="font-medium mb-2 text-sm text-(--muted-foreground) uppercase tracking-wider">Tools</p>
              <div className="flex gap-2 flex-wrap">
                {["pen", "highlight", "rect", "circle", "arrow", "text", "signature", "eraser"].map(t => (
                  <button key={t} onClick={() => setCurrentTool(t)} className={`p-2 rounded-lg border flex items-center gap-1 ${currentTool === t ? 'border-(--primary) bg-(--section-highlight) text-(--primary) shadow-sm' : 'border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)'}`}>
                    {t === 'pen' && <Pen size={18}/>}
                    {t === 'highlight' && <Highlighter size={18}/>}
                    {t === 'rect' && <Square size={18}/>}
                    {t === 'circle' && <Circle size={18}/>}
                    {t === 'arrow' && <ArrowUpRight size={18}/>}
                    {t === 'text' && <Type size={18}/>}
                    {t === 'signature' && <Pen size={18} className="rotate-45"/>}
                    {t === 'eraser' && <Eraser size={18}/>}
                    <span className="capitalize text-[10px] font-bold">{t === 'signature' ? 'Sign' : (t === 'eraser' ? 'Eraser' : '')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RGB COLOR SECTION (New) */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <p className="font-medium mb-2 text-sm text-(--muted-foreground) uppercase tracking-wider">RGB Color</p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg border shadow-sm" style={{backgroundColor: color}}></div>
                 <div className="flex flex-col gap-1 flex-1">
                    <input type="range" min="0" max="255" value={rgb.r} onChange={(e) => setRgb({...rgb, r: parseInt(e.target.value)})} className="h-1 accent-red-500 rounded-lg cursor-pointer"/>
                    <input type="range" min="0" max="255" value={rgb.g} onChange={(e) => setRgb({...rgb, g: parseInt(e.target.value)})} className="h-1 accent-green-500 rounded-lg cursor-pointer"/>
                    <input type="range" min="0" max="255" value={rgb.b} onChange={(e) => setRgb({...rgb, b: parseInt(e.target.value)})} className="h-1 accent-blue-500 rounded-lg cursor-pointer"/>
                 </div>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2 text-sm text-(--muted-foreground) uppercase tracking-wider">History</p>
              <div className="flex gap-2">
                <button onClick={undo} disabled={history.length === 0} className="p-2 border rounded-lg disabled:opacity-30"><Undo2 size={18}/></button>
                <button onClick={redo} disabled={redoStack.length === 0} className="p-2 border rounded-lg disabled:opacity-30"><Redo2 size={18}/></button>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2 ml-auto">
               <button
                 type="button"
                 onClick={clearCurrentPage}
                 disabled={!annotations.some((ann) => ann.pageIndex === currentPageIdx)}
                 className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-100 disabled:opacity-40"
                 title="Clear current page annotations"
               >
                 <Trash2 size={18}/>
               </button>
               <button
                 type="button"
                 onClick={exportCurrentPagePng}
                 className="border border-(--border) bg-(--background) text-(--foreground) px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
               >
                 <FileText size={16}/> PNG
               </button>
               <button
                 type="button"
                 onClick={exportAnnotatedPdf}
                 disabled={isExporting}
                 className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-60"
               >
                 {isExporting ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                 {isExporting ? "Exporting..." : "Export PDF"}
               </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-(--card) border border-(--border) rounded-lg p-4 sticky top-10 shadow-sm h-[600px] overflow-y-auto">
                <h2 className="font-bold text-(--foreground) border-b border-(--border) pb-2 mb-4 uppercase text-xs tracking-widest">Pages</h2>
                <div className="space-y-4">
                  {pdfPages.map((page, idx) => (
                    <div key={idx} onClick={() => setCurrentPageIdx(idx)} className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${currentPageIdx === idx ? 'border-(--primary) shadow-md ring-2 ring-[var(--section-highlight)]' : 'border-(--border) hover:border-(--primary)'}`}>
                      <ManagedImage src={page.thumb} alt={`Page ${idx + 1}`} className="w-full h-auto" />
                      <p className={`text-center text-[10px] py-1 font-bold ${currentPageIdx === idx ? 'bg-(--primary) text-(--primary-foreground)' : 'bg-(--background) text-(--muted-foreground)'}`}>PAGE {idx+1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 bg-(--card) border border-(--border) rounded-lg p-6 overflow-auto min-h-[600px] flex justify-center items-start shadow-sm relative">
              <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="border rounded-lg bg-white shadow-lg cursor-crosshair" />
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button onClick={()=>setZoom(Math.min(2, zoom+0.25))} className="bg-(--card) text-(--foreground) p-3 rounded-full shadow-lg border border-(--border) hover:bg-(--muted)"><ZoomIn size={20}/></button>
                <button onClick={()=>setZoom(Math.max(0.5, zoom-0.25))} className="bg-(--card) text-(--foreground) p-3 rounded-full shadow-lg border border-(--border) hover:bg-(--muted)"><ZoomOut size={20}/></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Signature Modal */}
      {showSigModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold">Create Signature</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {["draw", "type", "upload"].map(mode => (
                <button key={mode} onClick={() => setSigType(mode)} className={`flex-1 py-2 text-sm rounded-lg transition-all ${sigType===mode?'bg-white shadow-sm font-bold text-blue-600':'text-gray-500'}`}>{mode.toUpperCase()}</button>
              ))}
            </div>

            {sigType === "draw" && (
              <canvas ref={sigCanvasRef} width={350} height={150} className="border border-dashed border-gray-300 rounded-xl cursor-crosshair bg-gray-50"
                onMouseDown={(e) => {
                  const rect = sigCanvasRef.current.getBoundingClientRect();
                  const ctx = sigCanvasRef.current.getContext("2d");
                  ctx.lineWidth = 2; ctx.strokeStyle = "#000"; ctx.beginPath();
                  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  setIsSigDrawing(true);
                }}
                onMouseMove={(e) => {
                  if (!isSigDrawing) return;
                  const rect = sigCanvasRef.current.getBoundingClientRect();
                  const ctx = sigCanvasRef.current.getContext("2d");
                  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
                }}
                onMouseUp={() => setIsSigDrawing(false)}
              />
            )}

            {sigType === "type" && (
              <input type="text" placeholder="Your Name" className="w-full border p-4 rounded-xl text-3xl italic font-serif text-center focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => {
                const c = document.createElement("canvas"); c.width=350; c.height=150;
                const ctx = c.getContext("2d"); ctx.font="40px serif"; ctx.textAlign="center"; ctx.fillText(e.target.value, 175, 85);
                sigCanvasRef.current = c;
              }}/>
            )}

            {sigType === "upload" && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input type="file" accept="image/*" onChange={(e) => {
                  const imageFile = e.target.files?.[0];
                  if (!imageFile) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => { addSignatureToCanvas(ev.target.result); };
                  reader.readAsDataURL(imageFile);
                }} className="w-full text-xs"/>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSigModal(false)} className="px-4 py-2 font-medium text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => sigCanvasRef.current && addSignatureToCanvas(sigCanvasRef.current.toDataURL())} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg hover:bg-blue-700 transition-all"><Check size={18}/> Place Signature</button>
            </div>
          </div>
        </div>
      )}

      {/* Text Modal */}
      {textInput.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl space-y-4 w-80 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex items-center justify-between text-sm text-gray-600 border-b pb-2">
              <span className="font-bold">Text Properties</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]">SIZE:</span>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 20)} className="w-12 border rounded px-1 font-mono" />
              </div>
            </div>
            <textarea autoFocus className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={textInput.text} onChange={(e) => setTextInput({ ...textInput, text: e.target.value })} placeholder="Write something..." />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTextInput({ show: false })} className="px-4 py-2 text-gray-500">Cancel</button>
              <button onClick={() => { saveHistory(); setAnnotations([...annotations, { type: "text", pageIndex: currentPageIdx, color, x: textInput.x, y: textInput.y, text: textInput.text, fontSize }]); setTextInput({ show: false }); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold">Add Text</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
