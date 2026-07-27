"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw, TriangleAlert } from "lucide-react";

import { PLATFORMS, REGIONS, RELATIONSHIPS, buildDisclosure } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  platform: "instagramFeed",
  region: "us",
  relationship: "paid",
  brand: "Northwind Coffee",
  labelChoice: "",
  customLabel: "",
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const approvedLabels = REGIONS[form.region] ? REGIONS[form.region].approvedLabels : [];
  const labelChoice =
    form.labelChoice === "custom" || approvedLabels.includes(form.labelChoice) ? form.labelChoice : "";
  const chosenLabel = labelChoice === "custom" ? form.customLabel : labelChoice;

  const result = useMemo(
    () =>
      buildDisclosure({
        platform: form.platform,
        region: form.region,
        relationship: form.relationship,
        brand: form.brand,
        label: chosenLabel,
      }),
    [form.platform, form.region, form.relationship, form.brand, chosenLabel],
  );

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Ad disclosure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sponsored Disclosure Label Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write a paid-partnership disclosure that reads clearly, fits before the caption is cut
          off, and lands where the FTC, ASA and ASCI guidance say it has to sit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-platform">
              Where is it going?
            </label>
            <select
              id="disc-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platform}
              onChange={set("platform")}
            >
              {Object.entries(PLATFORMS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-region">
              Which market&apos;s rules apply?
            </label>
            <select id="disc-region" className={`mt-2 ${INPUT_CLASS}`} value={form.region} onChange={set("region")}>
              {Object.entries(REGIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-relationship">
              Your relationship with the brand
            </label>
            <select
              id="disc-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relationship}
              onChange={set("relationship")}
            >
              {Object.entries(RELATIONSHIPS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-brand">
              Brand name
            </label>
            <input
              id="disc-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.brand}
              onChange={set("brand")}
              placeholder="Northwind Coffee"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-label">
              Label wording
            </label>
            <select id="disc-label" className={`mt-2 ${INPUT_CLASS}`} value={labelChoice} onChange={set("labelChoice")}>
              <option value="">{approvedLabels[0] ? `${approvedLabels[0]} (default)` : "Default"}</option>
              {approvedLabels.slice(1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
              <option value="custom">Type my own…</option>
            </select>
          </div>
          {labelChoice === "custom" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="disc-custom-label">
                Custom label
              </label>
              <input
                id="disc-custom-label"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.customLabel}
                onChange={set("customLabel")}
                placeholder="#Ad"
              />
            </div>
          )}
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Disclosure line
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Characters", "Visible before truncation", "Guidance followed"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Disclosure line
                </p>
                <p className="mt-1 break-words text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
                  {result.line}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the generated disclosure line"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Characters", NUM.format(result.chars)],
                [
                  "Visible before truncation",
                  result.firstLineLimit === 0
                    ? "No caption cut-off on this surface"
                    : `${result.fitsBeforeTruncation ? "Yes" : "No"} — about ${NUM.format(result.firstLineLimit)} characters show`,
                ],
                ["Guidance followed", result.authority],
                ["Why it counts", result.relationshipNote],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where to put it</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.placement.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
              {result.regionRules.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {result.warnings.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Check before you post</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {result.warnings.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Advertising rules differ by market and change over
        time — read the current regulator guidance for every country you publish into, and take
        professional advice for high-value campaigns.
      </p>
    </main>
  );
}
