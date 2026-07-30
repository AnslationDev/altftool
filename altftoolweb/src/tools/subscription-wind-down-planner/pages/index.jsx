"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BILLING_CHANNELS,
  BILLING_CYCLES,
  PRE_DEBIT_NOTICE_HOURS,
  RECURRING_MANDATE_AFA_LIMIT_INR,
  formatHandoverSheet,
  planWindDown,
  toISODate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const todayISO = () => toISODate(Date.now());

function shift(iso, days) {
  return toISODate(new Date(`${iso}T00:00:00Z`).getTime() + days * 86400000);
}

function makeDefaults(baseISO) {
  return [
    {
      id: "row-1",
      name: "Video streaming",
      amount: "499",
      cycleId: "monthly",
      channelId: "appleAppStore",
      lastChargedISO: shift(baseISO, -12),
      holdsData: false,
    },
    {
      id: "row-2",
      name: "Cloud photo storage",
      amount: "1300",
      cycleId: "yearly",
      channelId: "googlePlay",
      lastChargedISO: shift(baseISO, -120),
      holdsData: true,
    },
    {
      id: "row-3",
      name: "Domain renewal",
      amount: "900",
      cycleId: "yearly",
      channelId: "directCard",
      lastChargedISO: shift(baseISO, -330),
      holdsData: true,
    },
    {
      id: "row-4",
      name: "Music subscription",
      amount: "119",
      cycleId: "monthly",
      channelId: "upiAutopay",
      lastChargedISO: shift(baseISO, -26),
      holdsData: false,
    },
  ];
}

const EMPTY_ROW = {
  name: "",
  amount: "0",
  cycleId: "monthly",
  channelId: "directCard",
  holdsData: false,
};

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [referenceISO, setReferenceISO] = useState(todayISO);
  const [windowMonths, setWindowMonths] = useState("12");
  const [items, setItems] = useState(() => makeDefaults(todayISO()));
  const [nextId, setNextId] = useState(5);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planWindDown({
        items: items.map((item) => ({ ...item, amount: Number(item.amount) })),
        referenceISO,
        windowMonths: Number(windowMonths),
      }),
    [items, referenceISO, windowMonths],
  );

  const sheet = useMemo(
    () => (plan.error ? "" : formatHandoverSheet(plan, { referenceISO })),
    [plan, referenceISO],
  );

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setCopied(false);
  };

  const addItem = () => {
    const id = `row-${nextId}`;
    setNextId((value) => value + 1);
    setItems((current) => [
      ...current,
      { ...EMPTY_ROW, id, name: "New subscription", lastChargedISO: referenceISO },
    ]);
    setCopied(false);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setCopied(false);
  };

  const reset = () => {
    const base = todayISO();
    setReferenceISO(base);
    setWindowMonths("12");
    setItems(makeDefaults(base));
    setNextId(5);
    setCopied(false);
  };

  const copySheet = async () => {
    if (!sheet) return;
    try {
      await navigator.clipboard.writeText(sheet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Digital inheritance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Subscription Wind-Down Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List every recurring charge, see what it really costs per year, and hand your executor an
          ordered sheet that says where each one can actually be cancelled.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swd-reference">
              Plan from this date
            </label>
            <input
              id="swd-reference"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={referenceISO}
              onChange={(event) => setReferenceISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swd-window">
              Unattended window (months)
            </label>
            <input
              id="swd-window"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windowMonths}
              onChange={(event) => setWindowMonths(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The window is how long nobody may be watching the account — probate alone often runs past a
          year, and every renewal inside that period is charged automatically.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">
                Subscription {index + 1}
              </h2>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name || `subscription ${index + 1}`}`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`${item.id}-name`}>
                  Service name
                </label>
                <input
                  id={`${item.id}-name`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${item.id}-amount`}>
                  Amount per charge (INR)
                </label>
                <input
                  id={`${item.id}-amount`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.amount}
                  onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${item.id}-cycle`}>
                  Billing cycle
                </label>
                <select
                  id={`${item.id}-cycle`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.cycleId}
                  onChange={(event) => updateItem(item.id, { cycleId: event.target.value })}
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${item.id}-charged`}>
                  Last charged on
                </label>
                <input
                  id={`${item.id}-charged`}
                  type="date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.lastChargedISO}
                  onChange={(event) => updateItem(item.id, { lastChargedISO: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${item.id}-channel`}>
                  Billed through
                </label>
                <select
                  id={`${item.id}-channel`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.channelId}
                  onChange={(event) => updateItem(item.id, { channelId: event.target.value })}
                >
                  {BILLING_CHANNELS.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
                  htmlFor={`${item.id}-data`}
                >
                  <input
                    id={`${item.id}-data`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={item.holdsData}
                    onChange={(event) => updateItem(item.id, { holdsData: event.target.checked })}
                  />
                  Holds files, photos, a domain or history the family would lose on cancellation
                </label>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} className={GHOST_BTN}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subscription
        </button>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Charged if nobody cancels
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? dash : money(plan.windowTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to see the projection."
                : `Over ${plan.windowMonths} months, up to ${plan.windowEndISO}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySheet}
              aria-label="Copy the wind-down handover sheet"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subscriptions listed", plan.error ? dash : String(plan.count)],
            ["Committed cost per year", plan.error ? dash : money(plan.annualTotal)],
            ["Equivalent per month", plan.error ? dash : money(plan.monthlyTotal)],
            ["Renewing within 7 days", plan.error ? dash : String(plan.dueInSevenDays)],
            [
              "Cancellable only inside an account login",
              plan.error ? dash : String(plan.lockedBehindAccounts),
            ],
            ["Need a data export before closing", plan.error ? dash : String(plan.exportFirst)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Wind-down order</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sorted by how soon the next charge lands, what it costs and whether data has to come out
            first.
          </p>
          <ol className="mt-4 space-y-4">
            {plan.rows.map((row, index) => (
              <li key={row.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                    {index + 1}.
                  </span>
                  <span className="text-base font-semibold">{row.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[row.band.tone]}`}
                  >
                    {row.band.label}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted-foreground)]">Next charge</dt>
                    <dd className="font-semibold">
                      {row.nextISO} ({row.daysAway} days)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">Cost per year</dt>
                    <dd className="font-semibold">
                      {money(row.annual)} ({money(row.amount)} {row.cycleLabel.toLowerCase()})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">Charges in the window</dt>
                    <dd className="font-semibold">
                      {row.chargesAhead} = {money(row.windowCost)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">Action</dt>
                    <dd className="font-semibold">{row.action.label}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">
                    Cancel at {row.channel.label}:
                  </span>{" "}
                  {row.channel.where} {row.channel.note}
                </p>
                {row.holdsData && (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{row.action.detail}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What an executor runs into</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Store-billed subscriptions live in the Apple or Google account, not with the app maker —
            without access to that account nobody can stop them.
          </li>
          <li>
            Under the RBI e-mandate framework, recurring debits above{" "}
            {money(RECURRING_MANDATE_AFA_LIMIT_INR)} need fresh authentication each time, so smaller
            mandates are the ones that keep running unnoticed.
          </li>
          <li>
            Banks issue a pre-debit notification about {PRE_DEBIT_NOTICE_HOURS} hours before an
            e-mandate debit; those alerts are the easiest way to discover subscriptions nobody wrote
            down.
          </li>
          <li>
            Blocking the card stops the payment, not the contract. Cancel the service as well and
            keep the confirmation.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you type stays in this browser tab. This planner is informational and is not legal
        or estate-planning advice — a will, a nomination and account access are separate questions,
        so speak to a lawyer about how your accounts should pass on.
      </p>
    </main>
  );
}
