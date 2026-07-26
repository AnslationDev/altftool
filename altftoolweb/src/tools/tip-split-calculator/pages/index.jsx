"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, Users } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const TIP_PRESETS = [0, 5, 10, 12.5, 15, 18, 20];

const ROUND_MODES = [
  { id: "none", label: "No rounding" },
  { id: "person", label: "Round each share up" },
  { id: "total", label: "Round the total up" },
];

const ROUND_UNITS = [1, 5, 10, 20, 50, 100];

const DEFAULTS = {
  bill: "2400",
  taxPct: "5",
  tipPct: "10",
  people: "4",
  tipOnPreTax: true,
  roundMode: "person",
  roundUnit: "10",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const fmtMoney = (value) => (Number.isFinite(value) ? money.format(value) : "—");
const fmtMoneyExact = (value) => (Number.isFinite(value) ? moneyExact.format(value) : "—");
const fmtPct = (value) => (Number.isFinite(value) ? `${pct.format(value)}%` : "—");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const bill = Number(form.bill);
    const taxPct = form.taxPct.trim() === "" ? 0 : Number(form.taxPct);
    const tipPct = form.tipPct.trim() === "" ? 0 : Number(form.tipPct);
    const people = Number(form.people);
    const roundUnit = Number(form.roundUnit) || 1;

    if (form.bill.trim() === "" || !Number.isFinite(bill) || bill < 0) {
      return { error: "Enter a bill amount of 0 or more." };
    }
    if (!Number.isFinite(taxPct) || taxPct < 0 || taxPct > 100) {
      return { error: "Tax must be between 0% and 100%." };
    }
    if (!Number.isFinite(tipPct) || tipPct < 0 || tipPct > 100) {
      return { error: "Tip must be between 0% and 100%." };
    }
    if (!Number.isFinite(people) || !Number.isInteger(people) || people < 1) {
      return { error: "Split between at least 1 person (whole numbers only)." };
    }
    if (people > 200) {
      return { error: "Split between 200 people or fewer." };
    }

    const tax = (bill * taxPct) / 100;
    const tipBase = form.tipOnPreTax ? bill : bill + tax;
    const baseTip = (tipBase * tipPct) / 100;
    const rawTotal = bill + tax + baseTip;

    let total = rawTotal;
    let perPerson = rawTotal / people;

    if (form.roundMode === "total") {
      total = Math.ceil(rawTotal / roundUnit) * roundUnit;
      perPerson = total / people;
    } else if (form.roundMode === "person") {
      perPerson = Math.ceil(rawTotal / people / roundUnit) * roundUnit;
      total = perPerson * people;
    }

    const tip = total - bill - tax;
    const rounding = total - rawTotal;
    const effectiveTipPct = tipBase === 0 ? 0 : (tip / tipBase) * 100;

    return {
      bill,
      tax,
      baseTip,
      tip,
      rawTotal,
      total,
      perPerson,
      rounding,
      effectiveTipPct,
      people,
      tipBaseLabel: form.tipOnPreTax ? "bill before tax" : "bill including tax",
    };
  }, [form]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Tip & bill split",
      `Bill: ${fmtMoneyExact(result.bill)}`,
      `Tax: ${fmtMoneyExact(result.tax)}`,
      `Tip (${fmtPct(result.effectiveTipPct)} of ${result.tipBaseLabel}): ${fmtMoneyExact(result.tip)}`,
      `Total: ${fmtMoneyExact(result.total)}`,
      `People: ${result.people}`,
      `Each person pays: ${fmtMoneyExact(result.perPerson)}`,
      result.rounding > 0.004 ? `Rounded up by ${fmtMoneyExact(result.rounding)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [result]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";

  const roundingEnabled = form.roundMode !== "none";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Users className="h-4 w-4" aria-hidden="true" />
            Everyday calculator
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Tip and Bill Split Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add a tip, decide whether it goes on the pre-tax or post-tax bill, split it between the table,
            and round each share up to a clean note so nobody has to hunt for change.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label htmlFor="tip-bill" className="mb-1.5 block text-sm font-semibold">
                  Bill amount before tax (₹)
                </label>
                <input
                  id="tip-bill"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.bill}
                  onChange={(event) => setField("bill", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tip-tax" className="mb-1.5 block text-sm font-semibold">
                  Tax / GST on the bill (%)
                </label>
                <input
                  id="tip-tax"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="any"
                  value={form.taxPct}
                  onChange={(event) => setField("taxPct", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="tip-pct" className="mb-1.5 block text-sm font-semibold">
                  Tip (%)
                </label>
                <input
                  id="tip-pct"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="any"
                  value={form.tipPct}
                  onChange={(event) => setField("tipPct", event.target.value)}
                  className={inputClass}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TIP_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={Number(form.tipPct) === preset}
                      onClick={() => setField("tipPct", String(preset))}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        Number(form.tipPct) === preset
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="tip-people" className="mb-1.5 block text-sm font-semibold">
                  Number of people
                </label>
                <input
                  id="tip-people"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.people}
                  onChange={(event) => setField("people", event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <input
                id="tip-pretax"
                type="checkbox"
                checked={form.tipOnPreTax}
                onChange={(event) => setField("tipOnPreTax", event.target.checked)}
                className="mt-0.5 h-5 w-5 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <label htmlFor="tip-pretax" className="text-sm">
                <span className="font-semibold">Tip on the pre-tax amount</span>
                <span className="block text-[var(--muted-foreground)]">
                  Uncheck to calculate the tip on the bill including tax.
                </span>
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label htmlFor="tip-round-mode" className="mb-1.5 block text-sm font-semibold">
                  Rounding
                </label>
                <select
                  id="tip-round-mode"
                  value={form.roundMode}
                  onChange={(event) => setField("roundMode", event.target.value)}
                  className={inputClass}
                >
                  {ROUND_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tip-round-unit" className="mb-1.5 block text-sm font-semibold">
                  Round up to the nearest (₹)
                </label>
                <select
                  id="tip-round-unit"
                  value={form.roundUnit}
                  disabled={!roundingEnabled}
                  onChange={(event) => setField("roundUnit", event.target.value)}
                  className={inputClass}
                >
                  {ROUND_UNITS.map((unit) => (
                    <option key={unit} value={String(unit)}>
                      ₹{unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={Boolean(result.error)}
                aria-label="Copy tip and split summary"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={() => setForm(DEFAULTS)}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {result.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.error}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Each person pays
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {fmtMoney(result.perPerson)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {fmtMoneyExact(result.perPerson)} × {result.people}{" "}
                  {result.people === 1 ? "person" : "people"} = {fmtMoneyExact(result.total)}
                </p>

                <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Bill</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.bill)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Tax</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.tax)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">
                      Tip on the {result.tipBaseLabel}
                    </dt>
                    <dd className="text-sm font-semibold text-[var(--success)]">
                      {fmtMoneyExact(result.tip)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Effective tip rate</dt>
                    <dd className="text-sm font-semibold">{fmtPct(result.effectiveTipPct)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Rounding added</dt>
                    <dd className="text-sm font-semibold">
                      {result.rounding > 0.004 ? `+${fmtMoneyExact(result.rounding)}` : "None"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm font-semibold">Total to pay</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.total)}</dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Before rounding", fmtMoneyExact(result.rawTotal)],
                    ["Tip at the chosen rate", fmtMoneyExact(result.baseTip)],
                    ["Share before rounding", fmtMoneyExact(result.rawTotal / result.people)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Some restaurants already add a service charge to the bill — in India it is voluntary, so
                  check the receipt before tipping on top.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
