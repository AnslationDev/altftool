"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Refrigerator, RotateCcw } from "lucide-react";

import {
  COOKING_STYLES,
  DIETS,
  FROZEN_USE,
  SHOPPING_FREQUENCIES,
  STANDARD_SIZES,
  selectRefrigerator,
} from "../lib";

const DASH = "—";
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : DASH);

const DEFAULTS = {
  adults: "2",
  children: "2",
  cooking: "regular",
  shopping: "weekly",
  diet: "occasional",
  frozen: "medium",
};

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
      selectRefrigerator({
        adults: toNum(form.adults),
        children: form.children.trim() === "" ? 0 : toNum(form.children),
        cooking: form.cooking,
        shopping: form.shopping,
        diet: form.diet,
        frozen: form.frozen,
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Refrigerator Capacity Selector",
        `Household: ${form.adults} adults, ${form.children || 0} children`,
        `Calculated need: ${n0(result.required)} L`,
        `Recommended: ${n0(result.recommended)} L gross${result.unitsNeeded > 1 ? ` x ${result.unitsNeeded} units` : ""}`,
        `Format: ${result.type}`,
        `Comfortable range: ${n0(result.comfortableRange[0])}-${n0(result.comfortableRange[1])} L`,
        `Freezer share at that size: about ${n0(result.freezerLitres)} L`,
        `Per person: ${n0(result.litresPerPerson)} L`,
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
          <Refrigerator className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Refrigerator Capacity Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Litres are driven as much by how you shop and cook as by headcount. Answer four questions
          and see the capacity, the format that fits it and the full working.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="f-adults">
              Adults in the home
            </label>
            <input
              id="f-adults"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.adults}
              onChange={set("adults")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="f-children">
              Children under 12
            </label>
            <input
              id="f-children"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.children}
              onChange={set("children")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="f-cooking">
              Cooking style
            </label>
            <select id="f-cooking" className={INPUT} value={form.cooking} onChange={set("cooking")}>
              {COOKING_STYLES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="f-shopping">
              How often you shop for groceries
            </label>
            <select
              id="f-shopping"
              className={INPUT}
              value={form.shopping}
              onChange={set("shopping")}
            >
              {SHOPPING_FREQUENCIES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="f-diet">
              Diet
            </label>
            <select id="f-diet" className={INPUT} value={form.diet} onChange={set("diet")}>
              {DIETS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="f-frozen">
              Frozen food use
            </label>
            <select id="f-frozen" className={INPUT} value={form.frozen} onChange={set("frozen")}>
              {FROZEN_USE.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
              Recommended capacity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n0(result.recommended)} L` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.unitsNeeded > 1
                  ? `Your need of ${n0(result.required)} L is past the largest single unit — plan on ${result.unitsNeeded} refrigerators or a chest freezer alongside.`
                  : `${result.type} — calculated need ${n0(result.required)} L`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended refrigerator capacity"
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
            ["Calculated requirement", ok ? `${n0(result.required)} L` : DASH],
            [
              "Comfortable range to shop in",
              ok ? `${n0(result.comfortableRange[0])} - ${n0(result.comfortableRange[1])} L` : DASH,
            ],
            ["Format that fits", ok ? result.type : DASH],
            ["Freezer volume at that size", ok ? `about ${n0(result.freezerLitres)} L` : DASH],
            ["Fresh food volume", ok ? `about ${n0(result.freshLitres)} L` : DASH],
            ["Litres per person", ok ? `${n0(result.litresPerPerson)} L` : DASH],
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the number was built</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Element
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Effect
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.factors : [["Enter valid inputs", DASH]]).map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-3 font-semibold">Combined multiplier</td>
                <td className="py-2 text-right font-semibold">
                  {ok ? `x ${n1(result.multiplier)}` : DASH}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Sizes matched against the capacities actually sold: {STANDARD_SIZES.slice(5).join(", ")} L.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Capacity on the box is gross volume, not usable space — shelves, drawers and the ice maker
        take a slice of it. Measure the alcove, allow about 50 mm of ventilation gap at the back and
        sides, and check the door can open fully before ordering.
      </p>
    </main>
  );
}
