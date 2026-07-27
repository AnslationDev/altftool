"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCommitVertical, RotateCcw } from "lucide-react";

import { AUDIENCES, CHANGELOG_SECTIONS, TONES, buildChangelogPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  productName: "Acme SDK",
  currentVersion: "1.4.2",
  releaseDate: "2026-08-01",
  commitText:
    "feat(api): add cursor pagination to list endpoints\nfeat(api)!: drop the v1 endpoints\nfix(ui): stop the dropdown clipping on mobile Safari\nperf(query): cache the schema lookup\nchore: bump eslint to 9.x\ndocs: document the new cursor parameter",
  audienceId: "developer",
  toneId: "neutral",
  notes: "",
};

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [currentVersion, setCurrentVersion] = useState(DEFAULTS.currentVersion);
  const [releaseDate, setReleaseDate] = useState(DEFAULTS.releaseDate);
  const [commitText, setCommitText] = useState(DEFAULTS.commitText);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildChangelogPrompt({
        productName,
        currentVersion,
        releaseDate,
        commitText,
        audienceId,
        toneId,
        notes,
      }),
    [productName, currentVersion, releaseDate, commitText, audienceId, toneId, notes],
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
    setCurrentVersion(DEFAULTS.currentVersion);
    setReleaseDate(DEFAULTS.releaseDate);
    setCommitText(DEFAULTS.commitText);
    setAudienceId(DEFAULTS.audienceId);
    setToneId(DEFAULTS.toneId);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Bump implied by the commits", DASH],
        ["Breaking changes", DASH],
        ["Commits parsed", DASH],
        ["Sections in use", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Bump implied by the commits",
          result.release === "none" ? "none — nothing user-visible" : result.release,
        ],
        [
          "Breaking changes",
          result.breakingCount === 0 ? "0" : `${NUM.format(result.breakingCount)} — listed first`,
        ],
        [
          "Commits parsed",
          `${NUM.format(result.commitCount)}${result.unparsed > 0 ? ` (${NUM.format(result.unparsed)} not Conventional Commits)` : ""}`,
        ],
        [
          "Sections in use",
          result.usedSections.length === 0 ? "none" : result.usedSections.join(", "),
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
          <GitCommitVertical className="h-4 w-4" aria-hidden="true" />
          Release engineering
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Changelog Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your merged commit titles. Each one is classified by
          Conventional Commits, mapped to a Keep a Changelog section, and the
          resulting SemVer bump is worked out before the prompt is written.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-name">
              Product or package name
            </label>
            <input
              id="cl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-version">
              Current version (MAJOR.MINOR.PATCH)
            </label>
            <input
              id="cl-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="decimal"
              value={currentVersion}
              onChange={(event) => setCurrentVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-date">
              Release date (optional)
            </label>
            <input
              id="cl-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-audience">
              Written for
            </label>
            <select
              id="cl-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audienceId}
              onChange={(event) => setAudienceId(event.target.value)}
            >
              {AUDIENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-tone">
              Tone
            </label>
            <select
              id="cl-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cl-commits">
              Commit or merged PR titles — one per line
            </label>
            <textarea
              id="cl-commits"
              className={`mt-2 ${AREA_CLASS}`}
              rows={8}
              spellCheck={false}
              value={commitText}
              onChange={(event) => setCommitText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cl-notes">
              Extra instruction (optional)
            </label>
            <input
              id="cl-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. link every line to its pull request number"
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
              Next version
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.nextVersion}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.preRelease
                  ? "Major version 0 — the public API is not yet stable under SemVer."
                  : "Derived from the highest-ranking change in the set."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated changelog prompt"
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

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Commits
                  </th>
                </tr>
              </thead>
              <tbody>
                {CHANGELOG_SECTIONS.map((section) => (
                  <tr key={section} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{section}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {result.parsed.bySection[section]
                        ? NUM.format(result.parsed.bySection[section])
                        : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

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
        Classification follows Conventional Commits 1.0.0, section order follows
        Keep a Changelog 1.1.0, and the bump follows Semantic Versioning 2.0.0 —
        breaking wins over feature, feature over fix. Lines that are not in
        Conventional Commits format default to Changed and are flagged for
        review.
      </p>
    </main>
  );
}
