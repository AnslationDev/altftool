"use client";

import { useMemo, useState } from "react";
import { BookOpen, Clock, Copy, RotateCcw } from "lucide-react";

const TERMS = [
  { term: "Tithi", group: "Panchang", meaning: "A lunar day based on the angular distance between the Sun and Moon.", use: "Used to judge festivals, vrata days and whether a muhurat fits a ritual." },
  { term: "Nakshatra", group: "Panchang", meaning: "One of 27 lunar mansions marking the Moon's position.", use: "Used for naming, marriage matching and choosing ritual timings." },
  { term: "Yoga", group: "Panchang", meaning: "A Panchang factor calculated from the combined longitudes of the Sun and Moon.", use: "Some yogas are preferred for auspicious work while others are avoided." },
  { term: "Karana", group: "Panchang", meaning: "Half of a tithi; eleven karanas cycle through the lunar month.", use: "Used as a finer timing filter inside a day." },
  { term: "Rahu Kaal", group: "Avoid", meaning: "A daily period traditionally avoided for starting new work.", use: "Calculated by dividing daylight into eight equal parts based on weekday." },
  { term: "Yamaganda", group: "Avoid", meaning: "Another weekday-based daylight segment avoided for beginnings.", use: "Checked alongside Rahu Kaal in many Panchang calendars." },
  { term: "Gulika Kalam", group: "Avoid", meaning: "A Saturn-associated daily segment used differently by regional traditions.", use: "Often avoided for new ventures, though some traditions treat it as repeatable." },
  { term: "Abhijit Muhurta", group: "Good", meaning: "A short auspicious window around local solar noon.", use: "Used as a fallback muhurat when no detailed electional timing is available." },
  { term: "Brahma Muhurta", group: "Good", meaning: "A pre-dawn period roughly 1 hour 36 minutes before sunrise, lasting about 48 minutes.", use: "Preferred for meditation, study, mantra practice and quiet routines." },
  { term: "Choghadiya", group: "Timing", meaning: "A day/night division into eight parts with labels such as Amrit, Shubh and Labh.", use: "Popular quick timing method in western India." },
  { term: "Hora", group: "Timing", meaning: "Planetary hour sequence counted from sunrise.", use: "Used for choosing activities aligned with a planetary ruler." },
  { term: "Panchak", group: "Avoid", meaning: "A period when the Moon is in the last five nakshatras.", use: "Certain activities are avoided or done with remedies in some traditions." },
];

const WEEKDAY_RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function toMinutes(value) {
  const [h, m] = String(value).split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

function formatMinutes(total) {
  const mins = ((Math.round(total) % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calculateWindows({ sunrise, sunset, weekday }) {
  const rise = toMinutes(sunrise);
  const set = toMinutes(sunset);
  if (rise === null || set === null || set <= rise) {
    return { error: "Enter a valid sunrise and sunset time for the same local day." };
  }
  const dayLength = set - rise;
  const noon = rise + dayLength / 2;
  const rahuPart = WEEKDAY_RAHU_PART[Number(weekday)] || 1;
  const part = dayLength / 8;
  const rahuStart = rise + (rahuPart - 1) * part;
  return {
    abhijit: [formatMinutes(noon - 24), formatMinutes(noon + 24)],
    brahma: [formatMinutes(rise - 96), formatMinutes(rise - 48)],
    rahu: [formatMinutes(rahuStart), formatMinutes(rahuStart + part)],
  };
}

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [sunrise, setSunrise] = useState("06:20");
  const [sunset, setSunset] = useState("18:45");
  const [weekday, setWeekday] = useState("1");
  const groups = useMemo(() => Array.from(new Set(TERMS.map((term) => term.group))), []);
  const windows = useMemo(
    () => calculateWindows({ sunrise, sunset, weekday }),
    [sunrise, sunset, weekday],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TERMS.filter((term) => {
      if (group !== "all" && term.group !== group) return false;
      if (!needle) return true;
      return [term.term, term.group, term.meaning, term.use].join(" ").toLowerCase().includes(needle);
    });
  }, [query, group]);

  const copySummary = async () => {
    const lines = [
      "Muhurat terms glossary",
      `Matched terms: ${filtered.length}`,
      windows.error
        ? windows.error
        : `Abhijit ${windows.abhijit.join("-")} · Brahma ${windows.brahma.join("-")} · Rahu Kaal ${windows.rahu.join("-")}`,
      "",
      ...filtered.map((item) => `- ${item.term}: ${item.meaning}`),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Panchang glossary
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Muhurat Terms Glossary
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Plain-language meanings for common Panchang and muhurat words, plus quick
          local windows for Brahma Muhurta, Abhijit Muhurta and Rahu Kaal.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className={CARD}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={LABEL_CLASS}>Search term</span>
              <input className={`${INPUT_CLASS} mt-2`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. tithi, rahu, hora" />
            </label>
            <label>
              <span className={LABEL_CLASS}>Group</span>
              <select className={`${INPUT_CLASS} mt-2`} value={group} onChange={(event) => setGroup(event.target.value)}>
                <option value="all">All groups</option>
                {groups.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-3">
            {filtered.map((item) => (
              <article key={item.term} className="rounded-lg bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{item.term}</h2>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {item.group}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.meaning}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{item.use}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--foreground)]">Local timing helper</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={LABEL_CLASS}>Sunrise</span>
              <input type="time" className={`${INPUT_CLASS} mt-2`} value={sunrise} onChange={(event) => setSunrise(event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Sunset</span>
              <input type="time" className={`${INPUT_CLASS} mt-2`} value={sunset} onChange={(event) => setSunset(event.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Weekday</span>
              <select className={`${INPUT_CLASS} mt-2`} value={weekday} onChange={(event) => setWeekday(event.target.value)}>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </label>
          </div>
          {windows.error ? (
            <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {windows.error}
            </p>
          ) : (
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <strong className="text-[var(--foreground)]">Brahma Muhurta:</strong>{" "}
                {windows.brahma.join(" - ")}
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <strong className="text-[var(--foreground)]">Abhijit Muhurta:</strong>{" "}
                {windows.abhijit.join(" - ")}
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <strong className="text-[var(--foreground)]">Rahu Kaal:</strong>{" "}
                {windows.rahu.join(" - ")}
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={copySummary}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy summary
            </button>
            <button type="button" className={BTN} onClick={() => { setQuery(""); setGroup("all"); setSunrise("06:20"); setSunset("18:45"); setWeekday("1"); }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
