"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Plus, Printer, Receipt, RotateCcw, Trash2 } from "lucide-react";

import { SUPPLIER_TYPES, buildBillOfSupply } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const qty = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-[5.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_LINES = [
  { id: 1, description: "Unbranded wheat flour", hsn: "1101", quantity: "10", unit: "BAG", rate: "250", discountPercent: "10" },
  { id: 2, description: "Jaggery, loose", hsn: "1701", quantity: "3", unit: "KGS", rate: "78.55", discountPercent: "0" },
];

const DEFAULTS = {
  supplierName: "Anand Traders",
  supplierAddress: "12 MG Road, Shivajinagar, Pune, Maharashtra 411005",
  supplierGstin: "27AAPFU0939F1ZV",
  recipientName: "Shree Foods",
  recipientAddress: "44 Market Yard, Nashik, Maharashtra 422001",
  recipientGstin: "",
  serialNumber: "BOS/26-27/001",
  dateOfIssue: "2026-04-15",
  supplierType: "composition",
  place: "Pune",
  roundOff: true,
  signed: true,
};

export default function ToolHome() {
  const [supplierName, setSupplierName] = useState(DEFAULTS.supplierName);
  const [supplierAddress, setSupplierAddress] = useState(DEFAULTS.supplierAddress);
  const [supplierGstin, setSupplierGstin] = useState(DEFAULTS.supplierGstin);
  const [recipientName, setRecipientName] = useState(DEFAULTS.recipientName);
  const [recipientAddress, setRecipientAddress] = useState(DEFAULTS.recipientAddress);
  const [recipientGstin, setRecipientGstin] = useState(DEFAULTS.recipientGstin);
  const [serialNumber, setSerialNumber] = useState(DEFAULTS.serialNumber);
  const [dateOfIssue, setDateOfIssue] = useState(DEFAULTS.dateOfIssue);
  const [supplierType, setSupplierType] = useState(DEFAULTS.supplierType);
  const [place, setPlace] = useState(DEFAULTS.place);
  const [roundOff, setRoundOff] = useState(DEFAULTS.roundOff);
  const [signed, setSigned] = useState(DEFAULTS.signed);
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [copied, setCopied] = useState(false);

  const bill = useMemo(
    () =>
      buildBillOfSupply({
        supplier: { name: supplierName, address: supplierAddress, gstin: supplierGstin },
        recipient: { name: recipientName, address: recipientAddress, gstin: recipientGstin },
        serialNumber,
        dateOfIssue,
        supplierType,
        roundOff,
        signed,
        lines,
      }),
    [
      supplierName,
      supplierAddress,
      supplierGstin,
      recipientName,
      recipientAddress,
      recipientGstin,
      serialNumber,
      dateOfIssue,
      supplierType,
      roundOff,
      signed,
      lines,
    ],
  );

  const hasError = Boolean(bill.error);

  const updateLine = (id, field, value) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };

  const addLine = () => {
    setLines((current) => {
      const nextId = current.reduce((max, line) => Math.max(max, line.id), 0) + 1;
      return [...current, { id: nextId, description: "", hsn: "", quantity: "1", unit: "NOS", rate: "0", discountPercent: "0" }];
    });
  };

  const removeLine = (id) => {
    setLines((current) => (current.length > 1 ? current.filter((line) => line.id !== id) : current));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "BILL OF SUPPLY (Rule 49, CGST Rules 2017)",
      bill.declaration,
      "",
      `No. ${bill.serialNumber}   Date ${bill.dateOfIssue}`,
      `Supplier: ${bill.supplier.name} — ${bill.supplier.address} — GSTIN ${bill.supplier.gstin} (${bill.supplier.stateName})`,
      `Recipient: ${bill.recipient.name || "—"} — ${bill.recipient.address || "—"}${bill.recipient.gstin ? ` — GSTIN ${bill.recipient.gstin}` : ""}`,
      "",
      ...bill.lines.map(
        (line, index) =>
          `${index + 1}. ${line.description} | HSN/SAC ${line.hsn || "—"} | ${qty(line.quantity)} ${line.unit || ""} x ${money(line.rate)}` +
          `${line.discountPercent ? ` less ${line.discountPercent}%` : ""} = ${money(line.value)}`,
      ),
      "",
      `Sub-total: ${money(bill.subTotal)}`,
      `Discount: ${money(bill.totalDiscount)}`,
      `Round off: ${money(bill.roundOffAmount)}`,
      `Total: ${money(bill.total)}`,
      `In words: ${bill.amountInWords}`,
      "",
      `Place: ${place || "—"}`,
      `For ${bill.supplier.name}`,
      "Authorised signatory",
    ].join("\n");
  }, [bill, hasError, place]);

  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSupplierName(DEFAULTS.supplierName);
    setSupplierAddress(DEFAULTS.supplierAddress);
    setSupplierGstin(DEFAULTS.supplierGstin);
    setRecipientName(DEFAULTS.recipientName);
    setRecipientAddress(DEFAULTS.recipientAddress);
    setRecipientGstin(DEFAULTS.recipientGstin);
    setSerialNumber(DEFAULTS.serialNumber);
    setDateOfIssue(DEFAULTS.dateOfIssue);
    setSupplierType(DEFAULTS.supplierType);
    setPlace(DEFAULTS.place);
    setRoundOff(DEFAULTS.roundOff);
    setSigned(DEFAULTS.signed);
    setLines(DEFAULT_LINES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          GST compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bill of Supply Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce a printable bill of supply for exempt, nil-rated and non-GST sales, and for every
          outward supply by a composition dealer — with all eight Rule 49 particulars, GSTIN check
          digit validation and the total spelled out in words.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Document details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bos-type">
              Why no GST is charged
            </label>
            <select
              id="bos-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supplierType}
              onChange={(event) => setSupplierType(event.target.value)}
            >
              {Object.entries(SUPPLIER_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bos-serial">
              Serial number (max 16 characters)
            </label>
            <input
              id="bos-serial"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={16}
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bos-date">
              Date of issue
            </label>
            <input
              id="bos-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateOfIssue}
              onChange={(event) => setDateOfIssue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bos-place">
              Place of signing
            </label>
            <input
              id="bos-place"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="bos-round">
            <input
              id="bos-round"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={roundOff}
              onChange={(event) => setRoundOff(event.target.checked)}
            />
            Round total to the nearest rupee
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="bos-signed">
            <input
              id="bos-signed"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={signed}
              onChange={(event) => setSigned(event.target.checked)}
            />
            Will be signed or digitally signed
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Supplier</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-sup-name">
                Trade name
              </label>
              <input
                id="bos-sup-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={supplierName}
                onChange={(event) => setSupplierName(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-sup-address">
                Address
              </label>
              <textarea
                id="bos-sup-address"
                className={`mt-2 ${AREA_CLASS}`}
                value={supplierAddress}
                onChange={(event) => setSupplierAddress(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-sup-gstin">
                GSTIN
              </label>
              <input
                id="bos-sup-gstin"
                className={`mt-2 ${INPUT_CLASS} uppercase`}
                type="text"
                maxLength={15}
                autoCapitalize="characters"
                spellCheck={false}
                value={supplierGstin}
                onChange={(event) => setSupplierGstin(event.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Recipient</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-rec-name">
                Name
              </label>
              <input
                id="bos-rec-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-rec-address">
                Address
              </label>
              <textarea
                id="bos-rec-address"
                className={`mt-2 ${AREA_CLASS}`}
                value={recipientAddress}
                onChange={(event) => setRecipientAddress(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="bos-rec-gstin">
                GSTIN (leave blank if unregistered)
              </label>
              <input
                id="bos-rec-gstin"
                className={`mt-2 ${INPUT_CLASS} uppercase`}
                type="text"
                maxLength={15}
                autoCapitalize="characters"
                spellCheck={false}
                value={recipientGstin}
                onChange={(event) => setRecipientGstin(event.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Line items</h2>
          <button type="button" onClick={addLine} className={GHOST_BTN} aria-label="Add a line item">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {lines.map((line, index) => (
            <div key={line.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Line {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Remove line ${index + 1}`}
                  disabled={lines.length < 2}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`bos-desc-${line.id}`}>
                    Description of goods or services
                  </label>
                  <input
                    id={`bos-desc-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={line.description}
                    onChange={(event) => updateLine(line.id, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bos-hsn-${line.id}`}>
                    HSN / SAC code
                  </label>
                  <input
                    id={`bos-hsn-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    inputMode="numeric"
                    value={line.hsn}
                    onChange={(event) => updateLine(line.id, "hsn", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bos-unit-${line.id}`}>
                    Unit
                  </label>
                  <input
                    id={`bos-unit-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={line.unit}
                    onChange={(event) => updateLine(line.id, "unit", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bos-qty-${line.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`bos-qty-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.001"
                    value={line.quantity}
                    onChange={(event) => updateLine(line.id, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bos-rate-${line.id}`}>
                    Rate per unit (INR)
                  </label>
                  <input
                    id={`bos-rate-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={line.rate}
                    onChange={(event) => updateLine(line.id, "rate", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`bos-disc-${line.id}`}>
                    Discount (%)
                  </label>
                  <input
                    id={`bos-disc-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={line.discountPercent}
                    onChange={(event) => updateLine(line.id, "discountPercent", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {bill.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total value of supply
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money(bill.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : bill.amountInWords}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the bill of supply as text"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy bill"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={hasError}
              aria-label="Print the bill of supply"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset the whole form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sub-total before discount", hasError ? "—" : money(bill.subTotal)],
            ["Total discount", hasError ? "—" : money(bill.totalDiscount)],
            ["Net value of supply", hasError ? "—" : money(bill.netTotal)],
            ["Round off", hasError ? "—" : money(bill.roundOffAmount)],
            ["Total quantity billed", hasError ? "—" : qty(bill.totalQuantity)],
            ["Document number and date", hasError ? "—" : `${bill.serialNumber} · ${bill.dateOfIssue}`],
            ["Supplier state", hasError ? "—" : bill.supplier.stateName],
            [
              "Supply type",
              hasError ? "—" : bill.recipient.gstin ? (bill.interState ? "Inter-state (B2B)" : "Intra-state (B2B)") : "Recipient unregistered",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && bill.warnings.length > 0 && (
          <ul className="mt-5 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {bill.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Printable bill of supply</h2>
          <div className="mt-4 rounded-lg border border-[var(--border)] p-4 text-sm leading-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {bill.declaration}
            </p>
            <p className="mt-2 text-center text-base font-semibold">Bill of Supply</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-semibold">{bill.supplier.name}</p>
                <p className="whitespace-pre-line text-[var(--muted-foreground)]">{bill.supplier.address}</p>
                <p className="text-[var(--muted-foreground)]">GSTIN: {bill.supplier.gstin}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[var(--muted-foreground)]">No. {bill.serialNumber}</p>
                <p className="text-[var(--muted-foreground)]">Date: {bill.dateOfIssue}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Billed to
              </p>
              <p className="font-semibold">{bill.recipient.name || "Unregistered buyer"}</p>
              <p className="whitespace-pre-line text-[var(--muted-foreground)]">{bill.recipient.address}</p>
              {bill.recipient.gstin && (
                <p className="text-[var(--muted-foreground)]">GSTIN: {bill.recipient.gstin}</p>
              )}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Description</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">HSN/SAC</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                    <th scope="col" className="py-2 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.lines.map((line, index) => (
                    <tr key={`${line.description}-${index}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{index + 1}</td>
                      <td className="py-2 pr-3">{line.description}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{line.hsn || "—"}</td>
                      <td className="py-2 pr-3 text-right">
                        {qty(line.quantity)} {line.unit}
                      </td>
                      <td className="py-2 pr-3 text-right">{money(line.rate)}</td>
                      <td className="py-2 text-right font-semibold">{money(line.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-1 border-t border-[var(--border)] pt-3 sm:items-end">
              <p>
                <span className="text-[var(--muted-foreground)]">Net value: </span>
                <span className="font-semibold">{money(bill.netTotal)}</span>
              </p>
              <p>
                <span className="text-[var(--muted-foreground)]">Total payable: </span>
                <span className="font-semibold text-[var(--primary)]">{money(bill.total)}</span>
              </p>
              <p className="text-[var(--muted-foreground)]">{bill.amountInWords}</p>
            </div>

            <div className="mt-6 flex flex-col gap-1 text-[var(--muted-foreground)] sm:items-end">
              <p>Place: {place || "—"}</p>
              <p>For {bill.supplier.name}</p>
              <p className="mt-6">Authorised signatory</p>
            </div>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. A bill of supply must not show any GST; if part of the
        same transaction is taxable you need a tax invoice, or an invoice-cum-bill of supply under
        Rule 46A. Confirm your numbering series and exemption with a GST practitioner.
      </p>
    </main>
  );
}
