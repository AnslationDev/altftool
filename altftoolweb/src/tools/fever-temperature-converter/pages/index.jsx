"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Thermometer } from "lucide-react";

import {
  CORE_FEVER_C,
  SCALES,
  SCALE_LABELS,
  SITES,
  SITE_THRESHOLD_ROWS,
  convertBodyTemperature,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = { value: "38.4", scale: "C", siteId: "oral" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [siteId, setSiteId] = useState(DEFAULTS.siteId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertBodyTemperature({ value, scale, siteId }),
    [value, scale, siteId],
  );
  const ok = !result.error;

  const headline = ok
    ? scale === "C"
      ? `${NUM1.format(result.fahrenheit)} °F`
      : `${NUM1.format(result.celsius)} °C`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Body temperature conversion",
      `Measured at: ${result.site.label}`,
      `In Celsius: ${NUM2.format(result.celsius)} °C`,
      `In Fahrenheit: ${NUM2.format(result.fahrenheit)} °F`,
      `In Kelvin: ${NUM2.format(result.kelvin)} K`,
      `Core equivalent: ${NUM2.format(result.coreC)} °C (${NUM2.format(result.coreF)} °F)`,
      `Fever threshold for this site: ${NUM1.format(result.siteFeverC)} °C (${NUM1.format(result.siteFeverF)} °F)`,
      `Assessment: ${result.band.label}`,
      "Informational only — seek medical care for a fever in an infant or anyone unwell.",
    ].join("\n");
  }, [ok, result]);

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
    setValue(DEFAULTS.value);
    setScale(DEFAULTS.scale);
    setSiteId(DEFAULTS.siteId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fever Temperature Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a thermometer reading between Celsius, Fahrenheit and Kelvin, then compare it with
          the fever threshold for the site it was taken from.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-value">
              Temperature reading
            </label>
            <input
              id="temp-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-scale">
              Scale
            </label>
            <select
              id="temp-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scale}
              onChange={(event) => setScale(event.target.value)}
            >
              {SCALES.map((option) => (
                <option key={option} value={option}>
                  {SCALE_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="temp-site">
              Where it was measured
            </label>
            <select
              id="temp-site"
              className={`mt-2 ${INPUT_CLASS}`}
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
            >
              {SITES.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {scale === "C" ? "In Fahrenheit" : "In Celsius"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            {ok ? (
              <span
                className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  TONE_CLASS[result.band.tone]
                }`}
              >
                {result.band.label}
              </span>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Fix the input above to see a result.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the temperature conversion"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Celsius", ok ? `${NUM2.format(result.celsius)} °C` : DASH],
            ["Fahrenheit", ok ? `${NUM2.format(result.fahrenheit)} °F` : DASH],
            ["Kelvin", ok ? `${NUM2.format(result.kelvin)} K` : DASH],
            [
              "Fever threshold for this site",
              ok ? `${NUM1.format(result.siteFeverC)} °C (${NUM1.format(result.siteFeverF)} °F)` : DASH,
            ],
            [
              "Difference from that threshold",
              ok
                ? `${result.gapToFeverC >= 0 ? "+" : "−"}${NUM2.format(Math.abs(result.gapToFeverC))} °C`
                : DASH,
            ],
            [
              "Core-equivalent reading",
              ok ? `${NUM2.format(result.coreC)} °C (${NUM2.format(result.coreF)} °F)` : DASH,
            ],
            [`Meets the ${CORE_FEVER_C} °C fever definition`, ok ? (result.isFever ? "Yes" : "No") : DASH],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <>
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.band.note}
            </p>
            <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.site.note}
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Fever threshold by measurement site</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Site
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  °C
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  °F
                </th>
              </tr>
            </thead>
            <tbody>
              {SITE_THRESHOLD_ROWS.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM1.format(row.celsius)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM1.format(row.fahrenheit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Get urgent medical help for any fever in a baby under
        three months, a temperature that will not come down, a stiff neck, a rash that does not fade
        under pressure, breathing difficulty, drowsiness or a seizure.
      </p>
    </main>
  );
}
