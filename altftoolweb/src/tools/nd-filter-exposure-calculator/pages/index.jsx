"use client";

import { useMemo, useState } from "react";
import { Aperture, Check, Copy, RotateCcw } from "lucide-react";
import {
  ND_PRESETS,
  STANDARD_SHUTTERS,
  buildNdTable,
  computeNdExposure,
  formatExposure,
  stopsForTargetExposure,
  totalStopsForFilterIds,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const SMALL = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 });

const DEFAULTS = {
  base: String(1 / 125),
  primary: "nd1000",
  secondary: "none",
  extra: "0",
  target: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [base, setBase] = useState(DEFAULTS.base);
  const [primary, setPrimary] = useState(DEFAULTS.primary);
  const [secondary, setSecondary] = useState(DEFAULTS.secondary);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const filterStops = totalStopsForFilterIds([primary, secondary]);

  const result = useMemo(
    () =>
      computeNdExposure({
        baseShutterSeconds: base.trim() === "" ? NaN : Number(base),
        filterStops,
        extraStops: extra.trim() === "" ? 0 : Number(extra),
      }),
    [base, filterStops, extra],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const reverse = useMemo(
    () =>
      stopsForTargetExposure({
        baseShutterSeconds: base.trim() === "" ? NaN : Number(base),
        targetSeconds: target.trim() === "" ? NaN : Number(target),
      }),
    [base, target],
  );

  const table = useMemo(
    () => (hasError ? [] : buildNdTable(result.totalStops)),
    [hasError, result],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "ND Filter Exposure Calculator",
      `Metered: ${formatExposure(result.baseShutterSeconds)}`,
      `Filtration: ${NUM.format(result.totalStops)} stops (factor ${SMALL.format(result.filterFactor)}, density ${NUM.format(result.opticalDensity)})`,
      `Filtered exposure: ${formatExposure(result.filteredSeconds)} (${SMALL.format(result.filteredSeconds)} s)`,
      result.needsBulb ? "Longer than 30 s — use bulb mode and a remote or intervalometer." : "Fits inside the camera's timed shutter range.",
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
    setBase(DEFAULTS.base);
    setPrimary(DEFAULTS.primary);
    setSecondary(DEFAULTS.secondary);
    setExtra(DEFAULTS.extra);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Aperture className="h-4 w-4" aria-hidden="true" />
          Long exposure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ND Filter Exposure Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every stop of neutral density halves the light, so the shutter doubles. Meter without the
          filter, enter the strength, and get the filtered time plus its optical density and
          transmittance.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-base">
              Metered shutter speed (no filter)
            </label>
            <select
              id="nd-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={base}
              onChange={(event) => setBase(event.target.value)}
            >
              {STANDARD_SHUTTERS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {formatExposure(seconds)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-primary">
              ND filter
            </label>
            <select
              id="nd-primary"
              className={`mt-2 ${INPUT_CLASS}`}
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
            >
              {ND_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {preset.stops} stop{preset.stops === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-secondary">
              Stacked second filter
            </label>
            <select
              id="nd-secondary"
              className={`mt-2 ${INPUT_CLASS}`}
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
            >
              {ND_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {preset.stops} stop{preset.stops === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-extra">
              Extra stops (polariser, grad, bellows)
            </label>
            <input
              id="nd-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.5"
              value={extra}
              onChange={(event) => setExtra(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
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
              Filtered exposure
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : formatExposure(result.filteredSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${NUM.format(result.totalStops)} stops of filtration · ${SMALL.format(result.filteredSeconds)} seconds`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ND filter exposure result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Metered exposure", hasError ? dash : formatExposure(result.baseShutterSeconds)],
            ["Total stops of light lost", hasError ? dash : NUM.format(result.totalStops)],
            ["Filter factor", hasError ? dash : `${SMALL.format(result.filterFactor)}×`],
            ["Optical density", hasError ? dash : NUM.format(result.opticalDensity)],
            [
              "Transmittance",
              hasError ? dash : `${SMALL.format(result.transmittancePercent)}% of the light`,
            ],
            ["Shutter mode", hasError ? dash : result.needsBulb ? "Bulb (over 30 s)" : "Timed shutter"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.watchReciprocity && (
          <p className="mt-4 rounded-md bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Past one second, film needs a reciprocity-failure correction on top of this figure —
            check the manufacturer's chart for your stock. Digital sensors do not, but long
            exposures do raise thermal noise.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How much ND do I need?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nd-target">
              Exposure time I want (seconds)
            </label>
            <input
              id="nd-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Filtration required
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {reverse.error ? dash : `${NUM.format(reverse.stops)} stops`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {reverse.error ? reverse.error : `closest filter: ${reverse.nearestFilter.name}`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Field card at {hasError ? dash : NUM.format(result.totalStops)} stops
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Metered</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">With filter</th>
                <th scope="col" className="py-2 text-right font-semibold">Mode</th>
              </tr>
            </thead>
            <tbody>
              {table.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{dash}</td>
                  <td className="py-2 pr-3 text-right">{dash}</td>
                  <td className="py-2 text-right">{dash}</td>
                </tr>
              ) : (
                table.map((row) => (
                  <tr key={row.baseSeconds} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{formatExposure(row.baseSeconds)}</td>
                    <td className="py-2 pr-3 text-right">{formatExposure(row.filteredSeconds)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.needsBulb ? "bulb" : "timed"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meter and focus before fitting a strong ND — autofocus and metering usually fail behind ten
        stops. Very dense filters can also introduce a colour cast that needs a custom white balance
        or a raw correction.
      </p>
    </main>
  );
}
