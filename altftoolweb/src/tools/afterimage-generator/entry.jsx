// src/tools/afterimage-generator/entry.jsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Eye, Maximize2, Minimize2, Palette, Sparkles } from 'lucide-react';

// Simplified local imports
import { AfterimageCanvas, ControlPanel, ResultOverlay, ScientificEducation } from './components.jsx';
import { useAfterimage, useFullscreen } from './hooks.js';
import './styles.css';

export default function AfterimageGenerator() {
  const [mode, setMode] = useState('color'); // 'color' or 'image'
  const [selectedColor, setSelectedColor] = useState('#ff3333');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [intensity, setIntensity] = useState({
    saturation: 1.0,
    brightness: 1.0,
    contrast: 0.5,
    inversionIntensity: 1.0,
  });

  const {
    isStaring,
    timerDuration,
    setTimerDuration,
    timeLeft,
    startStare,
    stopStare,
    resetStare,
  } = useAfterimage({
    mode,
    selectedColor,
    uploadedImage,
    intensity,
    onAfterimageGenerated: (imageData) => {
      setResultImage(imageData);
      setShowResult(true);
    },
  });

  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen();

  const handleReset = useCallback(() => {
    resetStare();
    setShowResult(false);
    setResultImage(null);
  }, [resetStare]);

  const handleExport = useCallback(() => {
    if (resultImage) {
      const link = document.createElement('a');
      link.download = 'afterimage.png';
      link.href = resultImage;
      link.click();
    }
  }, [resultImage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isStaring) stopStare();
        else startStare();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        if (isFullscreen) exitFullscreen();
        if (showResult) setShowResult(false);
      } else if (e.code === 'KeyR') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStaring, startStare, stopStare, toggleFullscreen, isFullscreen, exitFullscreen, showResult, handleReset]);

  return (
    <div className="afterimage-generator relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-[6%] top-[8%] h-64 w-64 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl"
          animate={{ x: [0, 28, -18, 0], y: [0, -18, 20, 0], scale: [1, 1.06, 0.96, 1] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[8%] right-[4%] h-80 w-80 rounded-full bg-[var(--primary)] opacity-[0.06] blur-3xl"
          animate={{ x: [0, -34, 16, 0], y: [0, 18, -16, 0], scale: [1, 0.95, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10 lg:gap-10">
          <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 md:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.75fr)]">
              <motion.div
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="min-w-0 space-y-5 text-center lg:text-left"
              >
                <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--primary)] lg:mx-0">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Neuroscience Experiment
                </div>

                <div className="space-y-3">
                  <h1 className="afterimage-heading text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    Afterimage Generator
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base lg:mx-0">
                    Stare at a bold stimulus, then watch your eyes reveal the complementary color. A polished browser lab for opponent-process color vision.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Active Mode', value: mode === 'color' ? 'Color' : 'Image', icon: Palette },
                    { label: 'Focus Time', value: `${timerDuration}s`, icon: Clock },
                    { label: 'Status', value: isStaring ? 'Running' : 'Ready', icon: Eye },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-left">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="break-words text-lg font-black text-[var(--foreground)]">{value}</p>
                      <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="afterimage-preview-graphic">
                  <div className="afterimage-preview-ring ring-one" />
                  <div className="afterimage-preview-ring ring-two" />
                  <div className="afterimage-preview-dot" style={{ backgroundColor: selectedColor }} />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                      <p className="text-sm font-bold text-[var(--foreground)]">Focus on the center dot, then look away.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm sm:p-4 md:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">Experiment Stage</p>
                  <h2 className="mt-1 text-xl font-black text-[var(--foreground)]">Retinal focus canvas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-bold text-[var(--muted-foreground)]">
                    {isStaring ? 'Running' : 'Ready'}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-bold capitalize text-[var(--muted-foreground)]">
                    {mode} mode
                  </span>
                </div>
              </div>

              <div className="relative group">
                <AfterimageCanvas
                  mode={mode}
                  selectedColor={selectedColor}
                  uploadedImage={uploadedImage}
                  isStaring={isStaring}
                  timeLeft={timeLeft}
                  timerDuration={timerDuration}
                  intensity={intensity}
                  isFullscreen={isFullscreen}
                />

                <button
                  onClick={toggleFullscreen}
                  className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-black/65 sm:right-4 sm:top-4"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <ControlPanel
                mode={mode}
                onModeChange={setMode}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                uploadedImage={uploadedImage}
                onImageUpload={setUploadedImage}
                timerDuration={timerDuration}
                onTimerDurationChange={setTimerDuration}
                intensity={intensity}
                onIntensityChange={setIntensity}
                isStaring={isStaring}
                onStartStare={startStare}
                onStopStare={stopStare}
                onReset={handleReset}
              />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <ScientificEducation />
          </section>
        </div>

        {/* Overlays */}
        <ResultOverlay
          isVisible={showResult}
          resultImage={resultImage}
          onClose={() => setShowResult(false)}
          onExport={handleExport}
        />
      </motion.div>
    </div>
  );
}
