"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import { CITY_PRESETS, computeTeamOverlap } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CITIES = ["new-york", "london", "bengaluru"];
const DASH = "—";

const hh = (hour) => `${String(hour % 24).padStart(2, "0")}:00`;

export default function ToolHome() {
  const [cityIds, setCityIds] = useState(DEFAULT_CITIES);
  const [workStartHour, setWorkStartHour] = useState("9");
  const [workEndHour, setWorkEndHour] = useState("17");
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (String(value).trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      computeTeamOverlap({
        cityIds,
        workStartHour: asNumber(workStartHour),
        workEndHour: asNumber(workEndHour),
      }),
    [cityIds, workStartHour, workEndHour],
  );

  const hasError = Boolean(result.error);

  const toggleCity = (id) => {
    setCityIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Distributed team overlap matrix",
      `Cities: ${result.cities.join("; ")}`,
      `Working hours: ${hh(Number(workStartHour))}-${hh(Number(workEndHour))} local`,
      `Hours when everyone overlaps: ${result.fullOverlapHours}`,
      `Best slot: ${hh(result.bestRun.startUtcHour)}-${hh(result.bestRun.startUtcHour + result.bestRun.lengthHours)} UTC (${result.maxOverlap}/${result.teamSize} cities working)`,
      ...result.meetingLocalTimes.map((t) => `  ${t.label}: ${t.start}-${t.end} local`),
    ].join("\n");
  }, [hasError, result, workStartHour, workEndHour]);

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
    setCityIds(DEFAULT_CITIES);
    setWorkStartHour("9");
    setWorkEndHour("17");
    setCopied(false);
  };

  const selectedCities = CITY_PRESETS.filter((c) => cityIds.includes(c.id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Distributed teams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">UTC Offset Team Matrix</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your team&apos;s cities and shared working hours to get a 24-hour grid of local
          clocks, the hours when everyone overlaps, and the best recurring meeting slot with its
          local time in every city.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Team cities</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CITY_PRESETS.map((city) => (
              <label
                key={city.id}
                htmlFor={`tm-city-${city.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`tm-city-${city.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={cityIds.includes(city.id)}
                  onChange={() => toggleCity(city.id)}
                />
                {city.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-start">
              Working day starts (local hour)
            </label>
            <select
              id="tm-start"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workStartHour}
              onChange={(event) => setWorkStartHour(event.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {hh(i)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-end">
              Working day ends (local hour)
            </label>
            <select
              id="tm-end"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workEndHour}
              onChange={(event) => setWorkEndHour(event.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {hh(i + 1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hours when the whole team overlaps
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.fullOverlapHours} h/day`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the grid."
                : result.maxOverlapIsEveryone
                  ? `Best slot ${hh(result.bestRun.startUtcHour)}–${hh(result.bestRun.startUtcHour + result.bestRun.lengthHours)} UTC with all ${result.teamSize} cities at work.`
                  : `No hour has all ${result.teamSize} cities at work — the best slot reaches ${result.maxOverlap} of ${result.teamSize} (${hh(result.bestRun.startUtcHour)}–${hh(result.bestRun.startUtcHour + result.bestRun.lengthHours)} UTC).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the team overlap matrix"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? null : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.meetingLocalTimes.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{entry.label}</dt>
                <dd className="text-right font-semibold">
                  {entry.start}–{entry.end} local
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">24-hour overlap grid (UTC day)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    UTC
                  </th>
                  {selectedCities.map((city) => (
                    <th key={city.id} scope="col" className="py-2 pr-3 font-semibold">
                      {city.label.split(" (")[0]}
                    </th>
                  ))}
                  <th scope="col" className="py-2 text-right font-semibold">
                    Working
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.matrix.map((row) => (
                  <tr
                    key={row.utcHour}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.workingCount === result.teamSize ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold">{hh(row.utcHour)}</td>
                    {row.entries.map((entry) => (
                      <td
                        key={entry.id}
                        className={`py-1.5 pr-3 font-mono ${
                          entry.working
                            ? "font-semibold text-[var(--success)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {entry.localTime}
                      </td>
                    ))}
                    <td className="py-1.5 text-right font-semibold">
                      {row.workingCount}/{result.teamSize}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Offsets are standard-time values; cities that observe daylight saving (US, UK, EU, Sydney)
        shift one hour part of the year, so overlap windows move with them. For teams with no
        shared hour, rotate meeting times or lean on async updates instead of stretching one
        region&apos;s evening forever.
      </p>
    </main>
  );
}
