"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Flame,
  Play,
  RotateCcw,
  Square,
  Stethoscope,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const HISTORY_KEY = "altf:intermittent-fasting-timer:history";
const SETTINGS_KEY = "altf:intermittent-fasting-timer:settings";
const ACTIVE_KEY = "altf:intermittent-fasting-timer:active";

const HOUR_MS = 3600000;
const TIMELINE_MAX = 30;

const PROTOCOLS = [
  {
    id: "14:10",
    label: "14:10",
    fast: 14,
    eat: 10,
    tagline: "Gentle start",
    blurb:
      "The easiest on-ramp. Drop the late-night snack and push breakfast back an hour or two. Most people never feel hungry on this one.",
  },
  {
    id: "16:8",
    label: "16:8",
    fast: 16,
    eat: 8,
    tagline: "Most popular",
    blurb:
      "The best-studied daily window. Usually means skipping breakfast and eating from noon to 8 PM. Long enough to reach fat burning most days.",
  },
  {
    id: "18:6",
    label: "18:6",
    fast: 18,
    eat: 6,
    tagline: "Autophagy edge",
    blurb:
      "Reaches the mark where autophagy signalling starts picking up. A common next step once 16:8 feels routine.",
  },
  {
    id: "20:4",
    label: "20:4",
    fast: 20,
    eat: 4,
    tagline: "Warrior",
    blurb:
      "One large meal plus a snack inside four hours. Effective, but hitting protein and micronutrient targets gets genuinely hard.",
  },
  {
    id: "23:1",
    label: "OMAD 23:1",
    fast: 23,
    eat: 1,
    tagline: "One meal a day",
    blurb:
      "Everything in a single hour. Deep into ketosis and autophagy every day, but nutritionally demanding and easy to under-eat on.",
  },
  {
    id: "5:2",
    label: "5:2",
    fast: 16,
    eat: 8,
    tagline: "Weekly pattern",
    blurb:
      "Two low-calorie days a week, five normal days. Calorie-led rather than clock-led — the odd one out in this list.",
    note: "5:2 is not a daily clock window. You eat normally five days a week and cut to roughly 500 kcal (women) or 600 kcal (men) on two non-consecutive days. The timer below tracks the fasting gap on one of those restricted days, but the calorie cap is what does the work — not the clock.",
  },
  {
    id: "custom",
    label: "Custom",
    fast: 17,
    eat: 7,
    tagline: "Your own",
    blurb:
      "Set any target from 1 to 36 hours — for an extended fast, or a window your clinician asked you to keep.",
  },
];

const PHASES = [
  {
    id: "fed",
    start: 0,
    end: 4,
    name: "Fed / digesting",
    summary: "Insulin is high and your body is still absorbing the last meal.",
    detail:
      "Blood glucose and insulin rise, nutrients get stored, and fat burning is switched off while there is food to work with. Nothing fasting-specific has started yet.",
    mix: 16,
  },
  {
    id: "glycogen",
    start: 4,
    end: 12,
    name: "Blood sugar drops, glycogen burns",
    summary: "Insulin falls and your liver releases stored glycogen to hold blood sugar steady.",
    detail:
      "Roughly 100g of liver glycogen is drawn down across these hours. Hunger waves arrive here and pass in about 20 minutes — they follow your old meal schedule, not a real shortage.",
    mix: 34,
  },
  {
    id: "fatburn",
    start: 12,
    end: 16,
    name: "Fat burning begins",
    summary: "Glycogen runs low, lipolysis ramps up, and fat becomes the main fuel.",
    detail:
      "This is the metabolic switch. Insulin sits at its floor, fatty acids are pulled out of storage, and the first ketone bodies start showing up in the blood.",
    mix: 55,
  },
  {
    id: "ketosis",
    start: 16,
    end: 24,
    name: "Ketosis rising, autophagy begins",
    summary: "Ketones climb and cellular clean-up starts stepping up around the 18-hour mark.",
    detail:
      "Your brain begins running partly on ketones, which is why people report clearer focus here. Autophagy — cells recycling damaged proteins and worn-out parts — picks up around 18 hours, and growth hormone rises alongside it.",
    mix: 78,
  },
  {
    id: "deep",
    start: 24,
    end: TIMELINE_MAX,
    name: "Deep autophagy",
    summary: "Ketones are the dominant fuel and cellular recycling is at its strongest.",
    detail:
      "Liver glycogen is essentially gone and the body is fully fat-adapted for this fast. Anything past 24 hours is worth clearing with a doctor first, especially if you take any medication.",
    mix: 100,
  },
];

