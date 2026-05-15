"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Switch } from "@/shared/ui/Switch";

const BRAINWAVE_PRESETS = [
  { name: "Deep Sleep", base: 100, beat: 2, category: "Delta" },
  { name: "Meditation", base: 150, beat: 6, category: "Theta" },
  { name: "Relaxed Focus", base: 200, beat: 10, category: "Alpha" },
  { name: "Flow State", base: 250, beat: 20, category: "Beta" },
  { name: "Peak Focus", base: 300, beat: 40, category: "Gamma" },
  { name: "Lucid Dream", base: 120, beat: 7, category: "Theta" },
];

const SOLFEGGIO = [
  { name: "UT", freq: 174, desc: "Pain relief and security" },
  { name: "RE", freq: 285, desc: "Tissue healing and energy" },
  { name: "MI", freq: 396, desc: "Liberate guilt and fear" },
  { name: "FA", freq: 417, desc: "Facilitate change" },
  { name: "SOL", freq: 528, desc: "DNA repair and transformation" },
  { name: "LA", freq: 639, desc: "Relationship harmony" },
  { name: "SI", freq: 741, desc: "Expression and solutions" },
  { name: "OM", freq: 852, desc: "Spiritual awakening" },
  { name: "963", freq: 963, desc: "Divine consciousness" },
];

const JOURNEY_PROGRAMS = [
  {
    name: "Sleep Induction",
    steps: [
      { beat: 12, duration: 120, label: "Unwind" },
      { beat: 7, duration: 180, label: "Drift" },
      { beat: 3, duration: 300, label: "Deep Sleep" },
    ],
  },
  {
    name: "Focus Ramp",
    steps: [
      { beat: 10, duration: 120, label: "Calm" },
      { beat: 18, duration: 180, label: "Active" },
      { beat: 40, duration: 300, label: "Peak" },
    ],
  },
  {
    name: "Meditation Journey",
    steps: [
      { beat: 10, duration: 120, label: "Relax" },
      { beat: 6, duration: 240, label: "Meditate" },
      { beat: 3, duration: 240, label: "Deep" },
      { beat: 7, duration: 120, label: "Emerge" },
    ],
  },
  {
    name: "Creativity Boost",
    steps: [
      { beat: 8, duration: 120, label: "Open" },
      { beat: 6, duration: 240, label: "Creative" },
      { beat: 10, duration: 120, label: "Flow" },
    ],
  },
];

const TABS = ["Binaural", "Isochronic", "Solfeggio", "Journey", "Settings"];

function getBrainwaveCat(hz) {
  if (hz <= 4) return "Delta";
  if (hz <= 8) return "Theta";
  if (hz <= 14) return "Alpha";
  if (hz <= 30) return "Beta";
  return "Gamma";
}

