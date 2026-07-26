"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GRATUITY_STATUTORY_CAP = 2000000;
const LEAVE_ENCASHMENT_EXEMPTION_CAP = 2500000;

const DEFAULTS = {
  gross: 90000,
  basic: 45000,
  unpaidDays: 12,
  leaveDays: 18,
  serviceYears: 6,
  serviceMonths: 2,
  bonus: 40000,
  reimbursements: 8000,
  noticeShortfallDays: 0,
  loans: 0,
  otherDeductions: 5000,
  dayBasis: "30",
};

const DAY_BASIS_OPTIONS = [
  { id: "30", label: "30 days per month", value: 30 },
  { id: "26", label: "26 working days per month", value: 26 },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Full and final settlement.
 * Gratuity follows the Payment of Gratuity Act 1972: 15/26 x last drawn Basic+DA
 * x completed years, with a part-year over 6 months rounded up. Eligibility is
 * 5 years of continuous service (4 years + 240 days is widely accepted).
 */
export function computeSettlement({
  gross,
  basic,
  unpaidDays,
  leaveDays,
  serviceYears,
  serviceMonths,
  bonus,
  reimbursements,
  noticeShortfallDays,
  loans,
  otherDeductions,
  daysPerMonth,
}) {
  const perDayGross = daysPerMonth > 0 ? gross / daysPerMonth : 0;
  const perDayBasic = daysPerMonth > 0 ? basic / daysPerMonth : 0;

  const pendingSalary = perDayGross * unpaidDays;
  const leaveEncashment = perDayBasic * leaveDays;

  const totalMonths = serviceYears * 12 + serviceMonths;
  const gratuityEligible = totalMonths >= 56;
  const gratuityYears = serviceYears + (serviceMonths >= 6 ? 1 : 0);
  const rawGratuity = gratuityEligible ? (15 * basic * gratuityYears) / 26 : 0;
  const gratuity = Math.min(rawGratuity, GRATUITY_STATUTORY_CAP);
  const gratuityCapped = rawGratuity > GRATUITY_STATUTORY_CAP;

  const noticeRecovery = perDayBasic * noticeShortfallDays;

  const totalEarnings = pendingSalary + leaveEncashment + gratuity + bonus + reimbursements;
  const totalDeductions = noticeRecovery + loans + otherDeductions;
  const net = totalEarnings - totalDeductions;

  return {
    perDayGross,
    perDayBasic,
    pendingSalary,
    leaveEncashment,
    gratuity,
    rawGratuity,
    gratuityEligible,
    gratuityYears,
    gratuityCapped,
    totalMonths,
    noticeRecovery,
    totalEarnings,
    totalDeductions,
    net,
    bonus,
    reimbursements,
    loans,
    otherDeductions,
  };
}

export default function ToolHome() {
  const [gross, setGross] = useState(String(DEFAULTS.gross));
  const [basic, setBasic] = useState(String(DEFAULTS.basic));
  const [unpaidDays, setUnpaidDays] = useState(String(DEFAULTS.unpaidDays));
  const [leaveDays, setLeaveDays] = useState(String(DEFAULTS.leaveDays));
  const [serviceYears, setServiceYears] = useState(String(DEFAULTS.serviceYears));
  const [serviceMonths, setServiceMonths] = useState(String(DEFAULTS.serviceMonths));
  const [bonus, setBonus] = useState(String(DEFAULTS.bonus));
  const [reimbursements, setReimbursements] = useState(String(DEFAULTS.reimbursements));
  const [noticeShortfallDays, setNoticeShortfallDays] = useState(
    String(DEFAULTS.noticeShortfallDays),
  );
  const [loans, setLoans] = useState(String(DEFAULTS.loans));
  const [otherDeductions, setOtherDeductions] = useState(String(DEFAULTS.otherDeductions));
  const [dayBasis, setDayBasis] = useState(DEFAULTS.dayBasis);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const values = {
      gross: toNumber(gross),
      basic: toNumber(basic),
      unpaidDays: toNumber(unpaidDays),
      leaveDays: toNumber(leaveDays),
      serviceYears: toNumber(serviceYears),
      serviceMonths: toNumber(serviceMonths),
      bonus: toNumber(bonus),
      reimbursements: toNumber(reimbursements),
      noticeShortfallDays: toNumber(noticeShortfallDays),
      loans: toNumber(loans),
      otherDeductions: toNumber(otherDeductions),
    };

    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (values.gross <= 0) return { error: "Monthly gross salary must be greater than zero." };
    if (values.basic <= 0) return { error: "Monthly Basic + DA must be greater than zero." };
    if (values.basic > values.gross) {
      return { error: "Basic + DA cannot be more than the monthly gross salary." };
    }
    if (Object.values(values).some((value) => value < 0)) {
      return { error: "Amounts and days cannot be negative." };
    }
    if (values.unpaidDays > 62) return { error: "Unpaid salary days should be 62 or fewer." };
    if (values.leaveDays > 400) return { error: "Leave encashment days look too high." };
    if (values.serviceMonths > 11) {
      return { error: "Extra months of service should be between 0 and 11." };
    }
    if (values.serviceYears > 60) return { error: "Years of service should be 60 or fewer." };
    if (values.noticeShortfallDays > 365) {
      return { error: "Notice shortfall should be 365 days or fewer." };
    }

    const option = DAY_BASIS_OPTIONS.find((item) => item.id === dayBasis) ?? DAY_BASIS_OPTIONS[0];
    return computeSettlement({ ...values, daysPerMonth: option.value });
  }, [
    gross,
    basic,
    unpaidDays,
    leaveDays,
    serviceYears,
    serviceMonths,
    bonus,
    reimbursements,
    noticeShortfallDays,
    loans,
    otherDeductions,
    dayBasis,
  ]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Full and Final Settlement Calculator",
      `Pending salary: ${money(calc.pendingSalary)}`,
      `Leave encashment: ${money(calc.leaveEncashment)}`,
      calc.gratuityEligible
        ? `Gratuity (${num(calc.gratuityYears)} years): ${money(calc.gratuity)}`
        : "Gratuity: not eligible (under 5 years of service)",
      `Pending bonus / variable: ${money(calc.bonus)}`,
      `Reimbursements: ${money(calc.reimbursements)}`,
      `Total earnings: ${money(calc.totalEarnings)}`,
      `Notice shortfall recovery: ${money(calc.noticeRecovery)}`,
      `Loans / advances: ${money(calc.loans)}`,
      `Other deductions (TDS etc.): ${money(calc.otherDeductions)}`,
      `Total deductions: ${money(calc.totalDeductions)}`,
      `Net F&F payable: ${money(calc.net)}`,
    ].join("\n");
  }, [calc]);

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
    setGross(String(DEFAULTS.gross));
    setBasic(String(DEFAULTS.basic));
    setUnpaidDays(String(DEFAULTS.unpaidDays));
    setLeaveDays(String(DEFAULTS.leaveDays));
    setServiceYears(String(DEFAULTS.serviceYears));
    setServiceMonths(String(DEFAULTS.serviceMonths));
    setBonus(String(DEFAULTS.bonus));
    setReimbursements(String(DEFAULTS.reimbursements));
    setNoticeShortfallDays(String(DEFAULTS.noticeShortfallDays));
    setLoans(String(DEFAULTS.loans));
    setOtherDeductions(String(DEFAULTS.otherDeductions));
    setDayBasis(DEFAULTS.dayBasis);
    setCopied(false);
  };

  const fields = [
    ["fnf-gross", "Monthly gross salary (INR)", gross, setGross, "1000", "0"],
    ["fnf-basic", "Monthly Basic + DA (INR)", basic, setBasic, "1000", "0"],
    ["fnf-unpaid", "Unpaid salary days in final month", unpaidDays, setUnpaidDays, "1", "0"],
    ["fnf-leave", "Leave balance to encash (days)", leaveDays, setLeaveDays, "1", "0"],
    ["fnf-years", "Completed years of service", serviceYears, setServiceYears, "1", "0"],
    ["fnf-months", "Extra months of service (0-11)", serviceMonths, setServiceMonths, "1", "0"],
    ["fnf-bonus", "Pending bonus / variable pay (INR)", bonus, setBonus, "1000", "0"],
    [
      "fnf-reimb",
      "Pending reimbursements (INR)",
      reimbursements,
      setReimbursements,
      "500",
      "0",
    ],
    [
      "fnf-notice",
      "Notice shortfall to recover (days)",
      noticeShortfallDays,
      setNoticeShortfallDays,
      "1",
      "0",
    ],
    ["fnf-loans", "Loans / salary advances outstanding (INR)", loans, setLoans, "1000", "0"],
    [
      "fnf-other",
      "Other deductions — TDS, PF dues, assets (INR)",
      otherDeductions,
      setOtherDeductions,
      "500",
      "0",
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          F&amp;F settlement
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Full and Final Settlement Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up everything your employer still owes you — unpaid salary days, leave encashment,
          statutory gratuity, bonus and reimbursements — then subtract notice shortfall, advances
          and TDS to see the net F&amp;F amount before you sign the settlement sheet.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, step, min]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="fnf-daybasis">
              Per-day salary basis
            </label>
            <select
              id="fnf-daybasis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dayBasis}
              onChange={(event) => setDayBasis(event.target.value)}
            >
              {DAY_BASIS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Net full &amp; final payable
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${
                    calc.net < 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"
                  }`}
                >
                  {money(calc.net)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.totalEarnings)} earnings less {money(calc.totalDeductions)} deductions
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy full and final settlement result"
                  className={GHOST_BTN}
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

            {calc.net < 0 && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                Deductions exceed earnings — you would owe {money(Math.abs(calc.net))} back to the
                employer instead of receiving a settlement.
              </p>
            )}

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Earnings
            </h2>
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  "Pending salary",
                  `${money(calc.pendingSalary)} · ${num(toNumber(unpaidDays))} days @ ${money(calc.perDayGross)}`,
                ],
                [
                  "Leave encashment",
                  `${money(calc.leaveEncashment)} · ${num(toNumber(leaveDays))} days @ ${money(calc.perDayBasic)}`,
                ],
                [
                  "Gratuity",
                  calc.gratuityEligible
                    ? `${money(calc.gratuity)} · 15/26 × Basic × ${num(calc.gratuityYears)} yrs`
                    : "Not eligible — needs 5 years of service",
                ],
                ["Pending bonus / variable pay", money(calc.bonus)],
                ["Reimbursements", money(calc.reimbursements)],
                ["Total earnings", money(calc.totalEarnings)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Deductions
            </h2>
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  "Notice shortfall recovery",
                  `${money(calc.noticeRecovery)} · ${num(toNumber(noticeShortfallDays))} days`,
                ],
                ["Loans / advances", money(calc.loans)],
                ["Other deductions (TDS, assets, PF dues)", money(calc.otherDeductions)],
                ["Total deductions", money(calc.totalDeductions)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Service and tax notes</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>
                Total service entered: {num(Math.floor(calc.totalMonths / 12))} years{" "}
                {num(calc.totalMonths % 12)} months.
                {calc.gratuityEligible
                  ? " Gratuity eligibility met."
                  : " Below the 5-year gratuity threshold (4 years plus 240 days is widely accepted by courts)."}
              </li>
              {calc.gratuityEligible && (
                <li>
                  Statutory gratuity is capped at {money(GRATUITY_STATUTORY_CAP)} under the Payment
                  of Gratuity Act, and the same amount is the lifetime income-tax exemption limit.{" "}
                  {calc.gratuityCapped
                    ? `The uncapped formula gives ${money(calc.rawGratuity)}; anything above the cap is payable only if your employer agrees to it as ex-gratia and is taxable.`
                    : "This payout is within the cap."}
                </li>
              )}
              <li>
                Leave encashment on resignation is exempt for non-government employees up to a
                lifetime limit of {money(LEAVE_ENCASHMENT_EXEMPTION_CAP)}, subject to the conditions
                in section 10(10AA).
              </li>
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Settlement rules vary by contract, state shops-and-establishment
        law and company policy — gratuity, leave rules and TDS on the payout should be confirmed with
        your HR or a tax professional.
      </p>
    </main>
  );
}
