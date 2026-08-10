"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Gift, Plus, RotateCcw, Trash2 } from "lucide-react";

import { RELATIONS, planFestivalBudget } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STARTER_GROUPS = [
  { id: 1, name: "Immediate family", recipients: "6", perRecipient: "3000", relation: "relative" },
  { id: 2, name: "Colleagues & friends", recipients: "10", perRecipient: "1500", relation: "non-relative" },
  { id: 3, name: "Household staff", recipients: "3", perRecipient: "5000", relation: "employee" },
];

const DEFAULTS = {
  food: "20000",
  travel: "25000",
  decor: "8000",
  clothing: "30000",
  puja: "5000",
  misc: "6000",
  contingency: "10",
  cap: "150000",
  income: "120000",
  months: "4",
  existing: "20000",
  returnPct: "0",
};

const blankGroup = (id) => ({ id, name: "", recipients: "", perRecipient: "", relation: "relative" });

export default function ToolHome() {
  const [groups, setGroups] = useState(STARTER_GROUPS);
  const [nextId, setNextId] = useState(STARTER_GROUPS.length + 1);
  const [food, setFood] = useState(DEFAULTS.food);
  const [travel, setTravel] = useState(DEFAULTS.travel);
  const [decor, setDecor] = useState(DEFAULTS.decor);
  const [clothing, setClothing] = useState(DEFAULTS.clothing);
  const [puja, setPuja] = useState(DEFAULTS.puja);
  const [misc, setMisc] = useState(DEFAULTS.misc);
  const [contingency, setContingency] = useState(DEFAULTS.contingency);
  const [cap, setCap] = useState(DEFAULTS.cap);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      planFestivalBudget({
        giftGroups: groups,
        food,
        travel,
        decor,
        clothing,
        puja,
        misc,
        contingencyPct: contingency,
        budgetCap: cap,
        monthlyIncome: income,
        monthsToFestival: months,
        existingSavings: existing,
        savingsReturn: returnPct,
      }),
    [groups, food, travel, decor, clothing, puja, misc, contingency, cap, income, months, existing, returnPct],
  );

  const hasError = Boolean(result.error);

  const updateGroup = (id, key, value) => {
    setGroups((current) => current.map((group) => (group.id === id ? { ...group, [key]: value } : group)));
  };

  const addGroup = () => {
    setGroups((current) => [...current, blankGroup(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeGroup = (id) => {
    setGroups((current) => current.filter((group) => group.id !== id));
  };

  const reset = () => {
    setGroups(STARTER_GROUPS);
    setNextId(STARTER_GROUPS.length + 1);
    setFood(DEFAULTS.food);
    setTravel(DEFAULTS.travel);
    setDecor(DEFAULTS.decor);
    setClothing(DEFAULTS.clothing);
    setPuja(DEFAULTS.puja);
    setMisc(DEFAULTS.misc);
    setContingency(DEFAULTS.contingency);
    setCap(DEFAULTS.cap);
    setIncome(DEFAULTS.income);
    setMonths(DEFAULTS.months);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
    setCopied(false);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Festival & Gifting Budget",
      `Gifts for ${result.giftRecipients} people: ${money(result.giftsTotal)}`,
      `Everything else: ${money(result.nonGiftTotal)}`,
      `Contingency: ${money(result.contingency)}`,
      `Total: ${money(result.total)}`,
      result.withinCap === null
        ? "No budget cap set."
        : result.withinCap
          ? `Within your ${money(result.budgetCap)} cap, with ${money(result.underCap)} to spare.`
          : `Over your ${money(result.budgetCap)} cap by ${money(result.overCap)}.`,
      result.incomeSharePct === null
        ? "Share of income: not calculated"
        : `That is ${num(result.incomeSharePct)}% of a month's take-home pay.`,
      result.fullyFunded
        ? "Already funded."
        : `Save ${money(result.monthlySaving)} a month for ${result.monthsToFestival} months.`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const spendFields = [
    { id: "fb-food", label: "Food, sweets & entertaining (₹)", value: food, set: setFood, step: "1000", min: "0" },
    { id: "fb-travel", label: "Travel (₹)", value: travel, set: setTravel, step: "1000", min: "0" },
    { id: "fb-decor", label: "Decor & lights (₹)", value: decor, set: setDecor, step: "500", min: "0" },
    { id: "fb-clothing", label: "Clothing (₹)", value: clothing, set: setClothing, step: "1000", min: "0" },
    { id: "fb-puja", label: "Puja & donations (₹)", value: puja, set: setPuja, step: "500", min: "0" },
    { id: "fb-misc", label: "Outings & extras (₹)", value: misc, set: setMisc, step: "500", min: "0" },
  ];

  const planFields = [
    { id: "fb-contingency", label: "Contingency buffer (%)", value: contingency, set: setContingency, step: "1", min: "0" },
    { id: "fb-cap", label: "Budget cap you set (₹)", value: cap, set: setCap, step: "5000", min: "0" },
    { id: "fb-income", label: "Monthly take-home pay (₹)", value: income, set: setIncome, step: "5000", min: "0" },
    { id: "fb-months", label: "Months until the festival", value: months, set: setMonths, step: "1", min: "1" },
    { id: "fb-existing", label: "Already saved (₹)", value: existing, set: setExisting, step: "5000", min: "0" },
    { id: "fb-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Gifts", DASH],
        ["Everything else", DASH],
        ["Contingency", DASH],
        ["Against your cap", DASH],
        ["Share of a month's pay", DASH],
        ["Save each month", DASH],
      ]
    : [
        ["Gifts", `${money(result.giftsTotal)} for ${result.giftRecipients} people`],
        ["Everything else", money(result.nonGiftTotal)],
        ["Contingency", money(result.contingency)],
        [
          "Against your cap",
          result.withinCap === null
            ? "No cap set"
            : result.withinCap
              ? `${money(result.underCap)} to spare (${num(result.capUsedPct)}% used)`
              : `Over by ${money(result.overCap)} (${num(result.capUsedPct)}% used)`,
        ],
        [
          "Share of a month's pay",
          result.incomeSharePct === null ? "Enter income to see this" : `${num(result.incomeSharePct)}%`,
        ],
        [
          "Save each month",
          result.fullyFunded
            ? "Already funded"
            : `${money(result.monthlySaving)} for ${result.monthsToFestival} months`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Festival season
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Festival and Gifting Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gift spending runs away because the number of people and the amount each are decided at
          different moments. Multiply them out here, add food, travel, decor and clothing, and see
          the total against a cap you set — plus a flag when a gift crosses the ₹50,000 tax
          threshold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Gift groups</h2>
        {groups.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No gift groups. Add one, or plan the rest of the festival below.
          </p>
        )}
        <ul className="mt-4 space-y-4">
          {groups.map((group, index) => (
            <li key={group.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`fb-name-${group.id}`}>
                    Who
                  </label>
                  <input
                    id={`fb-name-${group.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    placeholder={`Group ${index + 1}`}
                    value={group.name}
                    onChange={(event) => updateGroup(group.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fb-count-${group.id}`}>
                    How many people
                  </label>
                  <input
                    id={`fb-count-${group.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={group.recipients}
                    onChange={(event) => updateGroup(group.id, "recipients", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fb-each-${group.id}`}>
                    Spend on each (₹)
                  </label>
                  <input
                    id={`fb-each-${group.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="250"
                    value={group.perRecipient}
                    onChange={(event) => updateGroup(group.id, "perRecipient", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`fb-rel-${group.id}`}>
                    Relationship
                  </label>
                  <select
                    id={`fb-rel-${group.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    value={group.relation}
                    onChange={(event) => updateGroup(group.id, "relation", event.target.value)}
                  >
                    {RELATIONS.map((relation) => (
                      <option key={relation.id} value={relation.id}>
                        {relation.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  aria-label={`Remove ${group.name || `group ${index + 1}`}`}
                  className={GHOST_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addGroup} className={`mt-4 ${GHOST_BTN}`} aria-label="Add another gift group">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add gift group
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Everything else</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {spendFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cap and funding</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {planFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Festival budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the budget."
                : result.withinCap === null
                  ? "Set a cap to see how much room is left."
                  : result.withinCap
                    ? `Within your cap, ${money(result.underCap)} to spare`
                    : `Over your cap by ${money(result.overCap)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy festival budget"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the budget" className={PRIMARY_BTN}>
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

      {!hasError && result.flags.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth checking</h2>
          <ul className="mt-3 space-y-2">
            {result.flags.map((flag) => (
              <li
                key={flag}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {flag}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.categories.map((entry) => (
                  <tr key={entry.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(entry.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {num(entry.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.giftRows.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Gift group</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">People</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Each</th>
                    <th scope="col" className="py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.giftRows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.recipients}</td>
                      <td className="py-2 pr-3 text-right">{money(row.perRecipient)}</td>
                      <td className="py-2 text-right font-semibold">{money(row.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The ₹50,000 thresholds referenced here come from section 56(2)(x) of the Income-tax Act
        and Schedule I of the CGST Act. The definitions of &ldquo;relative&rdquo; and the treatment
        of specific gifts are detailed, and the rules change — this is informational only, not tax
        advice. Speak to a qualified professional about a large gift.
      </p>
    </main>
  );
}
