import React, { useCallback, useMemo, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import LissajousCanvas from '../components/LissajousCanvas';
import SimulationGuide from '../components/SimulationGuide';
import StatsPanel from '../components/StatsPanel';
import { PRESETS } from '../utils/lissajous';

const DEFAULT_PRESET = 'classic';

function createSettings(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS[DEFAULT_PRESET];
  return {
    ...preset,
    animationSpeed: 1,
    phaseSpeed: 24,
  };
}

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [settings, setSettings] = useState(() => createSettings(DEFAULT_PRESET));
  const [paused, setPaused] = useState(true);

  const presetLabel = useMemo(() => PRESETS[preset]?.label || settings.label || 'Custom', [preset, settings.label]);

  const handleTogglePause = useCallback(() => {
    setPaused((current) => !current);
  }, []);

  const handleReset = useCallback(() => {
    setSettings(createSettings(preset));
    setPaused(true);
  }, [preset]);

  const handlePresetChange = useCallback((nextPreset) => {
    setPreset(nextPreset);
    setSettings(createSettings(nextPreset));
    setPaused(true);
  }, []);

  const handleRandomize = useCallback(() => {
    setPreset('custom');
    setSettings((current) => ({
      ...current,
      label: 'Custom',
      freqX: randomInt(1, 12),
      freqY: randomInt(1, 12),
      phase: randomInt(0, 360),
      amplitudeX: randomInt(55, 100),
      amplitudeY: randomInt(55, 100),
      rotation: randomInt(-60, 60),
      decay: Number((Math.random() * 0.25).toFixed(2)),
      samples: randomInt(8, 28) * 100,
    }));
    setPaused(true);
  }, []);

  const handleSettingsChange = useCallback((field, value) => {
    setPreset('custom');
    setSettings((current) => ({ ...current, [field]: value, label: 'Custom' }));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] md:p-8 font-secondary">
      <div className="mb-8 pt-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Mathematical Curves
        </div>
        <h1 className="section-title text-[var(--primary)]">
          Lissajous Pattern Generator
        </h1>
        <p className="description mx-auto mt-3 max-w-3xl text-[var(--secondary-foreground)]">
          Generate frequency-based elegant mathematical curves and oscilloscope patterns from paired sine waves.
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
          <LissajousCanvas settings={settings} paused={paused} />
        </div>

        <StatsPanel settings={settings} paused={paused} presetLabel={presetLabel} />
        <SimulationGuide />
      </div>
    </div>
  );
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
