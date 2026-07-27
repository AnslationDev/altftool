"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import {
  BYTE_UNITS,
  convertBytes,
  humanizeBytes,
  transferSeconds,
} from "../lib";

const DEFAULT_AMOUNT = "1";
const DEFAULT_UNIT = "GB";
const DEFAULT_SPEED = "100";

const UNIT_GROUPS = BYTE_UNITS.reduce((groups, unit) => {
  (groups[unit.group] ||= []).push(unit);
  return groups;
}, {});

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });
const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function formatValue(value) {
  if (value === 0) return "0";
  if (value >= 1e15 || (value > 0 && value < 1e-6)) return value.toExponential(4);
  return decimal.format(value);
}

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertBytes({ value: amount, from: unit }), [amount, unit]);
  const error = result.error ?? "";

  const human = useMemo(() => {
    if (error) return null;
    const binary = humanizeBytes(result.bytes, { binary: true });
    const si = humanizeBytes(result.bytes, { binary: false });
    return {
      binary: binary.error ? null : binary.text,
      si: si.error ? null : si.text,
    };
  }, [error, result.bytes]);

  const transfer = useMemo(() => {
    if (error) return null;
    return transferSeconds(result.bytes, Number(speed));
  }, [error, result.bytes, speed]);

  const headline = error ? "—" : `${formatValue(result.bytes)} bytes`;

  function handleCopy() {
    if (error) return;
    const lines = result.results.map((row) => `${row.label}: ${formatValue(row.value)}`);
    navigator.clipboard
      .writeText([`${amount} ${unit} =`, ...lines].join("\n"))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => setCopied(false));
  }

  function handleReset() {
    setAmount(DEFAULT_AMOUNT);
    setUnit(DEFAULT_UNIT);
    setSpeed(DEFAULT_SPEED);
    setCopied(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="byte-amount" className="mb-1.5 block text-sm font-medium">
            Size
          </label>
          <input
            id="byte-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="byte-unit" className="mb-1.5 block text-sm font-medium">
            Unit
          </label>
          <select
            id="byte-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className={INPUT_CLASS}
          >
            {Object.entries(UNIT_GROUPS).map(([group, units]) => (
              <optgroup key={group} label={group}>
                {units.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="byte-speed" className="mb-1.5 block text-sm font-medium">
            Link speed for transfer time (Mbps)
          </label>
          <input
            id="byte-speed"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={speed}
            onChange={(event) => setSpeed(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Total size</p>
        <p className="mt-1 break-all text-3xl font-bold tracking-tight sm:text-4xl">{headline}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Human readable (binary)</dt>
            <dd className="text-base font-semibold">{error ? "—" : human?.binary ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Human readable (decimal)</dt>
            <dd className="text-base font-semibold">{error ? "—" : human?.si ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Transfer time at {speed || "0"} Mbps</dt>
            <dd className="text-base font-semibold">
              {error || !transfer || transfer.error
                ? "—"
                : `${plain.format(Math.round(transfer.seconds))} s`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">In bits</dt>
            <dd className="break-all text-base font-semibold">
              {error ? "—" : formatValue(result.results.find((row) => row.id === "bit").value)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
            <caption className="sr-only">Every supported unit for this size</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-4 font-medium">Unit</th>
                <th scope="col" className="py-2 pr-4 font-medium">Group</th>
                <th scope="col" className="py-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {(result.results ?? BYTE_UNITS.map((u) => ({ ...u, value: 0 }))).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-4 font-normal">{row.label}</th>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">{row.group}</td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {error ? "—" : formatValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={Boolean(error)}
            aria-label="Copy every converted value to the clipboard"
            className={`${BUTTON_CLASS} disabled:opacity-50`}
          >
            {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset the converter to its default size"
            className={GHOST_BUTTON_CLASS}
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>
    </div>
  );
}
