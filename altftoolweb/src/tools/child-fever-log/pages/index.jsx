"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Thermometer, Trash2 } from "lucide-react";
import { MEDICINE_RULES, SITE_LABEL, summariseFeverLog } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const CLOCK = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const DASH = "—";
const SEED_DATE = "2026-07-28";

const DEFAULT_ROWS = [
  { id: 1, at: `${SEED_DATE}T08:00`, value: "38.6", unit: "C", site: "axillary", fluidsMl: "200", medicine: "paracetamol" },
  { id: 2, at: `${SEED_DATE}T12:00`, value: "38.0", unit: "C", site: "axillary", fluidsMl: "250", medicine: "none" },
  { id: 3, at: `${SEED_DATE}T16:00`, value: "37.8", unit: "C", site: "axillary", fluidsMl: "250", medicine: "none" },
];
const DEFAULT_AGE = "36";
const DEFAULT_WEIGHT = "12";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  low: "text-[var(--danger)]",
  normal: "text-[var(--success)]",
  "low-grade": "text-[var(--foreground)]",
  fever: "text-[var(--primary)]",
  high: "text-[var(--danger)]",
  hyperpyrexia: "text-[var(--danger)]",
};

const clock = (ms) => (Number.isFinite(ms) ? CLOCK.format(new Date(ms)) : DASH);

