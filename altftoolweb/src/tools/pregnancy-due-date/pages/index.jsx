"use client";

import { useMemo, useState } from "react";
import { Baby, CalendarDays, Check, Clock, Copy, Info, Stethoscope } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

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
  // `Number("")` and `Number("   ")` both evaluate to 0, which is finite --
  // so without this guard a blank field silently clamps to `min` instead of
  // falling back to `fallback`, shifting the due date instead of leaving it
  // at the neutral default.
  const trimmed = typeof value === "string" ? value.trim() : value;
  if (trimmed === "" || trimmed === null || trimmed === undefined) return fallback;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
};
const formatDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatLong = (date) =>
  date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const formatShort = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const formatRange = (start, end) => `${formatShort(start)} – ${formatDate(end)}`;

const METHODS = [
  {
    id: "lmp",
    label: "Last menstrual period",
    dateLabel: "First day of last menstrual period",
    formula: "Naegele's rule: due date = LMP + 280 days, shifted by (cycle length − 28).",
  },
  {
    id: "conception",
    label: "Conception date",
    dateLabel: "Conception date",
    formula: "Due date = conception date + 266 days.",
  },
  {
    id: "ivf",
    label: "IVF transfer",
    dateLabel: "Embryo transfer date",
    formula: "Due date = transfer + 263 days (day-3 embryo) or + 261 days (day-5 embryo).",
  },
];

const BABY_SIZES = [
  { week: 4, size: "Poppy seed", length: "0.1 cm" },
  { week: 5, size: "Sesame seed", length: "0.3 cm" },
  { week: 6, size: "Lentil", length: "0.6 cm" },
  { week: 7, size: "Blueberry", length: "1 cm" },
  { week: 8, size: "Kidney bean", length: "1.6 cm" },
  { week: 9, size: "Grape", length: "2.3 cm" },
  { week: 10, size: "Kumquat", length: "3.1 cm" },
  { week: 11, size: "Fig", length: "4.1 cm" },
  { week: 12, size: "Lime", length: "5.4 cm" },
  { week: 13, size: "Pea pod", length: "7.4 cm" },
  { week: 14, size: "Lemon", length: "8.7 cm" },
  { week: 15, size: "Apple", length: "10.1 cm" },
  { week: 16, size: "Avocado", length: "11.6 cm" },
  { week: 17, size: "Pear", length: "13 cm" },
  { week: 18, size: "Bell pepper", length: "14.2 cm" },
  { week: 19, size: "Tomato", length: "15.3 cm" },
  { week: 20, size: "Banana", length: "25.6 cm" },
  { week: 21, size: "Carrot", length: "26.7 cm" },
  { week: 22, size: "Papaya", length: "27.8 cm" },
  { week: 23, size: "Grapefruit", length: "28.9 cm" },
  { week: 24, size: "Ear of corn", length: "30 cm" },
  { week: 25, size: "Rutabaga", length: "34.6 cm" },
  { week: 26, size: "Zucchini", length: "35.6 cm" },
  { week: 27, size: "Cauliflower", length: "36.6 cm" },
  { week: 28, size: "Eggplant", length: "37.6 cm" },
  { week: 29, size: "Butternut squash", length: "38.6 cm" },
  { week: 30, size: "Cabbage", length: "39.9 cm" },
  { week: 31, size: "Coconut", length: "41.1 cm" },
  { week: 32, size: "Jicama", length: "42.4 cm" },
  { week: 33, size: "Pineapple", length: "43.7 cm" },
  { week: 34, size: "Cantaloupe", length: "45 cm" },
  { week: 35, size: "Honeydew melon", length: "46.2 cm" },
  { week: 36, size: "Romaine lettuce", length: "47.4 cm" },
  { week: 37, size: "Swiss chard", length: "48.6 cm" },
  { week: 38, size: "Leek", length: "49.8 cm" },
  { week: 39, size: "Mini watermelon", length: "50.7 cm" },
  { week: 40, size: "Small pumpkin", length: "51.2 cm" },
];

