"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "text-sm font-semibold text-[var(--foreground)]";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const rupeeRound = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(value) {
  if (value < 20) return ONES[value];
  const tens = Math.floor(value / 10);
  const rest = value % 10;
  return `${TENS[tens]}${rest ? ` ${ONES[rest]}` : ""}`;
}

/** Indian numbering system: crore / lakh / thousand / hundred. */
function amountInWords(amount) {
  const total = Math.round(Math.abs(amount));
  if (total === 0) return "Zero rupees only";

  const chunks = [
    [Math.floor(total / 10000000), "Crore"],
    [Math.floor((total % 10000000) / 100000), "Lakh"],
    [Math.floor((total % 100000) / 1000), "Thousand"],
    [Math.floor((total % 1000) / 100), "Hundred"],
  ];

  const parts = chunks
    .filter(([value]) => value > 0)
    .map(([value, name]) => `${twoDigitWords(value)} ${name}`);

  const remainder = total % 100;
  if (remainder > 0) parts.push(twoDigitWords(remainder));

  return `${parts.join(" ")} rupees only`;
}

const emptyItem = () => ({
  id: `item-${Math.random().toString(36).slice(2, 9)}`,
  description: "",
  qty: "1",
  unit: "Nos",
  rate: "0",
  gst: "18",
});

const DEFAULTS = {
  poNumber: "PO-2026-0001",
  poDate: "2026-04-01",
  deliveryDate: "2026-04-15",
  buyerName: "ALTF Traders Pvt Ltd",
  buyerAddress: "12 MG Road, Bengaluru, Karnataka 560001",
  buyerGstin: "29ABCDE1234F1Z5",
  vendorName: "Sunrise Supplies",
  vendorAddress: "44 Industrial Area, Pune, Maharashtra 411019",
  vendorGstin: "27AAACS1234H1ZQ",
  shipTo: "ALTF Traders Warehouse, Plot 8, Hosur Road, Bengaluru 560068",
  paymentTerms: "50% advance, balance within 30 days of delivery",
  deliveryTerms: "FOB destination. Goods to be delivered in one lot with a packing list.",
  interState: true,
  freight: "1500",
  notes: "Quote this PO number on the invoice, delivery challan and e-way bill.",
  items: [
    { id: "item-a", description: "Steel storage rack 4-tier", qty: "10", unit: "Nos", rate: "4200", gst: "18" },
    { id: "item-b", description: "Corrugated boxes 12x10x8 in", qty: "500", unit: "Nos", rate: "38", gst: "12" },
  ],
};

