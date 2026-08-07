"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingBag } from "lucide-react";

import {
  BRAND_VOICE_TRAITS,
  DESCRIPTION_STRUCTURES,
  META_DESCRIPTION_FIELD_MAX,
  META_DESCRIPTION_SERP_SAFE,
  SEO_TITLE_MAX_CHARS,
  SHOPIFY_FIELD_LIMITS,
  buildShopifyPrompt,
} from "../lib";

const DEFAULTS = {
  productTitle: "Speckled Stoneware Mug 350 ml",
  brand: "Clay & Co",
  collection: "Kitchen and dining",
  buyer: "Someone furnishing a first flat or buying a housewarming gift",
  voiceTraitsRaw: "Warm, Understated",
  bannedWordsRaw: "elevate, luxurious, game changer, curated",
  featuresRaw:
    "350 ml capacity\n9 cm tall, 8 cm wide\nDishwasher and microwave safe\nHand thrown, so no two are identical\nFood-safe matte glaze",
  keywordsRaw: "stoneware mug\nhandmade ceramic mug\nspeckled coffee mug",
  structure: "feature-benefit",
  descriptionWords: "150",
  currentMeta: "",
  includeAltText: true,
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
      buildShopifyPrompt({
        productTitle: form.productTitle,
        brand: form.brand,
        collection: form.collection,
        buyer: form.buyer,
        voiceTraitsRaw: form.voiceTraitsRaw,
        bannedWordsRaw: form.bannedWordsRaw,
        featuresRaw: form.featuresRaw,
        keywordsRaw: form.keywordsRaw,
        structure: form.structure,
        descriptionWords: toNumber(form.descriptionWords),
        currentMeta: form.currentMeta,
        includeAltText: form.includeAltText,
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
    setForm(DEFAULTS);
    setCopied("");
  };

  // Matches lib.js's parseList(), which splits on commas, semicolons and
  // newlines — keep button state and clicks in sync with that delimiter set.
  const VOICE_TRAIT_SPLIT = /[\n,;]+/;

  const toggleTrait = (trait) =>
    setForm((prev) => {
      const current = prev.voiceTraitsRaw
        .split(VOICE_TRAIT_SPLIT)
        .map((item) => item.trim())
        .filter(Boolean);
      const exists = current.some((item) => item.toLowerCase() === trait.toLowerCase());
      const next = exists
        ? current.filter((item) => item.toLowerCase() !== trait.toLowerCase())
        : [...current, trait];
      return { ...prev, voiceTraitsRaw: next.join(", ") };
    });

  const traitSelected = (trait) =>
    form.voiceTraitsRaw
      .toLowerCase()
      .split(VOICE_TRAIT_SPLIT)
      .map((item) => item.trim())
      .includes(trait.toLowerCase());

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Shopify product page
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Shopify Description Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a brand voice and a description structure, then get one prompt covering the
          description, SEO page title, meta description and alt text — with Shopify&apos;s own field
          limits attached and the URL handle generated for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Product</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="shop-title">
              Product title
            </label>
            <input
              id="shop-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.productTitle}
              onChange={setField("productTitle")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-brand">
              Brand
            </label>
            <input
              id="shop-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.brand}
              onChange={setField("brand")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-collection">
              Collection
            </label>
            <input
              id="shop-collection"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.collection}
              onChange={setField("collection")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="shop-buyer">
              Buyer
            </label>
            <input
              id="shop-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.buyer}
              onChange={setField("buyer")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Brand voice</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BRAND_VOICE_TRAITS.map((trait) => (
            <button
              key={trait}
              type="button"
              onClick={() => toggleTrait(trait)}
              aria-pressed={traitSelected(trait)}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                traitSelected(trait)
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {trait}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-voice">
              Voice traits
            </label>
            <input
              id="shop-voice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.voiceTraitsRaw}
              onChange={setField("voiceTraitsRaw")}
            />
            <p className={HINT_CLASS}>Two or three traits steer a model; more than that cancel each other out.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-banned">
              Words to never use
            </label>
            <input
              id="shop-banned"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.bannedWordsRaw}
              onChange={setField("bannedWordsRaw")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Facts, keywords and structure</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-features">
              Features and specifications — one per line
            </label>
            <textarea
              id="shop-features"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.featuresRaw}
              onChange={setField("featuresRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-keywords">
              Keywords — one per line, primary first
            </label>
            <textarea
              id="shop-keywords"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.keywordsRaw}
              onChange={setField("keywordsRaw")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="shop-structure">
                Description structure
              </label>
              <select
                id="shop-structure"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.structure}
                onChange={setField("structure")}
              >
                {DESCRIPTION_STRUCTURES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="shop-words">
                Description length (words)
              </label>
              <input
                id="shop-words"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="50"
                max="600"
                step="10"
                value={form.descriptionWords}
                onChange={setField("descriptionWords")}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shop-meta">
              Current meta description (optional — checked against both limits)
            </label>
            <textarea
              id="shop-meta"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.currentMeta}
              onChange={setField("currentMeta")}
            />
            <p className={HINT_CLASS}>
              Shopify accepts {META_DESCRIPTION_FIELD_MAX} characters; search results usually show
              about {META_DESCRIPTION_SERP_SAFE}.
            </p>
          </div>
          <label
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
            htmlFor="shop-alt"
          >
            <input
              id="shop-alt"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={form.includeAltText}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, includeAltText: event.target.checked }))
              }
            />
            Also ask for image alt text
          </label>
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
              SEO page title
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !failed && !result.seoTitle.withinLimit ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {failed ? DASH : `${stat(result.seoTitle.length)} / ${SEO_TITLE_MAX_CHARS}`}
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the inputs to build the brief." : result.seoTitle.seoTitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("handle", failed ? "" : result.handle.handle)}
              aria-label="Copy the generated URL handle"
              className={GHOST_BTN}
              disabled={failed || !result.handle.handle}
            >
              {copied === "handle" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "handle" ? "Copied!" : "Copy handle"}
            </button>
            <button
              type="button"
              onClick={() => copy("prompt", result.prompt)}
              aria-label="Copy the generated Shopify description prompt"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["URL handle", failed ? DASH : result.handle.handle || "(empty)"],
            ["Product title length", failed ? DASH : `${stat(result.stats.titleLength)} characters`],
            ["Title headroom to the 255-character field", failed ? DASH : stat(result.stats.titleHeadroom)],
            [
              "Meta description",
              failed || !form.currentMeta.trim()
                ? DASH
                : `${stat(result.meta.length)} chars · ${result.meta.withinSerp ? "fits the snippet" : "will be truncated"}`,
            ],
            ["Features supplied", failed ? DASH : stat(result.stats.featureCount)],
            ["Keywords supplied", failed ? DASH : stat(result.stats.keywordCount)],
            ["Voice traits", failed ? DASH : stat(result.stats.voiceTraitCount)],
            ["Banned words", failed ? DASH : stat(result.stats.bannedWordCount)],
            ["Prompt length", failed ? DASH : `${stat(result.stats.promptChars)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
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
        <h2 className="text-base font-semibold">Shopify field limits</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Field</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Limit</th>
                <th scope="col" className="py-2 font-semibold">Where it comes from</th>
              </tr>
            </thead>
            <tbody>
              {SHOPIFY_FIELD_LIMITS.map(([field, limit, source]) => (
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
        Search snippet lengths are measured in pixels rather than characters, so the character
        figures here are practical guides rather than guarantees. Review generated copy against the
        real product before publishing.
      </p>
    </main>
  );
}
