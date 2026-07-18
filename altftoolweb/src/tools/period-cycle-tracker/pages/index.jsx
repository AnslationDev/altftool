"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarHeart,
  Copy,
  Droplets,
  Egg,
  Flower,
  MoonStar,
  Plus,
  RotateCcw,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:period-cycle-tracker:log";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad2 = (value) => String(value).padStart(2, "0");
const toInputValue = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseDateInput = (value) => {
  if (!value || typeof value !== "string") return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};
const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const diffDays = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);
const clampInt = (value, min, max, fallback) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
};
const formatDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatShort = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const formatRange = (start, end) => `${formatShort(start)} – ${formatDate(end)}`;
const inDays = (count) => {
  if (count === 0) return "today";
  if (count === 1) return "tomorrow";
  if (count > 1) return `in ${count} days`;
  return `${Math.abs(count)} days ago`;
};

const PHASES = [
  {
    id: "menstrual",
    label: "Menstrual",
    icon: Droplets,
    blurb: "Bleeding days. Hormones are at their lowest and energy often dips.",
  },
  {
    id: "follicular",
    label: "Follicular",
    icon: Flower,
    blurb: "Oestrogen rises while an egg matures, and energy usually climbs.",
  },
  {
    id: "ovulation",
    label: "Ovulation window",
    icon: Egg,
    blurb: "The egg is released around now — the most fertile days of the cycle.",
  },
  {
    id: "luteal",
    label: "Luteal",
    icon: MoonStar,
    blurb: "Progesterone rises after ovulation. PMS can appear late in this phase.",
  },
];

