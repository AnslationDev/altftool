"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldOff } from "lucide-react";

import {
  CANCELLATION_REASONS,
  FREE_LOOK_DAYS,
  POLICY_KINDS,
  REFUND_WITHIN_DAYS,
  buildFreeLookRequest,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  receiptDate: "2026-06-01",
  riskStartDate: "2026-05-28",
  requestDate: "2026-06-10",
  premiumPaid: 50000,
  annualRiskPremium: 6000,
  medicalExpenses: 1500,
  stampDuty: 300,
  fundValue: 45000,
  chargesRecovered: 2000,
  policyTermYears: 20,
  kindId: "non-linked",
  reasonId: "mis-sold",
  policyholderName: "Anita Sharma",
  policyNumber: "LP-2026-884512",
  insurerName: "HDFC Life Insurance Company Limited",
  bankAccount: "50100234567890",
  ifsc: "HDFC0000123",
};

export default function ToolHome() {
  const [receiptDate, setReceiptDate] = useState(DEFAULTS.receiptDate);
  const [riskStartDate, setRiskStartDate] = useState(DEFAULTS.riskStartDate);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [premiumPaid, setPremiumPaid] = useState(String(DEFAULTS.premiumPaid));
  const [annualRiskPremium, setAnnualRiskPremium] = useState(String(DEFAULTS.annualRiskPremium));
  const [medicalExpenses, setMedicalExpenses] = useState(String(DEFAULTS.medicalExpenses));
  const [stampDuty, setStampDuty] = useState(String(DEFAULTS.stampDuty));
  const [fundValue, setFundValue] = useState(String(DEFAULTS.fundValue));
  const [chargesRecovered, setChargesRecovered] = useState(String(DEFAULTS.chargesRecovered));
  const [policyTermYears, setPolicyTermYears] = useState(String(DEFAULTS.policyTermYears));
  const [kindId, setKindId] = useState(DEFAULTS.kindId);
  const [reasonId, setReasonId] = useState(DEFAULTS.reasonId);
  const [policyholderName, setPolicyholderName] = useState(DEFAULTS.policyholderName);
  const [policyNumber, setPolicyNumber] = useState(DEFAULTS.policyNumber);
  const [insurerName, setInsurerName] = useState(DEFAULTS.insurerName);
  const [bankAccount, setBankAccount] = useState(DEFAULTS.bankAccount);
  const [ifsc, setIfsc] = useState(DEFAULTS.ifsc);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildFreeLookRequest({
        receiptDate,
        riskStartDate,
        requestDate,
        premiumPaid: Number(premiumPaid),
        annualRiskPremium: Number(annualRiskPremium),
        medicalExpenses: Number(medicalExpenses),
        stampDuty: Number(stampDuty),
        fundValue: Number(fundValue),
        chargesRecovered: Number(chargesRecovered),
        policyTermYears: Number(policyTermYears),
        kindId,
        reasonId,
        policyholderName,
        policyNumber,
        insurerName,
        bankAccount,
        ifsc,
      }),
    [
      receiptDate,
      riskStartDate,
      requestDate,
      premiumPaid,
      annualRiskPremium,
      medicalExpenses,
      stampDuty,
      fundValue,
      chargesRecovered,
      policyTermYears,
      kindId,
      reasonId,
      policyholderName,
      policyNumber,
      insurerName,
      bankAccount,
      ifsc,
    ],
  );

  const hasError = Boolean(result.error);
  const kind = POLICY_KINDS.find((k) => k.id === kindId);
  const isLinked = Boolean(kind?.linked);

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setReceiptDate(DEFAULTS.receiptDate);
    setRiskStartDate(DEFAULTS.riskStartDate);
    setRequestDate(DEFAULTS.requestDate);
    setPremiumPaid(String(DEFAULTS.premiumPaid));
    setAnnualRiskPremium(String(DEFAULTS.annualRiskPremium));
    setMedicalExpenses(String(DEFAULTS.medicalExpenses));
    setStampDuty(String(DEFAULTS.stampDuty));
    setFundValue(String(DEFAULTS.fundValue));
    setChargesRecovered(String(DEFAULTS.chargesRecovered));
    setPolicyTermYears(String(DEFAULTS.policyTermYears));
    setKindId(DEFAULTS.kindId);
    setReasonId(DEFAULTS.reasonId);
    setPolicyholderName(DEFAULTS.policyholderName);
    setPolicyNumber(DEFAULTS.policyNumber);
    setInsurerName(DEFAULTS.insurerName);
    setBankAccount(DEFAULTS.bankAccount);
    setIfsc(DEFAULTS.ifsc);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldOff className="h-4 w-4" aria-hidden="true" />
          Insurance letters
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Free Look Cancellation Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts the {FREE_LOOK_DAYS}-day free look window from the day the policy document reached
          you, estimates the refund after the deductions the regulations allow, and drafts the
          cancellation request to send to the insurer.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-receipt">
              Policy document received on
            </label>
            <input
              id="fl-receipt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={receiptDate}
              onChange={(event) => setReceiptDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-risk">
              Risk commencement date
            </label>
            <input
              id="fl-risk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={riskStartDate}
              onChange={(event) => setRiskStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-request">
              Date of the cancellation request
            </label>
            <input
              id="fl-request"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-kind">
              Kind of policy
            </label>
            <select
              id="fl-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kindId}
              onChange={(event) => setKindId(event.target.value)}
            >
              {POLICY_KINDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{kind?.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-premium">
              Premium paid (₹)
            </label>
            <input
              id="fl-premium"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              step="100"
              inputMode="numeric"
              value={premiumPaid}
              onChange={(event) => setPremiumPaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-riskprem">
              Annual risk / mortality premium (₹)
            </label>
            <input
              id="fl-riskprem"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="100"
              inputMode="numeric"
              value={annualRiskPremium}
              onChange={(event) => setAnnualRiskPremium(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-medical">
              Medical examination expense (₹)
            </label>
            <input
              id="fl-medical"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="100"
              inputMode="numeric"
              value={medicalExpenses}
              onChange={(event) => setMedicalExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-stamp">
              Stamp duty charged (₹)
            </label>
            <input
              id="fl-stamp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              value={stampDuty}
              onChange={(event) => setStampDuty(event.target.value)}
            />
          </div>
          {isLinked ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fl-fund">
                  Fund value on cancellation date (₹)
                </label>
                <input
                  id="fl-fund"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="100"
                  inputMode="numeric"
                  value={fundValue}
                  onChange={(event) => setFundValue(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fl-charges">
                  Unallocated premium and charges recovered (₹)
                </label>
                <input
                  id="fl-charges"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="100"
                  inputMode="numeric"
                  value={chargesRecovered}
                  onChange={(event) => setChargesRecovered(event.target.value)}
                />
              </div>
            </>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-term">
              Policy term (years)
            </label>
            <input
              id="fl-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="100"
              step="1"
              inputMode="numeric"
              value={policyTermYears}
              onChange={(event) => setPolicyTermYears(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fl-reason">
              Reason for returning the policy
            </label>
            <select
              id="fl-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reasonId}
              onChange={(event) => setReasonId(event.target.value)}
            >
              {CANCELLATION_REASONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-name">
              Policyholder&rsquo;s name
            </label>
            <input
              id="fl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={policyholderName}
              onChange={(event) => setPolicyholderName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-policy">
              Policy number
            </label>
            <input
              id="fl-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={policyNumber}
              onChange={(event) => setPolicyNumber(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fl-insurer">
              Insurer
            </label>
            <input
              id="fl-insurer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={insurerName}
              onChange={(event) => setInsurerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-account">
              Refund to account number
            </label>
            <input
              id="fl-account"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={bankAccount}
              onChange={(event) => setBankAccount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-ifsc">
              IFSC
            </label>
            <input
              id="fl-ifsc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ifsc}
              onChange={(event) => setIfsc(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated refund
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : inr.format(result.refund)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${num.format(result.refundShare)}% of the ${inr.format(result.premiumPaid)} premium paid`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the free look cancellation letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Free look window closes",
              hasError ? DASH : result.deadlineLong,
            ],
            [
              "Days left in the window",
              hasError
                ? DASH
                : result.withinWindow
                  ? `${result.daysRemaining} (this is day ${result.daysUsed} of ${FREE_LOOK_DAYS})`
                  : `Closed — request is on day ${result.daysUsed}`,
            ],
            ["Days on cover counted", hasError ? DASH : `${result.daysOnCover}`],
            [
              "Proportionate risk premium deducted",
              hasError ? DASH : inr.format(result.proportionateRisk),
            ],
            ["Medical examination expense", hasError ? DASH : inr.format(result.medical)],
            ["Stamp duty", hasError ? DASH : inr.format(result.stampDuty)],
            ["Total deductions", hasError ? DASH : inr.format(result.deductions)],
            [
              result.linked ? "Fund value plus charges recovered" : "Amount before deductions",
              hasError ? DASH : inr.format(result.grossBase),
            ],
            [
              `Refund due by (${REFUND_WITHIN_DAYS} days)`,
              hasError ? DASH : result.refundDueByLong,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
            Letter to the insurer
          </p>
          <p className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.letter}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not insurance or legal advice. The exact deductions are governed by your
        policy contract and the insurer&rsquo;s schedule of charges; send the request in writing to
        an address the insurer accepts and keep the acknowledgement.
      </p>
    </main>
  );
}
