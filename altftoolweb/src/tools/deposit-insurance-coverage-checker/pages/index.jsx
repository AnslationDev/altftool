"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Umbrella } from "lucide-react";

import {
  CAPACITIES,
  DEPOSIT_TYPES,
  DICGC_LIMIT,
  INTERIM_PAYOUT_DAYS,
  checkDepositInsurance,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ACCOUNTS = [
  { id: 1, bank: "Bank A", capacity: "single", type: "Fixed deposit", balance: "800000" },
  { id: 2, bank: "Bank A", capacity: "joint-first", type: "Savings", balance: "400000" },
  { id: 3, bank: "Bank B", capacity: "single", type: "Savings", balance: "200000" },
];

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkDepositInsurance({
        accounts: accounts.map((row) => ({
          bank: row.bank,
          capacity: row.capacity,
          type: row.type,
          balance: toNumber(row.balance),
        })),
      }),
    [accounts],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Deposit Insurance Coverage Checker (DICGC)",
      `Cover: ${money(result.limit)} per depositor per bank, per capacity`,
      `Total balances: ${money(result.totalBalance)}`,
      `Insured: ${money(result.totalInsured)} (${pct(result.coveredPercent)})`,
      `Not insured: ${money(result.totalUninsured)}`,
      "",
    ];
    result.groups.forEach((group) => {
      lines.push(
        `${group.bank} — ${group.capacityLabel}: ${money(group.balance)} → insured ${money(group.insured)}${group.uninsured > 0 ? `, uninsured ${money(group.uninsured)}` : ""}`,
      );
    });
    return lines.join("\n");
  }, [hasError, result]);

  const updateAccount = (id, key, value) => {
    setAccounts((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const addAccount = () => {
    setAccounts((current) => [
      ...current,
      { id: nextId, bank: "", capacity: "single", type: DEPOSIT_TYPES[0], balance: "" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeAccount = (id) => {
    setAccounts((current) =>
      current.length > 1 ? current.filter((row) => row.id !== id) : current,
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
    setAccounts(DEFAULT_ACCOUNTS);
    setNextId(4);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Umbrella className="h-4 w-4" aria-hidden="true" />
          Deposit insurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Deposit Insurance Coverage Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          DICGC insures {money(DICGC_LIMIT)} per depositor per bank, counting principal and interest
          together. Accounts held in the same capacity at one bank are added up first — list yours
          and see exactly how much falls outside the cover.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your accounts</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Enter the balance including accrued interest. Savings, current, fixed and recurring
          accounts at the same bank in the same capacity share one limit.
        </p>

        <div className="mt-4 space-y-5">
          {accounts.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`di-bank-${row.id}`}>
                    Bank {index + 1}
                  </label>
                  <input
                    id={`di-bank-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={row.bank}
                    onChange={(event) => updateAccount(row.id, "bank", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`di-balance-${row.id}`}>
                    Balance including interest (INR)
                  </label>
                  <input
                    id={`di-balance-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={row.balance}
                    onChange={(event) => updateAccount(row.id, "balance", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`di-capacity-${row.id}`}>
                    Capacity in which it is held
                  </label>
                  <select
                    id={`di-capacity-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.capacity}
                    onChange={(event) => updateAccount(row.id, "capacity", event.target.value)}
                  >
                    {CAPACITIES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {CAPACITIES.find((item) => item.key === row.capacity)?.note}
                  </p>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`di-type-${row.id}`}>
                    Account type
                  </label>
                  <select
                    id={`di-type-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.type}
                    onChange={(event) => updateAccount(row.id, "type", event.target.value)}
                  >
                    {DEPOSIT_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAccount(row.id)}
                disabled={accounts.length === 1}
                aria-label={`Remove account ${index + 1}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addAccount} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add an account
        </button>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Not covered by deposit insurance
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.totalUninsured > 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--success)]"
              }`}
            >
              {show(result.totalUninsured)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : result.totalUninsured > 0
                  ? `${pct(result.coveredPercent)} of ${money(result.totalBalance)} is insured`
                  : `All ${money(result.totalBalance)} sits within the cover`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy deposit insurance coverage result"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${pct(result.coveredPercent)} of your balances are insured`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.coveredPercent))}%` }}
              />
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${Math.max(0, Math.min(100, 100 - result.coveredPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Insured {pct(result.coveredPercent)} · Uninsured {pct(100 - result.coveredPercent)}
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total balances entered", show(result.totalBalance)],
            ["Insured by DICGC", show(result.totalInsured)],
            ["Beyond the cover", show(result.totalUninsured)],
            [
              "Banks and capacities used",
              hasError
                ? DASH
                : `${result.bankCount} bank${result.bankCount === 1 ? "" : "s"}, ${result.capacityCount} capacit${result.capacityCount === 1 ? "y" : "ies"}`,
            ],
            ["Unused cover across your groups", show(result.totalHeadroom)],
            [
              "Groups over the limit",
              hasError ? DASH : `${result.exposedCount} of ${result.groupCount}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.totalUninsured > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Moving {money(result.totalUninsured)} would need about {result.extraBanksNeeded} more
            insured bank{result.extraBanksNeeded === 1 ? "" : "s"}, or the same money held in a
            genuinely different capacity — a joint account with the names in a different order, or
            an account held as guardian, karta or trustee.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cover group by group</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Bank
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Capacity
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Balance
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Insured
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Uninsured
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.groups.map((group) => (
                  <tr key={group.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{group.bank}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {group.capacityLabel}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(group.balance)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--success)]">
                      {money(group.insured)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        group.uninsured > 0 ? "text-[var(--danger)]" : ""
                      }`}
                    >
                      {group.uninsured > 0 ? money(group.uninsured) : "Nil"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            If a bank is placed under all-inclusive directions, the insured amount is paid within{" "}
            {INTERIM_PAYOUT_DAYS} days under the DICGC (Amendment) Act, 2021.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Deposits of central and state governments, inter-bank deposits, deposits
        of foreign governments and deposits received outside India are not insured, and primary
        co-operative societies are outside the scheme altogether. Whether two accounts are held in
        the same right is decided by DICGC on the facts — check with your bank if you are relying on
        a separate limit.
      </p>
    </main>
  );
}
