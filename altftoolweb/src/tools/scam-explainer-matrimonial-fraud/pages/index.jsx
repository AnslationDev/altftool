"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartCrack, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AFTER_STEPS,
  CATEGORIES,
  CORE_RULE,
  CYBERCRIME_HELPLINE,
  CYBERCRIME_PORTAL,
  RED_FLAGS,
  SAFER_PRACTICE,
  VERIFICATION_CHECKS,
  assess,
  describeAmountIssue,
  formatBriefing,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const CATEGORY_LIST = Object.values(CATEGORIES);

const DEFAULTS = {
  flags: ["no-video", "unreachable-job"],
  verified: [],
  amounts: [""],
};

export default function ToolHome() {
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [verified, setVerified] = useState(DEFAULTS.verified);
  const [amounts, setAmounts] = useState(DEFAULTS.amounts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assess({
        flagIds: flags,
        verifiedIds: verified,
        amountsSent: amounts,
      }),
    [flags, verified, amounts],
  );

  const briefing = useMemo(() => formatBriefing(result), [result]);
  const failed = Boolean(result.error);
  const dash = "—";

  const toggleFlag = (id) => {
    setFlags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setCopied(false);
  };

  const toggleVerified = (id) => {
    setVerified((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const updateAmount = (index, value) => {
    setAmounts((current) => current.map((item, i) => (i === index ? value : item)));
    setCopied(false);
  };

  const addAmount = () => {
    setAmounts((current) => [...current, ""]);
    setCopied(false);
  };

  const removeAmount = (index) => {
    setAmounts((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
    setCopied(false);
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checker? This clears every red flag, verification check and transfer amount you've entered, and cannot be undone.",
      )
    ) {
      return;
    }
    setFlags(DEFAULTS.flags);
    setVerified(DEFAULTS.verified);
    setAmounts(DEFAULTS.amounts);
    setCopied(false);
  };

  const copyBriefing = async () => {
    if (!briefing) return;
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartCrack className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Matrimonial &amp; Dating Fraud Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what has actually happened in the profile, the story and the money, then set that
          against what you have verified independently. The combination is what decides the verdict,
          not either side on its own.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-lg leading-7 font-semibold text-[var(--primary)]">{CORE_RULE}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A profile that cannot be checked and a story that explains why it cannot be checked are the
          setup. Money is always the point.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What has actually happened?</h2>
        <div className="mt-4 space-y-6">
          {CATEGORY_LIST.map((category) => (
            <div key={category.id}>
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                {category.label}
              </h3>
              <div className="mt-3 space-y-3">
                {RED_FLAGS.filter((flag) => flag.category.id === category.id).map((flag) => (
                  <div key={flag.id}>
                    <label
                      htmlFor={`flag-${flag.id}`}
                      className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
                    >
                      <input
                        id={`flag-${flag.id}`}
                        type="checkbox"
                        className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                        checked={flags.includes(flag.id)}
                        onChange={() => toggleFlag(flag.id)}
                      />
                      {flag.label}
                    </label>
                    {flags.includes(flag.id) && (
                      <p className="mt-1 pl-8 text-sm leading-6 text-[var(--muted-foreground)]">
                        {flag.why}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What have you verified independently?</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Each of these is a check an outsider cannot fake. Tick only what you have actually done.
        </p>
        <div className="mt-4 space-y-3">
          {VERIFICATION_CHECKS.map((check) => (
            <label
              key={check.id}
              htmlFor={`verify-${check.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
            >
              <input
                id={`verify-${check.id}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={verified.includes(check.id)}
                onChange={() => toggleVerified(check.id)}
              />
              {check.label}
            </label>
          ))}
        </div>
        {!failed && (
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Verification coverage ${result.coverage.count} of ${result.coverage.total} checks`}
          >
            <span
              className="block h-full bg-[var(--success)]"
              style={{ width: `${Math.max(0, Math.min(100, result.coverage.percent))}%` }}
            />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Money already sent</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Add every transfer, top-up or fee, including a &quot;customs&quot; or &quot;clearance&quot;
          payment for a gift that never arrived.
        </p>
        <div className="mt-3 space-y-3">
          {amounts.map((amount, index) => {
            const issue = describeAmountIssue(amount);
            return (
              <div key={`amount-${index}`} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`amount-${index}`}>
                    Transfer {index + 1} (INR)
                  </label>
                  <input
                    id={`amount-${index}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    className={`mt-2 ${INPUT_CLASS} ${issue ? "border-[var(--danger)] focus:border-[var(--danger)]" : ""}`}
                    value={amount}
                    onChange={(event) => updateAmount(index, event.target.value)}
                    aria-invalid={issue ? "true" : undefined}
                    aria-describedby={issue ? `amount-${index}-error` : undefined}
                  />
                  {issue && (
                    <p id={`amount-${index}-error`} role="alert" className="mt-1 text-xs font-medium text-[var(--danger-text)]">
                      {issue} It is left out of the total below until fixed.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAmount(index)}
                  aria-label={`Remove transfer ${index + 1}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={addAmount} className={`mt-3 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another transfer
        </button>
        {!failed && result.exposure.count > 0 && (
          <p className="mt-4 text-sm leading-6">
            Total sent so far:{" "}
            <span className="font-semibold text-[var(--danger)]">{money(result.exposure.total)}</span>{" "}
            across {result.exposure.count} transfer(s), largest {money(result.exposure.largest)}.
          </p>
        )}
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {failed ? dash : result.verdict.label}
            </p>
            {!failed && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Warning-sign score {result.score} of {result.max} · verification {result.coverage.count}{" "}
                of {result.coverage.total} checks done
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBriefing}
              aria-label="Copy the fraud assessment"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy assessment"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <>
            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Warning-sign score ${result.score} out of ${result.max}`}
            >
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }}
              />
            </div>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm leading-6 ${TONE_CLASS[result.verdict.tone]}`}
              role={result.verdict.tone === "danger" ? "alert" : "status"}
              aria-live={result.verdict.tone === "danger" ? "assertive" : "polite"}
            >
              {result.reason}
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {Object.values(result.totals).map((total) => (
                <div key={total.category.id} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{total.category.label}</dt>
                  <dd className="text-right font-semibold">
                    {total.score} of {total.max}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Safer practice</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {SAFER_PRACTICE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">If you have already sent money</h3>
        <ol className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {AFTER_STEPS.map((step, index) => (
            <li key={step}>
              <span className="font-semibold text-[var(--foreground)]">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold">
          Helpline {CYBERCRIME_HELPLINE} · {CYBERCRIME_PORTAL}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The score is a structural screen, not a judgement about
        any individual — use it to decide what to verify next, not to accuse anyone. Nothing you type
        here leaves your browser.
      </p>
    </main>
  );
}
