"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";

import { PHANTOM_DEVICES, computePhantomLoad } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} kWh` : DASH);
const kg = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} kg` : DASH);
const watts = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} W` : DASH);

/** Devices ticked when the page first loads — the common Indian household set. */
const DEFAULT_ENABLED = new Set([
  "set-top-box",
  "router",
  "modem",
  "tv",
  "microwave",
  "washing-machine",
  "phone-charger",
  "laptop-charger",
]);

const buildInitialRows = () =>
  PHANTOM_DEVICES.map((device) => ({
    id: device.id,
    name: device.name,
    note: device.note,
    enabled: DEFAULT_ENABLED.has(device.id),
    qty: "1",
    watts: String(device.watts),
    hoursPerDay: String(device.hoursPerDay),
    switchOffHoursPerDay: String(device.switchable),
  }));

const DEFAULT_TARIFF = "8";
const DEFAULT_MONTHLY_UNITS = "300";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(buildInitialRows);
  const [tariff, setTariff] = useState(DEFAULT_TARIFF);
  const [monthlyUnits, setMonthlyUnits] = useState(DEFAULT_MONTHLY_UNITS);
  const [copied, setCopied] = useState(false);

  const updateRow = (id, patch) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const result = useMemo(
    () =>
      computePhantomLoad({
        devices: rows
          .filter((row) => row.enabled)
          .map((row) => ({
            id: row.id,
            name: row.name,
            watts: toNumber(row.watts),
            qty: toNumber(row.qty),
            hoursPerDay: toNumber(row.hoursPerDay),
            switchOffHoursPerDay: toNumber(row.switchOffHoursPerDay),
          })),
        tariffPerKwh: toNumber(tariff),
        monthlyUnits: toNumber(monthlyUnits),
      }),
    [rows, tariff, monthlyUnits],
  );

  const failed = Boolean(result.error);
  const empty = !failed && result.deviceCount === 0;

  const summary = useMemo(() => {
    if (failed || empty) return "";
    const lines = [
      "Phantom Load Checklist",
      `${result.deviceCount} always-on devices drawing ${watts(result.standbyWatts)} between them`,
      `Annual standby energy: ${kwh(result.totalKwh)}`,
      `Annual cost: ${money(result.totalCost)} (about ${money(result.monthlyCost)} a month)`,
      `Could be switched off: ${kwh(result.savableKwh)}, worth ${money(result.savableCost)} a year`,
      `CO2 from standby: ${kg(result.annualCo2Kg)} a year`,
      "",
      "Worst offenders:",
    ];
    result.ranked.slice(0, 5).forEach((row, index) => {
      lines.push(`${index + 1}. ${row.name} — ${money(row.annualCost)} a year (${watts(row.totalWatts)})`);
    });
    return lines.join("\n");
  }, [failed, empty, result]);

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
    setRows(buildInitialRows());
    setTariff(DEFAULT_TARIFF);
    setMonthlyUnits(DEFAULT_MONTHLY_UNITS);
    setCopied(false);
  };

  const showFigures = !failed && !empty;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Standby power
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Phantom Load Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every device that is plugged in but idle draws a little power around the clock. Tick what
          you own, correct any wattage you have actually measured, and see the yearly bill it adds
          up to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-tariff">
              Electricity tariff (per kWh)
            </label>
            <input
              id="pl-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
            <p className={HINT_CLASS}>Use your highest slab rate — standby sits on top of everything else.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-units">
              Household consumption (units a month)
            </label>
            <input
              id="pl-units"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={monthlyUnits}
              onChange={(event) => setMonthlyUnits(event.target.value)}
            />
            <p className={HINT_CLASS}>Optional — used to show standby as a share of your bill.</p>
          </div>
        </div>
      </section>

      {failed && (
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
              Standby cost a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showFigures ? money(result.totalCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a total."
                : empty
                  ? "Tick at least one device below."
                  : `${watts(result.standbyWatts)} drawn continuously across ${result.deviceCount} devices`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!showFigures}
              aria-label="Copy phantom load summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Energy wasted a year", showFigures ? kwh(result.totalKwh) : DASH],
            ["Cost a month", showFigures ? money(result.monthlyCost) : DASH],
            [
              "Share of your electricity bill",
              showFigures && result.shareOfBillPct !== null
                ? `${num1(result.shareOfBillPct)}%`
                : DASH,
            ],
            [
              "Realistically switchable",
              showFigures ? `${kwh(result.savableKwh)} (${num1(result.savablePct)}%)` : DASH,
            ],
            ["Money you could save a year", showFigures ? money(result.savableCost) : DASH],
            ["CO2 from standby a year", showFigures ? kg(result.annualCo2Kg) : DASH],
            ["Biggest single offender", showFigures ? result.worst.name : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The checklist</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Default wattages are typical measured standby figures. Replace any of them with your own
          plug-meter reading for a real answer.
        </p>

        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const detail = showFigures
              ? result.rows.find((item) => item.id === row.id)
              : null;
            return (
              <li
                key={row.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
                  htmlFor={`pl-on-${row.id}`}
                >
                  <input
                    id={`pl-on-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={row.enabled}
                    onChange={(event) => updateRow(row.id, { enabled: event.target.checked })}
                  />
                  <span className="flex-1">{row.name}</span>
                  {detail && (
                    <span className="shrink-0 text-sm font-semibold text-[var(--primary)]">
                      {money(detail.annualCost)}/yr
                    </span>
                  )}
                </label>

                {row.enabled && (
                  <>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={SMALL_LABEL} htmlFor={`pl-qty-${row.id}`}>
                          How many
                        </label>
                        <input
                          id={`pl-qty-${row.id}`}
                          className={`mt-1 ${INPUT_CLASS}`}
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="50"
                          step="1"
                          value={row.qty}
                          onChange={(event) => updateRow(row.id, { qty: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className={SMALL_LABEL} htmlFor={`pl-w-${row.id}`}>
                          Standby draw (watts each)
                        </label>
                        <input
                          id={`pl-w-${row.id}`}
                          className={`mt-1 ${INPUT_CLASS}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={row.watts}
                          onChange={(event) => updateRow(row.id, { watts: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className={SMALL_LABEL} htmlFor={`pl-h-${row.id}`}>
                          Hours a day on standby
                        </label>
                        <input
                          id={`pl-h-${row.id}`}
                          className={`mt-1 ${INPUT_CLASS}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="24"
                          step="0.5"
                          value={row.hoursPerDay}
                          onChange={(event) =>
                            updateRow(row.id, { hoursPerDay: event.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={SMALL_LABEL} htmlFor={`pl-off-${row.id}`}>
                          Hours you could cut power
                        </label>
                        <input
                          id={`pl-off-${row.id}`}
                          className={`mt-1 ${INPUT_CLASS}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="24"
                          step="0.5"
                          value={row.switchOffHoursPerDay}
                          onChange={(event) =>
                            updateRow(row.id, { switchOffHoursPerDay: event.target.value })
                          }
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                      {row.note}
                      {detail && detail.savableCost > 0
                        ? ` Switching it off saves ${money(detail.savableCost)} a year.`
                        : ""}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {showFigures && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ranked by what they cost you</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Device
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Draw
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Units/yr
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cost/yr
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.name}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {watts(row.totalWatts)}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {kwh(row.annualKwh)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap font-semibold">
                      {money(row.annualCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Do not cut power to anything that needs it: fridges, medical equipment, alarm and security
        systems, and devices mid-firmware-update. Some set-top boxes and printers also run a
        maintenance cycle on every power-up that eats part of the saving.
      </p>
    </main>
  );
}
