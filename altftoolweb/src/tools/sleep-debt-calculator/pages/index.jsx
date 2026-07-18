"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bed,
  Check,
  Copy,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Stethoscope,
  Sun,
  TrendingDown,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const NIGHTS_KEY = "altf:sleep-debt-calculator:nights";
const SETTINGS_KEY = "altf:sleep-debt-calculator:settings";
const HYGIENE_KEY = "altf:sleep-debt-calculator:hygiene";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RANGE_OPTIONS = [7, 10, 14];

const AGE_BANDS = [
  { id: "teen", label: "Teen (14–17)", min: 8, max: 10, suggest: 9 },
  { id: "adult", label: "Adult (18–64)", min: 7, max: 9, suggest: 8 },
  { id: "older", label: "65 and over", min: 7, max: 8, suggest: 7.5 },
];

const RECOVERY_RATES = [0.5, 1, 1.5, 2];

const SEVERITY = [
  {
    id: "clear",
    limit: 0.5,
    label: "Clear",
    tone: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
    headline: "No meaningful debt",
    detail:
      "You are sleeping close to what you need. Keep the wake time steady and this stays where it is.",
  },
  {
    id: "mild",
    limit: 5,
    label: "Mild",
    tone: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
    headline: "0–5 hours behind",
    detail:
      "Small dips in focus and mood, and you probably notice the afternoon slump more. A few consistent nights clears this completely.",
  },
  {
    id: "moderate",
    limit: 10,
    label: "Moderate",
    tone: "var(--anslation-ds-warning)",
    soft: "var(--anslation-ds-warning-soft)",
    headline: "5–10 hours behind",
    detail:
      "Reaction time is measurably slower now. In the classic driving-simulator work, being awake around 17 hours degraded performance about as much as a 0.05% blood alcohol level — sustained short sleep lands you in similar territory. Be careful about late-night driving.",
  },
  {
    id: "severe",
    limit: 20,
    label: "Severe",
    tone: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
    headline: "10–20 hours behind",
    detail:
      "Attention lapses and brief microsleeps become likely, emotional control gets thinner, and glucose handling and immune response both take a hit. This will not clear over one weekend.",
  },
  {
    id: "chronic",
    limit: Infinity,
    label: "Chronic",
    tone: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
    headline: "20+ hours behind",
    detail:
      "This is sustained restriction, not a bad week. Long-run it is associated with higher blood pressure, weight gain, low mood, and cardiometabolic risk. Worth treating as a real health issue and talking to a doctor about.",
  },
];

const HYGIENE_ITEMS = [
  { id: "waketime", label: "Same wake time every day, weekends included", why: "The single strongest anchor for your body clock." },
  { id: "caffeine", label: "No caffeine after 2 PM", why: "Half-life is about 5–6 hours, so a 4 PM coffee is still working at 10 PM." },
  { id: "cool", label: "Bedroom cool, around 18–19 °C", why: "Your core temperature has to drop for sleep to start." },
  { id: "dark", label: "Fully dark room", why: "Even standby LEDs and streetlight leak suppress melatonin." },
  { id: "screens", label: "Screens dimmed or off 60 minutes before bed", why: "Less about blue light than about what the content does to your arousal." },
  { id: "alcohol", label: "No alcohol within 3 hours of bed", why: "It knocks you out fast and then shreds REM in the second half of the night." },
  { id: "daylight", label: "Daylight within 30 minutes of waking", why: "Sets the clock that decides when melatonin arrives tonight." },
  { id: "bedonly", label: "Bed is for sleep only — no laptop, no doomscrolling", why: "Keeps the bed-equals-sleep association intact." },
  { id: "meal", label: "Last heavy meal 3 hours before bed", why: "Digestion and reflux fragment early-night sleep." },
  { id: "getup", label: "Awake more than 20 minutes? Get up and read somewhere dim", why: "Lying there frustrated teaches your brain that bed means being awake." },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pad2 = (value) => String(value).padStart(2, "0");

const dayKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const parseDateInput = (value) => {
  if (!value || typeof value !== "string") return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isFreeDay = (date) => date.getDay() === 0 || date.getDay() === 6;

const defaultHoursFor = (date) => (isFreeDay(date) ? 8.5 : 6.5);

const formatHours = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);

const severityFor = (debt) => SEVERITY.find((band) => debt < band.limit) || SEVERITY[SEVERITY.length - 1];

function NightRow({ date, hours, need, onChange }) {
  const delta = hours - need;
  return (
    <div className="grid grid-cols-[74px_1fr] items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 sm:grid-cols-[110px_1fr_150px]">
      <div>
        <p className="text-sm font-semibold">{WEEKDAY_SHORT[date.getDay()]}</p>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          {date.toLocaleDateString([], { day: "numeric", month: "short" })}
        </p>
      </div>

      <label className="flex items-center gap-2">
        <span className="sr-only">
          Hours slept on the night before {date.toLocaleDateString()}
        </span>
        <input
          type="range"
          min={0}
          max={12}
          step={0.25}
          value={hours}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-[var(--primary)]"
        />
      </label>

      <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
        <button
          type="button"
          onClick={() => onChange(clamp(hours - 0.25, 0, 12))}
          aria-label={`Subtract 15 minutes from ${date.toLocaleDateString()}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--primary)]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-16 text-center text-sm font-semibold tabular-nums">
          {formatHours(hours)}h
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(hours + 0.25, 0, 12))}
          aria-label={`Add 15 minutes to ${date.toLocaleDateString()}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--primary)]"
        >
          <Plus className="h-4 w-4" />
        </button>
        <span
          className="w-14 text-right text-xs font-semibold tabular-nums"
          style={{
            color:
              Math.abs(delta) < 0.01
                ? "var(--muted-foreground)"
                : delta > 0
                  ? "var(--anslation-ds-success)"
                  : "var(--anslation-ds-danger)",
          }}
        >
          {delta > 0 ? "+" : ""}
          {formatHours(delta)}
        </span>
      </div>
    </div>
  );
}

