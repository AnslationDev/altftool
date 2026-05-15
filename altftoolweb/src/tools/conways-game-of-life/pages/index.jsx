import React, { useState, useCallback, useRef } from 'react';
import GameCanvas from '../components/GameCanvas';
import ControlPanel from '../components/ControlPanel';
import StatsPanel from '../components/StatsPanel';
import SimulationGuide from '../components/SimulationGuide';

export default function ToolHome() {
  const [paused, setPaused] = useState(true);
  const [speed, setSpeed] = useState(5);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [gridInfo, setGridInfo] = useState('0x0');
  const [restartKey, setRestartKey] = useState(0);
  const [randomizeFlag, setRandomizeFlag] = useState(0);
  const [stepSignal, setStepSignal] = useState(0);

  const handleStartPause = useCallback(() => setPaused(p => !p), []);

  const handleStep = useCallback(() => {
    setPaused(true);
    setStepSignal(signal => signal + 1);
  }, []);

  const handleClear = useCallback(() => {
    setPaused(true);
    setGeneration(0);
    setPopulation(0);
    setRestartKey(k => k + 1);
  }, []);

  const handleRandomize = useCallback(() => {
    setPaused(true);
    setGeneration(0);
    setRandomizeFlag(f => f + 1);   // triggers random fill in canvas
  }, []);

  const handleGenerationUpdate = useCallback((gen) => setGeneration(gen), []);
  const handlePopulationUpdate = useCallback((pop) => setPopulation(pop), []);
  const handleGridInfoUpdate = useCallback((info) => setGridInfo(info), []);

  const canvasContainerRef = useRef(null);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] md:p-8">
      {/* Hero */}
      <div className="text-center mb-8 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-semibold mb-5">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
          Cellular Automaton
        </div>
        <h1 className="section-title tool-heading-accent">
          Conway’s Game of Life
        </h1>
        <p className="description mt-3 text-[var(--muted-foreground)]">
          Draw cells, step through deterministic generations, or let the classic birth and survival rules unfold in real time.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <ControlPanel
          paused={paused}
          generation={generation}
          speed={speed}
          onStartPause={handleStartPause}
          onStep={handleStep}
          onClear={handleClear}
          onRandomize={handleRandomize}
          onSpeedChange={setSpeed}
        />

        {/* Canvas */}
        <div
          ref={canvasContainerRef}
          className="mb-4 mt-4 h-[68vh] min-h-[360px] w-full max-h-[620px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]"
        >
          <GameCanvas
            speed={speed}
            paused={paused}
            restartKey={restartKey}
            randomizeFlag={randomizeFlag}
            stepSignal={stepSignal}
            onGenerationUpdate={handleGenerationUpdate}
            onPopulationUpdate={handlePopulationUpdate}
            onGridInfoUpdate={handleGridInfoUpdate}
          />
        </div>

        {/* Stats */}
        <StatsPanel
          generation={generation}
          population={population}
          gridInfo={gridInfo}
          speed={speed}
          paused={paused}
        />

        <SimulationGuide />
      </div>
    </div>
  );
}
