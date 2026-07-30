"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, MegaphoneOff, RotateCcw } from "lucide-react";
import { CHANNELS, REGIMES, buildWithdrawal } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  channel: "email",
  regime: "gdpr",
  fullName: "Priya Sharma",
  contact: "priya@example.com",
  company: "Example Retail Ltd",
  accountRef: "",
  includeThirdParties: true,
  requestConfirmation: true,
  alsoErase: false,
};

const FALLBACK_DATE = "2026-01-01";

export default function ToolHome() {
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [contact, setContact] = useState(DEFAULTS.contact);
  const [company, setCompany] = useState(DEFAULTS.company);
  const [accountRef, setAccountRef] = useState(DEFAULTS.accountRef);
  const [includeThirdParties, setIncludeThirdParties] = useState(DEFAULTS.includeThirdParties);
  const [requestConfirmation, setRequestConfirmation] = useState(DEFAULTS.requestConfirmation);
  const [alsoErase, setAlsoErase] = useState(DEFAULTS.alsoErase);
  const [sentOn, setSentOn] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setSentOn(local.toISOString().slice(0, 10));
  }, []);

  const result = useMemo(
    () =>
      buildWithdrawal({
        channel,
        regime,
        fullName,
        contact,
        company,
        accountRef,
        sentOn: sentOn || FALLBACK_DATE,
        includeThirdParties,
        requestConfirmation,
        alsoErase,
      }),
    [
      channel,
      regime,
      fullName,
      contact,
      company,
      accountRef,
      sentOn,
      includeThirdParties,
      requestConfirmation,
      alsoErase,
    ],
  );
  const ok = !result.error;

  const clipboardText = useMemo(() => {
    if (!ok) return "";
    return result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body;
  }, [ok, result]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setChannel(DEFAULTS.channel);
    setRegime(DEFAULTS.regime);
    setFullName(DEFAULTS.fullName);
    setContact(DEFAULTS.contact);
    setCompany(DEFAULTS.company);
    setAccountRef(DEFAULTS.accountRef);
    setIncludeThirdParties(DEFAULTS.includeThirdParties);
    setRequestConfirmation(DEFAULTS.requestConfirmation);
    setAlsoErase(DEFAULTS.alsoErase);
    setCopied(false);
  };

  const toggles = [
    [
      "opt-third",
      "Also ask them to tell partners they shared my details with",
      includeThirdParties,
      setIncludeThirdParties,
    ],
    ["opt-confirm", "Ask for written confirmation", requestConfirmation, setRequestConfirmation],
    [
      "opt-erase",
      "Ask them to delete my details from marketing lists",
      alsoErase,
      setAlsoErase,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MegaphoneOff className="h-4 w-4" aria-hidden="true" />
          Stop marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Marketing Consent Withdrawal Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes a consent-withdrawal message for email, SMS, a phone call or a letter, cites the
          right provision for where you live, and works out the date by which the company should
          have acted.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-channel">
              Sending it by
            </label>
            <select
              id="mcw-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channel}
              onChange={(event) => {
                setChannel(event.target.value);
                setCopied(false);
              }}
            >
              {CHANNELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-regime">
              Rules that apply to you
            </label>
            <select
              id="mcw-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => {
                setRegime(event.target.value);
                setCopied(false);
              }}
            >
              {REGIMES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-name">
              Your name as they hold it
            </label>
            <input
              id="mcw-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-contact">
              Email or number they contact you on
            </label>
            <input
              id="mcw-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contact}
              onChange={(event) => {
                setContact(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-company">
              Company
            </label>
            <input
              id="mcw-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={company}
              onChange={(event) => {
                setCompany(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-ref">
              Account or customer reference (optional)
            </label>
            <input
              id="mcw-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={accountRef}
              onChange={(event) => {
                setAccountRef(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mcw-date">
              Date you are sending it
            </label>
            <input
              id="mcw-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sentOn}
              onChange={(event) => {
                setSentOn(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {toggles.map(([id, label, value, setter]) => (
            <li key={id} className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={value}
                onChange={() => {
                  setter(!value);
                  setCopied(false);
                }}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              <label htmlFor={id} className="cursor-pointer text-sm">
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {!ok && (
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
              They should have acted by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.deadlineOn : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.deadlineLabel} from ${result.sentOn} · ${result.regimeLabel}`
                : "Complete the fields above to generate the message."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the withdrawal message"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy message"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Channel", ok ? result.channelLabel : DASH],
            ["Message length", ok ? `${result.characters} characters` : DASH],
            [
              "SMS cost if sent as a text",
              ok
                ? `${result.smsSegments} segment${result.smsSegments === 1 ? "" : "s"} (${result.smsUnits} ${result.smsEncoding} units)`
                : DASH,
            ],
            ["Escalate to", ok ? result.escalation : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.smsTooLong && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This text is over the {result.smsSingleLimit}-character single-message limit for{" "}
            {result.smsEncoding}, so it will be sent as {result.smsSegments} joined parts. Shorten
            the name or drop the reference if you want it to fit in one.
          </p>
        )}

        {ok && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.deadlineNote}
          </p>
        )}
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your message</h2>
          {result.subject && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Subject: </span>
              {result.subject}
            </p>
          )}
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.body}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. A company may keep a minimal suppression record —
        usually your email address or number in hashed form — precisely so it can honour your
        opt-out, and it may still send genuine service messages about an account you hold. If a
        company keeps marketing after the deadline, keep copies and raise it with the regulator
        named above.
      </p>
    </main>
  );
}