export default function ToolHome() {
  const [method, setMethod] = useState("lmp");
  const [dateInput, setDateInput] = useState(() =>
    toInputValue(addDays(startOfToday(), -112))
  );
  const [cycleLenInput, setCycleLenInput] = useState("28");
  const [embryoDay, setEmbryoDay] = useState("day5");
  const [copied, setCopied] = useState(false);

  const activeMethod = METHODS.find((item) => item.id === method) || METHODS[0];

  const view = useMemo(() => {
    const today = startOfToday();
    const base = parseDateInput(dateInput);
    const cycleLen = clampInt(cycleLenInput, 21, 40, 28);
    if (!base) return { invalid: true };

    let due;
    if (method === "lmp") due = addDays(base, 280 + (cycleLen - 28));
    else if (method === "conception") due = addDays(base, 266);
    else due = addDays(base, embryoDay === "day5" ? 261 : 263);

    const effectiveLmp = addDays(due, -280);
    const gaDays = diffDays(today, effectiveLmp);
    const gaClamped = Math.max(0, gaDays);
    const gaWeeks = Math.floor(gaClamped / 7);
    const gaRemDays = gaClamped % 7;
    const daysRemaining = diffDays(due, today);
    const percent = Math.min(100, Math.max(0, Math.round((gaClamped / 280) * 100)));

    const trimesters = [
      {
        id: 1,
        label: "First trimester",
        weeks: "Weeks 1–13",
        start: effectiveLmp,
        end: addDays(effectiveLmp, 97),
      },
      {
        id: 2,
        label: "Second trimester",
        weeks: "Weeks 14–27",
        start: addDays(effectiveLmp, 98),
        end: addDays(effectiveLmp, 195),
      },
      {
        id: 3,
        label: "Third trimester",
        weeks: "Weeks 28–40",
        start: addDays(effectiveLmp, 196),
        end: due,
      },
    ];
    const currentTrimester = gaDays < 98 ? 1 : gaDays < 196 ? 2 : 3;

    const sizeEntry =
      gaWeeks >= 4 ? BABY_SIZES.find((item) => item.week === Math.min(gaWeeks, 40)) : null;

    const milestones = [
      { label: "Heartbeat detectable on ultrasound", week: "~6", date: addDays(effectiveLmp, 42) },
      { label: "End of first trimester", week: "13", date: addDays(effectiveLmp, 97) },
      {
        label: "Anatomy scan window",
        week: "18–20",
        date: addDays(effectiveLmp, 126),
        end: addDays(effectiveLmp, 140),
      },
      { label: "Viability milestone", week: "24", date: addDays(effectiveLmp, 168) },
      { label: "Third trimester begins", week: "28", date: addDays(effectiveLmp, 196) },
      { label: "Full term", week: "39", date: addDays(effectiveLmp, 273) },
    ].map((item) => ({
      ...item,
      passed: diffDays(item.end || item.date, today) < 0,
    }));

    const methodLabel = METHODS.find((item) => item.id === method)?.label || method;
    const summary = [
      "Pregnancy Due Date summary",
      `Method: ${methodLabel}${
        method === "ivf" ? ` (${embryoDay === "day5" ? "day-5" : "day-3"} embryo)` : ""
      }`,
      `Input date: ${formatDate(base)}`,
      method === "lmp" ? `Cycle length: ${cycleLen} days` : null,
      `Estimated due date: ${formatDate(due)}`,
      `Gestational age today: ${gaWeeks} weeks ${gaRemDays} days`,
      `Trimester: ${currentTrimester} of 3`,
      daysRemaining >= 0
        ? `Days remaining: ${daysRemaining}`
        : `Past the due date by ${Math.abs(daysRemaining)} days`,
      `Pregnancy complete: ${percent}%`,
      sizeEntry
        ? `This week: about the size of a ${sizeEntry.size.toLowerCase()} (~${sizeEntry.length})`
        : null,
      "Note: only about 4% of babies arrive exactly on their due date.",
      `Generated: ${new Date().toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      invalid: false,
      today,
      base,
      cycleLen,
      due,
      gaDays,
      gaWeeks,
      gaRemDays,
      daysRemaining,
      percent,
      trimesters,
      currentTrimester,
      sizeEntry,
      milestones,
      summary,
    };
  }, [cycleLenInput, dateInput, embryoDay, method]);

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
            <Baby className="h-4 w-4" />
            Health · Pregnancy
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Pregnancy Due Date Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate your due date from your last period, conception date, or IVF transfer — then
            see how far along you are, trimester dates, key milestones, and how big your baby is
            this week.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <span className="text-sm font-semibold">Calculation method</span>
            <div className="mt-2 grid gap-2">
              {METHODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    method === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">{activeMethod.dateLabel}</span>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              {method === "lmp" && (
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
                    Longer cycles usually mean later ovulation, so the due date shifts by cycle
                    length − 28 days.
                  </span>
                </label>
              )}

              {method === "ivf" && (
                <div>
                  <span className="text-sm font-semibold">Embryo age at transfer</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      { id: "day3", label: "Day-3 embryo" },
                      { id: "day5", label: "Day-5 embryo" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEmbryoDay(item.id)}
                        className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                          embryoDay === item.id
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Formula: {activeMethod.formula}
            </p>
          </div>

          <div className="space-y-6">
            {view.invalid ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--muted-foreground)]">
                Pick a valid date to see your estimated due date.
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Estimated due date
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
                  <div>
                    {/* Scoped to just the headline so screen readers announce a
                        single short sentence when the cycle-length input changes,
                        instead of re-reading the whole due-date/gestational-age/
                        progress-bar block on every keystroke. */}
                    <p
                      aria-live="polite"
                      role="status"
                      className="mt-3 text-3xl font-semibold text-[var(--primary)] sm:text-4xl"
                    >
                      {formatLong(view.due)}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Gestational age today</p>
                        <p className="mt-1 font-semibold">
                          {view.gaWeeks} weeks {view.gaRemDays} days
                        </p>
                      </div>
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Trimester</p>
                        <p className="mt-1 font-semibold">{view.currentTrimester} of 3</p>
                      </div>
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Days remaining</p>
                        <p className="mt-1 font-semibold">
                          {view.daysRemaining >= 0
                            ? view.daysRemaining
                            : `${Math.abs(view.daysRemaining)} past due`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                        <span>Pregnancy progress</span>
                        <span>{view.percent}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={view.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Percentage of pregnancy complete"
                        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${view.percent}%`, background: "var(--primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Only about 4% of babies arrive exactly on their due date — most are born within
                    a week or two on either side of it.
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Trimester dates
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {view.trimesters.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-md border p-4 ${
                          view.currentTrimester === item.id && view.gaDays >= 0
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">
                          {item.weeks}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                          {formatRange(item.start, item.end)}
                        </p>
                        {view.currentTrimester === item.id && view.gaDays >= 0 && (
                          <p className="mt-2 inline-flex rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary-foreground)]">
                            You are here
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Key milestone dates
                  </p>
                  <ul className="mt-4 space-y-2">
                    {view.milestones.map((item) => (
                      <li
                        key={item.label}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          {item.passed ? (
                            <Check className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                          ) : (
                            <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
                          )}
                          {item.label}
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                            Week {item.week}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                          {item.end ? formatRange(item.date, item.end) : formatDate(item.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Baby size week by week
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md bg-[var(--muted)] p-4">
                    <Baby className="h-8 w-8 text-[var(--primary)]" />
                    {view.sizeEntry ? (
                      <p className="text-sm leading-6">
                        <span className="font-semibold">Week {Math.min(view.gaWeeks, 40)}:</span>{" "}
                        your baby is about the size of a{" "}
                        <span className="font-semibold text-[var(--primary)]">
                          {view.sizeEntry.size.toLowerCase()}
                        </span>{" "}
                        (~{view.sizeEntry.length} long).
                        {view.gaWeeks > 40 && " Past week 40 — hang in there!"}
                      </p>
                    ) : (
                      <p className="text-sm leading-6">
                        Very early days — size comparisons start from week 4, when the embryo is
                        about the size of a poppy seed.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 max-h-96 overflow-y-auto rounded-md border border-[var(--border)]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="sticky top-0 bg-[var(--muted)] text-xs uppercase text-[var(--muted-foreground)]">
                          <tr>
                            <th scope="col" className="px-3 py-2 font-semibold">Week</th>
                            <th scope="col" className="px-3 py-2 font-semibold">About the size of</th>
                            <th scope="col" className="px-3 py-2 font-semibold">Approx. length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {BABY_SIZES.map((item) => {
                            const isCurrent =
                              view.sizeEntry && item.week === Math.min(view.gaWeeks, 40);
                            return (
                              <tr
                                key={item.week}
                                className={`border-t border-[var(--border)] ${
                                  isCurrent ? "bg-[var(--muted)] font-semibold" : ""
                                }`}
                              >
                                <td className="px-3 py-2">
                                  {item.week}
                                  {isCurrent && (
                                    <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary-foreground)]">
                                      This week
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2">{item.size}</td>
                                <td className="px-3 py-2">{item.length}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Lengths are crown-to-rump up to week 19 and head-to-heel from week 20, which is
                    why the number jumps there.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These dates are estimates for awareness, not medical advice. Your care provider will
            date the pregnancy precisely, usually with an early ultrasound — consult a doctor for
            checkups and any decisions.
          </p>
        </section>
      </div>
    </main>
  );
}
