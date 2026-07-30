"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, RotateCcw } from "lucide-react";

import {
  MANUAL_CHECKS,
  PAYROLL_LURE_ANATOMY,
  VERIFICATION_PROTOCOL,
  assessPayrollRedirect,
  estimateDiversionExposure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_STYLE = {
  critical: { label: "Red flag", chip: "bg-[var(--danger-soft)] text-[var(--danger)]" },
  warn: { label: "Caution", chip: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  info: { label: "Note", chip: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warn: "text-[var(--warning)]",
  ok: "text-[var(--success)]",
};

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "GBP", locale: "en-GB", label: "GBP £" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "AED", locale: "en-AE", label: "AED" },
];

const DEFAULTS = {
  fromAddress: "priya.menon.hr@gmail.com",
  replyTo: "",
  employerDomain: "acme.com",
  body:
    "Hi payroll, I've changed banks and no longer have access to my old account. Please update my salary account before this month's payroll run. I'm in meetings all day so email only. Please confirm once updated.",
  answers: { accountNameMismatch: true, refusedVoiceCheck: true, outsideHrSystem: true },
  netPay: "85000",
  employees: "1",
  cycles: "1",
  currency: "INR",
};

export default function ToolHome() {
  const [fromAddress, setFromAddress] = useState(DEFAULTS.fromAddress);
  const [replyTo, setReplyTo] = useState(DEFAULTS.replyTo);
  const [employerDomain, setEmployerDomain] = useState(DEFAULTS.employerDomain);
  const [body, setBody] = useState(DEFAULTS.body);
  const [answers, setAnswers] = useState(DEFAULTS.answers);
  const [netPay, setNetPay] = useState(DEFAULTS.netPay);
  const [employees, setEmployees] = useState(DEFAULTS.employees);
  const [cycles, setCycles] = useState(DEFAULTS.cycles);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(
    () => assessPayrollRedirect({ fromAddress, replyTo, employerDomain, body, answers }),
    [fromAddress, replyTo, employerDomain, body, answers],
  );

  const exposure = useMemo(
    () =>
      estimateDiversionExposure({
        netPayPerCycle: netPay.trim() === "" ? NaN : Number(netPay),
        employees: employees.trim() === "" ? NaN : Number(employees),
        cycles: cycles.trim() === "" ? NaN : Number(cycles),
      }),
    [netPay, employees, cycles],
  );

  const money = useMemo(() => {
    const picked = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
    const fmt = new Intl.NumberFormat(picked.locale, {
      style: "currency",
      currency: picked.code,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? fmt.format(value) : "—");
  }, [currency]);

  const hasError = Boolean(assessment.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Payroll bank-change request review",
      `Risk score: ${assessment.score}/100 — ${assessment.band}`,
      "",
      ...assessment.findings.map((f) => `• [${SEVERITY_STYLE[f.severity].label}] ${f.title} — ${f.detail}`),
    ];
    if (!exposure.error) {
      lines.push("", `Exposure if processed: ${money(exposure.perCycle)} per cycle, ${money(exposure.total)} over ${exposure.cycles} cycle(s).`);
    }
    lines.push("", "Before actioning:", ...VERIFICATION_PROTOCOL.map((s, i) => `${i + 1}. ${s}`));
    return lines.join("\n");
  }, [hasError, assessment, exposure, money]);

  const copy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFromAddress(DEFAULTS.fromAddress);
    setReplyTo(DEFAULTS.replyTo);
    setEmployerDomain(DEFAULTS.employerDomain);
    setBody(DEFAULTS.body);
    setAnswers(DEFAULTS.answers);
    setNetPay(DEFAULTS.netPay);
    setEmployees(DEFAULTS.employees);
    setCycles(DEFAULTS.cycles);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const toggle = (id) => setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <Banknote className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Payroll Redirect Phishing Anatomy</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Someone claiming to be an employee asks HR to pay their salary into a new account. This
            page takes that request apart, scores it against the business email compromise pattern
            and shows the verification steps that stop it. Runs entirely in your browser.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The request you received</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="pr-from">From address</label>
              <input
                id="pr-from"
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pr-reply">Reply-To address</label>
              <input
                id="pr-reply"
                type="text"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="optional"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-employer">Your organisation&apos;s mail domain</label>
            <input
              id="pr-employer"
              type="text"
              value={employerDomain}
              onChange={(e) => setEmployerDomain(e.target.value)}
              placeholder="acme.com"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-body">Message text</label>
            <textarea
              id="pr-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the request"
              className={`${TEXTAREA_CLASS} mt-1.5`}
            />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold">Things only you can check</h3>
        <ul className="mt-2 grid gap-2">
          {MANUAL_CHECKS.map((check) => (
            <li key={check.id}>
              <label
                htmlFor={`pr-${check.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`pr-${check.id}`}
                  type="checkbox"
                  checked={Boolean(answers[check.id])}
                  onChange={() => toggle(check.id)}
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                />
                <span>{check.question}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {hasError && (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {assessment.error}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Red-flag score</p>
            <p className={`text-4xl font-extrabold tabular-nums ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[assessment.tone]}`}>
              {hasError ? "—" : `${assessment.score}/100`}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasError ? "—" : assessment.band}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={hasError}
              aria-label="Copy the review to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the worked example" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <ul className="mt-5 grid gap-3">
            {assessment.findings.map((finding) => (
              <li key={finding.title} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[finding.severity].chip}`}>
                    {SEVERITY_STYLE[finding.severity].label}
                  </span>
                  <span className="text-sm font-semibold">{finding.title}</span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
              </li>
            ))}
            {!assessment.findings.length && (
              <li className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
                Nothing matched a known pattern. Bank changes still go through the same voice
                verification — a clean-looking request from a compromised internal mailbox reads
                exactly like this.
              </li>
            )}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What it costs if it goes through</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Salary diversion normally surfaces on pay day, when the employee reports the money never
          arrived — so one full cycle is the minimum loss.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-pay">Net pay per cycle</label>
            <input
              id="pr-pay"
              type="number"
              inputMode="decimal"
              min="0"
              value={netPay}
              onChange={(e) => setNetPay(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-currency">Currency</label>
            <select
              id="pr-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-employees">Employees affected</label>
            <input
              id="pr-employees"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-cycles">Pay cycles before detection</label>
            <input
              id="pr-cycles"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={cycles}
              onChange={(e) => setCycles(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
        </div>

        {exposure.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {exposure.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Diverted per pay cycle</dt>
            <dd className="text-right font-semibold">{exposure.error ? "—" : money(exposure.perCycle)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Total before it is noticed</dt>
            <dd className={`text-right text-base font-bold ${exposure.error ? "text-[var(--muted-foreground)]" : "text-[var(--danger)]"}`}>
              {exposure.error ? "—" : money(exposure.total)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anatomy of the fake HR request</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Typical wording</th>
                <th scope="col" className="py-2 font-semibold">Why it works</th>
              </tr>
            </thead>
            <tbody>
              {PAYROLL_LURE_ANATOMY.map((row) => (
                <tr key={row.part} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{row.part}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-[var(--muted-foreground)]">{row.lure}</td>
                  <td className="py-2.5 leading-6 text-[var(--muted-foreground)]">{row.tell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How to verify a genuine bank change</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {VERIFICATION_PROTOCOL.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational analysis of text you paste in. It cannot check mail authentication records,
        confirm an employee&apos;s identity or validate a bank account, so a low score is not
        approval to process a change. Follow your organisation&apos;s payroll controls and report
        suspected fraud to your bank and security team the same day.
      </p>
    </main>
  );
}
