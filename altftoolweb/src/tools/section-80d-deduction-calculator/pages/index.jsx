"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const PREVENTIVE_CAP = 5000;
const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

const DEFAULTS = {
  selfPremium: "22000",
  selfPreventive: "3000",
  selfMedical: "0",
  selfSenior: false,
  parentsIncluded: true,
  parentsPremium: "38000",
  parentsPreventive: "2000",
  parentsMedical: "0",
  parentsSenior: true,
  slab: "30",
};

export default function ToolHome() {
  const [selfPremium, setSelfPremium] = useState(DEFAULTS.selfPremium);
  const [selfPreventive, setSelfPreventive] = useState(DEFAULTS.selfPreventive);
  const [selfMedical, setSelfMedical] = useState(DEFAULTS.selfMedical);
  const [selfSenior, setSelfSenior] = useState(DEFAULTS.selfSenior);
  const [parentsIncluded, setParentsIncluded] = useState(DEFAULTS.parentsIncluded);
  const [parentsPremium, setParentsPremium] = useState(DEFAULTS.parentsPremium);
  const [parentsPreventive, setParentsPreventive] = useState(DEFAULTS.parentsPreventive);
  const [parentsMedical, setParentsMedical] = useState(DEFAULTS.parentsMedical);
  const [parentsSenior, setParentsSenior] = useState(DEFAULTS.parentsSenior);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [copied, setCopied] = useState(false);

  const values = useMemo(
    () => ({
      selfPremium: Number(selfPremium),
      selfPreventive: Number(selfPreventive),
      selfMedical: Number(selfMedical),
      parentsPremium: Number(parentsPremium),
      parentsPreventive: Number(parentsPreventive),
      parentsMedical: Number(parentsMedical),
    }),
    [
      selfPremium,
      selfPreventive,
      selfMedical,
      parentsPremium,
      parentsPreventive,
      parentsMedical,
    ]
  );

  const error = useMemo(() => {
    const list = Object.values(values);
    if (list.some((value) => !Number.isFinite(value))) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (list.some((value) => value < 0)) return "Amounts cannot be negative.";
    if (list.some((value) => value > 10000000)) {
      return "That amount looks too large for a health insurance premium. Enter the yearly amount in rupees.";
    }
    return "";
  }, [values]);

  const result = useMemo(() => {
    if (error) return null;

    const selfLimit = selfSenior ? 50000 : 25000;
    const parentsLimit = parentsSenior ? 50000 : 25000;

    // Preventive health check-up is capped at Rs 5,000 in total, inside the section limits.
    const selfPreventiveClaimed = Math.min(values.selfPreventive, PREVENTIVE_CAP);
    const parentsPreventiveClaimed = parentsIncluded
      ? Math.min(values.parentsPreventive, Math.max(0, PREVENTIVE_CAP - selfPreventiveClaimed))
      : 0;
    const preventiveTotal = selfPreventiveClaimed + parentsPreventiveClaimed;

    // Medical expenditure is allowed only for senior citizens with no health policy.
    const selfMedicalEligible = selfSenior && values.selfPremium === 0 ? values.selfMedical : 0;
    const parentsMedicalEligible =
      parentsIncluded && parentsSenior && values.parentsPremium === 0 ? values.parentsMedical : 0;

    const selfClaim = Math.min(
      selfLimit,
      values.selfPremium + selfMedicalEligible + selfPreventiveClaimed
    );
    const parentsClaim = parentsIncluded
      ? Math.min(
          parentsLimit,
          values.parentsPremium + parentsMedicalEligible + parentsPreventiveClaimed
        )
      : 0;

    const total = selfClaim + parentsClaim;
    const rate = Number(slab) / 100;
    const taxSaved = total * rate * 1.04;

    const spentSelf = values.selfPremium + values.selfMedical + values.selfPreventive;
    const spentParents = parentsIncluded
      ? values.parentsPremium + values.parentsMedical + values.parentsPreventive
      : 0;

    return {
      selfLimit,
      parentsLimit,
      selfClaim,
      parentsClaim,
      total,
      taxSaved,
      preventiveTotal,
      preventiveDropped: Math.max(
        0,
        values.selfPreventive + (parentsIncluded ? values.parentsPreventive : 0) - preventiveTotal
      ),
      selfHeadroom: Math.max(0, selfLimit - selfClaim),
      parentsHeadroom: Math.max(0, parentsLimit - parentsClaim),
      unclaimed: Math.max(0, spentSelf + spentParents - total),
      medicalIgnored:
        (selfSenior && values.selfPremium > 0 && values.selfMedical > 0) ||
        (parentsIncluded && parentsSenior && values.parentsPremium > 0 && values.parentsMedical > 0),
      maxPossible: selfLimit + (parentsIncluded ? parentsLimit : 0),
    };
  }, [error, parentsIncluded, parentsSenior, selfSenior, slab, values]);

  const report = useMemo(() => {
    if (!result) return "";
    return [
      "Section 80D Health Insurance Deduction (FY 2025-26 / AY 2026-27, old regime)",
      `Self, spouse and children — limit ${money(result.selfLimit)}, claimed ${money(result.selfClaim)}`,
      `Parents — limit ${money(result.parentsLimit)}, claimed ${money(result.parentsClaim)}`,
      `Preventive health check-up counted: ${money(result.preventiveTotal)} (cap ${money(PREVENTIVE_CAP)})`,
      `Total Section 80D deduction: ${money(result.total)}`,
      `Maximum possible with these age settings: ${money(result.maxPossible)}`,
      `Estimated tax saved at ${slab}% + 4% cess: ${money(result.taxSaved)}`,
      "Section 80D is available under the old tax regime only. Premiums must not be paid in cash.",
      "Informational estimate only — confirm with the Income Tax Department or a tax professional.",
    ].join("\n");
  }, [result, slab]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSelfPremium(DEFAULTS.selfPremium);
    setSelfPreventive(DEFAULTS.selfPreventive);
    setSelfMedical(DEFAULTS.selfMedical);
    setSelfSenior(DEFAULTS.selfSenior);
    setParentsIncluded(DEFAULTS.parentsIncluded);
    setParentsPremium(DEFAULTS.parentsPremium);
    setParentsPreventive(DEFAULTS.parentsPreventive);
    setParentsMedical(DEFAULTS.parentsMedical);
    setParentsSenior(DEFAULTS.parentsSenior);
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Section 80D Health Insurance Deduction Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Work out the deduction you can claim for health insurance premiums paid for yourself,
            your family and your parents — with the Rs 25,000 / Rs 50,000 limits and the Rs 5,000
            preventive health check-up cap applied correctly.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Self, spouse and dependent children</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="d80-self-premium">
                  Premium paid (Rs)
                </label>
                <input
                  id="d80-self-premium"
                  className={inputClass}
                  inputMode="numeric"
                  value={selfPremium}
                  onChange={(event) => setSelfPremium(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="d80-self-preventive">
                  Preventive health check-up (Rs)
                </label>
                <input
                  id="d80-self-preventive"
                  className={inputClass}
                  inputMode="numeric"
                  value={selfPreventive}
                  onChange={(event) => setSelfPreventive(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="d80-self-medical">
                  Medical expenditure — only if 60+ and uninsured (Rs)
                </label>
                <input
                  id="d80-self-medical"
                  className={inputClass}
                  inputMode="numeric"
                  value={selfMedical}
                  onChange={(event) => setSelfMedical(event.target.value)}
                />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm">
              <input
                id="d80-self-senior"
                type="checkbox"
                checked={selfSenior}
                onChange={(event) => setSelfSenior(event.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span>I or my spouse am a senior citizen (60+) — raises the limit to {money(50000)}</span>
            </label>

            <hr className="my-5 border-[var(--border)]" />

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold">Parents</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  id="d80-parents-included"
                  type="checkbox"
                  checked={parentsIncluded}
                  onChange={(event) => setParentsIncluded(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span>Claiming for parents</span>
              </label>
            </div>

            {parentsIncluded ? (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="d80-parents-premium">
                      Premium paid (Rs)
                    </label>
                    <input
                      id="d80-parents-premium"
                      className={inputClass}
                      inputMode="numeric"
                      value={parentsPremium}
                      onChange={(event) => setParentsPremium(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="d80-parents-preventive">
                      Preventive health check-up (Rs)
                    </label>
                    <input
                      id="d80-parents-preventive"
                      className={inputClass}
                      inputMode="numeric"
                      value={parentsPreventive}
                      onChange={(event) => setParentsPreventive(event.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="d80-parents-medical">
                      Medical expenditure — only if 60+ and uninsured (Rs)
                    </label>
                    <input
                      id="d80-parents-medical"
                      className={inputClass}
                      inputMode="numeric"
                      value={parentsMedical}
                      onChange={(event) => setParentsMedical(event.target.value)}
                    />
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-3 text-sm">
                  <input
                    id="d80-parents-senior"
                    type="checkbox"
                    checked={parentsSenior}
                    onChange={(event) => setParentsSenior(event.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>At least one parent is 60+ — raises the limit to {money(50000)}</span>
                </label>
              </>
            ) : null}

            <div className="mt-5">
              <label className={labelClass} htmlFor="d80-slab">
                Your income tax slab rate
              </label>
              <select
                id="d80-slab"
                className={inputClass}
                value={slab}
                onChange={(event) => setSlab(event.target.value)}
              >
                {SLAB_RATES.map((rate) => (
                  <option key={rate} value={String(rate)}>
                    {rate}%
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                aria-label="Copy Section 80D deduction result to clipboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ring-1 ring-[var(--border)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your Section 80D deduction</h2>
            {result ? (
              <>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">Deduction allowed</p>
                <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                  {money(result.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--success)]">
                  <HeartPulse className="mr-1 inline h-3.5 w-3.5" />
                  Approximate tax saved at {slab}% plus cess: {money(result.taxSaved)}
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row
                    label={`Self, spouse, children (limit ${money(result.selfLimit)})`}
                    value={money(result.selfClaim)}
                  />
                  <Row
                    label={`Parents (limit ${money(result.parentsLimit)})`}
                    value={money(result.parentsClaim)}
                  />
                  <Row
                    label={`Preventive check-up counted (cap ${money(PREVENTIVE_CAP)})`}
                    value={money(result.preventiveTotal)}
                  />
                  <Row label="Unused headroom — self bucket" value={money(result.selfHeadroom)} />
                  <Row
                    label="Unused headroom — parents bucket"
                    value={money(result.parentsHeadroom)}
                  />
                  <Row label="Maximum possible for you" value={money(result.maxPossible)} strong />
                </dl>

                {result.unclaimed > 0 ? (
                  <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    {money(result.unclaimed)} of what you spent falls outside the limits and cannot
                    be claimed
                    {result.preventiveDropped > 0
                      ? `, including ${money(result.preventiveDropped)} of preventive check-up spend above the ${money(PREVENTIVE_CAP)} cap`
                      : ""}
                    .
                  </p>
                ) : null}

                {result.medicalIgnored ? (
                  <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    Medical expenditure was ignored where a health insurance premium was also paid —
                    the expenditure route is only for senior citizens who hold no health policy.
                  </p>
                ) : null}

                <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  Section 80D is available only under the old tax regime. Premiums must be paid by a
                  non-cash mode; the preventive check-up amount may be paid in cash.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see your deduction.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className={strong ? "text-base font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}
