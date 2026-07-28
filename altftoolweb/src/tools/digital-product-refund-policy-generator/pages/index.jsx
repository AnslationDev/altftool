"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, TriangleAlert } from "lucide-react";

import {
  MARKET_PRESETS,
  PRODUCT_TYPES,
  REFUND_EXCEPTIONS,
  generateDigitalRefundPolicy,
} from "../lib";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  sellerName: "Pixelforge",
  legalName: "Pixelforge Studios LLP",
  contactEmail: "support@example.com",
  productType: "course",
  market: "eu",
  waiverAtCheckout: true,
  prorateSubscriptions: false,
  exceptionWindowHours: "72",
  refundProcessingDays: "5",
  exceptionIds: ["access", "misdescribed", "faulty", "duplicate", "unauthorised"],
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

  const toggleFlag = (key) => {
    setForm((current) => ({ ...current, [key]: !current[key] }));
    setCopied(false);
  };

  const toggleException = (id) => {
    setForm((current) => ({
      ...current,
      exceptionIds: current.exceptionIds.includes(id)
        ? current.exceptionIds.filter((entry) => entry !== id)
        : [...current.exceptionIds, id],
    }));
    setCopied(false);
  };

  const policy = useMemo(
    () =>
      generateDigitalRefundPolicy({
        sellerName: form.sellerName,
        legalName: form.legalName,
        contactEmail: form.contactEmail,
        productType: form.productType,
        market: form.market,
        waiverAtCheckout: form.waiverAtCheckout,
        exceptionIds: form.exceptionIds,
        exceptionWindowHours: toNumber(form.exceptionWindowHours),
        refundProcessingDays: toNumber(form.refundProcessingDays),
        prorateSubscriptions: form.prorateSubscriptions,
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
        ["Product type", DASH],
        ["Change-of-mind refunds", DASH],
        ["Refund exceptions listed", DASH],
        ["Window to report a problem", DASH],
        ["Refund issued within", DASH],
        ["Checkout waiver captured", DASH],
        ["Part-period subscription refunds", DASH],
        ["Market rules applied", DASH],
      ]
    : policy.keyFacts;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Download className="h-4 w-4" aria-hidden="true" />
          Digital selling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Digital Product Refund Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write a no-return policy for downloads, courses and licences that still lists the refunds you
          are legally obliged to give — and warns you when a clause would not hold up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Seller and product</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-seller">
              Name buyers see
            </label>
            <input
              id="drp-seller"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.sellerName}
              onChange={setField("sellerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-legal">
              Legal entity name (optional)
            </label>
            <input
              id="drp-legal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.legalName}
              onChange={setField("legalName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-email">
              Support email
            </label>
            <input
              id="drp-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.contactEmail}
              onChange={setField("contactEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-product">
              What you sell
            </label>
            <select
              id="drp-product"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.productType}
              onChange={setField("productType")}
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-market">
              Main market
            </label>
            <select
              id="drp-market"
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
            <label className={LABEL_CLASS} htmlFor="drp-date">
              Effective from
            </label>
            <input
              id="drp-date"
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
        <h2 className="text-base font-semibold">Timing and checkout</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-window">
              Window to report a problem (hours)
            </label>
            <input
              id="drp-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="1"
              value={form.exceptionWindowHours}
              onChange={setField("exceptionWindowHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="drp-processing">
              Refund issued within (days)
            </label>
            <input
              id="drp-processing"
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
          <label className={CHECK_ROW} htmlFor="drp-waiver">
            <input
              id="drp-waiver"
              type="checkbox"
              className={CHECKBOX}
              checked={form.waiverAtCheckout}
              onChange={() => toggleFlag("waiverAtCheckout")}
            />
            <span>Checkout captures express consent to immediate delivery</span>
          </label>
          <label className={CHECK_ROW} htmlFor="drp-prorate">
            <input
              id="drp-prorate"
              type="checkbox"
              className={CHECKBOX}
              checked={form.prorateSubscriptions}
              onChange={() => toggleFlag("prorateSubscriptions")}
            />
            <span>Refund the unused part of a subscription period</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">When you will still refund</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The four marked &ldquo;required&rdquo; cannot lawfully be switched off — a seller may not refuse
          a refund for content that is faulty, undeliverable or not as described.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {REFUND_EXCEPTIONS.map((rule) => (
            <label key={rule.id} className={CHECK_ROW} htmlFor={`drp-exc-${rule.id}`}>
              <input
                id={`drp-exc-${rule.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={form.exceptionIds.includes(rule.id)}
                onChange={() => toggleException(rule.id)}
              />
              <span>
                {rule.label}
                {rule.always && (
                  <span className="ml-2 text-xs font-semibold uppercase text-[var(--primary)]">
                    required
                  </span>
                )}
              </span>
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
              Refund exceptions covered
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${policy.exceptions.length} of ${REFUND_EXCEPTIONS.length}`}
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
              aria-label="Copy the generated digital refund policy"
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
            Fix these before you publish
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
        This is a drafting aid, not legal advice. Digital-content rules differ sharply between markets,
        and app stores, course platforms and payment processors apply their own refund terms on top of
        yours. Have the final wording reviewed by a qualified lawyer.
      </p>
    </main>
  );
}
