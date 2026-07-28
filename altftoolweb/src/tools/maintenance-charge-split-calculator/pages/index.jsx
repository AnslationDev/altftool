"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Split } from "lucide-react";

import {
  MAINTENANCE_HEADS,
  NON_OCCUPANCY_CAP_RATE,
  SPLIT_PRESETS,
  computeSplit,
  defaultRows,
  presetLandlordPct,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const freshRows = () =>
  defaultRows().map((row) => ({
    key: row.key,
    amount: String(row.amount),
    landlordPct: String(row.landlordPct),
  }));

export default function ToolHome() {
  const [rows, setRows] = useState(freshRows);
  const [months, setMonths] = useState("12");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSplit({
        rows: rows.map((row) => ({
          key: row.key,
          amount: toNumber(row.amount),
          landlordPct: toNumber(row.landlordPct),
        })),
        months: toNumber(months),
      }),
    [rows, months],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Maintenance Charge Split",
      `Total monthly maintenance: ${money(result.totalMonthly)}`,
      `Landlord pays: ${money(result.landlordMonthly)} (${pct(result.landlordSharePct)})`,
      `Tenant pays: ${money(result.tenantMonthly)} (${pct(result.tenantSharePct)})`,
      `Over ${result.months} months — landlord ${money(result.landlordPeriod)}, tenant ${money(result.tenantPeriod)}`,
      "",
      "Head by head:",
      ...result.rows.map(
        (row) =>
          `${row.label}: ${money(row.amount)} — landlord ${money(row.landlordAmount)} (${pct(row.landlordPct)}), tenant ${money(row.tenantAmount)}`,
      ),
    ];
    if (result.nonOccupancy.applicable) {
      lines.push(
        "",
        `Non-occupancy cap (10% of service charges): ${money(result.nonOccupancy.cap)}; charged ${money(result.nonOccupancy.charged)}${
          result.nonOccupancy.withinCap
            ? " — within cap"
            : ` — excess ${money(result.nonOccupancy.excess)}`
        }`,
      );
    }
    return lines.join("\n");
  }, [ok, result]);

  const setRowField = (key, field, value) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const applyPreset = (presetKey) => {
    setRows((current) =>
      current.map((row) => {
        const head = MAINTENANCE_HEADS.find((item) => item.key === row.key);
        return head ? { ...row, landlordPct: String(presetLandlordPct(presetKey, head)) } : row;
      }),
    );
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
    setRows(freshRows());
    setMonths("12");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Split className="h-4 w-4" aria-hidden="true" />
          Rental calculators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Maintenance Charge Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your society bill head by head, set who bears each head, and get the exact monthly
          and annual amounts for landlord and tenant — with the{" "}
          {Math.round(NON_OCCUPANCY_CAP_RATE * 100)}% non-occupancy cap checked for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Split preset</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SPLIT_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset.key)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mcs-months">
              Project over (months)
            </label>
            <input
              id="mcs-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Monthly bill, head by head</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Amount in rupees per month, and the percentage of that head the landlord bears.
        </p>
        <div className="mt-4 space-y-4">
          {rows.map((row) => {
            const head = MAINTENANCE_HEADS.find((item) => item.key === row.key);
            if (!head) return null;
            return (
              <div
                key={row.key}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{head.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{head.note}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`mcs-amt-${row.key}`}>
                      Amount / month
                    </label>
                    <input
                      id={`mcs-amt-${row.key}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="10"
                      value={row.amount}
                      onChange={(event) => setRowField(row.key, "amount", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`mcs-pct-${row.key}`}>
                      Landlord share (%)
                    </label>
                    <input
                      id={`mcs-pct-${row.key}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      step="5"
                      value={row.landlordPct}
                      onChange={(event) => setRowField(row.key, "landlordPct", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Tenant pays every month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.tenantMonthly) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${pct(result.tenantSharePct)} of a ${money(result.totalMonthly)} bill`
                : "Fix the input above to see the split"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the maintenance split summary"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every head to the default bye-law split"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total society bill (per month)", ok ? money(result.totalMonthly) : DASH],
            [
              "Landlord share (per month)",
              ok ? `${money(result.landlordMonthly)} (${pct(result.landlordSharePct)})` : DASH,
            ],
            [
              "Tenant share (per month)",
              ok ? `${money(result.tenantMonthly)} (${pct(result.tenantSharePct)})` : DASH,
            ],
            ["Landlord over the projection period", ok ? money(result.landlordPeriod) : DASH],
            ["Tenant over the projection period", ok ? money(result.tenantPeriod) : DASH],
            ["Combined over the projection period", ok ? money(result.totalPeriod) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Landlord bears ${pct(result.landlordSharePct)} and tenant bears ${pct(result.tenantSharePct)} of the bill`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.landlordSharePct))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.tenantSharePct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Landlord {pct(result.landlordSharePct)} · Tenant {pct(result.tenantSharePct)}
            </p>
          </div>
        ) : null}
      </section>

      {ok && result.nonOccupancy.applicable ? (
        <section
          className={`mt-6 rounded-xl p-5 ring-1 ${
            result.nonOccupancy.withinCap
              ? "bg-[var(--card)] ring-[var(--border)]"
              : "bg-[var(--danger-soft)] ring-[var(--danger)]"
          }`}
        >
          <h2 className="text-base font-semibold">Non-occupancy charge check</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Non-occupancy charges are capped at 10% of service charges, excluding municipal taxes.
            Your cap works out to{" "}
            <strong className="text-[var(--foreground)]">{money(result.nonOccupancy.cap)}</strong>{" "}
            and the society is charging{" "}
            <strong className="text-[var(--foreground)]">
              {money(result.nonOccupancy.charged)}
            </strong>
            .
          </p>
          {result.nonOccupancy.withinCap ? (
            <p className="mt-2 text-sm font-semibold text-[var(--success)]">Within the cap.</p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--danger)]">
              Over the cap by {money(result.nonOccupancy.excess)} per month.
            </p>
          )}
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Head-by-head breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Head
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Amount
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Landlord
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Tenant
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.landlordAmount)}
                    </td>
                    <td className="py-2 text-right">{money(row.tenantAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Who bears which head is ultimately decided by your registered leave and
        licence or rent agreement and by the bye-laws your society has adopted, which vary by state.
        Check the agreement, and take legal advice if a head is disputed.
      </p>
    </main>
  );
}
