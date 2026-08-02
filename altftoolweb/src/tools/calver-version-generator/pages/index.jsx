"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { PRESET_SCHEMES, formatCalVer, previewTimeline } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TODAY = new Date();
const DEFAULTS = {
  scheme: "YYYY.MM.MICRO",
  year: String(TODAY.getFullYear()),
  month: String(TODAY.getMonth() + 1),
  day: String(TODAY.getDate()),
  minor: "0",
  micro: "0",
  modifier: "",
};

const DASH = "—";

export default function ToolHome() {
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [year, setYear] = useState(DEFAULTS.year);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [day, setDay] = useState(DEFAULTS.day);
  const [minor, setMinor] = useState(DEFAULTS.minor);
  const [micro, setMicro] = useState(DEFAULTS.micro);
  const [modifier, setModifier] = useState(DEFAULTS.modifier);
  const [copied, setCopied] = useState(false);

  const numericInput = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      formatCalVer({
        scheme,
        year: numericInput(year),
        month: numericInput(month),
        day: numericInput(day),
        minor: numericInput(minor),
        micro: numericInput(micro),
        modifier,
      }),
    [scheme, year, month, day, minor, micro, modifier],
  );

  const hasError = Boolean(result.error);

  const timeline = useMemo(() => {
    if (hasError) return null;
    const preview = previewTimeline({
      scheme,
      year: numericInput(year),
      month: numericInput(month),
      day: numericInput(day),
      count: 6,
      modifier: "",
    });
    return preview.error ? null : preview.releases;
  }, [hasError, scheme, year, month, day]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.version);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setScheme(DEFAULTS.scheme);
    setYear(DEFAULTS.year);
    setMonth(DEFAULTS.month);
    setDay(DEFAULTS.day);
    setMinor(DEFAULTS.minor);
    setMicro(DEFAULTS.micro);
    setModifier(DEFAULTS.modifier);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CalVer Version Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build calendar version numbers from any date using the calver.org tokens — YYYY, YY, 0M,
          WW, DD, MINOR, MICRO and MODIFIER — and preview the next six monthly releases.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="cv-scheme">
            Scheme
          </label>
          <input
            id="cv-scheme"
            className={`mt-2 font-mono ${INPUT_CLASS}`}
            type="text"
            spellCheck={false}
            placeholder="YYYY.MM.MICRO"
            value={scheme}
            onChange={(event) => setScheme(event.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_SCHEMES.map((preset) => (
            <button
              key={preset.scheme}
              type="button"
              title={preset.note}
              onClick={() => setScheme(preset.scheme)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.scheme}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-year">
              Release year
            </label>
            <input
              id="cv-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2000"
              max="2999"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-month">
              Month
            </label>
            <input
              id="cv-month"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-day">
              Day
            </label>
            <input
              id="cv-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-minor">
              MINOR value
            </label>
            <input
              id="cv-minor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={minor}
              onChange={(event) => setMinor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-micro">
              MICRO value
            </label>
            <input
              id="cv-micro"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={micro}
              onChange={(event) => setMicro(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cv-modifier">
              MODIFIER (optional)
            </label>
            <input
              id="cv-modifier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="beta1, rc2 ..."
              value={modifier}
              onChange={(event) => setModifier(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated version
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.version}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated CalVer version"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy version"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Token breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.tokens.map((part, index) => (
              <div key={`${part.token}-${index}`} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="font-mono text-[var(--muted-foreground)]">{part.token}</dt>
                <dd className="text-right font-mono font-semibold">{part.value}</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      {timeline ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Preview timeline — next six monthly releases</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Release month
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Version
                  </th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((release) => (
                  <tr key={release.version + release.month} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {MONTH_NAMES[release.month - 1]} {release.year}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold">{release.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token semantics follow calver.org: short years count from 2000 (2026 → 26), weeks count
        from January 1st, and MICRO/MINOR counters conventionally reset when the date segment rolls
        over. CalVer and SemVer are different contracts — a CalVer number does not promise API
        compatibility.
      </p>
    </main>
  );
}
