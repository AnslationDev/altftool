"use client";

import { useMemo, useState } from "react";
import { Info, Printer, ReceiptText } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MAX_MONTHS = 60;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const paymentModes = [
  { id: "cash", label: "Cash", phrase: "in cash" },
  { id: "upi", label: "UPI", phrase: "via UPI" },
  { id: "bank", label: "Bank transfer", phrase: "by bank transfer" },
  { id: "cheque", label: "Cheque", phrase: "by cheque" },
];

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

function twoDigitWords(value) {
  if (value < 20) return ONES[value];
  return `${TENS[Math.floor(value / 10)]}${value % 10 ? ` ${ONES[value % 10]}` : ""}`;
}

function threeDigitWords(value) {
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const parts = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigitWords(rest));
  return parts.join(" ");
}

function amountInWords(value) {
  const amount = Math.round(Math.abs(Number(value) || 0));
  if (amount === 0) return "Zero";
  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const rest = amount % 1000;
  const parts = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest) parts.push(threeDigitWords(rest));
  return parts.join(" ");
}

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));

function parseMonth(value) {
  if (!value || typeof value !== "string") return null;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) return null;
  return { year, month };
}

function monthLabel({ year, month }) {
  return `${MONTHS[month - 1]} ${year}`;
}

function formatDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function defaultPeriod() {
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const from = `${fyStartYear}-04`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return { from, to };
}

const initialPeriod = defaultPeriod();

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

