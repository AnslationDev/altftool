"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Globe, RefreshCw, RotateCcw } from "lucide-react";

import { SAMPLE_PROFILES, analyseLocale, formatReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
};

const DEFAULT_SIGNALS = SAMPLE_PROFILES[0].signals;

function readBrowserSignals() {
  if (typeof window === "undefined" || typeof Intl === "undefined") return null;
  let resolved = {};
  try {
    resolved = new Intl.DateTimeFormat().resolvedOptions();
  } catch {
    return null;
  }
  const languages =
    typeof navigator !== "undefined" && Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages.slice(0, 8)
      : [resolved.locale];
  let numberingSystem = resolved.numberingSystem || "latn";
  try {
    numberingSystem = new Intl.NumberFormat().resolvedOptions().numberingSystem || numberingSystem;
  } catch {
    /* keep the DateTimeFormat answer */
  }
  return {
    timeZone: resolved.timeZone || "UTC",
    locale: resolved.locale || "en",
    languages,
    calendar: resolved.calendar || "gregory",
    numberingSystem,
    hourCycle: resolved.hourCycle || (resolved.hour12 ? "h12" : "h23"),
  };
}

export default function ToolHome() {
  const [source, setSource] = useState("this-browser");
  const [measured, setMeasured] = useState(null);
  const [referenceISO, setReferenceISO] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    const signals = readBrowserSignals();
    if (signals) setMeasured(signals);
    setReferenceISO(new Date().toISOString());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const active = useMemo(() => {
    if (source === "this-browser") return measured || DEFAULT_SIGNALS;
    const profile = SAMPLE_PROFILES.find((item) => item.id === source);
    return profile ? profile.signals : DEFAULT_SIGNALS;
  }, [source, measured]);

  const result = useMemo(
    () => analyseLocale({ ...active, referenceISO: referenceISO || undefined }),
    [active, referenceISO],
  );
  const report = useMemo(() => formatReport(result), [result]);
  const showingLive = source === "this-browser" && Boolean(measured);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource("this-browser");
    setCopied(false);
    refresh();
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Browser fingerprinting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Timezone and Locale Fingerprint Viewer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your timezone, language list and formatting preferences are readable by any page. Together
          they say roughly where you are, what you speak, and whether those two agree.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="loc-source">
          Signals to analyse
        </label>
        <select
          id="loc-source"
          className={`mt-2 ${INPUT_CLASS}`}
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setCopied(false);
          }}
        >
          <option value="this-browser">This browser (live)</option>
          {SAMPLE_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>
              Compare: {profile.label}
            </option>
          ))}
        </select>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {showingLive
            ? "Read from Intl.DateTimeFormat().resolvedOptions() and navigator.languages in this tab."
            : source === "this-browser"
              ? "Waiting for the browser reading — a reference profile is shown meanwhile."
              : "A reference profile, useful for seeing what a mismatch between timezone and language looks like."}
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Your offset right now
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : result.offsetText}
            </p>
            {!result.error && (
              <p className="mt-2 inline-flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[result.band.tone]}`}
                >
                  {result.band.label}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {result.timeZone} · {result.country.name}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              aria-label="Copy the timezone and locale report"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={refresh} aria-label="Re-read the browser" className={GHOST_BTN}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Re-read
            </button>
            <button type="button" onClick={reset} aria-label="Reset to live readings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Offset minute component", result.error ? dash : result.rarity.label],
            [
              "Daylight saving in this zone",
              result.error
                ? dash
                : result.dst.error
                  ? "unknown"
                  : result.dst.observes
                    ? `Yes, ${result.dst.shiftMinutes} minutes`
                    : "No",
            ],
            ["Distinctive signals", result.error ? dash : `${result.distinctive} of ${result.total}`],
            [
              "Timezone vs language region",
              result.error ? dash : result.regionMismatch ? "Disagree" : "Agree",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              result.regionMismatch ? TONE_CLASS.danger : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.mismatchNote}
          </p>
        )}
      </section>

      {!result.error && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Every signal on this page</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Signal
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Value
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Crowd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2.5 pr-3 break-words">{row.value}</td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.distinctive ? TONE_CLASS.danger : TONE_CLASS.success
                          }`}
                        >
                          {row.distinctive ? "Distinctive" : "Common"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.rows.map((row) => (
                <li key={`${row.id}-note`}>
                  <span className="font-semibold text-[var(--foreground)]">{row.label}:</span> {row.note}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">How your locale formats things</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              The same instant and the same number, rendered the way your settings ask for them.
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Short date", result.samples.shortDate],
                ["Full date", result.samples.longDate],
                ["Time", result.samples.time],
                ["Large number", result.samples.number],
                ["Decimal mark", result.samples.decimalSeparator],
                ["Group mark", result.samples.groupSeparator || "none"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Worth knowing</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            A VPN changes your IP address but not your timezone or language list, so a site can see
            the two disagree. Nothing here is proof of anything — expats and travellers look the same.
          </li>
          <li>
            Only three zones worldwide use a 45-minute offset, so a value like UTC+05:45 places you
            almost immediately.
          </li>
          <li>
            navigator.languages is sent on every request as the Accept-Language header, so the list
            order travels with your traffic whether or not any script runs.
          </li>
          <li>Readings stay in this tab; nothing here is transmitted.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        &quot;Distinctive&quot; means a value sits outside a widely shared group, not that you are
        identifiable. Country mapping uses a working subset of the IANA tz database; zones outside it
        are reported as unknown rather than guessed.
      </p>
    </main>
  );
}
