"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  INCOTERMS_2020,
  PROFORMA_CURRENCIES,
  addDaysToIsoDate,
  amountInWords,
  buildProformaNumber,
  computeProformaTotals,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const START_ITEMS = [
  { id: 1, description: "Stainless steel widget", hsCode: "7326.90", unit: "pcs", quantity: "10", unitPrice: "250", discountPercent: "10", taxPercent: "5" },
  { id: 2, description: "Mounting bracket", hsCode: "7308.90", unit: "pcs", quantity: "5", unitPrice: "100", discountPercent: "0", taxPercent: "5" },
];

const DEFAULTS = {
  seller: "Acme Exports Pvt Ltd",
  buyer: "Northwind Trading GmbH",
  currency: "USD",
  incoterm: "CIF",
  namedPlace: "Port of Hamburg",
  issueDate: "2026-01-15",
  validityDays: "30",
  prefix: "PI",
  sequence: "7",
  freight: "200",
  insurance: "50",
  packing: "0",
  otherCharges: "0",
  advancePercent: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [items, setItems] = useState(START_ITEMS);
  const [seller, setSeller] = useState(DEFAULTS.seller);
  const [buyer, setBuyer] = useState(DEFAULTS.buyer);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [incoterm, setIncoterm] = useState(DEFAULTS.incoterm);
  const [namedPlace, setNamedPlace] = useState(DEFAULTS.namedPlace);
  const [issueDate, setIssueDate] = useState(DEFAULTS.issueDate);
  const [validityDays, setValidityDays] = useState(DEFAULTS.validityDays);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [sequence, setSequence] = useState(DEFAULTS.sequence);
  const [freight, setFreight] = useState(DEFAULTS.freight);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [packing, setPacking] = useState(DEFAULTS.packing);
  const [otherCharges, setOtherCharges] = useState(DEFAULTS.otherCharges);
  const [advancePercent, setAdvancePercent] = useState(DEFAULTS.advancePercent);
  const [copied, setCopied] = useState(false);

  const currencyMeta =
    PROFORMA_CURRENCIES.find((entry) => entry.code === currency) || PROFORMA_CURRENCIES[0];
  const incotermMeta = INCOTERMS_2020.find((entry) => entry.code === incoterm) || INCOTERMS_2020[0];

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency],
  );
  const money = (value) => formatter.format(Number.isFinite(value) ? value : 0);

  const totals = useMemo(
    () =>
      computeProformaTotals({
        items: items.map((item) => ({
          description: item.description,
          hsCode: item.hsCode,
          unit: item.unit,
          quantity: toNumber(item.quantity),
          unitPrice: toNumber(item.unitPrice),
          discountPercent: toNumber(item.discountPercent),
          taxPercent: toNumber(item.taxPercent),
        })),
        freight: toNumber(freight),
        insurance: toNumber(insurance),
        packing: toNumber(packing),
        otherCharges: toNumber(otherCharges),
        advancePercent: toNumber(advancePercent),
      }),
    [items, freight, insurance, packing, otherCharges, advancePercent],
  );

  const validity = useMemo(
    () => addDaysToIsoDate(issueDate, Math.trunc(toNumber(validityDays))),
    [issueDate, validityDays],
  );

  const hasError = Boolean(totals.error) || Boolean(validity.error);
  const proformaNumber = buildProformaNumber(prefix, issueDate, toNumber(sequence));
  const words = hasError ? "" : amountInWords(totals.grandTotal, currencyMeta.unit, currencyMeta.subunit);

  const updateItem = (id, field, value) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((previous) => {
      // Derive the next id from existing state — never from a ref read during render.
      const nextId = previous.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [
        ...previous,
        {
          id: nextId,
          description: "",
          hsCode: "",
          unit: "pcs",
          quantity: "1",
          unitPrice: "0",
          discountPercent: "0",
          taxPercent: "0",
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((previous) => (previous.length > 1 ? previous.filter((item) => item.id !== id) : previous));
  };

  const documentText = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "PROFORMA INVOICE",
      `Number: ${proformaNumber}`,
      `Issue date: ${issueDate}`,
      validity.error ? `Valid for: ${validityDays} days` : `Valid until: ${validity.isoDate} (${validity.days} days)`,
      `Seller: ${seller}`,
      `Buyer: ${buyer}`,
      `Incoterm: ${incotermMeta.code} ${incotermMeta.name} — ${namedPlace}`,
      `Currency: ${currency}`,
      "",
      "Line items",
      ...totals.lines.map(
        (line, index) =>
          `${index + 1}. ${line.description}${line.hsCode ? ` (HS ${line.hsCode})` : ""} — ${line.quantity} ${line.unit} x ${money(line.unitPrice)} = ${money(line.total)}`,
      ),
      "",
      `Subtotal: ${money(totals.subtotal)}`,
      `Discount: -${money(totals.totalDiscount)}`,
      `Taxable value: ${money(totals.taxableValue)}`,
      `Tax: ${money(totals.totalTax)}`,
      `Freight: ${money(totals.freight)}`,
      `Insurance: ${money(totals.insurance)}`,
      `Packing: ${money(totals.packing)}`,
      `Other charges: ${money(totals.otherCharges)}`,
      `GRAND TOTAL: ${money(totals.grandTotal)}`,
      `Amount in words: ${words}`,
      "",
      `Advance payable (${pct(totals.advancePercent)}): ${money(totals.advanceDue)}`,
      `Balance before dispatch: ${money(totals.balanceDue)}`,
      `CIF value for customs: ${money(totals.cifValue)}`,
      "",
      "This is a proforma invoice issued for quotation, advance payment and customs purposes.",
      "It is not a demand for payment and no tax credit may be claimed against it.",
    ];
    return lines.join("\n");
  }, [
    buyer,
    currency,
    hasError,
    incotermMeta,
    issueDate,
    money,
    namedPlace,
    proformaNumber,
    seller,
    totals,
    validity,
    validityDays,
    words,
  ]);

  const copyResult = async () => {
    if (!documentText) return;
    try {
      await navigator.clipboard.writeText(documentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setItems(START_ITEMS);
    setSeller(DEFAULTS.seller);
    setBuyer(DEFAULTS.buyer);
    setCurrency(DEFAULTS.currency);
    setIncoterm(DEFAULTS.incoterm);
    setNamedPlace(DEFAULTS.namedPlace);
    setIssueDate(DEFAULTS.issueDate);
    setValidityDays(DEFAULTS.validityDays);
    setPrefix(DEFAULTS.prefix);
    setSequence(DEFAULTS.sequence);
    setFreight(DEFAULTS.freight);
    setInsurance(DEFAULTS.insurance);
    setPacking(DEFAULTS.packing);
    setOtherCharges(DEFAULTS.otherCharges);
    setAdvancePercent(DEFAULTS.advancePercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Export documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Proforma Invoice Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a proforma invoice with HS codes, an Incoterms 2020 rule, freight and insurance
          split out for customs, a validity date and the total spelled out in words.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and terms</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-seller">
              Seller / exporter
            </label>
            <input
              id="pi-seller"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={seller}
              onChange={(event) => setSeller(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-buyer">
              Buyer / consignee
            </label>
            <input
              id="pi-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={buyer}
              onChange={(event) => setBuyer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-incoterm">
              Incoterms 2020 rule
            </label>
            <select
              id="pi-incoterm"
              className={`mt-2 ${INPUT_CLASS}`}
              value={incoterm}
              onChange={(event) => setIncoterm(event.target.value)}
            >
              {INCOTERMS_2020.map((term) => (
                <option key={term.code} value={term.code}>
                  {term.code} — {term.name}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Under {incotermMeta.code} the seller {incotermMeta.sellerPaysFreight ? "pays" : "does not pay"}{" "}
              freight and {incotermMeta.sellerPaysInsurance ? "carries" : "does not carry"} insurance
              to the named place.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-place">
              Named place or port
            </label>
            <input
              id="pi-place"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={namedPlace}
              onChange={(event) => setNamedPlace(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-currency">
              Currency
            </label>
            <select
              id="pi-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {PROFORMA_CURRENCIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.code} — {entry.unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-issue">
              Issue date
            </label>
            <input
              id="pi-issue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-validity">
              Validity (days)
            </label>
            <input
              id="pi-validity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3650"
              step="1"
              value={validityDays}
              onChange={(event) => setValidityDays(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {validity.error ? validity.error : `Quoted prices lapse on ${validity.isoDate}.`}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-prefix">
              Reference prefix
            </label>
            <input
              id="pi-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={6}
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-sequence">
              Sequence number
            </label>
            <input
              id="pi-sequence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sequence}
              onChange={(event) => setSequence(event.target.value)}
            />
            <p className={HINT_CLASS}>Document reference: {proformaNumber}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Line items</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add a line item">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-md border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Line {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  aria-label={`Remove line ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`pi-desc-${item.id}`}>
                    Description of goods
                  </label>
                  <input
                    id={`pi-desc-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.description}
                    onChange={(event) => updateItem(item.id, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-hs-${item.id}`}>
                    HS code
                  </label>
                  <input
                    id={`pi-hs-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.hsCode}
                    onChange={(event) => updateItem(item.id, "hsCode", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-unit-${item.id}`}>
                    Unit
                  </label>
                  <input
                    id={`pi-unit-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.unit}
                    onChange={(event) => updateItem(item.id, "unit", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-qty-${item.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`pi-qty-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-price-${item.id}`}>
                    Unit price ({currency})
                  </label>
                  <input
                    id={`pi-price-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-disc-${item.id}`}>
                    Discount (%)
                  </label>
                  <input
                    id={`pi-disc-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={item.discountPercent}
                    onChange={(event) => updateItem(item.id, "discountPercent", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pi-tax-${item.id}`}>
                    Tax (%)
                  </label>
                  <input
                    id={`pi-tax-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={item.taxPercent}
                    onChange={(event) => updateItem(item.id, "taxPercent", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold">Charges added after the line totals</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-freight">
              Freight ({currency})
            </label>
            <input
              id="pi-freight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={freight}
              onChange={(event) => setFreight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-insurance">
              Insurance ({currency})
            </label>
            <input
              id="pi-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-packing">
              Packing ({currency})
            </label>
            <input
              id="pi-packing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={packing}
              onChange={(event) => setPacking(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pi-other">
              Other charges ({currency})
            </label>
            <input
              id="pi-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={otherCharges}
              onChange={(event) => setOtherCharges(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pi-advance">
              Advance payable before shipment (%)
            </label>
            <input
              id="pi-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={advancePercent}
              onChange={(event) => setAdvancePercent(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {totals.error || validity.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Grand total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(totals.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the error above to see a total." : words}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the proforma invoice text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy invoice"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the proforma invoice"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Description</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Net</th>
                  <th scope="col" className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {totals.lines.map((line, index) => (
                  <tr key={`${line.description}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{line.description}</span>
                      {line.hsCode ? (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          HS {line.hsCode}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{money(line.unitPrice)}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(line.net)}
                    </td>
                    <td className="py-2.5 text-right font-semibold">{money(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subtotal before discount", hasError ? DASH : money(totals.subtotal)],
            [
              `Discount (${hasError ? DASH : pct(totals.effectiveDiscountPercent)})`,
              hasError ? DASH : `-${money(totals.totalDiscount)}`,
            ],
            ["Taxable value / FOB value", hasError ? DASH : money(totals.taxableValue)],
            ["Tax", hasError ? DASH : money(totals.totalTax)],
            ["Freight", hasError ? DASH : money(totals.freight)],
            ["Insurance", hasError ? DASH : money(totals.insurance)],
            ["Packing and other charges", hasError ? DASH : money(totals.packing + totals.otherCharges)],
            ["CIF value used for customs", hasError ? DASH : money(totals.cifValue)],
            ["Grand total", hasError ? DASH : money(totals.grandTotal)],
            [
              `Advance payable (${hasError ? DASH : pct(totals.advancePercent)})`,
              hasError ? DASH : money(totals.advanceDue),
            ],
            ["Balance before dispatch", hasError ? DASH : money(totals.balanceDue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A proforma invoice is a quotation and a customs valuation document, not a demand for
        payment, and no input tax may be claimed against it. Confirm the Incoterm, tax treatment
        and any licence requirements with your freight forwarder or customs broker.
      </p>
    </main>
  );
}
