"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw } from "lucide-react";

import { CRITERIA_SETS, classifyUdyam, toCroreLakh } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  investment: "8000000",
  totalTurnover: "60000000",
  exportTurnover: "0",
  criteriaSet: "2025",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const AMOUNT_FIELDS = [
  {
    key: "investment",
    id: "udyam-investment",
    label: "Investment in plant, machinery and equipment (INR)",
    hint: "Written-down value as per your income-tax return. Exclude land, building, furniture and fittings.",
  },
  {
    key: "totalTurnover",
    id: "udyam-turnover",
    label: "Total turnover for the year (INR)",
    hint: "Turnover as reported in your GST returns and income-tax return.",
  },
  {
    key: "exportTurnover",
    id: "udyam-export",
    label: "Of which export turnover (INR)",
    hint: "Exports of goods and services are excluded from turnover when classifying the enterprise.",
  },
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => {
    const investment = toNumber(form.investment);
    const totalTurnover = toNumber(form.totalTurnover);
    const exportTurnover = toNumber(form.exportTurnover);
    if ([investment, totalTurnover, exportTurnover].some(Number.isNaN)) {
      return { error: "Enter investment, turnover and export turnover as numbers." };
    }
    return classifyUdyam({
      investment,
      totalTurnover,
      exportTurnover,
      criteriaSet: form.criteriaSet,
    });
  }, [form]);

  const hasError = Boolean(result.error);
  const activeTiers = CRITERIA_SETS[form.criteriaSet]?.tiers ?? CRITERIA_SETS["2025"].tiers;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Udyam Registration Category",
      `Limit set: ${result.criteriaSetLabel}`,
      `Investment in plant and machinery: ${money(result.investment)}`,
      `Turnover used for classification: ${money(result.classificationTurnover)}`,
      `Export turnover excluded: ${money(result.exportTurnoverExcluded)}`,
      `Category: ${result.category}${result.isMsme ? " enterprise" : " — not an MSME"}`,
      `Deciding test: ${result.bindingCriterion}`,
      result.isMsme
        ? `Room left in this category: ${money(result.headroomInvestment)} of investment, ${money(result.headroomTurnover)} of turnover`
        : "Above the medium-enterprise limits, so Udyam registration is not available",
    ].join("\n");
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          MSME India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Udyam Registration Category Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          MSME classification is a composite test — your enterprise must stay within both the
          investment limit and the turnover limit of a category. Breach either one and you move up a
          category.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {AMOUNT_FIELDS.map((field) => (
            <div key={field.key} className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="100000"
                value={form[field.key]}
                onChange={setField(field.key)}
              />
              <p className={HINT_CLASS}>{field.hint}</p>
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="udyam-criteria">
              Which notified limits apply
            </label>
            <select
              id="udyam-criteria"
              className={INPUT_CLASS}
              value={form.criteriaSet}
              onChange={setField("criteriaSet")}
            >
              {Object.entries(CRITERIA_SETS).map(([key, set]) => (
                <option key={key} value={key}>
                  {set.label}
                </option>
              ))}
            </select>
          </div>
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
              Your MSME category
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError || result.isMsme ? "text-[var(--primary)]" : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : result.category}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see a classification."
                : result.isMsme
                  ? `Eligible for Udyam registration as a ${result.category.toLowerCase()} enterprise.`
                  : "Above the medium-enterprise limits — this is a large enterprise and cannot register on Udyam."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Udyam category result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Investment counted", hasError ? DASH : money(result.investment)],
            [
              "Export turnover excluded",
              hasError ? DASH : money(result.exportTurnoverExcluded),
            ],
            [
              "Turnover used for classification",
              hasError ? DASH : money(result.classificationTurnover),
            ],
            ["Deciding test", hasError ? DASH : result.bindingCriterion],
            [
              "Investment limit for this category",
              hasError || result.investmentLimit == null ? DASH : money(result.investmentLimit),
            ],
            [
              "Turnover limit for this category",
              hasError || result.turnoverLimit == null ? DASH : money(result.turnoverLimit),
            ],
            [
              "Investment limit used",
              hasError || !result.isMsme ? DASH : pct(result.investmentUtilisationPct),
            ],
            [
              "Turnover limit used",
              hasError || !result.isMsme ? DASH : pct(result.turnoverUtilisationPct),
            ],
            [
              "Investment headroom before moving up",
              hasError || !result.isMsme ? DASH : money(result.headroomInvestment),
            ],
            [
              "Turnover headroom before moving up",
              hasError || !result.isMsme ? DASH : money(result.headroomTurnover),
            ],
            ["Next category if you grow", hasError ? DASH : result.nextCategory ?? DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {CRITERIA_SETS[form.criteriaSet]?.label ?? "Notified limits"}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Category
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Investment up to
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Turnover up to
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTiers.map((tier) => (
                <tr
                  key={tier.category}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    !hasError && result.category === tier.category
                      ? "font-semibold text-[var(--primary)]"
                      : ""
                  }`}
                >
                  <td className="py-2 pr-3">{tier.category}</td>
                  <td className="py-2 pr-3 text-right">{toCroreLakh(tier.investmentLimit)}</td>
                  <td className="py-2 text-right">{toCroreLakh(tier.turnoverLimit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The manufacturing and service distinction was removed in 2020, so one table covers both. An
          enterprise that crosses a limit is reclassified upward from{" "}
          {result.upwardChangeEffectiveFrom ?? "1 April of the next financial year"}, and one that
          falls below keeps its benefits until the end of the current financial year.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Udyam registration itself pulls investment and turnover straight from your
        PAN-linked income-tax and GST records, so the portal's own figures decide your category.
        Confirm with your chartered accountant before relying on this for a tender or subsidy claim.
      </p>
    </main>
  );
}