const toNumber = (value) => {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setItem = (id, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
    setCopied(false);
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));

  const removeItem = (id) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items,
    }));

  const totals = useMemo(() => {
    const errors = [];
    if (!form.poNumber.trim()) errors.push("Enter a purchase order number.");
    if (!form.vendorName.trim()) errors.push("Enter the vendor (supplier) name.");

    const lines = form.items.map((item, index) => {
      const qty = toNumber(item.qty);
      const rate = toNumber(item.rate);
      const gst = toNumber(item.gst);

      if (!Number.isFinite(qty) || qty < 0) errors.push(`Line ${index + 1}: quantity must be a number of 0 or more.`);
      if (!Number.isFinite(rate) || rate < 0) errors.push(`Line ${index + 1}: rate must be a number of 0 or more.`);
      if (!Number.isFinite(gst) || gst < 0 || gst > 100) errors.push(`Line ${index + 1}: GST must be between 0 and 100.`);

      const safeQty = Number.isFinite(qty) && qty >= 0 ? qty : 0;
      const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 0;
      const safeGst = Number.isFinite(gst) && gst >= 0 && gst <= 100 ? gst : 0;

      const taxable = safeQty * safeRate;
      const tax = (taxable * safeGst) / 100;

      return { ...item, qty: safeQty, rate: safeRate, gst: safeGst, taxable, tax, total: taxable + tax };
    });

    const freight = toNumber(form.freight || "0");
    if (!Number.isFinite(freight) || freight < 0) errors.push("Freight must be a number of 0 or more.");
    const safeFreight = Number.isFinite(freight) && freight >= 0 ? freight : 0;

    const subtotal = lines.reduce((sum, line) => sum + line.taxable, 0);
    const taxTotal = lines.reduce((sum, line) => sum + line.tax, 0);
    const grossTotal = subtotal + taxTotal + safeFreight;
    const rounded = Math.round(grossTotal);
    const roundOff = rounded - grossTotal;

    return {
      errors,
      lines,
      subtotal,
      taxTotal,
      freight: safeFreight,
      grossTotal,
      rounded,
      roundOff,
      cgst: form.interState ? 0 : taxTotal / 2,
      sgst: form.interState ? 0 : taxTotal / 2,
      igst: form.interState ? taxTotal : 0,
    };
  }, [form]);

  const hasError = totals.errors.length > 0;

  const summary = useMemo(
    () =>
      [
        `PURCHASE ORDER ${form.poNumber}`,
        `PO date: ${form.poDate}   Required by: ${form.deliveryDate}`,
        "",
        `Buyer: ${form.buyerName} | GSTIN ${form.buyerGstin}`,
        form.buyerAddress,
        `Vendor: ${form.vendorName} | GSTIN ${form.vendorGstin}`,
        form.vendorAddress,
        `Ship to: ${form.shipTo}`,
        "",
        "Items:",
        ...totals.lines.map(
          (line, index) =>
            `${index + 1}. ${line.description || "Item"} - ${line.qty} ${line.unit} x ${line.rate} @ ${line.gst}% GST = ${line.total.toFixed(2)}`
        ),
        "",
        `Taxable value: ${totals.subtotal.toFixed(2)}`,
        form.interState
          ? `IGST: ${totals.igst.toFixed(2)}`
          : `CGST: ${totals.cgst.toFixed(2)} | SGST: ${totals.sgst.toFixed(2)}`,
        `Freight: ${totals.freight.toFixed(2)}`,
        `Grand total: ${totals.rounded.toFixed(2)}`,
        amountInWords(totals.rounded),
        "",
        `Payment terms: ${form.paymentTerms}`,
        `Delivery terms: ${form.deliveryTerms}`,
        form.notes ? `Notes: ${form.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [form, totals]
  );

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
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
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="print:hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Procurement
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Purchase Order Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Fill in the vendor, items, GST treatment and delivery terms — the totals, tax split and
            amount in words update live, and the PO prints on one page.
          </p>
        </header>

        <section className="mt-6 grid gap-6 print:hidden">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Order header</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="po-number">PO number</label>
                <input id="po-number" type="text" value={form.poNumber} onChange={setField("poNumber")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-date">PO date</label>
                <input id="po-date" type="date" value={form.poDate} onChange={setField("poDate")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-delivery-date">Required delivery date</label>
                <input id="po-delivery-date" type="date" value={form.deliveryDate} onChange={setField("deliveryDate")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-freight">Freight / packing charge (INR)</label>
                <input id="po-freight" type="number" inputMode="decimal" min="0" value={form.freight} onChange={setField("freight")} className={`${inputClass} mt-2`} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="po-buyer">Buyer name</label>
                <input id="po-buyer" type="text" value={form.buyerName} onChange={setField("buyerName")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-buyer-gstin">Buyer GSTIN</label>
                <input id="po-buyer-gstin" type="text" value={form.buyerGstin} onChange={setField("buyerGstin")} className={`${inputClass} mt-2`} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="po-buyer-address">Buyer address</label>
                <textarea id="po-buyer-address" rows={2} value={form.buyerAddress} onChange={setField("buyerAddress")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-vendor">Vendor name</label>
                <input id="po-vendor" type="text" value={form.vendorName} onChange={setField("vendorName")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-vendor-gstin">Vendor GSTIN</label>
                <input id="po-vendor-gstin" type="text" value={form.vendorGstin} onChange={setField("vendorGstin")} className={`${inputClass} mt-2`} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="po-vendor-address">Vendor address</label>
                <textarea id="po-vendor-address" rows={2} value={form.vendorAddress} onChange={setField("vendorAddress")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="po-ship-to">Ship to address</label>
                <textarea id="po-ship-to" rows={2} value={form.shipTo} onChange={setField("shipTo")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                id="po-inter-state"
                type="checkbox"
                checked={form.interState}
                onChange={setField("interState")}
                className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              <label className={labelClass} htmlFor="po-inter-state">
                Inter-state supply (charge IGST instead of CGST + SGST)
              </label>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Line items</h2>
              <button type="button" onClick={addItem} className={secondaryButtonClass} aria-label="Add another line item">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add item
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {form.items.map((item, index) => (
                <div key={item.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="grid gap-3">
                    <div>
                      <label className={labelClass} htmlFor={`po-desc-${item.id}`}>
                        Item {index + 1} description
                      </label>
                      <input
                        id={`po-desc-${item.id}`}
                        type="text"
                        value={item.description}
                        onChange={(event) => setItem(item.id, "description", event.target.value)}
                        className={`${inputClass} mt-2`}
                        placeholder="Item or service"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor={`po-qty-${item.id}`}>Quantity</label>
                        <input id={`po-qty-${item.id}`} type="number" inputMode="decimal" min="0" value={item.qty} onChange={(event) => setItem(item.id, "qty", event.target.value)} className={`${inputClass} mt-2`} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`po-unit-${item.id}`}>Unit</label>
                        <input id={`po-unit-${item.id}`} type="text" value={item.unit} onChange={(event) => setItem(item.id, "unit", event.target.value)} className={`${inputClass} mt-2`} placeholder="Nos / Kg / Hrs" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`po-rate-${item.id}`}>Rate (INR)</label>
                        <input id={`po-rate-${item.id}`} type="number" inputMode="decimal" min="0" value={item.rate} onChange={(event) => setItem(item.id, "rate", event.target.value)} className={`${inputClass} mt-2`} />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`po-gst-${item.id}`}>GST rate (%)</label>
                        <select id={`po-gst-${item.id}`} value={item.gst} onChange={(event) => setItem(item.id, "gst", event.target.value)} className={`${inputClass} mt-2`}>
                          {GST_RATES.map((rate) => (
                            <option key={rate} value={String(rate)}>{rate}%</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Line total{" "}
                        <span className="font-semibold text-[var(--foreground)]">
                          {rupee.format(totals.lines[index]?.total || 0)}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={form.items.length === 1}
                        aria-label={`Remove line item ${index + 1}`}
                        className={`${secondaryButtonClass} disabled:opacity-50`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Terms</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className={labelClass} htmlFor="po-payment-terms">Payment terms</label>
                <textarea id="po-payment-terms" rows={2} value={form.paymentTerms} onChange={setField("paymentTerms")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-delivery-terms">Delivery terms</label>
                <textarea id="po-delivery-terms" rows={2} value={form.deliveryTerms} onChange={setField("deliveryTerms")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
              <div>
                <label className={labelClass} htmlFor="po-notes">Notes to vendor</label>
                <textarea id="po-notes" rows={2} value={form.notes} onChange={setField("notes")} className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" />
              </div>
              <div>
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset the purchase order to defaults">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {hasError ? (
            <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              {totals.errors[0]}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Purchase order total
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                    {rupeeRound.format(totals.rounded)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{amountInWords(totals.rounded)}</p>
                </div>
                <div className="flex flex-wrap gap-3 print:hidden">
                  <button type="button" onClick={copySummary} className={primaryButtonClass} aria-label="Copy the purchase order summary">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy PO"}
                  </button>
                  <button type="button" onClick={() => window.print()} className={secondaryButtonClass} aria-label="Print the purchase order">
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Print
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Buyer</p>
                  <p className="mt-1 font-semibold">{form.buyerName}</p>
                  <p className="text-[var(--muted-foreground)]">{form.buyerAddress}</p>
                  <p className="text-[var(--muted-foreground)]">GSTIN: {form.buyerGstin || "-"}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Vendor</p>
                  <p className="mt-1 font-semibold">{form.vendorName}</p>
                  <p className="text-[var(--muted-foreground)]">{form.vendorAddress}</p>
                  <p className="text-[var(--muted-foreground)]">GSTIN: {form.vendorGstin || "-"}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    PO {form.poNumber} &middot; dated {form.poDate} &middot; deliver by {form.deliveryDate}
                  </p>
                  <p className="mt-1 text-[var(--muted-foreground)]">Ship to: {form.shipTo}</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3">Item</th>
                      <th scope="col" className="py-2 pr-3 text-right">Qty</th>
                      <th scope="col" className="py-2 pr-3 text-right">Rate</th>
                      <th scope="col" className="py-2 pr-3 text-right">Taxable</th>
                      <th scope="col" className="py-2 pr-3 text-right">GST</th>
                      <th scope="col" className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.lines.map((line, index) => (
                      <tr key={line.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">{line.description || `Item ${index + 1}`}</td>
                        <td className="py-2 pr-3 text-right">{line.qty} {line.unit}</td>
                        <td className="py-2 pr-3 text-right">{rupee.format(line.rate)}</td>
                        <td className="py-2 pr-3 text-right">{rupee.format(line.taxable)}</td>
                        <td className="py-2 pr-3 text-right">{line.gst}% &middot; {rupee.format(line.tax)}</td>
                        <td className="py-2 text-right font-semibold">{rupee.format(line.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Taxable value</dt>
                  <dd className="font-semibold">{rupee.format(totals.subtotal)}</dd>
                </div>
                {form.interState ? (
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">IGST</dt>
                    <dd className="font-semibold">{rupee.format(totals.igst)}</dd>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">CGST</dt>
                      <dd className="font-semibold">{rupee.format(totals.cgst)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">SGST</dt>
                      <dd className="font-semibold">{rupee.format(totals.sgst)}</dd>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Freight / packing</dt>
                  <dd className="font-semibold">{rupee.format(totals.freight)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Round off</dt>
                  <dd className="font-semibold">{rupee.format(totals.roundOff)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-semibold">Grand total</dt>
                  <dd className="text-lg font-semibold text-[var(--primary)]">{rupeeRound.format(totals.rounded)}</dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Payment terms</p>
                  <p className="mt-1">{form.paymentTerms || "-"}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Delivery terms</p>
                  <p className="mt-1">{form.deliveryTerms || "-"}</p>
                </div>
                {form.notes && (
                  <div className="rounded-md border border-[var(--border)] p-3 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Notes</p>
                    <p className="mt-1">{form.notes}</p>
                  </div>
                )}
              </div>

              <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                Totals are computed from your inputs for convenience. Confirm the GST treatment and place of
                supply with your accountant before issuing the order.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
