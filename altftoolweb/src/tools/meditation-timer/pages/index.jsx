"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Brain,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";

const LOG_KEY = "altf:meditation-timer:log";
const PREFS_KEY = "altf:meditation-timer:prefs";

const DURATIONS = [5, 10, 15, 20, 30, 45, 60];

const TIMBRES = [
  {
    id: "singing-bowl",
    label: "Singing bowl",
    base: 210,
    detune: 7,
    strike: 0.05,
    strikeTone: 4,
    partials: [
      { ratio: 1, gain: 1, decay: 9 },
      { ratio: 2.72, gain: 0.5, decay: 6.5 },
      { ratio: 5.18, gain: 0.22, decay: 4 },
      { ratio: 8.4, gain: 0.09, decay: 2.4 },
    ],
  },
  {
    id: "temple-bell",
    label: "Temple bell",
    base: 300,
    detune: 4,
    strike: 0.14,
    strikeTone: 6,
    partials: [
      { ratio: 0.5, gain: 0.62, decay: 8 },
      { ratio: 1, gain: 1, decay: 6 },
      { ratio: 2.76, gain: 0.45, decay: 3.4 },
      { ratio: 5.4, gain: 0.2, decay: 1.9 },
      { ratio: 8.93, gain: 0.08, decay: 1.1 },
    ],
  },
  {
    id: "soft-chime",
    label: "Soft chime",
    base: 523.25,
    detune: 2,
    strike: 0.03,
    strikeTone: 5,
    partials: [
      { ratio: 1, gain: 1, decay: 3.2 },
      { ratio: 2, gain: 0.34, decay: 2.2 },
      { ratio: 3.01, gain: 0.14, decay: 1.4 },
      { ratio: 4.23, gain: 0.06, decay: 0.9 },
    ],
  },
];

const TECHNIQUES = [
  {
    id: "breath",
    label: "Breath awareness",
    how: [
      "Rest your attention where the breath is most obvious: nostrils, chest, or belly.",
      "Do not steer the breath. Just feel it arrive and leave on its own.",
      "When you notice you have wandered, that noticing is the practice. Begin again.",
    ],
  },
  {
    id: "body-scan",
    label: "Body scan",
    how: [
      "Move attention slowly from the crown of your head down to your toes.",
      "Give each region a few breaths and feel whatever is there, including nothing.",
      "Use interval bells to pace the journey so you are not rushing the trip.",
    ],
  },
  {
    id: "loving-kindness",
    label: "Loving-kindness",
    how: [
      "Silently repeat: may you be safe, may you be well, may you live with ease.",
      "Begin with someone easy to love, then yourself, then a stranger, then someone difficult.",
      "The wish matters more than the feeling. Warmth comes and goes on its own.",
    ],
  },
  {
    id: "mantra",
    label: "Mantra",
    how: [
      "Choose a short word or phrase and repeat it silently on each out-breath.",
      "Let it settle into its own rhythm rather than forcing the pace.",
      "When it fades or the mind drifts, gently pick the word back up.",
    ],
  },
  {
    id: "open-awareness",
    label: "Open awareness",
    how: [
      "Drop the single anchor and let attention rest wide and receptive.",
      "Notice sounds, sensations, and thoughts arrive and pass without chasing any of them.",
      "If you feel unmoored, return to the breath for a few cycles, then open out again.",
    ],
  },
];

const MOODS = [
  { id: "calm", label: "Calm" },
  { id: "neutral", label: "Neutral" },
  { id: "restless", label: "Restless" },
];

const pad2 = (value) => String(value).padStart(2, "0");
const dayKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const toLocalMidnight = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
};
const daysBetween = (a, b) => Math.round((toLocalMidnight(b) - toLocalMidnight(a)) / 86400000);

