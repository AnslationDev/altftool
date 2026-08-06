"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SquareCheckBig, TriangleAlert } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { CHANNELS, FREQUENCIES, REGIMES, buildConsentCopy } from "../lib";

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
  brandName: "Kettle & Co",
  channels: ["email", "sms"],
  regime: "gdpr",
  frequency: "monthly",
  granular: true,
  preChecked: false,
  requiredToSubmit: false,
  thirdParties: "",
  privacyUrl: "https://example.com/privacy",
  postalAddress: "",
};

export default function ToolHome() {
  const [brandName, setBrandName] = useState(DEFAULTS.brandName);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [granular, setGranular] = useState(DEFAULTS.granular);
  const [preChecked, setPreChecked] = useState(DEFAULTS.preChecked);
  const [requiredToSubmit, setRequiredToSubmit] = useState(DEFAULTS.requiredToSubmit);
  const [thirdParties, setThirdParties] = useState(DEFAULTS.thirdParties);
  const [privacyUrl, setPrivacyUrl] = useState(DEFAULTS.privacyUrl);
  const [postalAddress, setPostalAddress] = useState(DEFAULTS.postalAddress);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      buildConsentCopy({
        brandName,
        channels,
        regime,
        frequency,
        granular,
        preChecked,
        requiredToSubmit,
        thirdParties,
        privacyUrl,
        postalAddress,
      }),
    [
      brandName,
      channels,
      regime,
      frequency,
      granular,
      preChecked,
      requiredToSubmit,
      thirdParties,
      privacyUrl,
      postalAddress,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleChannel = (id) => {
    setChannels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = () => {
    if (hasError) return;
    copy("result", result.plainText, { label: "consent checkbox copy" });
  };

  const reset = () => {
    setBrandName(DEFAULTS.brandName);
    setChannels(DEFAULTS.channels);
    setRegime(DEFAULTS.regime);
    setFrequency(DEFAULTS.frequency);
    setGranular(DEFAULTS.granular);
    setPreChecked(DEFAULTS.preChecked);
    setRequiredToSubmit(DEFAULTS.requiredToSubmit);
    setThirdParties(DEFAULTS.thirdParties);
    setPrivacyUrl(DEFAULTS.privacyUrl);
    setPostalAddress(DEFAULTS.postalAddress);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SquareCheckBig className="h-4 w-4" aria-hidden="true" />
          Consent tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Marketing Consent Checkbox Copy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate the exact checkbox labels, helper text and unsubscribe wording for a signup form
          &mdash; one box per channel, never pre-ticked, never a condition of signing up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-brand">
              Brand name
            </label>
            <input
              id="consent-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-regime">
              Regime
            </label>
            <select
              id="consent-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              {REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-frequency">
              How often you will send
            </label>
            <select
              id="consent-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-privacy">
              Privacy policy URL
            </label>
            <input
              id="consent-privacy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              inputMode="url"
              value={privacyUrl}
              onChange={(event) => setPrivacyUrl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-partners">
              Named third parties (leave blank if none)
            </label>
            <input
              id="consent-partners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. Klaviyo Inc. (email delivery)"
              value={thirdParties}
              onChange={(event) => setThirdParties(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="consent-address">
              Physical postal address (US footers)
            </label>
            <input
              id="consent-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={postalAddress}
              onChange={(event) => setPostalAddress(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Channels you want consent for</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`chan-${item.id}`}>
                <input
                  id={`chan-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={channels.includes(item.id)}
                  onChange={() => toggleChannel(item.id)}
                />
                <span className="font-semibold">{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Form behaviour (to test against the rules)</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="consent-granular">
              <input
                id="consent-granular"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={granular}
                onChange={(event) => setGranular(event.target.checked)}
              />
              <span>One checkbox per channel</span>
            </label>
            <label className={CHECK_ROW} htmlFor="consent-prechecked">
              <input
                id="consent-prechecked"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={preChecked}
                onChange={(event) => setPreChecked(event.target.checked)}
              />
              <span>Boxes start ticked</span>
            </label>
            <label className={CHECK_ROW} htmlFor="consent-required">
              <input
                id="consent-required"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={requiredToSubmit}
                onChange={(event) => setRequiredToSubmit(event.target.checked)}
              />
              <span>Required to submit the form</span>
            </label>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Messages you are promising per year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.stats.messagesPerYear}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to generate the copy."
                : result.stats.granular
                  ? `${result.stats.perChannelPerYear} per channel across ${result.stats.channelCount} channel${result.stats.channelCount === 1 ? "" : "s"}`
                  : `One combined checkbox covering ${result.stats.channelCount} channel${result.stats.channelCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("result")
                  ? "Copied the generated consent checkbox copy to clipboard"
                  : "Copy the generated consent checkbox copy"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Checkboxes generated", hasError ? DASH : String(result.stats.checkboxCount)],
            ["Channels covered", hasError ? DASH : String(result.stats.channelCount)],
            ["Regime", hasError ? DASH : result.regimeLabel],
            ["Rules cited", hasError ? DASH : result.citation],
            ["Compliance flags raised", hasError ? DASH : String(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Preview</h2>
          <div className="mt-3 space-y-3">
            {result.checkboxes.map((box) => (
              <div
                key={box.id}
                className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3"
              >
                <span
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border border-[var(--border)]"
                  aria-hidden="true"
                />
                <span className="text-sm leading-6">
                  <span className="font-medium">{box.label}</span>
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    {box.helper}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.helperText}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.submitNote}</p>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            How people stop the messages
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-6">
            {result.unsubscribeLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Fix before this form goes live
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
        Drafting aid, not legal advice. Good wording only counts if the form behaves the same way:
        boxes unticked, submission possible without them, and every tick logged with a timestamp,
        the form version and the exact text shown. Have counsel review before launch.
      </p>
    </main>
  );
}
