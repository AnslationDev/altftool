"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

import { LIFE_COVER_INCOME_MULTIPLE, PAYMENT_MODES, POLICY_TYPES, buildPortfolio } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const todayIso = () => new Date().toISOString().slice(0, 10);
const isoOffsetDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const prettyDate = (iso) => {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
};

const STATUS_LABELS = {
  lapsed: "Lapsed",
  inGrace: "In grace period",
  dueSoon: "Due soon",
  active: "Active",
};

const statusClass = (status) => {
  if (status === "lapsed" || status === "inGrace") {
    return "bg-[var(--danger-soft)] text-[var(--danger)]";
  }
  if (status === "dueSoon") return "bg-[var(--muted)] text-[var(--foreground)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
};

const makeRow = (seed, overrides = {}) => {
  const type =
    POLICY_TYPES.find((item) => item.id === (overrides.typeId ?? "term")) ?? POLICY_TYPES[0];
  return {
    id: `policy-${seed}`,
    name: type.label,
    typeId: type.id,
    insurer: "",
    number: "",
    sumInsured: 1000000,
    premium: 12000,
    modeId: "annual",
    renewalDate: isoOffsetDays(120),
    graceDays: type.defaultGrace,
    ...overrides,
  };
};

const initialRows = () => [
  makeRow(1, {
    typeId: "term",
    name: "Term life cover",
    number: "TL-000123",
    sumInsured: 5000000,
    premium: 2500,
    modeId: "monthly",
    renewalDate: isoOffsetDays(58),
  }),
  makeRow(2, {
    typeId: "healthFamily",
    name: "Family floater health",
    number: "HF-778812",
    sumInsured: 1000000,
    premium: 26000,
    modeId: "annual",
    renewalDate: isoOffsetDays(14),
  }),
  makeRow(3, {
    typeId: "motor",
    name: "Car insurance",
    number: "MOT-4590",
    sumInsured: 800000,
    premium: 14000,
    modeId: "annual",
    renewalDate: isoOffsetDays(-12),
    graceDays: 0,
  }),
];

