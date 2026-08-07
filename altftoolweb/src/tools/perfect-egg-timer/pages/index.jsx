"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Egg,
  Flame,
  Lightbulb,
  ListChecks,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Snowflake,
  Waves,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const pad = (value) => String(value).padStart(2, "0");

const formatClock = (totalSeconds) => {
  const total = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
};

const formatDelta = (seconds) => {
  if (seconds === 0) return "no change";
  const sign = seconds > 0 ? "+" : "−";
  return `${sign}${formatClock(Math.abs(seconds))}`;
};

const donenessLevels = [
  {
    id: "soft",
    name: "Soft",
    baseSec: 360,
    tagline: "Runny yolk",
    detail: "White only just set, yolk still liquid. Made for toast soldiers and dipping.",
    yolk: { outer: { r: 13, o: 1 }, gloss: true },
  },
  {
    id: "jammy",
    name: "Jammy",
    baseSec: 420,
    tagline: "Custardy centre",
    detail: "Thin set edge around a bright, spoonable middle. The ramen egg standard.",
    yolk: { outer: { r: 13, o: 0.5 }, core: { r: 11, o: 1 }, gloss: true },
  },
  {
    id: "medium",
    name: "Medium",
    baseSec: 480,
    tagline: "Fudgy middle",
    detail: "Mostly set with a soft, sticky core. Holds its shape in salads and bowls.",
    yolk: { outer: { r: 13, o: 0.5 }, core: { r: 7.5, o: 1 } },
  },
  {
    id: "hard",
    name: "Hard",
    baseSec: 600,
    tagline: "Set but tender",
    detail: "Cooked through and still moist. The everyday lunchbox boiled egg.",
    yolk: { outer: { r: 13, o: 0.5 } },
  },
  {
    id: "veryhard",
    name: "Very hard",
    baseSec: 720,
    tagline: "Firm & crumbly",
    detail: "Dry and firm for mashing. Deviled eggs, egg salad, and sandwich fillings.",
    yolk: { outer: { r: 13, o: 0.45 }, sulfur: true },
  },
];

const eggSizes = [
  { id: "s", label: "Small", sub: "~45 g", delta: -60 },
  { id: "m", label: "Medium", sub: "~53 g", delta: -30 },
  { id: "l", label: "Large", sub: "~60 g", delta: 0 },
  { id: "xl", label: "XL", sub: "~68 g", delta: 30 },
];

const startTemps = [
  { id: "fridge", label: "Fridge cold", sub: "Straight from the door", delta: 0 },
  { id: "room", label: "Room temp", sub: "Out for 20+ minutes", delta: -30 },
];

const methods = [
  { id: "boil", label: "Boiling water start", sub: "Lower eggs into a rolling boil", delta: 0 },
  { id: "steam", label: "Steam", sub: "2 cm water, basket, lid on", delta: 30 },
];

const howToSteps = [
  {
    title: "Boil first, eggs second",
    body: "Bring the water to a full rolling boil before the eggs go in. Starting eggs in cold water makes the timing guesswork, because every stove heats at a different rate.",
  },
  {
    title: "Lower them in gently",
    body: "Use a slotted spoon so the shells do not crack on the base of the pan. Enough water to cover the eggs by about 2 cm keeps the temperature stable.",
  },
  {
    title: "Keep a bare simmer",
    body: "Drop the heat until the water is just barely bubbling. A violent boil knocks the eggs around and cracks them, but does not cook them any faster.",
  },
  {
    title: "Ice bath the second it beeps",
    body: "Move the eggs straight into iced water. This stops the carry-over cooking that turns a jammy yolk chalky, and it shrinks the egg away from the shell.",
  },
];

