"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  ACKNOWLEDGE_HOURS,
  DEFAULT_FOOD_GST_PCT,
  ISSUE_TYPES,
  REDRESS_DAYS,
  buildFoodComplaintLetter,
  computeFoodRefund,
  escalationPlan,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  customerName: "Ananya Iyer",
  platformName: "QuickBite Food Delivery",
  restaurantName: "Curry House, Indiranagar",
  orderId: "ORD-99213-2026",
  orderDate: "2026-07-20",
  letterDate: "2026-07-22",
  deliveryAddress: "A-9, 2nd Cross, Indiranagar, Bengaluru 560038",
  phone: "99xxxxxx12",
  email: "ananya@example.com",
  issueType: "missing-items",
  itemsAffected: "1 x Paneer Butter Masala (Rs 180)",
  foodSubtotal: "600",
  affectedValue: "180",
  deliveryFee: "35",
  packagingFee: "20",
  tip: "0",
  discount: "100",
  gstPct: String(DEFAULT_FOOD_GST_PCT),
  amountPaid: "580",
  compensation: true,
  notes: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const refund = useMemo(
    () =>
      computeFoodRefund({
        foodSubtotal: toNumber(form.foodSubtotal),
        affectedValue: toNumber(form.affectedValue),
        deliveryFee: toNumber(form.deliveryFee) || 0,
        packagingFee: toNumber(form.packagingFee) || 0,
        tip: toNumber(form.tip) || 0,
        discount: toNumber(form.discount) || 0,
        gstPct: toNumber(form.gstPct),
        amountPaid: toNumber(form.amountPaid),
        issueTypeId: form.issueType,
      }),
    [
      form.foodSubtotal,
      form.affectedValue,
      form.deliveryFee,
      form.packagingFee,
      form.tip,
      form.discount,
      form.gstPct,
      form.amountPaid,
      form.issueType,
    ],
  );

  const letter = useMemo(
    () =>
      buildFoodComplaintLetter({
        customerName: form.customerName,
        platformName: form.platformName,
        restaurantName: form.restaurantName,
        orderId: form.orderId,
        orderDateISO: form.orderDate,
        letterDateISO: form.letterDate,
        deliveryAddress: form.deliveryAddress,
        phone: form.phone,
        email: form.email,
        itemsAffected: form.itemsAffected,
        extraNotes: form.notes,
        refund,
        wantCompensation: Boolean(form.compensation),
      }),
    [form, refund],
  );

  const plan = useMemo(
    () => escalationPlan({ letterDateISO: form.letterDate, amountPaid: toNumber(form.amountPaid) }),
    [form.letterDate, form.amountPaid],
  );

  const error = refund.error || letter.error || "";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Food delivery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Consumer Complaint Letter for Food Delivery
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the order break-up. The tool apportions the discount and GST, works out exactly what
          the platform owes you, and drafts a complaint to the grievance officer that the E-Commerce
          Rules, 2020 require every platform to appoint.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What went wrong</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL} htmlFor="issue-type">Issue with the order</label>
            <select id="issue-type" className={INPUT} value={form.issueType} onChange={set("issueType")}>
              {ISSUE_TYPES.map((issue) => (
                <option key={issue.id} value={issue.id}>{issue.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="items-affected">Items affected</label>
            <input id="items-affected" className={INPUT} value={form.itemsAffected} onChange={set("itemsAffected")} />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold">Order break-up (from the invoice)</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="food-subtotal">Food subtotal before fees (INR)</label>
            <input id="food-subtotal" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.foodSubtotal} onChange={set("foodSubtotal")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="affected-value">Value of the affected items (INR)</label>
            <input id="affected-value" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.affectedValue} onChange={set("affectedValue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="discount">Discount / coupon applied (INR)</label>
            <input id="discount" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.discount} onChange={set("discount")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="gst-pct">GST on food (%)</label>
            <input id="gst-pct" className={INPUT} type="number" inputMode="decimal" min="0" max="28" step="0.5"
              value={form.gstPct} onChange={set("gstPct")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="delivery-fee">Delivery fee (INR)</label>
            <input id="delivery-fee" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.deliveryFee} onChange={set("deliveryFee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="packaging-fee">Packaging / platform fee (INR)</label>
            <input id="packaging-fee" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.packagingFee} onChange={set("packagingFee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tip">Tip paid (INR)</label>
            <input id="tip" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.tip} onChange={set("tip")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="amount-paid">Total amount actually paid (INR)</label>
            <input id="amount-paid" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.amountPaid} onChange={set("amountPaid")} />
          </div>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Refund you can claim
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : money(refund.refundDue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the order figures above." : `${pct(refund.refundSharePct)} of the ${money(refund.amountPaid)} you paid`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the refund break-up"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Food delivery refund claim",
                        `Food value claimed: ${money(refund.refundableFood)}`,
                        `GST on that food: ${money(refund.refundableGst)}`,
                        `Delivery, packaging and tip: ${money(refund.refundableFees)}`,
                        `Total refund claimed: ${money(refund.refundDue)}`,
                        `Amount paid: ${money(refund.amountPaid)}`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy break-up"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Food value claimed", error ? "—" : money(refund.refundableFood)],
            ["GST on the claimed food", error ? "—" : money(refund.refundableGst)],
            ["Delivery, packaging and tip claimed", error ? "—" : money(refund.refundableFees)],
            ["Bill should have come to", error ? "—" : money(refund.expectedTotal)],
            ["Difference against what you paid", error ? "—" : money(refund.billingGap)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {refund.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Order and contact details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="customer-name">Your name</label>
            <input id="customer-name" className={INPUT} value={form.customerName} onChange={set("customerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="platform-name">Delivery platform</label>
            <input id="platform-name" className={INPUT} value={form.platformName} onChange={set("platformName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="restaurant-name">Restaurant</label>
            <input id="restaurant-name" className={INPUT} value={form.restaurantName} onChange={set("restaurantName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="order-id">Order ID</label>
            <input id="order-id" className={INPUT} value={form.orderId} onChange={set("orderId")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="order-date">Order date</label>
            <input id="order-date" className={INPUT} type="date" value={form.orderDate} onChange={set("orderDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="letter-date">Letter date</label>
            <input id="letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="phone">Phone</label>
            <input id="phone" className={INPUT} value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="email">Email</label>
            <input id="email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="delivery-address">Delivery address</label>
          <input id="delivery-address" className={INPUT} value={form.deliveryAddress} onChange={set("deliveryAddress")} />
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="notes">Extra facts for the letter (optional)</label>
          <textarea id="notes" rows={3} className={AREA} value={form.notes} onChange={set("notes")}
            placeholder="Photographs were shared in the app chat on the same evening; support closed the ticket without a refund." />
        </div>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="compensation">
          <input id="compensation" type="checkbox" className="h-5 w-5 accent-[var(--primary)]"
            checked={Boolean(form.compensation)}
            onChange={(event) => setForm((prev) => ({ ...prev, compensation: event.target.checked }))} />
          Also ask for compensation for the deficiency in service
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your complaint letter</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the complaint letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}>
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {letter.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {letter.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {letter.wordCount} words · acknowledgement due within {ACKNOWLEDGE_HOURS} hours, resolution within {REDRESS_DAYS} days
            </p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Escalation timeline</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Step</th>
                <th scope="col" className="py-2 pr-3 font-semibold">By</th>
                <th scope="col" className="py-2 font-semibold">What to do</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((step) => (
                <tr key={step.stage} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{step.stage}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{step.by || "—"}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{step.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Platform refund policies, GST rates on delivery and
        platform fees, and forum jurisdiction can change — check the current invoice and the
        platform's published grievance-officer details, and consult a lawyer for a high-value claim.
      </p>
    </main>
  );
}
