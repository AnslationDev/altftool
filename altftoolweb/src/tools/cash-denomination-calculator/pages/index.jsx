"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, RotateCcw } from "lucide-react";

import { DEFAULT_VALUES, DENOMINATIONS, ROUNDING_STEPS, buildPayout } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const COUNT = new Intl.NumberFormat("en-IN");

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODE_OPTIONS = [
  { value: "nearest", label: "Nearest" },
  { value: "up", label: "Round up" },
  { value: "down", label: "Round down" },
];

const DEFAULTS = {
  amount: "2547.30",
  packets: "1",
  step: "1",
  mode: "nearest",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [selected, setSelected] = useState(DEFAULT_VALUES);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const toggleValue = (value) =>
    setSelected((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );

  const result = useMemo(() => {
    const amount = toNumber(state.amount);
    const packets = toNumber(state.packets);
    if (Number.isNaN(amount)) return { error: "Enter a valid amount in rupees." };
    if (Number.isNaN(packets)) return { error: "Enter how many packets you are preparing." };
    return buildPayout({
      amount,
      packets,
      step: toNumber(state.step) || 1,
      mode: state.mode,
      values: selected,
    });
  }, [state, selected]);

  const ok = !result.error;
  const many = ok && result.packets > 1;

  const copy = async () => {
    if (!ok) return;
    const lines = result.grandPieces.map(
      (p) => `${p.value} x ${p.count} = ${p.subtotal}`,
    );
    const text = [
      `Payout ${money(result.rounded)}${many ? ` x ${result.packets} packets` : ""}`,
      `Total cash ${money(result.totalCash)} in ${result.totalPieces} pieces`,
      ...lines,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setSelected(DEFAULT_VALUES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Fewest pieces
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rounding and Cash Denomination Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Round a payout to a figure you can actually hand over, then see the smallest number of
          notes and coins that make it up. Switch denominations off when your cash box has run out
          of them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-amount">
              Amount per packet (₹)
            </label>
            <input
              id="cd-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.amount}
              onChange={(event) => setField("amount", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-packets">
              Identical packets
            </label>
            <input
              id="cd-packets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={state.packets}
              onChange={(event) => setField("packets", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-step">
              Round to the nearest
            </label>
            <select
              id="cd-step"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.step}
              onChange={(event) => setField("step", event.target.value)}
            >
              {ROUNDING_STEPS.map((step) => (
                <option key={step} value={String(step)}>
                  ₹{step}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-mode">
              Rounding direction
            </label>
            <select
              id="cd-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.mode}
              onChange={(event) => setField("mode", event.target.value)}
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Denominations available
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DENOMINATIONS.map((denom) => {
              const id = `cd-denom-${denom.value}`;
              return (
                <label
                  key={denom.value}
                  htmlFor={id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]"
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={selected.includes(denom.value)}
                    onChange={() => toggleValue(denom.value)}
                  />
                  <span>{denom.label}</span>
                  <span className="ml-auto text-xs font-medium text-[var(--muted-foreground)]">
                    {denom.form}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {many ? "Total cash to draw" : "Cash to hand over"}
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? money(result.totalCash) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${COUNT.format(result.totalPieces)} pieces in total${many ? ` · ${COUNT.format(result.perPacket.totalPieces)} per packet` : ""}`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the denomination breakdown"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Amount entered", ok ? money(result.original) : "—"],
            ["After rounding", ok ? money(result.rounded) : "—"],
            [
              "Rounding difference",
              ok
                ? `${result.roundingDifference >= 0 ? "+" : "−"}${money(Math.abs(result.roundingDifference))}`
                : "—",
            ],
            ["Packets", ok ? COUNT.format(result.packets) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !result.exact && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            {money(result.remainder)} per packet cannot be made from the denominations you selected.
            Switch a smaller note or coin back on, or change the rounding step.
          </p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">Notes and coins needed</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Denomination</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  {many ? "Per packet" : "Count"}
                </th>
                {many && (
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Total count</th>
                )}
                <th scope="col" className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {ok && result.grandPieces.length > 0 ? (
                result.grandPieces.map((piece, index) => (
                  <tr key={piece.value} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">₹{COUNT.format(piece.value)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {COUNT.format(result.perPacket.pieces[index]?.count ?? 0)}
                    </td>
                    {many && (
                      <td className="py-2 pr-3 text-right tabular-nums">{COUNT.format(piece.count)}</td>
                    )}
                    <td className="py-2 text-right tabular-nums">{money(piece.subtotal)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={many ? 4 : 3}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Coins of 25 paise and below stopped being legal tender on 30 June 2011, which is why cash is
        settled to the rupee. The ₹2000 note was withdrawn from circulation on 19 May 2023 — it is
        still legal tender but banks no longer issue it, so it stays switched off here by default.
      </p>
    </main>
  );
}
