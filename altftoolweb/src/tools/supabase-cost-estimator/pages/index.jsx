"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import { COMPUTE_TIERS, FREE_QUOTAS, PRO_QUOTAS, estimateSupabaseCost } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US");

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  dbGb: "10",
  egressGb: "300",
  storageGb: "120",
  mau: "120000",
  invocations: "3000000",
  computeTierId: "micro",
};

const DASH = "—";

export default function ToolHome() {
  const [dbGb, setDbGb] = useState(DEFAULTS.dbGb);
  const [egressGb, setEgressGb] = useState(DEFAULTS.egressGb);
  const [storageGb, setStorageGb] = useState(DEFAULTS.storageGb);
  const [mau, setMau] = useState(DEFAULTS.mau);
  const [invocations, setInvocations] = useState(DEFAULTS.invocations);
  const [computeTierId, setComputeTierId] = useState(DEFAULTS.computeTierId);
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      estimateSupabaseCost({
        dbGb: asNumber(dbGb),
        egressGb: asNumber(egressGb),
        storageGb: asNumber(storageGb),
        mau: asNumber(mau),
        invocations: asNumber(invocations),
        computeTierId,
      }),
    [dbGb, egressGb, storageGb, mau, invocations, computeTierId],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Supabase monthly cost estimate (Pro plan)",
      `Database: ${dbGb} GB, egress: ${egressGb} GB, storage: ${storageGb} GB`,
      `MAU: ${mau}, edge invocations: ${invocations}`,
      `Compute: ${result.computeTier}`,
      `Base fee: ${money(result.proBase)}`,
      `Compute after $10 credit: ${money(result.computeAfterCredit)}`,
      `Usage overages: ${money(result.totalOverages)}`,
      `Estimated monthly total: ${money(result.proTotal)}`,
      result.fitsFree ? "Usage also fits inside the Free tier ($0)." : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, dbGb, egressGb, storageGb, mau, invocations]);

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
    setDbGb(DEFAULTS.dbGb);
    setEgressGb(DEFAULTS.egressGb);
    setStorageGb(DEFAULTS.storageGb);
    setMau(DEFAULTS.mau);
    setInvocations(DEFAULTS.invocations);
    setComputeTierId(DEFAULTS.computeTierId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Pro base fee", DASH],
        ["Compute after credit", DASH],
        ["Usage overages", DASH],
        ["Estimated yearly cost", DASH],
      ]
    : [
        ["Pro base fee", money(result.proBase)],
        [
          `Compute (${money(result.computeListPrice)} less ${money(result.computeCredit)} credit)`,
          money(result.computeAfterCredit),
        ],
        [`Database overage (beyond ${PRO_QUOTAS.dbGb} GB)`, money(result.dbOverage)],
        [`Egress overage (beyond ${PRO_QUOTAS.egressGb} GB)`, money(result.egressOverage)],
        [`Storage overage (beyond ${PRO_QUOTAS.storageGb} GB)`, money(result.storageOverage)],
        [`MAU overage (beyond ${NUM.format(PRO_QUOTAS.mau)})`, money(result.mauOverage)],
        [
          `Edge function overage (beyond ${NUM.format(PRO_QUOTAS.invocations)})`,
          money(result.invocationOverage),
        ],
        ["Estimated yearly cost", money(result.yearlyProTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Supabase Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your expected database size, egress, file storage, monthly active users and edge
          function volume to estimate a monthly Supabase Pro bill, including per-unit overage
          charges and the $10 compute credit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-db">
              Database size (GB)
            </label>
            <input
              id="sb-db"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={dbGb}
              onChange={(event) => setDbGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-egress">
              Egress / bandwidth per month (GB)
            </label>
            <input
              id="sb-egress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={egressGb}
              onChange={(event) => setEgressGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-storage">
              File storage (GB)
            </label>
            <input
              id="sb-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={storageGb}
              onChange={(event) => setStorageGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-mau">
              Monthly active auth users
            </label>
            <input
              id="sb-mau"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={mau}
              onChange={(event) => setMau(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-fn">
              Edge function invocations per month
            </label>
            <input
              id="sb-fn"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              value={invocations}
              onChange={(event) => setInvocations(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-compute">
              Compute instance
            </label>
            <select
              id="sb-compute"
              className={`mt-2 ${INPUT_CLASS}`}
              value={computeTierId}
              onChange={(event) => setComputeTierId(event.target.value)}
            >
              {COMPUTE_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label} — {money(tier.usd)}/mo
                </option>
              ))}
            </select>
          </div>
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
              Estimated Pro plan bill per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.proTotal)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.fitsFree
                  ? `This usage also fits inside the Free tier (${money(0)}/month) — you only need Pro for the extra headroom, backups and support.`
                  : "This usage exceeds at least one Free tier quota, so the Pro plan is required."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Supabase cost estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Included quotas at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Resource
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Free
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Pro (then metered)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Database size", `${FREE_QUOTAS.dbGb} GB`, `${PRO_QUOTAS.dbGb} GB`],
                ["Egress", `${FREE_QUOTAS.egressGb} GB`, `${PRO_QUOTAS.egressGb} GB`],
                ["File storage", `${FREE_QUOTAS.storageGb} GB`, `${PRO_QUOTAS.storageGb} GB`],
                ["Monthly active users", NUM.format(FREE_QUOTAS.mau), NUM.format(PRO_QUOTAS.mau)],
                [
                  "Edge invocations",
                  NUM.format(FREE_QUOTAS.invocations),
                  NUM.format(PRO_QUOTAS.invocations),
                ],
              ].map(([label, freeValue, proValue]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{freeValue}</td>
                  <td className="py-2 text-right font-semibold">{proValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate based on the published Supabase Free and Pro price list. Supabase adjusts prices
        and quotas over time and offers spend caps, so always confirm against the live pricing page
        and your project&apos;s usage dashboard before budgeting.
      </p>
    </main>
  );
}
