"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, Plus, RotateCcw, Trash2 } from "lucide-react";
import { auditPasswordReuse, MAX_ROWS, MINUTES_PER_CHANGE, TIERS } from "../lib";

const DASH = "—";

const DEFAULT_ROWS = [
  { id: 1, label: "Personal email", tier: "keys", family: "the 2019 one" },
  { id: 2, label: "Main bank", tier: "money", family: "bank only" },
  { id: 3, label: "Work login", tier: "identity", family: "the 2019 one" },
  { id: 4, label: "Online shop", tier: "low", family: "shopping password" },
  { id: 5, label: "Streaming", tier: "low", family: "shopping password" },
  { id: 6, label: "Old forum", tier: "low", family: "the 2019 one" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(DEFAULT_ROWS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => auditPasswordReuse({ rows }), [rows]);
  const hasError = Boolean(result.error);

  const updateRow = (id, field, value) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
    setCopied(false);
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, { id: nextId, label: "", tier: "low", family: "" }]);
    setNextId(nextId + 1);
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((current) => current.filter((row) => row.id !== id));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Password reuse self audit",
      `Accounts: ${result.totalAccounts} across ${result.uniqueFamilies} password families`,
      `Exposure: ${result.exposurePercent}% of account value sits behind a shared password — ${result.bandLabel}`,
      `${result.accountsInReuse} of ${result.totalAccounts} accounts (${result.reusePercent}%) are in a reuse cluster`,
      result.keysReused
        ? "WARNING: your primary email or password manager shares a password with another account."
        : "Your primary email and password manager are not in a reuse cluster.",
      "",
      "Change in this order:",
    ];
    result.fixQueue.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.label} (${item.tierLabel}) — ${item.reason}`);
    });
    if (result.fixQueue.length === 0) lines.push("Nothing to change — no reuse found.");
    lines.push("", `Estimated time: about ${result.estimatedMinutes} minutes.`);
    return lines.join("\n");
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
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the sheet? This clears every row you've entered and restores the example data.")
    ) {
      return;
    }
    setRows(DEFAULT_ROWS);
    setNextId(DEFAULT_ROWS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Credential hygiene
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Password Reuse Self Audit Sheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Never type a password here. Give each shared password a nickname — &ldquo;the 2019
          one&rdquo;, &ldquo;work pattern&rdquo; — and the sheet groups your accounts into reuse
          clusters, weights them by what an attacker would reach, and tells you which one to break
          first. Everything stays in this browser tab.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your accounts</h2>
          <span className="text-xs text-[var(--muted-foreground)]">
            {rows.length} of {MAX_ROWS}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pr-label-${row.id}`}>
                    Account {index + 1}
                  </label>
                  <input
                    id={`pr-label-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    autoComplete="off"
                    placeholder="Personal email"
                    value={row.label}
                    onChange={(event) => updateRow(row.id, "label", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pr-family-${row.id}`}>
                    Password family nickname
                  </label>
                  <input
                    id={`pr-family-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    autoComplete="off"
                    placeholder="the 2019 one"
                    value={row.family}
                    onChange={(event) => updateRow(row.id, "family", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pr-tier-${row.id}`}>
                    What it protects
                  </label>
                  <select
                    id={`pr-tier-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.tier}
                    onChange={(event) => updateRow(row.id, "tier", event.target.value)}
                  >
                    {TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove account row ${index + 1}`}
                    className={`${GHOST_BTN} w-full`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            aria-label="Add another account row"
            className={PRIMARY_BTN}
            disabled={rows.length >= MAX_ROWS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add account
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset the sheet to its example rows"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Account value behind a shared password
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.exposurePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.bandLabel} — ${result.bandAdvice}`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the reuse audit and change order"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy audit"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            [
              "Accounts in a reuse cluster",
              hasError
                ? DASH
                : `${result.accountsInReuse} of ${result.totalAccounts} (${result.reusePercent}%)`,
            ],
            [
              "Distinct password families",
              hasError ? DASH : `${result.uniqueFamilies} for ${result.totalAccounts} accounts`,
            ],
            ["Reuse clusters found", hasError ? DASH : String(result.reusedClusterCount)],
            [
              "Largest cluster",
              hasError || !result.largestClusterName
                ? DASH
                : `"${result.largestClusterName}" — ${result.largestClusterSize} accounts`,
            ],
            [
              "Time to clear the queue",
              hasError ? DASH : `about ${result.estimatedMinutes} minutes`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.keysReused && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Your primary email or password manager shares a password with another account. Every
            other reset link is delivered there, so change that one before anything else.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Reuse clusters</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Family
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Accounts
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share of value
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.clusters.filter((cluster) => cluster.reused).map((cluster) => (
                  <tr key={cluster.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{cluster.name}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {cluster.members.map((member) => member.label).join(", ")}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{cluster.size}</td>
                    <td className="py-2 text-right font-semibold">{cluster.blastPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Change them in this order</h2>
          {result.fixQueue.length === 0 ? (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              No reuse found. Every family label appears exactly once.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {result.fixQueue.map((item, index) => (
                <li
                  key={`${item.label}-${item.family}-${index}`}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <p className="text-sm font-semibold">
                    {index + 1}. {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.tierLabel} · {item.reason}
                  </p>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Budget about {MINUTES_PER_CHANGE} minutes per account, including re-checking two-factor
            settings while you are in there.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How the tiers are weighted</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {TIERS.map((tier) => (
            <div key={tier.id} className="py-2.5">
              <dt className="font-semibold">
                {tier.label} · weight {tier.weight}
              </dt>
              <dd className="mt-0.5 text-[var(--muted-foreground)]">{tier.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This sheet never asks for and never stores a password — only nicknames you choose. Weights
        are a prioritisation aid, not a measure of likelihood. Informational only, not security
        advice for a specific organisation.
      </p>
    </main>
  );
}
