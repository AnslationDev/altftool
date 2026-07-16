"use client";

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import { loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { downloadBlob, downloadCanvas } from '../../_shared/utils/download';
import { detectBlur, computeEdgeDensity, computeBlurHeatmap, analyzeSharpness } from '../../_shared/utils/imageAnalysis';

function ScoreGauge({ value, label, color, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((100 - value) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || 'var(--primary)'} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="text-lg font-bold text-foreground" style={{ marginTop: -size / 2 - 2 }}>{value}%</span>
      {label && <span className="text-xs text-muted-foreground -mt-1">{label}</span>}
    </div>
  );
}

export default function BlurDetector() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapDataUrl, setHeatmapDataUrl] = useState(null);
  const canvasRef = useRef(null);

  const handleImage = useCallback(async ({ src, file, img }) => {
    setImage({ src, file, img });
    setAnalysis(null);
    setError(null);
    setHeatmapDataUrl(null);
    setAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;

      await new Promise(r => setTimeout(r, 50));
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blurResult = detectBlur(imageData);
      const edges = computeEdgeDensity(imageData);
      setAnalysis({ ...blurResult, edgeDensity: edges.density });

      const heat = computeBlurHeatmap(imageData);
      const hCanvas = document.createElement('canvas');
      hCanvas.width = canvas.width;
      hCanvas.height = canvas.height;
      const hCtx = hCanvas.getContext('2d');
      hCtx.drawImage(canvas, 0, 0);
      for (const block of heat.heatmap) {
        const alpha = Math.round((100 - block.value) / 100 * 0.5 * 255);
        hCtx.fillStyle = `rgba(255, 0, 0, ${(100 - block.value) / 100 * 0.5})`;
        hCtx.fillRect(block.x, block.y, block.w, block.h);
      }
      setHeatmapDataUrl(hCanvas.toDataURL());
    } catch (err) {
      setError('Blur analysis failed. Please try another image.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const getBlurColor = (score) => {
    if (score > 70) return '#22c55e';
    if (score > 40) return '#f59e0b';
    return '#ef4444';
  };

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Blur Detector</h1>
          <p className="text-sm text-muted-foreground">Upload an image to detect motion blur, lens blur, and out-of-focus regions</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Blur Detector</h1>
        <button onClick={() => { setImage(null); setAnalysis(null); setHeatmapDataUrl(null); }} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New Image</button>
      </div>

      {error && <ErrorCard message={error} />}
      {analyzing && <SkeletonLoader lines={4} />}

      {analysis && !analyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <img src={showHeatmap && heatmapDataUrl ? heatmapDataUrl : image.src} alt="Analysis" className="w-full object-contain" style={{ maxHeight: 400 }} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowHeatmap(!showHeatmap)} className={`px-4 py-2 rounded-lg text-sm border transition-colors ${showHeatmap ? 'bg-[var(--anslation-ds-primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-soft)]'}`}>
                {showHeatmap ? 'Original View' : 'Blur Heatmap'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-4 text-center">
                <ScoreGauge value={analysis.blurScore} label="Blur Level" color={getBlurColor(100 - analysis.blurScore)} />
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center">
                <ScoreGauge value={analysis.sharpnessScore} label="Sharpness" color={getBlurColor(analysis.sharpnessScore)} />
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 text-center">
                <ScoreGauge value={analysis.focusConfidence} label="Focus" color={getBlurColor(analysis.focusConfidence)} />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground">Analysis Details</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-muted-foreground">Blur Type:</span>
                <span className="text-foreground font-medium">{analysis.blurType}</span>
                <span className="text-muted-foreground">Blur Percentage:</span>
                <span className="text-foreground font-medium">{analysis.blurPercentage}%</span>
                <span className="text-muted-foreground">Edge Density:</span>
                <span className="text-foreground font-medium">{analysis.edgeDensity}%</span>
                <span className="text-muted-foreground">Focus Area:</span>
                <span className="text-foreground font-medium">{analysis.focusArea}%</span>
                <span className="text-muted-foreground">Focus Confidence:</span>
                <span className="text-foreground font-medium">{analysis.focusConfidence}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">AI Suggestions</h3>
              {analysis.blurScore > 50 && (
                <ul className="space-y-1">
                  {analysis.blurType.includes('Motion') && <li className="text-xs text-muted-foreground">→ Use a faster shutter speed or tripod to reduce motion blur</li>}
                  {analysis.blurType.includes('Lens') || analysis.blurType.includes('Focus') ? <li className="text-xs text-muted-foreground">→ Improve focus accuracy — use autofocus or manual focus assist</li> : null}
                  {analysis.blurScore > 70 && <li className="text-xs text-muted-foreground">→ Increase lighting to allow faster shutter speeds and lower ISO</li>}
                  {analysis.blurScore > 60 && <li className="text-xs text-muted-foreground">→ Use a smaller aperture (higher f-stop) for greater depth of field</li>}
                  <li className="text-xs text-muted-foreground">→ Stabilize camera with both hands or use a tripod for sharper results</li>
                </ul>
              )}
              {analysis.blurScore <= 50 && (
                <p className="text-xs text-green-600 dark:text-green-400">✓ Image is acceptably sharp — no major blur issues detected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
