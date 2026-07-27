"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { SYSTEMS, convertShoeSize, sizeLadder } from "../lib";

const DEFAULTS = { system: "uk", value: "8", unit: "cm" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const n2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [system, setSystem] = useState(DEFAULTS.system);
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [target, setTarget] = useState("eu");
  const [copied, setCopied] = useState(false);

  const isLength = system === "footCm" || system === "jp";

  const result = useMemo(
    () => convertShoeSize({ system, value: Number(String(value).trim()), unit }),
    [system, value, unit],
  );

  const ok = !result.error;
  const ladder = useMemo(() => (ok ? sizeLadder(result.footCm, 4) : []), [ok, result]);
  const targetLabel = SYSTEMS.find((entry) => entry.key === target)?.label ?? "";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Shoe size conversion",
      `Foot length: ${n1.format(result.footCm)} cm (${n2.format(result.footInches)} in)`,
      `UK / India: ${result.rounded.uk}`,
      `US men's: ${result.rounded.usMen}`,
      `US women's: ${result.rounded.usWomen}`,
      `EU: ${result.rounded.eu}`,
      `Japan / Mondopoint: ${result.rounded.jp} cm`,
    ].join("\n");
  }, [ok, result]);

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
    setSystem(DEFAULTS.system);
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setTarget("eu");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Shoe sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Shoe Size Converter for Travel Shopping</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert between UK, Indian, US men's, US women's, EU and Japanese sizes — all worked out
          from foot length, which is the only thing the systems actually agree on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shoe-system">
              I know my size in
            </label>
            <select
              id="shoe-system"
              className={`mt-2 ${INPUT_CLASS}`}
              value={system}
              onChange={(event) => setSystem(event.target.value)}
            >
              {SYSTEMS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shoe-value">
              {isLength ? "Measurement" : "Size"}
            </label>
            <input
              id="shoe-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          {isLength && (
            <div>
              <label className={LABEL_CLASS} htmlFor="shoe-unit">
                Measured in
              </label>
              <select
                id="shoe-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="cm">Centimetres</option>
                <option value="in">Inches</option>
              </select>
            </div>
          )}
          <div className={isLength ? "" : "sm:col-span-2"}>
            <label className={LABEL_CLASS} htmlFor="shoe-target">
              I am shopping in
            </label>
            <select
              id="shoe-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {SYSTEMS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Ask for ({targetLabel})
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {ok ? result.rounded[target] : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Built on a foot length of ${n1.format(result.footCm)} cm (${n2.format(result.footInches)} in)`
                : "Fix the input above to see the equivalent size."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted shoe size" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {SYSTEMS.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{entry.label}</dt>
              <dd className="text-right font-semibold">
                {ok ? (
                  <>
                    {result.rounded[entry.key]}
                    <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                      (exact {n2.format(result.exact[entry.key])})
                    </span>
                  </>
                ) : (
                  DASH
                )}
              </dd>
            </div>
          ))}
        </dl>

        {ok && Math.abs(result.euRoundingGap) > 0.3 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            EU sizes only come in whole numbers, and your foot falls {n2.format(Math.abs(result.euRoundingGap))} of a
            size {result.euRoundingGap > 0 ? "below" : "above"} the nearest one — try the size either side.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Sizes around yours</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">UK / India</th>
                <th scope="col" className="py-2 pr-3 font-semibold">US men</th>
                <th scope="col" className="py-2 pr-3 font-semibold">US women</th>
                <th scope="col" className="py-2 pr-3 font-semibold">EU</th>
                <th scope="col" className="py-2 text-right font-semibold">Foot cm</th>
              </tr>
            </thead>
            <tbody>
              {ladder.length > 0 ? (
                ladder.map((row) => (
                  <tr
                    key={row.offset}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.offset === 0 ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{row.rounded.uk}</td>
                    <td className="py-2 pr-3">{row.rounded.usMen}</td>
                    <td className="py-2 pr-3">{row.rounded.usWomen}</td>
                    <td className="py-2 pr-3">{row.rounded.eu}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{n1.format(row.footCm)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2" colSpan={5}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Measure both feet at the end of the day, standing, in the socks you will wear, and use the
        longer one. Width matters as much as length and is not part of any of these scales — many
        brands only make one width — and sports, formal and boot lasts run differently even within
        one brand, so try the size either side before committing.
      </p>
    </main>
  );
}
