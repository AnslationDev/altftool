"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Pen, Highlighter, Type, Download, Trash2, ZoomIn, ZoomOut, FileText,
  Square, Circle, ArrowUpRight, Check, Undo2, Redo2, Eraser
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function MainComponent() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]); 
  const [currentPageIdx, setCurrentPageIdx] = useState(0); 
  const [currentTool, setCurrentTool] = useState("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  
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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
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

    annotations.forEach((ann) => {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3;

      if (ann.type === "pen") {
        ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath();
        ann.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (ann.type === "highlight") {
        ctx.globalAlpha = 0.4;
        ctx.fillRect(Math.min(ann.x, ann.x + ann.width), Math.min(ann.y, ann.y + ann.height), Math.abs(ann.width), Math.abs(ann.height));
      }
      if (ann.type === "rect") ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      if (ann.type === "circle") {
        ctx.beginPath(); const radius = Math.sqrt(ann.width ** 2 + ann.height ** 2);
        ctx.arc(ann.x, ann.y, radius, 0, 2 * Math.PI); ctx.stroke();
      }
      if (ann.type === "arrow") {
        const headlen = 15; const dx = ann.width; const dy = ann.height; const angle = Math.atan2(dy, dx);
        ctx.beginPath(); ctx.moveTo(ann.x, ann.y); ctx.lineTo(ann.x + dx, ann.y + dy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ann.x + dx, ann.y + dy);
        ctx.lineTo(ann.x + dx - headlen * Math.cos(angle - Math.PI / 6), ann.y + dy - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ann.x + dx - headlen * Math.cos(angle + Math.PI / 6), ann.y + dy - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fill();
      }
      if (ann.type === "text") {
        ctx.font = `${ann.fontSize || 20}px sans-serif`;
        ctx.fillText(ann.text, ann.x, ann.y);
      }
      if (ann.type === "signature") {
        const img = new Image(); img.src = ann.data;
        ctx.drawImage(img, ann.x, ann.y, ann.width || 150, ann.height || 60);
      }
      ctx.restore();
    });
  }, [pdfPages, currentPageIdx, annotations, zoom]);

  useEffect(() => { if (pdfPages.length > 0) redrawCanvas(); }, [pdfPages, currentPageIdx, annotations, zoom, redrawCanvas]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result);
      const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
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
      setPdfPages(pagesArray); setCurrentPageIdx(0); setAnnotations([]); setHistory([]); setZoom(1);
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
        if (ann.type === "pen") return !ann.points.some(p => Math.hypot(p.x - x, p.y - y) < 10);
        return !(x >= ann.x && x <= ann.x + (ann.width || 100) && y >= ann.y && y <= ann.y + (ann.height || 50));
      }));
      return;
    }

    const hitIndex = annotations.findIndex(ann => {
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
    const newAnn = { type: currentTool, color, x, y, width: 0, height: 0, points: currentTool === "pen" ? [{ x, y }] : [] };
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
      type: "signature", x: textInput.x, y: textInput.y, data, width: 150, height: 60 
    }]);
    setShowSigModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-(--card) border border-(--border) rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <h1 className="block text-(--foreground) text-2xl font-semibold mb-3">PDF Annotation Tool</h1>
          <p className="text-(--muted-foreground) text-xl">Full feature tool with RGB Color, Eraser, Undo/Redo.</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold">
          <Upload size={16} /> Upload PDF
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
      </div>

      {pdfPages.length > 0 && (
        <>
          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 flex flex-wrap gap-6 shadow-sm">
            <div className="flex-1 min-w-[300px]">
              <p className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wider">Tools</p>
              <div className="flex gap-2 flex-wrap">
                {["pen", "highlight", "rect", "circle", "arrow", "text", "signature", "eraser"].map(t => (
                  <button key={t} onClick={() => setCurrentTool(t)} className={`p-2 rounded-lg border flex items-center gap-1 ${currentTool === t ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
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
              <p className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wider">RGB Color</p>
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
              <p className="font-medium mb-2 text-sm text-gray-500 uppercase tracking-wider">History</p>
              <div className="flex gap-2">
                <button onClick={undo} disabled={history.length === 0} className="p-2 border rounded-lg disabled:opacity-30"><Undo2 size={18}/></button>
                <button onClick={redo} disabled={redoStack.length === 0} className="p-2 border rounded-lg disabled:opacity-30"><Redo2 size={18}/></button>
              </div>
            </div>

            <div className="flex items-end gap-2 ml-auto">
               <button onClick={() => { if(confirm("Clear all?")) setAnnotations([]); }} className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-100"><Trash2 size={18}/></button>
               <button onClick={() => { const link = document.createElement("a"); link.download=`page-${currentPageIdx+1}.png`; link.href=canvasRef.current.toDataURL(); link.click(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"><Download size={16}/> Export</button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-10 shadow-sm h-[600px] overflow-y-auto">
                <h2 className="font-bold text-gray-800 border-b pb-2 mb-4 uppercase text-xs tracking-widest">Pages</h2>
                <div className="space-y-4">
                  {pdfPages.map((page, idx) => (
                    <div key={idx} onClick={() => setCurrentPageIdx(idx)} className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${currentPageIdx === idx ? 'border-blue-600 shadow-md ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <ManagedImage src={page.thumb} className="w-full h-auto" />
                      <p className={`text-center text-[10px] py-1 font-bold ${currentPageIdx === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>PAGE {idx+1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 bg-(--card) border border-(--border) rounded-2xl p-6 overflow-auto min-h-[600px] flex justify-center items-start shadow-sm bg-gray-50/30 relative">
              <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="border rounded-lg bg-white shadow-lg cursor-crosshair" />
              <div className="fixed bottom-10 right-10 flex flex-col gap-2">
                <button onClick={()=>setZoom(Math.min(2, zoom+0.25))} className="bg-white p-3 rounded-full shadow-lg border hover:bg-gray-50"><ZoomIn size={20}/></button>
                <button onClick={()=>setZoom(Math.max(0.5, zoom-0.25))} className="bg-white p-3 rounded-full shadow-lg border hover:bg-gray-50"><ZoomOut size={20}/></button>
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
                  const reader = new FileReader();
                  reader.onload = (ev) => { addSignatureToCanvas(ev.target.result); };
                  reader.readAsDataURL(e.target.files[0]);
                }} className="w-full text-xs"/>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSigModal(false)} className="px-4 py-2 font-medium text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => addSignatureToCanvas(sigCanvasRef.current.toDataURL())} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg hover:bg-blue-700 transition-all"><Check size={18}/> Place Signature</button>
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
              <button onClick={() => { saveHistory(); setAnnotations([...annotations, { type: "text", color, x: textInput.x, y: textInput.y, text: textInput.text, fontSize }]); setTextInput({ show: false }); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold">Add Text</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
