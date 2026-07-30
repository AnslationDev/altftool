"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingCart } from "lucide-react";
import {
  analyzeLoyaltyFootprint,
  MAX_ITEMS_PER_BASKET,
  MAX_SHOPS_PER_WEEK,
  MAX_YEARS,
  SENSITIVITY,
  SIGNAL_GROUPS,
  SIGNALS,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

const DEFAULT_SIGNALS = [
  "nappy-sizes",
  "gluten-free",
  "own-brand-ratio",
  "same-email",
  "repeat-route",
];
const DEFAULT_SHOPS = "2";
const DEFAULT_YEARS = "6";
const DEFAULT_ITEMS = "15";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE = {
  special: "bg-[var(--danger-soft)] text-[var(--danger)]",
  sensitive: "bg-[var(--muted)] text-[var(--foreground)]",
  ordinary: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SIGNALS);
  const [shops, setShops] = useState(DEFAULT_SHOPS);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyzeLoyaltyFootprint({
        signalIds: selected,
        shopsPerWeek: shops.trim() === "" ? Number.NaN : Number(shops),
        years: years.trim() === "" ? Number.NaN : Number(years),
        itemsPerBasket: items.trim() === "" ? Number.NaN : Number(items),
      }),
    [selected, shops, years, items],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Loyalty programme data footprint",
      `Profile depth: ${result.depthPercent}% — ${result.bandLabel}. ${result.bandAdvice}`,
      `${result.matchedCount} of ${result.totalSignals} patterns apply; ${result.specialCount} are special-category inferences under GDPR Article 9.`,
      `Records held: about ${NUM.format(result.transactions)} itemised transactions and ${NUM.format(result.itemLines)} item lines.`,
      "",
      "What can be inferred:",
    ];
    result.matched.forEach((signal, index) => {
      lines.push(`${index + 1}. ${signal.label} -> ${signal.infers} [${signal.sensitivityLabel}]`);
    });
    if (result.matched.length === 0) lines.push("Nothing ticked.");
    lines.push("", "What to do:");
    result.recommendedLevers.forEach((lever) => lines.push(`- ${lever.label}: ${lever.detail}`));
    return lines.join("\n");
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
    setSelected(DEFAULT_SIGNALS);
    setShops(DEFAULT_SHOPS);
    setYears(DEFAULT_YEARS);
    setItems(DEFAULT_ITEMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Loyalty Program Data Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A loyalty card turns an anonymous basket into an itemised, timestamped record tied to
          your name and payment card. Tick what applies and see which inferences follow — and which
          of them are special-category data under Article 9 of the GDPR.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What is in your record?</h2>
        <div className="mt-4 space-y-6">
          {SIGNAL_GROUPS.map((group) => (
            <fieldset key={group.id} className="border-0 p-0">
              <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {group.label}
              </legend>
              <div className="mt-2 space-y-2">
                {SIGNALS.filter((signal) => signal.group === group.id).map((signal) => (
                  <label
                    key={signal.id}
                    htmlFor={`lp-${signal.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                  >
                    <input
                      id={`lp-${signal.id}`}
                      type="checkbox"
                      checked={selected.includes(signal.id)}
                      onChange={() => toggle(signal.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{signal.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {signal.infers}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-shops">
              Card-scanned shops per week (1–{MAX_SHOPS_PER_WEEK})
            </label>
            <input
              id="lp-shops"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_SHOPS_PER_WEEK}
              step="1"
              value={shops}
              onChange={(event) => {
                setShops(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-years">
              Years you have held the card (1–{MAX_YEARS})
            </label>
            <input
              id="lp-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_YEARS}
              step="1"
              value={years}
              onChange={(event) => {
                setYears(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-items">
              Items in a typical basket (1–{MAX_ITEMS_PER_BASKET})
            </label>
            <input
              id="lp-items"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ITEMS_PER_BASKET}
              step="1"
              value={items}
              onChange={(event) => {
                setItems(event.target.value);
                setCopied(false);
              }}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Profile depth
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.depthPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.bandLabel} — ${result.bandAdvice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the loyalty data explainer results"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the explainer to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Patterns that apply",
              hasError ? DASH : `${result.matchedCount} of ${result.totalSignals}`,
            ],
            ["Special-category inferences", hasError ? DASH : String(result.specialCount)],
            ["Other sensitive inferences", hasError ? DASH : String(result.sensitiveCount)],
            [
              "Areas of your life covered",
              hasError ? DASH : `${result.coveredCount} of ${result.totalCategories}`,
            ],
            [
              "Itemised transactions on file",
              hasError ? DASH : `about ${NUM.format(result.transactions)}`,
            ],
            ["Individual item lines", hasError ? DASH : `about ${NUM.format(result.itemLines)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.specialCount > 0 && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.specialCount} of these inferences concern health or belief. Under Article 9 of
            the GDPR that is special-category data, which cannot be processed without a specific
            condition being met — even when the operator only inferred it rather than asking.
          </p>
        )}
      </section>

      {!hasError && result.matched.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What can be inferred</h2>
          <ol className="mt-3 space-y-3">
            {result.matched.map((signal) => (
              <li
                key={signal.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${TONE[signal.sensitivity]}`}
                  >
                    {signal.sensitivityLabel}
                  </span>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {signal.categoryLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold">{signal.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {signal.infers}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {signal.note}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What you can actually do</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {result.recommendedLevers.map((lever) => (
              <div key={lever.id} className="py-2.5">
                <dt className="font-semibold">{lever.label}</dt>
                <dd className="mt-0.5 leading-6 text-[var(--muted-foreground)]">{lever.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How the labels work</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {Object.values(SENSITIVITY).map((level) => (
            <div key={level.id} className="py-2.5">
              <dt className="font-semibold">{level.label}</dt>
              <dd className="mt-0.5 text-[var(--muted-foreground)]">{level.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not legal advice. The Article 9 classification describes EU and UK law;
        rules differ elsewhere. Transaction counts are estimates from the figures you entered, not
        a reading of any operator&apos;s actual records — request those directly if you want the
        real numbers.
      </p>
    </main>
  );
}
