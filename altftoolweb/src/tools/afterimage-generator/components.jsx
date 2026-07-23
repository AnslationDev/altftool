// src/tools/afterimage-generator/components.jsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Download,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Palette,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Square,
  X,
  Zap,
  Cross as CrossIcon,
  Star as StarIcon,
  Ruler,
  Moon,
  ArrowRight,
  Sliders
} from 'lucide-react';
import Lottie from 'lottie-react';
import afAnimation from './af_animation.json';
import {
  getComplementaryColor,
  getColorName,
  hexToHue,
  drawShapeOnCanvas
} from './utils';

/**
 * 1. HERO SECTION WITH LOTTIE ANIMATION
 * Responsive two-column hero layout with left content & right looping af_animation.json
 */
export const HeroSection = () => {
  const [hasError, setHasError] = useState(false);

  return (
    <section className="afterimage-glass-panel p-6 sm:p-8 relative overflow-hidden min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-w-0">
        {/* Left Column: Content & Badges */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)] shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)] animate-pulse shrink-0" />
            <span>Interactive Vision Experiment</span>
          </div>

          <h1 className="afterimage-hero-heading text-3xl font-black sm:text-4xl md:text-5xl tracking-tight leading-tight break-words">
            Afterimage Generator
          </h1>

          <p className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug break-words">
            Explore retinal adaptation and opponent-process color vision in real time.
          </p>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed break-words">
            Stare at the central stimulus to temporarily desensitize matching cone photoreceptors in your retina. When you shift your gaze to a neutral background, your visual cortex generates a vivid complementary afterimage.
          </p>

          {/* 4 COLORFUL PILL BADGES */}
          <div className="flex flex-wrap gap-2.5 pt-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold shadow-2xs max-w-full truncate">
              🧠 Opponent Process Theory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold shadow-2xs max-w-full truncate">
              🎨 Complementary Colors
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--foreground)] text-xs font-bold shadow-2xs max-w-full truncate">
              ⚡ Interactive Vision Experiment
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--success-soft)] border border-[var(--success)]/30 text-[var(--success)] text-xs font-bold shadow-2xs max-w-full truncate">
              👁 Browser Based
            </span>
          </div>
        </div>

        {/* Right Column: Lottie Animation */}
        <div className="lg:col-span-5 flex items-center justify-center min-w-0 w-full">
          {!hasError && afAnimation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative flex items-center justify-center w-full min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] p-2"
            >
              <div className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] aspect-square flex items-center justify-center mx-auto">
                <Lottie
                  animationData={afAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                  onError={() => setHasError(true)}
                />
              </div>
            </motion.div>
          ) : (
            <div className="w-full min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]" />
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * 2. EXPERIMENT PROGRESS BAR
 * Displays 3-step progress tracker: ✓ Prepare → ◎ Stare → ○ Observe
 * with glowing brain illustration in ALTFTool Global CSS colors.
 */
export const ExperimentProgressBar = ({ stage, isStaring, timeLeft = 10, timerDuration = 10 }) => {
  const steps = [
    { id: 'prepare', label: 'Prepare', icon: Sliders, desc: 'Configure shape & stimulus color', position: 0 },
    { id: 'stare', label: 'Stare', icon: Eye, desc: 'Fixate gaze on central target', position: 50 },
    { id: 'observe', label: 'Observe', icon: Sparkles, desc: 'Look away to see complementary image', position: 100 },
  ];

  // 7.5-second slow, smooth progress loop
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const startTime = performance.now();
    const cycleDuration = 7500; // 7.5 seconds - relaxed and slow

    const animate = (now) => {
      const elapsed = (now - startTime) % cycleDuration;
      const norm = elapsed / cycleDuration;
      // Smooth sine wave progress back and forth (0% -> 100% -> 0%)
      const progress = ((1 - Math.cos(norm * Math.PI * 2)) / 2) * 100;
      setAnimProgress(progress);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const isStepPassed = (stepPos) => {
    if (stage === 'observe') return true;
    if (stage === 'stare' || isStaring) return stepPos <= 50;
    // Step turns green when progress line reaches or passes its position
    return animProgress >= stepPos - 5;
  };

  return (
    <div className="afterimage-glass-panel relative overflow-hidden p-4 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between min-w-0">
        {/* Step Tracker */}
        <div className="flex-1 min-w-0">
          <div className="relative flex items-center justify-between">
            {/* Background Track Line */}
            <div className="absolute left-6 right-6 top-5.5 -z-0 h-2 bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)] shadow-inner">
              {/* Slow & Smooth Green Progress Fill Line */}
              <div
                className="h-full bg-[var(--success)] rounded-full shadow-[0_0_12px_var(--success)] transition-all duration-75"
                style={{ width: `${animProgress}%` }}
              />
            </div>

            {steps.map((step) => {
              const StepIcon = step.icon;
              const isPassed = isStepPassed(step.position);

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center text-center min-w-0 px-1">
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full font-bold text-sm transition-all duration-500 ${
                      isPassed
                        ? 'bg-[var(--success)] text-[var(--card)] shadow-lg ring-2 ring-[var(--success)]'
                        : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs'
                    }`}
                  >
                    <StepIcon size={20} className={isPassed ? 'text-[var(--card)]' : 'text-[var(--foreground)]'} />
                  </div>
                  <span
                    className={`mt-2 font-black text-xs sm:text-sm tracking-wide truncate max-w-full transition-colors duration-500 ${
                      isPassed ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] text-[var(--muted-foreground)] sm:block max-w-[140px] font-medium truncate">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Brain Illustration using Global Primary Accents */}
        <div className="flex items-center gap-3 shrink-0 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 border-l-4 border-l-[var(--primary)] min-w-0 max-w-full shadow-2xs">
          <div className="relative shrink-0">
            <Brain size={32} className="text-[var(--primary)] animate-brain-glow" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--primary)] block truncate">
              Neuroscience Lab
            </span>
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] block truncate">
              Retinal Opponent Adaptation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. LEFT PANEL - EXPERIMENT CONTROLS
 * Floating glassmorphism card containing color wheel, shapes, sliders, duration & actions.
 * Dynamically adapts color theme depending on whether canvas is White vs Black!
 */
export const ControlPanel = ({
  selectedColor,
  onColorChange,
  selectedShape,
  onShapeChange,
  shapeSize,
  onShapeSizeChange,
  timerDuration,
  onTimerDurationChange,
  backgroundColor,
  onBackgroundColorChange,
  isStaring,
  onStartStare,
  onReset,
}) => {
  const shapes = [
    { id: 'circle', label: 'Circle', Icon: Circle },
    { id: 'square', label: 'Square', Icon: Square },
    { id: 'cross', label: 'Cross', Icon: CrossIcon },
    { id: 'star', label: 'Star', Icon: StarIcon },
  ];

  const durations = [5, 10, 20, 30];

  const bgOptions = [
    { id: '#ffffff', label: 'White', color: '#ffffff', textColor: 'text-slate-900' },
    { id: '#000000', label: 'Black', color: '#000000', textColor: 'text-white' },
  ];

  const presetColors = [
    '#FF3333', '#FF8800', '#FFFF00', '#00E676', '#00E5FF', '#2979FF', '#AA00FF', '#FF007F'
  ];

  return (
    <div className="afterimage-glass-panel flex flex-col gap-6 p-5 sm:p-6 rounded-[20px] transition-colors duration-300 min-w-0 border shadow-xl backdrop-blur-xl border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shrink-0">
            <Palette size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-base tracking-tight truncate text-[var(--foreground)]">
              Experiment Controls
            </h3>
            <p className="text-xs truncate text-[var(--muted-foreground)]">
              Configure visual stimulus properties
            </p>
          </div>
        </div>
      </div>

      {/* 1. STIMULUS COLOR */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-1 min-w-0">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] shrink-0">
            1. Stimulus Color
          </label>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--primary)] shrink-0">
              {selectedColor}
            </span>
            <span className="text-xs font-bold truncate max-w-[120px] text-[var(--muted-foreground)]">
              ({getColorName(selectedColor)})
            </span>
          </div>
        </div>

        {/* Live Color Preview & Color Picker Swatches */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 border-[var(--border)] shadow-lg shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor }}
          />

          <div className="grid flex-1 grid-cols-4 sm:grid-cols-8 gap-1.5 min-w-0">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                disabled={isStaring}
                className={`h-8 w-full rounded-lg border transition-all ${
                  selectedColor.toLowerCase() === color.toLowerCase()
                    ? 'scale-110 border-white ring-2 ring-[var(--primary)] shadow-md'
                    : 'border-transparent opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
                type="button"
              />
            ))}
          </div>

          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={isStaring}
            className="h-10 w-10 cursor-pointer rounded-xl border border-[var(--border)] bg-transparent p-0.5 shrink-0"
            title="Custom Hex Picker"
          />
        </div>
      </div>

      {/* 2. SHAPE SELECTION */}
      <div className="space-y-2.5 min-w-0">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block truncate">
          2. Shape Selection
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
          {shapes.map(({ id, label, Icon }) => {
            const isSelected = selectedShape === id;
            return (
              <button
                key={id}
                onClick={() => onShapeChange(id)}
                disabled={isStaring}
                type="button"
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 sm:p-3 text-xs font-bold transition-all border min-w-0 ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-black afterimage-teal-glow'
                    : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                <span className="truncate w-full text-center text-[11px] sm:text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SIZE SLIDER */}
      <div className="space-y-2 min-w-0">
        <div className="flex items-center justify-between text-xs font-bold min-w-0">
          <label className="uppercase tracking-wider text-[var(--primary)] shrink-0">3. Stimulus Size</label>
          <span className="font-mono text-[var(--primary)] shrink-0">{shapeSize}px</span>
        </div>
        <input
          type="range"
          min={80}
          max={260}
          step={5}
          value={shapeSize}
          onChange={(e) => onShapeSizeChange(parseInt(e.target.value, 10))}
          disabled={isStaring}
          className="w-full cursor-pointer"
        />
      </div>

      {/* 4. DURATION */}
      <div className="space-y-2.5 min-w-0">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block truncate">
          4. Stare Duration
        </label>
        <div className="grid grid-cols-4 gap-2 min-w-0">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => onTimerDurationChange(duration)}
              disabled={isStaring}
              type="button"
              className={`rounded-xl py-2.5 text-xs font-black transition-all border min-w-0 truncate ${
                timerDuration === duration
                  ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-black afterimage-teal-glow'
                  : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {duration} sec
            </button>
          ))}
        </div>
      </div>

      {/* 5. BACKGROUND */}
      <div className="space-y-2.5 min-w-0">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block truncate">
          5. Experiment Canvas Background
        </label>
        <div className="grid grid-cols-2 gap-2.5 min-w-0">
          {bgOptions.map((opt) => {
            const isSelected = backgroundColor === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onBackgroundColorChange(opt.id)}
                disabled={isStaring}
                type="button"
                className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition-all min-w-0 ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--foreground)] font-extrabold afterimage-teal-glow'
                    : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <div
                  className={`h-4 w-4 sm:h-5 sm:w-5 rounded-md border shrink-0 ${opt.textColor} flex items-center justify-center text-[10px] border-[var(--border)]`}
                  style={{ backgroundColor: opt.color }}
                >
                  ✓
                </div>
                <span className="truncate min-w-0">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 min-w-0">
        <button
          onClick={onStartStare}
          disabled={isStaring}
          type="button"
          className="afterimage-btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black tracking-wide shadow-lg disabled:opacity-50 min-w-0"
        >
          <Play size={18} fill="currentColor" className="shrink-0" />
          <span className="truncate">Start Experiment</span>
        </button>

        <button
          onClick={onReset}
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--muted)] px-4 py-3.5 text-sm font-bold transition-all shadow-2xs shrink-0"
          title="Reset settings"
        >
          <RotateCcw size={18} className="shrink-0" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

/**
 * 4. EXPERIMENT AREA (MAIN CANVAS)
 * Spacious HTML5 canvas rendering stimulus shape, countdown timer ring, and instructions.
 */
export const AfterimageCanvas = ({
  selectedColor,
  selectedShape,
  shapeSize,
  backgroundColor,
  isStaring,
  timeLeft,
  timerDuration,
  isFullscreen,
  toggleFullscreen
}) => {
  const canvasRef = useRef(null);
  const isCanvasLight = backgroundColor?.toLowerCase() === '#ffffff';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background fill
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw stimulus shape centered
      drawShapeOnCanvas(ctx, selectedShape, width / 2, height / 2, shapeSize, selectedColor);

      // Centered Red Fixation Crosshair Dot
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Guide crosshair lines
      ctx.strokeStyle = isCanvasLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 12, height / 2);
      ctx.lineTo(width / 2 + 12, height / 2);
      ctx.moveTo(width / 2, height / 2 - 12);
      ctx.lineTo(width / 2, height / 2 + 12);
      ctx.stroke();
      ctx.restore();
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedColor, selectedShape, shapeSize, backgroundColor, isCanvasLight]);

  // Compact countdown ring parameters for floating badge
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = isStaring ? ((timerDuration - timeLeft) / timerDuration) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="afterimage-canvas-container relative w-full min-h-[420px] sm:min-h-[520px]">
      <canvas ref={canvasRef} className="block h-full min-h-[420px] sm:min-h-[520px] w-full" />

      {/* Fullscreen Expand Studio Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)] hover:bg-[var(--surface-soft)] backdrop-blur-md transition-all shadow-md text-xs font-bold"
        title="Open Fullscreen Studio Mode"
        type="button"
      >
        <Maximize2 size={16} className="text-[var(--primary)]" />
        <span>Expand Studio</span>
      </button>

      {/* Non-Blocking Floating Top-Left Timer Badge */}
      <AnimatePresence>
        {isStaring && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2.5 rounded-full border border-[var(--primary)]/40 bg-[var(--card)]/95 text-[var(--foreground)] backdrop-blur-md shadow-xl pointer-events-none max-w-[calc(100%-80px)] min-w-0"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-8 w-8 sm:h-9 sm:w-9 -rotate-90">
                <circle cx="18" cy="18" r={radius} stroke={isCanvasLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'} strokeWidth="3" fill="transparent" />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-linear"
                />
              </svg>
              <span className="absolute font-mono text-[10px] sm:text-[11px] font-black text-[var(--primary)]">{Math.ceil(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] min-w-0 truncate">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)] shrink-0" />
              <span className="truncate hidden sm:inline">Experiment Active: Stare at Center Dot ({Math.ceil(timeLeft)}s)</span>
              <span className="truncate sm:hidden">Stare at Center ({Math.ceil(timeLeft)}s)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Instruction Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)] p-3 sm:p-3.5 backdrop-blur-md text-xs font-bold gap-2 min-w-0 shadow-lg">
        <span className="flex items-center gap-2 min-w-0 truncate">
          <Eye size={16} className="text-[var(--primary)] shrink-0" />
          <span className="truncate">Stare at the center of the shape for optimal illusion.</span>
        </span>
        <span className="hidden md:inline-block font-mono text-[11px] text-[var(--primary)] shrink-0 font-bold">
          Target: {selectedShape.toUpperCase()} ({shapeSize}px)
        </span>
      </div>
    </div>
  );
};

