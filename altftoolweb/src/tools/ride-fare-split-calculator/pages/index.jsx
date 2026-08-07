"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { splitRideFare } from "../lib";

const DEFAULT_PASSENGERS = [
  { id: 1, name: "Aarav", drop: "5" },
  { id: 2, name: "Bhavna", drop: "12" },
  { id: 3, name: "Chirag", drop: "20" },
];
const DEFAULT_FARE = "450";
const DEFAULT_FIXED = "50";

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
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const km = (value) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)} km`;

export default function ToolHome() {
  const [fare, setFare] = useState(DEFAULT_FARE);
  const [fixed, setFixed] = useState(DEFAULT_FIXED);
  const [rows, setRows] = useState(DEFAULT_PASSENGERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      splitRideFare({
        totalFare: toNumber(fare),
        fixedComponent: toNumber(fixed),
        passengers: rows.map((row, index) => ({
          name: row.name.trim() || `Passenger ${index + 1}`,
          dropKm: toNumber(row.drop),
        })),
      }),
    [fare, fixed, rows],
  );

  const error = result.error || "";

  const updateRow = (id, key, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setCopied(false);
  };

  const addRow = () => {
    setRows((current) => {
      if (current.length >= 12) return current;
      const nextId = current.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...current, { id: nextId, name: "", drop: "" }];
    });
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
    setCopied(false);
  };

  const reset = () => {
    setFare(DEFAULT_FARE);
    setFixed(DEFAULT_FIXED);
    setRows(DEFAULT_PASSENGERS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (error) return "";
    const lines = [
      "Shared cab fare split",
      `Total fare: ${money2(toNumber(fare))} over ${km(result.totalDistance)}`,
      `Fixed charges shared equally: ${money2(toNumber(fixed))}`,
      `Distance rate: ${money2(result.ratePerKm)} per km`,
      "",
    ];
    for (const share of result.shares) {
      lines.push(`${share.name} (drop ${km(share.dropKm)}): ${money(share.rounded)}`);
    }
    return lines.join("\n");
  }, [error, fare, fixed, result]);

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

  const highest = error
    ? null
    : result.shares.reduce((a, b) => {
        if (b.exact !== a.exact) return b.exact > a.exact ? b : a;
        // Tie-break on exact share: prefer whoever actually rode farther, since
        // that is the passenger the "rode the full X km" caption below refers to.
        return b.dropKm > a.dropKm ? b : a;
      });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Shared ride
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Ride Fare Split Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the cab fare and where each person got out. The route is cut at every drop point and
          each stretch is shared only between the people still in the car, so nobody pays for
          kilometres they did not ride.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ride-fare">
              Total fare paid (INR)
            </label>
            <input
              id="ride-fare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={fare}
              onChange={(event) => {
                setFare(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ride-fixed">
              Fixed charges — base fare, tolls, parking (INR)
            </label>
            <input
              id="ride-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={fixed}
              onChange={(event) => {
                setFixed(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Passengers and drop points</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Drop distance is measured from where the ride started.
        </p>

        <ul className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <li key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`ride-name-${row.id}`}>
                  Passenger {index + 1} name
                </label>
                <input
                  id={`ride-name-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  placeholder={`Passenger ${index + 1}`}
                  onChange={(event) => updateRow(row.id, "name", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`ride-drop-${row.id}`}>
                  Drop at (km)
                </label>
                <input
                  id={`ride-drop-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.drop}
                  onChange={(event) => updateRow(row.id, "drop", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label={`Remove passenger ${index + 1}`}
                disabled={rows.length <= 1}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add passenger
        </button>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Largest share
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money(highest.rounded)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : highest.dropKm === result.totalDistance
                  ? `${highest.name}, who rode the full ${km(result.totalDistance)}`
                  : `${highest.name}, who paid the most of the group`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fare split"
              aria-live="polite"
              className={GHOST_BTN}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Passenger</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Drop</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pays</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">By distance only</th>
                <th scope="col" className="py-2 text-right font-semibold">vs equal split</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={5}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.shares.map((share, index) => (
                  <tr
                    key={`${index}-${share.name}-${share.dropKm}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{share.name}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{km(share.dropKm)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(share.rounded)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(share.proportionalShare)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        share.savingVsEqual >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {share.savingVsEqual >= 0 ? "saves " : "pays "}
                      {money(Math.abs(share.savingVsEqual))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          &quot;By distance only&quot; is what each passenger would pay if the whole fare were split
          purely in proportion to their drop distance, with no fixed-charge or segment adjustment — shown
          for comparison against the actual, fairer &quot;Pays&quot; amount.
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distance driven end to end", error ? DASH : km(result.totalDistance)],
            ["Fare charged per kilometre", error ? DASH : money2(result.ratePerKm)],
            ["Fixed charges split each way", error ? DASH : money2(result.fixedShare)],
            ["An equal split would be", error ? DASH : `${money2(result.equalShare)} each`],
            ["Rounded shares add up to", error ? DASH : money(result.roundedTotal)],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Segment by segment</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stretch</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">In the car</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Stretch cost</th>
                <th scope="col" className="py-2 text-right font-semibold">Each</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.segments.map((segment) => (
                  <tr key={`${segment.fromKm}-${segment.toKm}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {km(segment.fromKm)} to {km(segment.toKm)}
                    </td>
                    <td className="py-2 pr-3 text-right">{segment.riders}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money2(segment.cost)}</td>
                    <td className="py-2 text-right font-semibold">{money2(segment.perRider)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Base fare, tolls and parking do not depend on who is still in the car, so they are divided
          equally. Everything else follows the kilometres actually shared. Rounding uses the largest
          remainder method, so the whole-rupee shares still add up to exactly what was paid.
        </p>
      </section>
    </main>
  );
}
