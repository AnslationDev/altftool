"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarSearch,
  ChevronLeft,
  ChevronRight,
  Copy,
  Info,
  Moon,
  Sparkles,
} from "lucide-react";
import { Body, Illumination, MoonPhase, SearchMoonPhase } from "astronomy-engine";
import { safeCopyText } from "@/shared/utils/clipboard";

const MS_DAY = 86400000;
const SYNODIC_MONTH = 29.530588853;
const QUARTER_WINDOW = 6.1;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const phaseBlurbs = {
  "New Moon": "The moon sits between Earth and the Sun, so its sunlit side faces away from us.",
  "Waxing Crescent": "A growing sliver of light appears in the evening sky after the new moon.",
  "First Quarter": "Half the disc is lit and the moon is climbing toward full.",
  "Waxing Gibbous": "More than half lit, growing brighter every night.",
  "Full Moon": "Earth sits between the Sun and the moon, so the whole disc glows.",
  "Waning Gibbous": "The light is slowly shrinking after the full moon.",
  "Last Quarter": "Half lit again, now fading toward the next new moon.",
  "Waning Crescent": "A thinning sliver visible before dawn as the cycle restarts.",
};

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

function phaseNameFromAngle(angle) {
  const a = normalizeAngle(angle);
  if (a <= QUARTER_WINDOW || a >= 360 - QUARTER_WINDOW) return "New Moon";
  if (Math.abs(a - 90) <= QUARTER_WINDOW) return "First Quarter";
  if (Math.abs(a - 180) <= QUARTER_WINDOW) return "Full Moon";
  if (Math.abs(a - 270) <= QUARTER_WINDOW) return "Last Quarter";
  if (a < 90) return "Waxing Crescent";
  if (a < 180) return "Waxing Gibbous";
  if (a < 270) return "Waning Gibbous";
  return "Waning Crescent";
}

function moonLitPath(angle, r, c) {
  const a = normalizeAngle(angle);
  if (a < 1.5 || a > 358.5) return null;
  if (Math.abs(a - 180) < 1.5) return "full";
  const cos = Math.cos((a * Math.PI) / 180);
  const rx = (Math.abs(cos) * r).toFixed(2);
  const top = `${c} ${c - r}`;
  const bottom = `${c} ${c + r}`;
  const limbSweep = a < 180 ? 1 : 0;
  const terminatorSweep = a < 180 ? (cos > 0 ? 0 : 1) : cos > 0 ? 1 : 0;
  return `M ${top} A ${r} ${r} 0 0 ${limbSweep} ${bottom} A ${rx} ${r} 0 0 ${terminatorSweep} ${top} Z`;
}

function MoonDisc({ angle, size = 40, title }) {
  const lit = moonLitPath(angle, 45, 50);
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0" {...a11y}>
      <circle cx="50" cy="50" r="45" fill="var(--muted)" />
      {lit === "full" ? (
        <circle cx="50" cy="50" r="45" fill="var(--primary)" />
      ) : lit ? (
        <path d={lit} fill="var(--primary)" />
      ) : null}
      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="3" />
    </svg>
  );
}

function lastNewMoonBefore(date) {
  const found = SearchMoonPhase(0, date, -40);
  return found ? found.date : null;
}

