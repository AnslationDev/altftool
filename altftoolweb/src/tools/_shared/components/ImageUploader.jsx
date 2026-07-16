"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { validateImage } from '../utils/imageProcessing';

export default function ImageUploader({ onImage, accept = 'image/*', maxSize = 20 }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const processFile = useCallback(async (file) => {
    setError(null);
    const errors = validateImage(file);
    if (errors.length) { setError(errors[0]); return; }
    setProcessing(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Corrupted image'));
        img.src = url;
      });
      if (stream) stream.getTracks().forEach(t => t.stop());
      onImage({ src: url, file, img });
    } catch {
      setError('Image appears to be corrupted. Please try another.');
    } finally {
      setProcessing(false);
    }
  }, [onImage, stream]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) { processFile(file); break; }
      }
    }
  }, [processFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setCameraReady(true);
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraReady) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      processFile(file);
      stopCamera();
    }, 'image/jpeg', 0.92);
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
    setCameraReady(false);
  };

  return (
    <div className="space-y-4">
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-[var(--anslation-ds-danger-soft)] border border-[var(--anslation-ds-danger)]/30 text-sm text-[var(--anslation-ds-danger)]">
          {error}
        </motion.div>
      )}

      {showCamera ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-[var(--primary)] bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 md:h-80 object-cover" onCanPlay={() => setCameraReady(true)} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button onClick={capturePhoto} disabled={!cameraReady} className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-full font-medium hover:brightness-110 transition-all shadow-lg disabled:opacity-50">Capture</button>
            <button onClick={stopCamera} className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-all">Cancel</button>
          </div>
        </div>
      ) : (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
            dragOver ? 'border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] scale-[1.01]' : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--anslation-ds-primary-soft)]/30'
          }`}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[var(--anslation-ds-primary-soft)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-foreground font-medium">Drop image here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP, HEIC (max {maxSize}MB)</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg> Paste</span>
              <button onClick={(e) => { e.stopPropagation(); startCamera(); }} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Camera
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {processing && (
        <div className="flex items-center justify-center gap-3 p-4">
          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Processing image...</span>
        </div>
      )}
    </div>
  );
}
