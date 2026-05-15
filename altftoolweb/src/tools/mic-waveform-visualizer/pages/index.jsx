"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Mic, Play, SlidersHorizontal, Square } from "lucide-react";

const THEME = {
  accent: "#2563eb",
  accentDim: "#1d4ed8",
  accentGlow: "rgba(37,99,235,0.18)",
  waveA: "#2563eb",
  waveB: "#7c3aed",
  waveC: "#db2777",
  danger: "#ef4444",
};

const MODES = [
  { id: "oscilloscope", label: "Oscilloscope" },
  { id: "frequency", label: "Frequency" },
  { id: "circular", label: "Circular" },
  { id: "bars", label: "Bars" },
];

const COLOR_LABELS = ["Solid", "Gradient", "Spectrum"];

export default function MicWaveformVisualizer() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const timeDataRef = useRef(null);
  const freqDataRef = useRef(null);
  const modeRef = useRef("oscilloscope");
  const gainRef = useRef(1.5);
  const colorRef = useRef(0);
  const lastStatsRef = useRef(0);
  const drawLoopRef = useRef(null);

  const [active, setActive] = useState(false);
  const [mode, setMode] = useState("oscilloscope");
  const [volume, setVolume] = useState(0);
  const [peak, setPeak] = useState(0);
  const [freq, setFreq] = useState(0);
  const [error, setError] = useState(null);
  const [smoothing, setSmoothing] = useState(0.85);
  const [gain, setGain] = useState(1.5);
  const [colorMode, setColorMode] = useState(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    gainRef.current = gain;
  }, [gain]);

  useEffect(() => {
    colorRef.current = colorMode;
  }, [colorMode]);

  useEffect(() => {
    if (analyserRef.current) analyserRef.current.smoothingTimeConstant = smoothing;
  }, [smoothing]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  }, []);

  useEffect(() => {
    resizeCanvas();

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [resizeCanvas]);

  const getWaveColor = useCallback((i, total) => {
    const t = total > 0 ? i / total : 0;

    if (colorRef.current === 0) return THEME.waveA;

    if (colorRef.current === 1) {
      const r = Math.round(t * 124);
      const g = Math.round(245 - t * 70);
      const b = Math.round(196 + t * 67);
      return `rgb(${r},${g},${b})`;
    }

    const hue = Math.round(160 + t * 200);
    return `hsl(${hue},100%,60%)`;
  }, []);

  const updateStats = useCallback((rms, dominantFreq) => {
    const now = performance.now();
    if (now - lastStatsRef.current < 80) return;

    lastStatsRef.current = now;
    setVolume(Math.min(rms, 1));
    setPeak((current) => Math.min(Math.max(current * 0.985, rms), 1));
    setFreq(dominantFreq);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const timeData = timeDataRef.current;
    const freqData = freqDataRef.current;
    if (!canvas || !analyser || !timeData || !freqData) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;

    analyser.getByteTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    let sumSq = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      sumSq += ((timeData[i] - 128) / 128) ** 2;
    }

    const rms = Math.sqrt(sumSq / bufferLength) * gainRef.current;
    let maxFreqIdx = 0;
    for (let i = 1; i < bufferLength; i += 1) {
      if (freqData[i] > freqData[maxFreqIdx]) maxFreqIdx = i;
    }

    const sampleRate = audioCtxRef.current?.sampleRate || 44100;
    updateStats(rms, Math.round((maxFreqIdx * sampleRate) / analyser.fftSize));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(2, 6, 23, 0.24)";
    ctx.fillRect(0, 0, width, height);

    if (modeRef.current === "oscilloscope") {
      ctx.lineWidth = Math.max(2, width / 420);

      for (let i = 0; i < bufferLength - 1; i += 1) {
        const x = (i / bufferLength) * width;
        const y = height / 2 + ((timeData[i] / 128 - 1) * gainRef.current) * (height / 2 - 24);
        const nx = ((i + 1) / bufferLength) * width;
        const ny = height / 2 + ((timeData[i + 1] / 128 - 1) * gainRef.current) * (height / 2 - 24);

        ctx.strokeStyle = getWaveColor(i, bufferLength);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }

    if (modeRef.current === "frequency") {
      const visibleBins = Math.floor(bufferLength / 2);
      const barWidth = width / visibleBins;

      for (let i = 0; i < visibleBins; i += 1) {
        const value = Math.min((freqData[i] / 255) * gainRef.current, 1);
        const barHeight = value * height;
        const x = i * barWidth;

        ctx.fillStyle = getWaveColor(i, visibleBins);
        ctx.fillRect(x, height - barHeight, Math.max(1, barWidth * 0.72), barHeight);
      }
    }

    if (modeRef.current === "circular") {
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.25;

      ctx.beginPath();
      for (let i = 0; i < bufferLength; i += 1) {
        const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;
        const raw = (timeData[i] / 128 - 1) * gainRef.current;
        const radius = baseRadius + raw * baseRadius * 0.8;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colorRef.current === 0 ? THEME.waveA : THEME.waveB;
      ctx.lineWidth = Math.max(2, width / 480);
      ctx.shadowBlur = 22;
      ctx.shadowColor = THEME.accent;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(8, baseRadius * 0.11), 0, Math.PI * 2);
      ctx.fillStyle = THEME.accent;
      ctx.fill();
    }

    if (modeRef.current === "bars") {
      const count = 64;
      const slot = width / count;
      const barWidth = slot * 0.66;

      for (let i = 0; i < count; i += 1) {
        const idx = Math.floor((i / count) * bufferLength * 0.5);
        const value = Math.min((freqData[idx] / 255) * gainRef.current, 1);
        const barHeight = value * (height - 24);
        const x = i * slot + (slot - barWidth) / 2;

        ctx.fillStyle = getWaveColor(i, count);
        ctx.fillRect(x, height - barHeight - 5, barWidth, 5);
        ctx.globalAlpha = 0.52;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        ctx.globalAlpha = 1;
      }
    }

    animRef.current = requestAnimationFrame(() => drawLoopRef.current?.());
  }, [getWaveColor, updateStats]);

  useEffect(() => {
    drawLoopRef.current = draw;
  }, [draw]);

  const stop = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioCtxRef.current?.close();

    animRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    timeDataRef.current = null;
    freqDataRef.current = null;

    setActive(false);
    setVolume(0);
    setPeak(0);
    setFreq(0);

    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone capture is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = smoothing;
      source.connect(analyser);

      streamRef.current = stream;
      audioCtxRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      timeDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      resizeCanvas();
      setActive(true);
      animRef.current = requestAnimationFrame(() => drawLoopRef.current?.());
    } catch (event) {
      setError(
        event?.name === "NotAllowedError"
          ? "Microphone access denied. Allow mic permissions and try again."
          : "Microphone input could not be started. Check your browser permissions and try again.",
      );
    }
  }, [resizeCanvas, smoothing]);

  useEffect(() => stop, [stop]);

  const volumePct = Math.round(volume * 100);
  const peakPct = Math.round(peak * 100);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 md:py-14 lg:px-8">
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl shadow-black/5 sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-[800px] flex-col items-center">
          <header className="mb-6 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 text-center shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--section-highlight)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--secondary)]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--muted-foreground)] transition"
                  style={{
                    background: active ? "var(--primary)" : "var(--muted-foreground)",
                    boxShadow: active ? "0 0 10px var(--primary)" : "none",
                  }}
                />
                {active ? "Listening" : "Ready"}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                {mode}
              </span>
            </div>
            <h1 className="mb-3 text-center text-2xl font-black tracking-tight text-[var(--primary)] sm:text-4xl">
              Mic Waveform Visualizer
            </h1>
            <p className="description mx-auto max-w-2xl text-center text-[var(--secondary)]">
              Turn microphone input into responsive waveform, spectrum, and circular audio visuals.
            </p>
          </header>

          <section
            className="relative mb-5 w-full overflow-hidden rounded-xl border bg-slate-950 shadow-lg transition"
            style={{
              borderColor: active ? "var(--primary)" : "var(--border)",
              boxShadow: active ? `0 0 30px ${THEME.accentGlow}` : "none",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <canvas ref={canvasRef} className="block h-[220px] w-full sm:h-[280px]" />

            {!active ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <Mic className="h-7 w-7 text-slate-400" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-300">
                  Awaiting Input
                </p>
                <p className="text-xs text-slate-500">
                  press start to activate microphone
                </p>
              </div>
            ) : null}

            <div
              className="absolute right-3 top-3 rounded-md border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur"
            >
              {mode}
            </div>
          </section>

          <section className="mb-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Volume" value={`${volumePct}%`} bar={volumePct} />
            <StatCard label="Peak" value={`${peakPct}%`} bar={peakPct} danger={peakPct > 85} />
            <StatCard label="Frequency" value={active ? `${freq} Hz` : "-"} />
          </section>

          <section className="mb-5 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {MODES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide shadow-sm transition ${
                    mode === id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_10px_25px_rgba(37,99,235,0.22)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)] hover:shadow-md"
                  }`}
                >
                  {label}
                </button>
              ))}
          </section>

          <section className="mb-6 grid w-full grid-cols-1 gap-3 lg:grid-cols-3">
            <RangeControl
              label="Smoothing"
              valueLabel={`${Math.round(smoothing * 100)}%`}
              min={0}
              max={0.99}
              step={0.01}
              value={smoothing}
              onChange={setSmoothing}
            />
            <RangeControl
              label="Gain"
              valueLabel={`${gain.toFixed(1)}x`}
              min={0.5}
              max={5}
              step={0.1}
              value={gain}
              onChange={setGain}
            />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                Color <span className="text-[var(--primary)]">{COLOR_LABELS[colorMode]}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setColorMode(index)}
                    className={`rounded-md border px-1 py-1.5 text-[9px] font-bold uppercase tracking-wide transition ${
                      colorMode === index
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {error ? (
            <section
              className="mb-5 w-full rounded-lg border border-red-300 bg-red-50 p-3 text-xs tracking-[0.03em] text-red-700 dark:border-red-500/50 dark:bg-red-950/30 dark:text-red-200"
            >
              {error}
            </section>
          ) : null}

          <button
            type="button"
            onClick={active ? stop : start}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-10 py-3 text-xs font-bold uppercase tracking-widest shadow-sm transition ${
              active
                ? "border-red-500 bg-transparent text-red-500 hover:bg-red-500/10"
                : "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_30px_rgba(37,99,235,0.24)] hover:bg-[var(--primary-hover)]"
            }`}
          >
            {active ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {active ? "Stop" : "Start"}
          </button>

          <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            Requires microphone permission - processed locally
          </p>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, bar, danger = false }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--primary)]">{value}</p>
      {typeof bar === "number" ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${Math.min(bar, 100)}%`,
              background: danger ? THEME.danger : "var(--primary)",
            }}
          />
        </div>
      ) : null}
    </article>
  );
}

function RangeControl({ label, valueLabel, min, max, step, value, onChange }) {
  return (
    <label className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm transition hover:border-[var(--primary)]">
      <span className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
        <span>{label}</span>
        <span className="text-[var(--primary)]">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--primary)]"
      />
    </label>
  );
}
