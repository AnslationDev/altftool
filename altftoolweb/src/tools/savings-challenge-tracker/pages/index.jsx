"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, Copy, Flame, Plus, RotateCcw, Sparkles, Target, Trash2, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const WEEK_KEY = "altf:savings-challenge-tracker:week52";
const NOSPEND_KEY = "altf:savings-challenge-tracker:nospend";

const WEEKS = 52;
const TRIANGLE = (WEEKS * (WEEKS + 1)) / 2;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const basePresets = [100, 200, 500];

const modes = [
  { id: "increasing", label: "Increasing", hint: "Week 1 saves base x 1, week 52 saves base x 52" },
  { id: "flat", label: "Flat", hint: "Same amount every week — easiest to automate" },
  { id: "reverse", label: "Reverse", hint: "Start big while motivation is high, taper to base x 1" },
];

const defaultRules = [
  "Groceries and cooking at home",
  "Rent, EMIs, bills and insurance",
  "Medicines and healthcare",
  "Commute to work",
  "Mobile and internet recharge",
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);

function amountForWeek(week, base, mode) {
  if (mode === "flat") return base;
  if (mode === "reverse") return base * (WEEKS + 1 - week);
  return base * week;
}

function targetTotal(base, mode) {
  return mode === "flat" ? base * WEEKS : base * TRIANGLE;
}

function trailingStreak(marked, highest) {
  if (!highest) return 0;
  let streak = 0;
  for (let i = highest; i >= 1; i -= 1) {
    if (!marked.includes(i)) break;
    streak += 1;
  }
  return streak;
}

function longestStreak(sorted) {
  let best = 0;
  let run = 0;
  let prev = null;
  sorted.forEach((value) => {
    run = prev !== null && value === prev + 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = value;
  });
  return best;
}