const peelingTips = [
  {
    title: "Older eggs peel better",
    body: "Eggs a week or two old have a higher internal pH and cling to the shell far less than a fresh farm egg. Save the freshest ones for frying.",
  },
  {
    title: "The ice bath is the whole trick",
    body: "Ten minutes in iced water contracts the egg and lets water seep under the membrane. Warm eggs shred; properly chilled eggs slip out.",
  },
  {
    title: "Crack the fat end first",
    body: "The air pocket sits at the wide bottom. Tap there, then roll the egg on the counter to craze the shell all over before peeling under running water.",
  },
  {
    title: "Steam beats boiling for peeling",
    body: "Steam hits the shell fast and sets the outer white before it bonds to the membrane. Switch the method above if peeling is your usual battle.",
  },
];

const altitudeDelta = (metres) => {
  if (metres <= 1000) return 0;
  return Math.round((((metres - 1000) / 500) * 30) / 5) * 5;
};

const RING_RADIUS = 78;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function EggSlice({ yolk }) {
  return (
    <svg viewBox="0 0 64 84" className="h-16 w-14" aria-hidden="true" focusable="false">
      <path
        d="M32 6 C45 6 55 27 55 46 C55 64 45 78 32 78 C19 78 9 64 9 46 C9 27 19 6 32 6 Z"
        fill="var(--muted)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <circle cx="32" cy="48" r={yolk.outer.r} fill="var(--anslation-ds-warning)" opacity={yolk.outer.o} />
      {yolk.core ? (
        <circle cx="32" cy="48" r={yolk.core.r} fill="var(--anslation-ds-warning)" opacity={yolk.core.o} />
      ) : null}
      {yolk.sulfur ? (
        <circle
          cx="32"
          cy="48"
          r={yolk.outer.r - 1.4}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2.5"
          opacity="0.4"
        />
      ) : null}
      {yolk.gloss ? <ellipse cx="27" cy="43" rx="4" ry="2.4" fill="var(--card)" opacity="0.5" /> : null}
    </svg>
  );
}

