"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, Landmark, RotateCcw } from "lucide-react";
import {
  ALLOWED_SYMBOLS,
  MAX_LENGTH,
  MIN_LENGTH,
  PASSWORD_HISTORY,
  ROTATION_DAYS,
  evaluateBankPassword,
} from "../lib";

const DEFAULTS = {
  password: "Rahul@1985",
  userId: "rahul1985",
  dob: "15081985",
  ageDays: "45",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [password, setPassword] = useState(DEFAULTS.password);
  const [userId, setUserId] = useState(DEFAULTS.userId);
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [ageDays, setAgeDays] = useState(DEFAULTS.ageDays);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => evaluateBankPassword({ password, userId, dob, ageDays }),
    [password, userId, dob, ageDays]
  );
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Bank Password Policy Tester",
      `Rules passed: ${result.passedCount} of ${result.ruleCount}`,
      `Bank form would accept it: ${result.accepted ? "yes" : "no"}`,
      `Length: ${result.length} characters`,
      `Estimated strength: ${result.bits.toFixed(1)} bits (${result.strength})`,
      `Offline cracking (fast hash): ${result.crackTimes.offlineFast}`,
      `Throttled online guessing: ${result.crackTimes.online}`,
      "Rule results:",
    ];
    result.rules.forEach((rule) => {
      lines.push(`- ${rule.passed ? "PASS" : "FAIL"} ${rule.label} (${rule.requirement}): ${rule.detail}`);
    });
    if (result.warnings.length > 0) {
      lines.push("Pattern warnings:");
      result.warnings.forEach((warning) => lines.push(`- ${warning.title}: ${warning.detail}`));
    }
    lines.push(result.historyNote);
    return lines.join("\n");
  }, [failed, result]);

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
    setPassword(DEFAULTS.password);
    setUserId(DEFAULTS.userId);
    setDob(DEFAULTS.dob);
    setAgeDays(DEFAULTS.ageDays);
    setReveal(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Password policy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bank Password Policy Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check a candidate net-banking password against the rules retail banks publish —
          {" "}{MIN_LENGTH}&ndash;{MAX_LENGTH} characters, all four character classes, a restricted
          symbol list, nothing drawn from your user ID or date of birth — and see which rule fails.
          Everything runs in your browser and nothing is stored or sent.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="bank-password">
            Candidate password
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="bank-password"
              className={INPUT_CLASS}
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              aria-label={reveal ? "Hide the password" : "Show the password"}
              className={GHOST_BTN}
            >
              {reveal ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              {reveal ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Test a password you are about to set, not one you already use anywhere.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-userid">
              Customer / user ID
            </label>
            <input
              id="bank-userid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-dob">
              Date of birth (DDMMYYYY)
            </label>
            <input
              id="bank-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-age">
              Days since last change
            </label>
            <input
              id="bank-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={ageDays}
              onChange={(event) => setAgeDays(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              Accepted special characters: <span className="font-mono">{ALLOWED_SYMBOLS}</span>
            </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rules passed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.passedCount} / ${result.ruleCount}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : result.accepted
                  ? "A typical bank form would accept this"
                  : `Would be rejected: ${result.failedRules.join(", ")}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the policy test result"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Length", failed ? DASH : `${result.length} characters`],
            ["Estimated strength", failed ? DASH : `${result.bits.toFixed(1)} bits — ${result.strength}`],
            ["Character pool", failed ? DASH : `${result.pool} possible characters`],
            ["Deduction for guessable patterns", failed ? DASH : `${result.penalty} bits`],
            ["Guessing a throttled login form", failed ? DASH : result.crackTimes.online],
            ["Cracking a stolen bcrypt hash", failed ? DASH : result.crackTimes.offlineSlow],
            ["Cracking a stolen fast hash", failed ? DASH : result.crackTimes.offlineFast],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[55%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rule by rule</h2>
        {failed ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {result.rules.map((rule) => (
              <li key={rule.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      rule.passed
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                  >
                    {rule.passed ? "Pass" : "Fail"}
                  </span>
                  <span className="text-sm font-semibold">{rule.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{rule.requirement}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{rule.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Passes the rules but stays guessable</h2>
          <ul className="mt-3 space-y-3">
            {result.warnings.map((warning) => (
              <li key={warning.id} className="rounded-lg bg-[var(--warning-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--warning)]">{warning.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{warning.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the tester cannot see</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>{failed ? DASH : result.historyNote}</li>
          <li>
            Whether your bank forces a change every {ROTATION_DAYS} days or on a different cycle, and
            whether the last {PASSWORD_HISTORY} passwords are blocked, varies by bank.
          </li>
          <li>
            Your login password is only one factor. The transaction password, the debit-card PIN and
            the OTP device all need separate protection.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not affiliated with any bank. Rules differ between banks and change
        over time — the form on your bank's own site is the authority. Never type a password you
        currently use into any website, including this one.
      </p>
    </main>
  );
}