function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function BinauralBeatGenerator() {
  const [tab, setTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(10);
  const [volume, setVolume] = useState(0.4);
  const [activePreset, setActivePreset] = useState(2);
  const [audioMode, setAudioMode] = useState("binaural");
  const [isoFreq, setIsoFreq] = useState(10);
  const [isoBase, setIsoBase] = useState(200);
  const [isoDepth, setIsoDepth] = useState(1);
  const [solfreqIdx, setSolfreqIdx] = useState(4);
  const [journeyIdx, setJourneyIdx] = useState(0);
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [journeyStepTime, setJourneyStepTime] = useState(0);
  const [leftGainDb, setLeftGainDb] = useState(0);
  const [rightGainDb, setRightGainDb] = useState(0);
  const [noiseType, setNoiseType] = useState("none");
  const [noiseVol, setNoiseVol] = useState(0.05);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeOut, setFadeOut] = useState(true);
  const [breathingOn, setBreathingOn] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathProgress, setBreathProgress] = useState(0);
  const [savedPresets, setSavedPresets] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("bbg_presets") || "[]");
    } catch {
      return [];
    }
  });
  const [presetName, setPresetName] = useState("");

  const ctxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const isoOscRef = useRef(null);
  const isoLfoRef = useRef(null);
  const leftGainNodeRef = useRef(null);
  const rightGainNodeRef = useRef(null);
  const mainGainRef = useRef(null);
  const noiseRef = useRef(null);
  const noiseGainRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const journeyTimerRef = useRef(null);
  const canvasRef = useRef(null);
  const breathCanvasRef = useRef(null);
  const phaseRef = useRef(0);

  const cat = getBrainwaveCat(audioMode === "isochronic" ? isoFreq : beatFreq);
  const sol = SOLFEGGIO[solfreqIdx];
  const prog = JOURNEY_PROGRAMS[journeyIdx];

  const createNoise = useCallback((ctx, type) => {
    if (type === "none") return null;

    const size = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < size; i += 1) data[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;

      for (let i = 0; i < size; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
      }
    } else if (type === "brown") {
      let last = 0;

      for (let i = 0; i < size; i += 1) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  const stopAll = useCallback(() => {
    [leftOscRef, rightOscRef, isoOscRef, isoLfoRef, noiseRef].forEach((ref) => {
      if (!ref.current) return;
      try {
        ref.current.stop();
      } catch {}
      ref.current = null;
    });

    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }

    clearInterval(timerRef.current);
    clearInterval(breathTimerRef.current);
    clearInterval(journeyTimerRef.current);
  }, []);

  const startAudio = useCallback(async (modeOverride, beatOverride) => {
    stopAll();

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(fadeIn ? 0.0001 : volume, ctx.currentTime);
    if (fadeIn) mainGain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), ctx.currentTime + 3);
    mainGain.connect(analyser);
    analyser.connect(ctx.destination);
    mainGainRef.current = mainGain;

    const mode = modeOverride || audioMode;
    const beatHz = beatOverride ?? beatFreq;

    if (mode === "binaural") {
      const merger = ctx.createChannelMerger(2);
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();

      leftGain.gain.value = dbToLinear(leftGainDb);
      rightGain.gain.value = dbToLinear(rightGainDb);
      leftOsc.type = "sine";
      rightOsc.type = "sine";
      leftOsc.frequency.value = baseFreq;
      rightOsc.frequency.value = baseFreq + beatHz;

      leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0);
      rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1);
      merger.connect(mainGain);

      leftOsc.start();
      rightOsc.start();
      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      leftGainNodeRef.current = leftGain;
      rightGainNodeRef.current = rightGain;
    } else if (mode === "isochronic") {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const pulseGain = ctx.createGain();
      const offset = ctx.createConstantSource();

      osc.type = "sine";
      osc.frequency.value = isoBase;
      lfo.type = "sine";
      lfo.frequency.value = isoFreq;
      lfoGain.gain.value = 0.5 * isoDepth;
      offset.offset.value = 0.5;
      pulseGain.gain.value = 0.5;

      lfo.connect(lfoGain);
      lfoGain.connect(pulseGain.gain);
      offset.connect(pulseGain.gain);
      osc.connect(pulseGain);
      pulseGain.connect(mainGain);

      osc.start();
      lfo.start();
      offset.start();
      isoOscRef.current = osc;
      isoLfoRef.current = lfo;
    } else if (mode === "solfeggio") {
      const merger = ctx.createChannelMerger(2);
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();

      leftOsc.type = "sine";
      rightOsc.type = "sine";
      leftOsc.frequency.value = sol.freq;
      rightOsc.frequency.value = sol.freq;
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);
      merger.connect(mainGain);
      leftOsc.start();
      rightOsc.start();
      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
    }

    if (noiseType !== "none") {
      const noise = createNoise(ctx, noiseType);

      if (noise) {
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = noiseVol;
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();
        noiseRef.current = noise;
        noiseGainRef.current = noiseGain;
      }
    }

    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((current) => {
        const next = current + 1;

        if (duration > 0 && next >= duration * 60) {
          if (fadeOut && mainGainRef.current && ctxRef.current) {
            mainGainRef.current.gain.setTargetAtTime(0.0001, ctxRef.current.currentTime, 3);
            setTimeout(() => {
              stopAll();
              setIsPlaying(false);
              setJourneyActive(false);
            }, 4000);
          } else {
            stopAll();
            setIsPlaying(false);
            setJourneyActive(false);
          }
        }

        return next;
      });
    }, 1000);
  }, [
    audioMode,
    baseFreq,
    beatFreq,
    createNoise,
    duration,
    fadeIn,
    fadeOut,
    isoBase,
    isoDepth,
    isoFreq,
    leftGainDb,
    noiseType,
    noiseVol,
    rightGainDb,
    sol.freq,
    stopAll,
    volume,
  ]);

  useEffect(() => {
    if (!ctxRef.current) return;
    mainGainRef.current?.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.1);
  }, [volume]);

  useEffect(() => {
    if (!ctxRef.current) return;
    leftOscRef.current?.frequency.setTargetAtTime(baseFreq, ctxRef.current.currentTime, 0.1);
    rightOscRef.current?.frequency.setTargetAtTime(baseFreq + beatFreq, ctxRef.current.currentTime, 0.1);
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (!ctxRef.current) return;
    leftGainNodeRef.current?.gain.setTargetAtTime(dbToLinear(leftGainDb), ctxRef.current.currentTime, 0.1);
    rightGainNodeRef.current?.gain.setTargetAtTime(dbToLinear(rightGainDb), ctxRef.current.currentTime, 0.1);
  }, [leftGainDb, rightGainDb]);

  useEffect(() => {
    if (!ctxRef.current || !noiseGainRef.current) return;
    noiseGainRef.current.gain.setTargetAtTime(noiseVol, ctxRef.current.currentTime, 0.1);
  }, [noiseVol]);

  useEffect(() => {
    if (!breathingOn) {
      clearInterval(breathTimerRef.current);
      return;
    }

    const cycle = 8000;
    const start = Date.now();

    breathTimerRef.current = setInterval(() => {
      const progress = ((Date.now() - start) % cycle) / cycle;

      if (progress < 0.5) {
        setBreathPhase("inhale");
        setBreathProgress(progress / 0.5);
      } else {
        setBreathPhase("exhale");
        setBreathProgress((progress - 0.5) / 0.5);
      }
    }, 50);

    return () => clearInterval(breathTimerRef.current);
  }, [breathingOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "rgb(37, 99, 235)";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = primaryColor;

      if (analyserRef.current && isPlaying) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(data);
        ctx.beginPath();
        data.forEach((value, index) => {
          const x = (index / data.length) * width;
          const y = (value / 128) * (height / 2);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else {
        phaseRef.current += 0.018;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 1) {
          const y = height / 2 + Math.sin((x / width) * Math.PI * 6 + phaseRef.current) * 16 * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = breathCanvasRef.current;
    if (!canvas || !breathingOn) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const scale = breathPhase === "inhale" ? 0.3 + breathProgress * 0.55 : 0.85 - breathProgress * 0.55;
      const radius = (Math.min(width, height) / 2) * scale;

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "rgb(37, 99, 235)";
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [breathingOn, breathPhase, breathProgress]);

  useEffect(() => () => stopAll(), [stopAll]);

  async function togglePlay() {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
      setJourneyActive(false);
      return;
    }

    await startAudio();
    setIsPlaying(true);
  }

  async function startJourney() {
    const program = JOURNEY_PROGRAMS[journeyIdx];
    const firstBeat = program.steps[0].beat;

    setJourneyStep(0);
    setJourneyStepTime(0);
    setJourneyActive(true);
    setBeatFreq(firstBeat);
    await startAudio("binaural", firstBeat);
    setIsPlaying(true);

    let step = 0;
    let elapsed = 0;

    journeyTimerRef.current = setInterval(() => {
      elapsed += 1;
      setJourneyStepTime(elapsed);

      if (elapsed < program.steps[step].duration) return;

      step += 1;

      if (step >= program.steps.length) {
        clearInterval(journeyTimerRef.current);
        stopAll();
        setIsPlaying(false);
        setJourneyActive(false);
        return;
      }

      elapsed = 0;
      setJourneyStep(step);
      setBeatFreq(program.steps[step].beat);
    }, 1000);
  }

  function savePreset() {
    if (!presetName.trim()) return;

    const next = [
      ...savedPresets,
      { name: presetName.trim(), baseFreq, beatFreq, volume, noiseType, noiseVol, audioMode },
    ];

    setSavedPresets(next);
    localStorage.setItem("bbg_presets", JSON.stringify(next));
    setPresetName("");
  }

  function loadPreset(preset) {
    setBaseFreq(preset.baseFreq);
    setBeatFreq(preset.beatFreq);
    setVolume(preset.volume);
    setNoiseType(preset.noiseType || "none");
    setNoiseVol(preset.noiseVol || 0.05);
    setAudioMode(preset.audioMode || "binaural");
  }

  function deletePreset(index) {
    const next = savedPresets.filter((_, itemIndex) => itemIndex !== index);
    setSavedPresets(next);
    localStorage.setItem("bbg_presets", JSON.stringify(next));
  }

  return (
    <div className="min-h-screen rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Neural Audio Lab</p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Binaural Beat Generator</h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Generate focused binaural, isochronic, and solfeggio tones in the browser.</p>
            </div>
            <button
              type="button"
              disabled={journeyActive}
              onClick={togglePlay}
              className="rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlaying ? "Stop Audio" : "Start Audio"}
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">{cat} Wave | {audioMode}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{isPlaying ? "Active" : "Standby"} | {formatTime(timer)}</div>
          </div>
          <canvas ref={canvasRef} width={720} height={80} className="block h-20 w-full rounded-lg bg-[var(--section-highlight)]" />
        </section>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(index)}
              className={`shrink-0 rounded-md border px-4 py-2 text-xs font-semibold transition ${tab === index ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}
            >
              {item}
            </button>
          ))}
        </nav>

        {tab === 0 && (
          <div className="flex flex-col gap-5">
            <Panel title="Brainwave Presets">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BRAINWAVE_PRESETS.map((preset, index) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setActivePreset(index);
                      setBaseFreq(preset.base);
                      setBeatFreq(preset.beat);
                      setAudioMode("binaural");
                    }}
                    className={`rounded-lg border p-3 text-left transition ${activePreset === index ? "border-[var(--primary)] bg-[var(--section-highlight)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{preset.name}</span>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">{preset.category}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{preset.base}Hz + {preset.beat}Hz</p>
                  </button>
                ))}
              </div>
            </Panel>

            <ControlGrid>
              <SliderCard label="Base Frequency" value={baseFreq} unit="Hz" min={60} max={500} step={1} onChange={setBaseFreq} sublabel={`Left ${baseFreq}Hz | Right ${baseFreq + beatFreq}Hz`} />
              <SliderCard label="Beat Frequency" value={beatFreq} unit="Hz" min={0.5} max={40} step={0.5} onChange={setBeatFreq} sublabel={`${cat} | ${beatFreq}Hz binaural`} />
              <SliderCard label="Volume" value={Math.round(volume * 100)} unit="%" min={0} max={100} step={1} onChange={(value) => setVolume(value / 100)} sublabel="Master level" />
              <SliderCard label="Session Timer" value={duration} unit={duration === 0 ? "inf" : "min"} min={0} max={120} step={5} onChange={setDuration} sublabel={duration === 0 ? "Infinite session" : `Auto-stop in ${duration}m`} />
            </ControlGrid>
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-5">
            <InfoBox title="Isochronic Tones">
              Pulse a single tone on and off at the target brainwave frequency. They can work without headphones and may feel more intense.
            </InfoBox>
            <ControlGrid>
              <SliderCard label="Carrier Frequency" value={isoBase} unit="Hz" min={60} max={600} step={1} onChange={setIsoBase} sublabel="Base tone frequency" />
              <SliderCard label="Pulse Rate" value={isoFreq} unit="Hz" min={0.5} max={40} step={0.5} onChange={setIsoFreq} sublabel={`${getBrainwaveCat(isoFreq)} pulse`} />
              <SliderCard label="Pulse Depth" value={Math.round(isoDepth * 100)} unit="%" min={0} max={100} step={1} onChange={(value) => setIsoDepth(value / 100)} sublabel="Modulation intensity" />
              <SliderCard label="Volume" value={Math.round(volume * 100)} unit="%" min={0} max={100} step={1} onChange={(value) => setVolume(value / 100)} sublabel="Master level" />
            </ControlGrid>
          </div>
        )}

        {tab === 2 && (
          <div className="flex flex-col gap-5">
            <InfoBox title="Solfeggio Frequencies">
              Select a single pure tone commonly used in sound meditation and tonal practice.
            </InfoBox>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SOLFEGGIO.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setSolfreqIdx(index);
                    setAudioMode("solfeggio");
                  }}
                  className={`rounded-lg border p-3 text-left transition ${solfreqIdx === index ? "border-[var(--primary)] bg-[var(--section-highlight)]" : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-[var(--foreground)]">{item.name}</span>
                    <span className="text-lg font-bold text-[var(--primary)]">{item.freq}Hz</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.desc}</p>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{sol.name} Active Frequency</div>
              <div className="mt-2 text-5xl font-bold text-[var(--primary)]">{sol.freq}<span className="text-lg">Hz</span></div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{sol.desc}</p>
            </div>
          </div>
        )}

        {tab === 3 && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {JOURNEY_PROGRAMS.map((program, index) => (
                <button
                  key={program.name}
                  type="button"
                  onClick={() => setJourneyIdx(index)}
                  className={`rounded-lg border p-3 text-left transition ${journeyIdx === index ? "border-[var(--primary)] bg-[var(--section-highlight)]" : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"}`}
                >
                  <div className="text-sm font-semibold text-[var(--foreground)]">{program.name}</div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{program.steps.length} stages | {Math.round(program.steps.reduce((acc, step) => acc + step.duration, 0) / 60)} min</p>
                </button>
              ))}
            </div>

            <Panel title="Journey Stages">
              <div className="grid gap-3 md:grid-cols-4">
                {prog.steps.map((step, index) => {
                  const isActive = journeyActive && journeyStep === index;
                  const isDone = journeyActive && journeyStep > index;
                  const percent = isActive ? Math.min((journeyStepTime / step.duration) * 100, 100) : isDone ? 100 : 0;

                  return (
                    <div key={step.label} className={`rounded-lg border p-3 ${isActive ? "border-[var(--primary)] bg-[var(--section-highlight)]" : "border-[var(--border)] bg-[var(--background)]"}`}>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Stage {index + 1}</div>
                      <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{step.label}</div>
                      <div className="mt-1 text-xs text-[var(--muted-foreground)]">{step.beat}Hz | {Math.round(step.duration / 60)}m</div>
                      <div className="mt-3 h-1.5 rounded-full bg-[var(--muted)]">
                        <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {!journeyActive ? (
              <button type="button" onClick={startJourney} className="rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
                Start Journey: {prog.name}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  stopAll();
                  setIsPlaying(false);
                  setJourneyActive(false);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                Stop Journey | Stage {journeyStep + 1}/{prog.steps.length} | {formatTime(journeyStepTime)}
              </button>
            )}
          </div>
        )}

        {tab === 4 && (
          <div className="flex flex-col gap-5">
            <ControlGrid>
              <SliderCard label="Left Ear Gain" value={leftGainDb} unit="dB" min={-20} max={20} step={1} onChange={setLeftGainDb} sublabel={`${dbToLinear(leftGainDb).toFixed(2)}x linear`} />
              <SliderCard label="Right Ear Gain" value={rightGainDb} unit="dB" min={-20} max={20} step={1} onChange={setRightGainDb} sublabel={`${dbToLinear(rightGainDb).toFixed(2)}x linear`} />
            </ControlGrid>

            <Panel title="Background Noise">
              <div className="mb-4 flex flex-wrap gap-2">
                {["none", "white", "pink", "brown"].map((item) => (
                  <Pill key={item} active={noiseType === item} onClick={() => setNoiseType(item)}>{item}</Pill>
                ))}
              </div>
              {noiseType !== "none" ? (
                <SliderCard label="Noise Level" value={Math.round(noiseVol * 100)} unit="%" min={0} max={50} step={1} onChange={(value) => setNoiseVol(value / 100)} sublabel="Background noise volume" />
              ) : null}
            </Panel>

            <Panel title="Playback Options">
              <div className="grid gap-3 sm:grid-cols-3">
                <Toggle label="Fade in" value={fadeIn} onChange={setFadeIn} />
                <Toggle label="Fade out" value={fadeOut} onChange={setFadeOut} />
                <Toggle label="Breathing guide" value={breathingOn} onChange={setBreathingOn} />
              </div>
            </Panel>

            {breathingOn ? (
              <Panel title="Breathing Guide">
                <canvas ref={breathCanvasRef} width={140} height={140} className="mx-auto mb-3 block h-[140px] w-[140px]" />
                <div className="text-center text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{breathPhase}</div>
                <div className="mt-1 text-center text-xs text-[var(--muted-foreground)]">4 sec inhale | 4 sec exhale</div>
              </Panel>
            ) : null}

            <Panel title="Custom Presets">
              <div className="mb-4 flex gap-2">
                <input
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="Preset name"
                  className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
                <button type="button" onClick={savePreset} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">Save</button>
              </div>
              {savedPresets.length === 0 ? <div className="rounded-lg bg-[var(--muted)] p-4 text-center text-sm text-[var(--muted-foreground)]">No saved presets yet</div> : null}
              <div className="flex flex-col gap-2">
                {savedPresets.map((preset, index) => (
                  <div key={`${preset.name}-${index}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--foreground)]">{preset.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{preset.baseFreq}Hz + {preset.beatFreq}Hz | {preset.audioMode}</div>
                    </div>
                    <button type="button" onClick={() => loadPreset(preset)} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]">Load</button>
                    <button type="button" onClick={() => deletePreset(index)} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]">Delete</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Readout label="Left Ear" value={audioMode === "solfeggio" ? `${sol.freq}Hz` : audioMode === "isochronic" ? `${isoBase}Hz` : `${baseFreq}Hz`} />
            <Readout label="Beat" value={audioMode === "solfeggio" ? "Pure tone" : audioMode === "isochronic" ? `${isoFreq}Hz pulse` : `${beatFreq}Hz`} />
            <Readout label="Right Ear" value={audioMode === "solfeggio" ? `${sol.freq}Hz` : audioMode === "isochronic" ? `${isoBase}Hz` : `${baseFreq + beatFreq}Hz`} />
          </div>
          <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">Use stereo headphones for binaural beats. This tool is not medical advice.</p>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{title}</h2>
      {children}
    </section>
  );
}

function InfoBox({ title, children }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
      <span className="font-semibold text-[var(--primary)]">{title}</span> {children}
    </div>
  );
}

function ControlGrid({ children }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function SliderCard({ label, value, unit, min, max, step, onChange, sublabel }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{label}</span>
        <span className="text-lg font-bold text-[var(--primary)]">{value}<span className="ml-1 text-xs text-[var(--muted-foreground)]">{unit}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "var(--primary)" }}
      />
      <div className="mt-2 text-xs text-[var(--muted-foreground)]">{sublabel}</div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
      <span className="text-sm text-[var(--foreground)]">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function Readout({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-base font-bold text-[var(--primary)]">{value}</div>
    </div>
  );
}
