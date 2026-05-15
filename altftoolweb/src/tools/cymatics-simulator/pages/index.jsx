"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Switch } from "@/shared/ui/Switch";

const PRESETS = [
  { name: "Chladni 1", freq: 200, damping: 0.015, mode: "radial", label: "Classic Ring" },
  { name: "Star Pattern", freq: 440, damping: 0.012, mode: "star", label: "440 Hz A4" },
  { name: "Mandala", freq: 528, damping: 0.01, mode: "mandala", label: "528 Hz Solfeggio" },
  { name: "Square Node", freq: 880, damping: 0.018, mode: "square", label: "Square Nodal" },
  { name: "Hexagonal", freq: 1200, damping: 0.009, mode: "hex", label: "Hex Matrix" },
  { name: "Spirals", freq: 1760, damping: 0.007, mode: "spiral", label: "Double Spiral" },
];

const NOTE_FREQS = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
};

const CYMATICS_COLORS = {
  bg: "#F4F7FF",
  particle: "#2563EB",
  node: "#1E40AF",
  plate: "#D4DAE3",
};

const MODES = ["radial", "star", "mandala", "square", "hex", "spiral"];

function drawCymatics(canvas, freq, damping, mode, particleCount) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;
  const time = Date.now() * 0.0005;
  const norm = freq / 200;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = CYMATICS_COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = CYMATICS_COLORS.plate;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  function waveVal(x, y) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy) / radius;
    const a = Math.atan2(dy, dx);

    switch (mode) {
      case "radial": {
        const k1 = Math.floor(norm * 2.2) + 2;
        const k2 = Math.floor(norm * 1.5) + 1;
        return Math.sin(k1 * Math.PI * r + time * 0.3) * Math.cos(k2 * a + time * 0.1) * Math.exp(-damping * 400 * r);
      }
      case "star": {
        const k = Math.round(norm * 1.8) + 3;
        return Math.sin(norm * 3.2 * Math.PI * r) * Math.cos(k * a + time * 0.2) * Math.sin(k * 0.5 * a - time * 0.15);
      }
      case "mandala": {
        const k = Math.round(norm * 2) + 4;
        return Math.sin(norm * 2.8 * Math.PI * r + time * 0.2) * (Math.cos(k * a) + Math.cos((k + 1) * a + time * 0.1)) * 0.5;
      }
      case "square": {
        const k1 = Math.round(norm * 2) + 1;
        const k2 = Math.round(norm * 2.5) + 1;
        return Math.sin(k1 * Math.PI * (dx / radius + 1)) * Math.sin(k2 * Math.PI * (dy / radius + 1));
      }
      case "hex": {
        const hx = dx / radius;
        const hy = dy / radius;
        const k = Math.round(norm * 1.5) + 2;
        return Math.sin(k * Math.PI * hx + time * 0.1) * Math.cos(k * Math.PI * (hx * 0.5 + hy * 0.866) + time * 0.1) * Math.cos(k * Math.PI * (hx * 0.5 - hy * 0.866) + time * 0.08);
      }
      case "spiral": {
        const k = Math.round(norm * 1.2) + 2;
        return Math.sin(norm * 3 * Math.PI * r - k * a + time * 0.3) * Math.sin(norm * 3 * Math.PI * r + k * a - time * 0.2);
      }
      default:
        return 0;
    }
  }

  const points = [];

  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * radius;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    const val = waveVal(x, y);

    if (Math.abs(val) < damping * 3.5) {
      points.push({ x, y, v: Math.abs(val) });
    }
  }

  for (const point of points) {
    const size = 0.8 + point.v * 60;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = CYMATICS_COLORS.particle;
    ctx.globalAlpha = 0.55 + point.v * 6;
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  for (let i = 0; i < 600; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * radius;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    const val = waveVal(x, y);

    if (Math.abs(val) < damping * 1.2) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle + Math.PI / 2) * 2, y + Math.sin(angle + Math.PI / 2) * 2);
      ctx.strokeStyle = CYMATICS_COLORS.node;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

