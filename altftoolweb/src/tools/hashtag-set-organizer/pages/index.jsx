"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, RotateCcw, Shuffle } from "lucide-react";

import {
  analyzeHashtagSet,
  buildRotationSets,
  compareAcrossPlatforms,
  PLATFORM_RULES,
  SORT_MODES,
} from "../lib";

const DEFAULTS = {
  input:
    "#travel #Travel #wanderlust #solotravel #travelgram #backpacking #hiddengems #travelphotography #traveltips #weekendtrip",
  caption: "Three days, one backpack and a train ticket. Here is what the trip actually cost.",
  platform: "instagram",
  sort: "original",
  setCount: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const fmt = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULTS.input);
  const [caption, setCaption] = useState(DEFAULTS.caption);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [sort, setSort] = useState(DEFAULTS.sort);
  const [setCount, setSetCount] = useState(DEFAULTS.setCount);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () => analyzeHashtagSet({ input, platform, caption, sort }),
    [input, platform, caption, sort],
  );

  const hasError = Boolean(result.error);

  const rotation = useMemo(() => {
    if (hasError) return { sets: [] };
    const built = buildRotationSets(result.tags, { setCount: Number(setCount) });
    return built.error ? { sets: [], error: built.error } : built;
  }, [hasError, result, setCount]);

  const platformFit = useMemo(
    () => (hasError ? [] : compareAcrossPlatforms(result.tags, caption)),
    [hasError, result, caption],
  );

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setInput(DEFAULTS.input);
    setCaption(DEFAULTS.caption);
    setPlatform(DEFAULTS.platform);
    setSort(DEFAULTS.sort);
    setSetCount(DEFAULTS.setCount);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Hash className="h-4 w-4" aria-hidden="true" />
          Hashtag planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Hashtag Set Organizer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a messy pile of hashtags. This cleans them, drops duplicates, flags tags that will
          never turn into a link, and checks the set against the platform&apos;s published caption
          and hashtag limits.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tag-input">
              Hashtags (separate with spaces, commas or new lines)
            </label>
            <textarea
              id="tag-input"
              rows={5}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="caption-input">
              Caption text that will share the same field (optional)
            </label>
            <textarea
              id="caption-input"
              rows={3}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="platform">
                Platform
              </label>
              <select
                id="platform"
                className={`mt-2 ${INPUT_CLASS}`}
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                {Object.entries(PLATFORM_RULES).map(([key, rules]) => (
                  <option key={key} value={key}>
                    {rules.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sort">
                Order
              </label>
              <select
                id="sort"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {Object.entries(SORT_MODES).map(([key, mode]) => (
                  <option key={key} value={key}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="set-count">
                Rotation sets
              </label>
              <input
                id="set-count"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="10"
                step="1"
                value={setCount}
                onChange={(event) => setSetCount(event.target.value)}
              />
            </div>
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
              Clean hashtags kept
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : fmt(result.count)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.platformLabel}: ${fmt(result.maxHashtags)} hashtag cap, ${fmt(
                    result.maxChars,
                  )} character field`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(result.block, "block")}
              aria-label="Copy the cleaned hashtag block to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "block" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "block" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Duplicates removed", hasError ? DASH : fmt(result.duplicatesRemoved)],
            ["Entries rejected", hasError ? DASH : fmt(result.invalid.length)],
            ["Characters used by hashtags", hasError ? DASH : fmt(result.hashtagChars)],
            [
              "Characters used in total (caption + hashtags)",
              hasError ? DASH : `${fmt(result.totalChars)} of ${fmt(result.maxChars)}`,
            ],
            [
              "Characters left",
              hasError ? DASH : result.charsRemaining >= 0 ? fmt(result.charsRemaining) : `over by ${fmt(-result.charsRemaining)}`,
            ],
            [
              "Hashtag slots left",
              hasError
                ? DASH
                : result.hashtagsRemaining >= 0
                  ? fmt(result.hashtagsRemaining)
                  : `over by ${fmt(-result.hashtagsRemaining)}`,
            ],
            ["Average hashtag length", hasError ? DASH : `${result.averageTagLength} characters`],
            [
              "Inside the usual planning band",
              hasError
                ? DASH
                : result.withinRecommended
                  ? `Yes (${result.recommendedMin}–${result.recommendedMax})`
                  : `No — most posts on ${result.platformLabel} use ${result.recommendedMin}–${result.recommendedMax}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <p
              className={
                result.fits
                  ? "rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]"
                  : "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              }
            >
              {result.fits
                ? `This set fits ${result.platformLabel}. ${result.overflowNote}`
                : `Only the first ${fmt(result.fittingCount)} hashtags fit — ${fmt(
                    result.overLimit,
                  )} will not post. ${result.overflowNote}`}
            </p>
            <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 break-words">
              {result.block}
            </p>
          </div>
        )}
      </section>

      {!hasError && result.invalid.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Rejected entries</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.invalid.map((item, index) => (
              <li
                key={`${item.raw}-${index}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0"
              >
                <span className="font-semibold break-all">{item.raw}</span>
                <span className="text-[var(--muted-foreground)]">{item.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && rotation.sets.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Shuffle className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Rotation sets
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Tags are dealt round-robin, so each set gets a mix rather than a slice of the list.
          </p>
          <div className="mt-3 grid gap-3">
            {rotation.sets.map((set) => (
              <div
                key={set.name}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {set.name} · {fmt(set.count)} tags · {fmt(set.chars)} characters
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(set.block, set.name)}
                    aria-label={`Copy ${set.name} to clipboard`}
                    className={GHOST_BTN}
                  >
                    {copied === set.name ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied === set.name ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 break-words">{set.block}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasError && rotation.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {rotation.error}
        </p>
      )}

      {!hasError && platformFit.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where else this set fits</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Platform
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Hashtag cap
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Field limit
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Fits
                  </th>
                </tr>
              </thead>
              <tbody>
                {platformFit.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.hasHashtagCap ? fmt(row.maxHashtags) : "none"}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {fmt(row.maxChars)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.fits ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.fits
                        ? "Yes"
                        : row.hashtagsOver > 0
                          ? `${fmt(row.hashtagsOver)} too many`
                          : `${fmt(row.charsOver)} chars over`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Caps come from each platform&apos;s own help documentation. The recommended band is a
        planning guide from common publishing practice, not a platform rule — reach counts are not
        predicted here.
      </p>
    </main>
  );
}
