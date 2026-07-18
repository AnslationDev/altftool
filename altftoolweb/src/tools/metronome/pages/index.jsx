"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, Minus, Music2, Play, Plus, RotateCcw, Square, Volume2 } from "lucide-react";

const STORAGE_KEY = "altf:metronome:settings";
const MIN_BPM = 30;
const MAX_BPM = 260;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.1;

const timeSignatures = [
  { id: "2/4", beats: 2, accents: [0], note: "March feel, accent on beat 1" },
  { id: "3/4", beats: 3, accents: [0], note: "Waltz feel, accent on beat 1" },
  { id: "4/4", beats: 4, accents: [0], note: "Most pop and rock, accent on beat 1" },
  { id: "6/8", beats: 6, accents: [0, 3], note: "Compound feel, accents on beats 1 and 4" },
];

const subdivisions = [
  { id: "quarter", label: "Quarter", per: 1, hint: "1 click per beat" },
  { id: "eighth", label: "Eighth", per: 2, hint: "2 ticks per beat" },
  { id: "triplet", label: "Triplet", per: 3, hint: "3 ticks per beat" },
  { id: "sixteenth", label: "Sixteenth", per: 4, hint: "4 ticks per beat" },
];

const tempoMarks = [
  { label: "Largo", min: 30, max: 59 },
  { label: "Adagio", min: 60, max: 75 },
  { label: "Andante", min: 76, max: 107 },
  { label: "Moderato", min: 108, max: 119 },
  { label: "Allegro", min: 120, max: 155 },
  { label: "Vivace", min: 156, max: 175 },
  { label: "Presto", min: 176, max: 260 },
];

const presets = [
  { bpm: 60, label: "Slow practice" },
  { bpm: 80, label: "Groove" },
  { bpm: 120, label: "Pop" },
  { bpm: 170, label: "Drum and bass" },
];

const clampBpm = (value) => Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));

