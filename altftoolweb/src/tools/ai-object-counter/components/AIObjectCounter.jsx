"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import { useObjectDetection } from '../../_shared/hooks/useObjectDetection';
import { loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { downloadCanvas, downloadBlob } from '../../_shared/utils/download';

const COCO_COLORS = [
  '#14b8a6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
  '#6366f1', '#d946ef', '#0ea5e9', '#10b981', '#eab308',
];

const CLASS_COLORS = {};

function getClassColor(cls) {
  if (!CLASS_COLORS[cls]) CLASS_COLORS[cls] = COCO_COLORS[Object.keys(CLASS_COLORS).length % COCO_COLORS.length];
  return CLASS_COLORS[cls];
}

export default function AIObjectCounter() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [minConfidence, setMinConfidence] = useState(40);
  const canvasRef = useRef(null);
  const resultCanvasRef = useRef(null);

  const { loading: modelLoading, error: modelError, detections, modelReady, modelLoadingState, loadModel, detect, reset: resetDetection } = useObjectDetection();

  const handleImage = useCallback(async ({ src, file, img }) => {
    setImage({ src, file, img });
    setProcessedImage(null);
    resetDetection();
    if (!modelReady) await loadModel();
  }, [modelReady, loadModel, resetDetection]);

  useEffect(() => {
    if (modelReady && image && !detecting && !detections) runDetection();
  }, [modelReady, image]);

  const runDetection = useCallback(async () => {
    if (!image) return;
    setDetecting(true);
    try {
      const img = await loadImage(image.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvasRef.current = canvas;

      const result = await detect(img, minConfidence / 100);
      if (result) {
        const ctx = canvas.getContext('2d');
        result.detections.forEach(d => {
          const color = getClassColor(d.class);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(d.x, d.y, d.width, d.height);
          ctx.fillStyle = color;
          const label = `${d.class} ${d.score}%`;
          const metrics = ctx.measureText(label);
          ctx.fillRect(d.x, d.y - 24, metrics.width + 10, 24);
          ctx.fillStyle = '#fff';
          ctx.font = '12px system-ui';
          ctx.fillText(label, d.x + 5, d.y - 7);
        });
        setProcessedImage(canvas.toDataURL());
        resultCanvasRef.current = canvas;
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setDetecting(false);
    }
  }, [image, detect, minConfidence]);

  const handleDownload = async () => {
    if (!resultCanvasRef.current) return;
    const blob = await getCanvasBlob(resultCanvasRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'object-detection.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!detections) return;
    const blob = new Blob([JSON.stringify(detections, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'object-detection.json');
  };

  const exportCSV = () => {
    if (!detections) return;
    const rows = [['Object', 'Count', 'Avg Confidence']];
    detections.categories.forEach(c => rows.push([c.name, c.count, `${c.avgConfidence}%`]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'object-detection.csv');
  };

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">AI Object Counter</h1>
          <p className="text-sm text-muted-foreground">Upload an image to detect and count objects using TensorFlow.js COCO-SSD</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">AI Object Counter</h1>
        <div className="flex gap-2">
          {detections && (
            <>
              <button onClick={handleDownload} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md">Download Image</button>
              <button onClick={exportJSON} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] text-muted-foreground">Export JSON</button>
              <button onClick={exportCSV} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] text-muted-foreground">Export CSV</button>
            </>
          )}
          <button onClick={() => { setImage(null); setProcessedImage(null); resetDetection(); }} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] text-muted-foreground">New Image</button>
        </div>
      </div>

      {(modelLoadingState || detecting) && <SkeletonLoader lines={4} />}
      {modelError && <ErrorCard message={modelError} onRetry={loadModel} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-black/5 dark:bg-white/5">
            <img src={processedImage || image.src} alt="Detection" className="w-full object-contain" />
          </div>

          {detections && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Min Confidence: {minConfidence}%</span>
              <input type="range" min="10" max="90" step="5" value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]" />
              <button onClick={runDetection} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md">Re-detect</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {detections ? (
            <>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center">
                <div className="text-4xl font-bold text-[var(--primary)]">{detections.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Objects Detected</p>
                <p className="text-xs text-muted-foreground mt-1">in {detections.detectionTime}ms</p>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
                <h3 className="text-sm font-medium text-foreground">Categories</h3>
                {detections.categories.length === 0 && <p className="text-xs text-muted-foreground">No objects detected at current confidence level</p>}
                {detections.categories.map((cat, i) => {
                  const color = getClassColor(cat.name);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                          {cat.name}
                        </span>
                        <span className="text-muted-foreground">{cat.count} × {cat.avgConfidence}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.avgConfidence}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4 space-y-2 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-medium text-foreground">All Detections</h3>
                {detections.detections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: getClassColor(d.class) }} />
                      <span className="text-xs text-foreground capitalize">{d.class}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{d.score}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : modelLoadingState ? null : (
            <div className="rounded-xl border border-[var(--border)] p-8 text-center">
              <div className="w-10 h-10 mx-auto border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground mt-3">Loading model and detecting objects...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment on first load</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
