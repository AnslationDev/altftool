"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wheat } from "lucide-react";

import {
  ATTA_PER_100G,
  KATORI_COOKED_RICE_G,
  RICE_PER_100G,
  riceToRoti,
  rotiToRice,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

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

const DEFAULTS = {
  direction: "rotiToRice",
  rotis: "2",
  atta: "30",
  ghee: "0",
  katoris: "1",
  katoriSize: String(KATORI_COOKED_RICE_G),
  matchOn: "calories",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [rotis, setRotis] = useState(DEFAULTS.rotis);
  const [atta, setAtta] = useState(DEFAULTS.atta);
  const [ghee, setGhee] = useState(DEFAULTS.ghee);
  const [katoris, setKatoris] = useState(DEFAULTS.katoris);
  const [katoriSize, setKatoriSize] = useState(DEFAULTS.katoriSize);
  const [matchOn, setMatchOn] = useState(DEFAULTS.matchOn);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const common = {
      attaPerRotiG: toNumber(atta),
      gheePerRotiG: toNumber(ghee),
      gramsPerKatori: toNumber(katoriSize),
      matchOn,
    };
    return direction === "rotiToRice"
      ? rotiToRice({ rotis: toNumber(rotis), ...common })
      : riceToRoti({ katoris: toNumber(katoris), ...common });
  }, [direction, rotis, atta, ghee, katoris, katoriSize, matchOn]);

  const hasError = Boolean(result.error);
  const roti = hasError ? null : result.roti;
  const rice = hasError ? null : result.rice;

  const summary = useMemo(() => {
    if (hasError) return "";
    const head =
      direction === "rotiToRice"
        ? `${NUM1.format(roti.rotis)} roti (${NUM0.format(toNumber(atta))} g atta each) = ${NUM0.format(rice.cookedG)} g cooked rice (${NUM2.format(rice.katoris)} katori)`
        : `${NUM2.format(rice.katoris)} katori rice (${NUM0.format(rice.cookedG)} g cooked) = ${NUM1.format(roti.rotis)} roti of ${NUM0.format(toNumber(atta))} g atta`;
    return [
      "Roti vs rice swap",
      head,
      `Matched on ${matchOn === "calories" ? "calories" : "carbohydrate"}`,
      `Roti side: ${NUM0.format(roti.energyKcal)} kcal, ${NUM1.format(roti.proteinG)} g protein, ${NUM1.format(roti.carbG)} g carb, ${NUM1.format(roti.fibreG)} g fibre`,
      `Rice side: ${NUM0.format(rice.energyKcal)} kcal, ${NUM1.format(rice.proteinG)} g protein, ${NUM1.format(rice.carbG)} g carb, ${NUM1.format(rice.fibreG)} g fibre`,
      `Roti gives ${NUM1.format(result.proteinDifferenceG)} g more protein and ${NUM1.format(result.fibreDifferenceG)} g more fibre`,
    ].join("\n");
  }, [hasError, direction, roti, rice, atta, matchOn, result]);

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
    setDirection(DEFAULTS.direction);
    setRotis(DEFAULTS.rotis);
    setAtta(DEFAULTS.atta);
    setGhee(DEFAULTS.ghee);
    setKatoris(DEFAULTS.katoris);
    setKatoriSize(DEFAULTS.katoriSize);
    setMatchOn(DEFAULTS.matchOn);
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : direction === "rotiToRice"
      ? `${NUM0.format(rice.cookedG)} g rice`
      : `${NUM1.format(result.rotisNeeded)} rotis`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wheat className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Roti vs Rice Swap Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the rice portion that matches your rotis on calories or carbohydrate — and see
          exactly what the swap costs you in protein and fibre. Both sides are calculated from the
          dry weight, which is the only part you can actually measure.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>Which way round?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["rotiToRice", "Roti → rice"],
              ["riceToRoti", "Rice → roti"],
            ].map(([id, label]) => {
              const active = direction === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDirection(id)}
                  className={`${CHIP_BTN} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {direction === "rotiToRice" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rr-rotis">
                Rotis on your plate
              </label>
              <input
                id="rr-rotis"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                max="30"
                step="0.5"
                value={rotis}
                onChange={(event) => setRotis(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="rr-katoris">
                Katoris of cooked rice
              </label>
              <input
                id="rr-katoris"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.25"
                max="20"
                step="0.25"
                value={katoris}
                onChange={(event) => setKatoris(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-atta">
              Atta per roti (g)
            </label>
            <input
              id="rr-atta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200"
              step="5"
              value={atta}
              onChange={(event) => setAtta(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-ghee">
              Ghee per roti (g)
            </label>
            <input
              id="rr-ghee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="1"
              value={ghee}
              onChange={(event) => setGhee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-katori-size">
              Cooked rice per katori (g)
            </label>
            <input
              id="rr-katori-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="500"
              step="10"
              value={katoriSize}
              onChange={(event) => setKatoriSize(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Match the swap on</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["calories", "Calories"],
              ["carbs", "Carbohydrate"],
            ].map(([id, label]) => {
              const active = matchOn === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMatchOn(id)}
                  className={`${CHIP_BTN} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Small roti", "20"],
            ["Standard roti", "30"],
            ["Large roti", "45"],
          ].map(([label, grams]) => (
            <button
              key={label}
              type="button"
              onClick={() => setAtta(grams)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label} ({grams} g)
            </button>
          ))}
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
              {direction === "rotiToRice" ? "Equivalent cooked rice" : "Equivalent rotis"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the swap."
                : direction === "rotiToRice"
                  ? `${NUM2.format(rice.katoris)} katori · ${NUM0.format(rice.rawG)} g raw rice`
                  : `${NUM0.format(roti.attaG)} g atta in total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the roti and rice swap result"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Per serving
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Roti side
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Rice side
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Energy",
                  hasError ? DASH : `${NUM0.format(roti.energyKcal)} kcal`,
                  hasError ? DASH : `${NUM0.format(rice.energyKcal)} kcal`,
                ],
                [
                  "Protein",
                  hasError ? DASH : `${NUM1.format(roti.proteinG)} g`,
                  hasError ? DASH : `${NUM1.format(rice.proteinG)} g`,
                ],
                [
                  "Carbohydrate",
                  hasError ? DASH : `${NUM1.format(roti.carbG)} g`,
                  hasError ? DASH : `${NUM1.format(rice.carbG)} g`,
                ],
                [
                  "Fat",
                  hasError ? DASH : `${NUM1.format(roti.fatG)} g`,
                  hasError ? DASH : `${NUM1.format(rice.fatG)} g`,
                ],
                [
                  "Fibre",
                  hasError ? DASH : `${NUM1.format(roti.fibreG)} g`,
                  hasError ? DASH : `${NUM1.format(rice.fibreG)} g`,
                ],
                [
                  "Dry weight used",
                  hasError ? DASH : `${NUM0.format(roti.attaG)} g atta`,
                  hasError ? DASH : `${NUM0.format(rice.rawG)} g raw rice`,
                ],
              ].map(([label, left, right]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{left}</td>
                  <td className="py-2 text-right font-semibold">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            At the same {matchOn === "calories" ? "calories" : "carbohydrate"}, the roti side gives{" "}
            <span className="font-semibold text-[var(--success)]">
              {NUM1.format(result.proteinDifferenceG)} g more protein
            </span>{" "}
            and{" "}
            <span className="font-semibold text-[var(--success)]">
              {NUM1.format(result.fibreDifferenceG)} g more fibre
            </span>
            . That fibre gap is the main nutritional difference: whole wheat atta carries about{" "}
            {NUM1.format(ATTA_PER_100G.fibreG)} g of fibre per 100 g against{" "}
            {NUM1.format(RICE_PER_100G.fibreG)} g in milled white rice.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Values are typical figures for Indian staples from national food composition tables, per 100 g
        raw. Actual rotis and rice vary with variety, milling, dough hydration and how much oil is
        used, so use this for planning rather than as a measurement. Informational only — for
        diabetes, kidney disease or a medically supervised diet, follow your dietitian's plan.
      </p>
    </main>
  );
}
