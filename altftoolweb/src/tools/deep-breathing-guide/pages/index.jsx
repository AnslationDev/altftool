"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Wind, Play, Square, Settings2, Info } from "lucide-react";

const TECHNIQUES = {
  "4-7-8": {
    name: "4-7-8 Relaxing Breath",
    description: "Promotes deep relaxation and helps with sleep.",
    phases: [
      { name: "Inhale", duration: 4000, action: "scale-150 bg-cyan-400/20 border-cyan-500" },
      { name: "Hold", duration: 7000, action: "scale-150 bg-cyan-400/20 border-cyan-500" },
      { name: "Exhale", duration: 8000, action: "scale-100 bg-teal-400/20 border-teal-500" }
    ]
  },
  "box": {
    name: "Box Breathing",
    description: "Used by Navy SEALs to calm nerves and improve focus.",
    phases: [
      { name: "Inhale", duration: 4000, action: "scale-150 bg-blue-400/20 border-blue-500" },
      { name: "Hold", duration: 4000, action: "scale-150 bg-blue-400/20 border-blue-500" },
      { name: "Exhale", duration: 4000, action: "scale-100 bg-indigo-400/20 border-indigo-500" },
      { name: "Hold", duration: 4000, action: "scale-100 bg-indigo-400/20 border-indigo-500" }
    ]
  },
  "coherence": {
    name: "Coherence Breathing",
    description: "Balances the nervous system and improves heart rate variability.",
    phases: [
      { name: "Inhale", duration: 5000, action: "scale-150 bg-emerald-400/20 border-emerald-500" },
      { name: "Exhale", duration: 5000, action: "scale-100 bg-green-400/20 border-green-500" }
    ]
  }
};

export default function DeepBreathingGuide() {
  const [activeTechnique, setActiveTechnique] = useState("4-7-8");
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);
  const technique = TECHNIQUES[activeTechnique];
  const currentPhase = technique.phases[currentPhaseIndex];

  const stopBreathing = useCallback(() => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeLeft(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const nextPhase = useCallback((phaseIndex) => {
    const phase = technique.phases[phaseIndex];
    setCurrentPhaseIndex(phaseIndex);
    setTimeLeft(phase.duration / 1000);

    let msRemaining = phase.duration;

    // Update countdown every second
    const interval = setInterval(() => {
      msRemaining -= 1000;
      setTimeLeft(Math.ceil(msRemaining / 1000));
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(interval);
      const nextIdx = (phaseIndex + 1) % technique.phases.length;
      nextPhase(nextIdx);
    }, phase.duration);

    // Cleanup interval on unmount or phase change
    return () => clearInterval(interval);
  }, [technique]);

  const startBreathing = useCallback(() => {
    if (isRunning) {
      stopBreathing();
    } else {
      setIsRunning(true);
      nextPhase(0);
    }
  }, [isRunning, nextPhase, stopBreathing]);

  useEffect(() => {
    return () => stopBreathing();
  }, [stopBreathing]);

  // Handle technique change
  const handleTechniqueChange = (key) => {
    stopBreathing();
    setActiveTechnique(key);
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen py-10 px-4 flex flex-col items-center">
      <header className="mb-12 text-center max-w-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
          <Wind className="h-8 w-8 text-cyan-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Deep Breathing Guide
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Follow the animation to guide your breathing. Select a technique to match your goal.
        </p>
      </header>

      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[var(--primary)]" />
            Technique
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(TECHNIQUES).map(([key, tech]) => (
            <button
              key={key}
              onClick={() => handleTechniqueChange(key)}
              disabled={isRunning}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                activeTechnique === key
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] hover:bg-[var(--section-highlight)] text-[var(--muted-foreground)]"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tech.name}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-[var(--section-highlight)] flex items-start gap-3 text-sm">
          <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            <strong className="text-[var(--foreground)] block mb-1">{technique.name}</strong>
            {technique.description}
          </p>
        </div>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        {/* Breathing Circle */}
        <div
          className={`absolute w-40 h-40 rounded-full border-4 transition-all ease-in-out flex items-center justify-center ${
            isRunning ? currentPhase.action : "scale-100 bg-[var(--section-highlight)] border-[var(--border)]"
          }`}
          style={{ transitionDuration: isRunning ? `${currentPhase.duration}ms` : "500ms" }}
        >
          {isRunning ? (
            <div className="text-center font-bold text-[var(--foreground)] z-10 transition-opacity">
              <div className="text-2xl uppercase tracking-widest">{currentPhase.name}</div>
              <div className="text-4xl mt-2">{timeLeft}s</div>
            </div>
          ) : (
            <span className="text-lg font-bold text-[var(--muted-foreground)]">Ready</span>
          )}
        </div>
      </div>

      <button
        onClick={startBreathing}
        className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105 active:scale-95 ${
          isRunning
            ? "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
            : "btn-primary"
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-5 h-5 fill-current" />
            Stop Session
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            Start Breathing
          </>
        )}
      </button>
    </div>
  );
}
