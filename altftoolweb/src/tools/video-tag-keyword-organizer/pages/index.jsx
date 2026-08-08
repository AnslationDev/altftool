"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, Tags } from "lucide-react";

import { buildTagSet, LONG_TAG_CHARS, MAX_TAG_CHARS, parseGroups } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_GROUPS = `Channel core: video editing, editing tutorial, how to edit video, video editing for beginners
Topic - colour: colour grading, color grading tutorial, davinci resolve colour, log footage
Topic - audio: audio for video, fix bad audio, voiceover recording
Long tail: how to colour grade log footage in davinci resolve, best export settings for youtube
Brand: pixelcraft studio, pixelcraft tutorials`;

const DASH = "—";

export default function ToolHome() {
  const [groupText, setGroupText] = useState(DEFAULT_GROUPS);
  const [selected, setSelected] = useState(["Channel core", "Topic - colour", "Brand"]);
  const [budget, setBudget] = useState(String(MAX_TAG_CHARS));
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const groups = useMemo(() => parseGroups(groupText), [groupText]);

  const result = useMemo(
    () => buildTagSet({ groups, selected, maxChars: Number(budget) }),
    [groups, selected, budget],
  );

  const hasError = Boolean(result.error);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const toggleGroup = (name) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const copyResult = async () => {
    if (hasError || !result.tagString) return;
    try {
      await navigator.clipboard.writeText(result.tagString);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (groupText !== DEFAULT_GROUPS && !window.confirm("Reset the keyword groups back to the default example? Your edits will be lost.")) {
      return;
    }
    setGroupText(DEFAULT_GROUPS);
    setSelected(["Channel core", "Topic - colour", "Brand"]);
    setBudget(String(MAX_TAG_CHARS));
    setCopied(false);
  };

  const usedPercent = hasError ? 0 : Math.min(100, (result.chars / result.budget) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Video marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video Tag Keyword Organizer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keep your keyword sets in named groups, then tick the groups a video needs. Duplicates are
          removed, the character cost is counted the way the tags field counts it, and anything that
          will not fit inside {MAX_TAG_CHARS} characters is listed separately instead of being cut
          off silently.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="tags-groups">
            Keyword groups — one per line, &quot;Group name: tag, tag, tag&quot;
          </label>
          <textarea
            id="tags-groups"
            className={`mt-2 ${AREA_CLASS}`}
            rows={8}
            value={groupText}
            onChange={(event) => setGroupText(event.target.value)}
          />
        </div>

        {groups.length > 0 && (
          <fieldset className="mt-4">
            <legend className={LABEL_CLASS}>Groups to use on this video</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {groups.map((group) => (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  aria-pressed={selected.includes(group.name)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    selected.includes(group.name)
                      ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {group.name}
                  <span className="ml-2 text-xs font-normal">{group.tags.length}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-4 sm:max-w-xs">
          <label className={LABEL_CLASS} htmlFor="tags-budget">
            Character budget
          </label>
          <input
            id="tags-budget"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="1"
            max="5000"
            step="10"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters used
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : `${result.chars} / ${result.budget}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Pick a group to build a tag set." : `${result.tagCount} tags fit, ${result.excluded.length} left out`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the tag list" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy tags"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the organizer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasError ? "No tag set" : `${Math.round(usedPercent)} percent of the character budget used`}
        >
          <span className="block h-full bg-[var(--primary)]" style={{ width: `${usedPercent}%` }} />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tags in the set", hasError ? DASH : String(result.tagCount)],
            ["Characters left", hasError ? DASH : String(result.remaining)],
            ["Duplicates removed", hasError ? DASH : String(result.duplicatesRemoved)],
            ["Tags left out", hasError ? DASH : String(result.excluded.length)],
            ["Average tag length", hasError ? DASH : `${result.averageTagLength.toFixed(1)} chars`],
            ["Distinct keywords covered", hasError ? DASH : String(result.uniqueWords)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Notes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-[var(--danger)]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tags in this set</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.included.map((entry) => (
              <li
                key={entry.tag}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                title={`${entry.group} · ${entry.length} characters`}
              >
                {entry.tag}
              </li>
            ))}
          </ul>

          {result.excluded.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold">Left out — no room</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.excluded.map((entry) => (
                  <li
                    key={entry.tag}
                    className="rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                    title={`${entry.group} · ${entry.length} characters`}
                  >
                    {entry.tag}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-5 overflow-x-auto">
            <pre className="min-w-max whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-6">
              {result.tagString}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The tags field holds {MAX_TAG_CHARS} characters in total, commas included, which is what the
        counter above measures. Tags are a minor ranking signal compared with the title, thumbnail
        and description — use them for spellings and phrasings the title cannot carry, and keep
        individual tags under about {LONG_TAG_CHARS} characters.
      </p>
    </main>
  );
}
