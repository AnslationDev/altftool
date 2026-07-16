"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import BeforeAfterSlider from '../../_shared/components/BeforeAfterSlider';
import { getCanvasBlob, loadImage } from '../../_shared/utils/imageProcessing';
import { downloadCanvas, downloadBlob } from '../../_shared/utils/download';

export default function BeforeAfterComparator() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [mode, setMode] = useState('slider');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [splitPos, setSplitPos] = useState(50);
  const [opacity, setOpacity] = useState(50);
  const resultCanvasRef = useRef(null);

  const handleBefore = useCallback(({ src }) => setBeforeImage({ src }), []);
  const handleAfter = useCallback(({ src }) => setAfterImage({ src }), []);

  const analyzeDiff = useCallback(async () => {
    if (!beforeImage || !afterImage) return;
    const before = await loadImage(beforeImage.src);
    const after = await loadImage(afterImage.src);
    setAnalysis({
      resolutionBefore: `${before.naturalWidth}x${before.naturalHeight}`,
      resolutionAfter: `${after.naturalWidth}x${after.naturalHeight}`,
      sizeBefore: beforeImage.src.length > 100 ? 'Loaded' : 'Unknown',
      sizeAfter: afterImage.src.length > 100 ? 'Loaded' : 'Unknown',
      resolutionMatch: before.naturalWidth === after.naturalWidth && before.naturalHeight === after.naturalHeight,
    });
    setShowAnalysis(true);
  }, [beforeImage, afterImage]);

  const exportComparison = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const before = await loadImage(beforeImage.src);
    const after = await loadImage(afterImage.src);
    const w = Math.max(before.naturalWidth, after.naturalWidth);
    const h = Math.max(before.naturalHeight, after.naturalHeight);
    canvas.width = w * 2;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(before, 0, 0, w, h);
    ctx.drawImage(after, w, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, h - 24, 60, 24);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Before', 4, h - 8);
    ctx.fillRect(w, h - 24, 55, 24);
    ctx.fillText('After', w + 4, h - 8);
    resultCanvasRef.current = canvas;
    const blob = await getCanvasBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'before-after-comparison.png';
    a.click();
    URL.revokeObjectURL(url);
  }, [beforeImage, afterImage]);

  if (!beforeImage || !afterImage) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Before vs After Comparator</h1>
          <p className="text-sm text-muted-foreground">Upload two images to compare them side by side with professional comparison tools</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 text-center">Before</h3>
            <ImageUploader onImage={handleBefore} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 text-center">After</h3>
            <ImageUploader onImage={handleAfter} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Before vs After Comparator</h1>
        <div className="flex flex-wrap gap-2">
          {['slider', 'side-by-side', 'fade'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${mode === m ? 'bg-[var(--primary)] text-white shadow-md' : 'border border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-soft)]'}`}>
              {m.replace('-', ' ')}
            </button>
          ))}
          <button onClick={() => { setBeforeImage(null); setAfterImage(null); setShowAnalysis(false); setAnalysis(null); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New</button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-black/5 dark:bg-white/5" style={{ minHeight: 400 }}>
        {mode === 'slider' && <BeforeAfterSlider beforeImage={beforeImage.src} afterCanvas={{ toDataURL: () => afterImage.src }} />}
        {mode === 'side-by-side' && (
          <div className="grid grid-cols-2">
            <div className="border-r border-[var(--border)]"><img src={beforeImage.src} alt="Before" className="w-full h-full object-contain" /></div>
            <div><img src={afterImage.src} alt="After" className="w-full h-full object-contain" /></div>
          </div>
        )}
        {mode === 'fade' && (
          <div className="relative">
            <img src={beforeImage.src} alt="Before" className="w-full object-contain" />
            <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
              <img src={afterImage.src} alt="After" className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48">
              <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={analyzeDiff} className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md">Analyze Differences</button>
        <button onClick={exportComparison} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Export Comparison</button>
      </div>

      {mode === 'fade' && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Fade</span>
          <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]" />
        </div>
      )}

      {showAnalysis && analysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Comparison Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div><span className="text-muted-foreground">Before Resolution:</span><p className="text-foreground font-medium">{analysis.resolutionBefore}</p></div>
            <div><span className="text-muted-foreground">After Resolution:</span><p className="text-foreground font-medium">{analysis.resolutionAfter}</p></div>
            <div><span className="text-muted-foreground">Resolution Match:</span>
              <p className={`font-medium ${analysis.resolutionMatch ? 'text-green-600' : 'text-amber-600'}`}>{analysis.resolutionMatch ? '✓ Match' : '✗ Different'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
