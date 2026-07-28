"use client";

import { useMemo, useState } from "react";
import { Check, Cookie, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import { COOKIE_CATEGORIES, REGIMES, TONES, buildBannerCopy } from "../lib";

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
  siteName: "Kettle & Co",
  regime: "gdpr-eu",
  categories: ["functional", "analytics", "advertising"],
  includeRejectAll: true,
  preChecked: false,
  policyUrl: "https://example.com/cookie-policy",
  prefsUrl: "https://example.com/cookie-settings",
  retentionMonths: "12",
  contactEmail: "privacy@example.com",
  tone: "plain",
};

export default function ToolHome() {
  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [categories, setCategories] = useState(DEFAULTS.categories);
  const [includeRejectAll, setIncludeRejectAll] = useState(DEFAULTS.includeRejectAll);
  const [preChecked, setPreChecked] = useState(DEFAULTS.preChecked);
  const [policyUrl, setPolicyUrl] = useState(DEFAULTS.policyUrl);
  const [prefsUrl, setPrefsUrl] = useState(DEFAULTS.prefsUrl);
  const [retentionMonths, setRetentionMonths] = useState(DEFAULTS.retentionMonths);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const raw = String(retentionMonths).trim();
    return buildBannerCopy({
      siteName,
      regime,
      categories,
      includeRejectAll,
      preChecked,
      policyUrl: policyUrl.trim(),
      prefsUrl: prefsUrl.trim(),
      retentionMonths: raw === "" ? NaN : Number(raw),
      contactEmail: contactEmail.trim(),
      tone,
    });
  }, [
    siteName,
    regime,
    categories,
    includeRejectAll,
    preChecked,
    policyUrl,
    prefsUrl,
    retentionMonths,
    contactEmail,
    tone,
  ]);

  const hasError = Boolean(result.error);

  const toggleCategory = (id) => {
    setCategories((current) =>
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
    setSiteName(DEFAULTS.siteName);
    setRegime(DEFAULTS.regime);
    setCategories(DEFAULTS.categories);
    setIncludeRejectAll(DEFAULTS.includeRejectAll);
    setPreChecked(DEFAULTS.preChecked);
    setPolicyUrl(DEFAULTS.policyUrl);
    setPrefsUrl(DEFAULTS.prefsUrl);
    setRetentionMonths(DEFAULTS.retentionMonths);
    setContactEmail(DEFAULTS.contactEmail);
    setTone(DEFAULTS.tone);
    setCopied(false);
  };

  const optionalCategories = COOKIE_CATEGORIES.filter((item) => !item.alwaysOn);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cookie className="h-4 w-4" aria-hidden="true" />
          Consent tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cookie Consent Banner Text Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write first-layer banner copy and the settings-panel text behind it, with accept, reject
          and preferences wording that matches the consent model your regime actually uses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-site">
              Site or company name
            </label>
            <input
              id="banner-site"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-regime">
              Privacy regime
            </label>
            <select
              id="banner-regime"
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
            <label className={LABEL_CLASS} htmlFor="banner-policy">
              Cookie policy URL
            </label>
            <input
              id="banner-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              inputMode="url"
              value={policyUrl}
              onChange={(event) => setPolicyUrl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-prefs">
              Persistent settings URL
            </label>
            <input
              id="banner-prefs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              inputMode="url"
              value={prefsUrl}
              onChange={(event) => setPrefsUrl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-months">
              Longest non-essential cookie lifetime (months)
            </label>
            <input
              id="banner-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={retentionMonths}
              onChange={(event) => setRetentionMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-email">
              Privacy contact email
            </label>
            <input
              id="banner-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              inputMode="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="banner-tone">
              Tone
            </label>
            <select
              id="banner-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Non-essential categories you actually use</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {optionalCategories.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`cat-${item.id}`}>
                <input
                  id={`cat-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={categories.includes(item.id)}
                  onChange={() => toggleCategory(item.id)}
                />
                <span className="font-semibold">{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="banner-reject">
            <input
              id="banner-reject"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={includeRejectAll}
              onChange={(event) => setIncludeRejectAll(event.target.checked)}
            />
            <span>Show a first-layer &ldquo;Reject all&rdquo; button</span>
          </label>
          <label className={CHECK_ROW} htmlFor="banner-prechecked">
            <input
              id="banner-prechecked"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={preChecked}
              onChange={(event) => setPreChecked(event.target.checked)}
            />
            <span>Non-essential toggles start switched on</span>
          </label>
        </div>
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
              Banner headline
            </p>
            <p className="mt-1 break-words text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.heading}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated cookie banner copy"
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

        <p className="mt-4 text-sm leading-6">{hasError ? DASH : result.body}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {hasError
            ? null
            : [result.buttons.primary, result.buttons.secondary, result.buttons.tertiary]
                .filter(Boolean)
                .map((label, index) => (
                  <span
                    key={label}
                    className={
                      index === 0
                        ? "inline-flex min-h-11 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                        : "inline-flex min-h-11 items-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold"
                    }
                  >
                    {label}
                  </span>
                ))}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Consent model",
              hasError
                ? DASH
                : result.model === "opt-in"
                  ? "Opt-in (consent before storage)"
                  : "Opt-out (notice + right to opt out)",
            ],
            ["Regime", hasError ? DASH : result.regimeLabel],
            ["Legal basis cited", hasError ? DASH : result.citation],
            ["Categories described", hasError ? DASH : String(result.categoryRows.length)],
            ["Compliance flags raised", hasError ? DASH : String(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Fix before you ship
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

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Settings panel (second layer)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Default
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Description shown to the user
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.categoryRows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.defaultState}
                    </td>
                    <td className="py-2 leading-6">{row.blurb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6">{result.retentionLine}</p>
          <p className="mt-2 text-sm leading-6">{result.withdrawal}</p>
          <p className="mt-2 text-sm leading-6">{result.reaskLine}</p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
            {result.footerLinks.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Drafting help, not legal advice. Copy alone does not make a banner compliant &mdash; the
        buttons must actually block non-essential scripts until consent is recorded, and the consent
        record must be auditable. Have counsel review before publishing.
      </p>
    </main>
  );
}
