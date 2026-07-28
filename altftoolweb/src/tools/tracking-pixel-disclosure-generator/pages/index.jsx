"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, RotateCcw, TriangleAlert } from "lucide-react";

import { LEGAL_BASES, PIXEL_CATALOG, REGIONS, buildPixelDisclosure } from "../lib";

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
  controllerName: "Kettle Retail Limited",
  pixels: ["ga4", "meta-pixel", "google-ads"],
  region: "eu",
  legalBasis: "consent",
  retentionMonths: "14",
  contactEmail: "privacy@example.com",
  lastUpdated: "2026-07-28",
};

export default function ToolHome() {
  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [controllerName, setControllerName] = useState(DEFAULTS.controllerName);
  const [pixels, setPixels] = useState(DEFAULTS.pixels);
  const [region, setRegion] = useState(DEFAULTS.region);
  const [legalBasis, setLegalBasis] = useState(DEFAULTS.legalBasis);
  const [retentionMonths, setRetentionMonths] = useState(DEFAULTS.retentionMonths);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [lastUpdated, setLastUpdated] = useState(DEFAULTS.lastUpdated);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const raw = String(retentionMonths).trim();
    return buildPixelDisclosure({
      siteName,
      controllerName,
      pixels,
      region,
      legalBasis,
      retentionMonths: raw === "" ? NaN : Number(raw),
      contactEmail: contactEmail.trim(),
      lastUpdated,
    });
  }, [siteName, controllerName, pixels, region, legalBasis, retentionMonths, contactEmail, lastUpdated]);

  const hasError = Boolean(result.error);

  const togglePixel = (id) => {
    setPixels((current) =>
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
    setControllerName(DEFAULTS.controllerName);
    setPixels(DEFAULTS.pixels);
    setRegion(DEFAULTS.region);
    setLegalBasis(DEFAULTS.legalBasis);
    setRetentionMonths(DEFAULTS.retentionMonths);
    setContactEmail(DEFAULTS.contactEmail);
    setLastUpdated(DEFAULTS.lastUpdated);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Consent tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tracking Pixel Disclosure Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the pixels your site actually loads and get the disclosure paragraph, the vendor
          table with identifiers and purposes, and the opt-out list &mdash; plus flags for the
          obligations each pixel drags in with it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-site">
              Site name
            </label>
            <input
              id="pixel-site"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-controller">
              Legal entity (controller)
            </label>
            <input
              id="pixel-controller"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={controllerName}
              onChange={(event) => setControllerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-region">
              Main audience / regime
            </label>
            <select
              id="pixel-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-basis">
              Lawful basis claimed
            </label>
            <select
              id="pixel-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={legalBasis}
              onChange={(event) => setLegalBasis(event.target.value)}
            >
              {LEGAL_BASES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-retention">
              Your retention period (months)
            </label>
            <input
              id="pixel-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={retentionMonths}
              onChange={(event) => setRetentionMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pixel-email">
              Privacy contact email
            </label>
            <input
              id="pixel-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              inputMode="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pixel-updated">
              &ldquo;Last updated&rdquo; date on the disclosure
            </label>
            <input
              id="pixel-updated"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastUpdated}
              onChange={(event) => setLastUpdated(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Pixels and tags on your site</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PIXEL_CATALOG.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`pixel-${item.id}`}>
                <input
                  id={`pixel-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={pixels.includes(item.id)}
                  onChange={() => togglePixel(item.id)}
                />
                <span>
                  <span className="font-semibold">{item.name}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{item.vendor}</span>
                </span>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Third parties to disclose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.stats.vendorCount}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to generate the disclosure."
                : `across ${result.stats.pixelCount} pixel${result.stats.pixelCount === 1 ? "" : "s"} on ${result.regionLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated pixel disclosure"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy disclosure"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pixels selected", hasError ? DASH : String(result.stats.pixelCount)],
            ["Pixels storing an identifier", hasError ? DASH : String(result.stats.deviceStoringCount)],
            ["Advertising pixels", hasError ? DASH : String(result.stats.advertisingCount)],
            ["Vendors that may process outside the EEA", hasError ? DASH : String(result.stats.transferCount)],
            [
              "Longest vendor default retention",
              hasError ? DASH : `${result.stats.longestVendorRetention} months`,
            ],
            ["Prior consent required", hasError ? DASH : result.consentRequired ? "Yes" : "No (opt-out model)"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{result.title}</h2>
          <p className="mt-2 text-sm font-medium leading-6">{result.summary}</p>
          {result.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {paragraph}
            </p>
          ))}

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Pixels in use
          </h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Pixel</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Vendor</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Purpose</th>
                  <th scope="col" className="py-2 font-semibold">Identifiers</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.vendor}</td>
                    <td className="py-2 pr-3 leading-6">{row.purpose}</td>
                    <td className="py-2 leading-6 text-[var(--muted-foreground)]">{row.identifiers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            How to opt out
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 break-words">
            {result.optOutLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Obligations these pixels bring with them
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
        Informational drafting aid, not legal advice. Vendors rename cookies and change retention
        defaults, so verify every identifier against your own tag manager and each vendor&apos;s
        current documentation before publishing, and have counsel review the final wording.
      </p>
    </main>
  );
}
