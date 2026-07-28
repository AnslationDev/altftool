"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailCheck, RotateCcw } from "lucide-react";

import {
  MOBILE_SUBJECT_CHARS,
  SEND_FREQUENCIES,
  SIGNUP_SOURCES,
  buildDoubleOptInCopy,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  brandName: "Northwind Studio",
  listName: "Weekly Design Notes",
  senderName: "Asha from Northwind",
  senderEmail: "hello@northwind.example",
  contentDescription: "one short essay on interface craft plus three links worth your time",
  leadMagnetName: "",
  postalAddress: "12 Residency Road, Bengaluru 560025, India",
  supportEmail: "hello@northwind.example",
  preferencesUrl: "https://northwind.example/preferences",
  frequencyId: "weekly",
  sourceId: "footer",
  subjectOverride: "",
  sharesWithPartners: false,
  expiryHours: "72",
  signups: "2400",
  confirmRatePercent: "65",
  targetConfirmed: "5000",
};

const NUMERIC_FIELDS = ["expiryHours", "signups", "confirmRatePercent", "targetConfirmed"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const numbers = {};
    for (const key of NUMERIC_FIELDS) {
      numbers[key] = form[key] === "" ? NaN : Number(form[key]);
    }
    return buildDoubleOptInCopy({ ...form, ...numbers });
  }, [form]);

  const hasError = Boolean(result.error);

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedId("");
  };

  const rows = hasError
    ? [
        ["Confirmed from current signups", DASH],
        ["Still unconfirmed", DASH],
        ["Signups needed for the target", DASH],
        ["Extra signups still to find", DASH],
        ["Emails a year promised", DASH],
        ["Confirmation link lifetime", DASH],
        ["Subject length", DASH],
        ["Preheader length", DASH],
      ]
    : [
        ["Confirmed from current signups", NUM.format(result.funnel.confirmed)],
        ["Still unconfirmed", NUM.format(result.funnel.unconfirmed)],
        ["Signups needed for the target", NUM.format(result.funnel.signupsNeeded)],
        ["Extra signups still to find", NUM.format(result.funnel.extraSignupsNeeded)],
        [
          "Emails a year promised",
          `${NUM.format(result.emailsPerYear)} (${result.frequencyLabel.toLowerCase()})`,
        ],
        ["Confirmation link lifetime", result.expiryLabel],
        [
          "Subject length",
          `${result.subjectMetrics.length} chars${
            result.subjectMetrics.truncatedOnMobile
              ? ` (clipped near ${MOBILE_SUBJECT_CHARS} on mobile)`
              : " (fits)"
          }`,
        ],
        [
          "Preheader length",
          `${result.preheaderMetrics.length} chars${
            result.preheaderMetrics.truncatedOnMobile ? " (clipped)" : " (fits)"
          }`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailCheck className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Newsletter Double Opt-In Copy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the whole double opt-in flow {DASH} form consent line, post-signup screen,
          confirmation email and welcome email {DASH} plus the consent record that proves the person
          asked for it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The list</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-brand">
              Brand or company
            </label>
            <input
              id="doi-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.brandName}
              onChange={(event) => set("brandName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-list">
              Newsletter name
            </label>
            <input
              id="doi-list"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.listName}
              onChange={(event) => set("listName", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="doi-content">
              What subscribers actually receive
            </label>
            <textarea
              id="doi-content"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.contentDescription}
              onChange={(event) => set("contentDescription", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-frequency">
              How often
            </label>
            <select
              id="doi-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.frequencyId}
              onChange={(event) => set("frequencyId", event.target.value)}
            >
              {SEND_FREQUENCIES.map((frequency) => (
                <option key={frequency.id} value={frequency.id}>
                  {frequency.label} ({frequency.perYear} a year)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-source">
              Where people sign up
            </label>
            <select
              id="doi-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sourceId}
              onChange={(event) => set("sourceId", event.target.value)}
            >
              {SIGNUP_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-sender">
              From name
            </label>
            <input
              id="doi-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={(event) => set("senderName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-sender-email">
              From address
            </label>
            <input
              id="doi-sender-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.senderEmail}
              onChange={(event) => set("senderEmail", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-support">
              Reply-to / support address
            </label>
            <input
              id="doi-support"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.supportEmail}
              onChange={(event) => set("supportEmail", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-prefs">
              Preferences page URL
            </label>
            <input
              id="doi-prefs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={form.preferencesUrl}
              onChange={(event) => set("preferencesUrl", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="doi-postal">
              Physical postal address (required by CAN-SPAM)
            </label>
            <input
              id="doi-postal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.postalAddress}
              onChange={(event) => set("postalAddress", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="doi-magnet">
              Download promised on confirmation (optional)
            </label>
            <input
              id="doi-magnet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. The Spacing Cheat Sheet"
              value={form.leadMagnetName}
              onChange={(event) => set("leadMagnetName", event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="doi-partners">
          <input
            id="doi-partners"
            className={CHECKBOX}
            type="checkbox"
            checked={form.sharesWithPartners}
            onChange={(event) => set("sharesWithPartners", event.target.checked)}
          />
          <span>Addresses are shared with named partners</span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Confirmation email and funnel</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="doi-subject">
              Subject line (leave blank for the default)
            </label>
            <input
              id="doi-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Confirm your subscription"
              value={form.subjectOverride}
              onChange={(event) => set("subjectOverride", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-expiry">
              Link expires after (hours)
            </label>
            <input
              id="doi-expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="720"
              step="1"
              value={form.expiryHours}
              onChange={(event) => set("expiryHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-rate">
              Your confirmation rate (%)
            </label>
            <input
              id="doi-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={form.confirmRatePercent}
              onChange={(event) => set("confirmRatePercent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-signups">
              Signups so far
            </label>
            <input
              id="doi-signups"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={form.signups}
              onChange={(event) => set("signups", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doi-target">
              Confirmed subscribers you want
            </label>
            <input
              id="doi-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={form.targetConfirmed}
              onChange={(event) => set("targetConfirmed", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Signups needed for the target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.funnel.signupsNeeded)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to generate the copy"
                : `To reach ${NUM.format(result.targetConfirmed)} confirmed at a ${result.confirmRatePercent}% confirmation rate`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", result.fullText)}
              disabled={hasError}
              aria-label="Copy all double opt-in copy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedId === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "all" ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-4">
          {result.blocks.map((block) => (
            <article
              key={block.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{block.label}</h2>
                <button
                  type="button"
                  onClick={() => copy(block.id, block.text)}
                  aria-label={`Copy ${block.label}`}
                  className={GHOST_BTN}
                >
                  {copiedId === block.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === block.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
                  {block.text}
                </pre>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Email marketing rules differ by country {DASH}{" "}
        GDPR and PECR in the UK and EU, CAN-SPAM in the US, CASL in Canada, the DPDP Act in India
        {" "}{DASH} and subject-line display limits vary by mail client. Check your own obligations
        before you send.
      </p>
    </main>
  );
}
