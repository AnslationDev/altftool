"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { CONDITIONS, COMFORTABLE_PAIR_LIMIT, planTripShoes, SHOES } from "../lib";

const DEFAULT_CONDITIONS = ["walking", "formal", "wet"];
const DEFAULT_BAG_L = "12";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const CONDITION_LABEL = new Map(CONDITIONS.map((condition) => [condition.id, condition.label]));

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_CONDITIONS);
  const [allowed, setAllowed] = useState(SHOES.map((shoe) => shoe.id));
  const [bagCapacityL, setBagCapacityL] = useState(DEFAULT_BAG_L);
  const [wearHeaviest, setWearHeaviest] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleCondition = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleShoe = (id) => {
    setAllowed((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const result = useMemo(
    () =>
      planTripShoes({
        conditions: selected,
        allowedShoes: allowed,
        wearHeaviest,
        bagCapacityL: toNumber(bagCapacityL),
      }),
    [selected, allowed, wearHeaviest, bagCapacityL],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Shoe plan — ${result.pairs} pair(s), ${NUM.format(result.totalKg)} kg in total`,
      `Packed: ${NUM.format(result.packedKg)} kg, ${NUM.format(result.packedLitres)} L`,
      "",
    ];
    for (const shoe of result.shoes) {
      const worn = result.wornPair && shoe.id === result.wornPair.id ? " (wear on the journey)" : "";
      lines.push(
        `  [ ] ${shoe.name}${worn} — covers ${shoe.covers.map((id) => CONDITION_LABEL.get(id)).join(", ")}`,
      );
    }
    return lines.join("\n").trim();
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
    setSelected(DEFAULT_CONDITIONS);
    setAllowed(SHOES.map((shoe) => shoe.id));
    setBagCapacityL(DEFAULT_BAG_L);
    setWearHeaviest(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Shoe Selection Planner for Trips
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what your trip demands and this searches every combination for the fewest pairs that
          cover all of it — and the lightest set among those.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What does the trip demand?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CONDITIONS.map((condition) => {
              const checked = selected.includes(condition.id);
              return (
                <label
                  key={condition.id}
                  htmlFor={`condition-${condition.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`condition-${condition.id}`}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleCondition(condition.id)}
                  />
                  {condition.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bag-capacity">
              Space you have for shoes (litres)
            </label>
            <input
              id="bag-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={bagCapacityL}
              onChange={(event) => {
                setBagCapacityL(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="wear-heaviest"
              className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                wearHeaviest
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--background)]"
              }`}
            >
              <input
                id="wear-heaviest"
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                checked={wearHeaviest}
                onChange={(event) => {
                  setWearHeaviest(event.target.checked);
                  setCopied(false);
                }}
              />
              Wear the heaviest pair on the journey
            </label>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Shoes available to you
          </legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Untick anything you do not own so the plan only picks from what is in your cupboard.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SHOES.map((shoe) => {
              const checked = allowed.includes(shoe.id);
              return (
                <label
                  key={shoe.id}
                  htmlFor={`shoe-${shoe.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`shoe-${shoe.id}`}
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleShoe(shoe.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{shoe.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {shoe.grams} g · {shoe.litres} L
                    </span>
                  </span>
                </label>
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
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Pairs you need
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.pairs}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Pick at least one condition above."
                : `covering all ${result.conditionsCovered.length} conditions you ticked`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the shoe plan to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total weight of the set", hasError ? DASH : `${NUM.format(result.totalKg)} kg`],
            ["Weight in the bag", hasError ? DASH : `${NUM.format(result.packedKg)} kg`],
            [
              "Saved by wearing a pair",
              hasError ? DASH : `${NUM.format(result.savedByWearingKg)} kg`,
            ],
            [
              "Space in the bag",
              hasError
                ? DASH
                : `${NUM.format(result.packedLitres)} L of ${NUM.format(result.bagCapacityL)} L`,
            ],
            [
              "Against that space",
              hasError
                ? DASH
                : result.fitsBag
                  ? `${NUM.format(result.spareLitres)} L to spare`
                  : `${NUM.format(Math.abs(result.spareLitres))} L over`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.overPairLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            More than {COMFORTABLE_PAIR_LIMIT} pairs means footwear is dominating the bag. Dropping one
            condition — usually the trail or the gym — is what removes a pair.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Take these</h2>
            <ul className="mt-3 divide-y divide-[var(--border)]">
              {result.shoes.map((shoe) => (
                <li key={shoe.id} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-sm font-semibold">{shoe.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {shoe.grams} g · {shoe.litres} L
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Covers: {shoe.covers.map((id) => CONDITION_LABEL.get(id)).join(", ")}
                  </p>
                  {result.wornPair && shoe.id === result.wornPair.id && (
                    <p className="mt-1 text-xs font-semibold text-[var(--primary)]">
                      Wear this pair on the journey
                    </p>
                  )}
                  {shoe.note && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{shoe.note}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights and volumes are typical adult figures for one pair, with shoes nested sole to sole and
        stuffed with socks. Your own pairs will differ, and comfort over a long walking day matters
        more than the lightest answer here.
      </p>
    </main>
  );
}