function milestoneFor(pct) {
  if (pct >= 100)
    return {
      tone: "var(--anslation-ds-success)",
      text: "Challenge complete. Every target hit — now move this money somewhere it actually earns.",
    };
  if (pct >= 75)
    return {
      tone: "var(--anslation-ds-success)",
      text: "75% done. The last stretch is the easiest — the habit is already built.",
    };
  if (pct >= 50)
    return { tone: "var(--primary)", text: "Halfway there. Keep the ritual identical and it finishes itself." };
  if (pct >= 25)
    return { tone: "var(--primary)", text: "25% in. This is where most people quit — you did not." };
  return {
    tone: "var(--muted-foreground)",
    text: "Every marked cell is money that stayed yours. Start with the smallest one.",
  };
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function leadingBlanks(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function useConfetti(active, hydrated) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return undefined;
    if (!active) {
      firedRef.current = false;
      return undefined;
    }
    if (firedRef.current) return undefined;
    firedRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let cancelled = false;
    import("canvas-confetti")
      .then((mod) => {
        if (!cancelled) mod.default({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, hydrated]);
}

export default function ToolHome() {
  const [tab, setTab] = useState("week52");
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(null);
  const [baseYear, setBaseYear] = useState(null);
  const [copied, setCopied] = useState(false);

  const [base, setBase] = useState(100);
  const [mode, setMode] = useState("increasing");
  const [markedWeeks, setMarkedWeeks] = useState([]);

  const [cursor, setCursor] = useState(null);
  const [monthDays, setMonthDays] = useState({});
  const [dailySpend, setDailySpend] = useState(400);
  const [rules, setRules] = useState(defaultRules);
  const [ruleDraft, setRuleDraft] = useState("");

  useEffect(() => {
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    setBaseYear(now.getFullYear());
    setCursor({ year: now.getFullYear(), month: now.getMonth() });

    try {
      const raw = window.localStorage.getItem(WEEK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Number.isFinite(parsed?.base) && parsed.base > 0) setBase(parsed.base);
        if (modes.some((item) => item.id === parsed?.mode)) setMode(parsed.mode);
        if (Array.isArray(parsed?.markedWeeks)) {
          setMarkedWeeks(
            parsed.markedWeeks.filter((week) => Number.isInteger(week) && week >= 1 && week <= WEEKS)
          );
        }
      }
    } catch {
      /* ignore corrupted storage */
    }

    try {
      const raw = window.localStorage.getItem(NOSPEND_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.monthDays && typeof parsed.monthDays === "object") setMonthDays(parsed.monthDays);
        if (Number.isFinite(parsed?.dailySpend) && parsed.dailySpend >= 0) setDailySpend(parsed.dailySpend);
        if (Array.isArray(parsed?.rules)) setRules(parsed.rules.filter((rule) => typeof rule === "string"));
      }
    } catch {
      /* ignore corrupted storage */
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WEEK_KEY, JSON.stringify({ base, mode, markedWeeks }));
    } catch {
      /* storage unavailable */
    }
  }, [base, hydrated, markedWeeks, mode]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(NOSPEND_KEY, JSON.stringify({ monthDays, dailySpend, rules }));
    } catch {
      /* storage unavailable */
    }
  }, [dailySpend, hydrated, monthDays, rules]);

  const safeBase = Math.max(0, Number(base) || 0);

  const week = useMemo(() => {
    const target = targetTotal(safeBase, mode);
    const saved = markedWeeks.reduce((sum, item) => sum + amountForWeek(item, safeBase, mode), 0);
    const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
    const sorted = [...markedWeeks].sort((a, b) => a - b);
    const highest = sorted.length ? sorted[sorted.length - 1] : 0;
    return {
      target,
      saved,
      pct,
      count: markedWeeks.length,
      streak: trailingStreak(markedWeeks, highest),
      best: longestStreak(sorted),
      remaining: WEEKS - markedWeeks.length,
    };
  }, [markedWeeks, mode, safeBase]);

  const projectedFinish = useMemo(() => {
    if (!today) return null;
    const finish = new Date(today.getFullYear(), today.getMonth(), today.getDate() + week.remaining * 7);
    return finish;
  }, [today, week.remaining]);

  const monthKey = cursor ? `${cursor.year}-${cursor.month}` : null;

  const noSpend = useMemo(() => {
    if (!cursor) return null;
    const days = monthDays[monthKey] || [];
    const total = daysInMonth(cursor.year, cursor.month);
    const sorted = [...days].sort((a, b) => a - b);
    const highest = sorted.length ? sorted[sorted.length - 1] : 0;
    const pct = total > 0 ? Math.min((days.length / total) * 100, 100) : 0;
    return {
      days,
      total,
      pct,
      count: days.length,
      streak: trailingStreak(days, highest),
      best: longestStreak(sorted),
      saved: days.length * Math.max(0, Number(dailySpend) || 0),
    };
  }, [cursor, dailySpend, monthDays, monthKey]);

  useConfetti(week.pct >= 100 && week.count === WEEKS, hydrated);
  useConfetti(Boolean(noSpend && noSpend.pct >= 100 && noSpend.count > 0), hydrated);

  const toggleWeek = (value) => {
    setMarkedWeeks((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const toggleDay = (value) => {
    if (!monthKey) return;
    setMonthDays((prev) => {
      const current = prev[monthKey] || [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [monthKey]: next };
    });
  };

  const addRule = () => {
    const value = ruleDraft.trim();
    if (!value) return;
    setRules((prev) => [...prev, value]);
    setRuleDraft("");
  };

  const resetWeek = () => {
    setMarkedWeeks([]);
    setBase(100);
    setMode("increasing");
  };

  const resetNoSpend = () => {
    if (!monthKey) return;
    setMonthDays((prev) => ({ ...prev, [monthKey]: [] }));
  };

  const summary = useMemo(() => {
    if (tab === "week52") {
      const modeLabel = modes.find((item) => item.id === mode)?.label || mode;
      return [
        "52-Week Savings Challenge",
        `Style: ${modeLabel} — base ${formatMoney(safeBase)}`,
        `Saved so far: ${formatMoney(week.saved)} of ${formatMoney(week.target)} (${week.pct.toFixed(0)}%)`,
        `Weeks marked: ${week.count} of ${WEEKS}`,
        `Current streak: ${week.streak} ${week.streak === 1 ? "week" : "weeks"} (best ${week.best})`,
        `Still to save: ${formatMoney(Math.max(week.target - week.saved, 0))}`,
        projectedFinish ? `Projected finish: ${projectedFinish.toLocaleDateString("en-IN", { dateStyle: "medium" })}` : "",
        "",
        milestoneFor(week.pct).text,
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (!noSpend || !cursor) return "";
    return [
      "No-Spend Challenge",
      `Month: ${MONTH_NAMES[cursor.month]} ${cursor.year}`,
      `No-spend days: ${noSpend.count} of ${noSpend.total} (${noSpend.pct.toFixed(0)}%)`,
      `Current streak: ${noSpend.streak} ${noSpend.streak === 1 ? "day" : "days"} (best ${noSpend.best})`,
      `Estimated saved: ${formatMoney(noSpend.saved)} at ${formatMoney(Math.max(0, Number(dailySpend) || 0))} a day`,
      "",
      "Allowed essentials:",
      ...rules.map((rule) => `- ${rule}`),
      "",
      milestoneFor(noSpend.pct).text,
    ].join("\n");
  }, [cursor, dailySpend, mode, noSpend, projectedFinish, rules, safeBase, tab, week]);

  const copySummary = useCallback(async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [summary]);

  const activeMilestone = milestoneFor(tab === "week52" ? week.pct : noSpend?.pct || 0);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Target className="h-4 w-4" />
            Savings habit
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Savings Challenge Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Run the classic 52-week savings challenge or a no-spend month. Tap a cell each time you follow through —
            your progress, streak and milestones stay saved on this device.
          </p>
        </section>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {[
            { id: "week52", label: "52-Week Challenge", icon: TrendingUp },
            { id: "nospend", label: "No-Spend Challenge", icon: CalendarCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold transition ${
                  tab === item.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: activeMilestone.tone }} />
          <p className="text-sm font-semibold leading-6" style={{ color: activeMilestone.tone }} aria-live="polite">
            {activeMilestone.text}
          </p>
        </div>

        {tab === "week52" ? (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Base amount</span>
                <button
                  type="button"
                  onClick={resetWeek}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {basePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBase(preset)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      safeBase === preset
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {formatMoney(preset)}
                  </button>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">Custom base amount</span>
                <input
                  type="number"
                  min="1"
                  value={base}
                  onChange={(event) => setBase(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div className="mt-5">
                <span className="text-sm font-semibold">Challenge style</span>
                <div className="mt-2 grid gap-2">
                  {modes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`rounded-md border px-3 py-3 text-left transition ${
                        mode === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span
                        className={`mt-0.5 block text-xs leading-5 ${
                          mode === item.id ? "" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Final target</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{formatMoney(week.target)}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {mode === "flat"
                    ? `Formula: base x 52 weeks`
                    : `Formula: base x (1 + 2 + ... + 52) = base x ${TRIANGLE}`}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Saved so far</p>
                  <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy progress"}
                  </button>
                </div>
                <p className="mt-3 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
                  {formatMoney(week.saved)}
                  <span className="ml-2 text-lg font-semibold text-[var(--muted-foreground)]">
                    of {formatMoney(week.target)}
                  </span>
                </p>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${week.pct}%`, background: "var(--primary)" }}
                  />
                </div>

                <div className="tool-compact-grid mt-6">
                  {[
                    ["Weeks marked", `${week.count} / ${WEEKS}`],
                    ["Still to save", formatMoney(Math.max(week.target - week.saved, 0))],
                    ["Current streak", `${week.streak} ${week.streak === 1 ? "week" : "weeks"}`],
                    [
                      "Projected finish",
                      week.remaining === 0
                        ? "Done"
                        : projectedFinish
                          ? projectedFinish.toLocaleDateString("en-IN", { dateStyle: "medium" })
                          : "—",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Tap a week when you save it
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{week.pct.toFixed(0)}% complete</p>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
                  {Array.from({ length: WEEKS }, (_, index) => index + 1).map((weekNumber) => {
                    const done = markedWeeks.includes(weekNumber);
                    const amount = amountForWeek(weekNumber, safeBase, mode);
                    return (
                      <button
                        key={weekNumber}
                        type="button"
                        onClick={() => toggleWeek(weekNumber)}
                        aria-pressed={done}
                        aria-label={`Week ${weekNumber}, ${formatMoney(amount)}${done ? ", saved" : ""}`}
                        className={`rounded-md border px-1 py-2 text-center transition ${
                          done
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <span className="block text-[10px] font-semibold uppercase opacity-70">W{weekNumber}</span>
                        <span className="mt-0.5 block text-xs font-semibold">{formatMoney(amount)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Month</span>
                  <select
                    value={cursor ? cursor.month : 0}
                    onChange={(event) =>
                      setCursor((prev) => (prev ? { ...prev, month: Number(event.target.value) } : prev))
                    }
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {MONTH_NAMES.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Year</span>
                  <select
                    value={cursor ? cursor.year : 0}
                    onChange={(event) =>
                      setCursor((prev) => (prev ? { ...prev, year: Number(event.target.value) } : prev))
                    }
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {baseYear
                      ? [baseYear - 1, baseYear, baseYear + 1].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))
                      : null}
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Typical spend on a normal day</span>
                <input
                  type="number"
                  min="0"
                  value={dailySpend}
                  onChange={(event) => setDailySpend(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Only the discretionary part — coffees, deliveries, impulse buys.
                </span>
              </label>

              <div className="mt-5">
                <span className="text-sm font-semibold">Allowed essentials</span>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  A no-spend day is not a no-life day. Spending on anything below still counts as no-spend.
                </p>
                <ul className="mt-3 grid gap-2">
                  {rules.map((rule, index) => (
                    <li
                      key={`${rule}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <span>{rule}</span>
                      <button
                        type="button"
                        onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
                        aria-label={`Remove rule ${rule}`}
                        className="shrink-0 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <label className="sr-only" htmlFor="rule-draft">
                    Add an allowed essential
                  </label>
                  <input
                    id="rule-draft"
                    type="text"
                    value={ruleDraft}
                    placeholder="Add an essential"
                    onChange={(event) => setRuleDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRule();
                      }
                    }}
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <button type="button" onClick={addRule} className="btn-secondary shrink-0 px-3">
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    {cursor ? `${MONTH_NAMES[cursor.month]} ${cursor.year}` : "No-spend month"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={resetNoSpend} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <RotateCcw className="h-4 w-4" />
                      Clear month
                    </button>
                    <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy progress"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
                  {noSpend ? `${noSpend.count} no-spend ${noSpend.count === 1 ? "day" : "days"}` : "—"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {noSpend
                    ? `Roughly ${formatMoney(noSpend.saved)} kept, at ${formatMoney(
                        Math.max(0, Number(dailySpend) || 0)
                      )} of discretionary spend a day.`
                    : ""}
                </p>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${noSpend ? noSpend.pct : 0}%`, background: "var(--primary)" }}
                  />
                </div>

                <div className="tool-compact-grid mt-6">
                  {[
                    ["No-spend days", noSpend ? `${noSpend.count} / ${noSpend.total}` : "—"],
                    ["Estimated saved", noSpend ? formatMoney(noSpend.saved) : "—"],
                    [
                      "Current streak",
                      noSpend ? `${noSpend.streak} ${noSpend.streak === 1 ? "day" : "days"}` : "—",
                    ],
                    ["Best streak", noSpend ? `${noSpend.best} ${noSpend.best === 1 ? "day" : "days"}` : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Tap every day you spent nothing
                  </p>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    <Flame className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                    {noSpend ? `${noSpend.pct.toFixed(0)}% of the month` : ""}
                  </div>
                </div>

                {cursor && noSpend ? (
                  <>
                    <div className="mt-4 grid grid-cols-7 gap-2">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="text-center text-[10px] font-semibold uppercase text-[var(--muted-foreground)]"
                        >
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: leadingBlanks(cursor.year, cursor.month) }, (_, index) => (
                        <div key={`blank-${index}`} />
                      ))}
                      {Array.from({ length: noSpend.total }, (_, index) => index + 1).map((day) => {
                        const done = noSpend.days.includes(day);
                        const isToday =
                          today &&
                          today.getFullYear() === cursor.year &&
                          today.getMonth() === cursor.month &&
                          today.getDate() === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            aria-pressed={done}
                            aria-label={`${MONTH_NAMES[cursor.month]} ${day}${done ? ", no-spend day" : ""}`}
                            className={`aspect-square rounded-md border text-sm font-semibold transition ${
                              done
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                            }`}
                            style={isToday && !done ? { borderColor: "var(--primary)" } : undefined}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                      Formula: estimated saved = no-spend days x your typical discretionary spend. Essentials in the
                      rules list never break a no-spend day.
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">Loading your calendar…</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