export default function ToolHome() {
  const [rows, setRows] = useState(initialRows);
  const [nextSeed, setNextSeed] = useState(4);
  const [today, setToday] = useState(todayIso);
  const [annualIncome, setAnnualIncome] = useState("1200000");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildPortfolio({ policies: rows, today, annualIncome: Number(annualIncome) }),
    [rows, today, annualIncome],
  );

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const changeType = (id, typeId) => {
    const type = POLICY_TYPES.find((item) => item.id === typeId);
    if (!type) return;
    updateRow(id, { typeId, name: type.label, graceDays: type.defaultGrace });
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow(nextSeed)]);
    setNextSeed((seed) => seed + 1);
  };

  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Insurance renewal tracker — as at ${result.today}`,
      `Total annualised premium: ${money(result.totalAnnualPremium)}`,
      `Total sum insured: ${money(result.totalSumInsured)}`,
      `Life cover: ${money(result.lifeCover)} · Health cover: ${money(result.healthCover)}`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.renewalDate}  ${STATUS_LABELS[row.status]}  ${row.name}${row.number ? ` (${row.number})` : ""} — ${money(row.sumInsured)} cover, ${money(row.annualPremium)}/yr, grace to ${row.graceEndDate}`,
      ),
    ].join("\n");
  }, [result]);

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
    setRows(initialRows());
    setNextSeed(4);
    setToday(todayIso());
    setAnnualIncome("1200000");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Policy register
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Insurance Policy Renewal Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One place for every policy number, sum insured and renewal date — with premiums put on the
          same annual footing and the grace period dated so nothing lapses by accident.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ins-today">
              Today&apos;s date
            </label>
            <input
              id="ins-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ins-income">
              Annual income (for the cover benchmark)
            </label>
            <input
              id="ins-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10000"
              value={annualIncome}
              onChange={(event) => setAnnualIncome(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Policy {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove policy ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-type`}>
                    Policy type
                  </label>
                  <select
                    id={`${row.id}-type`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.typeId}
                    onChange={(event) => changeType(row.id, event.target.value)}
                  >
                    {POLICY_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-name`}>
                    Name on your tracker
                  </label>
                  <input
                    id={`${row.id}-name`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-insurer`}>
                    Insurer
                  </label>
                  <input
                    id={`${row.id}-insurer`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.insurer}
                    onChange={(event) => updateRow(row.id, { insurer: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-number`}>
                    Policy number
                  </label>
                  <input
                    id={`${row.id}-number`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.number}
                    onChange={(event) => updateRow(row.id, { number: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-sum`}>
                    Sum insured (INR)
                  </label>
                  <input
                    id={`${row.id}-sum`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="50000"
                    value={row.sumInsured}
                    onChange={(event) =>
                      updateRow(row.id, { sumInsured: Number(event.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-premium`}>
                    Premium per instalment (INR)
                  </label>
                  <input
                    id={`${row.id}-premium`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="500"
                    value={row.premium}
                    onChange={(event) => updateRow(row.id, { premium: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-mode`}>
                    Payment mode
                  </label>
                  <select
                    id={`${row.id}-mode`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.modeId}
                    onChange={(event) => updateRow(row.id, { modeId: event.target.value })}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-renewal`}>
                    Renewal date
                  </label>
                  <input
                    id={`${row.id}-renewal`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.renewalDate}
                    onChange={(event) => updateRow(row.id, { renewalDate: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-grace`}>
                    Grace period (days)
                  </label>
                  <input
                    id={`${row.id}-grace`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="90"
                    step="1"
                    value={row.graceDays}
                    onChange={(event) =>
                      updateRow(row.id, { graceDays: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a policy
        </button>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total annual premium
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Total sum insured", "Life cover", "Health cover", "Next renewal"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Total annual premium
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(result.totalAnnualPremium)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(result.monthlyPremium)} a month across {result.total} policies
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the policy tracker"
                  className={GHOST_BTN}
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
                  aria-label="Reset the tracker"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total sum insured", money(result.totalSumInsured)],
                ["Life cover in force", money(result.lifeCover)],
                ["Health cover in force", money(result.healthCover)],
                [
                  `Benchmark life cover (${LIFE_COVER_INCOME_MULTIPLE}x income)`,
                  result.recommendedLifeCover > 0
                    ? money(result.recommendedLifeCover)
                    : "Enter an income",
                ],
                [
                  "Life cover shortfall against the benchmark",
                  result.recommendedLifeCover > 0
                    ? result.lifeCoverGap > 0
                      ? money(result.lifeCoverGap)
                      : "None — at or above the benchmark"
                    : DASH,
                ],
                [
                  "Premium as a share of income",
                  result.premiumAsShareOfIncome === null
                    ? DASH
                    : `${NUM.format(result.premiumAsShareOfIncome)}%`,
                ],
                [
                  "Next renewal",
                  result.nextRenewal
                    ? `${result.nextRenewal.name} on ${prettyDate(result.nextRenewal.renewalDate)}`
                    : "Every policy is past its renewal date",
                ],
                [
                  "Lapsed / in grace / due within 30 days",
                  `${result.counts.lapsed} / ${result.counts.inGrace} / ${result.counts.dueSoon}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Policies by renewal date</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Policy
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Cover
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Renewal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{row.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {[row.insurer, row.number, `${money(row.annualPremium)}/yr`]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold whitespace-nowrap">
                        {money(row.sumInsured)}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        {prettyDate(row.renewalDate)}
                        <span className="mt-1 block">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                          >
                            {STATUS_LABELS[row.status]}
                            {row.daysToRenewal >= 0
                              ? ` · ${row.daysToRenewal}d`
                              : ` · ${Math.abs(row.daysToRenewal)}d ago`}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                          {row.graceDays > 0
                            ? `Grace to ${prettyDate(row.graceEndDate)}`
                            : "No grace period"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Dates worth diarising</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {result.rows.map((row) => (
                <li key={`${row.id}-note`}>
                  <span className="font-semibold">{row.name}</span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{row.note}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    Any portability or insurer switch has to be started by{" "}
                    {prettyDate(row.portabilityCutoff)}
                    {row.ncbDeadline
                      ? ` · no-claim bonus is normally protected only until ${prettyDate(row.ncbDeadline)}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is not insurance or financial advice, and the ten-times-income
        life cover figure is a rule of thumb rather than a calculation of your actual need. Grace
        periods and no-claim bonus rules come from your own policy wording. Nothing you type here
        leaves your browser.
      </p>
    </main>
  );
}
