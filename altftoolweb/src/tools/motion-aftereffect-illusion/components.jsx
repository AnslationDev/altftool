// src/tools/motion-aftereffect-illusion/components.jsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pause, 
  Play, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  Info,
  Brain,
  Sparkles,
  Eye,
  Waves,
} from "lucide-react";
import { 
  renderIllusionFrame, 
  renderStaticRevealFrame, 
  getIllusionMode, 
  illusionModes 
} from "./utils.js";

// --- Ambient Background ---
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-44 bg-[var(--primary)] opacity-[0.04]" />
      <motion.div
        className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl"
        animate={{ x: [0, 26, -12, 0], y: [0, -18, 18, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[12%] right-[5%] h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.05] blur-3xl"
        animate={{ x: [0, -32, 18, 0], y: [0, 20, -16, 0], scale: [1, 0.95, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
      {Array.from({ length: 16 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[var(--primary)] opacity-25"
          style={{
            left: `${8 + ((index * 17) % 86)}%`,
            top: `${12 + ((index * 23) % 74)}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.18, 0.5, 0.18] }}
          transition={{ repeat: Infinity, duration: 5 + index * 0.25, delay: index * 0.12 }}
        />
      ))}
    </div>
  );
}

// --- Motion Canvas ---
export function MotionCanvas({
  mode,
  phase,
  speed,
  intensity,
  contrast,
  secondsLeft,
  duration,
  onStart,
  onPause,
  onReplay,
  onFullscreen,
  isFullscreen,
}) {
  const canvasRef = useRef(null);
  const settingsRef = useRef({ mode, phase, speed, intensity, contrast });

  useEffect(() => {
    settingsRef.current = { mode, phase, speed, intensity, contrast };
  }, [mode, phase, speed, intensity, contrast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let frameId;
    let startTime = performance.now();

    const draw = (now) => {
      const elapsed = (now - startTime) / 1000;
      const settings = settingsRef.current;
      const options = {
        mode: settings.mode,
        time: elapsed,
        speed: settings.speed,
        intensity: settings.intensity,
        contrast: settings.contrast,
      };

      if (settings.phase === "reveal") {
        renderStaticRevealFrame(canvas, options);
      } else {
        renderIllusionFrame(canvas, options);
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);

    const handleResize = () => {
      startTime = performance.now();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const progress = duration ? ((duration - secondsLeft) / duration) * 100 : 0;
  const isRunning = phase === "running";

  return (
    <motion.div
      className="antique-stage-card canvas-wrapper relative min-w-0 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="motion-canvas-frame relative min-h-[300px] w-full overflow-hidden rounded-[1.25rem]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Motion aftereffect illusion animation canvas"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.18)_100%)]" />
        
        {/* Focus Target */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className={`h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_12px_var(--primary)] transition-transform duration-700 ${isRunning ? 'scale-[1.8]' : 'scale-100'}`} />
            <div className={`absolute h-8 w-8 rounded-full border border-[var(--primary)] opacity-20 transition-all duration-1000 ${isRunning ? 'scale-100 opacity-30' : 'scale-0 opacity-0'}`} />
            <div className={`absolute h-16 w-16 rounded-full border border-[var(--primary)] opacity-10 transition-all duration-1000 delay-150 ${isRunning ? 'scale-100 opacity-20' : 'scale-0 opacity-0'}`} />
        </div>

        {/* Status Badge */}
        <div className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md sm:left-4 sm:top-4">
          <span className={`h-2 w-2 rounded-full ${phase === 'running' ? 'bg-green-500 animate-pulse' : 'bg-[var(--primary)]'}`} />
          {phase === "reveal" ? "Static reveal" : isRunning ? "Adaptation active" : "Ready"}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={onFullscreen}
          className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-black/60 sm:right-4 sm:top-4"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Progress Overlay */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              className="absolute right-3 top-16 z-30 rounded-2xl border border-white/15 bg-black/40 p-3 shadow-xl backdrop-blur-md sm:right-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
               <div className="relative flex items-center justify-center h-16 w-16">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke="var(--primary)"
                      strokeWidth="4"
                      strokeDasharray={175.9}
                      initial={{ strokeDashoffset: 175.9 }}
                      animate={{ strokeDashoffset: 175.9 - (175.9 * progress) / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">{secondsLeft}s</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap gap-2">
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <Pause size={16} /> Pause
            </button>
          ) : (
            <button
              onClick={phase === "reveal" ? onReplay : onStart}
              className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary)]/90"
            >
              <Play size={16} /> {phase === "reveal" ? "Replay" : "Start Experiment"}
            </button>
          )}
        </div>

        {/* Static Reveal Message */}
        <AnimatePresence>
            {phase === "reveal" && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="motion-reveal-panel absolute bottom-4 left-4 right-4 z-40 mx-auto max-w-lg rounded-3xl border border-white/20 bg-black/55 p-4 text-center shadow-2xl backdrop-blur-md sm:p-5"
                >
                    <div className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-xl">
                            <Sparkles size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white">Now watch the still pattern</h3>
                          <p className="text-sm font-medium leading-relaxed text-white/80">
                            Keep looking at the center dot. The image is static, but it should feel like it is drifting in the opposite direction.
                          </p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                          Motion Aftereffect active
                        </p>
                        <button
                            onClick={onReplay}
                            className="mt-1 rounded-full bg-white px-7 py-2.5 text-sm font-bold text-black shadow-xl transition-all hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- Control Panel ---
export function ControlPanel({
  mode,
  onModeChange,
  duration,
  onDurationChange,
  speed,
  onSpeedChange,
  intensity,
  onIntensityChange,
  contrast,
  onContrastChange,
  phase,
  onStart,
  onReplay,
  soundEnabled,
  onSoundToggle,
}) {
  const activeModeData = getIllusionMode(mode);
  const disabled = phase === "running";

  return (
    <div className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">Controls</p>
            <h2 className="mt-1 text-xl font-black text-[var(--foreground)]">Optical settings</h2>
          </div>
          <div className={`h-3 w-3 rounded-full ${disabled ? 'bg-red-500' : 'bg-emerald-500'}`} />
        </div>

        <div className="grid grid-cols-1 gap-5">
            {/* Mode Selection */}
            <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-[var(--primary)]/10 p-2">
                            <SlidersHorizontal size={18} className="text-[var(--primary)]" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--foreground)]">Experiment modes</h3>
                    </div>
                </div>
                
                <div className="motion-mode-grid grid gap-2">
                    {illusionModes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => onModeChange(m.id)}
                            disabled={disabled}
                            className={`group relative flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-all duration-300 ${
                                mode === m.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' 
                                : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`rounded-xl p-2.5 transition-all duration-300 ${mode === m.id ? 'bg-white/20' : 'bg-[var(--background)] group-hover:scale-110'}`}>
                                <m.icon size={20} className={mode === m.id ? 'text-white' : 'transition-colors group-hover:text-[var(--primary)]'} />
                            </div>
                            <span className="break-words text-center text-[9px] font-black uppercase tracking-[0.08em] leading-tight">{m.shortName}</span>
                            {mode === m.id && (
                                <motion.div layoutId="active-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                        </button>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={mode}
                    className="rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary)]/[0.04] p-4"
                >
                    <div className="flex gap-4 items-start">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-lg shrink-0">
                            <Info size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-[var(--foreground)] leading-relaxed">
                                {activeModeData.description}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] font-black">
                                Key Focus: {activeModeData.motionHint}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    {/* Timer Selector */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted-foreground)]">Adaptation Time</span>
                            <span className="text-xl font-black text-[var(--primary)]">{duration}s</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 45, 60].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => onDurationChange(t)}
                                    disabled={disabled}
                                    className={`min-w-0 rounded-xl border py-3 text-[11px] font-black transition-all duration-300 ${
                                        duration === t 
                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' 
                                        : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30'
                                    }`}
                                >
                                    {t}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Range Sliders */}
                    <div className="space-y-6">
                        {[
                            { label: 'Motion Speed', value: speed, min: 0.4, max: 2.4, change: onSpeedChange },
                            { label: 'Intensity', value: intensity, min: 0.6, max: 2.2, change: onIntensityChange },
                            { label: 'Contrast', value: contrast, min: 0.6, max: 2.0, change: onContrastChange },
                        ].map((s) => (
                            <div key={s.label} className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted-foreground)]">{s.label}</span>
                                    <span className="text-xs font-mono font-bold text-[var(--foreground)]">{s.value.toFixed(2)}</span>
                                </div>
                                <div className="relative flex items-center">
                                    <input
                                        type="range"
                                        min={s.min}
                                        max={s.max}
                                        step="0.05"
                                        value={s.value}
                                        onChange={(e) => s.change(parseFloat(e.target.value))}
                                        disabled={disabled}
                                        className={`w-full ${disabled ? 'opacity-50' : ''}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onSoundToggle}
                            className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 transition-all duration-300 ${
                                soundEnabled 
                                ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' 
                                : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30'
                            }`}
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            <span className="text-[11px] font-black uppercase tracking-[0.1em]">Ambient Audio</span>
                        </button>
                    </div>

                <button
                    onClick={phase === "idle" ? onStart : onReplay}
                    disabled={phase === "running"}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--primary)] py-3.5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-[var(--primary)]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {phase === "idle" ? <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" /> : <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
                    <span>{phase === "idle" ? "Begin Experiment" : "Reset Session"}</span>
                </button>
            </div>
        </div>
    </div>
  );
}

// --- Info Section ---
export function ScientificEducation({ compact = false }) {
  const sections = [
    {
      title: "The Waterfall Illusion",
      content: "The Motion Aftereffect (MAE) was first documented in 1834 by Robert Addams after observing the Fall of Foyers. When you stare at moving objects, direction-specific neurons in your visual cortex become fatigued.",
      icon: <Waves size={24} className="text-[var(--primary)]" />
    },
    {
      title: "Neural Adaptation",
      content: "When the motion stops, the baseline activity of the 'opposite' neurons is suddenly stronger than the fatigued ones, leading the brain to interpret a non-existent reverse motion.",
      icon: <Brain size={24} className="text-[var(--primary)]" />
    },
    {
      title: "Experimental Guide",
      content: "Keep your eyes locked on the central dot. Do not look around or blink excessively during the adaptation phase. The longer you adapt, the stronger and longer the aftereffect will be.",
      icon: <Eye size={24} className="text-[var(--primary)]" />
    }
  ];

  return (
    <div className={`grid grid-cols-1 gap-4 ${compact ? "md:grid-cols-3" : "md:grid-cols-3 md:gap-8"}`}>
      {sections.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className={`group rounded-2xl border border-[var(--border)] bg-[var(--background)] transition-all duration-300 hover:border-[var(--primary)]/40 ${compact ? "space-y-3 p-4" : "space-y-5 p-5"}`}
        >
          <div className={`${compact ? "h-10 w-10" : "h-12 w-12"} flex items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-colors duration-300`}>
            {s.icon}
          </div>
          <div className="space-y-2">
            <h4 className="break-words text-sm font-black uppercase tracking-widest text-[var(--foreground)]">{s.title}</h4>
            <p className={`${compact ? "text-[12px] leading-6" : "text-[13px] leading-relaxed"} text-[var(--muted-foreground)] font-medium`}>
              {s.content}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
