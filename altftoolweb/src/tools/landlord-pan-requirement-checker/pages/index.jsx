"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, RotateCcw } from "lucide-react";

import {
  LANDLORD_PAN_ANNUAL_THRESHOLD,
  RENT_RECEIPT_MONTHLY_LIMIT,
  SECTION_194IB_MONTHLY_THRESHOLD,
  SECTION_194IB_RATE_PERCENT,
  SECTION_194IB_RATE_PERCENT_LEGACY,
  checkLandlordPanRequirement,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = {
  monthlyRent: "22000",
  months: "12",
  sharePercent: "100",
  landlordHasPan: true,
  landlordIsNonResident: false,
  rateChoice: "current",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [sharePercent, setSharePercent] = useState(DEFAULTS.sharePercent);
  const [landlordHasPan, setLandlordHasPan] = useState(DEFAULTS.landlordHasPan);
  const [landlordIsNonResident, setLandlordIsNonResident] = useState(
    DEFAULTS.landlordIsNonResident,
  );
  const [rateChoice, setRateChoice] = useState(DEFAULTS.rateChoice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkLandlordPanRequirement({
        monthlyRent: toNumber(monthlyRent),
        months: toNumber(months),
        sharePercent: toNumber(sharePercent),
        landlordHasPan,
        landlordIsNonResident,
        tdsRatePercent:
          rateChoice === "legacy"
            ? SECTION_194IB_RATE_PERCENT_LEGACY
            : SECTION_194IB_RATE_PERCENT,
      }),
    [monthlyRent, months, sharePercent, landlordHasPan, landlordIsNonResident, rateChoice],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Landlord PAN Requirement Checker",
      `Your share of rent: ${money(result.monthlyShare)} per month for ${result.monthsPaid} month(s)`,
      `Annual rent paid by you: ${money(result.annualRent)}`,
      `Verdict: ${result.headline}`,
      `Rent receipts needed: ${result.rentReceiptsRequired ? "Yes" : "Not mandatory"}`,
      `Landlord PAN needed: ${result.landlordPanRequired ? "Yes" : "Not mandatory"}`,
    ];
    if (result.tds) {
      lines.push(
        `Rent TDS: section ${result.tds.section} at ${num(result.tds.ratePercent)}% = ${money(result.tds.amount)}${result.tds.cappedByLastMonthRent ? " (capped at last month's rent)" : ""}`,
      );
    } else {
      lines.push("Rent TDS: none due from you");
    }
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMonthlyRent(DEFAULTS.monthlyRent);
    setMonths(DEFAULTS.months);
    setSharePercent(DEFAULTS.sharePercent);
    setLandlordHasPan(DEFAULTS.landlordHasPan);
    setLandlordIsNonResident(DEFAULTS.landlordIsNonResident);
    setRateChoice(DEFAULTS.rateChoice);
    setCopied(false);
  };

  const breakdown = hasError
    ? [
        ["Your share of the rent per month", DASH],
        ["Annual rent paid by you", DASH],
        [`Distance from the ${money(LANDLORD_PAN_ANNUAL_THRESHOLD)} PAN threshold`, DASH],
        ["Monthly rent that hits the PAN threshold", DASH],
        ["Rent TDS payable by you", DASH],
      ]
    : [
        ["Your share of the rent per month", money(result.monthlyShare)],
        ["Annual rent paid by you", money(result.annualRent)],
        [
          `Distance from the ${money(LANDLORD_PAN_ANNUAL_THRESHOLD)} PAN threshold`,
          result.headroomToPanThreshold >= 0
            ? `${money(result.headroomToPanThreshold)} of headroom left`
            : `${money(Math.abs(result.headroomToPanThreshold))} over the limit`,
        ],
        [
          "Monthly rent that hits the PAN threshold",
          `${money(result.monthlyRentAtPanThreshold)} over ${result.monthsPaid} month(s)`,
        ],
        [
          "Rent TDS payable by you",
          result.tds
            ? `${money(result.tds.amount)} (section ${result.tds.section} at ${num(result.tds.ratePercent)}%)`
            : "Nil",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          Rent and HRA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Landlord PAN Requirement Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you pay and see whether your HRA claim needs the landlord&rsquo;s PAN, whether
          receipts are mandatory, and whether you must deduct rent TDS yourself.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lpr-rent">
              Total monthly rent for the house (INR)
            </label>
            <input
              id="lpr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpr-months">
              Months of rent paid this financial year
            </label>
            <input
              id="lpr-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpr-share">
              Your share of the rent (%)
            </label>
            <input
              id="lpr-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={sharePercent}
              onChange={(event) => setSharePercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Sharing with flatmates? Enter only the slice you pay from your own account.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpr-rate">
              Section 194-IB rate to apply
            </label>
            <select
              id="lpr-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateChoice}
              onChange={(event) => setRateChoice(event.target.value)}
            >
              <option value="current">
                {SECTION_194IB_RATE_PERCENT}% — on or after 1 October 2024
              </option>
              <option value="legacy">
                {SECTION_194IB_RATE_PERCENT_LEGACY}% — up to 30 September 2024
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
            htmlFor="lpr-haspan"
          >
            <input
              id="lpr-haspan"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={landlordHasPan}
              onChange={(event) => setLandlordHasPan(event.target.checked)}
            />
            Landlord has given you a PAN
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
            htmlFor="lpr-nri"
          >
            <input
              id="lpr-nri"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={landlordIsNonResident}
              onChange={(event) => setLandlordIsNonResident(event.target.checked)}
            />
            Landlord is a non-resident (NRI)
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Annual rent paid by you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.annualRent)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.landlordPanRequired
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? DASH : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the landlord PAN requirement result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What you have to produce</h2>
          <ul className="mt-3 space-y-3">
            {result.requirements.map((item) => (
              <li key={item.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.required
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--success-soft)] text-[var(--success)]"
                    }`}
                  >
                    {item.required ? "Required" : "Not mandatory"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.tds && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Rent TDS detail</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--muted-foreground)]">
                    Section
                  </th>
                  <td className="py-2 text-right font-semibold">{result.tds.section}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--muted-foreground)]">
                    Rate applied
                  </th>
                  <td className="py-2 text-right font-semibold">{num(result.tds.ratePercent)}%</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--muted-foreground)]">
                    Tax to deduct
                  </th>
                  <td className="py-2 text-right font-semibold">{money(result.tds.amount)}</td>
                </tr>
                {result.tds.cappedByLastMonthRent && (
                  <tr className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2 pr-3 font-medium text-[var(--muted-foreground)]">
                      Before the last-month cap
                    </th>
                    <td className="py-2 text-right font-semibold">
                      {money(result.tds.uncappedAmount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--muted-foreground)]">
                    Compliance
                  </th>
                  <td className="py-2 text-right">{result.tds.timing}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Thresholds used: rent receipts above{" "}
        {money(RENT_RECEIPT_MONTHLY_LIMIT)} a month, landlord PAN above{" "}
        {money(LANDLORD_PAN_ANNUAL_THRESHOLD)} of annual rent, and section 194-IB above{" "}
        {money(SECTION_194IB_MONTHLY_THRESHOLD)} a month. Employers may ask for more, and surcharge
        can raise NRI rent TDS — check with a chartered accountant for your own case.
      </p>
    </main>
  );
}