const KEEPS_FAST = [
  ["Water", "Still or sparkling, as much as you want."],
  ["Black coffee", "Under 5 kcal a cup. May even nudge autophagy along."],
  ["Plain green or black tea", "No milk, no sugar, no honey."],
  ["Electrolytes with no sugar", "Plain salt, magnesium, potassium — helpful on longer fasts."],
];

const BREAKS_FAST = [
  ["Milk, cream or oat milk in coffee", "Even a splash carries carbs and protein. Insulin responds."],
  ["Sugar or honey", "Straight to a glucose and insulin spike. Fast over."],
  ["BCAAs and protein shakes", "Leucine triggers insulin and mTOR, which is exactly what shuts autophagy down."],
  ["Gummy vitamins and sweetened supplements", "Small, but they are still food."],
];

const AVOID_LIST = [
  ["Pregnant or breastfeeding", "Energy needs are elevated and steady intake matters. Not the time to restrict."],
  ["Type 1 diabetes, or insulin / sulfonylureas", "Real risk of hypoglycaemia. Only under medical supervision, with doses adjusted."],
  ["A history of disordered eating", "Rule-based restriction can reopen the pattern. Talk to a clinician first."],
  ["Under 18, or underweight", "Growth and recovery need consistent fuel."],
  ["Medication that must be taken with food", "Skipping the meal can mean skipping the dose or irritating your stomach."],
];

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pad2 = (value) => String(value).padStart(2, "0");

const dayKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const toLocalInput = (ms) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const fromLocalInput = (value) => {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const minutesFromTimeInput = (value) => {
  const [hour, minute] = String(value || "12:00").split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 720;
  return hour * 60 + minute;
};

const formatClock = (minutes) => {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${pad2(minute)} ${suffix}`;
};

const formatDuration = (ms) => {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

const formatShort = (ms) => {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${pad2(minutes)}m`;
};

const formatHours = (hours) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(hours);

const phaseAt = (hours) =>
  PHASES.find((phase) => hours >= phase.start && hours < phase.end) || PHASES[PHASES.length - 1];

const nextOccurrence = (nowMs, minutes) => {
  const now = new Date(nowMs);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, minutes, 0, 0);
  if (target.getTime() <= nowMs) target.setDate(target.getDate() + 1);
  return target.getTime();
};

