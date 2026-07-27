"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import {
  ANGLE_OPTIONS,
  PLATFORM_OPTIONS,
  REGULATED_OPTIONS,
  VARIANT_MAX,
  VARIANT_MIN,
  buildAdPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  product: "TrailBrew — organic cold brew coffee concentrate delivered monthly",
  keyBenefit: "Barista-grade cold brew at home in 30 seconds, from a 2:1 concentrate",
  audience: "Busy professionals aged 25-40 who already buy cold brew daily",
  proofPoints: "4.8/5 from 2,100 reviews; featured in a national food magazine's 2025 coffee roundup",
  offer: "20% off the first box, cancel anytime",
  cta: "Start your first box",
  platformId: PLATFORM_OPTIONS[0].id,
  angleId: "benefit-led",
  regulatedId: "none",
  variants: "3",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildAdPrompt({
        ...form,
        variants: form.variants.trim() === "" ? Number.NaN : Number(form.variants),
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
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

  const rows = hasError
    ? [
        ["Platform limits", DASH],
        ["Angle", DASH],
        ["Ad variants requested", DASH],
        ["Compliance profile", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Platform limits", result.fieldSummary],
        ["Angle", result.angleLabel],
        ["Ad variants requested", NUM.format(result.variantCount)],
        ["Compliance profile", result.regulatedLabel],
        [
          "Prompt length",
          `${NUM.format(result.promptWords)} words · ${NUM.format(result.promptChars)} characters`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ad Copy Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build an ad-writing prompt that bakes in the platform&apos;s real character limits —
          Google&apos;s 30/90, Meta&apos;s 125/40/30, LinkedIn&apos;s 150/70 or X&apos;s 280 —
          plus your angle, proof points and compliance guardrails.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-product">
              Product or service (required)
            </label>
            <input
              id="ad-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.product}
              onChange={set("product")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-benefit">
              Key benefit — the one true claim (required)
            </label>
            <textarea
              id="ad-benefit"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.keyBenefit}
              onChange={set("keyBenefit")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-audience">
              Target audience (optional)
            </label>
            <input
              id="ad-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.audience}
              onChange={set("audience")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-proof">
              Proof points the AI may cite verbatim (optional)
            </label>
            <input
              id="ad-proof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.proofPoints}
              onChange={set("proofPoints")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-offer">
              Offer / promotion (optional)
            </label>
            <input
              id="ad-offer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.offer}
              onChange={set("offer")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-cta">
              Call to action (optional)
            </label>
            <input
              id="ad-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.cta}
              onChange={set("cta")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-platform">
              Platform
            </label>
            <select
              id="ad-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platformId}
              onChange={set("platformId")}
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-angle">
              Angle
            </label>
            <select
              id="ad-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.angleId}
              onChange={set("angleId")}
            >
              {ANGLE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-regulated">
              Regulated category
            </label>
            <select
              id="ad-regulated"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.regulatedId}
              onChange={set("regulatedId")}
            >
              {REGULATED_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-variants">
              Number of ad variants ({VARIANT_MIN}–{VARIANT_MAX})
            </label>
            <input
              id="ad-variants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={VARIANT_MIN}
              max={VARIANT_MAX}
              step="1"
              value={form.variants}
              onChange={set("variants")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Platform
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.platformLabel}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the prompt."
                : "The prompt enforces this platform's character limits per field."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated ad copy prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character limits reflect each platform&apos;s published specs, which change occasionally —
        verify in the ad platform before launch. AI-drafted claims still need your compliance
        review; this tool is informational, not legal advice.
      </p>
    </main>
  );
}