export default function ToolHome() {
  const [ageMonths, setAgeMonths] = useState(DEFAULT_AGE);
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT);
  const [feverStartedAt, setFeverStartedAt] = useState(`${SEED_DATE}T20:00`);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  // Seeded dates are fixed so server and client first render match; move them to
  // today once mounted so the log opens on the current day.
  useEffect(() => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (iso === SEED_DATE) return;
    setRows((prev) => prev.map((row) => ({ ...row, at: row.at.replace(SEED_DATE, iso) })));
    setFeverStartedAt((prev) => prev.replace(SEED_DATE, iso));
  }, []);

  const result = useMemo(
    () =>
      summariseFeverLog({
        entries: rows,
        ageMonths: ageMonths === "" ? NaN : Number(ageMonths),
        weightKg: weightKg === "" ? NaN : Number(weightKg),
        feverStartedAt: feverStartedAt || null,
      }),
    [rows, ageMonths, weightKg, feverStartedAt],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          at: last ? last.at : `${SEED_DATE}T08:00`,
          value: last ? last.value : "38.0",
          unit: last ? last.unit : "C",
          site: last ? last.site : "axillary",
          fluidsMl: "0",
          medicine: "none",
        },
      ];
    });
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Child Fever Log",
      `Age: ${INT.format(result.ageMonths)} months · Weight: ${NUM.format(result.weightKg)} kg`,
      `Readings: ${result.readingCount}`,
      `Latest: ${clock(result.latest.at)} — ${NUM.format(result.latest.coreC)} C core (${result.latest.label})`,
      `Peak: ${clock(result.peak.at)} — ${NUM.format(result.peak.coreC)} C core (${result.peak.label})`,
      `Fever duration so far: ${NUM.format(result.durationHours)} hours`,
      `Fluids taken: ${INT.format(result.totalFluidsMl)} mL of an estimated ${INT.format(result.targetFluidMl)} mL/day (${result.fluidPercent}%)`,
      "",
      "Readings:",
      ...result.rows.map(
        (row) =>
          `- ${clock(row.at)} | ${NUM.format(row.celsius)} C ${SITE_LABEL[row.site]} -> ${NUM.format(row.coreC)} C core (${row.label}) | fluids ${INT.format(row.fluidsMl)} mL${row.medicine ? ` | ${MEDICINE_RULES[row.medicine].label}` : ""}`,
      ),
      "",
      "Medicine timing:",
      ...result.medicines.map(
        (med) =>
          `- ${med.label}: ${med.doses24h} dose(s) in 24h (max ${med.maxDoses24h}), min gap ${med.minIntervalHours}h, next due ${med.nextDoseAt ? clock(med.nextDoseAt) : "n/a"}`,
      ),
    ];
    if (result.flags.length > 0) {
      lines.push("", "Prompts:", ...result.flags.map((flag) => `- ${flag}`));
    }
    lines.push("", "Informational log only — not a medical assessment.");
    return lines.join("\n");
  }, [hasError, result]);

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
    setAgeMonths(DEFAULT_AGE);
    setWeightKg(DEFAULT_WEIGHT);
    setFeverStartedAt(`${SEED_DATE}T20:00`);
    setRows(DEFAULT_ROWS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Child Fever Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Record each temperature with where it was taken, the fluids your child drank and any
          medicine given. The log converts every reading to a core-equivalent temperature and builds
          a summary you can read out to a doctor.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cfl-age">
              Age (months)
            </label>
            <input
              id="cfl-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="216"
              step="1"
              value={ageMonths}
              onChange={(event) => setAgeMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfl-weight">
              Weight (kg)
            </label>
            <input
              id="cfl-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150"
              step="0.1"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cfl-start">
              Fever first noticed (optional)
            </label>
            <input
              id="cfl-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={feverStartedAt}
              onChange={(event) => setFeverStartedAt(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Readings</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add another reading">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add reading
          </button>
        </div>

        <ol className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Reading {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove reading ${index + 1}`}
                  disabled={rows.length === 1}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`cfl-at-${row.id}`}>
                    Date and time
                  </label>
                  <input
                    id={`cfl-at-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="datetime-local"
                    value={row.at}
                    onChange={(event) => updateRow(row.id, { at: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cfl-temp-${row.id}`}>
                    Temperature
                  </label>
                  <input
                    id={`cfl-temp-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={row.value}
                    onChange={(event) => updateRow(row.id, { value: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cfl-unit-${row.id}`}>
                    Unit
                  </label>
                  <select
                    id={`cfl-unit-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.unit}
                    onChange={(event) => updateRow(row.id, { unit: event.target.value })}
                  >
                    <option value="C">Celsius</option>
                    <option value="F">Fahrenheit</option>
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cfl-site-${row.id}`}>
                    Measured at
                  </label>
                  <select
                    id={`cfl-site-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.site}
                    onChange={(event) => updateRow(row.id, { site: event.target.value })}
                  >
                    {Object.keys(SITE_LABEL).map((key) => (
                      <option key={key} value={key}>
                        {SITE_LABEL[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`cfl-fluid-${row.id}`}>
                    Fluids since last reading (mL)
                  </label>
                  <input
                    id={`cfl-fluid-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="10"
                    value={row.fluidsMl}
                    onChange={(event) => updateRow(row.id, { fluidsMl: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`cfl-med-${row.id}`}>
                    Medicine given now
                  </label>
                  <select
                    id={`cfl-med-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.medicine}
                    onChange={(event) => updateRow(row.id, { medicine: event.target.value })}
                  >
                    <option value="none">None</option>
                    {Object.keys(MEDICINE_RULES).map((key) => (
                      <option key={key} value={key}>
                        {MEDICINE_RULES[key].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {hasError && (
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
              Latest core-equivalent temperature
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : BAND_TONE[result.latest.band]}`}
            >
              {hasError ? DASH : `${NUM.format(result.latest.coreC)} °C`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.latest.label} · ${NUM.format(result.latest.coreF)} °F · ${clock(result.latest.at)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fever log summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Readings logged", hasError ? DASH : INT.format(result.readingCount)],
            [
              "Peak temperature",
              hasError ? DASH : `${NUM.format(result.peak.coreC)} °C (${result.peak.label}) at ${clock(result.peak.at)}`,
            ],
            ["Fever duration so far", hasError ? DASH : `${NUM.format(result.durationHours)} hours`],
            ["Fluids recorded", hasError ? DASH : `${INT.format(result.totalFluidsMl)} mL`],
            [
              "Estimated daily fluid need",
              hasError ? DASH : `${INT.format(result.targetFluidMl)} mL (maintenance ${INT.format(result.maintenanceMl)} mL + fever uplift)`,
            ],
            ["Share of fluid target met", hasError ? DASH : `${INT.format(result.fluidPercent)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.flags.length > 0 && (
        <section className="mt-6 space-y-2" aria-label="Safety prompts">
          {result.flags.map((flag) => (
            <p
              key={flag}
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {flag}
            </p>
          ))}
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Medicine timing</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Medicine</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Doses in 24h</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Min gap</th>
                    <th scope="col" className="py-2 text-right font-semibold">Next due</th>
                  </tr>
                </thead>
                <tbody>
                  {result.medicines.map((med) => (
                    <tr key={med.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{med.label}</td>
                      <td className={`py-2 pr-3 text-right ${med.atDailyLimit ? "text-[var(--danger)] font-semibold" : ""}`}>
                        {INT.format(med.doses24h)} / {INT.format(med.maxDoses24h)}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{med.minIntervalHours} h</td>
                      <td className="py-2 text-right">{med.nextDoseAt ? clock(med.nextDoseAt) : DASH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Log</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Core</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Fluids</th>
                    <th scope="col" className="py-2 font-semibold">Medicine</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={`${row.at}-${row.coreC}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{clock(row.at)}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{NUM.format(row.coreC)} °C</td>
                      <td className={`py-2 pr-3 ${BAND_TONE[row.band]}`}>{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{INT.format(row.fluidsMl)} mL</td>
                      <td className="py-2">{row.medicine ? MEDICINE_RULES[row.medicine].label : DASH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational record keeping only. It does not give doses, diagnose anything or replace a
        clinician. Get urgent medical help for any fever in a baby under three months, a child who is
        drowsy, floppy, breathing hard, has a rash that does not fade under pressure, or who you feel
        is seriously unwell — whatever the thermometer says.
      </p>
    </main>
  );
}
