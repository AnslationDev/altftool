"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipForward,
  Sparkles,
  StretchHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { AREAS, EQUIPMENT, STRETCHES } from "../data";

const FAVOURITES_KEY = "altf:desk-stretch-generator:favourites";
const TRANSITION_SECONDS = 5;

const DURATIONS = [
  { minutes: 2, label: "2 min", note: "Micro-break" },
  { minutes: 5, label: "5 min", note: "Between meetings" },
  { minutes: 10, label: "10 min", note: "Proper reset" },
  { minutes: 15, label: "15 min", note: "Full body" },
];

const PRESETS = [
  {
    label: "Laptop neck",
    minutes: 5,
    areas: ["neck", "shoulders", "upper-back"],
    intensity: "gentle",
    equipment: ["chair"],
  },
  {
    label: "Mouse hand",
    minutes: 5,
    areas: ["wrists", "shoulders", "eyes"],
    intensity: "gentle",
    equipment: ["desk"],
  },
  {
    label: "Sat too long",
    minutes: 10,
    areas: ["hips", "lower-back", "legs"],
    intensity: "moderate",
    equipment: ["chair", "wall"],
  },
  {
    label: "Screen eyes",
    minutes: 2,
    areas: ["eyes", "neck"],
    intensity: "gentle",
    equipment: [],
  },
];

const areaLabel = (id) => AREAS.find((area) => area.id === id)?.label || id;

const stepSeconds = (stretch) => stretch.hold * stretch.sides;
const stretchCost = (stretch) => stepSeconds(stretch) + TRANSITION_SECONDS;

