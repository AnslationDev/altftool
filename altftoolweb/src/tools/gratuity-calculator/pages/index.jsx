"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Copy,
  Minus,
  Plus,
  RotateCcw,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const TAX_FREE_CAP = 2000000;

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function Stepper({ label, value, onChange, min, max, unit }) {
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={`stepper-${unit}`}>
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1, min, max))}
          aria-label={`Decrease ${label}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={`stepper-${unit}`}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(clamp(Math.floor(Number(event.target.value) || 0), min, max))}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1, min, max))}
          aria-label={`Increase ${label}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:border-[var(--primary)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [salary, setSalary] = useState(50000);
  const [serviceYears, setServiceYears] = useState(12);
  const [serviceMonths, setServiceMonths] = useState(8);
  const [covered, setCovered] = useState(true);
  const [copied, setCopied] = useState(false);

  const safeSalary = Math.max(Number(salary) || 0, 0);
  const totalMonths = serviceYears * 12 + serviceMonths;
  const eligible = totalMonths >= 60;

  const result = useMemo(() => {
    const roundedUp = serviceMonths >= 6;
    const qualifyingYears = roundedUp ? serviceYears + 1 : serviceYears;
    const coveredAmount = (15 * safeSalary * qualifyingYears) / 26;
    const notCoveredAmount = (15 * safeSalary * serviceYears) / 30;
    const amount = covered ? coveredAmount : notCoveredAmount;
    return {
      roundedUp,
      qualifyingYears,
      coveredAmount,
      notCoveredAmount,
      amount,
      exempt: Math.min(amount, TAX_FREE_CAP),
      taxable: Math.max(amount - TAX_FREE_CAP, 0),
    };
  }, [covered, safeSalary, serviceMonths, serviceYears]);

  const serviceLabel = `${serviceYears} year${serviceYears === 1 ? "" : "s"} ${serviceMonths} month${serviceMonths === 1 ? "" : "s"}`;

  const roundingNote = covered
    ? result.roundedUp
      ? `${serviceLabel} → counted as ${result.qualifyingYears} years, because ${serviceMonths} months ≥ 6 rounds up to the next full year.`
      : `${serviceLabel} → counted as ${result.qualifyingYears} years, because ${serviceMonths} months < 6 does not round up.`
    : `${serviceLabel} → counted as ${serviceYears} completed years. Outside the Act, extra months never round up.`;

  const formulaLine = covered
    ? `Formula applied: (15 × ${formatINR(safeSalary)} × ${result.qualifyingYears}) ÷ 26`
    : `Formula applied: (15 × ${formatINR(safeSalary)} × ${serviceYears}) ÷ 30`;

  const summary = useMemo(
    () =>
      [
        "Gratuity Calculator Summary",
        `Last drawn basic + DA: ${formatINR(safeSalary)} per month`,
        `Service: ${serviceLabel}`,
        `Covered under Payment of Gratuity Act: ${covered ? "Yes" : "No"}`,
        eligible ? formulaLine : "Not yet eligible: gratuity needs 5 continuous years of service (except death/disablement).",
        eligible ? roundingNote : `Service so far: ${totalMonths} of 60 months.`,
        eligible ? `Gratuity amount: ${formatINR(result.amount)}` : "",
        eligible ? `Tax-free portion: ${formatINR(result.exempt)} (₹20,00,000 lifetime cap)` : "",
        eligible && result.taxable > 0 ? `Taxable portion: ${formatINR(result.taxable)}` : "",
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [covered, eligible, formulaLine, result, roundingNote, safeSalary, serviceLabel, totalMonths]
  );

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BriefcaseBusiness className="h-4 w-4" />
            Retirement benefit
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Gratuity Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out the gratuity your employer owes you when you leave, with the exact Payment of
            Gratuity Act formula, the 6-month rounding rule, and the ₹20 lakh tax-free limit.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold">Monthly basic + DA, last drawn (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={salary}
                  onChange={(event) => setSalary(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Only basic salary + dearness allowance count, not your full CTC.
                </span>
              </label>

              <Stepper
                label="Years of service"
                value={serviceYears}
                onChange={setServiceYears}
                min={0}
                max={60}
                unit="years"
              />
              <Stepper
                label="Extra months"
                value={serviceMonths}
                onChange={setServiceMonths}
                min={0}
                max={11}
                unit="months"
              />

              <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <span className="text-sm font-semibold" id="covered-label">
                  Covered under Payment of Gratuity Act, 1972
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={covered}
                  aria-labelledby="covered-label"
                  onClick={() => setCovered((prev) => !prev)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    covered ? "bg-[var(--primary)]" : "bg-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition-all ${
                      covered ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
              <p className="-mt-3 text-xs text-[var(--muted-foreground)]">
                The Act covers establishments with 10 or more employees — most companies qualify.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSalary(50000);
                  setServiceYears(12);
                  setServiceMonths(8);
                  setCovered(true);
                }}
                className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Gratuity for {serviceLabel} of service
              </p>
              <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              {eligible ? (
                <>
                  <div className="inline-block rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(result.amount)}</p>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">{formulaLine}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Rounding rule: {roundingNote}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                      <Scale className="h-4 w-4 text-[var(--primary)]" />
                      Act formula: {formatINR(result.coveredAmount)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                      <Scale className="h-4 w-4 text-[var(--primary)]" />
                      Non-Act formula: {formatINR(result.notCoveredAmount)}
                    </span>
                  </div>

                  <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[var(--anslation-ds-success)]" />
                      <h3 className="font-semibold">Tax on this gratuity</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      For private-sector employees covered by the Act, gratuity is tax-exempt up to
                      ₹20,00,000 — a lifetime limit across all employers.
                    </p>
                    <div className="tool-compact-grid mt-3">
                      <div className="rounded-md bg-[var(--muted)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Tax-free portion</p>
                        <p className="mt-1 font-semibold text-[var(--anslation-ds-success)]">{formatINR(result.exempt)}</p>
                      </div>
                      <div className="rounded-md bg-[var(--muted)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Taxable portion</p>
                        <p
                          className="mt-1 font-semibold"
                          style={{ color: result.taxable > 0 ? "var(--anslation-ds-danger)" : "var(--anslation-ds-success)" }}
                        >
                          {result.taxable > 0 ? formatINR(result.taxable) : "Nil"}
                        </p>
                      </div>
                    </div>
                    {!covered && (
                      <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                        Not covered by the Act? The exemption is the least of ₹20,00,000, the actual
                        gratuity received, and half a month&apos;s average salary per completed year.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-5">
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="h-5 w-5 text-[var(--anslation-ds-danger)]" />
                    <h3 className="font-semibold">Not eligible yet</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Gratuity becomes payable only after 5 continuous years of service with the same
                    employer (the exception: death or disablement, where the 5-year rule is waived).
                    You have {serviceLabel} — {Math.max(60 - totalMonths, 0)} more month
                    {Math.max(60 - totalMonths, 0) === 1 ? "" : "s"} to go.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Once you cross 5 years, this calculator will show your payout instantly — the
                    formula would be {covered ? "(15 × salary × years) ÷ 26" : "(15 × salary × years) ÷ 30"}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h3 className="font-semibold">Covered by the Act</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Gratuity = (15 × last drawn basic + DA × qualifying years) ÷ 26. A month is treated as 26
              working days, and any service beyond 6 months in the final year rounds up to a full year.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h3 className="font-semibold">Not covered by the Act</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Gratuity = (15 × last drawn basic + DA × completed years) ÷ 30. A month is treated as 30
              days, and only fully completed years count — extra months are ignored entirely.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
