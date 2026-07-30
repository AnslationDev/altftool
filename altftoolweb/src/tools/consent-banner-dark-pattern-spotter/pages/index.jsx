"use client";

import { useMemo, useState } from "react";
import { Check, Cookie, Copy, RotateCcw } from "lucide-react";
import { analyzeBanner, MAX_CLICKS, PATTERN_GROUPS, PATTERNS } from "../lib";

const DASH = "—";

const DEFAULT_PRESENT = [
  "no-reject-first-layer",
  "colour-contrast",
  "legitimate-interest",
  "vendor-flood",
];
const DEFAULT_ACCEPT = "1";
const DEFAULT_REJECT = "4";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [present, setPresent] = useState(DEFAULT_PRESENT);
  const [acceptClicks, setAcceptClicks] = useState(DEFAULT_ACCEPT);
  const [rejectClicks, setRejectClicks] = useState(DEFAULT_REJECT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyzeBanner({
        presentIds: present,
        acceptClicks: acceptClicks.trim() === "" ? Number.NaN : Number(acceptClicks),
        rejectClicks: rejectClicks.trim() === "" ? Number.NaN : Number(rejectClicks),
      }),
    [present, acceptClicks, rejectClicks],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setPresent((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Cookie banner dark pattern report",
      `Manipulation score: ${result.percent}% (${result.score} of ${result.maxScore}) — ${result.bandLabel}`,
      `${result.foundCount} of ${result.totalPatterns} patterns present, ${result.criticalCount} of them serious.`,
      `Clicks to accept: ${result.acceptClicks}. Clicks to refuse: ${result.rejectClicks}.`,
      "",
      "Patterns found:",
    ];
    result.findings.forEach((pattern, index) => {
      lines.push(`${index + 1}. ${pattern.label} (severity ${pattern.severity}/5)`);
      lines.push(`   ${pattern.rule}`);
    });
    if (result.findings.length === 0) lines.push("None.");
    lines.push("", "What to do as a reader:");
    result.readerSteps.forEach((step) => lines.push(`- ${step}`));
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPresent(DEFAULT_PRESENT);
    setAcceptClicks(DEFAULT_ACCEPT);
    setRejectClicks(DEFAULT_REJECT);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Cookie className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Consent Banner Dark Pattern Spotter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Look at the cookie banner in front of you and tick what you can see. You get a
          manipulation score, the rule each pattern runs into, and the steps to refuse properly on
          that specific banner.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What does the banner do?</h2>
        <div className="mt-4 space-y-6">
          {PATTERN_GROUPS.map((group) => (
            <fieldset key={group.id} className="border-0 p-0">
              <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {group.label}
              </legend>
              <div className="mt-2 space-y-2">
                {PATTERNS.filter((pattern) => pattern.group === group.id).map((pattern) => (
                  <label
                    key={pattern.id}
                    htmlFor={`cb-${pattern.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                  >
                    <input
                      id={`cb-${pattern.id}`}
                      type="checkbox"
                      checked={present.includes(pattern.id)}
                      onChange={() => toggle(pattern.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{pattern.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {pattern.spot}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-accept">
              Clicks to accept everything
            </label>
            <input
              id="cb-accept"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_CLICKS}
              step="1"
              value={acceptClicks}
              onChange={(event) => {
                setAcceptClicks(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-reject">
              Clicks to refuse everything
            </label>
            <input
              id="cb-reject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_CLICKS}
              step="1"
              value={rejectClicks}
              onChange={(event) => {
                setRejectClicks(event.target.value);
                setCopied(false);
              }}
            />
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
              Manipulation score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.percent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.bandLabel} — ${result.bandAdvice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the dark pattern report"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the spotter to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Patterns present",
              hasError ? DASH : `${result.foundCount} of ${result.totalPatterns}`,
            ],
            ["Serious ones (severity 4–5)", hasError ? DASH : String(result.criticalCount)],
            ["Severity points", hasError ? DASH : `${result.score} of ${result.maxScore}`],
            [
              "Extra clicks to refuse",
              hasError
                ? DASH
                : result.asymmetric
                  ? `${result.extraClicks} more than accepting`
                  : "None — refusing is as easy as accepting",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {result.byGroup.map((group) => (
                <div
                  key={group.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <span className="text-[var(--muted-foreground)]">{group.label}</span>
                  <span className="ml-2 font-semibold">
                    {group.found}/{group.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What to do on this banner</h2>
          <ul className="mt-3 space-y-2">
            {result.readerSteps.map((step) => (
              <li
                key={step}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6"
              >
                {step}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.findings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Patterns found, worst first</h2>
          <ol className="mt-3 space-y-3">
            {result.findings.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    Severity {pattern.severity}/5
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold">{pattern.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {pattern.why}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Rule: {pattern.rule}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  If you run the site: {pattern.fix}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not legal advice or a compliance assessment. The rules cited are the
        published positions of EU regulators and the courts; whether a specific banner breaches
        them is a matter for a supervisory authority, and requirements differ outside the EU and
        UK.
      </p>
    </main>
  );
}
