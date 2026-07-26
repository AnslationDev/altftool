"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, QrCode, RotateCcw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "text-sm font-semibold text-[var(--foreground)]";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  vpa: "yourname@okicici",
  payee: "ALTF Traders",
  fixedAmount: true,
  amount: "499",
  note: "Order payment",
  reference: "",
  merchantCode: "",
};

// UPI virtual payment address: handle@psp
const VPA_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,49})@[a-zA-Z][a-zA-Z0-9.]{1,63}$/;

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const sanitizeFileName = (value) =>
  value
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "upi";

function buildUpiUri({ vpa, payee, amount, note, reference, merchantCode }) {
  const params = [
    ["pa", vpa],
    ["pn", payee],
    ["am", amount],
    ["cu", "INR"],
    ["tn", note],
    ["tr", reference],
    ["mc", merchantCode],
  ].filter(([, value]) => value !== "" && value !== null && value !== undefined);

  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `upi://pay?${query}`;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const model = useMemo(() => {
    const vpa = form.vpa.trim();
    const payee = form.payee.trim();
    const note = form.note.trim().slice(0, 50);
    const reference = form.reference.trim().slice(0, 35);
    const merchantCode = form.merchantCode.trim();

    const errors = [];
    if (!vpa) errors.push("Enter the UPI ID (VPA) that should receive the money.");
    else if (!VPA_PATTERN.test(vpa)) errors.push("That UPI ID does not look valid. Use the format name@bank, e.g. priya@okhdfcbank.");

    if (!payee) errors.push("Enter the payee name shown to the person paying.");

    let amount = "";
    let amountValue = 0;
    if (form.fixedAmount) {
      const raw = String(form.amount).trim();
      amountValue = Number(raw);
      if (!raw) errors.push("Enter an amount, or switch off the fixed amount.");
      else if (!Number.isFinite(amountValue) || amountValue <= 0) errors.push("Amount must be a number greater than zero.");
      else if (amountValue > 100000) errors.push("Most UPI apps cap a single person-to-person payment at ₹1,00,000. Lower the amount or leave it open.");
      else if (!/^\d+(\.\d{1,2})?$/.test(raw)) errors.push("Amount can have at most two decimal places.");
      else amount = amountValue.toFixed(2);
    }

    if (merchantCode && !/^\d{4}$/.test(merchantCode)) {
      errors.push("Merchant category code must be exactly 4 digits, or left blank.");
    }

    if (errors.length > 0) return { errors, uri: "" };

    return {
      errors: [],
      vpa,
      payee,
      amount,
      amountValue,
      note,
      reference,
      merchantCode,
      uri: buildUpiUri({ vpa, payee, amount, note, reference, merchantCode }),
    };
  }, [form]);

  const hasError = model.errors.length > 0;

  const copyLink = async () => {
    if (!model.uri) return;
    try {
      await navigator.clipboard.writeText(model.uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `upi-qr-${sanitizeFileName(form.vpa)}.png`;
    link.click();
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            UPI payments
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">UPI QR Code Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Turn your UPI ID into a scannable payment QR — with an optional fixed amount, note and
            reference — that works in GPay, PhonePe, Paytm, BHIM and any UPI app.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Payment details</h2>

            <div className="mt-4 grid gap-4">
              <div>
                <label className={labelClass} htmlFor="upi-vpa">
                  UPI ID / VPA
                </label>
                <input
                  id="upi-vpa"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  spellCheck={false}
                  value={form.vpa}
                  onChange={setField("vpa")}
                  className={`${inputClass} mt-2`}
                  placeholder="name@okhdfcbank"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="upi-payee">
                  Payee name
                </label>
                <input
                  id="upi-payee"
                  type="text"
                  value={form.payee}
                  onChange={setField("payee")}
                  className={`${inputClass} mt-2`}
                  placeholder="Shop or person name"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="upi-fixed"
                  type="checkbox"
                  checked={form.fixedAmount}
                  onChange={setField("fixedAmount")}
                  className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                />
                <label className={labelClass} htmlFor="upi-fixed">
                  Lock a fixed amount (leave off to let the payer type it)
                </label>
              </div>

              {form.fixedAmount && (
                <div>
                  <label className={labelClass} htmlFor="upi-amount">
                    Amount (INR)
                  </label>
                  <input
                    id="upi-amount"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={setField("amount")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="upi-note">
                    Payment note (optional)
                  </label>
                  <input
                    id="upi-note"
                    type="text"
                    maxLength={50}
                    value={form.note}
                    onChange={setField("note")}
                    className={`${inputClass} mt-2`}
                    placeholder="Invoice INV-2026-0001"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="upi-reference">
                    Reference ID (optional)
                  </label>
                  <input
                    id="upi-reference"
                    type="text"
                    maxLength={35}
                    value={form.reference}
                    onChange={setField("reference")}
                    className={`${inputClass} mt-2`}
                    placeholder="ORDER1042"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="upi-mcc">
                  Merchant category code (optional, 4 digits)
                </label>
                <input
                  id="upi-mcc"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.merchantCode}
                  onChange={setField("merchantCode")}
                  className={`${inputClass} mt-2`}
                  placeholder="5411"
                />
              </div>

              <div>
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset all fields to defaults">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {hasError ? (
              <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {model.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {form.fixedAmount ? "Fixed request" : "Open amount"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                  {form.fixedAmount ? rupee.format(model.amountValue) : "Payer decides"}
                </p>

                <div className="mt-4 flex justify-center rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <QRCodeCanvas ref={canvasRef} value={model.uri} size={220} marginSize={3} level="M" />
                </div>

                <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Pay to</dt>
                    <dd className="break-all text-right font-semibold">{model.vpa}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Payee name</dt>
                    <dd className="text-right font-semibold">{model.payee}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Currency</dt>
                    <dd className="font-semibold">INR</dd>
                  </div>
                  {model.note && (
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">Note</dt>
                      <dd className="text-right font-semibold">{model.note}</dd>
                    </div>
                  )}
                  {model.reference && (
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">Reference</dt>
                      <dd className="text-right font-semibold">{model.reference}</dd>
                    </div>
                  )}
                </dl>

                <p className="mt-4 break-all rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs text-[var(--muted-foreground)]">
                  {model.uri}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={copyLink} className={primaryButtonClass} aria-label="Copy the UPI payment link">
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy UPI link"}
                  </button>
                  <button type="button" onClick={downloadPng} className={secondaryButtonClass} aria-label="Download the QR code as a PNG image">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    PNG
                  </button>
                </div>

                <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                  Always test-scan the code and check the payee name your app shows before printing or
                  sharing it.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
