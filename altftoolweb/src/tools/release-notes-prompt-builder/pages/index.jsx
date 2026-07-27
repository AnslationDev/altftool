"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Rocket, RotateCcw } from "lucide-react";

import { CHANNELS, LIMITS, buildReleaseNotesPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  productName: "Acme Cloud",
  version: "2.0",
  releaseDate: "2026-08-01",
  channelId: "blog",
  changeText:
    "breaking: the v1 auth header is no longer accepted\nsecurity: fixed stored XSS in comment rendering\ndeprecated: the legacy webhook payload shape\nfeature: bulk CSV import for contacts\nfeature: saved filters on the reports page\nimprovement: report export is about 3x faster on large accounts\nfix: the dropdown was clipped on mobile Safari\nknown: SSO logout does not clear the mobile session",
  highlightCount: "3",
  noticeDays: "90",
  notes: "",
};

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [version, setVersion] = useState(DEFAULTS.version);
  const [releaseDate, setReleaseDate] = useState(DEFAULTS.releaseDate);
  const [channelId, setChannelId] = useState(DEFAULTS.channelId);
  const [changeText, setChangeText] = useState(DEFAULTS.changeText);
  const [highlightCount, setHighlightCount] = useState(DEFAULTS.highlightCount);
  const [noticeDays, setNoticeDays] = useState(DEFAULTS.noticeDays);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildReleaseNotesPrompt({
        productName,
        version,
        releaseDate,
        channelId,
        changeText,
        highlightCount: Number(highlightCount),
        noticeDays: Number(noticeDays),
        notes,
      }),
    [productName, version, releaseDate, channelId, changeText, highlightCount, noticeDays, notes],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProductName(DEFAULTS.productName);
    setVersion(DEFAULTS.version);
    setReleaseDate(DEFAULTS.releaseDate);
    setChannelId(DEFAULTS.channelId);
    setChangeText(DEFAULTS.changeText);
    setHighlightCount(DEFAULTS.highlightCount);
    setNoticeDays(DEFAULTS.noticeDays);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Change kinds present", DASH],
        ["Word budget for this channel", DASH],
        ["Deprecations", DASH],
        ["Lines with no kind prefix", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Change kinds present",
          result.usedKinds
            .map((kind) => `${kind.label} ${result.byKind[kind.id]}`)
            .join(" · "),
        ],
        [
          "Word budget for this channel",
          `${NUM.format(result.channel.maxWords)} words · about ${NUM.format(result.estimatedReadMinutes)} min to read`,
        ],
        [
          "Deprecations",
          result.deprecationCount === 0
            ? "none"
            : `${NUM.format(result.deprecationCount)} — stops working ${result.removalDate}`,
        ],
        [
          "Lines with no kind prefix",
          result.unclassified === 0 ? "0 — all classified" : NUM.format(result.unclassified),
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Release notes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Release Notes Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prefix each shipped change with its kind. The builder orders them so
          breaking changes and security fixes come first, sizes the note for the
          channel, and works out the date a deprecation actually stops working.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-name">
              Product name
            </label>
            <input
              id="rn-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-version">
              Version or release name
            </label>
            <input
              id="rn-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-date">
              Release date
            </label>
            <input
              id="rn-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-channel">
              Published as
            </label>
            <select
              id="rn-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
            >
              {CHANNELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-highlights">
              Highlights up top ({LIMITS.highlights.min}–{LIMITS.highlights.max})
            </label>
            <input
              id="rn-highlights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.highlights.min}
              max={LIMITS.highlights.max}
              step="1"
              value={highlightCount}
              onChange={(event) => setHighlightCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-notice">
              Deprecation notice period (days)
            </label>
            <input
              id="rn-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.noticeDays.min}
              max={LIMITS.noticeDays.max}
              step="1"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-changes">
              Changes — one per line, prefixed breaking / security / deprecated /
              feature / improvement / fix / known
            </label>
            <textarea
              id="rn-changes"
              className={`mt-2 ${AREA_CLASS}`}
              rows={9}
              value={changeText}
              onChange={(event) => setChangeText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-notes">
              Extra instruction (optional)
            </label>
            <input
              id="rn-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. British spelling; mention the migration guide once"
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
              Changes to announce
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.itemCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Ordered so anything that breaks or exposes the reader comes first."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated release notes prompt"
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reading time uses 238 words per minute, the average adult silent reading
        rate for English reported in Brysbaert&apos;s 2019 meta-analysis. The
        removal date is your release date plus the notice period you set — check
        it against any contractual notice you owe customers.
      </p>
    </main>
  );
}
