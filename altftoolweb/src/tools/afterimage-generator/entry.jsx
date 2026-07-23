// src/tools/afterimage-generator/entry.jsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import {
  HeroSection,
  ExperimentProgressBar,
  ControlPanel,
  AfterimageCanvas,
  FullscreenStudio,
  ComplementaryPreview,
  ColorWheelVisualizer,
  EducationalCard,
  FunFactsCarousel,
  FooterInfoBar,
  ResultOverlay
} from './components.jsx';
import { useAfterimage, useFullscreen } from './hooks.js';
import './styles.css';

export default function AfterimageGenerator() {
  const [selectedColor, setSelectedColor] = useState('#FF3333');
  const [selectedShape, setSelectedShape] = useState('circle'); // 'circle', 'square', 'cross', 'star'
  const [shapeSize, setShapeSize] = useState(160);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // '#ffffff' (White), '#000000' (Black)
  const [showResult, setShowResult] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  // Automatically sync default canvas background color with Light/Dark theme
  useEffect(() => {
    const syncBgWithTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.documentElement.classList.contains('dark');
      setBackgroundColor(isDark ? '#000000' : '#ffffff');
    };

    syncBgWithTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class') {
          syncBgWithTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const {
    isStaring,
    stage,
    timerDuration,
    setTimerDuration,
    timeLeft,
    startStare,
    stopStare,
    resetStare,
  } = useAfterimage({
    mode: 'color',
    selectedColor,
    selectedShape,
    shapeSize,
    backgroundColor,
    intensity: { inversionIntensity: 1.0 },
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
    setSelectedColor('#FF3333');
    setSelectedShape('circle');
    setShapeSize(160);
    setBackgroundColor('#ffffff');
    setTimerDuration(10);
  }, [resetStare, setTimerDuration]);

  const handleExport = useCallback(() => {
    if (resultImage) {
      const link = document.createElement('a');
      link.download = 'retinal-afterimage.png';
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
    <div className="afterimage-generator relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-6 md:p-8">
      {/* Fullscreen Studio Modal Overlay */}
      {isFullscreen && (
        <FullscreenStudio
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          selectedShape={selectedShape}
          onShapeChange={setSelectedShape}
          shapeSize={shapeSize}
          onShapeSizeChange={setShapeSize}
          timerDuration={timerDuration}
          onTimerDurationChange={setTimerDuration}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          isStaring={isStaring}
          onStartStare={startStare}
          onStopStare={stopStare}
          onReset={handleReset}
          timeLeft={timeLeft}
          onExitFullscreen={exitFullscreen}
        />
      )}

      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-[var(--primary)] opacity-[0.08] blur-[120px]"
          animate={{ scale: [1, 1.1, 0.95, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ repeat: Infinity, duration: 16, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-10%] bottom-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-500 opacity-[0.06] blur-[140px]"
          animate={{ scale: [1, 0.9, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. EXPERIMENT PROGRESS BAR */}
        <section>
          <ExperimentProgressBar
            stage={stage}
            isStaring={isStaring}
            timeLeft={timeLeft}
            timerDuration={timerDuration}
          />
        </section>

        {/* 3 & 4. TWO-COLUMN LAYOUT (CONTROLS + CANVAS) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Experiment Controls */}
          <div className="lg:col-span-5">
            <ControlPanel
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              selectedShape={selectedShape}
              onShapeChange={setSelectedShape}
              shapeSize={shapeSize}
              onShapeSizeChange={setShapeSize}
              timerDuration={timerDuration}
              onTimerDurationChange={setTimerDuration}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              isStaring={isStaring}
              onStartStare={startStare}
              onReset={handleReset}
            />
          </div>

          {/* Right Panel / Main Canvas: Experiment Area */}
          <div className="lg:col-span-7 space-y-6">
            <AfterimageCanvas
              selectedColor={selectedColor}
              selectedShape={selectedShape}
              shapeSize={shapeSize}
              backgroundColor={backgroundColor}
              isStaring={isStaring}
              timeLeft={timeLeft}
              timerDuration={timerDuration}
              isFullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
            />

            {/* 5. COMPLEMENTARY PREVIEW */}
            <ComplementaryPreview selectedColor={selectedColor} />
          </div>
        </section>

        {/* 6. FULL-WIDTH OPPONENT COLOR WHEEL VECTOR */}
        <section className="w-full">
          <ColorWheelVisualizer selectedColor={selectedColor} />
        </section>

        {/* 7. EDUCATIONAL CARD */}
        <section>
          <EducationalCard />
        </section>

        {/* 8. FUN FACTS CAROUSEL */}
        <section>
          <FunFactsCarousel />
        </section>

        {/* 9. FOOTER INFORMATION BAR */}
        <section>
          <FooterInfoBar />
        </section>
      </div>

      {/* RESULT OVERLAY */}
      <ResultOverlay
        isVisible={showResult}
        resultImage={resultImage}
        onClose={() => setShowResult(false)}
        onExport={handleExport}
      />
    </div>
  );
}
