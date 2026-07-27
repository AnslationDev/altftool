"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import {
  RECOMMENDED_MAX_TAG_CHARS,
  TAGS_FIELD_MAX_CHARS,
  VIDEO_TYPE_TARGETS,
  organiseTags,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  rawTags:
    "youtube seo, SEO, youtube seo, how to rank videos on youtube, video tags, youtube algorithm, ranking youtube videos in 2026, creator tips, tags",
  brand: "creator tips",
  videoTypeId: "tutorial",
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

const CLASS_LABEL = {
  brand: "Brand",
  broad: "Broad",
  specific: "Specific",
  longTail: "Long-tail",
};

export default function ToolHome() {
  const [rawTags, setRawTags] = useState(DEFAULTS.rawTags);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [videoTypeId, setVideoTypeId] = useState(DEFAULTS.videoTypeId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => organiseTags({ rawTags, brand, videoTypeId }),
    [rawTags, brand, videoTypeId],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRawTags(DEFAULTS.rawTags);
    setBrand(DEFAULTS.brand);
    setVideoTypeId(DEFAULTS.videoTypeId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Tag hygiene
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">YouTube Tag Organizer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a messy tag list. Get it deduped, grouped into brand, broad, specific and long-tail,
          and trimmed to fit YouTube&apos;s {NUM.format(TAGS_FIELD_MAX_CHARS)}-character tags field.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tag-list">
              Your tags (commas or new lines)
            </label>
            <textarea
              id="tag-list"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={6}
              value={rawTags}
              onChange={(event) => setRawTags(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tag-brand">
                Brand / channel terms (kept first)
              </label>
              <input
                id="tag-brand"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tag-type">
                Video type
              </label>
              <select
                id="tag-type"
                className={`mt-2 ${INPUT_CLASS}`}
                value={videoTypeId}
                onChange={(event) => setVideoTypeId(event.target.value)}
              >
                {VIDEO_TYPE_TARGETS.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters used of {NUM.format(TAGS_FIELD_MAX_CHARS)}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.usedChars)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.kept.length} tags kept · ${NUM.format(result.remainingChars)} characters spare`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the organised tag list"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy tags"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the tag organizer"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${Math.round(result.usedShare * 100)} percent of the tag character budget used`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.usedShare * 100))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Brand tags", hasError ? DASH : String(result.counts.brand)],
            ["Broad (1 word)", hasError ? DASH : String(result.counts.broad)],
            ["Specific (2 words)", hasError ? DASH : String(result.counts.specific)],
            ["Long-tail (3+ words)", hasError ? DASH : String(result.counts.longTail)],
            ["Duplicates removed", hasError ? DASH : String(result.duplicates.length)],
            ["Dropped for space", hasError ? DASH : String(result.dropped.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What changed</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Mix vs {result.videoType.label} target</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.videoType.note}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Group
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Have
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Target
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Gap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.mix.map((row) => (
                    <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">
                        {row.count} ({PCT.format(row.actualShare)})
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {row.targetCount} ({PCT.format(row.targetShare)})
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${row.delta === 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                      >
                        {row.delta > 0 ? `+${row.delta}` : row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Kept tags, in order</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.kept.map((item) => (
                <li
                  key={item.tag}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm"
                >
                  <span className="font-semibold">{item.tag}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {CLASS_LABEL[item.className]} · {item.cost}c
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {result.output}
              </pre>
            </div>
          </section>

          {result.dropped.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Did not fit</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.dropped.map((item) => (
                  <li
                    key={item.tag}
                    className="rounded-md bg-[var(--danger-soft)] px-2.5 py-1.5 text-sm font-medium text-[var(--danger)]"
                  >
                    {item.tag} ({item.cost}c)
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Character costs follow the YouTube Data API: commas between tags count, and a tag containing
        a space is wrapped in quotes that also count. Tags over {RECOMMENDED_MAX_TAG_CHARS}{" "}
        characters are flagged as budget-heavy, which is guidance rather than a platform limit.
      </p>
    </main>
  );
}
