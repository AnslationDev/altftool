"use client";

import { useMemo, useState } from "react";
import { Bean, Check, Copy, RotateCcw } from "lucide-react";

import {
  CONSISTENCIES,
  DALS,
  HIGHER_TARGET_G_PER_KG,
  RDA_G_PER_KG,
  compareDals,
  computeDalServing,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MIX_IDS = ["toor", "chana", "moong-dhuli", "masoor", "urad"];

const DEFAULTS = {
  dalId: "toor",
  mixed: false,
  katoris: "2",
  consistency: "regular",
  rawPerKatori: "25",
  oil: "10",
  weight: "70",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [dalId, setDalId] = useState(DEFAULTS.dalId);
  const [mixed, setMixed] = useState(DEFAULTS.mixed);
  const [katoris, setKatoris] = useState(DEFAULTS.katoris);
  const [consistency, setConsistency] = useState(DEFAULTS.consistency);
  const [rawPerKatori, setRawPerKatori] = useState(DEFAULTS.rawPerKatori);
  const [oil, setOil] = useState(DEFAULTS.oil);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDalServing({
        dalId,
        mixIds: mixed ? MIX_IDS : undefined,
        katoris: toNumber(katoris),
        rawGramsPerKatori: toNumber(rawPerKatori),
        tadkaOilG: toNumber(oil),
        bodyWeightKg: toNumber(weight),
      }),
    [dalId, mixed, katoris, rawPerKatori, oil, weight],
  );

  const comparison = useMemo(() => compareDals(toNumber(rawPerKatori)), [rawPerKatori]);

  const hasError = Boolean(result.error);

  const applyConsistency = (id) => {
    const found = CONSISTENCIES.find((item) => item.id === id);
    setConsistency(id);
    if (found) setRawPerKatori(String(found.rawGramsPerKatori));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Dal protein",
      `${NUM1.format(result.katoris)} katori of ${result.dal.name}`,
      `Raw dal used: ${NUM0.format(result.rawG)} g (${NUM0.format(result.rawGramsPerKatori)} g per katori)`,
      `Protein: ${NUM1.format(result.proteinG)} g total, ${NUM1.format(result.proteinPerKatoriG)} g per katori`,
      `Energy: ${NUM0.format(result.energyKcal)} kcal including ${NUM0.format(result.tadkaOilG)} g tadka oil`,
      `Fibre: ${NUM1.format(result.fibreG)} g`,
      `Share of a ${NUM0.format(result.rdaG)} g daily protein target: ${NUM0.format(result.rdaPercent)}%`,
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
    setDalId(DEFAULTS.dalId);
    setMixed(DEFAULTS.mixed);
    setKatoris(DEFAULTS.katoris);
    setConsistency(DEFAULTS.consistency);
    setRawPerKatori(DEFAULTS.rawPerKatori);
    setOil(DEFAULTS.oil);
    setWeight(DEFAULTS.weight);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bean className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Dal Protein Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A katori of thin dal and a katori of thick dal are not the same food. Set how much raw dal
          actually goes into a serving and see the protein, calories and fibre you really get.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dp-dal">
              Which dal?
            </label>
            <select
              id="dp-dal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dalId}
              disabled={mixed}
              onChange={(event) => setDalId(event.target.value)}
            >
              {DALS.map((dal) => (
                <option key={dal.id} value={dal.id}>
                  {dal.name} — {dal.proteinG} g protein / 100 g raw
                </option>
              ))}
            </select>
            <label
              className="mt-3 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
              htmlFor="dp-mixed"
            >
              <input
                id="dp-mixed"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={mixed}
                onChange={(event) => setMixed(event.target.checked)}
              />
              Mixed panchmel dal (equal parts toor, chana, moong, masoor and urad)
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-katoris">
              Katoris eaten
            </label>
            <input
              id="dp-katoris"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="12"
              step="0.25"
              value={katoris}
              onChange={(event) => setKatoris(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-raw">
              Raw dal per katori (g)
            </label>
            <input
              id="dp-raw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="120"
              step="1"
              value={rawPerKatori}
              onChange={(event) => {
                setConsistency("custom");
                setRawPerKatori(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-oil">
              Tadka oil or ghee in the pot (g)
            </label>
            <input
              id="dp-oil"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={oil}
              onChange={(event) => setOil(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-weight">
              Your body weight (kg)
            </label>
            <input
              id="dp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>How thick is the dal?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONSISTENCIES.map((item) => {
              const active = consistency === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyConsistency(item.id)}
                  className={`${CHIP_BTN} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label} ({item.rawGramsPerKatori} g)
                </button>
              );
            })}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Protein in this serving
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.proteinG)} g`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the protein."
                : `${NUM1.format(result.proteinPerKatoriG)} g per katori from ${NUM0.format(result.rawG)} g of raw ${result.dal.name.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the dal protein result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Energy", hasError ? DASH : `${NUM0.format(result.energyKcal)} kcal`],
            [
              "Energy per katori",
              hasError ? DASH : `${NUM0.format(result.energyPerKatoriKcal)} kcal`,
            ],
            ["Carbohydrate", hasError ? DASH : `${NUM1.format(result.carbG)} g`],
            ["Fibre", hasError ? DASH : `${NUM1.format(result.fibreG)} g`],
            ["Fat (dal plus tadka)", hasError ? DASH : `${NUM1.format(result.fatG)} g`],
            [
              "Protein per 100 kcal",
              hasError ? DASH : `${NUM1.format(result.proteinPer100Kcal)} g`,
            ],
            [
              `Daily target at ${RDA_G_PER_KG} g/kg`,
              hasError ? DASH : `${NUM0.format(result.rdaG)} g`,
            ],
            [
              "Share of that target",
              hasError ? DASH : `${NUM0.format(result.rdaPercent)}%`,
            ],
            [
              `Higher target at ${HIGHER_TARGET_G_PER_KG} g/kg`,
              hasError
                ? DASH
                : `${NUM0.format(result.higherTargetG)} g (${NUM0.format(result.higherTargetPercent)}% covered)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`This dal covers ${NUM0.format(result.rdaPercent)} percent of the daily protein target`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.rdaPercent))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {NUM1.format(result.rdaRemainingG)} g of protein still to find from the rest of the day.
              Eating dal with rice or roti helps: pulses are low in methionine and cereals are low in
              lysine, so the pair together supplies a better amino acid balance than either alone.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Protein per katori at {hasError ? DASH : NUM0.format(result.rawGramsPerKatori)} g raw dal
        </h2>
        <table className="mt-3 w-full min-w-[340px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Dal
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                Protein
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                kcal
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr
                key={row.dal.id}
                className={`border-b border-[var(--border)] last:border-0 ${
                  !mixed && row.dal.id === dalId ? "bg-[var(--muted)]" : ""
                }`}
              >
                <td className="py-2 pr-3 font-semibold">{row.dal.name}</td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {NUM1.format(row.proteinPerKatoriG)} g
                </td>
                <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                  {NUM0.format(row.energyPerKatoriKcal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Composition values are typical published figures for Indian pulses per 100 g raw and vary by
        variety and season. The 0.83 g/kg figure is the recommendation for a healthy sedentary adult;
        pregnancy, illness, kidney disease and hard training all change the target. Informational
        only — take individual advice from a doctor or registered dietitian.
      </p>
    </main>
  );
}
