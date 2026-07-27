"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import {
  CITY_TIERS,
  GST_RATE,
  JOBS,
  MATERIAL_MARKUP,
  MIN_BILLABLE_HOURS_PER_JOB,
  TRADES,
  URGENCY_LEVELS,
  VISIT_CHARGE_INR,
  estimateHandymanJob,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EMPTY_QUANTITIES = Object.fromEntries(JOBS.map((job) => [job.id, "0"]));
const DEFAULT_QUANTITIES = { ...EMPTY_QUANTITIES, "fan-install": "2", tap: "1" };

const TRADE_LABEL = new Map(TRADES.map((trade) => [trade.id, trade.label]));

export default function ToolHome() {
  const [quantities, setQuantities] = useState(DEFAULT_QUANTITIES);
  const [cityTier, setCityTier] = useState("tier1");
  const [urgency, setUrgency] = useState("standard");
  const [materialCost, setMaterialCost] = useState("1200");
  const [handymanBuysMaterial, setHandymanBuysMaterial] = useState(true);
  const [waiveVisitCharge, setWaiveVisitCharge] = useState(true);
  const [includeGst, setIncludeGst] = useState(true);
  const [copied, setCopied] = useState(false);

  const quote = useMemo(() => {
    const numeric = {};
    for (const job of JOBS) {
      const raw = String(quantities[job.id] ?? "").trim();
      numeric[job.id] = raw === "" ? 0 : Number(raw);
    }
    return estimateHandymanJob({
      quantities: numeric,
      cityTier,
      urgency,
      materialCost: String(materialCost).trim() === "" ? NaN : Number(materialCost),
      handymanBuysMaterial,
      waiveVisitCharge,
      includeGst,
    });
  }, [quantities, cityTier, urgency, materialCost, handymanBuysMaterial, waiveVisitCharge, includeGst]);

  const ok = !quote.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = ["Handyman Cost Estimate", `${quote.tierLabel} · ${quote.urgencyLabel}`, ""];
    for (const row of quote.rows) {
      lines.push(`${row.label} × ${row.qty} — ${row.billedHours} h @ ${money(row.hourlyRate)}/h = ${money(row.amount)}`);
    }
    lines.push("");
    lines.push(`Labour: ${money(quote.labour)}`);
    if (quote.visitCharge > 0) lines.push(`Visit charge: ${money(quote.visitCharge)}`);
    lines.push(`Materials: ${money(quote.materialTotal)}`);
    if (quote.gstAmount > 0) lines.push(`GST at 18%: ${money(quote.gstAmount)}`);
    lines.push(`Total: ${money(quote.total)}`);
    return lines.join("\n");
  }, [ok, quote]);

  const setQty = (id, value) => setQuantities((previous) => ({ ...previous, [id]: value }));

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
    setQuantities(DEFAULT_QUANTITIES);
    setCityTier("tier1");
    setUrgency("standard");
    setMaterialCost("1200");
    setHandymanBuysMaterial(true);
    setWaiveVisitCharge(true);
    setIncludeGst(true);
    setCopied(false);
  };

  const clearJobs = () => {
    setQuantities(EMPTY_QUANTITIES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Handyman Cost Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices small jobs the way a tradesperson bills them: hours at a trade rate with a one-hour
          minimum per job, one visit charge per trip, materials plus handling, an urgency loading and
          18% GST.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Jobs to be done</h2>
          <button type="button" onClick={clearJobs} className={GHOST_BTN}>
            Clear all jobs
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {JOBS.map((job) => (
            <div key={job.id}>
              <label className={LABEL_CLASS} htmlFor={`hm-j-${job.id}`}>
                {job.label}
              </label>
              <input
                id={`hm-j-${job.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="50"
                step="1"
                value={quantities[job.id] ?? ""}
                onChange={(event) => setQty(job.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {TRADE_LABEL.get(job.trade)} · {NUM2.format(job.hours)} h per {job.unit}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-tier">
              City tier
            </label>
            <select
              id="hm-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cityTier}
              onChange={(event) => setCityTier(event.target.value)}
            >
              {CITY_TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hm-urgency">
              How urgent
            </label>
            <select
              id="hm-urgency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={urgency}
              onChange={(event) => setUrgency(event.target.value)}
            >
              {URGENCY_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hm-material">
              Cost of parts and materials (₹)
            </label>
            <input
              id="hm-material"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500000"
              step="50"
              value={materialCost}
              onChange={(event) => setMaterialCost(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor="hm-buys"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="hm-buys"
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-[var(--primary)]"
              checked={handymanBuysMaterial}
              onChange={(event) => setHandymanBuysMaterial(event.target.checked)}
            />
            <span>Tradesperson buys the materials (adds {PCT.format(MATERIAL_MARKUP)} handling)</span>
          </label>
          <label
            htmlFor="hm-visit"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="hm-visit"
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-[var(--primary)]"
              checked={waiveVisitCharge}
              onChange={(event) => setWaiveVisitCharge(event.target.checked)}
            />
            <span>Visit charge waived because the work goes ahead</span>
          </label>
          <label
            htmlFor="hm-gst"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="hm-gst"
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-[var(--primary)]"
              checked={includeGst}
              onChange={(event) => setIncludeGst(event.target.checked)}
            />
            <span>Provider is GST-registered (adds {PCT.format(GST_RATE)})</span>
          </label>
        </div>
      </section>

      {quote.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {quote.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(quote.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(quote.billableHours)} billable hours across ${quote.tradesNeeded} trade${quote.tradesNeeded > 1 ? "s" : ""}`
                : "Add at least one job to see a price"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy handyman cost estimate"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy quote"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Hands-on hours", ok ? `${NUM2.format(quote.rawHours)} h` : DASH],
            [
              "Added by the one-hour minimum",
              ok ? (quote.minimumHoursAdded > 0 ? `${NUM2.format(quote.minimumHoursAdded)} h` : "None") : DASH,
            ],
            ["Labour at standard rates", ok ? money(quote.labourBeforeUrgency) : DASH],
            [
              "Urgency loading",
              ok ? (quote.urgencyExtra > 0 ? `+${money(quote.urgencyExtra)} (× ${quote.urgencyFactor})` : "None") : DASH,
            ],
            ["Labour billed", ok ? money(quote.labour) : DASH],
            ["Visit charge", ok ? (quote.visitCharge > 0 ? money(quote.visitCharge) : "Waived") : DASH],
            ["Materials at cost", ok ? money(quote.materialCost) : DASH],
            [
              "Material handling",
              ok ? (quote.materialMarkup > 0 ? money(quote.materialMarkup) : "None — you buy the parts") : DASH,
            ],
            ["Subtotal", ok ? money(quote.subtotal) : DASH],
            ["GST", ok ? (quote.gstRate > 0 ? money(quote.gstAmount) : "Not charged") : DASH],
            ["Effective all-in hourly", ok ? `${money(quote.effectiveHourly)} per billed hour` : DASH],
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
            <h2 className="text-base font-semibold">Job-by-job breakdown</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Job</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Billed hours</th>
                    <th scope="col" className="py-2 text-right font-semibold">Labour</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="block font-semibold">{row.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.tradeLabel} at {money(row.hourlyRate)}/h
                          {row.minimumApplied ? ` · ${MIN_BILLABLE_HOURS_PER_JOB} h minimum applied` : ""}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">{row.qty}</td>
                      <td className="py-2 pr-3 text-right">{NUM2.format(row.billedHours)}</td>
                      <td className="py-2 text-right font-semibold">{money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Who you need to call</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Trade</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Jobs</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Hours</th>
                    <th scope="col" className="py-2 text-right font-semibold">Labour</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.byTrade.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{row.jobs}</td>
                      <td className="py-2 pr-3 text-right">{NUM2.format(row.hours)}</td>
                      <td className="py-2 text-right">{money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {quote.tradesNeeded > 1 ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                More than one trade is involved, so this may be two visits. Each visit can carry its
                own {money(VISIT_CHARGE_INR)} call-out unless the provider waives it.
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are market reference figures for Indian cities and vary with the tradesperson's
        experience, the building's access and whether a platform takes a cut. Electrical distribution
        board work and concealed plumbing should go to a licensed professional, and any quote worth
        arguing over should be put in writing before work starts.
      </p>
    </main>
  );
}
