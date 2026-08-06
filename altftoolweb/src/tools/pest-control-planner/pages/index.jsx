"use client";

import { useMemo, useState } from "react";
import { Bug, Check, Copy, RotateCcw } from "lucide-react";

import {
  MONTHS,
  PESTS,
  PROPERTY_TYPES,
  SEVERITY_LEVELS,
  planPestControl,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const intervalText = (months) => {
  if (months === 1) return "every month";
  if (months < 12) return `every ${months} months`;
  if (months === 12) return "once a year";
  return `every ${months / 12} years`;
};

export default function ToolHome() {
  const [area, setArea] = useState("1000");
  const [pests, setPests] = useState(["cockroach", "mosquito"]);
  const [severity, setSeverity] = useState("moderate");
  const [propertyType, setPropertyType] = useState("apartment");
  const [herbal, setHerbal] = useState(false);
  const [includeGst, setIncludeGst] = useState(true);
  const [startMonth, setStartMonth] = useState(() => new Date().getMonth());
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planPestControl({
        areaSqft: String(area).trim() === "" ? NaN : Number(area),
        pests,
        severity,
        propertyType,
        herbal,
        includeGst,
        startMonth,
      }),
    [area, pests, severity, propertyType, herbal, includeGst, startMonth],
  );

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Pest Control Plan",
      `${area} sq ft · ${plan.propertyLabel} · ${plan.severityLabel}`,
      "",
    ];
    for (const row of plan.rows) {
      lines.push(
        `${row.label}: ${row.method}. ${money(row.perTreatmentWithTax)} per treatment${plan.gstRate > 0 ? " incl. GST" : ""}, ${intervalText(row.intervalMonths)}, ${row.warrantyMonths}-month warranty.`,
      );
    }
    lines.push("");
    lines.push(`First visit: ${money(plan.firstVisitTotal)}`);
    lines.push(`Next 12 months as scheduled: ${money(plan.planTotal)} across ${plan.visitsInPlan} visits`);
    lines.push(`Long-run annual average: ${money(plan.annualisedTotal)} (${money(plan.monthlyEquivalent)} a month)`);
    return lines.join("\n");
  }, [ok, plan, area]);

  const togglePest = (id) => {
    setPests((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
    setCopied(false);
  };

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
    setArea("1000");
    setPests(["cockroach", "mosquito"]);
    setSeverity("moderate");
    setPropertyType("apartment");
    setHerbal(false);
    setIncludeGst(true);
    setStartMonth(new Date().getMonth());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bug className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pest Control Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the pests you are dealing with and get the treatment method professionals use, how
          often it has to be repeated, a twelve-month visit calendar and the cost including GST.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Pests to treat</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PESTS.map((pest) => (
              <label
                key={pest.id}
                htmlFor={`pc-p-${pest.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`pc-p-${pest.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={pests.includes(pest.id)}
                  onChange={() => togglePest(pest.id)}
                />
                <span className="min-w-0">
                  <span className="block font-semibold">{pest.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {intervalText(pest.intervalMonths)} · {money(pest.minCharge)} minimum
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-area">
              Carpet area (sq ft)
            </label>
            <input
              id="pc-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="20000"
              step="50"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-property">
              Property type
            </label>
            <select
              id="pc-property"
              className={`mt-2 ${INPUT_CLASS}`}
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
            >
              {PROPERTY_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-severity">
              Infestation level
            </label>
            <select
              id="pc-severity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            >
              {SEVERITY_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-start">
              Plan starts in
            </label>
            <select
              id="pc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(startMonth)}
              onChange={(event) => setStartMonth(Number(event.target.value))}
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={String(index)}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="pc-herbal"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="pc-herbal"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={herbal}
              onChange={(event) => setHerbal(event.target.checked)}
            />
            <span>Odourless / herbal chemistry (infants or pets at home)</span>
          </label>
          <label
            htmlFor="pc-gst"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="pc-gst"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={includeGst}
              onChange={(event) => setIncludeGst(event.target.checked)}
            />
            <span>Provider is GST-registered (18%, SAC 998531)</span>
          </label>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost over the next 12 months
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(plan.planTotal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.visitsInPlan} scheduled visits · first visit ${money(plan.firstVisitTotal)}`
                : "Pick at least one pest to build a plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy pest control plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["First visit, all pests together", ok ? money(plan.firstVisitTotal) : DASH],
            ["GST on the 12-month plan", ok ? (plan.gstRate > 0 ? money(plan.planGst) : "Not charged") : DASH],
            ["Long-run annual average", ok ? money(plan.annualisedTotal) : DASH],
            ["Spread per month", ok ? money(plan.monthlyEquivalent) : DASH],
            [
              "Multi-pest bundling discount",
              ok ? (plan.bundleDiscount > 0 ? PCT.format(plan.bundleDiscount) : "None — single pest") : DASH,
            ],
            ["Severity and property loading", ok ? `× ${NUM1.format(plan.loadFactor)}` : DASH],
            ["Heaviest month", ok && plan.busiestMonth ? `${plan.busiestMonth.month} — ${money(plan.busiestMonth.costWithTax)}` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Treatment plan by pest</h2>
            <ul className="mt-3 space-y-3">
              {plan.rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-sm font-semibold text-[var(--primary)]">
                      {money(row.perTreatmentWithTax)} per treatment
                      {plan.gstRate > 0 ? " incl. GST" : ""}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{row.method}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{row.prep}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {intervalText(row.intervalMonths)} · {row.rounds} round{row.rounds > 1 ? "s" : ""} ·{" "}
                    {row.warrantyMonths}-month warranty
                    {row.minimumApplied
                      ? ` · minimum call-out ${money(row.minChargeWithTax)}${plan.gstRate > 0 ? " incl. GST" : ""} applied`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Twelve-month visit calendar</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Month</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Due</th>
                    <th scope="col" className="py-2 text-right font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.calendar.map((entry) => (
                    <tr key={entry.offset} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{entry.month}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                        {entry.pests.length > 0 ? entry.pests.join(", ") : "No visit"}
                      </td>
                      <td className="py-2 text-right">
                        {entry.costWithTax > 0 ? money(entry.costWithTax) : DASH}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are Indian market reference figures and vary by city, chemical used and access. Only
        use an operator licensed under the Insecticides Act, 1968, ask for the product label and
        safety data sheet, and follow the stated re-entry time — especially with infants, pregnancy,
        asthma or pets in the home. This is planning information, not medical or legal advice.
      </p>
    </main>
  );
}
