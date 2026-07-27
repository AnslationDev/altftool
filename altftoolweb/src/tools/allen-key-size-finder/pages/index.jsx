"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import {
  INCH_KEYS,
  METRIC_KEYS,
  MM_PER_INCH,
  SCREW_KEY_TABLES,
  buildCrossReference,
  keyForScrew,
  matchHexKey,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const DASH = "—";

const mm3 = (v) => (Number.isFinite(v) ? `${NUM3.format(v)} mm` : DASH);
const pct2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} %` : DASH);

const RATING_STYLE = {
  exact: "bg-[var(--success-soft)] text-[var(--success)]",
  interchangeable: "bg-[var(--success-soft)] text-[var(--success)]",
  careful: "bg-[var(--warning-soft)] text-[var(--warning)]",
  rounds: "bg-[var(--danger-soft)] text-[var(--danger)]",
  "too-big": "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  system: "metric",
  metricSize: "6",
  inchIndex: "10",
  standard: "iso-4762",
  screw: "M6",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const CROSS_REFERENCE = buildCrossReference();
const GAUGE_KEYS = METRIC_KEYS.filter((key) => key.mm >= 1.5 && key.mm <= 12);

export default function ToolHome() {
  const [system, setSystem] = useState(DEFAULTS.system);
  const [metricSize, setMetricSize] = useState(DEFAULTS.metricSize);
  const [inchIndex, setInchIndex] = useState(DEFAULTS.inchIndex);
  const [standard, setStandard] = useState(DEFAULTS.standard);
  const [screw, setScrew] = useState(DEFAULTS.screw);
  const [copied, setCopied] = useState(false);

  const sizeMm =
    system === "metric"
      ? Number(metricSize)
      : (INCH_KEYS[Number(inchIndex)]?.mm ?? Number.NaN);

  const result = useMemo(() => matchHexKey({ system, sizeMm }), [system, sizeMm]);
  const screwResult = useMemo(() => keyForScrew({ standard, size: screw }), [standard, screw]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Allen Key Size Finder",
      `You have: ${result.own.label} (${NUM3.format(result.sizeMm)} mm across flats)`,
      `Nearest in the other system: ${result.counterpart.label} (${NUM3.format(result.counterpart.mm)} mm)`,
      `Difference: ${NUM3.format(result.differenceMm)} mm`,
      `${result.counterpart.label} in your socket: ${result.counterpartInYourSocket.label}`,
      `Your key in a ${result.counterpart.label} socket: ${result.yourKeyInCounterpartSocket.label}`,
      result.largestThatFits
        ? `Largest that still enters your socket: ${result.largestThatFits.label} — ${result.bestSubstitute.label}`
        : "",
      result.verdict,
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result]);

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
    setSystem(DEFAULTS.system);
    setMetricSize(DEFAULTS.metricSize);
    setInchIndex(DEFAULTS.inchIndex);
    setStandard(DEFAULTS.standard);
    setScrew(DEFAULTS.screw);
    setCopied(false);
  };

  const changeStandard = (id) => {
    setStandard(id);
    setScrew(SCREW_KEY_TABLES[id].sizes[0][0]);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Hex keys
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Allen Key Size Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Some metric and imperial hex sizes are the same tool with two names. Others are close
          enough to seem right and round the socket instead. This tells you which is which, by
          clearance rather than by eye.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ak-system">
              The key or socket you have
            </label>
            <select
              id="ak-system"
              className={`mt-2 ${INPUT_CLASS}`}
              value={system}
              onChange={(event) => setSystem(event.target.value)}
            >
              <option value="metric">Metric, in millimetres</option>
              <option value="inch">Imperial, in inch fractions</option>
            </select>
          </div>

          {system === "metric" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ak-metric">
                Size across flats
              </label>
              <select
                id="ak-metric"
                className={`mt-2 ${INPUT_CLASS}`}
                value={metricSize}
                onChange={(event) => setMetricSize(event.target.value)}
              >
                {METRIC_KEYS.map((key) => (
                  <option key={key.label} value={key.mm}>
                    {key.label}
                  </option>
                ))}
              </select>
              <p className={HINT_CLASS}>
                {NUM3.format(Number(metricSize) / MM_PER_INCH)} inches across flats.
              </p>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="ak-inch">
                Size across flats
              </label>
              <select
                id="ak-inch"
                className={`mt-2 ${INPUT_CLASS}`}
                value={inchIndex}
                onChange={(event) => setInchIndex(event.target.value)}
              >
                {INCH_KEYS.map((key, index) => (
                  <option key={key.label} value={index}>
                    {key.label}
                  </option>
                ))}
              </select>
              <p className={HINT_CLASS}>
                {NUM3.format(INCH_KEYS[Number(inchIndex)]?.mm ?? 0)} mm across flats.
              </p>
            </div>
          )}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Closest in the other system
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.counterpart.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Pick a size above."
                : `${mm3(result.counterpart.mm)} against your ${mm3(result.sizeMm)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the hex key match"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${RATING_STYLE[result.counterpartInYourSocket.rating]}`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Your size across flats", failed ? DASH : mm3(result.sizeMm)],
            ["In the other unit", failed ? DASH : `${NUM3.format(result.sizeInches)} in`],
            ["Nearest counterpart", failed ? DASH : mm3(result.counterpart.mm)],
            ["Difference", failed ? DASH : mm3(result.differenceMm)],
            [
              "Counterpart in your socket",
              failed ? DASH : result.counterpartInYourSocket.label,
            ],
            [
              "Clearance if it enters",
              failed || result.counterpartInYourSocket.rating === "too-big"
                ? DASH
                : pct2(result.counterpartInYourSocket.gapPct),
            ],
            [
              "Your key in their socket",
              failed ? DASH : result.yourKeyInCounterpartSocket.label,
            ],
            [
              "Largest that still enters yours",
              failed || !result.largestThatFits ? DASH : result.largestThatFits.label,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.bestSubstitute && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">If you must substitute: </span>
            {result.largestThatFits.label} is the largest that enters. {result.bestSubstitute.advice}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Key size for a fastener</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ak-standard">
              Fastener standard
            </label>
            <select
              id="ak-standard"
              className={`mt-2 ${INPUT_CLASS}`}
              value={standard}
              onChange={(event) => changeStandard(event.target.value)}
            >
              {Object.entries(SCREW_KEY_TABLES).map(([id, table]) => (
                <option key={id} value={id}>
                  {table.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ak-screw">
              Screw size
            </label>
            <select
              id="ak-screw"
              className={`mt-2 ${INPUT_CLASS}`}
              value={screw}
              onChange={(event) => setScrew(event.target.value)}
            >
              {SCREW_KEY_TABLES[standard].sizes.map(([label]) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
          {screwResult.error
            ? screwResult.error
            : `${screwResult.screw} takes a ${screwResult.keyLabel} hex key (${NUM3.format(screwResult.keyMm)} mm across flats).`}
        </p>
        <p className={HINT_CLASS}>
          Head style changes the answer: an M6 cap screw takes a 5 mm key, an M6 button head takes
          4 mm and an M6 grub screw takes 3 mm.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Metric and imperial cross-reference</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Read it in the direction you need. A key that is safe in one system&apos;s socket is
          usually too wide for the other&apos;s.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Metric
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Imperial
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Difference
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Inch key in metric socket
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Metric key in inch socket
                </th>
              </tr>
            </thead>
            <tbody>
              {CROSS_REFERENCE.map((row) => (
                <tr key={row.metric} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.metric}</td>
                  <td className="py-2 pr-3 font-semibold">{row.inch}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {NUM3.format(row.differenceMm)} mm
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${RATING_STYLE[row.inchInMetricSocket.rating]}`}
                    >
                      {row.inchInMetricSocket.label}
                    </span>
                  </td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${RATING_STYLE[row.metricInInchSocket.rating]}`}
                    >
                      {row.metricInInchSocket.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Printable gauge</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Print this page at 100% scale — no &ldquo;fit to page&rdquo; — and each bar below is the
          true width across flats. Lay the short leg of the key across the bar; the one it matches
          exactly is your size.
        </p>
        <ul className="mt-4 space-y-3">
          {GAUGE_KEYS.map((key) => (
            <li key={key.label} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm font-semibold">{key.label}</span>
              <span
                className="block h-4 rounded-sm bg-[var(--primary)]"
                style={{ width: `${key.mm}mm` }}
                aria-hidden="true"
              />
              <span className="text-xs text-[var(--muted-foreground)]">
                {NUM3.format(key.inches)} in
              </span>
            </li>
          ))}
        </ul>
        <p className={HINT_CLASS}>
          On screen the scale depends on your display, so use it as a printed gauge rather than
          holding a key against the monitor.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are nominal widths across flats. Real keys are made slightly under nominal and real
        sockets slightly over, so a borderline pair can go either way on a given fastener. When a
        screw is tight, badly corroded or torqued to a specification, use the correct key from the
        right system — the cost of a rounded socket is drilling the head off.
      </p>
    </main>
  );
}
