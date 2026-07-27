"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw } from "lucide-react";

import {
  MAX_RATING,
  SCOUT_CRITERIA,
  buildLocationNote,
  formatClock,
  formatDuration,
  utcOffsetMinutesFromHours,
} from "../lib";

const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d1 = (value) => DEC1.format(Number.isFinite(value) ? value : 0);
const d0 = (value) => DEC0.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULT_RATINGS = SCOUT_CRITERIA.reduce((acc, criterion) => {
  acc[criterion.id] = 3;
  return acc;
}, {});

const DEFAULTS = {
  name: "Rooftop terrace",
  dateIso: "2026-08-15",
  latitude: "51.5074",
  longitude: "-0.1278",
  utcOffsetHours: "1",
  shootTime: "18:30",
  notes: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const formatWindow = (range) => (range ? `${formatClock(range.start)} – ${formatClock(range.end)}` : DASH);

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [dateIso, setDateIso] = useState(DEFAULTS.dateIso);
  const [latitude, setLatitude] = useState(DEFAULTS.latitude);
  const [longitude, setLongitude] = useState(DEFAULTS.longitude);
  const [utcOffsetHours, setUtcOffsetHours] = useState(DEFAULTS.utcOffsetHours);
  const [shootTime, setShootTime] = useState(DEFAULTS.shootTime);
  const [ratings, setRatings] = useState(DEFAULT_RATINGS);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const note = useMemo(
    () =>
      buildLocationNote({
        name,
        dateIso,
        latitude: Number(latitude),
        longitude: Number(longitude),
        utcOffsetMinutes: utcOffsetMinutesFromHours(utcOffsetHours),
        shootTime,
        ratings,
      }),
    [name, dateIso, latitude, longitude, utcOffsetHours, shootTime, ratings],
  );

  const failed = Boolean(note.error);

  const setRating = (id, value) => {
    setRatings((current) => ({ ...current, [id]: Number(value) }));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    const times = note.times;
    return [
      `Location scout note — ${note.name}`,
      `${dateIso} · ${latitude}, ${longitude} · UTC${Number(utcOffsetHours) >= 0 ? "+" : ""}${utcOffsetHours}`,
      "",
      `Sunrise ${formatClock(times.sunrise)} · solar noon ${formatClock(times.solarNoon)} · sunset ${formatClock(times.sunset)}`,
      `Day length ${formatDuration(times.dayLengthMinutes)} · noon elevation ${d1(times.noonElevation)} deg`,
      `Morning golden hour ${formatWindow(times.goldenMorning)} · evening golden hour ${formatWindow(times.goldenEvening)}`,
      `At ${formatClock(note.shootTimeMinutes)} the sun sits ${d1(note.sunElevation)} deg up, bearing ${d0(note.sunAzimuth)} deg (${note.sunCompass})`,
      "",
      `Score ${d0(note.score.percent)}% — ${note.score.grade}`,
      ...note.score.rows.map((row) => `  ${row.label}: ${row.rating}/${MAX_RATING}`),
      note.score.weakest.length > 0
        ? `Weak points: ${note.score.weakest.map((row) => row.label).join("; ")}`
        : "No weak points flagged.",
      notes ? `\nNotes:\n${notes}` : "",
    ]
      .filter((line) => line !== undefined)
      .join("\n");
  }, [note, failed, dateIso, latitude, longitude, utcOffsetHours, notes]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setDateIso(DEFAULTS.dateIso);
    setLatitude(DEFAULTS.latitude);
    setLongitude(DEFAULTS.longitude);
    setUtcOffsetHours(DEFAULTS.utcOffsetHours);
    setShootTime(DEFAULTS.shootTime);
    setRatings(DEFAULT_RATINGS);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Recce notes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Location Scout Notes Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record a location with the sun&apos;s real direction and height at your shoot time, the
          golden hour windows for that date, and a weighted score across the things that actually
          sink a shoot: noise, power, permission and access.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsn-name">
              Location name
            </label>
            <input
              id="lsn-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsn-date">
              Shoot date
            </label>
            <input
              id="lsn-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateIso}
              onChange={(event) => setDateIso(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsn-time">
              Planned shoot time (local)
            </label>
            <input
              id="lsn-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={shootTime}
              onChange={(event) => setShootTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsn-lat">
              Latitude (north positive)
            </label>
            <input
              id="lsn-lat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-90"
              max="90"
              step="0.0001"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsn-lon">
              Longitude (east positive)
            </label>
            <input
              id="lsn-lon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-180"
              max="180"
              step="0.0001"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsn-offset">
              UTC offset at the location (hours)
            </label>
            <input
              id="lsn-offset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-14"
              max="14"
              step="0.25"
              value={utcOffsetHours}
              onChange={(event) => setUtcOffsetHours(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Include daylight saving if it applies on the shoot date — the tool does not look up
              time zones for you.
            </p>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {note.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Location score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${d0(note.score.percent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the inputs above to build the note." : note.score.grade}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the location scout note"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy note"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Sun at your shoot time",
              failed
                ? DASH
                : `${d1(note.sunElevation)}° up, bearing ${d0(note.sunAzimuth)}° (${note.sunCompass})`,
            ],
            [
              "Sunrise / sunset",
              failed || note.times.sunrise === null
                ? failed
                  ? DASH
                  : note.times.polarDay
                    ? "Sun never sets on this date"
                    : "Sun never rises on this date"
                : `${formatClock(note.times.sunrise)} / ${formatClock(note.times.sunset)}`,
            ],
            ["Solar noon", failed ? DASH : formatClock(note.times.solarNoon)],
            ["Sun height at noon", failed ? DASH : `${d1(note.times.noonElevation)}°`],
            ["Day length", failed ? DASH : formatDuration(note.times.dayLengthMinutes)],
            ["Morning golden hour", failed ? DASH : formatWindow(note.times.goldenMorning)],
            ["Evening golden hour", failed ? DASH : formatWindow(note.times.goldenEvening)],
            ["Blue hour, evening", failed ? DASH : formatWindow(note.times.blueEvening)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && note.inGoldenHour && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Your shoot time falls inside golden hour — the sun is low and warm, but it will move
            noticeably within twenty minutes. Plan the hero shot first.
          </p>
        )}
        {!failed && !note.sunIsUp && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            The sun is below the horizon at that time. Budget for practical or artificial light.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scorecard</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rate each item from 0 to {MAX_RATING}. Noise and permission carry the most weight because
          they are the two things you cannot fix on the day.
        </p>
        <ul className="mt-4 space-y-4">
          {SCOUT_CRITERIA.map((criterion) => (
            <li key={criterion.id}>
              <label className={LABEL_CLASS} htmlFor={`lsn-r-${criterion.id}`}>
                {criterion.label}
                <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                  weight {criterion.weight} · rated {ratings[criterion.id]}/{MAX_RATING}
                </span>
              </label>
              <input
                id={`lsn-r-${criterion.id}`}
                className="mt-2 h-11 w-full accent-[var(--primary)]"
                type="range"
                min="0"
                max={MAX_RATING}
                step="1"
                value={ratings[criterion.id]}
                onChange={(event) => setRating(criterion.id, event.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">{criterion.hint}</p>
            </li>
          ))}
        </ul>

        {!failed && note.score.weakest.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Fix or walk away</p>
            <ul className="mt-2 space-y-2">
              {note.score.weakest.map((row) => (
                <li
                  key={row.id}
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  {row.label} — rated {row.rating}/{MAX_RATING} on a weight of {row.weight}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="lsn-notes">
          Free notes
        </label>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Contact name and number, socket locations, the loudest thing you heard, and what time the
          building casts a shadow across the frame.
        </p>
        <textarea
          id="lsn-notes"
          className="mt-3 min-h-32 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Caretaker: Priya, 07xxx. Two double sockets on the east wall…"
        />
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sun times use the NOAA solar position equations and are accurate to about a minute at mid
        latitudes, but they assume a flat horizon — hills, buildings and trees will take the light
        earlier than the numbers say. Always confirm access and filming permission in writing.
      </p>
    </main>
  );
}
