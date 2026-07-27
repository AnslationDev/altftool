"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Image as ImageIcon, RotateCcw } from "lucide-react";

import { computeImageCost, projectToTarget } from "../lib";

const DEFAULTS = {
  renders: "100",
  pricePerRender: "0.04",
  acceptRatePercent: "25",
  retouchPassesPerKeeper: "0",
  reviewSecondsPerRender: "15",
  reviewerHourlyRate: "0",
  fixedCost: "0",
  targetKeepers: "50",
  currency: "USD",
};

const CURRENCIES = [
  { code: "USD", label: "USD $" },
  { code: "INR", label: "INR ₹" },
  { code: "EUR", label: "EUR €" },
  { code: "GBP", label: "GBP £" },
];

const LOCALE_FOR = { USD: "en-US", INR: "en-IN", EUR: "en-IE", GBP: "en-GB" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const currency = form.currency;

  const fmt = useMemo(() => {
    const locale = LOCALE_FOR[currency] || "en-US";
    const money = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });
    const unit = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    return { money, unit, num };
  }, [currency]);

  const result = useMemo(
    () =>
      computeImageCost({
        renders: toNumber(form.renders),
        pricePerRender: toNumber(form.pricePerRender),
        acceptRatePercent: toNumber(form.acceptRatePercent),
        retouchPassesPerKeeper: toNumber(form.retouchPassesPerKeeper),
        reviewSecondsPerRender: toNumber(form.reviewSecondsPerRender),
        reviewerHourlyRate: toNumber(form.reviewerHourlyRate),
        fixedCost: toNumber(form.fixedCost),
      }),
    [form],
  );

  const projection = useMemo(
    () => projectToTarget(result, toNumber(form.targetKeepers)),
    [result, form.targetKeepers],
  );

  const failed = Boolean(result.error);

  const money = (value) => (failed ? DASH : fmt.money.format(value));
  const unit = (value) => (failed ? DASH : fmt.unit.format(value));
  const num = (value) => (failed ? DASH : fmt.num.format(value));

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Cost Per Image Generated",
      `Renders generated: ${fmt.num.format(result.renders)}`,
      `Acceptance rate: ${fmt.num.format(result.acceptRatePercent)}%`,
      `Usable images: ${fmt.num.format(result.keepers)}`,
      `Renders per usable image: ${fmt.num.format(result.rendersPerKeeper)}`,
      `Generation cost: ${fmt.money.format(result.generationCost)}`,
      `Retouch cost: ${fmt.money.format(result.retouchCost)}`,
      `Review cost: ${fmt.money.format(result.reviewCost)}`,
      `Fixed cost: ${fmt.money.format(result.fixedCost)}`,
      `Total cost: ${fmt.money.format(result.totalCost)}`,
      `Cost per usable image: ${fmt.unit.format(result.costPerUsable)}`,
    ];
    if (!projection.error) {
      lines.push(
        `To ship ${fmt.num.format(projection.targetKeepers)} images: ${fmt.num.format(projection.rendersNeeded)} renders, ${fmt.money.format(projection.budget)}`,
      );
    }
    return lines.join("\n");
  }, [failed, fmt, result, projection]);

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
    setCopied(false);
  };

  const numberFields = [
    { key: "renders", id: "cpi-renders", label: "Images generated (billed renders)", step: "1", min: "1" },
    { key: "pricePerRender", id: "cpi-price", label: `Price per render (${currency})`, step: "0.001", min: "0" },
    { key: "acceptRatePercent", id: "cpi-accept", label: "Acceptance rate (% usable)", step: "1", min: "0", max: "100" },
    { key: "retouchPassesPerKeeper", id: "cpi-retouch", label: "Extra passes per keeper (upscale, inpaint)", step: "0.5", min: "0" },
    { key: "reviewSecondsPerRender", id: "cpi-review", label: "Review seconds per render", step: "1", min: "0" },
    { key: "reviewerHourlyRate", id: "cpi-rate", label: `Reviewer hourly cost (${currency})`, step: "1", min: "0" },
    { key: "fixedCost", id: "cpi-fixed", label: `Plan or fixed cost for this batch (${currency})`, step: "1", min: "0" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          AI image cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Image Generated Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The sticker price is per render, not per usable image. Add your acceptance rate, retouch
          passes and culling time to see what one shippable image actually costs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-currency">
              Currency
            </label>
            <select
              id="cpi-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.currency}
              onChange={setField("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {numberFields.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={form[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Quick acceptance rate
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[10, 25, 50, 75, 100].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, acceptRatePercent: String(value) }))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      </section>

      {failed && (
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
              Cost per usable image
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {unit(result.costPerUsable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs to see a result."
                : `${fmt.num.format(result.rendersPerKeeper)} renders per keeper · ${result.stickerMultiple ? `${fmt.num.format(result.stickerMultiple)}x the sticker price` : "no per-render price entered"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per image result"
              className={GHOST_BTN}
              disabled={failed}
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
          {[
            ["Usable images", num(result.keepers)],
            ["Rejected renders", num(result.rejects)],
            ["Generation cost", money(result.generationCost)],
            ["Retouch / upscale cost", money(result.retouchCost)],
            ["Review time cost", money(result.reviewCost)],
            ["Plan or fixed cost", money(result.fixedCost)],
            ["Total spend", money(result.totalCost)],
            ["All-in cost per render", unit(result.costPerRenderAllIn)],
            ["Spend on rejected renders", failed ? DASH : `${money(result.wastedGenerationCost)} (${num(result.wastedShare)}%)`],
            ["Billed renders per shipped image", num(result.billedRendersPerKeeper)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.band && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{result.band.label} hit rate.</span>{" "}
            {result.band.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Budget for a finished set</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cpi-target">
              Finished images needed
            </label>
            <input
              id="cpi-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.targetKeepers}
              onChange={setField("targetKeepers")}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Projected budget
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {projection.error ? DASH : fmt.money.format(projection.budget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {projection.error
                ? projection.error
                : `Needs about ${fmt.num.format(projection.rendersNeeded)} renders`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Provider prices change, some models bill per megapixel or per step
        rather than per image, and failed or filtered generations may still be billed — check your
        provider&apos;s usage dashboard against these figures.
      </p>
    </main>
  );
}
