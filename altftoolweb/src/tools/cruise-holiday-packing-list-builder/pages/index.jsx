"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw, Ship } from "lucide-react";

import { buildCruisePackingList, scheduledFormalNights } from "../lib";

const DEFAULTS = {
  nights: "7",
  travellers: "2",
  portDays: "4",
  formalNights: "2",
  useSuggestedFormal: true,
  laundryPackage: false,
  international: true,
  bagPlan: "international",
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
  ["domestic", "Flight to the port: domestic (15 kg)"],
  ["international", "Flight to the port: international (23 kg)"],
];

const TOGGLES = [
  ["useSuggestedFormal", "Use the line's usual formal-night schedule"],
  ["laundryPackage", "Buying the ship's laundry package"],
  ["international", "International sailing (plug adapter)"],
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

  const nightsValue = toNumber(form.nights);
  const suggestedFormal = Number.isFinite(nightsValue) ? scheduledFormalNights(nightsValue) : 0;

  const result = useMemo(
    () =>
      buildCruisePackingList({
        nights: toNumber(form.nights),
        travellers: toNumber(form.travellers),
        portDays: toNumber(form.portDays),
        formalNights: form.useSuggestedFormal ? undefined : toNumber(form.formalNights),
        laundryPackage: form.laundryPackage,
        international: form.international,
        bagPlan: form.bagPlan,
      }),
    [form],
  );

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
      `Cruise packing list — ${result.nights} nights, ${result.travellers} traveller(s)`,
      `${result.formalNights} formal nights, ${result.casualNights} smart casual, ${result.portDays} port days, ${result.seaDays} sea days`,
      `${result.totalItems} items, about ${NUM.format(result.totalKg)} kg`,
      "",
    ];
    for (const group of result.groups) {
      lines.push(group.name.toUpperCase());
      for (const item of group.items) lines.push(`  [ ] ${item.qty} x ${item.name}`);
      lines.push("");
    }
    lines.push("LEAVE AT HOME");
    for (const item of result.prohibited) lines.push(`  x ${item}`);
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
    setTicked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Ship className="h-4 w-4" aria-hidden="true" />
          Packing list
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Cruise Holiday Packing List Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Evening wear counted from formal and smart casual nights, day wear from the port and sea
          split, plus the day-one bag and the items taken off you at the gangway.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nights">
              Nights on board
            </label>
            <input
              id="nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              value={form.nights}
              onChange={(event) => setField("nights", event.target.value)}
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
              max="8"
              value={form.travellers}
              onChange={(event) => setField("travellers", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-days">
              Port days
            </label>
            <input
              id="port-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              value={form.portDays}
              onChange={(event) => setField("portDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="formal-nights">
              Formal nights
            </label>
            <input
              id="formal-nights"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              value={form.useSuggestedFormal ? String(suggestedFormal) : form.formalNights}
              disabled={form.useSuggestedFormal}
              onChange={(event) => setField("formalNights", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Usual schedule for {form.nights || "0"} nights: {suggestedFormal}
            </p>
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
          <legend className="text-sm font-semibold text-[var(--foreground)]">Sailing details</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`toggle-${key}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                  form[key]
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                : `${tickedCount} of ${lineCount} lines ticked · about ${NUM.format(result.totalKg)} kg`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cruise packing list to clipboard"
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
            ["Formal nights", hasError ? DASH : String(result.formalNights)],
            ["Smart casual nights", hasError ? DASH : String(result.casualNights)],
            ["Port days / sea days", hasError ? DASH : `${result.portDays} / ${result.seaDays}`],
            ["Formal outfits needed", hasError ? DASH : String(result.formalOutfits)],
            ["Smart casual outfits", hasError ? DASH : String(result.casualOutfits)],
            ["Day outfits", hasError ? DASH : String(result.dayOutfits)],
            ["Days of clothing to cover", hasError ? DASH : `${result.wearDays} days`],
            [
              "Flight allowance for the party",
              hasError ? DASH : `${NUM.format(result.allowanceForParty)} kg`,
            ],
            [
              "Against that allowance",
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

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Ban className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
              Leave at home — confiscated at embarkation
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.prohibited.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dress codes, laundry pricing and prohibited-item lists vary between cruise lines and between
        ships in the same fleet — check your line's own guidance before sailing.
      </p>
    </main>
  );
}
