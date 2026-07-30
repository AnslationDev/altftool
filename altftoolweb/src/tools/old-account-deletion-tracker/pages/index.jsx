"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { MAX_ACCOUNTS, REGIMES, SENSITIVITIES, STATUSES, buildTracker } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ACCOUNTS = [
  {
    id: "a1",
    service: "Old shopping account",
    regime: "gdpr",
    sensitivity: "medium",
    status: "requested",
    requestedOn: "2026-05-02",
    proof: "",
  },
  {
    id: "a2",
    service: "Dating app from 2019",
    regime: "gdpr",
    sensitivity: "high",
    status: "not-requested",
    requestedOn: "",
    proof: "",
  },
  {
    id: "a3",
    service: "Food delivery app",
    regime: "dpdp",
    sensitivity: "medium",
    status: "deleted",
    requestedOn: "2026-03-11",
    proof: "TICKET-48210",
  },
];

const STATE_LABEL = {
  overdue: "Overdue",
  escalate: "Escalate",
  "to-send": "Send request",
  unverified: "Needs proof",
  waiting: "Waiting",
  closed: "Closed",
};

function stateClass(state) {
  if (state === "overdue" || state === "escalate") return "bg-[var(--danger-soft)] text-[var(--danger)]";
  if (state === "closed") return "bg-[var(--muted)] text-[var(--foreground)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
}

export default function ToolHome() {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [today, setToday] = useState("");
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setToday(local.toISOString().slice(0, 10));
  }, []);

  // Until the browser reports the date, assess against the newest request date so the
  // tracker still shows a real result rather than blanks.
  const effectiveToday = useMemo(() => {
    if (today) return today;
    return accounts.reduce(
      (latest, row) => (row.requestedOn && row.requestedOn > latest ? row.requestedOn : latest),
      "1970-01-01",
    );
  }, [today, accounts]);

  const result = useMemo(
    () => buildTracker({ accounts, today: effectiveToday }),
    [accounts, effectiveToday],
  );
  const ok = !result.error;

  const updateRow = (id, patch) => {
    setAccounts((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const addRow = () => {
    if (accounts.length >= MAX_ACCOUNTS) return;
    setAccounts((current) => [
      ...current,
      {
        id: `a${nextId}`,
        service: "New account",
        regime: "gdpr",
        sensitivity: "medium",
        status: "not-requested",
        requestedOn: "",
        proof: "",
      },
    ]);
    setNextId((value) => value + 1);
    setCopied(false);
  };

  const removeRow = (id) => {
    setAccounts((current) => current.filter((row) => row.id !== id));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Old Account Deletion Tracker",
      `Assessed on ${effectiveToday}`,
      `Accounts tracked: ${result.total}`,
      `Confirmed deleted with proof: ${result.closed} (${Math.round(result.percentComplete)}%)`,
      `Overdue: ${result.overdue} · Escalate: ${result.escalate} · Requests to send: ${result.toSend} · Waiting: ${result.waiting} · Missing proof: ${result.unverified}`,
      "",
      "Action queue:",
      ...result.actionQueue.map((row) => `- ${row.service}: ${row.nextAction}`),
      "",
      "Full list:",
      ...result.rows.map(
        (row) =>
          `- ${row.service} | ${row.statusLabel} | requested ${row.requestedOn ?? "not sent"} | due ${row.dueOn ?? "n/a"} | proof ${row.proof || "none"}`,
      ),
    ].join("\n");
  }, [ok, result, effectiveToday]);

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
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Data removal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Old Account Deletion Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the dormant accounts you want closed, record when you asked, and this works out the
          reply deadline under the law that applies, flags what is overdue, and refuses to count a
          row as done until you have a confirmation reference.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:w-56">
            <label className={LABEL_CLASS} htmlFor="trk-today">
              Today&apos;s date
            </label>
            <input
              id="trk-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => {
                setToday(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <button type="button" onClick={addRow} className={PRIMARY_BTN} aria-label="Add an account row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add account
          </button>
        </div>

        <ul className="mt-5 space-y-4">
          {accounts.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`svc-${row.id}`}>
                    Service {index + 1}
                  </label>
                  <input
                    id={`svc-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.service}
                    onChange={(event) => updateRow(row.id, { service: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`reg-${row.id}`}>
                    Law that applies
                  </label>
                  <select
                    id={`reg-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.regime}
                    onChange={(event) => updateRow(row.id, { regime: event.target.value })}
                  >
                    {REGIMES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sen-${row.id}`}>
                    Data held
                  </label>
                  <select
                    id={`sen-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.sensitivity}
                    onChange={(event) => updateRow(row.id, { sensitivity: event.target.value })}
                  >
                    {SENSITIVITIES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sta-${row.id}`}>
                    Status
                  </label>
                  <select
                    id={`sta-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.status}
                    onChange={(event) => updateRow(row.id, { status: event.target.value })}
                  >
                    {STATUSES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`req-${row.id}`}>
                    Request sent on
                  </label>
                  <input
                    id={`req-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.requestedOn}
                    onChange={(event) => updateRow(row.id, { requestedOn: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`prf-${row.id}`}>
                    Proof note (ticket or reference from their reply)
                  </label>
                  <input
                    id={`prf-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.proof}
                    onChange={(event) => updateRow(row.id, { proof: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className={GHOST_BTN}
                  aria-label={`Remove account ${index + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {!ok && (
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
              Deletions confirmed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${Math.round(result.percentComplete)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.band.label} — ${result.band.note}`
                : "Fix the list above to see progress."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the deletion tracker and action queue"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy tracker"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(result.percentComplete)} percent of accounts confirmed deleted`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percentComplete))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Accounts tracked", ok ? result.total : DASH],
            ["Confirmed deleted with proof", ok ? result.closed : DASH],
            ["Past the response deadline", ok ? result.overdue : DASH],
            ["Refused or ignored", ok ? result.escalate : DASH],
            ["Requests still to send", ok ? result.toSend : DASH],
            ["Marked deleted but no proof recorded", ok ? result.unverified : DASH],
            [
              "Sensitive data still out there",
              ok ? `${result.openWeight} of ${result.totalWeight} points` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tracker</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Service</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Requested</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Reply due</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Proof</th>
                  <th scope="col" className="py-2 font-semibold">State</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.service}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.regimeLabel}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.requestedOn ?? DASH}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {row.dueOn ?? DASH}
                      {row.daysLeft !== null && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.daysLeft >= 0
                            ? `${row.daysLeft} day${row.daysLeft === 1 ? "" : "s"} left`
                            : `${Math.abs(row.daysLeft)} day${Math.abs(row.daysLeft) === 1 ? "" : "s"} late`}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3">{row.proof || DASH}</td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${stateClass(row.state)}`}
                      >
                        {STATE_LABEL[row.state]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.actionQueue.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.actionQueue.map((row) => (
                <li key={`q-${row.id}`} className="rounded-md border border-[var(--border)] p-3 text-sm">
                  <span className="font-semibold">{row.service}: </span>
                  {row.nextAction}
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    {row.regimeNote}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Deadlines follow the response windows published in the
        GDPR and the California consumer privacy rules; some erasure requests can be lawfully
        refused where the company must keep records for tax, fraud-prevention or legal claims.
        Everything you type stays in your browser.
      </p>
    </main>
  );
}
