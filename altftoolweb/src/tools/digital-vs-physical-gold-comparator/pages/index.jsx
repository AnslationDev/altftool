"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, RotateCcw } from "lucide-react";

import { FORMATS, GST_ON_GOLD_PCT, compareGoldFormats } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const FORMAT_FIELDS = [
  { key: "entryChargePct", label: "Entry charge (%)", step: "0.05" },
  { key: "flatCharge", label: "Flat charge (₹)", step: "5" },
  { key: "gstPct", label: "GST on the purchase (%)", step: "0.5" },
  { key: "annualCostPct", label: "Annual cost (% of value)", step: "0.05" },
  { key: "annualFlatFee", label: "Annual flat fee (₹)", step: "50" },
  { key: "exitDeductionPct", label: "Exit deduction (%)", step: "0.05" },
];

const buildFormats = () =>
  FORMATS.map((format) => ({
    ...format,
    entryChargePct: String(format.entryChargePct),
    flatCharge: String(format.flatCharge),
    gstPct: String(format.gstPct),
    annualCostPct: String(format.annualCostPct),
    annualFlatFee: String(format.annualFlatFee),
    exitDeductionPct: String(format.exitDeductionPct),
  }));

export default function ToolHome() {
  const [spot, setSpot] = useState("7000");
  const [grams, setGrams] = useState("20");
  const [years, setYears] = useState("5");
  const [appreciation, setAppreciation] = useState("8");
  const [tax, setTax] = useState("0");
  const [formats, setFormats] = useState(buildFormats);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareGoldFormats({
        spotPerGram: spot,
        grams,
        years,
        appreciationPct: appreciation,
        taxPct: tax,
        formats,
      }),
    [spot, grams, years, appreciation, tax, formats],
  );

  const hasError = Boolean(result.error);

  const updateFormat = (key, patch) =>
    setFormats((current) =>
      current.map((format) => (format.key === key ? { ...format, ...patch } : format)),
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Digital Gold vs Physical Gold Cost Comparator",
      `${NUM.format(result.grams)} g at ${money2(result.spotPerGram)} a gram = ${money(result.goldValue)} of metal`,
      `Held ${NUM.format(result.years)} year(s) at ${pct(result.appreciationPct)} a year, tax ${pct(result.taxPct)}`,
      "",
      ...result.ranked.map(
        (row) =>
          `${row.label}: buy at ${money2(row.costPerGram)}/g (${pct(row.premiumOverSpotPct)} over spot), total friction ${money(row.totalFriction)} (${pct(row.frictionPct)}), net ${money(row.net)}${row.annualisedPct === null ? "" : `, ${pct(row.annualisedPct)} a year`}`,
      ),
      "",
      `Lowest cost: ${result.best.label}, ${money(result.extraCostOfWorst)} cheaper than ${result.worst.label}`,
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
    setSpot("7000");
    setGrams("20");
    setYears("5");
    setAppreciation("8");
    setTax("0");
    setFormats(buildFormats());
    setCopied(false);
  };

  const numberFields = [
    { id: "gd-spot", label: "Spot gold price (₹ per gram)", value: spot, set: setSpot, step: "50", min: "0" },
    { id: "gd-grams", label: "Quantity (grams)", value: grams, set: setGrams, step: "1", min: "0" },
    { id: "gd-years", label: "Holding period (years)", value: years, set: setYears, step: "1", min: "0" },
    { id: "gd-appr", label: "Assumed price change (% per year)", value: appreciation, set: setAppreciation, step: "0.5", min: "-50" },
    { id: "gd-tax", label: "Tax on the gain (%)", value: tax, set: setTax, step: "0.5", min: "0" },
  ];

  const best = hasError ? null : result.best;

  const rows = hasError
    ? [
        ["Cost per gram at purchase", DASH],
        ["Premium over spot", DASH],
        ["GST paid", DASH],
        ["Cost of carry over the holding", DASH],
        ["Exit deduction", DASH],
        ["Total friction", DASH],
        ["Net proceeds after tax", DASH],
        ["Annualised return realised", DASH],
      ]
    : [
        ["Cost per gram at purchase", money2(best.costPerGram)],
        ["Premium over spot", pct(best.premiumOverSpotPct)],
        ["GST paid", money(best.gst)],
        ["Cost of carry over the holding", money(best.carryTotal)],
        ["Exit deduction", money(best.exitDeduction)],
        ["Total friction", `${money(best.totalFriction)} (${pct(best.frictionPct)} of metal value)`],
        ["Net proceeds after tax", money(best.net)],
        [
          "Annualised return realised",
          best.annualisedPct === null ? "Needs a holding period" : pct(best.annualisedPct),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gem className="h-4 w-4" aria-hidden="true" />
          Gold formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Digital Gold vs Physical Gold Cost Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every format holds the same metal, so only the friction differs. This prices making
          charges and premiums, {GST_ON_GOLD_PCT}% GST, storage and expense ratios, and the spread
          you lose on the way out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-4">
        {formats.map((format) => (
          <div key={format.key} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">{format.label}</h2>
            {format.note && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{format.note}</p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FORMAT_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className={SMALL_LABEL} htmlFor={`gd-${format.key}-${field.key}`}>
                    {field.label}
                  </label>
                  <input
                    id={`gd-${format.key}-${field.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={field.step}
                    value={format[field.key]}
                    onChange={(event) => updateFormat(format.key, { [field.key]: event.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
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
              {hasError ? "Lowest total cost" : `Lowest total cost: ${best.label}`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(best.totalFriction)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare formats."
                : `${money(result.extraCostOfWorst)} less friction than ${result.worst.label} on the same ${NUM.format(result.grams)} g`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy gold format comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Format by format, cheapest first</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cost / gram</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Over spot</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Friction</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Net proceeds</th>
                  <th scope="col" className="py-2 text-right font-semibold">Annualised</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{money2(row.costPerGram)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(row.premiumOverSpotPct)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.totalFriction)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.net)}</td>
                    <td className="py-2 text-right">
                      {row.annualisedPct === null ? DASH : pct(row.annualisedPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Formats are ranked on friction rather than on sale proceeds, because each one buys the
            same metal — the cheaper entry simply had less money put into it.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Only the {GST_ON_GOLD_PCT}% GST and the BIS hallmarking charge are set by rule; making
        charges, platform spreads, expense ratios and buyback discounts are market figures that
        differ by seller — replace them with the numbers on your own invoice. Capital gains rules for
        gold have changed recently, so enter the rate that applies to you and confirm it with a
        chartered accountant. Informational only, not investment advice.
      </p>
    </main>
  );
}
