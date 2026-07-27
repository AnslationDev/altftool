"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import { EXCLUSION_CRITERIA, checkPmKisanEligibility } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  ownsCultivableLand: true,
  landHectares: "1.2",
  landRecordInName: true,
  institutionalLandholder: false,
  constitutionalPost: false,
  politicalOffice: false,
  governmentEmployee: false,
  groupDEmployee: false,
  isPensioner: false,
  monthlyPension: "0",
  paidIncomeTaxLastYear: false,
  practisingProfessional: false,
  aadhaarSeeded: true,
  eKycDone: true,
  bankAccountDbtEnabled: true,
};

const STATUS_STYLES = {
  eligible: "bg-[var(--success-soft)] text-[var(--success)]",
  "eligible-action-needed": "bg-[var(--warning-soft)] text-[var(--warning)]",
  "not-eligible": "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
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

function Toggle({ id, label, hint, checked, onChange }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <label className="flex min-h-11 items-start gap-3 text-sm font-medium text-[var(--foreground)]" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{label}</span>
      </label>
      {hint && <p className="mt-1 pl-8 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export default function ToolHome() {
  const [ownsCultivableLand, setOwnsCultivableLand] = useState(DEFAULTS.ownsCultivableLand);
  const [landHectares, setLandHectares] = useState(DEFAULTS.landHectares);
  const [landRecordInName, setLandRecordInName] = useState(DEFAULTS.landRecordInName);
  const [institutionalLandholder, setInstitutionalLandholder] = useState(DEFAULTS.institutionalLandholder);
  const [constitutionalPost, setConstitutionalPost] = useState(DEFAULTS.constitutionalPost);
  const [politicalOffice, setPoliticalOffice] = useState(DEFAULTS.politicalOffice);
  const [governmentEmployee, setGovernmentEmployee] = useState(DEFAULTS.governmentEmployee);
  const [groupDEmployee, setGroupDEmployee] = useState(DEFAULTS.groupDEmployee);
  const [isPensioner, setIsPensioner] = useState(DEFAULTS.isPensioner);
  const [monthlyPension, setMonthlyPension] = useState(DEFAULTS.monthlyPension);
  const [paidIncomeTaxLastYear, setPaidIncomeTaxLastYear] = useState(DEFAULTS.paidIncomeTaxLastYear);
  const [practisingProfessional, setPractisingProfessional] = useState(DEFAULTS.practisingProfessional);
  const [aadhaarSeeded, setAadhaarSeeded] = useState(DEFAULTS.aadhaarSeeded);
  const [eKycDone, setEKycDone] = useState(DEFAULTS.eKycDone);
  const [bankAccountDbtEnabled, setBankAccountDbtEnabled] = useState(DEFAULTS.bankAccountDbtEnabled);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkPmKisanEligibility({
        ownsCultivableLand,
        landHectares: toNumber(landHectares),
        landRecordInName,
        institutionalLandholder,
        constitutionalPost,
        politicalOffice,
        governmentEmployee,
        groupDEmployee,
        isPensioner,
        monthlyPension: toNumber(monthlyPension),
        paidIncomeTaxLastYear,
        practisingProfessional,
        aadhaarSeeded,
        eKycDone,
        bankAccountDbtEnabled,
      }),
    [
      ownsCultivableLand,
      landHectares,
      landRecordInName,
      institutionalLandholder,
      constitutionalPost,
      politicalOffice,
      governmentEmployee,
      groupDEmployee,
      isPensioner,
      monthlyPension,
      paidIncomeTaxLastYear,
      practisingProfessional,
      aadhaarSeeded,
      eKycDone,
      bankAccountDbtEnabled,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "PM-KISAN eligibility check",
      `Result: ${result.summary}`,
      `Landholding: ${NUM.format(result.landHectares)} hectares`,
      result.eligible
        ? `Benefit: ${money(result.annualBenefit)} a year in ${result.instalmentsPerYear} instalments of ${money(result.instalmentAmount)}`
        : "Benefit: not payable on the answers given",
      result.disqualifiers.length ? `Disqualifiers:\n- ${result.disqualifiers.join("\n- ")}` : "",
      result.pendingActions.length ? `Pending actions:\n- ${result.pendingActions.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setOwnsCultivableLand(DEFAULTS.ownsCultivableLand);
    setLandHectares(DEFAULTS.landHectares);
    setLandRecordInName(DEFAULTS.landRecordInName);
    setInstitutionalLandholder(DEFAULTS.institutionalLandholder);
    setConstitutionalPost(DEFAULTS.constitutionalPost);
    setPoliticalOffice(DEFAULTS.politicalOffice);
    setGovernmentEmployee(DEFAULTS.governmentEmployee);
    setGroupDEmployee(DEFAULTS.groupDEmployee);
    setIsPensioner(DEFAULTS.isPensioner);
    setMonthlyPension(DEFAULTS.monthlyPension);
    setPaidIncomeTaxLastYear(DEFAULTS.paidIncomeTaxLastYear);
    setPractisingProfessional(DEFAULTS.practisingProfessional);
    setAadhaarSeeded(DEFAULTS.aadhaarSeeded);
    setEKycDone(DEFAULTS.eKycDone);
    setBankAccountDbtEnabled(DEFAULTS.bankAccountDbtEnabled);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          PM-KISAN
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PM Kisan Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          PM-KISAN pays a landholding farmer family Rs 6,000 a year in three instalments. The
          two-hectare ceiling was withdrawn in June 2019, so what decides eligibility now is the
          exclusion list. Answer the questions to see where you stand.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Land</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Toggle
            id="pk-owns-land"
            label="The family owns cultivable land"
            hint="Tenant farmers and agricultural labourers are outside the scheme."
            checked={ownsCultivableLand}
            onChange={setOwnsCultivableLand}
          />
          <Toggle
            id="pk-record"
            label="Land records stand in the applicant's name"
            hint="Some states and union territories have a special dispensation."
            checked={landRecordInName}
            onChange={setLandRecordInName}
          />
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-hectares">
              Cultivable landholding (hectares)
            </label>
            <input
              id="pk-hectares"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={landHectares}
              onChange={(event) => setLandHectares(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Recorded for reference only. There has been no upper limit since 1 June 2019.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Exclusion categories</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick anything that applies to any member of the family — husband, wife or minor children.
        </p>
        <div className="mt-3 grid gap-3">
          <Toggle
            id="pk-institutional"
            label="The land is held by an institution, not by a family"
            checked={institutionalLandholder}
            onChange={setInstitutionalLandholder}
          />
          <Toggle
            id="pk-constitutional"
            label="A member holds or has held a constitutional post"
            checked={constitutionalPost}
            onChange={setConstitutionalPost}
          />
          <Toggle
            id="pk-political"
            label="A member is or was a Minister, MP, MLA, MLC, Mayor or district panchayat Chairperson"
            checked={politicalOffice}
            onChange={setPoliticalOffice}
          />
          <Toggle
            id="pk-govt"
            label="A member is a serving or retired government, PSU, autonomous body or local body employee"
            checked={governmentEmployee}
            onChange={setGovernmentEmployee}
          />
          <Toggle
            id="pk-groupd"
            label="That employment is Multi Tasking Staff, Class IV or Group D"
            hint="Group D staff and pensioners are outside the government-employee and pension exclusions."
            checked={groupDEmployee}
            onChange={setGroupDEmployee}
          />
          <Toggle
            id="pk-pensioner"
            label="A member is a superannuated pensioner"
            checked={isPensioner}
            onChange={setIsPensioner}
          />
          {isPensioner && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pk-pension">
                Monthly pension (INR)
              </label>
              <input
                id="pk-pension"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={monthlyPension}
                onChange={(event) => setMonthlyPension(event.target.value)}
              />
              <p className={HINT_CLASS}>Rs 10,000 or more excludes the family, unless Group D.</p>
            </div>
          )}
          <Toggle
            id="pk-tax"
            label="A member paid income tax in the last assessment year"
            checked={paidIncomeTaxLastYear}
            onChange={setPaidIncomeTaxLastYear}
          />
          <Toggle
            id="pk-professional"
            label="A member is a practising registered doctor, engineer, lawyer, chartered accountant or architect"
            checked={practisingProfessional}
            onChange={setPractisingProfessional}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Payment readiness</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Toggle
            id="pk-aadhaar"
            label="Aadhaar is seeded"
            checked={aadhaarSeeded}
            onChange={setAadhaarSeeded}
          />
          <Toggle id="pk-ekyc" label="e-KYC is complete" checked={eKycDone} onChange={setEKycDone} />
          <Toggle
            id="pk-bank"
            label="Bank account is DBT-enabled"
            checked={bankAccountDbtEnabled}
            onChange={setBankAccountDbtEnabled}
          />
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
              Annual benefit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.annualBenefit)}
            </p>
            {hasError ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Fix the input above to see the verdict.
              </p>
            ) : (
              <p
                className={`mt-2 inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${STATUS_STYLES[result.status]}`}
              >
                {result.summary}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the PM-KISAN eligibility result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Instalment amount", hasError ? DASH : money(result.instalmentAmount)],
            ["Instalments a year", hasError ? DASH : String(result.instalmentsPerYear)],
            ["Instalment windows", hasError ? DASH : result.instalmentWindows.join(", ")],
            ["Landholding recorded", hasError ? DASH : `${NUM.format(result.landHectares)} hectares`],
            [
              "Pre-2019 two-hectare ceiling",
              hasError
                ? DASH
                : result.aboveWithdrawnCeiling
                  ? "Holding is above it, which no longer matters"
                  : "Holding is inside it",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.disqualifiers.length > 0 && (
          <div className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3">
            <p className="text-sm font-semibold text-[var(--danger)]">Why the family is excluded</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--danger)]">
              {result.disqualifiers.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasError && result.pendingActions.length > 0 && (
          <div className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-3">
            <p className="text-sm font-semibold text-[var(--warning)]">Before the money can arrive</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--warning)]">
              {result.pendingActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The exclusion list in full</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {EXCLUSION_CRITERIA.map((item) => (
            <div key={item.id} className="py-2.5">
              <dt className="font-semibold">{item.label}</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational check against the published PM-KISAN operational guidelines, not an official
        decision. Registration, verification and payment are handled by your state government and the
        PM-KISAN portal, and the guidelines can be revised. Benefits drawn wrongly are recovered.
      </p>
    </main>
  );
}
