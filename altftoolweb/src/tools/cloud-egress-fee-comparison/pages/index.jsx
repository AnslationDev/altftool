"use client";

import { useMemo, useState } from "react";
import { ArrowUpFromLine, Check, Copy, RotateCcw } from "lucide-react";

import { compareEgressCosts } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const USD4 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
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

const DEFAULTS = { monthlyGb: "5000" };
const DASH = "—";

const PRESETS = [
  { label: "500 GB", value: "500" },
  { label: "5 TB", value: "5120" },
  { label: "50 TB", value: "51200" },
  { label: "200 TB", value: "204800" },
];

export default function ToolHome() {
  const [monthlyGb, setMonthlyGb] = useState(DEFAULTS.monthlyGb);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareEgressCosts({
        monthlyGb: monthlyGb.trim() === "" ? Number.NaN : Number(monthlyGb),
      }),
    [monthlyGb],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Internet egress cost for ${NUM.format(result.monthlyGb)} GB/month (list prices)`,
      ...result.rows.map((row) => `${row.name}: ${money(row.cost)}`),
      `Spread between dearest and cheapest: ${money(result.spread)}`,
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
    setMonthlyGb(DEFAULTS.monthlyGb);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloud Egress Fee Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your monthly outbound traffic to the internet and see the bill on each major cloud
          and CDN, using each provider's published tiered list prices and free allowances — from
          AWS's $0.09/GB starting rate down to Cloudflare's $0 egress.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="egress-gb">
          Outbound traffic to the internet per month (GB)
        </label>
        <input
          id="egress-gb"
          className={`mt-2 ${INPUT_CLASS}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="100"
          value={monthlyGb}
          onChange={(event) => setMonthlyGb(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setMonthlyGb(preset.value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
              Dearest vs cheapest spread
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.spread)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.dearest.name} costs ${money(result.dearest.cost)} while ${result.cheapest.name} costs ${money(result.cheapest.cost)} for the same traffic.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the egress fee comparison"
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
              aria-label="Reset the traffic input to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Provider
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Free allowance
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Effective $/GB
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Monthly cost
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.rows).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {row.name}
                    {row.id === result.cheapest.id ? (
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                        cheapest
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {row.freeGb > 0 ? `${NUM.format(row.freeGb)} GB` : DASH}
                  </td>
                  <td className="py-2 pr-3 text-right">{USD4.format(row.effectivePerGb)}</td>
                  <td className="py-2 text-right font-semibold">{money(row.cost)}</td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison of published list prices for egress from primary US/EU regions.
        Regional uplifts, committed-use discounts, request fees and origin-fetch charges are not
        included, and providers change prices — always confirm on the provider's own pricing page.
      </p>
    </main>
  );
}
