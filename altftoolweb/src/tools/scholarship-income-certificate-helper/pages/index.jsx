"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileBadge, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DOCUMENT_CHECKLIST, computeFamilyIncome } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_EARNERS = [
  { id: 1, label: "Father", monthly: "15000" },
  { id: 2, label: "Mother", monthly: "8000" },
];

export default function ToolHome() {
  const [earners, setEarners] = useState(DEFAULT_EARNERS);
  const [nextId, setNextId] = useState(3);
  const [otherAnnual, setOtherAnnual] = useState("20000");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFamilyIncome({
        earners: earners.map((e) => ({
          label: e.label,
          monthly: e.monthly.trim() === "" ? 0 : Number(e.monthly),
        })),
        otherAnnual: otherAnnual.trim() === "" ? 0 : Number(otherAnnual),
      }),
    [earners, otherAnnual],
  );

  const hasError = Boolean(result.error);

  const updateEarner = (id, patch) => {
    setEarners((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const addEarner = () => {
    setEarners((prev) => [...prev, { id: nextId, label: "", monthly: "" }]);
    setNextId((id) => id + 1);
  };

  const removeEarner = (id) => {
    setEarners((prev) => prev.filter((e) => e.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Family income for income certificate",
      `Total monthly income: ${money(result.monthlyTotal)}`,
      `Other annual income: ${money(result.otherAnnual)}`,
      `Annual family income: ${money(result.annualIncome)}`,
      "",
      "Scheme ceilings:",
    ];
    for (const scheme of result.schemes) {
      lines.push(
        `- ${scheme.name} (ceiling ${money(scheme.ceiling)}): ${scheme.withinCeiling ? "within" : "above"} ceiling`,
      );
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
    setEarners(DEFAULT_EARNERS);
    setNextId(3);
    setOtherAnnual("20000");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileBadge className="h-4 w-4" aria-hidden="true" />
          Scholarship Tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scholarship Income Certificate Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add every earning family member&apos;s monthly income plus other annual income to get the
          annual family income figure an income certificate certifies — and see which scholarship
          ceilings it clears.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Earning family members</h2>
        <div className="mt-4 space-y-4">
          {earners.map((earner, index) => (
            <div
              key={earner.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`ich-label-${earner.id}`}>
                  Member {index + 1}
                </label>
                <input
                  id={`ich-label-${earner.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder="e.g. Father"
                  value={earner.label}
                  onChange={(event) => updateEarner(earner.id, { label: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ich-monthly-${earner.id}`}>
                  Monthly income (INR)
                </label>
                <input
                  id={`ich-monthly-${earner.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={earner.monthly}
                  onChange={(event) => updateEarner(earner.id, { monthly: event.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeEarner(earner.id)}
                  aria-label={`Remove member ${earner.label || index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addEarner} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add member
        </button>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="ich-other">
            Other annual income (agriculture, rent, pension, interest — INR per year)
          </label>
          <input
            id="ich-other"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={otherAnnual}
            onChange={(event) => setOtherAnnual(event.target.value)}
          />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Annual family income
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.annualIncome)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the total."
                : "This is the figure the income certificate will certify — monthly income × 12 plus other annual income."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the income summary"
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
          {(hasError
            ? [
                ["Total monthly income", DASH],
                ["Other annual income", DASH],
              ]
            : [
                ["Total monthly income", money(result.monthlyTotal)],
                ["Monthly income annualised (× 12)", money(result.annualisedMonthly)],
                ["Other annual income", money(result.otherAnnual)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where this income stands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Scheme
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Income ceiling
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError
                ? null
                : result.schemes.map((scheme) => (
                    <tr key={scheme.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{scheme.name}</td>
                      <td className="py-2 pr-3 text-right">{money(scheme.ceiling)}</td>
                      <td
                        className={`py-2 text-right font-semibold ${scheme.withinCeiling ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                      >
                        {scheme.withinCeiling ? "Within ceiling" : "Above ceiling"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Ceilings are the published scheme guideline figures and are revised by notification —
          verify the current year&apos;s guidelines before applying.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Papers to carry to the tehsil / e-district portal</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--muted-foreground)]">
          {DOCUMENT_CHECKLIST.map((doc) => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — document lists and income definitions vary by state, and the issuing
        authority&apos;s figure is final. This page is not legal advice; confirm requirements at
        your tehsil office or state e-district portal.
      </p>
    </main>
  );
}