const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(items, seed) {
  const random = mulberry32(seed);
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRoutine({ minutes, areas, intensity, equipment, seed }) {
  const budget = minutes * 60;
  const allowedEquipment = new Set(["none", ...equipment]);
  const isAllowed = (stretch) =>
    allowedEquipment.has(stretch.equipment) &&
    (intensity === "moderate" || stretch.difficulty === "gentle");

  const pools = AREAS.filter((area) => areas.includes(area.id))
    .map((area, index) => ({
      id: area.id,
      items: shuffleWithSeed(
        STRETCHES.filter((stretch) => stretch.area === area.id && isAllowed(stretch)),
        seed + index * 7919
      ),
    }))
    .filter((pool) => pool.items.length > 0);

  if (pools.length === 0) return [];

  const routine = [];
  const usedIds = new Set();
  let used = 0;
  let poolIndex = 0;

  for (let guard = 0; guard < 400; guard += 1) {
    let placed = false;

    for (let offset = 0; offset < pools.length; offset += 1) {
      const pool = pools[(poolIndex + offset) % pools.length];
      const last = routine[routine.length - 1];
      const othersAvailable = pools.some(
        (other) => other.id !== pool.id && other.items.some((item) => !usedIds.has(item.id))
      );
      if (last && last.area === pool.id && othersAvailable) continue;

      const candidate = pool.items.find(
        (item) =>
          !usedIds.has(item.id) && (routine.length === 0 || used + stretchCost(item) <= budget)
      );
      if (!candidate) continue;

      usedIds.add(candidate.id);
      routine.push(candidate);
      used += stretchCost(candidate);
      poolIndex = (poolIndex + offset + 1) % pools.length;
      placed = true;
      break;
    }

    if (!placed) break;
  }

  return routine;
}

function toSteps(routine) {
  const steps = [];
  routine.forEach((stretch, index) => {
    if (stretch.sides === 2) {
      steps.push({ stretch, side: "Left", stretchIndex: index });
      steps.push({ stretch, side: "Right", stretchIndex: index });
    } else {
      steps.push({ stretch, side: null, stretchIndex: index });
    }
  });
  return steps;
}

function CountdownRing({ progress, remaining, animate }) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * clamped}
          style={animate ? { transition: "stroke-dashoffset 120ms linear" } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tabular-nums">{Math.ceil(remaining)}</span>
        <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
          seconds
        </span>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [minutes, setMinutes] = useState(5);
  const [areas, setAreas] = useState(["neck", "shoulders", "upper-back", "wrists"]);
  const [intensity, setIntensity] = useState("gentle");
  const [equipment, setEquipment] = useState(["chair"]);
  const [seed, setSeed] = useState(1);
  const [favourites, setFavourites] = useState([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const audioRef = useRef(null);
  const endsAtRef = useRef(0);
  const frameRef = useRef(0);
  const pausedRemainingRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVOURITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavourites(parsed);
      }
    } catch {}
  }, []);

  const persistFavourites = useCallback((next) => {
    setFavourites(next);
    try {
      window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const routine = useMemo(
    () => buildRoutine({ minutes, areas, intensity, equipment, seed }),
    [minutes, areas, intensity, equipment, seed]
  );

  const steps = useMemo(() => toSteps(routine), [routine]);

  const totalSeconds = useMemo(
    () => routine.reduce((sum, stretch) => sum + stretchCost(stretch), 0),
    [routine]
  );

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {}
  }, []);

  const playChime = useCallback((kind) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const base = ctx.currentTime + 0.02;
      const notes = kind === "done" ? [523.25, 659.25, 783.99] : [659.25, 987.77];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = base + index * 0.14;
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.65);
      });
    } catch {}
  }, []);

  const stopPlayer = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    pausedRemainingRef.current = null;
    setPlaying(false);
    setPaused(false);
    setFinished(false);
    setStepIndex(0);
    setRemaining(0);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    if (!playing || paused || finished) return undefined;
    const step = steps[stepIndex];
    if (!step) return undefined;

    endsAtRef.current =
      Date.now() +
      (pausedRemainingRef.current ?? step.stretch.hold) * 1000;
    pausedRemainingRef.current = null;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const left = (endsAtRef.current - Date.now()) / 1000;
      if (left <= 0) {
        if (stepIndex >= steps.length - 1) {
          setFinished(true);
          setRemaining(0);
          playChime("done");
          return;
        }
        playChime("next");
        setStepIndex((current) => current + 1);
        return;
      }
      setRemaining(reduceMotion ? Math.ceil(left) : left);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
    };
  }, [playing, paused, finished, stepIndex, steps, reduceMotion, playChime]);

  const startPlayer = () => {
    if (!steps.length) return;
    ensureAudio();
    pausedRemainingRef.current = null;
    setStepIndex(0);
    setRemaining(steps[0].stretch.hold);
    setFinished(false);
    setPaused(false);
    setPlaying(true);
  };

  const togglePause = () => {
    if (paused) {
      setPaused(false);
      return;
    }
    pausedRemainingRef.current = Math.max(0, (endsAtRef.current - Date.now()) / 1000);
    setPaused(true);
  };

  const goToStep = (next) => {
    if (next < 0 || next >= steps.length) return;
    pausedRemainingRef.current = null;
    setRemaining(steps[next].stretch.hold);
    setFinished(false);
    setStepIndex(next);
  };

  const toggleArea = (id) => {
    setAreas((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleEquipment = (id) => {
    setEquipment((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const applyPreset = (preset) => {
    setMinutes(preset.minutes);
    setAreas(preset.areas);
    setIntensity(preset.intensity);
    setEquipment(preset.equipment);
    setSeed((current) => current + 1);
  };

  const saveFavourite = () => {
    if (!routine.length) return;
    const name = `${minutes} min - ${areas.map(areaLabel).join(", ")}`;
    const next = [
      { id: `${Date.now()}`, name, minutes, areas, intensity, equipment, seed },
      ...favourites.filter((item) => item.name !== name),
    ].slice(0, 8);
    persistFavourites(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const loadFavourite = (favourite) => {
    setMinutes(favourite.minutes);
    setAreas(favourite.areas);
    setIntensity(favourite.intensity);
    setEquipment(favourite.equipment);
    setSeed(favourite.seed);
  };

  const removeFavourite = (id) => {
    persistFavourites(favourites.filter((item) => item.id !== id));
  };

  const routineText = useMemo(
    () =>
      [
        "Desk Stretch Routine",
        `Length: about ${formatClock(totalSeconds)} (${routine.length} stretches)`,
        `Areas: ${areas.map(areaLabel).join(", ") || "none"}`,
        `Intensity: ${intensity}`,
        "",
        ...routine.map(
          (stretch, index) =>
            `${index + 1}. ${stretch.name} (${areaLabel(stretch.area)}) - ${stretch.hold}s${
              stretch.sides === 2 ? " each side" : ""
            }\n   ${stretch.steps.join(" ")}`
        ),
        "",
        "Never bounce. Stretch to mild tension, not pain. Keep breathing.",
      ].join("\n"),
    [routine, totalSeconds, areas, intensity]
  );

  const copyRoutine = async () => {
    const success = await safeCopyText(routineText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const currentStep = steps[stepIndex];
  const nextStep = steps[stepIndex + 1];
  const progress = currentStep ? 1 - remaining / currentStep.stretch.hold : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <StretchHorizontal className="h-4 w-4" />
            Guided desk mobility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Desk Stretch Routine Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Tell it how long you have and what feels tight. It builds a sequenced routine from 45
            real stretches, then walks you through every hold with a countdown and a chime.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div>
              <span className="text-sm font-semibold">Time available</span>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {DURATIONS.map((item) => (
                  <button
                    key={item.minutes}
                    type="button"
                    onClick={() => setMinutes(item.minutes)}
                    className={`rounded-md border px-2 py-3 text-center transition ${
                      minutes === item.minutes
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight opacity-80">
                      {item.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-sm font-semibold">Target areas</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleArea(area.id)}
                    aria-pressed={areas.includes(area.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      areas.includes(area.id)
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <span className="text-sm font-semibold">Intensity</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "gentle", label: "Gentle", note: "Easy holds only" },
                  { id: "moderate", label: "Moderate", note: "Adds deeper work" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntensity(item.id)}
                    className={`rounded-md border px-3 py-2 text-left transition ${
                      intensity === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] opacity-80">{item.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-sm font-semibold">What you have</legend>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Pick none and you still get a full standing routine.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EQUIPMENT.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEquipment(item.id)}
                    aria-pressed={equipment.includes(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      equipment.includes(item.id)
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <span className="text-sm font-semibold">Quick presets</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 2xl:grid-cols-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {favourites.length > 0 && (
              <div className="mt-5">
                <span className="text-sm font-semibold">Saved routines</span>
                <div className="mt-2 grid gap-2">
                  {favourites.map((favourite) => (
                    <div
                      key={favourite.id}
                      className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => loadFavourite(favourite)}
                        className="flex-1 text-left text-xs font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                      >
                        {favourite.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFavourite(favourite.id)}
                        aria-label={`Remove ${favourite.name}`}
                        className="text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Your routine
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                  {formatClock(totalSeconds)}{" "}
                  <span className="text-base font-medium text-[var(--muted-foreground)]">
                    / {routine.length} stretches
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSeed((current) => current + 1)}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Shuffle className="h-4 w-4" />
                  Shuffle
                </button>
                <button
                  type="button"
                  onClick={saveFavourite}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Bookmark className="h-4 w-4" />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={copyRoutine}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {routine.length === 0 ? (
              <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
                <p className="text-sm font-semibold">No stretches match those settings</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Pick at least one target area, or allow more equipment.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startPlayer}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  Start guided routine
                </button>

                <ol className="mt-5 grid gap-2">
                  {routine.map((stretch, index) => (
                    <li
                      key={stretch.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold">{stretch.name}</span>
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                          {areaLabel(stretch.area)}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-[var(--muted-foreground)]">
                          {stretch.hold}s{stretch.sides === 2 ? " x 2 sides" : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                        {stretch.steps.join(" ")}
                      </p>
                      {stretch.caution && (
                        <p className="mt-2 inline-flex items-start gap-1.5 text-xs leading-5 text-[var(--anslation-ds-danger)]">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {stretch.caution}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>

                {totalSeconds < minutes * 60 - 30 && (
                  <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    That is every distinct stretch matching your picks, so the routine comes in
                    under {minutes} min rather than repeating moves. Add another target area, allow
                    more equipment, or switch to moderate intensity to fill the full time.
                  </p>
                )}

                <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                  Timing: sum of every hold (doubled where both sides are worked) plus{" "}
                  {TRANSITION_SECONDS}s to change position between stretches.
                </p>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Form and safety</h2>
            <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Never bounce. Ease into the position and hold it still.
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Stretch to mild tension, not pain. It should feel like a two out of ten.
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Keep breathing normally. Holding your breath tightens the muscle you are stretching.
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Stop immediately on sharp, shooting, or electric pain, or any numbness.
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Work both sides evenly, even when only one side feels tight.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Why the breaks matter</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Sitting still loads the same tissues for hours. The problem is rarely posture itself,
              it is the lack of variation. Short, frequent movement breaks beat one long session at
              the end of the day.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Every 30-60 min", "A good cadence for standing and resetting"],
                ["2 min", "Enough to change position and reset the eyes"],
                ["20-30 s", "A hold long enough for tissue to give"],
              ].map(([value, note]) => (
                <div
                  key={value}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--primary)]">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            These routines are general estimates for movement awareness, not medical advice. If you
            are pregnant, recovering from an injury or surgery, or have a diagnosed joint, disc, or
            nerve condition, consult a doctor or physiotherapist before following them.
          </p>
        </section>
      </div>

      {playing && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {finished ? "Routine complete" : `Stretch ${stepIndex + 1} of ${steps.length}`}
              </p>
              <button
                type="button"
                onClick={stopPlayer}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
              >
                <X className="h-4 w-4" />
                Exit
              </button>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{
                  width: `${
                    finished ? 100 : (stepIndex / Math.max(1, steps.length)) * 100
                  }%`,
                }}
              />
            </div>

            {finished ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <Sparkles className="h-10 w-10 text-[var(--primary)]" />
                <h2 className="mt-4 text-3xl font-semibold">Nicely done</h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {routine.length} stretches across {areas.map(areaLabel).join(", ")} in about{" "}
                  {formatClock(totalSeconds)}.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToStep(0)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Run it again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSeed((current) => current + 1);
                      stopPlayer();
                    }}
                    className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                  >
                    <Shuffle className="h-4 w-4" />
                    New routine
                  </button>
                </div>
              </div>
            ) : (
              currentStep && (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
                    {reduceMotion ? (
                      <div className="w-full max-w-xs sm:w-56">
                        <p className="text-6xl font-semibold tabular-nums">
                          {Math.ceil(remaining)}
                          <span className="ml-1 text-lg font-medium text-[var(--muted-foreground)]">
                            s
                          </span>
                        </p>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--primary)]"
                            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <CountdownRing progress={progress} remaining={remaining} animate />
                    )}

                    <div className="max-w-md text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--primary)]">
                          {areaLabel(currentStep.stretch.area)}
                        </span>
                        {currentStep.side && (
                          <span className="rounded-full border border-[var(--primary)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--primary)]">
                            {currentStep.side} side
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-3xl font-semibold leading-tight">
                        {currentStep.stretch.name}
                      </h2>
                      <ol className="mt-3 grid gap-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                        {currentStep.stretch.steps.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ol>
                      {currentStep.stretch.caution && (
                        <p className="mt-3 inline-flex items-start gap-1.5 text-xs leading-5 text-[var(--anslation-ds-danger)]">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {currentStep.stretch.caution}
                        </p>
                      )}
                    </div>
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {currentStep.stretch.name}
                    {currentStep.side ? `, ${currentStep.side} side` : ""}
                  </p>

                  <div className="mt-8 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToStep(stepIndex - 1)}
                      disabled={stepIndex === 0}
                      className="btn-secondary min-h-11 px-4 py-2.5 text-sm disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={togglePause}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                    >
                      {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      {paused ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (stepIndex >= steps.length - 1) {
                          setFinished(true);
                          return;
                        }
                        goToStep(stepIndex + 1);
                      }}
                      className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                    >
                      Skip
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>

                  {nextStep && (
                    <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 text-center">
                      <p className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                        Next up
                      </p>
                      <p className="mt-0.5 text-sm font-semibold">
                        {nextStep.stretch.name}
                        {nextStep.side ? ` - ${nextStep.side} side` : ""}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}
