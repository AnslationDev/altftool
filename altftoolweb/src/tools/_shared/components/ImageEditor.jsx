"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { rotateCanvas, flipCanvas, applyCanvasFilters } from '../utils/imageProcessing';

export default function ImageEditor({ canvas, onApply, onCancel }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef(null);
  const cropStartRef = useRef(null);

  const previewCanvas = useRef(null);

  const updatePreview = useCallback(() => {
    if (!previewCanvas.current || !canvas) return;
    const ctx = previewCanvas.current.getContext('2d');
    let src = canvas;
    if (rotation) src = rotateCanvas(src, rotation);
    if (flipH || flipV) src = flipCanvas(src, flipH);
    src = applyCanvasFilters(src, { brightness, contrast });
    const pc = previewCanvas.current;
    pc.width = src.width;
    pc.height = src.height;
    const ctx2 = pc.getContext('2d');
    const z = zoom;
    const dw = pc.width * z;
    const dh = pc.height * z;
    ctx2.drawImage(src, (pc.width - dw) / 2, (pc.height - dh) / 2, dw, dh);
  }, [canvas, rotation, flipH, flipV, brightness, contrast, zoom]);

  useEffect(() => { updatePreview(); }, [updatePreview]);

  const handleApply = () => {
    let result = canvas;
    if (rotation) result = rotateCanvas(result, rotation);
    if (flipH || flipV) result = flipCanvas(result, flipH);
    result = applyCanvasFilters(result, { brightness, contrast });
    if (cropBox && cropBox.width > 10 && cropBox.height > 10) {
      const c = document.createElement('canvas');
      c.width = cropBox.width;
      c.height = cropBox.height;
      c.getContext('2d').drawImage(result, cropBox.x, cropBox.y, cropBox.width, cropBox.height, 0, 0, cropBox.width, cropBox.height);
      result = c;
    }
    onApply(result);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setCropBox(null);
  };

  const handleCropStart = (e) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    cropStartRef.current = { x, y };
  };

  const handleCropMove = (e) => {
    if (!isDragging || !cropStartRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, (e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.max(0, (e.clientY - rect.top) * (canvas.height / rect.height));
    setCropBox({
      x: Math.min(cropStartRef.current.x, x),
      y: Math.min(cropStartRef.current.y, y),
      width: Math.abs(x - cropStartRef.current.x),
      height: Math.abs(y - cropStartRef.current.y),
    });
  };

  const handleCropEnd = () => {
    setIsDragging(false);
  };

  const sliderClass = "w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[var(--border)]" style={{ height: Math.min(canvas ? canvas.height : 400, 400) }}>
        <canvas ref={previewCanvas} className="w-full h-full object-contain" style={{ maxHeight: 400 }} />
        {cropMode && (
          <div
            ref={previewRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleCropStart}
            onMouseMove={handleCropMove}
            onMouseUp={handleCropEnd}
            onMouseLeave={handleCropEnd}
          >
            {cropBox && (
              <div className="absolute border-2 border-[var(--primary)] bg-[var(--primary)]/10 pointer-events-none" style={{ left: `${(cropBox.x / canvas.width) * 100}%`, top: `${(cropBox.y / canvas.height) * 100}%`, width: `${(cropBox.width / canvas.width) * 100}%`, height: `${(cropBox.height / canvas.height) * 100}%` }} />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onClick={() => setRotation(r => (r + 90) % 360)} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-primary-soft)] transition-colors text-xs text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Rotate
        </button>
        <button onClick={() => setFlipH(f => !f)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-xs ${flipH ? 'bg-[var(--anslation-ds-primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-primary-soft)]'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Flip H
        </button>
        <button onClick={() => setFlipV(f => !f)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-xs ${flipV ? 'bg-[var(--anslation-ds-primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-primary-soft)]'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" /></svg>
          Flip V
        </button>
        <button onClick={() => setCropMode(c => !c)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-xs ${cropMode ? 'bg-[var(--anslation-ds-primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-primary-soft)]'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 2L2 6l4 4M2 6h16v16" /></svg>
          Crop
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Brightness</span><span>{brightness}%</span></div>
          <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className={sliderClass} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Contrast</span><span>{contrast}%</span></div>
          <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className={sliderClass} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Zoom</span><span>{zoom.toFixed(1)}x</span></div>
          <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className={sliderClass} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={handleReset} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Reset</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Cancel</button>
        <button onClick={handleApply} className="px-6 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md">Apply</button>
      </div>
    </motion.div>
  );
}
