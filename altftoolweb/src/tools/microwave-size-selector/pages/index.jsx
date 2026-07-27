"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Microwave, RotateCcw } from "lucide-react";

import { CAPACITIES, USAGES, largestDishCm, selectMicrowave } from "../lib";

const DASH = "—";
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : DASH);

const DEFAULTS = { people: "4", usage: "convection", bakes: false, dish: "25" };

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      selectMicrowave({
        people: toNum(form.people),
        usage: form.usage,
        bakes: form.bakes,
        dishCm: toNum(form.dish),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Microwave Size Selector",
        `Serves ${result.people} people, used for ${USAGES.find((u) => u.id === form.usage)?.label.toLowerCase() ?? ""}`,
        `Calculated need: ${result.requiredLitres} L`,
        `Recommended: ${result.recommended} L ${result.type}`,
        `Turntable at that size: about ${result.turntableMm} mm`,
        `Your ${form.dish} cm dish needs ${result.dishNeedsMm} mm of turntable`,
        `Typical output power: ${result.outputWatts}`,
      ].join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Microwave className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Microwave Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things set the litres you need: how much food goes in at once, and whether your widest
          dish can actually turn on the plate. This checks both.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="m-people">
              People it will serve
            </label>
            <input
              id="m-people"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={form.people}
              onChange={set("people")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="m-dish">
              Widest dish you will use (cm)
            </label>
            <input
              id="m-dish"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="10"
              max="45"
              step="1"
              value={form.dish}
              onChange={set("dish")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="m-usage">
              What you will use it for
            </label>
            <select id="m-usage" className={INPUT} value={form.usage} onChange={set("usage")}>
              {USAGES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.bakes}
            onChange={(event) => setForm((prev) => ({ ...prev, bakes: event.target.checked }))}
          />
          I will bake full-size cakes or roast a whole chicken
        </label>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended microwave
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.recommended} L` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.volumeExceedsCatalogue
                  ? `${result.type} — your ${result.requiredLitres} L requirement is past the largest domestic model, so plan on cooking in batches.`
                  : `${result.type} type — calculated need ${result.requiredLitres} L`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended microwave size"
              className={GHOST_BTN}
              disabled={!ok}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cavity overhead for this type", ok ? `${result.base} L` : DASH],
            [`People (${ok ? result.people : "?"} x 3 L)`, ok ? `${result.peopleLitres} L` : DASH],
            ["Baking allowance", ok ? `${result.bakingLitres} L` : DASH],
            ["Calculated requirement", ok ? `${result.requiredLitres} L` : DASH],
            ["Type", ok ? result.type : DASH],
            ["Typical output power", ok ? result.outputWatts : DASH],
            ["Turntable at the recommended size", ok ? `about ${result.turntableMm} mm` : DASH],
            ["Turntable your dish needs", ok ? `${n0(result.dishNeedsMm)} mm` : DASH],
            [
              "Clearance around the dish",
              ok ? (result.dishFits ? `${n0(result.spareTurntableMm)} mm spare` : "Does not fit") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.typeNote}
          </p>
        ) : null}

        {ok && result.dishDrivesSize ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Your food volume alone would fit a smaller cavity — the size was raised so the
            {` ${form.dish} cm `}
            dish clears the turntable as it rotates.
          </p>
        ) : null}

        {ok && !result.dishFits ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            No domestic turntable is wide enough for a {form.dish} cm dish. Look for a flatbed model
            with no turntable, or use a smaller dish.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Capacity and turntable sizes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Turntable diameters are typical for each capacity — confirm the exact figure in the
          model&apos;s specification sheet.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Capacity
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Turntable
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Largest dish
                </th>
              </tr>
            </thead>
            <tbody>
              {CAPACITIES.map((c) => (
                <tr
                  key={c.litres}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    ok && c.litres === result.recommended ? "text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold">{c.litres} L</td>
                  <td className="py-2 pr-3 text-right">{c.turntableMm} mm</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {n0(largestDishCm(c.turntableMm))} cm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Capacity is cavity volume, not usable space — the turntable, roller ring and any rack take
        some of it. Measure the counter depth and leave the ventilation gap the manual specifies
        behind and above the unit.
      </p>
    </main>
  );
}
