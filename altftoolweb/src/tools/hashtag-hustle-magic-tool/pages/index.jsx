"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, Info, RotateCcw } from "lucide-react";

import {
  BANDS,
  OPEN_PLATFORM_CEILING,
  PLATFORMS,
  PLATFORM_IDS,
  buildCopyOutput,
  generateHashtags,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  text:
    "Slow morning routine: a long sourdough proof, one flat white and thirty minutes with a book before the laptop opens. The sourdough starter lives on the windowsill and gets fed at 7am sharp.",
  platform: "instagram",
  count: "12",
  extraKeywords: "slow living, home baking",
  casing: "lower",
  captionLimit: "",
  tagsInFirstComment: false,
};

const DASH = "—";

const BAND_ORDER = ["yours", "specific", "topical", "broad"];

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [count, setCount] = useState(DEFAULTS.count);
  const [extraKeywords, setExtraKeywords] = useState(DEFAULTS.extraKeywords);
  const [casing, setCasing] = useState(DEFAULTS.casing);
  const [captionLimit, setCaptionLimit] = useState(DEFAULTS.captionLimit);
  const [tagsInFirstComment, setTagsInFirstComment] = useState(DEFAULTS.tagsInFirstComment);
  const [copied, setCopied] = useState(false);

  const platformDef = PLATFORMS[platform] ?? PLATFORMS.instagram;
  const hardCap = platformDef.maxHashtags ?? OPEN_PLATFORM_CEILING;

  const result = useMemo(
    () =>
      generateHashtags({
        text,
        platform,
        count: count === "" ? Number.NaN : Number(count),
        extraKeywords,
        casing,
        captionLimit: captionLimit === "" ? undefined : Number(captionLimit),
        tagsInFirstComment,
      }),
    [text, platform, count, extraKeywords, casing, captionLimit, tagsInFirstComment],
  );

  const hasError = Boolean(result.error);
  const copyText = useMemo(() => (hasError ? "" : buildCopyOutput(result)), [result, hasError]);

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setPlatform(DEFAULTS.platform);
    setCount(DEFAULTS.count);
    setExtraKeywords(DEFAULTS.extraKeywords);
    setCasing(DEFAULTS.casing);
    setCaptionLimit(DEFAULTS.captionLimit);
    setTagsInFirstComment(DEFAULTS.tagsInFirstComment);
    setCopied(false);
  };

  const chars = hasError ? null : result.chars;
  const overBudget = chars ? chars.remaining < 0 : false;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Hash className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Hashtag Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds a hashtag set out of the words in your own post, then checks it against the posting
          limits of the platform you picked. It runs entirely in this browser and has no trend feed:
          it can tell you what a tag <em>is</em> and whether it will post, not how many people
          searched it this week.
        </p>
      </header>

      <section
        aria-label="Post and platform"
        className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-text">
              Post copy or topic
            </label>
            <textarea
              id="hh-text"
              className={`${AREA_CLASS} mt-1 min-h-32`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the caption you are about to publish, or type a topic."
            />
            <p className={HINT_CLASS}>
              Hashtags you already typed with a # are kept and cleaned; everything else is derived
              from the words here.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="hh-platform">
                Platform
              </label>
              <select
                id="hh-platform"
                className={`${INPUT_CLASS} mt-1`}
                value={platform}
                onChange={(event) => {
                  const next = event.target.value;
                  setPlatform(next);
                  const nextCap = PLATFORMS[next].maxHashtags ?? OPEN_PLATFORM_CEILING;
                  if (Number(count) > nextCap) setCount(String(nextCap));
                }}
              >
                {PLATFORM_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PLATFORMS[id].label}
                  </option>
                ))}
              </select>
              <p className={HINT_CLASS}>
                {platformDef.maxHashtags
                  ? `Hard cap ${platformDef.maxHashtags} hashtags`
                  : "No published hashtag cap"}
                {" · "}
                {platformDef.suggested[0]}–{platformDef.suggested[1]} suggested (
                {platformDef.suggestedSource === "platform" ? "platform guidance" : "common practice"})
              </p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="hh-count">
                How many hashtags
              </label>
              <input
                id="hh-count"
                type="number"
                inputMode="numeric"
                min="1"
                max={hardCap}
                className={`${INPUT_CLASS} mt-1`}
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
              <p className={HINT_CLASS}>
                1 to {hardCap} for {platformDef.label}.
              </p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="hh-keywords">
                Extra keywords (optional)
              </label>
              <input
                id="hh-keywords"
                type="text"
                className={`${INPUT_CLASS} mt-1`}
                value={extraKeywords}
                onChange={(event) => setExtraKeywords(event.target.value)}
                placeholder="brand name, city, product"
              />
              <p className={HINT_CLASS}>Comma separated. These outrank words found in the copy.</p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="hh-casing">
                Casing
              </label>
              <select
                id="hh-casing"
                className={`${INPUT_CLASS} mt-1`}
                value={casing}
                onChange={(event) => setCasing(event.target.value)}
              >
                <option value="lower">lowercase — #slowmorning</option>
                <option value="camel">CamelCase — #SlowMorning</option>
              </select>
              <p className={HINT_CLASS}>
                Both match the same hashtag; CamelCase is the one screen readers can read out.
              </p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="hh-limit">
                Caption budget override
              </label>
              <input
                id="hh-limit"
                type="number"
                inputMode="numeric"
                min="1"
                className={`${INPUT_CLASS} mt-1`}
                value={captionLimit}
                onChange={(event) => setCaptionLimit(event.target.value)}
                placeholder={String(platformDef.captionLimit)}
              />
              <p className={HINT_CLASS}>
                Defaults to {NUM.format(platformDef.captionLimit)} characters. Platforms move these
                numbers — change it if your app allows more.
              </p>
            </div>

            <div className="flex items-end">
              <label
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
                htmlFor="hh-comment"
              >
                <input
                  id="hh-comment"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={tagsInFirstComment}
                  onChange={(event) => setTagsInFirstComment(event.target.checked)}
                />
                Post the tag block as the first comment
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={!copyText}
            aria-label="Copy the hashtag block"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy hashtags"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the sample post">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        aria-label="Hashtag set"
        className="mt-4 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">
          {hasError ? "Hashtags" : `${platformDef.label} set`}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--primary)]">
          {hasError ? DASH : `${result.selectedCount} hashtags`}
        </p>

        <p className="mt-3 break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-7">
          {hasError ? DASH : result.block}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters used
            </dt>
            <dd
              className={`text-sm font-semibold tabular-nums ${
                overBudget ? "text-[var(--danger)]" : ""
              }`}
            >
              {hasError ? DASH : `${NUM.format(chars.caption)} of ${NUM.format(chars.budget)}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              {overBudget ? "Over budget by" : "Characters left"}
            </dt>
            <dd
              className={`text-sm font-semibold tabular-nums ${
                overBudget ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {hasError ? DASH : NUM.format(Math.abs(chars.remaining))}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Tag block length
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {hasError ? DASH : `${NUM.format(chars.block)} characters`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Band mix</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : BAND_ORDER.filter((band) => result.counts[band] > 0)
                    .map((band) => `${result.counts[band]} ${BANDS[band].label.toLowerCase()}`)
                    .join(" · ") || DASH}
            </dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section
        aria-label="Where each hashtag came from"
        className="mt-4 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <h2 className="text-base font-semibold">Where each hashtag came from</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Nothing here is guessed. Every row names the words in your copy that produced it.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Hashtag
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Built from
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Chars
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.tags.map((tag) => (
                  <tr key={tag.tag} className="border-b border-[var(--border)]/60 align-top">
                    <td className="py-2 pr-3 font-medium break-all">{tag.text}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{BANDS[tag.band].label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{tag.note}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{tag.chars}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          {BAND_ORDER.map((band) => (
            <div key={band} className="grid gap-0.5">
              <dt className="font-semibold">{BANDS[band].label}</dt>
              <dd className="text-[var(--muted-foreground)]">{BANDS[band].blurb}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-label="Platform rules"
        className="mt-4 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          {platformDef.label} rules worth knowing
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          {platformDef.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>
            This tool has no access to hashtag volume, reach or ban lists — those need a live API.
            Check a shortlisted tag in the platform&apos;s own search before you commit to it.
          </li>
        </ul>
      </section>
    </div>
  );
}
