"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Umbrella } from "lucide-react";

import { buildBeachPackingList, LIQUID_BAG_MAX_ML, LIQUID_CONTAINER_MAX_ML } from "../lib";

const DEFAULTS = {
  days: "7",
  travellers: "2",
  laundryEveryDays: "0",
  highTempC: "32",
  beachHoursPerDay: "4",
  swimsPerDay: "2",
  bagPlan: "domestic",
  resortTowels: false,
  rockyShore: false,
  snorkelling: false,
  boatTrips: false,
  mosquitoes: true,
  international: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const TOGGLES = [
  ["resortTowels", "Hotel supplies beach towels"],
  ["rockyShore", "Rocky, coral or pebble shore"],
  ["snorkelling", "Snorkelling planned"],
  ["boatTrips", "Boat or ferry trips"],
  ["mosquitoes", "Mosquitoes at dusk"],
  ["international", "International trip (plug adapter)"],
];

const BAG_PLANS = [
  ["cabin", "Cabin bag only (7 kg)"],
  ["domestic", "Checked bag, domestic (15 kg)"],
  ["international", "Checked bag, international (23 kg)"],
];

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ticked, setTicked] = useState({});
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildBeachPackingList({
        days: toNumber(form.days),
        travellers: toNumber(form.travellers),
        laundryEveryDays: toNumber(form.laundryEveryDays),
        highTempC: toNumber(form.highTempC),
        beachHoursPerDay: toNumber(form.beachHoursPerDay),
        swimsPerDay: toNumber(form.swimsPerDay),
        resortTowels: form.resortTowels,
        rockyShore: form.rockyShore,
        snorkelling: form.snorkelling,
        boatTrips: form.boatTrips,
        mosquitoes: form.mosquitoes,
        international: form.international,
        bagPlan: form.bagPlan,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const tickedCount = useMemo(() => {
    if (hasError) return 0;
    let count = 0;
    for (const group of result.groups) {
      for (const item of group.items) if (ticked[item.id]) count += 1;
    }
    return count;
  }, [hasError, result, ticked]);

  const lineCount = hasError
    ? 0
    : result.groups.reduce((total, group) => total + group.items.length, 0);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Beach packing list — ${result.days} days, ${result.travellers} traveller(s)`,
      `${result.totalItems} items, about ${NUM.format(result.totalKg)} kg`,
      `Sunscreen: ${result.sunscreenMl} ml (${result.sunscreenBottles} x ${result.sunscreenBottleMl} ml)`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.name.toUpperCase());
      for (const item of group.items) {
        lines.push(`  [ ] ${item.qty} x ${item.name}${item.unit ? ` (${item.unit})` : ""}`);
      }
      lines.push("");
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
    const hasTicks = Object.values(ticked).some(Boolean);
    const hasChanges = JSON.stringify(form) !== JSON.stringify(DEFAULTS);
    if (
      (hasTicks || hasChanges) &&
      !window.confirm("Reset the form and clear every ticked item? This cannot be undone.")
    ) {
      return;
    }
    setForm(DEFAULTS);
    setTicked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Umbrella className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Beach Holiday Packing List Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Quantities come from your trip length, laundry access, heat and hours in the sun — including
          how much sunscreen 2 mg/cm² of coverage actually needs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="days">
              Trip length (days)
            </label>
            <input
              id="days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              value={form.days}
              onChange={(event) => setField("days", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="travellers">
              Travellers
            </label>
            <input
              id="travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              value={form.travellers}
              onChange={(event) => setField("travellers", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="laundry">
              Laundry every N days (0 = none)
            </label>
            <input
              id="laundry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              value={form.laundryEveryDays}
              onChange={(event) => setField("laundryEveryDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp">
              Daytime high (°C)
            </label>
            <input
              id="temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="55"
              value={form.highTempC}
              onChange={(event) => setField("highTempC", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beach-hours">
              Hours in the sun per day
            </label>
            <input
              id="beach-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="14"
              step="0.5"
              value={form.beachHoursPerDay}
              onChange={(event) => setField("beachHoursPerDay", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swims">
              Swims per day
            </label>
            <input
              id="swims"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              value={form.swimsPerDay}
              onChange={(event) => setField("swimsPerDay", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bag-plan">
              Baggage plan
            </label>
            <select
              id="bag-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.bagPlan}
              onChange={(event) => setField("bagPlan", event.target.value)}
            >
              {BAG_PLANS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Trip details</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`toggle-${key}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                  form[key]
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={form[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                {label}
              </label>
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Items to pack
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalItems}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a list."
                : `${tickedCount} of ${lineCount} lines ticked off`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the packing list to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the form and clear ticks"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated pack weight", hasError ? DASH : `${NUM.format(result.totalKg)} kg`],
            [
              "Baggage allowance for the party",
              hasError ? DASH : `${NUM.format(result.allowanceForParty)} kg`,
            ],
            [
              "Weight to spare",
              hasError
                ? DASH
                : // Branch on the unrounded withinAllowance boolean, not the
                  // rounded spareKg's sign — a party a few grams over its
                  // allowance can round to 0.0 kg, and that must still read
                  // as "over" to agree with the warning banner below.
                  result.withinAllowance
                  ? `${NUM.format(Math.abs(result.spareKg))} kg under`
                  : `${NUM.format(Math.abs(result.spareKg))} kg over`,
            ],
            ["Days of clothing to cover", hasError ? DASH : `${result.wearDays} days`],
            [
              "Sunscreen needed",
              hasError
                ? DASH
                : `${result.sunscreenMl} ml — ${result.sunscreenBottles} x ${result.sunscreenBottleMl} ml`,
            ],
            [
              "Sunscreen dose",
              hasError
                ? DASH
                : `${result.sunscreenDoseMl} ml, ${result.sunscreenApplicationsPerDay}x a day`,
            ],
            [
              "Liquids vs the cabin 1 litre bag",
              hasError
                ? DASH
                : `${result.liquidsMl} ml of ${result.cabinLiquidCapacityMl} ml — ${
                    result.liquidsFitCabin ? "fits" : "check a bag or buy on arrival"
                  }`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.withinAllowance && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This list is heavier than the allowance you picked. Cut evening outfits or wash more
            often — laundry every few days is the single biggest lever.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {result.groups.map((group) => (
            <div key={group.name} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`item-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5"
                    >
                      <input
                        id={`item-${item.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(ticked[item.id])}
                        onChange={(event) =>
                          setTicked((current) => ({ ...current, [item.id]: event.target.checked }))
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-semibold ${
                            ticked[item.id]
                              ? "text-[var(--muted-foreground)] line-through"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {item.qty} x {item.name}
                        </span>
                        {item.note && (
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Cabin liquids follow the standard one-bag rule: containers of at most{" "}
        {LIQUID_CONTAINER_MAX_ML} ml inside a single transparent resealable bag of at most{" "}
        {LIQUID_BAG_MAX_ML} ml per passenger. Weights are typical figures for planning, and baggage
        allowances vary by airline and fare — confirm yours before you fly.
      </p>
    </main>
  );
}
