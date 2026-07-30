"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Cpu, RefreshCw, RotateCcw } from "lucide-react";

import { DEVICE_MEMORY_MAX, SAMPLE_PROFILES, analyseHardware, formatReport } from "../lib";

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

function mediaValue(queries) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  for (const [query, value] of queries) {
    try {
      if (window.matchMedia(query).matches) return value;
    } catch {
      return null;
    }
  }
  return null;
}

function readBrowserSignals() {
  if (typeof navigator === "undefined") return null;
  return {
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null,
    deviceMemory: typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null,
    maxTouchPoints: typeof navigator.maxTouchPoints === "number" ? navigator.maxTouchPoints : null,
    pointer: mediaValue([
      ["(pointer: fine)", "fine"],
      ["(pointer: coarse)", "coarse"],
      ["(pointer: none)", "none"],
    ]),
    hover: mediaValue([
      ["(hover: hover)", "hover"],
      ["(hover: none)", "none"],
    ]),
    anyPointer: mediaValue([
      ["(any-pointer: fine)", "fine"],
      ["(any-pointer: coarse)", "coarse"],
      ["(any-pointer: none)", "none"],
    ]),
    anyHover: mediaValue([
      ["(any-hover: hover)", "hover"],
      ["(any-hover: none)", "none"],
    ]),
  };
}

export default function ToolHome() {
  const [source, setSource] = useState("this-browser");
  const [measured, setMeasured] = useState(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    const signals = readBrowserSignals();
    if (signals) setMeasured(signals);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const active = useMemo(() => {
    if (source === "this-browser") return measured || DEFAULT_SIGNALS;
    const profile = SAMPLE_PROFILES.find((item) => item.id === source);
    return profile ? profile.signals : DEFAULT_SIGNALS;
  }, [source, measured]);

  const result = useMemo(() => analyseHardware(active), [active]);
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
          <Cpu className="h-4 w-4" aria-hidden="true" />
          Browser fingerprinting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Hardware Capability Fingerprint Viewer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Processor count, an approximate memory figure and your input capabilities are all readable
          without a prompt. Here is exactly what your browser hands over, and how coarse each figure
          really is.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="hw-source">
          Readings to analyse
        </label>
        <select
          id="hw-source"
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
            ? "Read from navigator and the pointer/hover media queries in this tab."
            : source === "this-browser"
              ? "Waiting for the browser reading — a reference machine is shown meanwhile."
              : "A reference machine, so you can see how an ordinary device reports itself."}
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
              What your inputs say you are
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {result.error ? dash : result.deviceClass.label}
            </p>
            {!result.error && (
              <p className="mt-2 inline-flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[result.band.tone]}`}
                >
                  {result.band.label}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {result.deviceClass.detail}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              aria-label="Copy the hardware fingerprint report"
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
            ["Readings your browser exposes", result.error ? dash : `${result.exposed} of ${result.total}`],
            ["Unusual readings", result.error ? dash : String(result.distinctive)],
            [
              "Distinct answers these fields can produce",
              result.error ? dash : `${result.combinations} (${result.bits.toFixed(1)} bits, upper bound)`,
            ],
            [
              "Memory value follows the specification",
              result.error ? dash : result.memory === null ? "Not reported" : result.memorySpecValue ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Every reading, and what it means</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
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
                    <td className="py-2.5 pr-3">{row.value}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.distinctive ? TONE_CLASS.danger : TONE_CLASS.success
                        }`}
                      >
                        {row.distinctive ? "Unusual" : "Ordinary"}
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
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Why these fields are deliberately coarse</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Device memory is rounded to a power of two and capped at {DEVICE_MEMORY_MAX} GB, so a
            machine with 16, 32 or 64 GB all report the same number.
          </li>
          <li>
            Processor count is the number of logical processors, not physical cores, and browsers are
            free to cap it — which is why a large machine can report a small figure.
          </li>
          <li>
            Firefox does not implement the Device Memory API at all, so that row simply stays empty
            there. Fewer readings exposed means less to correlate.
          </li>
          <li>
            Input capability is the most reliable signal here: it comes from the pointer and hover
            media features rather than a user-agent string, so it cannot be changed by a spoofer
            extension alone.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The combination figure is an upper bound that assumes every value is equally likely, which it
        is not, so treat it as a ceiling rather than a measurement. Nothing on this page is sent
        anywhere.
      </p>
    </main>
  );
}
