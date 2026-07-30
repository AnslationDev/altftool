"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, Layers, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import {
  MAX_CLAIMS,
  RULE_AS_OF,
  RULE_SOURCE,
  computeTopUpComparison,
  describeOutcome,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const ICON_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => (Number.isFinite(value) ? inr.format(value) : DASH);
const percent = (value) => (Number.isFinite(value) ? `${pct.format(value)}%` : DASH);

/**
 * Defaults are the case the two structures disagree on hardest: four mid-sized
 * claims, none of which on its own clears the deductible.
 */
const DEFAULT_STATE = {
  baseSumInsured: "500000",
  topUpSumInsured: "2000000",
  deductible: "500000",
  claims: ["300000", "300000", "300000", "300000"],
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeTopUpComparison(values), [values]);
  const failed = Boolean(result.error);
  const note = failed ? "" : describeOutcome(result);

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  function setClaim(index, value) {
    setValues((prev) => ({
      ...prev,
      claims: prev.claims.map((c, i) => (i === index ? value : c)),
    }));
    setCopied(false);
  }

  function addClaim() {
    setValues((prev) =>
      prev.claims.length >= MAX_CLAIMS ? prev : { ...prev, claims: [...prev.claims, ""] },
    );
    setCopied(false);
  }

  function removeClaim(index) {
    setValues((prev) => ({ ...prev, claims: prev.claims.filter((_, i) => i !== index) }));
    setCopied(false);
  }

  function resetAll() {
    setValues(DEFAULT_STATE);
    setCopied(false);
  }

  async function copyResult() {
    if (failed) return;
    const lines = [
      "Top-up vs super top-up — one policy year",
      `Base sum insured: ${money(result.baseSumInsured)}`,
      `Upper layer sum insured: ${money(result.topUpSumInsured)}`,
      `Deductible: ${money(result.deductible)}`,
      `Claims (${result.claimCount}): ${result.claims.map((c) => money(c)).join(", ")}`,
      `Total claimed: ${money(result.totalClaims)}`,
      `Base policy pays: ${money(result.base.pays)}`,
      "",
      `TOP-UP (deductible per claim) pays: ${money(result.topUp.pays)} — out of pocket ${money(
        result.topUp.outOfPocket,
      )}`,
      `SUPER TOP-UP (deductible on the year's aggregate) pays: ${money(
        result.superTopUp.pays,
      )} — out of pocket ${money(result.superTopUp.outOfPocket)}`,
      `Difference in what the upper layer pays: ${money(result.payoutDifference)}`,
      "",
      ...result.rows.map(
        (r) =>
          `Claim ${r.index}: ${money(r.claim)} | base ${money(r.basePays)} | top-up ${money(
            r.topUp.pays,
          )} (you ${money(r.topUp.outOfPocket)}) | super top-up ${money(
            r.superTopUp.pays,
          )} (you ${money(r.superTopUp.outOfPocket)})`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Layers className="h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          Top-up vs Super Top-up Deductible Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Same rupee deductible, two bases of measurement. A <strong>top-up</strong> applies the
          deductible to <strong>each claim separately</strong>, so a claim smaller than the
          deductible pays nothing. A <strong>super top-up</strong> applies it to the{" "}
          <strong>aggregate of every claim in the policy year</strong>, so once the running total
          crosses the deductible, everything above it is payable however small the individual claims
          were. Enter a year of claims and watch both columns fill.
        </p>
      </header>

      <section className={CARD_CLASS} aria-label="Policy inputs">
        <h2 className="text-base font-semibold">The two policies</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="base-si">
              Base sum insured (Rs)
            </label>
            <input
              id="base-si"
              className={`mt-1 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={values.baseSumInsured}
              onChange={(e) => setField("baseSumInsured", e.target.value)}
            />
            <p className={HINT_CLASS}>
              Annual cover of the policy that pays first. Set 0 if there is no base policy.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="topup-si">
              Top-up / super top-up sum insured (Rs)
            </label>
            <input
              id="topup-si"
              className={`mt-1 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={values.topUpSumInsured}
              onChange={(e) => setField("topUpSumInsured", e.target.value)}
            />
            <p className={HINT_CLASS}>
              The upper layer&apos;s annual cover. The deductible does not reduce it.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="deductible">
              Deductible on the upper layer (Rs)
            </label>
            <input
              id="deductible"
              className={`mt-1 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={values.deductible}
              onChange={(e) => setField("deductible", e.target.value)}
            />
            <p className={HINT_CLASS}>
              One figure, applied two ways below. The commonest retail pairing sets it equal to the
              base sum insured.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-5 ${CARD_CLASS}`} aria-label="Claims in the policy year">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Claims in one policy year</h2>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={addClaim}
            disabled={values.claims.length >= MAX_CLAIMS}
            aria-label="Add another claim to the policy year"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add claim
          </button>
        </div>
        <p className={HINT_CLASS}>
          Enter the admissible amount of each hospitalisation, in the order it happened — after any
          copay, room rent cut, sub-limit or non-payable items.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {values.claims.map((claim, index) => (
            <li key={`claim-${index}`}>
              <label className={LABEL_CLASS} htmlFor={`claim-${index}`}>
                {`Claim ${index + 1} (Rs)`}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id={`claim-${index}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={claim}
                  onChange={(e) => setClaim(index, e.target.value)}
                />
                <button
                  type="button"
                  className={ICON_BTN}
                  onClick={() => removeClaim(index)}
                  disabled={values.claims.length <= 1}
                  aria-label={`Remove claim ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={copyResult}
          disabled={failed}
          aria-label="Copy the claim-by-claim comparison to the clipboard"
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
          className={GHOST_BTN}
          onClick={resetAll}
          aria-label="Reset all inputs to the default example"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {failed ? (
        <div
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : null}

      <section className={`mt-5 ${CARD_CLASS}`} aria-label="Result">
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">
          Difference in what the upper layer pays on these claims
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {failed ? DASH : money(result.payoutDifference)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {failed
            ? "Fix the input above to see the comparison."
            : `${note} Super top-up pays ${money(result.superTopUp.pays)}; top-up pays ${money(
                result.topUp.pays,
              )}.`}
        </p>

        <dl className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
          <Row label="Total claimed in the year" value={failed ? DASH : money(result.totalClaims)} />
          <Row label="Number of claims" value={failed ? DASH : String(result.claimCount)} />
          <Row label="Base policy pays" value={failed ? DASH : money(result.base.pays)} />
          <Row
            label="Base sum insured left"
            value={failed ? DASH : money(result.base.sumInsuredLeft)}
          />
          <Row label="Largest single claim" value={failed ? DASH : money(result.largestClaim)} />
          <Row
            label="Claims at or below the deductible"
            value={failed ? DASH : String(result.claimsUnderDeductible)}
          />
          <Row
            label="Aggregate deductible crossed on"
            value={
              failed
                ? DASH
                : result.crossingClaimIndex === null
                  ? "never crossed this year"
                  : `claim ${result.crossingClaimIndex}`
            }
          />
          <Row
            label="Rule basis"
            value={failed ? DASH : "per claim vs policy-year aggregate"}
          />
        </dl>

        {!failed && result.noSingleClaimClearsDeductible ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]"
              aria-hidden="true"
            />
            <span>
              No single claim exceeded the deductible of {money(result.deductible)}, so on a
              per-claim basis the upper layer is never reached and pays {money(result.topUp.pays)}
              {" "}for the whole year. On the aggregate basis the same claims total{" "}
              {money(result.totalClaims)} and {money(result.superTopUp.pays)} becomes payable.
            </span>
          </p>
        ) : null}
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <StructureCard
          title="Top-up"
          subtitle="Deductible applies to EACH claim separately"
          failed={failed}
          data={failed ? null : result.topUp}
          deductible={failed ? null : result.deductible}
          belowLabel="Claim value under the per-claim lines"
        />
        <StructureCard
          title="Super top-up"
          subtitle="Deductible applies to the POLICY-YEAR AGGREGATE"
          failed={failed}
          data={failed ? null : result.superTopUp}
          deductible={failed ? null : result.deductible}
          belowLabel="Claim value under the single aggregate line"
        />
      </div>

      <section className={`mt-5 ${CARD_CLASS}`} aria-label="Claim by claim waterfall">
        <h2 className="text-base font-semibold">Claim by claim</h2>
        <p className={HINT_CLASS}>
          The base policy pays first under both structures, so that column is identical; only the
          upper layer moves.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              What each layer pays on every claim under a per-claim deductible and a policy-year
              aggregate deductible
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  #
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Claim
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Year to date
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Base pays
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Top-up pays
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  You pay (top-up)
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Super top-up pays
                </th>
                <th scope="col" className="py-2 font-semibold">
                  You pay (super)
                </th>
              </tr>
            </thead>
            <tbody>
              {failed ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={8}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.index}</td>
                    <td className="py-2 pr-3 font-medium">{money(row.claim)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {money(row.cumulativeAfter)}
                    </td>
                    <td className="py-2 pr-3">{money(row.basePays)}</td>
                    <td className="py-2 pr-3">{money(row.topUp.pays)}</td>
                    <td
                      className={`py-2 pr-3 ${
                        row.topUp.outOfPocket > 0
                          ? "font-semibold text-[var(--danger)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {money(row.topUp.outOfPocket)}
                    </td>
                    <td className="py-2 pr-3">{money(row.superTopUp.pays)}</td>
                    <td
                      className={`py-2 ${
                        row.superTopUp.outOfPocket > 0
                          ? "font-semibold text-[var(--danger)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {money(row.superTopUp.outOfPocket)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border)] font-semibold">
                <td className="py-2 pr-3">All</td>
                <td className="py-2 pr-3">{failed ? DASH : money(result.totalClaims)}</td>
                <td className="py-2 pr-3">{DASH}</td>
                <td className="py-2 pr-3">{failed ? DASH : money(result.base.pays)}</td>
                <td className="py-2 pr-3">{failed ? DASH : money(result.topUp.pays)}</td>
                <td className="py-2 pr-3">{failed ? DASH : money(result.topUp.outOfPocket)}</td>
                <td className="py-2 pr-3">{failed ? DASH : money(result.superTopUp.pays)}</td>
                <td className="py-2">{failed ? DASH : money(result.superTopUp.outOfPocket)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          Which rule this uses
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{RULE_SOURCE}</p>
        <p className={HINT_CLASS}>
          Definition read on {RULE_AS_OF}. The base policy is modelled as paying first, and claims
          count toward an aggregate deductible whether the base policy met them or you did — the
          standard aggregate wording. Sums insured are annual and deplete across the year. Copays,
          room rent caps, proportionate deductions, disease sub-limits, waiting periods, non-payable
          items and any restore or refill benefit are outside this calculation, so enter each claim
          as the admissible amount after them. This page computes what the two deductible bases do
          to the numbers you type; the operative text is your own policy schedule and wording.
        </p>
      </section>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0 sm:border-0 sm:pb-0">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function StructureCard({ title, subtitle, failed, data, deductible, belowLabel }) {
  return (
    <section className={CARD_CLASS} aria-label={title}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
        {subtitle}
      </p>
      <p className="mt-3 text-xs font-semibold text-[var(--muted-foreground)]">
        Out of pocket for the year
      </p>
      <p className="text-3xl font-bold tracking-tight">
        {failed || !data ? DASH : money(data.outOfPocket)}
      </p>
      <dl className="mt-3 grid gap-2 border-t border-[var(--border)] pt-3 text-sm">
        <Row label="Upper layer pays" value={failed || !data ? DASH : money(data.pays)} />
        <Row
          label="Share of claims it covered"
          value={failed || !data ? DASH : percent(data.coveredPercent)}
        />
        <Row label={belowLabel} value={failed || !data ? DASH : money(data.belowDeductible)} />
        <Row
          label="Deductible applied"
          value={failed || !data ? DASH : `${money(deductible)} ${data.basis}`}
        />
        <Row
          label="Layer sum insured left"
          value={failed || !data ? DASH : money(data.sumInsuredLeft)}
        />
      </dl>
    </section>
  );
}
