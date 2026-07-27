"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CABIN_DIMS_CM,
  CABIN_WEIGHT_KG,
  DEFAULT_FREE_CHECKIN_KG,
  FARE_PRESETS,
  MAX_LINEAR_CM,
  MAX_PIECE_KG,
  PERSONAL_ITEM_KG,
  checkSpiceJetBaggage,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const kg = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_BAGS = [
  { id: 1, kind: "cabin", weightKg: "7", l: "55", w: "35", h: "25" },
  { id: 2, kind: "cabin", weightKg: "6", l: "50", w: "34", h: "22" },
  { id: 3, kind: "checkin", weightKg: "18", l: "70", w: "45", h: "30" },
  { id: 4, kind: "checkin", weightKg: "16", l: "65", w: "40", h: "28" },
];

const DEFAULTS = {
  passengers: "2",
  freeCheckinKgPerPax: String(DEFAULT_FREE_CHECKIN_KG),
  excessRatePerKg: "600",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [freeCheckinKgPerPax, setFreeCheckinKgPerPax] = useState(DEFAULTS.freeCheckinKgPerPax);
  const [excessRatePerKg, setExcessRatePerKg] = useState(DEFAULTS.excessRatePerKg);
  const [bags, setBags] = useState(DEFAULT_BAGS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkSpiceJetBaggage({
        passengers: toNumber(passengers),
        freeCheckinKgPerPax: toNumber(freeCheckinKgPerPax),
        excessRatePerKg: toNumber(excessRatePerKg),
        bags: bags.map((bag) => ({
          id: bag.id,
          kind: bag.kind,
          weightKg: toNumber(bag.weightKg),
          l: toNumber(bag.l),
          w: toNumber(bag.w),
          h: toNumber(bag.h),
        })),
      }),
    [passengers, freeCheckinKgPerPax, excessRatePerKg, bags],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const updateBag = (id, field, value) => {
    setBags((current) =>
      current.map((bag) => (bag.id === id ? { ...bag, [field]: value } : bag)),
    );
  };

  const addBag = (kind) => {
    setBags((current) => {
      const nextId = current.reduce((max, bag) => Math.max(max, bag.id), 0) + 1;
      const template =
        kind === "cabin"
          ? { weightKg: "7", l: "55", w: "35", h: "25" }
          : { weightKg: "15", l: "70", w: "45", h: "30" };
      return [...current, { id: nextId, kind, ...template }];
    });
  };

  const removeBag = (id) => {
    setBags((current) => current.filter((bag) => bag.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "SpiceJet Baggage Allowance Check",
      `${result.passengers} passenger(s) on one booking`,
      `Hand baggage: ${result.cabinCount} piece(s), ${kg(result.cabinTotalKg)} — limit ${result.cabinAllowanceKg} kg and ${result.cabinDims.join(" × ")} cm each, one piece per passenger`,
      `Check-in: ${result.checkinCount} piece(s), ${kg(result.checkinTotalKg)} against a pooled ${kg(result.freeCheckinKg)} free`,
      result.excessKg > 0
        ? `Excess: ${result.excessKg} chargeable kg at ${money(result.excessRatePerKg)}/kg = ${money(result.excessCost)}`
        : `Within allowance, ${kg(result.spareKg)} to spare`,
      result.failingCount > 0
        ? `${result.failingCount} bag(s) fail on weight or size — see the list`
        : "Every bag is within the per-piece weight and size limits",
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
    setPassengers(DEFAULTS.passengers);
    setFreeCheckinKgPerPax(DEFAULTS.freeCheckinKgPerPax);
    setExcessRatePerKg(DEFAULTS.excessRatePerKg);
    setBags(DEFAULT_BAGS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Baggage rules
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          SpiceJet Baggage Allowance Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weigh and measure your bags at home, enter them here, and see what passes the cabin gauge,
          what pools across the booking and what the counter will charge you for.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your booking</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sj-pax">
              Passengers on this PNR
            </label>
            <input
              id="sj-pax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="9"
              step="1"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sj-free">
              Free check-in allowance per passenger (kg)
            </label>
            <input
              id="sj-free"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={freeCheckinKgPerPax}
              onChange={(event) => setFreeCheckinKgPerPax(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {FARE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => setFreeCheckinKgPerPax(String(preset.kg))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label.split(" ")[0]} · {preset.kg} kg
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sj-rate">
              Excess baggage rate quoted (INR per kg)
            </label>
            <input
              id="sj-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10000"
              step="50"
              value={excessRatePerKg}
              onChange={(event) => setExcessRatePerKg(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Excess rates change by route and season, and prepaid excess bought online is cheaper than
              the airport rate. Enter the figure you have been quoted.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your bags</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => addBag("cabin")} className={GHOST_BTN}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Cabin bag
            </button>
            <button type="button" onClick={() => addBag("checkin")} className={GHOST_BTN}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Check-in bag
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {bags.map((bag, index) => {
            const assessed = hasError ? null : result.bags.find((item) => item.id === bag.id);
            return (
              <div
                key={bag.id}
                className={`rounded-lg border p-4 ${
                  assessed && !assessed.ok
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`sj-kind-${bag.id}`}>
                      Bag {index + 1}
                    </label>
                    <select
                      id={`sj-kind-${bag.id}`}
                      className={`mt-1 h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none`}
                      value={bag.kind}
                      onChange={(event) => updateBag(bag.id, "kind", event.target.value)}
                    >
                      <option value="cabin">Hand baggage</option>
                      <option value="checkin">Check-in</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBag(bag.id)}
                    aria-label={`Remove bag ${index + 1}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`sj-wt-${bag.id}`}>
                      Weight (kg)
                    </label>
                    <input
                      id={`sj-wt-${bag.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      value={bag.weightKg}
                      onChange={(event) => updateBag(bag.id, "weightKg", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`sj-l-${bag.id}`}>
                      Length (cm)
                    </label>
                    <input
                      id={`sj-l-${bag.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={bag.l}
                      onChange={(event) => updateBag(bag.id, "l", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`sj-w-${bag.id}`}>
                      Width (cm)
                    </label>
                    <input
                      id={`sj-w-${bag.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={bag.w}
                      onChange={(event) => updateBag(bag.id, "w", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`sj-h-${bag.id}`}>
                      Height (cm)
                    </label>
                    <input
                      id={`sj-h-${bag.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={bag.h}
                      onChange={(event) => updateBag(bag.id, "h", event.target.value)}
                    />
                  </div>
                </div>

                {assessed && (
                  <p
                    className={`mt-3 text-sm ${
                      assessed.ok ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {assessed.ok
                      ? assessed.kind === "cabin"
                        ? `Passes the ${CABIN_DIMS_CM.join(" × ")} cm gauge and the ${result.cabinAllowanceKg} kg limit`
                        : `Within ${MAX_PIECE_KG} kg and ${MAX_LINEAR_CM} cm${assessed.linearCm ? ` (${assessed.linearCm} cm total)` : ""}`
                      : assessed.problems.join("; ")}
                  </p>
                )}
              </div>
            );
          })}
          {bags.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              No bags yet — add a cabin or check-in bag above.
            </p>
          )}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Excess baggage to pay
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--primary)]" : result.excessKg > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {hasError ? dash : money(result.excessCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : result.excessKg > 0
                  ? `${result.excessKg} chargeable kg at ${money(result.excessRatePerKg)} per kg`
                  : `Inside the allowance with ${kg(result.spareKg)} to spare`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the baggage allowance check"
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
            [
              "Hand baggage",
              hasError
                ? dash
                : `${result.cabinCount} piece(s), ${kg(result.cabinTotalKg)} — ${result.cabinPiecesAllowed} allowed`,
            ],
            [
              "Hand baggage limit each",
              hasError
                ? dash
                : `${result.cabinAllowanceKg} kg, ${result.cabinDims.join(" × ")} cm, plus a ${result.personalItemKg} kg personal item`,
            ],
            ["Check-in pieces", hasError ? dash : `${result.checkinCount}, totalling ${kg(result.checkinTotalKg)}`],
            [
              "Free check-in allowance (pooled)",
              hasError ? dash : `${kg(result.freeCheckinKg)} = ${result.freeCheckinKgPerPax} kg × ${result.passengers}`,
            ],
            ["Chargeable excess", hasError ? dash : `${result.excessKg} kg`],
            ["Everything you are carrying", hasError ? dash : kg(result.totalKg)],
            [
              "Bags failing weight or size",
              hasError ? dash : String(result.failingCount + result.cabinPiecesOver),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.allClear && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Everything clears the limits as entered. Weigh the bags after you have packed the last
            thing in — a home scale and the airport scale rarely agree to the gram.
          </p>
        )}
        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The limits used here</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <span className="font-semibold text-[var(--foreground)]">Hand baggage:</span>{" "}
            one piece per passenger, up to {CABIN_WEIGHT_KG} kg and{" "}
            {CABIN_DIMS_CM.join(" × ")} cm — the cabin baggage dimension standard applied by Indian
            carriers. It does not pool between passengers.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Personal article:</span>{" "}
            one small handbag or laptop bag up to {PERSONAL_ITEM_KG} kg in addition.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Check-in:</span>{" "}
            {DEFAULT_FREE_CHECKIN_KG} kg per passenger on a standard domestic fare, pooled across
            everyone on the same booking.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Per piece:</span> no single hold
            bag over {MAX_PIECE_KG} kg or {MAX_LINEAR_CM} cm in total dimensions — heavier or larger
            pieces have to be split or sent as cargo.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are typical published allowances for domestic travel, shown so you can pack against
        them; they are not a fare quote. Allowances differ by fare family, route, international
        sector and promotional booking, and excess rates change. Confirm the allowance printed on your
        own booking and on spicejet.com before you travel.
      </p>
    </main>
  );
}
