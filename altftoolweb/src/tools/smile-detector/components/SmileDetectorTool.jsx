"use client";

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../../_shared/components/ImageUploader';
import SkeletonLoader from '../../_shared/components/SkeletonLoader';
import ErrorCard from '../../_shared/components/ErrorCard';
import { useFaceDetection } from '../../_shared/hooks/useFaceDetection';
import { loadImage, getCanvasBlob } from '../../_shared/utils/imageProcessing';
import { downloadCanvas, downloadBlob, shareImage } from '../../_shared/utils/download';
import { analyzeSmile } from '../utils/smileAnalysis';

function CircularProgress({ value, size = 80, strokeWidth = 6, color = 'var(--primary)', label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="text-lg font-bold text-foreground">{value}%</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

function AnimatedBar({ value, label, color = 'var(--primary)' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{value}%</span></div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

export default function SmileDetectorTool() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const { loading: faceLoading, error: faceError, faceData, modelsReady, loadModels, detectFace, reset: resetFace } = useFaceDetection();

  const handleImage = useCallback(async ({ src, file, img }) => {
    setImage({ src, file, img });
    setAnalysis(null);
    setReportGenerated(false);
    resetFace();
    if (!modelsReady) await loadModels();
    const result = await detectFace(img);
    if (result) {
      const analysisData = analyzeSmile(result.expressions, result.landmarks);
      setAnalysis(analysisData);
      setReportGenerated(true);
      drawHeatmap(img, result, analysisData);
    }
  }, [modelsReady, loadModels, detectFace, resetFace]);

  const drawHeatmap = (img, faceData, analysisData) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const { box, landmarks } = faceData;

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (landmarks.outerLips) {
      ctx.beginPath();
      landmarks.outerLips.forEach((p, i) => {
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = analysisData.smileScore > 60 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = analysisData.smileScore > 60 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.05)';
      ctx.fill();
    }

    if (landmarks.leftEye && landmarks.rightEye) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      landmarks.leftEye.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); });
      landmarks.rightEye.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); });
    }

    ctx.font = '14px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const scoreText = `Smile: ${analysisData.smileScore}%`;
    const textW = ctx.measureText(scoreText).width;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(box.x, box.y - 28, textW + 16, 28);
    ctx.fillStyle = '#fff';
    ctx.fillText(scoreText, box.x + 8, box.y - 8);

    canvasRef.current = canvas;
  };

  const handleRetry = useCallback(async () => {
    if (!image) return;
    resetFace();
    const img = await loadImage(image.src);
    const result = await detectFace(img);
    if (result) {
      const analysisData = analyzeSmile(result.expressions, result.landmarks);
      setAnalysis(analysisData);
      setReportGenerated(true);
      drawHeatmap(img, result, analysisData);
    }
  }, [image, detectFace, resetFace]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const blob = await getCanvasBlob(canvasRef.current, 'image/png', 0.95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smile-analysis.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const report = [
      '=== Smile Detection Report ===',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Overall Smile Score: ${analysis.overallScore}%`,
      `Expression: ${analysis.expressionLabel} ${analysis.emoji}`,
      `Confidence: ${analysis.confidence}%`,
      `Happiness: ${analysis.happinessPercent}%`,
      `Natural Smile Score: ${analysis.naturalSmileScore}%`,
      `Fake Smile Probability: ${analysis.fakeSmileProbability}%`,
      '',
      '=== Detailed Analysis ===',
      `Mouth Curve: ${analysis.details.mouthCurve}%`,
      `Teeth Visibility: ${analysis.details.teethVisibility}%`,
      `Eye Squint: ${analysis.details.eyeSquint}%`,
      `Cheek Raise: ${analysis.details.cheekRaise}%`,
      `Lip Symmetry: ${analysis.details.lipSymmetry}%`,
      `Face Symmetry: ${analysis.details.faceSymmetry}%`,
      '',
      '=== Raw Expression Data ===',
      ...Object.entries(analysis.raw).map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`),
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    downloadBlob(blob, 'smile-report.txt');
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const blob = await getCanvasBlob(canvasRef.current);
    await shareImage(blob, 'My Smile Analysis!');
  };

  if (!image) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Smile Detector</h1>
          <p className="text-sm text-muted-foreground">Upload a photo to analyze your smile with AI-powered facial expression detection</p>
        </div>
        <ImageUploader onImage={handleImage} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smile Detector</h1>
          <p className="text-sm text-muted-foreground">AI-powered facial expression analysis</p>
        </div>
        <button onClick={() => { setImage(null); setAnalysis(null); setReportGenerated(false); resetFace(); }}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">New Photo</button>
      </div>

      {faceLoading && <SkeletonLoader lines={4} />}
      {faceError && <ErrorCard message={faceError} onRetry={handleRetry} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5">
            {canvasRef.current ? (
              <img src={canvasRef.current.toDataURL()} alt="Analysis" className="w-full object-contain" />
            ) : (
              <img src={image.src} alt="Uploaded" className="w-full object-contain" />
            )}
          </div>
          {analysis && (
            <div className="flex flex-wrap gap-2">
              <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Image
              </button>
              <button onClick={handleDownloadReport} className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-sm text-muted-foreground">Download Report</button>
              <button onClick={handleShare} className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-sm text-muted-foreground">Share</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {analysis ? (
            <>
              <div className="rounded-xl border border-[var(--border)] p-6 text-center space-y-2">
                <span className="text-5xl">{analysis.emoji}</span>
                <h2 className="text-xl font-bold text-foreground">{analysis.expressionLabel}</h2>
                <p className="text-sm text-muted-foreground">Confidence: {analysis.confidence}%</p>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress value={analysis.overallScore} color="var(--primary)" label="Overall Score" />
                  <CircularProgress value={analysis.happinessPercent} color="#22c55e" label="Happiness" />
                  <CircularProgress value={analysis.naturalSmileScore} color="#3b82f6" label="Natural Smile" />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
                <h3 className="text-sm font-medium text-foreground">Detailed Analysis</h3>
                <AnimatedBar value={analysis.details.mouthCurve} label="Mouth Curve" color="#14b8a6" />
                <AnimatedBar value={analysis.details.teethVisibility} label="Teeth Visibility" color="#22c55e" />
                <AnimatedBar value={analysis.details.eyeSquint} label="Eye Squint" color="#3b82f6" />
                <AnimatedBar value={analysis.details.cheekRaise} label="Cheek Raise" color="#a855f7" />
                <AnimatedBar value={analysis.details.lipSymmetry} label="Lip Symmetry" color="#f59e0b" />
                <AnimatedBar value={analysis.details.faceSymmetry} label="Face Symmetry" color="#ec4899" />
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
                <h3 className="text-sm font-medium text-foreground">Expression Breakdown</h3>
                {Object.entries(analysis.raw).map(([key, val]) => (
                  <AnimatedBar key={key} value={Math.round(val * 100)} label={key.charAt(0).toUpperCase() + key.slice(1)}
                    color={key === 'happy' ? '#22c55e' : key === 'sad' ? '#ef4444' : key === 'surprised' ? '#f59e0b' : '#94a3b8'} />
                ))}
              </div>

              {analysis.fakeSmileProbability > 10 && (
                <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔍</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Fake Smile Detected</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Probability: {analysis.fakeSmileProbability}% — The smile appears less natural. Try a more genuine expression.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : faceLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faceError ? (
            <ErrorCard message={faceError} onRetry={handleRetry} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