export default function ToolHome() {
  const [bpm, setBpm] = useState(120);
  const [sigId, setSigId] = useState("4/4");
  const [subId, setSubId] = useState("quarter");
  const [volume, setVolume] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [tapCount, setTapCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const intervalRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const slotRef = useRef({ beat: 0, sub: 0 });
  const beatQueueRef = useRef([]);
  const settingsRef = useRef({ bpm: 120, beats: 4, accents: [0], per: 1 });
  const tapTimesRef = useRef([]);
  const toggleRef = useRef(() => {});

  const sig = timeSignatures.find((item) => item.id === sigId) || timeSignatures[2];
  const sub = subdivisions.find((item) => item.id === subId) || subdivisions[0];
  const mark = tempoMarks.find((item) => bpm >= item.min && bpm <= item.max) || tempoMarks[0];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          if (Number.isFinite(saved.bpm)) setBpm(clampBpm(saved.bpm));
          if (timeSignatures.some((item) => item.id === saved.sigId)) setSigId(saved.sigId);
          if (subdivisions.some((item) => item.id === saved.subId)) setSubId(saved.subId);
          if (Number.isFinite(saved.volume)) setVolume(Math.min(100, Math.max(0, Math.round(saved.volume))));
        }
      }
    } catch {
      // ignore unreadable settings
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ bpm, sigId, subId, volume }));
    } catch {
      // storage unavailable
    }
  }, [hydrated, bpm, sigId, subId, volume]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    settingsRef.current = { bpm, beats: sig.beats, accents: sig.accents, per: sub.per };
    if (slotRef.current.beat >= sig.beats) slotRef.current = { beat: 0, sub: 0 };
  }, [bpm, sig, sub]);

  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = volume / 100;
  }, [volume]);

  const scheduleClick = (time, isAccent, isSubTick) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isAccent ? "square" : "sine";
    osc.frequency.value = isSubTick ? 600 : isAccent ? 1000 : 800;
    const peak = isSubTick ? 0.3 : isAccent ? 1 : 0.75;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isSubTick ? 0.035 : 0.055));
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.07);
  };

  const schedulerTick = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const settings = settingsRef.current;
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      const { beat, sub: subIndex } = slotRef.current;
      const isSubTick = subIndex !== 0;
      const isAccent = !isSubTick && settings.accents.includes(beat);
      scheduleClick(nextNoteTimeRef.current, isAccent, isSubTick);
      if (!isSubTick) beatQueueRef.current.push({ time: nextNoteTimeRef.current, beat });
      nextNoteTimeRef.current += 60 / settings.bpm / settings.per;
      let nextSub = subIndex + 1;
      let nextBeat = beat;
      if (nextSub >= settings.per) {
        nextSub = 0;
        nextBeat = (beat + 1) % settings.beats;
      }
      slotRef.current = { beat: nextBeat, sub: nextSub };
    }
  };

  const start = async () => {
    let ctx = audioCtxRef.current;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      audioCtxRef.current = ctx;
    }
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    const master = ctx.createGain();
    master.gain.value = volume / 100;
    master.connect(ctx.destination);
    masterGainRef.current = master;
    slotRef.current = { beat: 0, sub: 0 };
    beatQueueRef.current = [];
    nextNoteTimeRef.current = ctx.currentTime + 0.08;
    schedulerTick();
    intervalRef.current = window.setInterval(schedulerTick, LOOKAHEAD_MS);
    setPlaying(true);
  };

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (masterGainRef.current) {
      masterGainRef.current.disconnect();
      masterGainRef.current = null;
    }
    beatQueueRef.current = [];
    setActiveBeat(-1);
    setPlaying(false);
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "running") ctx.suspend().catch(() => {});
  };

  useEffect(() => {
    toggleRef.current = playing ? stop : start;
  });

  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space" || event.repeat) return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
      event.preventDefault();
      toggleRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let frame;
    const drawTick = () => {
      const ctx = audioCtxRef.current;
      if (ctx) {
        const queue = beatQueueRef.current;
        let latest = null;
        while (queue.length && queue[0].time <= ctx.currentTime) latest = queue.shift();
        if (latest) setActiveBeat(latest.beat);
      }
      frame = window.requestAnimationFrame(drawTick);
    };
    frame = window.requestAnimationFrame(drawTick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(
    () => () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    },
    []
  );

  const stepBpm = (delta) => setBpm((value) => clampBpm(value + delta));

  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
    taps.push(now);
    while (taps.length > 6) taps.shift();
    setTapCount(taps.length);
    if (taps.length >= 2) {
      let total = 0;
      for (let i = 1; i < taps.length; i += 1) total += taps[i] - taps[i - 1];
      const average = total / (taps.length - 1);
      setBpm(clampBpm(60000 / average));
    }
  };

  const resetDefaults = () => {
    setBpm(120);
    setSigId("4/4");
    setSubId("quarter");
    setVolume(80);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Music2 className="h-4 w-4" />
            Music practice
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Online Metronome</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            A precise Web Audio metronome with tap tempo, time signatures, subdivisions, and accented
            beats. Clicks are scheduled ahead on the audio clock, so the pulse never drifts.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div>
              <p className="text-sm font-semibold">Time signature</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {timeSignatures.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSigId(item.id)}
                    className={`rounded-md border px-2 py-3 text-center text-sm font-semibold transition ${
                      sigId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{sig.note}</p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Subdivision</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {subdivisions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubId(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition ${
                      subId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                    <span className="block text-xs font-normal opacity-80">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-[var(--primary)]" />
                  Volume
                </span>
                <span className="text-[var(--muted-foreground)]">{volume}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="mt-2 w-full accent-[var(--primary)]"
              />
            </label>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Practice presets</span>
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                {presets.map((preset) => (
                  <button
                    key={preset.bpm}
                    type="button"
                    onClick={() => setBpm(preset.bpm)}
                    className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                    <span className="text-[var(--primary)]">{preset.bpm} BPM</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                {mark.label} · {mark.min}-{mark.max} BPM
              </div>
              <p aria-live="polite" className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {playing ? "Playing" : "Stopped"} · press Space to {playing ? "stop" : "start"}
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-7xl font-semibold leading-none text-[var(--primary)] sm:text-8xl">{bpm}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Beats per minute
              </p>
            </div>

            <label className="mt-6 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                Tempo
                <span className="text-[var(--muted-foreground)]">
                  {MIN_BPM}-{MAX_BPM} BPM
                </span>
              </span>
              <input
                type="range"
                min={MIN_BPM}
                max={MAX_BPM}
                step={1}
                value={bpm}
                onChange={(event) => setBpm(clampBpm(Number(event.target.value)))}
                className="mt-2 w-full accent-[var(--primary)]"
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { delta: -5, label: "-5" },
                { delta: -1, label: "-1" },
                { delta: 1, label: "+1" },
                { delta: 5, label: "+5" },
              ].map((step) => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => stepBpm(step.delta)}
                  aria-label={`${step.delta > 0 ? "Increase" : "Decrease"} tempo by ${Math.abs(step.delta)}`}
                  className="inline-flex h-11 w-14 items-center justify-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-semibold transition hover:border-[var(--primary)]"
                >
                  {step.delta > 0 ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  {Math.abs(step.delta)}
                </button>
              ))}
              <button type="button" onClick={handleTap} className="btn-secondary min-h-11 px-4 py-2 text-sm">
                <Hand className="h-4 w-4" />
                Tap tempo
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              {tapCount === 1 ? "Keep tapping to set the tempo" : "Tap along steadily — the last 6 taps are averaged"}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={playing ? stop : start}
                className="inline-flex h-14 min-w-44 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-8 text-lg font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)]"
              >
                {playing ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {playing ? "Stop" : "Play"}
              </button>
            </div>

            <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                {Array.from({ length: sig.beats }, (_, index) => {
                  const isActive = playing && activeBeat === index;
                  const isAccent = sig.accents.includes(index);
                  return (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 rounded-full border-2 ${
                        reducedMotion ? "" : "transition-transform duration-100"
                      } ${isActive && !reducedMotion ? "scale-125" : ""}`}
                      style={{
                        background: isActive ? "var(--primary)" : "var(--muted)",
                        borderColor: isAccent ? "var(--primary)" : "var(--border)",
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-center text-sm font-semibold text-[var(--muted-foreground)]">
                {playing && activeBeat >= 0 ? `Beat ${activeBeat + 1} of ${sig.beats}` : `${sig.beats} beats per bar`}
                {sub.per > 1 ? ` · ${sub.label.toLowerCase()} ticks` : ""}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Tempo markings</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tempoMarks.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setBpm(clampBpm(Math.round((item.min + item.max) / 2)))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      mark.label === item.label
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label} {item.min}-{item.max}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 rounded-md bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Timing: clicks are scheduled up to 100 ms ahead against the Web Audio clock every 25 ms, so
              playback stays sample-accurate even when the browser tab is busy. Beat interval = 60 / BPM
              seconds, divided by the chosen subdivision.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
