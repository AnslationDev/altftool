"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Candy,
  Clock,
  Coffee,
  Copy,
  CupSoda,
  GlassWater,
  Leaf,
  Milk,
  Moon,
  Pill,
  Trash2,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const HALF_LIFE_HOURS = 5;
const SLEEP_THRESHOLD_MG = 50;
const DAYS_KEY = "altf:caffeine-tracker:days";
const PREFS_KEY = "altf:caffeine-tracker:prefs";

const DRINKS = [
  { id: "filter-coffee", name: "Filter coffee", serving: "240 ml cup", mg: 120, Icon: Coffee },
  { id: "espresso", name: "Espresso shot", serving: "30 ml single", mg: 63, Icon: Coffee },
  { id: "double-espresso", name: "Double espresso", serving: "60 ml double", mg: 126, Icon: Coffee },
  { id: "instant-coffee", name: "Instant coffee", serving: "240 ml cup", mg: 60, Icon: Coffee },
  { id: "latte", name: "Latte / cappuccino", serving: "single shot, 240 ml", mg: 63, Icon: Milk },
  { id: "cold-brew", name: "Cold brew", serving: "300 ml glass", mg: 155, Icon: GlassWater },
  { id: "decaf", name: "Decaf coffee", serving: "240 ml cup", mg: 4, Icon: Coffee },
  { id: "masala-chai", name: "Masala chai", serving: "240 ml cup", mg: 40, Icon: Coffee },
  { id: "black-tea", name: "Black tea", serving: "240 ml cup", mg: 47, Icon: Leaf },
  { id: "green-tea", name: "Green tea", serving: "240 ml cup", mg: 28, Icon: Leaf },
  { id: "matcha", name: "Matcha", serving: "240 ml bowl", mg: 70, Icon: Leaf },
  { id: "iced-tea", name: "Iced tea (bottled)", serving: "350 ml bottle", mg: 18, Icon: GlassWater },
  { id: "cola", name: "Cola", serving: "330 ml can", mg: 34, Icon: CupSoda },
  { id: "diet-cola", name: "Diet cola", serving: "330 ml can", mg: 46, Icon: CupSoda },
  { id: "energy-drink", name: "Energy drink", serving: "250 ml can", mg: 80, Icon: Zap },
  { id: "energy-drink-large", name: "Energy drink (large)", serving: "500 ml can", mg: 160, Icon: Zap },
  { id: "dark-chocolate", name: "Dark chocolate", serving: "40 g bar", mg: 20, Icon: Candy },
  { id: "milk-chocolate", name: "Milk chocolate", serving: "40 g bar", mg: 8, Icon: Candy },
  { id: "hot-chocolate", name: "Hot chocolate", serving: "240 ml mug", mg: 9, Icon: Milk },
  { id: "caffeine-tablet", name: "Caffeine tablet / pre-workout", serving: "1 dose", mg: 200, Icon: Pill },
];

const MULT_OPTIONS = [0.5, 1, 1.5, 2];

const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseHM = (value) => {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
};

