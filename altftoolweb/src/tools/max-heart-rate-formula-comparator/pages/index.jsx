"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { SEX_OPTIONS, compareMaxHrFormulas, intensityTable } from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DASH = "—";

const DEFAULTS = { age: "40", sex: "unspecified", measured: "" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [measured, setMeasured] = useState(DEFAULTS.measured);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const ageValue = toNumber(age);
    const measuredValue = toNumber(measured);
    if (Number.isNaN(ageValue) || Number.isNaN(measuredValue)) {
      return { error: "Enter numbers only in the age and measured maximum fields." };
    }
    return compareMaxHrFormulas({
      age: ageValue === null ? undefined : ageValue,
      sex,
      measuredMaxHr: measuredValue,
    });
  }, [age, sex, measured]);

  const hasError = Boolean(result.error);

  const anchors = useMemo(
    () => (hasError ? [] : intensityTable(result.recommended.bpm)),
    [hasError, result],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Maximum heart rate estimates at age ${result.age}`,
      ...result.results.map(
        (item) =>
          `${item.name} (${item.equation}): ${NUM1.format(item.bpm)} bpm${item.applicable ? "" : " — not applicable"}`,
      ),
      "",
      `Mean of applicable equations: ${NUM1.format(result.mean)} bpm`,
      `Spread: ${NUM1.format(result.spread)} bpm (${result.lowest.name} to ${result.highest.name})`,
      `Suggested default: ${result.recommended.name} — ${NUM1.format(result.recommended.bpm)} bpm`,
    ].join("\n");
  }, [hasError, result]);

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
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setMeasured(DEFAULTS.measured);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Formula comparison
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Max Heart Rate Formula Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Seven published age-prediction equations, run side by side, with each one&apos;s source and
          its typical ±10 bpm prediction band — so you can see how much the &quot;220 minus age&quot;
          number really means.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mhr-age">
              Age (years)
            </label>
            <input
              id="mhr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mhr-sex">
              Sex
            </label>
            <select
              id="mhr-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              {SEX_OPTIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only the Gulati equation is sex-specific.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mhr-measured">
              Measured maximum heart rate (optional)
            </label>
            <input
              id="mhr-measured"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="230"
              step="1"
              placeholder="e.g. 191"
              value={measured}
              onChange={(event) => setMeasured(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter a lab or field-tested value to see how far each equation misses it.
            </p>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Suggested estimate {hasError ? "" : `(${result.recommended.name})`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.recommended.bpmRounded)} bpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to compare the equations." : result.recommendedReason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy maximum heart rate comparison"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Mean of applicable equations",
              hasError ? DASH : `${NUM1.format(result.mean)} bpm`,
            ],
            [
              "Lowest estimate",
              hasError ? DASH : `${NUM1.format(result.lowest.bpm)} bpm (${result.lowest.name})`,
            ],
            [
              "Highest estimate",
              hasError ? DASH : `${NUM1.format(result.highest.bpm)} bpm (${result.highest.name})`,
            ],
            ["Spread between equations", hasError ? DASH : `${NUM1.format(result.spread)} bpm`],
            [
              "Suggested prediction band",
              hasError
                ? DASH
                : `${NUM0.format(result.recommended.lowerBpm)}–${NUM0.format(result.recommended.upperBpm)} bpm (±${result.recommended.sd})`,
            ],
            [
              "Measured value entered",
              hasError || result.measuredMaxHr === null
                ? DASH
                : `${NUM0.format(result.measuredMaxHr)} bpm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">All equations</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Equation
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Estimate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  ± band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  vs measured
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.results.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">
                        {item.name} ({item.year})
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {item.equation}
                        {item.applicable ? "" : " · women only"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold whitespace-nowrap">
                      {NUM1.format(item.bpm)}
                    </td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM0.format(item.lowerBpm)}–{NUM0.format(item.upperBpm)}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      {item.differenceFromMeasured === null
                        ? DASH
                        : `${item.differenceFromMeasured >= 0 ? "+" : ""}${NUM0.format(item.differenceFromMeasured)}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!hasError && (
          <ul className="mt-4 space-y-2 text-xs text-[var(--muted-foreground)]">
            {result.results.map((item) => (
              <li key={item.key}>
                <span className="font-semibold text-[var(--foreground)]">{item.name}:</span>{" "}
                {item.note} {item.source}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Intensity anchors {hasError ? "" : `from the ${result.recommended.name} estimate`}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  % of max
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Intensity
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Heart rate
                </th>
              </tr>
            </thead>
            <tbody>
              {(anchors.length > 0
                ? anchors
                : [50, 60, 70, 80, 90, 100].map((percent) => ({ percent, label: DASH, bpm: null }))
              ).map((row) => (
                <tr key={row.percent} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.percent}%</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                  <td className="py-2 text-right font-semibold">
                    {row.bpm === null ? DASH : `${NUM0.format(row.bpm)} bpm`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Every age-prediction equation describes a population average and carries
        a standard deviation of roughly 10 bpm, so an individual&apos;s true maximum can sit 20 bpm
        either side of any of these numbers. Maximal exercise testing carries real risk — arrange it
        with a doctor or a qualified exercise physiologist rather than attempting it unsupervised.
      </p>
    </main>
  );
}
