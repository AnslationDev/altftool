"use client";

import { useMemo, useState } from "react";
import { Copy, Printer, Receipt, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? Math.round(value) : 0);

const monthFmt = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
}

/** Converts a whole number to words using the Indian numbering system. */
function numberToWords(value) {
  const n = Math.floor(Math.abs(Number(value) || 0));
  if (n === 0) return "Zero";
  if (n > 999999999) return "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const DEFAULTS = {
  tenantName: "",
  landlordName: "",
  landlordPan: "",
  landlordAddress: "",
  propertyAddress: "",
  monthlyRent: "18000",
  startMonth: "2026-04",
  months: "12",
  paymentMode: "Bank transfer",
  city: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PAYMENT_MODES = ["Bank transfer", "UPI", "Cheque", "Cash"];

function parseStartMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1970 || year > 2100 || month < 1 || month > 12) return null;
  return { year, monthIndex: month - 1 };
}

export default function ToolHome() {
  const [tenantName, setTenantName] = useState(DEFAULTS.tenantName);
  const [landlordName, setLandlordName] = useState(DEFAULTS.landlordName);
  const [landlordPan, setLandlordPan] = useState(DEFAULTS.landlordPan);
  const [landlordAddress, setLandlordAddress] = useState(DEFAULTS.landlordAddress);
  const [propertyAddress, setPropertyAddress] = useState(DEFAULTS.propertyAddress);
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [paymentMode, setPaymentMode] = useState(DEFAULTS.paymentMode);
  const [city, setCity] = useState(DEFAULTS.city);
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => {
    const rent = Number(monthlyRent);
    if (String(monthlyRent).trim() === "" || !Number.isFinite(rent)) {
      return "Enter a valid monthly rent amount.";
    }
    if (rent <= 0) return "Monthly rent must be greater than zero.";
    if (rent > 10000000) return "Monthly rent looks unrealistically large.";
    const count = Number(months);
    if (!Number.isInteger(count) || count < 1 || count > 24) {
      return "Number of months must be a whole number between 1 and 24.";
    }
    if (!parseStartMonth(startMonth)) return "Pick a valid starting month.";
    const pan = landlordPan.trim().toUpperCase();
    if (pan && !PAN_PATTERN.test(pan)) {
      return "Landlord PAN must be 10 characters in the format ABCDE1234F.";
    }
    return "";
  }, [monthlyRent, months, startMonth, landlordPan]);

  const data = useMemo(() => {
    if (validation) return null;
    const rent = Number(monthlyRent);
    const count = Number(months);
    const start = parseStartMonth(startMonth);
    const receipts = [];
    for (let i = 0; i < count; i += 1) {
      const periodStart = new Date(start.year, start.monthIndex + i, 1);
      const receiptDate = new Date(start.year, start.monthIndex + i + 1, 0);
      receipts.push({
        id: `${periodStart.getFullYear()}-${periodStart.getMonth()}`,
        number: i + 1,
        period: monthFmt.format(periodStart),
        receiptDate,
        amount: rent,
      });
    }
    const total = rent * count;
    // The landlord-PAN rule is tested against ANNUAL rent, not the total of
    // however many receipts the user happens to be printing — someone printing
    // 3 receipts at ₹40,000 still crosses the ₹1,00,000 annual threshold.
    const annualRent = rent * 12;
    return {
      receipts,
      total,
      rent,
      annualRent,
      panRequired: annualRent > 100000,
      panProvided: PAN_PATTERN.test(landlordPan.trim().toUpperCase()),
      stampNeeded: paymentMode === "Cash" && rent > 5000,
      amountWords: numberToWords(rent),
    };
  }, [validation, monthlyRent, months, startMonth, landlordPan, paymentMode]);

  const tenant = tenantName.trim() || "________________";
  const landlord = landlordName.trim() || "________________";
  const property = propertyAddress.trim() || "________________";
  const landlordAddr = landlordAddress.trim();
  const panText = landlordPan.trim().toUpperCase();
  const cityText = city.trim();

  const plainText = useMemo(() => {
    if (!data) return "";
    return data.receipts
      .map((receipt) =>
        [
          "RENT RECEIPT",
          `Receipt No: ${receipt.number}`,
          `Date: ${dayFmt.format(receipt.receiptDate)}`,
          "",
          `Received a sum of ${money(receipt.amount)} (Rupees ${data.amountWords} only) from ${tenant}`,
          `towards rent of the property at ${property}`,
          `for the month of ${receipt.period}, paid by ${paymentMode}.`,
          "",
          `Landlord: ${landlord}`,
          panText ? `Landlord PAN: ${panText}` : "Landlord PAN: ____________",
          landlordAddr ? `Landlord address: ${landlordAddr}` : "",
          cityText ? `Place: ${cityText}` : "",
          "",
          "Signature of Landlord: ______________________",
          "--------------------------------------------",
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");
  }, [data, tenant, property, paymentMode, landlord, panText, landlordAddr, cityText]);

  const copyAll = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const printReceipts = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setTenantName(DEFAULTS.tenantName);
    setLandlordName(DEFAULTS.landlordName);
    setLandlordPan(DEFAULTS.landlordPan);
    setLandlordAddress(DEFAULTS.landlordAddress);
    setPropertyAddress(DEFAULTS.propertyAddress);
    setMonthlyRent(DEFAULTS.monthlyRent);
    setStartMonth(DEFAULTS.startMonth);
    setMonths(DEFAULTS.months);
    setPaymentMode(DEFAULTS.paymentMode);
    setCity(DEFAULTS.city);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6 print:hidden">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Receipt className="h-4 w-4" aria-hidden="true" />
            Documents
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Rent Receipt Generator for HRA
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Fill in the tenant, landlord and rent details once and get a printable receipt for every
            month of the year — with the landlord PAN line your employer asks for.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rr-tenant" className="block text-sm font-semibold">
                    Tenant name
                  </label>
                  <input
                    id="rr-tenant"
                    type="text"
                    value={tenantName}
                    onChange={(event) => setTenantName(event.target.value)}
                    placeholder="Your full name"
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-landlord" className="block text-sm font-semibold">
                    Landlord name
                  </label>
                  <input
                    id="rr-landlord"
                    type="text"
                    value={landlordName}
                    onChange={(event) => setLandlordName(event.target.value)}
                    placeholder="Owner's full name"
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-pan" className="block text-sm font-semibold">
                    Landlord PAN
                  </label>
                  <input
                    id="rr-pan"
                    type="text"
                    value={landlordPan}
                    onChange={(event) => setLandlordPan(event.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className={`mt-2 ${INPUT_CLASS} uppercase`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-city" className="block text-sm font-semibold">
                    Place of signing
                  </label>
                  <input
                    id="rr-city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City"
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rr-property" className="block text-sm font-semibold">
                  Rented property address
                </label>
                <textarea
                  id="rr-property"
                  rows={2}
                  value={propertyAddress}
                  onChange={(event) => setPropertyAddress(event.target.value)}
                  placeholder="Flat, building, street, city, PIN"
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                />
              </div>

              <div>
                <label htmlFor="rr-landlord-address" className="block text-sm font-semibold">
                  Landlord address (optional)
                </label>
                <textarea
                  id="rr-landlord-address"
                  rows={2}
                  value={landlordAddress}
                  onChange={(event) => setLandlordAddress(event.target.value)}
                  placeholder="Landlord's correspondence address"
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rr-rent" className="block text-sm font-semibold">
                    Monthly rent (₹)
                  </label>
                  <input
                    id="rr-rent"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={monthlyRent}
                    onChange={(event) => setMonthlyRent(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-start" className="block text-sm font-semibold">
                    Starting month
                  </label>
                  <input
                    id="rr-start"
                    type="month"
                    value={startMonth}
                    onChange={(event) => setStartMonth(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-months" className="block text-sm font-semibold">
                    Number of months
                  </label>
                  <input
                    id="rr-months"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="24"
                    step="1"
                    value={months}
                    onChange={(event) => setMonths(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="rr-mode" className="block text-sm font-semibold">
                    Payment mode
                  </label>
                  <select
                    id="rr-mode"
                    value={paymentMode}
                    onChange={(event) => setPaymentMode(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  disabled={!data}
                  aria-label="Copy all rent receipts as text"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={printReceipts}
                  disabled={!data}
                  aria-label="Print or save receipts as PDF"
                  className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Print
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Total rent for the period
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(data.total)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {data.receipts.length} receipt{data.receipts.length === 1 ? "" : "s"} at{" "}
                    {money(data.rent)} per month
                  </p>

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Rent in words (per month)</dt>
                      <dd className="text-sm font-semibold">Rupees {data.amountWords} only</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Landlord PAN required?</dt>
                      <dd className="text-sm font-semibold">
                        {data.panRequired ? "Yes — rent exceeds ₹1,00,000 a year" : "Not mandatory"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Revenue stamp</dt>
                      <dd className="text-sm font-semibold">
                        {data.stampNeeded ? "Affix ₹1 stamp (cash above ₹5,000)" : "Not needed"}
                      </dd>
                    </div>
                  </dl>

                  {data.panRequired && !data.panProvided && (
                    <p
                      role="alert"
                      className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      Annual rent of {money(data.annualRent)} crosses ₹1,00,000, so your employer needs the
                      landlord's PAN (or a signed declaration if the landlord has none). Add a valid PAN
                      above.
                    </p>
                  )}
                </>
              )}
            </div>

            {data && (
              <div className="grid gap-4">
                {data.receipts.map((receipt) => (
                  <article
                    key={receipt.id}
                    className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:break-after-page print:rounded-none print:bg-white print:text-black print:ring-0 print:outline print:outline-1"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
                      <h2 className="text-lg font-semibold uppercase tracking-wide">Rent Receipt</h2>
                      <p className="text-xs text-[var(--muted-foreground)] print:text-black">
                        No. {receipt.number} · {dayFmt.format(receipt.receiptDate)}
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-7">
                      Received a sum of <strong>{money(receipt.amount)}</strong> (Rupees{" "}
                      {data.amountWords} only) from <strong>{tenant}</strong> towards the rent of the
                      property situated at <strong>{property}</strong> for the month of{" "}
                      <strong>{receipt.period}</strong>, paid by {paymentMode.toLowerCase()}.
                    </p>
                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] print:text-black">
                          Landlord
                        </dt>
                        <dd className="font-semibold">{landlord}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] print:text-black">
                          Landlord PAN
                        </dt>
                        <dd className="font-semibold">{panText || "____________"}</dd>
                      </div>
                      {landlordAddr && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] print:text-black">
                            Landlord address
                          </dt>
                          <dd className="whitespace-pre-line">{landlordAddr}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                      <p className="text-xs text-[var(--muted-foreground)] print:text-black">
                        {cityText ? `Place: ${cityText}` : "Place: ______________"}
                      </p>
                      <div className="text-right">
                        {data.stampNeeded && (
                          <p className="mb-6 inline-block rounded border border-dashed border-[var(--border)] px-6 py-3 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] print:text-black">
                            Revenue
                            <br />
                            stamp
                          </p>
                        )}
                        <p className="border-t border-[var(--border)] pt-1 text-xs">
                          Signature of landlord
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <p className="text-xs text-[var(--muted-foreground)] print:hidden">
              Receipts are generated in your browser and nothing is uploaded. Issue receipts only for
              rent you have genuinely paid — this tool is informational and does not constitute tax
              advice.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
