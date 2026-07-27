"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Utensils } from "lucide-react";

import { splitMessBill } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_MEMBERS = [
  { id: 1, name: "Aman", days: "30" },
  { id: 2, name: "Ravi", days: "30" },
  { id: 3, name: "Neha", days: "15" },
];

export default function ToolHome() {
  const [totalBill, setTotalBill] = useState("9000");
  const [fixedCharges, setFixedCharges] = useState("1500");
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      splitMessBill({
        totalBill: totalBill.trim() === "" ? Number.NaN : Number(totalBill),
        fixedCharges: fixedCharges.trim() === "" ? 0 : Number(fixedCharges),
        members: members.map((m) => ({
          name: m.name,
          daysPresent: m.days.trim() === "" ? 0 : Number(m.days),
        })),
      }),
    [totalBill, fixedCharges, members],
  );

  const hasError = Boolean(result.error);

  const updateMember = (id, patch) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addMember = () => {
    setMembers((prev) => [...prev, { id: nextId, name: "", days: "" }]);
    setNextId((id) => id + 1);
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Mess bill split",
      `Total bill: ${money(Number(totalBill))}`,
      `Fixed part (equal split): ${money(result.fixedPerMember)} per head`,
      result.perDayRate === null
        ? "Variable part: none"
        : `Per-day food rate: ${money(result.perDayRate)}`,
      "",
    ];
    for (const share of result.shares) {
      lines.push(`- ${share.name} (${share.daysPresent} days): ${money(share.total)}`);
    }
    return lines.join("\n");
  }, [hasError, result, totalBill]);

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
    setTotalBill("9000");
    setFixedCharges("1500");
    setMembers(DEFAULT_MEMBERS);
    setNextId(4);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mess Bill Splitter for Students
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fixed costs (cook, gas, wifi) split equally; the food part splits by each person&apos;s
          days present — the same rebate logic hostel messes use. Shares always add up to the
          exact bill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mbs-total">
              Total bill for the period (INR)
            </label>
            <input
              id="mbs-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={totalBill}
              onChange={(event) => setTotalBill(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mbs-fixed">
              Fixed charges within the bill (INR)
            </label>
            <input
              id="mbs-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={fixedCharges}
              onChange={(event) => setFixedCharges(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Cook&apos;s salary, gas cylinder, wifi — costs that stay the same whether someone is
              home or not. Enter 0 to split the whole bill by days.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`mbs-name-${member.id}`}>
                  Roommate {index + 1}
                </label>
                <input
                  id={`mbs-name-${member.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder={`Member ${index + 1}`}
                  value={member.name}
                  onChange={(event) => updateMember(member.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`mbs-days-${member.id}`}>
                  Days present
                </label>
                <input
                  id={`mbs-days-${member.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="366"
                  step="1"
                  value={member.days}
                  onChange={(event) => updateMember(member.id, { days: event.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  aria-label={`Remove ${member.name || `member ${index + 1}`}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addMember} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add roommate
        </button>
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
              Per-day food rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.perDayRate === null ? DASH : money(result.perDayRate)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the split."
                : result.perDayRate === null
                  ? "The whole bill is fixed charges, split equally."
                  : `Variable ${money(result.variableTotal)} across ${result.totalDays} member-days.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the bill split result"
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Roommate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Days
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Fixed share
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Food share
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Pays
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.shares.map((share) => (
                  <tr key={share.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{share.name}</td>
                    <td className="py-2 pr-3 text-right">{share.daysPresent}</td>
                    <td className="py-2 pr-3 text-right">{money(share.fixedShare)}</td>
                    <td className="py-2 pr-3 text-right">{money(share.variableShare)}</td>
                    <td className="py-2 text-right font-semibold">{money(share.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!hasError ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Shares total {money(result.checkTotal)} — rounding is settled on the last member so the
            sum matches the bill exactly.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Agree upfront on what counts as fixed — the fairest fights are the ones you never have.
        Everything stays on this page; nothing is uploaded.
      </p>
    </main>
  );
}