const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safe / 60)}:${pad2(safe % 60)}`;
};

function computeStats(log) {
  const days = [...new Set(log.map((entry) => entry.day))].sort();
  const set = new Set(days);

  let current = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i += 1) {
    if (set.has(dayKey(cursor))) current += 1;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  days.forEach((day, index) => {
    if (index === 0 || daysBetween(days[index - 1], day) !== 1) run = 1;
    else run += 1;
    if (run > longest) longest = run;
  });

  const totalSeconds = log.reduce((sum, entry) => sum + entry.seconds, 0);
  return {
    sessions: log.length,
    totalMinutes: Math.round(totalSeconds / 60),
    current,
    longest,
    average: log.length ? Math.round(totalSeconds / log.length / 60) : 0,
  };
}

export default function ToolHome() {
  const [minutes, setMinutes] = useState(10);
  const [customMinutes, setCustomMinutes] = useState(12);
  const [useCustom, setUseCustom] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(15);
  const [warmUpBell, setWarmUpBell] = useState(true);
  const [bellMode, setBellMode] = useState("none");
  const [everyMinutes, setEveryMinutes] = useState(5);
  const [customMarks, setCustomMarks] = useState("5, 10");
  const [timbreId, setTimbreId] = useState("singing-bowl");
  const [volume, setVolume] = useState(70);
  const [techniqueId, setTechniqueId] = useState("breath");
  const [hideClock, setHideClock] = useState(false);
  const [showRemaining, setShowRemaining] = useState(true);
  const [ambientDot, setAmbientDot] = useState(false);

  const [phase, setPhase] = useState("idle");
  const [prepLeft, setPrepLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState([]);
  const [lastEntryId, setLastEntryId] = useState(null);
  const [wakeActive, setWakeActive] = useState(false);

  const audioRef = useRef(null);
  const wakeRef = useRef(null);
  const prepEndsAtRef = useRef(0);
  const rungRef = useRef(new Set());
  const warmRungRef = useRef(false);
  const phaseRef = useRef("idle");

  const totalSeconds = (useCustom ? Math.max(1, customMinutes) : minutes) * 60;

  const timbre = useMemo(
    () => TIMBRES.find((item) => item.id === timbreId) || TIMBRES[0],
    [timbreId]
  );
  const technique = useMemo(
    () => TECHNIQUES.find((item) => item.id === techniqueId) || TECHNIQUES[0],
    [techniqueId]
  );

  const marks = useMemo(() => {
    if (bellMode === "none") return [];
    if (bellMode === "every") {
      const out = [];
      const step = Math.max(1, everyMinutes) * 60;
      for (let s = step; s < totalSeconds - 1; s += step) out.push(s);
      return out;
    }
    const parsed = customMarks
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => Math.round(value * 60))
      .filter((value) => value < totalSeconds - 1);
    return [...new Set(parsed)].sort((a, b) => a - b);
  }, [bellMode, everyMinutes, customMarks, totalSeconds]);

  useEffect(() => {
    try {
      const rawLog = window.localStorage.getItem(LOG_KEY);
      if (rawLog) {
        const parsed = JSON.parse(rawLog);
        if (Array.isArray(parsed)) setLog(parsed);
      }
      const rawPrefs = window.localStorage.getItem(PREFS_KEY);
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs);
        if (prefs && typeof prefs === "object") {
          if (TIMBRES.some((item) => item.id === prefs.timbreId)) setTimbreId(prefs.timbreId);
          if (Number.isFinite(prefs.volume)) setVolume(prefs.volume);
          if (TECHNIQUES.some((item) => item.id === prefs.techniqueId))
            setTechniqueId(prefs.techniqueId);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ timbreId, volume, techniqueId }));
    } catch {}
  }, [timbreId, volume, techniqueId]);

  const persistLog = useCallback((next) => {
    setLog(next);
    try {
      window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {}
    return audioRef.current;
  }, []);

  const strikeBell = useCallback(
    (offset = 0, spec = null) => {
      const ctx = audioRef.current;
      if (!ctx) return;
      const voice = spec || timbre;
      const level = volume / 100;
      if (level <= 0) return;
      try {
        const at = ctx.currentTime + 0.03 + offset;
        const master = ctx.createGain();
        master.gain.value = level * 0.9;
        master.connect(ctx.destination);

        voice.partials.forEach((partial) => {
          [-1, 1].forEach((direction) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = voice.base * partial.ratio;
            osc.detune.value = (direction * voice.detune) / 2;
            const peak = Math.max(0.0005, partial.gain * 0.14);
            gain.gain.setValueAtTime(0.0001, at);
            gain.gain.linearRampToValueAtTime(peak, at + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, at + partial.decay);
            osc.connect(gain);
            gain.connect(master);
            osc.start(at);
            osc.stop(at + partial.decay + 0.1);
          });
        });

        const noiseSeconds = 0.06;
        const frames = Math.max(1, Math.ceil(ctx.sampleRate * noiseSeconds));
        const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frames; i += 1) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = voice.base * voice.strikeTone;
        band.Q.value = 1.1;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = voice.strike;
        source.connect(band);
        band.connect(noiseGain);
        noiseGain.connect(master);
        source.start(at);
      } catch {}
    },
    [timbre, volume]
  );

  const previewBell = () => {
    ensureAudio();
    strikeBell(0);
  };

  const releaseWake = useCallback(() => {
    try {
      wakeRef.current?.release();
    } catch {}
    wakeRef.current = null;
    setWakeActive(false);
  }, []);

  const requestWake = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        wakeRef.current = await navigator.wakeLock.request("screen");
        setWakeActive(true);
        wakeRef.current.addEventListener?.("release", () => setWakeActive(false));
      }
    } catch {
      setWakeActive(false);
    }
  }, []);

  useEffect(
    () => () => {
      try {
        wakeRef.current?.release();
      } catch {}
      wakeRef.current = null;
    },
    []
  );

  const finishSession = useCallback(() => {
    strikeBell(0);
    strikeBell(2.4);
    strikeBell(4.8);
    const entry = {
      id: `${Date.now()}`,
      day: dayKey(new Date()),
      at: new Date().toISOString(),
      seconds: totalSeconds,
      technique: technique.label,
      mood: null,
    };
    setLog((current) => {
      const next = [entry, ...current].slice(0, 200);
      try {
        window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setLastEntryId(entry.id);
    phaseRef.current = "done";
    setPhase("done");
    releaseWake();
  }, [strikeBell, totalSeconds, technique, releaseWake]);

  useEffect(() => {
    if (phase !== "prep" && phase !== "running") return undefined;

    const id = setInterval(() => {
      const now = Date.now();

      if (now < prepEndsAtRef.current) {
        setPrepLeft((prepEndsAtRef.current - now) / 1000);
        return;
      }

      if (phaseRef.current === "prep") {
        phaseRef.current = "running";
        setPhase("running");
        if (warmUpBell && !warmRungRef.current) {
          warmRungRef.current = true;
          strikeBell(0);
        }
      }

      const seconds = (now - prepEndsAtRef.current) / 1000;

      marks.forEach((mark) => {
        if (seconds >= mark && !rungRef.current.has(mark)) {
          rungRef.current.add(mark);
          strikeBell(0);
        }
      });

      if (seconds >= totalSeconds) {
        finishSession();
        return;
      }

      setElapsed(seconds);
    }, 250);

    return () => clearInterval(id);
  }, [phase, marks, totalSeconds, warmUpBell, strikeBell, finishSession]);

  const startSession = () => {
    ensureAudio();
    rungRef.current = new Set();
    warmRungRef.current = false;
    prepEndsAtRef.current = Date.now() + prepSeconds * 1000;
    setPrepLeft(prepSeconds);
    setElapsed(0);
    setLastEntryId(null);
    phaseRef.current = "prep";
    setPhase("prep");
    requestWake();
  };

  const stopSession = () => {
    phaseRef.current = "idle";
    setPhase("idle");
    setElapsed(0);
    releaseWake();
  };

  const setMood = (moodId) => {
    if (!lastEntryId) return;
    persistLog(
      log.map((entry) => (entry.id === lastEntryId ? { ...entry, mood: moodId } : entry))
    );
  };

  const clearLog = () => persistLog([]);

  const stats = useMemo(() => computeStats(log), [log]);

  const weekStrip = useMemo(() => {
    const byDay = {};
    log.forEach((entry) => {
      byDay[entry.day] = (byDay[entry.day] || 0) + entry.seconds;
    });
    const out = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 6);
    for (let i = 0; i < 7; i += 1) {
      const key = dayKey(cursor);
      out.push({
        key,
        label: ["S", "M", "T", "W", "T", "F", "S"][cursor.getDay()],
        seconds: byDay[key] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }, [log]);

  const peakDay = Math.max(60, ...weekStrip.map((day) => day.seconds));

  const progress = Math.min(1, Math.max(0, elapsed / totalSeconds));
  const circumference = 2 * Math.PI * 110;
  const active = phase === "prep" || phase === "running";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{`
        @keyframes altf-med-breathe {
          0% { transform: scale(0.45); opacity: 0.45; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.45); opacity: 0.45; }
        }
        .altf-med-dot { animation: altf-med-breathe 10s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .altf-med-dot { animation: none; transform: scale(0.72); opacity: 0.8; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Brain className="h-4 w-4" />
            Sitting practice
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Meditation Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Set a duration, place interval bells wherever you want them, and sit. The bells are
            synthesized in your browser, and your session log never leaves this device.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div>
              <span className="text-sm font-semibold">Duration</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {DURATIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMinutes(value);
                      setUseCustom(false);
                    }}
                    disabled={active}
                    className={`rounded-md border px-2 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      !useCustom && minutes === value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  disabled={active}
                  className={`rounded-md border px-2 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                    useCustom
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Custom
                </button>
              </div>
              {useCustom && (
                <label className="mt-3 block">
                  <span className="text-xs font-semibold">Custom minutes</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customMinutes}
                    disabled={active}
                    onChange={(event) =>
                      setCustomMinutes(Math.min(180, Math.max(1, Number(event.target.value) || 1)))
                    }
                    className="mt-1.5 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              )}
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                <span>Settle-in delay</span>
                <span className="tabular-nums text-[var(--primary)]">{prepSeconds}s</span>
              </span>
              <input
                type="range"
                min={10}
                max={30}
                step={5}
                value={prepSeconds}
                disabled={active}
                onChange={(event) => setPrepSeconds(Number(event.target.value))}
                className="mt-1.5 w-full accent-[var(--primary)]"
              />
            </label>

            <button
              type="button"
              onClick={() => setWarmUpBell((current) => !current)}
              aria-pressed={warmUpBell}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold transition hover:border-[var(--primary)]"
            >
              <span>Bell when the sit begins</span>
              <span className={warmUpBell ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}>
                {warmUpBell ? "On" : "Off"}
              </span>
            </button>

            <div className="mt-5">
              <span className="text-sm font-semibold">Interval bells</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "none", label: "None" },
                  { id: "every", label: "Every" },
                  { id: "custom", label: "Custom" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBellMode(item.id)}
                    disabled={active}
                    className={`rounded-md border px-2 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                      bellMode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {bellMode === "every" && (
                <label className="mt-3 block">
                  <span className="flex items-center justify-between text-xs font-semibold">
                    <span>Ring every</span>
                    <span className="tabular-nums text-[var(--primary)]">{everyMinutes} min</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={everyMinutes}
                    disabled={active}
                    onChange={(event) => setEveryMinutes(Number(event.target.value))}
                    className="mt-1.5 w-full accent-[var(--primary)]"
                  />
                </label>
              )}

              {bellMode === "custom" && (
                <label className="mt-3 block">
                  <span className="text-xs font-semibold">Minute marks, comma separated</span>
                  <input
                    type="text"
                    value={customMarks}
                    disabled={active}
                    onChange={(event) => setCustomMarks(event.target.value)}
                    placeholder="5, 10, 18"
                    className="mt-1.5 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              )}

              {marks.length > 0 && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {marks.length} bell{marks.length === 1 ? "" : "s"} at{" "}
                  {marks.map((mark) => `${Math.round(mark / 60)}m`).join(", ")}, shown as ticks on
                  the ring.
                </p>
              )}
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Bell sound</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TIMBRES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimbreId(item.id)}
                    className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${
                      timbreId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="flex items-center justify-between text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5" />
                    Volume
                  </span>
                  <span className="tabular-nums text-[var(--primary)]">{volume}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="mt-1.5 w-full accent-[var(--primary)]"
                />
              </label>

              <button
                type="button"
                onClick={previewBell}
                className="btn-secondary mt-3 min-h-9 w-full px-3 py-1.5 text-sm"
              >
                <Bell className="h-4 w-4" />
                Preview bell
              </button>
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Technique</span>
              <div className="mt-2 grid gap-2">
                {TECHNIQUES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTechniqueId(item.id)}
                    className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                      techniqueId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              {phase === "done" ? (
                <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <Bell className="h-10 w-10 text-[var(--primary)]" />
                  <h2 className="mt-4 text-3xl font-semibold">Sit complete</h2>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {Math.round(totalSeconds / 60)} minutes of {technique.label.toLowerCase()}. Take
                    a moment before you stand up.
                  </p>
                  <p className="mt-6 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    How was it?
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {MOODS.map((mood) => {
                      const entry = log.find((item) => item.id === lastEntryId);
                      const chosen = entry?.mood === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setMood(mood.id)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            chosen
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {mood.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhase("idle")}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Back to setup
                  </button>
                </div>
              ) : (
                <div className="flex min-h-[440px] flex-col items-center justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--primary)]">
                      {technique.label}
                    </span>
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                      {Math.round(totalSeconds / 60)} min
                    </span>
                    {wakeActive && (
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                        Screen kept awake
                      </span>
                    )}
                  </div>

                  <div className="relative mt-6 h-72 w-72">
                    <svg viewBox="0 0 280 280" className="h-full w-full" aria-hidden="true">
                      <circle
                        cx="140"
                        cy="140"
                        r="110"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="8"
                      />
                      <g transform="rotate(-90 140 140)">
                        <circle
                          cx="140"
                          cy="140"
                          r="110"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference * (1 - progress)}
                        />
                      </g>
                      {marks.map((mark) => {
                        const angle = (mark / totalSeconds) * 2 * Math.PI - Math.PI / 2;
                        return (
                          <line
                            key={mark}
                            x1={140 + Math.cos(angle) * 98}
                            y1={140 + Math.sin(angle) * 98}
                            x2={140 + Math.cos(angle) * 122}
                            y2={140 + Math.sin(angle) * 122}
                            stroke="var(--muted-foreground)"
                            strokeWidth="2"
                            opacity="0.7"
                          />
                        );
                      })}
                      {ambientDot && phase === "running" && (
                        <circle
                          className="altf-med-dot"
                          cx="140"
                          cy="140"
                          r="26"
                          fill="var(--primary)"
                          opacity="0.35"
                        />
                      )}
                    </svg>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      {phase === "prep" ? (
                        <>
                          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                            Settle in
                          </p>
                          <p className="text-6xl font-semibold tabular-nums text-[var(--primary)]">
                            {Math.ceil(prepLeft)}
                          </p>
                        </>
                      ) : hideClock ? (
                        <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                          {phase === "running" ? "Sitting" : "Ready"}
                        </p>
                      ) : (
                        <>
                          <p className="text-5xl font-semibold tabular-nums">
                            {formatClock(showRemaining ? totalSeconds - elapsed : elapsed)}
                          </p>
                          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            {showRemaining ? "remaining" : "elapsed"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {phase === "prep"
                      ? `Settling in, ${Math.ceil(prepLeft)} seconds`
                      : phase === "running"
                        ? `${formatClock(totalSeconds - elapsed)} remaining`
                        : "Ready to start"}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {!active ? (
                      <button
                        type="button"
                        onClick={startSession}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                      >
                        <Play className="h-4 w-4" />
                        Begin sitting
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopSession}
                        className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                      >
                        <Square className="h-4 w-4" />
                        End early
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setHideClock((current) => !current)}
                      aria-pressed={hideClock}
                      className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                    >
                      {hideClock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {hideClock ? "Show clock" : "Hide clock"}
                    </button>
                    {!hideClock && (
                      <button
                        type="button"
                        onClick={() => setShowRemaining((current) => !current)}
                        className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                      >
                        {showRemaining ? "Show elapsed" : "Show remaining"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAmbientDot((current) => !current)}
                      aria-pressed={ambientDot}
                      className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                    >
                      Breathing dot {ambientDot ? "on" : "off"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">{technique.label}</h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {technique.how.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your practice</h2>
            {log.length > 0 && (
              <button
                type="button"
                onClick={clearLog}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear log
              </button>
            )}
          </div>

          <div className="tool-compact-grid mt-4">
            {[
              ["Sessions", stats.sessions],
              ["Total minutes", stats.totalMinutes],
              ["Current streak", `${stats.current} d`],
              ["Longest streak", `${stats.longest} d`],
              ["Avg session", `${stats.average} min`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--primary)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              This week
            </p>
            <div className="mt-2 flex items-end gap-2">
              {weekStrip.map((day, index) => (
                <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end justify-center rounded-md bg-[var(--muted)]">
                    <div
                      className="w-full rounded-md bg-[var(--primary)]"
                      style={{
                        height: `${day.seconds ? Math.max(8, (day.seconds / peakDay) * 100) : 0}%`,
                      }}
                      title={`${Math.round(day.seconds / 60)} min`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                    {day.label}
                    {index === 6 ? "*" : ""}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
              * today. Everything here is stored only in this browser.
            </p>
          </div>

          {log.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Minutes</th>
                    <th className="py-2 font-semibold">Technique</th>
                    <th className="py-2 font-semibold">Mood</th>
                  </tr>
                </thead>
                <tbody>
                  {log.slice(0, 8).map((entry) => (
                    <tr key={entry.id} className="border-t border-[var(--border)]">
                      <td className="py-2">{entry.day}</td>
                      <td className="py-2">{Math.round(entry.seconds / 60)}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{entry.technique}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{entry.mood || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            This timer is offered for general wellbeing and awareness, not medical advice, and it
            does not diagnose or treat any condition. Meditation can occasionally surface difficult
            memories or feelings. If you live with a trauma history, psychosis, or a severe anxiety
            or mood disorder, consult a doctor or a qualified teacher before starting a regular
            practice.
          </p>
        </section>
      </div>
    </main>
  );
}
