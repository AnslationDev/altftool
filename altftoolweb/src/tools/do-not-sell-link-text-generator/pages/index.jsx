"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldOff, TriangleAlert } from "lucide-react";

import { REQUEST_METHODS, buildOptOutCopy } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm";
const DASH = "—";

const DEFAULTS = {
  businessName: "Kettle Retail LLC",
  sellsData: false,
  sharesForAds: true,
  usesSensitive: false,
  useCombinedLink: false,
  californiaOnly: false,
  methods: ["webform", "email", "gpc"],
  onlineOnly: true,
  requiresAccount: false,
  contactEmail: "privacy@example.com",
  tollFreeNumber: "",
};

export default function ToolHome() {
  const [businessName, setBusinessName] = useState(DEFAULTS.businessName);
  const [sellsData, setSellsData] = useState(DEFAULTS.sellsData);
  const [sharesForAds, setSharesForAds] = useState(DEFAULTS.sharesForAds);
  const [usesSensitive, setUsesSensitive] = useState(DEFAULTS.usesSensitive);
  const [useCombinedLink, setUseCombinedLink] = useState(DEFAULTS.useCombinedLink);
  const [californiaOnly, setCaliforniaOnly] = useState(DEFAULTS.californiaOnly);
  const [methods, setMethods] = useState(DEFAULTS.methods);
  const [onlineOnly, setOnlineOnly] = useState(DEFAULTS.onlineOnly);
  const [requiresAccount, setRequiresAccount] = useState(DEFAULTS.requiresAccount);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [tollFreeNumber, setTollFreeNumber] = useState(DEFAULTS.tollFreeNumber);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildOptOutCopy({
        businessName,
        sellsData,
        sharesForAds,
        usesSensitive,
        useCombinedLink,
        californiaOnly,
        methods,
        onlineOnly,
        requiresAccount,
        contactEmail,
        tollFreeNumber,
      }),
    [
      businessName,
      sellsData,
      sharesForAds,
      usesSensitive,
      useCombinedLink,
      californiaOnly,
      methods,
      onlineOnly,
      requiresAccount,
      contactEmail,
      tollFreeNumber,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleMethod = (id) => {
    setMethods((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBusinessName(DEFAULTS.businessName);
    setSellsData(DEFAULTS.sellsData);
    setSharesForAds(DEFAULTS.sharesForAds);
    setUsesSensitive(DEFAULTS.usesSensitive);
    setUseCombinedLink(DEFAULTS.useCombinedLink);
    setCaliforniaOnly(DEFAULTS.californiaOnly);
    setMethods(DEFAULTS.methods);
    setOnlineOnly(DEFAULTS.onlineOnly);
    setRequiresAccount(DEFAULTS.requiresAccount);
    setContactEmail(DEFAULTS.contactEmail);
    setTollFreeNumber(DEFAULTS.tollFreeNumber);
    setCopied(false);
  };

  const activityToggles = [
    ["opt-sells", "We sell personal information for money or other value", sellsData, setSellsData],
    [
      "opt-shares",
      "We share identifiers for cross-context behavioural advertising",
      sharesForAds,
      setSharesForAds,
    ],
    [
      "opt-sensitive",
      "We use sensitive personal information beyond permitted purposes",
      usesSensitive,
      setUsesSensitive,
    ],
    [
      "opt-combined",
      "Use the single “Your Privacy Choices” link instead of two links",
      useCombinedLink,
      setUseCombinedLink,
    ],
    ["opt-ca", "Label the combined link as California-specific", californiaOnly, setCaliforniaOnly],
    [
      "opt-online",
      "We operate exclusively online with a direct consumer relationship",
      onlineOnly,
      setOnlineOnly,
    ],
    [
      "opt-account",
      "Opting out currently requires signing in or creating an account",
      requiresAccount,
      setRequiresAccount,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
          Consent tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Do Not Sell Link Text Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out which CCPA opt-out links your site needs, get the exact statutory titles, and
          generate the footer wording, landing page steps and confirmation message to go with them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="opt-name">
              Business name
            </label>
            <input
              id="opt-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="opt-email">
              Privacy email address
            </label>
            <input
              id="opt-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              inputMode="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="opt-phone">
              Toll-free number (leave blank if you have none)
            </label>
            <input
              id="opt-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              inputMode="tel"
              value={tollFreeNumber}
              onChange={(event) => setTollFreeNumber(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What your business actually does</legend>
          <div className="mt-2 grid gap-2">
            {activityToggles.map(([id, label, value, setter]) => (
              <label key={id} className={CHECK_ROW} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Ways a consumer can submit the request</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {REQUEST_METHODS.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`method-${item.id}`}>
                <input
                  id={`method-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={methods.includes(item.id)}
                  onChange={() => toggleMethod(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Footer link text
            </p>
            <p className="mt-1 break-words text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.footerText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated opt-out link and page copy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy all copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Statutory links required", hasError ? DASH : String(result.stats.linkCount)],
            ["Request methods offered", hasError ? DASH : String(result.stats.methodCount)],
            [
              "Opt-out action deadline",
              hasError ? DASH : `${result.deadlines.optOutBusinessDays} business days`,
            ],
            [
              "Third parties notified within",
              hasError ? DASH : `${result.deadlines.notifyThirdPartiesDays} days`,
            ],
            [
              "Verifiable request deadline",
              hasError
                ? DASH
                : `${result.deadlines.verifiableRequestDays} days (max ${result.deadlines.maxWithExtensionDays} with extension)`,
            ],
            ["Compliance flags raised", hasError ? DASH : String(result.stats.warningCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 space-y-3">
            {result.linkLabels.map((link) => (
              <div
                key={link.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3"
              >
                <p className="text-sm font-semibold">{link.label}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{link.basis}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{link.note}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{result.landingHeading}</h2>
          <p className="mt-2 text-sm leading-6">{result.landingIntro}</p>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            How to opt out
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-6">
            {result.landingSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Confirmation message
          </h3>
          <p className="mt-2 text-sm leading-6">{result.confirmationText}</p>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Rights and deadlines to publish
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rightsLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Fix before you publish the link
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational drafting aid for California requirements, not legal advice. Other states
        including Colorado, Connecticut and Virginia have their own opt-out and universal
        opt-out-mechanism rules. Have a privacy attorney review the final page.
      </p>
    </main>
  );
}
