"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DAYS,
  DEFAULT_COMPARTMENT_CAPACITY,
  FREQUENCY_PRESETS,
  SLOTS,
  buildOrganiser,
  slotsForFrequency,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const ALL_DAYS = DAYS.map((day) => day.id);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_OFF =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const makeRow = (key, name, tabletsPerDose, slots, days) => ({
  key,
  name,
  tabletsPerDose,
  slots,
  days,
});

const DEFAULT_ROWS = [
  makeRow(1, "Metformin 500 mg", "1", ["morning", "night"], ALL_DAYS),
  makeRow(2, "Amlodipine 5 mg", "1", ["morning"], ALL_DAYS),
  makeRow(3, "Vitamin D 60,000 IU", "1", ["morning"], ["sun"]),
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextKey, setNextKey] = useState(DEFAULT_ROWS.length + 1);
  const [capacity, setCapacity] = useState(String(DEFAULT_COMPARTMENT_CAPACITY));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildOrganiser({
        medicines: rows.map((row) => ({
          name: row.name,
          tabletsPerDose: toNumber(row.tabletsPerDose),
          slots: row.slots,
          days: row.days,
        })),
        compartmentCapacity: toNumber(capacity),
      }),
    [rows, capacity],
  );

  const ok = !result.error;

  const updateRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow(nextKey, "", "1", ["morning"], ALL_DAYS)]);
    setNextKey((current) => current + 1);
  };

  const removeRow = (key) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setNextKey(DEFAULT_ROWS.length + 1);
    setCapacity(String(DEFAULT_COMPARTMENT_CAPACITY));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = ["Weekly pill organiser", ""];
    result.grid.forEach((day) => {
      lines.push(day.dayLabel);
      day.cells.forEach((cell) => {
        const body = cell.items.length
          ? cell.items.map((item) => `${item.name} x${item.tablets}`).join(", ")
          : "empty";
        lines.push(`  ${cell.slotLabel}: ${body}`);
      });
      lines.push("");
    });
    lines.push(`Tablets for the week: ${result.weeklyTablets} across ${result.weeklyDoses} doses`);
    result.perMedicine.forEach((med) => {
      lines.push(`  ${med.name}: ${med.tabletsPerWeek} tablets a week`);
    });
    return lines.join("\n");
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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Weekly Pill Organiser Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List each medicine with the compartments and days it belongs in, and get the full 7 x 4
          grid to fill from — plus how many tablets of each you need for the week.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-5">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="rounded-lg border border-[var(--border)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`po-name-${row.key}`}>
                    Medicine {index + 1}
                  </label>
                  <input
                    id={`po-name-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder="Name and strength"
                    onChange={(event) => updateRow(row.key, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`po-tabs-${row.key}`}>
                    Tablets per dose
                  </label>
                  <input
                    id={`po-tabs-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0.5"
                    step="0.5"
                    value={row.tabletsPerDose}
                    onChange={(event) =>
                      updateRow(row.key, { tabletsPerDose: event.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`po-freq-${row.key}`}>
                    Quick frequency
                  </label>
                  <select
                    id={`po-freq-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value=""
                    onChange={(event) => {
                      const slots = slotsForFrequency(event.target.value);
                      if (slots.length) updateRow(row.key, { slots });
                    }}
                  >
                    <option value="">Choose to fill the compartments below</option>
                    {FREQUENCY_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-semibold">Compartments</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      aria-pressed={row.slots.includes(slot.id)}
                      className={row.slots.includes(slot.id) ? CHIP_ON : CHIP_OFF}
                      onClick={() => updateRow(row.key, { slots: toggle(row.slots, slot.id) })}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-4">
                <legend className="text-sm font-semibold">Days</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      aria-pressed={row.days.includes(day.id)}
                      aria-label={day.label}
                      className={row.days.includes(day.id) ? CHIP_ON : CHIP_OFF}
                      onClick={() => updateRow(row.key, { days: toggle(row.days, day.id) })}
                    >
                      {day.short}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={CHIP_OFF}
                    onClick={() =>
                      updateRow(row.key, {
                        days: row.days.length === ALL_DAYS.length ? [] : ALL_DAYS,
                      })
                    }
                  >
                    {row.days.length === ALL_DAYS.length ? "Clear" : "Every day"}
                  </button>
                </div>
              </fieldset>

              {rows.length > 1 ? (
                <button
                  type="button"
                  className={`mt-4 ${GHOST_BTN}`}
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove medicine ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button type="button" className={GHOST_BTN} onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another medicine
          </button>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-capacity">
              Tablets one compartment holds
            </label>
            <input
              id="po-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
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
              Tablets to load for the week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM.format(result.weeklyTablets) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.weeklyDoses} doses across ${result.filledCompartments} of 28 compartments`
                : "Fix the medicine list to build the grid."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the weekly organiser layout"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy layout"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the medicine list"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.overCapacity.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.overCapacity.length} compartment
            {result.overCapacity.length === 1 ? "" : "s"} hold more than{" "}
            {result.compartmentCapacity} tablets — the busiest is {result.busiestCompartment.dayLabel}{" "}
            {result.busiestCompartment.slotLabel.toLowerCase()} with{" "}
            {NUM.format(result.busiestCompartment.tablets)}. Consider a deeper box or splitting that
            time slot.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Medicines in the box", ok ? String(result.medicineCount) : DASH],
            ["Doses in the week", ok ? String(result.weeklyDoses) : DASH],
            ["Compartments used", ok ? `${result.filledCompartments} of 28` : DASH],
            [
              "Busiest compartment",
              ok
                ? `${result.busiestCompartment.dayLabel} ${result.busiestCompartment.slotLabel.toLowerCase()} (${NUM.format(result.busiestCompartment.tablets)})`
                : DASH,
            ],
            ...(ok
              ? result.perSlot.map((slot) => [
                  `${slot.slotLabel} tablets, whole week`,
                  NUM.format(slot.tablets),
                ])
              : []),
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">The grid</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Day
                  </th>
                  {SLOTS.map((slot) => (
                    <th key={slot.id} scope="col" className="py-2 pr-3 font-semibold">
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] align-top">
                {result.grid.map((day) => (
                  <tr key={day.dayId}>
                    <th scope="row" className="py-3 pr-3 text-left font-semibold whitespace-nowrap">
                      {day.dayShort}
                    </th>
                    {day.cells.map((cell) => (
                      <td key={cell.slotId} className="py-3 pr-3">
                        {cell.items.length ? (
                          <ul className="space-y-1">
                            {cell.items.map((item) => (
                              <li key={item.name}>
                                {item.name}{" "}
                                <span className="text-[var(--muted-foreground)]">
                                  x{NUM.format(item.tablets)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">{DASH}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Tablets to count out</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Medicine
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    When
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Tablets a week
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.perMedicine.map((med) => (
                  <tr key={med.name}>
                    <td className="py-2 pr-3 font-medium">{med.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {med.slotLabels.join(", ")} · {med.dayCount} day
                      {med.dayCount === 1 ? "" : "s"}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {NUM.format(med.tabletsPerWeek)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A layout aid, not medical advice. It counts what you enter and does not check doses,
        interactions or whether a medicine is suitable for a pill box — some tablets must stay in
        their blister or bottle to keep out moisture and light, and cytotoxic or controlled medicines
        may need separate handling. Have a pharmacist confirm the plan and check it against the
        current prescription before you fill the box.
      </p>
    </main>
  );
}