function DeficitChart({ rows, need }) {
  const scale = Math.max(1, ...rows.map((row) => Math.abs(row.hours - need)));

  return (
    <div>
      <div className="relative h-44 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] px-2">
        <div
          className="absolute left-0 right-0 top-1/2 border-t border-dashed"
          style={{ borderColor: "var(--anslation-ds-border-strong)" }}
          aria-hidden="true"
        />
        <div className="flex h-full items-stretch gap-1">
          {rows.map((row) => {
            const delta = row.hours - need;
            const magnitude = clamp((Math.abs(delta) / scale) * 46, Math.abs(delta) < 0.01 ? 0 : 3, 46);
            const surplus = delta > 0;
            return (
              <div key={row.key} className="relative flex-1" title={`${row.date.toLocaleDateString()}: ${formatHours(row.hours)}h`}>
                <div
                  className="absolute left-0 right-0 rounded-sm"
                  style={{
                    top: surplus ? `${50 - magnitude}%` : "50%",
                    height: `${magnitude}%`,
                    background: surplus
                      ? "var(--anslation-ds-success)"
                      : "var(--anslation-ds-danger)",
                  }}
                />
                <span className="sr-only">
                  {row.date.toLocaleDateString()}: {formatHours(row.hours)} hours slept,{" "}
                  {surplus ? "surplus" : "deficit"} of {formatHours(Math.abs(delta))} hours
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-4 rounded-sm"
            style={{ background: "var(--anslation-ds-success)" }}
          />
          Above your {formatHours(need)}h need
        </span>
        <span>Dashed line = your sleep need</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-4 rounded-sm"
            style={{ background: "var(--anslation-ds-danger)" }}
          />
          Below it
        </span>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [endDateInput, setEndDateInput] = useState(() => dayKey(startOfToday()));
  const [rangeLength, setRangeLength] = useState(7);
  const [need, setNeed] = useState(8);
  const [nights, setNights] = useState({});
  const [rate, setRate] = useState(1.5);
  const [hygiene, setHygiene] = useState([]);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawNights = window.localStorage.getItem(NIGHTS_KEY);
      if (rawNights) {
        const parsed = JSON.parse(rawNights);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const cleaned = {};
          Object.entries(parsed).forEach(([key, value]) => {
            if (parseDateInput(key) && typeof value === "number" && value >= 0 && value <= 12) {
              cleaned[key] = value;
            }
          });
          setNights(cleaned);
        }
      }
      const rawSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.need === "number") setNeed(clamp(parsed.need, 6, 10));
          if (RANGE_OPTIONS.includes(parsed.rangeLength)) setRangeLength(parsed.rangeLength);
          if (RECOVERY_RATES.includes(parsed.rate)) setRate(parsed.rate);
        }
      }
      const rawHygiene = window.localStorage.getItem(HYGIENE_KEY);
      if (rawHygiene) {
        const parsed = JSON.parse(rawHygiene);
        if (Array.isArray(parsed)) setHygiene(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      /* storage unavailable */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ need, rangeLength, rate }));
    } catch {
      /* storage unavailable */
    }
  }, [need, rangeLength, rate, hydrated]);

  const endDate = useMemo(
    () => parseDateInput(endDateInput) || startOfToday(),
    [endDateInput]
  );

  const rows = useMemo(() => {
    const list = [];
    for (let index = rangeLength - 1; index >= 0; index -= 1) {
      const date = addDays(endDate, -index);
      const key = dayKey(date);
      const stored = nights[key];
      list.push({
        key,
        date,
        hours: typeof stored === "number" ? stored : defaultHoursFor(date),
        logged: typeof stored === "number",
      });
    }
    return list;
  }, [endDate, rangeLength, nights]);

  const setNightHours = useCallback((key, value) => {
    setNights((prev) => {
      const next = { ...prev, [key]: clamp(value, 0, 12) };
      try {
        window.localStorage.setItem(NIGHTS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const resetLog = () => {
    setNights({});
    try {
      window.localStorage.removeItem(NIGHTS_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const toggleHygiene = (id) => {
    setHygiene((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        window.localStorage.setItem(HYGIENE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const totals = useMemo(() => {
    let deficit = 0;
    let surplus = 0;
    let slept = 0;
    rows.forEach((row) => {
      const delta = need - row.hours;
      if (delta > 0) deficit += delta;
      else surplus += -delta;
      slept += row.hours;
    });
    const net = Math.max(0, deficit - surplus);
    return {
      deficit,
      surplus,
      net,
      slept,
      average: rows.length ? slept / rows.length : 0,
      worst: rows.reduce((min, row) => Math.min(min, row.hours), 12),
    };
  }, [rows, need]);

  const band = severityFor(totals.net);

  const socialJetlag = useMemo(() => {
    const free = rows.filter((row) => isFreeDay(row.date));
    const work = rows.filter((row) => !isFreeDay(row.date));
    if (free.length === 0 || work.length === 0) return null;
    const freeAvg = free.reduce((sum, row) => sum + row.hours, 0) / free.length;
    const workAvg = work.reduce((sum, row) => sum + row.hours, 0) / work.length;
    return { freeAvg, workAvg, gap: freeAvg - workAvg };
  }, [rows]);

  const nightsToClear = totals.net <= 0.01 ? 0 : Math.ceil(totals.net / rate);

  const recoveryTable = useMemo(
    () =>
      RECOVERY_RATES.map((option) => ({
        rate: option,
        nights: totals.net <= 0.01 ? 0 : Math.ceil(totals.net / option),
      })),
    [totals.net]
  );

  const report = useMemo(
    () =>
      [
        "Sleep Debt Report",
        `Window: ${rows[0]?.date.toLocaleDateString() || "-"} to ${rows[rows.length - 1]?.date.toLocaleDateString() || "-"} (${rangeLength} nights)`,
        `Sleep need: ${formatHours(need)}h per night`,
        `Average sleep: ${formatHours(totals.average)}h · Shortest night: ${formatHours(totals.worst)}h`,
        `Total shortfall: ${formatHours(totals.deficit)}h · Total surplus: ${formatHours(totals.surplus)}h`,
        `Net sleep debt: ${formatHours(totals.net)}h (${band.label})`,
        socialJetlag
          ? `Weekend catch-up: ${formatHours(socialJetlag.gap)}h (free days ${formatHours(socialJetlag.freeAvg)}h vs work days ${formatHours(socialJetlag.workAvg)}h)`
          : "",
        totals.net > 0.01
          ? `Recovery: about ${nightsToClear} night${nightsToClear === 1 ? "" : "s"} at +${formatHours(rate)}h per night`
          : "Recovery: nothing to repay right now",
        "Formula: debt = sum of (need - hours slept) across the window, with surplus nights offsetting deficits, floored at zero.",
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [rows, rangeLength, need, totals, band, socialJetlag, nightsToClear, rate]
  );

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const jetlagNote = socialJetlag
    ? socialJetlag.gap < 1
      ? "Your free days and work days look alike. That consistency is the whole game — nothing to fix here."
      : socialJetlag.gap < 2
        ? "A mild catch-up pattern. You are borrowing on weeknights and repaying at the weekend, which mostly works but leaves you starting Monday flat."
        : "That is a big swing. Sleeping several hours later on free days shifts your body clock westward, and Monday morning feels like flying back through time zones — that is the jet lag part of the name."
    : null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Bed className="h-4 w-4" />
            Sleep health
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Sleep Debt Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Log your last week or two, set what you actually need, and see the hours you owe — plus a
            repayment plan that fits how sleep recovery really works.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Your sleep need</p>
              <label className="mt-3 block">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Hours per night: {formatHours(need)}h
                </span>
                <input
                  type="range"
                  min={6}
                  max={10}
                  step={0.25}
                  value={need}
                  onChange={(event) => setNeed(Number(event.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                />
              </label>

              <p className="mt-4 text-xs font-semibold text-[var(--muted-foreground)]">
                Not sure? Use the age guideline
              </p>
              <div className="mt-2 grid gap-2">
                {AGE_BANDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNeed(item.suggest)}
                    className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left transition hover:border-[var(--primary)]"
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs font-semibold text-[var(--primary)]">
                      {item.min}–{item.max}h
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-[var(--muted-foreground)]">
                These are the National Sleep Foundation consensus ranges. Genuine short sleepers who
                thrive on six hours exist, but they are well under 1% of people — most who claim it
                are just used to being tired.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Sleep hygiene checklist</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {hygiene.length} of {HYGIENE_ITEMS.length} habits in place
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(hygiene.length / HYGIENE_ITEMS.length) * 100}%`,
                    background: "var(--primary)",
                  }}
                />
              </div>
              <div className="mt-4 grid gap-1.5">
                {HYGIENE_ITEMS.map((item) => {
                  const checked = hygiene.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition"
                      style={{
                        borderColor: checked ? "var(--primary)" : "var(--border)",
                        background: checked
                          ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                          : "var(--background)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleHygiene(item.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="block text-xs font-semibold leading-5">{item.label}</span>
                        <span className="block text-[11px] leading-4 text-[var(--muted-foreground)]">
                          {item.why}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Net sleep debt · last {rangeLength} nights
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

              <div className="mt-4 flex flex-wrap items-center gap-4" aria-live="polite">
                <div
                  className="rounded-lg p-5"
                  style={{ background: band.soft }}
                >
                  <p className="text-5xl font-semibold tabular-nums" style={{ color: band.tone }}>
                    {formatHours(totals.net)}h
                  </p>
                </div>
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                    style={{ background: band.soft, color: band.tone }}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    {band.label} · {band.headline}
                  </span>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                    {band.detail}
                  </p>
                </div>
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  ["Average night", `${formatHours(totals.average)}h`],
                  ["Shortest night", `${formatHours(totals.worst)}h`],
                  ["Total shortfall", `${formatHours(totals.deficit)}h`],
                  ["Surplus banked", `${formatHours(totals.surplus)}h`],
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

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: debt = sum of (need − hours slept) across the window, with surplus nights
                offsetting deficits and the total floored at zero.
              </p>

              <div className="mt-6">
                <DeficitChart rows={rows} need={need} />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Your sleep log</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Pre-filled with a typical weekday/weekend pattern — drag each night to match what
                    you actually slept. Saved on this device only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetLog}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset log
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Most recent morning</span>
                  <input
                    type="date"
                    value={endDateInput}
                    onChange={(event) => setEndDateInput(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div>
                  <span className="text-sm font-semibold">Nights to include</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {RANGE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRangeLength(option)}
                        className={`h-12 rounded-md border text-sm font-semibold transition ${
                          rangeLength === option
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {rows.map((row) => (
                  <NightRow
                    key={row.key}
                    date={row.date}
                    hours={row.hours}
                    need={need}
                    onChange={(value) => setNightHours(row.key, value)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Your recovery plan</p>

              {totals.net <= 0.01 ? (
                <p className="mt-3 rounded-md p-4 text-sm leading-6"
                  style={{ background: "var(--anslation-ds-success-soft)" }}
                >
                  Nothing to repay. Hold this pattern — a steady wake time is what keeps the debt at
                  zero, not the occasional long night.
                </p>
              ) : (
                <>
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Extra sleep you can realistically add per night
                    </span>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {RECOVERY_RATES.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRate(option)}
                          className={`h-11 rounded-md border text-sm font-semibold transition ${
                            rate === option
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          +{formatHours(option)}h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-md border p-4"
                    style={{
                      borderColor: "var(--primary)",
                      background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                    }}
                    aria-live="polite"
                  >
                    <p className="text-sm text-[var(--muted-foreground)]">
                      At +{formatHours(rate)}h a night, you clear {formatHours(totals.net)}h of debt in
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                      {nightsToClear} night{nightsToClear === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Formula: nights = debt ÷ extra hours per night, rounded up.
                    </p>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[360px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                          <th className="px-3 py-2 font-semibold">Extra per night</th>
                          <th className="px-3 py-2 font-semibold">Nights to clear</th>
                          <th className="px-3 py-2 font-semibold">Realistic?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recoveryTable.map((option) => (
                          <tr
                            key={option.rate}
                            className="border-b border-[var(--border)] last:border-b-0"
                          >
                            <td className="px-3 py-2 font-semibold">+{formatHours(option.rate)}h</td>
                            <td className="px-3 py-2">{option.nights}</td>
                            <td className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
                              {option.rate <= 1
                                ? "Easy to sustain — just an earlier bedtime"
                                : option.rate <= 1.5
                                  ? "Doable for a week or two"
                                  : "Hard to hold for more than a few nights"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="mt-5 grid gap-2">
                {[
                  [
                    "You cannot repay it in one lie-in",
                    "Recovery sleep is deeper — more slow-wave, more efficient — but it is also shorter than what you lost. A single ten-hour night claws back an hour or two of debt, not ten.",
                  ],
                  [
                    "Go to bed earlier, do not wake later",
                    "Extending the front end adds sleep without moving your body clock. Sleeping in does the opposite and makes the next night harder.",
                  ],
                  [
                    "A 20-minute nap before 3 PM is a patch, not a payment",
                    "It restores alertness within minutes and it is genuinely useful. It just does not settle the balance. Keep it under 30 minutes or you wake up groggy from deep sleep.",
                  ],
                  [
                    "Cap the weekend catch-up at about +1h",
                    "A three-hour Sunday lie-in is what turns Monday into jet lag. Small and consistent beats big and occasional.",
                  ],
                  [
                    "Large debts take weeks, not days",
                    "Studies on chronic restriction find reaction times can still lag after several nights of recovery sleep — and people rate themselves as fine long before they actually are.",
                  ],
                ].map(([title, detail]) => (
                  <div
                    key={title}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {socialJetlag && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="text-sm font-semibold">Social jetlag</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Sun className="h-3.5 w-3.5" />
                      Work nights
                    </p>
                    <p className="mt-1 text-xl font-semibold">{formatHours(socialJetlag.workAvg)}h</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                      <Moon className="h-3.5 w-3.5" />
                      Free nights
                    </p>
                    <p className="mt-1 text-xl font-semibold">{formatHours(socialJetlag.freeAvg)}h</p>
                  </div>
                  <div
                    className="rounded-md border p-3"
                    style={{
                      borderColor:
                        socialJetlag.gap >= 2 ? "var(--anslation-ds-danger)" : "var(--border)",
                      background:
                        socialJetlag.gap >= 2
                          ? "var(--anslation-ds-danger-soft)"
                          : "var(--background)",
                    }}
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">Weekend catch-up</p>
                    <p className="mt-1 text-xl font-semibold">
                      {socialJetlag.gap > 0 ? "+" : ""}
                      {formatHours(socialJetlag.gap)}h
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{jetlagNote}</p>
                <p className="mt-2 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  Strictly, social jetlag measures how far your mid-sleep point shifts between work
                  days and free days. Working from hours alone, the size of your weekend catch-up is
                  the practical stand-in — a big gap means your weekdays are the problem.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm font-semibold">How bad is it? The four bands</p>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            {SEVERITY.filter((item) => item.id !== "clear").map((item) => {
              const isActive = item.id === band.id;
              return (
                <div
                  key={item.id}
                  className="rounded-md border p-4"
                  style={{
                    borderColor: isActive ? item.tone : "var(--border)",
                    background: isActive ? item.soft : "var(--background)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: item.tone }}>
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      {item.headline}
                    </span>
                    {isActive && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ background: item.tone, color: "var(--primary-foreground)" }}
                      >
                        <Check className="h-3 w-3" />
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            These numbers are estimates for awareness, not medical advice. Sleep debt is a rough
            accounting model, not a clinical measure — if you are exhausted despite sleeping enough,
            snore heavily, or cannot fall asleep night after night, consult a doctor. Conditions like
            sleep apnoea and insomnia need real diagnosis, not arithmetic.
          </p>
        </section>
      </div>
    </main>
  );
}