export default function CymaticsSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const fpsRef = useRef({ last: 0, count: 0 });

  const [freq, setFreq] = useState(440);
  const [damping, setDamping] = useState(0.012);
  const [mode, setMode] = useState("star");
  const [particleCount, setParticleCount] = useState(18000);
  const [playing, setPlaying] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [selectedNote, setSelectedNote] = useState("A4");
  const [showWaveform, setShowWaveform] = useState(true);
  const [fps, setFps] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    drawCymatics(canvas, freq, damping, mode, particleCount);

    const now = performance.now();
    fpsRef.current.count += 1;

    if (now - fpsRef.current.last > 500) {
      setFps(Math.round((fpsRef.current.count * 1000) / (now - fpsRef.current.last)));
      fpsRef.current = { last: now, count: 0 };
    }
  }, [freq, damping, mode, particleCount]);

  useEffect(() => {
    if (playing) {
      const loop = () => {
        draw();
        animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animRef.current);
      draw();
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [playing, draw]);

  const wavePath = useMemo(() => {
    if (!showWaveform) return "";

    return Array.from({ length: 200 }, (_, i) => {
      const x = i / 199;
      const y = Math.sin(2 * Math.PI * x * (freq / 100) * 0.5) * Math.exp(-damping * 10 * x);
      return `${i === 0 ? "M" : "L"}${(8 + x * 284).toFixed(1)},${(28 + y * 20).toFixed(1)}`;
    }).join(" ");
  }, [damping, freq, showWaveform]);

  function applyPreset(index) {
    const preset = PRESETS[index];

    setFreq(preset.freq);
    setDamping(preset.damping);
    setMode(preset.mode);
    setSelectedPreset(index);
  }

  function applyNote(note) {
    setSelectedNote(note);
    setFreq(Math.round(NOTE_FREQS[note]));
  }

  return (
    <div className="min-h-screen overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-[var(--foreground)] sm:text-2xl">Cymatics Simulator</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Sound | Vibration | Geometry</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill>{fps} FPS</StatusPill>
          <StatusPill>{freq} Hz</StatusPill>
          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)]"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm sm:p-4">
            <canvas ref={canvasRef} width={560} height={560} className="mx-auto block aspect-square w-full max-w-[560px] rounded-lg bg-[var(--section-highlight)]" />
          </div>

          {showWaveform && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
              <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Waveform Envelope</div>
              <svg width="100%" viewBox="0 0 300 56" className="block">
                <rect x="0" y="0" width="300" height="56" rx="4" fill="var(--section-highlight)" />
                <line x1="8" y1="28" x2="292" y2="28" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,3" />
                {wavePath ? <path d={wavePath} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
                <text x="10" y="52" fontSize="9" fill="var(--muted-foreground)">0</text>
                <text x="260" y="52" fontSize="9" fill="var(--muted-foreground)">{freq}Hz</text>
              </svg>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="Frequency" value={`${freq} Hz`} sub={freq < 300 ? "Low" : freq < 800 ? "Mid" : "High"} />
            <Metric label="Damping" value={damping.toFixed(3)} sub={damping < 0.01 ? "Sharp" : "Soft"} />
            <Metric label="Mode" value={mode.charAt(0).toUpperCase() + mode.slice(1)} sub="Pattern" />
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-4">
          <Panel title="Presets">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, index) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(index)}
                  className={`rounded-md border px-2 py-2 text-left transition ${selectedPreset === index ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"}`}
                >
                  <span className={`block text-xs font-semibold ${selectedPreset === index ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]"}`}>{preset.name}</span>
                  <span className={`mt-1 block text-[10px] ${selectedPreset === index ? "text-[var(--primary-foreground)] opacity-80" : "text-[var(--muted-foreground)]"}`}>{preset.label}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Musical Note">
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(NOTE_FREQS).map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => applyNote(note)}
                  className={`rounded border px-2 py-1 text-[11px] font-medium transition ${selectedNote === note ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Frequency">
            <Slider min={50} max={2000} value={freq} onChange={setFreq} label={`${freq} Hz`} />
          </Panel>

          <Panel title="Damping">
            <Slider min={1} max={30} value={Math.round(damping * 1000)} onChange={(value) => setDamping(value / 1000)} label={damping.toFixed(3)} />
          </Panel>

          <Panel title="Particles">
            <Slider min={6000} max={26000} value={particleCount} onChange={setParticleCount} label={particleCount.toLocaleString()} />
          </Panel>

          <Panel title="Vibration Pattern">
            <div className="grid grid-cols-2 gap-2">
              {MODES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-md border px-2 py-2 text-xs font-semibold capitalize transition ${mode === item ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Display">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[var(--foreground)]">Show waveform envelope</span>
              <Switch checked={showWaveform} onCheckedChange={setShowWaveform} />
            </div>
          </Panel>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[11px] leading-6 text-[var(--muted-foreground)]">
            <div className="mb-1 font-bold uppercase tracking-[0.1em] text-[var(--primary)]">About Cymatics</div>
            Cymatics reveals hidden geometry in sound. Sand or particles on a vibrating plate settle at nodal lines, the points of zero movement, creating Chladni figures.
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatusPill({ children }) {
  return <span className="rounded border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-[11px] font-semibold text-[var(--primary)]">{children}</span>;
}

function Metric({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{label}</div>
      <div className="my-1 text-lg font-bold text-[var(--foreground)] sm:text-xl">{value}</div>
      <div className="text-[10px] text-[var(--primary)]">{sub}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <div className="mb-2.5 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{title}</div>
      {children}
    </div>
  );
}

function Slider({ min, max, value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 flex-1"
        style={{ accentColor: "var(--primary)" }}
      />
      <span className="min-w-[72px] text-right text-xs font-semibold text-[var(--primary)]">
        {label}
      </span>
    </div>
  );
}
