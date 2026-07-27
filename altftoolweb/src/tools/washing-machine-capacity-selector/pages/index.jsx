"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, WashingMachine } from "lucide-react";

import { FILL_FACTOR, MACHINE_TYPES, selectWasher } from "../lib";

const DASH = "—";
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : DASH);

const DEFAULTS = {
  adults: "2",
  children: "2",
  beds: "2",
  washes: "3",
  extra: "0",
  quilts: false,
  type: "front",
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
      selectWasher({
        adults: toNum(form.adults),
        children: form.children.trim() === "" ? 0 : toNum(form.children),
        beds: form.beds.trim() === "" ? 0 : toNum(form.beds),
        washesPerWeek: toNum(form.washes),
        extraKgPerWeek: form.extra.trim() === "" ? 0 : toNum(form.extra),
        washesQuilts: form.quilts,
      }),
    [form],
  );

  const ok = !result.error;
  const machine = MACHINE_TYPES.find((t) => t.id === form.type) ?? MACHINE_TYPES[0];

  const summary = ok
    ? [
        "Washing Machine Capacity Selector",
        `Household: ${form.adults} adults, ${form.children || 0} children, ${form.beds || 0} beds`,
        `Weekly laundry: ${n1(result.weeklyKg)} kg dry`,
        `Per wash at ${form.washes} washes a week: ${n2(result.perLoadKg)} kg`,
        `Drum needed: ${n2(result.requiredKg)} kg`,
        `Recommended capacity: ${result.recommended} kg (${machine.label})`,
        `Usable load at that rating: ${n2(result.usableKg)} kg`,
        result.exceedsCatalogue
          ? `That load needs ${result.washesNeeded} washes a week even on the largest drum sold.`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
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
          <WashingMachine className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Washing Machine Capacity Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The rating on a washing machine is the maximum weight of dry laundry per cycle. This works
          out your weekly laundry weight first, then the drum that carries it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="w-adults">
              Adults
            </label>
            <input
              id="w-adults"
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
            <label className={LABEL} htmlFor="w-children">
              Children under 12
            </label>
            <input
              id="w-children"
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
            <label className={LABEL} htmlFor="w-beds">
              Beds whose linen you wash weekly
            </label>
            <input
              id="w-beds"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.beds}
              onChange={set("beds")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="w-washes">
              Washes you want to run per week
            </label>
            <input
              id="w-washes"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="21"
              step="1"
              value={form.washes}
              onChange={set("washes")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="w-extra">
              Extra laundry per week (kg)
            </label>
            <input
              id="w-extra"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={form.extra}
              onChange={set("extra")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="w-type">
              Machine type you prefer
            </label>
            <select id="w-type" className={INPUT} value={form.type} onChange={set("type")}>
              {MACHINE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.quilts}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, quilts: event.target.checked }))
            }
          />
          I wash double quilts or blankets at home
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
              Recommended capacity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.recommended} kg` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.exceedsCatalogue
                  ? `Even a ${result.recommended} kg drum needs ${result.washesNeeded} washes a week for this household.`
                  : `Carries ${n2(result.perLoadKg)} kg a wash with ${n0(result.headroomPct)}% room to spare`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended washing machine capacity"
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
            ["Clothing, per week", ok ? `${n1(result.peopleKg)} kg` : DASH],
            ["Bed linen, per week", ok ? `${n1(result.linenKg)} kg` : DASH],
            ["Extra items you added", ok ? `${n1(result.extraKg)} kg` : DASH],
            ["Total weekly laundry", ok ? `${n1(result.weeklyKg)} kg dry` : DASH],
            ["Weight per wash", ok ? `${n2(result.perLoadKg)} kg` : DASH],
            [
              `Drum needed (load / ${FILL_FACTOR} fill factor)`,
              ok ? `${n2(result.requiredKg)} kg` : DASH,
            ],
            ["Usable load at the recommended rating", ok ? `${n2(result.usableKg)} kg` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.quiltDrivesSize ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Your laundry weight alone would fit a smaller drum — the size was raised because a
            double quilt needs the volume of an 8 kg machine even though it weighs about 3 kg.
          </p>
        ) : null}

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {machine.note}
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What one load looks like</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Item
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Dry weight
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Fits per load
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Shirts", "0.20 kg", ok ? n0(result.shirtsPerLoad) : DASH],
                ["Jeans", "0.70 kg", ok ? n0(result.jeansPerLoad) : DASH],
                ["Bath towels", "0.40 kg", ok ? n0(result.towelsPerLoad) : DASH],
              ].map(([item, weight, count]) => (
                <tr key={item} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{weight}</td>
                  <td className="py-2 text-right font-semibold">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights are typical cotton garments; synthetics weigh less and towelling more. Buying one
        size up costs little extra to run because modern machines sense the load, but a machine
        habitually run half empty wastes a full cycle of water and detergent.
      </p>
    </main>
  );
}
