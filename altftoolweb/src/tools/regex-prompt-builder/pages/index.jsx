"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Regex, RotateCcw } from "lucide-react";

import { FLAGS, FLAVOURS, buildRegexPrompt, validateExamples } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

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
  description: "Match Indian vehicle registration numbers like MH 12 AB 1234",
  flavourId: "javascript",
  flagIds: ["i"],
  wholeString: true,
  matchText: "MH 12 AB 1234\nDL 01 CAA 5555\nKA05MJ2211",
  nonMatchText: "MH 12 1234\nXX 99 ZZ 99999\n12 AB 1234",
};

const DASH = "—";

export default function ToolHome() {
  const [description, setDescription] = useState(DEFAULTS.description);
  const [flavourId, setFlavourId] = useState(DEFAULTS.flavourId);
  const [flagIds, setFlagIds] = useState(DEFAULTS.flagIds);
  const [wholeString, setWholeString] = useState(DEFAULTS.wholeString);
  const [matchText, setMatchText] = useState(DEFAULTS.matchText);
  const [nonMatchText, setNonMatchText] = useState(DEFAULTS.nonMatchText);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const examples = validateExamples({ matchText, nonMatchText });
    if (examples.error) return examples;
    return buildRegexPrompt({ description, flavourId, flagIds, wholeString, examples });
  }, [description, flavourId, flagIds, wholeString, matchText, nonMatchText]);

  const hasError = Boolean(result.error);

  const toggleFlag = (id) => {
    setFlagIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setDescription(DEFAULTS.description);
    setFlavourId(DEFAULTS.flavourId);
    setFlagIds(DEFAULTS.flagIds);
    setWholeString(DEFAULTS.wholeString);
    setMatchText(DEFAULTS.matchText);
    setNonMatchText(DEFAULTS.nonMatchText);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Must-match examples", DASH],
        ["Must-not-match examples", DASH],
        ["Flavour", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Must-match examples", String(result.examples.matches.length)],
        ["Must-not-match examples", String(result.examples.nonMatches.length)],
        ["Flavour", result.flavour.label],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Regex className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Regex Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List strings the pattern must match and must not match, pick the
          flavour, and get a prompt that forces the model to verify the regex
          against every example — with conflicts caught before you ask.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rxp-desc">
              What should the regex find?
            </label>
            <input
              id="rxp-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rxp-match">
              Must match (one per line)
            </label>
            <textarea
              id="rxp-match"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={matchText}
              onChange={(event) => setMatchText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rxp-nonmatch">
              Must NOT match (one per line, optional)
            </label>
            <textarea
              id="rxp-nonmatch"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={nonMatchText}
              onChange={(event) => setNonMatchText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rxp-flavour">
              Regex flavour
            </label>
            <select
              id="rxp-flavour"
              className={`mt-2 ${INPUT_CLASS}`}
              value={flavourId}
              onChange={(event) => setFlavourId(event.target.value)}
            >
              {FLAVOURS.map((flavour) => (
                <option key={flavour.id} value={flavour.id}>
                  {flavour.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={LABEL_CLASS}>Flags</span>
            <div className="mt-2 grid gap-1">
              {FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                  htmlFor={`rxp-flag-${flag.id}`}
                >
                  <input
                    id={`rxp-flag-${flag.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={flagIds.includes(flag.id)}
                    onChange={() => toggleFlag(flag.id)}
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="rxp-whole"
        >
          <input
            id="rxp-whole"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={wholeString}
            onChange={(event) => setWholeString(event.target.checked)}
          />
          Pattern must match the whole string (anchored)
        </label>
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
              Test cases in the prompt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : NUM.format(
                    result.examples.matches.length + result.examples.nonMatches.length,
                  )}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Every example becomes a row the model must verify the regex against."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated regex prompt"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
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
        Flavour limitations stated in the prompt (RE2's lack of lookaround and
        backreferences, POSIX ERE's missing shorthand classes) come from each
        engine's documentation. Always run the returned regex against your own
        test cases before shipping it.
      </p>
    </main>
  );
}