function MiniMonth({ year, month, markers, todayKey }) {
  const firstOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-sm font-semibold">
        {new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <span key={`pad-${index}`} className="h-8" />;
          const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
          const flags = markers.get(key) || {};
          const isToday = key === todayKey;
          let cellClass = "flex h-8 items-center justify-center rounded-md text-xs font-medium";
          if (flags.period) cellClass += " bg-[var(--primary)] text-[var(--primary-foreground)]";
          else if (flags.fertile) cellClass += " bg-[var(--anslation-ds-success-soft)]";
          if (flags.ovulation) cellClass += " font-semibold ring-2 ring-[var(--anslation-ds-success)] ring-inset";
          if (isToday) cellClass += " outline-2 outline-offset-1 outline-[var(--primary)]";
          return (
            <span key={key} className={cellClass}>
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[var(--muted-foreground)]">
      <span className="inline-flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded bg-[var(--primary)]" />
        Period days
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded bg-[var(--anslation-ds-success-soft)]" />
        Fertile window
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded ring-2 ring-[var(--anslation-ds-success)] ring-inset" />
        Ovulation
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3.5 w-3.5 rounded outline-2 outline-offset-1 outline-[var(--primary)]" />
        Today
      </span>
    </div>
  );
}

export default function ToolHome() {
  const [lastStartInput, setLastStartInput] = useState(() =>
    toInputValue(addDays(startOfToday(), -12))
  );
  const [cycleLenInput, setCycleLenInput] = useState("28");
  const [periodLenInput, setPeriodLenInput] = useState("5");
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setLog(
          parsed.filter((item) => typeof item === "string" && parseDateInput(item)).sort()
        );
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persistLog = (next) => {
    setLog(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const view = useMemo(() => {
    const today = startOfToday();
    const todayKey = toInputValue(today);
    const lastStart = parseDateInput(lastStartInput);
    const inputCycleLen = clampInt(cycleLenInput, 21, 40, 28);
    const periodLen = clampInt(periodLenInput, 2, 10, 5);

    const loggedDates = Array.from(new Set(log))
      .map(parseDateInput)
      .filter(Boolean)
      .sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < loggedDates.length; i += 1) {
      const gap = diffDays(loggedDates[i], loggedDates[i - 1]);
      if (gap >= 15 && gap <= 60) gaps.push(gap);
    }
    let personal = null;
    if (loggedDates.length >= 2 && gaps.length >= 1) {
      const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const spread = Math.max(...gaps) - Math.min(...gaps);
      let regularity = "quite regular";
      if (spread > 7) regularity = "irregular — predictions are less reliable";
      else if (spread > 3) regularity = "somewhat variable";
      personal = {
        average: Math.round(average * 10) / 10,
        rounded: Math.round(average),
        shortest: Math.min(...gaps),
        longest: Math.max(...gaps),
        regularity,
        count: loggedDates.length,
      };
    }
    const cycleLen = personal
      ? Math.min(40, Math.max(21, personal.rounded))
      : inputCycleLen;

    if (!lastStart) {
      return { todayKey, invalid: true, periodLen, cycleLen, personal };
    }

    const latestLogged = loggedDates.length ? loggedDates[loggedDates.length - 1] : null;
    const anchor = latestLogged && latestLogged > lastStart ? latestLogged : lastStart;
    const sinceAnchor = diffDays(today, anchor);
    const cycleIndex = sinceAnchor >= 0 ? Math.floor(sinceAnchor / cycleLen) : 0;
    const currentStart = addDays(anchor, cycleIndex * cycleLen);
    const cycleDay = diffDays(today, currentStart) + 1;
    const ovulationDayNumber = cycleLen - 14;

    const makeCycle = (start) => {
      const ovulation = addDays(start, cycleLen - 15);
      return {
        start,
        periodEnd: addDays(start, periodLen - 1),
        ovulation,
        fertileStart: addDays(ovulation, -5),
        fertileEnd: addDays(ovulation, 1),
      };
    };

    const currentCycle = makeCycle(currentStart);
    const upcomingCycles = [1, 2, 3].map((step) =>
      makeCycle(addDays(currentStart, step * cycleLen))
    );

    let phaseId = null;
    if (cycleDay >= 1) {
      if (cycleDay <= periodLen) phaseId = "menstrual";
      else if (today >= currentCycle.fertileStart && today <= currentCycle.fertileEnd)
        phaseId = "ovulation";
      else if (today < currentCycle.fertileStart) phaseId = "follicular";
      else phaseId = "luteal";
    }
    const phaseLabel = PHASES.find((phase) => phase.id === phaseId)?.label || "";

    const phaseRanges = {
      menstrual: [1, periodLen],
      follicular: [periodLen + 1, ovulationDayNumber - 6],
      ovulation: [Math.max(1, ovulationDayNumber - 5), ovulationDayNumber + 1],
      luteal: [ovulationDayNumber + 2, cycleLen],
    };

    const markers = new Map();
    const mark = (date, flag) => {
      const key = toInputValue(date);
      const entry = markers.get(key) || {};
      entry[flag] = true;
      markers.set(key, entry);
    };
    for (let step = -1; step <= 3; step += 1) {
      if (cycleIndex + step < 0) continue;
      const cycle = makeCycle(addDays(anchor, (cycleIndex + step) * cycleLen));
      for (let d = 0; d < periodLen; d += 1) mark(addDays(cycle.start, d), "period");
      for (let d = -5; d <= 1; d += 1) mark(addDays(cycle.ovulation, d), "fertile");
      mark(cycle.ovulation, "ovulation");
    }

    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const months = [
      { year: today.getFullYear(), month: today.getMonth() },
      { year: nextMonth.getFullYear(), month: nextMonth.getMonth() },
    ];

    const predictions = upcomingCycles.map((cycle, index) => ({
      id: index + 1,
      startsIn: diffDays(cycle.start, today),
      range: formatRange(cycle.start, cycle.periodEnd),
      fertile: formatRange(cycle.fertileStart, cycle.fertileEnd),
      ovulation: formatDate(cycle.ovulation),
    }));

    const ovulationRef =
      today <= currentCycle.ovulation ? currentCycle.ovulation : upcomingCycles[0].ovulation;

    const summary = [
      "Period & Cycle Tracker summary",
      `Last period started: ${formatDate(anchor)}`,
      personal
        ? `Cycle length used: ${cycleLen} days (personal average ${personal.average} from ${personal.count} logged periods)`
        : `Cycle length used: ${cycleLen} days`,
      `Period length: ${periodLen} days`,
      cycleDay >= 1
        ? `Today: cycle day ${cycleDay} — ${phaseLabel} phase`
        : `Next cycle starts ${formatDate(currentStart)}`,
      `Estimated ovulation this cycle: ${formatDate(currentCycle.ovulation)} (day ${ovulationDayNumber})`,
      `Fertile window this cycle: ${formatRange(currentCycle.fertileStart, currentCycle.fertileEnd)}`,
      ...predictions.map(
        (item) =>
          `Period ${item.id}: ${item.range} | Fertile: ${item.fertile} | Ovulation: ${item.ovulation}`
      ),
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");

    return {
      todayKey,
      invalid: false,
      today,
      anchor,
      cycleLen,
      inputCycleLen,
      periodLen,
      personal,
      cycleDay,
      currentStart,
      currentCycle,
      phaseId,
      phaseLabel,
      phaseRanges,
      ovulationDayNumber,
      markers,
      months,
      predictions,
      nextPeriodIn: diffDays(upcomingCycles[0].start, today),
      ovulationIn: diffDays(ovulationRef, today),
      summary,
    };
  }, [cycleLenInput, lastStartInput, log, periodLenInput]);

  const loggedKey = view.invalid ? "" : toInputValue(parseDateInput(lastStartInput));
  const canLog = !view.invalid && !log.includes(loggedKey);

  const logThisPeriod = () => {
    if (!canLog) return;
    persistLog(Array.from(new Set([...log, loggedKey])).sort());
  };

  const resetInputs = () => {
    setLastStartInput(toInputValue(addDays(startOfToday(), -12)));
    setCycleLenInput("28");
    setPeriodLenInput("5");
  };

  const copySummary = async () => {
    if (view.invalid) return;
    const success = await safeCopyText(view.summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CalendarHeart className="h-4 w-4" />
            Health · Cycle tracking
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Period &amp; Cycle Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Predict your next three periods, fertile windows, and ovulation days, see which cycle
            phase you are in today, and log past periods so predictions learn your personal rhythm.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Your cycle details</span>
                <button
                  type="button"
                  onClick={resetInputs}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">First day of your last period</span>
                  <input
                    type="date"
                    value={lastStartInput}
                    max={view.todayKey}
                    onChange={(event) => setLastStartInput(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Average cycle length (days)</span>
                  <input
                    type="number"
                    min={21}
                    max={40}
                    step={1}
                    value={cycleLenInput}
                    onChange={(event) => setCycleLenInput(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    From the first day of one period to the first day of the next (21–40).
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Period length (days)</span>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    step={1}
                    value={periodLenInput}
                    onChange={(event) => setPeriodLenInput(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                Formula: ovulation ≈ cycle length − 14 days (luteal phase assumption); fertile
                window = 5 days before ovulation to 1 day after.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <span className="text-sm font-semibold">Period log</span>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Save each period start date on this device. With 2 or more entries, predictions
                switch to your personal average cycle length.
              </p>
              <button
                type="button"
                onClick={logThisPeriod}
                disabled={!canLog}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {canLog || view.invalid ? "Log this period" : "Already logged"}
              </button>
              {log.length > 0 && (
                <>
                  <ul className="mt-4 space-y-2">
                    {[...log]
                      .sort()
                      .reverse()
                      .map((entry) => {
                        const parsed = parseDateInput(entry);
                        return (
                          <li
                            key={entry}
                            className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                          >
                            <span className="font-semibold">
                              {parsed ? formatDate(parsed) : entry}
                            </span>
                            <button
                              type="button"
                              onClick={() => persistLog(log.filter((item) => item !== entry))}
                              aria-label={`Remove logged period ${entry}`}
                              className="text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => persistLog([])}
                    className="mt-3 text-xs font-semibold text-[var(--muted-foreground)] underline-offset-2 hover:underline"
                  >
                    Clear all logged periods
                  </button>
                </>
              )}
              {view.personal && (
                <div className="mt-4 rounded-md bg-[var(--muted)] p-3 text-sm leading-6">
                  <p className="font-semibold text-[var(--primary)]">
                    Personal average: {view.personal.average} days
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Across {view.personal.count} logged periods your cycles ran{" "}
                    {view.personal.shortest}–{view.personal.longest} days — {view.personal.regularity}.
                    Predictions below use {view.cycleLen} days instead of the manual input.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {view.invalid ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--muted-foreground)]">
                Pick the first day of your last period to see predictions.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Where you are today
                    </p>
                    <button
                      type="button"
                      onClick={copySummary}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy summary"}
                    </button>
                  </div>
                  <div aria-live="polite" className="mt-4">
                    {view.cycleDay >= 1 ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="rounded-lg bg-[var(--muted)] p-5">
                          <p className="text-4xl font-semibold text-[var(--primary)]">
                            Day {view.cycleDay}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                            of your {view.cycleLen}-day cycle
                          </p>
                        </div>
                        <div className="space-y-2 text-sm font-semibold">
                          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5">
                            Phase: <span className="text-[var(--primary)]">{view.phaseLabel}</span>
                          </p>
                          <p className="block text-[var(--muted-foreground)]">
                            Next period {inDays(view.nextPeriodIn)} · Ovulation{" "}
                            {view.ovulationIn >= 0
                              ? inDays(view.ovulationIn)
                              : `passed, next ${inDays(view.ovulationIn + view.cycleLen)}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-[var(--muted)] p-5 text-sm font-semibold">
                        This cycle starts {formatDate(view.currentStart)} (
                        {inDays(diffDays(view.currentStart, view.today))}).
                      </p>
                    )}
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {PHASES.map((phase) => {
                      const [rangeStart, rangeEnd] = view.phaseRanges[phase.id];
                      const active = view.phaseId === phase.id;
                      return (
                        <div
                          key={phase.id}
                          className={`rounded-md border p-3 ${
                            active
                              ? "border-[var(--primary)] bg-[var(--muted)]"
                              : "border-[var(--border)] bg-[var(--background)]"
                          }`}
                        >
                          <p className="flex items-center gap-1.5 text-sm font-semibold">
                            <phase.icon
                              className={`h-4 w-4 ${
                                active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                              }`}
                            />
                            {phase.label}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">
                            {rangeStart > rangeEnd
                              ? "Overlaps this cycle"
                              : `Days ${rangeStart}–${rangeEnd}`}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                            {phase.blurb}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Next 3 predicted periods
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {view.predictions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                      >
                        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          Period {item.id} · starts {inDays(item.startsIn)}
                        </p>
                        <p className="mt-2 font-semibold text-[var(--primary)]">{item.range}</p>
                        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                          Fertile window: <span className="font-semibold">{item.fertile}</span>
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                          Ovulation: <span className="font-semibold">{item.ovulation}</span> (day{" "}
                          {view.ovulationDayNumber})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Two-month view
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {view.months.map((item) => (
                      <MiniMonth
                        key={`${item.year}-${item.month}`}
                        year={item.year}
                        month={item.month}
                        markers={view.markers}
                        todayKey={view.todayKey}
                      />
                    ))}
                  </div>
                  <CalendarLegend />
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These dates are estimates for awareness, not medical advice. Real cycles shift with
            stress, travel, and health, so do not rely on this tool for contraception — consult a
            doctor or gynaecologist for anything unusual or important.
          </p>
        </section>
      </div>
    </main>
  );
}
