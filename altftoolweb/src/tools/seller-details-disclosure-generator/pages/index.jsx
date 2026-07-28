"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Store } from "lucide-react";

import { ENTITY_TYPES, SELLING_CHANNELS, buildSellerDisclosure } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  entityType: "privateLimited",
  channel: "both",
  legalName: "Nirvi Retail Private Limited",
  tradeName: "Nirvi",
  websiteName: "nirvi.store",
  websiteUrl: "https://nirvi.store",
  registeredAddress: "12 Palm Court, Andheri East, Mumbai 400069, Maharashtra, India",
  branchAddresses: "Unit 4, Peenya Industrial Area, Bengaluru 560058, Karnataka",
  warehouseAddress: "Plot 22, Mankoli Naka, Bhiwandi 421302, Maharashtra",
  supportEmail: "care@nirvi.store",
  supportPhone: "+91 22 4000 1234",
  supportHours: "Monday to Saturday, 10:00 to 18:00 IST",
  gstin: "27AABCU9603R1ZN",
  pan: "AABCU9603R",
  cin: "U74999MH2017PTC123456",
  fssai: "",
  importerName: "",
  countryOfOrigin: "India",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [format, setFormat] = useState("text");
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => buildSellerDisclosure(form), [form]);
  const ok = !result.error;

  const output = ok ? (format === "html" ? result.html : result.text) : "";

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setFormat("text");
    setCopied(false);
  };

  const checks = ok ? result.checks : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Store className="h-4 w-4" aria-hidden="true" />
          Ecommerce compliance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Seller Details Disclosure Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rules 4(2) and 5(3) of the Consumer Protection (E-Commerce) Rules, 2020 require a seller to
          publish its legal name, principal address, website and customer care contacts. This builds
          that block and checks your GSTIN, PAN and CIN before you paste it on the site.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The business</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-entity">
              Legal form
            </label>
            <select
              id="sdd-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.entityType}
              onChange={set("entityType")}
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-channel">
              Where you sell
            </label>
            <select
              id="sdd-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.channel}
              onChange={set("channel")}
            >
              {SELLING_CHANNELS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-legal">
              Legal name
            </label>
            <input
              id="sdd-legal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.legalName}
              onChange={set("legalName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-trade">
              Trade name or brand
            </label>
            <input
              id="sdd-trade"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tradeName}
              onChange={set("tradeName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-site">
              Website or store name
            </label>
            <input
              id="sdd-site"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.websiteName}
              onChange={set("websiteName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-url">
              Website address
            </label>
            <input
              id="sdd-url"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={form.websiteUrl}
              onChange={set("websiteUrl")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sdd-reg-addr">
              Registered or principal place of business
            </label>
            <textarea
              id="sdd-reg-addr"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.registeredAddress}
              onChange={set("registeredAddress")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sdd-branches">
              Branch offices
            </label>
            <textarea
              id="sdd-branches"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.branchAddresses}
              onChange={set("branchAddresses")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sdd-warehouse">
              Despatch warehouse
            </label>
            <input
              id="sdd-warehouse"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.warehouseAddress}
              onChange={set("warehouseAddress")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Customer care and identifiers</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-email">
              Customer care email
            </label>
            <input
              id="sdd-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.supportEmail}
              onChange={set("supportEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-phone">
              Customer care phone
            </label>
            <input
              id="sdd-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.supportPhone}
              onChange={set("supportPhone")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sdd-hours">
              Customer care hours
            </label>
            <input
              id="sdd-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.supportHours}
              onChange={set("supportHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-gstin">
              GSTIN
            </label>
            <input
              id="sdd-gstin"
              className={`mt-2 ${INPUT_CLASS} font-mono uppercase`}
              value={form.gstin}
              onChange={set("gstin")}
              maxLength={15}
            />
            {checks ? (
              <p
                className={`mt-1 text-xs ${
                  !checks.gstin.provided
                    ? "text-[var(--muted-foreground)]"
                    : checks.gstin.valid
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                }`}
              >
                {checks.gstin.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-pan">
              PAN
            </label>
            <input
              id="sdd-pan"
              className={`mt-2 ${INPUT_CLASS} font-mono uppercase`}
              value={form.pan}
              onChange={set("pan")}
              maxLength={10}
            />
            {checks ? (
              <p
                className={`mt-1 text-xs ${
                  !checks.pan.provided
                    ? "text-[var(--muted-foreground)]"
                    : checks.pan.valid
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                }`}
              >
                {checks.pan.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-cin">
              CIN (companies)
            </label>
            <input
              id="sdd-cin"
              className={`mt-2 ${INPUT_CLASS} font-mono uppercase`}
              value={form.cin}
              onChange={set("cin")}
              maxLength={21}
            />
            {checks ? (
              <p
                className={`mt-1 text-xs ${
                  !checks.cin.provided
                    ? "text-[var(--muted-foreground)]"
                    : checks.cin.valid
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                }`}
              >
                {checks.cin.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-fssai">
              FSSAI licence (food sellers)
            </label>
            <input
              id="sdd-fssai"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fssai}
              onChange={set("fssai")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-importer">
              Importer name (imported goods)
            </label>
            <input
              id="sdd-importer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.importerName}
              onChange={set("importerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdd-origin">
              Country of origin
            </label>
            <input
              id="sdd-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.countryOfOrigin}
              onChange={set("countryOfOrigin")}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Fields in the disclosure block
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.fieldCount : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.complete
                  ? "Every mandatory particular is present"
                  : `${result.missing.length} mandatory particular(s) still missing`
                : "Correct the input above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyOutput}
              aria-label="Copy the seller details disclosure block"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy block"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.missing.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Still needed: {result.missing.join(", ")}.
          </p>
        ) : null}

        {ok ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Disclosure block</h2>
            <div className="flex gap-2">
              {[
                ["text", "Plain text"],
                ["html", "HTML"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormat(key)}
                  aria-pressed={format === key}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    format === key
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-mono text-xs leading-6 whitespace-pre-wrap text-[var(--foreground)] sm:text-sm">
              {output}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The GSTIN, PAN and CIN checks verify format and
        checksum only — they do not confirm that the number is live or registered to you, which you
        should verify on the GST and MCA portals. A marketplace may require additional particulars
        under its own seller agreement.
      </p>
    </main>
  );
}
