"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import ImageEditor from '../../_shared/components/ImageEditor';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import BeforeAfterSlider from '../../_shared/components/BeforeAfterSlider';
import FaceSelector from '../../_shared/components/FaceSelector';
import { useFaceDetection } from '../../_shared/hooks/useFaceDetection';
import { shareImage } from '../../_shared/utils/download';
import { compressImage, loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { createHiResCanvas, exportCanvas } from '../../_shared/render/exportEngine';
import { HAIR_STYLES, HAIR_COLORS, renderHairStyle } from '../utils/hairStyles';

const STYLE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'none', label: 'Bald' },
];

export default function HairstyleTool() {
  const [image, setImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('buzz-cut');
  const [selectedColor, setSelectedColor] = useState(HAIR_COLORS[0]);
  const [category, setCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [resultCanvas, setResultCanvas] = useState(null);
  const [showSlider, setShowSlider] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFace, setSelectedFace] = useState(0);
  const [adjustments, setAdjustments] = useState({
    scale: 100, rotation: 180, opacity: 100,
    thickness: 50, density: 50, length: 100,
    brightness: 100, contrast: 100,
    volume: 50, shine: 50,
  });

  const canvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  const { loading: faceLoading, error: faceError, faceData, faces, modelsReady, loadModels, detectFace, reset: resetFace } = useFaceDetection();
  const [processing, setProcessing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const handleImage = useCallback(async ({ src, file, img }) => {
    setImage({ src, file, img });
    setResultCanvas(null);
    setShowSlider(false);
    resetFace();
    if (!modelsReady) await loadModels();
  }, [modelsReady, loadModels, resetFace]);

  const handleEditorApply = useCallback((editedCanvas) => {
    processedCanvasRef.current = editedCanvas;
    editedCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setImage(prev => ({ ...prev, src: url }));
    });
    setShowEditor(false);
  }, []);

  const applyPreview = useCallback(async () => {
    if (!image || !faceData) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      if (faceData) {
        renderHairStyle(ctx, selectedStyle, faceData, {
          color: selectedColor.value,
          ...adjustments,
        });
      }

      canvasRef.current = canvas;
      setResultCanvas(canvas);
      setShowSlider(true);
      setPreviewKey(k => k + 1);
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setProcessing(false);
    }
  }, [image, faceData, selectedStyle, selectedColor, adjustments]);

  useEffect(() => {
    if (image && faceData) applyPreview();
  }, [selectedStyle, selectedColor, adjustments, image, faceData]);

  const handleDetect = useCallback(async (faceIndex = selectedFace) => {
    if (!image) return;
    const img = await loadImage(image.src);
    await detectFace(img, { faceIndex });
  }, [image, detectFace, selectedFace]);

  const handleSelectFace = useCallback(async (index) => {
    setSelectedFace(index);
    if (!image) return;
    const img = await loadImage(image.src);
    await detectFace(img, { faceIndex: index });
  }, [image, detectFace]);

  useEffect(() => {
    if (image && modelsReady && !faceData && !faceLoading && !faces) handleDetect(-1);
  }, [image, modelsReady]);

  const handleDownload = async (type = 'png') => {
    if (!resultCanvas) return;
    setDownloading(true);
    try {
      const scale = pickScale(resultCanvas.width, resultCanvas.height, 3840, Math.min(2, window.devicePixelRatio || 1));
      const hiRes = scale > 1 ? createHiResCanvas(resultCanvas, scale) : resultCanvas;
      const mimeType = type === 'jpg' ? 'image/jpeg' : 'image/png';
      const blob = await getCanvasBlob(hiRes, mimeType, 0.95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hairstyle-preview.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!resultCanvas) return;
    const blob = await getCanvasBlob(resultCanvas);
    await shareImage(blob, 'My Hairstyle Preview!');
  };

  const updateAdjustment = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const filteredStyles = category === 'all' ? HAIR_STYLES : HAIR_STYLES.filter(s => s.category === category);

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Hair Style Preview</h1>
          <p className="text-sm text-muted-foreground">Upload a photo to try on different hairstyles with AI-powered face detection</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hair Style Preview</h1>
          <p className="text-sm text-muted-foreground">Drag to adjust, click to change style</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setImage(null); setResultCanvas(null); setShowSlider(false); resetFace(); }} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New Photo</button>
          <button onClick={() => setShowEditor(true)} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Edit Image</button>
        </div>
      </div>

      {faceLoading && <SkeletonLoader lines={3} />}
      {faceError && <ErrorCard message={faceError} onRetry={handleDetect} />}

      {showEditor && processedCanvasRef.current ? (
        <ImageEditor canvas={processedCanvasRef.current} onApply={handleEditorApply} onCancel={() => setShowEditor(false)} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5" style={{ minHeight: 400 }}>
            {image ? (
              faces && faces.length > 1 && !faceData ? (
                <FaceSelector faces={faces} imageSrc={image.src} onSelect={handleSelectFace} />
              ) : showSlider && resultCanvas ? (
                <BeforeAfterSlider key={previewKey} beforeImage={image.src} afterCanvas={resultCanvas} className="w-full" style={{ maxHeight: 500 }} />
              ) : (
                <img src={image.src} alt="Uploaded" className="w-full h-full object-contain" style={{ maxHeight: 500 }} />
              )
            ) : null}
            {processing && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-card rounded-xl p-4 shadow-lg flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-foreground">Applying hairstyle...</span>
                </div>
              </div>
            )}
          </div>

          {resultCanvas && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleDownload('png')} disabled={downloading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PNG
              </button>
              <button onClick={() => handleDownload('jpg')} className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-sm text-muted-foreground">Download JPG</button>
              <button onClick={handleShare} className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-sm text-muted-foreground">Share</button>
              <button onClick={() => setShowSlider(s => !s)} className={`px-4 py-2 rounded-lg border text-sm transition-colors ${showSlider ? 'bg-[var(--anslation-ds-primary-soft)] border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-muted-foreground hover:bg-[var(--anslation-ds-soft)]'}`}>
                Before / After
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat.id ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--anslation-ds-soft)] text-muted-foreground hover:bg-[var(--anslation-ds-primary-soft)]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-2 max-h-80 overflow-y-auto">
            <h3 className="text-sm font-medium text-foreground mb-2">Styles</h3>
            {filteredStyles.map(style => (
              <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedStyle === style.id ? 'bg-[var(--anslation-ds-primary-soft)] border border-[var(--primary)] text-[var(--primary)]' : 'text-muted-foreground hover:bg-[var(--anslation-ds-soft)]'}`}>
                {style.name}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Hair Color</h3>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.slice(0, 8).map(c => (
                <button key={c.name} onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor.name === c.name ? 'border-[var(--primary)] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c.value }} title={c.name} aria-label={c.name} />
              ))}
            </div>
            {HAIR_COLORS.length > 8 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">More colors</summary>
                <div className="flex flex-wrap gap-2 mt-2">
                  {HAIR_COLORS.slice(8).map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor.name === c.name ? 'border-[var(--primary)] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ background: c.value }} title={c.name} aria-label={c.name} />
                  ))}
                </div>
              </details>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Adjustments</h3>
            {[
              { key: 'scale', label: 'Scale', min: 50, max: 150 },
              { key: 'rotation', label: 'Rotation', min: 0, max: 360 },
              { key: 'opacity', label: 'Opacity', min: 0, max: 100 },
              { key: 'thickness', label: 'Thickness', min: 10, max: 100 },
              { key: 'density', label: 'Density', min: 10, max: 100 },
              { key: 'length', label: 'Length', min: 10, max: 200 },
            ].map(({ key, label, min, max }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{adjustments[key]}</span></div>
                <input type="range" min={min} max={max} value={adjustments[key]} onChange={(e) => updateAdjustment(key, Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:shadow-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
