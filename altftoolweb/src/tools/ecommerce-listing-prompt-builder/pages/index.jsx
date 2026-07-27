"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingBag } from "lucide-react";

import {
  AUDIENCE_HINTS,
  FIELD_LIMITS,
  MAX_BULLETS,
  MIN_BULLETS,
  TITLE_MAX_CHARS,
  TONES,
  buildListingPrompt,
} from "../lib";

const DEFAULTS = {
  productName: "Insulated Steel Water Bottle 1 L",
  category: "Drinkware / Water bottles",
  brand: "",
  price: "INR 899",
  audience: AUDIENCE_HINTS[0],
  tone: TONES[0],
  attributesRaw:
    "1 litre capacity\n304 stainless steel, double-walled\nLeakproof screw lid\nFits standard car cup holder\nHand wash only",
  benefitsRaw:
    "Stays cold for 24 hours and hot for 12\nNo condensation ring on the desk\nOne-handed opening while driving",
  keywordsRaw:
    "insulated steel water bottle\n1 litre water bottle\nvacuum flask for office\nleakproof bottle",
  bulletCount: "5",
  titleTarget: "60",
  descriptionWords: "120",
  includeMeta: true,
  includeFaq: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setChecked = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(
    () =>
      buildListingPrompt({
        productName: form.productName,
        category: form.category,
        brand: form.brand,
        price: form.price,
        audience: form.audience,
        tone: form.tone,
        attributesRaw: form.attributesRaw,
        benefitsRaw: form.benefitsRaw,
        keywordsRaw: form.keywordsRaw,
        bulletCount: toNumber(form.bulletCount),
        titleTarget: toNumber(form.titleTarget),
        descriptionWords: toNumber(form.descriptionWords),
        includeMeta: form.includeMeta,
        includeFaq: form.includeFaq,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const stat = (value) => (failed ? DASH : NUM.format(value));

  const copyPrompt = async () => {
    if (failed) return;
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Listing prompt
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ecommerce Listing Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your attributes, benefits and keywords into one structured prompt that pins the model
          to real field limits and spreads keywords across title, bullets and description.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Product</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="elp-name">
              Product name
            </label>
            <input
              id="elp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.productName}
              onChange={setField("productName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-category">
              Category
            </label>
            <input
              id="elp-category"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.category}
              onChange={setField("category")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-brand">
              Brand (optional)
            </label>
            <input
              id="elp-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.brand}
              onChange={setField("brand")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-price">
              Price point (optional)
            </label>
            <input
              id="elp-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.price}
              onChange={setField("price")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-audience">
              Buyer
            </label>
            <input
              id="elp-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              list="elp-audience-options"
              value={form.audience}
              onChange={setField("audience")}
            />
            <datalist id="elp-audience-options">
              {AUDIENCE_HINTS.map((hint) => (
                <option key={hint} value={hint} />
              ))}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="elp-tone">
              Tone
            </label>
            <select
              id="elp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tone}
              onChange={setField("tone")}
            >
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Facts and keywords</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-attributes">
              Attributes — one per line
            </label>
            <textarea
              id="elp-attributes"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.attributesRaw}
              onChange={setField("attributesRaw")}
            />
            <p className={HINT_CLASS}>
              Size, material, compatibility, care. The prompt tells the model to invent nothing
              beyond these.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-benefits">
              Benefits — one per line
            </label>
            <textarea
              id="elp-benefits"
              rows={4}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.benefitsRaw}
              onChange={setField("benefitsRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-keywords">
              Keywords — one per line, most important first
            </label>
            <textarea
              id="elp-keywords"
              rows={4}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.keywordsRaw}
              onChange={setField("keywordsRaw")}
            />
            <p className={HINT_CLASS}>
              The first keyword is treated as primary and assigned to the title.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Output shape</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-bullets">
              Bullet count
            </label>
            <input
              id="elp-bullets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_BULLETS}
              max={MAX_BULLETS}
              step="1"
              value={form.bulletCount}
              onChange={setField("bulletCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-title-target">
              Title target (characters)
            </label>
            <input
              id="elp-title-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max={TITLE_MAX_CHARS}
              step="5"
              value={form.titleTarget}
              onChange={setField("titleTarget")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elp-desc-words">
              Description length (words)
            </label>
            <input
              id="elp-desc-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max="800"
              step="10"
              value={form.descriptionWords}
              onChange={setField("descriptionWords")}
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="elp-meta"
            >
              <input
                id="elp-meta"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeMeta}
                onChange={setChecked("includeMeta")}
              />
              Ask for a meta description
            </label>
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="elp-faq"
            >
              <input
                id="elp-faq"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeFaq}
                onChange={setChecked("includeFaq")}
              />
              Ask for three buyer FAQs
            </label>
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
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${stat(result.stats.promptChars)} chars`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs to build the prompt."
                : `${stat(result.stats.promptWords)} words · ready to paste into any chat model`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated listing prompt"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Attributes supplied", failed ? DASH : stat(result.stats.attributeCount)],
            ["Benefits supplied", failed ? DASH : stat(result.stats.benefitCount)],
            ["Keywords used", failed ? DASH : stat(result.stats.keywordCount)],
            ["Bullets requested", failed ? DASH : stat(result.stats.bulletCount)],
            ["Title target", failed ? DASH : `${stat(result.stats.titleTarget)} characters`],
            ["Headroom to the hard limit", failed ? DASH : `${stat(result.stats.titleHeadroom)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}

        {!failed && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">Generated prompt</h3>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
              {result.prompt}
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Field limits used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Field</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Limit</th>
                <th scope="col" className="py-2 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_LIMITS.map(([field, limit, source]) => (
                <tr key={field} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{field}</td>
                  <td className="py-2 pr-3">{limit}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Field limits differ by marketplace and by category, and they change. Check the current
        specification for the channel you are publishing to, and review generated copy for accuracy
        before it goes live — you remain responsible for the claims in your listing.
      </p>
    </main>
  );
}
