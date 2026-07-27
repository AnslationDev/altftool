"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { LPCD_PRESETS, computeTankSize } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const litres = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} L`;

const DEFAULTS = {
  residents: "4",
  lpcd: "135",
  garden: "100",
  carWash: "60",
  storageDays: "2",
  overheadShare: "50",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DASH = "—";

export default function ToolHome() {
  const [residents, setResidents] = useState(DEFAULTS.residents);
  const [lpcd, setLpcd] = useState(DEFAULTS.lpcd);
  const [garden, setGarden] = useState(DEFAULTS.garden);
  const [carWash, setCarWash] = useState(DEFAULTS.carWash);
  const [storageDays, setStorageDays] = useState(DEFAULTS.storageDays);
  const [overheadShare, setOverheadShare] = useState(DEFAULTS.overheadShare);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTankSize({
        residents: toNumber(residents),
        lpcd: toNumber(lpcd),
        gardenLitresPerDay: toNumber(garden),
        carWashLitresPerDay: toNumber(carWash),
        storageDays: toNumber(storageDays),
        overheadSharePct: toNumber(overheadShare),
      }),
    [residents, lpcd, garden, carWash, storageDays, overheadShare],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Overhead Water Tank Size",
      `Residents: ${residents} at ${lpcd} litres per person per day`,
      `Daily demand: ${litres(result.dailyDemand)}`,
      `Total storage (${result.storageDays} day(s)): ${litres(result.totalStorage)}`,
      `Overhead tank required: ${litres(result.overheadLitres)}`,
      `Buy the next standard tank: ${
        result.recommendedOverheadTank ? litres(result.recommendedOverheadTank) : "custom RCC tank"
      }`,
      `Underground sump required: ${litres(result.sumpLitres)}`,
      `Overhead tank volume: ${NUM2.format(result.overheadCubicMetres)} m3 / ${NUM2.format(
        result.overheadCubicFeet,
      )} cu ft`,
    ].join("\n");
  }, [hasError, result, residents, lpcd]);

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
    setResidents(DEFAULTS.residents);
    setLpcd(DEFAULTS.lpcd);
    setGarden(DEFAULTS.garden);
    setCarWash(DEFAULTS.carWash);
    setStorageDays(DEFAULTS.storageDays);
    setOverheadShare(DEFAULTS.overheadShare);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Daily household demand", DASH],
        ["Demand per person", DASH],
        ["Total on-site storage", DASH],
        ["Overhead tank required", DASH],
        ["Underground sump required", DASH],
        ["Overhead volume", DASH],
        ["Overhead tank alone lasts", DASH],
      ]
    : [
        ["Daily household demand", litres(result.dailyDemand)],
        ["Demand per person", `${NUM.format(result.perPersonDemand)} L/day`],
        ["Total on-site storage", litres(result.totalStorage)],
        [
          "Overhead tank required",
          `${litres(result.overheadLitres)}${
            result.recommendedOverheadTank
              ? ` → buy ${NUM.format(result.recommendedOverheadTank)} L`
              : ""
          }`,
        ],
        [
          "Underground sump required",
          result.sumpLitres > 0
            ? `${litres(result.sumpLitres)}${
                result.recommendedSumpTank ? ` → buy ${NUM.format(result.recommendedSumpTank)} L` : ""
              }`
            : "Not needed",
        ],
        [
          "Overhead volume",
          `${NUM2.format(result.overheadCubicMetres)} m³ · ${NUM2.format(result.overheadCubicFeet)} cu ft`,
        ],
        ["Overhead tank alone lasts", `${NUM2.format(result.overheadHoursOfSupply)} hours`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Water storage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Overhead Water Tank Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many litres your overhead tank and sump need to hold, using the IS 1172
          per-capita demand figures and the days of storage you want to keep in hand.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-residents">
              Number of residents
            </label>
            <input
              id="tank-residents"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={residents}
              onChange={(event) => setResidents(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-lpcd">
              Litres per person per day
            </label>
            <input
              id="tank-lpcd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={lpcd}
              onChange={(event) => setLpcd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-garden">
              Garden / plants per day (L)
            </label>
            <input
              id="tank-garden"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={garden}
              onChange={(event) => setGarden(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-car">
              Vehicle washing per day (L)
            </label>
            <input
              id="tank-car"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={carWash}
              onChange={(event) => setCarWash(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-days">
              Days of storage to keep
            </label>
            <input
              id="tank-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="14"
              step="0.5"
              value={storageDays}
              onChange={(event) => setStorageDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tank-share">
              Share held overhead (%)
            </label>
            <input
              id="tank-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="100"
              step="5"
              value={overheadShare}
              onChange={(event) => setOverheadShare(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Per-capita demand presets
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LPCD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.note}
                onClick={() => setLpcd(String(preset.lpcd))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.lpcd} L · {preset.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError && (
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
              Overhead tank to install
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : result.recommendedOverheadTank
                  ? `${NUM.format(result.recommendedOverheadTank)} L`
                  : "Custom RCC"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a size."
                : `Calculated requirement ${litres(result.overheadLitres)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy tank sizing result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Roof loading, local water bye-laws and the plumbing consultant&apos;s
        design govern the tank you can actually install — a full 1,000 L tank plus its base adds
        roughly a tonne to the slab.
      </p>
    </main>
  );
}
