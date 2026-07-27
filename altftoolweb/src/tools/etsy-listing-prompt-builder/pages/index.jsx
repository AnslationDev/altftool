"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Store } from "lucide-react";

import {
  ETSY_FIELD_LIMITS,
  STORY_ANGLES,
  TAGS_MAX,
  TAG_MAX_CHARS,
  TITLE_MAX_CHARS,
  buildEtsyPrompt,
} from "../lib";

const DEFAULTS = {
  itemName: "Speckled Stoneware Coffee Mug 350 ml",
  shopName: "Clay & Co Studio",
  craftType: "Wheel-thrown stoneware pottery",
  buyer: "Someone buying a housewarming or birthday gift",
  occasion: "Housewarming",
  storyAngle: "process",
  materialsRaw: "Stoneware clay\nFood-safe matte glaze",
  detailsRaw:
    "350 ml capacity\n9 cm tall, 8 cm wide\nDishwasher and microwave safe\nEach piece varies slightly in speckle\nFired twice at 1240 C",
  tagsRaw:
    "stoneware mug\nspeckled mug\npottery gift\nhandmade coffee mug\nceramic mug gift",
  personalisation: "Name on the base, up to 12 characters",
  processingTime: "3 to 5 business days",
  titleTarget: "120",
  descriptionWords: "180",
  includeSectionHeadings: true,
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
      buildEtsyPrompt({
        itemName: form.itemName,
        shopName: form.shopName,
        craftType: form.craftType,
        buyer: form.buyer,
        occasion: form.occasion,
        storyAngle: form.storyAngle,
        materialsRaw: form.materialsRaw,
        detailsRaw: form.detailsRaw,
        tagsRaw: form.tagsRaw,
        personalisation: form.personalisation,
        processingTime: form.processingTime,
        titleTarget: toNumber(form.titleTarget),
        descriptionWords: toNumber(form.descriptionWords),
        includeSectionHeadings: form.includeSectionHeadings,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const stat = (value) => (failed ? DASH : NUM.format(value));
  const tagReport = failed ? null : result.tagReport;

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Store className="h-4 w-4" aria-hidden="true" />
          Etsy listing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Etsy Listing Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check your tags against Etsy&apos;s 13 slots and 20-character rule, pick a maker story
          angle, and get one prompt that writes the title, description and the tags still missing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Item</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="etsy-name">
              Item name
            </label>
            <input
              id="etsy-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.itemName}
              onChange={setField("itemName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-shop">
              Shop name
            </label>
            <input
              id="etsy-shop"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.shopName}
              onChange={setField("shopName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-craft">
              Craft or technique
            </label>
            <input
              id="etsy-craft"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.craftType}
              onChange={setField("craftType")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-buyer">
              Buyer
            </label>
            <input
              id="etsy-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.buyer}
              onChange={setField("buyer")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-occasion">
              Occasion
            </label>
            <input
              id="etsy-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.occasion}
              onChange={setField("occasion")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-processing">
              Processing time
            </label>
            <input
              id="etsy-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.processingTime}
              onChange={setField("processingTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-personalisation">
              Personalisation offered
            </label>
            <input
              id="etsy-personalisation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.personalisation}
              onChange={setField("personalisation")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="etsy-angle">
              Story angle
            </label>
            <select
              id="etsy-angle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.storyAngle}
              onChange={setField("storyAngle")}
            >
              {STORY_ANGLES.map((angle) => (
                <option key={angle.id} value={angle.id}>
                  {angle.label}
                </option>
              ))}
            </select>
            {!failed && <p className={HINT_CLASS}>{result.angle.brief}</p>}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Details, materials and tags</h2>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-details">
              Item details — one per line
            </label>
            <textarea
              id="etsy-details"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.detailsRaw}
              onChange={setField("detailsRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-materials">
              Materials — one per line
            </label>
            <textarea
              id="etsy-materials"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.materialsRaw}
              onChange={setField("materialsRaw")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-tags">
              Tags — one per line
            </label>
            <textarea
              id="etsy-tags"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.tagsRaw}
              onChange={setField("tagsRaw")}
            />
            <p className={HINT_CLASS}>
              {TAGS_MAX} slots, {TAG_MAX_CHARS} characters each including spaces. Anything longer is
              flagged with a shortened suggestion.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Output shape</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-title-target">
              Title target (characters)
            </label>
            <input
              id="etsy-title-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max={TITLE_MAX_CHARS}
              step="5"
              value={form.titleTarget}
              onChange={setField("titleTarget")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-desc-words">
              Description length (words)
            </label>
            <input
              id="etsy-desc-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="900"
              step="10"
              value={form.descriptionWords}
              onChange={setField("descriptionWords")}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="etsy-headings"
            >
              <input
                id="etsy-headings"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeSectionHeadings}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, includeSectionHeadings: event.target.checked }))
                }
              />
              Use scannable section headings in the description
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
              Tag slots used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${stat(tagReport.slotsUsed)} / ${TAGS_MAX}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs to validate the listing."
                : `${stat(tagReport.multiWord)} multi-word · ${stat(tagReport.singleWord)} single-word`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("tags", tagReport ? tagReport.tags.join(", ") : "")}
              aria-label="Copy the validated Etsy tag list"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "tags" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "tags" ? "Copied!" : "Copy tags"}
            </button>
            <button
              type="button"
              onClick={() => copy("prompt", result.prompt)}
              aria-label="Copy the generated Etsy listing prompt"
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

        {!failed && tagReport.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tagReport.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm font-medium text-[var(--foreground)]"
              >
                {tag}
                <span className="ml-1 text-xs text-[var(--muted-foreground)]">{tag.length}</span>
              </li>
            ))}
          </ul>
        )}

        {!failed && tagReport.tooLong.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="pb-2 text-left text-sm font-semibold">
                Tags over {TAG_MAX_CHARS} characters
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Tag</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Length</th>
                  <th scope="col" className="py-2 font-semibold">Fits as</th>
                </tr>
              </thead>
              <tbody>
                {tagReport.tooLong.map((item) => (
                  <tr key={item.tag} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.tag}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-[var(--danger)]">{item.length}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{item.trimmed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Free tag slots", failed ? DASH : stat(tagReport.slotsFree)],
            ["Duplicate tags removed", failed ? DASH : stat(tagReport.duplicates.length)],
            ["Tags over the character limit", failed ? DASH : stat(tagReport.tooLong.length)],
            ["Tags that did not fit the 13 slots", failed ? DASH : stat(tagReport.overflow.length)],
            ["Details supplied", failed ? DASH : stat(result.stats.detailCount)],
            ["Materials accepted", failed ? DASH : stat(result.stats.materialCount)],
            ["Title headroom to the 140-character cap", failed ? DASH : stat(result.stats.titleHeadroom)],
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
        <h2 className="text-base font-semibold">Etsy field limits</h2>
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
              {ETSY_FIELD_LIMITS.map(([field, limit, note]) => (
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
        Etsy updates its seller policies and field limits from time to time, and some categories have
        extra requirements. Check the current seller handbook before publishing, and make sure every
        claim in your listing about materials, origin or safety is one you can support.
      </p>
    </main>
  );
}