const fmtClock = (abs) => {
  const prefix = abs >= 1440 ? "tomorrow " : "";
  const mins = ((Math.round(abs) % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const mm = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${prefix}${h12}:${pad2(mm)} ${suffix}`;
};

const fmtMg = (v) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(Number.isFinite(v) ? v : 0))
  );

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const decayAt = (abs, doses) =>
  doses.reduce(
    (sum, d) => (d.abs > abs ? sum : sum + d.total * Math.pow(0.5, (abs - d.abs) / 60 / HALF_LIFE_HOURS)),
    0
  );

function DecayCurve({ points, end, yTop, limit, nowAbs, bedAbs }) {
  const W = 620;
  const H = 190;
  const L = 42;
  const R = 10;
  const T = 14;
  const B = 26;
  const x = (t) => L + (t / end) * (W - L - R);
  const y = (v) => H - B - (Math.min(v, yTop) / yTop) * (H - T - B);
  const line = points
    .map(([t, v], i) => `${i === 0 ? "M" : "L"}${x(t).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(end).toFixed(1)},${(H - B).toFixed(1)} L${x(0).toFixed(1)},${(H - B).toFixed(1)} Z`;
  const ticks = [];
  for (let t = 0; t <= end; t += 360) ticks.push(t);
  const tickLabel = (t) => {
    const h = (Math.floor(t / 60) % 24 + 24) % 24;
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full"
      role="img"
      aria-label="Estimated caffeine in your body across the day"
      preserveAspectRatio="xMidYMid meet"
    >
      {[SLEEP_THRESHOLD_MG, limit].map((level) =>
        level <= yTop ? (
          <g key={level}>
            <line
              x1={L}
              x2={W - R}
              y1={y(level)}
              y2={y(level)}
              stroke={level === limit ? "var(--anslation-ds-danger)" : "var(--anslation-ds-info)"}
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.6"
            />
            <text x={L - 6} y={y(level) + 3} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">
              {level}
            </text>
          </g>
        ) : null
      )}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={H - B} y2={H - B + 4} stroke="var(--border)" strokeWidth="1" />
          <text x={x(t)} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
            {tickLabel(t)}
          </text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="var(--border)" strokeWidth="1" />
      <path d={area} fill="var(--primary)" opacity="0.12" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
      {nowAbs <= end && (
        <g>
          <line
            x1={x(nowAbs)}
            x2={x(nowAbs)}
            y1={T}
            y2={H - B}
            stroke="var(--foreground)"
            strokeDasharray="3 3"
            strokeWidth="1"
            opacity="0.55"
          />
          <text x={x(nowAbs)} y={T - 3} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
            now
          </text>
        </g>
      )}
      <g>
        <line
          x1={x(bedAbs)}
          x2={x(bedAbs)}
          y1={T}
          y2={H - B}
          stroke="var(--anslation-ds-info)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        <text x={x(bedAbs)} y={T - 3} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
          bed
        </text>
      </g>
    </svg>
  );
}

export default function ToolHome() {
  const [days, setDays] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(null);
  const [mult, setMult] = useState(1);
  const [logTime, setLogTime] = useState("");
  const [pregnant, setPregnant] = useState(false);
  const [bedtime, setBedtime] = useState("23:00");
  const [advisorDrink, setAdvisorDrink] = useState("filter-coffee");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(DAYS_KEY) || "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) setDays(stored);
    } catch {
      /* ignore */
    }
    try {
      const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null");
      if (prefs?.bedtime && parseHM(prefs.bedtime) !== null) setBedtime(prefs.bedtime);
      if (prefs?.pregnant) setPregnant(true);
      if (prefs?.advisorDrink && DRINKS.some((d) => d.id === prefs.advisorDrink)) {
        setAdvisorDrink(prefs.advisorDrink);
      }
    } catch {
      /* ignore */
    }
    const d = new Date();
    setNow(d);
    setLogTime(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const keys = Object.keys(days).sort();
      const pruned = {};
      keys.slice(-14).forEach((k) => {
        pruned[k] = days[k];
      });
      window.localStorage.setItem(DAYS_KEY, JSON.stringify(pruned));
    } catch {
      /* ignore */
    }
  }, [days, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ pregnant, bedtime, advisorDrink }));
    } catch {
      /* ignore */
    }
  }, [pregnant, bedtime, advisorDrink, hydrated]);

  const stats = useMemo(() => {
    const limit = pregnant ? 200 : 400;
    if (!now) {
      return {
        limit,
        todayKey: "",
        entries: [],
        total: 0,
        nowAbs: 0,
        bedAbs: 1380,
        end: 1440,
        points: [],
        peak: 0,
        activeNow: 0,
        projectedBed: 0,
        clearAbs: null,
        advice: "",
        history: [],
      };
    }
    const todayKey = dateKey(now);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const entries = [...(days[todayKey] || [])].sort((a, b) => a.minutes - b.minutes);
    const doses = [
      ...(days[dateKey(yesterday)] || []).map((e) => ({ abs: e.minutes - 1440, total: e.mg * e.mult })),
      ...entries.map((e) => ({ abs: e.minutes, total: e.mg * e.mult })),
    ];
    const total = entries.reduce((s, e) => s + e.mg * e.mult, 0);
    const nowAbs = now.getHours() * 60 + now.getMinutes();
    const bedRaw = parseHM(bedtime) ?? 1380;
    const bedAbs = bedRaw < 720 ? bedRaw + 1440 : bedRaw;
    const end = Math.max(1440, bedAbs);
    const points = [];
    let peak = 0;
    for (let t = 0; t <= end; t += 15) {
      const v = decayAt(t, doses);
      if (v > peak) peak = v;
      points.push([t, v]);
    }
    const activeNow = decayAt(nowAbs, doses);
    const projectedBed = decayAt(bedAbs, doses);
    const clearAbs =
      activeNow > SLEEP_THRESHOLD_MG
        ? nowAbs + HALF_LIFE_HOURS * 60 * Math.log2(activeNow / SLEEP_THRESHOLD_MG)
        : null;
    const advisorObj = DRINKS.find((d) => d.id === advisorDrink) || DRINKS[0];
    const budget = SLEEP_THRESHOLD_MG - projectedBed;
    let advice;
    if (budget <= 1) {
      advice = `Your log already projects about ${fmtMg(projectedBed)} mg at ${fmtClock(
        bedAbs
      )}. More caffeine today is likely to disturb sleep.`;
    } else if (advisorObj.mg <= budget) {
      advice = `A ${advisorObj.name.toLowerCase()} (${advisorObj.mg} mg) at any time today keeps you under ${SLEEP_THRESHOLD_MG} mg at ${fmtClock(
        bedAbs
      )}.`;
    } else {
      const cutoffAbs = bedAbs - HALF_LIFE_HOURS * 60 * Math.log2(advisorObj.mg / budget);
      advice =
        cutoffAbs <= nowAbs
          ? `The window for a ${advisorObj.name.toLowerCase()} closed at ${fmtClock(
              cutoffAbs
            )} today. Pick a lighter option or skip it.`
          : `For under ${SLEEP_THRESHOLD_MG} mg at ${fmtClock(bedAbs)}, have your last ${advisorObj.name.toLowerCase()} by ${fmtClock(
              cutoffAbs
            )}.`;
    }
    const history = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = dateKey(d);
      const dayTotal = (days[key] || []).reduce((s, e) => s + e.mg * e.mult, 0);
      history.push({
        key,
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        total: dayTotal,
        isToday: i === 0,
      });
    }
    return {
      limit,
      todayKey,
      entries,
      total,
      nowAbs,
      bedAbs,
      end,
      points,
      peak,
      activeNow,
      projectedBed,
      clearAbs,
      advice,
      history,
    };
  }, [days, now, pregnant, bedtime, advisorDrink]);

  const pct = stats.limit > 0 ? (stats.total / stats.limit) * 100 : 0;
  const barColor =
    pct >= 100
      ? "var(--anslation-ds-danger)"
      : pct >= 65
        ? "var(--anslation-ds-warning)"
        : "var(--anslation-ds-success)";
  const remaining = Math.max(0, stats.limit - stats.total);
  const historyMax = Math.max(stats.limit, ...stats.history.map((h) => h.total), 1);
  const yTop = Math.max(100, Math.max(stats.limit, stats.peak) * 1.15);

  const addDrink = (drink) => {
    const base = now || new Date();
    const minutes = parseHM(logTime) ?? base.getHours() * 60 + base.getMinutes();
    const key = dateKey(base);
    const entry = { id: uid(), drinkId: drink.id, name: drink.name, mg: drink.mg, mult, minutes };
    setDays((prev) => {
      const list = [...(prev[key] || []), entry].sort((a, b) => a.minutes - b.minutes);
      return { ...prev, [key]: list };
    });
  };

  const removeEntry = (id) => {
    if (!stats.todayKey) return;
    setDays((prev) => ({
      ...prev,
      [stats.todayKey]: (prev[stats.todayKey] || []).filter((e) => e.id !== id),
    }));
  };

  const clearToday = () => {
    if (!stats.todayKey) return;
    setDays((prev) => ({ ...prev, [stats.todayKey]: [] }));
  };

  const setTimeToNow = () => {
    const d = new Date();
    setLogTime(`${pad2(d.getHours())}:${pad2(d.getMinutes())}`);
  };

  const copySummary = async () => {
    const lines = [
      `Caffeine Tracker — ${stats.todayKey || dateKey(new Date())}`,
      `Total logged: ${fmtMg(stats.total)} mg of ${stats.limit} mg daily limit (${fmtMg(pct)}%)`,
      `Active in body now: ~${fmtMg(stats.activeNow)} mg`,
      `Projected at bedtime ${fmtClock(stats.bedAbs)}: ~${fmtMg(stats.projectedBed)} mg`,
      "",
      ...(stats.entries.length
        ? stats.entries.map(
            (e) =>
              `- ${fmtClock(e.minutes)}  ${e.name}${e.mult !== 1 ? ` x${e.mult}` : ""} — ${fmtMg(
                e.mg * e.mult
              )} mg`
          )
        : ["- No drinks logged yet"]),
      "",
      `Half-life model: remaining = dose x 0.5^(hours / ${HALF_LIFE_HOURS})`,
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
    const success = await safeCopyText(lines);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Coffee className="h-4 w-4" />
            Health tracker
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Caffeine Intake Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Tap each coffee, tea, cola, or energy drink as you have it. The tracker totals your day against the
            400 mg safe limit, models how much caffeine is still in your body with a 5-hour half-life, and tells
            you when to stop for a good night of sleep.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Log a drink</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Set serving size and time, then tap a drink to add it.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm font-semibold">Serving size</span>
                <div className="mt-2 flex items-center gap-1.5">
                  {MULT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMult(option)}
                      aria-pressed={mult === option}
                      className={`h-10 flex-1 rounded-md border text-sm font-semibold transition ${
                        mult === option
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option}x
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Time of drink</span>
                <div className="mt-2 flex gap-2">
                  <input
                    type="time"
                    value={logTime}
                    onChange={(event) => setLogTime(event.target.value)}
                    className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <button type="button" onClick={setTimeToNow} className="btn-secondary min-h-10 px-3 py-1.5 text-sm">
                    Now
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-2">
              {DRINKS.map((drink) => {
                const DrinkIcon = drink.Icon;
                return (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() => addDrink(drink)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-left transition hover:border-[var(--primary)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <DrinkIcon className="h-4 w-4 text-[var(--primary)]" />
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        +{fmtMg(drink.mg * mult)} mg
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-tight">{drink.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{drink.serving}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Today so far</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
                {stats.entries.length > 0 && (
                  <button type="button" onClick={clearToday} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Trash2 className="h-4 w-4" />
                    Clear day
                  </button>
                )}
              </div>
            </div>

            <div aria-live="polite" className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="text-5xl font-semibold text-[var(--primary)]">
                {fmtMg(stats.total)}
                <span className="ml-1 text-xl text-[var(--muted-foreground)]">mg</span>
              </p>
              <p className="pb-1 text-sm text-[var(--muted-foreground)]">
                of {stats.limit} mg daily limit · {fmtMg(remaining)} mg headroom left
              </p>
            </div>

            <div
              className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={stats.limit}
              aria-valuenow={Math.round(stats.total)}
              aria-label="Caffeine consumed versus daily limit"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, pct)}%`, background: barColor }}
              />
            </div>

            {pct >= 100 && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--anslation-ds-danger)]">
                <TriangleAlert className="h-4 w-4" />
                Over the {stats.limit} mg guideline — switch to water or decaf for the rest of the day.
              </p>
            )}

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pregnant}
                onChange={(event) => setPregnant(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="font-semibold">Pregnancy mode</span>
              <span className="text-[var(--muted-foreground)]">use the 200 mg limit advised for pregnancy</span>
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">In your body now</p>
                <p className="mt-1 text-lg font-semibold">~{fmtMg(stats.activeNow)} mg</p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Peak today</p>
                <p className="mt-1 text-lg font-semibold">~{fmtMg(stats.peak)} mg</p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Below {SLEEP_THRESHOLD_MG} mg by</p>
                <p className="mt-1 text-lg font-semibold">
                  {stats.clearAbs === null ? "Already there" : `~${fmtClock(stats.clearAbs)}`}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Drinks logged today ({stats.entries.length})</p>
              {stats.entries.length === 0 ? (
                <p className="mt-2 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
                  Nothing logged yet. Tap a drink on the left when you have your first cup.
                </p>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {stats.entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[var(--muted-foreground)]">
                          <Clock className="h-3.5 w-3.5" />
                          {fmtClock(entry.minutes)}
                        </span>
                        <span className="truncate text-sm font-semibold">
                          {entry.name}
                          {entry.mult !== 1 ? ` x${entry.mult}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--primary)]">
                          {fmtMg(entry.mg * entry.mult)} mg
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          aria-label={`Remove ${entry.name} logged at ${fmtClock(entry.minutes)}`}
                          className="rounded-md p-1 text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Caffeine in your body</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Modelled with a {HALF_LIFE_HOURS}-hour half-life: remaining = dose x 0.5^(hours / {HALF_LIFE_HOURS}).
                Yesterday evening drinks are carried over.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">Your bedtime</span>
              <input
                type="time"
                value={bedtime}
                onChange={(event) => setBedtime(event.target.value)}
                className="mt-2 h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          </div>

          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            {stats.points.length > 0 ? (
              <DecayCurve
                points={stats.points}
                end={stats.end}
                yTop={yTop}
                limit={stats.limit}
                nowAbs={stats.nowAbs}
                bedAbs={stats.bedAbs}
              />
            ) : (
              <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">Loading the day…</p>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-[var(--muted)] p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                <Moon className="h-4 w-4" />
                Projected at bedtime {fmtClock(stats.bedAbs)}
              </p>
              <p aria-live="polite" className="mt-1 text-2xl font-semibold">
                ~{fmtMg(stats.projectedBed)} mg
                <span
                  className="ml-2 text-sm font-semibold"
                  style={{
                    color:
                      stats.projectedBed > SLEEP_THRESHOLD_MG
                        ? "var(--anslation-ds-danger)"
                        : "var(--anslation-ds-success)",
                  }}
                >
                  {stats.projectedBed > SLEEP_THRESHOLD_MG
                    ? `above the ${SLEEP_THRESHOLD_MG} mg sleep threshold`
                    : `under the ${SLEEP_THRESHOLD_MG} mg sleep threshold`}
                </span>
              </p>
            </div>
            <div className="rounded-md bg-[var(--muted)] p-4">
              <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]" htmlFor="advisor-drink">
                Sleep cutoff advisor
              </label>
              <select
                id="advisor-drink"
                value={advisorDrink}
                onChange={(event) => setAdvisorDrink(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {DRINKS.map((drink) => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name} — {drink.mg} mg
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm font-semibold leading-6">{stats.advice}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">Last 7 days</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Saved on this device only. Bars compare each day against your {stats.limit} mg limit.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3">
            {stats.history.map((day) => {
              const height = day.total > 0 ? Math.max(6, (day.total / historyMax) * 100) : 3;
              const over = day.total > stats.limit;
              return (
                <div key={day.key} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">{fmtMg(day.total)}</span>
                  <div className="flex h-24 w-full items-end rounded-md bg-[var(--muted)] px-1.5 pb-1.5 pt-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${height}%`,
                        background: over ? "var(--anslation-ds-danger)" : "var(--anslation-ds-success)",
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      day.isToday ? "font-semibold text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {day.isToday ? "Today" : day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            These numbers are estimates for awareness, not medical advice. Caffeine content varies by brand and
            brew, and half-life ranges from about 2 to 10 hours depending on genetics, pregnancy, medications,
            and liver health. If you are pregnant, sensitive to caffeine, or have a heart or sleep condition,
            consult a doctor about your personal limit.
          </p>
        </section>
      </div>
    </main>
  );
}
