"use client";

import { useState } from "react";
import { Banknote, Calculator, RefreshCw, TrendingUp } from "lucide-react";

const SLUG = "lumpsum-calculator";
const PASCAL = "LumpsumCalculator";
const ICON = "Calculator";
const ICON_COLOR = "text-(--primary)";
const NAME = "Lumpsum Investment Calculator";

export default function LumpsumCalculator() {
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--background)">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary)/10">
            <Banknote className="h-8 w-8 text-(--primary)" />
          </div>
          <h1 className="text-3xl font-bold text-(--foreground) md:text-4xl">
            Lumpsum Investment Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-(--muted-foreground)">
            Calculate the future value of your one-time lumpsum investment with compound growth projections and detailed year-by-year breakdown.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="mb-8 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-5">
              <CalculatorContent slug={SLUG} pascal={PASCAL} icon={ICON} iconColor={ICON_COLOR} name={NAME} result={result} setResult={setResult} showDetails={showDetails} setShowDetails={setShowDetails} />
            </div>

            {/* Results */}
            <ResultsPanel
              result={result}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              slug={SLUG}
              name={NAME}
            />
          </div>
        </div>

        {/* FAQ */}
        <FAQSection slug={SLUG} name={NAME} />
      </div>
    </div>
  );
}

function CalculatorContent({ slug, pascal, icon, iconColor, name, result, setResult, showDetails, setShowDetails }) {
  const [form, setForm] = useState(getDefaultForm(slug));
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    const num = value === "" ? "" : Number(value);
    setForm((prev) => ({ ...prev, [field]: num }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const rules = getValidationRules(slug);
    for (const [field, rule] of Object.entries(rules)) {
      const val = form[field];
      if (val === "" || val === null || val === undefined) {
        newErrors[field] = rule.label + " is required";
      } else if (rule.min !== undefined && val < rule.min) {
        newErrors[field] = rule.label + " must be at least " + rule.min;
      } else if (rule.max !== undefined && val > rule.max) {
        newErrors[field] = rule.label + " must be " + rule.max + " or less";
      } else if (rule.integer && !Number.isInteger(val)) {
        newErrors[field] = rule.label + " must be a whole number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    setResult(computeResult(slug, form));
  };

  const reset = () => {
    setForm(getDefaultForm(slug));
    setResult(null);
    setErrors({});
    setShowDetails(false);
  };

  const fields = getFormFields(slug);

  return (
    <>
      {fields.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`lumpsum-${field.key}`}
            className="mb-1.5 block text-sm font-semibold text-(--foreground)"
          >
            {field.label}
          </label>
          <div className="relative">
            {field.prefix && (
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-(--muted-foreground) font-medium">
                {field.prefix}
              </span>
            )}
            <input
              id={`lumpsum-${field.key}`}
              type="number"
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder || ""}
              min={0}
              max={field.max}
              step={field.step ?? (field.integer ? 1 : "any")}
              aria-invalid={errors[field.key] ? "true" : undefined}
              aria-describedby={errors[field.key] ? `lumpsum-${field.key}-error` : undefined}
              className={`h-12 w-full rounded-xl border ${
                errors[field.key]
                  ? "border-(--danger) focus:border-(--danger) focus:ring-(--danger)/30"
                  : "border-(--border) focus:border-(--primary) focus:ring-(--primary)/30"
              } bg-(--background) px-4 ${
                field.prefix ? "pl-8" : ""
              } text-sm font-medium text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:ring-2`}
            />
            {field.suffix && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-(--muted-foreground)">
                {field.suffix}
              </span>
            )}
          </div>
          {errors[field.key] && (
            <p id={`lumpsum-${field.key}-error`} className="mt-1 text-xs text-(--danger-text)">
              {errors[field.key]}
            </p>
          )}
        </div>
      ))}

      {getExtraControls(slug, form, setForm)}

      <div className="flex gap-3 pt-2">
        <button
          onClick={calculate}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover) active:scale-[0.98]"
        >
          <Calculator className="h-4 w-4" />
          Calculate
        </button>
        <button
          onClick={reset}
          aria-label="Reset the calculator"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function ResultsPanel({ result, showDetails, setShowDetails, slug, name }) {
  return (
    <div aria-live="polite" role="status">
      {!result ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--border) bg-(--background)/50 p-8 text-center">
          <Calculator className="mb-3 h-12 w-12 text-(--muted-foreground)/40" />
          <p className="text-sm text-(--muted-foreground)">
            Enter your details and click Calculate to see results
          </p>
          <p className="mt-1 text-xs text-(--muted-foreground)/60">
            Get detailed projections for lumpsum investment calculator
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {result.primary !== undefined && (
            <div className="rounded-xl bg-(--primary)/5 border border-(--primary)/10 p-6 text-center">
              <p className="text-sm font-medium text-(--muted-foreground) mb-1">{result.primaryLabel || "Result"}</p>
              <p className="text-3xl font-bold text-(--primary)">{formatCurrency(result.primary)}</p>
              {result.secondary !== undefined && (
                <p className="mt-2 text-sm text-(--muted-foreground)">
                  {result.secondaryLabel || "Total"}: {formatCurrency(result.secondary)}
                </p>
              )}
            </div>
          )}

          {result.details && result.details.length > 0 && (
            <div>
              <button
                className="flex w-full items-center justify-between rounded-xl border border-(--border) bg-(--card) px-5 py-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted)/30"
                onClick={() => setShowDetails(!showDetails)}
                aria-expanded={showDetails}
                aria-controls="lumpsum-year-by-year-table"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-(--primary)" />
                  Year-by-Year Breakdown
                </span>
                <svg className={`h-4 w-4 transition ${showDetails ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDetails && (
                <div
                  id="lumpsum-year-by-year-table"
                  className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-(--border)"
                >
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-(--surface-soft)">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Year</th>
                        <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Invested</th>
                        <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Interest</th>
                        <th className="px-4 py-2 font-semibold text-(--muted-foreground) text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.details.map((row, i) => (
                        <tr key={i} className="border-t border-(--border)">
                          <td className="px-4 py-2 font-medium text-(--foreground)">{row.year}</td>
                          <td className="px-4 py-2 text-(--muted-foreground)">{formatCurrency(row.invested)}</td>
                          <td className="px-4 py-2 text-(--muted-foreground)">{formatCurrency(row.interest)}</td>
                          <td className="px-4 py-2 text-right font-medium text-(--foreground)">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {result.summaryItems && result.summaryItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {result.summaryItems.map((item, i) => (
                <div key={i} className="rounded-xl border border-(--border) bg-(--background)/50 p-4">
                  <p className="text-xs font-medium text-(--muted-foreground)">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-(--foreground)">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatCurrency(value) {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// This file used to be copy-pasted across 19 near-identical financial
// calculator tools, each only changing the SLUG constant above. Every branch
// below other than "lumpsum-calculator" was therefore permanently
// unreachable dead code in this bundle — removed; this tool only needs its
// own three fields and one formula.
function getDefaultForm(slug) {
  if (slug === "lumpsum-calculator") {
    return { amount: 100000, rate: 12, years: 10 };
  }
  return {};
}

function getFormFields(slug) {
  if (slug === "lumpsum-calculator") {
    return [
      { key: "amount", label: "Lumpsum Investment Amount", prefix: "₹", suffix: null, placeholder: "100000" },
      {
        key: "rate",
        label: "Expected Return Rate (% p.a.)",
        prefix: null,
        suffix: "%",
        placeholder: "12",
        max: 100,
      },
      {
        key: "years",
        label: "Investment Period (Years)",
        prefix: null,
        suffix: "yrs",
        placeholder: "10",
        // The year-by-year table below can only ever show whole years, and
        // an unbounded value would push the breakdown loop (and the table
        // it renders) into six-figure iteration counts. Keeping the field a
        // bounded whole number keeps the headline Future Value and the
        // table it explains in sync, and keeps the page responsive.
        integer: true,
        step: 1,
        max: 100,
      },
    ];
  }
  return [];
}

function getValidationRules(slug) {
  const rules = {};
  const fields = getFormFields(slug);
  for (const f of fields) {
    rules[f.key] = {
      label: f.label,
      min: 0,
      ...(f.max !== undefined ? { max: f.max } : {}),
      ...(f.integer ? { integer: true } : {}),
    };
  }
  return rules;
}

// This tool has no compounding-frequency/job-stability/etc. extra controls
// of its own — those belonged to other calculators this file used to be
// copy-pasted from (see the note above getDefaultForm).
function getExtraControls() {
  return null;
}

function computeResult(slug, form) {
  const f = form;
  switch (slug) {
    case "lumpsum-calculator": {
      const amount = Number(f.amount) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const maturity = amount * Math.pow(1 + rate, years);
      const details = [];
      let running = amount;
      for (let y = 1; y <= years; y++) {
        const prev = running;
        running = prev * (1 + rate);
        details.push({ year: y, invested: amount, interest: Math.round(running - amount), balance: Math.round(running) });
      }
      return {
        primary: Math.round(maturity),
        primaryLabel: "Future Value",
        secondary: Math.round(maturity - amount),
        secondaryLabel: "Total Interest Earned",
        details,
      };
    }
    default:
      return { primary: 0, primaryLabel: "Result", details: [] };
  }
}


function FAQSection({ slug, name }) {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = getFAQs(slug, name);
  if (!faqs.length) return null;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold text-(--foreground)">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-(--border) bg-(--card) overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              aria-controls={`lumpsum-faq-answer-${i}`}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-(--foreground) transition hover:bg-(--muted)/20"
            >
              {faq.q}
              <svg
                className={`h-4 w-4 shrink-0 text-(--muted-foreground) transition ${openIndex === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div
                id={`lumpsum-faq-answer-${i}`}
                className="border-t border-(--border) px-5 py-4 text-sm leading-relaxed text-(--muted-foreground)"
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getFAQs(slug) {
  const all = {
    "lumpsum-calculator": [
      { q: "What is lumpsum investment?", a: "A lumpsum investment is a one-time investment of a large amount, as opposed to periodic SIP investments." },
      { q: "When is lumpsum better than SIP?", a: "Lumpsum works well when markets are undervalued or you have a large amount to invest. SIP is better for regular income investors." },
    ],
  };
  return all[slug] || [
    { q: "How does this calculator work?", a: "Enter your financial details and the calculator provides instant results based on standard financial formulas." },
    { q: "Are the results guaranteed?", a: "Results are estimates based on your inputs. Actual returns may vary based on market conditions and other factors." },
  ];
}
