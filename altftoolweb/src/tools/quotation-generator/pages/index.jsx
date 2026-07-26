"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const textareaClass =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "text-sm font-semibold text-[var(--foreground)]";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GST_RATES = [0, 5, 12, 18, 28];

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

const percent = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const emptyItem = () => ({
  id: `line-${Math.random().toString(36).slice(2, 9)}`,
  description: "",
  qty: "1",
  unit: "Nos",
  rate: "0",
  discount: "0",
  gst: "18",
});

const DEFAULTS = {
  quoteNumber: "QT-2026-0007",
  quoteDate: "2026-07-25",
  validityDays: "15",
  fromName: "ALTF Studio",
  fromDetails: "12 MG Road, Bengaluru 560001 | hello@altfstudio.in | GSTIN 29ABCDE1234F1Z5",
  clientName: "Nimbus Retail Pvt Ltd",
  clientDetails: "88 Link Road, Mumbai 400053 | accounts@nimbusretail.in",
  interState: true,
  extraDiscount: "0",
  advancePercent: "40",
  terms: "50% advance to start, balance on delivery. Prices exclude third-party licences.",
  notes: "Quotation valid for the period shown. Scope changes will be re-quoted.",
  items: [
    { id: "line-a", description: "Brand identity design", qty: "1", unit: "Project", rate: "65000", discount: "10", gst: "18" },
    { id: "line-b", description: "Website build (8 pages)", qty: "1", unit: "Project", rate: "120000", discount: "5", gst: "18" },
    { id: "line-c", description: "Monthly maintenance", qty: "6", unit: "Months", rate: "8000", discount: "0", gst: "18" },
  ],
};

const toNumber = (value) => {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

function addDays(isoDate, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + days);
  return base;
}

const isoOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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

  const quote = useMemo(() => {
    const errors = [];
    if (!form.quoteNumber.trim()) errors.push("Enter a quotation number.");
    if (!form.clientName.trim()) errors.push("Enter the client name this quotation is addressed to.");

    const validityDays = toNumber(form.validityDays);
    if (!Number.isFinite(validityDays) || validityDays < 0 || validityDays > 365) {
      errors.push("Validity must be between 0 and 365 days.");
    }

    const extraDiscount = toNumber(form.extraDiscount || "0");
    if (!Number.isFinite(extraDiscount) || extraDiscount < 0 || extraDiscount > 100) {
      errors.push("Overall discount must be between 0 and 100 percent.");
    }

    const advancePercent = toNumber(form.advancePercent || "0");
    if (!Number.isFinite(advancePercent) || advancePercent < 0 || advancePercent > 100) {
      errors.push("Advance must be between 0 and 100 percent.");
    }

    const lines = form.items.map((item, index) => {
      const qty = toNumber(item.qty);
      const rate = toNumber(item.rate);
      const discount = toNumber(item.discount || "0");
      const gst = toNumber(item.gst);

      if (!Number.isFinite(qty) || qty < 0) errors.push(`Line ${index + 1}: quantity must be 0 or more.`);
      if (!Number.isFinite(rate) || rate < 0) errors.push(`Line ${index + 1}: rate must be 0 or more.`);
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) errors.push(`Line ${index + 1}: discount must be between 0 and 100 percent.`);
      if (!Number.isFinite(gst) || gst < 0 || gst > 100) errors.push(`Line ${index + 1}: GST must be between 0 and 100.`);

      const safeQty = Number.isFinite(qty) && qty >= 0 ? qty : 0;
      const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 0;
      const safeDiscount = Number.isFinite(discount) && discount >= 0 && discount <= 100 ? discount : 0;
      const safeGst = Number.isFinite(gst) && gst >= 0 && gst <= 100 ? gst : 0;

      const gross = safeQty * safeRate;
      const discountValue = (gross * safeDiscount) / 100;
      const net = gross - discountValue;

      return {
        ...item,
        qty: safeQty,
        rate: safeRate,
        discountPercent: safeDiscount,
        gstRate: safeGst,
        gross,
        discountValue,
        net,
      };
    });

    const safeExtra = Number.isFinite(extraDiscount) && extraDiscount >= 0 && extraDiscount <= 100 ? extraDiscount : 0;
    const safeAdvance = Number.isFinite(advancePercent) && advancePercent >= 0 && advancePercent <= 100 ? advancePercent : 0;

    const grossTotal = lines.reduce((sum, line) => sum + line.gross, 0);
    const lineDiscountTotal = lines.reduce((sum, line) => sum + line.discountValue, 0);
    const afterLineDiscount = grossTotal - lineDiscountTotal;
    const extraDiscountValue = (afterLineDiscount * safeExtra) / 100;
    const taxableTotal = afterLineDiscount - extraDiscountValue;

    // The overall discount is spread proportionally so each line keeps its own GST rate.
    const factor = afterLineDiscount > 0 ? taxableTotal / afterLineDiscount : 0;
    const taxTotal = lines.reduce((sum, line) => sum + (line.net * factor * line.gstRate) / 100, 0);

    const grand = taxableTotal + taxTotal;
    const rounded = Math.round(grand);
    const totalSavings = lineDiscountTotal + extraDiscountValue;
    const savingsPercent = grossTotal > 0 ? (totalSavings / grossTotal) * 100 : 0;

    const validDays = Number.isFinite(validityDays) && validityDays >= 0 ? Math.trunc(validityDays) : 0;
    const validUntilDate = addDays(form.quoteDate, validDays);
    if (!validUntilDate) errors.push("Enter a valid quotation date.");

    return {
      errors,
      lines,
      grossTotal,
      lineDiscountTotal,
      extraDiscountValue,
      taxableTotal,
      taxTotal,
      cgst: form.interState ? 0 : taxTotal / 2,
      sgst: form.interState ? 0 : taxTotal / 2,
      igst: form.interState ? taxTotal : 0,
      grand,
      rounded,
      roundOff: rounded - grand,
      totalSavings,
      savingsPercent,
      validUntil: validUntilDate ? isoOf(validUntilDate) : "",
      advanceValue: (rounded * safeAdvance) / 100,
      balanceValue: rounded - (rounded * safeAdvance) / 100,
      advancePercent: safeAdvance,
      factor,
    };
  }, [form]);

  const hasError = quote.errors.length > 0;

  const summary = useMemo(
    () =>
      [
        `QUOTATION ${form.quoteNumber}`,
        `Date: ${form.quoteDate}   Valid until: ${quote.validUntil || "-"}`,
        "",
        `From: ${form.fromName}`,
        form.fromDetails,
        `To: ${form.clientName}`,
        form.clientDetails,
        "",
        "Items:",
        ...quote.lines.map(
          (line, index) =>
            `${index + 1}. ${line.description || "Item"} - ${line.qty} ${line.unit} x ${line.rate}` +
            `${line.discountPercent ? ` less ${line.discountPercent}%` : ""} @ ${line.gstRate}% GST = ${line.net.toFixed(2)}`
        ),
        "",
        `Gross: ${quote.grossTotal.toFixed(2)}`,
        `Discounts: -${(quote.lineDiscountTotal + quote.extraDiscountValue).toFixed(2)}`,
        `Taxable value: ${quote.taxableTotal.toFixed(2)}`,
        form.interState
          ? `IGST: ${quote.igst.toFixed(2)}`
          : `CGST: ${quote.cgst.toFixed(2)} | SGST: ${quote.sgst.toFixed(2)}`,
        `Grand total: ${quote.rounded.toFixed(2)}`,
        `Advance (${quote.advancePercent}%): ${quote.advanceValue.toFixed(2)}`,
        `Balance: ${quote.balanceValue.toFixed(2)}`,
        "",
        `Terms: ${form.terms}`,
        form.notes ? `Notes: ${form.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [form, quote]
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
            <FileText className="h-4 w-4" aria-hidden="true" />
            Sales quotes
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Quotation Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Price a proposal properly: per-line discounts, an optional overall discount, GST, a validity
            date and an advance-versus-balance split.
          </p>
        </header>

        <section className="mt-6 grid gap-6 print:hidden">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Quotation details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="qt-number">Quotation number</label>
                <input id="qt-number" type="text" value={form.quoteNumber} onChange={setField("quoteNumber")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-date">Quotation date</label>
                <input id="qt-date" type="date" value={form.quoteDate} onChange={setField("quoteDate")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-validity">Valid for (days)</label>
                <input id="qt-validity" type="number" inputMode="numeric" min="0" max="365" value={form.validityDays} onChange={setField("validityDays")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-advance">Advance required (%)</label>
                <input id="qt-advance" type="number" inputMode="decimal" min="0" max="100" value={form.advancePercent} onChange={setField("advancePercent")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-from">Your business name</label>
                <input id="qt-from" type="text" value={form.fromName} onChange={setField("fromName")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-client">Client name</label>
                <input id="qt-client" type="text" value={form.clientName} onChange={setField("clientName")} className={`${inputClass} mt-2`} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-from-details">Your address / GSTIN</label>
                <textarea id="qt-from-details" rows={2} value={form.fromDetails} onChange={setField("fromDetails")} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-client-details">Client address / contact</label>
                <textarea id="qt-client-details" rows={2} value={form.clientDetails} onChange={setField("clientDetails")} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-extra-discount">Overall discount (%)</label>
                <input id="qt-extra-discount" type="number" inputMode="decimal" min="0" max="100" value={form.extraDiscount} onChange={setField("extraDiscount")} className={`${inputClass} mt-2`} />
              </div>
              <div className="flex items-center gap-3 sm:pt-7">
                <input
                  id="qt-inter-state"
                  type="checkbox"
                  checked={form.interState}
                  onChange={setField("interState")}
                  className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                />
                <label className={labelClass} htmlFor="qt-inter-state">Inter-state supply (IGST)</label>
              </div>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Line items</h2>
              <button type="button" onClick={addItem} className={secondaryButtonClass} aria-label="Add another quotation line">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add line
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {form.items.map((item, index) => (
                <div key={item.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <div>
                    <label className={labelClass} htmlFor={`qt-desc-${item.id}`}>Line {index + 1} description</label>
                    <input
                      id={`qt-desc-${item.id}`}
                      type="text"
                      value={item.description}
                      onChange={(event) => setItem(item.id, "description", event.target.value)}
                      className={`${inputClass} mt-2`}
                      placeholder="Service or product"
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor={`qt-qty-${item.id}`}>Quantity</label>
                      <input id={`qt-qty-${item.id}`} type="number" inputMode="decimal" min="0" value={item.qty} onChange={(event) => setItem(item.id, "qty", event.target.value)} className={`${inputClass} mt-2`} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`qt-unit-${item.id}`}>Unit</label>
                      <input id={`qt-unit-${item.id}`} type="text" value={item.unit} onChange={(event) => setItem(item.id, "unit", event.target.value)} className={`${inputClass} mt-2`} placeholder="Nos / Hrs / Months" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`qt-rate-${item.id}`}>Rate (INR)</label>
                      <input id={`qt-rate-${item.id}`} type="number" inputMode="decimal" min="0" value={item.rate} onChange={(event) => setItem(item.id, "rate", event.target.value)} className={`${inputClass} mt-2`} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`qt-discount-${item.id}`}>Discount (%)</label>
                      <input id={`qt-discount-${item.id}`} type="number" inputMode="decimal" min="0" max="100" value={item.discount} onChange={(event) => setItem(item.id, "discount", event.target.value)} className={`${inputClass} mt-2`} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`qt-gst-${item.id}`}>GST rate (%)</label>
                      <select id={`qt-gst-${item.id}`} value={item.gst} onChange={(event) => setItem(item.id, "gst", event.target.value)} className={`${inputClass} mt-2`}>
                        {GST_RATES.map((rate) => (
                          <option key={rate} value={String(rate)}>{rate}%</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={form.items.length === 1}
                        aria-label={`Remove quotation line ${index + 1}`}
                        className={`${secondaryButtonClass} w-full disabled:opacity-50`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                    Net before tax{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {rupee.format(quote.lines[index]?.net || 0)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Terms and notes</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className={labelClass} htmlFor="qt-terms">Payment and scope terms</label>
                <textarea id="qt-terms" rows={2} value={form.terms} onChange={setField("terms")} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="qt-notes">Notes</label>
                <textarea id="qt-notes" rows={2} value={form.notes} onChange={setField("notes")} className={textareaClass} />
              </div>
              <div>
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset the quotation to defaults">
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
              {quote.errors[0]}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Quotation total (incl. GST)
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                    {rupeeRound.format(quote.rounded)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {form.quoteNumber} &middot; valid until {quote.validUntil || "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 print:hidden">
                  <button type="button" onClick={copySummary} className={primaryButtonClass} aria-label="Copy the quotation summary">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy quote"}
                  </button>
                  <button type="button" onClick={() => window.print()} className={secondaryButtonClass} aria-label="Print the quotation">
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Print
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">From</p>
                  <p className="mt-1 font-semibold">{form.fromName}</p>
                  <p className="text-[var(--muted-foreground)]">{form.fromDetails}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">To</p>
                  <p className="mt-1 font-semibold">{form.clientName}</p>
                  <p className="text-[var(--muted-foreground)]">{form.clientDetails}</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3">Description</th>
                      <th scope="col" className="py-2 pr-3 text-right">Qty</th>
                      <th scope="col" className="py-2 pr-3 text-right">Rate</th>
                      <th scope="col" className="py-2 pr-3 text-right">Discount</th>
                      <th scope="col" className="py-2 pr-3 text-right">GST</th>
                      <th scope="col" className="py-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lines.map((line, index) => (
                      <tr key={line.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">{line.description || `Line ${index + 1}`}</td>
                        <td className="py-2 pr-3 text-right">{line.qty} {line.unit}</td>
                        <td className="py-2 pr-3 text-right">{rupee.format(line.rate)}</td>
                        <td className="py-2 pr-3 text-right">
                          {line.discountPercent ? `${percent.format(line.discountPercent)}% (-${rupee.format(line.discountValue)})` : "-"}
                        </td>
                        <td className="py-2 pr-3 text-right">{line.gstRate}%</td>
                        <td className="py-2 text-right font-semibold">{rupee.format(line.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Gross value</dt>
                  <dd className="font-semibold">{rupee.format(quote.grossTotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Line discounts</dt>
                  <dd className="font-semibold">-{rupee.format(quote.lineDiscountTotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Overall discount</dt>
                  <dd className="font-semibold">-{rupee.format(quote.extraDiscountValue)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Taxable value</dt>
                  <dd className="font-semibold">{rupee.format(quote.taxableTotal)}</dd>
                </div>
                {form.interState ? (
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">IGST</dt>
                    <dd className="font-semibold">{rupee.format(quote.igst)}</dd>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">CGST</dt>
                      <dd className="font-semibold">{rupee.format(quote.cgst)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">SGST</dt>
                      <dd className="font-semibold">{rupee.format(quote.sgst)}</dd>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Round off</dt>
                  <dd className="font-semibold">{rupee.format(quote.roundOff)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-semibold">Grand total</dt>
                  <dd className="text-lg font-semibold text-[var(--primary)]">{rupeeRound.format(quote.rounded)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Advance ({percent.format(quote.advancePercent)}%)</dt>
                  <dd className="font-semibold">{rupee.format(quote.advanceValue)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Balance on delivery</dt>
                  <dd className="font-semibold">{rupee.format(quote.balanceValue)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Client saves</dt>
                  <dd className="font-semibold text-[var(--success)]">
                    {rupee.format(quote.totalSavings)} ({percent.format(quote.savingsPercent)}%)
                  </dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Terms</p>
                  <p className="mt-1">{form.terms || "-"}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Notes</p>
                  <p className="mt-1">{form.notes || "-"}</p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                Figures are calculated from what you enter and are for business use, not tax advice. The
                overall discount is spread across lines in proportion to value so each line keeps its own GST rate.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