function PhaseTimeline({ elapsedHours, activePhaseId }) {
  const markerLeft = `${clamp(elapsedHours / TIMELINE_MAX, 0, 1) * 100}%`;

  return (
    <div>
      <div className="relative">
        <div className="flex h-11 overflow-hidden rounded-md border border-[var(--border)]">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className="relative flex items-center justify-center border-r border-[var(--border)] last:border-r-0"
              style={{
                flexGrow: phase.end - phase.start,
                flexBasis: 0,
                background: `color-mix(in srgb, var(--primary) ${phase.mix}%, var(--muted))`,
              }}
            >
              <span
                className="px-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color:
                    phase.mix >= 55
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {phase.start}h
              </span>
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute -top-1 bottom-[-4px] w-[3px] rounded-full"
          style={{ left: markerLeft, background: "var(--foreground)" }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-4 grid gap-2">
        {PHASES.map((phase) => {
          const isActive = phase.id === activePhaseId;
          return (
            <div
              key={phase.id}
              className="rounded-md border px-3 py-2.5"
              style={{
                borderColor: isActive ? "var(--primary)" : "var(--border)",
                background: isActive
                  ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                  : "var(--background)",
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">
                  {phase.name}
                  {isActive && (
                    <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary-foreground)]">
                      You are here
                    </span>
                  )}
                </p>
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {phase.start}–{phase.end === TIMELINE_MAX ? "24+" : phase.end}h
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                {isActive ? phase.detail : phase.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [protocolId, setProtocolId] = useState("16:8");
  const [customFast, setCustomFast] = useState(17);
  const [windowStart, setWindowStart] = useState("12:00");
  const [fastStart, setFastStart] = useState(null);
  const [history, setHistory] = useState([]);
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const chimedRef = useRef(false);
  const baseTitleRef = useRef("");

  useEffect(() => {
    try {
      const rawSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        if (parsed && typeof parsed === "object") {
          if (PROTOCOLS.some((item) => item.id === parsed.protocolId)) setProtocolId(parsed.protocolId);
          if (typeof parsed.customFast === "number") setCustomFast(clamp(parsed.customFast, 1, 36));
          if (typeof parsed.windowStart === "string") setWindowStart(parsed.windowStart);
        }
      }
      const rawActive = window.localStorage.getItem(ACTIVE_KEY);
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (parsed && typeof parsed.fastStart === "number") setFastStart(parsed.fastStart);
      }
      const rawHistory = window.localStorage.getItem(HISTORY_KEY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.filter((item) => item && typeof item.endedAt === "number").slice(0, 30));
        }
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    baseTitleRef.current = document.title;
    return () => {
      document.title = baseTitleRef.current;
    };
  }, []);

  const protocol = useMemo(
    () => PROTOCOLS.find((item) => item.id === protocolId) || PROTOCOLS[1],
    [protocolId]
  );

  const targetHours = protocolId === "custom" ? clamp(Number(customFast) || 1, 1, 36) : protocol.fast;
  const eatHours = Math.max(0, 24 - targetHours);
  const mounted = now > 0;
  const fasting = fastStart !== null;

  const elapsedMs = fasting && mounted ? Math.max(0, now - fastStart) : 0;
  const elapsedHours = elapsedMs / HOUR_MS;
  const targetMs = targetHours * HOUR_MS;
  const remainingMs = Math.max(0, targetMs - elapsedMs);
  const progress = clamp((elapsedMs / targetMs) * 100, 0, 100);
  const reachedTarget = fasting && elapsedMs >= targetMs;
  const activePhase = phaseAt(fasting ? elapsedHours : 0);

  const windowStartMins = minutesFromTimeInput(windowStart);
  const windowEndMins = windowStartMins + eatHours * 60;
  const nextFastAt = mounted ? nextOccurrence(now, windowEndMins) : 0;
  const nextFastIn = mounted ? Math.max(0, nextFastAt - now) : 0;

  const persistSettings = useCallback((next) => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    persistSettings({ protocolId, customFast, windowStart });
  }, [protocolId, customFast, windowStart, mounted, persistSettings]);

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {
      /* audio unavailable */
    }
  }, []);

  const playChime = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const base = ctx.currentTime + 0.02;
      [
        [0, 660],
        [0.22, 880],
        [0.44, 1174],
      ].forEach(([offset, freq]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, base + offset);
        gain.gain.exponentialRampToValueAtTime(0.16, base + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, base + offset + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(base + offset);
        osc.stop(base + offset + 0.55);
      });
    } catch {
      /* audio unavailable */
    }
  }, []);

  useEffect(() => {
    if (!fasting) {
      chimedRef.current = false;
      return;
    }
    if (!chimedRef.current && reachedTarget) {
      chimedRef.current = true;
      playChime();
    }
  }, [fasting, reachedTarget, playChime]);

  useEffect(() => {
    if (!mounted) return;
    if (!fasting) {
      document.title = baseTitleRef.current;
      return;
    }
    document.title = reachedTarget
      ? `Target hit · ${formatShort(elapsedMs)} fasted`
      : `${formatShort(remainingMs)} left · Fasting`;
  }, [mounted, fasting, reachedTarget, remainingMs, elapsedMs]);

  const persistHistory = useCallback((next) => {
    setHistory(next);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persistActive = useCallback((value) => {
    setFastStart(value);
    try {
      if (value === null) window.localStorage.removeItem(ACTIVE_KEY);
      else window.localStorage.setItem(ACTIVE_KEY, JSON.stringify({ fastStart: value }));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const startFast = () => {
    ensureAudio();
    chimedRef.current = false;
    persistActive(Date.now());
  };

  const startAtPlanned = () => {
    ensureAudio();
    chimedRef.current = false;
    const current = Date.now();
    const todayStart = new Date(current);
    const planned = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      todayStart.getDate(),
      0,
      windowEndMins,
      0,
      0
    );
    if (planned.getTime() > current) planned.setDate(planned.getDate() - 1);
    persistActive(planned.getTime());
  };

  const endFast = () => {
    if (fastStart === null) return;
    const endedAt = Date.now();
    const achievedHours = Math.max(0, (endedAt - fastStart) / HOUR_MS);
    const entry = {
      id: `${fastStart}`,
      startedAt: fastStart,
      endedAt,
      protocol: protocol.label,
      targetHours,
      achievedHours,
      completion: clamp((achievedHours / targetHours) * 100, 0, 999),
    };
    persistHistory([entry, ...history].slice(0, 30));
    persistActive(null);
  };

  const cancelFast = () => {
    persistActive(null);
  };

  const updateFastStart = (value) => {
    const parsed = fromLocalInput(value);
    if (parsed === null) return;
    chimedRef.current = false;
    persistActive(Math.min(parsed, Date.now()));
  };

  const streak = useMemo(() => {
    const hitDays = new Set(
      history
        .filter((item) => item.completion >= 100)
        .map((item) => dayKey(new Date(item.endedAt)))
    );
    if (hitDays.size === 0) return 0;
    const cursor = startOfToday();
    if (!hitDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (hitDays.has(dayKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [history]);

  const weekStrip = useMemo(() => {
    const days = [];
    const cursor = startOfToday();
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(cursor);
      date.setDate(date.getDate() - index);
      const key = dayKey(date);
      const best = history
        .filter((item) => dayKey(new Date(item.endedAt)) === key)
        .reduce((max, item) => Math.max(max, item.achievedHours), 0);
      days.push({ key, date, hours: best });
    }
    return days;
  }, [history]);

  const stripMax = Math.max(targetHours, ...weekStrip.map((day) => day.hours), 1);

  const stats = useMemo(() => {
    if (history.length === 0) return { count: 0, avg: 0, best: 0, hitRate: 0 };
    const total = history.reduce((sum, item) => sum + item.achievedHours, 0);
    const best = history.reduce((max, item) => Math.max(max, item.achievedHours), 0);
    const hits = history.filter((item) => item.completion >= 100).length;
    return {
      count: history.length,
      avg: total / history.length,
      best,
      hitRate: (hits / history.length) * 100,
    };
  }, [history]);

  const report = useMemo(
    () =>
      [
        "Intermittent Fasting Report",
        `Protocol: ${protocol.label} (${targetHours}h fast / ${formatHours(eatHours)}h eating window)`,
        `Eating window: ${formatClock(windowStartMins)} – ${formatClock(windowEndMins)}`,
        fasting
          ? `Current fast: started ${new Date(fastStart).toLocaleString()} · ${formatHours(elapsedHours)}h in · ${Math.round(progress)}% of target`
          : "Current fast: not fasting right now",
        fasting ? `Phase: ${activePhase.name}` : "",
        `Fasts logged: ${stats.count} · Average ${formatHours(stats.avg)}h · Best ${formatHours(stats.best)}h · Target hit ${Math.round(stats.hitRate)}%`,
        `Streak: ${streak} day${streak === 1 ? "" : "s"}`,
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [
      protocol,
      targetHours,
      eatHours,
      windowStartMins,
      windowEndMins,
      fasting,
      fastStart,
      elapsedHours,
      progress,
      activePhase,
      stats,
      streak,
    ]
  );

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const ringColor = reachedTarget ? "var(--anslation-ds-success)" : "var(--primary)";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Timer className="h-4 w-4" />
            Fasting tracker
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Intermittent Fasting Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Pick a protocol, set your eating window, and watch the clock — with the metabolic phase
            you are actually in, a log of every fast, and a streak that keeps you honest.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Protocol</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-2">
                {PROTOCOLS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProtocolId(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      protocolId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        protocolId === item.id ? "opacity-80" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.tagline}
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{protocol.blurb}</p>

              {protocol.note && (
                <div
                  className="mt-3 rounded-md border p-3"
                  style={{
                    borderColor: "var(--anslation-ds-info)",
                    background: "var(--anslation-ds-info-soft)",
                  }}
                >
                  <p className="text-xs leading-5 text-[var(--foreground)]">{protocol.note}</p>
                </div>
              )}

              {protocolId === "custom" && (
                <label className="mt-4 block">
                  <span className="text-sm font-semibold">Custom fast target: {customFast}h</span>
                  <input
                    type="range"
                    min={1}
                    max={36}
                    step={1}
                    value={customFast}
                    onChange={(event) => setCustomFast(Number(event.target.value))}
                    className="mt-2 w-full accent-[var(--primary)]"
                  />
                </label>
              )}

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Eating window starts at</span>
                <input
                  type="time"
                  value={windowStart}
                  onChange={(event) => setWindowStart(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div className="mt-3 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Your daily schedule</p>
                <p className="mt-1 text-sm font-semibold">
                  Eat {formatClock(windowStartMins)} – {formatClock(windowEndMins)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Fast {formatClock(windowEndMins)} – {formatClock(windowStartMins)} ·{" "}
                  {targetHours}h fasting / {formatHours(eatHours)}h eating
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Last 7 days</p>
              <div className="mt-4 flex items-end justify-between gap-2">
                {weekStrip.map((day, index) => {
                  const height = clamp((day.hours / stripMax) * 100, day.hours > 0 ? 8 : 3, 100);
                  const hit = day.hours >= targetHours;
                  return (
                    <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                        {day.hours > 0 ? formatHours(day.hours) : "–"}
                      </span>
                      <div className="flex h-24 w-full items-end justify-center rounded-sm bg-[var(--muted)]">
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: `${height}%`,
                            background:
                              day.hours > 0
                                ? hit
                                  ? "var(--anslation-ds-success)"
                                  : "var(--primary)"
                                : "var(--border)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                        {WEEKDAY_LETTERS[day.date.getDay()]}
                      </span>
                      <span className="sr-only">
                        {day.date.toLocaleDateString()}: {formatHours(day.hours)} hours fasted
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Streak</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold text-[var(--primary)]">
                    <Flame className="h-4 w-4" />
                    {streak} day{streak === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Target hit rate</p>
                  <p className="mt-1 text-xl font-semibold">{Math.round(stats.hitRate)}%</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-4 text-[var(--muted-foreground)]">
                A streak counts consecutive days where a logged fast reached its target. Today stays
                safe until midnight.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {fasting ? `Fasting · ${protocol.label} target` : `Eating window · ${protocol.label}`}
                </p>
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy report"}
                </button>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] md:items-center">
                <div
                  className="relative mx-auto flex h-60 w-60 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(${ringColor} ${progress}%, var(--muted) ${progress}% 100%)`,
                  }}
                  role="img"
                  aria-label={`${Math.round(progress)} percent of the ${targetHours} hour target`}
                >
                  <div className="absolute inset-[14px] rounded-full bg-[var(--card)]" />
                  <div className="relative text-center" aria-live="polite">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      {fasting ? "Fasted" : "Not fasting"}
                    </p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
                      {mounted ? formatDuration(elapsedMs) : "00:00:00"}
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {reachedTarget
                        ? "Target reached"
                        : fasting
                          ? `${formatShort(remainingMs)} to go`
                          : `${targetHours}h target`}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {Math.round(progress)}% of {targetHours}h
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div
                    className="rounded-md border p-4"
                    style={{
                      borderColor: "var(--primary)",
                      background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Current phase
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
                      {activePhase.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {activePhase.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Hours fasted</p>
                      <p className="mt-1 text-lg font-semibold">{formatHours(elapsedHours)}h</p>
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Hours remaining</p>
                      <p className="mt-1 text-lg font-semibold">
                        {formatHours(remainingMs / HOUR_MS)}h
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md bg-[var(--muted)] p-3" aria-live="polite">
                    {fasting ? (
                      <p className="text-sm">
                        <span className="text-[var(--muted-foreground)]">Eating window opens in </span>
                        <span className="font-semibold tabular-nums">
                          {mounted ? formatDuration(remainingMs) : "--:--:--"}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {" "}
                          at{" "}
                          {mounted ? new Date(fastStart + targetMs).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          }) : "--"}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm">
                        <span className="text-[var(--muted-foreground)]">Next fast starts in </span>
                        <span className="font-semibold tabular-nums">
                          {mounted ? formatDuration(nextFastIn) : "--:--:--"}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {" "}
                          at {formatClock(windowEndMins)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {fasting ? (
                      <>
                        <button
                          type="button"
                          onClick={endFast}
                          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                        >
                          <Square className="h-4 w-4" />
                          End fast &amp; log it
                        </button>
                        <button
                          type="button"
                          onClick={cancelFast}
                          className="btn-secondary min-h-11 px-3 text-sm"
                        >
                          <X className="h-4 w-4" />
                          Discard
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={startFast}
                          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                        >
                          <Play className="h-4 w-4" />
                          Start fast now
                        </button>
                        <button
                          type="button"
                          onClick={startAtPlanned}
                          className="btn-secondary min-h-11 px-3 text-sm"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Started at {formatClock(windowEndMins)}
                        </button>
                      </>
                    )}
                  </div>

                  {fasting && (
                    <label className="block">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        Fast actually started at
                      </span>
                      <input
                        type="datetime-local"
                        value={toLocalInput(fastStart)}
                        max={mounted ? toLocalInput(now) : undefined}
                        onChange={(event) => updateFastStart(event.target.value)}
                        className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">What is happening inside</p>
              <p className="mt-1 mb-4 text-xs leading-5 text-[var(--muted-foreground)]">
                The marker sits at hour {formatHours(elapsedHours)} of your fast.
              </p>
              <PhaseTimeline elapsedHours={elapsedHours} activePhaseId={activePhase.id} />
              <p className="mt-4 text-[11px] leading-4 text-[var(--muted-foreground)]">
                Phase timings are averages. Your last meal, your glycogen stores and how much you
                moved shift them by hours in either direction — and autophagy timing in humans is
                largely extrapolated from animal research, so treat the 18-hour mark as a signpost
                rather than a switch.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">Fast history</p>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => persistHistory([])}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear log
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="mt-4 rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                  No fasts logged yet. Start one above and end it when your eating window opens — the
                  last 30 fasts stay on this device.
                </p>
              ) : (
                <>
                  <div className="tool-compact-grid mt-4">
                    {[
                      ["Fasts logged", `${stats.count}`],
                      ["Average length", `${formatHours(stats.avg)}h`],
                      ["Longest fast", `${formatHours(stats.best)}h`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                      >
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                          <th className="px-3 py-2 font-semibold">Date</th>
                          <th className="px-3 py-2 font-semibold">Protocol</th>
                          <th className="px-3 py-2 font-semibold">Achieved</th>
                          <th className="px-3 py-2 font-semibold">Target</th>
                          <th className="px-3 py-2 font-semibold">Completion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id} className="border-b border-[var(--border)] last:border-b-0">
                            <td className="px-3 py-2">
                              {new Date(item.endedAt).toLocaleDateString([], {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="px-3 py-2 text-[var(--muted-foreground)]">
                              {item.protocol}
                            </td>
                            <td className="px-3 py-2 font-semibold">
                              {formatHours(item.achievedHours)}h
                            </td>
                            <td className="px-3 py-2 text-[var(--muted-foreground)]">
                              {formatHours(item.targetHours)}h
                            </td>
                            <td
                              className="px-3 py-2 font-semibold"
                              style={{
                                color:
                                  item.completion >= 100
                                    ? "var(--anslation-ds-success)"
                                    : "var(--muted-foreground)",
                              }}
                            >
                              {Math.round(item.completion)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">What breaks a fast?</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              The rough line: anything that moves insulin ends the fast. Under about 5 calories with
              no protein or sugar is generally treated as safe.
            </p>
            <div className="mt-4 grid gap-2">
              {KEEPS_FAST.map(([title, detail]) => (
                <div
                  key={title}
                  className="flex items-start gap-2.5 rounded-md border p-3"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--anslation-ds-success-soft)",
                  }}
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--anslation-ds-success)" }}
                  />
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                </div>
              ))}
              {BREAKS_FAST.map(([title, detail]) => (
                <div
                  key={title}
                  className="flex items-start gap-2.5 rounded-md border p-3"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--anslation-ds-danger-soft)",
                  }}
                >
                  <X
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--anslation-ds-danger)" }}
                  />
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-lg border-2 p-6 shadow-[var(--anslation-ds-shadow-sm)]"
            style={{
              borderColor: "var(--anslation-ds-danger)",
              background: "var(--anslation-ds-danger-soft)",
            }}
          >
            <p
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--anslation-ds-danger)" }}
            >
              <AlertTriangle className="h-4 w-4" />
              Do not fast without medical advice if
            </p>
            <div className="mt-4 grid gap-2">
              {AVOID_LIST.map(([title, detail]) => (
                <div
                  key={title}
                  className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--foreground)]">
              Stop the fast and eat if you get dizzy, shaky, confused, or your heart starts racing.
              Those are not signs it is working.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These timings and phases are estimates for awareness, not medical advice. Fasting affects
            blood sugar, medication timing, and energy differently for everyone — consult a doctor
            before starting, especially if you have a health condition or take any medication.
          </p>
        </section>
      </div>
    </main>
  );
}
