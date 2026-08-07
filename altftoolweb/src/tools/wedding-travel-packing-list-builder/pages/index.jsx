"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, RotateCcw } from "lucide-react";

import { buildWeddingPackingList, EVENT_TYPES, OUTFIT_STYLES } from "../lib";

const DEFAULT_EVENTS = {
  mehendi: "1",
  haldi: "0",
  sangeet: "1",
  ceremony: "1",
  reception: "1",
  cocktail: "0",
  civil: "0",
  brunch: "0",
};

const DEFAULTS = {
  days: "4",
  outfitStyle: "heavyEthnic",
  bagPlan: "domestic",
  wearHeaviestOnTravel: false,
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

const BAG_PLANS = [
  ["domestic", "Checked bag, domestic (15 kg)"],
  ["international", "Checked bag, international (23 kg)"],
];

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [ticked, setTicked] = useState({});
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const setEvent = (key, value) => {
    setEvents((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const parsed = {};
    for (const type of EVENT_TYPES) parsed[type.id] = toNumber(events[type.id]);
    return buildWeddingPackingList({
      events: parsed,
      days: toNumber(form.days),
      outfitStyle: form.outfitStyle,
      bagPlan: form.bagPlan,
      wearHeaviestOnTravel: form.wearHeaviestOnTravel,
    });
  }, [events, form]);

  const hasError = Boolean(result.error);

  const lineCount = hasError
    ? 0
    : result.groups.reduce((total, group) => total + group.items.length, 0);

  const tickedCount = useMemo(() => {
    if (hasError) return 0;
    let count = 0;
    for (const group of result.groups) {
      for (const item of group.items) if (ticked[item.id]) count += 1;
    }
    return count;
  }, [hasError, result, ticked]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Wedding travel packing list — ${result.days} days, ${result.eventCount} functions`,
      `${result.totalOutfits} outfits, ${result.shoePairs} pairs of shoes`,
      `About ${NUM.format(result.packedKg)} kg packed against a ${result.allowanceKg} kg allowance`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.name.toUpperCase());
      for (const item of group.items) lines.push(`  [ ] ${item.qty} x ${item.name}`);
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
    setForm(DEFAULTS);
    setEvents(DEFAULT_EVENTS);
    setTicked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Gem className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Wedding Travel Packing List Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One outfit per function, shoes counted by dress code rather than by event, and the whole lot
          weighed against your baggage allowance before you get to the airport.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Functions you are attending
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {EVENT_TYPES.map((type) => (
              <div key={type.id}>
                <label className={LABEL_CLASS} htmlFor={`event-${type.id}`}>
                  {type.label}
                </label>
                <input
                  id={`event-${type.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="5"
                  step="1"
                  value={events[type.id]}
                  onChange={(event) => setEvent(type.id, event.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              max="30"
              value={form.days}
              onChange={(event) => setField("days", event.target.value)}
            />
          </div>
          <div>
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="outfit-style">
              Outfit style
            </label>
            <select
              id="outfit-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.outfitStyle}
              onChange={(event) => setField("outfitStyle", event.target.value)}
            >
              {Object.entries(OUTFIT_STYLES).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="wear-heaviest"
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                form.wearHeaviestOnTravel
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--background)]"
              }`}
            >
              <input
                id="wear-heaviest"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.wearHeaviestOnTravel}
                onChange={(event) => setField("wearHeaviestOnTravel", event.target.checked)}
              />
              Wear the heaviest outfit on the journey instead of packing it
            </label>
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Packed weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.packedKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Pick at least one function to see a list."
                : `against a ${result.allowanceKg} kg allowance · ${tickedCount}/${lineCount} lines ticked`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the wedding packing list to clipboard"
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
            ["Functions", hasError ? DASH : String(result.eventCount)],
            ["Outfits in total", hasError ? DASH : String(result.totalOutfits)],
            ["Of which casual downtime sets", hasError ? DASH : String(result.casualOutfits)],
            ["Pairs of shoes", hasError ? DASH : String(result.shoePairs)],
            ["Outfits weigh", hasError ? DASH : `${NUM.format(result.outfitKg)} kg`],
            ["Everything else weighs", hasError ? DASH : `${NUM.format(result.extrasKg)} kg`],
            ["Heaviest single outfit", hasError ? DASH : `${NUM.format(result.heaviestOutfitKg)} kg`],
            [
              "Against the allowance",
              hasError
                ? DASH
                : result.withinAllowance
                  ? `${NUM.format(result.spareKg)} kg to spare`
                  : `${NUM.format(Math.abs(result.spareKg))} kg over`,
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
            Over the allowance by {NUM.format(Math.abs(result.spareKg))} kg. Wearing the heaviest
            outfit on the journey saves {NUM.format(result.heaviestOutfitKg)} kg, and dropping one pair
            of shoes usually saves another half kilo.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {result.groups.map((group) => (
            <div
              key={group.name}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
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
        Outfit weights are typical planning figures including dupatta, lining and basic jewellery — a
        specific garment can differ by a kilogram. Baggage allowances vary by airline and fare, so
        confirm yours before you pack to the limit.
      </p>
    </main>
  );
}
