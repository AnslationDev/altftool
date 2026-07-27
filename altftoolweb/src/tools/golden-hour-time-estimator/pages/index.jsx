"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw, Sun } from "lucide-react";

import {
  ELEVATIONS,
  PRESET_PLACES,
  formatDuration,
  formatTime,
  sunPath,
  sunTimes,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

/** Fixed first-paint date so server and client render the same markup. */
const FALLBACK_DATE = "2026-06-21";
const DEFAULT_PLACE = PRESET_PLACES[0];

const DEFAULTS = {
  dateISO: FALLBACK_DATE,
  latitude: String(DEFAULT_PLACE.latitude),
  longitude: String(DEFAULT_PLACE.longitude),
  utcOffsetHours: String(DEFAULT_PLACE.utcOffsetHours),
  preset: DEFAULT_PLACE.id,
};

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const todayISO = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  // Today's date and the browser's own UTC offset are only known on the client.
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      dateISO: todayISO(),
      utcOffsetHours: String(-new Date().getTimezoneOffset() / 60),
    }));
  }, []);

  const COORDINATE_FIELDS = ["latitude", "longitude", "utcOffsetHours"];

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      [key]: value,
      preset: COORDINATE_FIELDS.includes(key) ? "custom" : prev.preset,
    }));
    setCopied(false);
  };

  const applyPreset = (event) => {
    const place = PRESET_PLACES.find((item) => item.id === event.target.value);
    if (!place) {
      setForm((prev) => ({ ...prev, preset: "custom" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      preset: place.id,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      utcOffsetHours: String(place.utcOffsetHours),
    }));
    setLocationNote("");
    setCopied(false);
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote("This browser cannot share a location.");
      return;
    }
    setLocationNote("Asking the browser for your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          preset: "custom",
          latitude: position.coords.latitude.toFixed(4),
          longitude: position.coords.longitude.toFixed(4),
          utcOffsetHours: String(-new Date().getTimezoneOffset() / 60),
        }));
        setLocationNote("Using your device location.");
      },
      () => setLocationNote("Location permission was declined — enter the coordinates manually."),
      { timeout: 10000 },
    );
  };

  const reset = () => {
    setForm({ ...DEFAULTS, dateISO: todayISO(), utcOffsetHours: String(-new Date().getTimezoneOffset() / 60) });
    setLocationNote("");
    setCopied(false);
  };

  const query = {
    dateISO: form.dateISO,
    latitude: toNumber(form.latitude),
    longitude: toNumber(form.longitude),
    utcOffsetHours: toNumber(form.utcOffsetHours),
  };

  const times = useMemo(() => sunTimes(query), [form.dateISO, form.latitude, form.longitude, form.utcOffsetHours]);
  const path = useMemo(
    () => (times.error ? [] : sunPath({ ...query, stepMinutes: 20 })),
    [times, form.dateISO, form.latitude, form.longitude, form.utcOffsetHours],
  );

  const hasError = Boolean(times.error);
  const points = Array.isArray(path) ? path : [];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Sun times for ${times.dateISO} at ${times.latitude}, ${times.longitude} (UTC${times.utcOffsetHours >= 0 ? "+" : ""}${times.utcOffsetHours})`,
      `Morning blue hour: ${formatTime(times.morningBlueStart)}–${formatTime(times.morningBlueEnd)}`,
      `Morning golden hour: ${formatTime(times.morningGoldenStart)}–${formatTime(times.morningGoldenEnd)} (${formatDuration(times.morningGoldenMinutes)})`,
      `Sunrise: ${formatTime(times.sunrise)}`,
      `Solar noon: ${formatTime(times.solarNoon)}`,
      `Sunset: ${formatTime(times.sunset)}`,
      `Evening golden hour: ${formatTime(times.eveningGoldenStart)}–${formatTime(times.eveningGoldenEnd)} (${formatDuration(times.eveningGoldenMinutes)})`,
      `Evening blue hour: ${formatTime(times.eveningBlueStart)}–${formatTime(times.eveningBlueEnd)}`,
      `Day length: ${formatDuration(times.dayLengthMinutes)}`,
    ].join("\n");
  }, [hasError, times]);

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

  const chart = useMemo(() => {
    if (points.length === 0) return null;
    const width = 720;
    const height = 220;
    const maxElevation = Math.max(30, ...points.map((point) => point.elevation));
    const minElevation = Math.min(-30, ...points.map((point) => point.elevation));
    const x = (minutes) => (minutes / 1440) * width;
    const y = (elevation) => height - ((elevation - minElevation) / (maxElevation - minElevation)) * height;
    const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.minutes).toFixed(1)},${y(point.elevation).toFixed(1)}`).join(" ");
    return { width, height, line, horizonY: y(0), goldenTopY: y(ELEVATIONS.goldenHourEnd), goldenBottomY: y(ELEVATIONS.goldenHourEdge) };
  }, [points]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Light planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Golden Hour Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Golden hour, blue hour, sunrise, sunset and solar noon for any date and place, computed
          from the NOAA solar equations. Golden hour is the window when the Sun sits between 6°
          above and 4° below the horizon; blue hour runs from 4° to 6° below.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="preset">
              Location preset
            </label>
            <select id="preset" className={`mt-2 ${INPUT_CLASS}`} value={form.preset} onChange={applyPreset}>
              {PRESET_PLACES.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.label}
                </option>
              ))}
              <option value="custom">Custom coordinates</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dateISO">
              Date
            </label>
            <input
              id="dateISO"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.dateISO}
              onChange={setField("dateISO")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="utcOffsetHours">
              UTC offset (hours)
            </label>
            <input
              id="utcOffsetHours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-12"
              max="14"
              step="0.25"
              value={form.utcOffsetHours}
              onChange={setField("utcOffsetHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="latitude">
              Latitude (°, north positive)
            </label>
            <input
              id="latitude"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-90"
              max="90"
              step="0.0001"
              value={form.latitude}
              onChange={setField("latitude")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="longitude">
              Longitude (°, east positive)
            </label>
            <input
              id="longitude"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-180"
              max="180"
              step="0.0001"
              value={form.longitude}
              onChange={setField("longitude")}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="button" onClick={useMyLocation} className={GHOST_BTN} aria-label="Use my device location">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Use my location
            </button>
            {locationNote && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{locationNote}</p>
            )}
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {times.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Evening golden hour starts
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatTime(times.eveningGoldenStart)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the location or date to see the light windows."
                : times.eveningGoldenMinutes
                  ? `and lasts ${formatDuration(times.eveningGoldenMinutes)}, ending at ${formatTime(times.eveningGoldenEnd)}`
                  : "The Sun does not pass through the golden-hour band here on this date"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sun times to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy times"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Morning blue hour", hasError ? DASH : `${formatTime(times.morningBlueStart)} – ${formatTime(times.morningBlueEnd)}`],
            [
              "Morning golden hour",
              hasError ? DASH : `${formatTime(times.morningGoldenStart)} – ${formatTime(times.morningGoldenEnd)} (${formatDuration(times.morningGoldenMinutes)})`,
            ],
            ["Sunrise", hasError ? DASH : formatTime(times.sunrise)],
            ["Solar noon", hasError ? DASH : formatTime(times.solarNoon)],
            ["Sunset", hasError ? DASH : formatTime(times.sunset)],
            [
              "Evening golden hour",
              hasError ? DASH : `${formatTime(times.eveningGoldenStart)} – ${formatTime(times.eveningGoldenEnd)} (${formatDuration(times.eveningGoldenMinutes)})`,
            ],
            ["Evening blue hour", hasError ? DASH : `${formatTime(times.eveningBlueStart)} – ${formatTime(times.eveningBlueEnd)}`],
            ["Civil twilight (dawn / dusk)", hasError ? DASH : `${formatTime(times.civilDawn)} / ${formatTime(times.civilDusk)}`],
            ["Nautical twilight (dawn / dusk)", hasError ? DASH : `${formatTime(times.nauticalDawn)} / ${formatTime(times.nauticalDusk)}`],
            ["Astronomical twilight (dawn / dusk)", hasError ? DASH : `${formatTime(times.astronomicalDawn)} / ${formatTime(times.astronomicalDusk)}`],
            ["Day length", hasError ? DASH : formatDuration(times.dayLengthMinutes)],
            ["Solar declination", hasError ? DASH : `${times.declination}°`],
            ["Equation of time", hasError ? DASH : `${times.equationOfTimeMinutes} min`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && times.polarNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-semibold">{times.polarNote}</p>
        )}
        {!hasError && times.accuracyNote && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{times.accuracyNote}</p>
        )}
      </section>

      {chart && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Sun elevation across the day</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The shaded band is the golden-hour window, from 4° below the horizon to 6° above. The
            solid line is the Sun&apos;s height, sampled every 20 minutes.
          </p>
          <div className="mt-3 overflow-x-auto">
            <svg
              role="img"
              aria-label="Chart of the sun's elevation over 24 hours"
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-auto w-full min-w-[320px]"
            >
              <rect
                x="0"
                y={chart.goldenTopY}
                width={chart.width}
                height={Math.max(1, chart.goldenBottomY - chart.goldenTopY)}
                fill="var(--primary)"
                fillOpacity="0.18"
              />
              <line
                x1="0"
                y1={chart.horizonY}
                x2={chart.width}
                y2={chart.horizonY}
                stroke="var(--border)"
                strokeWidth="2"
              />
              <path d={chart.line} fill="none" stroke="var(--primary)" strokeWidth="3" />
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Times are computed with the NOAA Solar Calculator equations and are accurate to about a
        minute between 72°N and 72°S; they assume a flat horizon at sea level, so hills, buildings
        and altitude will shift the light you actually see. Enter the UTC offset that applies on the
        chosen date — daylight saving is not applied for you.
      </p>
    </main>
  );
}
