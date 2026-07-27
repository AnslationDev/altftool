"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { SYSTEM_DEFAULTS, compareEmulsionDistemper } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  area: "1000",
  horizonYears: "12",
  discountRatePct: "6",
  prepCost: "0",
  emulsion: {
    pricePerLitre: "250",
    spreadingRate: "140",
    coats: "2",
    cycleYears: "6",
    labourRatePerSqft: "18",
  },
  distemper: {
    pricePerLitre: "110",
    spreadingRate: "100",
    coats: "2",
    cycleYears: "3",
    labourRatePerSqft: "10",
  },
};

const SYSTEM_FIELDS = [
  { key: "pricePerLitre", label: "Price per litre", step: "10", min: "1" },
  { key: "spreadingRate", label: "Spreading rate (sq ft/L/coat)", step: "5", min: "1" },
  { key: "coats", label: "Coats", step: "1", min: "1" },
  { key: "cycleYears", label: "Repaint every (years)", step: "0.5", min: "0.5" },
  { key: "labourRatePerSqft", label: "Labour per sq ft", step: "1", min: "0" },
];

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

const numify = (spec) => ({
  pricePerLitre: toNum(spec.pricePerLitre),
  spreadingRate: toNum(spec.spreadingRate),
  coats: toNum(spec.coats),
  cycleYears: toNum(spec.cycleYears),
  labourRatePerSqft: toNum(spec.labourRatePerSqft),
});

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setSystem = (system, key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [system]: { ...prev[system], [key]: value } }));
  };

  const result = useMemo(
    () =>
      compareEmulsionDistemper({
        area: toNum(form.area),
        horizonYears: toNum(form.horizonYears),
        discountRatePct: toNum(form.discountRatePct),
        prepCost: toNum(form.prepCost),
        emulsion: numify(form.emulsion),
        distemper: numify(form.distemper),
      }),
    [form],
  );

  const ok = !result.error;

  const verdict = ok
    ? result.cheaper === "tie"
      ? "The two work out the same over this horizon"
      : result.cheaper === "emulsion"
        ? `Emulsion is cheaper over ${NUM.format(result.horizonYears)} years`
        : `Distemper is cheaper over ${NUM.format(result.horizonYears)} years`
    : DASH;

  const summary = ok
    ? [
        "Emulsion vs Distemper Cost Comparison",
        `${NUM.format(result.area)} sq ft over ${NUM.format(result.horizonYears)} years, discounted at ${NUM1.format(result.discountRatePct)}%`,
        "",
        `Emulsion: ${money(result.emulsion.perJob.total)} per repaint, every ${NUM1.format(result.emulsion.cycleYears)} years, ${result.emulsion.jobs} job(s)`,
        `  Present value ${money(result.emulsion.presentValue)} | equivalent annual ${money(result.emulsion.eac)}`,
        `Distemper: ${money(result.distemper.perJob.total)} per repaint, every ${NUM1.format(result.distemper.cycleYears)} years, ${result.distemper.jobs} job(s)`,
        `  Present value ${money(result.distemper.presentValue)} | equivalent annual ${money(result.distemper.eac)}`,
        "",
        verdict,
        `Emulsion costs ${money(result.upfrontExtraForEmulsion)} more upfront`,
        result.breakEvenYear === null
          ? "Emulsion does not overtake distemper within 50 years on these numbers"
          : `Emulsion pulls level from year ${result.breakEvenYear}`,
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Emulsion vs Distemper Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Distemper wins on the day you pay for it and loses every time you repaint. This puts both
          on the same footing: cost per repaint, how many repaints fall inside your horizon, and the
          present value of the whole schedule discounted back to today.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The wall and the horizon</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ed-area">
              Paintable area (sq ft)
            </label>
            <input
              id="ed-area"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={form.area}
              onChange={set("area")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ed-horizon">
              How long you will own it (years)
            </label>
            <input
              id="ed-horizon"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={form.horizonYears}
              onChange={set("horizonYears")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ed-rate">
              Discount rate (% a year)
            </label>
            <input
              id="ed-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={form.discountRatePct}
              onChange={set("discountRatePct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ed-prep">
              One-time prep (putty, cracks)
            </label>
            <input
              id="ed-prep"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.prepCost}
              onChange={set("prepCost")}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The discount rate is what the money would otherwise earn you. Set it to 0 to compare plain
          rupees spent; set it to your fixed-deposit rate to compare fairly across years.
        </p>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {["emulsion", "distemper"].map((system) => (
          <section
            key={system}
            className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          >
            <h2 className="text-base font-semibold">{SYSTEM_DEFAULTS[system].label}</h2>
            <div className="mt-3 grid gap-4">
              {SYSTEM_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className={LABEL} htmlFor={`ed-${system}-${field.key}`}>
                    {field.label}
                  </label>
                  <input
                    id={`ed-${system}-${field.key}`}
                    className={INPUT}
                    type="number"
                    inputMode="decimal"
                    min={field.min}
                    step={field.step}
                    value={form[system][field.key]}
                    onChange={setSystem(system, field.key)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Lifetime saving with emulsion
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                ok && result.savingWithEmulsion < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {ok
                ? result.savingWithEmulsion >= 0
                  ? money(result.savingWithEmulsion)
                  : `-${money(-result.savingWithEmulsion)}`
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? verdict : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the emulsion versus distemper comparison"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Emulsion — cost per repaint", money(result.emulsion.perJob.total)],
                ["Distemper — cost per repaint", money(result.distemper.perJob.total)],
                ["Extra to pay upfront for emulsion", money(result.upfrontExtraForEmulsion)],
                [
                  "Paint jobs in the horizon",
                  `${NUM.format(result.emulsion.jobs)} emulsion vs ${NUM.format(result.distemper.jobs)} distemper`,
                ],
                ["Emulsion — present value of all jobs", money(result.emulsion.presentValue)],
                ["Distemper — present value of all jobs", money(result.distemper.presentValue)],
                ["Emulsion — equivalent annual cost", money(result.emulsion.eac)],
                ["Distemper — equivalent annual cost", money(result.distemper.eac)],
                ["Emulsion — present value per sq ft", money2(result.emulsion.pvPerSqft)],
                ["Distemper — present value per sq ft", money2(result.distemper.pvPerSqft)],
                [
                  "Emulsion draws level from",
                  result.breakEvenYear === null
                    ? "Not within 50 years"
                    : `Year ${NUM.format(result.breakEvenYear)}`,
                ],
                [
                  "Litres per repaint",
                  `${NUM1.format(result.emulsion.perJob.litres)} L vs ${NUM1.format(result.distemper.perJob.litres)} L`,
                ],
              ]
            : [
                ["Emulsion — cost per repaint", DASH],
                ["Distemper — cost per repaint", DASH],
                ["Emulsion — present value of all jobs", DASH],
                ["Distemper — present value of all jobs", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">When the money goes out</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Emulsion
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Distemper
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Discount factor
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">
                      {row.year === 0 ? "Now" : NUM1.format(row.year)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {row.emulsion ? money(row.emulsion.presentValue) : DASH}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {row.distemper ? money(row.distemper.presentValue) : DASH}
                    </td>
                    <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.discountPct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Amounts shown are the present value of each repaint — what you would have to set aside
            today to pay for it in that year. The one-time preparation cost sits outside the table
            because both systems carry it equally.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Repaint intervals depend on sunlight, damp, ventilation and how the
        rooms are used, and a distempered wall that is washed or scrubbed will fail sooner than one
        that is not. Emulsion also brings non-cost benefits — washability and colour retention — that
        no rupee figure captures.
      </p>
    </main>
  );
}
