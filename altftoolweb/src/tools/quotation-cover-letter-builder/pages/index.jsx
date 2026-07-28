"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import {
  DEFAULT_VALIDITY_DAYS,
  GST_SLABS,
  MAX_LINE_ITEMS,
  MAX_VALIDITY_DAYS,
  MIN_VALIDITY_DAYS,
  TONES,
  buildQuotationLetter,
  formatMoney,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  client: "Ms. Rekha Iyer",
  sender: "Arjun Mehta",
  company: "Northline Studio",
  quoteNumber: "NS-2026-041",
  scope: "website redesign and content migration",
  items: "Website design | 1 | 60000\nContent migration | 3 | 5000",
  discountPct: "10",
  taxPct: "18",
  advancePct: "40",
  validityDays: String(DEFAULT_VALIDITY_DAYS),
  quoteDate: "2026-07-28",
  leadTimeDays: "21",
  exclusions: "stock photography licences and third-party plugin fees",
  nextStep: "Reply with your approval and we will send the proforma invoice the same day.",
  contact: "arjun@northline.example",
  toneId: "professional",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildQuotationLetter({
        ...form,
        discountPct: Number(form.discountPct),
        taxPct: Number(form.taxPct),
        advancePct: Number(form.advancePct),
        validityDays: Number(form.validityDays),
        leadTimeDays: Number(form.leadTimeDays),
      }),
    [form],
  );
  const failed = Boolean(result.error);

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const fullText = failed ? "" : `Subject: ${result.subject}\n\n${result.body}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Quotations
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Quotation Cover Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the line items, apply discount and GST in the right order, and wrap the numbers in a
          covering note with a validity date, a payment split and one clear next step.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="qc-client">
              Client contact name
            </label>
            <input id="qc-client" className={`mt-2 ${INPUT}`} value={form.client} onChange={setField("client")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-quote-number">
              Quotation number
            </label>
            <input id="qc-quote-number" className={`mt-2 ${INPUT}`} value={form.quoteNumber} onChange={setField("quoteNumber")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="qc-scope">
              Scope in one line
            </label>
            <input id="qc-scope" className={`mt-2 ${INPUT}`} value={form.scope} onChange={setField("scope")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="qc-items">
              Line items — one per line, &quot;Description | quantity | unit price&quot; (max {MAX_LINE_ITEMS})
            </label>
            <textarea id="qc-items" rows={5} className={`mt-2 ${AREA}`} value={form.items} onChange={setField("items")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-discount">
              Discount (%)
            </label>
            <input
              id="qc-discount"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              className={`mt-2 ${INPUT}`}
              value={form.discountPct}
              onChange={setField("discountPct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-tax">
              GST rate (%)
            </label>
            <select id="qc-tax" className={`mt-2 ${INPUT}`} value={form.taxPct} onChange={setField("taxPct")}>
              {GST_SLABS.map((slab) => (
                <option key={slab} value={String(slab)}>
                  {slab}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-advance">
              Advance on approval (%)
            </label>
            <input
              id="qc-advance"
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              className={`mt-2 ${INPUT}`}
              value={form.advancePct}
              onChange={setField("advancePct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-validity">
              Valid for (days, {MIN_VALIDITY_DAYS}–{MAX_VALIDITY_DAYS})
            </label>
            <input
              id="qc-validity"
              type="number"
              inputMode="numeric"
              min={MIN_VALIDITY_DAYS}
              max={MAX_VALIDITY_DAYS}
              className={`mt-2 ${INPUT}`}
              value={form.validityDays}
              onChange={setField("validityDays")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-date">
              Quotation date
            </label>
            <input id="qc-date" type="date" className={`mt-2 ${INPUT}`} value={form.quoteDate} onChange={setField("quoteDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-lead">
              Delivery lead time (days)
            </label>
            <input
              id="qc-lead"
              type="number"
              inputMode="numeric"
              min="0"
              max="730"
              className={`mt-2 ${INPUT}`}
              value={form.leadTimeDays}
              onChange={setField("leadTimeDays")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-sender">
              Your name
            </label>
            <input id="qc-sender" className={`mt-2 ${INPUT}`} value={form.sender} onChange={setField("sender")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-company">
              Your company (optional)
            </label>
            <input id="qc-company" className={`mt-2 ${INPUT}`} value={form.company} onChange={setField("company")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-contact">
              Your contact line (optional)
            </label>
            <input id="qc-contact" className={`mt-2 ${INPUT}`} value={form.contact} onChange={setField("contact")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="qc-tone">
              Tone
            </label>
            <select id="qc-tone" className={`mt-2 ${INPUT}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="qc-exclusions">
              What the quote excludes
            </label>
            <input id="qc-exclusions" className={`mt-2 ${INPUT}`} value={form.exclusions} onChange={setField("exclusions")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="qc-next">
              Next step
            </label>
            <input id="qc-next" className={`mt-2 ${INPUT}`} value={form.nextStep} onChange={setField("nextStep")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total payable
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : formatMoney(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to price the quote." : `Valid until ${result.validUntilLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", fullText)}
              aria-label="Copy the subject line and covering letter"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "all" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subtotal", failed ? DASH : formatMoney(result.subtotal)],
            ["Discount", failed ? DASH : `${result.discountPct}% · -${formatMoney(result.discount)}`],
            ["Taxable value", failed ? DASH : formatMoney(result.taxable)],
            ["GST", failed ? DASH : `${result.taxPct}% · ${formatMoney(result.tax)}`],
            ["Advance on approval", failed ? DASH : `${result.advancePct}% · ${formatMoney(result.advance)}`],
            ["Balance on completion", failed ? DASH : formatMoney(result.balance)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Priced items</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Unit</th>
                    <th scope="col" className="py-2 text-right font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, index) => (
                    <tr key={`${item.description}-${index}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.description}</td>
                      <td className="py-2 pr-3 text-right">{item.quantity}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{formatMoney(item.unitPrice)}</td>
                      <td className="py-2 text-right">{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Covering letter</h2>
              <button
                type="button"
                onClick={() => copy("body", result.body)}
                aria-label="Copy only the letter body"
                className={GHOST_BTN}
              >
                {copied === "body" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "body" ? "Copied!" : "Copy body"}
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.body}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      item.ok
                        ? "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-[var(--success)]"
                        : "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                    }
                  />
                  <span className={item.ok ? "" : "text-[var(--muted-foreground)]"}>
                    {item.label}
                    <span className="sr-only">{item.ok ? " — passed" : " — not met"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The covering note is not a tax invoice. Confirm the correct GST rate and place of supply for
        your goods or services with your accountant before you issue the invoice.
      </p>
    </main>
  );
}
