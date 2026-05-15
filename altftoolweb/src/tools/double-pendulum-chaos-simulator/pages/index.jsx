import React, { useState, useCallback, useMemo, useRef } from 'react';
import CanvasToolbar from '../components/CanvasToolbar';
import ChaosCanvas from '../components/ChaosCanvas';
import ChaosComparison from '../components/ChaosComparison';
import ParametersCard from '../components/ParametersCard';
import AnglesCard from '../components/AnglesCard';
import StatsPanel from '../components/StatsPanel';

const DEFAULT_PARAMS = {
  m1: 1.0,
  m2: 1.0,
  L1: 1.0,
  L2: 1.0,
  g: 9.81,
  damping: 0.01,
  speed: 1.0,
};

const DEFAULT_ANGLES = {
  theta1: Math.PI / 2,
  theta2: Math.PI / 2,
};

export default function ToolHome() {
  const [params, setParams] = useState({ ...DEFAULT_PARAMS });
  const [pendingAngles, setPendingAngles] = useState({ ...DEFAULT_ANGLES });
  const [appliedAngles, setAppliedAngles] = useState({ ...DEFAULT_ANGLES });
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [stats, setStats] = useState({});
  const [stats2, setStats2] = useState({});

  const canvasContainerRef = useRef(null);   // for scrolling

  const handleParamChange = useCallback((field, value) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAngleChange = useCallback((field, value) => {
    setPendingAngles((prev) => ({ ...prev, [field]: value }));
  }, []);

  const applyAnglesAndRestart = useCallback(() => {
    setAppliedAngles(pendingAngles);
    setPaused(false);
    setStarted(true);
    setRestartKey((k) => k + 1);

    // scroll to canvas
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pendingAngles]);

  const startSimulation = useCallback(() => {
    setAppliedAngles(pendingAngles);
    setPaused(false);
    setStarted(true);
    setRestartKey((k) => k + 1);
  }, [pendingAngles]);

  const resetAll = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setPendingAngles({ ...DEFAULT_ANGLES });
    setAppliedAngles({ ...DEFAULT_ANGLES });
    setPaused(true);
    setStarted(false);
    setRestartKey((k) => k + 1);
  }, []);

  const reset = useCallback(() => {
    setAppliedAngles(pendingAngles);
    setPaused(false);
    setStarted(true);
    setRestartKey((k) => k + 1);
  }, [pendingAngles]);

  const randomize = useCallback(() => {
    const rand = () => Math.random() * 2 * Math.PI;
    const newAngles = { theta1: rand(), theta2: rand() };
    setPendingAngles(newAngles);
    setAppliedAngles(newAngles);
    setPaused(false);
    setStarted(true);
   setRestartKey((k) => k + 1);

    // scroll to canvas
    if (canvasContainerRef.current) {
     canvasContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const toggleComparison = useCallback(() => {
    setComparisonMode((m) => !m);
    setRestartKey((k) => k + 1);
  }, []);

  const stableParams = useMemo(() => params, [params]);
  const stableAppliedAngles = useMemo(() => appliedAngles, [appliedAngles]);
  const handleStatsUpdate = useCallback((s) => setStats(s), []);
  const handleStatsUpdate2 = useCallback((s) => setStats2(s), []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-8 md:px-12 md:py-12">
      {/* Hero with fixed badge visibility */}
      <div className="flex flex-col items-center mb-8">
        <svg
          width="80" height="80" viewBox="0 0 100 100" className="mb-4"
          fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" stroke="var(--primary)" strokeWidth="2" strokeOpacity="0.3" />
          <circle cx="50" cy="10" r="8" fill="var(--primary)" />
          <line x1="50" y1="10" x2="80" y2="80" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="80" x2="20" y2="50" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="80" r="8" fill="#ef4444" />
          <circle cx="20" cy="50" r="8" fill="#22c55e" />
          <path d="M20,50 A40,40 0 0,1 80,80" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        </svg>

        {/* BADGE – now always visible (dark background in light mode, light background in dark mode) */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
          Chaos Theory
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gradient-hero text-center">
          Double Pendulum Simulator
        </h1>
        <p className="mt-3 text-[var(--secondary-foreground)] max-w-xl mx-auto text-center">
          Watch deterministic chaos unfold. Slight changes lead to dramatically different motion.
        </p>
      </div>

      {/* Canvas Toolbar */}
      <CanvasToolbar
        started={started}
        paused={paused}
        comparisonMode={comparisonMode}
        onStart={startSimulation}
        onTogglePause={togglePause}
        onReset={reset}
        onResetAll={resetAll}
        onToggleComparison={toggleComparison}
      />

      {/* Canvas – add ref for scrolling */}
      <div
        ref={canvasContainerRef}
        className="w-full h-[500px] mb-6 rounded-3xl overflow-hidden border border-[var(--border)] backdrop-blur-xl bg-[var(--card)]/70 shadow-2xl"
      >
        {comparisonMode ? (
          <ChaosComparison
            params={stableParams}
            initialAngles={stableAppliedAngles}
            paused={paused}
            restartKey={restartKey}
            onStatsUpdate1={handleStatsUpdate}
            onStatsUpdate2={handleStatsUpdate2}
          />
        ) : (
          <ChaosCanvas
            params={stableParams}
            initialAngles={stableAppliedAngles}
            paused={paused}
            restartKey={restartKey}
            onStatsUpdate={handleStatsUpdate}
          />
        )}
      </div>

      {/* Stats */}
      {comparisonMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatsPanel stats={stats} label="Pendulum A" />
          <StatsPanel stats={stats2} label="Pendulum B" />
        </div>
      ) : (
        <div className="mb-6">
          <StatsPanel stats={stats} />
        </div>
      )}

      {/* Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ParametersCard params={params} onParamChange={handleParamChange} />
        <AnglesCard
          pendingAngles={pendingAngles}
          onAngleChange={handleAngleChange}
          onApply={applyAnglesAndRestart}
          onRandomize={randomize}
        />
      </div>
    </div>
  );
}