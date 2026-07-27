"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";
import {
  DEFAULT_ESCALATION_DAYS,
  NOTICE_WINDOW_DAYS,
  OFFENCE_CATALOGUE,
  addDays,
  evaluateChallans,
} from "../lib";

const STORAGE_KEY = "altft-traffic-challan-tracker";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  overdue: "bg-[var(--danger-soft)] text-[var(--danger)]",
  urgent: "bg-[var(--danger-soft)] text-[var(--danger)]",
  open: "bg-[var(--muted)] text-[var(--foreground)]",
  paid: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const SEED_TODAY = "2026-01-01";

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

const toNumber = (raw) => {
  if (String(raw).trim() === "") return NaN;
  return Number(String(raw).replace(/,/g, "").trim());
};

function seedChallans(reference) {
  return [
    {
      id: "seed-1",
      offenceId: "speeding-lmv",
      amount: "1000",
      issuedOn: addDays(reference, -87),
      paid: false,
      vehicle: "MH 12 AB 1234",
      challanNo: "",
    },
    {
      id: "seed-2",
      offenceId: "no-puc",
      amount: "10000",
      issuedOn: addDays(reference, -7),
      paid: false,
      vehicle: "MH 12 AB 1234",
      challanNo: "",
    },
  ];
}

export default function ToolHome() {
  const [today, setToday] = useState(SEED_TODAY);
  const [rows, setRows] = useState(() => seedChallans(SEED_TODAY));
  const [window_, setWindow] = useState(String(DEFAULT_ESCALATION_DAYS));
  const [budget, setBudget] = useState("2000");
  const [ready, setReady] = useState(false);
  const [seq, setSeq] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const real = localIsoDate();
    let stored = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) stored = parsed;
      }
    } catch {
      stored = null;
    }
    setToday(real);
    setRows(stored || seedChallans(real));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      /* storage blocked — the list still works for this session */
    }
  }, [rows, ready]);

  const result = useMemo(
    () =>
      evaluateChallans(
        rows.map((row) => ({
          id: row.id,
          offenceId: row.offenceId,
          amount: toNumber(row.amount),
          issuedOn: row.issuedOn,
          paid: row.paid,
          vehicle: row.vehicle,
          challanNo: row.challanNo,
        })),
        today,
        { escalationDays: toNumber(window_), monthlyBudget: toNumber(budget) },
      ),
    [rows, today, window_, budget],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Traffic challans as on ${prettyDate(today)}`,
      `Pending: ${money(result.pendingTotal)} across ${result.pendingCount} challans`,
      `Past the ${result.escalationDays}-day window: ${money(result.overdueTotal)} (${result.overdueCount})`,
      `Already paid: ${money(result.paidTotal)}`,
      result.monthsToClear > 0
        ? `At ${money(result.monthlyBudget)} a month it takes ${result.monthsToClear} months to clear`
        : "No monthly budget set",
      "",
      ...result.items.map(
        (item) =>
          `${item.paid ? "PAID" : "DUE "} ${money(item.amount)} — ${item.offenceLabel} (${item.section}), issued ${prettyDate(item.issuedOn)}, pay by ${prettyDate(item.payBy)}`,
      ),
    ].join("\n");
  }, [failed, result, today]);

  const updateRow = (id, field, value) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        if (field === "offenceId") {
          const offence = OFFENCE_CATALOGUE.find((item) => item.id === value);
          const suggested = offence && offence.min > 0 ? String(offence.min) : row.amount;
          return { ...row, offenceId: value, amount: suggested };
        }
        return { ...row, [field]: value };
      }),
    );
  };

  const addRow = () => {
    const id = `challan-${seq}`;
    setSeq((value) => value + 1);
    setRows((current) => [
      ...current,
      {
        id,
        offenceId: "road-rules",
        amount: "500",
        issuedOn: today,
        paid: false,
        vehicle: "",
        challanNo: "",
      },
    ]);
  };

  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

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
    setRows(seedChallans(today));
    setWindow(String(DEFAULT_ESCALATION_DAYS));
    setBudget("2000");
    setSeq(1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Traffic Challan Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log each fine with the offence and the date, and see what is pending, what has slipped past
          your state&apos;s payment window, and how long a monthly budget takes to clear the lot. The
          list never leaves this browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="today">
              Check against date
            </label>
            <input
              id="today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="window">
              Payment window (days)
            </label>
            <input
              id="window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={window_}
              onChange={(event) => setWindow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget">
              Monthly budget (INR)
            </label>
            <input
              id="budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          An electronically detected offence has to be notified within {NOTICE_WINDOW_DAYS} days under
          Rule 167A of the Central Motor Vehicles Rules; how long you then have before the challan is
          referred onward is set by your state.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Challans</h2>
        <div className="mt-4 grid gap-5">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-4">
              <div>
                <label className={LABEL_CLASS} htmlFor={`offence-${row.id}`}>
                  Offence
                </label>
                <select
                  id={`offence-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.offenceId}
                  onChange={(event) => updateRow(row.id, "offenceId", event.target.value)}
                >
                  {OFFENCE_CATALOGUE.map((offence) => (
                    <option key={offence.id} value={offence.id}>
                      {offence.label} ({offence.section})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`amount-${row.id}`}>
                    Amount on the challan (INR)
                  </label>
                  <input
                    id={`amount-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={row.amount}
                    onChange={(event) => updateRow(row.id, "amount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`issued-${row.id}`}>
                    Issued on
                  </label>
                  <input
                    id={`issued-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.issuedOn}
                    onChange={(event) => updateRow(row.id, "issuedOn", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vehicle-${row.id}`}>
                    Vehicle (optional)
                  </label>
                  <input
                    id={`vehicle-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="MH 12 AB 1234"
                    value={row.vehicle}
                    onChange={(event) => updateRow(row.id, "vehicle", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`no-${row.id}`}>
                    Challan number (optional)
                  </label>
                  <input
                    id={`no-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.challanNo}
                    onChange={(event) => updateRow(row.id, "challanNo", event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-h-11 items-center gap-3">
                  <input
                    id={`paid-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={Boolean(row.paid)}
                    onChange={(event) => updateRow(row.id, "paid", event.target.checked)}
                  />
                  <label className="text-sm font-semibold" htmlFor={`paid-${row.id}`}>
                    Paid
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove this challan"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add challan
        </button>
      </section>

      {failed && (
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
              Pending total
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !failed && result.overdueTotal > 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {failed ? "—" : money(result.pendingTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the totals."
                : `${result.pendingCount} unpaid · ${result.overdueCount} past the ${result.escalationDays}-day window`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the challan summary"
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
              aria-label="Reset the challan list"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Challans tracked", failed ? "—" : String(result.total)],
            ["Unpaid", failed ? "—" : `${result.pendingCount} · ${money(result.pendingTotal)}`],
            ["Past the payment window", failed ? "—" : `${result.overdueCount} · ${money(result.overdueTotal)}`],
            ["Already paid", failed ? "—" : money(result.paidTotal)],
            [
              "Next to fall due",
              failed || !result.nextDue
                ? "Nothing pending"
                : `${result.nextDue.offenceLabel} by ${prettyDate(result.nextDue.payBy)}`,
            ],
            [
              "Months to clear at your budget",
              failed
                ? "—"
                : result.monthsToClear > 0
                  ? `${result.monthsToClear} months at ${money(result.monthlyBudget)}`
                  : "Set a monthly budget",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Payment queue</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Offence</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Issued</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Pay by</th>
                  <th scope="col" className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{item.offenceLabel}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {item.section}
                        {item.vehicle ? ` · ${item.vehicle}` : ""}
                        {item.challanNo ? ` · ${item.challanNo}` : ""}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold">{money(item.amount)}</td>
                    <td className="py-2.5 pr-3">{prettyDate(item.issuedOn)}</td>
                    <td className="py-2.5 pr-3">{prettyDate(item.payBy)}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
                      >
                        {item.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.byVehicle.length > 0 && (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {result.byVehicle.map((row) => (
                <div key={row.vehicle} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">Pending against {row.vehicle}</dt>
                  <dd className="text-right font-semibold">{money(row.amount)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The catalogue amounts are the central figures in the
        Motor Vehicles (Amendment) Act, 2019 and several states notify lower ones, so the number on
        your own challan wins. Pay and verify challans only through your state traffic police portal or
        the official e-challan service.
      </p>
    </main>
  );
}
