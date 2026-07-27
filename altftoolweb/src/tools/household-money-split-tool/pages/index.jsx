"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { EXPENSE_PRESETS, METHODS, fairestMethod, splitHousehold } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_LINES = [
  { id: 1, label: "Rent or home loan EMI", amount: "30000" },
  { id: 2, label: "Groceries", amount: "18000" },
  { id: 3, label: "Electricity and water", amount: "4500" },
  { id: 4, label: "Internet and mobile", amount: "2500" },
  { id: 5, label: "Househelp and maintenance", amount: "5000" },
];

const DEFAULTS = {
  nameA: "Partner A",
  nameB: "Partner B",
  incomeA: "90000",
  incomeB: "60000",
  obligationsA: "0",
  obligationsB: "0",
  method: "proportional",
};

export default function ToolHome() {
  const [nameA, setNameA] = useState(DEFAULTS.nameA);
  const [nameB, setNameB] = useState(DEFAULTS.nameB);
  const [incomeA, setIncomeA] = useState(DEFAULTS.incomeA);
  const [incomeB, setIncomeB] = useState(DEFAULTS.incomeB);
  const [obligationsA, setObligationsA] = useState(DEFAULTS.obligationsA);
  const [obligationsB, setObligationsB] = useState(DEFAULTS.obligationsB);
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [copied, setCopied] = useState(false);

  const split = useMemo(
    () =>
      splitHousehold({
        nameA: nameA.trim() || "Partner A",
        nameB: nameB.trim() || "Partner B",
        incomeA: toNumber(incomeA),
        incomeB: toNumber(incomeB),
        obligationsA: toNumber(obligationsA),
        obligationsB: toNumber(obligationsB),
        expenses: lines.map((line) => ({
          id: String(line.id),
          label: line.label,
          amount: toNumber(line.amount),
        })),
      }),
    [nameA, nameB, incomeA, incomeB, obligationsA, obligationsB, lines],
  );

  const hasError = Boolean(split.error);
  const active = hasError ? null : split.results[method];
  const fairest = hasError ? null : fairestMethod(split);

  const summary = useMemo(() => {
    if (hasError || !active) return "";
    const label = METHODS.find((m) => m.id === method)?.label ?? method;
    return [
      "Household Money Split",
      `Method: ${label}`,
      `Shared expenses: ${money(split.shared)} a month`,
      `${split.nameA} pays: ${money(active.contribA)} (${pct(active.shareA)} of the bills, ${pct(active.burdenA)} of their income)`,
      `${split.nameB} pays: ${money(active.contribB)} (${pct(active.shareB)} of the bills, ${pct(active.burdenB)} of their income)`,
      `${split.nameA} left with: ${money(active.leftoverA)}`,
      `${split.nameB} left with: ${money(active.leftoverB)}`,
    ].join("\n");
  }, [hasError, active, method, split]);

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
    setNameA(DEFAULTS.nameA);
    setNameB(DEFAULTS.nameB);
    setIncomeA(DEFAULTS.incomeA);
    setIncomeB(DEFAULTS.incomeB);
    setObligationsA(DEFAULTS.obligationsA);
    setObligationsB(DEFAULTS.obligationsB);
    setLines(DEFAULT_LINES);
    setMethod(DEFAULTS.method);
    setCopied(false);
  };

  const updateLine = (id, patch) =>
    setLines((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addLine = () =>
    setLines((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const used = new Set(rows.map((row) => row.label));
      const suggestion = EXPENSE_PRESETS.find((label) => !used.has(label)) ?? "Shared expense";
      return [...rows, { id: nextId, label: suggestion, amount: "0" }];
    });

  const removeLine = (id) => setLines((rows) => rows.filter((row) => row.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Couples finance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Two Income Household Money Split Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          When two people earn different amounts, splitting the bills down the middle is not the
          same as splitting them fairly. Compare an equal split, a split proportional to income, and
          the split that leaves both partners with the same spending money.
        </p>
      </header>

      <section className={CARD} aria-labelledby="hh-people">
        <h2 id="hh-people" className="text-base font-semibold">
          Who earns what, each month
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-name-a">
              First partner&apos;s name
            </label>
            <input
              id="hh-name-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={nameA}
              onChange={(event) => setNameA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-name-b">
              Second partner&apos;s name
            </label>
            <input
              id="hh-name-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={nameB}
              onChange={(event) => setNameB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-income-a">
              {nameA || "Partner A"} take-home pay (INR)
            </label>
            <input
              id="hh-income-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={incomeA}
              onChange={(event) => setIncomeA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-income-b">
              {nameB || "Partner B"} take-home pay (INR)
            </label>
            <input
              id="hh-income-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={incomeB}
              onChange={(event) => setIncomeB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-oblig-a">
              {nameA || "Partner A"} personal obligations (INR)
            </label>
            <input
              id="hh-oblig-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={obligationsA}
              onChange={(event) => setObligationsA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-oblig-b">
              {nameB || "Partner B"} personal obligations (INR)
            </label>
            <input
              id="hh-oblig-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={obligationsB}
              onChange={(event) => setObligationsB(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Personal obligations are commitments the other partner does not share — an education loan,
          money sent to parents, a pre-existing EMI. They are removed before the ratio is worked out.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="hh-expenses">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="hh-expenses" className="text-base font-semibold">
            Shared monthly expenses
          </h2>
          <button type="button" onClick={addLine} className={GHOST_BTN} aria-label="Add an expense row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add expense
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <li key={line.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hh-line-label-${line.id}`}>
                    Expense {index + 1}
                  </label>
                  <input
                    id={`hh-line-label-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={line.label}
                    onChange={(event) => updateLine(line.id, { label: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hh-line-amount-${line.id}`}>
                    Amount (INR)
                  </label>
                  <input
                    id={`hh-line-amount-${line.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="500"
                    value={line.amount}
                    onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeLine(line.id)}
                aria-label={`Remove expense ${index + 1}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 self-end rounded-md px-3 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="hh-method">
        <h2 id="hh-method" className="text-base font-semibold">
          Splitting method
        </h2>
        <div className="mt-4 grid gap-3">
          {METHODS.map((option) => (
            <label
              key={option.id}
              htmlFor={`hh-method-${option.id}`}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                method === option.id
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)]"
              }`}
            >
              <input
                id={`hh-method-${option.id}`}
                type="radio"
                name="hh-method"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={method === option.id}
                onChange={() => setMethod(option.id)}
              />
              <span>
                <span className="block text-sm font-semibold">
                  {option.label}
                  {fairest === option.id && (
                    <span className="ml-2 text-xs font-medium text-[var(--success)]">
                      smallest leftover gap
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  {option.blurb}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {split.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="hh-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="hh-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              {hasError ? "Contribution" : `${split.nameA} contributes`}
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(active.contribA)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the split."
                : `${split.nameB} contributes ${money(active.contribB)} · shared bills ${money(split.shared)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the household split result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Shared expenses a month", hasError ? DASH : money(split.shared)],
            [
              `${hasError ? "First partner" : split.nameA} share of the bills`,
              hasError ? DASH : `${money(active.contribA)} (${pct(active.shareA)})`,
            ],
            [
              `${hasError ? "Second partner" : split.nameB} share of the bills`,
              hasError ? DASH : `${money(active.contribB)} (${pct(active.shareB)})`,
            ],
            [
              `${hasError ? "First partner" : split.nameA} pays this much of their income`,
              hasError ? DASH : pct(active.burdenA),
            ],
            [
              `${hasError ? "Second partner" : split.nameB} pays this much of their income`,
              hasError ? DASH : pct(active.burdenB),
            ],
            [
              `${hasError ? "First partner" : split.nameA} left with`,
              hasError ? DASH : money(active.leftoverA),
            ],
            [
              `${hasError ? "Second partner" : split.nameB} left with`,
              hasError ? DASH : money(active.leftoverB),
            ],
            ["Gap in spending money", hasError ? DASH : money(active.leftoverGap)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && active.clamped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            The income gap is wider than the entire expense pot, so no split can leave both partners
            with the same spending money. One partner is already covering every shared bill.
          </p>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="hh-lines">
          <h2 id="hh-lines" className="text-base font-semibold">
            Bill by bill, proportional to income
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Useful when each bill is paid from one person&apos;s account and you want standing
            instructions rather than a monthly settle-up.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Expense
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Total
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {split.nameA}
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    {split.nameB}
                  </th>
                </tr>
              </thead>
              <tbody>
                {split.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{line.label}</td>
                    <td className="py-2 pr-3 text-right">{money(line.amount)}</td>
                    <td className="py-2 pr-3 text-right">{money(line.aPays)}</td>
                    <td className="py-2 text-right">{money(line.bPays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Income ratio: {split.nameA} {pct(split.incomeShareA)} · {split.nameB}{" "}
            {pct(split.incomeShareB)} of combined available income.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A calculation, not a verdict. Unpaid work, caregiving, career breaks and future earning
        potential all change what feels fair, and no formula settles that conversation for you.
      </p>
    </main>
  );
}
