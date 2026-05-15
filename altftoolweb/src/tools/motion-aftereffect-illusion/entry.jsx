// src/tools/motion-aftereffect-illusion/entry.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Clock, Eye } from "lucide-react";

// Local imports
import { 
  AmbientBackground, 
  MotionCanvas, 
  ControlPanel, 
  ScientificEducation 
} from "./components.jsx";
import { 
  startAmbientAudio, 
  stopAmbientAudio, 
  toggleFullscreen, 
  prefersReducedMotion,
  isFullscreenAvailable
} from "./utils.js";
import "./styles.css";

const DEFAULT_DURATION = 20;

export default function MotionAftereffectIllusion() {
  const [mode, setMode] = useState("waterfall-flow");
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION);
  const [phase, setPhase] = useState("idle");
  const [speed, setSpeed] = useState(1.15);
  const [intensity, setIntensity] = useState(1.15);
  const [contrast, setContrast] = useState(1.05);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const begin = useCallback(() => {
    clearTimer();
    setSecondsLeft(duration);
    setPhase("running");

    if (soundEnabled) startAmbientAudio();

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimer();
          setPhase("reveal");
          stopAmbientAudio();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearTimer, duration, soundEnabled]);

  const pause = useCallback(() => {
    clearTimer();
    setPhase("idle");
    stopAmbientAudio();
  }, [clearTimer]);

  const replay = useCallback(() => {
    setSecondsLeft(duration);
    begin();
  }, [begin, duration]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      if (next && phase === "running") startAmbientAudio();
      if (!next) stopAmbientAudio();
      return next;
    });
  }, [phase]);

  const handleFullscreen = useCallback(async () => {
    if (containerRef.current) {
      await toggleFullscreen(containerRef.current);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (phase === "running") pause();
        else if (phase === "reveal") replay();
        else begin();
      }

      if (event.code === "KeyR") replay();
      if (event.code === "KeyF") handleFullscreen();
      if (event.code === "KeyM") toggleSound();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [begin, handleFullscreen, pause, phase, replay, toggleSound]);

  // Sync isFullscreen state
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Initialization & Cleanup
  useEffect(() => {
    let reducedMotionTimer = null;
    if (prefersReducedMotion()) {
      reducedMotionTimer = window.setTimeout(() => {
        setDuration(15);
        setSpeed(0.8);
        setIntensity(0.9);
      }, 0);
    }

    return () => {
      if (reducedMotionTimer) window.clearTimeout(reducedMotionTimer);
      clearTimer();
      stopAmbientAudio();
    };
  }, [clearTimer]);

  const stats = [
    { label: "Mode", value: getModeLabel(mode), icon: Eye },
    { label: "Duration", value: `${duration}s`, icon: Clock },
    { label: "State", value: phase === "running" ? "Running" : phase === "reveal" ? "Reveal" : "Ready", icon: Activity },
  ];

  return (
    <div ref={containerRef} className="motion-aftereffect-illusion relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      <AmbientBackground />

      <div className="tool-container relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10 lg:gap-10">
        <section className="tool-header antique-hero overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 md:p-7">
          <div className="grid min-w-0 gap-6">
            <div className="mx-auto flex max-w-4xl min-w-0 flex-col items-center space-y-5 text-center">
              <motion.div
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--primary)]"
              >
                <Brain size={14} /> Antique visual experiment
              </motion.div>

              <div className="flex min-w-0 flex-col items-center space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="motion-antique-title max-w-4xl text-center text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
                >
                  Motion Aftereffect Illusion
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12 }}
                  className="mx-auto max-w-3xl text-center text-sm leading-7 text-[var(--muted-foreground)] sm:text-base"
                >
                  A vintage optical cabinet for training motion-sensitive neurons. Focus on the center, let the moving pattern adapt your eyes, then watch still patterns drift.
                </motion.p>
              </div>

              <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-left">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="break-words text-lg font-black text-[var(--foreground)]">{value}</p>
                    <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <main className="tool-main grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_410px]">
          <section className="motion-stage-column min-w-0">
            <MotionCanvas
                mode={mode}
                phase={phase}
                speed={speed}
                intensity={intensity}
                contrast={contrast}
                secondsLeft={secondsLeft}
                duration={duration}
                onStart={begin}
                onPause={pause}
                onReplay={replay}
                onFullscreen={handleFullscreen}
                isFullscreen={isFullscreen}
            />
            <div className="education-section motion-inline-education rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
              <ScientificEducation compact />
            </div>
          </section>

          <section className="min-w-0">
            <ControlPanel
                mode={mode}
                onModeChange={setMode}
                duration={duration}
                onDurationChange={setDuration}
                speed={speed}
                onSpeedChange={setSpeed}
                intensity={intensity}
                onIntensityChange={setIntensity}
                contrast={contrast}
                onContrastChange={setContrast}
                phase={phase}
                onStart={begin}
                onReplay={replay}
                soundEnabled={soundEnabled}
                onSoundToggle={toggleSound}
            />
          </section>
        </main>

        <footer className="pt-8 border-t border-[var(--border)]">
            <div className="flex flex-wrap justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                <div className="flex gap-6">
                    <span>60FPS ENGINE</span>
                    <span>NEURAL ADAPTATION</span>
                    <span>OPEN SOURCE</span>
                </div>
                <div className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors cursor-pointer">
                    LEARN MORE ABOUT MAE <Brain size={12} />
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

function getModeLabel(mode) {
  return mode
    .split("-")
    .slice(0, 1)
    .join(" ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
