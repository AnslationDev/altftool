"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck, X } from "lucide-react";

import { CONTEXTS, TRUST_MODELS, assessCertificate, formatAssessment } from "../lib";

const DASH = "—";

const DEFAULTS = {
  context: "internal-corp",
  trustModel: "self-signed-leaf",
  browserUsers: true,
  handlesSecrets: true,
  teachesClickThrough: true,
  disabledVerification: false,
  internetReachable: false,
  hstsEnabled: false,
  androidApp: false,
};

const FLAGS = [
  ["browserUsers", "People open it in a browser"],
  ["handlesSecrets", "It carries credentials, personal or payment data"],
  ["teachesClickThrough", "People are told to accept the warning and continue"],
  ["disabledVerification", "Client code disables verification (rejectUnauthorized: false, curl -k, verify=False)"],
  ["internetReachable", "The host answers from the public internet"],
  ["hstsEnabled", "The host sends a Strict-Transport-Security header"],
  ["androidApp", "An Android app is one of the clients"],
];

const SEVERITY_TONE = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  info: "primary",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

export default function ToolHome() {
  const [context, setContext] = useState(DEFAULTS.context);
  const [trustModel, setTrustModel] = useState(DEFAULTS.trustModel);
  const [flags, setFlags] = useState(() => {
    const initial = {};
    for (const [key] of FLAGS) initial[key] = DEFAULTS[key];
    return initial;
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessCertificate({ context, trustModel, ...flags }),
    [context, trustModel, flags],
  );

  const hasError = Boolean(result.error);
  const summary = useMemo(() => (hasError ? "" : formatAssessment(result)), [result, hasError]);

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
    setContext(DEFAULTS.context);
    setTrustModel(DEFAULTS.trustModel);
    const initial = {};
    for (const [key] of FLAGS) initial[key] = DEFAULTS[key];
    setFlags(initial);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          DNS and certificates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Self Signed Certificate Risk Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          TLS gives you encryption and identity. A self-signed certificate gives you the first and
          none of the second. Describe where yours runs and this scores what that actually costs —
          and where it genuinely does not matter.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-context">
              Where is the certificate used?
            </label>
            <select
              id="ssc-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={context}
              onChange={(event) => setContext(event.target.value)}
            >
              {CONTEXTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-trust">
              How are clients meant to trust it?
            </label>
            <select
              id="ssc-trust"
              className={`mt-2 ${INPUT_CLASS}`}
              value={trustModel}
              onChange={(event) => setTrustModel(event.target.value)}
            >
              {TRUST_MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these are true?
          </legend>
          <div className="mt-3 grid gap-2">
            {FLAGS.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`ssc-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6"
              >
                <input
                  id={`ssc-${key}`}
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
              Risk score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Verdict", "Critical findings", "Recommended approach"].map((label) => (
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
                  Risk score
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
                  aria-label="Copy the certificate assessment"
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
                ["Context", result.context.label],
                ["Trust model", result.trustModel.label],
                ["Authentication you get", result.trustModel.authentication],
                ["Critical findings", `${result.criticalCount}`],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">What this certificate actually gives you</h2>
            <ul className="mt-3 grid gap-3">
              {result.guarantees.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `var(--${item.value ? "success" : "danger"}-soft)`,
                      color: `var(--${item.value ? "success" : "danger"})`,
                    }}
                    aria-hidden="true"
                  >
                    {item.value ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <span>
                    <span className="text-sm font-semibold">
                      {item.label}
                      <span className="sr-only">: {item.value ? "yes" : "no"}</span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-6 text-[var(--muted-foreground)]">
                      {item.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
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
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {item.detail}
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    <span className="font-semibold">Fix:</span> {item.fix}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Recommended approach</h2>
            <p className="mt-2 text-sm leading-6">{result.guidance}</p>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">How the score was reached</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Factor
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.contributions.map((item) => (
                    <tr key={item.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 leading-6">{item.label}</td>
                      <td className="py-2 text-right font-semibold">
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 pr-3 font-semibold">Total (capped at 100)</td>
                    <td className="py-2 text-right font-semibold">{result.score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational engineering guidance, not a security audit. The score compares configurations
        against each other; it does not measure your actual threat exposure.
      </p>
    </main>
  );
}
