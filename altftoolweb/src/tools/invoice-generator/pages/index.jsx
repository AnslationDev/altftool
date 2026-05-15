"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer, Trash2 } from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const createItem = (id) => ({
  id,
  name: id === 1 ? "Website design" : "Service item",
  quantity: 1,
  rate: id === 1 ? 15000 : 5000,
});

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
      />
    </label>
  );
}

export default function ToolHome() {
  const [businessName, setBusinessName] = useState("AltFTool Studio");
  const [clientName, setClientName] = useState("Client Name");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [items, setItems] = useState([createItem(1), createItem(2)]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    const discountAmount = Math.min(subtotal, Number(discount) || 0);
    const taxable = subtotal - discountAmount;
    const tax = taxable * ((Number(taxRate) || 0) / 100);
    return {
      subtotal,
      discountAmount,
      taxable,
      tax,
      total: taxable + tax,
    };
  }, [items, taxRate, discount]);

  const updateItem = (id, key, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === "name" ? value : Number(value),
            }
          : item
      )
    );
  };

  const addItem = () => {
    const nextId = Math.max(...items.map((item) => item.id), 0) + 1;
    setItems((current) => [...current, createItem(nextId)]);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="grid gap-6 2xl:grid-cols-[1fr_auto] 2xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <FileSpreadsheet className="h-4 w-4" />
                Business document
              </div>
              <h1 className="text-4xl font-semibold leading-tight">Invoice Generator</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Build a clean invoice with line items, GST-style tax, discount, notes, and print-ready totals.
              </p>
            </div>
            <button type="button" onClick={() => window.print()} className="btn-primary">
              <Printer className="h-4 w-4" />
              Print invoice
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[440px_1fr]">
          <div className="space-y-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="tool-form-grid">
              <TextField label="Business name" value={businessName} onChange={setBusinessName} />
              <TextField label="Client name" value={clientName} onChange={setClientName} />
              <TextField label="Invoice number" value={invoiceNumber} onChange={setInvoiceNumber} />
              <label className="block">
                <span className="text-sm font-semibold">Date</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <TextField label="Tax rate %" value={String(taxRate)} onChange={(value) => setTaxRate(Number(value))} />
              <TextField label="Discount amount" value={String(discount)} onChange={(value) => setDiscount(Number(value))} />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Line items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-secondary min-h-9 px-3 py-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <input
                      value={item.name}
                      onChange={(event) => updateItem(item.id, "name", event.target.value)}
                      className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[var(--primary)]"
                    />
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                        className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[var(--primary)]"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(event) => updateItem(item.id, "rate", event.target.value)}
                        className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[var(--primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">From</p>
                <h2 className="mt-1 break-words text-2xl font-semibold">{businessName}</h2>
              </div>
              <div className="min-w-0 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Invoice</p>
                <p className="mt-1 break-words text-lg font-semibold">{invoiceNumber}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{invoiceDate}</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-[var(--muted)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Bill to</p>
              <p className="mt-1 break-words text-lg font-semibold">{clientName}</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)]">
              <div className="hidden grid-cols-[minmax(0,1fr)_80px_110px_120px] bg-[var(--muted)] px-4 py-3 text-xs font-semibold uppercase text-[var(--muted-foreground)] md:grid">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid gap-2 border-t border-[var(--border)] px-4 py-4 text-sm first:border-t-0 md:grid-cols-[minmax(0,1fr)_80px_110px_120px] md:gap-0 md:py-3">
                  <span className="min-w-0 break-words font-semibold md:font-normal">{item.name}</span>
                  <span className="flex justify-between gap-3 md:block md:text-right">
                    <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)] md:hidden">Qty</span>
                    {item.quantity}
                  </span>
                  <span className="flex justify-between gap-3 md:block md:text-right">
                    <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)] md:hidden">Rate</span>
                    <span className="break-words">{formatMoney(item.rate)}</span>
                  </span>
                  <span className="flex justify-between gap-3 font-semibold md:block md:text-right">
                    <span className="text-xs uppercase text-[var(--muted-foreground)] md:hidden">Amount</span>
                    <span className="break-words">{formatMoney(item.quantity * item.rate)}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="ml-auto mt-5 max-w-sm space-y-2">
              {[
                ["Subtotal", totals.subtotal],
                ["Discount", -totals.discountAmount],
                [`Tax (${taxRate}%)`, totals.tax],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm text-[var(--muted-foreground)]">
                  <span>{label}</span>
                  <span className="text-right break-words">{formatMoney(value)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3 text-xl font-semibold">
                <span>Total</span>
                <span className="text-right text-[var(--primary)] break-words">{formatMoney(totals.total)}</span>
              </div>
            </div>

            <p className="mt-8 rounded-lg bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">{notes}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