export default function ToolHome() {
  const [tenant, setTenant] = useState("Rahul Sharma");
  const [landlord, setLandlord] = useState("Suresh Verma");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("12B, Green Park Apartments, Sector 21, New Delhi - 110016");
  const [rent, setRent] = useState(15000);
  const [from, setFrom] = useState(initialPeriod.from);
  const [to, setTo] = useState(initialPeriod.to);
  const [mode, setMode] = useState("upi");
  const [granularity, setGranularity] = useState("monthly");

  const panValue = pan.trim().toUpperCase();
  const panValid = panValue === "" || PAN_PATTERN.test(panValue);

  const receipts = useMemo(() => {
    const start = parseMonth(from);
    const end = parseMonth(to);
    const monthlyRent = Math.max(0, Number(rent) || 0);

    if (!start || !end) return { error: "Pick a valid from and to month to generate receipts.", list: [] };
    const count = (end.year - start.year) * 12 + (end.month - start.month) + 1;
    if (count < 1) return { error: "The to month must be the same as, or after, the from month.", list: [] };
    if (monthlyRent <= 0) return { error: "Enter the monthly rent to generate receipts.", list: [] };

    const clamped = count > MAX_MONTHS;
    const totalMonths = Math.min(count, MAX_MONTHS);
    const months = Array.from({ length: totalMonths }, (_, index) => {
      const serial = start.year * 12 + (start.month - 1) + index;
      return { year: Math.floor(serial / 12), month: (serial % 12) + 1 };
    });

    const chunkSize = granularity === "quarterly" ? 3 : 1;
    const groups = [];
    for (let i = 0; i < months.length; i += chunkSize) {
      groups.push(months.slice(i, i + chunkSize));
    }

    const modePhrase = paymentModes.find((item) => item.id === mode)?.phrase || "in cash";
    const list = groups.map((group, index) => {
      const first = group[0];
      const last = group[group.length - 1];
      const amount = monthlyRent * group.length;
      const issueDate = new Date(last.year, last.month, 0);
      return {
        id: `${first.year}-${first.month}`,
        number: String(index + 1).padStart(2, "0"),
        periodLabel: group.length === 1 ? monthLabel(first) : `${monthLabel(first)} to ${monthLabel(last)}`,
        amount,
        words: amountInWords(amount),
        dateLabel: formatDate(issueDate),
        modePhrase,
        needsStamp: mode === "cash" && amount > 5000,
      };
    });

    return { error: "", list, clamped, totalMonths, totalAmount: monthlyRent * totalMonths };
  }, [from, to, rent, granularity, mode]);

  const tenantLabel = tenant.trim() || "________________";
  const landlordLabel = landlord.trim() || "________________";
  const addressLabel = address.trim() || "________________________________";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #rent-receipt-print-area, #rent-receipt-print-area * { visibility: visible; }
          #rent-receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; display: block; }
          #rent-receipt-print-area .rent-receipt-sheet {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1.5px solid black !important;
            border-radius: 0 !important;
            background: white !important;
            box-shadow: none !important;
            margin: 0 0 18px !important;
          }
          #rent-receipt-print-area .rent-receipt-sheet * {
            color: black !important;
            border-color: black !important;
            background: transparent !important;
          }
          @page { margin: 14mm; }
        }
      `}</style>
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ReceiptText className="h-4 w-4" />
            HRA proof · Print ready
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Rent Receipt Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Fill in your rent details once and get clean, formal receipts for every month or quarter — with the amount in
            words — ready to print or save as a PDF for HRA claims.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Tenant name (who pays the rent)</span>
                <input type="text" value={tenant} onChange={(event) => setTenant(event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Landlord name</span>
                <input type="text" value={landlord} onChange={(event) => setLandlord(event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Landlord PAN (optional)</span>
                <input
                  type="text"
                  value={pan}
                  onChange={(event) => setPan(event.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  aria-invalid={!panValid}
                  aria-describedby={panValid ? undefined : "rent-receipt-pan-error"}
                  className={`${inputClass} uppercase ${panValid ? "" : "border-[var(--anslation-ds-danger)]"}`}
                />
                {!panValid && (
                  <span id="rent-receipt-pan-error" className="mt-1 block text-xs font-semibold text-[var(--anslation-ds-danger)]">
                    PAN must look like ABCDE1234F (5 letters, 4 digits, 1 letter).
                  </span>
                )}
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Full rented address</span>
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Monthly rent (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={rent}
                  onChange={(event) => setRent(event.target.value)}
                  className={inputClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">From month</span>
                  <input type="month" value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">To month</span>
                  <input type="month" value={to} onChange={(event) => setTo(event.target.value)} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Payment mode</span>
                <select value={mode} onChange={(event) => setMode(event.target.value)} className={inputClass}>
                  {paymentModes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-sm font-semibold">Receipt granularity</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "monthly", label: "Monthly receipts" },
                    { id: "quarterly", label: "Quarterly receipts" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setGranularity(option.id)}
                      aria-pressed={granularity === option.id}
                      className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                        granularity === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-[var(--muted)] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                Good to know
              </p>
              <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                <li>• Landlord PAN is mandatory if annual rent exceeds ₹1,00,000.</li>
                <li>• A ₹1 revenue stamp is required on cash payments above ₹5,000.</li>
                <li>• Everything is generated in your browser — nothing is uploaded.</li>
              </ul>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm font-semibold">
                  {receipts.list.length
                    ? `${receipts.list.length} receipt${receipts.list.length > 1 ? "s" : ""} · ${receipts.totalMonths} month${receipts.totalMonths > 1 ? "s" : ""} · Total ${formatINR(receipts.totalAmount)}`
                    : "Receipt preview"}
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!receipts.list.length}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save as PDF
                </button>
              </div>
              {receipts.clamped && (
                <p role="alert" className="mt-3 text-xs font-semibold text-[var(--anslation-ds-danger)]">
                  Long range selected — showing the first {MAX_MONTHS} months. Split larger periods into batches.
                </p>
              )}
              {receipts.error ? (
                <p role="alert" className="mt-4 rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">{receipts.error}</p>
              ) : (
                <div id="rent-receipt-print-area" className="mt-4 grid gap-4">
                  {receipts.list.map((receipt) => (
                    <section
                      key={receipt.id}
                      className="rent-receipt-sheet rounded-md border border-[var(--border)] bg-[var(--background)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
                        <div>
                          <p className="text-base font-bold uppercase tracking-widest">Rent Receipt</p>
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Receipt No. {receipt.number}</p>
                        </div>
                        <p className="text-sm font-semibold">Date: {receipt.dateLabel}</p>
                      </div>
                      <p className="mt-4 text-sm leading-7">
                        Received from <span className="font-semibold">{tenantLabel}</span> the sum of{" "}
                        <span className="font-semibold">{formatINR(receipt.amount)}</span> (Rupees {receipt.words} Only){" "}
                        {receipt.modePhrase} towards rent of the property at{" "}
                        <span className="font-semibold">{addressLabel}</span> for the period{" "}
                        <span className="font-semibold">{receipt.periodLabel}</span>.
                      </p>
                      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                        <div className="text-sm">
                          <p className="font-semibold">{landlordLabel}</p>
                          {panValid && panValue !== "" && <p className="mt-0.5 text-xs">PAN: {panValue}</p>}
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Landlord</p>
                        </div>
                        <div className="flex items-end gap-4">
                          {receipt.needsStamp && (
                            <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-dashed border-[var(--border)] p-1 text-center text-[10px] leading-tight text-[var(--muted-foreground)]">
                              Revenue stamp
                            </div>
                          )}
                          <div className="w-44 border-t border-[var(--border)] pt-1 text-center text-xs text-[var(--muted-foreground)]">
                            Signature of landlord
                          </div>
                        </div>
                      </div>
                      {receipt.needsStamp && (
                        <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
                          Affix revenue stamp (required for cash payments above ₹5,000).
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
