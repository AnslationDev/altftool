"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DOCUMENT_TYPES, STATUS_LABELS, buildExpiryBoard } from "../lib";

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
  if (!iso) return DASH;
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
  if (status === "expired" || status === "urgent") {
    return "bg-[var(--danger-soft)] text-[var(--danger)]";
  }
  if (status === "windowOpen") return "bg-[var(--muted)] text-[var(--foreground)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
};

const makeRow = (seed, overrides = {}) => {
  const type =
    DOCUMENT_TYPES.find((item) => item.id === (overrides.typeId ?? "other")) ?? DOCUMENT_TYPES[0];
  return {
    id: `doc-${seed}`,
    name: type.label,
    typeId: type.id,
    reference: "",
    expiryDate: isoOffsetDays(180),
    stages: type.stages,
    ...overrides,
  };
};

const initialRows = () => [
  makeRow(1, {
    typeId: "passport",
    name: "Passport",
    reference: "Z1234567",
    expiryDate: isoOffsetDays(333),
  }),
  makeRow(2, {
    typeId: "drivingLicence",
    name: "Driving licence",
    reference: "DL-14-2019-0012345",
    expiryDate: isoOffsetDays(19),
  }),
  makeRow(3, {
    typeId: "puc",
    name: "PUC certificate",
    reference: "PUC-99812",
    expiryDate: isoOffsetDays(-22),
  }),
];

export default function ToolHome() {
  const [rows, setRows] = useState(initialRows);
  const [nextSeed, setNextSeed] = useState(4);
  const [today, setToday] = useState(todayIso);
  const [travelDate, setTravelDate] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildExpiryBoard({ documents: rows, today, travelDate }),
    [rows, today, travelDate],
  );

  const updateRow = (id, patch) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const changeType = (id, typeId) => {
    const type = DOCUMENT_TYPES.find((item) => item.id === typeId);
    if (!type) return;
    updateRow(id, { typeId, name: type.label, stages: type.stages });
  };

  const updateStages = (id, value) => {
    const stages = value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((part) => Number.isFinite(part));
    updateRow(id, { stages: stages.length > 0 ? stages : [30] });
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow(nextSeed)]);
    setNextSeed((seed) => seed + 1);
  };

  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Document expiry board — as at ${result.today}`,
      `${result.total} documents · ${result.expiredCount} expired · ${result.within90} expiring within 90 days`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.expiryDate}  ${STATUS_LABELS[row.status]}  ${row.name}${row.reference ? ` (${row.reference})` : ""} — reminders on ${row.ladder.map((stage) => stage.date).join(", ")}`,
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
    setTravelDate("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Expiry board
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Document Expiry Reminder Board
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every passport, licence, certificate and warranty on one board — each with a reminder
          ladder rather than a single date, plus the day its renewal window actually opens.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="doc-today">
              Today&apos;s date
            </label>
            <input
              id="doc-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doc-travel">
              Planned travel date (optional)
            </label>
            <input
              id="doc-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={travelDate}
              onChange={(event) => setTravelDate(event.target.value)}
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
                <h2 className="text-sm font-semibold">Document {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove document ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-type`}>
                    Document type
                  </label>
                  <select
                    id={`${row.id}-type`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.typeId}
                    onChange={(event) => changeType(row.id, event.target.value)}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-name`}>
                    Name on the board
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
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-ref`}>
                    Reference number
                  </label>
                  <input
                    id={`${row.id}-ref`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.reference}
                    onChange={(event) => updateRow(row.id, { reference: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-expiry`}>
                    Expires on
                  </label>
                  <input
                    id={`${row.id}-expiry`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.expiryDate}
                    onChange={(event) => updateRow(row.id, { expiryDate: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`${row.id}-stages`}>
                    Remind me this many days before (comma separated)
                  </label>
                  <input
                    id={`${row.id}-stages`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    inputMode="numeric"
                    value={row.stages.join(", ")}
                    onChange={(event) => updateStages(row.id, event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a document
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
              Next reminder
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Documents tracked", "Already expired", "Expiring within 90 days"].map((item) => (
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
                  Next reminder
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.nextReminder ? prettyDate(result.nextReminder.date) : "None left"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.nextReminder
                    ? `${result.nextReminder.name} — ${result.nextReminder.stage} days before expiry, in ${result.nextReminder.daysAway} days`
                    : "Every reminder on this board is already in the past"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the expiry board"
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
                ["Documents tracked", String(result.total)],
                ["Already expired", String(result.expiredCount)],
                ["Inside the final reminder stage", String(result.urgentCount)],
                ["Expiring within 90 days", String(result.within90)],
                [
                  "Next expiry",
                  result.nextExpiry
                    ? `${result.nextExpiry.name} on ${prettyDate(result.nextExpiry.expiryDate)}`
                    : "Everything on the board has expired",
                ],
                [
                  "Travel validity problems",
                  result.travelDate
                    ? result.travelWarnings.length > 0
                      ? `${result.travelWarnings.length} document(s)`
                      : "None for that travel date"
                    : "No travel date entered",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.travelWarnings.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Before you travel</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                {result.travelWarnings.map((row) => (
                  <li key={`${row.id}-travel`} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--danger)]">
                      !
                    </span>
                    <span>
                      <span className="font-semibold text-[var(--foreground)]">{row.name}:</span>{" "}
                      {row.travelWarning}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">The board</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Document
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Expires
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Reminders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{row.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {[row.typeLabel, row.reference].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {prettyDate(row.expiryDate)}
                        <span className="mt-1 block">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                          >
                            {STATUS_LABELS[row.status]}
                            {row.daysLeft >= 0
                              ? ` · ${row.daysLeft}d`
                              : ` · ${Math.abs(row.daysLeft)}d ago`}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5">
                        <ul className="space-y-0.5 text-xs">
                          {row.ladder.map((stage) => (
                            <li
                              key={stage.days}
                              className={
                                stage.passed
                                  ? "text-[var(--muted-foreground)] line-through"
                                  : "text-[var(--foreground)]"
                              }
                            >
                              {prettyDate(stage.date)} · {stage.days}d out
                            </li>
                          ))}
                        </ul>
                        {row.windowOpensDate ? (
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                            Window opens {prettyDate(row.windowOpensDate)}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Renewal rules worth knowing</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {result.rows.map((row) => (
                <li key={`${row.id}-rule`}>
                  <span className="font-semibold">{row.typeLabel}</span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{row.rule}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Renewal windows, fees and validity rules are set by
        the issuing authority and change — confirm before you rely on a date here. Everything is
        computed in your browser and nothing is stored.
      </p>
    </main>
  );
}