export default function ToolHome() {
  const [donenessId, setDonenessId] = useState("jammy");
  const [sizeId, setSizeId] = useState("l");
  const [tempId, setTempId] = useState("fridge");
  const [methodId, setMethodId] = useState("boil");
  const [altitude, setAltitude] = useState(0);
  const [session, setSession] = useState(null);
  const [nowMs, setNowMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(
    () => () => {
      try {
        audioRef.current?.close();
      } catch {}
    },
    []
  );

  const doneness = donenessLevels.find((item) => item.id === donenessId) || donenessLevels[1];
  const size = eggSizes.find((item) => item.id === sizeId) || eggSizes[2];
  const temp = startTemps.find((item) => item.id === tempId) || startTemps[0];
  const method = methods.find((item) => item.id === methodId) || methods[0];

  const altDelta = altitudeDelta(altitude);

  const totalSec = useMemo(() => {
    const raw = doneness.baseSec + size.delta + temp.delta + method.delta + altDelta;
    return Math.min(1500, Math.max(180, raw));
  }, [altDelta, doneness, method, size, temp]);

  const breakdown = useMemo(
    () => [
      { label: `${doneness.name} egg base time`, value: formatClock(doneness.baseSec) },
      { label: `${size.label} egg (${size.sub})`, value: formatDelta(size.delta) },
      { label: temp.label, value: formatDelta(temp.delta) },
      { label: method.label, value: formatDelta(method.delta) },
      {
        label: altitude > 1000 ? `Altitude ${altitude} m` : "Altitude at or below 1,000 m",
        value: formatDelta(altDelta),
      },
    ],
    [altDelta, altitude, doneness, method, size, temp]
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

  const playAlarm = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const base = ctx.currentTime + 0.05;
      const tone = (offset, freq, dur, gainValue) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, base + offset);
        gain.gain.exponentialRampToValueAtTime(gainValue, base + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, base + offset + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(base + offset);
        osc.stop(base + offset + dur + 0.05);
      };
      for (let i = 0; i < 3; i += 1) {
        const at = i * 0.75;
        tone(at, 988, 0.16, 0.25);
        tone(at + 0.2, 1319, 0.28, 0.25);
      }
    } catch {}
  }, []);

  const isRunning = session?.status === "running";

  const tick = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.status !== "running") return;
    const stamp = Date.now();
    setNowMs(stamp);
    if (current.endsAt <= stamp) {
      setSession({ ...current, status: "done", remainingMs: 0 });
      playAlarm();
    }
  }, [playAlarm]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [isRunning, tick]);

  const startTimer = () => {
    ensureAudio();
    const stamp = Date.now();
    setNowMs(stamp);
    setSession({
      status: "running",
      endsAt: stamp + totalSec * 1000,
      remainingMs: totalSec * 1000,
      totalSec,
      label: doneness.name,
    });
  };

  const pauseTimer = () => {
    const current = sessionRef.current;
    if (!current || current.status !== "running") return;
    const remainingMs = Math.max(0, current.endsAt - Date.now());
    setSession({ ...current, status: "paused", remainingMs });
  };

  const resumeTimer = () => {
    const current = sessionRef.current;
    if (!current || current.status !== "paused") return;
    ensureAudio();
    const stamp = Date.now();
    setNowMs(stamp);
    setSession({ ...current, status: "running", endsAt: stamp + current.remainingMs });
  };

  const resetTimer = () => setSession(null);

  const remainingMs = session
    ? session.status === "running"
      ? Math.max(0, session.endsAt - nowMs)
      : session.remainingMs
    : totalSec * 1000;

  const sessionTotalMs = (session?.totalSec ?? totalSec) * 1000;
  const progress = sessionTotalMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / sessionTotalMs)) : 0;
  const staleTarget = Boolean(session && session.totalSec !== totalSec && session.status !== "done");
  const staleTargetVerb = session?.status === "paused" ? "paused" : "running";

  const plan = useMemo(
    () =>
      [
        "Perfect Egg Timer plan",
        `Doneness: ${doneness.name} — ${doneness.tagline}`,
        `Egg size: ${size.label} (${size.sub})`,
        `Starting temperature: ${temp.label}`,
        `Method: ${method.label}`,
        `Altitude: ${altitude} m`,
        "",
        ...breakdown.map((row) => `${row.label}: ${row.value}`),
        `TOTAL COOK TIME: ${formatClock(totalSec)}`,
        "",
        "Ice bath immediately when the timer ends.",
      ].join("\n"),
    [altitude, breakdown, doneness, method, size, temp, totalSec]
  );

  const copyPlan = async () => {
    const success = await safeCopyText(plan);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const resetAll = () => {
    const active = session?.status === "running" || session?.status === "paused";
    if (active && !window.confirm("A timer is currently running — reset anyway?")) return;
    setDonenessId("jammy");
    setSizeId("l");
    setTempId("fridge");
    setMethodId("boil");
    setAltitude(0);
    setSession(null);
  };

  const optionClass = (active) =>
    `rounded-md border px-3 py-3 text-left transition ${
      active
        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
    }`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Egg className="h-4 w-4" />
            Kitchen timer
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Perfect Egg Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Pick the yolk you actually want, then let the timer correct for egg size, fridge chill, altitude, and
            whether you boil or steam. The countdown runs on a fixed finish time, so it stays accurate even in a
            background tab.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">How do you want the yolk?</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Base times are for a large egg, fridge cold, lowered into boiling water at sea level.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset all
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {donenessLevels.map((level) => {
              const active = level.id === donenessId;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setDonenessId(level.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-md border p-4 text-center transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <EggSlice yolk={level.yolk} />
                  <span className={`text-sm font-semibold ${active ? "text-[var(--primary)]" : ""}`}>{level.name}</span>
                  <span className="text-2xl font-semibold tabular-nums">{formatClock(level.baseSec)}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{level.tagline}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{doneness.name}:</span> {doneness.detail}
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,420px)_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Adjustments</h2>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Egg size</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {eggSizes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSizeId(item.id)}
                    aria-pressed={item.id === sizeId}
                    className={optionClass(item.id === sizeId)}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-xs opacity-80">{formatDelta(item.delta)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Starting temperature</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {startTemps.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTempId(item.id)}
                    aria-pressed={item.id === tempId}
                    className={optionClass(item.id === tempId)}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Snowflake className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs opacity-80">{item.sub}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Method</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {methods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethodId(item.id)}
                    aria-pressed={item.id === methodId}
                    className={optionClass(item.id === methodId)}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {item.id === "boil" ? <Flame className="h-4 w-4" /> : <Waves className="h-4 w-4" />}
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs opacity-80">{item.sub}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 block">
              <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  Altitude
                </span>
                <span className="tabular-nums text-[var(--muted-foreground)]">{altitude} m</span>
              </span>
              <input
                type="range"
                min={0}
                max={3500}
                step={100}
                value={altitude}
                onChange={(event) => setAltitude(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
                Water boils cooler as you climb, so eggs need longer. No correction below 1,000 m, then +30s per 500 m.
              </span>
            </label>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {doneness.name} · {size.label} · {method.id === "boil" ? "Boiled" : "Steamed"}
              </p>
              <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy plan"}
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0">
                <svg viewBox="0 0 180 180" className="h-44 w-44" aria-hidden="true" focusable="false">
                  <circle cx="90" cy="90" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle
                    cx="90"
                    cy="90"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={session?.status === "done" ? "var(--anslation-ds-success)" : "var(--primary)"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                    transform="rotate(-90 90 90)"
                    style={reducedMotion ? undefined : { transition: "stroke-dashoffset 200ms linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-semibold tabular-nums" role="timer">
                    {formatClock(remainingMs / 1000)}
                  </span>
                  <span className="mt-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    {session?.status === "done"
                      ? "Done"
                      : session?.status === "paused"
                        ? "Paused"
                        : session
                          ? "Cooking"
                          : "Ready"}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total cook time</p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] tabular-nums">{formatClock(totalSec)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!session || session.status === "done" ? (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4" />
                      {session?.status === "done" ? "Start again" : "Start timer"}
                    </button>
                  ) : null}
                  {session?.status === "running" ? (
                    <button type="button" onClick={pauseTimer} className="btn-secondary min-h-11 px-5 text-sm">
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                  ) : null}
                  {session?.status === "paused" ? (
                    <button
                      type="button"
                      onClick={resumeTimer}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4" />
                      Resume
                    </button>
                  ) : null}
                  {session ? (
                    <button type="button" onClick={resetTimer} className="btn-secondary min-h-11 px-5 text-sm">
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div aria-live="polite">
              {session?.status === "done" ? (
                <div
                  className={`mt-5 rounded-md border p-4 ${reducedMotion ? "" : "animate-pulse"}`}
                  style={{ borderColor: "var(--anslation-ds-success)", background: "var(--anslation-ds-success-soft)" }}
                >
                  <p className="text-lg font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                    Ice bath now!
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                    Lift the eggs straight into iced water for 10 minutes. Every extra second in hot water keeps cooking
                    the yolk, and the cold shock is what makes them peel cleanly.
                  </p>
                </div>
              ) : null}
              {staleTarget ? (
                <p className="mt-5 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
                  Timer is {staleTargetVerb} on the earlier {formatClock(session.totalSec)} target. Reset and start
                  again to use {formatClock(totalSec)}.
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">How that time is built</p>
              <ul className="mt-2 divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--background)]">
                {breakdown.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-[var(--muted-foreground)]">{row.label}</span>
                    <span className="font-semibold tabular-nums">{row.value}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 bg-[var(--muted)] px-3 py-2 text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold tabular-nums text-[var(--primary)]">{formatClock(totalSec)}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: base time + size adjustment + temperature adjustment + method adjustment + altitude
                adjustment, clamped between 3:00 and 25:00.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">How to boil the egg</h2>
            </div>
            <ol className="mt-4 grid gap-4">
              {howToSteps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Peel them without craters</h2>
            </div>
            <div className="mt-4 grid gap-4">
              {peelingTips.map((tip) => (
                <div key={tip.title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-sm font-semibold">{tip.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
