"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw, Trash2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  APPLIANCE_LIBRARY,
  BOARD_RATINGS,
  CONTINUOUS_LOAD_FACTOR,
  CORD_SIZES,
  MAX_VOLTAGE_DROP_PCT,
  STATUS,
  SUPPLY_PRESETS,
  checkExtensionLoad,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { key: 1, label: "LED TV 43 in", watts: "100", qty: "1", surgeFactor: 1 },
  { key: 2, label: "Laptop charger", watts: "65", qty: "2", surgeFactor: 1 },
  { key: 3, label: "Wi-Fi router", watts: "12", qty: "1", surgeFactor: 1 },
];

const DEFAULTS = {
  supplyId: "in-eu",
  boardAmps: "6",
  cordId: "0.75mm",
  lengthMeters: "3",
  powerFactor: "1",
  continuous: true,
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const STATUS_STYLE = {
  [STATUS.SAFE]: {
    text: "text-[var(--success)]",
    chip: "bg-[var(--success-soft)] text-[var(--success-text)]",
    word: "Within safe limits",
  },
  [STATUS.CAUTION]: {
    text: "text-[var(--warning)]",
    chip: "bg-[var(--warning-soft)] text-[var(--warning-text)]",
    word: "Borderline — reduce the load",
  },
  [STATUS.OVERLOAD]: {
    text: "text-[var(--danger)]",
    chip: "bg-[var(--danger-soft)] text-[var(--danger-text)]",
    word: "Overloaded — unplug something now",
  },
};

export default function ToolHome() {
  const [supplyId, setSupplyId] = useState(DEFAULTS.supplyId);
  const [boardAmps, setBoardAmps] = useState(DEFAULTS.boardAmps);
  const [cordId, setCordId] = useState(DEFAULTS.cordId);
  const [lengthMeters, setLengthMeters] = useState(DEFAULTS.lengthMeters);
  const [powerFactor, setPowerFactor] = useState(DEFAULTS.powerFactor);
  const [continuous, setContinuous] = useState(DEFAULTS.continuous);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextKey, setNextKey] = useState(DEFAULT_ROWS.length + 1);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const supply = SUPPLY_PRESETS.find((entry) => entry.id === supplyId) ?? SUPPLY_PRESETS[0];

  const result = useMemo(
    () =>
      checkExtensionLoad({
        volts: supply.volts,
        boardAmps: toNumber(boardAmps),
        cordId,
        lengthMeters: toNumber(lengthMeters),
        powerFactor: toNumber(powerFactor),
        continuous,
        appliances: rows.map((row) => ({
          watts: toNumber(row.watts),
          qty: toNumber(row.qty),
          surgeFactor: row.surgeFactor,
        })),
      }),
    [supply, boardAmps, cordId, lengthMeters, powerFactor, continuous, rows],
  );

  const ok = !result.error;
  const style = ok ? STATUS_STYLE[result.status] : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Extension Cord Load Checker",
      `Supply: ${supply.volts} V`,
      `Board rating: ${boardAmps} A · Cord: ${result.cordLabel} (${result.cordAmps} A) · Length: ${lengthMeters} m`,
      `Total connected load: ${NUM.format(result.totalWatts)} W`,
      `Current drawn: ${NUM2.format(result.current)} A`,
      `Safe limit: ${NUM2.format(result.limitAmps)} A (set by ${result.limitedBy})`,
      `Continuous ceiling (80%): ${NUM2.format(result.continuousLimitAmps)} A`,
      `Voltage drop: ${NUM2.format(result.dropVolts)} V (${NUM2.format(result.dropPct)}%)`,
      `Verdict: ${STATUS_STYLE[result.status].word}`,
      ...result.warnings.map((warning) => `- ${warning}`),
    ].join("\n");
  }, [ok, result, supply, boardAmps, lengthMeters]);

  const copyResult = async () => {
    if (!summary) return;
    await copyToClipboard("result", summary, { label: "Load check result" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field and remove all appliances you have added? This cannot be undone.",
      )
    ) {
      return;
    }
    setSupplyId(DEFAULTS.supplyId);
    setBoardAmps(DEFAULTS.boardAmps);
    setCordId(DEFAULTS.cordId);
    setLengthMeters(DEFAULTS.lengthMeters);
    setPowerFactor(DEFAULTS.powerFactor);
    setContinuous(DEFAULTS.continuous);
    setRows(DEFAULT_ROWS);
    setNextKey(DEFAULT_ROWS.length + 1);
    resetCopyState();
  };

  const addAppliance = (item) => {
    setRows((current) => [
      ...current,
      {
        key: nextKey,
        label: item.label,
        watts: String(item.watts),
        qty: "1",
        surgeFactor: item.surgeFactor,
      },
    ]);
    setNextKey((value) => value + 1);
  };

  const updateRow = (key, field, value) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const removeRow = (key) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Home electrical
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Extension Cord Load Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what is plugged into one extension board and see the current it draws against the
          board rating, the cord&apos;s ampacity, the {CONTINUOUS_LOAD_FACTOR * 100}% continuous-load
          rule and the {MAX_VOLTAGE_DROP_PCT}% voltage-drop guideline.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ecl-supply">
              Mains supply
            </label>
            <select
              id="ecl-supply"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supplyId}
              onChange={(event) => setSupplyId(event.target.value)}
            >
              {SUPPLY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecl-board">
              Board rating printed on the strip (A)
            </label>
            <select
              id="ecl-board"
              className={`mt-2 ${INPUT_CLASS}`}
              value={boardAmps}
              onChange={(event) => setBoardAmps(event.target.value)}
            >
              {BOARD_RATINGS.map((amps) => (
                <option key={amps} value={String(amps)}>
                  {amps} A
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecl-cord">
              Cord conductor size
            </label>
            <select
              id="ecl-cord"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cordId}
              onChange={(event) => setCordId(event.target.value)}
            >
              {CORD_SIZES.map((cord) => (
                <option key={cord.id} value={cord.id}>
                  {cord.label} — {cord.amps} A
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecl-length">
              Cord length (m)
            </label>
            <input
              id="ecl-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={lengthMeters}
              onChange={(event) => setLengthMeters(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecl-pf">
              Power factor (1 for heaters and lights, ~0.8 for motors)
            </label>
            <input
              id="ecl-pf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={powerFactor}
              onChange={(event) => setPowerFactor(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="ecl-continuous"
            >
              <input
                id="ecl-continuous"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={continuous}
                onChange={(event) => setContinuous(event.target.checked)}
              />
              Runs 3 hours or more (continuous)
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is plugged in</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {APPLIANCE_LIBRARY.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addAppliance(item)}
              className={CHIP_BTN}
            >
              + {item.label} ({item.watts} W)
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Nothing on the board yet — tap an appliance above.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((row) => (
              <li
                key={row.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{row.label}</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`ecl-w-${row.key}`}>
                      Watts each
                    </label>
                    <input
                      id={`ecl-w-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="5"
                      value={row.watts}
                      onChange={(event) => updateRow(row.key, "watts", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`ecl-q-${row.key}`}>
                      Quantity
                    </label>
                    <input
                      id={`ecl-q-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={row.qty}
                      onChange={(event) => updateRow(row.key, "qty", event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      aria-label={`Remove ${row.label}`}
                      className={GHOST_BTN}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
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
              Current drawn
            </p>
            <p className={`mt-1 text-4xl font-semibold ${ok ? style.text : "text-[var(--muted-foreground)]"}`}>
              {ok ? `${NUM2.format(result.current)} A` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(result.totalWatts)} W total, limit ${NUM2.format(result.limitAmps)} A from the ${result.limitedBy}`
                : "Fix the inputs above to see a result."}
            </p>
            {ok ? (
              <span
                className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${style.chip}`}
                role="status"
              >
                {style.word}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy extension board load result"
              className={PRIMARY_BTN}
              disabled={!ok}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        {ok ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Board is at ${NUM.format(result.utilisationPct)} percent of its rating`}
            >
              <span
                className={`block h-full ${
                  result.status === STATUS.OVERLOAD
                    ? "bg-[var(--danger)]"
                    : result.status === STATUS.CAUTION
                      ? "bg-[var(--warning)]"
                      : "bg-[var(--success)]"
                }`}
                style={{ width: `${Math.max(2, Math.min(100, result.utilisationPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {NUM.format(result.utilisationPct)}% of the {NUM2.format(result.limitAmps)} A rating
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total connected load", ok ? `${NUM.format(result.totalWatts)} W` : DASH],
            ["Safe limit", ok ? `${NUM2.format(result.limitAmps)} A (${result.limitedBy})` : DASH],
            [
              "Continuous ceiling (80% rule)",
              ok ? `${NUM2.format(result.continuousLimitAmps)} A` : DASH,
            ],
            ["Headroom left", ok ? `${NUM2.format(result.headroomAmps)} A · ${NUM.format(result.headroomWatts)} W` : DASH],
            ["Maximum watts you may plug in", ok ? `${NUM.format(result.maxWatts)} W` : DASH],
            ["Peak start-up current", ok ? `${NUM2.format(result.surgeCurrent)} A` : DASH],
            [
              "Voltage drop along the cord",
              ok ? `${NUM2.format(result.dropVolts)} V (${NUM2.format(result.dropPct)}%)` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Never daisy-chain one extension board into another, never run a heater,
        geyser, iron or air conditioner off a light-duty strip, and have a licensed electrician
        check any socket that feels warm or smells hot.
      </p>
    </main>
  );
}