/**
 * FULLSCREEN STUDIO MODE COMPONENT
 * Full-page workspace with collapsible left sidebar and floating bottom-left start button.
 * Dynamically switches sidebar theme based on selected canvas background color (White vs Black)!
 */
export const FullscreenStudio = ({
  selectedColor,
  onColorChange,
  selectedShape,
  onShapeChange,
  shapeSize,
  onShapeSizeChange,
  timerDuration,
  onTimerDurationChange,
  backgroundColor,
  onBackgroundColorChange,
  isStaring,
  onStartStare,
  onStopStare,
  onReset,
  timeLeft,
  onExitFullscreen
}) => {
  const canvasRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isCanvasLight = backgroundColor?.toLowerCase() === '#ffffff';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background fill
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw stimulus shape centered
      drawShapeOnCanvas(ctx, selectedShape, width / 2, height / 2, shapeSize, selectedColor);

      // Centered Red Fixation Crosshair Dot
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Guide crosshair lines
      ctx.strokeStyle = isCanvasLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 14, height / 2);
      ctx.lineTo(width / 2 + 14, height / 2);
      ctx.moveTo(width / 2, height / 2 - 14);
      ctx.lineTo(width / 2, height / 2 + 14);
      ctx.stroke();
      ctx.restore();
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedColor, selectedShape, shapeSize, backgroundColor, isCanvasLight]);

  // Timer ring parameters
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = isStaring ? ((timerDuration - timeLeft) / timerDuration) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[var(--background)] flex items-center justify-center">
      {/* 1. 100% Canvas Background */}
      <canvas ref={canvasRef} className="block h-full w-full absolute inset-0" />

      {/* 2. Top-Right Exit Fullscreen Button */}
      <button
        onClick={onExitFullscreen}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 text-[var(--foreground)] hover:bg-[var(--surface-soft)] px-4 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md transition-all"
        type="button"
        title="Exit Fullscreen Studio"
      >
        <Minimize2 size={16} className="text-[var(--primary)]" />
        <span>Exit Studio</span>
      </button>

      {/* 3. Non-Blocking Floating Active Timer Badge (Top Center) */}
      <AnimatePresence>
        {isStaring && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-[var(--primary)]/40 bg-[var(--card)]/95 text-[var(--foreground)] px-5 py-2 backdrop-blur-md shadow-2xl pointer-events-none"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-9 w-9 -rotate-90">
                <circle cx="18" cy="18" r={radius} stroke={isCanvasLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'} strokeWidth="3" fill="transparent" />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-linear"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-black text-[var(--primary)]">{Math.ceil(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              <span>Experiment Active: Fixate Gaze on Center ({Math.ceil(timeLeft)}s)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Collapsible Left Sidebar with Dynamic Theme Matching Canvas Background */}
      <AnimatePresence mode="wait">
        {!isSidebarCollapsed ? (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed left-4 top-4 bottom-20 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto custom-scrollbar rounded-[20px] p-5 shadow-2xl flex flex-col justify-between backdrop-blur-xl transition-colors duration-300 border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
          >
            <div>
              {/* Header with Collapse Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-[var(--primary)]" />
                  <h3 className="font-black text-sm text-[var(--foreground)]">Studio Controls</h3>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                  title="Collapse Sidebar"
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Full Control Settings */}
              <div className="space-y-5">
                <ControlPanel
                  selectedColor={selectedColor}
                  onColorChange={onColorChange}
                  selectedShape={selectedShape}
                  onShapeChange={onShapeChange}
                  shapeSize={shapeSize}
                  onShapeSizeChange={onShapeSizeChange}
                  timerDuration={timerDuration}
                  onTimerDurationChange={onTimerDurationChange}
                  backgroundColor={backgroundColor}
                  onBackgroundColorChange={onBackgroundColorChange}
                  isStaring={isStaring}
                  onStartStare={onStartStare}
                  onReset={onReset}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed left-4 top-4 z-40 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] px-4 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md transition-all"
            type="button"
            title="Expand Controls Sidebar"
          >
            <Sliders size={16} className="text-[var(--primary)]" />
            <span>Settings</span>
            <ChevronRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 5. FLOATING BOTTOM-LEFT START BUTTON (Always Accessible & Unobstructive) */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        {!isStaring ? (
          <button
            onClick={onStartStare}
            type="button"
            className="afterimage-btn-primary px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={18} fill="currentColor" />
            <span>Start Experiment</span>
          </button>
        ) : (
          <button
            onClick={onStopStare}
            type="button"
            className="px-6 py-3.5 rounded-2xl bg-red-600 text-white font-black text-sm tracking-wide shadow-2xl flex items-center gap-2.5 hover:bg-red-500 active:scale-95 transition-all animate-pulse"
          >
            <Square size={18} fill="currentColor" />
            <span>Stop Experiment</span>
          </button>
        )}
      </div>

      {/* 6. Bottom-Right Target Info Pill */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/95 text-[var(--foreground)] px-4 py-2 text-xs font-mono font-bold backdrop-blur-md shadow-xl pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        <span>Target: {selectedShape.toUpperCase()} ({shapeSize}px)</span>
      </div>
    </div>
  );
};

/**
 * 5. COMPLEMENTARY PREVIEW
 * Compact scientific prediction card: Stimulus Color → Expected Illusion Color.
 */
export const ComplementaryPreview = ({ selectedColor }) => {
  const compColor = getComplementaryColor(selectedColor);
  const stimName = getColorName(selectedColor);
  const compName = getColorName(compColor);

  return (
    <div className="afterimage-glass-panel p-4 sm:p-5 text-[var(--foreground)] min-w-0">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3 min-w-0">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5 truncate">
          <Sparkles size={14} className="shrink-0" /> Scientific Complementary Prediction
        </span>
        <span className="text-[11px] font-mono text-[var(--muted-foreground)] shrink-0">Opponent Code</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
        {/* Stimulus Color Box */}
        <div className="flex-1 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 min-w-0">
          <div className="h-9 w-9 rounded-lg border border-[var(--border)] shrink-0 shadow-sm" style={{ backgroundColor: selectedColor }} />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block truncate">Stimulus</span>
            <span className="text-xs font-black text-[var(--foreground)] truncate block">{stimName} ({selectedColor})</span>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 shrink-0 self-center">
          <ArrowRight size={16} />
        </div>

        {/* Expected Illusion Box */}
        <div className="flex-1 flex items-center gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-3 min-w-0">
          <div className="h-9 w-9 rounded-lg border border-[var(--border)] shrink-0 shadow-md shadow-teal-500/20" style={{ backgroundColor: compColor }} />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] block truncate">Expected Afterimage</span>
            <span className="text-xs font-black text-[var(--foreground)] truncate block">{compName} ({compColor})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 6. INTERACTIVE COLOR WHEEL VISUALIZER
 * Displays 2D color wheel ring with stimulus point & complementary point connected by line.
 */
export const ColorWheelVisualizer = ({ selectedColor }) => {
  const hue = hexToHue(selectedColor);
  const compHue = (hue + 180) % 360;

  const size = 200;
  const radius = 80;
  const center = size / 2;

  const stimAngle = (hue - 90) * (Math.PI / 180);
  const compAngle = (compHue - 90) * (Math.PI / 180);

  const stimX = center + radius * Math.cos(stimAngle);
  const stimY = center + radius * Math.sin(stimAngle);

  const compX = center + radius * Math.cos(compAngle);
  const compY = center + radius * Math.sin(compAngle);

  const compColorHex = getComplementaryColor(selectedColor);

  return (
    <div className="afterimage-glass-panel p-6 sm:p-8 flex flex-col gap-6 text-[var(--foreground)] min-w-0 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shrink-0">
            <Palette size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-base sm:text-lg tracking-tight text-[var(--foreground)] truncate">
              Opponent Color Wheel Vector
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              180° Chromatic Inversion &amp; Opponent-Process Mapping
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 font-mono text-xs font-bold text-[var(--primary)] shrink-0">
          180° Diametric Shift
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-w-0">
        {/* SVG Color Wheel Spectrum */}
        <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center relative py-2">
          <div className="relative h-52 w-52 shrink-0 flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
              <defs>
                <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff0000" />
                  <stop offset="20%" stopColor="#ffff00" />
                  <stop offset="40%" stopColor="#00ff00" />
                  <stop offset="60%" stopColor="#00ffff" />
                  <stop offset="80%" stopColor="#0000ff" />
                  <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>
              </defs>

              {/* Spectrum Ring */}
              <circle cx={center} cy={center} r={radius} fill="none" stroke="url(#wheelGrad)" strokeWidth="16" opacity="0.9" />
              <circle cx={center} cy={center} r={radius - 14} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Connecting Diametric Vector Line */}
              <line x1={stimX} y1={stimY} x2={compX} y2={compY} stroke="var(--primary)" strokeWidth="3" strokeDasharray="5 5" />

              {/* Stimulus Point Pin */}
              <circle cx={stimX} cy={stimY} r="10" fill={selectedColor} stroke="#ffffff" strokeWidth="2.5" className="color-wheel-pin" />

              {/* Complementary Point Pin */}
              <circle cx={compX} cy={compY} r="10" fill={compColorHex} stroke="var(--primary)" strokeWidth="2.5" className="color-wheel-pin" />
            </svg>
          </div>
        </div>

        {/* Informational Cards Grid */}
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <div className="p-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 space-y-1.5 min-w-0">
            <span className="font-extrabold text-sm text-[var(--primary)] block truncate">Selected Stimulus Color</span>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="h-7 w-7 rounded-lg border border-[var(--border)] shadow-xs shrink-0" style={{ backgroundColor: selectedColor }} />
              <div>
                <p className="font-mono font-black text-xs text-[var(--foreground)]">{selectedColor.toUpperCase()}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Hue: {hue}°</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] space-y-1.5 min-w-0">
            <span className="font-extrabold text-sm text-[var(--primary)] block truncate">Retinal Afterimage Opponent</span>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="h-7 w-7 rounded-lg border border-[var(--border)] shadow-xs shrink-0" style={{ backgroundColor: compColorHex }} />
              <div>
                <p className="font-mono font-black text-xs text-[var(--foreground)]">{compColorHex.toUpperCase()}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Hue: {compHue}° (180° Inverted)</p>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] space-y-1.5 min-w-0">
            <span className="font-bold text-xs text-[var(--foreground)] block">Color Vector Explanation</span>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
              The dashed vector line connects {selectedColor} ({hue}°) directly across the 360° color wheel to its exact diametric opposite {compColorHex} ({compHue}°). Prolonged fixation desensitizes cone cells responsive to {selectedColor}, causing your visual cortex to perceive {compColorHex} when viewing a neutral canvas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 7. EDUCATIONAL CARD
 * Expandable "Why does this happen?" section with Retinal Fatigue & Opponent-Process theory breakdown.
 */
export const EducationalCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="afterimage-glass-panel p-5 sm:p-6 text-[var(--foreground)] space-y-4 min-w-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left focus:outline-none min-w-0"
        type="button"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shrink-0">
            <Info size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base tracking-tight text-[var(--foreground)] truncate">Why does this happen?</h3>
            <p className="text-xs text-[var(--muted-foreground)] truncate">The neuroscience of retinal cone fatigue & opponent-process theory</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/30 shrink-0">
          {isExpanded ? 'Collapse ▲' : 'Expand Details ▼'}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5 pt-3 border-t border-[var(--border)] overflow-hidden min-w-0"
          >
            <div className="grid gap-4 md:grid-cols-3 min-w-0">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs truncate">
                  <Zap size={15} className="shrink-0" /> 1. Cone Cell Adaptation
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                  Staring at a bright stimulus continuously stimulates specific L, M, or S cone photoreceptors in your fovea, depleting their photopigment.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs truncate">
                  <Brain size={15} className="shrink-0" /> 2. Opponent Signal Imbalance
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                  When you shift your gaze to a neutral surface, the fatigued cones respond weakly while un-fatigued opponent cones fire at normal baseline rates.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-[var(--success)] font-bold text-xs truncate">
                  <Eye size={15} className="shrink-0" /> 3. Negative Afterimage Perception
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                  Your brain interprets the net neural signal imbalance as the exact complementary hue, creating a vivid ghost image lasting several seconds.
                </p>
              </div>
            </div>

            {/* Infographic Step Flow */}
            <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-center min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-mono text-xs font-bold text-[var(--primary)]">Phase 1</span>
                <span className="block text-xs font-black text-[var(--foreground)] truncate">Intense Staring</span>
                <span className="text-[11px] text-[var(--muted-foreground)] block break-words">Cone photopigments depleted</span>
              </div>
              <span className="text-[var(--primary)] font-bold hidden sm:inline shrink-0">→</span>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-mono text-xs font-bold text-[var(--primary)]">Phase 2</span>
                <span className="block text-xs font-black text-[var(--foreground)] truncate">Look at Neutral Surface</span>
                <span className="text-[11px] text-[var(--muted-foreground)] block break-words">Baseline white light input</span>
              </div>
              <span className="text-[var(--primary)] font-bold hidden sm:inline shrink-0">→</span>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-mono text-xs font-bold text-[var(--success)]">Phase 3</span>
                <span className="block text-xs font-black text-[var(--foreground)] truncate">Perceived Afterimage</span>
                <span className="text-[11px] text-[var(--muted-foreground)] block break-words">Opponent color channels dominate</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 8. FUN FACTS CAROUSEL
 * Horizontal carousel with informative cards & navigation controls.
 */
export const FunFactsCarousel = () => {
  const facts = [
    {
      title: 'Spaceflight & Microgravity Adaptation',
      text: 'Astronauts on the ISS undergo afterimage testing to evaluate changes in visual processing and cone sensitivity caused by microgravity and cosmic radiation.',
      tag: 'NASA Research',
    },
    {
      title: 'Cone Photoreceptor Desensitization',
      text: 'Human cone cells contain opsin proteins. Sustained exposure temporarily exhausts photopigment molecules, taking 10–30 seconds for full chemical restoration.',
      tag: 'Ophthalmology',
    },
    {
      title: 'Complementary Contrast in Art',
      text: 'Post-impressionist painters like Vincent van Gogh placed complementary colors side-by-side to induce simultaneous contrast afterimages, heightening visual vibrancy.',
      tag: 'Visual Design',
    },
    {
      title: 'Historical Opponent Theory',
      text: 'Physiologist Ewald Hering formulated the Opponent-Process Theory in 1878 after observing that humans never perceive greenish-red or yellowish-blue colors.',
      tag: 'History of Science',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const prevFact = () => setActiveIndex((prev) => (prev === 0 ? facts.length - 1 : prev - 1));
  const nextFact = () => setActiveIndex((prev) => (prev === facts.length - 1 ? 0 : prev + 1));

  return (
    <div className="afterimage-glass-panel p-5 sm:p-6 text-[var(--foreground)] space-y-4 min-w-0">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-5 w-5 text-[var(--primary)] shrink-0" />
          <h3 className="font-black text-base tracking-tight text-[var(--foreground)] truncate">Neuroscience Fun Facts</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={prevFact}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)] transition-all"
            title="Previous Fact"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextFact}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)] transition-all"
            title="Next Fact"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Fact Card Slide */}
      <div className="min-h-[100px] rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 relative overflow-hidden min-w-0">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-mono text-[10px] font-bold uppercase tracking-wider mb-2 shrink-0">
          {facts[activeIndex].tag}
        </span>
        <h4 className="font-extrabold text-sm text-[var(--foreground)] break-words">{facts[activeIndex].title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)] break-words">{facts[activeIndex].text}</p>
      </div>

      {/* Page Indicators */}
      <div className="flex justify-center gap-2 pt-1">
        {facts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === idx ? 'w-6 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]'
            }`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 9. FOOTER INFORMATION BAR
 * 3 informational guidance cards at bottom (Safety, Distance, Environment).
 */
export const FooterInfoBar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
      {/* Safety First */}
      <div className="afterimage-glass-panel p-4 flex items-start gap-3 border-l-4 border-l-amber-500 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 shrink-0">
          <ShieldAlert size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider truncate">Safety First</h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
            Avoid prolonged staring if you experience eye fatigue, strain, or discomfort. Take breaks regularly.
          </p>
        </div>
      </div>

      {/* Recommended Distance */}
      <div className="afterimage-glass-panel p-4 flex items-start gap-3 border-l-4 border-l-[var(--primary)] min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] shrink-0">
          <Ruler size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-[var(--primary)] uppercase tracking-wider truncate">Recommended Distance</h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
            For optimal visual field stimulus, maintain an arms-length viewing distance of 60–80 cm from screen.
          </p>
        </div>
      </div>

      {/* Best Environment */}
      <div className="afterimage-glass-panel p-4 flex items-start gap-3 border-l-4 border-l-cyan-500 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-500 shrink-0">
          <Moon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-cyan-500 uppercase tracking-wider truncate">Best Environment</h4>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
            Works best in a dimly lit room with high screen brightness to maximize cone cell excitation contrast.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * RESULT OVERLAY MODAL
 * Displayed when user completes the stare sequence and afterimage result is compiled.
 */
export const ResultOverlay = ({ isVisible, resultImage, onClose, onExport }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.94, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 15 }}
            className="custom-scrollbar relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[var(--primary)]/30 bg-[var(--card)] p-6 shadow-2xl text-[var(--foreground)] min-w-0"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-5 w-5 text-[var(--primary)] animate-pulse shrink-0" />
                <h2 className="text-lg font-black tracking-tight text-[var(--foreground)] truncate">Retinal Afterimage Result</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onExport}
                  className="afterimage-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md shrink-0"
                  type="button"
                >
                  <Download size={15} /> Save Result PNG
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all shrink-0"
                  type="button"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-6 min-w-0">
              <div className="text-center space-y-1">
                <p className="text-xs text-[var(--muted-foreground)] break-words">
                  Blink rapidly or look at a plain surface to experience this exact complementary optical illusion.
                </p>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-inner flex items-center justify-center">
                <img src={resultImage} alt="Afterimage Result" className="h-full w-full object-contain" />
              </div>

              <div className="grid gap-4 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 p-4 md:grid-cols-2 min-w-0">
                <div className="flex gap-3 min-w-0">
                  <Info className="text-[var(--primary)] shrink-0 mt-0.5" size={18} />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[var(--foreground)] truncate">Photoreceptor Chemical Reset</h4>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                      Your cone cell photopigments are restoring their baseline sensitivity, producing the inverted afterimage response.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 min-w-0">
                  <Brain className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[var(--foreground)] truncate">Opponent Pairs</h4>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                      Opponent color pathways in your visual cortex fire in reverse balance until baseline equilibrium is restored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
