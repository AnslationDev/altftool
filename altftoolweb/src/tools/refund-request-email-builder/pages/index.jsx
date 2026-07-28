"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  DEFAULT_NOTICE_DAYS,
  MAX_NOTICE_DAYS,
  MIN_NOTICE_DAYS,
  REASONS,
  REGIONS,
  TONES,
  buildRefundEmail,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  regionId: "in",
  reasonId: "faulty",
  toneId: "firm",
  customerName: "Anita Desai",
  seller: "GadgetKart",
  recipient: "GadgetKart Support",
  orderNumber: "GK-88213",
  item: "Bluetooth speaker",
  amount: "4499",
  orderDate: "2026-07-01",
  deliveryDate: "2026-07-08",
  today: "2026-07-28",
  noticeDays: String(DEFAULT_NOTICE_DAYS),
  previousContact:
    "I raised ticket TK-44201 on 10 July and have had no substantive reply since.",
  preferredOutcome: "",
  contact: "anita@example.com",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildRefundEmail({
        ...form,
        amount: Number(form.amount),
        noticeDays: Number(form.noticeDays),
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
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Refund request
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Refund Request Email Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put the order facts, the days elapsed, one clear ask and a dated deadline into a single
          email — the four things that make a refund request hard to ignore.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rr-region">
              Where you bought it
            </label>
            <select id="rr-region" className={`mt-2 ${INPUT}`} value={form.regionId} onChange={setField("regionId")}>
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-reason">
              What went wrong
            </label>
            <select id="rr-reason" className={`mt-2 ${INPUT}`} value={form.reasonId} onChange={setField("reasonId")}>
              {REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-name">
              Your name
            </label>
            <input id="rr-name" className={`mt-2 ${INPUT}`} value={form.customerName} onChange={setField("customerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-seller">
              Seller / company
            </label>
            <input id="rr-seller" className={`mt-2 ${INPUT}`} value={form.seller} onChange={setField("seller")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-recipient">
              Addressed to (optional)
            </label>
            <input id="rr-recipient" className={`mt-2 ${INPUT}`} value={form.recipient} onChange={setField("recipient")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-order">
              Order / invoice number
            </label>
            <input id="rr-order" className={`mt-2 ${INPUT}`} value={form.orderNumber} onChange={setField("orderNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-item">
              Item or service
            </label>
            <input id="rr-item" className={`mt-2 ${INPUT}`} value={form.item} onChange={setField("item")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-amount">
              Amount paid
            </label>
            <input
              id="rr-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT}`}
              value={form.amount}
              onChange={setField("amount")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-order-date">
              Order date
            </label>
            <input id="rr-order-date" type="date" className={`mt-2 ${INPUT}`} value={form.orderDate} onChange={setField("orderDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-delivery-date">
              Delivery date
            </label>
            <input id="rr-delivery-date" type="date" className={`mt-2 ${INPUT}`} value={form.deliveryDate} onChange={setField("deliveryDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-today">
              Date you are sending this
            </label>
            <input id="rr-today" type="date" className={`mt-2 ${INPUT}`} value={form.today} onChange={setField("today")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-notice">
              Days to reply ({MIN_NOTICE_DAYS}–{MAX_NOTICE_DAYS})
            </label>
            <input
              id="rr-notice"
              type="number"
              inputMode="numeric"
              min={MIN_NOTICE_DAYS}
              max={MAX_NOTICE_DAYS}
              className={`mt-2 ${INPUT}`}
              value={form.noticeDays}
              onChange={setField("noticeDays")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-tone">
              Tone
            </label>
            <select id="rr-tone" className={`mt-2 ${INPUT}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rr-contact">
              Your contact line (optional)
            </label>
            <input id="rr-contact" className={`mt-2 ${INPUT}`} value={form.contact} onChange={setField("contact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rr-outcome">
              What you want (leave blank for the default for this reason)
            </label>
            <input id="rr-outcome" className={`mt-2 ${INPUT}`} value={form.preferredOutcome} onChange={setField("preferredOutcome")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rr-previous">
              Earlier contact attempts
            </label>
            <textarea id="rr-previous" rows={2} className={`mt-2 ${AREA}`} value={form.previousContact} onChange={setField("previousContact")} />
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
              Days since delivery
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.daysSinceDelivery}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to generate the email."
                : result.withinWindow
                  ? `${result.daysLeft} days left in the ${result.windowDays}-day reference window`
                  : `Past the ${result.windowDays}-day reference window — rely on the seller's policy`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", fullText)}
              aria-label="Copy the subject line and refund email"
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
            ["Subject line", failed ? DASH : result.subject],
            ["Amount claimed", failed ? DASH : result.money],
            ["Ordered", failed ? DASH : result.orderDateLabel],
            ["Delivered", failed ? DASH : result.deliveryDateLabel],
            ["Reply deadline", failed ? DASH : result.deadlineLabel],
            ["Escalation route", failed ? DASH : result.escalation],
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Your email</h2>
              <button
                type="button"
                onClick={() => copy("body", result.body)}
                aria-label="Copy only the email body"
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
            <h2 className="text-base font-semibold">{result.regionLabel}: what the rules say</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.windowNote}</p>
            <ul className="mt-4 space-y-2 text-sm">
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
        Informational only, not legal advice. Refund rights depend on the contract, the goods and
        where the seller trades — read the seller&apos;s published policy and speak to a consumer
        adviser or solicitor before threatening formal action.
      </p>
    </main>
  );
}
