"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { LICENCE_TYPES, STATUS_LABELS, buildRenewalBoard } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

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

const statusClass = (status) => {
  if (status === "expired" || status === "critical") {
    return "bg-[var(--danger-soft)] text-[var(--danger)]";
  }
  if (status === "renewNow") return "bg-[var(--muted)] text-[var(--foreground)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
};

const makeRow = (seed, overrides = {}) => {
  const type =
    LICENCE_TYPES.find((item) => item.id === (overrides.typeId ?? "municipalTrade")) ??
    LICENCE_TYPES[0];
  return {
    id: `licence-${seed}`,
    name: type.label,
    typeId: type.id,
    number: "",
    issueDate: "",
    expiryDate: "",
    validityMonths: type.validityMonths,
    leadDays: type.leadDays,
    authority: "",
    ...overrides,
  };
};

const initialRows = () => [
  makeRow(1, {
    typeId: "municipalTrade",
    name: "Municipal trade licence",
    number: "TL/2025/00918",
    expiryDate: isoOffsetDays(60),
    leadDays: 45,
  }),
  makeRow(2, {
    typeId: "fssai",
    name: "FSSAI licence",
    number: "12325009000123",
    expiryDate: isoOffsetDays(210),
    leadDays: 30,
  }),
  makeRow(3, {
    typeId: "fireNoc",
    name: "Fire safety NOC",
    number: "FS/NOC/4471",
    expiryDate: isoOffsetDays(-12),
    leadDays: 60,
  }),
];

export default function ToolHome() {
  const [rows, setRows] = useState(initialRows);
  const [nextSeed, setNextSeed] = useState(4);
  const [today, setToday] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildRenewalBoard({ licences: rows, today }), [rows, today]);

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const changeType = (id, typeId) => {
    const type = LICENCE_TYPES.find((item) => item.id === typeId);
    if (!type) return;
    updateRow(id, {
      typeId,
      name: type.label,
      leadDays: type.leadDays,
      validityMonths: type.validityMonths,
    });
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow(nextSeed, { expiryDate: isoOffsetDays(180) })]);
    setNextSeed((seed) => seed + 1);
  };

  const removeRow = (id) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Licence renewal board — as at ${result.today}`,
      `${result.total} licences, ${result.actionableCount} need attention`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.expiryDate}  ${STATUS_LABELS[row.status]}  ${row.name}${row.number ? ` (${row.number})` : ""} — start renewal by ${row.reminderDate}`,
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
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Licence register
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Trade Licence Renewal Reminder Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put every licence, its number and its expiry on one board. Each row gets the date you have
          to start the renewal, worked back from expiry by the lead time the rule expects.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lic-today">
              Today&apos;s date
            </label>
            <input
              id="lic-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
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
                <h2 className="text-sm font-semibold">Licence {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove licence ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-type`}>
                    Licence type
                  </label>
                  <select
                    id={`${row.id}-type`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.typeId}
                    onChange={(event) => changeType(row.id, event.target.value)}
                  >
                    {LICENCE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-name`}>
                    Name on your board
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
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-number`}>
                    Licence number
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
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-expiry`}>
                    Valid until
                  </label>
                  <input
                    id={`${row.id}-expiry`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.expiryDate}
                    onChange={(event) => updateRow(row.id, { expiryDate: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-issue`}>
                    Issued on (used if no expiry above)
                  </label>
                  <input
                    id={`${row.id}-issue`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.issueDate}
                    onChange={(event) => updateRow(row.id, { issueDate: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-validity`}>
                    Validity (months)
                  </label>
                  <input
                    id={`${row.id}-validity`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="240"
                    step="1"
                    value={row.validityMonths}
                    onChange={(event) =>
                      updateRow(row.id, { validityMonths: Number(event.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-lead`}>
                    Start renewal this many days early
                  </label>
                  <input
                    id={`${row.id}-lead`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="365"
                    step="1"
                    value={row.leadDays}
                    onChange={(event) => updateRow(row.id, { leadDays: Number(event.target.value) })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a licence
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
              Needs attention
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Licences tracked", "Expiring within 90 days", "Next expiry"].map((item) => (
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
                  Needs attention
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.actionableCount}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  of {result.total} licences are expired, critical or past their reminder date
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the renewal board"
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
                  aria-label="Reset the board"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Licences tracked", String(result.total)],
                ["Already expired", String(result.counts.expired)],
                ["Expiring within 15 days", String(result.counts.critical)],
                ["Past the reminder date", String(result.counts.renewNow)],
                ["Expiring within 90 days", String(result.within90)],
                [
                  "Next expiry",
                  result.nextRow
                    ? `${result.nextRow.name} on ${prettyDate(result.nextRow.expiryDate)}`
                    : "Everything on the board has expired",
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
            <h2 className="text-base font-semibold">Renewal board</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Licence
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Expires
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Start by
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{row.name}</span>
                        {row.number ? (
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {row.number}
                          </span>
                        ) : null}
                        {row.authority ? (
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {row.authority}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {prettyDate(row.expiryDate)}
                        <span className="mt-1 block">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                          >
                            {STATUS_LABELS[row.status]}
                            {row.daysToExpiry >= 0
                              ? ` · ${row.daysToExpiry}d`
                              : ` · ${Math.abs(row.daysToExpiry)}d ago`}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 whitespace-nowrap font-semibold">
                        {prettyDate(row.reminderDate)}
                        <span className="mt-0.5 block text-xs font-medium text-[var(--muted-foreground)]">
                          {row.leadDays} days lead
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What the rule says</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {result.rows.map((row) => (
                <li key={`${row.id}-note`}>
                  <span className="font-semibold">{row.typeLabel}</span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{row.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Licence validity and renewal windows are set by state
        and municipal rules that change often — always work from the dates printed on your own
        certificate. Nothing you type here leaves your browser.
      </p>
    </main>
  );
}
