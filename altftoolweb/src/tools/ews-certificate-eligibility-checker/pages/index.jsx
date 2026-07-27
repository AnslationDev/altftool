"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, RotateCcw, X } from "lucide-react";

import {
  EWS_FAMILY_DEFINITION,
  EWS_INCOME_HEADS,
  EWS_INCOME_LIMIT,
  assessEwsEligibility,
  computeFamilyIncome,
  toAcres,
  toSqft,
  toSqyd,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const DASH = "—";

const DEFAULT_INCOMES = {
  salary: "600000",
  agriculture: "120000",
  business: "",
  profession: "",
  other: "30000",
};

const DEFAULTS = {
  reserved: false,
  land: "3",
  landUnit: "acre",
  flat: "900",
  flatUnit: "sqft",
  plotNotified: "0",
  plotNotifiedUnit: "sqyd",
  plotOther: "0",
  plotOtherUnit: "sqyd",
};

const LAND_UNITS = [
  ["acre", "acres"],
  ["hectare", "hectares"],
  ["sqm", "square metres"],
];
const AREA_UNITS = [
  ["sqft", "square feet"],
  ["sqyd", "square yards"],
  ["sqm", "square metres"],
];
const PLOT_UNITS = [
  ["sqyd", "square yards"],
  ["sqft", "square feet"],
  ["sqm", "square metres"],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [incomes, setIncomes] = useState(DEFAULT_INCOMES);
  const [reserved, setReserved] = useState(DEFAULTS.reserved);
  const [land, setLand] = useState(DEFAULTS.land);
  const [landUnit, setLandUnit] = useState(DEFAULTS.landUnit);
  const [flat, setFlat] = useState(DEFAULTS.flat);
  const [flatUnit, setFlatUnit] = useState(DEFAULTS.flatUnit);
  const [plotNotified, setPlotNotified] = useState(DEFAULTS.plotNotified);
  const [plotNotifiedUnit, setPlotNotifiedUnit] = useState(DEFAULTS.plotNotifiedUnit);
  const [plotOther, setPlotOther] = useState(DEFAULTS.plotOther);
  const [plotOtherUnit, setPlotOtherUnit] = useState(DEFAULTS.plotOtherUnit);
  const [copied, setCopied] = useState(false);

  const income = useMemo(() => computeFamilyIncome(incomes), [incomes]);

  const converted = useMemo(() => {
    const acres = toAcres(toNumber(land), landUnit);
    const sqft = toSqft(toNumber(flat), flatUnit);
    const notified = toSqyd(toNumber(plotNotified), plotNotifiedUnit);
    const other = toSqyd(toNumber(plotOther), plotOtherUnit);
    const failure = [acres, sqft, notified, other].find((item) => item.error);
    if (failure) return { error: failure.error };
    return {
      agriLandAcres: acres.acres,
      flatAreaSqft: sqft.sqft,
      plotNotifiedSqyd: notified.sqyd,
      plotOtherSqyd: other.sqyd,
    };
  }, [land, landUnit, flat, flatUnit, plotNotified, plotNotifiedUnit, plotOther, plotOtherUnit]);

  const result = useMemo(() => {
    if (income.error) return { error: income.error };
    if (converted.error) return { error: converted.error };
    return assessEwsEligibility({
      coveredByScStObcReservation: reserved,
      familyAnnualIncome: income.total,
      ...converted,
    });
  }, [income, converted, reserved]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "EWS certificate eligibility check",
      result.eligible
        ? "Result: meets every criterion in the DoPT office memorandum."
        : `Result: ${result.failedCount} criterion/criteria not met.`,
      `Family gross annual income: ${money(income.total)} against a limit of ${money(EWS_INCOME_LIMIT)}`,
      "",
      ...result.checks.map(
        (check) => `${check.passed ? "PASS" : "CHECK"} — ${check.label}: ${check.detail}`,
      ),
    ].join("\n");
  }, [ok, result, income]);

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
    setIncomes(DEFAULT_INCOMES);
    setReserved(DEFAULTS.reserved);
    setLand(DEFAULTS.land);
    setLandUnit(DEFAULTS.landUnit);
    setFlat(DEFAULTS.flat);
    setFlatUnit(DEFAULTS.flatUnit);
    setPlotNotified(DEFAULTS.plotNotified);
    setPlotNotifiedUnit(DEFAULTS.plotNotifiedUnit);
    setPlotOther(DEFAULTS.plotOther);
    setPlotOtherUnit(DEFAULTS.plotOtherUnit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          Certificates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          EWS Certificate Eligibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An EWS certificate needs two things: family income below {money(EWS_INCOME_LIMIT)} a year,
          and none of the four listed property holdings. The asset tests are absolute — crossing any
          one disqualifies the family whatever its income.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Family income, previous financial year</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Count income from all sources for every member of the family as the memorandum defines it.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {EWS_INCOME_HEADS.map((head) => (
            <div key={head.id}>
              <label className={LABEL_CLASS} htmlFor={`ews-income-${head.id}`}>
                {head.label} (INR)
              </label>
              <input
                id={`ews-income-${head.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={incomes[head.id]}
                onChange={(event) =>
                  setIncomes((previous) => ({ ...previous, [head.id]: event.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold">
          Total family income:{" "}
          <span className="text-[var(--primary)]">
            {income.error ? DASH : money(income.total)}
          </span>
        </p>

        <label className={`mt-4 ${CHECKBOX_ROW}`} htmlFor="ews-reserved">
          <input
            id="ews-reserved"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={reserved}
            onChange={(event) => setReserved(event.target.checked)}
          />
          Already covered by SC, ST or OBC reservation
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Property held by the family</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Property in different cities is added together before each test is applied.
        </p>
        <div className="mt-3 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-land">
                Agricultural land
              </label>
              <input
                id="ews-land"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={land}
                onChange={(event) => setLand(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-land-unit">
                Land unit
              </label>
              <select
                id="ews-land-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={landUnit}
                onChange={(event) => setLandUnit(event.target.value)}
              >
                {LAND_UNITS.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-flat">
                Residential flat area
              </label>
              <input
                id="ews-flat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={flat}
                onChange={(event) => setFlat(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-flat-unit">
                Flat unit
              </label>
              <select
                id="ews-flat-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={flatUnit}
                onChange={(event) => setFlatUnit(event.target.value)}
              >
                {AREA_UNITS.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-plot-notified">
                Residential plot in a notified municipality
              </label>
              <input
                id="ews-plot-notified"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={plotNotified}
                onChange={(event) => setPlotNotified(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-plot-notified-unit">
                Plot unit
              </label>
              <select
                id="ews-plot-notified-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={plotNotifiedUnit}
                onChange={(event) => setPlotNotifiedUnit(event.target.value)}
              >
                {PLOT_UNITS.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-plot-other">
                Residential plot elsewhere
              </label>
              <input
                id="ews-plot-other"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={plotOther}
                onChange={(event) => setPlotOther(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ews-plot-other-unit">
                Plot unit
              </label>
              <select
                id="ews-plot-other-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={plotOtherUnit}
                onChange={(event) => setPlotOtherUnit(event.target.value)}
              >
                {PLOT_UNITS.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {result.error ? (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Criteria met
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.checks.length - result.failedCount} of ${result.checks.length}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.eligible
                  ? "Every condition in the memorandum is satisfied on these figures."
                  : `${result.failedCount} condition${result.failedCount === 1 ? "" : "s"} not met — see the list below.`
                : "Fix the inputs above to run the check"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the EWS eligibility result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Family gross annual income", ok ? money(income.total) : DASH],
            ["Room left under the income limit", ok ? money(result.margins.incomeHeadroom) : DASH],
            [
              "Agricultural land counted",
              ok ? `${NUM.format(converted.agriLandAcres)} acres` : DASH,
            ],
            ["Flat area counted", ok ? `${NUM.format(converted.flatAreaSqft)} sq ft` : DASH],
            [
              "Notified-municipality plot counted",
              ok ? `${NUM.format(converted.plotNotifiedSqyd)} sq yards` : DASH,
            ],
            [
              "Other plot counted",
              ok ? `${NUM.format(converted.plotOtherSqyd)} sq yards` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Criterion by criterion</h2>
          <ul className="mt-3 space-y-3">
            {result.checks.map((check) => (
              <li key={check.id} className="flex gap-3 rounded-md border border-[var(--border)] p-3 text-sm">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    check.passed
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  aria-hidden="true"
                >
                  {check.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="block font-semibold">
                    {check.label}
                    <span className="sr-only">{check.passed ? " — met" : " — not met"}</span>
                  </span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{check.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Who counts as family</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {EWS_FAMILY_DEFINITION.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--primary)]">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Siblings and children aged 18 or above are outside this definition, so their income and
          property are not counted.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The certificate is issued by a competent authority in
        your state on the prescribed form, and states differ in the documents and declarations they
        ask for. Confirm the requirements with the issuing authority before you apply.
      </p>
    </main>
  );
}
