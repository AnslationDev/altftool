"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import {
  AMAZON_FIELD_LIMITS,
  BULLETS_MAX,
  BULLET_MAX_CHARS,
  DESCRIPTION_MAX_CHARS,
  SEARCH_TERMS_MAX_BYTES,
  TITLE_MAX_CHARS,
  buildAmazonPrompt,
} from "../lib";

const DEFAULTS = {
  productName: "Acme Insulated Steel Water Bottle 1 L",
  brand: "Acme",
  category: "Home & Kitchen / Drinkware",
  audience: "Office commuters and gym-goers",
  attributesRaw:
    "1 litre capacity\n304 stainless steel, double-walled vacuum\nLeakproof screw lid with silicone gasket\n7.3 cm base, fits standard car cup holders\nHand wash recommended, not microwave safe",
  benefitsRaw:
    "Cold for 24 hours, hot for 12\nNo sweating, so it will not mark a desk or bag\nOpens one-handed",
  keywordsRaw:
    "insulated flask\nvacuum bottle for gym\nthermos 1 litre\nleakproof travel bottle",
  bulletCount: "5",
  titleTarget: "80",
  bulletTarget: "200",
  descriptionChars: "1200",
  includeAPlus: false,
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
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildAmazonPrompt({
        productName: form.productName,
        brand: form.brand,
        category: form.category,
        audience: form.audience,
        attributesRaw: form.attributesRaw,
        benefitsRaw: form.benefitsRaw,
        keywordsRaw: form.keywordsRaw,
        bulletCount: toNumber(form.bulletCount),
        titleTarget: toNumber(form.titleTarget),
        bulletTarget: toNumber(form.bulletTarget),
        descriptionChars: toNumber(form.descriptionChars),
        includeAPlus: form.includeAPlus,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const stat = (value) => (failed ? DASH : NUM.format(value));

  const copy = async (key, text) => {
    if (failed || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    if (!window.confirm("Reset all fields to the sample listing? Your typed input will be lost.")) return;
    setForm(DEFAULTS);
    setCopied("");
  };

  const searchTerms = failed ? null : result.searchTerms;
  const bytesOver = searchTerms ? searchTerms.bytesRemaining < 0 : false;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Amazon listing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Amazon Listing Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One prompt for title, bullets and description with Amazon&apos;s field limits and policy
          rules written in — plus a de-duplicated backend search-term string measured in bytes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Product</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="alp-name">
              Product name
            </label>
            <input
              id="alp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.productName}
              onChange={setField("productName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-brand">
              Brand
            </label>
            <input
              id="alp-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.brand}
              onChange={setField("brand")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-category">
              Category
            </label>
            <input
              id="alp-category"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.category}
              onChange={setField("category")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="alp-audience">
              Shopper
            </label>
            <input
              id="alp-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.audience}
              onChange={setField("audience")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Facts, benefits and keywords</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-attributes">
              Verified attributes — one per line
            </label>
            <textarea
              id="alp-attributes"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.attributesRaw}
              onChange={setField("attributesRaw")}
            />
            <p className={HINT_CLASS}>
              Anything not listed here is marked [CONFIRM] in the output instead of being invented.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-benefits">
              Benefits — one per line
            </label>
            <textarea
              id="alp-benefits"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.benefitsRaw}
              onChange={setField("benefitsRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-keywords">
              Keywords — one per line, primary first
            </label>
            <textarea
              id="alp-keywords"
              rows={4}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.keywordsRaw}
              onChange={setField("keywordsRaw")}
            />
            <p className={HINT_CLASS}>
              Words already in the title are stripped from the backend search terms, because Amazon
              already indexes them.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Output shape</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-bullets">
              Bullet count
            </label>
            <input
              id="alp-bullets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max={BULLETS_MAX}
              step="1"
              value={form.bulletCount}
              onChange={setField("bulletCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-title-target">
              Title target (characters)
            </label>
            <input
              id="alp-title-target"
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
            <label className={LABEL_CLASS} htmlFor="alp-bullet-target">
              Characters per bullet
            </label>
            <input
              id="alp-bullet-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max={BULLET_MAX_CHARS}
              step="10"
              value={form.bulletTarget}
              onChange={setField("bulletTarget")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alp-desc">
              Description length (characters)
            </label>
            <input
              id="alp-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="200"
              max={DESCRIPTION_MAX_CHARS}
              step="100"
              value={form.descriptionChars}
              onChange={setField("descriptionChars")}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="alp-aplus"
            >
              <input
                id="alp-aplus"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeAPlus}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, includeAPlus: event.target.checked }))
                }
              />
              Also ask for an A+ content module outline
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Backend search terms
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${bytesOver ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
            >
              {failed ? DASH : `${stat(searchTerms.bytes)} / ${SEARCH_TERMS_MAX_BYTES} B`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs to build the listing brief."
                : `${stat(searchTerms.words.length)} unique words · ${stat(searchTerms.bytesRemaining)} bytes spare`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("terms", searchTerms ? searchTerms.terms : "")}
              aria-label="Copy the backend search term string"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "terms" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "terms" ? "Copied!" : "Copy terms"}
            </button>
            <button
              type="button"
              onClick={() => copy("prompt", result.prompt)}
              aria-label="Copy the generated Amazon listing prompt"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              {copied === "prompt" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "prompt" ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <p className="mt-4 break-words rounded-md bg-[var(--background)] p-3 font-mono text-sm ring-1 ring-[var(--border)]">
            {searchTerms.terms || "No keywords left after removing title words and stopwords."}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words dropped (already in title)", failed ? DASH : stat(searchTerms.droppedInTitle.length)],
            ["Words dropped (stopwords)", failed ? DASH : stat(searchTerms.droppedStopword.length)],
            ["Words dropped (over the byte limit)", failed ? DASH : stat(searchTerms.overflow.length)],
            ["Bullets requested", failed ? DASH : stat(result.stats.bulletCount)],
            ["Total bullet character budget", failed ? DASH : stat(result.stats.totalBulletBudget)],
            ["Title headroom to the 200-character cap", failed ? DASH : stat(result.stats.titleHeadroom)],
            ["Prompt length", failed ? DASH : `${stat(result.stats.promptChars)} characters`],
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
        <h2 className="text-base font-semibold">Amazon field limits</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Field</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Limit</th>
                <th scope="col" className="py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {AMAZON_FIELD_LIMITS.map(([field, limit, note]) => (
                <tr key={field} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{field}</td>
                  <td className="py-2 pr-3">{limit}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Amazon publishes a separate style guide per category and updates its policies regularly, so
        treat these limits as a starting point and check the current guidance for your browse node.
        You remain responsible for the accuracy and policy compliance of anything you publish.
      </p>
    </main>
  );
}
