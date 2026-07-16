"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import { compressImage, loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { downloadCanvas, downloadBlob } from '../../_shared/utils/download';
import {
  computeOverallQuality, analyzeSharpness, analyzeBrightness, analyzeContrast,
  analyzeNoise, analyzeExposure, analyzeWhiteBalance, analyzeSaturation,
  analyzeDynamicRange, analyzeResolution, generateHistogram, generateRGBHistogram,
} from '../../_shared/utils/imageAnalysis';

function ScoreGauge({ value, label, color = 'var(--primary)', size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="text-lg font-bold text-foreground" style={{ marginTop: -size / 2 - 2 }}>{value}</span>
      {label && <span className="text-xs text-muted-foreground -mt-1">{label}</span>}
    </div>
  );
}

function QualityBar({ value, label, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{value}/100</span></div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full" style={{ background: color || 'var(--primary)' }} />
      </div>
    </div>
  );
}

export default function ImageQualityChecker() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showHistogram, setShowHistogram] = useState(false);
  const canvasRef = useRef(null);

  const handleImage = useCallback(async ({ src, file, img }) => {
    setImage({ src, file, img });
    setAnalysis(null);
    setError(null);
    setAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvasRef.current = canvas;

      await new Promise(r => setTimeout(r, 100));
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const quality = computeOverallQuality(imageData, canvas);
      const histogram = generateHistogram(imageData);
      const rgbHist = generateRGBHistogram(imageData);

      const suggestions = [];
      if (quality.sharpness.score < 40) suggestions.push('Image is blurry — try using a sharper source image');
      if (quality.brightness.score < 30) suggestions.push('Image is too dark — increase exposure or lighting');
      if (quality.brightness.avg > 200) suggestions.push('Image is overexposed — reduce brightness');
      if (quality.contrast.score < 40) suggestions.push('Low contrast — adjust levels for more depth');
      if (quality.noise.score < 40) suggestions.push('Image is noisy — use lower ISO or better lighting');
      if (quality.exposure.underExposed > 20) suggestions.push('Significant underexposed areas — check lighting');
      if (quality.exposure.overExposed > 20) suggestions.push('Significant overexposed areas — reduce exposure');
      if (quality.whiteBalance.score < 50) suggestions.push('Color cast detected — adjust white balance');
      if (quality.resolution.score < 40) suggestions.push('Low resolution image — use higher resolution source');

      const strengths = [];
      if (quality.sharpness.score > 70) strengths.push('Sharp image with good detail');
      if (quality.brightness.score > 70) strengths.push('Well-exposed with good brightness');
      if (quality.contrast.score > 70) strengths.push('Good contrast for visual impact');
      if (quality.noise.score > 70) strengths.push('Clean image with minimal noise');
      if (quality.resolution.score > 80) strengths.push('High resolution image');

      const weaknesses = [];
      if (quality.sharpness.score < 50) weaknesses.push('Lacks sharpness');
      if (quality.brightness.score < 40 || quality.brightness.avg > 210) weaknesses.push('Exposure issues');
      if (quality.contrast.score < 50) weaknesses.push('Flat contrast');
      if (quality.noise.score < 50) weaknesses.push('Visible noise');
      if (quality.whiteBalance.score < 60) weaknesses.push('Color cast present');

      setAnalysis({ ...quality, histogram, rgbHist, suggestions, strengths, weaknesses });
    } catch (err) {
      setError('Analysis failed. Please try another image.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleDownloadReport = () => {
    if (!analysis) return;
    const report = [
      '=== Image Quality Report ===',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Overall Quality Score: ${analysis.overall}/100`,
      `Grade: ${analysis.grade}`,
      '',
      '=== Metrics ===',
      `Sharpness: ${analysis.sharpness.score}/100`,
      `Brightness: ${analysis.brightness.score}/100 (avg: ${analysis.brightness.avg})`,
      `Contrast: ${analysis.contrast.score}/100 (range: ${analysis.contrast.range})`,
      `Noise: ${analysis.noise.score}/100`,
      `Exposure: ${analysis.exposure.score}/100`,
      `White Balance: ${analysis.whiteBalance.score}/100`,
      `Saturation: ${analysis.saturation.score}/100`,
      `Dynamic Range: ${analysis.dynamicRange.score}/100`,
      `Resolution: ${analysis.resolution.score}/100 (${analysis.resolution.width}x${analysis.resolution.height})`,
      '',
      '=== Strengths ===',
      ...analysis.strengths.map(s => `- ${s}`),
      '',
      '=== Suggestions ===',
      ...analysis.suggestions.map(s => `- ${s}`),
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain' });
    downloadBlob(blob, 'image-quality-report.txt');
  };

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Image Quality Checker</h1>
          <p className="text-sm text-muted-foreground">Upload an image to analyze its quality using 10+ professional metrics</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Image Quality Checker</h1>
        <div className="flex gap-2">
          <button onClick={() => { setImage(null); setAnalysis(null); }} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New Image</button>
          {analysis && (
            <button onClick={handleDownloadReport} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Download Report</button>
          )}
        </div>
      </div>

      {error && <ErrorCard message={error} />}
      {analyzing && <SkeletonLoader lines={6} />}

      {analysis && !analyzing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <img src={image.src} alt="Analyzed" className="w-full object-contain" style={{ maxHeight: 400 }} />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] p-6 text-center">
                <ScoreGauge value={analysis.overall} label={`Grade: ${analysis.grade}`} size={120} color={analysis.overall >= 70 ? '#22c55e' : analysis.overall >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4 space-y-2">
                <h3 className="text-sm font-medium text-foreground">Image Info</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Resolution:</span><span className="text-foreground">{analysis.resolution.width}x{analysis.resolution.height}</span>
                  <span>Megapixels:</span><span className="text-foreground">{analysis.resolution.megapixels} MP</span>
                  <span>Aspect Ratio:</span><span className="text-foreground">{(analysis.resolution.width / analysis.resolution.height).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Quality Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QualityBar value={analysis.sharpness.score} label="Sharpness" color="#14b8a6" />
              <QualityBar value={analysis.brightness.score} label="Brightness" color="#22c55e" />
              <QualityBar value={analysis.contrast.score} label="Contrast" color="#3b82f6" />
              <QualityBar value={analysis.noise.score} label="Noise Level" color="#a855f7" />
              <QualityBar value={analysis.exposure.score} label="Exposure" color="#f59e0b" />
              <QualityBar value={analysis.whiteBalance.score} label="White Balance" color="#ec4899" />
              <QualityBar value={analysis.saturation.score} label="Saturation" color="#14b8a6" />
              <QualityBar value={analysis.dynamicRange.score} label="Dynamic Range" color="#22c55e" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analysis.strengths.length > 0 && (
              <div className="rounded-xl border border-green-200 dark:border-green-800 p-4 bg-green-50 dark:bg-green-900/20">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400">
                      <span>✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.suggestions.length > 0 && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-amber-50 dark:bg-amber-900/20">
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">Improvement Suggestions</h3>
                <ul className="space-y-1">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <span>→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <button onClick={() => setShowHistogram(!showHistogram)} className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <span>{showHistogram ? '▼' : '▶'}</span> Histogram Analysis
            </button>
            {showHistogram && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">Luminosity Histogram</h4>
                  <div className="flex items-end gap-px h-24">
                    {analysis.histogram.normalized.map((v, i) => (
                      <div key={i} className="flex-1 bg-[var(--primary)] rounded-t" style={{ height: `${Math.max(2, v)}%`, opacity: 0.7 }} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground mb-2">RGB Distribution</h4>
                  <div className="flex items-end gap-px h-20">
                    {analysis.rgbHist.r.map((v, i) => i % 4 === 0 && (
                      <div key={i} className="flex-1 space-y-px">
                        <div className="bg-red-400 rounded-t" style={{ height: `${Math.max(1, (v / analysis.rgbHist.max) * 100)}%`, opacity: 0.6 }} />
                        <div className="bg-green-400 rounded-t" style={{ height: `${Math.max(1, (analysis.rgbHist.g[i] / analysis.rgbHist.max) * 100)}%`, opacity: 0.6 }} />
                        <div className="bg-blue-400 rounded-t" style={{ height: `${Math.max(1, (analysis.rgbHist.b[i] / analysis.rgbHist.max) * 100)}%`, opacity: 0.6 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
