"use client";

/**
 * Panchang calendar — UI only.
 *
 * Every number on this screen comes out of ../lib, which computes it from the date
 * and the coordinates. There are no constants standing in for times, no placeholder
 * values and no network calls. If a quantity cannot be computed it is not shown.
 */

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, Moon, RotateCcw, Sun, Sunrise } from "lucide-react";

import {
  CITIES,
  computePanchang,
  formatClock,
  formatDuration,
  formatRange,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

/** Today's date in the browser's own timezone, as YYYY-MM-DD. Presentation only. */
function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_CITY = "New Delhi";

function Row({ label, value, hint }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)]">
        {value ?? DASH}
        {hint ? (
          <span className="ml-2 font-normal text-[var(--muted-foreground)]">{hint}</span>
        ) : null}
      </dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
        {value ?? DASH}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [dateValue, setDateValue] = useState(todayIso);
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [manual, setManual] = useState(false);
  const [latText, setLatText] = useState("28.6139");
  const [lngText, setLngText] = useState("77.2090");
  const [tzText, setTzText] = useState("5.5");
  const [copied, setCopied] = useState(false);

  const place = useMemo(() => {
    if (manual) {
      return {
        name: "Custom coordinates",
        latitude: toNumber(latText),
        longitude: toNumber(lngText),
        tzHours: toNumber(tzText),
      };
    }
    const city = CITIES.find((c) => c.name === cityName) || CITIES[0];
    return city;
  }, [manual, cityName, latText, lngText, tzText]);

  const result = useMemo(() => {
    const parsed = parseIsoDate(dateValue);
    if (!parsed) return { error: "Pick a date." };
    return computePanchang({
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      latitude: place.latitude,
      longitude: place.longitude,
      tzHours: place.tzHours,
    });
  }, [dateValue, place]);

  const hasError = Boolean(result.error);
  const p = hasError ? null : result.panchanga;
  const cal = hasError ? null : result.calendar;
  const div = hasError ? null : result.divisions;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Panchang for ${dateValue} — ${place.name}`,
      `${result.weekdayName} (${result.vaara}) · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)} · UTC${place.tzHours >= 0 ? "+" : ""}${place.tzHours}`,
      "",
      `Sunrise: ${formatClock(result.sunriseHours) ?? "does not rise"}`,
      `Solar noon: ${formatClock(result.solarNoonHours)}`,
      `Sunset: ${formatClock(result.sunsetHours) ?? "does not set"}`,
      `Day length: ${formatDuration(result.dayLengthHours) ?? DASH}`,
      `Moonrise: ${formatClock(result.moonriseHours) ?? "none on this date"}`,
      `Moonset: ${formatClock(result.moonsetHours) ?? "none on this date"}`,
      "",
      `Tithi: ${p.paksha} ${p.tithiName} until ${formatClock(p.tithiEndHours)}`,
      `Nakshatra: ${p.nakshatraName} pada ${p.nakshatraPada} until ${formatClock(p.nakshatraEndHours)}`,
      `Yoga: ${p.yogaName} until ${formatClock(p.yogaEndHours)}`,
      `Karana: ${p.karanaName} until ${formatClock(p.karanaEndHours)}`,
      `Vaara: ${result.vaara}`,
      "",
      `Masa (amanta): ${cal.masaLabel}`,
      `Ritu: ${cal.ritu} · Ayana: ${cal.ayana}`,
      `Samvatsara: ${cal.samvatsara} · Shaka ${cal.shakaYear} · Vikram ${cal.vikramYear}`,
      `Sun in ${p.sunRashi} · Moon in ${p.moonRashi}`,
    ];
    if (div) {
      lines.push(
        "",
        `Rahu Kaal: ${formatRange(div.rahu)}`,
        `Yamaganda: ${formatRange(div.yamaganda)}`,
        `Gulika Kaal: ${formatRange(div.gulika)}`,
        `Abhijit Muhurta: ${formatRange(div.abhijit)}`,
      );
      if (div.brahmaMuhurta) lines.push(`Brahma Muhurta: ${formatRange(div.brahmaMuhurta)}`);
    }
    lines.push(
      "",
      `Panchanga elements are for the moment of local sunrise. Sidereal positions use the Lahiri (Chitrapaksha) ayanamsa, ${p.ayanamsa.toFixed(4)}° on this date.`,
    );
    return lines.join("\n");
  }, [hasError, dateValue, place, result, p, cal, div]);

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
    setDateValue(todayIso());
    setCityName(DEFAULT_CITY);
    setManual(false);
    setLatText("28.6139");
    setLngText("77.2090");
    setTzText("5.5");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunrise className="h-4 w-4" aria-hidden="true" />
          Hindu almanac
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Panchang Calendar</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sunrise and sunset from the NOAA solar algorithm; tithi, nakshatra, yoga and karana
          from the Moon&rsquo;s and Sun&rsquo;s longitudes using the Meeus series, with the
          Lahiri (Chitrapaksha) ayanamsa. Everything is computed in your browser from the date
          and the coordinates below.
        </p>
      </header>

      <section className={CARD} aria-labelledby="panchang-inputs">
        <h2 id="panchang-inputs" className="sr-only">
          Date and place
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="panchang-date">
              Date
            </label>
            <input
              id="panchang-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              min="1700-01-01"
              max="2200-12-31"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
          </div>

          {manual ? null : (
            <div>
              <label className={LABEL_CLASS} htmlFor="panchang-city">
                Place
              </label>
              <select
                id="panchang-city"
                className={`mt-2 ${INPUT_CLASS}`}
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              >
                {CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setManual((v) => !v)}
            aria-pressed={manual}
            className={GHOST_BTN}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {manual ? "Pick from the city list" : "Enter coordinates by hand"}
          </button>
        </div>

        {manual ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="panchang-lat">
                Latitude (&deg;N positive)
              </label>
              <input
                id="panchang-lat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="-90"
                max="90"
                step="0.0001"
                value={latText}
                onChange={(e) => setLatText(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="panchang-lng">
                Longitude (&deg;E positive)
              </label>
              <input
                id="panchang-lng"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="-180"
                max="180"
                step="0.0001"
                value={lngText}
                onChange={(e) => setLngText(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="panchang-tz">
                UTC offset (hours)
              </label>
              <input
                id="panchang-tz"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="-12"
                max="14"
                step="0.25"
                value={tzText}
                onChange={(e) => setTzText(e.target.value)}
              />
            </div>
          </div>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {hasError ? null : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {result.weekdayName} &middot; {result.vaara}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                  {p.paksha} {p.tithiName}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {place.name} &middot; {place.latitude.toFixed(4)}&deg;,{" "}
                  {place.longitude.toFixed(4)}&deg;
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the panchang for this date"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the date and place"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-sun">
            <h2
              id="panchang-sun"
              className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]"
            >
              <Sun className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Sun
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Sunrise"
                value={formatClock(result.sunriseHours) ?? "Does not rise"}
              />
              <Stat label="Solar noon" value={formatClock(result.solarNoonHours)} />
              <Stat label="Sunset" value={formatClock(result.sunsetHours) ?? "Does not set"} />
              <Stat
                label="Day length"
                value={formatDuration(result.dayLengthHours)}
                hint={
                  result.nightLengthHours === null
                    ? null
                    : `night ${formatDuration(result.nightLengthHours)}`
                }
              />
            </div>
            {result.circumpolar ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                At this latitude and date the Sun stays{" "}
                {result.circumpolar === "up" ? "above" : "below"} the horizon all day, so the
                day is not divided into eight parts and the kaals below cannot be defined.
              </p>
            ) : null}
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-moon">
            <h2
              id="panchang-moon"
              className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]"
            >
              <Moon className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Moon
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Moonrise"
                value={formatClock(result.moonriseHours) ?? "None on this date"}
              />
              <Stat
                label="Moonset"
                value={formatClock(result.moonsetHours) ?? "None on this date"}
              />
              <Stat label="Illuminated" value={`${(p.illumination * 100).toFixed(0)}%`} hint="approximate" />
              <Stat
                label="Distance"
                value={`${Math.round(p.moonDistanceKm).toLocaleString("en-IN")} km`}
              />
            </div>
            {result.moonriseHours === null || result.moonsetHours === null ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                The Moon rises about fifty minutes later each day, so roughly once a month a
                calendar day contains no moonrise (or no moonset) at all. That is what
                &ldquo;none on this date&rdquo; means here — it is not a missing value.
              </p>
            ) : null}
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-five">
            <h2 id="panchang-five" className="text-base font-semibold text-[var(--foreground)]">
              The five limbs
            </h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Each element is the one running at local sunrise
              {result.sunriseHours === null ? "" : ` (${formatClock(result.sunriseHours)})`},
              shown with the moment it ends.
            </p>
            <dl className="mt-3 divide-y divide-[var(--border)]">
              <Row
                label="Tithi"
                value={`${p.paksha} ${p.tithiName}`}
                hint={`ends ${formatClock(p.tithiEndHours)}`}
              />
              <Row
                label="Nakshatra"
                value={`${p.nakshatraName} · pada ${p.nakshatraPada}`}
                hint={`ends ${formatClock(p.nakshatraEndHours)}`}
              />
              <Row
                label="Yoga"
                value={p.yogaName}
                hint={`ends ${formatClock(p.yogaEndHours)}`}
              />
              <Row
                label="Karana"
                value={p.karanaName}
                hint={`ends ${formatClock(p.karanaEndHours)}`}
              />
              <Row label="Vaara" value={`${result.vaara} (${result.weekdayName})`} />
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-calendar">
            <h2
              id="panchang-calendar"
              className="text-base font-semibold text-[var(--foreground)]"
            >
              Hindu calendar
            </h2>
            <dl className="mt-3 divide-y divide-[var(--border)]">
              <Row
                label="Masa (amanta)"
                value={cal.masaLabel}
                hint={cal.isAdhikaMasa ? "intercalary month" : null}
              />
              <Row label="Ritu" value={cal.ritu} />
              <Row label="Ayana" value={cal.ayana} />
              <Row label="Samvatsara" value={cal.samvatsara} />
              <Row label="Shaka Samvat" value={cal.shakaYear} />
              <Row label="Vikram Samvat" value={cal.vikramYear} />
              <Row label="Sun in" value={p.sunRashi} hint={`${p.sunSidereal.toFixed(2)}° sidereal`} />
              <Row
                label="Moon in"
                value={p.moonRashi}
                hint={`${p.moonSidereal.toFixed(2)}° sidereal`}
              />
              <Row
                label="Ayanamsa (Lahiri)"
                value={`${p.ayanamsa.toFixed(4)}°`}
                hint="Chitrapaksha"
              />
            </dl>
          </section>

          {div ? (
            <>
              <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-kaal">
                <h2
                  id="panchang-kaal"
                  className="text-base font-semibold text-[var(--foreground)]"
                >
                  Day periods
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Rahu Kaal, Yamaganda and Gulika are the published weekday parts of the
                  daylight period split into eight; Abhijit is the eighth of fifteen equal
                  daylight muhurtas, so it straddles solar noon; Brahma Muhurta is the
                  second-last of the fifteen muhurtas of the night that just ended. All of
                  them are measured from the sunrise and sunset computed above, so they move
                  with the date and the place.
                </p>
                <dl className="mt-3 divide-y divide-[var(--border)]">
                  <Row
                    label="Rahu Kaal"
                    value={<span className="text-[var(--danger)]">{formatRange(div.rahu)}</span>}
                  />
                  <Row
                    label="Yamaganda"
                    value={
                      <span className="text-[var(--danger)]">{formatRange(div.yamaganda)}</span>
                    }
                  />
                  <Row
                    label="Gulika Kaal"
                    value={<span className="text-[var(--danger)]">{formatRange(div.gulika)}</span>}
                  />
                  <Row
                    label="Abhijit Muhurta"
                    value={formatRange(div.abhijit)}
                    hint={
                      result.weekday === 3 ? "traditionally not observed on Wednesday" : null
                    }
                  />
                  <Row label="Brahma Muhurta" value={formatRange(div.brahmaMuhurta)} />
                </dl>
              </section>

              <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-choghadiya">
                <h2
                  id="panchang-choghadiya"
                  className="text-base font-semibold text-[var(--foreground)]"
                >
                  Day Choghadiya
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  The daylight period in eight parts, each carrying the choghadiya of a
                  planet. The sequence runs in reverse Chaldean order and starts with the
                  ruler of the weekday, so it is derived, not looked up.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[22rem] text-left text-sm">
                    <caption className="sr-only">
                      The eight day choghadiya with their start and end times
                    </caption>
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          Choghadiya
                        </th>
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          From
                        </th>
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          To
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Nature
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {div.choghadiya.map((slot, index) => (
                        <tr
                          key={`${slot.name}-${index}`}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <th
                            scope="row"
                            className="py-2 pr-3 font-semibold text-[var(--foreground)]"
                          >
                            {slot.name}
                          </th>
                          <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                            {formatClock(slot.start)}
                          </td>
                          <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                            {formatClock(slot.end)}
                          </td>
                          <td
                            className={`py-2 ${
                              slot.quality === "inauspicious"
                                ? "text-[var(--danger)]"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {slot.quality}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="panchang-method">
        <h2 id="panchang-method" className="text-base font-semibold text-[var(--foreground)]">
          How these numbers are produced
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Sunrise, sunset and solar noon use the NOAA solar position algorithm with the
            standard &minus;0&deg;50&prime; horizon (refraction plus the solar semidiameter).
            Solar noon sits exactly midway between sunrise and sunset.
          </li>
          <li>
            Tithi and karana come from the Moon&rsquo;s elongation from the Sun; nakshatra
            from the sidereal lunar longitude; yoga from the sum of the sidereal solar and
            lunar longitudes. The longitudes are the Meeus (Astronomical Algorithms) solar and
            lunar series.
          </li>
          <li>
            Sidereal positions use the <strong>Lahiri (Chitrapaksha) ayanamsa</strong>. This
            matters: Raman, Krishnamurti and Fagan&ndash;Bradley sit up to about a degree away
            from Lahiri, which can move a nakshatra or tithi boundary by more than an hour. If
            your family panchang uses a different ayanamsa, expect boundary times to differ.
          </li>
          <li>
            Ending times are found by solving for the instant the relevant angle actually
            reaches its boundary, not by assuming a fixed duration. A tithi can therefore be
            skipped (kshaya) or repeated (vriddhi) across two sunrises, exactly as in a
            printed panchang.
          </li>
          <li>
            Amrit Kaal, the Sandhya periods and festival lists are deliberately not shown.
            They depend on tradition-specific tables or regional convention rules rather than
            on astronomy, so there is no single correct value this tool could compute.
          </li>
          <li>
            For ritual timing, confirm against the panchang your tradition follows. Nothing
            here needs a server: the calculation runs entirely on your device.
          </li>
        </ul>
      </section>
    </main>
  );
}
