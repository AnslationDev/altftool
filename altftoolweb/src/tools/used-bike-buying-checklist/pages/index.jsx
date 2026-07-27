"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import {
  CHECKPOINTS,
  COST_BANDS,
  MIN_COVERAGE_PERCENT,
  assessBike,
  checkpointGroups,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? INT.format(v) : "—");
const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");

const GROUPS = checkpointGroups();
const PRICED_BANDS = COST_BANDS.filter((b) => b.id !== "none");
const REFERENCE_YEAR = 2026;

const DEFAULTS = {
  askingPrice: "150000",
  odometerKm: "40000",
  modelYear: "2020",
  currentYear: String(REFERENCE_YEAR),
  bandCosts: Object.fromEntries(COST_BANDS.map((b) => [b.id, String(b.defaultCost)])),
  results: {},
};

const STATES = [
  { id: "pass", label: "Pass" },
  { id: "fail", label: "Fail" },
  { id: "skip", label: "Skip" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBandCost = (id) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, bandCosts: { ...prev.bandCosts, [id]: value } }));
  };

  const mark = (checkId, state) => () => {
    setForm((prev) => {
      const next = { ...prev.results };
      if (next[checkId] === state) delete next[checkId];
      else next[checkId] = state;
      return { ...prev, results: next };
    });
  };

  const markAll = (state) => () => {
    setForm((prev) => ({
      ...prev,
      results: Object.fromEntries(CHECKPOINTS.map((p) => [p.id, state])),
    }));
  };

  const result = useMemo(
    () =>
      assessBike({
        results: form.results,
        askingPrice: form.askingPrice === "" ? 0 : Number(form.askingPrice),
        bandCosts: form.bandCosts,
        odometerKm: form.odometerKm === "" ? NaN : Number(form.odometerKm),
        modelYear: form.modelYear === "" ? NaN : Number(form.modelYear),
        currentYear: form.currentYear === "" ? NaN : Number(form.currentYear),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Used Bike Buying Checklist",
      `Verdict: ${result.verdictLabel}`,
      `Condition score ${n1(result.score)}% from ${result.checkedCount} of ${result.totalCheckpoints} checks (${n1(result.coverage)}% coverage)`,
      `Asking ${money(result.askingPrice)} · repair allowance ${money(result.repairAllowance)} · opening offer ${money(result.fairOffer)}`,
    ];
    if (result.mileage) {
      lines.push(`${n0(result.mileage.kmPerYear)} km a year over ${result.mileage.ageYears} years — ${result.mileage.band}`);
    }
    if (result.failed.length) {
      lines.push("", "Failed checks:");
      result.failed.forEach((f) => {
        lines.push(`- ${f.label}${f.dealBreaker ? " (DEAL-BREAKER)" : ` — ${money(f.cost)}`}`);
      });
    }
    lines.push("", result.verdictAdvice);
    return lines.join("\n");
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const stateClass = (checkId, state) => {
    const active = form.results[checkId] === state;
    if (!active) {
      return "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]";
    }
    if (state === "pass") return "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]";
    if (state === "fail") return "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]";
    return "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]";
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Buying used
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Used Bike Buying Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {CHECKPOINTS.length} weighted checks across paperwork, frame, engine, transmission,
          brakes, suspension, electrics and the test ride. Mark each one and the tool scores the
          bike, flags the deal-breakers and turns the failures into an itemised offer.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The bike</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ub-price">
              Asking price
            </label>
            <input
              id="ub-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.askingPrice}
              onChange={set("askingPrice")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ub-odo">
              Odometer (km)
            </label>
            <input
              id="ub-odo"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.odometerKm}
              onChange={set("odometerKm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ub-year">
              Model year
            </label>
            <input
              id="ub-year"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.modelYear}
              onChange={set("modelYear")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ub-now">
              Current year
            </label>
            <input
              id="ub-now"
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.currentYear}
              onChange={set("currentYear")}
            />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold">What a repair costs you</h3>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Set these to your own local parts and labour rates. Every failed check is priced from one
          of these four bands.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {PRICED_BANDS.map((band) => (
            <div key={band.id}>
              <label className={LABEL_CLASS} htmlFor={`ub-band-${band.id}`}>
                {band.label} repair
              </label>
              <input
                id={`ub-band-${band.id}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.bandCosts[band.id]}
                onChange={setBandCost(band.id)}
              />
            </div>
          ))}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Condition score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${ok && result.verdictId === "walk-away" ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
            >
              {ok ? `${n1(result.score)}%` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.verdictLabel} · ${result.checkedCount} of ${result.totalCheckpoints} checks done`
                : "Mark at least one check to see a score"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the inspection result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the whole inspection" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Checks completed", ok ? `${result.checkedCount} of ${result.totalCheckpoints} (${n1(result.coverage)}%)` : "—"],
            ["Passed / failed", ok ? `${result.passedCount} / ${result.failedCount}` : "—"],
            ["Deal-breakers failed", ok ? String(result.dealBreakers.length) : "—"],
            ["Asking price", ok ? money(result.askingPrice) : "—"],
            ["Repair allowance", ok ? money(result.repairAllowance) : "—"],
            ["Opening offer", ok ? money(result.fairOffer) : "—"],
            [
              "Annual distance",
              ok && result.mileage
                ? `${n0(result.mileage.kmPerYear)} km a year over ${result.mileage.ageYears} years`
                : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.verdictAdvice}
          </p>
        ) : null}

        {ok
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </p>
            ))
          : null}
      </section>

      {ok && result.failed.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Take this list to the seller</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Failed check</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Area</th>
                  <th scope="col" className="py-2 text-right font-semibold">Allowance</th>
                </tr>
              </thead>
              <tbody>
                {result.failed.map((f) => (
                  <tr key={f.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{f.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{f.group}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {f.dealBreaker ? (
                        <span className="font-semibold text-[var(--danger)]">Deal-breaker</span>
                      ) : (
                        money(f.cost)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">The inspection</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={markAll("pass")} className={`${GHOST_BTN} px-3 text-xs`}>
              Mark all pass
            </button>
            <button type="button" onClick={markAll("skip")} className={`${GHOST_BTN} px-3 text-xs`}>
              Clear all
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Skipped checks are excluded from the score. Below {MIN_COVERAGE_PERCENT}% coverage the
          score is flagged as unreliable.
        </p>

        {GROUPS.map((group) => {
          const stats = ok ? result.byGroup.find((g) => g.group === group) : null;
          return (
            <div key={group} className="mt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold">{group}</h3>
                {stats ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {stats.checked} of {stats.total} checked
                    {stats.score === null ? "" : ` · ${n0(stats.score)}%`}
                    {stats.failed ? ` · ${stats.failed} failed` : ""}
                  </p>
                ) : null}
              </div>
              <ul className="mt-2 space-y-2">
                {CHECKPOINTS.filter((p) => p.group === group).map((point) => (
                  <li key={point.id} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {point.label}
                          {point.dealBreaker ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-[var(--danger)]">
                              Deal-breaker
                            </span>
                          ) : null}
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                            weight {point.weight}
                          </span>
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{point.what}</p>
                      </div>
                      <div className="flex gap-1" role="group" aria-label={`Result for: ${point.label}`}>
                        {STATES.map((state) => (
                          <button
                            key={state.id}
                            type="button"
                            onClick={mark(point.id, state.id)}
                            aria-pressed={form.results[point.id] === state.id}
                            className={`min-h-11 rounded-md border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${stateClass(point.id, state.id)}`}
                          >
                            {state.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A structured inspection aid, not a mechanical or legal opinion. Verify the documents through
        the official register for your country, and have a qualified mechanic inspect anything you
        are unsure about before money changes hands.
      </p>
    </main>
  );
}
