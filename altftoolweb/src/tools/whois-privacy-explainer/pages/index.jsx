"use client";

import { useMemo, useState } from "react";
import { Check, Copy, EyeOff, RotateCcw } from "lucide-react";

import {
  PRIVACY_MODES,
  PURPOSES,
  REGISTRANT_TYPES,
  TLD_POLICIES,
  assessWhoisPrivacy,
  formatWhoisAssessment,
} from "../lib";

const DASH = "—";

const DEFAULTS = {
  registrantType: "individual",
  tldPolicy: "gtld",
  privacyMode: "none",
  purpose: "personal",
  filledOrganization: false,
  usesHomeAddress: true,
  usesPersonalContacts: true,
};

const FLAGS = [
  ["filledOrganization", "The Registrant Organization field is filled in"],
  ["usesHomeAddress", "The address on file is where I live"],
  ["usesPersonalContacts", "The phone and email on file are my personal ones"],
];

const STATUS_TONE = {
  published: "danger",
  redacted: "success",
  masked: "success",
  proxy: "success",
  anonymised: "success",
  absent: "success",
};

const SEVERITY_TONE = { high: "danger", medium: "warning", info: "primary" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

export default function ToolHome() {
  const [registrantType, setRegistrantType] = useState(DEFAULTS.registrantType);
  const [tldPolicy, setTldPolicy] = useState(DEFAULTS.tldPolicy);
  const [privacyMode, setPrivacyMode] = useState(DEFAULTS.privacyMode);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [flags, setFlags] = useState({
    filledOrganization: DEFAULTS.filledOrganization,
    usesHomeAddress: DEFAULTS.usesHomeAddress,
    usesPersonalContacts: DEFAULTS.usesPersonalContacts,
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessWhoisPrivacy({ registrantType, tldPolicy, privacyMode, purpose, ...flags }),
    [registrantType, tldPolicy, privacyMode, purpose, flags],
  );

  const hasError = Boolean(result.error);
  const summary = useMemo(
    () => (hasError ? "" : formatWhoisAssessment(result)),
    [result, hasError],
  );

  const toggleFlag = (key) => (event) => {
    const next = event.target.checked;
    setFlags((current) => ({ ...current, [key]: next }));
  };

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
    setRegistrantType(DEFAULTS.registrantType);
    setTldPolicy(DEFAULTS.tldPolicy);
    setPrivacyMode(DEFAULTS.privacyMode);
    setPurpose(DEFAULTS.purpose);
    setFlags({
      filledOrganization: DEFAULTS.filledOrganization,
      usesHomeAddress: DEFAULTS.usesHomeAddress,
      usesPersonalContacts: DEFAULTS.usesPersonalContacts,
    });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          DNS and certificates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">WHOIS Privacy Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What a public WHOIS or RDAP lookup actually shows about a domain owner today, field by
          field — and what a privacy or proxy service costs you in return for hiding it.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wpe-registrant">
              Who is the domain registered to?
            </label>
            <select
              id="wpe-registrant"
              className={`mt-2 ${INPUT_CLASS}`}
              value={registrantType}
              onChange={(event) => setRegistrantType(event.target.value)}
            >
              {REGISTRANT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wpe-purpose">
              What is it for?
            </label>
            <select
              id="wpe-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wpe-tld">
              Which kind of top-level domain?
            </label>
            <select
              id="wpe-tld"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tldPolicy}
              onChange={(event) => setTldPolicy(event.target.value)}
            >
              {TLD_POLICIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wpe-privacy">
              Privacy service
            </label>
            <select
              id="wpe-privacy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={privacyMode}
              onChange={(event) => setPrivacyMode(event.target.value)}
            >
              {PRIVACY_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What did you put on the registration?
          </legend>
          <div className="mt-3 grid gap-2">
            {FLAGS.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`wpe-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6"
              >
                <input
                  id={`wpe-${key}`}
                  type="checkbox"
                  checked={flags[key]}
                  onChange={toggleFlag(key)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Personal exposure
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Fields published in full", "Registry policy", "Privacy in effect"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Personal exposure
                </p>
                <p
                  className="mt-1 text-4xl font-semibold"
                  style={{ color: `var(--${result.band.tone})` }}
                >
                  {result.score}
                  <span className="text-xl font-normal text-[var(--muted-foreground)]">/100</span>
                </p>
                <p className="mt-1 text-sm font-semibold">{result.band.label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the WHOIS exposure assessment"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy assessment"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the explainer"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full"
                style={{
                  width: `${result.score}%`,
                  backgroundColor: `var(--${result.band.tone})`,
                }}
              />
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Fields published in full", `${result.exposedCount} of ${result.fieldCount}`],
                ["Registry policy", result.policy.summary],
                [
                  "Privacy in effect",
                  result.privacyActive
                    ? result.privacyMode.label
                    : result.privacyAllowed
                      ? "None — you are relying on registry defaults"
                      : "Not permitted by this registry",
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What a public lookup shows</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Field
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.fields.map((field) => (
                    <tr key={field.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{field.label}</span>
                        {field.note && (
                          <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {field.note}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: `var(--${STATUS_TONE[field.status]}-soft)`,
                            color: `var(--${STATUS_TONE[field.status]})`,
                          }}
                        >
                          {field.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Findings</h2>
            <ul className="mt-3 grid gap-3">
              {result.findings.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: `var(--${SEVERITY_TONE[item.severity]}-soft, var(--muted))`,
                        color: `var(--${SEVERITY_TONE[item.severity]})`,
                      }}
                    >
                      {item.severity}
                    </span>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What privacy costs you</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {result.tradeoffs.map((item) => (
                <div key={item.title} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="font-semibold">{item.title}</dt>
                  <dd className="leading-6 text-[var(--muted-foreground)]">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not legal advice. Country-code registries set their own rules, and a
        business operating a website may have disclosure obligations that exist regardless of what
        the registration record shows — consult a qualified adviser for your own situation.
      </p>
    </main>
  );
}
