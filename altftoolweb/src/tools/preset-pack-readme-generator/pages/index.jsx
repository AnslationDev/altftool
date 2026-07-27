"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";
import { LICENCE_TIERS, PRODUCT_TYPES, buildReadme } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  packName: "Golden Hour Film Pack",
  creator: "Studio Nine",
  version: "1.2",
  productTypeId: "lightroom-classic",
  fileCount: "24",
  licenceId: "commercial",
  supportEmail: "support@studionine.example",
  websiteUrl: "https://studionine.example",
  purchaseNote: "Includes a printable quick-start card",
  includeChangelog: true,
  year: "2026",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      buildReadme({
        packName: form.packName,
        creator: form.creator,
        version: form.version,
        productTypeId: form.productTypeId,
        fileCount: Number(form.fileCount),
        licenceId: form.licenceId,
        supportEmail: form.supportEmail,
        websiteUrl: form.websiteUrl,
        purchaseNote: form.purchaseNote,
        includeChangelog: form.includeChangelog,
        year: Number(form.year),
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const textField = (id, label, key, type = "text", extra = {}) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type={type}
        value={form[key]}
        onChange={(event) => setField(key, event.target.value)}
        {...extra}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Digital product
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Preset Pack Readme Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the pack details and get a complete README in Markdown: what is in the download,
          the real install path for that host application, plain-language licence terms and a
          support section. Drop it in the zip next to your files.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("readme-name", "Pack name", "packName")}
          {textField("readme-creator", "Creator or studio", "creator")}
          {textField("readme-version", "Version", "version")}
          {textField("readme-year", "Copyright year", "year", "number", { min: 1990, max: 2200, step: 1 })}

          <div>
            <label className={LABEL_CLASS} htmlFor="readme-product">
              Product type
            </label>
            <select
              id="readme-product"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.productTypeId}
              onChange={(event) => setField("productTypeId", event.target.value)}
            >
              {PRODUCT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {textField("readme-count", "Number of files", "fileCount", "number", {
            min: 1,
            max: 5000,
            step: 1,
            inputMode: "numeric",
          })}

          <div>
            <label className={LABEL_CLASS} htmlFor="readme-licence">
              Licence tier
            </label>
            <select
              id="readme-licence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.licenceId}
              onChange={(event) => setField("licenceId", event.target.value)}
            >
              {LICENCE_TIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {textField("readme-email", "Support email", "supportEmail", "email")}
          {textField("readme-site", "Website", "websiteUrl", "url")}
          {textField("readme-note", "Extra line for What's inside", "purchaseNote")}

          <div className="flex items-end sm:col-span-2">
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="readme-changelog"
            >
              <input
                id="readme-changelog"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.includeChangelog}
                onChange={(event) => setField("includeChangelog", event.target.checked)}
              />
              Include a changelog section
            </label>
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              README length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.wordCount)} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fill in the required fields to generate the document."
                : `About ${NUM.format(result.readingMinutes)} min to read · ${result.sectionCount} sections`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the README as Markdown"
              onClick={() => copy(result.markdown, "md")}
              disabled={failed}
            >
              {copied === "md" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "md" ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the README as plain text"
              onClick={() => copy(result.plainText, "txt")}
              disabled={failed}
            >
              {copied === "txt" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "txt" ? "Copied!" : "Copy plain text"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Suggested zip file name", failed ? DASH : result.zipName],
            ["Host application", failed ? DASH : result.productLabel],
            ["Install steps included", failed ? DASH : String(result.stepCount)],
            ["Licence tier", failed ? DASH : result.licenceLabel],
            ["Characters", failed ? DASH : NUM.format(result.characterCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Generated README.md</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-5">
              {result.markdown}
            </pre>
          </div>
        </section>
      )}

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you publish</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="border-l-2 border-[var(--primary)] pl-3">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The licence wording is a plain-language template for convenience and is not legal advice.
        Consumer-protection and refund rules differ by country and by marketplace — have a lawyer
        review your terms before you sell at any scale.
      </p>
    </main>
  );
}
