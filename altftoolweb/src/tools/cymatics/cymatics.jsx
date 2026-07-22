"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Pause, Play, RotateCcw, Waves } from "lucide-react";

const PRESETS = [
  { name: "Classic rings", frequency: 200, damping: 0.015, mode: "radial" },
  { name: "Star pattern", frequency: 440, damping: 0.012, mode: "star" },
  { name: "Mandala", frequency: 528, damping: 0.01, mode: "mandala" },
  { name: "Square nodes", frequency: 880, damping: 0.018, mode: "square" },
  { name: "Hex matrix", frequency: 1200, damping: 0.009, mode: "hex" },
  { name: "Double spiral", frequency: 1760, damping: 0.007, mode: "spiral" },
];

const NOTES = [
  ["C3", 131],
  ["D3", 147],
  ["E3", 165],
  ["F3", 175],
  ["G3", 196],
  ["A3", 220],
  ["B3", 247],
  ["C4", 262],
  ["D4", 294],
  ["E4", 330],
  ["F4", 349],
  ["G4", 392],
  ["A4", 440],
  ["B4", 494],
  ["C5", 523],
  ["D5", 587],
  ["E5", 659],
  ["F5", 698],
  ["G5", 784],
  ["A5", 880],
  ["B5", 988],
];

const MODES = ["radial", "star", "mandala", "square", "hex", "spiral"];
const SAMPLE_COUNT = 5200;
const FRAME_INTERVAL_MS = 84;

function fraction(value) {
  return value - Math.floor(value);
}

function seededPoint(index, radius) {
  const angle = fraction(Math.sin((index + 1) * 12.9898) * 43758.5453) * Math.PI * 2;
  const distance = Math.sqrt(
    fraction(Math.sin((index + 1) * 78.233) * 9631.417),
  ) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

function waveValue({ x, y, radius, frequency, damping, mode, time }) {
  const normalizedRadius = Math.sqrt(x * x + y * y) / radius;
  const angle = Math.atan2(y, x);
  const normalizedFrequency = frequency / 200;

  switch (mode) {
    case "radial":
      return (
        Math.sin((Math.floor(normalizedFrequency * 2.2) + 2) * Math.PI * normalizedRadius + time) *
        Math.cos((Math.floor(normalizedFrequency * 1.5) + 1) * angle) *
        Math.exp(-damping * 180 * normalizedRadius)
      );
    case "mandala": {
      const arms = Math.round(normalizedFrequency * 2) + 4;
      return (
        Math.sin(normalizedFrequency * 2.8 * Math.PI * normalizedRadius + time * 0.6) *
        (Math.cos(arms * angle) + Math.cos((arms + 1) * angle + time * 0.35)) *
        0.5
      );
    }
    case "square":
      return (
        Math.sin((Math.round(normalizedFrequency * 2) + 1) * Math.PI * (x / radius + 1)) *
        Math.sin((Math.round(normalizedFrequency * 2.5) + 1) * Math.PI * (y / radius + 1))
      );
    case "hex": {
      const amount = Math.round(normalizedFrequency * 1.5) + 2;
      const nx = x / radius;
      const ny = y / radius;
      return (
        Math.sin(amount * Math.PI * nx + time * 0.25) *
        Math.cos(amount * Math.PI * (nx * 0.5 + ny * 0.866)) *
        Math.cos(amount * Math.PI * (nx * 0.5 - ny * 0.866))
      );
    }
    case "spiral": {
      const arms = Math.round(normalizedFrequency * 1.2) + 2;
      return (
        Math.sin(normalizedFrequency * 3 * Math.PI * normalizedRadius - arms * angle + time) *
        Math.sin(normalizedFrequency * 3 * Math.PI * normalizedRadius + arms * angle - time * 0.7)
      );
    }
    case "star":
    default: {
      const arms = Math.round(normalizedFrequency * 1.8) + 3;
      return (
        Math.sin(normalizedFrequency * 3.2 * Math.PI * normalizedRadius) *
        Math.cos(arms * angle + time * 0.55) *
        Math.sin(arms * 0.5 * angle - time * 0.35)
      );
    }
  }
}

function readCanvasTokens() {
  const styles = getComputedStyle(document.documentElement);
  return {
    background: styles.getPropertyValue("--card").trim(),
    border: styles.getPropertyValue("--border").trim(),
    foreground: styles.getPropertyValue("--foreground").trim(),
    primary: styles.getPropertyValue("--primary").trim(),
    secondary: styles.getPropertyValue("--secondary").trim(),
  };
}

function drawPattern(canvas, settings, elapsedTime) {
  const context = canvas.getContext("2d");
  const colors = readCanvasTokens();
  if (!context || Object.values(colors).some((color) => !color)) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.43;
  const threshold = Math.max(0.018, settings.damping * 3.1);

  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = colors.border;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
  context.stroke();

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const point = seededPoint(index, radius);
    const value = Math.abs(
      waveValue({
        ...point,
        radius,
        frequency: settings.frequency,
        damping: settings.damping,
        mode: settings.mode,
        time: elapsedTime,
      }),
    );

    if (value > threshold) continue;
    const emphasis = 1 - value / threshold;
    context.globalAlpha = 0.28 + emphasis * 0.65;
    context.fillStyle = index % 7 === 0 ? colors.secondary : colors.primary;
    const size = 1.1 + emphasis * 1.7;
    context.fillRect(centerX + point.x, centerY + point.y, size, size);
  }

  context.globalAlpha = 1;
  context.fillStyle = colors.foreground;
  context.beginPath();
  context.arc(centerX, centerY, 3, 0, Math.PI * 2);
  context.fill();
}

