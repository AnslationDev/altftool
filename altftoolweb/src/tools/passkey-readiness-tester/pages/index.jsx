"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  CEREMONY_MODES,
  FALLBACK_CHECKS,
  MEDIATION_MODES,
  VERDICTS,
  analysePasskeyOptions,
  formatReadinessReport,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_CHIP = {
  fail: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  pass: "bg-[var(--success-soft)] text-[var(--success)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const STATUS_WORD = { fail: "Fails", warn: "Check", pass: "Passes", info: "Note" };

const VERDICT_CHIP = {
  ready: "bg-[var(--success-soft)] text-[var(--success)]",
  workable: "bg-[var(--warning-soft)] text-[var(--foreground)]",
  blocked: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const REGISTRATION_SAMPLE = `{
  "rp": { "id": "example.com", "name": "Example" },
  "user": {
    "id": "9RdrOKQ0Rj6bY3sYuCoWJA",
    "name": "ada@example.com",
    "displayName": "Ada Lovelace"
  },
  "challenge": "Y2hhbGxlbmdlLWJ5dGVzLTMyLWxvbmctZXhhbXBsZQ",
  "pubKeyCredParams": [
    { "type": "public-key", "alg": -7 },
    { "type": "public-key", "alg": -257 }
  ],
  "timeout": 300000,
  "attestation": "none",
  "excludeCredentials": [],
  "authenticatorSelection": {
    "residentKey": "preferred",
    "userVerification": "preferred",
    "authenticatorAttachment": "platform"
  }
}`;

const AUTHENTICATION_SAMPLE = `{
  "challenge": "Y2hhbGxlbmdlLWJ5dGVzLTMyLWxvbmctZXhhbXBsZQ",
  "rpId": "example.com",
  "allowCredentials": [],
  "userVerification": "required"
}`;

const DEFAULTS = {
  json: REGISTRATION_SAMPLE,
  origin: "https://app.example.com",
  mode: "auto",
  mediation: "optional",
  fallback: {
    hasFallbackMethod: true,
    handlesNotAllowedError: false,
    checksAvailability: false,
    conditionalAutocomplete: false,
    crossDeviceOffered: false,
    allowsSecondPasskey: true,
  },
};

export default function ToolHome() {
  const [json, setJson] = useState(DEFAULTS.json);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [mediation, setMediation] = useState(DEFAULTS.mediation);
  const [fallback, setFallback] = useState(DEFAULTS.fallback);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analysePasskeyOptions({ json, origin, mode, mediation, fallback }),
    [json, origin, mode, mediation, fallback],
  );
  const report = useMemo(() => formatReadinessReport(result), [result]);

  const toggle = (key) => setFallback((current) => ({ ...current, [key]: !current[key] }));

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setJson(DEFAULTS.json);
    setOrigin(DEFAULTS.origin);
    setMode(DEFAULTS.mode);
    setMediation(DEFAULTS.mediation);
    setFallback(DEFAULTS.fallback);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          WebAuthn Level 3
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Passkey Readiness Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the options object you hand to navigator.credentials.create() or .get() and every member
          is checked against the WebAuthn Level 3 rules for discoverable credentials: RP ID against the
          origin, challenge length, user handle, algorithms, resident key, user verification, attachment,
          attestation and the extensions. The fallback questions below cover the part no options object can
          show. Nothing is uploaded — the checks run in this page.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-origin">
              Origin the ceremony runs on
            </label>
            <input
              id="pk-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="url"
              spellCheck="false"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-mode">
              Ceremony
            </label>
            <select
              id="pk-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {CEREMONY_MODES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-mediation">
              Mediation passed to navigator.credentials.get()
            </label>
            <select
              id="pk-mediation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mediation}
              onChange={(event) => setMediation(event.target.value)}
            >
              {MEDIATION_MODES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only applies to an authentication ceremony.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-json">
              Credential options JSON
            </label>
            <textarea
              id="pk-json"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={16}
              spellCheck="false"
              value={json}
              onChange={(event) => setJson(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Buffers such as challenge and user.id should be their base64url string form. A{" "}
              {"{ publicKey: … }"} wrapper is accepted too.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setJson(REGISTRATION_SAMPLE)}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Registration example
          </button>
          <button
            type="button"
            onClick={() => setJson(AUTHENTICATION_SAMPLE)}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Authentication example
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={copyResult} className={PRIMARY_BTN} disabled={!report}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy review"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Fallback and recovery</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          These cannot be read from an options object, so tick the ones your sign-in page actually does.
          Each unticked box explains what breaks.
        </p>
        <div className="mt-3 grid gap-2">
          {FALLBACK_CHECKS.map((check) => (
            <label
              key={check.key}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
              htmlFor={`pk-fb-${check.key}`}
            >
              <input
                id={`pk-fb-${check.key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={fallback[check.key] === true}
                onChange={() => toggle(check.key)}
              />
              <span>{check.label}</span>
            </label>
          ))}
        </div>
      </section>

      {result.error ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-sm leading-6 text-[var(--danger)]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{result.error}</span>
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-md px-3 py-1 text-sm font-semibold ${VERDICT_CHIP[result.verdict]}`}
              >
                {VERDICTS[result.verdict].label}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {result.ceremony === "registration" ? "Registration" : "Authentication"} ceremony
                {result.detected ? " (detected from the JSON)" : ""}
                {result.wrapped ? " · publicKey wrapper unwrapped" : ""}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {VERDICTS[result.verdict].detail}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Failing
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{result.counts.fail}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  To check
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {result.counts.warn + result.fallbackCounts.warn}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Passing
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {result.counts.pass + result.fallbackCounts.pass}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Options object</h2>
            <ul className="mt-4 space-y-2">
              {result.checks.map((check) => (
                <li
                  key={check.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_CHIP[check.status]}`}
                    >
                      {STATUS_WORD[check.status]}
                    </span>
                    <span className="text-sm font-semibold">{check.title}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {check.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Fallback UX</h2>
            <ul className="mt-4 space-y-2">
              {result.fallback.map((check) => (
                <li
                  key={check.key}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_CHIP[check.status]}`}
                    >
                      {STATUS_WORD[check.status]}
                    </span>
                    <span className="text-sm font-semibold">{check.label}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {check.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What this cannot see</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              This reads a static options object. It cannot call the WebAuthn API on your behalf, so it
              says nothing about whether your server verifies the response: the client data origin, the
              RP ID hash, the signature over authenticatorData and the client data hash, the UV flag, the
              BE and BS backup flags, and the signature counter all have to be checked in your own
              verification code. It also cannot tell whether the challenge is genuinely random and
              single-use, only how long it is.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
