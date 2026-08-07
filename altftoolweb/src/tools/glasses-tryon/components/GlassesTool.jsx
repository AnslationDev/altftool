"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import ImageEditor from '../../_shared/components/ImageEditor';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import BeforeAfterSlider from '../../_shared/components/BeforeAfterSlider';
import FaceSelector from '../../_shared/components/FaceSelector';
import { useFaceDetection } from '../../_shared/hooks/useFaceDetection';
import { shareImage } from '../../_shared/utils/download';
import { loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { createHiResCanvas, pickScale } from '../../_shared/render/exportEngine';
import { GLASSES_STYLES, LENS_COLORS, FRAME_COLORS, renderGlasses } from '../utils/glassesStyles';

const STYLE_CATEGORIES = [
  { id: 'all', label: 'All' }, { id: 'classic', label: 'Classic' },
  { id: 'retro', label: 'Retro' }, { id: 'fashion', label: 'Fashion' },
  { id: 'minimal', label: 'Minimal' }, { id: 'sport', label: 'Sports' },
  { id: 'sun', label: 'Sunglasses' },
];

// Only revoke URLs we actually created (blob: URLs from uploads/edits); a
// data: URL (e.g. from paste or camera capture) is never ours to revoke.
function revokeIfBlobUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export default function GlassesTool() {
  const [image, setImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('wayfarer');
  const [selectedFrameColor, setSelectedFrameColor] = useState(FRAME_COLORS[0]);
  const [selectedLensColor, setSelectedLensColor] = useState(LENS_COLORS[0]);
  const [category, setCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [resultCanvas, setResultCanvas] = useState(null);
  const [showSlider, setShowSlider] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFace, setSelectedFace] = useState(0);
  const [editorCanvas, setEditorCanvas] = useState(null);
  const [adjustments, setAdjustments] = useState({
    scale: 100, frameWidth: 50, height: 50, rotation: 180,
    lensTransparency: 50, bridgeWidth: 50, reflection: 50,
  });

  const canvasRef = useRef(null);
  const { loading: faceLoading, error: faceError, faceData, faces, modelsReady, loadModels, detectFace, reset: resetFace } = useFaceDetection();
  const [processing, setProcessing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const previewGenerationRef = useRef(0);
  const imageSrcRef = useRef(null);

  // Multi-face detection surfaces the FaceSelector UI via the shared hook's
  // internal 'MULTIPLE_FACES' sentinel; it is not a user-facing error message.
  const displayFaceError = faceError === 'MULTIPLE_FACES' ? null : faceError;

  const handleImage = useCallback(async ({ src, file, img }) => {
    revokeIfBlobUrl(imageSrcRef.current);
    imageSrcRef.current = src;
    setImage({ src, file, img });
    setResultCanvas(null);
    setShowSlider(false);
    setEditorCanvas(null);
    resetFace();
    if (!modelsReady) await loadModels();
  }, [modelsReady, loadModels, resetFace]);

  const handleEditorApply = useCallback((editedCanvas) => {
    setEditorCanvas(editedCanvas);
    editedCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      revokeIfBlobUrl(imageSrcRef.current);
      imageSrcRef.current = url;
      setImage(prev => ({ ...prev, src: url }));
    });
    setShowEditor(false);
  }, []);

  const handleOpenEditor = useCallback(async () => {
    if (!image) return;
    const source = await loadImage(image.src);
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext('2d').drawImage(source, 0, 0);
    setEditorCanvas(canvas);
    setShowEditor(true);
  }, [image]);

  const applyPreview = useCallback(async () => {
    if (!image || !faceData) return;
    const generation = ++previewGenerationRef.current;
    setProcessing(true);
    try {
      const img = await loadImage(image.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      renderGlasses(ctx, selectedStyle, faceData, {
        frameColor: selectedFrameColor.value || '#1a1a1a',
        lensColor: selectedLensColor.value,
        ...adjustments,
      });

      // Last-dispatched-wins: discard this result if a newer applyPreview call
      // has started since (e.g. from a rapid slider drag), so the canvas never
      // regresses to a stale adjustment value.
      if (generation !== previewGenerationRef.current) return;

      canvasRef.current = canvas;
      setResultCanvas(canvas);
      setShowSlider(true);
      setPreviewKey(k => k + 1);
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      if (generation === previewGenerationRef.current) setProcessing(false);
    }
  }, [image, faceData, selectedStyle, selectedFrameColor, selectedLensColor, adjustments]);

  useEffect(() => {
    if (image && faceData) applyPreview();
  }, [selectedStyle, selectedFrameColor, selectedLensColor, adjustments, image, faceData]);

  const handleDetect = useCallback(async (faceIndex = selectedFace) => {
    if (!image) return;
    // ErrorCard's "Try Again" button calls onRetry(clickEvent) directly, so a
    // stray SyntheticEvent can arrive here instead of a face index — guard
    // against anything non-numeric rather than letting it silently coerce.
    const idx = typeof faceIndex === 'number' ? faceIndex : -1;
    const img = await loadImage(image.src);
    await detectFace(img, { faceIndex: idx });
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
      // minDpr is intentionally 1: pickScale's minDpr floor forces an
      // already-large photo (fit <= 1) up to that floor even when no
      // upscaling is warranted. Passing 1 keeps the retina-upscale behavior
      // for small photos (fit > 1 already exceeds a floor of 1) while
      // letting large photos resolve to a neutral 1x instead of forced 2x.
      const scale = pickScale(resultCanvas.width, resultCanvas.height, 3840, 1);
      const hiRes = scale > 1 ? createHiResCanvas(resultCanvas, scale) : resultCanvas;
      const mimeType = type === 'jpg' ? 'image/jpeg' : 'image/png';
      const blob = await getCanvasBlob(hiRes, mimeType, 0.95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glasses-tryon.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!resultCanvas) return;
    const blob = await getCanvasBlob(resultCanvas);
    await shareImage(blob, 'My Glasses Try-on!');
  };

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Glasses Try-on</h1>
          <p className="text-sm text-muted-foreground">Upload a photo to try on different glasses styles with AI-powered eye detection</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Glasses Try-on</h1>
          <p className="text-sm text-muted-foreground">Try different glasses with AI-powered placement</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { revokeIfBlobUrl(imageSrcRef.current); imageSrcRef.current = null; setImage(null); setResultCanvas(null); setShowSlider(false); setEditorCanvas(null); resetFace(); }} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New Photo</button>
          <button onClick={handleOpenEditor} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Edit Image</button>
        </div>
      </div>

      {faceLoading && <SkeletonLoader lines={3} />}
      {displayFaceError && <ErrorCard message={displayFaceError} onRetry={handleDetect} />}

      {showEditor && editorCanvas ? (
        <ImageEditor canvas={editorCanvas} onApply={handleEditorApply} onCancel={() => setShowEditor(false)} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5" style={{ minHeight: 400 }}>
            {image ? (
              faces && faces.length > 1 && !faceData ? (
                <FaceSelector faces={faces} imageSrc={image.src} onSelect={handleSelectFace} />
              ) : showSlider && resultCanvas ? (
                <BeforeAfterSlider key={previewKey} beforeImage={image.src} afterCanvas={resultCanvas} />
              ) : (
                <img src={image.src} alt="Uploaded" className="w-full h-full object-contain" style={{ maxHeight: 500 }} />
              )
            ) : null}
            {processing && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-card rounded-xl p-4 shadow-lg flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-foreground">Applying glasses...</span>
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

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-2 max-h-72 overflow-y-auto">
            <h3 className="text-sm font-medium text-foreground mb-2">Styles</h3>
            {GLASSES_STYLES.filter(s => category === 'all' || s.category === category).map(style => (
              <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedStyle === style.id ? 'bg-[var(--anslation-ds-primary-soft)] border border-[var(--primary)] text-[var(--primary)]' : 'text-muted-foreground hover:bg-[var(--anslation-ds-soft)]'}`}>
                {style.name}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Frame Color</h3>
            <div className="flex flex-wrap gap-2">
              {FRAME_COLORS.filter(c => c.name !== 'Custom').map(c => (
                <button key={c.name} onClick={() => setSelectedFrameColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${selectedFrameColor.name === c.name ? 'border-[var(--primary)] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c.value }} title={c.name} aria-label={c.name} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Lens</h3>
            <div className="flex flex-wrap gap-2">
              {LENS_COLORS.slice(0, 8).map(c => (
                <button key={c.name} onClick={() => setSelectedLensColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${selectedLensColor.name === c.name ? 'border-[var(--primary)] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c.value === 'gradient' ? 'linear-gradient(135deg, #3b82f6, #a855f7)' : c.value }}
                  title={c.name} aria-label={c.name} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Adjustments</h3>
            {[
              { key: 'scale', label: 'Scale', min: 50, max: 150 },
              { key: 'frameWidth', label: 'Frame Width', min: 20, max: 100 },
              { key: 'height', label: 'Height', min: 20, max: 100 },
              { key: 'bridgeWidth', label: 'Bridge', min: 20, max: 100 },
              { key: 'lensTransparency', label: 'Lens Tint', min: 0, max: 100 },
              { key: 'rotation', label: 'Rotation', min: 160, max: 200 },
            ].map(({ key, label, min, max }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{adjustments[key]}</span></div>
                <input type="range" min={min} max={max} value={adjustments[key]} onChange={(e) => setAdjustments(p => ({ ...p, [key]: Number(e.target.value) }))}
                  aria-label={label}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:shadow-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
