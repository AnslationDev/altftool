"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CONDITION_RULES,
  EXCLUSION_RULES,
  MARKET_PRESETS,
  REFUND_METHOD_OPTIONS,
  RETURN_SHIPPING_OPTIONS,
  generateRefundPolicy,
} from "../lib";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  storeName: "Kite & Co",
  legalName: "Kite Retail Private Limited",
  contactEmail: "support@example.com",
  contactAddress: "12 MG Road, Bengaluru 560001",
  market: "in",
  returnWindowDays: "7",
  refundProcessingDays: "7",
  restockingFeePercent: "0",
  returnShipping: "customer",
  refundMethod: "original",
  offerExchange: true,
  conditionIds: ["unused", "packaging", "tags", "invoice"],
  exclusionIds: ["hygiene", "custom", "giftcard", "perishable"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
const CHECKBOX =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [effectiveDate, setEffectiveDate] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const toggleInList = (key, id) => {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id],
      };
    });
    setCopied(false);
  };

  const policy = useMemo(
    () =>
      generateRefundPolicy({
        storeName: form.storeName,
        legalName: form.legalName,
        contactEmail: form.contactEmail,
        contactAddress: form.contactAddress,
        market: form.market,
        returnWindowDays: toNumber(form.returnWindowDays),
        refundProcessingDays: toNumber(form.refundProcessingDays),
        restockingFeePercent: toNumber(form.restockingFeePercent),
        conditionIds: form.conditionIds,
        exclusionIds: form.exclusionIds,
        returnShipping: form.returnShipping,
        refundMethod: form.refundMethod,
        offerExchange: form.offerExchange,
        effectiveDate,
      }),
    [form, effectiveDate],
  );

  const hasError = Boolean(policy.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(policy.policyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setEffectiveDate(todayIso());
    setCopied(false);
  };

  const facts = hasError
    ? [
        ["Return window", DASH],
        ["Refund issued within", DASH],
        ["Return shipping", DASH],
        ["Refund method", DASH],
        ["Restocking fee", DASH],
        ["Exchanges", DASH],
        ["Excluded categories", DASH],
        ["Market rules applied", DASH],
      ]
    : policy.keyFacts;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Ecommerce compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ecommerce Refund Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your return window, condition rules, shipping split and refund timing, and get a
          ready-to-publish policy that is checked against the statutory minimums of your market.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your store</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-store">
              Store name
            </label>
            <input
              id="erp-store"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.storeName}
              onChange={setField("storeName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-legal">
              Legal entity name (optional)
            </label>
            <input
              id="erp-legal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.legalName}
              onChange={setField("legalName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-email">
              Support email
            </label>
            <input
              id="erp-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.contactEmail}
              onChange={setField("contactEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-address">
              Returns address (optional)
            </label>
            <input
              id="erp-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contactAddress}
              onChange={setField("contactAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-market">
              Market you sell into
            </label>
            <select
              id="erp-market"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.market}
              onChange={setField("market")}
            >
              {MARKET_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-date">
              Effective from
            </label>
            <input
              id="erp-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => {
                setEffectiveDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Windows, money and shipping</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-window">
              Return window (days from delivery)
            </label>
            <input
              id="erp-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={form.returnWindowDays}
              onChange={setField("returnWindowDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-processing">
              Refund issued within (days)
            </label>
            <input
              id="erp-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={form.refundProcessingDays}
              onChange={setField("refundProcessingDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-fee">
              Restocking fee (%)
            </label>
            <input
              id="erp-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={form.restockingFeePercent}
              onChange={setField("restockingFeePercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-shipping">
              Who pays return shipping
            </label>
            <select
              id="erp-shipping"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.returnShipping}
              onChange={setField("returnShipping")}
            >
              {RETURN_SHIPPING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="erp-refund">
              Refund method
            </label>
            <select
              id="erp-refund"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.refundMethod}
              onChange={setField("refundMethod")}
            >
              {REFUND_METHOD_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className={`${CHECK_ROW} w-full`} htmlFor="erp-exchange">
              <input
                id="erp-exchange"
                type="checkbox"
                className={CHECKBOX}
                checked={form.offerExchange}
                onChange={() => {
                  setForm((current) => ({ ...current, offerExchange: !current.offerExchange }));
                  setCopied(false);
                }}
              />
              <span>Offer exchanges as well as refunds</span>
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Condition the item must come back in</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CONDITION_RULES.map((rule) => (
            <label key={rule.id} className={CHECK_ROW} htmlFor={`erp-cond-${rule.id}`}>
              <input
                id={`erp-cond-${rule.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={form.conditionIds.includes(rule.id)}
                onChange={() => toggleInList("conditionIds", rule.id)}
              />
              <span>{rule.label}</span>
            </label>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Categories you will not take back</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXCLUSION_RULES.map((rule) => (
            <label key={rule.id} className={CHECK_ROW} htmlFor={`erp-exc-${rule.id}`}>
              <input
                id={`erp-exc-${rule.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={form.exclusionIds.includes(rule.id)}
                onChange={() => toggleInList("exclusionIds", rule.id)}
              />
              <span>{rule.label}</span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {policy.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Return window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : policy.windowDays > 0 ? `${policy.windowDays} days` : "No returns"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the policy."
                : `${policy.sections.length} sections · ${policy.wordCount} words · ${policy.market.label} rules`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated refund policy"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy policy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && policy.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Check these before you publish
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {policy.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your policy</h2>
          <div className="mt-3 space-y-5">
            {policy.sections.map((section) => (
              <article key={section.id}>
                <h3 className="text-sm font-semibold">{section.heading}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a drafting aid, not legal advice. Consumer law differs by country and by product
        category, and marketplaces such as Amazon, Flipkart or Etsy impose their own return rules on
        top. Have a qualified lawyer review the final wording before you publish it.
      </p>
    </main>
  );
}