function phaseDatesInRange(targetLon, start, end) {
  const dates = [];
  let cursor = start;
  for (let i = 0; i < 3; i += 1) {
    const found = SearchMoonPhase(targetLon, cursor, 40);
    if (!found || found.date.getTime() >= end.getTime()) break;
    dates.push(found.date);
    cursor = new Date(found.date.getTime() + MS_DAY);
  }
  return dates;
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDay = (date) =>
  date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const formatTime = (date) => date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const toDateInputValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function ToolHome() {
  const [today, setToday] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [pickedDate, setPickedDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setPickedDate(toDateInputValue(now));
  }, []);

  const todayInfo = useMemo(() => {
    if (!today) return null;
    const angle = MoonPhase(today);
    const illumination = Illumination(Body.Moon, today).phase_fraction * 100;
    const lastNew = lastNewMoonBefore(today);
    const age = lastNew
      ? (today.getTime() - lastNew.getTime()) / MS_DAY
      : (normalizeAngle(angle) / 360) * SYNODIC_MONTH;
    return { angle, illumination, age, name: phaseNameFromAngle(angle) };
  }, [today]);

  const events = useMemo(() => {
    if (!today) return [];
    return [
      { lon: 0, name: "New Moon" },
      { lon: 90, name: "First Quarter" },
      { lon: 180, name: "Full Moon" },
      { lon: 270, name: "Last Quarter" },
    ]
      .map((item) => {
        const found = SearchMoonPhase(item.lon, today, 40);
        return found ? { ...item, date: found.date } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [today]);

  const calendar = useMemo(() => {
    if (!cursor) return null;
    const { year, month } = cursor;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthEnd = new Date(year, month + 1, 1);
    const newMoonDates = phaseDatesInRange(0, first, monthEnd);
    const fullMoonDates = phaseDatesInRange(180, first, monthEnd);
    const days = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day, 12, 0, 0);
      const angle = MoonPhase(date);
      days.push({
        day,
        angle,
        name: phaseNameFromAngle(angle),
        illumination: Illumination(Body.Moon, date).phase_fraction * 100,
        isNew: newMoonDates.some((item) => isSameDay(item, date)),
        isFull: fullMoonDates.some((item) => isSameDay(item, date)),
      });
    }
    return {
      offset: first.getDay(),
      days,
      label: first.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const picked = useMemo(() => {
    if (!pickedDate) return null;
    const [y, m, d] = pickedDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d, 12, 0, 0);
    const angle = MoonPhase(date);
    const lastNew = lastNewMoonBefore(date);
    return {
      date,
      angle,
      name: phaseNameFromAngle(angle),
      illumination: Illumination(Body.Moon, date).phase_fraction * 100,
      age: lastNew ? (date.getTime() - lastNew.getTime()) / MS_DAY : 0,
    };
  }, [pickedDate]);

  const summary = useMemo(() => {
    if (!today || !todayInfo) return "";
    return [
      "Moon Phase Summary",
      `Date: ${formatDay(today)}`,
      `Phase: ${todayInfo.name}`,
      `Illumination: ${todayInfo.illumination.toFixed(1)}%`,
      `Moon age: ${todayInfo.age.toFixed(1)} days of the ${SYNODIC_MONTH.toFixed(2)}-day cycle`,
      ...events.map((event) => `Next ${event.name}: ${formatDay(event.date)}, ${formatTime(event.date)}`),
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [events, today, todayInfo]);

  const moveMonth = (delta) => {
    setCursor((prev) => {
      if (!prev) return prev;
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const goToCurrentMonth = () => {
    if (!today) return;
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
  };

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const untilLabel = (date) => {
    if (!today) return "";
    const startOf = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
    const diff = Math.round((startOf(date) - startOf(today)) / MS_DAY);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  const isTodayCell = (day) =>
    Boolean(
      today &&
        cursor &&
        cursor.year === today.getFullYear() &&
        cursor.month === today.getMonth() &&
        day === today.getDate()
    );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Moon className="h-4 w-4" />
            Sky calendar
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Moon Phase Today &amp; Calendar</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Check tonight&rsquo;s moon phase, illumination and age, browse a full monthly phase calendar, and see
            exactly when the next new and full moons arrive. Everything is computed locally in your browser.
          </p>
        </section>

        {!todayInfo || !calendar ? (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm text-[var(--muted-foreground)]">Reading the sky, loading moon data&hellip;</p>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Tonight&rsquo;s moon · {formatDay(today)}
                  </p>
                  <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                </div>
                <div className="mt-5 flex flex-col items-center text-center">
                  <MoonDisc
                    angle={todayInfo.angle}
                    size={180}
                    title={`${todayInfo.name}, ${todayInfo.illumination.toFixed(0)} percent illuminated`}
                  />
                  <p className="mt-4 text-3xl font-semibold text-[var(--primary)]">{todayInfo.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {phaseBlurbs[todayInfo.name]}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">Illumination</p>
                    <p className="mt-1 text-xl font-semibold">{todayInfo.illumination.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">Moon age</p>
                    <p className="mt-1 text-xl font-semibold">{todayInfo.age.toFixed(1)} days</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (todayInfo.age / SYNODIC_MONTH) * 100).toFixed(1)}%`,
                        background: "var(--primary)",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Day {todayInfo.age.toFixed(1)} of the 29.53-day lunar cycle (new moon to new moon)
                  </p>
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  Shown as seen from the Northern Hemisphere, where a waxing moon lights up from the right. From the
                  Southern Hemisphere the lit side appears mirrored.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <h2 className="text-lg font-semibold">Upcoming moon events</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Exact instants of the next four principal phases, shown in your local time.
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {events.map((event) => (
                      <li
                        key={event.name}
                        className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                      >
                        <MoonDisc angle={event.lon} size={42} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {formatDay(event.date)} · {formatTime(event.date)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                          {untilLabel(event.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarSearch className="h-5 w-5 text-[var(--primary)]" />
                    Check any date
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
                    <label className="block">
                      <span className="text-sm font-semibold">Pick a date</span>
                      <input
                        type="date"
                        value={pickedDate}
                        onChange={(event) => setPickedDate(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <div aria-live="polite">
                      {picked ? (
                        <div className="flex items-center gap-4 rounded-md bg-[var(--muted)] p-4">
                          <MoonDisc
                            angle={picked.angle}
                            size={64}
                            title={`${picked.name} on ${formatDay(picked.date)}`}
                          />
                          <div>
                            <p className="text-lg font-semibold text-[var(--primary)]">{picked.name}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {picked.illumination.toFixed(1)}% illuminated · {picked.age.toFixed(1)} days old
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">{formatDay(picked.date)}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--muted-foreground)]">Choose a date to see its moon.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarDays className="h-5 w-5 text-[var(--primary)]" />
                  {calendar.label}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveMonth(-1)}
                    aria-label="Previous month"
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={goToCurrentMonth} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMonth(1)}
                    aria-label="Next month"
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className="py-1 text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]"
                  >
                    {weekday}
                  </div>
                ))}
                {Array.from({ length: calendar.offset }).map((_, index) => (
                  <div key={`blank-${index}`} aria-hidden="true" />
                ))}
                {calendar.days.map((cell) => (
                  <div
                    key={cell.day}
                    title={`${cell.name} · ${cell.illumination.toFixed(0)}% lit`}
                    className={`flex flex-col items-center gap-1 rounded-md border p-1.5 sm:p-2 ${
                      isTodayCell(cell.day)
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isTodayCell(cell.day) ? "text-[var(--primary)]" : ""}`}>
                      {cell.day}
                    </span>
                    <MoonDisc angle={cell.angle} size={26} />
                    {cell.isFull || cell.isNew ? (
                      <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--primary-foreground)]">
                        {cell.isFull ? "Full" : "New"}
                      </span>
                    ) : (
                      <span className="text-[10px] leading-none text-transparent" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Each cell shows the phase at local noon. Days badged Full or New contain the exact instant of that
                phase; today&rsquo;s date is outlined.
              </p>
            </section>

            <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                Why does the moon have phases?
              </h2>
              <div className="mt-3 grid gap-4 text-sm leading-6 text-[var(--muted-foreground)] 2xl:grid-cols-3">
                <p>
                  Half of the moon is always lit by the Sun. As the moon orbits Earth once every 29.53 days, we see
                  that sunlit half from constantly changing angles, so the visible lit portion grows (waxes) from new
                  to full, then shrinks (wanes) back to new.
                </p>
                <p>
                  The phase depends only on the angle between the Sun and the moon in our sky, which is why the same
                  phase is visible everywhere on Earth on the same night. Only the orientation flips: from the
                  Southern Hemisphere the lit side appears on the opposite edge.
                </p>
                <p>
                  Phase times on this page are astronomical instants converted to your local timezone, computed
                  offline with the astronomy-engine ephemeris right in your browser. No location or network access is
                  needed, because moon phase is the same worldwide.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Lunar cycle: 29.53 days",
                  "Orbit around Earth: 27.32 days",
                  "Same face always visible (tidal locking)",
                  "Full moon rises near sunset",
                ].map((fact) => (
                  <span
                    key={fact}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    {fact}
                  </span>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
