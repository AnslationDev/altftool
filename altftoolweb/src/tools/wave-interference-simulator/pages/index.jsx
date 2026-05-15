import { useState, useRef, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import ModeSelector from "../components/ModeSelector";
import WaveCanvas from "../components/WaveCanvas";
import ControlPanel from "../components/ControlPanel";
import DoubleSlitControls from "../components/DoubleSlitControls";
import CustomWaveInput from "../components/CustomWaveInput";
import StatsPanel from "../components/StatsPanel";
import PhasorDiagram from "../components/PhasorDiagram";
import HelpGuide from "../components/HelpGuide";
import { PRESETS } from "../utils/presets";
import {
  PlayIcon,
  PauseIcon,
  SnapshotIcon,
  ClearIcon,
  ResetIcon,
  StarIcon,
} from "../components/Icons";

const DEFAULT_WAVES = [
  { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: 0, speed: 1 },
  { amplitude: 1.5, frequency: 2, wavelength: 1.2, phase: 0, speed: 1 },
];

const DEFAULT_DOUBLE = {
  wavelength: 500e-9,
  slitSep: 0.2e-3,
  screenDist: 1.5,
  slitWidth: 0,
};

const DEFAULT_MODE = "interference";
const DEFAULT_EMITTER_DISTANCE = 3;

const presetDescriptions = {
  perfectConstructive: "Waves in phase → max amplitude",
  perfectDestructive: "Waves 180° out → cancellation",
  standingWave: "Two opposing waves create nodes",
  rippleChaos: "2D circular waves with random phase",
  harmonic: "Octave harmonic (2:1 frequency ratio)",
  slowMotion: "Slow motion for detailed observation",
  laser405: "Violet laser (405 nm)",
  laser532: "Green laser (532 nm)",
  laser633: "Red laser (633 nm)",
};

export default function ToolHome() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [waves, setWaves] = useState(DEFAULT_WAVES);
  const [emitterDistance, setEmitterDistance] = useState(DEFAULT_EMITTER_DISTANCE);
  const [doubleSettings, setDoubleSettings] = useState(DEFAULT_DOUBLE);
  const [customFormula, setCustomFormula] = useState({
    wave1: "A*sin(2*PI/wavelength*x - 2*PI*frequency*t + phase)",
    wave2: "A*sin(2*PI/wavelength*x - 2*PI*frequency*t + phase)",
    useCustom: [false, false],
  });
  const [paused, setPaused] = useState(false);
  const [snapshotCanvas, setSnapshotCanvas] = useState(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);

  const simTimeRef = useRef(0);
  const speedRef = useRef(waves[0].speed);
  const pausedRef = useRef(paused);
  const animFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);

  useEffect(() => {
    speedRef.current = waves[0].speed;
  }, [waves]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      if (!pausedRef.current) {
        simTimeRef.current += dt * speedRef.current;
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handlePreset = (key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setMode(preset.mode);
    setWaves(preset.waves.map(w => ({ ...w })));
    if (preset.emitterDistance !== undefined) setEmitterDistance(preset.emitterDistance);
    if (preset.doubleSettings) setDoubleSettings({ ...preset.doubleSettings });
    if (preset.customFormula) setCustomFormula({ ...preset.customFormula });
  };

  const resetAll = () => {
    setMode(DEFAULT_MODE);
    setWaves(DEFAULT_WAVES.map(w => ({ ...w })));
    setEmitterDistance(DEFAULT_EMITTER_DISTANCE);
    setDoubleSettings(DEFAULT_DOUBLE);
    setCustomFormula({
      wave1: "A*sin(2*PI/wavelength*x - 2*PI*frequency*t + phase)",
      wave2: "A*sin(2*PI/wavelength*x - 2*PI*frequency*t + phase)",
      useCustom: [false, false],
    });
    setPaused(false);
    setSnapshotCanvas(null);
    setShowSnapshot(false);
    simTimeRef.current = 0;
  };

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    offscreen.getContext("2d").drawImage(canvas, 0, 0);
    setSnapshotCanvas(offscreen);
    setShowSnapshot(true);
  };

  const clearSnapshot = () => {
    setSnapshotCanvas(null);
    setShowSnapshot(false);
  };

  const handleCanvasHover = (physicsCoords) => {
    if (mode === "doubleslit" && physicsCoords) {
      const y = physicsCoords.x;
      const { wavelength, slitSep, screenDist } = doubleSettings;
      const k = 2 * Math.PI / wavelength;
      const phaseDiff = k * slitSep * y / screenDist;
      setHoverPoint({ a1: 1, a2: 1, phaseDiff });
    } else {
      setHoverPoint(null);
    }
  };

  const isDoubleSlit = mode === "doubleslit";
  const isCustom = mode === "custom";

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] md:p-8">
      <HeroSection />

      <div className="max-w-7xl mx-auto relative">
        {/* Help toggle – instant button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help
          </button>
        </div>

        {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}

        <div className="mb-6 flex justify-center">
          <ModeSelector current={mode} onChange={setMode} />
        </div>

        <WaveCanvas
          ref={canvasRef}
          mode={mode}
          waves={waves}
          emitterDistance={emitterDistance}
          doubleSettings={doubleSettings}
          customFormula={customFormula}
          simTimeRef={simTimeRef}
          snapshotCanvas={snapshotCanvas}
          showSnapshot={showSnapshot}
          onHover={handleCanvasHover}
        />

        {/* Toolbar – all instant buttons */}
        <div className="mt-4 flex flex-wrap gap-4 w-full">
          <button
            onClick={() => setPaused(!paused)}
            className="btn-secondary min-w-[120px] flex-1"
          >
            {paused ? <PlayIcon /> : <PauseIcon />}{paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={takeSnapshot}
            className="btn-secondary min-w-[120px] flex-1"
          >
            <SnapshotIcon /> Snapshot
          </button>
          <button
            onClick={clearSnapshot}
            className="btn-secondary min-w-[120px] flex-1"
          >
            <ClearIcon /> Clear
          </button>
          <button
            onClick={resetAll}
            className="btn-secondary min-w-[120px] flex-1"
          >
            <ResetIcon /> Reset All
          </button>
        </div>

        <div className="mt-4">
          <StatsPanel waves={waves} mode={mode} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="h-full">
              {isDoubleSlit ? (
                <DoubleSlitControls settings={doubleSettings} setSettings={setDoubleSettings} />
              ) : isCustom ? (
                <CustomWaveInput
                  waves={waves}
                  customFormula={customFormula}
                  setCustomFormula={setCustomFormula}
                  setWaves={setWaves}
                />
              ) : (
                <ControlPanel
                  waves={waves}
                  setWaves={setWaves}
                  mode={mode}
                  emitterDistance={emitterDistance}
                  setEmitterDistance={setEmitterDistance}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex h-full flex-col space-y-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex-1">
                <h2 className="subheading text-[var(--primary)] flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                  Phasor Diagram
                </h2>
                <PhasorDiagram
                  waves={waves}
                  simTimeRef={simTimeRef}
                  staticPhasor={hoverPoint}
                />
              </div>
              <div>
                <h2 className="subheading text-[var(--primary)] flex items-center gap-2 mb-3">
                  <StarIcon /> Presets
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(PRESETS).map(key => (
                    <button
                      key={key}
                      onClick={() => handlePreset(key)}
                      className="btn-secondary text-xs"
                      title={presetDescriptions[key] || ""}
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
