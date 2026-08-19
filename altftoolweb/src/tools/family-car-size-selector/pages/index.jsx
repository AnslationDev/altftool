"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";

import {
  INDIA_SMALL_CAR_LENGTH_M,
  LUGGAGE_ITEMS,
  PACKING_EFFICIENCY,
  STANDARD_BAY_LENGTH_M,
  selectFamilyCar,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const litres = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} L`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_LUGGAGE = { "medium-case": 2, pushchair: 1 };

const DEFAULTS = {
  adults: "2",
  children: "2",
  childSeats: "1",
  maxLengthM: String(STANDARD_BAY_LENGTH_M),
  packingEfficiency: String(PACKING_EFFICIENCY),
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [childSeats, setChildSeats] = useState(DEFAULTS.childSeats);
  const [maxLengthM, setMaxLengthM] = useState(DEFAULTS.maxLengthM);
  const [packingEfficiency, setPackingEfficiency] = useState(DEFAULTS.packingEfficiency);
  const [luggage, setLuggage] = useState(DEFAULT_LUGGAGE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectFamilyCar({
        adults: toNumber(adults),
        children: toNumber(children),
        childSeats: toNumber(childSeats),
        luggage,
        maxLengthM: toNumber(maxLengthM),
        packingEfficiency: toNumber(packingEfficiency),
      }),
    [adults, children, childSeats, luggage, maxLengthM, packingEfficiency],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const setLuggageCount = (id, value) => {
    setLuggage((current) => ({ ...current, [id]: Math.max(0, Math.min(20, value)) }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Family Car Size Selector",
      `People: ${result.adults} adult(s) + ${result.children} child(ren) = ${result.people}`,
      `Child seats in one row: ${result.childSeats}`,
      `Luggage: ${litres(result.luggageLitres)} packed, needing ${litres(result.bootNeeded)} of boot at ${result.packingEfficiency} packing efficiency`,
      `Longest car that fits: ${result.maxLengthM} m`,
      result.best
        ? `Smallest body type that works: ${result.best.label} — ${result.best.seats} seats, ${litres(result.best.usableBoot)} boot, ${result.best.lengthM} m`
        : "No body type on the list clears every requirement.",
      result.matches.length > 0
        ? `Also adequate: ${result.matches.slice(1).map((m) => m.label).join(", ") || "none"}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setChildSeats(DEFAULTS.childSeats);
    setMaxLengthM(DEFAULTS.maxLengthM);
    setPackingEfficiency(DEFAULTS.packingEfficiency);
    setLuggage(DEFAULT_LUGGAGE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Used vehicles
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Family Car Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The smallest body type that actually carries your family and its luggage — because a car
          bigger than you need costs more to buy, fuel, park and insure for as long as you own it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Who travels</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-adults">
              Adults
            </label>
            <input
              id="fc-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="9"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-children">
              Children
            </label>
            <input
              id="fc-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="9"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-seats">
              Child seats side by side in one row
            </label>
            <input
              id="fc-seats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="9"
              step="1"
              value={childSeats}
              onChange={(event) => setChildSeats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-length">
              Longest car your parking takes (m)
            </label>
            <input
              id="fc-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="2.5"
              max="8"
              step="0.1"
              value={maxLengthM}
              onChange={(event) => setMaxLengthM(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                [String(INDIA_SMALL_CAR_LENGTH_M), "4.0 m tax bracket"],
                [String(STANDARD_BAY_LENGTH_M), "4.8 m standard bay"],
                ["5.5", "5.5 m open drive"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMaxLengthM(value)}
                  aria-pressed={maxLengthM === value}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fc-eff">
              Packing efficiency (0.2 to 1)
            </label>
            <input
              id="fc-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.2"
              max="1"
              step="0.05"
              value={packingEfficiency}
              onChange={(event) => setPackingEfficiency(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Published boot volumes are measured with small blocks. Rigid suitcases never fill that
              space — 0.8 is a realistic planning figure.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What goes in the boot</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {LUGGAGE_ITEMS.map((item) => {
            const count = Number(luggage[item.id]) || 0;
            return (
              <div
                key={item.id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <label className="flex-1" htmlFor={`fc-lug-${item.id}`}>
                  {item.label}
                  <span className="ml-1 text-xs text-[var(--muted-foreground)]">{item.litres} L</span>
                </label>
                <input
                  id={`fc-lug-${item.id}`}
                  className="h-11 w-16 shrink-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-center text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="20"
                  step="1"
                  value={count}
                  onChange={(event) => setLuggageCount(item.id, Number(event.target.value))}
                />
              </div>
            );
          })}
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

      <section aria-live="polite" role="status" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Smallest body type that works
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : result.best ? result.best.label : "Nothing fits"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : result.best
                  ? `${result.best.seats} seats · ${litres(result.best.usableBoot)} boot · ${result.best.lengthM} m long`
                  : "Raise the length limit, cut the luggage, or plan on a roof box"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the car size recommendation"
              className={GHOST_BTN}
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
          {[
            ["People to seat", hasError ? dash : String(result.people)],
            [
              "Child seats in one row",
              hasError ? dash : `${result.childSeats}${result.needThreeAcross ? " — three across" : ""}`,
            ],
            ["Luggage packed", hasError ? dash : litres(result.luggageLitres)],
            [
              "Boot volume needed",
              hasError ? dash : `${litres(result.bootNeeded)} at ${NUM2.format(result.packingEfficiency)} efficiency`,
            ],
            ["Length limit", hasError ? dash : `${result.maxLengthM} m`],
            [
              "Spare boot in the pick",
              hasError || !result.best ? dash : litres(result.best.spareBoot),
            ],
            [
              "Body types that clear everything",
              hasError ? dash : String(result.matches.length),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.best && (
          <div className="mt-5 space-y-2 text-sm">
            <p>
              <span className="font-semibold text-[var(--success)]">Good: </span>
              <span className="text-[var(--muted-foreground)]">{result.best.pros}</span>
            </p>
            <p>
              <span className="font-semibold text-[var(--danger)]">Watch: </span>
              <span className="text-[var(--muted-foreground)]">{result.best.cons}</span>
            </p>
          </div>
        )}

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Every body type against your needs</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Body type</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Seats</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Usable boot</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Length</th>
                  <th scope="col" className="py-2 font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {result.candidates.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{row.seats}</td>
                    <td className="py-2 pr-3 text-right">
                      {litres(row.usableBoot)}
                      {row.usingThirdRow && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          third row up
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.lengthM} m</td>
                    <td className="py-2">
                      {row.fits ? (
                        <span className="font-semibold text-[var(--success)]">Works</span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">{row.reasons.join("; ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Boot volumes and lengths here are typical figures for each body type, not a specific model —
        use them to narrow the shortlist, then check the actual car. Before you buy, take your own
        child seats and your largest suitcase to the dealer: boot apertures, parcel-shelf height and
        the shape of the seat bases decide far more than a litre figure does.
      </p>
    </main>
  );
}
