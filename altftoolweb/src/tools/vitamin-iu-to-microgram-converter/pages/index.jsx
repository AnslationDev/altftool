"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw } from "lucide-react";

import {
  COMMON_IU_ROWS,
  INPUT_UNITS,
  VITAMIN_FORMS,
  convertVitaminAmount,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = { amount: "1000", unit: "IU", formId: "d" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VITAMIN_GROUPS = ["Vitamin A", "Vitamin D", "Vitamin E"];

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [formId, setFormId] = useState(DEFAULTS.formId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertVitaminAmount({ amount, unit, formId }),
    [amount, unit, formId],
  );
  const ok = !result.error;

  const massText = ok
    ? result.form.preferMg
      ? `${NUM.format(result.mg)} mg`
      : `${NUM.format(result.mcg)} ${result.form.massLabel}`
    : DASH;
  const headline = ok ? (unit === "IU" ? massText : `${NUM.format(result.iu)} IU`) : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${result.form.vitamin} — ${result.form.form}`,
      `Entered: ${NUM.format(result.inputAmount)} ${result.inputUnit}`,
      `In IU: ${NUM.format(result.iu)}`,
      `In micrograms: ${NUM.format(result.mcg)} ${result.form.massLabel}`,
      `In milligrams: ${NUM.format(result.mg)} mg`,
      `Percent of Daily Value: ${NUM.format(result.percentDv)}%`,
      result.ulMcg
        ? `Percent of the adult upper limit: ${NUM.format(result.percentUl)}%`
        : "No upper intake level is set for this form.",
      "Informational only — check doses with a pharmacist or doctor.",
    ].join("\n");
  }, [ok, result]);

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
    setAmount(DEFAULTS.amount);
    setUnit(DEFAULTS.unit);
    setFormId(DEFAULTS.formId);
    setCopied(false);
  };

  const tableRows = COMMON_IU_ROWS[formId] || [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vitamin IU to Microgram Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An IU is defined separately for every vitamin and every chemical form, so pick the exact
          form on your label to get the right microgram figure.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div>
          <label className={LABEL_CLASS} htmlFor="vit-form">
            Vitamin and form
          </label>
          <select
            id="vit-form"
            className={`mt-2 ${INPUT_CLASS}`}
            value={formId}
            onChange={(event) => setFormId(event.target.value)}
          >
            {VITAMIN_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {VITAMIN_FORMS.filter((entry) => entry.vitamin === group).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.form}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vit-amount">
              Amount on the label
            </label>
            <input
              id="vit-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vit-unit">
              Unit entered
            </label>
            <select
              id="vit-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {INPUT_UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {unit === "IU" ? "Metric equivalent" : "International Units"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `1 IU = ${NUM.format(result.mcgPerIu)} ${result.form.massLabel} for this form`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the vitamin unit conversion"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["International Units", ok ? `${NUM.format(result.iu)} IU` : DASH],
            ["Micrograms", ok ? `${NUM.format(result.mcg)} ${result.form.massLabel}` : DASH],
            ["Milligrams", ok ? `${NUM.format(result.mg)} mg` : DASH],
            ["Percent of Daily Value", ok ? `${NUM.format(result.percentDv)}%` : DASH],
            [
              "Daily Value in this unit set",
              ok ? `${NUM.format(result.dvMcg)} ${result.form.massLabel} (${NUM0.format(result.dvIu)} IU)` : DASH,
            ],
            [
              "Adult upper intake level",
              ok
                ? result.ulMcg
                  ? `${NUM.format(result.ulMcg)} ${result.form.massLabel} (${NUM0.format(result.ulIu)} IU)`
                  : "None set"
                : DASH,
            ],
            [
              "Percent of the upper limit",
              ok ? (result.ulMcg ? `${NUM.format(result.percentUl)}%` : "Not applicable") : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && result.exceedsUl && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            This is above the adult tolerable upper intake level. High doses are sometimes
            prescribed deliberately, but confirm it is intended with your doctor.
          </p>
        )}
        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.ulNote}
          </p>
        )}
      </section>

      {tableRows.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Common label strengths for this form</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    IU
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Micrograms
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Milligrams
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((iu) => {
                  const row = convertVitaminAmount({ amount: iu, unit: "IU", formId });
                  return (
                    <tr key={iu} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{NUM0.format(iu)}</td>
                      <td className="py-2 pr-3 text-right">{NUM.format(row.mcg)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {NUM.format(row.mg)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Daily Values are US label references for adults and
        children over four; personal requirements differ in pregnancy, infancy and illness. Check any
        high-dose regimen with a pharmacist or doctor.
      </p>
    </main>
  );
}
