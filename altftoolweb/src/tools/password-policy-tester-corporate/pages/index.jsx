"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, Eye, EyeOff, RotateCcw } from "lucide-react";
import { AD_DEFAULTS, CIS_MIN_LENGTH, evaluateCorporatePassword } from "../lib";

const DEFAULTS = {
  password: "Autumn2024!",
  username: "psharma",
  fullName: "Priya Sharma",
  ageDays: "20",
  minLength: String(CIS_MIN_LENGTH),
  maxAgeDays: String(AD_DEFAULTS.maxAgeDays),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function RuleList({ rules }) {
  return (
    <ul className="mt-3 space-y-2">
      {rules.map((rule) => (
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
  );
}

export default function ToolHome() {
  const [password, setPassword] = useState(DEFAULTS.password);
  const [username, setUsername] = useState(DEFAULTS.username);
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [ageDays, setAgeDays] = useState(DEFAULTS.ageDays);
  const [minLength, setMinLength] = useState(DEFAULTS.minLength);
  const [maxAgeDays, setMaxAgeDays] = useState(DEFAULTS.maxAgeDays);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => evaluateCorporatePassword({ password, username, fullName, ageDays, minLength, maxAgeDays }),
    [password, username, fullName, ageDays, minLength, maxAgeDays]
  );
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Corporate Password Policy Tester",
      `Rules passed: ${result.passedCount} of ${result.ruleCount}`,
      `Active Directory complexity: ${result.adPass ? "accepted" : "rejected"}`,
      `NIST SP 800-63B guidance: ${result.nistPass ? "meets it" : "does not meet it"}`,
      `Length: ${result.length} characters, ${result.categoryCount} of 5 AD categories`,
      `Estimated strength: ${result.bits.toFixed(1)} bits (${result.strength})`,
      `Offline cracking of a stolen NTLM hash: ${result.crackTimes.offlineFast}`,
      "Rule results:",
    ];
    result.rules.forEach((rule) => {
      lines.push(`- ${rule.passed ? "PASS" : "FAIL"} [${rule.standard}] ${rule.label}: ${rule.detail}`);
    });
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
    setUsername(DEFAULTS.username);
    setFullName(DEFAULTS.fullName);
    setAgeDays(DEFAULTS.ageDays);
    setMinLength(DEFAULTS.minLength);
    setMaxAgeDays(DEFAULTS.maxAgeDays);
    setReveal(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Enterprise policy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Corporate Password Policy Tester
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Test a candidate password against the two rule sets an enterprise password has to satisfy:
          the Active Directory complexity requirement (three of five character categories, no account
          or display name inside it) and NIST SP 800-63B, which asks for length, a breach check and no
          composition rules at all. Everything is evaluated locally in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="corp-password">
            Candidate password
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="corp-password"
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
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="corp-username">
              Username (sAMAccountName)
            </label>
            <input
              id="corp-username"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corp-fullname">
              Display name
            </label>
            <input
              id="corp-fullname"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corp-min">
              Policy minimum length
            </label>
            <input
              id="corp-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="256"
              step="1"
              value={minLength}
              onChange={(event) => setMinLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corp-maxage">
              Maximum password age in days (0 = never expires)
            </label>
            <input
              id="corp-maxage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3650"
              step="1"
              value={maxAgeDays}
              onChange={(event) => setMaxAgeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corp-age">
              Days since last change
            </label>
            <input
              id="corp-age"
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
              Windows defaults: history {AD_DEFAULTS.historyCount}, minimum age {AD_DEFAULTS.minAgeDays} day,
              maximum age {AD_DEFAULTS.maxAgeDays} days.
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
        <span className="sr-only" role="status" aria-live="polite">
          {failed
            ? "Enter a password above to see the policy test result."
            : `Active Directory: ${result.adPass ? "accepted" : "rejected"}, NIST: ${
                result.nistPass ? "met" : "not met"
              }, ${result.passedCount} of ${result.ruleCount} rules passed.`}
        </span>
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
                : `Active Directory: ${result.adPass ? "accepted" : "rejected"} · NIST 800-63B: ${result.nistPass ? "met" : "not met"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the corporate policy test result"
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
            ["Character categories used", failed ? DASH : `${result.categoryCount} of 5`],
            ["Estimated strength", failed ? DASH : `${result.bits.toFixed(1)} bits — ${result.strength}`],
            ["Deduction for guessable patterns", failed ? DASH : `${result.penalty} bits`],
            ["Guessing a lockout-protected sign-in", failed ? DASH : result.crackTimes.online],
            ["Cracking a stolen bcrypt hash", failed ? DASH : result.crackTimes.offlineSlow],
            ["Cracking a stolen NTLM hash", failed ? DASH : result.crackTimes.offlineFast],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[55%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Active Directory complexity</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          What the domain controller enforces when the password is set.
        </p>
        {failed ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p> : <RuleList rules={result.adRules} />}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">NIST SP 800-63B guidance</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          What current guidance asks for: length, a breach check, and no forced complexity or expiry.
        </p>
        {failed ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p> : <RuleList rules={result.nistRules} />}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the two disagree</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            A four-word passphrase can fail the Active Directory category rule while being far
            stronger than anything that passes it.
          </li>
          <li>
            NIST advises against periodic expiry: change a password on evidence of compromise, not on
            a calendar, because forced rotation drives predictable increments.
          </li>
          <li>{failed ? DASH : result.historyNote}</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Your organisation's configured policy, fine-grained password policies and
        any banned-password list take precedence over the defaults used here. Never enter a password
        you currently use into any website.
      </p>
    </main>
  );
}