function ControlSection({ children, title }) {
  return (
    <section className="border-b border-border p-4 last:border-b-0">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function CymaticsSimulator() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const [frequency, setFrequency] = useState(440);
  const [damping, setDamping] = useState(0.012);
  const [mode, setMode] = useState("star");
  const [playing, setPlaying] = useState(true);

  const settings = useMemo(
    () => ({ damping, frequency, mode }),
    [damping, frequency, mode],
  );

  const draw = useCallback(
    (timestamp = 0) => {
      if (!canvasRef.current) return;
      drawPattern(canvasRef.current, settings, timestamp / 4200);
    },
    [settings],
  );

  useEffect(() => {
    const root = document.documentElement;
    const themeObserver = new MutationObserver(() => draw(performance.now()));
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });

    if (!playing) {
      draw(performance.now());
      return () => themeObserver.disconnect();
    }

    const animate = (timestamp) => {
      if (timestamp - lastFrameRef.current >= FRAME_INTERVAL_MS) {
        draw(timestamp);
        lastFrameRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
      themeObserver.disconnect();
    };
  }, [draw, playing]);

  const applyPreset = (preset) => {
    setFrequency(preset.frequency);
    setDamping(preset.damping);
    setMode(preset.mode);
  };

  const reset = () => {
    setFrequency(440);
    setDamping(0.012);
    setMode("star");
    setPlaying(true);
  };

  const waveform = useMemo(() => {
    const points = Array.from({ length: 120 }, (_, index) => {
      const x = index / 119;
      const y =
        Math.sin(Math.PI * 2 * x * (frequency / 210)) *
        Math.exp(-damping * 10 * x);
      return `${index === 0 ? "M" : "L"}${(x * 300).toFixed(1)},${(32 + y * 22).toFixed(1)}`;
    });
    return points.join(" ");
  }, [damping, frequency]);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-primary">Sound visualization lab</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Cymatics Simulator</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Explore how frequency and damping form geometric nodal patterns on a vibrating plate.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={reset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setPlaying((current) => !current)}
              type="button"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 rounded-lg border border-border bg-card shadow-sm">
            <div className="aspect-square w-full min-w-0 p-3 sm:p-5">
              <canvas
                aria-label={`Cymatics ${mode} pattern at ${frequency} hertz`}
                className="h-full w-full rounded-md bg-card"
                height="720"
                ref={canvasRef}
                role="img"
                width="720"
              />
            </div>

            <div className="grid border-t border-border sm:grid-cols-3">
              {[
                ["Frequency", `${frequency} Hz`],
                ["Damping", damping.toFixed(3)],
                ["Pattern", mode.charAt(0).toUpperCase() + mode.slice(1)],
              ].map(([label, value]) => (
                <div className="border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={label}>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Waveform envelope</p>
              <svg aria-label="Current waveform envelope" className="mt-2 h-20 w-full" role="img" viewBox="0 0 300 64">
                <line stroke="var(--border)" strokeDasharray="4 4" x1="0" x2="300" y1="32" y2="32" />
                <path d={waveform} fill="none" stroke="var(--primary)" strokeLinecap="round" strokeWidth="1.5" />
              </svg>
            </div>
          </section>

          <aside className="self-start overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <ControlSection title="Presets">
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => {
                  const selected =
                    preset.frequency === frequency &&
                    preset.damping === damping &&
                    preset.mode === mode;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected
                          ? "border-primary bg-muted text-primary"
                          : "border-border hover:border-primary hover:text-primary"
                        }`}
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      type="button"
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </ControlSection>

            <ControlSection title="Frequency">
              <label className="flex items-center justify-between gap-3 text-sm font-medium" htmlFor="cymatics-frequency">
                Frequency
                <output className="font-mono text-primary">{frequency} Hz</output>
              </label>
              <input
                className="mt-3 w-full accent-primary"
                id="cymatics-frequency"
                max="2000"
                min="50"
                onChange={(event) => setFrequency(Number(event.target.value))}
                type="range"
                value={frequency}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {NOTES.map(([note, noteFrequency]) => (
                  <button
                    className="min-h-9 min-w-9 rounded-md border border-border px-2 text-xs font-semibold transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    key={note}
                    onClick={() => setFrequency(noteFrequency)}
                    title={`${noteFrequency} Hz`}
                    type="button"
                  >
                    {note}
                  </button>
                ))}
              </div>
            </ControlSection>

            <ControlSection title="Damping">
              <label className="flex items-center justify-between gap-3 text-sm font-medium" htmlFor="cymatics-damping">
                Nodal sharpness
                <output className="font-mono text-primary">{damping.toFixed(3)}</output>
              </label>
              <input
                className="mt-3 w-full accent-primary"
                id="cymatics-damping"
                max="30"
                min="5"
                onChange={(event) => setDamping(Number(event.target.value) / 1000)}
                type="range"
                value={Math.round(damping * 1000)}
              />
            </ControlSection>

            <ControlSection title="Pattern">
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((pattern) => (
                  <button
                    aria-pressed={mode === pattern}
                    className={`min-h-11 rounded-md border px-3 text-sm font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${mode === pattern
                        ? "border-primary bg-muted text-primary"
                        : "border-border hover:border-primary hover:text-primary"
                      }`}
                    key={pattern}
                    onClick={() => setMode(pattern)}
                    type="button"
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </ControlSection>

            <section className="flex gap-3 bg-muted p-4 text-sm leading-6 text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p>
                This is an educational visualization. Real Chladni figures depend on plate material,
                geometry, mounting, and excitation position.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
