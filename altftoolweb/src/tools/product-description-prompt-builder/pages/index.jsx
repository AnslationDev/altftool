"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageSearch, RotateCcw } from "lucide-react";

import {
  MARKETPLACES,
  MAX_WORDS,
  MIN_WORDS,
  TONES,
  buildListingPrompt,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  marketplaceId: "amazon",
  toneId: "plain",
  totalWords: "200",
  productName: "Organic cotton fitted sheet, queen",
  features:
    "300 thread count long-staple cotton\nDeep pocket fits mattresses up to 40 cm\nGOTS certified organic\nOeko-Tex tested dyes\nMachine washable at 40C\nAvailable in six colours",
  audience: "People with a thick mattress topper whose sheets keep popping off",
  keywords: "queen fitted sheet, deep pocket sheet, organic cotton bedding",
  avoid: "",
};

export default function ToolHome() {
  const [marketplaceId, setMarketplaceId] = useState(DEFAULTS.marketplaceId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [features, setFeatures] = useState(DEFAULTS.features);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [keywords, setKeywords] = useState(DEFAULTS.keywords);
  const [avoid, setAvoid] = useState(DEFAULTS.avoid);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildListingPrompt({
        marketplaceId,
        toneId,
        totalWords: totalWords.trim() === "" ? Number.NaN : Number(totalWords),
        productName,
        features,
        audience,
        keywords,
        avoid,
      }),
    [marketplaceId, toneId, totalWords, productName, features, audience, keywords, avoid],
  );

  const copyResult = async () => {
    if (result.error || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMarketplaceId(DEFAULTS.marketplaceId);
    setToneId(DEFAULTS.toneId);
    setTotalWords(DEFAULTS.totalWords);
    setProductName(DEFAULTS.productName);
    setFeatures(DEFAULTS.features);
    setAudience(DEFAULTS.audience);
    setKeywords(DEFAULTS.keywords);
    setAvoid(DEFAULTS.avoid);
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);
  const touch = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageSearch className="h-4 w-4" aria-hidden="true" />
          Listing copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Product Description Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a feature list into a listing-copy prompt. The word budget is split across hook,
          bullets, use cases, specs and close, and the marketplace&apos;s real title, bullet and
          description limits are written into the brief.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-name">
              Product name
            </label>
            <input id="listing-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={productName} onChange={touch(setProductName)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-features">
              Features, one per line
            </label>
            <textarea
              id="listing-features"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={6}
              placeholder={"300 thread count cotton\nFits mattresses up to 40 cm"}
              value={features}
              onChange={touch(setFeatures)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-marketplace">
              Where it will be listed
            </label>
            <select id="listing-marketplace" className={`mt-2 ${INPUT_CLASS}`} value={marketplaceId} onChange={touch(setMarketplaceId)}>
              {MARKETPLACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-tone">
              Tone
            </label>
            <select id="listing-tone" className={`mt-2 ${INPUT_CLASS}`} value={toneId} onChange={touch(setToneId)}>
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-words">
              Description length (words)
            </label>
            <input
              id="listing-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS}
              max={MAX_WORDS}
              step="10"
              value={totalWords}
              onChange={touch(setTotalWords)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-audience">
              Buyer (optional)
            </label>
            <input id="listing-audience" className={`mt-2 ${INPUT_CLASS}`} type="text" value={audience} onChange={touch(setAudience)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-keywords">
              Search terms to include (optional)
            </label>
            <input id="listing-keywords" className={`mt-2 ${INPUT_CLASS}`} type="text" value={keywords} onChange={touch(setKeywords)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-avoid">
              Claims to avoid (optional)
            </label>
            <input
              id="listing-avoid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="hypoallergenic, medical benefits"
              value={avoid}
              onChange={touch(setAvoid)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
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
              Copy budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(`${INT.format(result.totalWords || 0)} words`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(
                `${INT.format(result.bulletTarget || 0)} bullets for ${result.marketplaceLabel}${
                  result.droppedFeatures ? ` — ${result.droppedFeatures} feature(s) will not fit` : ""
                }`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated product description prompt"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
            ...(result.error
              ? [["Section split", DASH]]
              : result.budget.map((section) => [section.label, `${INT.format(section.words)} words`])),
            ["Title limit", stat(`${INT.format(result.titleLimit || 0)} characters`)],
            [
              "Description field limit",
              stat(result.descLimit ? `${INT.format(result.descLimit)} characters` : "No hard cap"),
            ],
            ["Tags allowed", stat(result.tagLimit ? INT.format(result.tagLimit) : "Not used here")],
            ["Features supplied", stat(INT.format(result.featureCount || 0))],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Marketplaces change their limits and their prohibited-claims policies. Check the current
        seller guidelines before publishing, especially for anything touching health, safety or
        environmental claims.
      </p>
    </main>
  );
}
