import React, { useCallback, useMemo, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import ReactionCanvas from '../components/ReactionCanvas';
import SimulationGuide from '../components/SimulationGuide';
import StatsPanel from '../components/StatsPanel';
import { PRESETS } from '../utils/reactionDiffusion';

const DEFAULT_PRESET = 'zebra';

function createSettings(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS[DEFAULT_PRESET];
  return {
    feed: preset.feed,
    kill: preset.kill,
    diffA: preset.diffA,
    diffB: preset.diffB,
    stepsPerFrame: 5,
  };
}

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [settings, setSettings] = useState(() => createSettings(DEFAULT_PRESET));
  const [seed, setSeed] = useState(PRESETS[DEFAULT_PRESET].seed);
  const [paused, setPaused] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [stats, setStats] = useState({ coverage: 0, intensity: 0 });
  const [resolution, setResolution] = useState('Auto');

  const presetLabel = useMemo(() => PRESETS[preset]?.label || PRESETS[DEFAULT_PRESET].label, [preset]);

  const handleTogglePause = useCallback(() => {
    setPaused((current) => !current);
  }, []);

  const handleReset = useCallback(() => {
    setPaused(true);
    setSeed(PRESETS[preset]?.seed || PRESETS[DEFAULT_PRESET].seed);
    setResetKey((key) => key + 1);
  }, [preset]);

  const handleRandomize = useCallback(() => {
    setPaused(true);
    setSeed('noise');
    setResetKey((key) => key + 1);
  }, []);

  const handlePresetChange = useCallback((nextPreset) => {
    const presetConfig = PRESETS[nextPreset] || PRESETS[DEFAULT_PRESET];
    setPreset(nextPreset);
    setSettings((current) => ({
      ...createSettings(nextPreset),
      stepsPerFrame: current.stepsPerFrame,
    }));
    setSeed(presetConfig.seed);
    setPaused(true);
    setResetKey((key) => key + 1);
  }, []);

  const handleSettingsChange = useCallback((field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-8 font-secondary">
      <div className="mb-8 pt-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Morphogenesis Lab
        </div>
        <h1 className="section-title text-[var(--primary)]">
          Reaction Diffusion Simulator
        </h1>
        <p className="description mx-auto mt-3 max-w-3xl text-[var(--secondary-foreground)]">
          Generate zebra stripes, spots, and natural biological patterns with a mathematical reaction-diffusion model.
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <ControlPanel
          paused={paused}
          settings={settings}
          preset={preset}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onRandomize={handleRandomize}
          onPresetChange={handlePresetChange}
          onSettingsChange={handleSettingsChange}
        />

        <div className="my-4 h-[68vh] min-h-[380px] max-h-[640px] w-full overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/70 shadow-lg backdrop-blur-xl">
          <ReactionCanvas
            settings={settings}
            paused={paused}
            resetKey={resetKey}
            seed={seed}
            onStatsUpdate={setStats}
            onResolutionUpdate={setResolution}
          />
        </div>

        <StatsPanel
          stats={stats}
          paused={paused}
          presetLabel={presetLabel}
          resolution={resolution}
        />

        <SimulationGuide />
      </div>
    </div>
  );
}
