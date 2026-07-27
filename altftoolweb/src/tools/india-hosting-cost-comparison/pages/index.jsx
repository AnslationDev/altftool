"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Server } from "lucide-react";

import {
  DEFAULT_WORKLOAD,
  GST_RATE_PCT,
  HOURS_PER_MONTH,
  PROVIDER_DEFAULTS,
  TCO_YEARS,
  compareHosting,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const money = (value) => INR.format(value);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const seedWorkload = () => ({
  vcpu: String(DEFAULT_WORKLOAD.vcpu),
  ramGb: String(DEFAULT_WORKLOAD.ramGb),
  storageGb: String(DEFAULT_WORKLOAD.storageGb),
  egressGb: String(DEFAULT_WORKLOAD.egressGb),
  hoursPerMonth: String(DEFAULT_WORKLOAD.hoursPerMonth),
});

const seedProviders = () =>
  PROVIDER_DEFAULTS.map((provider) => ({ ...provider, enabled: true }));

const RATE_FIELDS = [
  { key: "flatMonthly", label: "Flat monthly plan", models: ["flat"] },
  { key: "hourlyRate", label: "Hourly compute rate", models: ["hourly"] },
  { key: "storagePerGbMonth", label: "Storage per GB-month", models: ["flat", "hourly"] },
  { key: "includedStorageGb", label: "Included storage (GB)", models: ["flat", "hourly"] },
  { key: "freeEgressGb", label: "Free egress (GB)", models: ["flat", "hourly"] },
  { key: "egressPerGb", label: "Egress per extra GB", models: ["flat", "hourly"] },
  { key: "backupMonthly", label: "Backup per month", models: ["flat", "hourly"] },
  { key: "managementMonthly", label: "Management per month", models: ["flat", "hourly"] },
  { key: "commitmentDiscountPct", label: "Commitment discount (%)", models: ["flat", "hourly"] },
];

export default function ToolHome() {
  const [workload, setWorkload] = useState(seedWorkload);
  const [providers, setProviders] = useState(seedProviders);
  const [usdToInr, setUsdToInr] = useState("85");
  const [copied, setCopied] = useState(false);

  const numericWorkload = useMemo(
    () => ({
      vcpu: toNumber(workload.vcpu),
      ramGb: toNumber(workload.ramGb),
      storageGb: toNumber(workload.storageGb),
      egressGb: toNumber(workload.egressGb),
      hoursPerMonth: toNumber(workload.hoursPerMonth),
    }),
    [workload],
  );

  const comparison = useMemo(
    () =>
      compareHosting({
        providers: providers.filter((provider) => provider.enabled),
        workload: numericWorkload,
        usdToInr: toNumber(usdToInr),
      }),
    [providers, numericWorkload, usdToInr],
  );

  const hasError = Boolean(comparison.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "India hosting cost comparison",
      `Workload: ${workload.vcpu} vCPU / ${workload.ramGb} GB RAM / ${workload.storageGb} GB storage / ${workload.egressGb} GB egress`,
      `Running hours per month: ${workload.hoursPerMonth} of ${HOURS_PER_MONTH}`,
      "",
      ...comparison.results.map(
        (row) =>
          `${row.name}: ${money(row.total)}/month incl GST · ${money(row.annual)}/year · ${TCO_YEARS}-year ${money(row.tco)}`,
      ),
      "",
      `Cheapest: ${comparison.cheapest.name}, ${NUM.format(comparison.savingsPct)}% below the dearest option.`,
      comparison.breakEven !== null
        ? `The top two swap places at about ${NUM.format(comparison.breakEven)} GB of monthly egress.`
        : "The top two options do not cross at any realistic egress volume.",
    ].join("\n");
  }, [hasError, comparison, workload]);

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
    setWorkload(seedWorkload());
    setProviders(seedProviders());
    setUsdToInr("85");
    setCopied(false);
  };

  const updateProvider = (id, key, value) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === id ? { ...provider, [key]: toNumber(value) } : provider,
      ),
    );
  };

  const toggleProvider = (id) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === id ? { ...provider, enabled: !provider.enabled } : provider,
      ),
    );
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Server className="h-4 w-4" aria-hidden="true" />
          Infrastructure cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          India Hosting Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price one workload three ways — a self-managed VPS, hourly cloud compute and managed hosting
          — in rupees, with the {HOURS_PER_MONTH}-hour billing month, egress above the free allowance,
          and {GST_RATE_PCT}% GST all accounted for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">The workload</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-vcpu">
              vCPU
            </label>
            <input
              id="hc-vcpu"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={workload.vcpu}
              onChange={(event) => setWorkload((prev) => ({ ...prev, vcpu: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-ram">
              RAM (GB)
            </label>
            <input
              id="hc-ram"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={workload.ramGb}
              onChange={(event) => setWorkload((prev) => ({ ...prev, ramGb: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-storage">
              Storage (GB)
            </label>
            <input
              id="hc-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={workload.storageGb}
              onChange={(event) => setWorkload((prev) => ({ ...prev, storageGb: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-egress">
              Monthly outbound transfer (GB)
            </label>
            <input
              id="hc-egress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={workload.egressGb}
              onChange={(event) => setWorkload((prev) => ({ ...prev, egressGb: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-hours">
              Running hours per month (max {HOURS_PER_MONTH})
            </label>
            <input
              id="hc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={HOURS_PER_MONTH}
              step="1"
              value={workload.hoursPerMonth}
              onChange={(event) =>
                setWorkload((prev) => ({ ...prev, hoursPerMonth: event.target.value }))
              }
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-fx">
              USD to INR rate for USD-priced plans
            </label>
            <input
              id="hc-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={usdToInr}
              onChange={(event) => setUsdToInr(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {comparison.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheapest per month, incl GST
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(comparison.cheapest.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare."
                : `${comparison.cheapest.name} · ${NUM.format(comparison.savingsPct)}% below the dearest`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the hosting cost comparison"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy comparison"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cheapest per year", hasError ? DASH : money(comparison.cheapest.annual)],
            [`Cheapest over ${TCO_YEARS} years`, hasError ? DASH : money(comparison.cheapest.tco)],
            ["Cost per vCPU per month", hasError ? DASH : money(comparison.cheapest.perVcpu)],
            ["Monthly gap to the dearest option", hasError ? DASH : money(comparison.spread)],
            ["Same gap over a year", hasError ? DASH : money(comparison.annualSpread)],
            [
              "Top two swap places at",
              hasError
                ? DASH
                : comparison.breakEven !== null
                  ? `${NUM.format(comparison.breakEven)} GB egress / month`
                  : "no realistic crossover",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Option</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Compute</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Storage</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Egress</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Add-ons</th>
                  <th scope="col" className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {comparison.results.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{money(row.computeInr)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.storageInr)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.egressInr)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.addOnsInr)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Compute, storage, egress and add-ons are shown before GST; the total includes it.
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rate cards (replace with your quotes)</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          The seeded numbers only show the shape of each pricing model. Put your real plan price,
          transfer allowance and per-GB rate in before you trust the ranking.
        </p>
        <div className="mt-4 space-y-4">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-lg border border-[var(--border)] p-3">
              <label
                className="flex min-h-11 items-center gap-3 text-sm font-semibold"
                htmlFor={`p-${provider.id}`}
              >
                <input
                  id={`p-${provider.id}`}
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={() => toggleProvider(provider.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                {provider.name}
                <span className="text-xs font-normal text-[var(--muted-foreground)]">
                  priced in {provider.currency}
                </span>
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {RATE_FIELDS.filter((field) => field.models.includes(provider.model)).map((field) => (
                  <div key={field.key}>
                    <label className={SMALL_LABEL} htmlFor={`f-${provider.id}-${field.key}`}>
                      {field.label}
                    </label>
                    <input
                      id={`f-${provider.id}-${field.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={provider[field.key]}
                      onChange={(event) => updateProvider(provider.id, field.key, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A self-managed VPS is cheap on the invoice and expensive in engineer hours — patching, backups,
        monitoring and the 2 a.m. reboot are not in these numbers. Price your own time in before
        treating the cheapest row as the right answer.
      </p>
    </main>
  );
}
