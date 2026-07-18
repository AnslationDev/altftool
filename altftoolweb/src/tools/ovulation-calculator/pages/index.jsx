"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Copy,
  Egg,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PERIOD_MARK_DAYS = 5;

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
const formatShortRange = (start, end) => `${formatShort(start)} – ${formatShort(end)}`;

const EXPLAINERS = [
  {
    icon: Egg,
    title: "How the fertile window works",
    points: [
      "Sperm can survive up to 5 days inside the body, while a released egg lives only about 12–24 hours.",
      "That is why the 5 days before ovulation, ovulation day, and roughly 1 day after count as fertile.",
      "This tool assumes ovulation happens about 14 days before the next period (the luteal phase).",
    ],
  },
  {
    icon: Thermometer,
    title: "Signs of ovulation",
    points: [
      "Clear, stretchy, egg-white-like cervical mucus.",
      "A small rise in resting body temperature just after ovulation.",
      "A positive LH surge on ovulation test strips.",
      "Mild one-sided lower-belly twinges or breast tenderness.",
    ],
  },
  {
    icon: Stethoscope,
    title: "When to see a doctor",
    points: [
      "Trying for 12+ months without success, or 6+ months if you are 35 or older.",
      "Cycles shorter than 21 days, longer than 40 days, or very irregular.",
      "Severe period pain or unusually heavy bleeding.",
      "Known PCOS, thyroid issues, or endometriosis — get guidance early.",
    ],
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

export default function ToolHome() {
  const [lastStartInput, setLastStartInput] = useState(() =>
    toInputValue(addDays(startOfToday(), -12))
  );
  const [cycleLenInput, setCycleLenInput] = useState("28");
  const [copied, setCopied] = useState(false);

  const view = useMemo(() => {
    const today = startOfToday();
    const todayKey = toInputValue(today);
    const lastStart = parseDateInput(lastStartInput);
    const cycleLen = clampInt(cycleLenInput, 21, 40, 28);
    if (!lastStart) return { todayKey, invalid: true };

    const sinceStart = diffDays(today, lastStart);
    const baseIndex = sinceStart >= 0 ? Math.floor(sinceStart / cycleLen) : 0;
    const ovulationDayNumber = cycleLen - 14;

    const makeCycle = (index) => {
      const start = addDays(lastStart, index * cycleLen);
      const ovulation = addDays(start, cycleLen - 15);
      return {
        start,
        ovulation,
        fertileStart: addDays(ovulation, -5),
        fertileEnd: addDays(ovulation, 1),
        bestStart: addDays(ovulation, -2),
      };
    };

    const cycles = [0, 1, 2, 3, 4, 5].map((step) => makeCycle(baseIndex + step));
    const currentCycle = cycles[0];
    const cycleDay = diffDays(today, currentCycle.start) + 1;

    let status = "low";
    if (cycleDay >= 1) {
      const offset = diffDays(today, currentCycle.ovulation);
      if (offset >= -2 && offset <= 0) status = "high";
      else if ((offset >= -5 && offset <= -3) || offset === 1) status = "medium";
    }

    const nextWindowCycle =
      today <= currentCycle.fertileEnd ? currentCycle : cycles[1];

    const markers = new Map();
    const mark = (date, flag) => {
      const key = toInputValue(date);
      const entry = markers.get(key) || {};
      entry[flag] = true;
      markers.set(key, entry);
    };
    for (let step = -1; step <= 4; step += 1) {
      if (baseIndex + step < 0) continue;
      const cycle = makeCycle(baseIndex + step);
      for (let d = 0; d < PERIOD_MARK_DAYS; d += 1) mark(addDays(cycle.start, d), "period");
      for (let d = -5; d <= 1; d += 1) mark(addDays(cycle.ovulation, d), "fertile");
      mark(cycle.ovulation, "ovulation");
    }

    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const months = [
      { year: today.getFullYear(), month: today.getMonth() },
      { year: nextMonth.getFullYear(), month: nextMonth.getMonth() },
    ];

    const rows = cycles.map((cycle, index) => ({
      id: index + 1,
      isCurrent: index === 0,
      periodStart: formatDate(cycle.start),
      fertile: formatShortRange(cycle.fertileStart, cycle.fertileEnd),
      ovulation: formatShort(cycle.ovulation),
      best: formatShortRange(cycle.bestStart, cycle.ovulation),
    }));

    const summary = [
      `Ovulation Calculator — next 6 cycles (cycle length ${cycleLen} days)`,
      `Last period started: ${formatDate(lastStart)}`,
      `Assumption: ovulation on cycle day ${ovulationDayNumber} (cycle length − 14).`,
      ...rows.map(
        (row) =>
          `Cycle ${row.id}${row.isCurrent ? " (current)" : ""}: period starts ${row.periodStart} | fertile ${row.fertile} | ovulation ${row.ovulation} | best days ${row.best}`
      ),
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");

    return {
      todayKey,
      invalid: false,
      today,
      cycleLen,
      cycleDay,
      ovulationDayNumber,
      status,
      currentCycle,
      nextWindowCycle,
      markers,
      months,
      rows,
      summary,
    };
  }, [cycleLenInput, lastStartInput]);

  const resetInputs = () => {
    setLastStartInput(toInputValue(addDays(startOfToday(), -12)));
    setCycleLenInput("28");
  };

  const copySchedule = async () => {
    if (view.invalid) return;
    const success = await safeCopyText(view.summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const banner = view.invalid
    ? null
    : {
        high: {
          icon: Sparkles,
          title: "High fertility today",
          detail:
            "Today falls on one of your best days to conceive — the 2 days before ovulation or ovulation day itself.",
          className: "border-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success-soft)]",
        },
        medium: {
          icon: Activity,
          title: "Medium fertility today",
          detail:
            "Today is inside the fertile window, but not at its peak. Chances are moderate.",
          className: "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)]",
        },
        low: {
          icon: CalendarDays,
          title: "Low fertility today",
          detail: `Today falls outside the predicted fertile window. Next fertile window: ${formatShortRange(
            view.nextWindowCycle.fertileStart,
            view.nextWindowCycle.fertileEnd
          )}.`,
          className: "border-[var(--border)] bg-[var(--muted)]",
        },
      }[view.status];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CalendarDays className="h-4 w-4" />
            Health · Fertility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Ovulation Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Map your ovulation day, fertile window, and best days to conceive across the next six
            cycles, and check how fertile today is at a glance.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
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
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Formula: ovulation ≈ cycle day (cycle length − 14), assuming a 14-day luteal phase.
              Fertile window = 5 days before ovulation to 1 day after; best days = the 2 days
              before ovulation plus ovulation day.
            </p>
          </div>

          <div className="space-y-6">
            {view.invalid ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--muted-foreground)]">
                Pick the first day of your last period to see your fertile days.
              </div>
            ) : (
              <>
                <div
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-lg border p-5 shadow-[var(--anslation-ds-shadow-sm)] ${banner.className}`}
                >
                  <banner.icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">{banner.title}</p>
                    <p className="mt-1 text-sm leading-6">
                      {banner.detail}
                      {view.cycleDay >= 1 &&
                        ` You are on cycle day ${view.cycleDay} of ${view.cycleLen}.`}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Next 6 cycles
                    </p>
                    <button
                      type="button"
                      onClick={copySchedule}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy schedule"}
                    </button>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="text-xs uppercase text-[var(--muted-foreground)]">
                        <tr>
                          <th scope="col" className="px-3 py-2 font-semibold">Cycle</th>
                          <th scope="col" className="px-3 py-2 font-semibold">Period starts</th>
                          <th scope="col" className="px-3 py-2 font-semibold">Fertile window</th>
                          <th scope="col" className="px-3 py-2 font-semibold">Ovulation</th>
                          <th scope="col" className="px-3 py-2 font-semibold">Best days to conceive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {view.rows.map((row) => (
                          <tr key={row.id} className="border-t border-[var(--border)]">
                            <td className="px-3 py-2.5 font-semibold">
                              {row.id}
                              {row.isCurrent && (
                                <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary-foreground)]">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">{row.periodStart}</td>
                            <td className="px-3 py-2.5">{row.fertile}</td>
                            <td className="px-3 py-2.5">
                              <span className="font-semibold">{row.ovulation}</span>
                              <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                                (day {view.ovulationDayNumber})
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="rounded-full bg-[var(--anslation-ds-success-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--anslation-ds-success)]">
                                {row.best}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Calendar view
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
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[var(--muted-foreground)]">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-[var(--primary)]" />
                      Period (typical {PERIOD_MARK_DAYS} days)
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
                </div>
              </>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {EXPLAINERS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <item.icon className="h-4 w-4 text-[var(--primary)]" />
                    {item.title}
                  </p>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These dates are estimates for awareness, not medical advice. Ovulation timing varies
            even in regular cycles, so treat this as a guide — consult a doctor or fertility
            specialist for personal advice.
          </p>
        </section>
      </div>
    </main>
  );
}
